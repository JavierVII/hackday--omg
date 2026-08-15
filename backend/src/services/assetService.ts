import { createWriteStream } from "node:fs";
import { mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import type { Asset3D } from "@hackday/contracts";
import { AssetRepository } from "../repositories/assetRepository.js";
import { aholoMode, createReconstruction, retrieveWorld, uploadToAholo } from "./aholoService.js";

export type JobStage = "uploaded" | "analyzing" | "geometry" | "texture" | "optimizing" | "completed" | "failed";
export type ReconstructionJob = { id: string; assetId: string; stage: JobStage; progress: number; message: string; startedAt: string };
const repo = new AssetRepository(); const now = () => new Date().toISOString();
const failed = new Set(["FAILED", "CANCELED", "TIMEOUT", "REJECTED"]);
const mapStatus = (status?: string): Pick<ReconstructionJob, "stage" | "message"> => {
  if (status === "PENDING") return { stage: "uploaded", message: "等待重建" };
  if (status === "PREPROCESSING") return { stage: "analyzing", message: "素材预处理中" };
  if (status === "RUNNING") return { stage: "geometry", message: "AI 重建中" };
  if (status === "SUCCEEDED") return { stage: "completed", message: "重建完成，可以审核上线" };
  return { stage: "failed", message: `重建未成功：${status ?? "unknown"}` };
};
const requireAsset = async (id: string) => { const asset = await repo.get(id); if (!asset) throw new Error("找不到该 3D 资产"); return asset; };

export const assetService = {
  async list() { return (await repo.list()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); },
  get: requireAsset,
  async createAndUpload(input: { name: string; scenicSpotName: string; description: string; fileName: string; quality: "normal" | "high" }, stream: NodeJS.ReadableStream) {
    if (!/\.(mp4|mov)$/i.test(input.fileName)) throw new Error("仅支持 MP4 或 MOV 视频");
    const tempDir = join(tmpdir(), "hackday-aholo"); const tempPath = join(tempDir, `${crypto.randomUUID()}-${input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`);
    await mkdir(tempDir, { recursive: true });
    try {
      await pipeline(stream, createWriteStream(tempPath, { flags: "wx" }));
      const uploaded = await uploadToAholo(tempPath, input.fileName); const task = await createReconstruction(input.name, uploaded.url, input.quality); const time = now();
      return repo.save({ id: `asset-${crypto.randomUUID()}`, name: input.name, scenicAreaId: "hangzhou-west-lake", scenicSpotName: input.scenicSpotName, description: input.description, sourceVideo: { id: `video-${crypto.randomUUID()}`, type: "video", url: uploaded.url, name: input.fileName }, status: "reconstructing", reconstructionJobId: task.worldId, reconstructionProgress: 0, reconstructionStatus: "PENDING", reconstructionMessage: "等待重建", reconstructionProvider: aholoMode() === "api" ? "aholo3d" : "mock", viewCount: 0, createdAt: time, updatedAt: time });
    } finally { await rm(tempPath, { force: true }); }
  },
  async sync(id: string) {
    const asset = await requireAsset(id); if (!asset.reconstructionJobId) throw new Error("该资产没有 worldId");
    const detail = await retrieveWorld(asset.reconstructionJobId); const status = detail.status ?? "RUNNING"; const progress = Math.round(Math.max(0, Math.min(1, detail.progress ?? 0)) * 100); const mapped = mapStatus(status); const splats = detail.assets?.splats?.urls;
    const next: Asset3D = { ...asset, reconstructionStatus: status, reconstructionProgress: progress, reconstructionMessage: mapped.message, status: status === "SUCCEEDED" ? "pending_review" : failed.has(status) ? "failed" : "reconstructing", failureReason: failed.has(status) ? mapped.message : undefined, updatedAt: status === "SUCCEEDED" || failed.has(status) ? now() : asset.updatedAt };
    if (detail.cover) next.coverImage = { id: `cover-${id}`, type: "image", url: detail.cover, name: "aHolo cover" };
    if (splats?.spzPath || splats?.plyPath) { next.model = { id: `splat-${id}`, type: "model", url: splats.spzPath ?? splats.plyPath!, name: splats.spzPath ? `${asset.name}.spz` : `${asset.name}.ply`, format: splats.spzPath ? "spz" : "ply" }; next.splatOutputs = { plyUrl: splats.plyPath, spzUrl: splats.spzPath, lodMetaUrl: splats.lodMetaPath, upAxis: detail.assets?.semanticsMetadata?.upAxis }; }
    const saved = await repo.save(next); return { asset: saved, job: { id: asset.reconstructionJobId, assetId: id, progress, ...mapped, startedAt: asset.createdAt } satisfies ReconstructionJob };
  },
  async saveDraft(id: string, patch: Partial<Pick<Asset3D, "name" | "description" | "scenicSpotName">>) { return repo.save({ ...await requireAsset(id), ...patch, updatedAt: now() }); },
  async publish(id: string) { const asset = await requireAsset(id); if (asset.status !== "pending_review") throw new Error("只有待审核资产可以发布"); const time = now(); return repo.save({ ...asset, status: "published", reconstructionProgress: 100, publishedAt: time, updatedAt: time }); },
};
