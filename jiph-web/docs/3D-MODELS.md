# Adding real 3D product models

Product pages show a procedural model built from catalogue dimensions. Add a GLB file and the page shows the real product instead, still with the size, finish and dimension controls.

## Export (from SolidWorks, Fusion, SketchUp, Blender…)

1. **Orientation:** Y up, and the **front of the product facing −Z** (the side a student faces the board from, or the modesty panel side).
2. **Format:** glTF binary (`.glb`). Units can be millimetres or metres; the site scales the model to the catalogue width automatically.
3. **Name the materials** so visitors can switch finishes:
   - `panel`, `top`, `seat`, `laminate` or `wood`: follows the chosen laminate or panel colour
   - `frame`, `steel`, `metal`, `powder`, `leg` or `tube`: follows the chosen powder-coat colour
   - Anything else (rubber feet, hinges, printed logos) keeps its own colour and textures.
4. **Keep it light:** under about 50k triangles and 2 MB per model. In Blender, apply a *Decimate* modifier and export with **Draco compression** on. Bake fine detail such as perforations into textures where you can. Real holes are fine for one hero product.
5. One file per size if the sizes look different, e.g. `scholar-90-1103.glb` for the 2-seater and `scholar-90-1104.glb` for the 3-seater.

## Hook it up

1. Put the files in `public/models/`.
2. Add them to the product in `src/data/catalog.ts`:

```ts
{
  slug: "scholar-90",
  // …
  models: {
    "1103": "/models/scholar-90-1103.glb",
    "1104": "/models/scholar-90-1104.glb",
  },
}
```

3. Rebuild. Sizes without a file keep showing the procedural model, and if a file fails to load the procedural model appears instead.
