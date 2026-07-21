import type { AcceptedSubmission, CodeTrailSettings, SyncedSolution } from "../types";
import { createSubmissionKey } from "../utils/submission";
import { toIsoDate } from "../utils/time";
import type { GitHubClient } from "./client";
import { getCommitMessage, getProblemReadmePath, getSolutionPath } from "./path";
import { generateMainReadme, generateProblemReadme } from "./readme-generator";
import { GitHubApiError } from "./errors";

export interface SyncResult {
  status: "created" | "updated" | "skipped";
  solutionPath: string;
  readmePath: string;
  commitSha?: string;
  syncedSolution?: SyncedSolution;
}

let repositorySyncQueue: Promise<void> = Promise.resolve();

export async function syncSubmissionToRepository(
  client: GitHubClient,
  settings: CodeTrailSettings,
  submission: AcceptedSubmission,
  syncedSolutions: SyncedSolution[]
): Promise<SyncResult> {
  return runSerialized(async () => {
    const repository = settings.selectedRepository;
    if (!repository) {
      throw new Error("Select a GitHub repository before syncing.");
    }

    const branch = settings.defaultBranch || repository.defaultBranch || "main";
    const [owner, repo] = repository.fullName.split("/");
    if (!owner || !repo) {
      throw new Error("Selected repository is invalid.");
    }

    const solutionPath = getSolutionPath(submission);
    const readmePath = getProblemReadmePath(submission);
    const desiredSolutionContent = `${submission.code}\n`;
    const existingSolution = await client.getFile(owner, repo, solutionPath, branch);

    if (existingSolution && settings.duplicateBehavior === "skip") {
      return { status: "skipped", solutionPath, readmePath };
    }

    const solutionWrite = await putWithRetry(client, {
      owner,
      repo,
      path: solutionPath,
      content: desiredSolutionContent,
      message: getCommitMessage(submission, Boolean(existingSolution)),
      branch,
      sha: existingSolution?.sha
    });

    const existingProblemReadme = await client.getFile(owner, repo, readmePath, branch);
    await putWithRetry(client, {
      owner,
      repo,
      path: readmePath,
      content: generateProblemReadme(submission),
      message: `Document ${submission.problemTitle}`,
      branch,
      sha: existingProblemReadme?.sha
    });

    const syncedSolution: SyncedSolution = {
      key: createSubmissionKey(submission),
      submission,
      solutionPath,
      readmePath,
      syncedAt: toIsoDate(),
      commitSha: solutionWrite.commitSha
    };

    const existingReadme = await client.getFile(owner, repo, "README.md", branch);
    const nextReadme = generateMainReadme([syncedSolution, ...syncedSolutions.filter((item) => item.key !== syncedSolution.key)]);
    await putWithRetry(client, {
      owner,
      repo,
      path: "README.md",
      content: nextReadme,
      message: "Update CodeTrail portfolio README",
      branch,
      sha: existingReadme?.sha
    });

    return {
      status: existingSolution ? "updated" : "created",
      solutionPath,
      readmePath,
      commitSha: solutionWrite.commitSha,
      syncedSolution
    };
  });
}

async function putWithRetry(
  client: GitHubClient,
  input: {
    owner: string;
    repo: string;
    path: string;
    content: string;
    message: string;
    branch: string;
    sha?: string;
  }
): Promise<{ commitSha?: string; contentSha?: string }> {
  let currentInput = { ...input };
  let conflictSha: string | undefined;
  const maxAttempts = 5;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    // Always re-read the file immediately before writing and use the sha we
    // just confirmed, rather than a value carried over from an earlier
    // attempt (or from before this function was even called) — GitHub's
    // Contents API rejects a write whose sha doesn't match the file's
    // current blob, and a stale sha is an avoidable cause of that.
    const existing = await client.getFile(currentInput.owner, currentInput.repo, currentInput.path, currentInput.branch);
    if (existing?.content === currentInput.content) {
      return { contentSha: existing.sha };
    }
    currentInput = { ...currentInput, sha: conflictSha ?? existing?.sha };
    conflictSha = undefined;

    try {
      return await client.putFile(currentInput);
    } catch (error) {
      if (!isShaConflict(error) || attempt === maxAttempts - 1) {
        throw error;
      }
      conflictSha = extractShaFromConflict(error) ?? undefined;
      await delay(150 * (attempt + 1));
    }
  }

  throw new Error("GitHub file update failed.");
}

function isShaConflict(error: unknown): boolean {
  return error instanceof GitHubApiError && error.isShaConflict;
}

function extractShaFromConflict(error: unknown): string | null {
  if (!(error instanceof GitHubApiError)) {
    return null;
  }

  const match = error.message.match(/\b[0-9a-f]{40}\b/i);
  return match?.[0] ?? null;
}

function runSerialized<T>(operation: () => Promise<T>): Promise<T> {
  const previous = repositorySyncQueue;
  let releaseCurrent!: () => void;

  repositorySyncQueue = new Promise<void>((resolve) => {
    releaseCurrent = resolve;
  });

  return previous
    .catch(() => undefined)
    .then(() => operation())
    .finally(() => {
      releaseCurrent();
    });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}
