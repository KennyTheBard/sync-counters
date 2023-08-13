import { Server } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

export class SocketController {
    public setup = (server: Server) => {
        const io = new SocketIOServer(server, {
            path: "/socket",
        });
        io.on("connection", (socket: Socket) => {
            this.onConnect(io)();

            socket.on("message", this.onMessage(io));

            socket.on("disconnect", this.onDisconnect(io));
        });
    };

    private onConnect = (io: SocketIOServer) => () => {
        // io.sockets.
    };

    private onMessage = (io: SocketIOServer) => (data: any) => {
        io.emit("message", data);
    };

    private onDisconnect = (io: SocketIOServer) => () => {};
}
