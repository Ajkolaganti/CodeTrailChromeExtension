import type { ExtensionMessage } from "../types";
import { defaultSettings, getSettings, saveSettings, setSyncStatus } from "../storage/settings";
import { processSyncQueue } from "./sync-worker";
import { handleMessage } from "./message-handler";

chrome.runtime.onInstalled.addListener(() => {
  void getSettings()
    .then((settings) => saveSettings({ ...defaultSettings, ...settings }))
    .then(() => setSyncStatus("waiting"));
});

chrome.runtime.onMessage.addListener((message: ExtensionMessage, _sender, sendResponse) => {
  void handleMessage(message).then(sendResponse);
  return true;
});

chrome.runtime.onStartup.addListener(() => {
  void processSyncQueue();
});

chrome.notifications.onButtonClicked?.addListener(() => {
  void processSyncQueue();
});
