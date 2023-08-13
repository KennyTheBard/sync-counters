import { Server } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { SynchronizationService } from "../services";
import {
    SyncEvent,
} from "common";

export class SocketController {
    constructor(private readonly syncService: SynchronizationService) {}

    public setup = (server: Server) => {
        const io = new SocketIOServer(server, {
            path: "/socket.io", // it's default, but it's easier tp have it here
            cors: {
                origin: "*",
            },
        });
        io.on("connection", (socket: Socket) => {
            this.onConnect(io)();

            socket.on("message", this.onMessage(io));

            socket.on("disconnect", this.onDisconnect(io));
        });
    };

    private onConnect = (io: SocketIOServer) => () => {
        console.log("Client connected");
    };

    private onMessage = (io: SocketIOServer) => async (data: any) => {
        console.log(data);
        const event = await this.syncService.registerEvent(data as SyncEvent);
        io.emit("event", event);
    };

    private onDisconnect = (io: SocketIOServer) => () => {
        console.log("Client disconnected");
    };
}
