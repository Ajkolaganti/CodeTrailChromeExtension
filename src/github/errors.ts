export class GitHubApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly response?: unknown,
    public readonly rateLimitReset?: string
  ) {
    super(message);
    this.name = "GitHubApiError";
  }

  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  get isRateLimit(): boolean {
    return this.status === 403 && Boolean(this.rateLimitReset);
  }

  get isRecoverable(): boolean {
    return this.status === 0 || this.status === 409 || this.status === 429 || this.status >= 500 || this.isRateLimit;
  }
}
