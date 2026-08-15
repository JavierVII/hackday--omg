import { useEffect, useState, type CSSProperties } from 'react'
import { saveLanternResult } from './storage'
import type { LanternRiddleGameProps } from './types'
import './lantern-riddle.css'

const riddles = [
  { question: '桂花香里荡秋波，打一处西湖景名？', options: ['花港观鱼', '三潭印月', '苏堤春晓', '南屏晚钟'], answer: 1 },
  { question: '白蛇传说留余韵，塔影临湖是何处？', options: ['雷峰夕照', '双峰插云', '断桥残雪', '柳浪闻莺'], answer: 0 },
  { question: '一轮明月映三潭，打一西湖胜景？', options: ['曲院风荷', '平湖秋月', '三潭印月', '满陇桂雨'], answer: 2 },
  { question: '许仙白娘子相逢处，打一座西湖名桥？', options: ['长桥', '断桥', '西泠桥', '六和桥'], answer: 1 },
  { question: '十二时中两度潮，打一杭州江名？', options: ['钱塘江', '富春江', '新安江', '苕溪'], answer: 0 },
]

const clock = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

export function LanternRiddleGame({ onClose, onComplete }: LanternRiddleGameProps) {
  const [started, setStarted] = useState(false)
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number>()
  const [correctCount, setCorrectCount] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [finished, setFinished] = useState(false)
  const [completedResult, setCompletedResult] = useState<ReturnType<typeof createResult>>()

  useEffect(() => { if (!started || finished) return; const timer = window.setInterval(() => setElapsed(value => value + 1), 1000); return () => window.clearInterval(timer) }, [started, finished])
  const submit = () => {
    if (selected === undefined) return
    const nextCorrect = correctCount + (selected === riddles[index].answer ? 1 : 0)
    if (index < riddles.length - 1) { setCorrectCount(nextCorrect); setIndex(value => value + 1); setSelected(undefined); return }
    const result = createResult(nextCorrect, elapsed)
    setCorrectCount(nextCorrect); setCompletedResult(result); setFinished(true); saveLanternResult(result)
  }
  const restart = () => { setStarted(true); setFinished(false); setCompletedResult(undefined); setIndex(0); setSelected(undefined); setCorrectCount(0); setElapsed(0) }

  const accuracy = Math.round(correctCount / riddles.length * 100)

  return <main className="lantern-page">
    <section className="lantern-card">
      <header>
        <button onClick={() => onClose?.()} aria-label="关闭游戏">×</button>
        <strong>中秋灯谜</strong>
        <span>{started && !finished ? `${index + 1} / ${riddles.length}` : ''}</span>
      </header>

      {!started ? <div className="lantern-center">
        <div className="lantern-icon" aria-hidden="true">🏮</div>
        <p>西湖中秋雅集</p>
        <h1>中秋猜灯谜</h1>
        <small>5 题挑战 · 计时排名</small>
        <button className="lantern-primary" onClick={restart}>开始挑战 <i aria-hidden="true">→</i></button>
      </div> : finished ? <div className="lantern-center lantern-summary">
        <p>五题闯关完成</p>
        <div className="lantern-ring" style={{ '--pct': accuracy } as CSSProperties}>
          <span><b>{correctCount}<small>/{riddles.length}</small></b><small>答对题数</small></span>
        </div>
        <h1>{correctCount === riddles.length ? '月下状元' : '西湖才子'}</h1>
        <div className="lantern-stats">
          <div><b>{accuracy}%</b><small>正确率</small></div>
          <div><b>{clock(elapsed)}</b><small>用时</small></div>
          <div><b>{correctCount === riddles.length ? '甲等' : '乙等'}</b><small>评定</small></div>
        </div>
        <ol className="lantern-ranking">
          <li><span>1</span><b>月下听风</b><em>5 / 5</em></li>
          <li><span>2</span><b>荷香客</b><em>4 / 5</em></li>
          <li className="mine"><span>你</span><b>西湖游客</b><em>{correctCount} / 5</em></li>
        </ol>
        <button className="lantern-primary" onClick={() => completedResult && onComplete?.(completedResult)}>领取奖励 · 返回游览</button>
        <button className="lantern-restart" onClick={restart}>再挑战一次</button>
      </div> : <div className="lantern-question">
        <p className="lantern-meta"><span>月下谜会 · 西湖篇</span><time>{clock(elapsed)}</time></p>
        <ol className="lantern-dots" aria-hidden="true">
          {riddles.map((riddle, dotIndex) => <li key={riddle.question} className={dotIndex <= index ? 'done' : ''} />)}
        </ol>
        <h2>{riddles[index].question}</h2>
        {riddles[index].options.map((option, optionIndex) => <button
          key={option}
          className={`lantern-option${selected === optionIndex ? ' selected' : ''}`}
          aria-pressed={selected === optionIndex}
          onClick={() => setSelected(optionIndex)}
        ><b aria-hidden="true">{String.fromCharCode(65 + optionIndex)}</b>{option}</button>)}
        <button className="lantern-primary" disabled={selected === undefined} onClick={submit}>{index === riddles.length - 1 ? '完成闯关' : '下一题'}</button>
      </div>}
    </section>
  </main>
}

function createResult(correctCount: number, durationSeconds: number) {
  return { completed: true, correctCount, totalCount: riddles.length, accuracy: Math.round(correctCount / riddles.length * 100), durationSeconds, rewardUnlocked: true }
}
