import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DevTouhuPage } from './touhu/DevTouhuPage'
import { DevBeadsPage } from './beads/DevBeadsPage'
import { DevLanternRiddlePage } from './lantern-riddle/DevLanternRiddlePage'
import './styles.css'

function App() {
  return <BrowserRouter><Routes>
    <Route path="/dev/minigame/lantern-riddle" element={<DevLanternRiddlePage />} />
    <Route path="/dev/minigame/touhu" element={<DevTouhuPage />} />
    <Route path="/dev/minigame/beads" element={<DevBeadsPage />} />
    <Route path="*" element={<Navigate to="/dev/minigame/lantern-riddle" replace />} />
  </Routes></BrowserRouter>
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
