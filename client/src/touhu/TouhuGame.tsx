import { useState } from 'react'
import { TouhuTarget, type TargetOutcome } from './TouhuTarget'
import { judgeTouhuThrow } from './judgment'
import { createTouhuGameResult, getTouhuComboStats, getTouhuScore, totalTouhuThrows } from './score'
import { saveTouhuScore } from './storage'
import type { TouhuGameProps, TouhuPhase, TouhuThrow } from './types'

const totalThrows = totalTouhuThrows
const rankSeed = [{ name: '月下听风', score: 480 }, { name: '荷香客', score: 420 }, { name: '西泠印客', score: 380 }, { name: '湖心舟', score: 340 }]

/** Swap this boundary with AHoloRewardViewer later; gameplay state remains outside it. */
function TouhuRewardViewer({ score, onBack }: { score: number; onBack: () => void }) {
  return <section className="reward-screen"><p>本局奖励已解锁</p><div className="reward-seal large">月</div><h1>月令投壶 · 金尊</h1><span>数字藏品占位展示 · 本局得分 {score}</span><p className="reward-note">TouhuRewardViewer 为独立接口，后续可直接替换为 AHoloRewardViewer。</p><button className="gold-button" onClick={onBack}>返回结算</button></section>
}

function AssetSlot({ className, src, alt }: { className: string; src: string; alt: string }) {
  return <img className={className} src={src} alt={alt} onError={event => { event.currentTarget.hidden = true }} />
}

export function TouhuGame({ onClose, onComplete }: TouhuGameProps) {
  const [phase, setPhase] = useState<TouhuPhase>('cover'), [throws, setThrows] = useState<TouhuThrow[]>([])
  const [outcome, setOutcome] = useState<TargetOutcome>(), [muted, setMuted] = useState(false), [roundKey, setRoundKey] = useState(0)
  const [cycleStartedAt, setCycleStartedAt] = useState(0)
  const score = getTouhuScore(throws)
  const { maxCombo } = getTouhuComboStats(throws)
  const startCycle = () => { setCycleStartedAt(performance.now()); setRoundKey(key => key + 1); setPhase('aiming') }
  const begin = () => { setThrows([]); setOutcome(undefined); startCycle() }
  const throwToken = () => { if (phase !== 'aiming' || throws.length >= totalThrows) return; const cycle = (performance.now() - cycleStartedAt) % 1240; const pulse = .42 + .58 * Math.sin(Math.PI * cycle / 1240); const result = judgeTouhuThrow(Math.abs(1 - pulse)); setOutcome(result.grade); setPhase('flying'); window.setTimeout(() => { setThrows(old => old.length >= totalThrows ? old : [...old, result]); setPhase('result') }, 680) }
  const next = () => { if (throws.length === totalThrows) { saveTouhuScore(throws); onComplete?.(createTouhuGameResult(throws)); setPhase('summary') } else { setOutcome(undefined); startCycle() } }
  const closeGame = () => { if (onClose) onClose(); else setPhase('cover') }
  const gradeCopy = outcome === 'PERFECT' ? '完美入壶' : outcome === 'GOOD' ? '擦边入壶' : outcome === 'NICE' ? '轻巧入壶' : '差一点'
  const evaluation = score >= 420 ? '月下神投' : score >= 280 ? '湖上雅士' : '投壶新秀'
  return <main className="touhu-shell"><div className="phone-frame touhu-scene">
    <header className="touhu-header"><button aria-label="关闭游戏" onClick={closeGame}>×</button><div><b>西小湖</b>{phase !== 'cover' && phase !== 'summary' && phase !== 'reward' && <span>第 {Math.min(throws.length + (phase === 'aiming' || phase === 'flying' ? 1 : 0), totalThrows)} / 5 投</span>}</div><div className="header-score"><small>总分</small><b>{score}</b></div><button aria-label="音乐开关" onClick={() => setMuted(value => !value)}>{muted ? '♩' : '♪'}</button></header>
    <AssetSlot className="scene-background-slot" src="/assets/touhu/west-lake-night-bg.png" alt="" /><div className="cloud cloud-a" /><div className="cloud cloud-b" /><div className="mountains" /><div className="pagoda"><i /><i /><i /><i /></div><div className="pavilion" />
    <div className="stars">✦　·　✧　·　✦　·　✧</div><div className="particles">✦ · ✧　·　✦　·　✧</div><div className="lantern lantern-a">🏮</div><div className="lantern lantern-b">🏮</div><div className="willow">〰〰〰〰〰</div><div className="lake" />
    <aside className="scholar"><AssetSlot className="character-slot" src="/assets/touhu/character-west-lake.png" alt="古风人物素材" /><div className="character-fallback"><span>月下雅士</span></div></aside><AssetSlot className="foreground-slot" src="/assets/touhu/foreground-lotus.png" alt="" />
    <TouhuTarget outcome={outcome} glowing={phase === 'flying' && outcome !== 'MISS'} />
    {phase === 'flying' && <div className={`flying-token ${outcome === 'MISS' ? 'off-course' : ''}`}><img src="/assets/touhu/moon-token.png" alt="月令" onError={event => { event.currentTarget.hidden = true }} /><div className="token-fallback">月</div><div className="trail" /></div>}
    {phase === 'cover' && <section className="cover-card"><p>西湖 · 月下雅集</p><h1>月下投壶</h1><span>看准月令与圆环重合的瞬间</span><button className="gold-button" onClick={begin}>开始 5 投挑战</button></section>}
    {(phase === 'aiming' || phase === 'flying' || phase === 'result') && <section className={`timing-area ${phase === 'aiming' ? 'ready' : ''}`} onClick={phase === 'aiming' ? throwToken : undefined}><p><b>看准时机</b><small>金环重合时点击</small></p><button key={roundKey} className={`timing-ring ${phase !== 'aiming' ? 'locked' : ''}`} aria-label="投出月令"><i /><span>月令</span></button>{phase === 'result' && <div className="result-card" onClick={event => event.stopPropagation()}><b className={outcome}>{outcome}</b><span>+{throws.at(-1)?.score ?? 0}</span><button className="gold-button" onClick={next}>{throws.length === totalThrows ? '查看结算' : '下一投'}</button></div>}</section>}
    {phase === 'summary' && <section className="summary-card"><p>五投已毕 · 西小湖</p><h1>{evaluation}</h1><div className="stats"><span><b>{score}</b>总分</span><span><b>{throws.filter(item => item.score).length}</b>命中</span><span><b>{throws.filter(item => item.grade === 'PERFECT').length}</b>PERFECT</span><span><b>{maxCombo}</b>最高连击</span></div><h2>Demo 模拟榜单</h2><ol>{[...rankSeed, { name: '西小湖', score, mine: true }].sort((a,b) => b.score-a.score).map((item, index) => <li className={'mine' in item ? 'mine' : ''} key={item.name}><span>{index + 1}</span><b>{item.name}</b><em>{item.score}</em></li>)}</ol><button className="gold-button reward-claim" onClick={() => setPhase('reward')}>领取本局奖励</button><button className="quiet-button" onClick={begin}>再投一局</button></section>}
    {phase === 'reward' && <TouhuRewardViewer score={score} onBack={() => setPhase('summary')} />}
  </div></main>
}
