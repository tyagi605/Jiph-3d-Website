# Classroom render brief (for the 3D artist)

The home page plays a **rendered image sequence** as the visitor scrolls. Whatever you render is exactly what people see, so render it like a final marketing shot.

Until frames are added to `public/sequences/classroom/`, the site falls back to a live WebGL scene automatically.

## What to render

One continuous animation of a premium classroom being furnished with JIPH products, **150 frames** (5 seconds at 30 fps). Use the same scene and quality as the Scholar 90 classroom render: white glossy floor, blue and amber walls, linear black LED pendants.

Keep this timing. The on-screen text and the "Seats installed" counter are synced to these frame numbers:

| Frames | What happens | Camera |
|---|---|---|
| 1–15 | Empty floor appears (tiles only, soft daylight) | High, wide 3/4 view from the back-right corner |
| 12–30 | Walls rise; windows and blinds on the left wall | Slowly lowering towards the room |
| 24–39 | Ceiling, LED pendants, smart panel, whiteboards, cabinets, plants appear | Settles at a 3/4 view, about 5 m high |
| 39–99 | **12 Scholar 90 two-seaters drop in one by one**, starting about 4–5 frames apart, each landing in about 10 frames (the last one lands by frame 99). Order: front row (nearest the board) left → right, then row 2, 3, 4 | Slow arc to the left side of the room |
| 98–110 | Mentor-1 teacher table slides onto the dais | Continues the arc |
| 110–128 | Move to a **student's eye level** (1.25 m) from the back row, looking at the smart panel | Smooth dolly in |
| 128–150 | Pull back up and out to a wide hero shot of the finished room | Smooth crane out |

Desk positions, room size (9 m × 8 m × 3.2 m) and furniture dimensions are in `src/components/three/timeline.ts` and `src/data/catalog.ts` if you want to match the live version.

## Render settings

- **Resolution:** 1920 × 1080 (16:9). Keep the important action in the centre 4:5 area, because phones show a centre crop.
- **Format:** PNG or high-quality JPG, numbered (`classroom_0001.png` …).
- **Turn off:** motion blur, depth of field changes, and auto-exposure. Frames must match in brightness or the scrub flickers.
- **Lock** white balance, exposure and any camera shake.
- **Software:** Twinmotion, D5 Render, Lumion, Enscape or Blender Cycles. Path tracing on if available.

## Adding the frames to the site

From the `jiph-web` folder:

```bash
npm run sequence -- "D:/renders/classroom"
```

This creates `public/sequences/classroom/` with:
- a desktop set (1600 × 900 WebP), about 10–20 MB for 150 frames
- a phone set (720 × 900 portrait crop), about 4–8 MB
- `manifest.json`

Then rebuild (`npm run build`) or restart the site. The home page uses the frames automatically.

Options: `--every 2` keeps every second frame (half the download), `--quality 65` makes files smaller, and `--mobile-crop landscape` uses a landscape phone version instead of a crop.

## Checking without real renders

- `/?sequence=test` plays 150 generated test frames.
- `/?sequence=off` forces the live 3D scene.
