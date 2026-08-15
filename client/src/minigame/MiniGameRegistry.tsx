import type { ComponentType } from 'react'
import { BeadsGame } from '../beads'
import { LanternRiddleGame } from '../lantern-riddle'
import { TouhuGame } from '../touhu'
import { MINI_GAME_IDS, type MiniGameBoundaryProps, type MiniGameId } from './types'

const LanternRiddleEntry = ({ onClose, onComplete }: MiniGameBoundaryProps) =>
  <LanternRiddleGame onClose={onClose} onComplete={result => onComplete?.(result)} />

const TouhuEntry = ({ onClose, onComplete }: MiniGameBoundaryProps) =>
  <TouhuGame onClose={onClose} onComplete={result => onComplete?.(result)} />

const BeadsEntry = ({ onClose, onComplete }: MiniGameBoundaryProps) =>
  <BeadsGame onClose={onClose} onComplete={result => onComplete?.(result)} />

export const MINI_GAME_REGISTRY: Readonly<Record<MiniGameId, ComponentType<MiniGameBoundaryProps>>> = {
  [MINI_GAME_IDS.lanternRiddle]: LanternRiddleEntry,
  [MINI_GAME_IDS.touhu]: TouhuEntry,
  [MINI_GAME_IDS.beads]: BeadsEntry,
}

export function getMiniGameComponent(miniGameId: string) {
  return MINI_GAME_REGISTRY[miniGameId as MiniGameId]
}
