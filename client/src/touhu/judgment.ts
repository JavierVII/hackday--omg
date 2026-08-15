import type { TargetOutcome } from './TouhuTarget'
import type { TouhuThrow } from './types'

/** The target ring is radius 1. Scores are ten equal accuracy bands from 10 to 100. */
export function judgeTouhuThrow(error: number): TouhuThrow {
  const accuracy = 1 - Math.min(1, error / .64)
  const score = Math.max(10, Math.round(accuracy * 10) * 10)
  const grade: TargetOutcome = score === 100 ? 'PERFECT' : score >= 70 ? 'GOOD' : score >= 30 ? 'NICE' : 'MISS'
  return { grade, score }
}
