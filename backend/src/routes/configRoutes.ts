import type { IncomingMessage, ServerResponse } from "node:http";
import { ConfigService } from "../services/configService.js";

const service = new ConfigService();
const send = (response: ServerResponse, status: number, body: unknown) => { response.writeHead(status, { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*", "access-control-allow-methods": "GET,PATCH,POST,OPTIONS", "access-control-allow-headers": "content-type" }); response.end(JSON.stringify(body)); };
const readBody = async (request: IncomingMessage) => { const chunks: Buffer[] = []; for await (const chunk of request) chunks.push(Buffer.from(chunk)); return chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown> : {}; };

export async function handleConfigRoute(request: IncomingMessage, response: ServerResponse): Promise<boolean> {
  const method = request.method ?? "GET"; const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
  if (method === "OPTIONS") { send(response, 204, null); return true; }
  try {
    if (method === "GET" && pathname === "/api/health") { send(response, 200, { status: "ok", service: "west-lake-demo-config" }); return true; }
    if (method === "GET" && pathname === "/api/client/config") { send(response, 200, await service.getClientConfig()); return true; }
    if (method === "GET" && pathname === "/api/admin/config") { send(response, 200, await service.getAdminConfig()); return true; }
    if (method === "PATCH" && pathname === "/api/admin/draft/theme") {
      const body = await readBody(request); if (typeof body.activeThemeId !== "string") throw new Error("activeThemeId 必须是字符串");
      send(response, 200, await service.updateTheme(body.activeThemeId)); return true;
    }
    const interactionMatch = pathname.match(/^\/api\/admin\/draft\/interactions\/([^/]+)$/);
    if (method === "PATCH" && interactionMatch) {
      const body = await readBody(request); if (typeof body.enabled !== "boolean") throw new Error("enabled 必须是布尔值");
      send(response, 200, await service.updateInteraction(decodeURIComponent(interactionMatch[1]), body.enabled)); return true;
    }
    if (method === "POST" && pathname === "/api/admin/publish") { send(response, 200, await service.publish()); return true; }
    return false;
  } catch (error) { send(response, 400, { error: error instanceof Error ? error.message : "请求失败" }); return true; }
}
