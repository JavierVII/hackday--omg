import { WEST_LAKE_IDS, type ScenicExperienceConfig } from "@hackday/contracts";

const ids = WEST_LAKE_IDS;
export function createWestLakeSeed(): ScenicExperienceConfig {
  return {
    scenicArea: { id: ids.scenicArea, name: "杭州西湖风景名胜区", description: "面向数字文旅体验的西湖公共景区配置" },
    scenes: [
      { id: ids.scenes.brokenBridge, scenicAreaId: ids.scenicArea, name: "断桥残雪", slug: "broken-bridge", enabled: true, sortOrder: 1 },
      { id: ids.scenes.leifengPagoda, scenicAreaId: ids.scenicArea, name: "雷峰塔", slug: "leifeng-pagoda", enabled: true, sortOrder: 2 },
      { id: ids.scenes.reserved, scenicAreaId: ids.scenicArea, name: "西湖第三场景（预留）", slug: "reserved-scene", enabled: false, sortOrder: 3 },
    ],
    themes: [
      { id: ids.themes.default, name: "默认西湖", description: "清雅自然的西湖常态景观", sceneIds: [ids.scenes.brokenBridge, ids.scenes.leifengPagoda], tokens: { sky: "#a9ced0", water: "#547f76", accent: "#43df89", atmosphere: "mist" } },
      { id: ids.themes.midAutumn, name: "中秋雅集", description: "月色、灯影与桂香构成的中秋景观", sceneIds: [ids.scenes.brokenBridge, ids.scenes.leifengPagoda], tokens: { sky: "#18213d", water: "#293b58", accent: "#e6c56c", atmosphere: "moonlight" } },
      { id: ids.themes.nationalDay, name: "国庆主题", description: "克制庄重的国庆节日景观", sceneIds: [ids.scenes.brokenBridge, ids.scenes.leifengPagoda], tokens: { sky: "#8f4135", water: "#425f5a", accent: "#e0b65b", atmosphere: "celebration" } },
    ],
    spots: [
      { id: ids.spots.brokenBridge, sceneId: ids.scenes.brokenBridge, name: "断桥", description: "白堤东端的西湖文化景点", position: { x: 12, y: 0, z: -8 } },
      { id: ids.spots.leifengPagoda, sceneId: ids.scenes.leifengPagoda, name: "雷峰塔", description: "西湖南岸标志性文化景点", position: { x: -4, y: 0, z: 18 } },
    ],
    interactionPoints: [
      { id: ids.interactions.story, sceneId: ids.scenes.brokenBridge, spotId: ids.spots.brokenBridge, name: "断桥故事", type: "story", enabled: true, position: { x: 11, y: 1.4, z: -7 } },
      { id: ids.interactions.riddle, sceneId: ids.scenes.brokenBridge, spotId: ids.spots.brokenBridge, name: "中秋猜灯谜", type: "mini_game", enabled: true, position: { x: 15, y: 1.2, z: -5 }, miniGameId: ids.miniGames.riddle },
      { id: ids.interactions.teleport, sceneId: ids.scenes.brokenBridge, name: "前往雷峰塔", type: "teleport", enabled: true, position: { x: 20, y: 0, z: -2 }, targetSceneId: ids.scenes.leifengPagoda },
    ],
    miniGames: [{ id: ids.miniGames.riddle, name: "猜灯谜", type: "lantern_riddle", description: "解答西湖与中秋主题灯谜", rewardId: ids.rewards.moonBridgeCard }],
    rewards: [{ id: ids.rewards.moonBridgeCard, name: "月映断桥", description: "西湖中秋限定数字纪念卡", type: "collectible_card", imageKey: "reward-moonlit-broken-bridge" }],
    activeThemeId: ids.themes.default,
    version: 1,
    updatedAt: "2026-08-13T00:00:00.000Z",
  };
}
