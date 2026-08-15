import type { AHoloService, ReconstructionJob, ReconstructionResult, ReconstructionStage } from "./types";

const KEY = "hackday-omg:admin:v1:aholo-jobs";
const checkpoints: Array<{ at: number; progress: number; stage: ReconstructionStage; message: string }> = [
  { at: 0, progress: 0, stage: "uploaded", message: "视频上传完成，正在创建重建任务" },
  { at: 2500, progress: 20, stage: "analyzing", message: "正在分析画面中的空间特征" },
  { at: 5500, progress: 45, stage: "geometry", message: "正在构建景点几何结构" },
  { at: 8500, progress: 70, stage: "texture", message: "正在生成高精度纹理" },
  { at: 11500, progress: 90, stage: "optimizing", message: "正在优化模型与移动端展示效果" },
  { at: 14500, progress: 100, stage: "completed", message: "AI 重建完成，可以审核上线" },
];

function readJobs(): ReconstructionJob[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]") as ReconstructionJob[]; } catch { return []; }
}
function writeJobs(jobs: ReconstructionJob[]) { localStorage.setItem(KEY, JSON.stringify(jobs)); }
function resolvedJob(job: ReconstructionJob): ReconstructionJob {
  const elapsed = Date.now() - new Date(job.startedAt).getTime();
  const state = [...checkpoints].reverse().find((checkpoint) => elapsed >= checkpoint.at) ?? checkpoints[0];
  return { ...job, progress: state.progress, stage: state.stage, message: state.message };
}

export const mockAHoloService: AHoloService = {
  async createReconstructionJob(assetId) {
    const job: ReconstructionJob = { id: `aholo-${crypto.randomUUID()}`, assetId, stage: "uploaded", progress: 0, message: checkpoints[0].message, startedAt: new Date().toISOString() };
    const jobs = readJobs(); jobs.push(job); writeJobs(jobs); return job;
  },
  async getReconstructionStatus(jobId) {
    const jobs = readJobs(); const index = jobs.findIndex((job) => job.id === jobId);
    if (index < 0) throw new Error("找不到 AI 重建任务");
    const job = resolvedJob(jobs[index]); jobs[index] = job; writeJobs(jobs); return job;
  },
  async getAssetResult(jobId): Promise<ReconstructionResult> {
    const job = await this.getReconstructionStatus(jobId);
    if (job.stage !== "completed") throw new Error("重建任务尚未完成");
    return { modelUrl: `mock://aholo/models/${job.assetId}.glb` };
  },
};
