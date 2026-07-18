import type { AcceptedSubmission, PendingSyncItem } from "../types";
import { createSubmissionKey, validateSubmission } from "../utils/submission";
import { toIsoDate } from "../utils/time";
import { storageGet, storageSet } from "./chrome-storage";

const QUEUE_KEY = "codetrail.syncQueue";

export async function getQueue(): Promise<PendingSyncItem[]> {
  const result = await storageGet<Record<typeof QUEUE_KEY, PendingSyncItem[]>>(QUEUE_KEY);
  return result[QUEUE_KEY] ?? [];
}

export async function enqueueSubmission(submission: AcceptedSubmission): Promise<PendingSyncItem> {
  const normalized = validateSubmission(submission);
  const id = createSubmissionKey(normalized);
  const queue = await getQueue();
  const existing = queue.find((item) => item.id === id);

  if (existing) {
    const updated: PendingSyncItem = {
      ...existing,
      submission: normalized,
      status: existing.status === "syncing" ? "syncing" : "pending",
      lastError: undefined
    };
    await saveQueue(queue.map((item) => (item.id === id ? updated : item)));
    return updated;
  }

  const item: PendingSyncItem = {
    id,
    submission: normalized,
    status: "pending",
    retryCount: 0,
    createdAt: toIsoDate()
  };
  await saveQueue([...queue, item]);
  return item;
}

export async function updateQueueItem(id: string, patch: Partial<PendingSyncItem>): Promise<void> {
  const queue = await getQueue();
  await saveQueue(queue.map((item) => (item.id === id ? { ...item, ...patch } : item)));
}

export async function removeQueueItem(id: string): Promise<void> {
  const queue = await getQueue();
  await saveQueue(queue.filter((item) => item.id !== id));
}

export async function getNextSyncItem(): Promise<PendingSyncItem | undefined> {
  const queue = await getQueue();
  return queue.find((item) => item.status === "pending" || item.status === "failed");
}

export async function retryFailedItems(): Promise<void> {
  const queue = await getQueue();
  await saveQueue(queue.map((item) => (item.status === "failed" ? { ...item, status: "pending" } : item)));
}

export async function saveQueue(queue: PendingSyncItem[]): Promise<void> {
  await storageSet({ [QUEUE_KEY]: queue });
}
