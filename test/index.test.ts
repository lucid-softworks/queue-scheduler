import { QueueClient } from "@lucid-softworks/queue-client";
import { MemoryQueueStore } from "@lucid-softworks/queue-store-memory";
import { describe, expect, it } from "vitest";

import { QueueScheduler } from "../src/index.js";

describe("QueueScheduler", () => {
  it("promotes due jobs in schedule order and reports the next deadline", async () => {
    let now = 0;
    const clock = { now: () => now, sleep: async () => undefined };
    const store = new MemoryQueueStore();
    const client = new QueueClient(store, { clock, idFactory: (name) => name });
    await client.enqueue("late", null, { availableAt: 30 });
    await client.enqueue("second", null, { availableAt: 10 });
    await client.enqueue("first", null, { availableAt: 5 });
    await client.enqueue("tie", null, { availableAt: 5 });
    const scheduler = new QueueScheduler(store, { clock });
    now = 10;
    expect((await scheduler.promoteDue()).map(({ id }) => id)).toEqual([
      "first",
      "tie",
      "second",
    ]);
    expect(await scheduler.nextScheduledAt()).toBe(30);
    now = 30;
    expect(await scheduler.promoteDue()).toHaveLength(1);
    expect(await scheduler.nextScheduledAt()).toBeUndefined();
    expect(await scheduler.promoteDue()).toEqual([]);
    expect(
      await new QueueScheduler(new MemoryQueueStore()).nextScheduledAt(),
    ).toBeUndefined();
  });
});
