import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import type { InteractionPoint } from "../../mocks/contracts";
import { SceneManager, type FrameState } from "../../three/SceneManager";
import { MobileStatusBar } from "../../components/common/MobileStatusBar";
import {
  AiAssistantButton,
  AiAssistantPanel,
  BackpackButton,
  BackpackPanel,
  Compass,
  ExitButton,
  HotspotLabels,
  MainActionButton,
  PhotoButton,
  TaskBar,
  TopBar,
} from "../../components/HUD/Hud";
import "../../styles/scene-experience.css";
import "./styles.css";

/**
 * 室内艺术展厅 · 线下导览 3D 场景（Demo 入口，正式上线后该入口不展示）。
 * 沿用探索页整套 HUD 与操作：第三人称漫游 + 画作热点 + 讲解音频任务。
 * 交接包坐标是 y-up 的独立展厅，与乌龟潭 z-up 场景两套体系互不干扰。
 */
export const GALLERY_SCENE_ID = "scene-indoor-art-gallery";
const GALLERY_LOD_URL = "/assets/indoor-art-gallery-lod-yup-v2";
const GALLERY_VOXEL_URL = "/assets/indoor-art-gallery-voxel-yup-v2/gallery";
const GALLERY_AUDIO_URL = "/assets/audio/indoor-gallery-unsynced.mp3";
const GALLERY_VENUE_ID = "art-gallery";

const SPAWN = { x: 0, y: 2.4, z: 0 };
const ROUTE = [SPAWN, { x: 0, y: 2.4, z: -4 }];
const BOUNDS = { minX: -7.5, maxX: 12.5, minZ: -11, maxZ: 6 };
const ARTWORK: InteractionPoint = {
  id: "interaction-gallery-unsynced-artwork",
  sceneId: GALLERY_SCENE_ID,
  type: "story",
  name: "《未同步》",
  position: { x: -1.94, y: 2.09, z: -1.5 },
  enabled: true,
};

/* AI 助手快捷提问：内容贴合展厅（作品 / 导览 / 留影），不复用西湖的游园话题 */
const GALLERY_ASSISTANT_SUGGESTIONS: string[][] = [
  ["《未同步》讲了什么？", "导览任务怎么做？", "这间展厅有什么看点？"],
  ["讲解音频在哪播放？", "可以拍照留影吗？", "帮我说说这个展馆"],
];

export function GalleryExplorePage() {
  const { sceneId: routeSceneId } = useParams<{ sceneId: string }>();
  const navigate = useNavigate();

  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<SceneManager | null>(null);
  const latestFrame = useRef<FrameState | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [frame, setFrame] = useState<FrameState | null>(null);
  const [status, setStatus] = useState("准备流式加载艺术展厅…");
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [photoFlash, setPhotoFlash] = useState(false);
  const [photoNotice, setPhotoNotice] = useState("");
  const [backpackOpen, setBackpackOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  useEffect(() => {
    if (routeSceneId && routeSceneId !== GALLERY_SCENE_ID) {
      navigate("/home", { replace: true });
    }
  }, [routeSceneId, navigate]);

  useEffect(() => {
    if (!containerRef.current) return;
    const manager = new SceneManager(containerRef.current);
    managerRef.current = manager;
    manager.setFrameCallback((next) => {
      latestFrame.current = next;
    });
    manager.setInputProvider(() => {
      const keys = keysRef.current;
      return {
        forward:
          (keys.has("KeyW") || keys.has("ArrowUp") ? 1 : 0) -
          (keys.has("KeyS") || keys.has("ArrowDown") ? 1 : 0),
        strafe:
          (keys.has("KeyD") || keys.has("ArrowRight") ? 1 : 0) -
          (keys.has("KeyA") || keys.has("ArrowLeft") ? 1 : 0),
        sprint: keys.has("ShiftLeft") || keys.has("ShiftRight"),
      };
    });
    manager.loadAholoScene(
      SPAWN,
      [ARTWORK],
      ROUTE,
      BOUNDS,
      Math.PI,
      () => 2.07,
      {
        cameraDistance: 3.6,
        cameraCollision: true,
      }
    );
    manager.setNpcs([]);
    manager.setGuidance([ARTWORK], ROUTE);
    void manager.enableAholo(
      GALLERY_LOD_URL,
      (nextStatus) => setStatus(nextStatus),
      {
        name: "indoor-art-gallery",
        voxelUrl: GALLERY_VOXEL_URL,
        // 展厅 manifest 是 lossless 全细节，minLevel 0 直接满细节呈现画作。
        minLevel: 0,
        coordinateSystem: "y-up",
        frustumCullingEnabled: false,
        galleryPriority: true,
      }
    );

    const timer = setInterval(() => {
      if (latestFrame.current) setFrame({ ...latestFrame.current });
    }, 120);

    const keyDown = (event: KeyboardEvent) => keysRef.current.add(event.code);
    const keyUp = (event: KeyboardEvent) => keysRef.current.delete(event.code);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    return () => {
      clearInterval(timer);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      audioRef.current?.pause();
      manager.dispose();
      managerRef.current = null;
    };
  }, []);

  const distance = frame
    ? Math.hypot(frame.x - ARTWORK.position.x, frame.z - ARTWORK.position.z)
    : Infinity;
  const canListen = distance <= 0.9 || frame?.focusedId === ARTWORK.id;

  const playGuide = () => {
    if (!canListen || playing) return;
    const audio = new Audio(GALLERY_AUDIO_URL);
    audioRef.current?.pause();
    audioRef.current = audio;
    setPlaying(true);
    audio.addEventListener(
      "ended",
      () => {
        setPlaying(false);
        setCompleted(true);
        // 讲解听完即任务完成，撤掉路引让游客自由参观。
        managerRef.current?.setGuidance([], []);
      },
      { once: true }
    );
    audio.addEventListener("error", () => setPlaying(false), { once: true });
    void audio.play().catch(() => setPlaying(false));
  };

  const takePhoto = () => {
    const canvases = Array.from(containerRef.current?.querySelectorAll("canvas") ?? []);
    const source = canvases.find((canvas) => canvas.width > 0 && canvas.height > 0);
    setPhotoFlash(true);
    window.setTimeout(() => setPhotoFlash(false), 260);
    if (!source) {
      setPhotoNotice("场景还在加载，请稍后再试");
      window.setTimeout(() => setPhotoNotice(""), 1800);
      return;
    }
    try {
      const photo = document.createElement("canvas");
      photo.width = source.width;
      photo.height = source.height;
      const context = photo.getContext("2d");
      if (!context) throw new Error("canvas unavailable");
      for (const canvas of canvases) context.drawImage(canvas, 0, 0, photo.width, photo.height);
      const link = document.createElement("a");
      link.download = `灵境奇旅-${Date.now()}.png`;
      link.href = photo.toDataURL("image/png");
      link.click();
      setPhotoNotice("此刻已收入相册");
    } catch {
      setPhotoNotice("留影失败，请稍后再试");
    }
    window.setTimeout(() => setPhotoNotice(""), 1800);
  };

  const nearest = frame?.hotspots.reduce<(typeof frame.hotspots)[number] | null>(
    (acc, hs) => (!acc || hs.distance < acc.distance ? hs : acc),
    null
  );
  const nearestPoint = nearest ? ARTWORK : null;

  const task = completed
    ? { title: "任务完成", hint: "讲解已听完，可继续自由参观展厅。" }
    : playing
      ? { title: "正在聆听讲解", hint: "讲解播放中，请安静欣赏这段导览……" }
      : canListen
        ? { title: "欣赏《未同步》", hint: "已抵达画作前，点击「聆听讲解」收听导览。" }
        : { title: "欣赏《未同步》", hint: "沿指引前往《未同步》画作前。" };

  return (
    <div className="explore-page gallery-explore">
      <MobileStatusBar className="scene-status" />
      <div ref={containerRef} className="scene-container" />
      <TopBar areaName="中国美术学院" sceneName="室内艺术展厅" />
      <Compass
        heading={frame?.heading ?? 0}
        targetName={nearestPoint?.name ?? null}
        targetDistance={nearest?.distance ?? null}
      />
      <TaskBar title={task.title} hint={task.hint} />
      {frame && (
        <HotspotLabels hotspots={frame.hotspots} points={[ARTWORK]} focusedId={frame.focusedId} />
      )}
      {!completed && (
        <MainActionButton
          point={ARTWORK}
          label={playing ? "讲解播放中" : "聆听讲解"}
          disabled={!canListen || playing}
          className={playing ? "is-playing" : ""}
          onAction={() => playGuide()}
        />
      )}
      <AiAssistantButton active={assistantOpen} onClick={() => setAssistantOpen((open) => !open)} />
      <BackpackButton count={0} onClick={() => setBackpackOpen(true)} />
      <PhotoButton onClick={takePhoto} />
      <ExitButton onClick={() => navigate(`/exhibition/${GALLERY_VENUE_ID}`, { replace: true })} />
      {assistantOpen && (
        <AiAssistantPanel
          taskTitle={task.title}
          hint={task.hint}
          suggestions={GALLERY_ASSISTANT_SUGGESTIONS}
          onClose={() => setAssistantOpen(false)}
        />
      )}
      {backpackOpen && <BackpackPanel rewards={[]} onClose={() => setBackpackOpen(false)} />}
      {status && <div className="aholo-loading">{status}</div>}
      {photoFlash && <div className="photo-flash" />}
      {photoNotice && <div className="photo-notice">{photoNotice}</div>}
    </div>
  );
}
