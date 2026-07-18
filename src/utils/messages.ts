import type { ExtensionMessage, MessageResponse } from "../types";

export async function sendMessage<T>(message: ExtensionMessage): Promise<T> {
  if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
    throw new Error("Chrome runtime is unavailable.");
  }

  const response = await chrome.runtime.sendMessage(message);
  const typed = response as MessageResponse<T>;
  if (!typed?.ok) {
    throw new Error(typed?.error ?? "Extension message failed.");
  }
  return typed.data as T;
}
