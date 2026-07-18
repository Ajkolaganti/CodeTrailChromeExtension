import type { SyncStatus } from "../types";

const labels: Record<SyncStatus, string> = {
  waiting: "Waiting for an accepted submission",
  accepted_detected: "Accepted submission detected",
  syncing: "Syncing to GitHub",
  successfully_committed: "Successfully committed",
  existing_solution_updated: "Existing solution updated",
  already_synchronized: "Already synchronized",
  authentication_expired: "Authentication expired",
  github_api_error: "GitHub API error",
  unable_to_read_submission: "Unable to read submission",
  waiting_for_network: "Waiting for network connection"
};

const compactLabels: Record<SyncStatus, string> = {
  waiting: "Waiting",
  accepted_detected: "Detected",
  syncing: "Syncing",
  successfully_committed: "Committed",
  existing_solution_updated: "Updated",
  already_synchronized: "Synced",
  authentication_expired: "Auth expired",
  github_api_error: "GitHub error",
  unable_to_read_submission: "Read error",
  waiting_for_network: "Offline"
};

export function StatusPill({ status, compact = false }: { status: SyncStatus; compact?: boolean }) {
  const isGood = status === "successfully_committed" || status === "existing_solution_updated";
  const isBad = status === "authentication_expired" || status === "github_api_error" || status === "unable_to_read_submission";
  const className = isGood
    ? "bg-trail-100 text-trail-700 ring-trail-500/20 dark:bg-trail-900/30 dark:text-trail-100"
    : isBad
      ? "bg-red-100 text-red-700 ring-red-500/20 dark:bg-red-950 dark:text-red-200"
      : "bg-cobalt-50 text-cobalt-700 ring-cobalt-500/20 dark:bg-cobalt-700/20 dark:text-cobalt-100";
  return (
    <span title={labels[status]} className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${className}`}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${isBad ? "bg-red-500" : isGood ? "bg-trail-500" : "bg-cobalt-500"}`} />
      <span className="truncate">{compact ? compactLabels[status] : labels[status]}</span>
    </span>
  );
}
