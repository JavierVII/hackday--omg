import type { TargetOutcome } from './TouhuTarget'

export type TouhuPhase = 'cover' | 'aiming' | 'flying' | 'result' | 'summary' | 'reward'

export type TouhuThrow = { grade: TargetOutcome; score: number }

export interface TouhuGameResult {
  score: number
  hitCount: number
  perfectCount: number
  maxCombo: number
  completed: boolean
}

export interface TouhuGameProps {
  onClose?: () => void
  onComplete?: (result: TouhuGameResult) => void
}
