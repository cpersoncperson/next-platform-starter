import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { PongRoom } from "./rooms/PongRoom";

const port = Number(process.env.PORT) || 2567;

const gameServer = new Server({
  transport: new WebSocketTransport({
    server: undefined, // will create a new server instance
    pingInterval: 5000,
    pingMaxRetries: 3,
  }),
});

gameServer.define("pong", PongRoom);

gameServer.listen(port).then(() => {
  console.log(`🎮 Game Server running on ws://localhost:${port}`);
});
