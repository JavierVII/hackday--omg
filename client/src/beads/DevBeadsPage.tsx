import { useState } from 'react'
import { BeadsGame, type BeadsGameResult } from './BeadsGame'

/** Development-only route shell. The feature itself has no routing dependency. */
export function DevBeadsPage() {
  const [open, setOpen] = useState(true)
  const [, setResult] = useState<BeadsGameResult>()

  if (!open) return <main><button onClick={() => setOpen(true)}>重新打开西湖拼豆</button></main>

  return <BeadsGame onClose={() => setOpen(false)} onComplete={setResult} />
}
