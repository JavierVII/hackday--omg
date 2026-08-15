import { WEST_LAKE_IDS } from "@hackday/contracts";
import type { AdminConfigState, InteractionPoint, MiniGame, Reward, Scene, ScenicExperienceConfig, Theme } from "@hackday/contracts";

const { scenes: sceneIds, themes: themeIds, interactionPoints: interactionIds, miniGames: gameIds, rewards: rewardIds } = WEST_LAKE_IDS;
const SCENIC_AREA = WEST_LAKE_IDS.scenicArea;

const scenes: Scene[] = [
  { id: sceneIds.brokenBridge, name: "断桥残雪", enabled: true, scenicAreaId: SCENIC_AREA },
  { id: sceneIds.leifengPagoda, name: "雷峰塔", enabled: true, scenicAreaId: SCENIC_AREA },
];

const themes: Theme[] = [
  {
    id: themeIds.default,
    name: "默认西湖",
    description: "晴空、远山与雾绿湖面，保持西湖日常游览的自然层次。",
    sceneIds: [sceneIds.brokenBridge, sceneIds.leifengPagoda],
    tokens: { atmosphere: "mist", sky: "#9cc9ce", water: "#527f70" },
    isBuiltIn: true,
    environment: { period: "日间", lighting: "自然天光", decoration: "轻雾与湖面波光" },
  },
  {
    id: themeIds.midAutumn,
    name: "中秋雅集",
    description: "深蓝暮色、明月与暖色灯影共同营造中秋夜游氛围。",
    sceneIds: [sceneIds.brokenBridge, sceneIds.leifengPagoda],
    tokens: { atmosphere: "moonlight", sky: "#172139", water: "#293b58" },
    isBuiltIn: true,
    environment: { period: "暮色 / 夜间", lighting: "月光与暖灯", decoration: "圆月、灯笼、桂花" },
  },
  {
    id: themeIds.nationalDay,
    name: "国庆主题",
    description: "庄重克制的节庆色彩，目前暂未向游客开放。",
    sceneIds: [sceneIds.brokenBridge, sceneIds.leifengPagoda],
    tokens: { atmosphere: "celebration", sky: "#91453b", water: "#536a60" },
    isBuiltIn: true,
    environment: { period: "黄昏", lighting: "节庆暖光", decoration: "国庆主题陈设" },
  },
];

const rewards: Reward[] = [
  { id: rewardIds.moonlitBrokenBridge, name: "月映断桥", description: "数字纪念卡：一轮明月悬于断桥之上。", type: "card", imageUrl: "" },
];

const miniGames: MiniGame[] = [
  {
    id: gameIds.lanternRiddle,
    name: "中秋猜灯谜",
    description: "月圆之夜，猜中灯谜即可获得「月映断桥」纪念卡。",
    status: "active",
    rewardId: rewardIds.moonlitBrokenBridge,
    riddle: {
      question: "明月照西湖，打一处西湖十景？",
      options: ["断桥残雪", "平湖秋月", "雷峰夕照", "曲院风荷"],
      correctOptionIndex: 1,
      successMessage: "答对了！月映断桥纪念卡已收入行囊。",
      failureMessage: "再想想，答案藏在西湖的月色里。",
    },
  },
  { id: "minigame-puzzle-restoration", name: "拼图复原", description: "将西湖十景的碎片复原成完整画面（占位玩法）。", status: "placeholder" },
  { id: "minigame-west-lake-treasure", name: "西湖寻宝", description: "在景区中寻找隐藏的宝物线索（占位玩法）。", status: "placeholder" },
  { id: "minigame-poetry-challenge", name: "诗词挑战", description: "对诗西湖，感受诗词之美（占位玩法）。", status: "placeholder" },
];

const interactionPoints: InteractionPoint[] = [
  { id: interactionIds.brokenBridgeStory, name: "断桥故事", type: "story", enabled: true, sceneId: sceneIds.brokenBridge, position: { x: -2, z: 5 } },
  { id: interactionIds.midAutumnRiddle, name: "中秋猜灯谜", type: "mini_game", enabled: true, sceneId: sceneIds.brokenBridge, position: { x: 8, z: 12 }, miniGameId: gameIds.lanternRiddle, rewardId: rewardIds.moonlitBrokenBridge },
  { id: interactionIds.sceneTeleport, name: "场景传送", type: "teleport", enabled: true, sceneId: sceneIds.leifengPagoda, position: { x: 0, z: -6 } },
];

function buildConfig(version: number): ScenicExperienceConfig {
  return {
    version,
    updatedAt: "2026-08-13T09:00:00.000Z",
    activeThemeId: themeIds.default,
    availableThemeIds: [themeIds.default, themeIds.midAutumn],
    themes,
    scenes,
    interactionPoints,
    miniGames,
    rewards,
  };
}

/** 供 Mock Config Service 首次读取时初始化 localStorage 的统一 Seed。 */
export function seedAdminConfig(): AdminConfigState {
  const publishedConfig = buildConfig(3);
  return {
    publishedConfig,
    draftConfig: structuredClone(publishedConfig),
    hasUnpublishedChanges: false,
    status: "published",
  };
}
