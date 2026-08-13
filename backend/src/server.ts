import { createServer } from "node:http";
import { handleConfigRoute } from "./routes/configRoutes.js";

const port = Number(process.env.PORT ?? 8787);
const host = process.env.HOST ?? "127.0.0.1";
const server = createServer(async (request, response) => {
  if (await handleConfigRoute(request, response)) return;
  response.writeHead(404, { "content-type": "application/json; charset=utf-8" }); response.end(JSON.stringify({ error: "Not found" }));
});
server.listen(port, host, () => console.log(`West Lake config server: http://${host}:${port}`));
