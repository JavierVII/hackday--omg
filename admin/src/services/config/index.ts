import { httpConfigService } from "./httpConfigService";
import { mockConfigService } from "./mockConfigService";
export type { ConfigService } from "./types";
export const configService = (import.meta.env.VITE_CONFIG_MODE ?? "mock") === "mock" ? mockConfigService : httpConfigService;
