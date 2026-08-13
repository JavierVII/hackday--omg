import type { ReactNode } from "react";
export function StatusBadge({ children, tone = "success" }: { children: ReactNode; tone?: "success" | "warning" | "neutral" }) {
  return <span className={`status-badge status-${tone}`}>{children}</span>;
}
