import { Counter } from ".";

export type BaseEvent = {
    uuid: string;
    type: string;
};

export type SyncEvent =
    | CreateCounterEvent
    | IncrementCounterEvent
    | DecrementCounterEvent
    | DeleteCounterEvent;

export type CreateCounterEvent = BaseEvent & {
    type: "create";
    creationData: Omit<Counter, "value">;
};

export type IncrementCounterEvent = BaseEvent & {
    type: "increment";
    counterUuid: Counter["uuid"];
};

export type DecrementCounterEvent = BaseEvent & {
    type: "decrement";
    counterUuid: Counter["uuid"];
};

export type DeleteCounterEvent = BaseEvent & {
    type: "delete";
    counterUuid: Counter["uuid"];
};
