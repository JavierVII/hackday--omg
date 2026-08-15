import type { Asset3D } from "@hackday/contracts";
import { mockAHoloService } from "../aholo";
import type { ReconstructionJob } from "../aholo";
import { repositories } from "../repositories";

export interface CreateAssetInput { name: string; scenicSpotName: string; description: string; file: File; quality?: "normal" | "high" }

export interface AssetService {
  list(): Promise<Asset3D[]>;
  get(id: string): Promise<Asset3D | undefined>;
  create(input: CreateAssetInput): Promise<Asset3D>;
  syncReconstruction(id: string): Promise<{ asset: Asset3D; job: ReconstructionJob }>;
  saveDraft(id: string, patch: Partial<Pick<Asset3D, "name" | "description" | "scenicSpotName">>): Promise<Asset3D>;
  publish(id: string): Promise<Asset3D>;
}

/** Mock 资产服务：读写 localStorage 仓库，配合 mockAHoloService 模拟 AI 重建。 */
const mockAssetService: AssetService = {
  async list() { return repositories.assets.list(); },
  async get(id) { return repositories.assets.get(id); },
  async create(input) {
    const id = `asset-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();
    const job = await mockAHoloService.createReconstructionJob(id, input.file.name);
    const asset: Asset3D = {
      id, name: input.name, scenicAreaId: "hangzhou-west-lake", scenicSpotName: input.scenicSpotName,
      status: "reconstructing", viewCount: 0, description: input.description,
      reconstructionJobId: job.id, reconstructionStatus: job.stage, reconstructionProgress: job.progress,
      createdAt: now, updatedAt: now,
    };
    return repositories.assets.save(asset);
  },
  async syncReconstruction(id) {
    let asset = await repositories.assets.get(id);
    if (!asset) throw new Error("找不到资产");
    const jobId = asset.reconstructionJobId ?? (await mockAHoloService.createReconstructionJob(id, "")).id;
    const job = await mockAHoloService.getReconstructionStatus(jobId);
    asset = { ...asset, reconstructionJobId: jobId, reconstructionStatus: job.stage, reconstructionProgress: job.progress, updatedAt: new Date().toISOString() };
    if (job.stage === "completed") asset.status = "pending_review";
    else if (job.stage === "failed") asset.status = "failed";
    else asset.status = "reconstructing";
    const saved = await repositories.assets.save(asset);
    return { asset: saved, job };
  },
  async saveDraft(id, patch) {
    const asset = await repositories.assets.get(id);
    if (!asset) throw new Error("找不到资产");
    return repositories.assets.save({ ...asset, ...patch, updatedAt: new Date().toISOString() });
  },
  async publish(id) {
    const asset = await repositories.assets.get(id);
    if (!asset) throw new Error("找不到资产");
    const now = new Date().toISOString();
    return repositories.assets.save({ ...asset, status: "published", publishedAt: now, updatedAt: now });
  },
};

const base = import.meta.env.VITE_CONFIG_API_URL ?? "";
async function request<T>(path: string, init?: RequestInit): Promise<T> { const res = await fetch(`${base}${path}`, init); const body = await res.json() as T & { error?: string }; if (!res.ok) throw new Error(body.error ?? "资产服务请求失败"); return body; }
const httpAssetService: AssetService = {
  list: () => request<Asset3D[]>("/api/admin/assets"), get: (id) => request<Asset3D>(`/api/admin/assets/${encodeURIComponent(id)}`),
  create: (input: CreateAssetInput) => request<Asset3D>("/api/admin/assets/upload", { method: "POST", headers: { "content-type": input.file.type || "application/octet-stream", "x-asset-name": encodeURIComponent(input.name), "x-scenic-spot": encodeURIComponent(input.scenicSpotName), "x-description": encodeURIComponent(input.description), "x-file-name": encodeURIComponent(input.file.name), "x-task-quality": input.quality ?? "normal" }, body: input.file }),
  syncReconstruction: (id: string) => request<{ asset: Asset3D; job: ReconstructionJob }>(`/api/admin/assets/${encodeURIComponent(id)}/reconstruction`),
  saveDraft: (id: string, patch: Partial<Pick<Asset3D, "name" | "description" | "scenicSpotName">>) => request<Asset3D>(`/api/admin/assets/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(patch) }),
  publish: (id: string) => request<Asset3D>(`/api/admin/assets/${encodeURIComponent(id)}/publish`, { method: "POST" }),
};

/** Mock 模式走本地仓库，API 模式走真实后端。默认 mock（不配 .env 也能跑纯前端展示）。 */
export const assetService: AssetService = (import.meta.env.VITE_CONFIG_MODE ?? "mock") === "mock" ? mockAssetService : httpAssetService;
