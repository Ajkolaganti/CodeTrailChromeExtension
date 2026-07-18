import type { AcceptedSubmission, ExtensionMessage } from "../types";
import { LeetCodeAdapter } from "./adapters/leetcode-adapter";
import type { CodingPlatformAdapter } from "./adapters/coding-platform-adapter";

const adapters: CodingPlatformAdapter[] = [new LeetCodeAdapter()];
const adapter = adapters.find((candidate) => candidate.isSupportedPage());

if (adapter) {
  sendPageDetected();
}

if (adapter) {
  adapter.observeSubmission((submission) => {
    sendAcceptedSubmission(submission);
  });
}

function sendAcceptedSubmission(submission: AcceptedSubmission): void {
  const message: ExtensionMessage = {
    type: "CONTENT_ACCEPTED_SUBMISSION",
    submission
  };
  void sendRuntimeMessage(message);
}

function sendPageDetected(): void {
  const route = location.pathname;
  const pageType = route.includes("/submissions/") ? "submission" : route.includes("/problems/") ? "problem" : "other";
  const message: ExtensionMessage = {
    type: "CONTENT_PAGE_DETECTED",
    route,
    pageType
  };
  void sendRuntimeMessage(message);
}

async function sendRuntimeMessage(message: ExtensionMessage): Promise<void> {
  if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
    return;
  }

  try {
    await chrome.runtime.sendMessage(message);
  } catch (error) {
    if (!isExtensionContextInvalidated(error)) {
      console.warn("CodeTrail content message failed", error);
    }
  }
}

function isExtensionContextInvalidated(error: unknown): boolean {
  return error instanceof Error && /Extension context invalidated/i.test(error.message);
}
