import express, { Request, Response } from "express";
import http from "http";
import cors from "cors";
import { appConfig } from "./config";
import { RestController, SocketController } from "./controllers";
import { SynchronizationService } from "./services";
import { RedisCache } from "./cache";
import { Counter, SyncEvent, WithTimestamp } from "common";
import Redis from "ioredis";
import { CounterModel } from "./model";
import path from "path";

const bootstrap = async () => {
    // init caches
    const redisConnection = new Redis(appConfig.redis);
    const counterCache = new RedisCache<Counter>("counter", redisConnection, {
        expirationSeconds: 10 * 60,
    });
    const eventsCache = new RedisCache<WithTimestamp<SyncEvent>>(
        "events",
        redisConnection,
        {
            expirationSeconds: 10 * 60,
        }
    );

    // load counters from database
    const counters = await CounterModel.findAll();
    await counterCache.setMulti(
        counters.reduce((acc, counter) => {
            acc[counter.uuid] = counter.toDto();
            return acc;
        }, {} as Record<string, Counter>)
    );

    // init services
    const syncService = new SynchronizationService(counterCache, eventsCache);

    // init server
    const app = express();
    app.use(cors());
    const clientPath = path.join(
        __dirname,
        "..",
        "..",
        "..",
        "client",
        "build"
    );
    app.use(express.static(clientPath));
    const server = http.createServer(app);

    // init controllers
    const restController = new RestController(syncService);
    const socketController = new SocketController(syncService);

    // register routes
    restController.setup(app);
    socketController.setup(server);
    app.get("*", (req: Request, res: Response) => {
        res.sendFile(path.join(clientPath, "index.html"));
    });

    // start event squash cron
    setInterval(() => {
        syncService.squashEvents(new Date().getTime() - 30 * 1000);
    }, 30 * 1000); // TODO: configure interval from AppConfig

    // start server
    server.listen(appConfig.port, () => {
        console.log(`Server is listening on port ${appConfig.port}`);
    });
};
bootstrap();
