import type { AdminConfigState, ScenicExperienceConfig } from "@hackday/contracts";
import type { ConfigService } from "./types";

const KEY = "hackday-omg:admin:v1:shared-config";
const read = (): AdminConfigState => { const value = localStorage.getItem(KEY); if (!value) throw new Error("Mock Config 尚未初始化，请使用 API 模式或注入统一 Seed"); return JSON.parse(value) as AdminConfigState; };
const write = (state: AdminConfigState) => { localStorage.setItem(KEY, JSON.stringify(state)); return structuredClone(state); };
const draft = (mutate: (config: ScenicExperienceConfig) => void) => { const state = read(); mutate(state.draftConfig); state.draftConfig.updatedAt = new Date().toISOString(); state.hasUnpublishedChanges = true; state.status = "unpublished_changes"; return write(state); };
export const mockConfigService: ConfigService = {
  async getAdminConfig() { return structuredClone(read()); },
  async getPublishedConfig() { return structuredClone(read().publishedConfig); },
  async updateDraftTheme(activeThemeId, availableThemeIds) { return draft((config) => { if (!config.themes.some((theme) => theme.id === activeThemeId)) throw new Error("未知主题 ID"); config.activeThemeId = activeThemeId; if (availableThemeIds) config.availableThemeIds = [...new Set(availableThemeIds)]; }); },
  async createDraftTheme(theme, allowVisitorSelection) { return draft((config) => { config.themes.push({ ...theme, isBuiltIn: false }); if (allowVisitorSelection) config.availableThemeIds.push(theme.id); }); },
  async updateDraftThemeDefinition(id, theme, allowVisitorSelection) { return draft((config) => { const index = config.themes.findIndex((item) => item.id === id); if (index < 0 || config.themes[index].isBuiltIn !== false) throw new Error("该主题不可编辑"); config.themes[index] = { ...theme, id, isBuiltIn: false }; config.availableThemeIds = allowVisitorSelection ? [...new Set([...config.availableThemeIds, id])] : config.availableThemeIds.filter((item) => item !== id); }); },
  async deleteDraftTheme(id) { return draft((config) => { const theme = config.themes.find((item) => item.id === id); if (!theme || theme.isBuiltIn !== false) throw new Error("该主题不可删除"); config.themes = config.themes.filter((item) => item.id !== id); config.availableThemeIds = config.availableThemeIds.filter((item) => item !== id); }); },
  async updateDraftInteraction(id, enabled) { return draft((config) => { const point = config.interactionPoints.find((item) => item.id === id); if (!point) throw new Error("未知互动点 ID"); point.enabled = enabled; }); },
  async updateDraftInteractionDefinition(id, patch) { return draft((config) => { const index=config.interactionPoints.findIndex((item)=>item.id===id);if(index<0)throw new Error("未知互动点 ID");config.interactionPoints[index]={...config.interactionPoints[index],...patch,id}; }); },
  async updateDraftMiniGame(id, patch) { return draft((config) => { const index=config.miniGames.findIndex((item)=>item.id===id);if(index<0)throw new Error("未知玩法 ID");config.miniGames[index]={...config.miniGames[index],...patch,id}; }); },
  async publish() { const state = read(); state.publishedConfig = structuredClone(state.draftConfig); state.publishedConfig.version += 1; state.publishedConfig.updatedAt = new Date().toISOString(); state.draftConfig = structuredClone(state.publishedConfig); state.hasUnpublishedChanges = false; state.status = "published"; return write(state); },
};
