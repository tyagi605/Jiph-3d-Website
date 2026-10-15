"use client";

import { RoundedBox } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

/**
 * Scholar 90 (1102–1105), modelled from the JIPH product sheet:
 *   overall depth 930, desk top 760, seat 450, backrest top 800 (mm).
 * Desk faces −z. Square-tube frame, perforated powder-coated front panel,
 * book shelf under the top, bench with backrest on the same side frames.
 */

const TUBE = 0.032;

/** Round-hole perforation as an alpha map: white = metal, black = hole. Shared by every desk. */
let perfTexture: THREE.CanvasTexture | null = null;
function getPerforation() {
  if (perfTexture || typeof document === "undefined") return perfTexture;
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#fff";
  g.fillRect(0, 0, 256, 128);
  g.fillStyle = "#000";
  // staggered 6×3 hole pattern per tile, holes ~9 mm on a ~40 mm pitch
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 6; col++) {
      const x = 21 + col * 42.6 + (row % 2 ? 21 : 0);
      const y = 22 + row * 42;
      g.beginPath();
      g.arc(x % 256, y, 6.5, 0, Math.PI * 2);
      g.fill();
    }
  }
  perfTexture = new THREE.CanvasTexture(c);
  perfTexture.wrapS = perfTexture.wrapT = THREE.RepeatWrapping;
  perfTexture.anisotropy = 4;
  return perfTexture;
}

function Tube({ len, at, axis = "y", color }: { len: number; at: [number, number, number]; axis?: "x" | "y" | "z"; color: string }) {
  const size: [number, number, number] = axis === "x" ? [len, TUBE, TUBE] : axis === "y" ? [TUBE, len, TUBE] : [TUBE, TUBE, len];
  return (
    <mesh position={at} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} metalness={0.65} roughness={0.32} />
    </mesh>
  );
}

function Foot({ at }: { at: [number, number, number] }) {
  return (
    <mesh position={at}>
      <boxGeometry args={[0.04, 0.012, 0.05]} />
      <meshStandardMaterial color="#1E1F22" roughness={0.8} />
    </mesh>
  );
}

function PerforatedPanel({ w, h, at, color }: { w: number; h: number; at: [number, number, number]; color: string }) {
  const tex = useMemo(() => {
    const base = getPerforation();
    if (!base) return null;
    const t = base.clone();
    t.repeat.set(w / 0.26, h / 0.13); // tile is 260 × 130 mm, matching the 2:1 canvas
    t.needsUpdate = true;
    return t;
  }, [w, h]);
  return (
    <mesh position={at} castShadow>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial color={color} metalness={0.35} roughness={0.42} alphaMap={tex ?? undefined} alphaTest={0.5} transparent={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

export type Scholar90Finish = { panel: string; frame: string };

export default function Scholar90({ w, d = 0.93, h = 0.76, f }: { w: number; d?: number; h?: number; f: Scholar90Finish }) {
  const seatH = 0.45;
  const backTop = 0.8;
  const topD = 0.42;
  const zFront = -d / 2;
  const zDeskRear = zFront + topD - 0.02;
  const zSeat = d / 2 - 0.19;
  const zBack = d / 2 - 0.035;
  const xs = w > 1.3 ? [-w / 2 + 0.03, 0, w / 2 - 0.03] : [-w / 2 + 0.03, w / 2 - 0.03];
  const blue = f.panel;

  return (
    <group>
      {/* Desk top with pen groove strip at the rear */}
      <RoundedBox args={[w, 0.025, topD]} radius={0.008} smoothness={3} position={[0, h - 0.0125, zFront + topD / 2]} castShadow receiveShadow>
        <meshStandardMaterial color={blue} roughness={0.38} metalness={0.05} />
      </RoundedBox>
      <mesh position={[0, h - 0.035, zFront + topD / 2]} castShadow>
        <boxGeometry args={[w - 0.01, 0.02, topD - 0.01]} />
        <meshStandardMaterial color={f.frame} metalness={0.65} roughness={0.32} />
      </mesh>
      <mesh position={[0, h + 0.003, zDeskRear - 0.035]}>
        <boxGeometry args={[w - 0.12, 0.004, 0.022]} />
        <meshStandardMaterial color="#1B2A55" roughness={0.6} />
      </mesh>

      {/* Front modesty panel: perforated band, plain lower band */}
      <PerforatedPanel w={w - 0.06} h={0.3} at={[0, h - 0.2, zFront + 0.012]} color={blue} />
      <mesh position={[0, h - 0.37, zFront + 0.012]}>
        <boxGeometry args={[w - 0.06, 0.03, 0.006]} />
        <meshStandardMaterial color={f.frame} metalness={0.65} roughness={0.32} />
      </mesh>

      {/* Book shelf */}
      <mesh position={[0, h - 0.17, zFront + topD / 2 + 0.01]} castShadow receiveShadow>
        <boxGeometry args={[w - 0.07, 0.012, topD - 0.06]} />
        <meshStandardMaterial color={f.frame} metalness={0.55} roughness={0.4} />
      </mesh>

      {/* Seat */}
      <RoundedBox args={[w, 0.03, 0.3]} radius={0.01} smoothness={3} position={[0, seatH, zSeat]} castShadow receiveShadow>
        <meshStandardMaterial color={blue} roughness={0.38} />
      </RoundedBox>

      {/* Backrest, slightly reclined */}
      <group position={[0, backTop - 0.08, zBack]} rotation={[-0.09, 0, 0]}>
        <RoundedBox args={[w, 0.16, 0.022]} radius={0.008} smoothness={3} castShadow receiveShadow>
          <meshStandardMaterial color={blue} roughness={0.38} />
        </RoundedBox>
      </group>

      {/* Side frames */}
      {xs.map((x) => (
        <group key={x}>
          {/* desk legs */}
          <Tube len={h - 0.025} at={[x, (h - 0.025) / 2, zFront + 0.03]} color={f.frame} />
          <Tube len={h - 0.025} at={[x, (h - 0.025) / 2, zDeskRear]} color={f.frame} />
          <Tube len={topD - 0.02} axis="z" at={[x, h - 0.04, zFront + topD / 2]} color={f.frame} />
          <Tube len={topD - 0.02} axis="z" at={[x, h - 0.17, zFront + topD / 2]} color={f.frame} />
          {/* bench legs and backrest post */}
          <Tube len={seatH - 0.015} at={[x, (seatH - 0.015) / 2, zSeat - 0.11]} color={f.frame} />
          <Tube len={backTop} at={[x, backTop / 2, zBack + 0.012]} color={f.frame} />
          <Tube len={0.3} axis="z" at={[x, seatH - 0.03, zSeat]} color={f.frame} />
          {/* floor runner tying desk and bench together */}
          <Tube len={d - 0.03} axis="z" at={[x, 0.03, 0]} color={f.frame} />
          <Tube len={zSeat - 0.11 - zDeskRear} axis="z" at={[x, 0.2, (zSeat - 0.11 + zDeskRear) / 2]} color={f.frame} />
          <Foot at={[x, 0.006, zFront + 0.03]} />
          <Foot at={[x, 0.006, zBack + 0.012]} />
        </group>
      ))}

      {/* Rear stretcher under the seat for rigidity */}
      <Tube len={w - 0.06} axis="x" at={[0, 0.2, zBack + 0.012]} color={f.frame} />
    </group>
  );
}
