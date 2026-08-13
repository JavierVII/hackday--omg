import type { AdminConfigState, InteractionPoint, MiniGame, ScenicExperienceConfig, Theme } from "@hackday/contracts";
import { ConfigRepository } from "../repositories/configRepository.js";

const clone = <T>(value: T): T => structuredClone(value);
export class ConfigService {
  constructor(private readonly repository = new ConfigRepository()) {}
  async getClientConfig(): Promise<ScenicExperienceConfig> { return clone((await this.repository.read()).publishedConfig); }
  async getAdminConfig(): Promise<AdminConfigState> { return this.repository.read(); }
  async updateTheme(activeThemeId: string, availableThemeIds?: string[]): Promise<AdminConfigState> {
    return this.repository.updateDraft((draft) => {
      const themeIds = new Set(draft.themes.map((theme) => theme.id));
      if (!themeIds.has(activeThemeId)) throw new Error("未知主题 ID");
      if (availableThemeIds && availableThemeIds.some((id) => !themeIds.has(id))) throw new Error("游客可选主题包含未知 ID");
      draft.activeThemeId = activeThemeId;
      if (availableThemeIds) draft.availableThemeIds = [...new Set(availableThemeIds)];
    });
  }
  async updateInteraction(id: string, enabled: boolean): Promise<AdminConfigState> {
    return this.repository.updateDraft((draft) => {
      const interaction = draft.interactionPoints.find((item) => item.id === id);
      if (!interaction) throw new Error("未知互动点 ID"); interaction.enabled = enabled;
    });
  }
  async updateInteractionDefinition(id: string, patch: Partial<InteractionPoint>): Promise<AdminConfigState> {
    return this.repository.updateDraft((draft) => {
      const index = draft.interactionPoints.findIndex((item) => item.id === id);
      if (index < 0) throw new Error("未知互动点 ID");
      const next = { ...draft.interactionPoints[index], ...patch, id };
      if (!draft.scenes.some((scene) => scene.id === next.sceneId)) throw new Error("绑定场景不存在");
      if (next.miniGameId && !draft.miniGames.some((game) => game.id === next.miniGameId)) throw new Error("绑定玩法不存在");
      if (next.rewardId && !draft.rewards.some((reward) => reward.id === next.rewardId)) throw new Error("绑定奖励不存在");
      draft.interactionPoints[index] = next;
    });
  }
  async updateMiniGame(id: string, patch: Partial<MiniGame>): Promise<AdminConfigState> {
    return this.repository.updateDraft((draft) => {
      const index = draft.miniGames.findIndex((game) => game.id === id);
      if (index < 0) throw new Error("未知玩法 ID");
      const next = { ...draft.miniGames[index], ...patch, id };
      if (next.rewardId && !draft.rewards.some((reward) => reward.id === next.rewardId)) throw new Error("绑定奖励不存在");
      if (next.type === "lantern_riddle") {
        const riddle = next.riddle;
        if (!riddle || riddle.options.length < 2 || riddle.correctOptionIndex < 0 || riddle.correctOptionIndex >= riddle.options.length) throw new Error("灯谜题目配置不完整");
      }
      draft.miniGames[index] = next;
    });
  }
  async createTheme(theme: Theme, allowVisitorSelection: boolean): Promise<AdminConfigState> {
    return this.repository.updateDraft((draft) => {
      if (draft.themes.some((item) => item.id === theme.id)) throw new Error("主题 ID 已存在");
      if (!theme.baseThemeId || !draft.themes.some((item) => item.id === theme.baseThemeId)) throw new Error("基础模板不存在");
      draft.themes.push({ ...theme, isBuiltIn: false });
      if (allowVisitorSelection) draft.availableThemeIds.push(theme.id);
    });
  }
  async updateThemeDefinition(id: string, theme: Theme, allowVisitorSelection: boolean): Promise<AdminConfigState> {
    return this.repository.updateDraft((draft) => {
      const index = draft.themes.findIndex((item) => item.id === id);
      if (index < 0) throw new Error("主题不存在");
      if (draft.themes[index].isBuiltIn !== false) throw new Error("内置主题不可编辑");
      draft.themes[index] = { ...theme, id, isBuiltIn: false };
      draft.availableThemeIds = allowVisitorSelection ? [...new Set([...draft.availableThemeIds, id])] : draft.availableThemeIds.filter((item) => item !== id);
    });
  }
  async deleteTheme(id: string): Promise<AdminConfigState> {
    return this.repository.updateDraft((draft) => {
      const theme = draft.themes.find((item) => item.id === id);
      if (!theme) throw new Error("主题不存在");
      if (theme.isBuiltIn !== false) throw new Error("内置主题不可删除");
      if (draft.activeThemeId === id) throw new Error("请先切换待发布默认主题再删除");
      draft.themes = draft.themes.filter((item) => item.id !== id);
      draft.availableThemeIds = draft.availableThemeIds.filter((item) => item !== id);
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
