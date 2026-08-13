export type EntityId = string;
export type ISODateString = string;
export type PublishStatus = "draft" | "published" | "offline";

export interface MediaRef {
  id: EntityId;
  url: string;
  type: "image" | "video" | "model";
  name?: string;
  thumbnailUrl?: string;
}

export type Asset3DStatus = "draft" | "reconstructing" | "pending_review" | "published" | "failed";
export interface Asset3D {
  id: EntityId;
  name: string;
  scenicAreaId: "hangzhou-west-lake";
  scenicSpotName?: string;
  description?: string;
  sourceVideo?: MediaRef;
  coverImage?: MediaRef;
  model?: MediaRef;
  status: Asset3DStatus;
  reconstructionJobId?: string;
  reconstructionProgress?: number;
  failureReason?: string;
  viewCount: number;
  publishedAt?: ISODateString;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export type ThemePreset = "default" | "summer_cloud" | "mid_autumn" | "national_day" | "winter_snow" | "spring_blossom" | "custom";
export interface ThemeDecorationParams {
  cloudDensity: number;
  particleSpeed: number;
  ambientIntensity: number;
  colorTemperature: number;
  decorationDensity: number;
}
export interface ThemeConfig {
  id: EntityId;
  name: string;
  preset: ThemePreset;
  scenicAreaId: "hangzhou-west-lake";
  description?: string;
  previewImage?: MediaRef;
  params: ThemeDecorationParams;
  isActive: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  appliedAt?: ISODateString;
}

export type GameType = "treasure_hunt" | "poetry_challenge" | "pitch_pot" | "ar_checkin" | "lantern_riddle" | "stamp_collection";
export interface GameConfig {
  id: EntityId;
  name: string;
  type: GameType;
  scenicAreaId: "hangzhou-west-lake";
  description: string;
  rules: string[];
  scenicSpotIds: EntityId[];
  status: PublishStatus;
  participantCount: number;
  publishedAt?: ISODateString;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Activity {
  id: EntityId;
  name: string;
  scenicAreaId: "hangzhou-west-lake";
  summary: string;
  description?: string;
  startAt: ISODateString;
  endAt: ISODateString;
  relations: { themeId?: EntityId; scenicSpotIds: EntityId[]; asset3DIds: EntityId[]; gameIds: EntityId[] };
  status: PublishStatus;
  participantCount: number;
  publishedAt?: ISODateString;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface ScenicAppConfig {
  scenicArea: { id: "hangzhou-west-lake"; name: "杭州西湖风景名胜区" };
  activeTheme: ThemeConfig;
  publishedAssets: Asset3D[];
  publishedGames: GameConfig[];
  publishedActivities: Activity[];
  version: number;
  updatedAt: ISODateString;
}

export const WEST_LAKE_IDS = {
  scenicArea: "hangzhou-west-lake",
  scenes: { brokenBridge: "scene-broken-bridge", leifengPagoda: "scene-leifeng-pagoda", reserved: "scene-west-lake-reserved" },
  themes: { default: "theme-default-west-lake", midAutumn: "theme-mid-autumn-gathering", nationalDay: "theme-national-day" },
  spots: { brokenBridge: "spot-broken-bridge", leifengPagoda: "spot-leifeng-pagoda" },
  interactions: { story: "interaction-broken-bridge-story", riddle: "interaction-mid-autumn-riddle", teleport: "interaction-scene-teleport" },
  miniGames: { riddle: "minigame-lantern-riddle" },
  rewards: { moonBridgeCard: "reward-moonlit-broken-bridge" },
} as const;

export interface ScenicArea { id: EntityId; name: string; description: string }
export interface Scene { id: EntityId; scenicAreaId: EntityId; name: string; slug: string; enabled: boolean; sortOrder: number }
export interface Theme {
  id: EntityId;
  name: string;
  description: string;
  sceneIds: EntityId[];
  tokens: { sky: string; water: string; accent: string; atmosphere: string };
  isBuiltIn?: boolean;
  baseThemeId?: EntityId;
  coverKey?: string;
  environment?: { period: string; lighting: string; decoration: string };
}
export interface Spot { id: EntityId; sceneId: EntityId; name: string; description: string; position: { x: number; y: number; z: number } }
export type InteractionPointType = "story" | "mini_game" | "teleport";
export interface InteractionPoint { id: EntityId; sceneId: EntityId; spotId?: EntityId; name: string; type: InteractionPointType; enabled: boolean; position: { x: number; y: number; z: number }; miniGameId?: EntityId; rewardId?: EntityId; targetSceneId?: EntityId }
export type MiniGameType = "lantern_riddle" | "puzzle" | "treasure_hunt" | "poetry_challenge";
export interface RiddleGameConfig { question: string; options: string[]; correctOptionIndex: number; successMessage: string; failureMessage: string }
export interface MiniGame { id: EntityId; name: string; type: MiniGameType; description: string; rewardId?: EntityId; status?: "active" | "placeholder"; riddle?: RiddleGameConfig; coverKey?: string }
export interface Reward { id: EntityId; name: string; description: string; type: "collectible_card"; imageKey: string }
export interface UserProgress { completedInteractionIds: EntityId[]; unlockedRewardIds: EntityId[] }
export interface ScenicExperienceConfig {
  scenicArea: ScenicArea;
  scenes: Scene[];
  themes: Theme[];
  spots: Spot[];
  interactionPoints: InteractionPoint[];
  miniGames: MiniGame[];
  rewards: Reward[];
  activeThemeId: EntityId;
  availableThemeIds: EntityId[];
  version: number;
  updatedAt: ISODateString;
}

export interface AdminConfigState {
  draftConfig: ScenicExperienceConfig;
  publishedConfig: ScenicExperienceConfig;
  hasUnpublishedChanges: boolean;
  status: "saved" | "unpublished_changes" | "published";
}
