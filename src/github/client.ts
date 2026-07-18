import type { GitHubAccount, GitHubRepository } from "../types";
import { GitHubApiError } from "./errors";

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_API_VERSION = "2022-11-28";

interface GitHubUserResponse {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
}

interface GitHubRepositoryResponse {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  default_branch: string;
  permissions?: GitHubRepository["permissions"];
}

interface GitHubContentResponse {
  type: string;
  sha: string;
  content?: string;
  encoding?: string;
}

export interface RepositoryFile {
  path: string;
  sha?: string;
  content?: string;
}

export interface PutFileInput {
  owner: string;
  repo: string;
  path: string;
  content: string;
  message: string;
  branch: string;
  sha?: string;
}

export class GitHubClient {
  constructor(private readonly accessToken: string) {}

  async getAuthenticatedUser(): Promise<GitHubAccount> {
    const user = await this.request<GitHubUserResponse>("/user");
    return {
      login: user.login,
      id: user.id,
      avatarUrl: user.avatar_url,
      htmlUrl: user.html_url
    };
  }

  async listRepositories(): Promise<GitHubRepository[]> {
    const repositories = await this.request<GitHubRepositoryResponse[]>(
      "/user/repos?affiliation=owner,collaborator&sort=updated&per_page=100"
    );
    return repositories.map(mapRepository);
  }

  async createRepository(name = "codetrail", isPrivate = false): Promise<GitHubRepository> {
    const repository = await this.request<GitHubRepositoryResponse>("/user/repos", {
      method: "POST",
      body: JSON.stringify({
        name,
        private: isPrivate,
        auto_init: true,
        description: "Accepted coding submissions synced by CodeTrail."
      })
    });
    return mapRepository(repository);
  }

  async getFile(owner: string, repo: string, path: string, branch: string): Promise<RepositoryFile | null> {
    try {
      const content = await this.request<GitHubContentResponse>(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodePath(path)}?ref=${encodeURIComponent(
          branch
        )}`
      );

      if (content.type !== "file") {
        return null;
      }

      return {
        path,
        sha: content.sha,
        content: decodeBase64(content.content, content.encoding)
      };
    } catch (error) {
      if (error instanceof GitHubApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async putFile(input: PutFileInput): Promise<{ commitSha?: string; contentSha?: string }> {
    const response = await this.request<{
      content?: { sha?: string };
      commit?: { sha?: string };
    }>(`/repos/${encodeURIComponent(input.owner)}/${encodeURIComponent(input.repo)}/contents/${encodePath(input.path)}`, {
      method: "PUT",
      body: JSON.stringify({
        message: input.message,
        content: encodeBase64(input.content),
        branch: input.branch,
        sha: input.sha
      })
    });

    return { commitSha: response.commit?.sha, contentSha: response.content?.sha };
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${GITHUB_API_BASE}${path}`, {
        ...init,
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
          "X-GitHub-Api-Version": GITHUB_API_VERSION,
          ...init.headers
        }
      });
    } catch (error) {
      throw new GitHubApiError(error instanceof Error ? error.message : "Network error", 0);
    }

    const text = await response.text();
    const body = parseJson(text);

    if (!response.ok) {
      const message = getGitHubMessage(body) ?? `GitHub API error (${response.status})`;
      throw new GitHubApiError(message, response.status, body, response.headers.get("x-ratelimit-reset") ?? undefined);
    }

    return body as T;
  }
}

function mapRepository(repository: GitHubRepositoryResponse): GitHubRepository {
  return {
    id: repository.id,
    name: repository.name,
    fullName: repository.full_name,
    private: repository.private,
    htmlUrl: repository.html_url,
    defaultBranch: repository.default_branch,
    permissions: repository.permissions
  };
}

function encodePath(path: string): string {
  return path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function encodeBase64(value: string): string {
  return btoa(unescape(encodeURIComponent(value)));
}

function decodeBase64(content: string | undefined, encoding: string | undefined): string | undefined {
  if (!content || encoding !== "base64") {
    return undefined;
  }
  return decodeURIComponent(escape(atob(content.replace(/\n/g, ""))));
}

function parseJson(text: string): unknown {
  if (!text) {
    return {};
  }
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function getGitHubMessage(body: unknown): string | undefined {
  if (typeof body === "object" && body !== null && "message" in body) {
    const message = (body as { message?: unknown }).message;
    return typeof message === "string" ? message : undefined;
  }
  return undefined;
}
