import type { ScenicExperienceConfig } from "../mocks/contracts";
import { seedConfig } from "../mocks/seedConfig";

const DEFAULT_BACKEND_BASE_URL = "http://127.0.0.1:8787";

export const clientConfigEndpoint = new URL(
  "/api/client/config",
  import.meta.env.VITE_BACKEND_BASE_URL ?? DEFAULT_BACKEND_BASE_URL,
).toString();

// Mock ClientConfigService —— 真实实现只封装 GET /api/client/config + version 轮询
export async function fetchConfig(): Promise<ScenicExperienceConfig> {
  return structuredClone(seedConfig);
}
