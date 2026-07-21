import { describe, expect, it } from "vitest";
import { GitHubApiError } from "../src/github/errors";

describe("GitHub error handling", () => {
  it("classifies authentication errors", () => {
    const error = new GitHubApiError("Bad credentials", 401);
    expect(error.isAuthError).toBe(true);
    expect(error.isRecoverable).toBe(false);
  });

  it("classifies rate limits as recoverable", () => {
    const error = new GitHubApiError("API rate limit exceeded", 403, {}, "1780000000");
    expect(error.isRateLimit).toBe(true);
    expect(error.isRecoverable).toBe(true);
  });

  it("classifies GitHub content sha mismatches as recoverable", () => {
    const error = new GitHubApiError(
      "medium/longest-palindromic-substring/solution.java does not match 8b470d1f34c2362735a1fcd3aaa5b152391edffb",
      422
    );

    expect(error.isShaConflict).toBe(true);
    expect(error.isRecoverable).toBe(true);
  });
});
