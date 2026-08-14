import { BatteryMedium, SignalHigh, Wifi } from "lucide-react";

import "./styles.css";

interface MobileStatusBarProps {
  readonly className?: string;
}

export function MobileStatusBar({ className }: MobileStatusBarProps) {
  const classes = className ? `mobile-status-bar ${className}` : "mobile-status-bar";

  return (
    <div className={classes} aria-label="当前时间 9 点 24 分">
      <time className="mobile-status-bar__time">9:24</time>
      <span className="mobile-status-bar__indicators" aria-hidden="true">
        <SignalHigh size={14} strokeWidth={2.2} />
        <Wifi size={14} strokeWidth={2.2} />
        <BatteryMedium size={16} strokeWidth={2.2} />
      </span>
    </div>
  );
}
