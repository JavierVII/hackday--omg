import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import type {
  InteractionPoint,
  MiniGame,
  Reward,
  ScenicExperienceConfig,
  Spot,
  UserProgress,
} from "../../mocks/contracts";
import { WEST_LAKE_IDS } from "../../mocks/contracts";
import { fetchConfig } from "../../services/clientConfigService";
import { SceneManager, type FrameState } from "../../three/SceneManager";
import { ROUTES } from "../../features/positioning/routes";
import { launchMiniGame } from "../../features/minigames";
import { MiniGameHost, closeMiniGame, openMiniGame } from "../../minigame";
import { MINI_GAME_IDS, type MiniGameCompleteEvent, type MiniGameId } from "../../minigame";
import {
  Compass,
  AiAssistantButton,
  AiAssistantPanel,
  BackpackButton,
  BackpackPanel,
  CoordReadout,
  HotspotLabels,
  MainActionButton,
  PhotoButton,
  TaskBar,
  TopBar,
} from "../../components/HUD/Hud";
import {
  PendingGameOverlay,
  RewardOverlay,
  RiddleModal,
  StoryOverlay,
} from "../../components/overlays/Overlays";
import { MobileStatusBar } from "../../components/common/MobileStatusBar";
import "../../styles/scene-experience.css";

const AHOLO_SCENE_IDS = new Set<string>([WEST_LAKE_IDS.scenes.reserved]);
const AHOLO_LOD_URL = "/assets/wuguitan-lod";
const STORY_INTERACTION_ID = "interaction-wuguitan-story";
const RIDDLE_INTERACTION_ID = "interaction-wuguitan-riddle";
const PITCH_POT_INTERACTION_ID = "interaction-wuguitan-pitchpot";
const BEADS_INTERACTION_ID = "interaction-wuguitan-beads";
const RESTROOM_INTERACTION_ID = "facility-nearby-restroom";
const RESTROOM_POINT: InteractionPoint = {
  id: RESTROOM_INTERACTION_ID,
  sceneId: WEST_LAKE_IDS.scenes.reserved,
  type: "story",
  name: "公共卫生间",
  position: { x: 2.41, y: 0.02, z: 48.12 },
  enabled: true,
};

type Overlay =
  | { kind: "story"; spot: Spot; point: InteractionPoint }
  | { kind: "riddle"; game: MiniGame; point: InteractionPoint }
  | { kind: "reward"; reward: Reward }
  | { kind: "pending"; game: MiniGame };

export function ExplorePage() {
  const { sceneId: routeSceneId } = useParams<{ sceneId: string }>();

  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<SceneManager | null>(null);
  const latestFrame = useRef<FrameState | null>(null);
  const loadedSceneRef = useRef<string | null>(null);

  const [config, setConfig] = useState<ScenicExperienceConfig | null>(null);
  // 场景来自路由 /scene/:sceneId/explore；场景内传送点会继续改写这个状态。
  const [sceneId, setSceneId] = useState<string>(
    () => routeSceneId ?? WEST_LAKE_IDS.scenes.reserved,
  );
  const [themeId, setThemeId] = useState<string>("");
  const [progress, setProgress] = useState<UserProgress>({
    completedInteractionIds: [],
    unlockedRewardIds: [],
  });
  const [frame, setFrame] = useState<FrameState | null>(null);
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const [aholoStatus, setAholoStatus] = useState("");
  const [backpackOpen, setBackpackOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [photoFlash, setPhotoFlash] = useState(false);
  const [photoNotice, setPhotoNotice] = useState("");
  const [facilityGuideActive, setFacilityGuideActive] = useState(false);

  const storyDone = progress.completedInteractionIds.includes(STORY_INTERACTION_ID);
  const riddleDone = progress.completedInteractionIds.includes(RIDDLE_INTERACTION_ID);
  const pitchPotDone = progress.completedInteractionIds.includes(PITCH_POT_INTERACTION_ID);
  const beadsDone = progress.completedInteractionIds.includes(BEADS_INTERACTION_ID);
  const activeInteractionId = !storyDone
    ? STORY_INTERACTION_ID
    : !riddleDone
      ? RIDDLE_INTERACTION_ID
      : !pitchPotDone
        ? PITCH_POT_INTERACTION_ID
        : BEADS_INTERACTION_ID;

  useEffect(() => {
    fetchConfig().then((c) => {
      setConfig(c);
      const queryTheme = new URLSearchParams(window.location.search).get("theme");
      const valid = c.themes.some((t) => t.id === queryTheme);
      setThemeId(valid && queryTheme ? queryTheme : c.activeThemeId);
    });
  }, []);

  useEffect(() => {
    if (!config || !containerRef.current) return;
    const manager = new SceneManager(containerRef.current);
    managerRef.current = manager;
    (window as unknown as { __manager?: SceneManager }).__manager = manager;
    manager.setFrameCallback((s) => {
      latestFrame.current = s;
    });
    manager.setInputProvider(() => {
      const k = keysRef.current;
      return {
        forward:
          (k.has("KeyW") || k.has("ArrowUp") ? 1 : 0) -
          (k.has("KeyS") || k.has("ArrowDown") ? 1 : 0),
        strafe:
          (k.has("KeyD") || k.has("ArrowRight") ? 1 : 0) -
          (k.has("KeyA") || k.has("ArrowLeft") ? 1 : 0),
        sprint: k.has("ShiftLeft") || k.has("ShiftRight"),
      };
    });
    const debugSpawn = new URLSearchParams(window.location.search).get("spawn");
    loadSceneInto(manager, sceneId, config, debugSpawn);
    loadedSceneRef.current = sceneId;
    const theme = config.themes.find((t) => t.id === themeId);
    if (theme) manager.applyTheme(theme);
    const timer = setInterval(() => {
      if (latestFrame.current) setFrame({ ...latestFrame.current });
    }, 120);
    return () => {
      clearInterval(timer);
      manager.dispose();
      managerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  useEffect(() => {
    const manager = managerRef.current;
    if (!manager || !config) return;
    if (loadedSceneRef.current === sceneId) return;
    loadedSceneRef.current = sceneId;
    loadSceneInto(manager, sceneId, config, null);
  }, [sceneId, config]);

  useEffect(() => {
    const manager = managerRef.current;
    if (!manager || !config) return;
    const theme = config.themes.find((t) => t.id === themeId);
    if (theme) manager.applyTheme(theme);
  }, [themeId, config]);

  useEffect(() => {
    const manager = managerRef.current;
    if (!manager || !config) return;
    if (facilityGuideActive) {
      const pitchPot = config.interactionPoints.find(
        (point) => point.id === PITCH_POT_INTERACTION_ID
      );
      if (!pitchPot) return;
      manager.setGuidance(
        [RESTROOM_POINT],
        [
          pitchPot.position,
          { x: -1.34, y: -2.38, z: 34.63 },
          RESTROOM_POINT.position,
        ]
      );
      return;
    }
    const activePoint = config.interactionPoints.find(
      (point) => point.id === activeInteractionId && point.sceneId === sceneId
    );
    const routeCfg = ROUTES[sceneId];
    if (!activePoint || !routeCfg) return;

    const current = latestFrame.current
      ? { x: latestFrame.current.x, y: latestFrame.current.y, z: latestFrame.current.z }
      : routeCfg.points[0];
    const route = activeInteractionId === STORY_INTERACTION_ID
      ? routeCfg.points
      : activeInteractionId === RIDDLE_INTERACTION_ID
        ? [current, { x: 3.2, y: 0, z: 17.2 }, activePoint.position]
        : [
            current,
            { x: 2.34, y: -2.71, z: 19.06 },
            { x: -0.72, y: -2.4, z: 32.25 },
            activePoint.position,
          ];
    manager.setGuidance([activePoint], route);
  }, [activeInteractionId, config, facilityGuideActive, sceneId]);

  useEffect(() => {
    if (storyDone || frame?.focusedId !== STORY_INTERACTION_ID) return;
    setProgress((current) => ({
      ...current,
      completedInteractionIds: [...current.completedInteractionIds, STORY_INTERACTION_ID],
    }));
  }, [frame?.focusedId, storyDone]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => keysRef.current.add(e.code);
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.code);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const loadSceneInto = (
    manager: SceneManager,
    targetSceneId: string,
    cfg: ScenicExperienceConfig,
    debugSpawn: string | null
  ) => {
    const scene = cfg.scenes.find((s) => s.id === targetSceneId);
    const routeCfg = ROUTES[targetSceneId];
    if (!scene || !routeCfg) return;
    const points = cfg.interactionPoints.filter(
      (p) => p.sceneId === targetSceneId && p.enabled
    );
    if (AHOLO_SCENE_IDS.has(targetSceneId)) {
      manager.loadAholoScene(
        scene.spawnPoint,
        points,
        routeCfg.points,
        routeCfg.bounds,
        routeCfg.camYaw
      );
      manager.setNpcs(
        points
          .filter((p) => p.type === "game")
          .map((p) => ({
            position: p.position,
            modelUrl:
              p.miniGameId === WEST_LAKE_IDS.miniGames.touhu
                ? "/assets/models/npc_knight.glb"
                : "/assets/models/npc_mage.glb",
          }))
      );
      setAholoStatus("准备加载实景…");
      void manager.enableAholo(AHOLO_LOD_URL, setAholoStatus);
    } else {
      manager.disableAholo();
      const spawn =
        debugSpawn === "story" ? { x: -1.5, y: 0, z: 10 } : scene.spawnPoint;
      manager.loadScene(
        scene.id,
        spawn,
        points,
        routeCfg.points,
        routeCfg.bounds,
        routeCfg.camYaw
      );
      setAholoStatus("");
    }
  };

  if (!config) return null;

  const scenePoints = config.interactionPoints.filter(
    (p) => p.sceneId === sceneId && p.enabled
  );
  const sceneName =
    config.scenes.find((s) => s.id === sceneId)?.name ?? "";
  const activePoints = facilityGuideActive
    ? [RESTROOM_POINT]
    : scenePoints.filter((point) => point.id === activeInteractionId);
  const focusedPoint = activePoints.find((p) => p.id === frame?.focusedId) ?? null;

  const nearest = frame?.hotspots.reduce<(typeof frame.hotspots)[number] | null>(
    (acc, hs) => (!acc || hs.distance < acc.distance ? hs : acc),
    null
  );
  const nearestPoint = nearest
    ? activePoints.find((p) => p.id === nearest.id) ?? null
    : null;
  const task = facilityGuideActive
    ? {
        title: "任务 · 前往附近卫生间",
        hint: "已由小灵规划便民路线：从投壶处出发，沿路引前往附近公共卫生间。",
      }
    : !storyDone
    ? {
        title: "任务 · 前往和泽三春",
        hint: "沿出生点石板路前行，在路口转入栈道，直达「和泽三春」亭中。",
      }
    : !riddleDone
      ? { title: "任务 · 猜灯谜", hint: "已到达和泽三春。循墨绿路引前往灯谜处，完成中秋灯谜。" }
      : !pitchPotDone
        ? { title: "任务 · 前往投壶", hint: "灯谜挑战完成。继续沿路引前往投壶处，体验游园雅趣。" }
        : !beadsDone
          ? { title: "任务 · 西湖串珠", hint: "完成投壶后，前往串珠互动点继续体验。" }
          : { title: "任务完成", hint: "和泽三春游历完成，可继续自由探索。" };

  const markCompleted = (id: string) =>
    setProgress((p) =>
      p.completedInteractionIds.includes(id)
        ? p
        : { ...p, completedInteractionIds: [...p.completedInteractionIds, id] }
    );

  const unlockedRewards = config.rewards.filter((reward) =>
    progress.unlockedRewardIds.includes(reward.id)
  );

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

  const handleAction = (point: InteractionPoint) => {
    if (point.type === "story" && point.spotId) {
      const spot = config.spots.find((s) => s.id === point.spotId);
      if (spot) {
        markCompleted(point.id);
        setOverlay({ kind: "story", spot, point });
      }
    } else if (point.type === "game" && point.miniGameId) {
      const game = config.miniGames.find((g) => g.id === point.miniGameId);
      if (game) {
        const miniGameId = point.miniGameId as MiniGameId;
        if (Object.values(MINI_GAME_IDS).includes(miniGameId)) {
          openMiniGame(miniGameId, {
            interactionId: point.id,
            sceneId: point.sceneId,
            source: "hotspot",
            rewardId: point.rewardId ?? game.rewardId,
          });
          return;
        }
        void launchMiniGame(game.type, {
          game,
          interactionId: point.id,
          onSuccess: () => {
            markCompleted(point.id);
            const reward = config.rewards.find((r) => r.id === game.rewardId);
            if (reward) setOverlay({ kind: "reward", reward });
            else setOverlay(null);
          },
          onClose: () => setOverlay(null),
        }).then((handled) => {
          if (handled) return;
          if (game.type === "lantern-riddle")
            setOverlay({ kind: "riddle", game, point });
          else setOverlay({ kind: "pending", game });
        });
      }
    } else if (point.type === "teleport" && point.targetSceneId) {
      setSceneId(point.targetSceneId);
    }
  };

  const handleMiniGameComplete = (event: MiniGameCompleteEvent) => {
    const interactionId = event.context?.interactionId;
    if (interactionId) markCompleted(interactionId);
    const rewardId = event.context?.rewardId;
    const reward = rewardId ? config.rewards.find((item) => item.id === rewardId) : undefined;
    if (reward) {
      setProgress((current) => current.unlockedRewardIds.includes(reward.id)
        ? current
        : { ...current, unlockedRewardIds: [...current.unlockedRewardIds, reward.id] });
      setOverlay({ kind: "reward", reward });
    }
    closeMiniGame();
  };

  const handleRiddleSuccess = () => {
    if (overlay?.kind !== "riddle") return;
    markCompleted(overlay.point.id);
    const reward = config.rewards.find((r) => r.id === overlay.game.rewardId);
    if (reward) {
      setProgress((p) =>
        p.unlockedRewardIds.includes(reward.id)
          ? p
          : { ...p, unlockedRewardIds: [...p.unlockedRewardIds, reward.id] }
      );
      setOverlay({ kind: "reward", reward });
    } else {
      setOverlay(null);
    }
  };


  return (
    <div className="explore-page">
      <MobileStatusBar className="scene-status" />
      <div ref={containerRef} className="scene-container" />
      <MiniGameHost onClose={() => closeMiniGame()} onComplete={handleMiniGameComplete} />
      <TopBar areaName={config.scenicArea.name} sceneName={sceneName} />
      <CoordReadout x={frame?.x ?? 0} y={frame?.y ?? 0} z={frame?.z ?? 0} />
      <Compass
        heading={frame?.heading ?? 0}
        targetName={nearestPoint?.name ?? null}
        targetDistance={nearest?.distance ?? null}
      />
      <TaskBar title={task.title} hint={task.hint} />
      <BackpackButton count={unlockedRewards.length} onClick={() => setBackpackOpen(true)} />
      {frame && (
        <HotspotLabels
          hotspots={frame.hotspots}
          points={activePoints}
          focusedId={frame.focusedId}
        />
      )}
      {focusedPoint && focusedPoint.id !== STORY_INTERACTION_ID && focusedPoint.id !== RESTROOM_INTERACTION_ID && !overlay && (
        <MainActionButton point={focusedPoint} onAction={handleAction} />
      )}
      <AiAssistantButton active={assistantOpen} onClick={() => setAssistantOpen((open) => !open)} />
      <PhotoButton onClick={takePhoto} />
      {assistantOpen && (
        <AiAssistantPanel
          taskTitle={task.title}
          hint={task.hint}
          onClose={() => setAssistantOpen(false)}
          onNavigateToRestroom={() => {
            setFacilityGuideActive(true);
            setAssistantOpen(false);
          }}
        />
      )}
      {backpackOpen && <BackpackPanel rewards={unlockedRewards} onClose={() => setBackpackOpen(false)} />}
      {photoFlash && <div className="photo-flash" />}
      {photoNotice && <div className="photo-notice">{photoNotice}</div>}
      {aholoStatus && <div className="aholo-loading">{aholoStatus}</div>}
      {overlay?.kind === "story" && (
        <StoryOverlay spot={overlay.spot} onClose={() => setOverlay(null)} />
      )}
      {overlay?.kind === "riddle" && (
        <RiddleModal
          game={overlay.game}
          onSuccess={handleRiddleSuccess}
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay?.kind === "reward" && (
        <RewardOverlay reward={overlay.reward} onClose={() => setOverlay(null)} />
      )}
      {overlay?.kind === "pending" && (
        <PendingGameOverlay
          game={overlay.game}
          onClose={() => setOverlay(null)}
        />
      )}
    </div>
  );
}
