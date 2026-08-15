import type { MiniGame } from "../../mocks/contracts";

// 猜灯谜小游戏对接接口
// 后续成员实现真实游戏后，在应用启动处调用 registerLanternRiddleGame(...) 即可接管，
// 未注册时自动回退到内置的简易灯谜弹层。
export interface LanternRiddleContext {
  // Published Config 中的小游戏配置（题目、选项、提示、奖励 ID）
  game: MiniGame;
  // 触发交互的互动点 ID
  interactionId: string;
  // 通关：由游戏方在玩家答对后调用，客户端据此发放奖励并推进任务
  onSuccess: () => void;
  // 放弃 / 关闭：返回游览，不发放奖励
  onClose: () => void;
}

export type LanternRiddleLauncher = (
  context: LanternRiddleContext
) => void | Promise<void>;

let launcher: LanternRiddleLauncher | null = null;

export function registerLanternRiddleGame(next: LanternRiddleLauncher | null) {
  launcher = next;
}

export function hasLanternRiddleGame() {
  return launcher !== null;
}

export async function launchLanternRiddleGame(context: LanternRiddleContext) {
  if (!launcher) return false;
  await launcher(context);
  return true;
}
