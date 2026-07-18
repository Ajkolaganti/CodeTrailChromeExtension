import { describe, expect, it } from "vitest";
import { createSubmissionKey, normalizeDifficulty, validateSubmission } from "../src/utils/submission";
import { mockAcceptedSubmission } from "../src/storage/mock-submission";

describe("submission validation", () => {
  it("normalizes valid submissions", () => {
    const submission = validateSubmission({ ...mockAcceptedSubmission, language: "python3", problemSlug: "Two Sum" });
    expect(submission.language).toBe("Python");
    expect(submission.problemSlug).toBe("two-sum");
    expect(createSubmissionKey(submission)).toBe("leetcode:two-sum:python");
  });

  it("rejects missing source code", () => {
    expect(() => validateSubmission({ ...mockAcceptedSubmission, code: "" })).toThrow();
  });

  it("normalizes difficulty with easy fallback", () => {
    expect(normalizeDifficulty("Hard")).toBe("hard");
    expect(normalizeDifficulty("Unknown")).toBe("easy");
  });
});
