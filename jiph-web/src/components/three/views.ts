/** Camera presets for the product viewer. Kept free of three.js so the page bundle stays small. */
export type View = "three-quarter" | "front" | "side" | "top";

/** Unit direction from the model towards the camera. Products face −z, so "front" looks from −z. */
export const VIEW_DIR: Record<View, [number, number, number]> = {
  "three-quarter": [-0.62, 0.42, -0.66],
  front: [0, 0.12, -1],
  side: [1, 0.12, 0],
  top: [0, 1, -0.0001],
};
