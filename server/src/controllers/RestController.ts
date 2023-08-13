import express, { Router } from "express";

export class RestController {
    constructor() {}

    public setup = (app: Router) => {
        const router = express.Router();
        router.get("/", this.getCurrentState);

        app.use("/rest", router);
    };

    private getCurrentState = async (
        req: express.Request,
        res: express.Response
    ) => {};
}
