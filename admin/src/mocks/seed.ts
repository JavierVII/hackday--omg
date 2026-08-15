import type { Asset3D, ThemeConfig } from "@hackday/contracts";

const now = "2026-08-13T09:00:00.000Z";
const asset = (id: string, name: string, scenicSpotName: string, status: Asset3D["status"], viewCount: number, accent: string): Asset3D => ({
  id, name, scenicAreaId: "hangzhou-west-lake", scenicSpotName, status, viewCount,
  description: `${name}数字景点资产，以沉浸式方式呈现杭州西湖的自然与人文风貌。`,
  coverImage: { id: `${id}-cover`, type: "image", url: accent },
  reconstructionProgress: status === "published" ? 100 : status === "reconstructing" ? 45 : undefined,
  createdAt: now, updatedAt: now, publishedAt: status === "published" ? now : undefined,
});

export const seedAssets: Asset3D[] = [
  asset("asset-leifeng", "雷峰塔", "雷峰夕照", "published", 1284, "#bd7b3c"),
  asset("asset-santan", "三潭印月", "三潭印月", "published", 856, "#317f69"),
  asset("asset-duanqiao", "断桥残雪", "断桥残雪", "draft", 0, "#7194a1"),
  asset("asset-sudi", "苏堤春晓", "苏堤", "pending_review", 0, "#5d9160"),
  asset("asset-quyuan", "曲院风荷", "曲院风荷", "reconstructing", 0, "#a66076"),
  asset("asset-pinghu", "平湖秋月", "平湖秋月", "failed", 0, "#6d6999"),
];

export const seedThemes: ThemeConfig[] = [
  { id: "theme-default", name: "默认景观", preset: "default", scenicAreaId: "hangzhou-west-lake", params: { cloudDensity: 30, particleSpeed: 20, ambientIntensity: 55, colorTemperature: 50, decorationDensity: 20 }, isActive: true, createdAt: now, updatedAt: now },
  { id: "theme-mid-autumn", name: "中秋月圆", preset: "mid_autumn", scenicAreaId: "hangzhou-west-lake", params: { cloudDensity: 70, particleSpeed: 45, ambientIntensity: 60, colorTemperature: 65, decorationDensity: 55 }, isActive: false, createdAt: now, updatedAt: now },
];
