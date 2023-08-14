import express, { Router } from "express";
import { SynchronizationService } from "../services";
import { applyEvents } from "common";

export class RestController {
    constructor(
        private readonly syncService: SynchronizationService
    ) {}

    public setup = (app: Router) => {
        const router = express.Router();
        router.get("/", this.getCurrentState);
        router.get("/download", this.download);

        app.use("/rest", router);
    };

    private getCurrentState = async (
        req: express.Request,
        res: express.Response
    ) => {
        const state = await this.syncService.getState();
        res.status(200).json(state);
    };

    private download = async (
        req: express.Request,
        res: express.Response
    ) => {
        const state = await this.syncService.getState();
        const results = applyEvents(state.counters, state.events);
        res.status(200).json(results);
    };
}
