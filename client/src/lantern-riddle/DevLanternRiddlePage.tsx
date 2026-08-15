import { useState } from 'react'
import { LanternRiddleGame } from './LanternRiddleGame'

/** Development-only route shell. The feature itself has no routing dependency. */
export function DevLanternRiddlePage() {
  const [open, setOpen] = useState(true)
  if (!open) return <main><button onClick={() => setOpen(true)}>重新打开灯谜</button></main>
  return <LanternRiddleGame onClose={() => setOpen(false)} onComplete={() => undefined} />
}
