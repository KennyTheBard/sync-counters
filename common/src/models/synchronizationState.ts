import { Client } from "./client";
import { Counter } from "./counter";
import { EventWithTimestamp } from "./events";

export type SynchronizationState = {
    counters: Counter[];
    clients: Client[];
    events: EventWithTimestamp[];
};
