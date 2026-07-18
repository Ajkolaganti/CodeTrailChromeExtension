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
});
