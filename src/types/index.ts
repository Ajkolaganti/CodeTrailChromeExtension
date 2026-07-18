export type Difficulty = "easy" | "medium" | "hard";

export type Platform = "leetcode";

export type SyncStatus =
  | "waiting"
  | "accepted_detected"
  | "syncing"
  | "successfully_committed"
  | "existing_solution_updated"
  | "already_synchronized"
  | "authentication_expired"
  | "github_api_error"
  | "unable_to_read_submission"
  | "waiting_for_network";

export type PendingStatus = "pending" | "syncing" | "failed";

export type DuplicateBehavior = "update" | "skip";

export interface AcceptedSubmission {
  platform: Platform;
  problemTitle: string;
  problemSlug: string;
  problemUrl: string;
  difficulty: Difficulty;
  language: string;
  code: string;
  runtime?: string;
  memory?: string;
  submittedAt: string;
}

export interface PendingSyncItem {
  id: string;
  submission: AcceptedSubmission;
  status: PendingStatus;
  retryCount: number;
  lastError?: string;
  createdAt: string;
}

export interface SyncedSolution {
  key: string;
  submission: AcceptedSubmission;
  solutionPath: string;
  readmePath: string;
  syncedAt: string;
  commitSha?: string;
}

export interface GitHubAccount {
  login: string;
  id: number;
  avatarUrl: string;
  htmlUrl: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  htmlUrl: string;
  defaultBranch: string;
  permissions?: {
    admin?: boolean;
    maintain?: boolean;
    push?: boolean;
    triage?: boolean;
    pull?: boolean;
  };
}

export interface AuthState {
  accessToken: string;
  tokenType: "bearer";
  scope: string;
  account: GitHubAccount;
  authenticatedAt: string;
}

export interface RepositorySelection {
  owner: string;
  name: string;
  fullName: string;
  htmlUrl: string;
  defaultBranch: string;
  private: boolean;
}

export interface CodeTrailSettings {
  autoSync: boolean;
  acceptedOnly: boolean;
  duplicateBehavior: DuplicateBehavior;
  includePerformanceStats: boolean;
  desktopNotifications: boolean;
  selectedRepository?: RepositorySelection;
  defaultBranch?: string;
  theme: "system" | "light" | "dark";
}

export interface RuntimeSnapshot {
  settings: CodeTrailSettings;
  auth?: AuthState;
  queue: PendingSyncItem[];
  synced: SyncedSolution[];
  status: SyncStatus;
  lastError?: string;
}

export type ExtensionMessage =
  | { type: "CONTENT_ACCEPTED_SUBMISSION"; submission: AcceptedSubmission }
  | { type: "CONTENT_PAGE_DETECTED"; route: string; pageType: "problem" | "submission" | "other" }
  | { type: "CONTENT_EXTRACTION_FAILED"; route: string; reason: string }
  | { type: "GET_RUNTIME_SNAPSHOT" }
  | { type: "CONNECT_GITHUB" }
  | { type: "DISCONNECT_GITHUB" }
  | { type: "UPDATE_SETTINGS"; settings: Partial<CodeTrailSettings> }
  | { type: "LIST_REPOSITORIES" }
  | { type: "CREATE_REPOSITORY"; name?: string; isPrivate?: boolean }
  | { type: "SELECT_REPOSITORY"; repository: RepositorySelection }
  | { type: "PROCESS_SYNC_QUEUE" }
  | { type: "RETRY_FAILED_SYNCS" }
  | { type: "SIMULATE_ACCEPTED_SUBMISSION" }
  | { type: "CLEAR_LOCAL_DATA" }
  | { type: "EXPORT_PENDING_SUBMISSIONS" };

export interface MessageResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}
