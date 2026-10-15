"use client";

import { ContactShadows, Environment, Html, Lightformer, Line, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { Kind } from "@/data/catalog";
import { FurnitureModel, type Finish } from "./Furniture";
import { VIEW_DIR, type View } from "./views";

type Props = {
  kind: Kind;
  dims: [number, number, number];
  seats?: number;
  finish: Finish;
  colour?: string;
  slug?: string;
  view?: View;
  showDims?: boolean;
};

/** Glides the camera to the chosen preset; the visitor can still orbit freely afterwards. */
function CameraRig({ view, dist, targetY, controls }: { view: View; dist: number; targetY: number; controls: React.RefObject<OrbitControlsImpl | null> }) {
  const { camera } = useThree();
  const goal = useMemo(() => new THREE.Vector3(), []);
  const moving = useRef(true);

  useEffect(() => {
    const [x, y, z] = VIEW_DIR[view];
    goal.set(x, y, z).normalize().multiplyScalar(dist).add(new THREE.Vector3(0, targetY, 0));
    moving.current = true;
    if (controls.current) controls.current.autoRotate = false;
  }, [view, dist, targetY, goal, controls]);

  useFrame((_, dt) => {
    if (!moving.current) return;
    camera.position.lerp(goal, 1 - Math.pow(0.0015, dt));
    controls.current?.target.set(0, targetY, 0);
    controls.current?.update();
    if (camera.position.distanceTo(goal) < 0.005) moving.current = false;
  });
  return null;
}

function DimLine({ from, to, label, offset }: { from: [number, number, number]; to: [number, number, number]; label: string; offset: [number, number, number] }) {
  const a = from.map((v, i) => v + offset[i]) as [number, number, number];
  const b = to.map((v, i) => v + offset[i]) as [number, number, number];
  const mid = a.map((v, i) => (v + b[i]) / 2) as [number, number, number];
  return (
    <group>
      <Line points={[a, b]} color="#D7000F" lineWidth={1.5} />
      <Line points={[from, a]} color="#D7000F" lineWidth={0.8} dashed dashSize={0.02} gapSize={0.015} />
      <Line points={[to, b]} color="#D7000F" lineWidth={0.8} dashed dashSize={0.02} gapSize={0.015} />
      <Html position={mid} center zIndexRange={[10, 0]}>
        <span className="dim-label">{label}</span>
      </Html>
    </group>
  );
}

function Dimensions({ dims }: { dims: [number, number, number] }) {
  const [W, D, H] = dims;
  const w = W / 2000, d = D / 2000, h = H / 1000;
  return (
    <group>
      <DimLine from={[-w, 0, -d]} to={[w, 0, -d]} offset={[0, 0, -0.12]} label={`W ${W}`} />
      <DimLine from={[w, 0, -d]} to={[w, 0, d]} offset={[0.12, 0, 0]} label={`D ${D}`} />
      <DimLine from={[-w, 0, -d]} to={[-w, h, -d]} offset={[-0.12, 0, -0.12]} label={`H ${H}`} />
    </group>
  );
}

export default function ProductViewer({ kind, dims, seats, finish, colour, slug, view = "three-quarter", showDims = false }: Props) {
  const span = Math.max(dims[0], dims[1], dims[2]) / 1000;
  const dist = Math.max(2.2, span * 2.45);
  const targetY = (dims[2] / 1000) * 0.45;
  const controls = useRef<OrbitControlsImpl | null>(null);
  const start = VIEW_DIR["three-quarter"].map((v) => v * dist) as [number, number, number];

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [start[0], start[1] + targetY, start[2]], fov: 32, near: 0.05, far: 100 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
    >
      <color attach="background" args={["#F3F1EE"]} />
      {/* studio: overhead softbox, two strip lights, warm bounce — rendered once, no network fetch */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.4} position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[6, 6, 1]} />
        <Lightformer form="rect" intensity={1.8} position={[-4, 2, -3]} rotation={[0, Math.PI / 4, 0]} scale={[1.2, 5, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[4, 2, 3]} rotation={[0, -Math.PI * 0.75, 0]} scale={[1.2, 5, 1]} />
        <Lightformer form="rect" intensity={0.6} color="#FFE9D0" position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[6, 6, 1]} />
      </Environment>
      <directionalLight position={[-2.5, 5, -3]} intensity={1.3} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3} shadow-bias={-0.0003} shadow-normalBias={0.02} />

      <FurnitureModel kind={kind} dims={dims} seats={seats} finish={finish} colour={colour} slug={slug} />
      {showDims && <Dimensions dims={dims} />}

      <ContactShadows position={[0, 0.001, 0]} opacity={0.55} scale={span * 3} blur={2.2} far={1.5} resolution={1024} />
      <OrbitControls ref={controls} makeDefault enablePan={false} minDistance={dist * 0.35} maxDistance={dist * 2.2} maxPolarAngle={Math.PI / 2.02} autoRotate autoRotateSpeed={0.5} onStart={() => { if (controls.current) controls.current.autoRotate = false; }} />
      <CameraRig view={view} dist={dist} targetY={targetY} controls={controls} />
    </Canvas>
  );
}
