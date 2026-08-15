import type { TouhuThrow } from './types'
import { getTouhuScore } from './score'

export const touhuStorageKey = 'hackday.client.touhu.scores.v1'

export function saveTouhuScore(throws: TouhuThrow[]) {
  const score = getTouhuScore(throws)
  const perfectCount = throws.filter(item => item.grade === 'PERFECT').length
  try {
    const old = JSON.parse(localStorage.getItem(touhuStorageKey) ?? '{}')
    localStorage.setItem(touhuStorageKey, JSON.stringify({
      bestScore: Math.max(old.bestScore ?? 0, score),
      perfectCount: Math.max(old.perfectCount ?? 0, perfectCount),
      lastScore: score,
    }))
  } catch { /* storage is optional */ }
}
