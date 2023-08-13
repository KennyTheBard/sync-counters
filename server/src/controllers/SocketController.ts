import { Server } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { SynchronizationService } from "../services";
import { SyncEvent, ClientConnected, ClientDisconnected } from "common";
import { randomUUID } from "crypto";

export class SocketController {
    constructor(private readonly syncService: SynchronizationService) {}

    public setup = (server: Server) => {
        const io = new SocketIOServer(server, {
            path: "/socket.io",
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
        this.syncService.pushEvent({
            type: "connected",
            emittedAt: new Date().getTime(),
            clientUuid: randomUUID(),
        } as ClientConnected);
    };

    private onMessage = (io: SocketIOServer) => (data: any) => {
        console.log(data);
        this.syncService.pushEvent(data as SyncEvent);
    };

    private onDisconnect = (io: SocketIOServer) => () => {
        console.log("Client disconnected");
        this.syncService.pushEvent({
            type: "disconnected",
            emittedAt: new Date().getTime(),
            clientUuid: randomUUID(),
        } as ClientDisconnected);
    };
}
