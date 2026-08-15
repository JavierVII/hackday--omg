import { useEffect, useState } from "react";

const STEPS = [
  "加载场景资源…",
  "校准定位…",
  "同步位置…",
  "模拟定位已就绪",
];

export default function SceneLoadingPage({
  sceneName,
  onDone,
}: {
  sceneName: string;
  onDone: () => void;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => Math.min(100, p + 4 + Math.random() * 6));
    }, 120);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(onDone, 500);
      return () => clearTimeout(timer);
    }
  }, [progress, onDone]);

  const stepIndex = Math.min(STEPS.length - 1, Math.floor((progress / 100) * STEPS.length));

  return (
    <div className="loading-page">
      <div className="loading-brand">灵境奇旅</div>
      <div className="loading-scene">正在进入 · {sceneName}</div>
      <div className="loading-bar">
        <div className="loading-bar-inner" style={{ width: `${progress}%` }} />
      </div>
      <div className="loading-status">{STEPS[stepIndex]}</div>
      <div className="loading-percent">{Math.floor(progress)}%</div>
    </div>
  );
}
