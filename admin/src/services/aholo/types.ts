export type ReconstructionStage = "uploaded" | "analyzing" | "geometry" | "texture" | "optimizing" | "completed" | "failed";
export interface ReconstructionJob {
  id: string;
  assetId: string;
  stage: ReconstructionStage;
  progress: number;
  message: string;
  startedAt: string;
}
export interface ReconstructionResult { modelUrl: string; coverUrl?: string }
export interface AHoloService {
  createReconstructionJob(assetId: string, fileName: string): Promise<ReconstructionJob>;
  getReconstructionStatus(jobId: string): Promise<ReconstructionJob>;
  getAssetResult(jobId: string): Promise<ReconstructionResult>;
}
