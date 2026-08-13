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
