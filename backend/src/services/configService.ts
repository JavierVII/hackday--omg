import type { AdminConfigState, ScenicExperienceConfig } from "@hackday/contracts";
import { ConfigRepository } from "../repositories/configRepository.js";

const clone = <T>(value: T): T => structuredClone(value);
export class ConfigService {
  constructor(private readonly repository = new ConfigRepository()) {}
  async getClientConfig(): Promise<ScenicExperienceConfig> { return clone((await this.repository.read()).publishedConfig); }
  async getAdminConfig(): Promise<AdminConfigState> { return this.repository.read(); }
  async updateTheme(activeThemeId: string): Promise<AdminConfigState> {
    return this.repository.updateDraft((draft) => {
      if (!draft.themes.some((theme) => theme.id === activeThemeId)) throw new Error("未知主题 ID");
      draft.activeThemeId = activeThemeId;
    });
  }
  async updateInteraction(id: string, enabled: boolean): Promise<AdminConfigState> {
    return this.repository.updateDraft((draft) => {
      const interaction = draft.interactionPoints.find((item) => item.id === id);
      if (!interaction) throw new Error("未知互动点 ID"); interaction.enabled = enabled;
    });
  }
  async publish(): Promise<AdminConfigState> {
    const state = await this.repository.read();
    const publishedAt = new Date().toISOString();
    state.publishedConfig = clone(state.draftConfig);
    state.publishedConfig.version = state.publishedConfig.version + 1;
    state.publishedConfig.updatedAt = publishedAt;
    state.draftConfig = clone(state.publishedConfig);
    state.hasUnpublishedChanges = false; state.status = "published";
    return this.repository.write(state);
  }
}
