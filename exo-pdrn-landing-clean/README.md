# EXO-PDRN Centella Mask, interactive landing

Interactive launch page for the R·MEDY MD EXO-PDRN Centella Mask (积雪草水光修护片膜), sold at Vancouver Laser & Skin Care Centre.

Current version: v4, "Touch to create" with particle swirl, glow and coach hand. This is the clean, commented edition of the code: it behaves exactly like the v4 prototype, it's just easier to read and maintain.

## What the visitor experiences

1. An empty dashed mask outline, with four ingredient bubbles floating around it.
2. Tapping a bubble shatters it into glowing droplets that orbit the mask and snap into place, building one piece of the sheet (forehead, left cheek, right cheek, chin). The card shows that active and its benefit.
3. When all four pieces are in, a finale plays: a ripple rolls through the sheet, a shimmer sweeps across it, a ring of sparks bursts out, and the mask takes one slow breath.
4. The finished mask can then be dragged like real fabric.
5. If a visitor sits idle, a hand points at the next bubble ("Tap here" on phones, "Click here" on desktop), then shows a drag gesture on the finished mask.

## Two ways to open it

* `index.html` is the version you edit. It uses the separate css, js and image files.
* `exo-pdrn-mask-v4.html` is the same page as one single file with everything embedded, for quick previews and sharing. Don't edit it: edit the folder files, then rebuild it (see below).

## Run it

No build step and no dependencies. Double click `index.html`, or serve the folder:

```
python3 -m http.server 8000
```

Then open http://localhost:8000. To test touch, open your computer's local IP address on your phone while on the same wifi.

## Folder structure

```
exo-pdrn-landing-clean/
  index.html               Page markup: hero stage, ingredients, how to use, price
  exo-pdrn-mask-v4.html    Single file build, for previews and sharing
  css/styles.css           All styles. Theme colours (light and dark) at the top
  js/config.js             EVERY tunable setting: sizes, speeds, timings, stiffness
  js/content.js            Ingredient copy, colours and bubble images
  js/geometry.js           The mask shape: outline, holes, the four pieces
  js/main.js               The app: layout, cloth physics, input, swirl, coach, drawing
  assets/images/           Web ready images (webp, plus png with transparency)
  assets/source/           Original campaign posters, untouched
  tools/make_assets.py     Regenerates assets/images from assets/source
  archive/                 Earlier versions (v1, v2, v3) as single files
```

Scripts load in this order in index.html, and the order matters: config.js, content.js, geometry.js, main.js.

## How the code works

The golden rule: event listeners only change state. A loop runs about 60 times a second, reads that state, moves everything (`update()`) and paints it on a canvas (`draw()`). Nothing is drawn directly from a click or a touch.

main.js is split into 12 numbered sections, each with a heading comment:

| Section | What it does |
|---|---|
| 1. Setup | Settings, content, page elements, and the `state` object that holds everything that changes |
| 2. Ingredient list | Builds the list below the fold from content.js |
| 3. Layout | Sizes the canvas, mask, pouch and bubbles for desktop or mobile |
| 4. Cloth | The fabric simulation (see below) |
| 5. Bubbles | Creates the bubble buttons; `onBubbleTapped()` runs on each tap |
| 6. Info card | `renderCard()`: intro, one ingredient, or complete |
| 7. Input | Mouse and touch dragging of the finished mask |
| 8. Particle swirl | `launchSwirl()` and `dropletPosition()` |
| 9. Completion | `checkIfComplete()` starts the finale |
| 10. Coach hand | `updateCoach()` decides when and where the hand appears |
| 11. Drawing | Shadow, shaded fabric, pieces, outline, droplets, sparks |
| 12. Main loop | `update()`, `draw()`, `loop()` and start up |

### The fabric

The mask is a grid of 25 x 31 points joined by springs. Each frame, points keep a little momentum and are pulled gently toward their resting place. Then the springs are corrected 8 times so the grid settles into fabric. `keepShape()` pulls the whole sheet back toward its flat face shape on every pass, which is what stops it from folding over itself. The outline, holes and pieces from geometry.js are mapped onto the moving grid with `toScreen()`, so they bend with it.

### The swirl

Each droplet's position is calculated from time alone, in `dropletPosition()`, in three phases: burst (out of the bubble), orbit (around the mask) and snap (onto a random spot inside its piece, with a small overshoot). Because it depends on time rather than frame count, it looks the same on fast and slow devices.

### Drawing

The whole sheet is shaded into an offscreen canvas first. Each built piece is then copied onto the screen through its own clipping shape, so pieces appear one by one with smooth seams. Once everything settles, the sheet is drawn in one go.

### Input

Mouse and touch have separate listeners. `mousemove` and `mouseup` listen on the whole window, so a fast drag that slips off the canvas doesn't get stuck. Touches call `preventDefault()` only when they land on the mask, so the page still scrolls everywhere else.

## Tuning (js/config.js)

Every number that changes the look or feel is in config.js, grouped and commented:

| Group | Controls |
|---|---|
| `layout` | Mobile breakpoint, bubble positions, bubble drift |
| `cloth` | Grid resolution, stiffness, damping, how much it tilts, drag feel |
| `input` | How close a click or finger must be to grab the mask |
| `reveal` | How each piece fades in and how long its colour lasts |
| `swirl` | Droplet count and the length of each phase |
| `glow` | Halo size, landing flash, twinkle |
| `finale` | Ripple, shimmer, breath and sparks |
| `coach` | When the hand appears, how long it stays, how often it returns |

Try changing `swirl.orbit` from 1.15 to 2 and refresh: the droplets circle for longer.

On older phones, lower `swirl.countMobile` or `cloth.columns` and `cloth.rows` if the frame rate drops.

## Copy and compliance

Ingredient copy lives in js/content.js; section copy (how to use, price, final sale note) is in index.html. Claims are deliberately kept cosmetic. The internal product note mentions antibacterial, anti inflammatory and anti acne properties, which Health Canada generally treats as drug claims, so they were left out. Please confirm final wording with VLSCC compliance before launch.

## Adding it to the existing website

* Easiest: upload this folder to the site's hosting and embed it with an iframe:

```html
<iframe src="/exo-pdrn/index.html" style="width:100%; height:90vh; border:0;" title="EXO-PDRN Centella Mask"></iframe>
```

* Integrated: copy the `#stage` section into the page and include the CSS and the four scripts in order. Watch for class name clashes with the site (for example `.card`), and scope the styles under `#stage` if needed.

## Rebuilding the single file

After editing, rebuild `exo-pdrn-mask-v4.html` by inlining styles.css, the four scripts (same order) and the images as data URIs, or simply share the folder instead.

## Assets

| File in assets/images | Comes from | Used for |
|---|---|---|
| pouch.webp / .png | poster-silver-pouch.png | Pouch beside the mask |
| leaf-glow.webp | poster-silver-pouch.png | Decorative light, top left of the hero |
| bubble-*.webp / .png | poster-ingredients-mask.png | The four bubbles and the ingredient list |

poster-four-actives.png (the jelly shapes) is included but unused, and is a good source for richer bubble art if design can supply those shapes on transparent backgrounds. If higher resolution posters arrive, replace them in assets/source (same file names) and run `python3 tools/make_assets.py`.

## To do before launch

* Connect "Ask for it at your next visit" to the real booking or shop link
* Add the Chinese language version (the source art is already in Chinese)
* Decide whether the finished mask should stay draggable
* Add analytics events: bubble tapped, mask completed, mask dragged, how to use clicked
* Self host the fonts (Cormorant Garamond and Figtree) if the site requires it
* Test on older Android devices

## Credits

Concept, copy and creative direction: Miguel Chavez Trani, VLSCC. Product art: R·MEDY MD campaign posters.
