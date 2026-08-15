import type { ScenicExperienceConfig } from "../mocks/contracts";
import { seedConfig } from "../mocks/seedConfig";

// Mock ClientConfigService —— 真实实现只封装 GET /api/client/config + version 轮询
export async function fetchConfig(): Promise<ScenicExperienceConfig> {
  return structuredClone(seedConfig);
}
