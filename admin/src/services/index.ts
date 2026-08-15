import type { Asset3D, ThemeConfig } from "@hackday/contracts";
import { seedAssets, seedThemes } from "../mocks/seed";
import { createLocalStorageRepository } from "./storage/localStorageRepository";

const PREFIX = "hackday-omg:admin:v1";
export const repositories = {
  assets: createLocalStorageRepository<Asset3D>(`${PREFIX}:assets`, seedAssets),
  themes: createLocalStorageRepository<ThemeConfig>(`${PREFIX}:themes`, seedThemes),
};

export interface DashboardSummary { visitors: number; assetCount: number; averageStay: string; participationRate: number }
export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    return { visitors: 2847, assetCount: 36, averageStay: "14:32", participationRate: 68 };
  },
};
