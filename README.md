# `@lucid-softworks/queue-scheduler`

Promotes due scheduled jobs and reports the next scheduled timestamp.

```ts
import { QueueScheduler } from "@lucid-softworks/queue-scheduler";

const scheduler = new QueueScheduler(store, { clock });
await scheduler.promoteDue();
const next = await scheduler.nextScheduledAt();
```

Promotion order is deterministic by availability and creation time. A shared
injected clock makes scheduler polling fully deterministic in tests.
