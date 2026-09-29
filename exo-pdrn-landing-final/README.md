# EXO-PDRN Centella Mask, interactive landing prototype (v4, Touch to create with particle swirl)

Interactive launch page for the R·MEDY MD EXO-PDRN Centella Mask (积雪草水光修护片膜), sold at Vancouver Laser & Skin Care Centre.
Visitors touch four ingredient bubbles. Each bubble shatters into a swarm of droplets that orbit the empty dashed mask outline, then snap into place to build one piece of the sheet (forehead, left cheek, right cheek, chin), tinted in that active's color, while the card shows the active and its benefit. When all four are in, a finale plays (a ripple rolls through the sheet, a shimmer sweeps across it, a ring of sparks bursts out and the mask takes one slow breath), then the finished mask glows and can be dragged to feel how soft it is. Then visitors scroll to how to use and pricing.

This version came from management feedback. Earlier versions are kept in archive: v2 (drag through the bubbles) and v3 (touch to create with a simple fly in).

Status: working prototype, ready for a developer to productionize.

## Which file is v4

This whole folder IS v4 (particle swirl with glow). There are two ways to open it:

* `index.html` is the version a programmer edits. It uses the separate css, js and image files.
* `exo-pdrn-mask-v4.html` is the same v4 as one single file with everything embedded. Use it to preview or share quickly. Don't edit it, edit the folder files instead.

The archive folder only holds the older versions (v1, v2, v3) for reference.

## Run it

No build step and no dependencies. Either double click `index.html`, or serve the folder:

```
python3 -m http.server 8000
```

Then open http://localhost:8000 (use your phone on the same wifi with your computer's local IP to test touch).

## Folder structure

```
exo-pdrn-landing/
  exo-pdrn-mask-v4.html      v4 as one single file, for quick preview and sharing
  index.html                 Page markup (hero stage, ingredients, how to use, price)
  css/styles.css             All styles. Theme tokens (light and dark) at the top
  js/content.js              Editable ingredient copy, colors and bubble images
  js/main.js                 Cloth simulation, interaction, game logic, rendering
  assets/images/             Web ready images used by the page (webp, plus png with alpha)
  assets/source/             Original campaign posters, untouched
  tools/make_assets.py       Regenerates assets/images from assets/source
  archive/                   The earlier single file versions (everything embedded)
```

## Asset map

| File in assets/images | Comes from | Used for |
|---|---|---|
| pouch.webp / .png | poster-silver-pouch.png, crop 212,413 to 616,991 | Pouch beside the mask in the hero |
| leaf-glow.webp | poster-silver-pouch.png, crop 0,0 to 310,340 | Decorative light leaf, top left of hero |
| bubble-centella-vesicles | poster-ingredients-mask.png, bubble 1 | Bubble 1 and ingredient list |
| bubble-pdrn | poster-ingredients-mask.png, bubble 2 | Bubble 2 and ingredient list |
| bubble-niacinamide | poster-ingredients-mask.png, bubble 3 | Bubble 3 and ingredient list |
| bubble-peptides | poster-ingredients-mask.png, bubble 4 | Bubble 4 and ingredient list |

poster-four-actives.png (the green, silver, lilac and amber jelly shapes) is included but not used yet. It's a good source for richer bubble art if the design team can supply those shapes as separate transparent files.

If higher resolution art arrives, replace the posters in assets/source (keep the file names) and run `python3 tools/make_assets.py`. Crop boxes are at the top of that script.

## How the interaction works

The mask is not an image. It's a grid of points (24 x 30 cells) simulated with verlet integration and distance constraints. The visible mask shape (outline, eyes, nose, mouth) is defined in uv space in main.js (`outer()`, `HOLES`) and mapped onto the deforming grid every frame, then drawn with Canvas 2D.

Building the mask:

* Each bubble is a real `<button>`, so it works with mouse, touch and keyboard, and screen readers announce "Add Centella vesicles to the mask".
* `tapBubble()` spawns the droplet swarm. Each droplet has three phases computed in `swarmPos()`: burst (flies out from the bubble), orbit (circles the mask), snap (springs onto a random point inside its piece, with a little overshoot).
* Timing and density live in the `SWIRL` object: `count` (230 droplets on desktop, 150 on mobile), `burst`, `orbit`, `snap` and `stagger` in seconds.
* The piece fades in as the droplets arrive, then the droplets fade out, so the sheet looks like it's made from them.
* A coach (tapping hand with a "Tap here" label, "Click here" on desktop) points at the next untouched bubble after 2.5 idle seconds, stays for 3 seconds, then hides. It returns every 7 seconds while the visitor stays idle. Once the mask is complete, the same hand switches to a drag gesture on the mask with a "Drag the mask" label, and stops for good after the first drag. Settings are in the `COACH` object.
* Every droplet glows: a soft halo in its active's colour while flying, a brighter flash the moment it snaps into the sheet, then a twinkle as it fades. Settings are in the `GLOW` object (`halo`, `flash`, `flashFade`, `linger`). Halos are pre rendered sprites, so they stay cheap. In dark mode they blend additively for a stronger light effect.
* `checkDone()` starts the finale once every piece is in: ripple (in `step()`), shimmer and breath (in `draw()`), spark ring (`sparks`).
* The four pieces are soft, wavy shapes defined in `ZONES` (seams set by `s0`, `s3` and `sm`). Which active builds which piece follows the order in content.js: Centella vesicles forehead, PDRN left cheek, Niacinamide right cheek, Peptides chin.
* The whole sheet is shaded into an offscreen canvas every frame, then each revealed piece is drawn from it through its own clip, so the seams stay smooth and disappear once the mask is complete.

Once complete, the mask becomes draggable using soft flex behaviour: it bends and ripples, and `shapeMatch()` keeps pulling it back to its rest shape so it never folds over itself. Before that, touches on the mask do nothing, so the page scrolls normally.

## Tuning knobs (main.js)

| What | Where | Notes |
|---|---|---|
| Mask size | `layout()`, variable `W` | Separate rules for desktop and mobile (breakpoint 760px) |
| Mask position | `layout()`, `home` | Desktop sits at 63% width, mobile centered |
| Bubble positions | `layout()`, `base` array | Offsets in mask widths and heights, order matches content.js |
| Which piece each active builds | `zone()`, `ZONES`, `ZONE_CENTER` | Swap by reordering, or change the seam functions for different shapes |
| Coach hand timing | `COACH` object | `firstDelay`, `show` and `repeatEvery`, all in seconds |
| Swirl timing and density | `SWIRL` object | Lower `count` if older phones drop frames |
| Finale | `step()` (ripple), `draw()` (shimmer, breath), `checkDone()` (sparks) | Each is disabled for visitors who prefer reduced motion |
| Piece fade and color tint | `draw()`, `al` and `tint` | Fade in length and how long the color stays before turning white |
| Hint text position | `layout()`, `hint.style.top` | Sits between the eyes and mouth of the dashed outline |
| Stiffness after completion | `shapeMatch(.09, .7)` in `step()` | Higher first number = stiffer, second = max tilt in radians |
| Grab radius | `grab()` | 34px for mouse, 46px for touch |

## Copy and compliance

All ingredient copy is in js/content.js. Section copy (how to use, price, final sale note) is in index.html.
Claims are deliberately kept cosmetic. The internal product note mentions antibacterial, anti inflammatory and anti acne properties, which Health Canada generally treats as drug claims, so they were left out. Please confirm final wording with VLSCC compliance before launch.

## To do before launch

* Decide whether the finished mask should stay draggable or become static
* Connect the "Ask for it at your next visit" line to the real booking or shop link
* Add the Chinese language version (the source art is already in Chinese)
* Swap in higher resolution or layered art from the design team if available
* Add analytics events: each bubble tapped, mask completed, finished mask dragged, how to use clicked
* Self host the fonts (Cormorant Garamond and Figtree, currently loaded from Google Fonts) if the site requires it
* Test on older Android devices; lower COLS and ROWS if frame rate drops
* Optional upgrade: rebuild the mask in Three.js or Spline for real 3D depth and lighting

## Credits

Concept, copy and creative direction: Miguel Chavez Trani, VLSCC. Product art: R·MEDY MD campaign posters.
