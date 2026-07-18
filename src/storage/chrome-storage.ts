type StoredValue = Record<string, unknown>;

const memoryStore = new Map<string, unknown>();

function hasChromeStorage(): boolean {
  return typeof chrome !== "undefined" && Boolean(chrome.storage?.local);
}

export async function storageGet<T extends StoredValue>(keys: string[] | string): Promise<Partial<T>> {
  if (hasChromeStorage()) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(keys, (items) => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(new Error(error.message));
          return;
        }
        resolve(items as Partial<T>);
      });
    });
  }

  const result: StoredValue = {};
  const requested = Array.isArray(keys) ? keys : [keys];
  for (const key of requested) {
    result[key] = memoryStore.get(key);
  }
  return result as Partial<T>;
}

export async function storageSet(values: StoredValue): Promise<void> {
  if (hasChromeStorage()) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(values, () => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(new Error(error.message));
          return;
        }
        resolve();
      });
    });
  }

  for (const [key, value] of Object.entries(values)) {
    memoryStore.set(key, value);
  }
}

export async function storageRemove(keys: string[] | string): Promise<void> {
  if (hasChromeStorage()) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(keys, () => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(new Error(error.message));
          return;
        }
        resolve();
      });
    });
  }

  for (const key of Array.isArray(keys) ? keys : [keys]) {
    memoryStore.delete(key);
  }
}

export async function storageClear(): Promise<void> {
  if (hasChromeStorage()) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.clear(() => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(new Error(error.message));
          return;
        }
        resolve();
      });
    });
  }

  memoryStore.clear();
}
