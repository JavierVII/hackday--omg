import type { ButtonHTMLAttributes, ReactNode } from "react";
export function Button({ children, className = "", loading = false, disabled, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; loading?: boolean }) {
  return <button className={`button ${className}`} disabled={disabled || loading} {...props}>{loading ? "正在处理…" : children}</button>;
}
