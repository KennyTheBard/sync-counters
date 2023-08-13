import { Client, Counter } from ".";

export type SyncEvent = {
    clientUuid: string;
    type: string;
} & (ClientEvent | DataEvent);

export type EventWithTimestamp = SyncEvent & {
    emittedAt: number;
};

export type ClientEvent = ClientConnected | ClientDisconnected;

export type ClientConnected = {
    type: "connected";
    clientUuid: Client["uuid"];
};

export type ClientDisconnected = {
    type: "disconnected";
    clientUuid: Client["uuid"];
};

export type DataEvent =
    | CreateCounterEvent
    | IncrementCounterEvent
    | DecrementCounterEvent
    | DeleteCounterEvent;

export type CreateCounterEvent = {
    type: "create";
    creationData: Omit<Counter, "value">;
};

export type IncrementCounterEvent = {
    type: "increment";
    counterUuid: Counter["uuid"];
};

export type DecrementCounterEvent = {
    type: "decrement";
    counterUuid: Counter["uuid"];
};

export type DeleteCounterEvent = {
    type: "delete";
    counterUuid: Counter["uuid"];
};
