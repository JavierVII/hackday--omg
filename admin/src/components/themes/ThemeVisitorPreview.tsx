import type { Theme } from "@hackday/contracts";
import { MoonStar, Sparkles, Users } from "lucide-react";

export interface ThemePreviewViewModel { mode: "default" | "mid-autumn" | "national"; hotspot: string; headline: string; caption: string }
export interface ThemePreviewAdapter { toViewModel(theme: Theme): ThemePreviewViewModel }

export const mockThemePreviewAdapter: ThemePreviewAdapter = {
  toViewModel(theme) {
    const mode = theme.tokens.atmosphere === "moonlight" ? "mid-autumn" : theme.tokens.atmosphere === "celebration" ? "national" : "default";
    return mode === "mid-autumn"
      ? { mode, hotspot: "中秋猜灯谜", headline: "月映西湖，雅集正当时", caption: "灯影、明月与桂香已应用到模拟预览" }
      : { mode, hotspot: "断桥故事", headline: "山水相依，漫游西湖", caption: "自然天光与雾绿湖色已应用到模拟预览" };
  },
};

export function ThemeVisitorPreview({ theme, adapter = mockThemePreviewAdapter }: { theme: Theme; adapter?: ThemePreviewAdapter }) {
  const view = adapter.toViewModel(theme);
  return <div className={`visitor-preview ${view.mode}`}><div className="preview-sky"><div className="preview-moon"/><span className="preview-cloud cloud-one"/><span className="preview-cloud cloud-two"/></div><div className="preview-mountains mountain-one"/><div className="preview-mountains mountain-two"/><div className="preview-pagoda"><i/><i/><i/><span/></div><div className="preview-lake"><span/><span/></div>{view.mode === "mid-autumn" && <div className="lanterns"><i/><i/><i/></div>}<div className="visitor-hud"><div><small>杭州西湖 · 断桥残雪</small><strong>{theme.name}</strong></div><span><Users size={14}/>模拟定位</span></div><div className="preview-hotspot"><Sparkles size={14}/><span>{view.hotspot}</span></div><div className="preview-caption"><MoonStar size={16}/><div><strong>{view.headline}</strong><span>{view.caption}</span></div></div><span className="mock-preview-label">模拟预览</span></div>;
}
