import type { ScenicExperienceConfig } from "./contracts";
import { WEST_LAKE_IDS } from "./contracts";

// Mock Published Config —— 对齐 backend/src/seed/westLakeSeed.ts 的固定 ID。
// 注意：真实 Seed 的 availableThemeIds 初始只有默认主题；这里放开三个主题方便演示切换。
export const seedConfig: ScenicExperienceConfig = {
  version: 1,
  updatedAt: new Date().toISOString(),
  scenicArea: {
    id: WEST_LAKE_IDS.scenicArea,
    name: "杭州西湖风景名胜区",
    rating: 4.9,
    location: "浙江省杭州市西湖区",
    description: "淡妆浓抹总相宜。西湖以湖光山色与深厚的人文底蕴闻名于世。",
  },
  scenes: [
    {
      id: WEST_LAKE_IDS.scenes.reserved,
      scenicAreaId: WEST_LAKE_IDS.scenicArea,
      name: "乌龟潭实景",
      spawnPoint: { x: 0.25, y: 0, z: -0.33 },
    },
  ],
  spots: [
    {
      id: "spot-wuguitan",
      sceneId: "scene-west-lake-reserved",
      name: "和泽三春",
      description:
        "和泽三春坐落于乌龟潭畔，亭廊掩映于花木之间。导览将沿石板路和曲折栈道抵达亭前。",
      position: { x: 2.78, y: 0, z: 15.63 },
    },
  ],
  themes: [
    {
      id: WEST_LAKE_IDS.themes.default,
      name: "默认西湖",
      environmentConfig: {
        skyColor: "#bfe3f2",
        fogColor: "#cfe8f2",
        ambientColor: "#dff1f7",
        sunColor: "#fff5e0",
        lanternGlow: false,
        showMoon: false,
        accentColor: "#2e7d5b",
      },
    },
    {
      id: WEST_LAKE_IDS.themes.midAutumn,
      name: "中秋雅集",
      environmentConfig: {
        skyColor: "#0d1b3d",
        fogColor: "#122448",
        ambientColor: "#33456e",
        sunColor: "#8fa3d9",
        lanternGlow: true,
        showMoon: true,
        accentColor: "#f2a541",
      },
    },
    {
      id: WEST_LAKE_IDS.themes.nationalDay,
      name: "国庆主题",
      environmentConfig: {
        skyColor: "#ffd9a0",
        fogColor: "#f7c98b",
        ambientColor: "#ffe3c0",
        sunColor: "#ffb35c",
        lanternGlow: true,
        showMoon: false,
        accentColor: "#d03a2f",
      },
    },
  ],
  activeThemeId: WEST_LAKE_IDS.themes.default,
  availableThemeIds: [
    WEST_LAKE_IDS.themes.default,
    WEST_LAKE_IDS.themes.midAutumn,
    WEST_LAKE_IDS.themes.nationalDay,
  ],
  interactionPoints: [
    {
      id: "interaction-wuguitan-story",
      sceneId: WEST_LAKE_IDS.scenes.reserved,
      type: "story",
      name: "和泽三春",
      position: { x: 2.78, y: 0, z: 15.63 },
      spotId: "spot-wuguitan",
      enabled: true,
    },
    {
      id: "interaction-wuguitan-riddle",
      sceneId: WEST_LAKE_IDS.scenes.reserved,
      type: "game",
      name: "中秋猜灯谜",
      position: { x: 3.69, y: -2.72, z: 18.95 },
      miniGameId: WEST_LAKE_IDS.miniGames.lanternRiddle,
      enabled: true,
    },
    {
      id: "interaction-wuguitan-pitchpot",
      sceneId: WEST_LAKE_IDS.scenes.reserved,
      type: "game",
      name: "雅趣投壶",
      position: { x: -0.05, y: -2.42, z: 34.38 },
      miniGameId: WEST_LAKE_IDS.miniGames.pitchPot,
      enabled: true,
    },
  ],
  miniGames: [
    {
      id: WEST_LAKE_IDS.miniGames.lanternRiddle,
      type: "lantern-riddle",
      title: "中秋猜灯谜",
      content: {
        question: "一夜又一夜（打一字）",
        hint: "「夜」去「亠」余「夕」，两夜相叠即为本字。",
        options: ["梦", "多", "朋", "明"],
        answerIndex: 1,
      },
      rewardId: WEST_LAKE_IDS.rewards.moonlitBrokenBridge,
    },
    {
      id: WEST_LAKE_IDS.miniGames.pitchPot,
      type: "pitch-pot",
      title: "雅趣投壶",
      content: {
        question: "投壶为古之雅戏，以矢入壶为胜。",
        hint: "把握力度与角度，将箭矢投入壶口。",
        options: [],
        answerIndex: -1,
      },
      rewardId: WEST_LAKE_IDS.rewards.moonlitBrokenBridge,
    },
  ],
  rewards: [
    {
      id: WEST_LAKE_IDS.rewards.moonlitBrokenBridge,
      type: "card",
      name: "月映断桥",
      description: "中秋限定纪念卡：一轮明月映断桥，万家灯火共此时。",
    },
  ],
};
