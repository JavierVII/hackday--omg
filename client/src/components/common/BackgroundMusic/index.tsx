import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import "./styles.css";

const BACKGROUND_MUSIC_SRC = "/assets/audio/Easter%20Day%20in%20Asia.mp3";

export function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.volume = 0.2;
  }, []);

  async function togglePlayback() {
    const audio = audioRef.current;

    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    audio.pause();
    setIsPlaying(false);
  }

  return (
    <div className="background-music">
      <audio
        ref={audioRef}
        src={BACKGROUND_MUSIC_SRC}
        loop
        preload="metadata"
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
      <button
        className={isPlaying ? "background-music__button is-playing" : "background-music__button"}
        type="button"
        aria-label={isPlaying ? "暂停背景音乐" : "播放背景音乐"}
        title={isPlaying ? "暂停背景音乐" : "播放背景音乐"}
        aria-pressed={isPlaying}
        onClick={togglePlayback}
      >
        {isPlaying ? <Volume2 size={19} /> : <VolumeX size={19} />}
      </button>
    </div>
  );
}
