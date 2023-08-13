import { WithTimestamp } from "./WithTimestamp";
import { Counter } from "./counter";
import { SyncEvent } from "./events";

export type SynchronizationState = {
    counters: Counter[];
    events: WithTimestamp<SyncEvent>[];
};
