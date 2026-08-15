import { createAssetClient } from "@manycore/aholo-sdk-asset";
import { createWorldClient, type WorldDetail } from "@manycore/aholo-sdk-world";

export type AholoMode = "api" | "mock";
export const aholoMode = (): AholoMode => process.env.AHOLO_MODE === "mock" ? "mock" : "api";
const clients = () => {
  if (!process.env.AHOLO_API_KEY) throw new Error("AHOLO_API_KEY is required when AHOLO_MODE=api");
  return { asset: createAssetClient({ region: "cn", apiKey: process.env.AHOLO_API_KEY }), world: createWorldClient({ region: "cn", apiKey: process.env.AHOLO_API_KEY }) };
};
export async function uploadToAholo(filePath: string, fileName: string) {
  if (aholoMode() === "mock") return { url: `mock://uploads/${encodeURIComponent(fileName)}`, md5: "mock" };
  return clients().asset.uploadFile(filePath, { filename: fileName });
}
export async function createReconstruction(name: string, sourceUrl: string, quality: "normal" | "high") {
  if (aholoMode() === "mock") return { worldId: `mock-world-${Date.now()}-${crypto.randomUUID()}` };
  return clients().world.reconstructions.create({ name, resources: [{ url: sourceUrl, type: "video" }], taskQuality: quality, scene: "space", useMask: false });
}
export async function retrieveWorld(worldId: string): Promise<Partial<WorldDetail>> {
  if (aholoMode() === "mock") {
    const createdAt = Number(worldId.match(/^mock-world-(\d+)-/)?.[1]) || Date.now();
    const elapsed = Date.now() - createdAt;
    if (elapsed < 2_000) return { worldId, status: "PENDING", progress: 0 };
    if (elapsed < 5_000) return { worldId, status: "PREPROCESSING", progress: 0.15 };
    if (elapsed < 10_000) return { worldId, status: "RUNNING", progress: 0.65 };
    return { worldId, status: "SUCCEEDED", progress: 1, cover: "https://placehold.co/1200x675/16352b/f3d985?text=aHolo+3DGS+Mock", assets: { splats: { urls: { plyPath: `https://example.com/aholo/${worldId}.ply`, spzPath: `https://example.com/aholo/${worldId}.spz`, lodMetaPath: `https://example.com/aholo/${worldId}.lod.json` } }, semanticsMetadata: { upAxis: "Z" } } };
  }
  return clients().world.retrieve(worldId);
}
