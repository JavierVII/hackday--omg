import { Box, ChevronLeft, ChevronRight, CircleDot, Gamepad2, LayoutDashboard, LogOut, Moon, Palette, Rocket, Sparkles, Sun, UserRound, type LucideIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTheme } from "../theme/ThemeProvider";
import { configService } from "../services/config";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { to: "/dashboard", label: "运营工作台", icon: LayoutDashboard },
  { to: "/assets", label: "景区资产 / 3D资产", icon: Box },
  { to: "/themes", label: "主题配置", icon: Palette },
  {
    to: "/operations",
    label: "互动运营",
    icon: Sparkles,
    children: [
      { to: "/operations/interactions", label: "互动点配置", icon: CircleDot },
      { to: "/operations/games", label: "玩法库", icon: Gamepad2 },
    ],
  },
  { to: "/operations/publish", label: "预览并发布", icon: Rocket },
];

/** 互动运营分组自身与子模块路径（不含 /operations/publish，避免父项误亮）。 */
const OPERATIONS_ACTIVE_PATHS = new Set(["/operations", "/operations/interactions", "/operations/games"]);

export function AdminChrome({ children }: { children: ReactNode }) {
  const { mode, toggleMode } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [onlineTheme, setOnlineTheme] = useState("默认西湖");
  const [hasChanges, setHasChanges] = useState(false);
  const { pathname } = useLocation();
  const operationsActive = OPERATIONS_ACTIVE_PATHS.has(pathname.replace(/\/+$/, ""));
  useEffect(() => { configService.getAdminConfig().then((state) => { setOnlineTheme(state.publishedConfig.themes.find((theme) => theme.id === state.publishedConfig.activeThemeId)?.name ?? "默认西湖"); setHasChanges(state.hasUnpublishedChanges); }).catch(() => undefined); }, []);
  return <div className={`desktop-app ${collapsed ? "sidebar-collapsed" : ""}`}>
    <aside className="desktop-sidebar">
      <div className="desktop-brand"><span><Sparkles size={18}/></span><div><strong>WEST LAKE</strong><small>数字景区运营平台</small></div></div>
      <nav>{navigation.map((item) => {
        const Icon = item.icon;
        if (!item.children) {
          return <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? "active" : ""}><Icon size={19}/><span>{item.label}</span></NavLink>;
        }
        return <div className="nav-group" key={item.to}>
          <NavLink to={item.to} className={operationsActive ? "active" : ""}><Icon size={19}/><span>{item.label}</span></NavLink>
          <div className="nav-children">
            {item.children.map((child) => {
              const ChildIcon = child.icon;
              return <NavLink key={child.to} to={child.to} className={({ isActive }) => isActive ? "active" : ""}><ChildIcon size={16}/><span>{child.label}</span></NavLink>;
            })}
          </div>
        </div>;
      })}</nav>
      <div className="sidebar-footer"><div className="scenic-mini"><span>杭</span><div><strong>杭州西湖</strong><small>风景名胜区</small></div></div><button onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "展开侧栏" : "收起侧栏"}>{collapsed ? <ChevronRight/> : <ChevronLeft/>}</button></div>
    </aside>
    <div className="desktop-workspace">
      <header className="desktop-header">
        <div className="header-scenic"><small>当前景区</small><strong>杭州西湖景区</strong></div>
        <div className="header-actions"><div className="online-theme"><span/><div><small>当前线上主题</small><strong>{onlineTheme}</strong></div></div><span className="publish-state">{hasChanges ? "有待发布配置" : "配置已发布"}</span><button className="icon-button" onClick={toggleMode} aria-label="切换深浅色模式">{mode === "dark" ? <Sun size={18}/> : <Moon size={18}/>}</button><button className="admin-entry"><UserRound size={17}/><span>景区管理员</span></button><a className="exit-entry" href="/" aria-label="返回进入页"><LogOut size={16} strokeWidth={1.9}/><span>返回进入页</span></a></div>
      </header>
      <main className="desktop-content">{children}</main>
    </div>
  </div>;
}
