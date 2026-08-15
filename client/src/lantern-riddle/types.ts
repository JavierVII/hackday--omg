export interface LanternRiddleGameResult {
  completed: boolean
  correctCount: number
  totalCount: number
  accuracy: number
  durationSeconds: number
  rewardUnlocked: boolean
}

export interface LanternRiddleGameProps {
  onClose?: () => void
  onComplete?: (result: LanternRiddleGameResult) => void
}
