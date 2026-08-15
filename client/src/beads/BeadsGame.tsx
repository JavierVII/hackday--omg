import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { BEAD_COLORS, LOTUS_REWARD, LOTUS_TEMPLATE, type BeadColorId } from './template'
import './beads.css'

type BeadsPhase = 'intro' | 'playing' | 'finish-preview' | 'reward'
type Board = (BeadColorId | null)[][]
export interface BeadsGameResult {
  completed: boolean
  filledCount: number
  artworkData?: Board
  rewardUnlocked: boolean
}

export interface BeadsGameProps {
  onClose?: () => void
  onComplete?: (result: BeadsGameResult) => void
}
type Save = { board: Board; elapsed: number; errors: number; startedAt?: number; bestTime?: number; lastTime?: number; completedTemplates?: string[] }
const STORAGE_KEY = 'west-lake-beads:lotus-petal:v1'
const emptyBoard = (): Board => Array.from({ length: 20 }, () => Array(20).fill(null))
const target = LOTUS_TEMPLATE.grid
const palette = Object.keys(BEAD_COLORS) as Exclude<BeadColorId, 'EMPTY'>[]
const hex = (id: BeadColorId | null) => !id || id === 'EMPTY' ? 'transparent' : BEAD_COLORS[id].hex

function Artwork({ board, reference = false }: { board?: Board; reference?: boolean }) {
  return <div className="beads-artwork">{target.flatMap((row, r) => row.map((goal, c) => {
    const value = board ? board[r][c] : (reference ? goal : null)
    return <i key={`${r}-${c}`} className={value ? 'beads-pellet' : ''} style={{ '--bead': hex(value) } as CSSProperties} />
  }))}</div>
}

export function BeadsGame({ onClose, onComplete }: BeadsGameProps) {
  const loaded = useMemo<Save>(() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '') } catch { return { board: emptyBoard(), elapsed: 0, errors: 0 } } }, [])
  const [phase, setPhase] = useState<BeadsPhase>('intro')
  const [board, setBoard] = useState<Board>(() => loaded.board?.length === 20 ? loaded.board : emptyBoard())
  const [selected, setSelected] = useState<BeadColorId | 'ERASER'>('P19')
  const [errors, setErrors] = useState(loaded.errors || 0)
  const [elapsed, setElapsed] = useState(loaded.elapsed || 0)
  const [startedAt, setStartedAt] = useState<number | undefined>(loaded.startedAt)
  const [notice, setNotice] = useState('')
  const [pulse, setPulse] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const [, tick] = useState(0)
  const filled = useMemo(() => board.flat().filter(Boolean).length, [board])
  const targetCount = useMemo(() => target.flat().filter(x => x !== 'EMPTY').length, [])
  const progress = Math.min(filled, targetCount)
  const seconds = elapsed + (startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0)
  const time = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify({ board, elapsed, errors, startedAt, lastTime: loaded.lastTime, bestTime: loaded.bestTime, completedTemplates: loaded.completedTemplates })) }, [board, elapsed, errors, startedAt])
  useEffect(() => { if (phase === 'playing' && startedAt) timer.current = window.setInterval(() => tick(v => v + 1), 1000); return () => window.clearInterval(timer.current) }, [phase, startedAt])
  const enterPlaying = () => setPhase('playing')
  const back = () => { if (phase === 'playing') { setPhase('intro'); setNotice('已自动保存，下次可继续创作') } else if (phase === 'finish-preview') setPhase('playing'); else if (phase === 'reward') setPhase('finish-preview'); else if (onClose) onClose() }
  const place = (r: number, c: number) => {
    const choice = selected === 'ERASER' ? null : selected
    if (!startedAt && choice) setStartedAt(Date.now())
    if (board[r][c] === choice) return
    const id = `${r}-${c}`
    setBoard(old => old.map((line, ri) => line.map((cell, ci) => ri === r && ci === c ? choice : cell)))
    if (choice) { setPulse(id); window.setTimeout(() => setPulse(null), 340); if ('vibrate' in navigator) navigator.vibrate?.(8) }
  }
  const reset = () => { setBoard(emptyBoard()); setErrors(0); setElapsed(0); setStartedAt(undefined); setNotice('已重新开始创作') }
  const finish = () => {
    if (!filled) { setNotice('先放下几颗拼豆，再生成作品吧'); return }
    setElapsed(seconds)
    setStartedAt(undefined)
    setPhase('finish-preview')
  }
  const saveShot = () => setNotice('作品截图区域已生成，可长按保存或截屏留念')
  const mainTitle = LOTUS_TEMPLATE.name

  if (phase === 'intro') return <Shell><Header back={back} /><section className="beads-cover"><p className="beads-eyebrow">西湖夏日图鉴</p><h2>{mainTitle}</h2><p>「一豆一色，拼出西湖夏日」</p><div className="beads-cover-art"><Artwork reference /></div><div className="beads-cover-meta"><span>20 × 20 拼豆图纸</span><span>{targetCount} 颗拼豆</span><span>DIY 创作</span></div><button className="beads-reward-preview">🎁 <b>完成作品可解锁</b><span>{LOTUS_REWARD.name}</span><small>线上完成，线下领取</small></button><button className="beads-primary" onClick={enterPlaying}>{filled ? '继续拼豆' : '开始拼豆'}</button>{filled > 0 && <p className="beads-progress-copy">当前已放下 {filled} 颗拼豆</p>}{notice && <p className="beads-toast">{notice}</p>}</section></Shell>

  if (phase === 'finish-preview') return <Shell><Header back={back} /><section className="beads-finish-page"><p className="beads-eyebrow">西湖拼豆作品</p><h2>你的拼豆作品已生成</h2><p>可凭本作品截图前往指定景区领取实体拼豆纪念品</p><div className="beads-shot-card"><b>西湖拼豆作品</b><span>{mainTitle}</span><Artwork board={board} /><small>西湖 · 曲院风荷</small></div><button className="beads-primary" onClick={saveShot}>保存作品截图</button><button className="beads-secondary" onClick={() => setPhase('reward')}>查看实体奖励</button>{notice && <p className="beads-toast">{notice}</p>}</section></Shell>

  if (phase === 'reward') return <Shell><Header back={back} /><section className="beads-reward-page"><span className="beads-gift">🎁</span><p className="beads-eyebrow">西湖拼豆</p><h2>实体奖励已解锁</h2><div className="beads-reward-panel"><strong>{LOTUS_REWARD.name}</strong><p>{LOTUS_REWARD.description}</p><hr /><span>领取地点</span><b>{LOTUS_REWARD.locationName}</b><small>{LOTUS_REWARD.locationDescription}</small><span>领取说明</span><p>向工作人员出示作品截图即可领取。</p></div><button className="beads-primary" onClick={() => setNotice('请前往曲院风荷游客服务点，向工作人员出示作品截图')}>查看领取方式</button><button className="beads-secondary" onClick={() => onComplete?.({ completed: true, filledCount: filled, artworkData: board, rewardUnlocked: true })}>完成并返回游览</button><button className="beads-secondary" onClick={() => setPhase('playing')}>继续创作</button>{notice && <p className="beads-toast">{notice}</p>}</section></Shell>

  return <Shell><Header back={back} /><section className="beads-playing-head"><h2>{mainTitle}</h2><p><b>{progress}</b> / {targetCount}</p><span>自由 DIY　·　用时 {time}</span><em>🎁 完成作品，解锁实体拼豆纪念品</em></section><div className="beads-board-wrap"><section className="beads-board-shell"><div className="beads-axis top">{Array.from({ length: 20 }, (_, i) => <i key={i}>{i + 1}</i>)}</div><div className="beads-axis side">{Array.from({ length: 20 }, (_, i) => <i key={i}>{i + 1}</i>)}</div><div className="beads-grid">{target.map((line, r) => line.map((goal, c) => { const placed = board[r][c]; const id = `${r}-${c}`; return <button key={id} onClick={() => place(r, c)} className={`beads-cell ${pulse === id ? 'soft-pop' : ''}`} style={{ '--hint': hex(goal), '--bead': hex(placed) } as CSSProperties}>{placed ? <i className="beads-pellet" /> : goal !== 'EMPTY' ? <i className="beads-ghost" /> : null}</button> }))}</div></section></div><button className="beads-reference">▣　自由配色，完成你的花瓣</button><section className="beads-palette"><h3>选择颜色</h3><div className="beads-swatches">{palette.map(id => <button key={id} onClick={() => setSelected(id)} className={selected === id ? 'active' : ''}><i className="beads-pellet" style={{ '--bead': BEAD_COLORS[id].hex } as CSSProperties} />{selected === id && <b>✓</b>}<span>{id}</span></button>)}</div></section><footer className="beads-actions"><button className={selected === 'ERASER' ? 'active' : ''} onClick={() => setSelected(x => x === 'ERASER' ? 'P19' : 'ERASER')}>◇ 橡皮擦</button><button onClick={reset}>⟳ 重置</button></footer><button className="beads-primary beads-finish-action" onClick={finish}>完成作品</button>{notice && <p className="beads-toast">{notice}</p>}</Shell>
}

function Shell({ children }: { children: React.ReactNode }) { return <main className="beads-page"><div className="beads-phone">{children}</div></main> }
function Header({ back }: { back: () => void }) { return <header className="beads-header"><button onClick={back} aria-label="返回">‹</button><div><h1>西湖拼豆</h1><span>✿</span></div><button className="beads-book" aria-label="图鉴">▯<small>图鉴</small></button></header> }
