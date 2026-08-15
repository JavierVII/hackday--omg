import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from "react";
import {
  AnimationMixer,
  Box3,
  Group,
  SRGBColorSpace,
  Vector3,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

type AssetPreviewCanvasProps = {
  modelUrl: string;
  resetKey: number;
  modelScale?: number;
  brightness?: number;
  onReady: () => void;
  onError: () => void;
};

type PreviewErrorBoundaryProps = {
  children: ReactNode;
  modelUrl: string;
  onError: () => void;
};

class PreviewErrorBoundary extends Component<PreviewErrorBoundaryProps, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  componentDidUpdate(previousProps: PreviewErrorBoundaryProps) {
    if (previousProps.modelUrl !== this.props.modelUrl && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

/* 自转：约 40 秒一圈。OrbitControls 的角速度公式是 (2π / 60 * autoRotateSpeed) * delta，
   必须给 update() 传 delta，否则会退化成「每帧固定角度」，在 120Hz 屏上转速翻倍。 */
const AUTO_ROTATE_SPEED = 1.5;

/* 手动拖动后停一会儿再接回自转，免得刚松手镜头就自己跑 */
const AUTO_ROTATE_RESUME_MS = 2400;

function PreviewControls({ resetKey }: { resetKey: number }) {
  const { camera, gl, size } = useThree();
  const controlsRef = useRef<OrbitControls | null>(null);
  const resumeAtRef = useRef(0);
  const aspectRatio = size.width / Math.max(size.height, 1);
  const defaultDistance = 4.2 * Math.max(1, 0.95 / aspectRatio);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.autoRotate = !reducedMotion.matches;
    controls.autoRotateSpeed = AUTO_ROTATE_SPEED;
    controls.minDistance = 2.1;
    controls.maxDistance = 12;
    controls.minPolarAngle = Math.PI * 0.14;
    controls.maxPolarAngle = Math.PI * 0.82;
    controls.target.set(0, 0, 0);
    controls.update();
    controlsRef.current = controls;

    const handleInteractionStart = () => {
      controls.autoRotate = false;
      resumeAtRef.current = 0;
    };

    const handleInteractionEnd = () => {
      resumeAtRef.current = reducedMotion.matches
        ? 0
        : performance.now() + AUTO_ROTATE_RESUME_MS;
    };

    const handleMotionPreferenceChange = () => {
      controls.autoRotate = !reducedMotion.matches;
      resumeAtRef.current = 0;
    };

    controls.addEventListener("start", handleInteractionStart);
    controls.addEventListener("end", handleInteractionEnd);
    reducedMotion.addEventListener("change", handleMotionPreferenceChange);

    return () => {
      controls.removeEventListener("start", handleInteractionStart);
      controls.removeEventListener("end", handleInteractionEnd);
      reducedMotion.removeEventListener("change", handleMotionPreferenceChange);
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl]);

  useEffect(() => {
    const controls = controlsRef.current;

    camera.position.set(0, 0.35, defaultDistance);
    controls?.target.set(0, 0, 0);
    controls?.update();

    // 重置视角同时把自转接回来
    if (controls && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      controls.autoRotate = true;
      resumeAtRef.current = 0;
    }
  }, [camera, defaultDistance, resetKey]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (resumeAtRef.current !== 0 && performance.now() >= resumeAtRef.current) {
      controls.autoRotate = true;
      resumeAtRef.current = 0;
    }

    controls.update(delta);
  });

  return null;
}

function NormalizedModel({
  modelUrl,
  modelScale = 1,
  onReady,
}: Pick<AssetPreviewCanvasProps, "modelUrl" | "modelScale" | "onReady">) {
  const gltf = useLoader(GLTFLoader, modelUrl);
  const mixerRef = useRef<AnimationMixer | null>(null);

  const model = useMemo(() => {
    const modelClone = clone(gltf.scene) as Group;
    modelClone.updateMatrixWorld(true);

    const bounds = new Box3().setFromObject(modelClone);
    const center = bounds.getCenter(new Vector3());
    const size = bounds.getSize(new Vector3());
    const longestSide = Math.max(size.x, size.y, size.z) || 1;
    const scale = (2.55 * modelScale) / longestSide;

    modelClone.position.copy(center).multiplyScalar(-1);
    modelClone.scale.setScalar(scale);
    modelClone.traverse((child) => {
      if ("isMesh" in child && child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return modelClone;
  }, [gltf.scene, modelScale]);

  useEffect(() => {
    if (gltf.animations.length > 0) {
      const mixer = new AnimationMixer(model);
      gltf.animations.forEach((clip) => mixer.clipAction(clip).play());
      mixerRef.current = mixer;
    }

    onReady();

    return () => {
      mixerRef.current?.stopAllAction();
      mixerRef.current = null;
    };
  }, [gltf.animations, model, onReady]);

  useFrame((_, delta) => mixerRef.current?.update(delta));

  return <primitive object={model} />;
}

export function AssetPreviewCanvas({
  modelUrl,
  resetKey,
  modelScale = 1,
  brightness = 1,
  onReady,
  onError,
}: AssetPreviewCanvasProps) {
  return (
    <PreviewErrorBoundary key={modelUrl} modelUrl={modelUrl} onError={onError}>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ fov: 38, near: 0.01, far: 100, position: [0, 0.35, 4.2] }}
        gl={{ antialias: true, alpha: true, outputColorSpace: SRGBColorSpace }}
        shadows
      >
        {/* 不设 <color attach="background">：画布保持透明，
            由 .asset-viewer__stage 的宣纸底与展台装饰透上来 */}
        <ambientLight intensity={1.5 * brightness} />
        <hemisphereLight args={["#fff7e9", "#587064", 1.35 * brightness]} />
        <directionalLight
          castShadow
          color="#fff1d8"
          intensity={2.4 * brightness}
          position={[3.5, 5, 4]}
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight color="#9fb0cf" intensity={1.1 * brightness} position={[-4, 2, -3]} />
        <Suspense fallback={null}>
          <NormalizedModel modelUrl={modelUrl} modelScale={modelScale} onReady={onReady} />
        </Suspense>
        <PreviewControls resetKey={resetKey} />
      </Canvas>
    </PreviewErrorBoundary>
  );
}
