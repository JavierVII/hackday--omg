import { TouhuGame } from './TouhuGame'
import { useState } from 'react'

/** Development-only route shell. The feature itself has no routing dependency. */
export function DevTouhuPage() {
  const [open, setOpen] = useState(true)
  if (!open) return <main><button onClick={() => setOpen(true)}>重新打开月下投壶</button></main>
  return <TouhuGame onClose={() => setOpen(false)} onComplete={() => undefined} />
}
