import { WithTimestamp, SyncEvent } from "../models";

export const mergeEvents = (
    eventList1: WithTimestamp<SyncEvent>[],
    eventList2: WithTimestamp<SyncEvent>[]
): WithTimestamp<SyncEvent>[] => {
    const events: WithTimestamp<SyncEvent>[] = [];

    if (!eventList1) {
        return [...eventList2];
    }
    if (!eventList2) {
        return [...eventList1];
    }
    let index1 = 0,
        index2 = 0;
    while (index1 < eventList1.length && index2 < eventList2.length) {
        if (eventList1[index1].ts < eventList2[index2].ts) {
            events.push(eventList1[index1]);
            index1++;
        } else {
            events.push(eventList2[index2]);
            index2++;
        }
    }
    return events;
};
