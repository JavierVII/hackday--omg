// Ephemeral overlay, loading, focus, and positioning UI state belongs here.
import { create } from "zustand";

/**
 * 「穿门入境」过场的阶段机：
 * idle →（点「体验游客端」）closing →（切路由）opening → idle。
 *
 * 时长与视觉见 components/overlays/GateTransition。
 */
export type GatePhase = "idle" | "closing" | "opening";

/** 光圈圆心，视口坐标（px）。null 表示落在视口正中。 */
export interface GateOrigin {
  readonly x: number;
  readonly y: number;
}

interface GateState {
  readonly origin: GateOrigin | null;
  readonly phase: GatePhase;
  /** 合门结束后要去的路由，由过场层负责跳转 */
  readonly target: string | null;
}

interface UiStore {
  readonly gate: GateState;
  /** 自 origin 处合门，随后由过场层跳到 target */
  readonly closeGate: (target: string, origin?: GateOrigin | null) => void;
  /** 路由已切换，转入开门揭幕 */
  readonly openGate: () => void;
  /** 过场结束，回到常态 */
  readonly settleGate: () => void;
}

const idleGate: GateState = { origin: null, phase: "idle", target: null };

export const useUiStore = create<UiStore>((set) => ({
  gate: idleGate,

  /* 两个入口动作都带阶段守卫：连点或重复触发时返回原 state，
     zustand 比对到同一个引用就不会再通知订阅者，也不会跳转两次。 */
  closeGate: (target, origin = null) =>
    set((state) =>
      state.gate.phase === "idle" ? { gate: { origin, phase: "closing", target } } : state,
    ),

  openGate: () =>
    set((state) =>
      state.gate.phase === "closing" ? { gate: { ...state.gate, phase: "opening" } } : state,
    ),

  settleGate: () => set({ gate: idleGate }),
}));
