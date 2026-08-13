import type { AdminConfigState, ScenicExperienceConfig } from "@hackday/contracts";
import type { ConfigService } from "./types";

const API_URL = import.meta.env.VITE_CONFIG_API_URL ?? "http://127.0.0.1:8787";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { ...init, headers: { "content-type": "application/json", ...init?.headers } });
  const body = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(body.error ?? "配置服务请求失败"); return body;
}
export const httpConfigService: ConfigService = {
  getAdminConfig: () => request<AdminConfigState>("/api/admin/config"),
  updateDraftTheme: (activeThemeId) => request<AdminConfigState>("/api/admin/draft/theme", { method: "PATCH", body: JSON.stringify({ activeThemeId }) }),
  updateDraftInteraction: (id, enabled) => request<AdminConfigState>(`/api/admin/draft/interactions/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ enabled }) }),
  publish: () => request<AdminConfigState>("/api/admin/publish", { method: "POST" }),
  getPublishedConfig: () => request<ScenicExperienceConfig>("/api/client/config"),
};
