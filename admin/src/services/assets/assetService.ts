import type { Asset3D } from "@hackday/contracts";
import { repositories } from "../index";
import { mockAHoloService, type ReconstructionJob } from "../aholo";

export interface CreateAssetInput { name: string; scenicSpotName: string; description: string; fileName: string }
export interface AssetService {
  list(): Promise<Asset3D[]>; get(id: string): Promise<Asset3D>; create(input: CreateAssetInput): Promise<Asset3D>;
  startReconstruction(id: string): Promise<ReconstructionJob>; syncReconstruction(id: string): Promise<{ asset: Asset3D; job: ReconstructionJob }>;
  saveDraft(id: string, patch: Partial<Pick<Asset3D, "name" | "description" | "scenicSpotName">>): Promise<Asset3D>;
  publish(id: string): Promise<Asset3D>;
}
const requireAsset = async (id: string) => { const item = await repositories.assets.get(id); if (!item) throw new Error("找不到该 3D 资产"); return item; };

export const assetService: AssetService = {
  async list() { return (await repositories.assets.list()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); },
  get: requireAsset,
  async create(input) {
    const now = new Date().toISOString();
    return repositories.assets.save({ id: `asset-${crypto.randomUUID()}`, name: input.name, scenicAreaId: "hangzhou-west-lake", scenicSpotName: input.scenicSpotName, description: input.description, sourceVideo: { id: `video-${crypto.randomUUID()}`, type: "video", url: `mock://uploads/${encodeURIComponent(input.fileName)}`, name: input.fileName }, status: "draft", viewCount: 0, createdAt: now, updatedAt: now });
  },
  async startReconstruction(id) {
    const asset = await requireAsset(id); const job = await mockAHoloService.createReconstructionJob(id, asset.sourceVideo?.name ?? "west-lake.mp4");
    await repositories.assets.save({ ...asset, status: "reconstructing", reconstructionJobId: job.id, reconstructionProgress: 0, updatedAt: new Date().toISOString() }); return job;
  },
  async syncReconstruction(id) {
    const asset = await requireAsset(id); if (!asset.reconstructionJobId) throw new Error("该资产尚未创建重建任务");
    const job = await mockAHoloService.getReconstructionStatus(asset.reconstructionJobId);
    const completed = job.stage === "completed"; const next: Asset3D = { ...asset, status: completed ? "pending_review" : "reconstructing", reconstructionProgress: job.progress, updatedAt: completed ? new Date().toISOString() : asset.updatedAt };
    if (completed) { const result = await mockAHoloService.getAssetResult(job.id); next.model = { id: `model-${id}`, type: "model", url: result.modelUrl, name: `${asset.name}.glb` }; }
    return { asset: await repositories.assets.save(next), job };
  },
  async saveDraft(id, patch) { const asset = await requireAsset(id); return repositories.assets.save({ ...asset, ...patch, updatedAt: new Date().toISOString() }); },
  async publish(id) { const asset = await requireAsset(id); if (asset.status !== "pending_review") throw new Error("只有待审核资产可以发布"); const now = new Date().toISOString(); return repositories.assets.save({ ...asset, status: "published", reconstructionProgress: 100, publishedAt: now, updatedAt: now }); },
};
