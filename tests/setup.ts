import { afterEach, vi } from "vitest";
import { storageClear } from "../src/storage/chrome-storage";

afterEach(async () => {
  await storageClear();
  vi.restoreAllMocks();
});
