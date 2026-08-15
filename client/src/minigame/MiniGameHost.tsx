import { useSyncExternalStore } from 'react'
import { getMiniGameComponent } from './MiniGameRegistry'
import { closeMiniGame, miniGameStore } from './openMiniGame'
import type { MiniGameCompleteEvent, MiniGameContext, MiniGameId } from './types'
import './minigame-host.css'

export interface MiniGameHostProps {
  miniGameId?: MiniGameId
  context?: MiniGameContext
  onClose?: () => void
  onComplete?: (event: MiniGameCompleteEvent) => void
}

export function MiniGameHost({ miniGameId, context, onClose, onComplete }: MiniGameHostProps) {
  const opened = useSyncExternalStore(miniGameStore.subscribe, miniGameStore.getSnapshot, miniGameStore.getServerSnapshot)
  const active = miniGameId ? { id: miniGameId, context } : opened
  if (!active) return null

  const Game = getMiniGameComponent(active.id)
  const close = () => {
    if (!miniGameId) closeMiniGame()
    onClose?.()
  }

  return <div className="minigame-host-overlay" role="dialog" aria-modal="true" data-mini-game-id={active.id}>
    {Game
      ? <Game onClose={close} onComplete={result => onComplete?.({ miniGameId: active.id, context: active.context, result })} />
      : <section className="minigame-host-fallback"><h2>暂时无法打开游戏</h2><p>未知的 MiniGame ID：{active.id}</p><button onClick={close}>关闭</button></section>}
  </div>
}
