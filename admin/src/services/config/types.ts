import type { AdminConfigState, ScenicExperienceConfig } from "@hackday/contracts";

export interface ConfigService {
  getAdminConfig(): Promise<AdminConfigState>;
  updateDraftTheme(activeThemeId: string): Promise<AdminConfigState>;
  updateDraftInteraction(id: string, enabled: boolean): Promise<AdminConfigState>;
  publish(): Promise<AdminConfigState>;
  getPublishedConfig(): Promise<ScenicExperienceConfig>;
}
