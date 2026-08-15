import { useState, type ReactNode } from "react";
import type { InteractionPoint, Reward } from "../../mocks/contracts";
import type { HotspotViewState } from "../../three/SceneManager";

export function TopBar({ areaName, sceneName }: { areaName: string; sceneName: string }) {
  return (
    <header className="hud topbar">
      <div className="brand-lockup">
        <div className="brand-seal" aria-hidden="true">灵境</div>
        <div>
          <div className="topbar-brand">灵境奇旅 <span>LINGJING JOURNEY</span></div>
          <div className="topbar-scene">{sceneName}</div>
          <div className="topbar-area">{areaName}</div>
        </div>
      </div>
      <div className="loc-badge"><span className="loc-dot" />实景导览中</div>
    </header>
  );
}

export function Compass({
  heading,
  targetName,
  targetDistance,
}: {
  heading: number;
  targetName: string | null;
  targetDistance: number | null;
}) {
  const deg = Math.round((heading * 180) / Math.PI);
  return (
    <div className="hud compass">
      <div className="compass-dial">
        <span className="compass-n">北</span>
        <span className="compass-center" />
        <div
          className="compass-needle"
          style={{ transform: `translate(-50%, -100%) rotate(${-deg}deg)` }}
        />
      </div>
      {targetName && targetDistance !== null && (
        <div className="compass-target">
          <span>距最近游点</span>
          <strong>{shortPointName(targetName)} · {Math.round(targetDistance)}m</strong>
        </div>
      )}
    </div>
  );
}

export function CoordReadout({ x, y, z }: { x: number; y: number; z: number }) {
  const text = `x ${x.toFixed(2)}  z ${z.toFixed(2)}  y ${y.toFixed(2)}`;
  return (
    <div className="hud coord-readout coord-readout-right">
      <span>{text}</span>
      <button onClick={() => void navigator.clipboard?.writeText(text)}>复制</button>
    </div>
  );
}

function BackpackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.5 8V6.5a3.5 3.5 0 0 1 7 0V8M6.5 9.5h11l1 10h-13l1-10ZM9 13h6" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 8.5h3l1.5-2h7l1.5 2h3v10H4v-10Z" />
      <circle cx="12" cy="13.5" r="3.2" />
    </svg>
  );
}

function AssistantIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3.5a7.5 7.5 0 0 0-6.4 11.4L4.5 20l5-1.3A7.5 7.5 0 1 0 12 3.5Z" />
      <path d="M8.8 11.5h.1M12 11.5h.1M15.2 11.5h.1" />
    </svg>
  );
}

export function BackpackButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button className="hud utility-button backpack-button" onClick={onClick} aria-label={`数字资产背包，${count}件藏品`}>
      <span className="utility-icon"><BackpackIcon /></span>
    </button>
  );
}

export function PhotoButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="hud photo-button" onClick={onClick} aria-label="拍摄当前场景">
      <span><CameraIcon /></span>
      <small>留影</small>
    </button>
  );
}

export function AiAssistantButton({ onClick, active }: { onClick: () => void; active: boolean }) {
  return (
    <button className={`hud ai-button${active ? " active" : ""}`} onClick={onClick} aria-expanded={active}>
      <span className="ai-orb"><AssistantIcon /><i /></span>
      <span><small>AI 导游</small><strong>小灵</strong></span>
    </button>
  );
}

export function BackpackPanel({ rewards, onClose }: { rewards: Reward[]; onClose: () => void }) {
  return (
    <div className="utility-panel-mask" onClick={onClose}>
      <section className="utility-panel" onClick={(event) => event.stopPropagation()} aria-label="数字资产背包">
        <header>
          <div><small>DIGITAL COLLECTION</small><h2>数字资产背包</h2></div>
          <button onClick={onClose} aria-label="关闭背包">×</button>
        </header>
        {rewards.length ? (
          <div className="asset-grid">
            {rewards.map((reward) => (
              <article className="asset-card" key={reward.id}>
                <div className="asset-visual"><span>月</span><i>藏</i></div>
                <small>西湖游历纪念</small>
                <strong>{reward.name}</strong>
                <p>{reward.description}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="asset-empty"><BackpackIcon /><strong>背包还是空的</strong><p>完成游历任务，即可获得限定数字资产。</p></div>
        )}
      </section>
    </div>
  );
}

export function AiAssistantPanel({
  taskTitle,
  hint,
  onClose,
  onNavigateToRestroom,
}: {
  taskTitle: string;
  hint: string;
  onClose: () => void;
  onNavigateToRestroom: () => void;
}) {
  const [questionSet, setQuestionSet] = useState(0);
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<string | null>(null);
  const suggestions = [
    ["附近哪里有卫生间？", "和泽三春有什么故事？", "附近有什么游园体验？"],
    ["猜灯谜怎么玩？", "投壶体验在哪里？", "帮我介绍一下乌龟潭"],
  ];
  const ask = (question: string) => {
    if (!question.trim()) return;
    if (question.includes("卫生间")) {
      onNavigateToRestroom();
      return;
    }
    setConversation(question.includes("当前任务") ? hint : `关于“${question}”，我会结合当前游线为你讲解。`);
    setMessage("");
  };

  return (
    <div className="assistant-dialog-mask">
      <section className="assistant-dialog" aria-label="AI导游小灵">
        <button className="assistant-dialog-close" onClick={onClose} aria-label="关闭AI小助手">×</button>
        <div className="assistant-watermark" aria-hidden="true"><AssistantIcon /></div>
        <header className="assistant-hero">
          <div className="assistant-mascot" aria-hidden="true">
            <span className="mascot-hat" />
            <span className="mascot-face"><i /><i /><b /></span>
            <span className="mascot-body"><AssistantIcon /></span>
          </div>
          <div>
            <small>LINGJING AI GUIDE</small>
            <h2>你好，我是小灵</h2>
            <p>愿你拥有闪闪发光的一天！</p>
          </div>
        </header>

        <div className="assistant-suggestions">
          {suggestions[questionSet].map((question) => (
            <button key={question} onClick={() => ask(question)}>{question}</button>
          ))}
        </div>
        <button className="assistant-refresh" onClick={() => setQuestionSet((value) => (value + 1) % suggestions.length)}>
          <span>换一换</span><i aria-hidden="true">↻</i>
        </button>

        <div className="assistant-current-task">
          <small>当前游历</small>
          <strong>{taskTitle.replace("任务 · ", "")}</strong>
          <p>{conversation ?? hint}</p>
        </div>

        <form className="assistant-composer" onSubmit={(event) => { event.preventDefault(); ask(message); }}>
          <span className="composer-search" aria-hidden="true">⌕</span>
          <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="发消息或按住说话……" aria-label="向小灵提问" />
          <button type="button" className="composer-voice" aria-label="语音输入"><i /><i /><i /></button>
          <button type="submit" className="composer-send" aria-label="发送消息">＋</button>
        </form>
      </section>
    </div>
  );
}

export function TaskBar({ title, hint }: { title: string; hint: string }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <button
      type="button"
      className={`hud taskbar${collapsed ? " is-collapsed" : ""}`}
      onClick={() => setCollapsed((value) => !value)}
      aria-expanded={!collapsed}
    >
      <span className="taskbar-heading">
        <span className="taskbar-eyebrow"><i />本次游历</span>
        <span className="taskbar-toggle" aria-hidden="true">{collapsed ? "+" : "−"}</span>
      </span>
      <strong className="taskbar-title">{title.replace("任务 · ", "")}</strong>
      {!collapsed && <span className="taskbar-hint">{hint}</span>}
    </button>
  );
}

function shortPointName(name: string) {
  if (name.includes("猜灯谜")) return "猜灯谜";
  if (name.includes("投壶")) return "投壶";
  return name;
}

function PavilionIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 10.5h16M6.5 10.5 12 5l5.5 5.5M7.5 11v7M16.5 11v7M5.5 19h13M9.5 13.5h5" />
    </svg>
  );
}

function LanternIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 4h6M8 7h8l1.5 3-1.5 6H8l-1.5-6L8 7ZM9 19h6M12 16v3" />
    </svg>
  );
}

function PitchPotIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 4 2 7M15 3l-2 8M8 10h8M9 10v3l-2 3 1 4h8l1-4-2-3v-3" />
    </svg>
  );
}

function RestroomIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="8" cy="6" r="2" />
      <circle cx="16" cy="6" r="2" />
      <path d="M8 9v5M5.5 11.5h5M6.5 19 8 14l1.5 5M16 9v10M13.5 12h5" />
    </svg>
  );
}

function pointVisual(point: InteractionPoint): { label: string; eyebrow: string; icon: ReactNode; kind: string } {
  if (point.name.includes("卫生间")) {
    return { label: "公共卫生间", eyebrow: "便民设施", icon: <RestroomIcon />, kind: "restroom" };
  }
  if (point.name.includes("投壶")) {
    return { label: "投壶", eyebrow: "游园雅趣", icon: <PitchPotIcon />, kind: "pitch-pot" };
  }
  if (point.name.includes("灯谜")) {
    return { label: "猜灯谜", eyebrow: "中秋雅会", icon: <LanternIcon />, kind: "riddle" };
  }
  return { label: point.name, eyebrow: "园林胜景", icon: <PavilionIcon />, kind: "landmark" };
}

export function HotspotLabels({
  hotspots,
  points,
  focusedId,
}: {
  hotspots: HotspotViewState[];
  points: InteractionPoint[];
  focusedId: string | null;
}) {
  return (
    <div className="hotspot-layer" aria-label="场景游点">
      {hotspots.map((hotspot) => {
        const point = points.find((item) => item.id === hotspot.id);
        if (!point) return null;
        const focused = hotspot.id === focusedId;
        const visual = pointVisual(point);
        return (
          <div
            key={hotspot.id}
            className={`hotspot-label hotspot-${visual.kind} stage-${hotspot.stage}${hotspot.edge ? ` edge-${hotspot.edge}` : ""}${focused ? " focused" : ""}`}
            style={{ left: hotspot.screenX, top: hotspot.screenY }}
          >
            <span className="hotspot-pin">
              <span className="hotspot-icon">{visual.icon}</span>
              <span className="hotspot-pulse" />
            </span>
            <span className="hotspot-card">
              <span className="hotspot-eyebrow">{visual.eyebrow}</span>
              <span className="hotspot-mainline">
                <strong>{visual.label}</strong>
                <span className="hotspot-dist">{Math.round(hotspot.distance)}m</span>
              </span>
            </span>
            <span className="hotspot-stem" />
          </div>
        );
      })}
    </div>
  );
}

const ACTION_LABELS: Record<string, string> = {
  story: "走近了解",
  game: "开始体验",
  teleport: "进入场景",
};

export function MainActionButton({
  point,
  onAction,
}: {
  point: InteractionPoint;
  onAction: (point: InteractionPoint) => void;
}) {
  return (
    <button className="hud main-action" onClick={() => onAction(point)}>
      <span>{ACTION_LABELS[point.type] ?? "互动"}</span>
      <i aria-hidden="true">→</i>
    </button>
  );
}
