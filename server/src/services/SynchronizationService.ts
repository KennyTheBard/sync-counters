import {
    Counter,
    SyncEvent,
    SynchronizationState,
    WithTimestamp,
    applyEvents,
} from "common";
import { CounterModel } from "../model";
import { RedisCache } from "../cache";

export class SynchronizationService {
    constructor(
        private readonly counterCache: RedisCache<Counter>,
        private readonly eventsCache: RedisCache<WithTimestamp<SyncEvent>>
    ) {}

    public getState = async (): Promise<SynchronizationState> => {
        return {
            counters: await this.counterCache.findMulti("*"),
            events: await this.eventsCache.findMulti("*"),
        };
    };

    public registerEvent = async (
        event: SyncEvent
    ): Promise<WithTimestamp<SyncEvent>> => {
        const eventWithTimestamp = {
            ...event,
            ts: new Date().getTime(),
        };
        await this.eventsCache.set(eventWithTimestamp.uuid, eventWithTimestamp); // this could be done better
        return eventWithTimestamp;
    };

    public squashEvents = async (olderThanTs: number) => {
        const oldEvents: WithTimestamp<SyncEvent>[] = [],
            recentEvents: WithTimestamp<SyncEvent>[] = [];
        const events = await this.eventsCache.findMulti("*");
        for (const event of events) {
            if (event.ts < olderThanTs) {
                oldEvents.push(event);
            } else {
                recentEvents.push(event);
            }
        }
        const counters = await this.counterCache.findMulti("*");
        const newCounters = applyEvents(counters, oldEvents);

        await this.replaceInCache(this.counterCache, newCounters);
        await this.replaceInCache(this.eventsCache, recentEvents);
        await CounterModel.destroy({
            where: {},
        });
        await CounterModel.bulkCreate(newCounters);
    };

    private replaceInCache = async <T extends { uuid: string; }>(cache: RedisCache<T>, newValues: T[]) => {
        await cache.deleteMulti(
            await cache.searchKeys("*")
        );
        await cache.setMulti(
            newValues.reduce((acc, value) => {
                acc[value.uuid] = value;
                return acc;
            }, {} as Record<string, T>)
        );
    }
}
