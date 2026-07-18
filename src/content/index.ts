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
  void chrome.runtime.sendMessage(message);
}

function sendPageDetected(): void {
  const route = location.pathname;
  const pageType = route.includes("/submissions/") ? "submission" : route.includes("/problems/") ? "problem" : "other";
  const message: ExtensionMessage = {
    type: "CONTENT_PAGE_DETECTED",
    route,
    pageType
  };
  void chrome.runtime.sendMessage(message);
}
