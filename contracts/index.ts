/**
 * @hackday/contracts —— 本地占位实现（Scenic-Detail 分支）
 *
 * Admin / Client / Backend 唯一共享的数据协议与固定 ID。
 * 真实 contracts 源码位于本工作树之外（详见 CLAUDE.md「已知缺口」），
 * 此处只收录 admin/ 当前实际依赖的类型与 WEST_LAKE_IDS，
 * 补齐真实 contracts 后应整体替换本文件，不得继续手写。
 */

/* —— 景区公共配置 —— */

export type ThemeAtmosphere = "mist" | "moonlight" | "celebration" | "blossom";

export interface ThemeEnvironment {
  period: string;
  lighting: string;
  decoration: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  sceneIds: string[];
  tokens: {
    atmosphere: ThemeAtmosphere;
    sky: string;
    water: string;
  };
  isBuiltIn: boolean;
  baseThemeId?: string;
  coverKey?: string;
  environment?: ThemeEnvironment;
}

export interface Scene {
  id: string;
  name: string;
  enabled: boolean;
  scenicAreaId?: string;
}

export type InteractionPointType = "story" | "mini_game" | "teleport";

export interface InteractionPoint {
  id: string;
  name: string;
  type: InteractionPointType;
  enabled: boolean;
  sceneId: string;
  position: { x: number; z: number };
  miniGameId?: string;
  rewardId?: string;
}

export interface LanternRiddle {
  question: string;
  options: string[];
  correctOptionIndex: number;
  successMessage: string;
  failureMessage: string;
}

export interface MiniGame {
  id: string;
  name: string;
  description: string;
  status?: "active" | "placeholder";
  rewardId?: string;
  riddle?: LanternRiddle;
}

export interface Reward {
  id: string;
  name: string;
  description?: string;
  type?: string;
  imageUrl?: string;
}

export interface ScenicExperienceConfig {
  version: number;
  updatedAt: string;
  activeThemeId: string;
  availableThemeIds: string[];
  themes: Theme[];
  scenes: Scene[];
  interactionPoints: InteractionPoint[];
  miniGames: MiniGame[];
  rewards: Reward[];
}

export interface AdminConfigState {
  publishedConfig: ScenicExperienceConfig;
  draftConfig: ScenicExperienceConfig;
  hasUnpublishedChanges: boolean;
  status: string;
}

/* —— 3D 资产 —— */

export type Asset3DStatus = "draft" | "reconstructing" | "pending_review" | "published" | "failed";

export interface AssetCoverImage {
  id: string;
  type: string;
  url: string;
}

export interface Asset3D {
  id: string;
  name: string;
  scenicAreaId: string;
  scenicSpotName: string;
  status: Asset3DStatus;
  viewCount: number;
  description: string;
  coverImage?: AssetCoverImage;
  reconstructionProgress?: number;
  reconstructionStatus?: string;
  reconstructionJobId?: string;
  splatOutputs?: { spzUrl?: string; plyUrl?: string };
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

/** 主题配置（Admin 资产库用；与公共配置中的 Theme 是两套对象） */
export interface ThemeConfig {
  id: string;
  name: string;
  preset: string;
  scenicAreaId: string;
  params: {
    cloudDensity: number;
    particleSpeed: number;
    ambientIntensity: number;
    colorTemperature: number;
    decorationDensity: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/* —— 固定 ID —— */

export const WEST_LAKE_IDS = {
  scenicArea: "hangzhou-west-lake",
  scenes: {
    brokenBridge: "scene-broken-bridge",
    leifengPagoda: "scene-leifeng-pagoda",
    reserved: "scene-west-lake-reserved",
  },
  themes: {
    default: "theme-default-west-lake",
    midAutumn: "theme-mid-autumn-gathering",
    nationalDay: "theme-national-day",
  },
  interactionPoints: {
    brokenBridgeStory: "interaction-broken-bridge-story",
    midAutumnRiddle: "interaction-mid-autumn-riddle",
    sceneTeleport: "interaction-scene-teleport",
  },
  miniGames: {
    lanternRiddle: "minigame-lantern-riddle",
  },
  rewards: {
    moonlitBrokenBridge: "reward-moonlit-broken-bridge",
  },
  reserved: {
    spotBrokenBridge: "spot-broken-bridge",
    spotLeifengPagoda: "spot-leifeng-pagoda",
  },
} as const;
