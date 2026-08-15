export type TargetOutcome = 'PERFECT' | 'GOOD' | 'NICE' | 'MISS'

/** Visual boundary: swap this MockTouhuTarget for AHoloTouhuTarget later. */
export function TouhuTarget({ outcome, glowing }: { outcome?: TargetOutcome; glowing: boolean }) {
  return <MockTouhuTarget outcome={outcome} glowing={glowing} />
}

export function MockTouhuTarget({ outcome, glowing }: { outcome?: TargetOutcome; glowing: boolean }) {
  const missed = outcome === 'MISS'
  return <div className={`touhu-target ${glowing ? 'target-glow' : ''}`} aria-label="远处投壶">
    <div className="target-moon">☾</div><div className="target-label">月影投壶</div>
    <img className="target-asset" src="/assets/touhu/touhu-target.png" alt="投壶" onError={event => { event.currentTarget.hidden = true }} />
    <div className="pot-fallback"><div className="pot-shadow" /><div className="pot-neck"><i /></div><div className="pot-body"><span>月</span></div></div>
    {glowing && <div className="mouth-light">✦</div>}
    {outcome && <div className={missed ? 'landing miss-landing' : 'landing'}>{missed ? '◇' : '✦'}</div>}
  </div>
}
