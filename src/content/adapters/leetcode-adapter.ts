import type { AcceptedSubmission, Difficulty, ExtensionMessage } from "../../types";
import type { CodingPlatformAdapter } from "./coding-platform-adapter";

interface LeetCodeQuestionResponse {
  data?: {
    question?: {
      title?: string;
      titleSlug?: string;
      difficulty?: string;
    };
  };
}

interface SubmissionDetailsResponse {
  data?: {
    submissionDetails?: {
      code?: string;
      runtime?: string;
      memory?: string;
      lang?: { name?: string; verboseName?: string } | string;
      statusDisplay?: string;
      timestamp?: string;
      question?: {
        title?: string;
        titleSlug?: string;
        difficulty?: string;
      };
    };
  };
}

interface SubmissionListResponse {
  data?: {
    questionSubmissionList?: {
      submissions?: Array<{
        id?: string;
        statusDisplay?: string;
        lang?: string;
        runtime?: string;
        memory?: string;
        timestamp?: string;
      }>;
    };
  };
}

export class LeetCodeAdapter implements CodingPlatformAdapter {
  private lastEmissionKey = "";
  private lastFailureKey = "";
  private debounceTimer: number | undefined;
  private debounceFirstScheduledAt: number | null = null;
  private pollingTimer: number | undefined;
  private pollingStopTimer: number | undefined;
  private historyPatched = false;
  private lastHref = "";
  private static readonly MAX_DEBOUNCE_WAIT_MS = 3000;

  isSupportedPage(): boolean {
    return /^\/(problems|submissions)\//.test(location.pathname);
  }

  observeSubmission(callback: (submission: AcceptedSubmission) => void): () => void {
    if (!this.isSupportedPage() || !document.body) {
      return () => undefined;
    }

    this.patchHistory();
    this.startPolling(callback);

    const observer = new MutationObserver(() => {
      this.scheduleAcceptedCheck(callback);
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true
    });

    window.addEventListener("popstate", this.handleNavigation);
    window.addEventListener("hashchange", this.handleNavigation);
    window.addEventListener("codetrail:navigation", this.handleNavigation);
    this.scheduleAcceptedCheck(callback);

    return () => {
      observer.disconnect();
      window.removeEventListener("popstate", this.handleNavigation);
      window.removeEventListener("hashchange", this.handleNavigation);
      window.removeEventListener("codetrail:navigation", this.handleNavigation);
      if (this.debounceTimer) {
        window.clearTimeout(this.debounceTimer);
      }
      this.stopPolling();
    };
  }

  async extractSubmission(): Promise<AcceptedSubmission | null> {
    const currentQuestion = this.getCurrentQuestionMetadata();
    const submissionId = this.getSubmissionId();

    if (!submissionId) {
      // No submission id in the URL means there's no reliable evidence a
      // fresh submission was just judged on this page. Querying "most recent
      // accepted submission for this problem" unconditionally here would
      // re-detect an old, already-synced submission on every unrelated DOM
      // change (typing, clicking Run, hovering, etc.) and re-trigger a sync
      // for it, so only trust what's actually visible on screen right now.
      const domSubmission = this.extractFromDom(currentQuestion);
      return domSubmission?.code ? domSubmission : null;
    }

    const fromSubmissionPage = await this.fetchSubmissionDetails(submissionId, currentQuestion);
    if (fromSubmissionPage) {
      return fromSubmissionPage;
    }

    const slug = currentQuestion.slug;
    const question = slug ? await this.fetchQuestion(slug) : currentQuestion;

    // We know exactly which submission this page is showing; only accept a
    // list-scan match if it resolves to that same id. Accepting whatever is
    // merely "most recently accepted for this problem" risks resurrecting an
    // older, already-committed submission and re-queuing it for sync.
    const latestAccepted = await this.fetchLatestAcceptedSubmission(slug, question, submissionId);
    if (latestAccepted) {
      return latestAccepted;
    }

    const domSubmission = this.extractFromDom(question);
    if (domSubmission?.code) {
      return domSubmission;
    }

    this.revealCodeTab();
    await delay(300);
    const revealedSubmission = this.extractFromDom(question);
    if (revealedSubmission?.code) {
      return revealedSubmission;
    }

    return null;
  }

  private scheduleAcceptedCheck(callback: (submission: AcceptedSubmission) => void): void {
    if (!this.isSupportedPage()) {
      return;
    }

    if (this.debounceTimer) {
      window.clearTimeout(this.debounceTimer);
    }

    const now = Date.now();
    if (this.debounceFirstScheduledAt === null) {
      this.debounceFirstScheduledAt = now;
    }
    const elapsedSinceFirstSchedule = now - this.debounceFirstScheduledAt;
    const wait = elapsedSinceFirstSchedule >= LeetCodeAdapter.MAX_DEBOUNCE_WAIT_MS ? 0 : 500;

    this.debounceTimer = window.setTimeout(() => {
      this.debounceFirstScheduledAt = null;
      void this.extractSubmission().then((submission) => {
        if (!submission) {
          if (this.isSubmissionPage()) {
            this.reportExtractionFailure("CodeTrail could not extract the submission from this LeetCode page.");
          }
          return;
        }
        const key = `${submission.problemSlug}:${submission.language}:${submission.submittedAt}:${submission.code.length}`;
        if (key === this.lastEmissionKey) {
          return;
        }
        this.lastEmissionKey = key;
        this.stopPolling();
        callback(submission);
      });
    }, wait);
  }

  private startPolling(callback: (submission: AcceptedSubmission) => void): void {
    if (this.pollingTimer || !this.isSupportedPage()) {
      return;
    }

    this.lastHref = location.href;
    this.pollingTimer = window.setInterval(() => {
      if (location.href !== this.lastHref) {
        this.lastHref = location.href;
        this.handleNavigation();
      }
      this.scheduleAcceptedCheck(callback);
    }, 1500);

    this.pollingStopTimer = window.setTimeout(() => {
      this.stopPolling();
      if (this.isSubmissionPage() && !this.lastEmissionKey) {
        this.reportExtractionFailure(
          "CodeTrail stopped waiting for this submission to sync. Refresh the page or resubmit to retry."
        );
      }
    }, 5 * 60 * 1000);
  }

  private stopPolling(): void {
    if (this.pollingTimer) {
      window.clearInterval(this.pollingTimer);
      this.pollingTimer = undefined;
    }

    if (this.pollingStopTimer) {
      window.clearTimeout(this.pollingStopTimer);
      this.pollingStopTimer = undefined;
    }
  }

  private async fetchLatestAcceptedSubmission(
    slug: string,
    question: QuestionMetadata,
    expectedSubmissionId?: string
  ): Promise<AcceptedSubmission | null> {
    const response = await leetcodeGraphql<SubmissionListResponse>({
      query: `query recentSubmissions($titleSlug: String!) {
        questionSubmissionList(questionSlug: $titleSlug, offset: 0, limit: 20) {
          submissions {
            id
            statusDisplay
            lang
            runtime
            memory
            timestamp
          }
        }
      }`,
      variables: { titleSlug: slug }
    });

    const accepted = response?.data?.questionSubmissionList?.submissions?.find(
      (submission) => submission.statusDisplay?.toLowerCase() === "accepted" && submission.id
    );

    if (!accepted?.id) {
      return null;
    }

    if (expectedSubmissionId && accepted.id !== expectedSubmissionId) {
      // The most recent accepted submission on record isn't the one this page
      // is showing (e.g. the fresh submission hasn't propagated into the list
      // yet) — don't substitute a different, older submission.
      return null;
    }

    const detailed = await this.fetchSubmissionDetails(accepted.id, question);
    if (detailed) {
      return detailed;
    }

    return {
      platform: "leetcode",
      problemTitle: question.title,
      problemSlug: question.slug,
      problemUrl: question.url,
      difficulty: question.difficulty,
      language: accepted.lang ?? "Unknown",
      code: this.extractEditorCode() ?? "",
      runtime: accepted.runtime,
      memory: accepted.memory,
      submittedAt: accepted.timestamp ? toIsoDate(Number(accepted.timestamp) * 1000) : toIsoDate()
    };
  }

  private async fetchSubmissionDetails(id: string, question: QuestionMetadata): Promise<AcceptedSubmission | null> {
    const response = await leetcodeGraphql<SubmissionDetailsResponse>({
      query: `query submissionDetails($submissionId: Int!) {
        submissionDetails(submissionId: $submissionId) {
          code
          runtime
          memory
          statusDisplay
          timestamp
          lang {
            name
            verboseName
          }
          question {
            title
            titleSlug
            difficulty
          }
        }
      }`,
      variables: { submissionId: Number(id) }
    });

    const details = response?.data?.submissionDetails;
    if (!details || details.statusDisplay?.toLowerCase() !== "accepted" || !details.code) {
      return null;
    }

    const lang = typeof details.lang === "string" ? details.lang : details.lang?.verboseName || details.lang?.name;
    const detailQuestion = details.question;

    return {
      platform: "leetcode",
      problemTitle: detailQuestion?.title ?? question.title,
      problemSlug: detailQuestion?.titleSlug ?? question.slug,
      problemUrl: question.url,
      difficulty: normalizeDifficulty(detailQuestion?.difficulty ?? question.difficulty),
      language: lang ?? "Unknown",
      code: details.code,
      runtime: details.runtime,
      memory: details.memory,
      submittedAt: details.timestamp ? toIsoDate(Number(details.timestamp) * 1000) : toIsoDate()
    };
  }

  private async fetchQuestion(slug: string): Promise<QuestionMetadata> {
    const response = await leetcodeGraphql<LeetCodeQuestionResponse>({
      query: `query questionMetadata($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          title
          titleSlug
          difficulty
        }
      }`,
      variables: { titleSlug: slug }
    });

    const question = response?.data?.question;
    return {
      title: question?.title ?? extractTitleFromDom() ?? titleFromSlug(slug),
      slug: question?.titleSlug ?? slug,
      url: `https://leetcode.com/problems/${question?.titleSlug ?? slug}/`,
      difficulty: normalizeDifficulty(question?.difficulty ?? extractDifficultyFromDom())
    };
  }

  private extractFromDom(question: QuestionMetadata): AcceptedSubmission | null {
    const code = this.extractEditorCode();
    const language = extractLanguageFromDom();
    if (!code || !language) {
      return null;
    }

    return {
      platform: "leetcode",
      problemTitle: question.title,
      problemSlug: question.slug,
      problemUrl: question.url,
      difficulty: question.difficulty,
      language,
      code,
      runtime: extractMetric("runtime"),
      memory: extractMetric("memory"),
      submittedAt: toIsoDate()
    };
  }

  private extractEditorCode(): string | null {
    // Prefer a syntax-highlighted code block (LeetCode tags these with a
    // "language-xxx" class) over a bare <pre>, since the problem description's
    // example blocks are also <pre> tags and can otherwise be matched first.
    const languageTagged = Array.from(document.querySelectorAll<HTMLElement>('code[class*="language-"]')).find(
      (element) => isVisible(element) && (element.textContent?.trim().length ?? 0) > 0
    );
    if (languageTagged) {
      return extractSyntaxHighlightedCode(languageTagged).trimEnd();
    }

    const preOrCode = findVisibleWithText(document.querySelectorAll<HTMLElement>("pre code, pre"));
    if (preOrCode) {
      return preOrCode.trimEnd();
    }

    const textArea = document.querySelector<HTMLTextAreaElement>("textarea.inputarea, textarea")?.value;
    if (textArea?.trim()) {
      return textArea.trimEnd();
    }

    const lines = Array.from(document.querySelectorAll<HTMLElement>(".view-lines .view-line"))
      .map((line) => line.textContent ?? "")
      .filter((line) => line.length > 0);

    return lines.length > 0 ? lines.join("\n").trimEnd() : null;
  }

  private getProblemSlug(): string | null {
    const problemMatch = location.pathname.match(/^\/problems\/([^/]+)/);
    if (problemMatch?.[1]) {
      return slugify(problemMatch[1]);
    }

    const submissionMatch = location.pathname.match(/^\/problems\/([^/]+)\/submissions\/\d+/);
    return submissionMatch?.[1] ? slugify(submissionMatch[1]) : null;
  }

  private getSubmissionId(): string | null {
    return location.pathname.match(/\/submissions\/(?:detail\/)?(\d+)/)?.[1] ?? null;
  }

  private isSubmissionPage(): boolean {
    // LeetCode now renders submission results at /problems/{slug}/submissions/{id}/
    // as well as the legacy top-level /submissions/{id}/ route, so detect either.
    return this.getSubmissionId() !== null || /^\/submissions\//.test(location.pathname);
  }

  private getCurrentQuestionMetadata(): QuestionMetadata {
    const slug = this.getProblemSlug();
    return {
      title: extractTitleFromDom() ?? (slug ? titleFromSlug(slug) : "LeetCode Problem"),
      slug: slug ?? "",
      url: slug ? `https://leetcode.com/problems/${slug}/` : location.href,
      difficulty: normalizeDifficulty(extractDifficultyFromDom())
    };
  }

  private patchHistory(): void {
    if (this.historyPatched || typeof window === "undefined" || !window.history) {
      return;
    }

    this.historyPatched = true;
    const dispatch = () => window.dispatchEvent(new Event("codetrail:navigation"));
    const historyRef = window.history;
    const originalPushState = historyRef.pushState.bind(historyRef);
    const originalReplaceState = historyRef.replaceState.bind(historyRef);

    historyRef.pushState = ((...args: Parameters<History["pushState"]>) => {
      const result = originalPushState(...args);
      dispatch();
      return result;
    }) as History["pushState"];

    historyRef.replaceState = ((...args: Parameters<History["replaceState"]>) => {
      const result = originalReplaceState(...args);
      dispatch();
      return result;
    }) as History["replaceState"];
  }

  private readonly handleNavigation = (): void => {
    this.lastEmissionKey = "";
    this.lastFailureKey = "";
  };

  private revealCodeTab(): void {
    const candidates = Array.from(document.querySelectorAll<HTMLElement>("button, [role='tab'], a, div"));
    const codeTab = candidates.find((element) => {
      const label = element.textContent?.trim().toLowerCase();
      return label === "code" || label?.startsWith("code");
    });
    if (codeTab && typeof codeTab.click === "function") {
      codeTab.click();
    }
  }

  private reportExtractionFailure(reason: string): void {
    const key = `${location.pathname}:${reason}`;
    if (key === this.lastFailureKey) {
      return;
    }
    this.lastFailureKey = key;
    void sendRuntimeMessage({
      type: "CONTENT_EXTRACTION_FAILED",
      route: location.pathname,
      reason
    });
  }
}

interface QuestionMetadata {
  title: string;
  slug: string;
  url: string;
  difficulty: Difficulty;
}

async function leetcodeGraphql<T>(body: { query: string; variables: Record<string, unknown> }): Promise<T | null> {
  try {
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function sendRuntimeMessage(message: ExtensionMessage): Promise<void> {
  if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
    return;
  }

  try {
    await chrome.runtime.sendMessage(message);
  } catch (error) {
    if (!isExtensionContextInvalidated(error)) {
      console.warn("CodeTrail content message failed", error);
    }
  }
}

function isExtensionContextInvalidated(error: unknown): boolean {
  return error instanceof Error && /Extension context invalidated/i.test(error.message);
}

// LeetCode ships React apps whose CSS class names and test-id attributes
// (data-cy, data-e2e-locator) get renamed across deploys, so these DOM
// helpers lean on things that are stable regardless of markup churn:
// document.title, meta tags, and known LeetCode language names/slugs.
const KNOWN_LEETCODE_LANGUAGES: Record<string, string> = {
  cpp: "C++",
  java: "Java",
  python: "Python",
  python3: "Python3",
  c: "C",
  csharp: "C#",
  javascript: "JavaScript",
  typescript: "TypeScript",
  php: "PHP",
  swift: "Swift",
  kotlin: "Kotlin",
  dart: "Dart",
  golang: "Go",
  ruby: "Ruby",
  scala: "Scala",
  rust: "Rust",
  racket: "Racket",
  erlang: "Erlang",
  elixir: "Elixir",
  bash: "Bash",
  mysql: "MySQL",
  mssql: "MS SQL Server",
  oraclesql: "Oracle"
};

function isVisible(element: HTMLElement): boolean {
  return !!(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
}

function findVisibleWithText(elements: NodeListOf<HTMLElement>): string | null {
  for (const element of Array.from(elements)) {
    if (!isVisible(element)) {
      continue;
    }
    const text = element.textContent?.trimEnd();
    if (text && text.trim().length > 0) {
      return text;
    }
  }
  return null;
}

// LeetCode renders code via react-syntax-highlighter: each line is a <span>
// whose first child is a `.linenumber` element and which already ends in its
// own newline text node. Reading .textContent directly smashes the line-number
// digits into the code (e.g. "1import java...."), so each line's number node
// must be stripped before joining; the lines are concatenated directly (no
// extra separator) since each one already carries its trailing "\n".
function extractSyntaxHighlightedCode(codeElement: HTMLElement): string {
  const lineSpans = Array.from(codeElement.children).filter(
    (child): child is HTMLElement => child.tagName === "SPAN"
  );
  if (lineSpans.length === 0) {
    return codeElement.textContent ?? "";
  }

  return lineSpans
    .map((lineSpan) => {
      const clone = lineSpan.cloneNode(true) as HTMLElement;
      clone.querySelectorAll(".linenumber, .react-syntax-highlighter-line-number").forEach((node) => node.remove());
      return clone.textContent ?? "";
    })
    .join("");
}

function extractTitleFromDom(): string | null {
  const fromDocumentTitle = document.title?.replace(/\s*-\s*LeetCode\s*$/i, "").trim();
  return (
    (fromDocumentTitle && fromDocumentTitle.length > 0 ? fromDocumentTitle : null) ||
    document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content.replace(/ - LeetCode$/, "").trim() ||
    document.querySelector<HTMLElement>('[data-cy="question-title"]')?.innerText.trim() ||
    document.querySelector("h1")?.textContent?.trim() ||
    null
  );
}

function extractDifficultyFromDom(): string | undefined {
  const candidates = Array.from(document.querySelectorAll<HTMLElement>("span, div"))
    .map((element) => element.innerText?.trim())
    .filter(Boolean);
  return candidates.find((text) => text === "Easy" || text === "Medium" || text === "Hard");
}

function extractLanguageFromDom(): string | null {
  const languageTagged = Array.from(document.querySelectorAll<HTMLElement>('code[class*="language-"]')).find(
    isVisible
  );
  const languageSlug = languageTagged?.className.match(/language-([a-z0-9]+)/i)?.[1]?.toLowerCase();
  if (languageSlug && KNOWN_LEETCODE_LANGUAGES[languageSlug]) {
    return KNOWN_LEETCODE_LANGUAGES[languageSlug];
  }

  const knownNames = new Set(Object.values(KNOWN_LEETCODE_LANGUAGES));
  const buttonMatch = Array.from(document.querySelectorAll<HTMLElement>("button"))
    .filter(isVisible)
    .map((button) => button.textContent?.trim())
    .find((text): text is string => !!text && knownNames.has(text));
  if (buttonMatch) {
    return buttonMatch;
  }

  // Legacy selectors kept as a last resort in case LeetCode restores them.
  const selectors = ['[data-cy="lang-select"]', '[data-e2e-locator="console-submit-lang"]'];
  for (const selector of selectors) {
    const text = document.querySelector<HTMLElement>(selector)?.innerText?.trim();
    if (text && !/accepted|runtime|memory/i.test(text)) {
      return text.split("\n")[0];
    }
  }

  return null;
}

function extractMetric(metric: "runtime" | "memory"): string | undefined {
  const pattern = metric === "runtime" ? /Runtime\s*[:\n ]+([0-9.]+\s*ms)/i : /Memory\s*[:\n ]+([0-9.]+\s*MB)/i;
  const match = document.body?.innerText.match(pattern);
  return match?.[1];
}

function normalizeDifficulty(value: string | undefined): Difficulty {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "medium" || normalized === "hard") {
    return normalized;
  }
  return "easy";
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function toIsoDate(value: string | number | Date = new Date()): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  return date.toISOString();
}
