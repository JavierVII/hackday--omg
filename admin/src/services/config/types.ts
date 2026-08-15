import type { AdminConfigState, InteractionPoint, MiniGame, ScenicExperienceConfig, Theme } from "@hackday/contracts";

export interface ConfigService {
  getAdminConfig(): Promise<AdminConfigState>;
  updateDraftTheme(activeThemeId: string, availableThemeIds?: string[]): Promise<AdminConfigState>;
  createDraftTheme(theme: Theme, allowVisitorSelection: boolean): Promise<AdminConfigState>;
  updateDraftThemeDefinition(id: string, theme: Theme, allowVisitorSelection: boolean): Promise<AdminConfigState>;
  deleteDraftTheme(id: string): Promise<AdminConfigState>;
  updateDraftInteraction(id: string, enabled: boolean): Promise<AdminConfigState>;
  updateDraftInteractionDefinition(id: string, patch: Partial<InteractionPoint>): Promise<AdminConfigState>;
  updateDraftMiniGame(id: string, patch: Partial<MiniGame>): Promise<AdminConfigState>;
  publish(): Promise<AdminConfigState>;
  getPublishedConfig(): Promise<ScenicExperienceConfig>;
}
