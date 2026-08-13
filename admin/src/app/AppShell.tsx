import { Box, LayoutDashboard, Moon, Palette, Settings2, Sun } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useTheme } from "../theme/ThemeProvider";

const navItems = [
  { to: "/dashboard", label: "工作台", icon: LayoutDashboard },
  { to: "/assets", label: "3D资产", icon: Box },
  { to: "/themes", label: "节日装扮", icon: Palette },
  { to: "/operations", label: "运营管理", icon: Settings2 },
];

export function AppShell() {
  const { mode, toggleMode } = useTheme();
  return <div className="app-frame">
    <div className="app-shell">
      <header className="app-header">
        <div><span className="brand-mark">管理端</span><span className="scenic-label">杭州西湖风景名胜区</span></div>
        <button className="icon-button" onClick={toggleMode} aria-label="切换深浅色模式">
          {mode === "dark" ? <Sun size={19}/> : <Moon size={19}/>} 
        </button>
      </header>
      <main className="app-content"><Outlet/></main>
      <nav className="bottom-nav" aria-label="主要导航">
        {navItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <Icon size={21}/><span>{label}</span>
        </NavLink>)}
      </nav>
    </div>
  </div>;
}
