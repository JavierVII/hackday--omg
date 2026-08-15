import { useState } from 'react'
import { MiniGameHost } from './MiniGameHost'
import { openMiniGame } from './openMiniGame'
import { MINI_GAME_IDS, type MiniGameCompleteEvent } from './types'
import './integration-dev.css'

export function IntegrationDevPage() {
  const [pageCount, setPageCount] = useState(0)
  const [lastComplete, setLastComplete] = useState<MiniGameCompleteEvent>()

  return <main className="minigame-integration-dev">
    <h1>MiniGame Integration Dev</h1>
    <p>页面状态计数：{pageCount}</p>
    <button onClick={() => setPageCount(value => value + 1)}>修改页面状态</button>
    <div className="minigame-integration-actions">
      <button onClick={() => openMiniGame(MINI_GAME_IDS.lanternRiddle, { interactionId: 'interaction-broken-bridge-riddle', sceneId: 'scene-broken-bridge', source: 'hotspot' })}>模拟断桥热点 → 猜灯谜</button>
      <button onClick={() => openMiniGame(MINI_GAME_IDS.touhu, { interactionId: 'interaction-leifeng-touhu', sceneId: 'scene-leifeng-pagoda', source: 'hotspot' })}>模拟雷峰塔热点 → 投壶</button>
      <button onClick={() => openMiniGame(MINI_GAME_IDS.beads, { interactionId: 'interaction-lotus-beads', sceneId: 'scene-breeze-ruffled-lotus', source: 'button' })}>模拟曲院风荷入口 → 拼豆</button>
    </div>
    <h2>最近完成事件</h2>
    <pre>{lastComplete ? JSON.stringify(lastComplete, null, 2) : '尚无'}</pre>
    <MiniGameHost onComplete={setLastComplete} />
  </main>
}
