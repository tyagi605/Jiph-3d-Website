"use client";

import { useGLTF } from "@react-three/drei";
import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import type { Finish } from "./Furniture";

/**
 * Loads a product GLB exported from CAD / Blender and fits it to catalogue size.
 *
 * Export conventions (see docs/3D-MODELS.md):
 *  - Front of the product faces −Z, Y is up. Units can be mm or m — the model
 *    is scaled so its width matches the catalogue width exactly.
 *  - Name materials so finishes can be switched on the site:
 *      "panel" / "top" / "seat" / "laminate"  → laminate or panel colour
 *      "frame" / "steel" / "metal" / "powder" → powder-coat colour
 *    Anything else keeps its own colour and textures.
 */

const PANEL = /panel|top|seat|laminate|wood|board/i;
const FRAME = /frame|steel|metal|powder|leg|tube/i;

export default function GlbModel({ url, widthMm, finish }: { url: string; widthMm: number; finish: Finish }) {
  const { scene } = useGLTF(url);

  // clone so several viewers (and finish changes) never mutate the cached original
  const model = useMemo(() => {
    const root = scene.clone(true);
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = m.receiveShadow = true;
      m.material = Array.isArray(m.material) ? m.material.map((x) => x.clone()) : m.material.clone();
    });
    // fit: scale to catalogue width, centre on x/z, stand on y = 0
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const s = size.x > 0 ? widthMm / 1000 / size.x : 1;
    root.scale.setScalar(s);
    const box2 = new THREE.Box3().setFromObject(root);
    const c = box2.getCenter(new THREE.Vector3());
    root.position.set(-c.x, -box2.min.y, -c.z);
    return root;
  }, [scene, widthMm]);

  useLayoutEffect(() => {
    model.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      for (const mat of Array.isArray(m.material) ? m.material : [m.material]) {
        const std = mat as THREE.MeshStandardMaterial;
        if (!std.color) continue;
        if (PANEL.test(mat.name)) std.color.set(finish.wood);
        else if (FRAME.test(mat.name)) std.color.set(finish.metal);
      }
    });
  }, [model, finish.wood, finish.metal]);

  return <primitive object={model} />;
}
