import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ColorMode = "dark" | "light";
const THEME_KEY = "hackday-omg:admin:theme";

interface ThemeContextValue { mode: ColorMode; toggleMode: () => void }
const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialMode(): ColorMode {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ColorMode>(getInitialMode);
  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    localStorage.setItem(THEME_KEY, mode);
  }, [mode]);
  const value = useMemo(() => ({ mode, toggleMode: () => setMode((value) => value === "dark" ? "light" : "dark") }), [mode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider");
  return value;
}
