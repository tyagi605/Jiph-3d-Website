"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import type { Kind } from "@/data/catalog";
import { FurnitureModel, type Finish } from "./Furniture";

type Props = {
  kind: Kind;
  dims: [number, number, number];
  seats?: number;
  finish: Finish;
  colour?: string;
  slug?: string;
};

export default function ProductViewer({ kind, dims, seats, finish, colour, slug }: Props) {
  const span = Math.max(dims[0], dims[1], dims[2]) / 1000;
  const dist = Math.max(1.8, span * 1.9);
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [dist * 0.85, dist * 0.6, dist], fov: 35, near: 0.05, far: 100 }}
      gl={{ antialias: true, preserveDrawingBuffer: false }}
    >
      <color attach="background" args={["#F3F1EE"]} />
      <hemisphereLight args={["#ffffff", "#d9d2c7", 0.9]} />
      <directionalLight position={[3, 6, 4]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3} />
      <directionalLight position={[-4, 3, -2]} intensity={0.35} />
      <group>
        <FurnitureModel kind={kind} dims={dims} seats={seats} finish={finish} colour={colour} slug={slug} />
      </group>
      <ContactShadows position={[0, 0.001, 0]} opacity={0.45} scale={span * 3} blur={2.4} far={2} />
      <OrbitControls makeDefault target={[0, (dims[2] / 1000) * 0.45, 0]} enablePan={false} minDistance={dist * 0.45} maxDistance={dist * 2} maxPolarAngle={Math.PI / 2.05} autoRotate autoRotateSpeed={0.6} />
    </Canvas>
  );
}
