// Mock of @hackday/contracts —— 真实仓库合入后替换为包导入，类型以 contracts/src/index.ts 为准
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface ScenicArea {
  id: string;
  name: string;
  rating: number;
  location: string;
  description: string;
}

export interface Scene {
  id: string;
  scenicAreaId: string;
  name: string;
  spawnPoint: Vec3;
}

export interface Spot {
  id: string;
  sceneId: string;
  name: string;
  description: string;
  position: Vec3;
}

export interface EnvironmentConfig {
  skyColor: string;
  fogColor: string;
  ambientColor: string;
  sunColor: string;
  lanternGlow: boolean;
  showMoon: boolean;
  accentColor: string;
}

export interface Theme {
  id: string;
  name: string;
  environmentConfig: EnvironmentConfig;
}

export type InteractionType = "story" | "game" | "teleport";

export interface InteractionPoint {
  id: string;
  sceneId: string;
  type: InteractionType;
  name: string;
  position: Vec3;
  spotId?: string;
  miniGameId?: string;
  rewardId?: string;
  targetSceneId?: string;
  enabled: boolean;
}

export type MiniGameType = "lantern-riddle" | "pitch-pot" | "touhu" | "beads";

export interface MiniGame {
  id: string;
  type: MiniGameType;
  title: string;
  content: {
    question: string;
    hint: string;
    options: string[];
    answerIndex: number;
  };
  rewardId: string;
}

export interface Reward {
  id: string;
  type: "card";
  name: string;
  description: string;
}

export interface ScenicExperienceConfig {
  version: number;
  updatedAt: string;
  scenicArea: ScenicArea;
  scenes: Scene[];
  spots: Spot[];
  themes: Theme[];
  activeThemeId: string;
  availableThemeIds: string[];
  interactionPoints: InteractionPoint[];
  miniGames: MiniGame[];
  rewards: Reward[];
}

export interface UserProgress {
  completedInteractionIds: string[];
  unlockedRewardIds: string[];
}

export const WEST_LAKE_IDS = {
  scenicArea: "hangzhou-west-lake",
  scenes: {
    brokenBridge: "scene-broken-bridge",
    leifengPagoda: "scene-leifeng-pagoda",
    reserved: "scene-west-lake-reserved",
  },
  spots: {
    brokenBridge: "spot-broken-bridge",
    leifengPagoda: "spot-leifeng-pagoda",
  },
  themes: {
    default: "theme-default-west-lake",
    midAutumn: "theme-mid-autumn-gathering",
    nationalDay: "theme-national-day",
  },
  interactions: {
    brokenBridgeStory: "interaction-broken-bridge-story",
    midAutumnRiddle: "interaction-mid-autumn-riddle",
    sceneTeleport: "interaction-scene-teleport",
  },
  miniGames: {
    lanternRiddle: "minigame-lantern-riddle",
    touhu: "minigame-touhu",
    beads: "minigame-beads",
  },
  rewards: {
    moonlitBrokenBridge: "reward-moonlit-broken-bridge",
  },
} as const;
