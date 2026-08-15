import type { Asset3DStatus } from "@hackday/contracts";
import { assetService } from "../assets/assetService";
import { configService } from "../config";

export interface DashboardData {
  kpis: Array<{ label: string; value: string; trend: string; kind: "visitors" | "duration" | "interaction" | "coverage" }>;
  online: { theme: string; draftTheme: string; version: number; onlineScenes: number; enabledInteractions: number; totalInteractions: number; hasDraft: boolean; updatedAt: string };
  todos: Array<{ id: string; title: string; description: string; status: string; action: string; to: string; tone: "warning" | "success" | "neutral" }>;
  funnel: Array<{ label: string; value: number }>;
  scenes: Array<{ name: string; visitors: string; stay: string; interactionRate: string; status: "热门" | "待提升" }>;
  insights: Array<{ title: string; description: string; action: string; to: string }>;
  assetHealth: Record<"published" | "reconstructing" | "pending_review" | "failed", number>;
}

export const dashboardService = {
  async getDashboard(): Promise<DashboardData> {
    const [config, assets] = await Promise.all([configService.getAdminConfig(), assetService.list()]);
    const count = (status: Asset3DStatus) => assets.filter((asset) => asset.status === status).length;
    const onlineTheme = config.publishedConfig.themes.find((item) => item.id === config.publishedConfig.activeThemeId)?.name ?? "默认西湖";
    const draftTheme = config.draftConfig.themes.find((item) => item.id === config.draftConfig.activeThemeId)?.name ?? onlineTheme;
    const reviewAsset = assets.find((asset) => asset.status === "pending_review");
    const disabledInteraction = config.draftConfig.interactionPoints.find((item) => !item.enabled);
    const todos: DashboardData["todos"] = [];
    if (config.hasUnpublishedChanges) todos.push({ id: "draft", title: `${draftTheme}已保存，等待发布`, description: "共享配置已有 Draft 变更，游客端尚未受影响。", status: "待发布", action: "去发布", to: "/operations/publish", tone: "warning" });
    if (reviewAsset) todos.push({ id: "asset", title: `${reviewAsset.name}等待审核`, description: "AI 重建已完成，可检查模型效果并决定是否上线。", status: "待审核", action: "去审核", to: `/assets/${reviewAsset.id}/review`, tone: "success" });
    if (disabledInteraction) todos.push({ id: "interaction", title: `${disabledInteraction.name}当前停用`, description: "该热点不会出现在游客体验中。", status: "已停用", action: "去配置", to: "/operations/interactions", tone: "neutral" });
    return {
      kpis: [{ label: "今日云游游客", value: "2,847", trend: "+12.5%", kind: "visitors" }, { label: "平均沉浸时长", value: "14:32", trend: "+8.0%", kind: "duration" }, { label: "互动完成率", value: "68%", trend: "+5.2%", kind: "interaction" }, { label: "3D 场景 / 资产覆盖", value: "86%", trend: "+3 项", kind: "coverage" }],
      online: { theme: onlineTheme, draftTheme, version: config.publishedConfig.version, onlineScenes: config.publishedConfig.scenes.filter((item) => item.enabled).length, enabledInteractions: config.publishedConfig.interactionPoints.filter((item) => item.enabled).length, totalInteractions: config.publishedConfig.interactionPoints.length, hasDraft: config.hasUnpublishedChanges, updatedAt: config.publishedConfig.updatedAt },
      todos,
      funnel: [{ label: "曝光", value: 3842 }, { label: "热点触发", value: 2767 }, { label: "开始互动", value: 1771 }, { label: "完成", value: 1435 }, { label: "获得奖励", value: 1335 }],
      scenes: [{ name: "断桥残雪", visitors: "1,842", stay: "16:48", interactionRate: "74%", status: "热门" }, { name: "雷峰塔", visitors: "1,005", stay: "11:26", interactionRate: "43%", status: "待提升" }],
      insights: [{ title: "雷峰塔互动参与率低于景区平均值", description: "建议在雷峰塔动线增加轻量寻宝或故事互动点。", action: "创建互动点", to: "/operations/interactions" }, ...(config.hasUnpublishedChanges ? [{ title: `${draftTheme}已准备完成`, description: "建议在晚间客流高峰前进入预览并发布完成确认。", action: "查看待发布配置", to: "/operations/publish" }] : [])],
      assetHealth: { published: count("published"), reconstructing: count("reconstructing"), pending_review: count("pending_review"), failed: count("failed") },
    };
  },
};
