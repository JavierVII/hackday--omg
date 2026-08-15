import { useEffect, useLayoutEffect, type CSSProperties } from "react";
import { useNavigate } from "react-router";

import { useUiStore } from "../../../app/stores/uiStore";

import "./styles.css";

/**
 * 「穿门入境」过场层：进入页 → 游客端之间的一段门。
 *
 * 合门（墨色自手机屏心洇满画面）→ 切路由 → 开门（光圈自同一圆心张开）。
 * 两段时长必须与 styles.css 里的关键帧总长一致，改一处要同时改另一处。
 */
const CLOSING_MS = 820;
const OPENING_MS = 840;

/** 涟漪三圈，逐圈延迟写在 CSS 的 nth-child 上 */
const RIPPLES = [0, 1, 2] as const;

export function GateTransition() {
  const phase = useUiStore((state) => state.gate.phase);
  const origin = useUiStore((state) => state.gate.origin);
  const target = useUiStore((state) => state.gate.target);
  const openGate = useUiStore((state) => state.openGate);
  const settleGate = useUiStore((state) => state.settleGate);
  const navigate = useNavigate();

  // 合门结束：此刻画面已被墨色盖满，切路由不会被看见，随即转入开门
  useEffect(() => {
    if (phase !== "closing" || target === null) {
      return;
    }

    const timer = window.setTimeout(() => {
      navigate(target);
      openGate();
    }, CLOSING_MS);

    return () => window.clearTimeout(timer);
  }, [navigate, openGate, phase, target]);

  // 开门结束：卸载过场层，把画面交还页面
  useEffect(() => {
    if (phase !== "opening") {
      return;
    }

    const timer = window.setTimeout(settleGate, OPENING_MS);

    return () => window.clearTimeout(timer);
  }, [phase, settleGate]);

  /* 落地页面的浮出动画挂在 :root[data-gate] 上（见 styles/global.css）。
     必须在浏览器绘制前写好，用 useEffect 会先闪一帧未模糊的页面。 */
  useLayoutEffect(() => {
    const { documentElement } = document;

    if (phase === "idle") {
      delete documentElement.dataset.gate;

      return;
    }

    documentElement.dataset.gate = phase;

    return () => {
      delete documentElement.dataset.gate;
    };
  }, [phase]);

  if (phase === "idle") {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="gate"
      data-phase={phase}
      /* 圆心交给 CSS 变量：遮罩、月轮、金环、涟漪共用同一个圆心 */
      style={
        origin === null
          ? undefined
          : ({ "--gate-x": `${origin.x}px`, "--gate-y": `${origin.y}px` } as CSSProperties)
      }
    >
      <div className="gate__veil">
        <div className="gate__grain" />
      </div>

      <div className="gate__ripples">
        {RIPPLES.map((index) => (
          <i key={index} />
        ))}
      </div>

      <div className="gate__moon" />

      <div className="gate__caption">
        <p className="gate__title">
          <span>入</span>
          <span>画</span>
        </p>
        <span className="gate__seal">灵境</span>
      </div>

      {/* 门框：合门时向外掠过，开门时再掠一次，像是真的穿了过去 */}
      <div className="gate__ring" />
    </div>
  );
}
