import type { AdminConfigState, ScenicExperienceConfig } from "@hackday/contracts";
import type { InteractionPoint, MiniGame, Theme } from "@hackday/contracts";
import type { ConfigService } from "./types";

const API_URL = import.meta.env.VITE_CONFIG_API_URL ?? "http://127.0.0.1:8787";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { ...init, headers: { "content-type": "application/json", ...init?.headers } });
  const body = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(body.error ?? "配置服务请求失败"); return body;
}
export const httpConfigService: ConfigService = {
  getAdminConfig: () => request<AdminConfigState>("/api/admin/config"),
  updateDraftTheme: (activeThemeId, availableThemeIds) => request<AdminConfigState>("/api/admin/draft/theme", { method: "PATCH", body: JSON.stringify({ activeThemeId, availableThemeIds }) }),
  createDraftTheme: (theme: Theme, allowVisitorSelection) => request<AdminConfigState>("/api/admin/draft/themes", { method: "POST", body: JSON.stringify({ theme, allowVisitorSelection }) }),
  updateDraftThemeDefinition: (id, theme, allowVisitorSelection) => request<AdminConfigState>(`/api/admin/draft/themes/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ theme, allowVisitorSelection }) }),
  deleteDraftTheme: (id) => request<AdminConfigState>(`/api/admin/draft/themes/${encodeURIComponent(id)}`, { method: "DELETE" }),
  updateDraftInteraction: (id, enabled) => request<AdminConfigState>(`/api/admin/draft/interactions/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ enabled }) }),
  updateDraftInteractionDefinition: (id, patch) => request<AdminConfigState>(`/api/admin/draft/interactions/${encodeURIComponent(id)}/definition`, { method: "PATCH", body: JSON.stringify(patch) }),
  updateDraftMiniGame: (id, patch) => request<AdminConfigState>(`/api/admin/draft/games/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(patch) }),
  publish: () => request<AdminConfigState>("/api/admin/publish", { method: "POST" }),
  getPublishedConfig: () => request<ScenicExperienceConfig>("/api/client/config"),
};
