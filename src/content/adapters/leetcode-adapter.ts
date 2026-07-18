import type { AcceptedSubmission, Difficulty } from "../../types";
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
  private historyPatched = false;

  isSupportedPage(): boolean {
    return /^\/(problems|submissions)\//.test(location.pathname);
  }

  observeSubmission(callback: (submission: AcceptedSubmission) => void): () => void {
    if (!this.isSupportedPage() || !document.body) {
      return () => undefined;
    }

    this.patchHistory();

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
    };
  }

  async extractSubmission(): Promise<AcceptedSubmission | null> {
    const currentQuestion = this.getCurrentQuestionMetadata();
    const submissionId = this.getSubmissionId();
    if (submissionId) {
      const fromSubmissionPage = await this.fetchSubmissionDetails(submissionId, currentQuestion);
      if (fromSubmissionPage) {
        return fromSubmissionPage;
      }
    }

    const slug = currentQuestion.slug;
    const question = slug ? await this.fetchQuestion(slug) : currentQuestion;

    const latestAccepted = await this.fetchLatestAcceptedSubmission(slug, question);
    if (latestAccepted) {
      return latestAccepted;
    }

    const domSubmission = this.extractFromDom(question);
    if (domSubmission?.code) {
      return domSubmission;
    }

    if (this.isSubmissionPage()) {
      this.revealCodeTab();
      await delay(300);
      const revealedSubmission = this.extractFromDom(question);
      if (revealedSubmission?.code) {
        return revealedSubmission;
      }
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

    this.debounceTimer = window.setTimeout(() => {
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
        callback(submission);
      });
    }, 500);
  }

  private async fetchLatestAcceptedSubmission(slug: string, question: QuestionMetadata): Promise<AcceptedSubmission | null> {
    const response = await leetcodeGraphql<SubmissionListResponse>({
      query: `query recentSubmissions($titleSlug: String!) {
        questionSubmissionList(questionSlug: $titleSlug, offset: 0, limit: 5) {
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
    const codeBlock = document.querySelector("pre code, pre")?.textContent?.trimEnd();
    if (codeBlock && codeBlock.length > 0) {
      return codeBlock;
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
    return /^\/submissions\//.test(location.pathname);
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
    void chrome.runtime.sendMessage({
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

function extractTitleFromDom(): string | null {
  return (
    document.querySelector<HTMLElement>('[data-cy="question-title"]')?.innerText.trim() ||
    document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content.replace(/ - LeetCode$/, "").trim() ||
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
  const selectors = [
    '[data-cy="lang-select"]',
    '[data-e2e-locator="console-submit-lang"]',
    'button[aria-haspopup="listbox"]',
    ".monaco-editor"
  ];

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
