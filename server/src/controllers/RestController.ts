import express, { Router } from "express";
import { SynchronizationService } from "../services";

export class RestController {
    constructor(
        private readonly syncService: SynchronizationService
    ) {}

    public setup = (app: Router) => {
        const router = express.Router();
        router.get("/", this.getCurrentState);

        app.use("/rest", router);
    };

    private getCurrentState = async (
        req: express.Request,
        res: express.Response
    ) => {
        const state = await this.syncService.getState();
        res.status(200).json(state);
    };
}
