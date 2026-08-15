import * as THREE from "three";
import type { InteractionPoint, Theme, Vec3 } from "../mocks/contracts";
import { assetUrl } from "../lib/assets";
import { VoxelGrid } from "./voxelCollision";

export type HotspotStage = "far" | "sense" | "interactive";

export interface HotspotViewState {
  id: string;
  screenX: number;
  screenY: number;
  stage: HotspotStage;
  distance: number;
  edge: "left" | "right" | null;
}

export interface FrameState {
  x: number;
  y: number;
  z: number;
  heading: number;
  hotspots: HotspotViewState[];
  focusedId: string | null;
}

const SENSE_DIST = 60;
const INTERACT_DIST = 6;
const MOVE_SPEED = 1.8;
const CHARACTER_HEIGHT = 0.85;
const CHARACTER_RADIUS = 0.12;
const MAX_STEP_HEIGHT = 0.32;
const MAX_DROP_HEIGHT = 0.8;
const ROUTE_CLEAR_DIST = 0.85;
const NPC_HEIGHT = 0.92;
const NPC_GREET_DIST = 3.2;
const CAMERA_DISTANCE = 5.2;
const CAMERA_BASE_HEIGHT = 1.45;
const CAMERA_LOOK_HEIGHT = 1.38;
const CAMERA_LOOK_AHEAD = 3;
const CAMERA_MIN_PITCH = -0.04;
const CAMERA_MAX_PITCH = 0.65;
interface Bounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

function lerpAngle(a: number, b: number, t: number) {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

export class SceneManager {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private disposed = false;
  private resizeObserver: ResizeObserver;

  private hemi = new THREE.HemisphereLight(0xdff1f7, 0x6b7f76, 0.95);
  private sun = new THREE.DirectionalLight(0xfff5e0, 1.4);
  private envGroup = new THREE.Group();
  private lanternGroup = new THREE.Group();
  private moon: THREE.Mesh;

  private character = new THREE.Group();
  private assistant = new THREE.Group();
  private charMixer: THREE.AnimationMixer | null = null;
  private charActions: Partial<
    Record<"idle" | "walk" | "run", THREE.AnimationAction>
  > = {};
  private charAnimState: "idle" | "walk" | "run" = "idle";
  private characterModelUrl = assetUrl("/assets/models/rogue_hooded.glb");
  private characterLoadVersion = 0;
  private npcs: Array<{
    group: THREE.Group;
    anchor: Vec3;
    modelUrl: string;
    mixer: THREE.AnimationMixer | null;
    actions: Partial<Record<"idle" | "interact", THREE.AnimationAction>>;
    animState: "idle" | "interact";
  }> = [];
  private charHeading = Math.PI;
  private camYaw = 0;
  // Start close to eye level so covered spaces remain visible in third person.
  private camPitch = 0.06;

  private bounds: Bounds = { minX: -8, maxX: 8, minZ: -14, maxZ: 20 };
  private routeGroup = new THREE.Group();
  private routeArrows: THREE.Mesh[] = [];
  private routeProgress = 0;
  private inputProvider:
    | (() => { forward: number; strafe: number; sprint: boolean })
    | null = null;
  private charY = 0;
  private voxel: VoxelGrid | null = null;
  private voxelActive = false;
  private groundHeightProvider: ((x: number, z: number) => number) | null = null;
  private smoothVoxelGround = false;
  private cameraDistance = CAMERA_DISTANCE;
  private cameraCollision = false;

  private points: InteractionPoint[] = [];
  private focusedId: string | null = null;
  private frameCb: ((s: FrameState) => void) | null = null;

  private aholoActive = false;
  private aholoContainer: HTMLDivElement | null = null;
  private aholoViewer: import("@manycore/aholo-viewer").Viewer | null = null;
  private aholoCamera: import("@manycore/aholo-viewer").PerspectiveCamera | null = null;
  private aholoLookTarget: import("@manycore/aholo-viewer").Vector3 | null = null;
  private aholoLoading = false;
  private aholoLod: import("@manycore/aholo-viewer").SplatUtils.LodSplat | null = null;
  private aholoLodCamera: import("@manycore/aholo-viewer").PerspectiveCamera | null = null;
  private aholoLodTarget: import("@manycore/aholo-viewer").Vector3 | null = null;
  private aholoReady = false;
  private aholoSource: string | null = null;
  private aholoCoordinateSystem: "z-up" | "y-up" = "z-up";
  // 预热录屏：统计已取回解码的 distinct 分块文件数，供页面轮询展示。
  private aholoLodLoaded = 0;
  private aholoLodLoadedSet = new Set<string>();
  // 预热目标 = minLevel 及以上层级实际会引用的分块数（level-0 专属分块不加载，不能拿 files 总数当分母）。
  private aholoLodPreloadTotal = 0;
  private themeLanternGlow = false;
  private themeShowMoon = false;
  private lastTheme: Theme | null = null;

  private dragging = false;
  private lastX = 0;
  private lastY = 0;

  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    const w = container.clientWidth || 400;
    const h = container.clientHeight || 800;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.domElement.style.position = "absolute";
    this.renderer.domElement.style.inset = "0";
    this.renderer.domElement.style.zIndex = "1";
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 300);
    this.scene.background = new THREE.Color(0xbfe3f2);
    this.scene.fog = new THREE.Fog(0xcfe8f2, 35, 140);

    this.sun.position.set(20, 32, 12);
    this.scene.add(this.hemi, this.sun, this.envGroup, this.lanternGroup, this.routeGroup);

    this.moon = new THREE.Mesh(
      new THREE.SphereGeometry(4, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xf5f1d8 })
    );
    this.moon.position.set(-22, 26, -55);
    this.moon.visible = false;
    this.scene.add(this.moon);

    this.buildCharacter();
    this.buildAssistant();
    this.assistant.visible = false;
    this.scene.add(this.character, this.assistant);
    void this.loadCharacterModel(this.characterModelUrl);

    this.bindPointer();
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(container);
    this.loop();
  }

  private buildCharacter() {
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.28, 0.65, 6, 12),
      new THREE.MeshStandardMaterial({ color: 0x3f6df6, roughness: 0.6 })
    );
    body.position.y = 0.82;
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xf2c99d, roughness: 0.7 })
    );
    head.position.y = 1.5;
    const pack = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.42, 0.18),
      new THREE.MeshStandardMaterial({ color: 0xf2994a, roughness: 0.7 })
    );
    pack.position.set(0, 0.95, -0.26);
    this.character.add(body, head, pack);
  }

  setCharacterModel(modelUrl: string) {
    if (modelUrl === this.characterModelUrl && this.charMixer) return;
    this.characterModelUrl = modelUrl;
    void this.loadCharacterModel(modelUrl);
  }

  private async loadCharacterModel(modelUrl: string) {
    const loadVersion = ++this.characterLoadVersion;
    try {
      const { GLTFLoader } = await import(
        "three/examples/jsm/loaders/GLTFLoader.js"
      );
      const gltf = await new GLTFLoader().loadAsync(modelUrl);
      if (loadVersion !== this.characterLoadVersion || this.disposed) return;
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const modelHeight = box.max.y - box.min.y;
      const scale = CHARACTER_HEIGHT / modelHeight;
      model.scale.setScalar(scale);
      model.position.set(0, -box.min.y * scale, 0);
      this.character.clear();
      this.character.add(model);

      const findClip = (...names: string[]) =>
        gltf.animations.find((clip) =>
          names.some((name) => clip.name.toLowerCase() === name.toLowerCase())
        );
      this.charMixer?.stopAllAction();
      this.charActions = {};
      this.charAnimState = "idle";
      const mixer = new THREE.AnimationMixer(model);
      const fallbackMotionClip = gltf.animations[0];
      const idleClip = findClip("Idle");
      const walkClip = findClip("Walking_A", "Walk", "Walking") ?? fallbackMotionClip;
      const runClip = findClip("Running_A", "Run", "Running") ?? walkClip;
      if (idleClip) {
        this.charActions.idle = mixer.clipAction(idleClip);
        this.charActions.idle.play();
      }
      if (walkClip) this.charActions.walk = mixer.clipAction(walkClip);
      if (runClip) {
        this.charActions.run = mixer.clipAction(runClip);
        if (runClip === walkClip) this.charActions.run.timeScale = 1.55;
      }
      this.charMixer = mixer;
    } catch {}
  }

  setNpcs(list: Array<{ position: Vec3; modelUrl: string }>) {
    for (const npc of this.npcs) {
      this.scene.remove(npc.group);
    }
    this.npcs = [];
    for (const item of list) {
      const group = new THREE.Group();
      group.visible = false;
      this.scene.add(group);
      const entry = {
        group,
        anchor: item.position,
        modelUrl: assetUrl(item.modelUrl),
        mixer: null as THREE.AnimationMixer | null,
        actions: {} as Partial<Record<"idle" | "interact", THREE.AnimationAction>>,
        animState: "idle" as "idle" | "interact",
      };
      this.npcs.push(entry);
      void this.loadNpcModel(entry);
    }
    this.refreshNpcPlacement();
  }

  private async loadNpcModel(entry: (typeof this.npcs)[number]) {
    try {
      const { GLTFLoader } = await import(
        "three/examples/jsm/loaders/GLTFLoader.js"
      );
      const gltf = await new GLTFLoader().loadAsync(entry.modelUrl);
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      model.scale.setScalar(NPC_HEIGHT / box.max.y);
      model.position.set(0, 0, 0);
      entry.group.clear();
      entry.group.add(model);
      entry.group.visible = true;

      const mixer = new THREE.AnimationMixer(model);
      const idleClip = gltf.animations.find((clip) => clip.name === "Idle");
      const interactClip = gltf.animations.find(
        (clip) => clip.name === "Interact"
      );
      if (idleClip) {
        entry.actions.idle = mixer.clipAction(idleClip);
        entry.actions.idle.play();
      }
      if (interactClip) entry.actions.interact = mixer.clipAction(interactClip);
      entry.mixer = mixer;
      this.refreshNpcPlacement();
    } catch {}
  }

  private refreshNpcPlacement() {
    for (const npc of this.npcs) {
      let y = this.groundHeightProvider?.(npc.anchor.x, npc.anchor.z) ?? npc.anchor.y;
      if (this.voxelActive && this.voxel) {
        const ground = this.voxelGroundHeight(
          npc.anchor.x,
          npc.anchor.z,
          npc.anchor.y + 0.6,
          2.5
        );
        if (ground !== null) y = ground + 0.02;
      }
      npc.group.position.set(npc.anchor.x, y, npc.anchor.z);
    }
  }

  private buildAssistant() {
    const lantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xffb35c })
    );
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.12, 0.08, 10),
      new THREE.MeshBasicMaterial({ color: 0xd03a2f })
    );
    cap.position.y = 0.24;
    const light = new THREE.PointLight(0xff9a4d, 1.8, 7);
    this.assistant.add(lantern, cap, light);
    this.assistant.position.set(1, 1.3, 16);
  }

  private makeTree(x: number, z: number, scale = 1) {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12 * scale, 0.16 * scale, 0.9 * scale, 8),
      new THREE.MeshStandardMaterial({ color: 0x6b4a2f, roughness: 0.9 })
    );
    trunk.position.y = 0.45 * scale;
    const crown = new THREE.Mesh(
      new THREE.ConeGeometry(0.8 * scale, 1.8 * scale, 10),
      new THREE.MeshStandardMaterial({ color: 0x3f7d4e, roughness: 0.9 })
    );
    crown.position.y = 1.6 * scale;
    tree.add(trunk, crown);
    tree.position.set(x, 0, z);
    return tree;
  }

  private makeLantern(x: number, y: number, z: number) {
    const lantern = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xff8c42 })
    );
    lantern.position.set(x, y, z);
    return lantern;
  }

  private clearGroup(group: THREE.Group) {
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }
  }

  private buildBrokenBridge() {
    this.clearGroup(this.envGroup);
    this.clearGroup(this.lanternGroup);

    const water = new THREE.Mesh(
      new THREE.CircleGeometry(90, 48),
      new THREE.MeshStandardMaterial({ color: 0x3a8fa3, roughness: 0.7 })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.08;
    this.envGroup.add(water);

    const bankMat = new THREE.MeshStandardMaterial({ color: 0x7fae72, roughness: 0.95 });
    for (const side of [-1, 1]) {
      const bank = new THREE.Mesh(new THREE.BoxGeometry(10, 0.6, 60), bankMat);
      bank.position.set(side * 11, -0.3, 2);
      this.envGroup.add(bank);
    }

    const deckMat = new THREE.MeshStandardMaterial({ color: 0xcfc8bb, roughness: 0.8 });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.25, 32), deckMat);
    deck.position.set(0, -0.12, 3);
    this.envGroup.add(deck);

    const railMat = new THREE.MeshStandardMaterial({ color: 0xa8a091, roughness: 0.8 });
    for (const side of [-1, 1]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.55, 32), railMat);
      rail.position.set(side * 1.62, 0.28, 3);
      this.envGroup.add(rail);
    }

    const pierMat = new THREE.MeshStandardMaterial({ color: 0x9a9284, roughness: 0.9 });
    for (const z of [-9, -2, 5, 12]) {
      const pier = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 1.4, 10), pierMat);
      pier.position.set(0, -0.7, z);
      this.envGroup.add(pier);
    }

    const treeSpots: Array<[number, number, number]> = [
      [-8.5, 14, 1.1], [8.8, 10, 0.9], [-9.2, 4, 1.2], [9.4, -2, 1],
      [-8.6, -8, 0.8], [8.9, 18, 1.3], [-9.4, 20, 0.9], [9.2, -12, 1.1],
    ];
    for (const [x, z, s] of treeSpots) this.envGroup.add(this.makeTree(x, z, s));

    const pagoda = this.makePagoda(0.55);
    pagoda.position.set(34, 0, -62);
    this.envGroup.add(pagoda);

    for (const z of [-10, -5, 0, 5, 10, 15]) {
      this.lanternGroup.add(this.makeLantern(-1.62, 0.85, z));
      this.lanternGroup.add(this.makeLantern(1.62, 0.85, z));
    }
  }

  private buildLeifengPagoda() {
    this.clearGroup(this.envGroup);
    this.clearGroup(this.lanternGroup);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(90, 48),
      new THREE.MeshStandardMaterial({ color: 0x4a7c59, roughness: 0.95 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    this.envGroup.add(ground);

    const plaza = new THREE.Mesh(
      new THREE.CircleGeometry(10, 32),
      new THREE.MeshStandardMaterial({ color: 0xb8b0a0, roughness: 0.9 })
    );
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.set(0, 0, -12);
    this.envGroup.add(plaza);

    const path = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.08, 26),
      new THREE.MeshStandardMaterial({ color: 0xc9c1b1, roughness: 0.9 })
    );
    path.position.set(0, 0.02, 3);
    this.envGroup.add(path);

    const pagoda = this.makePagoda(1);
    pagoda.position.set(0, 0, -17);
    this.envGroup.add(pagoda);

    const treeSpots: Array<[number, number, number]> = [
      [-7, 8, 1.2], [7, 6, 1], [-8, -2, 1.3], [8, -6, 1.1],
      [-6, -14, 0.9], [7, 12, 1.2], [-9, 14, 1],
    ];
    for (const [x, z, s] of treeSpots) this.envGroup.add(this.makeTree(x, z, s));

    for (const z of [2, 7, 12]) {
      this.lanternGroup.add(this.makeLantern(-1.4, 0.9, z));
      this.lanternGroup.add(this.makeLantern(1.4, 0.9, z));
    }
  }

  private makePagoda(scale: number) {
    const pagoda = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x7a4a35, roughness: 0.85 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x3a3f4a, roughness: 0.8 });
    let y = 0;
    for (let level = 0; level < 5; level++) {
      const w = (5.2 - level * 0.75) * scale;
      const body = new THREE.Mesh(new THREE.BoxGeometry(w, 1.5 * scale, w), bodyMat);
      body.position.y = y + 0.75 * scale;
      const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.95, 0.8 * scale, 4), roofMat);
      roof.position.y = y + 1.9 * scale;
      roof.rotation.y = Math.PI / 4;
      pagoda.add(body, roof);
      y += 2.1 * scale;
    }
    const spire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06 * scale, 0.12 * scale, 1.6 * scale, 8),
      roofMat
    );
    spire.position.y = y + 0.6 * scale;
    pagoda.add(spire);
    return pagoda;
  }

  loadScene(
    sceneId: string,
    spawn: Vec3,
    points: InteractionPoint[],
    route: Vec3[],
    bounds: Bounds,
    camYaw = Math.PI
  ) {
    if (sceneId.includes("leifeng")) this.buildLeifengPagoda();
    else this.buildBrokenBridge();

    this.groundHeightProvider = null;
    this.smoothVoxelGround = false;
    this.cameraDistance = CAMERA_DISTANCE;
    this.cameraCollision = false;
    this.setPoints(points);
    this.setRoute(route);
    this.bounds = bounds;
    this.charY = 0;
    this.character.position.set(spawn.x, 0, spawn.z);
    this.assistant.position.set(spawn.x + 1, 1.3, spawn.z - 1.2);
    this.camYaw = camYaw;
    this.charHeading = camYaw + Math.PI;
    this.snapCamera();
  }

  applyTheme(theme: Theme) {
    this.lastTheme = theme;
    this.themeLanternGlow = theme.environmentConfig.lanternGlow;
    this.themeShowMoon = theme.environmentConfig.showMoon;
    if (!this.aholoActive) this.applyThemeGraphics(theme);
    this.updateVisibility();
  }

  private applyThemeGraphics(theme: Theme) {
    const env = theme.environmentConfig;
    this.scene.background = new THREE.Color(env.skyColor);
    this.scene.fog = new THREE.Fog(env.fogColor, 35, 140);
    this.hemi.color.set(env.ambientColor);
    this.sun.color.set(env.sunColor);
    this.sun.intensity = env.showMoon ? 0.5 : 1.4;
    this.hemi.intensity = env.showMoon ? 0.55 : 0.95;
  }

  private updateVisibility() {
    const showBuiltin = !this.aholoActive;
    this.envGroup.visible = showBuiltin;
    this.lanternGroup.visible = showBuiltin && this.themeLanternGlow;
    this.moon.visible = showBuiltin && this.themeShowMoon;
    if (this.aholoContainer) {
      this.aholoContainer.style.display = this.aholoActive ? "block" : "none";
    }
  }

  private setPoints(points: InteractionPoint[]) {
    this.points = points;
  }

  loadAholoScene(
    spawn: Vec3,
    points: InteractionPoint[],
    route: Vec3[],
    bounds: Bounds,
    camYaw = 0,
    groundHeightProvider: ((x: number, z: number) => number) | null = null,
    tuning: {
      smoothVoxelGround?: boolean;
      cameraDistance?: number;
      cameraCollision?: boolean;
    } = {}
  ) {
    this.clearGroup(this.envGroup);
    this.clearGroup(this.lanternGroup);
    this.groundHeightProvider = groundHeightProvider;
    this.smoothVoxelGround = tuning.smoothVoxelGround ?? false;
    this.cameraDistance = tuning.cameraDistance ?? CAMERA_DISTANCE;
    this.cameraCollision = tuning.cameraCollision ?? false;
    this.setPoints(points);
    this.setRoute(route);
    this.bounds = bounds;
    this.charY = groundHeightProvider?.(spawn.x, spawn.z) ?? spawn.y;
    this.character.position.set(spawn.x, this.charY, spawn.z);
    this.assistant.position.set(spawn.x + 1, this.charY + 1.3, spawn.z - 1.2);
    this.camYaw = camYaw;
    this.charHeading = camYaw + Math.PI;
    this.aholoActive = true;
    this.scene.background = null;
    this.scene.fog = null;
    this.updateVisibility();
    this.snapCamera();
  }

  async enableAholo(
    url: string,
    onProgress?: (text: string) => void,
    options: {
      name?: string;
      voxelUrl?: string;
      minLevel?: number;
      maxBudget?: number;
      galleryPriority?: boolean;
      coordinateSystem?: "z-up" | "y-up";
      frustumCullingEnabled?: boolean;
      // 亚像素剔除阈值：越小保留的高频小点越多（更清晰），1 = 剔除 <1px 斑点（省性能）。
      detailCullingThreshold?: number;
      // 调度器并发/节奏：数值越高分块取数与解码越快（也更吃 CPU/内存）。
      // 录屏演示可调高让场景更快变清晰；默认值偏保守，避免弱机卡顿。
      schedulerParallelCounts?: number;
      schedulerExistingTaskLimit?: number;
      schedulerMinDuration?: number;
    } = {}
  ) {
    if (
      (this.aholoReady && this.aholoViewer && this.aholoSource === url) ||
      this.aholoLoading
    )
      return;
    // GitHub Pages 子路径部署：LOD 与分块 URL 统一补基路径前缀（dev 下 base="/" 原样不变）。
    url = assetUrl(url);
    this.aholoLoading = true;
    try {
      const aholo = await import("@manycore/aholo-viewer");
      if (this.aholoViewer) this.destroyAholoRenderer();
      if (!this.aholoContainer) {
        const el = document.createElement("div");
        el.style.position = "absolute";
        el.style.inset = "0";
        el.style.zIndex = "0";
        el.style.background = "#0b1020";
        this.container.insertBefore(el, this.renderer.domElement);
        this.aholoContainer = el;
        this.updateVisibility();
      }
      const viewer = aholo.createViewer(options.name ?? "wuguitan", this.aholoContainer, {});
      const camera = new aholo.PerspectiveCamera(
        55,
        this.container.clientWidth / Math.max(1, this.container.clientHeight),
        0.1,
        8000
      );
      camera.up.set(0, 1, 0);
      viewer.setCamera(camera);
      aholo.setViewerConfig(viewer, {
        pipeline: {
          Background: {
            background: {
              active: aholo.BackgroundMode.BasicBackground,
              basic: { color: new aholo.Color(0.04, 0.06, 0.12) },
            },
            ground: { enabled: false },
          },
          Splatting: {
            enabled: true,
            pack: {
              precalculateEnabled: true,
              cameraRelativeEnabled: true,
              sortedLayoutEnabled: true,
            },
            raster: {
              // 展厅保留高频小斑点（画框边缘、木条墙）；乌龟潭高清也下调阈值保留草叶/枝桠细节。
              detailCullingThreshold:
                options.detailCullingThreshold ?? (options.galleryPriority ? 0.35 : 1),
              maxStdDev: Math.sqrt(8),
            },
            sort: {
              minIntervalMs: 32,
            },
          },
          TAA: { enabled: false },
        },
      });

      onProgress?.("读取实景索引…");
      const metaResponse = await fetch(`${url}/lod-meta.json`);
      const meta =
        (await metaResponse.json()) as import("@manycore/aholo-viewer").SplatUtils.LodMeta;
      if (!(meta.magicCode === 2500660 && meta.type === "lod-splat")) {
        throw new Error("lod-meta.json 格式不正确");
      }

      onProgress?.("流式加载实景分块…");
      const loadResource = async (resUrl: string) => {
        const full =
          /^(https?:)?\/\//.test(resUrl) || resUrl.startsWith("/")
            ? resUrl
            : `${url}/${resUrl}`;
        const fileType = aholo.SplatLoader.detectSplatFileType(full, new Uint8Array());
        if (fileType === undefined) throw new Error("不支持的分块格式：" + full);
        const data = await aholo.SplatLoader.parseSplatData(
          fileType,
          full,
          aholo.SplatLoader.SplatPackType.SuperCompressed
        );
        // 同一文件被多个节点/层级引用时只记一次。
        if (!this.aholoLodLoadedSet.has(full)) {
          this.aholoLodLoadedSet.add(full);
          this.aholoLodLoaded = this.aholoLodLoadedSet.size;
        }
        return data;
      };
      const lod = new aholo.SplatUtils.LodSplat(
        meta,
        {
          // minLevel 是细化下限（越低越细，0 = 全细节）。调度器从 maxLevel（最粗）起步逐级向下细化，
          // 若把下限设成 levels-1 会把场景锁在最粗层——上一版乌龟潭因此整场景发糊。
          minLevel: options.minLevel ?? 0,
          // 常驻点数预算：越高画面越密，也越吃 GPU。乌龟潭全细节约 13.7M 点，默认 4M 够用，高清再上调。
          maxBudget: options.maxBudget ?? 4_000_000,
          // 展厅 manifest 是 lossless SPZ 合并而来，forwardBox 只盖首块；不要按背景内容把其余走廊质量砍半。
          backgroundPenalty: options.galleryPriority ? 1 : 0.5,
          hysteresisTicks: 4,
          schedulerParallelCounts: options.schedulerParallelCounts ?? 4,
          schedulerExistingTaskLimit: options.schedulerExistingTaskLimit ?? 64,
          schedulerMinDuration: options.schedulerMinDuration ?? 160,
          // 优先加载可见块。展厅 110+ 节点全驻留会让首屏与移动明显变重。
          frustumCullingEnabled: options.frustumCullingEnabled ?? true,
        },
        aholo.createViewerContext(viewer),
        loadResource
      );
      const coordinateSystem = options.coordinateSystem ?? "z-up";
      lod.container.rotation.x = coordinateSystem === "y-up" ? 0 : -Math.PI / 2;
      viewer.getScene().add(lod.container);
      const lodCamera = new aholo.PerspectiveCamera(55, camera.aspect, 0.1, 8000);
      const lodTarget = new aholo.Vector3(0, 0, 0);
      this.aholoLodCamera = lodCamera;
      this.aholoLodTarget = lodTarget;
      const worldPos = this.camera.position;
      const worldDir = new THREE.Vector3();
      this.camera.getWorldDirection(worldDir);
      if (coordinateSystem === "y-up") {
        lodCamera.position.set(worldPos.x, worldPos.y, worldPos.z);
        lodCamera.up.set(0, 1, 0);
        lodTarget.set(
          worldPos.x + worldDir.x,
          worldPos.y + worldDir.y,
          worldPos.z + worldDir.z
        );
      } else {
        lodCamera.position.set(worldPos.x, -worldPos.z, worldPos.y);
        lodCamera.up.set(0, 0, 1);
        lodTarget.set(
          worldPos.x + worldDir.x,
          -(worldPos.z + worldDir.z),
          worldPos.y + worldDir.y
        );
      }
      lodCamera.lookAt(lodTarget);
      lodCamera.fov = this.camera.fov;
      lodCamera.aspect = this.camera.aspect;
      lodCamera.updateProjectionMatrix();
      lod.tick(lodCamera);
      lod.start();
      this.aholoLod = lod;
      this.aholoCoordinateSystem = coordinateSystem;
      // 分块调度是异步的，失败原本被静默吞掉，页面会停在深色空场景上没有任何提示。
      void lod
        .onFinishSchedule()
        .catch((err: unknown) =>
          onProgress?.("实景分块加载失败：" + ((err as Error)?.message ?? String(err)))
        );

      onProgress?.("加载碰撞体素…");
      this.voxel = await VoxelGrid.load(
        assetUrl(options.voxelUrl ?? "/assets/wuguitan-voxel/wuguitan")
      );
      this.voxelActive = this.aholoActive;
      const initialGround = this.voxelGroundHeight(
        this.character.position.x,
        this.character.position.z,
        this.charY + 0.35,
        3
      );
      if (initialGround !== null) {
        this.charY = initialGround + 0.02;
        this.character.position.y = this.charY;
      }
      this.refreshNpcPlacement();
      this.refreshRouteHeights();

      this.aholoViewer = viewer;
      this.aholoCamera = camera;
      this.aholoLookTarget = new aholo.Vector3(0, 0, 0);
      this.aholoReady = true;
      this.aholoSource = url;
      this.aholoLodLoaded = 0;
      this.aholoLodLoadedSet.clear();
      // 预热目标 = 调度器在 minLevel 及以上会引用的 distinct 分块数；
      // 不能拿 meta.files 总数（含 level-0 专属分块）当分母，否则永远到不了 100%。
      const prewarmTotal = new Set<number>();
      for (let lv = options.minLevel ?? 0; lv < meta.levels; lv++) {
        meta.tree.forEach((node) => prewarmTotal.add(node.lods[lv].file));
      }
      this.aholoLodPreloadTotal = prewarmTotal.size;
      // 创建 viewer 时容器尺寸可能还没稳定（布局、手机框），对齐一次绘制区。
      viewer.resize();
      onProgress?.("");
    } catch (e) {
      onProgress?.("实景加载失败：" + (e as Error).message);
    } finally {
      this.aholoLoading = false;
    }
  }

  private destroyAholoRenderer() {
    this.aholoLod?.destroy();
    this.aholoLod = null;
    this.aholoLodCamera = null;
    this.aholoLodTarget = null;
    this.aholoCoordinateSystem = "z-up";
    this.aholoViewer?.destroy();
    this.aholoViewer = null;
    this.aholoCamera = null;
    this.aholoLookTarget = null;
    this.aholoContainer?.remove();
    this.aholoContainer = null;
    this.aholoReady = false;
    this.aholoSource = null;
    this.aholoLodLoaded = 0;
    this.aholoLodLoadedSet.clear();
    this.aholoLodPreloadTotal = 0;
  }

  // 预热录屏：返回已取回解码的分块数 / minLevel 及以上引用总数；未加载实景时为 null。
  getAholoPreloadProgress(): { loaded: number; total: number } | null {
    if (!this.aholoLod) return null;
    return { loaded: this.aholoLodLoaded, total: this.aholoLodPreloadTotal };
  }

  // 预热：让调度器无视视锥、把全部分块都取回解码进资源缓存，
  // 之后走位/转向不再现抓现解，录屏更稳。完成后传 false 恢复视锥剔除省渲染。
  setAholoPrewarm(enabled: boolean) {
    this.aholoLod?.setConfig({ frustumCullingEnabled: !enabled });
  }

  disableAholo() {
    this.aholoActive = false;
    this.voxelActive = false;
    if (this.lastTheme) this.applyThemeGraphics(this.lastTheme);
    this.updateVisibility();
  }


  setFrameCallback(cb: (s: FrameState) => void) {
    this.frameCb = cb;
  }

  debugState() {
    return {
      x: Number(this.character.position.x.toFixed(2)),
      z: Number(this.character.position.z.toFixed(2)),
      charY: Number(this.charY.toFixed(2)),
      camX: Number(this.camera.position.x.toFixed(2)),
      camY: Number(this.camera.position.y.toFixed(2)),
      camZ: Number(this.camera.position.z.toFixed(2)),
      camYaw: Number(this.camYaw.toFixed(3)),
      charHeading: Number(this.charHeading.toFixed(3)),
      bounds: this.bounds,
      voxelLoaded: this.voxel !== null,
      voxelActive: this.voxelActive,
      ground: this.voxelGroundHeight(
        this.character.position.x,
        this.character.position.z,
        this.charY + MAX_STEP_HEIGHT,
        MAX_STEP_HEIGHT + MAX_DROP_HEIGHT
      ),
      blocked: this.isBlockedWorld(
        this.character.position.x,
        this.character.position.z
      ),
    };
  }

  debugTeleport(x: number, z: number, camYaw = this.camYaw) {
    this.character.position.x = x;
    this.character.position.z = z;
    this.charY = this.groundHeightProvider?.(x, z) ?? 0;
    this.character.position.y = this.charY;
    this.camYaw = camYaw;
    this.charHeading = camYaw + Math.PI;
    this.snapCamera();
  }
  setInputProvider(
    provider: () => { forward: number; strafe: number; sprint: boolean }
  ) {
    this.inputProvider = provider;
  }

  setGuidance(points: InteractionPoint[], route: Vec3[]) {
    this.setPoints(points);
    this.setRoute(route);
  }

  private setRoute(route: Vec3[]) {
    this.clearGroup(this.routeGroup);
    this.routeArrows = [];
    this.routeProgress = 0;
    if (route.length < 2) return;
    const arrowGeometry = new THREE.ShapeGeometry(
      new THREE.Shape()
        .moveTo(0, 0.15)
        .lineTo(0.12, -0.01)
        .lineTo(0.045, -0.01)
        .lineTo(0.045, -0.12)
        .lineTo(-0.045, -0.12)
        .lineTo(-0.045, -0.01)
        .lineTo(-0.12, -0.01)
        .closePath()
    );
    const glowGeometry = new THREE.CircleGeometry(0.2, 24);
    for (let segmentIndex = 0; segmentIndex < route.length - 1; segmentIndex++) {
      const start = route[segmentIndex];
      const end = route[segmentIndex + 1];
      const segmentLength = Math.hypot(end.x - start.x, end.z - start.z);
      const count = Math.max(1, Math.floor(segmentLength / 0.9));
      const directionYaw = Math.atan2(end.x - start.x, end.z - start.z) + Math.PI;
      for (let index = 0; index < count; index++) {
        const progress = (index + 0.5) / count;
        const x = start.x + (end.x - start.x) * progress;
        const z = start.z + (end.z - start.z) * progress;
        const glow = new THREE.Mesh(
          glowGeometry,
          new THREE.MeshBasicMaterial({
            color: 0xfaf6ee,
            transparent: true,
            opacity: 0.7,
            depthWrite: false,
          })
        );
        glow.rotation.x = -Math.PI / 2;
        glow.position.set(x, 0.04, z);
        this.routeGroup.add(glow);

        const arrow = new THREE.Mesh(
          arrowGeometry,
          new THREE.MeshBasicMaterial({
            color: 0x1d4d3c,
            transparent: true,
            opacity: 0.82,
            side: THREE.DoubleSide,
            depthWrite: false,
          })
        );
        arrow.rotation.set(-Math.PI / 2, 0, directionYaw);
        arrow.position.set(x, 0.06, z);
        arrow.userData.glow = glow;
        arrow.userData.routeIndex = this.routeArrows.length;
        arrow.userData.cleared = 0;
        this.routeGroup.add(arrow);
        this.routeArrows.push(arrow);
      }
    }
    this.refreshRouteHeights();
  }

  private voxelGroundHeight(x: number, z: number, fromY: number, maxDrop: number) {
    const fixedGround = this.groundHeightProvider?.(x, z);
    if (fixedGround !== undefined) return fixedGround;
    if (!this.voxel) return null;
    return this.smoothVoxelGround
      ? this.voxel.smoothGroundHeight(x, z, fromY, maxDrop)
      : this.voxel.groundHeight(x, z, fromY, maxDrop);
  }

  private refreshRouteHeights() {
    for (const arrow of this.routeArrows) {
      let y = (this.groundHeightProvider?.(arrow.position.x, arrow.position.z) ?? 0) + 0.06;
      if (this.voxelActive && this.voxel) {
        const g = this.voxelGroundHeight(
          arrow.position.x,
          arrow.position.z,
          this.charY + MAX_STEP_HEIGHT,
          3
        );
        if (g !== null) y = g + 0.16;
      }
      arrow.position.y = y;
      const glow = arrow.userData.glow as THREE.Mesh | undefined;
      if (glow) glow.position.y = y - 0.03;
    }
  }

  private isBlockedWorld(wx: number, wz: number) {
    if (!this.voxel) return false;
    const ground = this.voxelGroundHeight(
      wx,
      wz,
      this.charY + MAX_STEP_HEIGHT,
      MAX_STEP_HEIGHT + MAX_DROP_HEIGHT
    );
    if (ground === null) return true;

    const heightDelta = ground - this.charY;
    if (heightDelta > MAX_STEP_HEIGHT || heightDelta < -MAX_DROP_HEIGHT) {
      return true;
    }

    const feetY = ground + 0.02;
    const footprint: Array<[number, number]> = [
      [0, 0],
      [CHARACTER_RADIUS, 0],
      [-CHARACTER_RADIUS, 0],
      [0, CHARACTER_RADIUS],
      [0, -CHARACTER_RADIUS],
    ];
    const blockedSamples = footprint.filter(([offsetX, offsetZ]) => {
      const lowerBodyBlocked = this.voxel!.occupiedWorld(
        wx + offsetX,
        feetY + 0.28,
        wz + offsetZ
      );
      const upperBodyBlocked = this.voxel!.occupiedWorld(
        wx + offsetX,
        feetY + 0.72,
        wz + offsetZ
      );
      return lowerBodyBlocked && upperBodyBlocked;
    }).length;
    // 整面墙会占满大部分足迹；孤立扫描噪点与薄地面边缘斑点不会。取多数派防止室内点云噪点挡住移动。
    return blockedSamples >= 3;
  }

  private resolveCameraPosition(desired: THREE.Vector3) {
    if (!this.cameraCollision || !this.voxelActive || !this.voxel) return desired;
    const anchor = new THREE.Vector3(
      this.character.position.x,
      this.charY + CAMERA_LOOK_HEIGHT,
      this.character.position.z
    );
    const direction = desired.clone().sub(anchor);
    const distance = direction.length();
    if (distance < 0.01) return desired;
    direction.divideScalar(distance);
    const safe = anchor.clone().addScaledVector(direction, 0.55);
    const probe = new THREE.Vector3();
    for (let travelled = 0.65; travelled <= distance; travelled += 0.1) {
      probe.copy(anchor).addScaledVector(direction, travelled);
      const occupiedSamples = [
        [0, 0, 0],
        [0.12, 0, 0],
        [-0.12, 0, 0],
        [0, 0.12, 0],
        [0, -0.12, 0],
      ].filter(([dx, dy, dz]) =>
        this.voxel!.occupiedWorld(probe.x + dx, probe.y + dy, probe.z + dz)
      ).length;
      if (occupiedSamples >= 2) return safe;
      safe.copy(probe);
    }
    return desired;
  }

  private snapCamera() {
    const yaw = this.camYaw;
    const horiz = this.cameraDistance * Math.cos(this.camPitch);
    const height =
      this.charY + CAMERA_BASE_HEIGHT + this.cameraDistance * Math.sin(this.camPitch);
    const desired = new THREE.Vector3(
      this.character.position.x + Math.sin(yaw) * horiz,
      height,
      this.character.position.z + Math.cos(yaw) * horiz
    );
    this.camera.position.copy(this.resolveCameraPosition(desired));
    this.camera.lookAt(
      this.character.position.x + Math.sin(this.camYaw + Math.PI) * CAMERA_LOOK_AHEAD,
      this.charY + CAMERA_LOOK_HEIGHT,
      this.character.position.z + Math.cos(this.camYaw + Math.PI) * CAMERA_LOOK_AHEAD
    );
  }

  private bindPointer() {
    const el = this.renderer.domElement;
    el.style.touchAction = "none";
    el.addEventListener("pointerdown", (e) => {
      this.dragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener("pointermove", (e) => {
      if (!this.dragging) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.camYaw -= dx * 0.006;
      this.camPitch = Math.min(
        CAMERA_MAX_PITCH,
        Math.max(CAMERA_MIN_PITCH, this.camPitch + dy * 0.004)
      );
    });
    const stop = () => {
      this.dragging = false;
    };
    el.addEventListener("pointerup", stop);
    el.addEventListener("pointercancel", stop);
  }

  private handleResize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    // aholo 的绘制区不会自己跟随容器：不传尺寸时它按 canvas 自适应。
    // 漏掉这一步，实景画面会停在创建 viewer 那一刻的尺寸上。
    this.aholoViewer?.resize();
  }

  private loop = () => {
    if (this.disposed) return;
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.update(dt, performance.now() / 1000);
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.loop);
  };

  private update(dt: number, t: number) {
    const input = this.inputProvider
      ? this.inputProvider()
      : { forward: 0, strafe: 0, sprint: false };
    if (input.forward !== 0 || input.strafe !== 0) {
      const faceYaw = this.camYaw + Math.PI;
      const fx = Math.sin(faceYaw);
      const fz = Math.cos(faceYaw);

      // 屏幕右方向。朝向 yaw 对应 (sin yaw, cos yaw)，相机在角色正后方沿 -forward
      // 看过来，因此画面右手边是 (-cos yaw, sin yaw)。写成 (cos, -sin) 会让 A/D、
      // ←/→ 整体反向。
      const rx = -Math.cos(faceYaw);
      const rz = Math.sin(faceYaw);
      let dx = fx * input.forward + rx * input.strafe;
      let dz = fz * input.forward + rz * input.strafe;
      const len = Math.hypot(dx, dz);
      if (len > 0) {
        dx /= len;
        dz /= len;
        const speed = input.sprint ? 4.2 : MOVE_SPEED;
        let nx = this.character.position.x + dx * speed * dt;
        let nz = this.character.position.z + dz * speed * dt;
        nx = Math.min(this.bounds.maxX, Math.max(this.bounds.minX, nx));
        nz = Math.min(this.bounds.maxZ, Math.max(this.bounds.minZ, nz));
        if (this.voxelActive && this.voxel && this.isBlockedWorld(nx, nz)) {
          if (!this.isBlockedWorld(nx, this.character.position.z)) {
            nz = this.character.position.z;
          } else if (!this.isBlockedWorld(this.character.position.x, nz)) {
            nx = this.character.position.x;
          } else {
            nx = this.character.position.x;
            nz = this.character.position.z;
          }
        }
        this.character.position.x = nx;
        this.character.position.z = nz;
        this.charHeading = lerpAngle(this.charHeading, Math.atan2(dx, dz), Math.min(1, dt * 8));
      }
    }

    const nextAnimState: "idle" | "walk" | "run" =
      input.forward !== 0 || input.strafe !== 0
        ? input.sprint
          ? "run"
          : "walk"
        : "idle";
    if (this.charMixer && nextAnimState !== this.charAnimState) {
      const from = this.charActions[this.charAnimState];
      const to = this.charActions[nextAnimState];
      if (to) {
        to.reset().play();
        if (from) from.crossFadeTo(to, 0.2, false);
        this.charAnimState = nextAnimState;
      }
    }
    this.charMixer?.update(dt);

    for (const npc of this.npcs) {
      if (!npc.group.visible) continue;
      const npcDist = Math.hypot(
        npc.group.position.x - this.character.position.x,
        npc.group.position.z - this.character.position.z
      );
      npc.group.rotation.y = Math.atan2(
        this.character.position.x - npc.group.position.x,
        this.character.position.z - npc.group.position.z
      );
      const nextNpcState: "idle" | "interact" =
        npcDist < NPC_GREET_DIST ? "interact" : "idle";
      if (npc.mixer && nextNpcState !== npc.animState) {
        const from = npc.actions[npc.animState];
        const to = npc.actions[nextNpcState];
        if (to) {
          to.reset().play();
          if (from) from.crossFadeTo(to, 0.25, false);
          npc.animState = nextNpcState;
        }
      }
      npc.mixer?.update(dt);
    }

    let targetY = this.charY;
    if (this.voxelActive && this.voxel) {
      const g = this.voxelGroundHeight(
        this.character.position.x,
        this.character.position.z,
        this.charY + MAX_STEP_HEIGHT,
        MAX_STEP_HEIGHT + MAX_DROP_HEIGHT
      );
      if (g !== null) targetY = g + 0.02;
    } else if (this.groundHeightProvider) {
      targetY = this.groundHeightProvider(this.character.position.x, this.character.position.z);
    }
    const groundDelta = targetY - this.charY;
    if (Math.abs(groundDelta) < 0.002) {
      this.charY = targetY;
    } else {
      this.charY += groundDelta * Math.min(1, dt * 12);
    }
    this.character.position.y = this.charY;
    this.character.rotation.y = this.charHeading;

    for (let index = 0; index < this.routeArrows.length; index++) {
      const arrow = this.routeArrows[index];
      if (arrow.userData.cleared === 1) continue;
      const reached =
        Math.hypot(
          arrow.position.x - this.character.position.x,
          arrow.position.z - this.character.position.z
        ) < ROUTE_CLEAR_DIST &&
        Math.abs(arrow.position.y - this.charY) < 1.6;
      if (reached && index >= this.routeProgress) {
        this.routeProgress = index + 1;
      }
      if (index < this.routeProgress) {
        arrow.userData.cleared = 1;
      }
    }

    this.routeArrows.forEach((arrow, index) => {
      const mat = arrow.material as THREE.MeshBasicMaterial;
      const glow = arrow.userData.glow as THREE.Mesh | undefined;
      const glowMaterial = glow?.material as THREE.MeshBasicMaterial | undefined;

      if (arrow.userData.cleared === 1) {
        const fade = 1 - Math.min(1, dt * 6);
        mat.opacity *= fade;
        arrow.scale.multiplyScalar(1 + dt * 1.2);
        if (glow && glowMaterial) {
          glowMaterial.opacity *= fade;
          glow.scale.multiplyScalar(1 + dt * 1.2);
        }
        if (mat.opacity < 0.02) {
          arrow.visible = false;
          if (glow) glow.visible = false;
        }
        return;
      }

      const lead = index - this.routeProgress;
      const pulse = 0.5 + 0.5 * Math.sin(t * 3.2 - lead * 0.65);
      const focus = lead < 6 ? 1 : Math.max(0.28, 1 - (lead - 6) * 0.12);
      mat.opacity = (0.58 + pulse * 0.3) * focus;
      arrow.scale.setScalar((0.9 + pulse * 0.18) * (lead === 0 ? 1.18 : 1));
      if (glow && glowMaterial) {
        glowMaterial.opacity = (0.48 + pulse * 0.24) * focus;
        glow.scale.setScalar(0.92 + pulse * 0.18);
      }
    });

    const forwardX = Math.sin(this.charHeading);
    const forwardZ = Math.cos(this.charHeading);
    const rightX = Math.cos(this.charHeading);
    const rightZ = -Math.sin(this.charHeading);
    const follow = 1 - Math.exp(-4 * dt);
    const desiredAx = this.character.position.x + forwardX * 1.5 + rightX * 1.0;
    const desiredAz = this.character.position.z + forwardZ * 1.5 + rightZ * 1.0;
    this.assistant.position.x += (desiredAx - this.assistant.position.x) * follow;
    this.assistant.position.z += (desiredAz - this.assistant.position.z) * follow;
    this.assistant.position.y = this.charY + 1.3 + Math.sin(t * 2.2) * 0.12;
    this.assistant.lookAt(
      this.character.position.x,
      1.2,
      this.character.position.z
    );

    const yaw = this.camYaw;
    const horiz = this.cameraDistance * Math.cos(this.camPitch);
    const height =
      this.charY + CAMERA_BASE_HEIGHT + this.cameraDistance * Math.sin(this.camPitch);
    const camFollow = 1 - Math.exp(-5 * dt);
    const desiredCamera = this.resolveCameraPosition(
      new THREE.Vector3(
        this.character.position.x + Math.sin(yaw) * horiz,
        height,
        this.character.position.z + Math.cos(yaw) * horiz
      )
    );
    this.camera.position.x += (desiredCamera.x - this.camera.position.x) * camFollow;
    const cameraYDelta = desiredCamera.y - this.camera.position.y;
    if (Math.abs(cameraYDelta) < 0.0005) {
      this.camera.position.y = desiredCamera.y;
    } else {
      this.camera.position.y += cameraYDelta * camFollow;
    }
    this.camera.position.z += (desiredCamera.z - this.camera.position.z) * camFollow;
    this.camera.lookAt(
      this.character.position.x + Math.sin(this.camYaw + Math.PI) * CAMERA_LOOK_AHEAD,
      this.charY + CAMERA_LOOK_HEIGHT,
      this.character.position.z + Math.cos(this.camYaw + Math.PI) * CAMERA_LOOK_AHEAD
    );

    if (this.aholoActive && this.aholoViewer && this.aholoCamera && this.aholoLookTarget) {
      this.aholoCamera.position.set(
        this.camera.position.x,
        this.camera.position.y,
        this.camera.position.z
      );
      this.aholoCamera.up.set(0, 1, 0);
      const forward = new THREE.Vector3();
      this.camera.getWorldDirection(forward);
      this.aholoLookTarget.set(
        this.camera.position.x + forward.x,
        this.camera.position.y + forward.y,
        this.camera.position.z + forward.z
      );
      this.aholoCamera.lookAt(this.aholoLookTarget);
      this.aholoCamera.fov = this.camera.fov;
      this.aholoCamera.aspect = this.camera.aspect;
      this.aholoCamera.updateProjectionMatrix();
      if (
        this.aholoLod &&
        this.aholoLodCamera &&
        this.aholoLookTarget &&
        this.aholoLodTarget
      ) {
        const p = this.aholoCamera.position;
        const t = this.aholoLookTarget;
        if (this.aholoCoordinateSystem === "y-up") {
          this.aholoLodCamera.position.set(p.x, p.y, p.z);
          this.aholoLodCamera.up.set(0, 1, 0);
          this.aholoLodTarget.set(t.x, t.y, t.z);
        } else {
          this.aholoLodCamera.position.set(p.x, -p.z, p.y);
          this.aholoLodCamera.up.set(0, 0, 1);
          this.aholoLodTarget.set(t.x, -t.z, t.y);
        }
        this.aholoLodCamera.lookAt(this.aholoLodTarget);
        this.aholoLodCamera.fov = this.aholoCamera.fov;
        this.aholoLodCamera.aspect = this.aholoCamera.aspect;
        this.aholoLodCamera.updateProjectionMatrix();
        this.aholoLod.tick(this.aholoLodCamera);
      }
      this.aholoViewer.render();
    }
    const hotspots: HotspotViewState[] = [];
    let nearestInteractiveId: string | null = null;
    let nearestInteractiveDist = Infinity;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    const temp = new THREE.Vector3();

    this.points.forEach((point) => {
      const dx = point.position.x - this.character.position.x;
      const dz = point.position.z - this.character.position.z;
      const distance = Math.hypot(dx, dz);
      const stage: HotspotStage =
        distance > SENSE_DIST ? "far" : distance > INTERACT_DIST ? "sense" : "interactive";

      if (stage === "interactive" && distance < nearestInteractiveDist) {
        nearestInteractiveDist = distance;
        nearestInteractiveId = point.id;
      }

      if (stage !== "far") {
        temp
          .set(
            point.position.x,
            point.position.y + 2.3,
            point.position.z
          )
          .project(this.camera);
        const behindCamera = temp.z >= 1;
        const faceYaw = this.camYaw + Math.PI;

        // 与移动同一套右方向定义，否则相机背后的热点会被钉到反方向的屏幕边缘。
        const rightX = -Math.cos(faceYaw);
        const rightZ = Math.sin(faceYaw);
        const side = dx * rightX + dz * rightZ;
        const rawX = behindCamera
          ? side >= 0 ? w : 0
          : (temp.x * 0.5 + 0.5) * w;
        const rawY = behindCamera
          ? h * 0.58
          : (-temp.y * 0.5 + 0.5) * h;
        const edge = rawX < 24 ? "left" : rawX > w - 24 ? "right" : null;
        hotspots.push({
          id: point.id,
          screenX: Math.min(w - 24, Math.max(24, rawX)),
          screenY: Math.min(h - 72, Math.max(256, rawY)),
          stage,
          distance,
          edge,
        });
      }
    });

    for (const side of ["left", "right"] as const) {
      const edgeHotspots = hotspots
        .filter((hotspot) => hotspot.edge === side)
        .sort((a, b) => a.screenY - b.screenY);
      let nextY = 256;
      for (const hotspot of edgeHotspots) {
        hotspot.screenY = Math.max(hotspot.screenY, nextY);
        nextY = hotspot.screenY + 72;
      }
    }

    this.focusedId = nearestInteractiveId;

    if (this.frameCb) {
      const facing = yaw + Math.PI;
      const normYaw = ((facing % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      this.frameCb({
        x: this.character.position.x,
        y: this.charY,
        z: this.character.position.z,
        heading: normYaw,
        hotspots,
        focusedId: this.focusedId,
      });
    }
  }

  dispose() {
    this.disposed = true;
    this.resizeObserver.disconnect();
    this.destroyAholoRenderer();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
