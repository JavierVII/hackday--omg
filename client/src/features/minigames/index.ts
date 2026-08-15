import type { MiniGame, MiniGameType } from "../../mocks/contracts";

// 小游戏对接接口：后续成员实现真实游戏后，调用 registerMiniGame(type, launcher) 接管。
// 未注册的类型回退到内置弹层（投壶未注册时显示占位提示）。
export interface MiniGameContext {
  game: MiniGame;
  interactionId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export type MiniGameLauncher = (
  context: MiniGameContext
) => void | Promise<void>;

const launchers = new Map<MiniGameType, MiniGameLauncher>();

export function registerMiniGame(
  type: MiniGameType,
  launcher: MiniGameLauncher | null
) {
  if (launcher) launchers.set(type, launcher);
  else launchers.delete(type);
}

export function hasMiniGame(type: MiniGameType) {
  return launchers.has(type);
}

export async function launchMiniGame(
  type: MiniGameType,
  context: MiniGameContext
) {
  const launcher = launchers.get(type);
  if (launcher === undefined) return false;
  await launcher(context);
  return true;
}
