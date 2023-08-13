import {
    Counter,
    SyncEvent,
    SynchronizationState,
    WithTimestamp,
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
        const eventsToSquash = this.events.filter(
            (event) => event.ts < olderThanTs
        );
        for (const event of eventsToSquash) {
            switch (event.type) {
                case "create":
                    this.counters.push({
                        ...event.creationData,
                        value: 0,
                    });
                    break;

                case "increment":
                    const counterToIncrement = this.counters.find(
                        (counter) => counter.uuid === event.counterUuid
                    );
                    if (!counterToIncrement) {
                        console.error(
                            `Counter ${event.counterUuid} doesn't exists`
                        );
                        break;
                    }
                    counterToIncrement.value += 1;
                    break;

                case "decrement":
                    const counterToDecrement = this.counters.find(
                        (counter) => counter.uuid === event.counterUuid
                    );
                    if (!counterToDecrement) {
                        console.error(
                            `Counter ${event.counterUuid} doesn't exists`
                        );
                        break;
                    }
                    counterToDecrement.value -= 1;
                    break;

                case "delete":
                    const counterIndexToDelete = this.counters.findIndex(
                        (counter) => counter.uuid === event.counterUuid
                    );
                    if (counterIndexToDelete < 0) {
                        console.error(
                            `Counter ${event.counterUuid} doesn't exists`
                        );
                        break;
                    }
                    this.counters.splice(counterIndexToDelete, 1);
                    break;
            }
        }
    };
}
