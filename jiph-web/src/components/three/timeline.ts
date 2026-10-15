/** Shared by the 3D scene and its HTML overlay. Kept free of three.js so the overlay doesn't pull it into the main bundle. */

/** Desk positions [x, z] in metres: 4 rows × 3 columns of Scholar 90 two-seaters. */
export const DESKS = (() => {
  const xs = [-2.6, 0, 2.6];
  const zs = [-1.4, -0.25, 0.9, 2.05];
  return zs.flatMap((z) => xs.map((x) => [x, z] as const));
})();

/** Timeline, in scroll progress 0..1. */
export const TL = {
  floor: [0.02, 0.1],
  walls: [0.08, 0.2],
  board: [0.16, 0.24],
  deskStart: 0.26,
  deskStep: 0.03,
  deskDur: 0.07,
  teacher: [0.66, 0.74],
} as const;
