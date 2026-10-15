"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { laminates, powderCoats } from "@/data/catalog";
import { DeskBench, TeacherTable } from "./Furniture";
import { DESKS, TL } from "./timeline";

/** Room: 9 m × 8 m. Students face −z, towards the board on the back wall. */
const ROOM = { w: 9, d: 8, h: 3 };
const finish = { wood: laminates[0].hex, metal: powderCoats[0].hex };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const range = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeBack = (t: number) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);
const smooth = (t: number) => t * t * (3 - 2 * t);

const CAM: { p: number; pos: [number, number, number]; look: [number, number, number] }[] = [
  { p: 0, pos: [7.5, 9.5, 9.5], look: [0, 0, 0] },
  { p: 0.25, pos: [6.8, 5.2, 7.6], look: [0, 0.6, -0.6] },
  { p: 0.66, pos: [-2.2, 3.4, 7.2], look: [0, 0.7, -0.8] },
  { p: 0.86, pos: [0.9, 1.25, 3.7], look: [0, 1.2, -4] },
  { p: 1, pos: [8.5, 7.5, 10], look: [0, 0.4, 0] },
];

function cameraAt(p: number) {
  let i = 0;
  while (i < CAM.length - 2 && p > CAM[i + 1].p) i++;
  const a = CAM[i], b = CAM[i + 1];
  const t = smooth(clamp((p - a.p) / (b.p - a.p)));
  const lerp3 = (u: number[], v: number[]) => u.map((x, k) => x + (v[k] - x) * t) as [number, number, number];
  return { pos: lerp3(a.pos, b.pos), look: lerp3(a.look, b.look) };
}

function Room({ progress }: { progress: RefObject<number> }) {
  const floor = useRef<THREE.Group>(null);
  const walls = useRef<THREE.Group>(null);
  const board = useRef<THREE.Group>(null);
  const teacher = useRef<THREE.Group>(null);
  const desks = useRef<(THREE.Group | null)[]>([]);
  const look = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }) => {
    const p = progress.current ?? 0;
    const f = easeOut(range(p, TL.floor[0], TL.floor[1]));
    if (floor.current) { floor.current.scale.set(Math.max(f, 0.001), 1, Math.max(f, 0.001)); }
    const w = easeOut(range(p, TL.walls[0], TL.walls[1]));
    if (walls.current) { walls.current.scale.y = Math.max(w, 0.001); walls.current.visible = w > 0; }
    const b = easeOut(range(p, TL.board[0], TL.board[1]));
    if (board.current) { board.current.scale.setScalar(Math.max(b, 0.001)); board.current.visible = b > 0; }

    desks.current.forEach((g, i) => {
      if (!g) return;
      const s = TL.deskStart + i * TL.deskStep;
      const t = range(p, s, s + TL.deskDur);
      g.visible = t > 0;
      g.position.y = (1 - easeBack(t)) * 2.4;
      g.rotation.y = (1 - easeOut(t)) * 0.5;
    });

    const tt = easeOut(range(p, TL.teacher[0], TL.teacher[1]));
    if (teacher.current) { teacher.current.visible = tt > 0; teacher.current.position.x = 2.3 + (1 - tt) * 4; }

    const c = cameraAt(p);
    camera.position.set(...c.pos);
    look.set(...c.look);
    camera.lookAt(look);
  });

  return (
    <group>
      <group ref={floor}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[ROOM.w, ROOM.d]} />
          <meshStandardMaterial color="#E6E0D6" roughness={0.9} />
        </mesh>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-ROOM.w / 2 + (i + 1) * (ROOM.w / 9), 0.002, 0]}>
            <planeGeometry args={[0.012, ROOM.d]} />
            <meshBasicMaterial color="#D6CFC3" />
          </mesh>
        ))}
      </group>

      <group ref={walls}>
        <mesh position={[0, ROOM.h / 2, -ROOM.d / 2]} receiveShadow>
          <boxGeometry args={[ROOM.w, ROOM.h, 0.12]} />
          <meshStandardMaterial color="#F4F1EC" roughness={0.95} />
        </mesh>
        <mesh position={[-ROOM.w / 2, ROOM.h / 2, 0]} receiveShadow>
          <boxGeometry args={[0.12, ROOM.h, ROOM.d]} />
          <meshStandardMaterial color="#EFEBE5" roughness={0.95} />
        </mesh>
        {[-2.4, 0, 2.4].map((z) => (
          <mesh key={z} position={[-ROOM.w / 2 + 0.07, 1.7, z]}>
            <boxGeometry args={[0.02, 1.3, 1.5]} />
            <meshStandardMaterial color="#CFE3F2" emissive="#BFDDF5" emissiveIntensity={0.35} roughness={0.2} />
          </mesh>
        ))}
        <mesh position={[0, 0.06, -ROOM.d / 2 + 0.07]}>
          <boxGeometry args={[ROOM.w, 0.12, 0.02]} />
          <meshStandardMaterial color="#B9B2A7" />
        </mesh>
      </group>

      <group ref={board} position={[0, 1.55, -ROOM.d / 2 + 0.08]}>
        <mesh>
          <boxGeometry args={[3.8, 1.25, 0.04]} />
          <meshStandardMaterial color="#2E4A3D" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0, -0.01]}>
          <boxGeometry args={[3.9, 1.35, 0.03]} />
          <meshStandardMaterial color="#9A9DA1" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.7, 0.05]}>
          <boxGeometry args={[3.8, 0.04, 0.08]} />
          <meshStandardMaterial color="#9A9DA1" metalness={0.5} roughness={0.4} />
        </mesh>
      </group>

      {DESKS.map(([x, z], i) => (
        <group key={i} ref={(g) => { desks.current[i] = g; }} position={[x, 0, z]} visible={false}>
          <DeskBench w={1.066} d={0.93} h={0.75} f={finish} />
        </group>
      ))}

      <group ref={teacher} position={[2.3, 0, -2.7]} rotation={[0, Math.PI, 0]} visible={false}>
        <TeacherTable w={1.2} d={0.6} h={0.75} f={finish} />
      </group>
    </group>
  );
}

export default function ClassroomScene({ progress, lowPower }: { progress: RefObject<number>; lowPower?: boolean }) {
  return (
    <Canvas shadows={!lowPower} dpr={lowPower ? [1, 1.25] : [1, 1.75]} camera={{ fov: 38, near: 0.1, far: 80, position: [7.5, 9.5, 9.5] }} gl={{ antialias: !lowPower, powerPreference: "high-performance" }}>
      <color attach="background" args={["#F3F1EE"]} />
      <fog attach="fog" args={["#F3F1EE", 18, 34]} />
      <hemisphereLight args={["#ffffff", "#d8d0c4", 1.0]} />
      <directionalLight position={[-6, 9, 5]} intensity={1.7} castShadow={!lowPower} shadow-mapSize={[2048, 2048]} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} shadow-bias={-0.0004} />
      <directionalLight position={[6, 4, 6]} intensity={0.4} />
      <Room progress={progress} />
    </Canvas>
  );
}
