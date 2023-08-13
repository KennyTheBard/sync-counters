import * as dotenv from "dotenv";
import { get } from "env-var";

dotenv.config();

export const appConfig: AppConfig = {
    port: get("PORT").required().asIntPositive(),
    pg: {
        host: get("PG_HOST").required().asString(),
        port: get("PG_PORT").asPortNumber(),
        database: get("PG_DATABASE").required().asString(),
        username: get("PG_USERNAME").required().asString(),
        password: get("PG_PASSWORD").required().asString(),
    },
    redis: {
        host: get("REDIS_HOST").required().asString(),
        port: get("REDIS_PORT").asPortNumber(),
    },
};

export type AppConfig = {
    port: number;
    pg: {
        host: string;
        port?: number;
        database: string;
        username: string;
        password: string;
    };
    redis: {
        host: string;
        port?: number;
    };
};
