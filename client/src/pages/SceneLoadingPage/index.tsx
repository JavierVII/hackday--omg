import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { fetchConfig } from "../../services/clientConfigService";
import { MobileStatusBar } from "../../components/common/MobileStatusBar";
import "../../styles/scene-experience.css";

/** 模拟定位校准过程的分步提示，与进度条同步推进。 */
const STEPS = ["加载场景资源…", "校准定位…", "同步位置…", "模拟定位已就绪"] as const;

type LoadState =
  | { kind: "loading"; sceneName: string }
  | { kind: "missing" };

export function SceneLoadingPage() {
  const navigate = useNavigate();
  const { sceneId } = useParams<{ sceneId: string }>();

  const [state, setState] = useState<LoadState | null>(null);
  const [progress, setProgress] = useState(0);

  // 先确认场景在公共配置里存在，避免直接进 3D 页后白屏。
  useEffect(() => {
    let cancelled = false;

    fetchConfig()
      .then((config) => {
        if (cancelled) return;
        const scene = config.scenes.find((item) => item.id === sceneId);
        setState(scene ? { kind: "loading", sceneName: scene.name } : { kind: "missing" });
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "missing" });
      });

    return () => {
      cancelled = true;
    };
  }, [sceneId]);

  useEffect(() => {
    if (state?.kind !== "loading") return;
    const timer = setInterval(() => {
      setProgress((current) => Math.min(100, current + 4 + Math.random() * 6));
    }, 120);
    return () => clearInterval(timer);
  }, [state?.kind]);

  useEffect(() => {
    if (state?.kind !== "loading" || progress < 100) return;
    const timer = setTimeout(() => {
      navigate(`/scene/${sceneId}/explore`, { replace: true });
    }, 500);
    return () => clearTimeout(timer);
  }, [navigate, progress, sceneId, state?.kind]);

  // 配置缺失时给出返回路径，而不是停在空白进度条上。
  if (state?.kind === "missing") {
    return (
      <div className="loading-page">
        <MobileStatusBar className="scene-status" />
        <div className="loading-brand">灵境奇旅</div>
        <div className="loading-scene">场景未找到</div>
        <div className="loading-status">该场景暂未开放，请返回景区重新选择。</div>
        <button
          className="loading-fallback"
          type="button"
          onClick={() => navigate("/scenic/hangzhou-west-lake", { replace: true })}
        >
          返回景区详情
        </button>
      </div>
    );
  }

  const stepIndex = Math.min(STEPS.length - 1, Math.floor((progress / 100) * STEPS.length));

  return (
    <div className="loading-page">
      <MobileStatusBar className="scene-status" />
      <div className="loading-brand">灵境奇旅</div>
      <div className="loading-scene">正在进入 · {state?.sceneName ?? "西湖实景"}</div>
      <div className="loading-bar">
        <div className="loading-bar-inner" style={{ width: `${progress}%` }} />
      </div>
      <div className="loading-status">{STEPS[stepIndex]}</div>
      <div className="loading-percent">{Math.floor(progress)}%</div>
    </div>
  );
}
