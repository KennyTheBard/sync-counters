import express from "express";
import http from "http";
import cors from "cors";
import { appConfig } from "./config";
import { RestController, SocketController } from "./controllers";
import { SynchronizationService } from "./services";

const bootstrap = async () => {
    // init services
    const syncService = new SynchronizationService();

    // init server
    const app = express();
    app.use(cors());
    const server = http.createServer(app);

    // init controllers
    const restController = new RestController(syncService);
    const socketController = new SocketController(syncService);

    // register routes
    restController.setup(app);
    socketController.setup(server);

    // start event squash cron
    setInterval(() => {
        syncService.squashEvents(new Date().getTime() - 30 * 1000)
    }, 30 * 1000); // TODO: configure interval from AppConfig

    // start server
    server.listen(appConfig.port, () => {
        console.log(`Server is listening on port ${appConfig.port}`);
    });
};
bootstrap();
