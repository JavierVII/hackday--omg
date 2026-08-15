import type { MiniGameContext, MiniGameId } from './types'

export interface ActiveMiniGame {
  id: MiniGameId
  context?: MiniGameContext
}

let activeMiniGame: ActiveMiniGame | undefined
const listeners = new Set<() => void>()

const emit = () => listeners.forEach(listener => listener())

export function openMiniGame(miniGameId: MiniGameId, context?: MiniGameContext) {
  activeMiniGame = { id: miniGameId, context }
  emit()
}

export function closeMiniGame() {
  if (!activeMiniGame) return
  activeMiniGame = undefined
  emit()
}

export const miniGameStore = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot: () => activeMiniGame,
  getServerSnapshot: () => undefined,
}
