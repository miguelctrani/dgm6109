# EXO-PDRN Centella Mask, interactive landing prototype

Interactive launch page for the R·MEDY MD EXO-PDRN Centella Mask (积雪草水光修护片膜), sold at Vancouver Laser & Skin Care Centre.
Visitors drag a simulated sheet mask through four ingredient bubbles to reveal each active, then scroll to how to use and pricing.

Status: working prototype, ready for a developer to productionize.

## Run it

No build step and no dependencies. Either double click `index.html`, or serve the folder:

```
python3 -m http.server 8000
```

Then open http://localhost:8000 (use your phone on the same wifi with your computer's local IP to test touch).

## Folder structure

```
exo-pdrn-landing/
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

Two behaviour modes, switched by the pill toggle in the hero:

* Soft flex (default): the sheet bends and ripples, and `shapeMatch()` keeps pulling it toward its rest shape so it never folds over itself.
* Rigid float: the sheet stays flat and just follows the pointer, with a limited tilt.

Once a final mode is chosen, remove the `.modes` toggle from index.html and hard code `mode` in main.js.

Touch handling only captures a touch when it lands on the mask, so the page still scrolls normally everywhere else.

## Tuning knobs (main.js)

| What | Where | Notes |
|---|---|---|
| Mask size | `layout()`, variable `W` | Separate rules for desktop and mobile (breakpoint 760px) |
| Mask position | `layout()`, `home` | Desktop sits at 63% width, mobile centered |
| Bubble positions | `layout()`, `base` array | Offsets in mask widths and heights, order matches content.js |
| Stiffness | `shapeMatch(.09, .7)` in `step()` | Higher first number = stiffer, second = max tilt in radians |
| Float and drift | `step()`, `hx`, `hy` and the current force | All motion is disabled when the visitor prefers reduced motion |
| Grab radius | `grab()` | 34px for mouse, 46px for touch |
| Cloth resolution | `COLS`, `ROWS` | Higher is smoother but heavier on older phones |

## Copy and compliance

All ingredient copy is in js/content.js. Section copy (how to use, price, final sale note) is in index.html.
Claims are deliberately kept cosmetic. The internal product note mentions antibacterial, anti inflammatory and anti acne properties, which Health Canada generally treats as drug claims, so they were left out. Please confirm final wording with VLSCC compliance before launch.

## To do before launch

* Confirm final behaviour mode and remove the toggle
* Connect the "Ask for it at your next visit" line to the real booking or shop link
* Add the Chinese language version (the source art is already in Chinese)
* Swap in higher resolution or layered art from the design team if available
* Add analytics events: mask grabbed, each bubble found, all four found, how to use clicked
* Self host the fonts (Cormorant Garamond and Figtree, currently loaded from Google Fonts) if the site requires it
* Test on older Android devices; lower COLS and ROWS if frame rate drops
* Optional upgrade: rebuild the mask in Three.js or Spline for real 3D depth and lighting

## Credits

Concept, copy and creative direction: Miguel Chavez Trani, VLSCC. Product art: R·MEDY MD campaign posters.
