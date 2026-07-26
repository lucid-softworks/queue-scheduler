import {
  systemQueueClock,
  type QueueClock,
  type QueueJob,
  type QueueStore,
} from "@lucid-softworks/queue-core";

export class QueueScheduler {
  readonly #clock: QueueClock;

  constructor(
    readonly store: QueueStore,
    options: Readonly<{ clock?: QueueClock }> = {},
  ) {
    this.#clock = options.clock ?? systemQueueClock;
  }

  async promoteDue(): Promise<QueueJob[]> {
    const now = this.#clock.now();
    const jobs = await this.store.list();
    const due = jobs.filter(
      (job) => job.state === "scheduled" && job.availableAt <= now,
    );
    // Promotion order is stable and the store list is not mutated.
    due.sort(
      (left, right) =>
        left.availableAt - right.availableAt ||
        left.createdAt - right.createdAt,
    );
    const promoted: QueueJob[] = [];
    for (const job of due) {
      const next: QueueJob = { ...job, state: "waiting", updatedAt: now };
      // Promotion order is deterministic and observable by stores.
      // eslint-disable-next-line no-await-in-loop
      await this.store.save(next);
      promoted.push(next);
    }
    return promoted;
  }

  async nextScheduledAt(): Promise<number | undefined> {
    const times = (await this.store.list())
      .filter((job) => job.state === "scheduled")
      .map((job) => job.availableAt);
    return times.length === 0 ? undefined : Math.min(...times);
  }
}
