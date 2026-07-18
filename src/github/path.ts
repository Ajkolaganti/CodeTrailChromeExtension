import type { AcceptedSubmission } from "../types";
import { getLanguageExtension } from "../utils/language";

export function getProblemDirectory(submission: AcceptedSubmission): string {
  return `${submission.difficulty}/${submission.problemSlug}`;
}

export function getSolutionPath(submission: AcceptedSubmission): string {
  return `${getProblemDirectory(submission)}/solution.${getLanguageExtension(submission.language)}`;
}

export function getProblemReadmePath(submission: AcceptedSubmission): string {
  return `${getProblemDirectory(submission)}/README.md`;
}

export function getCommitMessage(submission: AcceptedSubmission, updated: boolean): string {
  const verb = updated ? "Update" : "Solve";
  return `${verb} ${submission.problemTitle} in ${submission.language} — ${capitalize(
    submission.difficulty
  )}`;
}

function capitalize(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
