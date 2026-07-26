# `@lucid-softworks/queue-scheduler`

Promotes due scheduled jobs and reports the next scheduled timestamp.

```ts
import { QueueScheduler } from "@lucid-softworks/queue-scheduler";
import { QueueClient } from "@lucid-softworks/queue-client";
import { MemoryQueueStore } from "@lucid-softworks/queue-store-memory";

let now = 0;
const clock = { now: () => now, sleep: async () => undefined };
const store = new MemoryQueueStore();
const client = new QueueClient(store, { clock });
await client.enqueue("report", null, { availableAt: 10 });
const scheduler = new QueueScheduler(store, { clock });
now = 10;
await scheduler.promoteDue();
const next = await scheduler.nextScheduledAt();
```

Promotion order is deterministic by availability and creation time. A shared
injected clock makes scheduler polling fully deterministic in tests.
