import type { AcceptedSubmission, SyncedSolution } from "../types";
import { formatDisplayDate, formatShortDate } from "../utils/time";
import { getProblemReadmePath, getSolutionPath } from "./path";

export function generateProblemReadme(submission: AcceptedSubmission): string {
  const lines = [
    `# ${submission.problemTitle}`,
    "",
    `- Difficulty: ${capitalize(submission.difficulty)}`,
    `- Language: ${submission.language}`,
    "- Platform: LeetCode",
    `- Problem: [View on LeetCode](${submission.problemUrl})`,
    `- Submitted: ${formatDisplayDate(submission.submittedAt)}`
  ];

  if (submission.runtime) {
    lines.push(`- Runtime: ${submission.runtime}`);
  }

  if (submission.memory) {
    lines.push(`- Memory: ${submission.memory}`);
  }

  lines.push(
    "",
    "## Approach",
    "",
    "Add your notes about the approach here.",
    "",
    "## Complexity",
    "",
    "- Time: Not documented",
    "- Space: Not documented",
    ""
  );

  return lines.join("\n");
}

export function generateMainReadme(solutions: SyncedSolution[]): string {
  const sorted = [...solutions].sort(
    (a, b) =>
      new Date(b.submission.submittedAt).getTime() - new Date(a.submission.submittedAt).getTime()
  );
  const unique = uniqueSolutions(sorted);
  const totals = countByDifficulty(unique.map((solution) => solution.submission));
  const languageBreakdown = countByLanguage(unique.map((solution) => solution.submission));
  const lastSubmissionDate = unique[0]?.submission.submittedAt;

  return [
    "# CodeTrail",
    "",
    "> Solve it. Sync it. Show it.",
    "",
    "A record of my data structures and algorithms practice. This repository is automatically maintained by the CodeTrail Chrome extension.",
    "",
    "## Progress",
    "",
    `- Total problems solved: ${unique.length}`,
    `- Easy problems: ${totals.easy}`,
    `- Medium problems: ${totals.medium}`,
    `- Hard problems: ${totals.hard}`,
    `- Languages used: ${Object.keys(languageBreakdown).length || 0}`,
    `- Last submission date: ${lastSubmissionDate ? formatDisplayDate(lastSubmissionDate) : "None yet"}`,
    "",
    "## Recent Solutions",
    "",
    "| Problem | Difficulty | Language | Solution | Date |",
    "|---------|------------|----------|----------|------|",
    ...unique.slice(0, 25).map((solution) => recentSolutionRow(solution)),
    ...(unique.length === 0 ? ["| No accepted submissions synced yet | - | - | - | - |"] : []),
    "",
    "## Language Breakdown",
    "",
    ...languageBreakdownLines(languageBreakdown),
    "",
    "## Topic Progress",
    "",
    "Topic tracking is ready for future CodeTrail releases.",
    "",
    "## About CodeTrail",
    "",
    "CodeTrail converts accepted coding submissions into a structured GitHub portfolio so consistent practice becomes visible proof of progress.",
    "",
    "All code in this repository consists of my own accepted solutions and learning notes.",
    ""
  ].join("\n");
}

function uniqueSolutions(solutions: SyncedSolution[]): SyncedSolution[] {
  const seen = new Set<string>();
  const unique: SyncedSolution[] = [];
  for (const solution of solutions) {
    if (!seen.has(solution.key)) {
      seen.add(solution.key);
      unique.push(solution);
    }
  }
  return unique;
}

function recentSolutionRow(solution: SyncedSolution): string {
  const submission = solution.submission;
  return `| [${submission.problemTitle}](${getProblemReadmePath(submission)}) | ${capitalize(
    submission.difficulty
  )} | ${submission.language} | [Code](${getSolutionPath(submission)}) | ${formatShortDate(
    submission.submittedAt
  )} |`;
}

function countByDifficulty(submissions: AcceptedSubmission[]): Record<"easy" | "medium" | "hard", number> {
  return submissions.reduce(
    (acc, submission) => {
      acc[submission.difficulty] += 1;
      return acc;
    },
    { easy: 0, medium: 0, hard: 0 }
  );
}

function countByLanguage(submissions: AcceptedSubmission[]): Record<string, number> {
  return submissions.reduce<Record<string, number>>((acc, submission) => {
    acc[submission.language] = (acc[submission.language] ?? 0) + 1;
    return acc;
  }, {});
}

function languageBreakdownLines(languageBreakdown: Record<string, number>): string[] {
  const entries = Object.entries(languageBreakdown).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  if (entries.length === 0) {
    return ["- No languages synced yet."];
  }
  return entries.map(([language, count]) => `- ${language}: ${count}`);
}

function capitalize(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}
