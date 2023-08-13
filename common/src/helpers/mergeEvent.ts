import { WithTimestamp, SyncEvent } from "../models";

export const mergeEvents = (
    serverEvents: WithTimestamp<SyncEvent>[],
    clientEvents: WithTimestamp<SyncEvent>[]
): WithTimestamp<SyncEvent>[] => {
    const events: WithTimestamp<SyncEvent>[] = [...serverEvents];

    for (const event of clientEvents) {
        // ignore client events that have already been broadcasted by the server
        if (
            events.find((existingEvents) => existingEvents.uuid === event.uuid)
        ) {
            continue;
        }

        events.push(event);
    }
    return events.sort((e1, e2) => e1.ts - e2.ts);
};
