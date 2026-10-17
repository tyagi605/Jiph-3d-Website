"use client";

import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, BrightnessContrast, EffectComposer, SMAA, SSAO, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";
import { fabric, plaster, woodGrain } from "./textures";

// rect-area lights (LED panels) need their lookup tables registered once
if (typeof window !== "undefined") RectAreaLightUniformsLib.init();
import { TeacherTable } from "./Furniture";
import Scholar90 from "./Scholar90";
import { DESKS, TL } from "./timeline";

/**
 * A premium 9 m × 8 m × 3.2 m classroom that assembles on scroll.
 * Walls and ceiling are single-sided planes facing inward, so the camera can
 * look in from outside ("doll-house" cut-away) without anything blocking it.
 * Students face −z, towards the smart panel on the back wall.
 */

const W = 9, D = 8, H = 3.2;
const C = {
  wall: "#F6F4F0",
  blue: "#2B54C6",
  amber: "#F2A93B",
  desk: "#2350C9",
  frame: "#C3C7CC",
  wood: "#B58A5E",
  alu: "#B9BEC4",
};

/** Fixture indices mounted on the front (amber) and right (blue) walls — see the <Pop k={…}> list. */
const FRONT_WALL = [4, 5, 6, 9];
const RIGHT_WALL = [7];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const range = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeBack = (t: number) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);
const smooth = (t: number) => t * t * (3 - 2 * t);

const CAM: { p: number; pos: [number, number, number]; look: [number, number, number] }[] = [
  { p: 0, pos: [8.5, 11, 10.5], look: [0, 0, 0] },
  { p: 0.25, pos: [7.6, 5.4, 8.2], look: [0, 0.9, -0.6] },
  { p: 0.66, pos: [-2.6, 3.2, 7.4], look: [0.2, 0.9, -1] },
  { p: 0.86, pos: [0.9, 1.3, 3.5], look: [0, 1.35, -4] },
  { p: 1, pos: [9.5, 7.5, 11], look: [0, 0.8, 0] },
];

function cameraAt(p: number) {
  let i = 0;
  while (i < CAM.length - 2 && p > CAM[i + 1].p) i++;
  const a = CAM[i], b = CAM[i + 1];
  const t = smooth(clamp((p - a.p) / (b.p - a.p)));
  const lerp3 = (u: number[], v: number[]) => u.map((x, k) => x + (v[k] - x) * t) as [number, number, number];
  return { pos: lerp3(a.pos, b.pos), look: lerp3(a.look, b.look) };
}

/* ---------- procedural textures (no network fetches) ---------- */

function useFloorTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 1024;
    const g = c.getContext("2d")!;
    const n = 4; // 4 × 4 tiles of 600 mm per texture tile (2.4 m)
    const s = 1024 / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const l = 92 + Math.random() * 3;
      g.fillStyle = `hsl(36, 9%, ${l - 6}%)`;
      g.fillRect(i * s, j * s, s, s);
      // faint marble veining
      g.strokeStyle = `hsla(30, 8%, 70%, 0.12)`;
      g.lineWidth = 1.2;
      for (let k = 0; k < 3; k++) {
        g.beginPath();
        let x = i * s + Math.random() * s, y = j * s;
        g.moveTo(x, y);
        while (y < (j + 1) * s) { x += (Math.random() - 0.5) * 30; y += 20; g.lineTo(x, y); }
        g.stroke();
      }
    }
    g.strokeStyle = "#CFC9BF";
    g.lineWidth = 3;
    for (let i = 0; i <= n; i++) {
      g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, 1024); g.stroke();
      g.beginPath(); g.moveTo(0, i * s); g.lineTo(1024, i * s); g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(W / 2.4, D / 2.4);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);
}

function useScreenTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024; c.height = 576;
    const g = c.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 1024, 576);
    grad.addColorStop(0, "#0E2A6B"); grad.addColorStop(1, "#1C5FD8");
    g.fillStyle = grad; g.fillRect(0, 0, 1024, 576);
    g.fillStyle = "rgba(255,255,255,0.9)";
    g.font = "600 30px Inter, Arial, sans-serif";
    g.fillText("SCIENCE · GRADE 8", 64, 90);
    g.font = "700 72px Inter, Arial, sans-serif";
    g.fillText("Photosynthesis", 64, 180);
    g.font = "400 30px Inter, Arial, sans-serif";
    g.fillStyle = "rgba(255,255,255,0.75)";
    ["Sunlight + Water + CO₂", "→  Glucose + Oxygen"].forEach((l, i) => g.fillText(l, 64, 260 + i * 46));
    // simple leaf diagram
    g.fillStyle = "#3FBF6E";
    g.beginPath(); g.ellipse(780, 330, 150, 80, -0.5, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#E9FFE9"; g.lineWidth = 4;
    g.beginPath(); g.moveTo(660, 410); g.lineTo(900, 250); g.stroke();
    g.fillStyle = "#FFD45A";
    g.beginPath(); g.arc(900, 110, 46, 0, Math.PI * 2); g.fill();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}

/* ---------- small building blocks ---------- */

type V3 = [number, number, number];

function B({ s, p, c, r = 0.7, m = 0, cast = true, e, ei, rot, map, rmap }: { s: V3; p: V3; c: string; r?: number; m?: number; cast?: boolean; e?: string; ei?: number; rot?: V3; map?: THREE.Texture; rmap?: THREE.Texture }) {
  return (
    <mesh position={p} rotation={rot} castShadow={cast} receiveShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial color={c} roughness={r} metalness={m} emissive={e ?? "#000000"} emissiveIntensity={ei ?? 0} map={map ?? null} roughnessMap={rmap ?? null} />
    </mesh>
  );
}

function Wall({ w, h, p, rot, c }: { w: number; h: number; p: V3; rot: V3; c: string }) {
  return (
    <mesh position={p} rotation={rot} receiveShadow>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial color={c} map={plaster([w / 3, h / 3])} roughness={0.9} side={THREE.FrontSide} />
    </mesh>
  );
}

const WIN = { w: 1.7, h: 1.6, sill: 0.95, zs: [-2.5, 0, 2.5] };

/** Window wall built from solid segments around real openings, so the sun only enters through the glass. */
function WindowWall() {
  const x = -W / 2;
  const top = WIN.sill + WIN.h;
  const edges = [-D / 2, ...WIN.zs.flatMap((z) => [z - WIN.w / 2, z + WIN.w / 2]), D / 2];
  const piers: [number, number][] = [];
  for (let i = 0; i < edges.length; i += 2) piers.push([edges[i], edges[i + 1]]);
  const seg = (z0: number, z1: number, y0: number, y1: number, key: string) => (
    <mesh key={key} position={[x, (y0 + y1) / 2, (z0 + z1) / 2]} castShadow receiveShadow>
      <boxGeometry args={[0.12, y1 - y0, z1 - z0]} />
      <meshStandardMaterial color={C.wall} map={plaster([3, 1])} roughness={0.9} />
    </mesh>
  );
  return (
    <group>
      {seg(-D / 2, D / 2, 0, WIN.sill, "below")}
      {seg(-D / 2, D / 2, top, H, "above")}
      {piers.map(([a, b], i) => seg(a, b, WIN.sill, top, `p${i}`))}
    </group>
  );
}

function Window({ z }: { z: number }) {
  const { w, h, sill } = WIN;
  const x = -W / 2 + 0.07;
  const cy = sill + h / 2;
  return (
    <group>
      {/* daylight beyond the glass */}
      <mesh position={[x - 0.6, cy, z]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[w + 0.4, h + 0.4]} />
        <meshBasicMaterial color="#DDEFFF" toneMapped={false} />
      </mesh>
      <mesh position={[x - 0.03, cy, z]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[w, h]} />
        <meshPhysicalMaterial color="#EAF4FF" transparent opacity={0.12} roughness={0.05} metalness={0} />
      </mesh>
      {/* frame + mullions (cast sun shadows onto the floor) */}
      <B s={[0.06, 0.05, w + 0.08]} p={[x, sill, z]} c={C.alu} r={0.3} m={0.7} />
      <B s={[0.06, 0.05, w + 0.08]} p={[x, sill + h, z]} c={C.alu} r={0.3} m={0.7} />
      <B s={[0.06, h, 0.05]} p={[x, cy, z - w / 2]} c={C.alu} r={0.3} m={0.7} />
      <B s={[0.06, h, 0.05]} p={[x, cy, z + w / 2]} c={C.alu} r={0.3} m={0.7} />
      <B s={[0.05, h, 0.035]} p={[x, cy, z]} c={C.alu} r={0.3} m={0.7} />
      <B s={[0.05, 0.035, w]} p={[x, sill + h * 0.62, z]} c={C.alu} r={0.3} m={0.7} />
      {/* sill and half-drawn roller blind */}
      <B s={[0.22, 0.03, w + 0.2]} p={[x + 0.1, sill - 0.03, z]} c="#FFFFFF" r={0.4} />
      <B s={[0.03, h * 0.32, w - 0.06]} p={[x + 0.06, sill + h - h * 0.16, z]} c="#ECE7DE" r={0.95} map={fabric([8, 3])} />
      <B s={[0.06, 0.06, w]} p={[x + 0.07, sill + h + 0.05, z]} c="#FFFFFF" r={0.5} />
    </group>
  );
}

function LedPendant({ p, len = 2.4, light = true }: { p: V3; len?: number; light?: boolean }) {
  return (
    <group position={p}>
      <B s={[0.008, 0.45, 0.008]} p={[-len / 2 + 0.1, 0.25, 0]} c="#222" cast={false} />
      <B s={[0.008, 0.45, 0.008]} p={[len / 2 - 0.1, 0.25, 0]} c="#222" cast={false} />
      <B s={[len, 0.06, 0.07]} p={[0, 0, 0]} c="#16171A" r={0.4} m={0.4} cast={false} />
      <mesh position={[0, -0.032, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[len - 0.04, 0.05]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFF6E8" emissiveIntensity={4} toneMapped={false} />
      </mesh>
      {light && <rectAreaLight args={["#FFF4E6", 5, len - 0.1, 0.12]} position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} />}
    </group>
  );
}

/** Snake plant in a ceramic planter: tall, flat, slightly twisted blades. */
function Plant({ p, s = 1 }: { p: V3; s?: number }) {
  const blades = useMemo(() => {
    let seed = 42;
    const r = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    return Array.from({ length: 13 }, (_, i) => ({
      a: (i / 13) * Math.PI * 2 + r() * 0.4,
      d: 0.03 + r() * 0.1,
      h: (0.55 + r() * 0.45) * s,
      tilt: 0.05 + r() * 0.22,
      twist: (r() - 0.5) * 1.2,
      tone: r(),
    }));
  }, [s]);
  return (
    <group position={p}>
      <mesh position={[0, 0.24 * s, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.19 * s, 0.15 * s, 0.48 * s, 32]} />
        <meshStandardMaterial color="#F1EEE8" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.47 * s, 0]}>
        <cylinderGeometry args={[0.17 * s, 0.17 * s, 0.02, 32]} />
        <meshStandardMaterial color="#3B2C20" roughness={1} />
      </mesh>
      {blades.map((b, i) => (
        <group key={i} position={[Math.cos(b.a) * b.d * s, 0.47 * s, Math.sin(b.a) * b.d * s]} rotation={[Math.sin(b.a) * b.tilt, b.twist, -Math.cos(b.a) * b.tilt]}>
          <mesh position={[0, b.h / 2, 0]} scale={[1, 1, 0.12]} castShadow>
            <coneGeometry args={[0.035 * s, b.h, 4, 1]} />
            <meshStandardMaterial color={b.tone > 0.5 ? "#2F6B3A" : "#3D7F45"} roughness={0.55} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Books({ p, rot = 0 }: { p: V3; rot?: number }) {
  return (
    <group position={p} rotation={[0, rot, 0]}>
      <B s={[0.21, 0.012, 0.29]} p={[0, 0.006, 0]} c="#FFFFFF" r={0.85} />
      <B s={[0.17, 0.006, 0.24]} p={[0.28, 0.003, 0.02]} c="#F7F1E3" r={0.9} />
      <B s={[0.004, 0.004, 0.14]} p={[0.26, 0.008, 0.02]} c="#1A1A1A" r={0.4} />
    </group>
  );
}

function Pop({ children, k, gref }: { children: ReactNode; k: number; gref: (g: THREE.Group | null, k: number) => void }) {
  return <group ref={(g) => gref(g, k)} visible={false}>{children}</group>;
}

/* ---------- the room ---------- */

function Room({ progress, hq }: { progress: RefObject<number>; hq: boolean }) {
  const floorTex = useFloorTexture();
  const screenTex = useScreenTexture();
  const shell = useRef<THREE.Group>(null);
  const walls = useRef<THREE.Group>(null);
  const ceiling = useRef<THREE.Group>(null);
  const teacher = useRef<THREE.Group>(null);
  const desks = useRef<(THREE.Group | null)[]>([]);
  const fixtures = useRef<(THREE.Group | null)[]>([]);
  const look = useMemo(() => new THREE.Vector3(), []);
  const setFixture = (g: THREE.Group | null, k: number) => { fixtures.current[k] = g; };

  useFrame(({ camera }) => {
    const p = progress.current ?? 0;
    const f = easeOut(range(p, TL.floor[0], TL.floor[1]));
    if (shell.current) shell.current.scale.set(Math.max(f, 0.001), 1, Math.max(f, 0.001));
    const w = easeOut(range(p, TL.walls[0], TL.walls[1]));
    if (walls.current) { walls.current.scale.y = Math.max(w, 0.001); walls.current.visible = w > 0; }
    const ce = easeOut(range(p, 0.18, 0.26));
    if (ceiling.current) { ceiling.current.visible = ce > 0; ceiling.current.position.y = (1 - ce) * 1.5; }

    // Doll-house cut-away: hide fixtures on any wall the camera is looking through from outside.
    const c0 = camera.position;
    const hideFront = c0.z > D / 2, hideRight = c0.x > W / 2;
    fixtures.current.forEach((g, k) => {
      if (!g) return;
      const s = TL.board[0] + k * 0.012;
      const t = easeBack(range(p, s, s + 0.06));
      const cut = (hideFront && FRONT_WALL.includes(k)) || (hideRight && RIGHT_WALL.includes(k));
      g.visible = t > 0.001 && !cut;
      g.scale.setScalar(Math.max(0.001, t));
    });

    desks.current.forEach((g, i) => {
      if (!g) return;
      const s = TL.deskStart + i * TL.deskStep;
      const t = range(p, s, s + TL.deskDur);
      g.visible = t > 0;
      g.position.y = (1 - easeBack(t)) * 2.2;
      g.rotation.y = (1 - easeOut(t)) * 0.45;
    });

    const tt = easeOut(range(p, TL.teacher[0], TL.teacher[1]));
    if (teacher.current) { teacher.current.visible = tt > 0; teacher.current.position.x = 2.4 + (1 - tt) * 4; }

    const c = cameraAt(p);
    camera.position.set(...c.pos);
    look.set(...c.look);
    camera.lookAt(look);
  });

  const deskFinish = { panel: C.desk, frame: C.frame };

  return (
    <group>
      {/* floor */}
      <group ref={shell}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[W, D]} />
          {/* polished vitrified tile: low roughness picks up the LED rows and windows from the environment */}
          <meshStandardMaterial map={floorTex} roughness={0.2} metalness={0} envMapIntensity={1.2} />
        </mesh>
      </group>

      {/* walls (inward-facing planes) */}
      <group ref={walls} visible={false}>
        <Wall w={W} h={H} p={[0, H / 2, -D / 2]} rot={[0, 0, 0]} c={C.wall} />
        <WindowWall />
        <Wall w={D} h={H} p={[W / 2, H / 2, 0]} rot={[0, -Math.PI / 2, 0]} c={C.blue} />
        <Wall w={W} h={H} p={[0, H / 2, D / 2]} rot={[0, Math.PI, 0]} c={C.amber} />
        {/* skirting */}
        <B s={[W, 0.1, 0.015]} p={[0, 0.05, -D / 2 + 0.008]} c="#DCD6CC" cast={false} />
        <B s={[0.015, 0.1, D]} p={[-W / 2 + 0.068, 0.05, 0]} c="#DCD6CC" cast={false} />
        {/* blue accent returns either side of the panel wall */}
        <B s={[0.9, H, 0.02]} p={[-W / 2 + 0.45, H / 2, -D / 2 + 0.012]} c={C.blue} r={0.9} cast={false} />
        <B s={[0.9, H, 0.02]} p={[W / 2 - 0.45, H / 2, -D / 2 + 0.012]} c={C.amber} r={0.9} cast={false} />
        {WIN.zs.map((z) => <Window key={z} z={z} />)}
      </group>

      {/* ceiling + LED pendants */}
      <group ref={ceiling} visible={false}>
        <mesh position={[0, H, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W, D]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.95} />
        </mesh>
        {[-2.2, 0, 2.2].flatMap((z) => [-2.1, 2.1].map((x) => <LedPendant key={`${x}${z}`} p={[x, H - 0.5, z]} light={hq} />))}
      </group>

      {/* fixtures: pop in one after another */}
      {/* 0 · interactive flat panel */}
      <Pop k={0} gref={setFixture}>
        <group position={[0, 1.55, -D / 2 + 0.05]}>
          <RoundedBox args={[2.02, 1.2, 0.07]} radius={0.015} smoothness={3} castShadow>
            <meshStandardMaterial color="#111215" roughness={0.25} metalness={0.4} />
          </RoundedBox>
          <mesh position={[0, 0, 0.037]}>
            <planeGeometry args={[1.9, 1.07]} />
            <meshStandardMaterial map={screenTex} emissiveMap={screenTex} emissive="#FFFFFF" emissiveIntensity={0.85} roughness={0.15} toneMapped={false} />
          </mesh>
        </group>
      </Pop>
      {/* 1–2 · whiteboards */}
      {[-1, 1].map((sd, i) => (
        <Pop key={sd} k={1 + i} gref={setFixture}>
          <group position={[sd * 2.15, 1.5, -D / 2 + 0.03]}>
            <B s={[1.7, 1.15, 0.03]} p={[0, 0, 0]} c={C.alu} r={0.3} m={0.7} />
            <B s={[1.64, 1.09, 0.012]} p={[0, 0, 0.018]} c="#FBFBFA" r={0.15} />
            <B s={[1.4, 0.04, 0.07]} p={[0, -0.6, 0.04]} c={C.alu} r={0.3} m={0.7} />
            <B s={[0.12, 0.02, 0.02]} p={[-0.3, -0.57, 0.05]} c="#1F4FD1" />
            <B s={[0.12, 0.02, 0.02]} p={[-0.12, -0.57, 0.05]} c="#D21F2B" />
          </group>
        </Pop>
      ))}
      {/* 3 · teacher's dais */}
      <Pop k={3} gref={setFixture}>
        <B s={[4.2, 0.12, 1.3]} p={[0, 0.06, -D / 2 + 0.7]} c={C.wood} r={0.45} map={woodGrain([2, 1])} />
      </Pop>
      {/* 4 · storage cabinets + bookshelf on the amber wall */}
      <Pop k={4} gref={setFixture}>
        <group position={[-1.6, 0, D / 2 - 0.26]}>
          <B s={[3.6, 0.86, 0.48]} p={[0, 0.43, 0]} c="#FFFFFF" r={0.4} />
          <B s={[3.66, 0.035, 0.52]} p={[0, 0.88, 0]} c={C.wood} r={0.4} map={woodGrain([2, 0.4])} />
          {Array.from({ length: 6 }, (_, i) => (
            <group key={i}>
              <B s={[0.005, 0.8, 0.005]} p={[-1.8 + 0.6 * (i + 1), 0.43, -0.245]} c="#DADADA" cast={false} />
              <B s={[0.14, 0.015, 0.02]} p={[-1.5 + 0.6 * i, 0.7, -0.25]} c="#9AA0A6" m={0.7} r={0.3} cast={false} />
            </group>
          ))}
          {/* books on top */}
          {Array.from({ length: 14 }, (_, i) => (
            <B key={i} s={[0.05, 0.22 + (i % 4) * 0.03, 0.17]} p={[-1.5 + i * 0.06, 1.0 + (i % 4) * 0.015, 0]} c={["#2B54C6", "#E2533A", "#F2A93B", "#3E8E5A", "#FFFFFF"][i % 5]} r={0.7} />
          ))}
        </group>
      </Pop>
      {/* 5 · open shelving unit */}
      <Pop k={5} gref={setFixture}>
        <group position={[1.2, 0, D / 2 - 0.2]}>
          <B s={[1.2, 1.9, 0.36]} p={[0, 0.95, 0]} c="#FFFFFF" r={0.45} />
          {[0.45, 0.9, 1.35].map((y) => <B key={y} s={[1.14, 0.025, 0.34]} p={[0, y, -0.02]} c={C.wood} r={0.45} map={woodGrain([1, 0.4])} />)}
          {[0.12, 0.58, 1.03].map((y, j) => Array.from({ length: 3 }, (_, i) => (
            <B key={`${j}${i}`} s={[0.3, 0.3, 0.28]} p={[-0.38 + i * 0.38, y + 0.15, -0.03]} c={["#2B54C6", "#F2A93B", "#FFFFFF"][(i + j) % 3]} r={0.6} />
          )))}
        </group>
      </Pop>
      {/* 6 · door */}
      <Pop k={6} gref={setFixture}>
        <group position={[3.4, 0, D / 2 - 0.03]}>
          <B s={[1.05, 2.15, 0.05]} p={[0, 1.075, 0]} c="#A87B52" r={0.5} map={woodGrain([0.6, 1.5])} />
          <B s={[1.17, 2.22, 0.03]} p={[0, 1.11, 0.02]} c="#FFFFFF" r={0.5} />
          <B s={[0.14, 0.025, 0.04]} p={[-0.38, 1.05, -0.04]} c="#C9CDD2" m={0.8} r={0.25} />
          <B s={[0.3, 0.7, 0.01]} p={[0, 1.55, -0.03]} c="#CFE3F2" r={0.1} />
        </group>
      </Pop>
      {/* 7 · notice board, clock and AC on the blue wall */}
      <Pop k={7} gref={setFixture}>
        <group position={[W / 2 - 0.03, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <B s={[2.2, 1.1, 0.03]} p={[0.6, 1.5, 0]} c="#C99A6B" r={0.95} />
          <B s={[2.28, 1.18, 0.02]} p={[0.6, 1.5, -0.01]} c={C.alu} m={0.6} r={0.3} />
          {Array.from({ length: 10 }, (_, i) => (
            <B key={i} s={[0.32, 0.24, 0.005]} p={[-0.25 + (i % 5) * 0.42, 1.72 - Math.floor(i / 5) * 0.42, 0.02]} rot={[0, 0, ((i * 37) % 9 - 4) * 0.02]} c={["#FFFFFF", "#FFE58A", "#BDE3FF", "#FFC7C0", "#C8F1C8"][i % 5]} r={0.9} cast={false} />
          ))}
          <mesh position={[-2.2, 2.35, 0.02]}>
            <cylinderGeometry args={[0.18, 0.18, 0.04, 40]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
          </mesh>
          <B s={[0.012, 0.13, 0.01]} p={[-2.2, 2.39, 0.03]} c="#111" rot={[Math.PI / 2, 0, 0]} cast={false} />
          <B s={[1.05, 0.3, 0.22]} p={[-1.8, 2.75, 0.11]} c="#FFFFFF" r={0.35} />
          <B s={[0.95, 0.02, 0.02]} p={[-1.8, 2.62, 0.21]} c="#D6D6D6" cast={false} />
        </group>
      </Pop>
      {/* 8–9 · plants */}
      <Pop k={8} gref={setFixture}><Plant p={[-W / 2 + 0.45, 0, -D / 2 + 0.5]} s={1.3} /></Pop>
      <Pop k={9} gref={setFixture}><Plant p={[W / 2 - 0.45, 0, D / 2 - 0.5]} s={1.2} /></Pop>

      {/* Scholar 90 desks with notebooks */}
      {DESKS.map(([x, z], i) => (
        <group key={i} ref={(g) => { desks.current[i] = g; }} position={[x, 0, z]} visible={false}>
          <Scholar90 w={1.066} d={0.93} h={0.76} f={deskFinish} />
          <Books p={[-0.25, 0.763, -0.25]} rot={0.06 * ((i % 3) - 1)} />
          {i % 2 === 0 && <Books p={[0.22, 0.763, -0.25]} rot={-0.05} />}
        </group>
      ))}

      {/* teacher table + chair on the dais */}
      <group ref={teacher} position={[2.4, 0.12, -D / 2 + 0.8]} rotation={[0, Math.PI, 0]} visible={false}>
        <TeacherTable w={1.2} d={0.6} h={0.75} f={{ wood: C.wood, metal: "#3C4046" }} />
        <group position={[0, 0, -0.55]}>
          <B s={[0.5, 0.08, 0.48]} p={[0, 0.48, 0]} c="#1D1E22" r={0.9} />
          <B s={[0.48, 0.55, 0.06]} p={[0, 0.82, -0.24]} rot={[-0.12, 0, 0]} c="#1D1E22" r={0.9} />
          <B s={[0.05, 0.42, 0.05]} p={[0, 0.23, 0]} c="#5C6066" m={0.7} r={0.3} />
          <B s={[0.6, 0.03, 0.06]} p={[0, 0.04, 0]} c="#2A2C30" />
          <B s={[0.06, 0.03, 0.6]} p={[0, 0.04, 0]} c="#2A2C30" />
        </group>
      </group>
    </group>
  );
}

/** With frameloop="demand" the scene only redraws when the visitor scrolls or resizes. */
function RedrawOnScroll() {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    // the overlay updates progress in its own rAF, so add a trailing frame after scrolling stops
    let trail: ReturnType<typeof setTimeout> | undefined;
    const on = () => { invalidate(); clearTimeout(trail); trail = setTimeout(() => invalidate(), 60); };
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    // a few extra frames while the environment map and fonts settle
    const t = [100, 400, 1200].map((ms) => setTimeout(on, ms));
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); t.forEach(clearTimeout); };
  }, [invalidate]);
  return null;
}

function Effects() {
  return (
    <EffectComposer multisampling={0} enableNormalPass>
      <SSAO blendFunction={BlendFunction.MULTIPLY} samples={21} radius={0.12} intensity={22} luminanceInfluence={0.55} worldDistanceThreshold={6} worldDistanceFalloff={1} worldProximityThreshold={0.6} worldProximityFalloff={0.3} />
      <Bloom mipmapBlur luminanceThreshold={1} intensity={0.45} radius={0.55} />
      <BrightnessContrast brightness={0.02} contrast={0.08} />
      <Vignette offset={0.32} darkness={0.42} />
      <SMAA />
    </EffectComposer>
  );
}

export default function ClassroomScene({ progress, lowPower }: { progress: RefObject<number>; lowPower?: boolean }) {
  const hq = !lowPower;
  return (
    <Canvas
      shadows={hq ? "soft" : false}
      frameloop="demand"
      dpr={hq ? [1, 1.5] : [1, 1.25]}
      camera={{ fov: 36, near: 0.1, far: 80, position: CAM[0].pos }}
      gl={{ antialias: !hq, powerPreference: "high-performance", toneMapping: THREE.AgXToneMapping, toneMappingExposure: 0.95 }}
    >
      <color attach="background" args={["#F3F1EE"]} />
      <fog attach="fog" args={["#F3F1EE", 22, 40]} />

      {/* image-based light: LED rows overhead + window wall, rendered once */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#FFF6EA" position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[8, 6, 1]} />
        <Lightformer form="rect" intensity={3} color="#E3F1FF" position={[-8, 2, 0]} rotation={[0, Math.PI / 2, 0]} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#FFFFFF" position={[8, 2, 4]} rotation={[0, -Math.PI / 2, 0]} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={0.6} color="#FFE6C2" position={[0, 2, 8]} rotation={[0, Math.PI, 0]} scale={[8, 3, 1]} />
      </Environment>

      <hemisphereLight args={["#FFFFFF", "#E6DED2", 0.35]} />
      {/* sun through the windows on the left wall */}
      <directionalLight
        position={[-9, 6.5, 1.5]}
        intensity={1.6}
        color="#FFF1DC"
        castShadow={hq}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-far={30}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      />
      {/* soft fill from the LED rows */}
      <directionalLight position={[2, 9, 3]} intensity={0.55} color="#FFF8F0" />

      <Room progress={progress} hq={hq} />
      <RedrawOnScroll />
      {hq && <Effects />}
    </Canvas>
  );
}
