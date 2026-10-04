// Minimal stand-in for Neon's WebSocket proxy: @vercel/postgres (the Neon
// serverless driver) speaks the Postgres wire protocol over a WebSocket, so
// every connection is piped straight to the local Postgres TCP port.
import net from "node:net";
import { WebSocketServer } from "ws";

const wsPort = Number(process.env.WS_PROXY_PORT ?? 54330);
const pgPort = Number(process.env.PG_PORT ?? 54322);

const wss = new WebSocketServer({ host: "127.0.0.1", port: wsPort });

wss.on("connection", (ws) => {
  const pg = net.connect(pgPort, "127.0.0.1");

  ws.on("message", (data) => pg.write(data));
  pg.on("data", (data) => ws.send(data));

  ws.on("close", () => pg.end());
  pg.on("close", () => ws.close());
  ws.on("error", () => pg.destroy());
  pg.on("error", () => ws.close());
});

console.log(
  `[ws-proxy] ws://127.0.0.1:${wsPort} -> postgres 127.0.0.1:${pgPort}`,
);
