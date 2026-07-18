import type { ExtensionMessage, MessageResponse, RepositorySelection } from "../types";
import { connectGitHub } from "../github/auth";
import { GitHubClient } from "../github/client";
import { mockAcceptedSubmission } from "../storage/mock-submission";
import {
  clearAuthState,
  clearLocalState,
  getAuthState,
  getRuntimeSnapshot,
  getSettings,
  saveSettings,
  setSyncStatus
} from "../storage/settings";
import { enqueueSubmission, getQueue, retryFailedItems } from "../storage/sync-queue";
import { validateSubmission } from "../utils/submission";
import { processSyncQueue } from "./sync-worker";

export async function handleMessage(message: ExtensionMessage): Promise<MessageResponse> {
  try {
    switch (message.type) {
      case "GET_RUNTIME_SNAPSHOT":
        return ok(await getRuntimeSnapshot());

      case "CONNECT_GITHUB": {
        const auth = await connectGitHub();
        return ok(auth);
      }

      case "DISCONNECT_GITHUB":
        await clearAuthState();
        await setSyncStatus("waiting");
        return ok(await getRuntimeSnapshot());

      case "UPDATE_SETTINGS": {
        const settings = await saveSettings(message.settings);
        return ok(settings);
      }

      case "LIST_REPOSITORIES": {
        const auth = await requireAuth();
        const repositories = await new GitHubClient(auth.accessToken).listRepositories();
        return ok(repositories);
      }

      case "CREATE_REPOSITORY": {
        const auth = await requireAuth();
        const repository = await new GitHubClient(auth.accessToken).createRepository(message.name, message.isPrivate);
        const selection = toRepositorySelection(repository);
        await saveSettings({ selectedRepository: selection, defaultBranch: selection.defaultBranch });
        return ok(selection);
      }

      case "SELECT_REPOSITORY":
        await saveSettings({
          selectedRepository: message.repository,
          defaultBranch: message.repository.defaultBranch
        });
        return ok(await getRuntimeSnapshot());

      case "CONTENT_ACCEPTED_SUBMISSION": {
        const submission = validateSubmission(message.submission);
        await setSyncStatus("accepted_detected");
        await enqueueSubmission(submission);
        await notify("Accepted submission detected", `${submission.problemTitle} is queued for GitHub sync.`);
        await updateBadge();
        const settings = await getSettings();
        if (settings.autoSync) {
          await processSyncQueue();
        }
        return ok(await getRuntimeSnapshot());
      }

      case "CONTENT_PAGE_DETECTED":
        await setSyncStatus("waiting");
        return ok({ route: message.route, pageType: message.pageType });

      case "CONTENT_EXTRACTION_FAILED":
        await setSyncStatus("unable_to_read_submission", message.reason);
        await notify("CodeTrail could not read the submission", message.reason);
        return ok({ route: message.route, reason: message.reason });

      case "PROCESS_SYNC_QUEUE":
        await processSyncQueue();
        return ok(await getRuntimeSnapshot());

      case "RETRY_FAILED_SYNCS":
        await retryFailedItems();
        await processSyncQueue();
        return ok(await getRuntimeSnapshot());

      case "SIMULATE_ACCEPTED_SUBMISSION":
        await enqueueSubmission(mockAcceptedSubmission);
        await setSyncStatus("accepted_detected");
        await updateBadge();
        return ok(await getRuntimeSnapshot());

      case "CLEAR_LOCAL_DATA":
        await clearLocalState();
        await setSyncStatus("waiting");
        await updateBadge();
        return ok(await getRuntimeSnapshot());

      case "EXPORT_PENDING_SUBMISSIONS":
        return ok(await getQueue());
    }
  } catch (error) {
    const messageText = error instanceof Error ? error.message : "Unknown error";
    return { ok: false, error: messageText };
  }
}

async function requireAuth() {
  const auth = await getAuthState();
  if (!auth) {
    throw new Error("Connect GitHub before continuing.");
  }
  return auth;
}

function toRepositorySelection(repository: {
  fullName: string;
  name: string;
  htmlUrl: string;
  defaultBranch: string;
  private: boolean;
}): RepositorySelection {
  const [owner] = repository.fullName.split("/");
  return {
    owner,
    name: repository.name,
    fullName: repository.fullName,
    htmlUrl: repository.htmlUrl,
    defaultBranch: repository.defaultBranch,
    private: repository.private
  };
}

async function updateBadge(): Promise<void> {
  if (typeof chrome === "undefined" || !chrome.action?.setBadgeText) {
    return;
  }
  const failedCount = (await getQueue()).filter((item) => item.status === "failed").length;
  const pendingCount = (await getQueue()).filter((item) => item.status === "pending" || item.status === "syncing").length;
  const text = failedCount > 0 ? String(failedCount) : pendingCount > 0 ? String(pendingCount) : "";
  await chrome.action.setBadgeText({ text });
  await chrome.action.setBadgeBackgroundColor({ color: failedCount > 0 ? "#b42318" : "#16a34a" });
}

async function notify(title: string, message: string): Promise<void> {
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

function ok<T>(data: T): MessageResponse<T> {
  return { ok: true, data };
}

function getNotificationIconUrl(): string {
  return typeof chrome !== "undefined" && chrome.runtime?.getURL ? chrome.runtime.getURL("icon.svg") : "icon.svg";
}
