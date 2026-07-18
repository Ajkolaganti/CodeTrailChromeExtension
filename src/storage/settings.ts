import type { AuthState, CodeTrailSettings, RuntimeSnapshot, SyncStatus, SyncedSolution } from "../types";
import { storageGet, storageRemove, storageSet } from "./chrome-storage";
import { getQueue } from "./sync-queue";

const SETTINGS_KEY = "codetrail.settings";
const AUTH_KEY = "codetrail.auth";
const STATUS_KEY = "codetrail.status";
const LAST_ERROR_KEY = "codetrail.lastError";
const SYNCED_KEY = "codetrail.synced";

export const defaultSettings: CodeTrailSettings = {
  autoSync: true,
  acceptedOnly: true,
  duplicateBehavior: "update",
  includePerformanceStats: true,
  desktopNotifications: true,
  defaultBranch: "main",
  theme: "system"
};

export async function getSettings(): Promise<CodeTrailSettings> {
  const result = await storageGet<Record<typeof SETTINGS_KEY, CodeTrailSettings>>(SETTINGS_KEY);
  return { ...defaultSettings, ...(result[SETTINGS_KEY] ?? {}) };
}

export async function saveSettings(settings: Partial<CodeTrailSettings>): Promise<CodeTrailSettings> {
  const next = { ...(await getSettings()), ...settings };
  await storageSet({ [SETTINGS_KEY]: next });
  return next;
}

export async function getAuthState(): Promise<AuthState | undefined> {
  const result = await storageGet<Record<typeof AUTH_KEY, AuthState>>(AUTH_KEY);
  return result[AUTH_KEY];
}

export async function saveAuthState(auth: AuthState): Promise<void> {
  await storageSet({ [AUTH_KEY]: auth });
}

export async function clearAuthState(): Promise<void> {
  await storageRemove(AUTH_KEY);
}

export async function getSyncStatus(): Promise<SyncStatus> {
  const result = await storageGet<Record<typeof STATUS_KEY, SyncStatus>>(STATUS_KEY);
  return result[STATUS_KEY] ?? "waiting";
}

export async function setSyncStatus(status: SyncStatus, lastError?: string): Promise<void> {
  await storageSet({ [STATUS_KEY]: status, [LAST_ERROR_KEY]: lastError });
}

export async function getLastError(): Promise<string | undefined> {
  const result = await storageGet<Record<typeof LAST_ERROR_KEY, string | undefined>>(LAST_ERROR_KEY);
  return result[LAST_ERROR_KEY];
}

export async function getSyncedSolutions(): Promise<SyncedSolution[]> {
  const result = await storageGet<Record<typeof SYNCED_KEY, SyncedSolution[]>>(SYNCED_KEY);
  return result[SYNCED_KEY] ?? [];
}

export async function saveSyncedSolution(solution: SyncedSolution): Promise<void> {
  const existing = await getSyncedSolutions();
  const withoutDuplicate = existing.filter((item) => item.key !== solution.key);
  await storageSet({ [SYNCED_KEY]: [solution, ...withoutDuplicate] });
}

export async function clearLocalState(): Promise<void> {
  await storageRemove([SETTINGS_KEY, STATUS_KEY, LAST_ERROR_KEY, SYNCED_KEY]);
}

export async function getRuntimeSnapshot(): Promise<RuntimeSnapshot> {
  const [settings, auth, queue, synced, status, lastError] = await Promise.all([
    getSettings(),
    getAuthState(),
    getQueue(),
    getSyncedSolutions(),
    getSyncStatus(),
    getLastError()
  ]);

  return { settings, auth, queue, synced, status, lastError };
}
