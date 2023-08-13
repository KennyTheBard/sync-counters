import { Client, Counter, Event, EventWithTimestamp } from "../models";

export class SynchronizationService {
    private counters: Counter[] = [];
    private clients: Client[] = [];
    private events: EventWithTimestamp[] = [];

    public getState = (): SynchronizationState => {
        return {
            counters: this.counters,
            clients: this.clients,
            events: this.events,
        };
    };

    public pushEvent = (event: Event): void => {
        this.events.push({
            ...event,
            emittedAt: new Date().getTime(),
        });
    };

    public getEvents = (): (Event & {
        clients: Client["uuid"];
    })[] => {
        return [];
    };

    public squashEvents = (olderThanTs: number) => {
        const eventsToSquash = this.events.filter(
            (event) => event.emittedAt < olderThanTs
        );
        for (const event of eventsToSquash) {
            switch (event.type) {
                case "connected":
                    this.clients.push(event.client);
                    break;

                case "disconnected":
                    const clientIndexToDelete = this.clients.findIndex(
                        (client) => client.uuid === event.clientUuid
                    );
                    if (clientIndexToDelete < 0) {
                        console.error(
                            `Client ${event.clientUuid} doesn't exists`
                        );
                        break;
                    }
                    this.clients.splice(clientIndexToDelete, 1);
                    break;

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
                    this.counters.splice(
                        this.counters.findIndex(
                            (counter) => counter.uuid === event.counterUuid
                        ),
                        1
                    );
                    break;
            }
        }
    };
}

export type SynchronizationState = {
    counters: Counter[];
    clients: Client[];
    events: EventWithTimestamp[];
};
