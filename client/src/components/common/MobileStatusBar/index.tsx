import { BatteryMedium, SignalHigh, Wifi } from "lucide-react";
import { useEffect, useState } from "react";

import "./styles.css";

const MINUTE_MS = 60_000;

interface MobileStatusBarProps {
  readonly className?: string;
}

/** 距离下一个整分还有多少毫秒 */
function msToNextMinute() {
  return MINUTE_MS - (Date.now() % MINUTE_MS);
}

export function MobileStatusBar({ className }: MobileStatusBarProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timeoutId = 0;

    // 每次都对齐到下一个整分再跳，避免固定 60s 轮询导致显示比系统时间慢最多 59 秒
    const tick = () => {
      setNow(new Date());
      timeoutId = window.setTimeout(tick, msToNextMinute());
    };

    timeoutId = window.setTimeout(tick, msToNextMinute());

    // 后台标签页的定时器会被节流，切回前台时立刻补一次
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      window.clearTimeout(timeoutId);
      tick();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const classes = className ? `mobile-status-bar ${className}` : "mobile-status-bar";
  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return (
    <div className={classes} aria-label={`当前时间 ${hours} 点 ${now.getMinutes()} 分`}>
      <time className="mobile-status-bar__time" dateTime={`${String(hours).padStart(2, "0")}:${minutes}`}>
        {hours}:{minutes}
      </time>
      <span className="mobile-status-bar__indicators" aria-hidden="true">
        <SignalHigh size={14} strokeWidth={2.2} />
        <Wifi size={14} strokeWidth={2.2} />
        <BatteryMedium size={16} strokeWidth={2.2} />
      </span>
    </div>
  );
}
