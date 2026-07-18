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

export async function syncSubmissionToRepository(
  client: GitHubClient,
  settings: CodeTrailSettings,
  submission: AcceptedSubmission,
  syncedSolutions: SyncedSolution[]
): Promise<SyncResult> {
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

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const existing = await client.getFile(currentInput.owner, currentInput.repo, currentInput.path, currentInput.branch);
      if (existing?.content === currentInput.content) {
        return { contentSha: existing.sha };
      }
      return await client.putFile(currentInput);
    } catch (error) {
      if (!isShaConflict(error) || attempt === 4) {
        throw error;
      }

      const latest = await client.getFile(currentInput.owner, currentInput.repo, currentInput.path, currentInput.branch);
      currentInput = { ...currentInput, sha: latest?.sha };
      await delay(150 * (attempt + 1));
    }
  }

  throw new Error("GitHub file update failed.");
}

function isShaConflict(error: unknown): boolean {
  return (
    error instanceof GitHubApiError &&
    (error.status === 409 || error.status === 422) &&
    /sha|does not match|exists/i.test(error.message)
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms);
  });
}
