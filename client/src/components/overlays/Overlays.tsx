import { useState } from "react";
import type { MiniGame, Reward, Spot } from "../../mocks/contracts";

export function StoryOverlay({ spot, onClose }: { spot: Spot; onClose: () => void }) {
  return (
    <div className="overlay-mask" onClick={onClose}>
      <div className="overlay-card" onClick={(e) => e.stopPropagation()}>
        <div className="story-image">
          <span>{spot.name}</span>
        </div>
        <h3 className="overlay-title">{spot.name}</h3>
        <p className="overlay-desc">{spot.description}</p>
        <button className="overlay-btn" onClick={onClose}>
          关闭 · 回到游览
        </button>
      </div>
    </div>
  );
}

export function RiddleModal({
  game,
  onSuccess,
  onClose,
}: {
  game: MiniGame;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number | null>(null);

  const submit = (index: number) => {
    setPicked(index);
    if (index === game.content.answerIndex) {
      onSuccess();
    } else {
      setWrong(index);
    }
  };

  return (
    <div className="overlay-mask" onClick={onClose}>
      <div className="overlay-card" onClick={(e) => e.stopPropagation()}>
        <div className="riddle-lantern">🏮</div>
        <h3 className="overlay-title">{game.title}</h3>
        <p className="riddle-question">{game.content.question}</p>
        <div className="riddle-options">
          {game.content.options.map((opt, i) => (
            <button
              key={opt}
              className={`riddle-option${wrong === i ? " wrong" : ""}`}
              onClick={() => submit(i)}
            >
              {opt}
            </button>
          ))}
        </div>
        {wrong !== null && picked === wrong && (
          <p className="riddle-feedback">不对哦，再想想 —— {game.content.hint}</p>
        )}
        <button className="overlay-btn ghost" onClick={onClose}>
          稍后再来
        </button>
      </div>
    </div>
  );
}

export function RewardOverlay({ reward, onClose }: { reward: Reward; onClose: () => void }) {
  return (
    <div className="overlay-mask" onClick={onClose}>
      <div className="overlay-card reward-card" onClick={(e) => e.stopPropagation()}>
        <div className="reward-visual">
          <span className="reward-moon">🌕</span>
          <span className="reward-bridge">🌉</span>
        </div>
        <h3 className="overlay-title">获得纪念卡 · {reward.name}</h3>
        <p className="overlay-desc">{reward.description}</p>
        <button className="overlay-btn" onClick={onClose}>
          放入背包 · 继续游览
        </button>
      </div>
    </div>
  );
}

export function PendingGameOverlay({
  game,
  onClose,
}: {
  game: MiniGame;
  onClose: () => void;
}) {
  return (
    <div className="overlay-mask" onClick={onClose}>
      <div className="overlay-card" onClick={(e) => e.stopPropagation()}>
        <div className="riddle-lantern">🏺</div>
        <h3 className="overlay-title">{game.title}</h3>
        <p className="overlay-desc">{game.content.question}</p>
        <p className="riddle-feedback">{game.content.hint}</p>
        <p className="overlay-desc">小游戏正在接入中，敬请期待。</p>
        <button className="overlay-btn" onClick={onClose}>
          返回游览
        </button>
      </div>
    </div>
  );
}

