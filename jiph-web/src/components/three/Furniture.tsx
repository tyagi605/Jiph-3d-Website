"use client";

import type { ReactNode } from "react";
import type { Kind } from "@/data/catalog";
import Scholar90 from "./Scholar90";

/**
 * Procedural stand-ins for JIPH products, built to catalogue dimensions.
 * Units are metres; every model sits on y = 0 and is centred on x/z.
 * Students face −z (towards the board) in all seating models.
 * Replace with glTF exports from factory CAD as hero models arrive.
 */

export type Finish = { wood: string; metal: string; accent?: string };

type BoxProps = {
  size: [number, number, number];
  at: [number, number, number];
  color: string;
  rot?: [number, number, number];
  rough?: number;
  metal?: number;
};

function Box({ size, at, color, rot, rough = 0.7, metal = 0 }: BoxProps) {
  return (
    <mesh position={at} rotation={rot} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={rough} metalness={metal} />
    </mesh>
  );
}

const T = 0.03; // steel tube section
const steel = (c: string) => ({ color: c, rough: 0.45, metal: 0.55 });

/** Scholar 90 / 15 / 91 style: desk top in front, bench behind, side frames. */
export function DeskBench({ w, d, h, f }: { w: number; d: number; h: number; f: Finish }) {
  const seatH = h * 0.6;
  const topD = Math.min(0.42, d * 0.45);
  const seatD = Math.min(0.3, d * 0.33);
  const frames = w > 1.3 ? [-w / 2 + 0.04, 0, w / 2 - 0.04] : [-w / 2 + 0.04, w / 2 - 0.04];
  return (
    <group>
      <Box size={[w, 0.025, topD]} at={[0, h, -d / 2 + topD / 2]} color={f.wood} />
      <Box size={[w - 0.08, 0.012, topD - 0.1]} at={[0, h - 0.16, -d / 2 + topD / 2 + 0.03]} {...steel(f.metal)} />
      <Box size={[w, 0.028, seatD]} at={[0, seatH, d / 2 - seatD / 2 - 0.04]} color={f.wood} />
      <Box size={[w, 0.11, 0.018]} at={[0, seatH + 0.28, d / 2 - 0.03]} rot={[-0.12, 0, 0]} color={f.wood} />
      {frames.map((x) => (
        <group key={x}>
          <Box size={[T, h, T]} at={[x, h / 2, -d / 2 + 0.06]} {...steel(f.metal)} />
          <Box size={[T, seatH + 0.36, T]} at={[x, (seatH + 0.36) / 2, d / 2 - 0.05]} {...steel(f.metal)} />
          <Box size={[T, T, d - 0.06]} at={[x, 0.015, 0]} {...steel(f.metal)} />
          <Box size={[T, T, topD]} at={[x, h - 0.03, -d / 2 + topD / 2]} {...steel(f.metal)} />
          <Box size={[T, T, seatD + 0.06]} at={[x, seatH - 0.03, d / 2 - seatD / 2 - 0.05]} {...steel(f.metal)} />
          <Box size={[T, T, d * 0.62]} at={[x, h * 0.42, -0.02]} rot={[0.42, 0, 0]} {...steel(f.metal)} />
        </group>
      ))}
    </group>
  );
}

/** Fixed lecture-hall row: writing top + modesty panel in front, tip-up seats behind. */
export function LectureRow({ w, d, h, seats, f, upholstered }: { w: number; d: number; h: number; seats: number; f: Finish; upholstered?: boolean }) {
  const pitch = w / seats;
  const seatColor = upholstered ? "#2A2C30" : f.wood;
  return (
    <group position={[0, 0, -0.25]}>
      <Box size={[w, 0.025, d]} at={[0, h, 0]} color={f.wood} />
      <Box size={[w, h - 0.12, 0.012]} at={[0, (h - 0.12) / 2 + 0.06, -d / 2 + 0.02]} {...steel(f.metal)} />
      <Box size={[w - 0.1, 0.012, d - 0.12]} at={[0, h - 0.14, 0.02]} {...steel(f.metal)} />
      {[-w / 2 + 0.025, w / 2 - 0.025].map((x) => (
        <Box key={x} size={[0.05, h, d + 0.7]} at={[x, h / 2, 0.35]} color={f.wood} />
      ))}
      {Array.from({ length: seats }, (_, i) => {
        const x = -w / 2 + pitch * (i + 0.5);
        return (
          <group key={i} position={[x, 0, d / 2 + 0.38]}>
            <Box size={[pitch * 0.82, 0.05, 0.4]} at={[0, 0.45, 0]} color={seatColor} rough={upholstered ? 0.95 : 0.7} />
            <Box size={[pitch * 0.82, 0.42, 0.04]} at={[0, 0.72, 0.22]} rot={[-0.1, 0, 0]} color={seatColor} rough={upholstered ? 0.95 : 0.7} />
            <Box size={[0.05, 0.42, 0.05]} at={[0, 0.21, 0.05]} {...steel(f.metal)} />
            <Box size={[0.3, 0.02, 0.3]} at={[0, 0.01, 0.05]} {...steel(f.metal)} />
          </group>
        );
      })}
    </group>
  );
}

/** Mentor teacher table: top, modesty panel, drawer pedestal. */
export function TeacherTable({ w, d, h, f }: { w: number; d: number; h: number; f: Finish }) {
  return (
    <group>
      <Box size={[w, 0.03, d]} at={[0, h - 0.015, 0]} color={f.wood} />
      <Box size={[0.03, h - 0.03, d - 0.04]} at={[-w / 2 + 0.03, (h - 0.03) / 2, 0]} color={f.wood} />
      <Box size={[w - 0.06, h * 0.5, 0.018]} at={[0, h * 0.55, -d / 2 + 0.06]} color={f.wood} />
      <Box size={[0.42, h - 0.03, d - 0.04]} at={[w / 2 - 0.23, (h - 0.03) / 2, 0]} color={f.wood} />
      {[0.2, 0.42, 0.62].map((y) => (
        <Box key={y} size={[0.12, 0.012, 0.012]} at={[w / 2 - 0.23, y, d / 2 - 0.01]} {...steel(f.metal)} />
      ))}
    </group>
  );
}

/** Reading / plain table with steel apron and four legs. */
export function ReadingTable({ w, d, h, f }: { w: number; d: number; h: number; f: Finish }) {
  const lx = w / 2 - 0.06, lz = d / 2 - 0.06;
  return (
    <group>
      <Box size={[w, 0.03, d]} at={[0, h - 0.015, 0]} color={f.wood} />
      <Box size={[w - 0.1, 0.07, d - 0.1]} at={[0, h - 0.07, 0]} {...steel(f.metal)} />
      {[[-lx, -lz], [lx, -lz], [-lx, lz], [lx, lz]].map(([x, z]) => (
        <Box key={`${x}${z}`} size={[0.05, h - 0.03, 0.05]} at={[x, (h - 0.03) / 2, z]} {...steel(f.metal)} />
      ))}
    </group>
  );
}

/** Cantina: table on a central frame with two attached benches. */
export function CafeTable({ w, d, h, f }: { w: number; d: number; h: number; f: Finish }) {
  const topD = d * 0.42;
  return (
    <group>
      <ReadingTable w={w} d={topD} h={h} f={f} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Box size={[w, 0.04, 0.32]} at={[0, 0.45, s * (d / 2 - 0.16)]} color={f.wood} />
          <Box size={[w - 0.2, T, T]} at={[0, 0.42, s * (d / 2 - 0.16)]} {...steel(f.metal)} />
          <Box size={[T, T, d / 2 - topD / 2]} at={[-w / 2 + 0.1, 0.42, s * (topD / 2 + (d / 2 - topD / 2) / 2)]} {...steel(f.metal)} />
          <Box size={[T, T, d / 2 - topD / 2]} at={[w / 2 - 0.1, 0.42, s * (topD / 2 + (d / 2 - topD / 2) / 2)]} {...steel(f.metal)} />
        </group>
      ))}
    </group>
  );
}

/** Formula lab island: dark resistant top, cabinets below, reagent shelf above. */
export function LabTable({ w, d, h, f }: { w: number; d: number; h: number; f: Finish }) {
  const cab = (x: number, z: number) => <Box key={`${x}${z}`} size={[w / 2 - 0.08, h - 0.15, d / 2 - 0.08]} at={[x, (h - 0.15) / 2 + 0.1, z]} color={f.wood} />;
  return (
    <group>
      <Box size={[w, 0.03, d]} at={[0, h - 0.015, 0]} color="#22262B" rough={0.35} />
      {cab(-w / 4, -d / 4)}
      {cab(w / 4, -d / 4)}
      {cab(-w / 4, d / 4)}
      {cab(w / 4, d / 4)}
      <Box size={[w, 0.1, d]} at={[0, 0.05, 0]} {...steel(f.metal)} />
      {[-w / 2 + 0.1, w / 2 - 0.1].map((x) => (
        <Box key={x} size={[0.04, 0.6, 0.04]} at={[x, h + 0.3, 0]} {...steel(f.metal)} />
      ))}
      <Box size={[w - 0.1, 0.02, 0.3]} at={[0, h + 0.36, 0]} color="#F2F2F0" rough={0.3} />
      <Box size={[w - 0.1, 0.02, 0.3]} at={[0, h + 0.6, 0]} color="#F2F2F0" rough={0.3} />
      <Box size={[w * 0.4, 0.08, 0.1]} at={[0, h + 0.06, 0]} color="#E9E9E6" />
    </group>
  );
}

/** Victor kids table with two stools. */
export function KidsTable({ w, d, h, color }: { w: number; d: number; h: number; color: string }) {
  return (
    <group>
      <mesh position={[0, h - 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.04, d]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => (
        <Box key={`${sx}${sz}`} size={[0.04, h - 0.04, 0.04]} at={[sx * (w / 2 - 0.05), (h - 0.04) / 2, sz * (d / 2 - 0.05)]} {...steel("#B9BCBF")} />
      ))}
      {[-1, 1].map((s) => (
        <group key={s} position={[0, 0, s * (d / 2 + 0.22)]}>
          <Box size={[0.3, 0.04, 0.3]} at={[0, 0.28, 0]} color={color} rough={0.4} />
          <Box size={[0.04, 0.26, 0.04]} at={[0, 0.13, 0]} {...steel("#B9BCBF")} />
        </group>
      ))}
    </group>
  );
}

/** Library rack: side panels, shelves, rear cross-bracing. */
export function Rack({ w, d, h, f, slanted }: { w: number; d: number; h: number; f: Finish; slanted?: boolean }) {
  const n = Math.max(2, Math.round(h / 0.36));
  return (
    <group>
      {[-w / 2 + 0.015, w / 2 - 0.015].map((x) => (
        <Box key={x} size={[0.03, h, d]} at={[x, h / 2, 0]} color={f.wood} />
      ))}
      {Array.from({ length: n + 1 }, (_, i) => (
        <Box key={i} size={[w - 0.04, 0.02, d - 0.04]} at={[0, 0.06 + (i * (h - 0.1)) / n, 0]} rot={slanted && i > 0 && i < n ? [0.35, 0, 0] : undefined} {...steel(f.metal)} />
      ))}
      <Box size={[w * 1.05, 0.02, 0.02]} at={[0, h / 2, -d / 2 + 0.01]} rot={[0, 0, Math.atan2(h, w) * 0.9]} {...steel(f.metal)} />
      <Box size={[w * 1.05, 0.02, 0.02]} at={[0, h / 2, -d / 2 + 0.01]} rot={[0, 0, -Math.atan2(h, w) * 0.9]} {...steel(f.metal)} />
    </group>
  );
}

function BedFrame({ w, d, y, f, head }: { w: number; d: number; y: number; f: Finish; head: number }) {
  return (
    <group position={[0, y, 0]}>
      <Box size={[d, 0.05, w]} at={[0, 0, 0]} {...steel(f.metal)} />
      <Box size={[d - 0.08, 0.14, w - 0.08]} at={[0, 0.1, 0]} color="#F1EFEA" rough={0.95} />
      <Box size={[0.4, 0.08, w * 0.6]} at={[-d / 2 + 0.3, 0.2, 0]} color="#FFFFFF" rough={0.95} />
      <Box size={[0.03, head, w]} at={[-d / 2 + 0.015, head / 2 - 0.02, 0]} color={f.wood} />
      <Box size={[0.03, head * 0.6, w]} at={[d / 2 - 0.015, head * 0.3 - 0.02, 0]} color={f.wood} />
    </group>
  );
}

/** Single hostel bed (length along x). */
export function Bed({ w, d, h, f }: { w: number; d: number; h: number; f: Finish }) {
  const deck = 0.4;
  return (
    <group>
      <BedFrame w={d} d={w} y={deck} f={f} head={h - deck} />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => (
        <Box key={`${sx}${sz}`} size={[0.04, deck, 0.04]} at={[sx * (w / 2 - 0.03), deck / 2, sz * (d / 2 - 0.03)]} {...steel(f.metal)} />
      ))}
      <Box size={[w * 0.5, 0.22, d - 0.12]} at={[0.1, 0.14, 0]} color={f.wood} />
    </group>
  );
}

/** Bunk or loft bed: posts, two decks (or a deck over a desk), ladder. */
export function Bunk({ w, d, h, f, loft }: { w: number; d: number; h: number; f: Finish; loft?: boolean }) {
  const top = h - 0.45;
  return (
    <group>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => (
        <Box key={`${sx}${sz}`} size={[0.05, h, 0.05]} at={[sx * (w / 2 - 0.03), h / 2, sz * (d / 2 - 0.03)]} {...steel(f.metal)} />
      ))}
      <BedFrame w={d} d={w} y={top} f={f} head={0.35} />
      <Box size={[w - 0.1, 0.03, 0.03]} at={[0, top + 0.35, d / 2 - 0.03]} {...steel(f.metal)} />
      {loft ? (
        <group>
          <Box size={[w * 0.55, 0.03, d * 0.6]} at={[w * 0.15, 0.75, -d * 0.18]} color={f.wood} />
          <Box size={[0.03, 0.75, d * 0.6]} at={[w * 0.15 + w * 0.275, 0.375, -d * 0.18]} color={f.wood} />
        </group>
      ) : (
        <BedFrame w={d} d={w} y={0.3} f={f} head={0.3} />
      )}
      {Array.from({ length: 5 }, (_, i) => (
        <Box key={i} size={[0.04, 0.03, 0.4]} at={[w / 2 + 0.02, 0.3 + i * ((top - 0.3) / 4), 0.1]} {...steel(f.metal)} />
      ))}
    </group>
  );
}

/** Almirah / wardrobe. */
export function Wardrobe({ w, d, h, f, woodDoors }: { w: number; d: number; h: number; f: Finish; woodDoors?: boolean }) {
  return (
    <group>
      <Box size={[w, h, d]} at={[0, h / 2, 0]} {...steel(f.metal)} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Box size={[w / 2 - 0.02, h - 0.08, 0.012]} at={[s * (w / 4), h / 2, d / 2 + 0.006]} color={woodDoors ? f.wood : f.metal} rough={woodDoors ? 0.7 : 0.45} metal={woodDoors ? 0 : 0.55} />
          <Box size={[0.02, 0.2, 0.03]} at={[s * 0.04, h * 0.52, d / 2 + 0.025]} color="#C9CCCF" rough={0.3} metal={0.8} />
        </group>
      ))}
    </group>
  );
}

/** Row of upholstered auditorium chairs. */
export function AudiRow({ w, seats, accent = "#7A1E24" }: { w: number; seats: number; accent?: string }) {
  const pitch = w / seats;
  return (
    <group>
      {Array.from({ length: seats }, (_, i) => (
        <group key={i} position={[-w / 2 + pitch * (i + 0.5), 0, 0]}>
          <Box size={[pitch * 0.86, 0.12, 0.48]} at={[0, 0.46, 0]} color={accent} rough={0.95} />
          <Box size={[pitch * 0.86, 0.62, 0.1]} at={[0, 0.82, 0.28]} rot={[-0.12, 0, 0]} color={accent} rough={0.95} />
        </group>
      ))}
      {Array.from({ length: seats + 1 }, (_, i) => (
        <Box key={i} size={[0.06, 0.68, 0.58]} at={[-w / 2 + pitch * i, 0.34, 0.05]} color="#2B2D31" />
      ))}
    </group>
  );
}

/** Renders the right model for a product kind at catalogue size (mm). */
export function FurnitureModel({ kind, dims, seats = 2, finish, colour, slug }: { kind: Kind; dims: [number, number, number]; seats?: number; finish: Finish; colour?: string; slug?: string }): ReactNode {
  const [w, d, h] = dims.map((v) => v / 1000) as [number, number, number];
  switch (kind) {
    case "desk-bench":
      return slug === "scholar-90"
        ? <Scholar90 w={w} d={d} h={h} f={{ panel: finish.wood, frame: finish.metal }} />
        : <DeskBench w={w} d={d} h={h} f={finish} />;
    case "lecture-row": return <LectureRow w={w} d={Math.min(d, 0.45)} h={h} seats={seats} f={finish} upholstered={slug === "scholar-105" || slug === "scholar-213"} />;
    case "teacher-table": return <TeacherTable w={w} d={d} h={h} f={finish} />;
    case "reading-table": return <ReadingTable w={w} d={d} h={h} f={finish} />;
    case "cafe-table": return <CafeTable w={w} d={d} h={h} f={finish} />;
    case "lab-table": return <LabTable w={w} d={d} h={h} f={finish} />;
    case "kids-table": return <KidsTable w={w} d={d} h={h} color={colour ?? "#D8343B"} />;
    case "rack": return <Rack w={w} d={d} h={h} f={finish} slanted={slug === "wisdom-10"} />;
    case "bed": return <Bed w={w} d={d} h={h} f={finish} />;
    case "bunk": return <Bunk w={w} d={d} h={h} f={finish} loft={slug === "magnum-29"} />;
    case "wardrobe": return <Wardrobe w={w} d={d} h={h} f={finish} woodDoors={slug === "stack-5"} />;
    case "audi-chair": return <AudiRow w={w} seats={seats} />;
  }
}
