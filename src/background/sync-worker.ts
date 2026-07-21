import { GitHubApiError } from "../github/errors";
import { GitHubClient } from "../github/client";
import { syncSubmissionToRepository } from "../github/repository";
import { getAuthState, getSettings, getSyncedSolutions, saveSyncedSolution, setSyncStatus } from "../storage/settings";
import { getNextSyncItem, removeQueueItem, updateQueueItem } from "../storage/sync-queue";
import { toIsoDate } from "../utils/time";

let activeSync: Promise<void> | undefined;

export async function processSyncQueue(): Promise<void> {
  if (activeSync) {
    return activeSync;
  }

  activeSync = processQueueInternal().finally(() => {
    activeSync = undefined;
  });

  return activeSync;
}

async function processQueueInternal(): Promise<void> {
  if (typeof navigator !== "undefined" && "onLine" in navigator && !navigator.onLine) {
    await setSyncStatus("waiting_for_network");
    return;
  }

  const auth = await getAuthState();
  if (!auth) {
    await setSyncStatus("authentication_expired", "GitHub is not connected.");
    return;
  }

  let item = await getNextSyncItem();
  while (item) {
    await updateQueueItem(item.id, {
      status: "syncing",
      retryCount: item.retryCount + 1,
      lastError: undefined
    });
    await setSyncStatus("syncing");

    try {
      const settings = await getSettings();
      const submission = settings.includePerformanceStats
        ? item.submission
        : { ...item.submission, runtime: undefined, memory: undefined };
      const syncedSolutions = await getSyncedSolutions();
      const result = await syncSubmissionToRepository(
        new GitHubClient(auth.accessToken),
        settings,
        submission,
        syncedSolutions
      );

      if (result.status === "skipped") {
        await setSyncStatus("already_synchronized");
      } else {
        await setSyncStatus(result.status === "updated" ? "existing_solution_updated" : "successfully_committed");
      }

      if (result.syncedSolution) {
        await saveSyncedSolution(result.syncedSolution);
      }

      await removeQueueItem(item.id);
      await showSyncNotification(result.status, item.submission.problemTitle);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sync submission.";
      const retrySilently = shouldRetrySilently(error);
      await updateQueueItem(item.id, {
        status: "failed",
        lastError: retrySilently ? undefined : message,
        retryCount: item.retryCount + 1
      });
      if (retrySilently) {
        await setSyncStatus("syncing");
      } else {
        await setSyncStatus(statusFromError(error), message);
        await showFailureNotification(item.submission.problemTitle, message);
      }

      if (!(error instanceof GitHubApiError) || !error.isRecoverable) {
        return;
      }
    }

    item = await getNextSyncItem();
  }

  await refreshBadge();
}

function statusFromError(error: unknown) {
  if (error instanceof GitHubApiError) {
    return error.isAuthError ? "authentication_expired" : "github_api_error";
  }
  return "github_api_error";
}

function shouldRetrySilently(error: unknown): boolean {
  return error instanceof GitHubApiError && error.isRecoverable && error.isShaConflict;
}

async function refreshBadge(): Promise<void> {
  if (typeof chrome === "undefined" || !chrome.action?.setBadgeText) {
    return;
  }
  await chrome.action.setBadgeText({ text: "" });
}

async function showSyncNotification(status: "created" | "updated" | "skipped", problemTitle: string): Promise<void> {
  const title =
    status === "created"
      ? "Solution committed"
      : status === "updated"
        ? "Existing solution updated"
        : "Already synchronized";
  await createNotification(title, `${problemTitle} processed at ${new Date(toIsoDate()).toLocaleTimeString()}.`);
}

async function showFailureNotification(problemTitle: string, message: string): Promise<void> {
  await createNotification("CodeTrail sync failed", `${problemTitle}: ${message}`);
}

async function createNotification(title: string, message: string): Promise<void> {
  const settings = await getSettings();
  if (!settings.desktopNotifications || typeof chrome === "undefined" || !chrome.notifications?.create) {
    return;
  }

  try {
    await chrome.notifications.create({
      type: "basic",
      iconUrl: getNotificationIconUrl(),
      title,
      message
    });
  } catch (error) {
    console.warn("CodeTrail notification failed", error);
  }
}

function getNotificationIconUrl(): string {
  return typeof chrome !== "undefined" && chrome.runtime?.getURL ? chrome.runtime.getURL("icon.svg") : "icon.svg";
}
