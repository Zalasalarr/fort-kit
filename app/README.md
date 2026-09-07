# Fort Kit

A 3D sketchpad for things you build in the backyard — forts, climbing walls, monkey bars — in wood, brick, metal, rope and climbing holds. Sketch on a 1 ft grid, get a cut list, a cost against your budget, a safety read, and a printable drawing sheet.

It's a browser app: no install required, no account, no server. Your build autosaves on the device you're using.

## Run it

```
npm install
npm run dev
```

Open the printed `http://localhost:5173` URL in a browser on your Windows machine.

## Use it on your tablet too

Serve it so other devices on your Wi-Fi can reach it:

```
npm run build
npm run preview -- --host
```

This prints a "Network" URL like `http://192.168.1.23:4173`. Open it in the tablet's browser (same Wi-Fi as the computer running it). `npm run dev -- --host` works the same way while you're developing.

**Install it like an app.** The built version is a PWA:
- Windows (Edge/Chrome): open the URL, then use the install icon in the address bar (or menu → "Install Fort Kit"). It gets its own window and Start-menu entry.
- iPad / Android tablet: open the URL in Safari / Chrome → Share (or menu) → "Add to Home Screen".

Once installed it keeps working offline for whatever it has already loaded; fonts fall back to system fonts when offline.

Builds don't sync between devices automatically — use **List → Share 3D link** to move a build from one device to another (the whole build is encoded in the link).

## The tabs

- **Yard** — footprint, ground type, ages, budget ceiling. The yard is drawn as a blue outline in every 3D view and feeds the safety checks. Also: load the sample fort, or start from empty.
- **Plan** — the "draw first, decide later" mode. Paint 2 ft squares with a material + height brush (tap to raise, tap again to cycle, drag to paint) and watch the mass pull up live in 3D. **Convert mass to real parts** drops the blocks into the build with their own cut lists and costs.
- **Build** — the 3D editor. Drag a part to move it (snaps to the 1 ft grid), drag empty space to orbit, scroll or pinch to zoom. Turn, copy, delete, change height and material. Add parts from the strip at the bottom. **Marks** toggles on-model callouts. **Blueprint** switches between the realistic view (wood grain, brick courses, galvanized metal, rope, coloured holds, sunlight and shadows on your yard's grass / mulch / patio) and the flat drawing style. **Persp** switches from the isometric camera to a perspective one for a walk-around look.
- **Pieces** — real stock at actual dimensions, alongside the ready-made assemblies. Lumber (2×2, 2×4, 2×6, 2×8, 4×4, 1×3, 1×6 — a 2×4 is 1½ × 3½ in), ½" and ¾" plywood sheets, modular brick, concrete block, 12" pavers, 1" steel tube, ⅜" manila rope, and climbing holds. Add them from the **Add a piece** strip in Build or the **Parts → Pieces** catalog. A selected piece can be cut to length (and width, for sheets), turned in 90° or 15° steps, set flat / 45° / upright, and laid flat or on edge. The **Move** snap is 1 in, 6 in, or 1 ft (it switches to 1 in automatically when you add a brick or hold). While you drag a piece it **snaps to surfaces**: it rests on whatever is underneath, lands on a face you point at, edges line up flush with neighbours, and holds stick to vertical faces. **Drop** (or `G`) rests a raised piece back onto its support. **Copy** lays a brick end-to-end or a board side-by-side.
- **Tools** — in Build, **Build with a tool** lays real pieces for you: **Brick wall** (running bond with ⅜" joints, half-brick starts, end bricks cut to fit), **Deck** (rim and joists at 16" on center, 2×6 boards with ¼" gaps, 4×4 posts when raised), **Stud wall** (plates and studs at 16" or 24" OC, optional plywood sheathing), **Ladder**, **Roof** (2×6 rafters at 24" OC with corrugated panels, shed or gable, pitch flat / 3:12 / 6:12 / 9:12), **Railing** (4×4 posts, 2×4 rails, 2×2 balusters at 4" or 6" gaps), and **Stairs** (risers near 7" on an 11" run, 2×12 stringers, two 2×6 treads per step). Set the sizes, tap Place, then drag it into position. Any assembly has an **Explode into pieces** button that rebuilds it from real lumber, sheets, bricks, rope, tube or holds.
- **Groups** — pieces a tool lays (or an explode makes) move, turn, raise, drop, copy and delete as one. Switch **Edit → One piece** to adjust a single brick or board, or **Ungroup** to split the group up for good. Marks show one callout per group.
- **Parts** — the full catalog: Pieces (true stock) and Assemblies (1 ft-grid parts), filterable by material.
- **List** — the safety read (including any piece floating with nothing under it), the cut & buy list grouped by stock and length, **Stock to buy** (cut-to-length pieces packed onto 8 / 10 / 12 / 16 ft boards, with the offcut), the estimate vs. your ceiling, share link, and print.
- **Sheet** — the blueprint reader: the model is always annotated, callouts follow the orbit, with Iso / Plan / Front / Side views and a Parts / Cut list / Safety spec sheet. **Export sheet** opens a printable A-01 drawing sheet (drawing, parts table, cut list, safety read) — save it as PDF from the print dialog.

## Keyboard (desktop)

Arrow keys move the selected part by the snap step · `PgUp` / `PgDn` height · `G` drop onto support · `R` turn 90° (`Shift+R` 15°) · `T` cycle flat / 45° / upright · `E` flat / on edge · `[` `]` length by 1 in (`Shift` for 12 in) · `D` copy · `Delete` remove · `Ctrl+Z` / `Ctrl+Y` undo / redo · scroll to zoom. Tap the project name in the header to rename it.

## Safety read

Flags a deck at 4 ft or higher with no guard rail, a hard (patio) surface under a high deck, a high deck less than 6 ft from the yard edge, parts sitting outside the yard footprint, and an estimate over the budget ceiling.
