import type { IncomingMessage, ServerResponse } from "node:http";
import { ConfigService } from "../services/configService.js";
import type { InteractionPoint, MiniGame, Theme } from "@hackday/contracts";

const service = new ConfigService();
const send = (response: ServerResponse, status: number, body: unknown) => { response.writeHead(status, { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*", "access-control-allow-methods": "GET,PATCH,POST,DELETE,OPTIONS", "access-control-allow-headers": "content-type,x-asset-name,x-scenic-spot,x-description,x-file-name,x-task-quality" }); response.end(JSON.stringify(body)); };
const readBody = async (request: IncomingMessage) => { const chunks: Buffer[] = []; for await (const chunk of request) chunks.push(Buffer.from(chunk)); return chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown> : {}; };

export async function handleConfigRoute(request: IncomingMessage, response: ServerResponse): Promise<boolean> {
  const method = request.method ?? "GET"; const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
  if (method === "OPTIONS") { send(response, 204, null); return true; }
  try {
    if (method === "GET" && pathname === "/api/health") { send(response, 200, { status: "ok", service: "west-lake-demo-config" }); return true; }
    if (method === "GET" && pathname === "/api/client/config") { send(response, 200, await service.getClientConfig()); return true; }
    if (method === "GET" && pathname === "/api/admin/config") { send(response, 200, await service.getAdminConfig()); return true; }
    if (method === "PATCH" && pathname === "/api/admin/draft/theme") {
      const body = await readBody(request);
      if (typeof body.activeThemeId !== "string") throw new Error("activeThemeId 必须是字符串");
      if (body.availableThemeIds !== undefined && (!Array.isArray(body.availableThemeIds) || body.availableThemeIds.some((id) => typeof id !== "string"))) throw new Error("availableThemeIds 必须是字符串数组");
      send(response, 200, await service.updateTheme(body.activeThemeId, body.availableThemeIds as string[] | undefined)); return true;
    }
    if (method === "POST" && pathname === "/api/admin/draft/themes") {
      const body = await readBody(request);
      if (!body.theme || typeof body.theme !== "object") throw new Error("主题数据不能为空");
      send(response, 200, await service.createTheme(body.theme as Theme, body.allowVisitorSelection === true)); return true;
    }
    const themeMatch = pathname.match(/^\/api\/admin\/draft\/themes\/([^/]+)$/);
    if (method === "PATCH" && themeMatch) {
      const body = await readBody(request); if (!body.theme || typeof body.theme !== "object") throw new Error("主题数据不能为空");
      send(response, 200, await service.updateThemeDefinition(decodeURIComponent(themeMatch[1]), body.theme as Theme, body.allowVisitorSelection === true)); return true;
    }
    if (method === "DELETE" && themeMatch) { send(response, 200, await service.deleteTheme(decodeURIComponent(themeMatch[1]))); return true; }
    const interactionMatch = pathname.match(/^\/api\/admin\/draft\/interactions\/([^/]+)$/);
    if (method === "PATCH" && interactionMatch) {
      const body = await readBody(request); if (typeof body.enabled !== "boolean") throw new Error("enabled 必须是布尔值");
      send(response, 200, await service.updateInteraction(decodeURIComponent(interactionMatch[1]), body.enabled)); return true;
    }
    const interactionDefinitionMatch = pathname.match(/^\/api\/admin\/draft\/interactions\/([^/]+)\/definition$/);
    if (method === "PATCH" && interactionDefinitionMatch) {
      const body = await readBody(request); send(response, 200, await service.updateInteractionDefinition(decodeURIComponent(interactionDefinitionMatch[1]), body as Partial<InteractionPoint>)); return true;
    }
    const gameMatch = pathname.match(/^\/api\/admin\/draft\/games\/([^/]+)$/);
    if (method === "PATCH" && gameMatch) {
      const body = await readBody(request); send(response, 200, await service.updateMiniGame(decodeURIComponent(gameMatch[1]), body as Partial<MiniGame>)); return true;
    }
    if (method === "POST" && pathname === "/api/admin/publish") { send(response, 200, await service.publish()); return true; }
    return false;
  } catch (error) { send(response, 400, { error: error instanceof Error ? error.message : "请求失败" }); return true; }
}
