export { repositories } from "./repositories";

export interface DashboardSummary { visitors: number; assetCount: number; averageStay: string; participationRate: number }
export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    return { visitors: 2847, assetCount: 36, averageStay: "14:32", participationRate: 68 };
  },
};
