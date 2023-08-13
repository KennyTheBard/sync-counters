import {
    Counter,
    SyncEvent,
    SynchronizationState,
    WithTimestamp,
    applyEvents,
} from "common";

export class SynchronizationService {
    private counters: Counter[] = [];
    private events: WithTimestamp<SyncEvent>[] = [];

    public getState = (): SynchronizationState => {
        return {
            counters: this.counters,
            events: this.events,
        };
    };

    public registerEvent = (event: SyncEvent): WithTimestamp<SyncEvent> => {
        const eventWithTimestamp = {
            ...event,
            ts: new Date().getTime(),
        };
        this.events.push(eventWithTimestamp);
        return eventWithTimestamp;
    };

    public squashEvents = (olderThanTs: number) => {
        const oldEvents: WithTimestamp<SyncEvent>[] = [],
            recentEvents: WithTimestamp<SyncEvent>[] = [];
        for (const event of this.events) {
            if (event.ts < olderThanTs) {
                oldEvents.push(event);
            } else {
                recentEvents.push(event);
            }
        }
        this.counters = applyEvents(this.counters, oldEvents);
        this.events = recentEvents;
    };
}
