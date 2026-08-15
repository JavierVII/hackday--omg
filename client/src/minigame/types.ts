export const MINI_GAME_IDS = {
  lanternRiddle: 'minigame-lantern-riddle',
  touhu: 'minigame-touhu',
  beads: 'minigame-beads',
} as const

export type MiniGameId = typeof MINI_GAME_IDS[keyof typeof MINI_GAME_IDS]

export interface MiniGameContext {
  interactionId?: string
  sceneId?: string
  source?: 'hotspot' | 'npc' | 'button' | 'other'
}

export interface MiniGameCompleteEvent {
  miniGameId: MiniGameId
  context?: MiniGameContext
  result: unknown
}

export interface MiniGameBoundaryProps {
  onClose?: () => void
  onComplete?: (result: unknown) => void
}
