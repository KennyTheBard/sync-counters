import {Redis} from 'ioredis';

const KEY_SEPARATOR = ':';

export type RedisOptions = {
    expirationSeconds: number;
};

export class RedisCache<T> {
    

    constructor(
        private readonly prefix: string,
        private readonly redis: Redis,
        private readonly options: RedisOptions
    ) {
    }

    public async get(uid: string): Promise<T | null> {
        const key = this.getKey(uid);
        const result = await this.redis.get(key);
        if (result === null) {
            return null;
        }
        return JSON.parse(result) as T;
    }

    public async set(uid: string, entry: T): Promise<void> {
        const key = this.getKey(uid);
        await this.redis.setex(
            key,
            this.options.expirationSeconds,
            JSON.stringify(entry)
        );
    }

    public async getMulti(uids: string[]): Promise<Record<string, T | null>> {
        const keys = uids.map(uid => this.getKey(uid));
        if (keys.length === 0) {
            return {};
        }
        const values = await this.redis.mget(keys);
        const result: Record<string, T | null> = {};
        for (const idx in uids) {
            const value = values[idx];
            const uid = uids[idx];
            if (value === null) {
                result[uid] = null;
            } else {
                result[uid] = JSON.parse(value) as T;
            }
        }
        return result;
    }

    public async setMulti(entries: Record<string, T>): Promise<void> {
        if (Object.keys(entries).length === 0) {
            return;
        }
        const entryMap: Record<string, string> = {};
        for (const uid of Object.keys(entries)) {
            const key = this.getKey(uid);
            entryMap[key] = JSON.stringify(entries[uid]);
        }
        await this.redis.mset(entryMap);

        // set expiration for each of them
        const pipeline = this.redis.pipeline();
        Object.keys(entryMap).forEach(key =>
            pipeline.expire(key, this.options.expirationSeconds)
        );
        await pipeline.exec();
    }

    public async findMulti(keySearchTerm: string): Promise<T[]> {
        const keys = await this.redis.keys(this.getKey(keySearchTerm));
        if (keys.length === 0) {
            return [];
        }
        const values = await this.redis.mget(keys);
        return values.filter((v: string | null): v is string => v !== null).map(v => JSON.parse(v) as T);
    }

    public async delete(uid: string): Promise<boolean> {
        const key = this.getKey(uid);
        const result = await this.redis.del(key);
        return result === 1;
    }

    public async deleteMulti(uids: string[]): Promise<number> {
        if (uids.length === 0) {
            return 0;
        }
        const keys = uids.map(uid => this.getKey(uid));
        return this.redis.del(keys);
    }

    public async searchKeys(searchTerm: string): Promise<string[]> {
        return this.redis.keys(this.getKey(searchTerm));
    }

    protected getKey(uid: string): string {
        return this.prefix + KEY_SEPARATOR + uid;
    }

    protected getOriginalUid(key: string): string {
        const parts = key.split(KEY_SEPARATOR);
        if (parts.length <= 1) {
            throw new Error(`Malformed cache key '${key}' in '${this.prefix}'`);
        }

        return parts.slice(1).join(KEY_SEPARATOR);
    }
}
