import { useEffect, useMemo, useState } from "react";
import { Check, CircleAlert, CloudSun, Eye, LampDesk, Plus, Save, Sparkles, Sun } from "lucide-react";
import { WEST_LAKE_IDS, type AdminConfigState, type Theme } from "@hackday/contracts";
import { Button, Card, Loading, StatusBadge } from "../../components/ui";
import { configService } from "../../services/config";
import { useToast } from "../../store/ToastProvider";
import { ThemeVisitorPreview } from "../../components/themes/ThemeVisitorPreview";
import { ThemeEditorModal, type ThemeEditorResult } from "../../components/themes/ThemeEditorModal";
import { useSearchParams } from "react-router-dom";

const ids = WEST_LAKE_IDS.themes;
const themeMeta: Record<string, { tag: string; period: string; light: string; decoration: string; visual: string }> = {
  [ids.default]: { tag: "常态运营", period: "日间", light: "自然天光", decoration: "轻雾与湖面波光", visual: "晴空、远山与雾绿湖面，保持西湖日常游览的自然层次。" },
  [ids.midAutumn]: { tag: "节庆限定", period: "暮色 / 夜间", light: "月光与暖灯", decoration: "圆月、灯笼、桂花", visual: "深蓝暮色、明月与暖色灯影共同营造中秋夜游氛围。" },
  [ids.nationalDay]: { tag: "筹备中", period: "黄昏", light: "节庆暖光", decoration: "国庆主题陈设", visual: "庄重克制的节庆色彩，目前暂未向游客开放。" },
};

const themeName = (state: AdminConfigState | undefined, id: string) => state?.draftConfig.themes.find((item) => item.id === id)?.name ?? "—";
const arraysEqual = (a: string[], b: string[]) => a.length === b.length && a.every((item) => b.includes(item));

export function ThemesPage() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState<AdminConfigState>();
  const [selectedId, setSelectedId] = useState<string>(ids.default);
  const [availableIds, setAvailableIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editorTheme, setEditorTheme] = useState<Theme | "new" | null>(null);

  useEffect(() => { configService.getAdminConfig().then((next) => { setState(next); setSelectedId(next.draftConfig.activeThemeId); setAvailableIds(next.draftConfig.availableThemeIds ?? [ids.default, ids.midAutumn]); if (searchParams.get("create") === "1") { setEditorTheme("new"); setSearchParams({}, { replace: true }); } }).catch((reason) => setError(reason instanceof Error ? reason.message : "配置加载失败")); }, []);
  const selectedTheme = state?.draftConfig.themes.find((theme) => theme.id === selectedId);
  const selectedMeta = selectedTheme ? (themeMeta[selectedId] ?? { tag: "自定义", period: selectedTheme.environment?.period ?? "日间", light: selectedTheme.environment?.lighting ?? "自然天光", decoration: selectedTheme.environment?.decoration ?? "主题装饰", visual: selectedTheme.description }) : undefined;
  const isEditing = !!state && (selectedId !== state.draftConfig.activeThemeId || !arraysEqual(availableIds, state.draftConfig.availableThemeIds ?? []));
  const displayStatus = isEditing ? "编辑中" : state?.hasUnpublishedChanges ? "有未发布修改" : "已发布";
  const toggleAvailable = (id: string) => setAvailableIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const save = async () => {
    if (!availableIds.includes(selectedId)) return showToast("默认主题必须允许游客使用", "info");
    setSaving(true); try { const next = await configService.updateDraftTheme(selectedId, availableIds); setState(next); showToast("主题配置已保存"); } catch (reason) { showToast(reason instanceof Error ? reason.message : "保存失败", "info"); } finally { setSaving(false); }
  };
  const availableNames = useMemo(() => availableIds.map((id) => state?.draftConfig.themes.find((theme) => theme.id === id)?.name).filter(Boolean).join("、"), [availableIds, state]);
  const saveCustomTheme = async ({ theme, allowVisitorSelection }: ThemeEditorResult) => { const next = editorTheme === "new" ? await configService.createDraftTheme(theme, allowVisitorSelection) : await configService.updateDraftThemeDefinition(theme.id, theme, allowVisitorSelection); setState(next); setSelectedId(next.draftConfig.activeThemeId); setAvailableIds(next.draftConfig.availableThemeIds); setEditorTheme(null); showToast(editorTheme === "new" ? "自定义主题已保存为 Draft" : "自定义主题已更新"); };
  const deleteCustomTheme = async (theme: Theme) => { try { const next = await configService.deleteDraftTheme(theme.id); setState(next); if (selectedId === theme.id) setSelectedId(next.draftConfig.activeThemeId); setAvailableIds(next.draftConfig.availableThemeIds); showToast("自定义主题已删除"); } catch (reason) { showToast(reason instanceof Error ? reason.message : "删除失败", "info"); } };

  if (error) return <div className="page themes-page"><Card className="theme-error"><CircleAlert/>无法连接配置服务：{error}</Card></div>;
  if (!state || !selectedTheme) return <div className="page themes-page"><Loading label="正在读取景区主题配置"/></div>;
  const publishedTheme = state.publishedConfig.themes.find((theme) => theme.id === state.publishedConfig.activeThemeId)!;
  return <div className="page themes-page">
    <div className="themes-title"><div><p>杭州西湖风景名胜区 · 主题运营</p><h1>景区主题配置</h1><span>选择游客默认体验与可开放主题，保存后由“预览并发布”统一上线。</span></div><div className="theme-save-area"><span className={`edit-state ${displayStatus === "编辑中" ? "editing" : state.hasUnpublishedChanges ? "pending" : "published"}`}><i/>{displayStatus}</span><Button onClick={save} disabled={saving || !isEditing}>{saving ? "保存中…" : <><Save size={16}/>保存修改</>}</Button></div></div>
    <section className="theme-status-grid"><Card><small>当前线上主题</small><strong>{publishedTheme.name}</strong><span>游客当前正在体验</span></Card><Card><small>待发布主题</small><strong>{themeName(state, state.draftConfig.activeThemeId)}</strong><span>{state.hasUnpublishedChanges ? "已保存至 Draft" : "与线上保持一致"}</span></Card><Card><small>Published version</small><strong>v{state.publishedConfig.version}</strong><span>{new Date(state.publishedConfig.updatedAt).toLocaleString("zh-CN")}</span></Card><Card className={state.hasUnpublishedChanges ? "has-change" : ""}><small>配置状态</small><strong>{state.hasUnpublishedChanges ? "有未发布修改" : "已发布"}</strong><span>{state.hasUnpublishedChanges ? "等待后续统一发布" : "Draft 与线上一致"}</span></Card></section>
    <div className="themes-workspace"><section className="theme-library"><div className="section-heading"><div><h2>主题方案库</h2><p>点击方案即可在右侧查看游客端效果</p></div><Button className="compact-button" onClick={()=>setEditorTheme("new")}><Plus size={15}/>新建主题</Button></div><div className="theme-card-grid">{state.draftConfig.themes.map((theme) => <ThemeCard key={theme.id} theme={theme} selected={selectedId === theme.id} published={state.publishedConfig.activeThemeId === theme.id} pending={theme.isBuiltIn===false || state.draftConfig.activeThemeId === theme.id && state.hasUnpublishedChanges} available={availableIds.includes(theme.id)} locked={theme.id === ids.nationalDay} onSelect={() => theme.id !== ids.nationalDay && setSelectedId(theme.id)} onToggle={() => theme.id !== ids.nationalDay && toggleAvailable(theme.id)} onEdit={()=>setEditorTheme(theme)} onDelete={()=>deleteCustomTheme(theme)}/>)}</div>
      <Card className="theme-detail"><div className="section-heading"><div><h2>主题详情</h2><p>{selectedTheme.description}</p></div><StatusBadge tone={selectedId === state.publishedConfig.activeThemeId ? "success" : "warning"}>{selectedId === state.publishedConfig.activeThemeId ? "当前线上" : selectedId === state.draftConfig.activeThemeId && state.hasUnpublishedChanges ? "待发布" : "预览中"}</StatusBadge></div><div className="theme-detail-grid"><Detail icon={<CloudSun/>} label="环境氛围" value={selectedTheme.tokens.atmosphere === "moonlight" ? "月夜雅集" : selectedTheme.tokens.atmosphere === "mist" ? "湖畔轻雾" : "节庆氛围"}/><Detail icon={<Sun/>} label="时间段" value={selectedMeta!.period}/><Detail icon={<LampDesk/>} label="灯光类型" value={selectedMeta!.light}/><Detail icon={<Sparkles/>} label="装饰类型" value={selectedMeta!.decoration}/></div><p className="visual-note"><Eye size={15}/><span><strong>视觉效果说明</strong>{selectedMeta!.visual}</span></p></Card>
    </section><aside className="theme-preview-column"><div className="section-heading"><div><h2>游客端效果预览</h2><p>仅用于 Admin 模拟预览，不影响当前线上配置</p></div><span className="preview-live"><i/>模拟预览</span></div><ThemeVisitorPreview theme={selectedTheme}/><Card className="change-summary"><h2>本次修改</h2><dl><div><dt>当前线上</dt><dd>{publishedTheme.name}</dd></div><div><dt>待发布</dt><dd>{selectedTheme.name}</dd></div><div><dt>游客可选主题</dt><dd>{availableNames || "无"}</dd></div><div><dt>影响</dt><dd>游客首次进入场景后的默认视觉；不重置位置、任务或奖励</dd></div></dl></Card></aside></div>
    {editorTheme&&<ThemeEditorModal templates={state.draftConfig.themes.filter((item)=>item.isBuiltIn!==false)} initial={editorTheme==="new"?undefined:editorTheme} initiallyAvailable={editorTheme!=="new"&&availableIds.includes(editorTheme.id)} onClose={()=>setEditorTheme(null)} onSave={saveCustomTheme}/>}</div>;
}

function ThemeCard({ theme, selected, published, pending, available, locked, onSelect, onToggle, onEdit, onDelete }: { theme: Theme; selected: boolean; published: boolean; pending: boolean; available: boolean; locked: boolean; onSelect: () => void; onToggle: () => void; onEdit:()=>void; onDelete:()=>void }) {
  const meta = themeMeta[theme.id];
  const customMeta=theme.environment?{...meta,period:theme.environment.period,light:theme.environment.lighting,decoration:theme.environment.decoration}:meta;
  return <Card className={`theme-option ${selected ? "selected" : ""} theme-${theme.id}`} onClick={onSelect}><div className="theme-art" style={theme.isBuiltIn===false?{background:`linear-gradient(${theme.tokens.sky} 0 58%,${theme.tokens.water} 58%)`}:undefined}><div className="art-moon"/><div className="art-mountains"/><div className="art-pagoda">塔</div><span>{theme.isBuiltIn===false?"自定义":customMeta.tag}</span>{theme.isBuiltIn===false&&<div className="custom-card-actions"><button onClick={(event)=>{event.stopPropagation();onEdit();}}>编辑</button><button onClick={(event)=>{event.stopPropagation();onDelete();}}>删除</button></div>}</div><div className="theme-option-body"><div><h3>{theme.name}</h3>{published ? <StatusBadge>当前线上</StatusBadge> : pending ? <StatusBadge tone="warning">待发布</StatusBadge> : locked ? <StatusBadge tone="neutral">未开放</StatusBadge> : <StatusBadge tone="neutral">可选</StatusBadge>}</div><p>{theme.description}</p><div className="theme-tags"><span>{customMeta.period}</span><span>{customMeta.decoration}</span></div><button type="button" className="availability-toggle" disabled={locked} onClick={(event) => { event.stopPropagation(); onToggle(); }}><span className={available ? "on" : ""}><i/></span><em>{locked ? "暂未开放" : "允许游客选择"}</em>{available && !locked && <Check size={14}/>}</button></div></Card>;
}
function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div>{icon}<span><small>{label}</small><strong>{value}</strong></span></div>; }
