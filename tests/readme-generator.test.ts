import { describe, expect, it } from "vitest";
import { generateMainReadme, generateProblemReadme } from "../src/github/readme-generator";
import { getProblemReadmePath, getSolutionPath } from "../src/github/path";
import { mockAcceptedSubmission } from "../src/storage/mock-submission";

describe("README generation", () => {
  it("generates problem README with metadata and no problem description", () => {
    const readme = generateProblemReadme(mockAcceptedSubmission);
    expect(readme).toContain("# Two Sum");
    expect(readme).toContain("- Difficulty: Easy");
    expect(readme).toContain("- Runtime: 2 ms");
    expect(readme).toContain("Add your notes about the approach here.");
    expect(readme).not.toContain("Given an array");
  });

  it("generates main README with progress and recent solutions", () => {
    const readme = generateMainReadme([
      {
        key: "leetcode:two-sum:java",
        submission: mockAcceptedSubmission,
        solutionPath: getSolutionPath(mockAcceptedSubmission),
        readmePath: getProblemReadmePath(mockAcceptedSubmission),
        syncedAt: mockAcceptedSubmission.submittedAt
      }
    ]);
    expect(readme).toContain("# CodeTrail");
    expect(readme).toContain("- Total problems solved: 1");
    expect(readme).toContain("| [Two Sum](easy/two-sum/README.md) | Easy | Java |");
    expect(readme).toContain("- Java: 1");
  });
});
