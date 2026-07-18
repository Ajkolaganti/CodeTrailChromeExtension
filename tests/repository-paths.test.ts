import { describe, expect, it } from "vitest";
import { getCommitMessage, getProblemReadmePath, getSolutionPath } from "../src/github/path";
import { mockAcceptedSubmission } from "../src/storage/mock-submission";

describe("repository paths and commits", () => {
  it("generates difficulty and slug based paths", () => {
    expect(getSolutionPath(mockAcceptedSubmission)).toBe("easy/two-sum/solution.java");
    expect(getProblemReadmePath(mockAcceptedSubmission)).toBe("easy/two-sum/README.md");
  });

  it("generates meaningful commit messages", () => {
    expect(getCommitMessage(mockAcceptedSubmission, false)).toBe("Solve Two Sum in Java — Easy");
    expect(getCommitMessage(mockAcceptedSubmission, true)).toBe("Update Two Sum in Java — Easy");
  });
});
