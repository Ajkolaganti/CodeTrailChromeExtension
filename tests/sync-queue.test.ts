import { describe, expect, it } from "vitest";
import { mockAcceptedSubmission } from "../src/storage/mock-submission";
import { enqueueSubmission, getQueue, retryFailedItems, updateQueueItem } from "../src/storage/sync-queue";

describe("local sync queue", () => {
  it("deduplicates by platform, slug, and language", async () => {
    await enqueueSubmission(mockAcceptedSubmission);
    await enqueueSubmission({ ...mockAcceptedSubmission, runtime: "1 ms" });
    const queue = await getQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0].submission.runtime).toBe("1 ms");
  });

  it("marks failed items ready for retry", async () => {
    const item = await enqueueSubmission(mockAcceptedSubmission);
    await updateQueueItem(item.id, { status: "failed", lastError: "rate limited" });
    await retryFailedItems();
    const queue = await getQueue();
    expect(queue[0].status).toBe("pending");
  });
});
