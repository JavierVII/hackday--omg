import type { Asset3D, ThemeConfig } from "@hackday/contracts";

const now = "2026-08-13T09:00:00.000Z";
export const seedAssets: Asset3D[] = [
  { id: "asset-leifeng", name: "雷峰塔", scenicAreaId: "hangzhou-west-lake", scenicSpotName: "雷峰夕照", status: "published", viewCount: 1284, createdAt: now, updatedAt: now, publishedAt: now },
  { id: "asset-sudi", name: "苏堤春晓", scenicAreaId: "hangzhou-west-lake", scenicSpotName: "苏堤", status: "pending_review", viewCount: 0, createdAt: now, updatedAt: now },
];

export const seedThemes: ThemeConfig[] = [
  { id: "theme-default", name: "默认景观", preset: "default", scenicAreaId: "hangzhou-west-lake", params: { cloudDensity: 30, particleSpeed: 20, ambientIntensity: 55, colorTemperature: 50, decorationDensity: 20 }, isActive: true, createdAt: now, updatedAt: now },
  { id: "theme-mid-autumn", name: "中秋月圆", preset: "mid_autumn", scenicAreaId: "hangzhou-west-lake", params: { cloudDensity: 70, particleSpeed: 45, ambientIntensity: 60, colorTemperature: 65, decorationDensity: 55 }, isActive: false, createdAt: now, updatedAt: now },
];
