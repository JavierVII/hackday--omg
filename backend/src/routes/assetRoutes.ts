import type { IncomingMessage, ServerResponse } from "node:http";
import { assetService } from "../services/assetService.js";

const send = (res: ServerResponse, code: number, value: unknown) => { res.writeHead(code, { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*", "access-control-allow-methods": "GET,POST,PATCH,OPTIONS", "access-control-allow-headers": "content-type,x-asset-name,x-scenic-spot,x-description,x-file-name,x-task-quality" }); res.end(JSON.stringify(value)); };
const readBody = async (req: IncomingMessage) => { const chunks: Buffer[] = []; for await (const chunk of req) chunks.push(Buffer.from(chunk)); return chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown> : {}; };
const header = (req: IncomingMessage, name: string) => {
  const value = req.headers[name];
  if (typeof value !== "string") return undefined;
  try { return decodeURIComponent(value); } catch { throw new Error(`无效的 ${name} 请求头编码`); }
};
export async function handleAssetRoute(req: IncomingMessage, res: ServerResponse) {
  const path = new URL(req.url ?? "/", "http://localhost").pathname; const method = req.method ?? "GET";
  if (method === "OPTIONS") { send(res, 204, null); return true; }
  try {
    if (method === "GET" && path === "/api/admin/assets") { send(res, 200, await assetService.list()); return true; }
    if (method === "POST" && path === "/api/admin/assets/upload") { const name = header(req, "x-asset-name"); const scenicSpotName = header(req, "x-scenic-spot"); const fileName = header(req, "x-file-name"); if (!name || !scenicSpotName || !fileName) throw new Error("缺少资产上传信息"); send(res, 201, await assetService.createAndUpload({ name, scenicSpotName, description: header(req, "x-description") ?? "", fileName, quality: header(req, "x-task-quality") === "high" ? "high" : "normal" }, req)); return true; }
    const asset = path.match(/^\/api\/admin\/assets\/([^/]+)$/); const reconstruction = path.match(/^\/api\/admin\/assets\/([^/]+)\/reconstruction$/); const publish = path.match(/^\/api\/admin\/assets\/([^/]+)\/publish$/);
    if (method === "GET" && reconstruction) { send(res, 200, await assetService.sync(decodeURIComponent(reconstruction[1]))); return true; }
    if (method === "GET" && asset) { send(res, 200, await assetService.get(decodeURIComponent(asset[1]))); return true; }
    if (method === "PATCH" && asset) { send(res, 200, await assetService.saveDraft(decodeURIComponent(asset[1]), await readBody(req))); return true; }
    if (method === "POST" && publish) { send(res, 200, await assetService.publish(decodeURIComponent(publish[1]))); return true; }
    return false;
  } catch (error) { send(res, 400, { error: error instanceof Error ? error.message : "资产请求失败" }); return true; }
}
