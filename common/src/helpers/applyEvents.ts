import cloneDeep from "lodash.clonedeep";
import { Counter, SyncEvent, WithTimestamp } from "../models";

export const applyEvents = (
    counter: Counter[],
    events: WithTimestamp<SyncEvent>[]
): Counter[] => {
    const result = cloneDeep(counter);
    for (const event of events) {
        switch (event.type) {
            case "create":
                if (
                    result.find(
                        (counter) => counter.uuid === event.creationData.uuid
                    )
                ) {
                    console.error(
                        `Counter ${event.creationData.uuid} already exists`
                    );
                    break;
                }
                result.push({
                    ...event.creationData,
                    value: 0,
                });
                break;

            case "increment":
                const counterToIncrement = result.find(
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
                const counterToDecrement = result.find(
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
                const counterIndexToDelete = result.findIndex(
                    (counter) => counter.uuid === event.counterUuid
                );
                if (counterIndexToDelete < 0) {
                    console.error(
                        `Counter ${event.counterUuid} doesn't exists`
                    );
                    break;
                }
                result.splice(counterIndexToDelete, 1);
                break;
        }
    }
    return result.sort((c1, c2) => c1.createdAt - c2.createdAt);
};
