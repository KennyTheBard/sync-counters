import { Client, Counter } from ".";

export type Event = ClientEvent | DataEvent;

export type BaseEvent = {
    clientUuid: string;
    type: string;
};

export type EventWithTimestamp = Event & { 
    emittedAt: number;
}

export type ClientEvent = BaseEvent & (ClientConnected | ClientDisconnected);

export type ClientConnected = {
    type: "connected";
    client: Client;
};

export type ClientDisconnected = {
    type: "disconnected";
    clientUuid: Client['uuid'];
};

export type DataEvent = BaseEvent &
    (
        | CreateCounterEvent
        | IncrementCounterEvent
        | DecrementCounterEvent
        | DeleteCounterEvent
    );

export type CreateCounterEvent = {
    type: "create";
    creationData: Omit<Counter, "value">;
};

export type IncrementCounterEvent = {
    type: "increment";
    counterUuid: Counter['uuid'];
};

export type DecrementCounterEvent = {
    type: "decrement";
    counterUuid: Counter['uuid'];
};

export type DeleteCounterEvent = {
    type: "delete";
    counterUuid: Counter['uuid'];
};
