import type { Asset3D } from "@hackday/contracts";
import type { ReconstructionJob } from "../aholo";
const base = import.meta.env.VITE_CONFIG_API_URL ?? "";
async function request<T>(path: string, init?: RequestInit): Promise<T> { const res = await fetch(`${base}${path}`, init); const body = await res.json() as T & { error?: string }; if (!res.ok) throw new Error(body.error ?? "资产服务请求失败"); return body; }
export interface CreateAssetInput { name: string; scenicSpotName: string; description: string; file: File; quality?: "normal" | "high" }
export const assetService = {
  list: () => request<Asset3D[]>("/api/admin/assets"), get: (id: string) => request<Asset3D>(`/api/admin/assets/${encodeURIComponent(id)}`),
  create: (input: CreateAssetInput) => request<Asset3D>("/api/admin/assets/upload", { method: "POST", headers: { "content-type": input.file.type || "application/octet-stream", "x-asset-name": encodeURIComponent(input.name), "x-scenic-spot": encodeURIComponent(input.scenicSpotName), "x-description": encodeURIComponent(input.description), "x-file-name": encodeURIComponent(input.file.name), "x-task-quality": input.quality ?? "normal" }, body: input.file }),
  syncReconstruction: (id: string) => request<{ asset: Asset3D; job: ReconstructionJob }>(`/api/admin/assets/${encodeURIComponent(id)}/reconstruction`),
  saveDraft: (id: string, patch: Partial<Pick<Asset3D, "name" | "description" | "scenicSpotName">>) => request<Asset3D>(`/api/admin/assets/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(patch) }),
  publish: (id: string) => request<Asset3D>(`/api/admin/assets/${encodeURIComponent(id)}/publish`, { method: "POST" }),
};
