import { describe, expect, it } from "vitest";
import { GitHubApiError } from "../src/github/errors";
import { syncSubmissionToRepository } from "../src/github/repository";
import type { GitHubClient, PutFileInput, RepositoryFile } from "../src/github/client";
import { mockAcceptedSubmission } from "../src/storage/mock-submission";
import type { CodeTrailSettings } from "../src/types";

const OLD_SOLUTION_SHA = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const CURRENT_SOLUTION_SHA = "8b470d1f34c2362735a1fcd3aaa5b152391edffb";

describe("repository sync", () => {
  it("retries a GitHub sha mismatch with the sha from the conflict response", async () => {
    const client = new FakeGitHubClient();

    const result = await syncSubmissionToRepository(client as unknown as GitHubClient, testSettings, mockAcceptedSubmission, []);

    const solutionWrites = client.puts.filter((put) => put.path === "easy/two-sum/solution.java");
    expect(result.status).toBe("updated");
    expect(solutionWrites).toHaveLength(2);
    expect(solutionWrites[0].sha).toBe(OLD_SOLUTION_SHA);
    expect(solutionWrites[1].sha).toBe(CURRENT_SOLUTION_SHA);
  });
});

const testSettings: CodeTrailSettings = {
  autoSync: true,
  acceptedOnly: true,
  duplicateBehavior: "update",
  includePerformanceStats: true,
  desktopNotifications: false,
  defaultBranch: "main",
  theme: "system",
  selectedRepository: {
    owner: "octo",
    name: "codetrail",
    fullName: "octo/codetrail",
    htmlUrl: "https://github.com/octo/codetrail",
    defaultBranch: "main",
    private: false
  }
};

class FakeGitHubClient {
  readonly puts: PutFileInput[] = [];
  private solutionConflictThrown = false;

  async getFile(_owner: string, _repo: string, path: string): Promise<RepositoryFile | null> {
    if (path === "easy/two-sum/solution.java") {
      return {
        path,
        sha: OLD_SOLUTION_SHA,
        content: "class Solution {}\n"
      };
    }

    return null;
  }

  async putFile(input: PutFileInput): Promise<{ commitSha?: string; contentSha?: string }> {
    this.puts.push(input);

    if (input.path === "easy/two-sum/solution.java" && !this.solutionConflictThrown) {
      this.solutionConflictThrown = true;
      throw new GitHubApiError(
        `easy/two-sum/solution.java does not match ${CURRENT_SOLUTION_SHA}`,
        409
      );
    }

    return {
      commitSha: `commit-${this.puts.length}`,
      contentSha: input.path === "easy/two-sum/solution.java" ? CURRENT_SOLUTION_SHA : `content-${this.puts.length}`
    };
  }
}
