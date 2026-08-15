import type { LanternRiddleGameResult } from './types'

const STORAGE_KEY = 'hackday.client.lantern-riddle.scores.v1'

export function saveLanternResult(result: LanternRiddleGameResult) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(result))
}
