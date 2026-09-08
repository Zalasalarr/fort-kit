# Fort Kit

A 3D sketchpad for things you build in the backyard — forts, climbing walls, monkey bars — in wood, brick, metal, rope and climbing holds. Sketch on a 1 ft grid, get a cut list, a cost against your budget, a safety read, and a printable drawing sheet.

It's a browser app: no install required, no account, no server. Your builds autosave on the device you're using, and you can keep as many projects as you like — tap **Projects** in the header to open, copy, delete, or start a new one.

## Run it

```
npm install
npm run dev
```

Open the printed `http://localhost:5173` URL in a browser on your Windows machine.

## The easy way: one file, no install

Download **`app/fort-kit.html`** from this repo (open it on GitHub and press the download button) and double-click it. The whole app — code, styles, 3D — is inlined into that one file, so it runs straight from your desktop with no Node, no npm and no server. It works offline; projects and custom parts save in that browser as usual.

Copy the same file to a tablet (email it to yourself, or drop it in your cloud drive) and open it there.

To regenerate it after changing the code: `npm run build:single`.

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

Builds don't sync between devices automatically — use **Review → Share this build as a link** to move a build from one device to another (the whole build is encoded in the link; opening it creates a new project on that device).

## How it's laid out

The header carries the project name (tap to rename), the **Projects** switcher, the four tabs, undo / redo and the running estimate against your budget. Built for a computer screen or a tablet held sideways: the 3D view sits on the left and a panel on the right.

- **Yard** — footprint, ground type, ages, budget ceiling. The yard is drawn as a blue outline in every 3D view and feeds the safety checks. Also: load the sample fort, or start from empty.
- **Build** — the 3D editor with two panels beside it, **Add** and **Edit**.
  - **Add** — one searchable catalog with category chips: Tools, Lumber & sheets, Brick / block & clay, Metal / rope & holds, Outdoor kitchen, Patio furniture, Garden & yard, Lighting & shade, Play & fun, Indoor playroom, Beds & cushions, Quick parts (ready-made 1 ft-grid assemblies) and Yours (custom parts). Tap a card to drop it in; tap a tool to set its sizes right there and **Place** it.
  - **Edit** — opens by itself whenever something is selected or added. Turn, copy, set down, delete, nudge with the arrow pad at a 1 in / 6 in / 1 ft grid step, change height, angle (flat / 45° / upright, on edge), cut to length or width, change material, turn a quick part into real lumber, or save the selection as a custom part. For a group, choose **Whole …** or **Just this piece**, or **Split up**.
  - Buttons in the 3D view switch **Realistic / Drawing look**, **3D camera / Overhead**, **Daytime / Evening** and **Labels**. Drag a part to move it, drag empty space to spin, scroll or pinch to zoom.
- **Sketch** — the "draw first, decide later" mode. Paint 2 ft squares with a material + height brush (tap to raise, tap again to cycle, drag to paint) and watch the mass pull up live in 3D. **Turn the sketch into parts** drops the blocks into the build with their own cut lists and costs.
- **Review** — three sections: **Safety & cost** (the estimate vs. your ceiling, the safety read, the share link), **Shopping list** (every cut grouped by stock and length, plus **Stock to buy** — cuts packed onto 8 / 10 / 12 / 16 ft boards with the offcut), and **Drawing** (the annotated model with Overhead / Top / Front / Side views and a Parts / Cut list / Safety table; **Print or save as PDF** opens a printable A-01 sheet).

## What you can add

Every bought item is a real 3D model, not a stack of boxes. Grills have domed lids, control knobs, a temperature gauge, a side burner and a propane tank; the kamado is a lathed ceramic egg on a cast stand; the pizza oven is a stuccoed dome with a sooty mouth and glowing embers; lanterns have glass panes, a candle and a flame; mattresses are quilted with a stitched border. The flat drawing look keeps the same shapes as clean outlines.

- **Real stock** at actual dimensions: lumber (2×2, 2×4, 2×6, 2×8, 2×12, 4×4, 1×3, 1×6 — a 2×4 is 1½ × 3½ in), ½" and ¾" plywood sheets, corrugated panel, modular brick, concrete block, 12" pavers, 1" steel tube, ⅜" manila rope, and climbing holds. A selected piece can be cut to length (and width, for sheets), turned in 90° or 15° steps, set flat / 45° / upright, and laid flat or on edge. The grid step switches to 1 in automatically when you add a brick or hold. While you drag a piece it **snaps to surfaces**: it rests on whatever is underneath, lands on a face you point at, edges line up flush with neighbours, and holds stick to vertical faces. **Set down** (or `G`) rests a raised piece back onto its support. **Copy** lays a brick end-to-end or a board side-by-side.
- **Outdoor kitchen — cookers.** Drop-in gas grill, gas grill cart, flat-top griddle, charcoal kettle, Santa Maria grill with its crank wheel, pellet smoker, vertical smoker cabinet, kamado, wood-fired and portable pizza ovens, side burner, wok burner, deep fryer, fire pit ring, and a vent hood to put over any of them.
- **Outdoor kitchen — cold and drinks.** Undercounter fridge, wine fridge (the bottles show through the glass door), kegerator with a tap tower, ice maker, drop-in ice bin packed with ice and bottles, beverage tub on a stand, rolling bar cart.
- **Outdoor kitchen — cabinets and prep.** Bar sink with a gooseneck faucet, concrete countertop (cut to length), raised bar top on corbels, butcher block cart, dishwasher drawers, warming drawer, trash pull-out, cabinet doors and drawer fronts (they stick to a face), bar stool, firewood rack, hanging pot rack, and a utensil rail, spice shelf and outdoor TV that mount on a wall.
- **Patio furniture** — dining table, dining chair, Adirondack chair, chaise lounge, garden bench, picnic table, side table, porch swing on chains, hammock with stand, outdoor rug, cooler, fire table, clay chiminea.
- **Garden & yard** — raised garden bed and planter box (both planted), terracotta pot, trellis, rain barrel with a spigot, bird bath, fence panel, garden gate, garden shed, compost bin, hose reel cart, dog house, outdoor shower.
- **Play & fun** — swing set, slide, sandbox, trampoline with a safety net, kiddie pool, hot tub, basketball hoop, cornhole board with bags, water table, playhouse, spring rider, climbing dome, balance beam, tetherball, seesaw, kids picnic table.
- **Indoor playroom** — play kitchen, cube storage, bookshelf with books, teepee, ball pit, climbing triangle, rocking horse, art easel, kids table and chair, toy chest, round play rug, floor cushion, sensory pod swing, play tunnel, wall chalkboard, foam block set, train table, mini trampoline, puppet theater, dollhouse, indoor slide.
- **Beds & cushions** — twin / twin XL / full / toddler mattresses, pillow, foam play mat, bean bag.
- **Lighting & shade** — string lights (cut to length, a swagged cord with bulbs), hanging, wall and table lanterns, solar path light, tiki torch, cantilever umbrella, patio umbrella, patio heater. In the realistic view, **Evening** drops the sun low and makes the bulbs, lanterns, torches and fires glow.
- **Clay** — adobe block, flue liner, terracotta tile.
- **Tools** lay real pieces for you: **Brick wall** (running bond with ⅜" joints, half-brick starts, end bricks cut to fit), **Deck** (rim and joists at 16" on center, 2×6 boards with ¼" gaps, 4×4 posts when raised), **Stud wall** (plates and studs at 16" or 24" OC, optional plywood sheathing), **Ladder**, **Roof** (2×6 rafters at 24" OC with corrugated panels, shed or gable, pitch flat / 3:12 / 6:12 / 9:12), **Railing** (4×4 posts, 2×4 rails, 2×2 balusters at 4" or 6" gaps), **Stairs** (risers near 7" on an 11" run, 2×12 stringers, two 2×6 treads per step), **Bunk bed** (4×4 posts, 2×6 rails, 1×3 slats, real mattresses, top-bunk guard rail, ladder; twin or full, two bunks or a loft), **Outdoor counter** (2×4 frame, plywood ends/back/deck, concrete countertop, cabinet doors every 24"), and **String lights** (a swagged run at the span and height you pick, with optional steel poles or 4×4 posts). Set the sizes, tap Place, then drag it into position. Any quick part has a **Turn into real lumber & pieces** button in Edit that rebuilds it from real lumber, sheets, bricks, rope, tube or holds.
- **Groups** — pieces a tool lays (or a conversion makes) move, turn, raise, set down, copy and delete as one. Switch to **Just this piece** to adjust a single brick or board, or **Split up** to break the group apart for good. Labels show one callout per group.
- **Custom parts** — select a group or a piece and tap **Save as a custom part** in Edit, or use **Save whole build as a part** under Add → Yours. Saved parts live on the device and show up in every project under **Yours**, where you can rename or delete them. Adding one places a fresh copy as a group. Quick parts are converted to real pieces when saved. **Share** on a custom part makes a link that carries the part — open it on another device and it lands in that device's library. **Export all** downloads the whole library as `fortkit-parts.json`; **Import file** reads one back (parts already on the device are skipped).

## Keyboard (desktop)

Arrow keys move the selected part by the snap step · `PgUp` / `PgDn` height · `G` set down onto support · `R` turn 90° (`Shift+R` 15°) · `T` cycle flat / 45° / upright · `E` flat / on edge · `[` `]` length by 1 in (`Shift` for 12 in) · `D` copy · `Delete` remove · `Ctrl+Z` / `Ctrl+Y` undo / redo · scroll to zoom. Tap the project name in the header to rename it.

## Safety read

Flags a deck at 4 ft or higher with no guard rail, a hard (patio) surface under a high deck, a high deck less than 6 ft from the yard edge, parts sitting outside the yard footprint, and an estimate over the budget ceiling.
