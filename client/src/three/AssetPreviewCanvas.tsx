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

function PreviewControls({ resetKey }: { resetKey: number }) {
  const { camera, gl, size } = useThree();
  const controlsRef = useRef<OrbitControls | null>(null);
  const aspectRatio = size.width / Math.max(size.height, 1);
  const defaultDistance = 4.2 * Math.max(1, 0.95 / aspectRatio);

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.65;
    controls.minDistance = 2.1;
    controls.maxDistance = 12;
    controls.minPolarAngle = Math.PI * 0.14;
    controls.maxPolarAngle = Math.PI * 0.82;
    controls.target.set(0, 0, 0);
    controls.update();
    controlsRef.current = controls;

    return () => {
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl]);

  useEffect(() => {
    camera.position.set(0, 0.35, defaultDistance);
    controlsRef.current?.target.set(0, 0, 0);
    controlsRef.current?.update();
  }, [camera, defaultDistance, resetKey]);

  useFrame(() => controlsRef.current?.update());

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
        <color attach="background" args={["#e9e2d7"]} />
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
