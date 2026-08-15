import type { TouhuGameResult, TouhuThrow } from './types'

export const totalTouhuThrows = 5

export function getTouhuScore(throws: TouhuThrow[]) {
  return throws.reduce((sum, item) => sum + item.score, 0)
}

export function getTouhuComboStats(throws: TouhuThrow[]) {
  let current = 0
  let maxCombo = 0
  for (const item of throws) {
    current = item.score ? current + 1 : 0
    maxCombo = Math.max(maxCombo, current)
  }
  return { combo: current, maxCombo }
}

export function createTouhuGameResult(throws: TouhuThrow[]): TouhuGameResult {
  const { maxCombo } = getTouhuComboStats(throws)
  return {
    score: getTouhuScore(throws),
    hitCount: throws.filter(item => item.grade !== 'MISS').length,
    perfectCount: throws.filter(item => item.grade === 'PERFECT').length,
    maxCombo,
    completed: true,
  }
}
