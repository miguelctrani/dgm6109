/*
  EXO-PDRN Centella Mask: interactive landing (v4, "Touch to create" with particle swirl)
  ======================================================================================

  What the visitor experiences
    1. An empty dashed mask outline, with four ingredient bubbles floating around it.
    2. Tapping a bubble shatters it into glowing droplets that orbit the mask and snap
       into place, building one piece of the sheet (forehead, left cheek, right cheek, chin).
    3. When all four pieces are in, a finale plays (ripple, shimmer, sparks, one slow breath)
       and the finished mask can be dragged like real fabric.
    4. A coach hand appears for idle visitors, pointing at the next bubble, then at the mask.

  How the code is organised (top to bottom)
    1. Setup: settings, content, page elements, state
    2. Ingredient list below the fold
    3. Layout: sizes everything to the screen
    4. Cloth: the fabric simulation
    5. Bubbles
    6. Info card
    7. Input: mouse and touch dragging
    8. Particle swirl
    9. Completion and finale
   10. Coach hand
   11. Drawing
   12. Main loop and start

  The golden rule of this file: event listeners only change STATE.
  The main loop reads that state about 60 times a second, moves things (update)
  and paints them (draw). Nothing is drawn directly from a click or a touch.

  Depends on: js/config.js (settings), js/content.js (copy), js/geometry.js (mask shape).
  No libraries, no build step.
*/
(function () {
  'use strict';


  // =====================================================================
  // 1. SETUP
  // =====================================================================

  const CONFIG = window.MASK_CONFIG;
  const INGREDIENTS = window.MASK_CONTENT.ingredients;
  const GEO = window.MaskGeometry;
  const TAU = Math.PI * 2;

  // Page elements
  const el = {
    stage:      document.getElementById('stage'),
    canvas:     document.getElementById('c'),
    pouch:      document.getElementById('pouch'),
    card:       document.getElementById('card'),
    bubbles:    document.getElementById('bubbles'),
    hint:       document.getElementById('hint'),
    coach:      document.getElementById('coach'),
    coachLabel: document.getElementById('coachLabel'),
    activeList: document.getElementById('activeList')
  };
  const ctx = el.canvas.getContext('2d');

  // An offscreen canvas: the whole sheet is shaded here first, then copied piece by piece.
  const sheetLayer = document.createElement('canvas');
  const sheetCtx = sheetLayer.getContext('2d');

  // Accessibility and device checks
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = matchMedia('(pointer: coarse)').matches;
  const darkModeQuery = matchMedia('(prefers-color-scheme: dark)');

  // Screen measurements, recalculated by layout()
  const view = {
    width: 0, height: 0, dpr: 1, isMobile: false,
    maskWidth: 0, maskHeight: 0,
    home: { x: 0, y: 0 },          // where the centre of the mask rests
    maskCenter: { x: 0, y: 0 }     // where it actually is right now (updated every frame)
  };

  // The fabric, rebuilt by createCloth()
  const cloth = {
    points: [],       // every grid point
    fabricPoints: [], // only the points that sit on the mask (used for grabbing)
    springs: [],      // connections that keep points at the right distance
    cells: []         // grid squares, used to shade the fabric
  };

  // Everything that changes while the visitor plays
  const state = {
    time: 0,                                // seconds since the page loaded
    found: [false, false, false, false],    // which bubbles have been tapped
    revealAt: [null, null, null, null],     // when each piece starts to appear
    complete: false,                        // all four pieces are in
    finaleAt: null,                         // when the finale started
    glow: 0,                                // 0 to 1, the soft glow around the finished mask
    drag: null,                             // the current drag, or null
    hasDragged: false,                      // the visitor has dragged the mask at least once
    lastAction: 0,                          // time of the last tap, click or key press
    droplets: [],                           // swirl particles
    sparks: []                              // finale sparks
  };

  const bubbles = [];                       // one entry per ingredient bubble

  const startTime = performance.now();


  // =====================================================================
  // 2. INGREDIENT LIST BELOW THE FOLD
  // =====================================================================

  INGREDIENTS.forEach(ingredient => {
    const item = document.createElement('div');
    item.className = 'active';
    item.innerHTML = `
      <img src="${ingredient.img}" alt="" width="96" height="96">
      <div>
        <h4>${ingredient.name}<span>${ingredient.zh}</span></h4>
        <p>${ingredient.body}</p>
      </div>`;
    el.activeList.appendChild(item);
  });


  // =====================================================================
  // 3. LAYOUT
  // Sizes the canvas, the mask, the pouch and the bubbles to the screen.
  // Runs once at start and again whenever the window is resized.
  // =====================================================================

  function layout() {
    view.dpr = Math.min(window.devicePixelRatio || 1, CONFIG.layout.maxDevicePixelRatio);
    view.width = el.stage.clientWidth;
    view.height = el.stage.clientHeight;
    view.isMobile = view.width < CONFIG.layout.mobileBreakpoint;

    // Canvas pixels match the screen's real pixels, so drawing stays sharp
    for (const [canvas, context] of [[el.canvas, ctx], [sheetLayer, sheetCtx]]) {
      canvas.width = view.width * view.dpr;
      canvas.height = view.height * view.dpr;
      context.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    }

    // Mask size and resting position
    if (view.isMobile) {
      const spaceAbove = 140;              // room for the title
      const spaceBelow = 190;              // room for the info card
      const available = Math.max(200, view.height - spaceAbove - spaceBelow);
      view.maskWidth = Math.min(view.width * 0.52, (available / 1.22) * 0.92, 260);
      view.home = { x: view.width / 2, y: spaceAbove + available / 2 };
    } else {
      view.maskWidth = Math.min(320, view.width * 0.25, (view.height * 0.52) / 1.22);
      view.home = { x: view.width * 0.63, y: view.height * 0.5 };
    }
    view.maskHeight = view.maskWidth * 1.22;
    const W = view.maskWidth;
    const H = view.maskHeight;

    createCloth();

    // Pouch, tilted beside the mask
    const pouchWidth = W * (view.isMobile ? 0.5 : 0.62);
    const pouchX = view.home.x + W * (view.isMobile ? 0.78 : 0.86) - pouchWidth / 2;
    const pouchY = view.home.y + H * (view.isMobile ? 0.5 : 0.4) - (pouchWidth * 1.43) / 2;
    el.pouch.style.width = pouchWidth + 'px';
    el.pouch.style.transform = `translate(${pouchX}px, ${pouchY}px) rotate(9deg)`;

    // "Touch a bubble to create your mask", between the eyes and the mouth
    el.hint.style.left = view.home.x + 'px';
    el.hint.style.top = view.home.y + H * 0.07 + 'px';

    // Bubbles, kept inside the screen and clear of the title and card
    const radius = Math.max(34, Math.min(62, W * 0.21));
    const minY = view.isMobile ? 135 + radius : radius + 20;
    const maxY = view.height - (view.isMobile ? 200 : 40) - radius;
    bubbles.forEach((bubble, i) => {
      const [offsetX, offsetY] = CONFIG.layout.bubbleOffsets[i];
      bubble.radius = radius;
      bubble.baseX = clamp(view.home.x + offsetX * W, radius + 10, view.width - radius - 10);
      bubble.baseY = clamp(view.home.y + offsetY * H, minY, maxY);
      bubble.el.style.width = bubble.el.style.height = 2 * radius + 'px';
    });
  }


  // =====================================================================
  // 4. CLOTH
  // The sheet is a grid of points. Neighbouring points are joined by springs.
  // Each frame, points move with a little momentum, then the springs pull
  // them back to the right distances. That is what makes it behave like fabric.
  // =====================================================================

  function createCloth() {
    const { columns, rows, shearStiffness, bendStiffness } = CONFIG.cloth;
    const W = view.maskWidth;
    const H = view.maskHeight;
    const startOffset = reducedMotion ? 0 : CONFIG.cloth.entryOffset;
    const index = (col, row) => row * (columns + 1) + col;

    cloth.points = [];
    cloth.springs = [];
    cloth.cells = [];

    // Points
    for (let row = 0; row <= rows; row++) {
      for (let col = 0; col <= columns; col++) {
        const u = col / columns;
        const v = row / rows;
        const restX = (u - 0.5) * W;   // position relative to the mask centre when flat
        const restY = (v - 0.5) * H;
        const x = view.home.x + restX;
        const y = view.home.y + restY + startOffset;
        cloth.points.push({
          x, y,
          prevX: x, prevY: y,          // last frame's position (gives momentum)
          restX, restY, u, v,
          pinned: false,               // true while held by a finger or the mouse
          onFabric: GEO.isOnFabric(u, v) || GEO.isInsideOutline(u, v)
        });
      }
    }

    const connect = (a, b, stiffness) => {
      const A = cloth.points[a];
      const B = cloth.points[b];
      const length = Math.hypot(A.restX - B.restX, A.restY - B.restY);
      cloth.springs.push({ a: A, b: B, length, stiffness });
    };

    // Springs and cells
    for (let row = 0; row <= rows; row++) {
      for (let col = 0; col <= columns; col++) {
        const k = index(col, row);

        if (col < columns) connect(k, k + 1, 1);                    // right neighbour
        if (row < rows) connect(k, index(col, row + 1), 1);          // neighbour below

        if (col < columns && row < rows) {
          connect(k, index(col + 1, row + 1), shearStiffness);        // diagonals
          connect(index(col + 1, row), index(col, row + 1), shearStiffness);

          // Keep only the cells that touch the mask outline, the others are never visible
          const u0 = col / columns, u1 = (col + 1) / columns;
          const v0 = row / rows, v1 = (row + 1) / rows;
          const uc = (col + 0.5) / columns, vc = (row + 0.5) / rows;
          const touchesMask = [[uc, vc], [u0, v0], [u1, v1], [u1, v0], [u0, v1]]
            .some(([u, v]) => GEO.isInsideOutline(u, v));
          if (touchesMask) {
            cloth.cells.push({
              corners: [
                cloth.points[k],
                cloth.points[k + 1],
                cloth.points[index(col + 1, row + 1)],
                cloth.points[index(col, row + 1)]
              ],
              restArea: (W / columns) * (H / rows),
              u: uc, v: vc
            });
          }
        }

        if (col + 2 <= columns) connect(k, k + 2, bendStiffness);              // bending
        if (row + 2 <= rows) connect(k, index(col, row + 2), bendStiffness);
      }
    }

    cloth.fabricPoints = cloth.points.filter(p => p.onFabric);
  }

  // Converts a uv position on the fabric into its current screen position,
  // by blending the four grid points around it. This is how the outline,
  // holes and pieces bend along with the cloth.
  function toScreen(u, v) {
    const { columns, rows } = CONFIG.cloth;
    const gx = clamp(u * columns, 0, columns - 1e-6);
    const gy = clamp(v * rows, 0, rows - 1e-6);
    const col = Math.floor(gx), row = Math.floor(gy);
    const fx = gx - col, fy = gy - row;
    const k = row * (columns + 1) + col;
    const p00 = cloth.points[k];
    const p10 = cloth.points[k + 1];
    const p01 = cloth.points[k + columns + 1];
    const p11 = cloth.points[k + columns + 2];
    return [
      p00.x * (1 - fx) * (1 - fy) + p10.x * fx * (1 - fy) + p01.x * (1 - fx) * fy + p11.x * fx * fy,
      p00.y * (1 - fx) * (1 - fy) + p10.y * fx * (1 - fy) + p01.y * (1 - fx) * fy + p11.y * fx * fy
    ];
  }

  // Turns a list of uv points into a closed path on screen.
  function addPolygonToPath(path, polygon, clampToSheet = false) {
    polygon.forEach(([u, v], n) => {
      const [x, y] = clampToSheet ? toScreen(clamp(u, 0, 1), clamp(v, 0, 1)) : toScreen(u, v);
      if (n === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    });
    path.closePath();
  }

  // The mask outline plus its holes, as a path. Filled with the "evenodd" rule, the holes stay empty.
  function maskPath() {
    const path = new Path2D();
    addPolygonToPath(path, GEO.outline);
    GEO.holes.forEach(hole => addPolygonToPath(path, hole));
    return path;
  }

  // Pulls the whole sheet toward its original flat shape (allowing it to move and tilt).
  // This is what stops the fabric from folding over itself.
  function keepShape(strength, maxTilt) {
    const points = cloth.points;

    // Where is the sheet, and how much has it rotated?
    let cx = 0, cy = 0;
    for (const p of points) { cx += p.x; cy += p.y; }
    cx /= points.length;
    cy /= points.length;

    let sinSum = 0, cosSum = 0;
    for (const p of points) {
      const dx = p.x - cx, dy = p.y - cy;
      sinSum += p.restX * dy - p.restY * dx;
      cosSum += p.restX * dx + p.restY * dy;
    }
    const angle = clamp(Math.atan2(sinSum, cosSum), -maxTilt, maxTilt);
    const cos = Math.cos(angle), sin = Math.sin(angle);

    // Nudge each point toward where it would be on a flat, rotated sheet
    for (const p of points) {
      if (p.pinned) continue;
      const goalX = cx + p.restX * cos - p.restY * sin;
      const goalY = cy + p.restX * sin + p.restY * cos;
      p.x += (goalX - p.x) * strength;
      p.y += (goalY - p.y) * strength;
    }
  }

  function updateCloth() {
    const C = CONFIG.cloth;
    const t = state.time;
    const drag = state.drag;

    // The resting place bobs gently, like the sheet is floating in essence
    const homeX = view.home.x + (reducedMotion ? 0 : Math.sin(t * 0.6) * C.float.x);
    const homeY = view.home.y + (reducedMotion ? 0 : Math.sin(t * 0.83) * C.float.y);
    const homePull = drag ? C.homePullWhileDragging : (t < C.entryDuration ? C.homePullOnEntry : C.homePull);

    // 1. Move every point: keep last frame's momentum, plus a pull toward home and a soft current
    for (const p of cloth.points) {
      const vx = (p.x - p.prevX) * C.damping;
      const vy = (p.y - p.prevY) * C.damping;
      p.prevX = p.x;
      p.prevY = p.y;
      let ax = (homeX + p.restX - p.x) * homePull;
      const ay = (homeY + p.restY - p.y) * homePull;
      if (!reducedMotion) ax += Math.sin(t * 1.4 + p.restY * 0.025) * C.current * (p.v + 0.2);
      p.x += vx + ax;
      p.y += vy + ay;
    }

    // 2. Dragging: the grabbed point follows the pointer, nearby points follow partly
    if (drag) {
      const dx = drag.x - drag.point.x;
      const dy = drag.y - drag.point.y;
      for (const [p, weight] of drag.neighbours) {
        if (p === drag.point) continue;
        p.x += dx * weight * C.dragSpread;
        p.y += dy * weight * C.dragSpread;
      }
      drag.point.x = drag.x;
      drag.point.y = drag.y;
    }

    // 3. Finale ripple: a wave rolls outward from the centre of the sheet
    if (state.finaleAt !== null && !reducedMotion) applyRipple(t - state.finaleAt);

    // 4. Springs: correct distances several times so the fabric settles, keeping the shape each time
    for (let pass = 0; pass < C.solverIterations; pass++) {
      for (const spring of cloth.springs) {
        const { a, b } = spring;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distance = Math.hypot(dx, dy) || 1e-4;
        const correction = ((distance - spring.length) / distance) * spring.stiffness;
        if (a.pinned) {
          b.x -= dx * correction; b.y -= dy * correction;
        } else if (b.pinned) {
          a.x += dx * correction; a.y += dy * correction;
        } else {
          a.x += dx * correction * 0.5; a.y += dy * correction * 0.5;
          b.x -= dx * correction * 0.5; b.y -= dy * correction * 0.5;
        }
      }
      keepShape(C.shapeKeeping, C.maxTilt);
    }

    // 5. Keep everything on screen
    for (const p of cloth.points) {
      p.x = clamp(p.x, 4, view.width - 4);
      p.y = clamp(p.y, 4, view.height - 4);
    }
  }

  function applyRipple(elapsed) {
    const F = CONFIG.finale;
    if (elapsed >= F.rippleDuration) return;
    const W = view.maskWidth;
    const waveFront = elapsed * W * 1.1;
    const bandWidth = W * 0.12;
    const fade = 1 - elapsed / F.rippleDuration;
    for (const p of cloth.points) {
      const distance = Math.hypot(p.restX, p.restY) || 1;
      const offset = distance - waveFront;
      if (Math.abs(offset) < bandWidth) {
        const push = Math.cos((offset / bandWidth) * (Math.PI / 2)) * F.rippleStrength * fade;
        p.x += (p.restX / distance) * push;
        p.y += (p.restY / distance) * push;
      }
    }
  }


  // =====================================================================
  // 5. BUBBLES
  // Each bubble is a real <button>, so it works with mouse, touch and keyboard.
  // =====================================================================

  function createBubbles() {
    INGREDIENTS.forEach((ingredient, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'bubble';
      button.setAttribute('aria-label', `Add ${ingredient.name} to the mask`);
      button.innerHTML = `<img src="${ingredient.img}" alt="">`;
      button.addEventListener('click', () => onBubbleTapped(i));
      el.bubbles.appendChild(button);

      bubbles.push({ el: button, phase: i * 1.7, baseX: 0, baseY: 0, radius: 40, x: 0, y: 0 });
    });
  }

  function updateBubbles() {
    const t = state.time;
    const float = CONFIG.layout.bubbleFloat;
    bubbles.forEach((bubble, i) => {
      if (state.found[i]) return;
      bubble.x = bubble.baseX + (reducedMotion ? 0 : Math.sin(t * 0.5 + bubble.phase) * float.x);
      bubble.y = bubble.baseY + (reducedMotion ? 0 : Math.cos(t * 0.42 + bubble.phase) * float.y);
      bubble.el.style.transform = `translate(${bubble.x - bubble.radius}px, ${bubble.y - bubble.radius}px)`;
    });
  }

  // Runs when a bubble is tapped or clicked.
  function onBubbleTapped(i) {
    if (state.found[i]) return;              // ignore a second tap on the same bubble

    state.found[i] = true;
    bubbles[i].el.classList.add('used');     // CSS pops the bubble away
    el.hint.classList.add('gone');
    renderCard(i);

    if (reducedMotion) {                     // no swirl: show the piece straight away
      state.revealAt[i] = state.time;
      checkIfComplete();
      return;
    }

    launchSwirl(i);

    // The piece starts appearing while the droplets are still landing
    const S = CONFIG.swirl;
    state.revealAt[i] = state.time + S.burst + S.orbit + S.snap * 0.6;
    const allLanded = S.burst + S.orbit + S.snap + S.stagger + 0.3;
    setTimeout(checkIfComplete, allLanded * 1000);
  }

  function resetExperience() {
    releaseDrag();
    Object.assign(state, {
      found: [false, false, false, false],
      revealAt: [null, null, null, null],
      complete: false, finaleAt: null, glow: 0,
      hasDragged: false, lastAction: state.time,
      droplets: [], sparks: []
    });
    bubbles.forEach(bubble => {
      bubble.el.classList.remove('used');
      bubble.el.style.opacity = '';
    });
    el.hint.classList.remove('gone');
    hideCoach();
    renderCard(null);
  }


  // =====================================================================
  // 6. INFO CARD
  // Three states: the intro, one ingredient, or the finished mask.
  // =====================================================================

  function renderCard(ingredientIndex) {
    const count = state.found.filter(Boolean).length;
    const pips = state.found
      .map((isFound, k) => `<i style="${isFound ? 'background:' + INGREDIENTS[k].color : ''}"></i>`)
      .join('');

    if (state.complete) {
      el.card.style.setProperty('--accent', '#C9A27E');
      el.card.innerHTML = `
        <p class="count">4 of 4 actives</p>
        <h2>Your mask is complete</h2>
        <p class="body">Four actives in one sheet. Give it a drag and feel how soft it is.</p>
        <div class="pips">${pips}</div>
        <div class="actions">
          <a class="btn" href="#use">How to use it</a>
          <button type="button" id="again">Start over</button>
        </div>`;
      document.getElementById('again').addEventListener('click', resetExperience);
      return;
    }

    if (ingredientIndex == null) {
      el.card.style.removeProperty('--accent');
      el.card.innerHTML = `
        <p class="count">${count} of 4 actives</p>
        <h2>Create your mask</h2>
        <p class="body">Touch each bubble to add its active to the sheet.</p>
        <div class="pips">${pips}</div>
        <div class="actions"><a class="btn" href="#actives">Skip to the ingredients</a></div>`;
      return;
    }

    const ingredient = INGREDIENTS[ingredientIndex];
    el.card.style.setProperty('--accent', ingredient.color);
    el.card.innerHTML = `
      <p class="count">${count} of 4 actives</p>
      <h2>${ingredient.name}<span>${ingredient.zh}</span></h2>
      <p class="body">${ingredient.body}</p>
      <div class="pips">${pips}</div>`;
  }


  // =====================================================================
  // 7. INPUT: DRAGGING THE FINISHED MASK
  // Mouse and touch send different events, so each has its own listeners.
  // Touches are only captured when they land on the mask, so the page still scrolls.
  // =====================================================================

  // Screen position of a mouse or finger event, relative to the canvas.
  function pointerPosition(event) {
    const rect = el.canvas.getBoundingClientRect();
    const source = event.touches ? event.touches[0] : event;
    return { x: source.clientX - rect.left, y: source.clientY - rect.top };
  }

  // The fabric point closest to (x, y), and how far away it is.
  function nearestFabricPoint(x, y) {
    let best = null;
    let bestDistSq = Infinity;
    for (const p of cloth.fabricPoints) {
      const distSq = (p.x - x) ** 2 + (p.y - y) ** 2;
      if (distSq < bestDistSq) { bestDistSq = distSq; best = p; }
    }
    return { point: best, distance: Math.sqrt(bestDistSq) };
  }

  // Tries to grab the mask at (x, y). Returns true if it caught the fabric.
  function startDrag(x, y, isTouch) {
    if (!state.complete) return false;      // the mask must be finished first

    const { point, distance } = nearestFabricPoint(x, y);
    const reach = isTouch ? CONFIG.input.grabRadiusTouch : CONFIG.input.grabRadiusMouse;
    if (!point || distance > reach) return false;

    // Nearby points get pulled too: full strength at the finger, fading to nothing at the edge
    const radius = view.maskWidth * CONFIG.cloth.dragRadius;
    const neighbours = [];
    for (const p of cloth.points) {
      const d = Math.hypot(p.x - point.x, p.y - point.y);
      if (d < radius) neighbours.push([p, Math.pow(1 - d / radius, 2)]);
    }

    point.pinned = true;
    state.drag = { point, x, y, neighbours };
    state.hasDragged = true;
    el.canvas.style.cursor = 'grabbing';
    return true;
  }

  function moveDrag(x, y) {
    state.drag.x = x;
    state.drag.y = y;
  }

  function releaseDrag() {
    if (state.drag) {
      state.drag.point.pinned = false;
      state.drag = null;
    }
    el.canvas.style.cursor = '';
  }

  // Mouse
  el.canvas.addEventListener('mousedown', event => {
    const { x, y } = pointerPosition(event);
    startDrag(x, y, false);
  });

  // Listens on the whole window, so a fast drag that slips off the canvas doesn't get stuck
  window.addEventListener('mousemove', event => {
    const { x, y } = pointerPosition(event);
    if (state.drag) {
      moveDrag(x, y);
    } else {
      // Show a "grab" hand cursor when hovering over the finished mask
      const { distance } = nearestFabricPoint(x, y);
      el.canvas.style.cursor = state.complete && distance < CONFIG.input.grabRadiusMouse ? 'grab' : '';
    }
  });

  window.addEventListener('mouseup', releaseDrag);

  // Touch. { passive: false } is needed so preventDefault() can stop the page from scrolling.
  el.canvas.addEventListener('touchstart', event => {
    const { x, y } = pointerPosition(event);
    if (startDrag(x, y, true)) event.preventDefault();
  }, { passive: false });

  el.canvas.addEventListener('touchmove', event => {
    if (!state.drag) return;
    event.preventDefault();
    const { x, y } = pointerPosition(event);
    moveDrag(x, y);
  }, { passive: false });

  el.canvas.addEventListener('touchend', releaseDrag);
  el.canvas.addEventListener('touchcancel', releaseDrag);


  // =====================================================================
  // 8. PARTICLE SWIRL
  // Each droplet follows a path based only on time, in three phases:
  //   burst: flies out of the bubble
  //   orbit: circles the mask
  //   snap:  springs onto its landing spot, with a small overshoot
  // Because the path depends on time, the swirl looks the same on fast and slow devices.
  // =====================================================================

  const WHITE = '#FFFFFF';
  const PEARL = '#F4E9D8';

  function launchSwirl(ingredientIndex) {
    const S = CONFIG.swirl;
    const bubble = bubbles[ingredientIndex];
    const color = INGREDIENTS[ingredientIndex].color;
    const count = view.isMobile ? S.countMobile : S.countDesktop;
    const direction = Math.random() < 0.5 ? 1 : -1;   // the whole swarm spins one way...

    for (let k = 0; k < count; k++) {
      const burstAngle = Math.random() * TAU;
      const burstDistance = 25 + Math.random() * 80;
      const [targetU, targetV] = GEO.randomPointInPiece(ingredientIndex);
      const colorRoll = Math.random();

      state.droplets.push({
        seed: Math.random() * TAU,                    // makes each droplet twinkle differently
        piece: ingredientIndex,
        startTime: state.time + k * 0.0012,          // tiny delay per droplet so they pour out
        startX: bubble.x, startY: bubble.y,
        burstX: Math.cos(burstAngle) * burstDistance,
        burstY: Math.sin(burstAngle) * burstDistance,
        targetU, targetV,
        spin: direction * (Math.random() < 0.85 ? 1 : -1), // ...with a few rebels going the other way
        turns: 1.1 + Math.random() * 0.9,
        orbitRadius: view.maskWidth * (0.55 + Math.random() * 0.35),
        delay: Math.random() * S.stagger,
        radius: 1 + Math.random() * 2.4,
        color: colorRoll < 0.62 ? color : colorRoll < 0.85 ? WHITE : PEARL,
        x: bubble.x, y: bubble.y, prevX: bubble.x, prevY: bubble.y,
        alpha: 1, flash: 0, landed: false
      });
    }
  }

  // Easing curves: turn a straight 0 to 1 progress into a natural feeling motion
  const easeOutCubic = k => 1 - Math.pow(1 - k, 3);
  const easeInOutQuad = k => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
  const easeOutBack = k => { const c = 1.5; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };

  // Where a droplet is, `elapsed` seconds after it was launched.
  function dropletPosition(d, elapsed) {
    const { burst, orbit, snap } = CONFIG.swirl;
    const home = view.home;

    // Phase 1: burst out of the bubble
    if (elapsed < burst) {
      const e = easeOutCubic(elapsed / burst);
      return [d.startX + d.burstX * e, d.startY + d.burstY * e];
    }

    // Phase 2: orbit around the mask, drifting to its own orbit radius
    const burstEndX = d.startX + d.burstX;
    const burstEndY = d.startY + d.burstY;
    const startAngle = Math.atan2(burstEndY - home.y, burstEndX - home.x);
    const startRadius = Math.hypot(burstEndX - home.x, burstEndY - home.y);
    const orbitAt = e => {
      const angle = startAngle + d.spin * d.turns * TAU * e;
      const radius = startRadius + (d.orbitRadius - startRadius) * e;
      return [home.x + Math.cos(angle) * radius, home.y + Math.sin(angle) * radius * 1.1];
    };
    if (elapsed < burst + orbit) return orbitAt(easeInOutQuad((elapsed - burst) / orbit));

    // Phase 3: keep circling until its own delay is over, then snap to the landing spot
    const orbitEnd = orbitAt(1);
    const endAngle = Math.atan2(orbitEnd[1] - home.y, orbitEnd[0] - home.x);
    const endRadius = Math.hypot(orbitEnd[0] - home.x, orbitEnd[1] - home.y);
    const waitTime = d.delay * 0.6;
    const circleSpeed = 1.4;
    const snapProgress = clamp((elapsed - burst - orbit - waitTime) / snap, 0, 1);

    if (snapProgress <= 0) {
      const angle = endAngle + d.spin * (elapsed - burst - orbit) * circleSpeed;
      return [home.x + Math.cos(angle) * endRadius, home.y + Math.sin(angle) * endRadius];
    }

    const leaveAngle = endAngle + d.spin * waitTime * circleSpeed;
    const leaveX = home.x + Math.cos(leaveAngle) * endRadius;
    const leaveY = home.y + Math.sin(leaveAngle) * endRadius;
    const [targetX, targetY] = toScreen(d.targetU, d.targetV);   // follows the moving fabric
    const e = easeOutBack(snapProgress);
    return [leaveX + (targetX - leaveX) * e, leaveY + (targetY - leaveY) * e];
  }

  function updateParticles() {
    const S = CONFIG.swirl;
    const G = CONFIG.glow;

    state.droplets = state.droplets.filter(d => {
      const elapsed = state.time - d.startTime;
      if (elapsed < 0) return true;                     // not launched yet

      d.prevX = d.x;
      d.prevY = d.y;
      [d.x, d.y] = dropletPosition(d, elapsed);

      // After landing: flash, then twinkle and fade out
      const sinceLanding = elapsed - (S.burst + S.orbit + d.delay * 0.6 + S.snap);
      d.landed = sinceLanding > 0;
      d.flash = d.landed ? Math.exp(-sinceLanding / G.flashFade) : 0;
      d.alpha = d.landed ? Math.max(0, 1 - sinceLanding / G.linger) : 1;
      return d.alpha > 0;                               // remove once invisible
    });

    state.sparks = state.sparks.filter(s => {
      s.x += s.vx;
      s.y += s.vy;
      s.vx *= 0.95;
      s.vy *= 0.95;
      s.life -= 1 / 55;
      return s.life > 0;
    });
  }


  // =====================================================================
  // 9. COMPLETION AND FINALE
  // =====================================================================

  function checkIfComplete() {
    const allRevealed = state.revealAt.every(at => at !== null && state.time >= at);
    if (state.complete || !allRevealed) return;

    state.complete = true;
    state.finaleAt = state.time;

    // A ring of sparks bursts outward from the mask edge, in all four colours
    if (!reducedMotion) {
      const outline = GEO.outline;
      for (let k = 0; k < CONFIG.finale.sparkCount; k++) {
        const [u, v] = outline[(k * 7) % outline.length];
        const [x, y] = toScreen(u, v);
        const dx = x - view.home.x;
        const dy = y - view.home.y;
        const distance = Math.hypot(dx, dy) || 1;
        const speed = 2 + Math.random() * 3.5;
        state.sparks.push({
          x, y,
          vx: (dx / distance) * speed,
          vy: (dy / distance) * speed,
          life: 1,
          radius: 1 + Math.random() * 2.2,
          color: INGREDIENTS[k % 4].color
        });
      }
    }

    setTimeout(() => renderCard(), 900);
  }


  // =====================================================================
  // 10. COACH HAND
  // Shows idle visitors what to do. It points at the next untouched bubble,
  // then, once the mask is complete, shows a drag gesture on the mask.
  // It appears for a few seconds, hides, and repeats while the visitor stays idle.
  // =====================================================================

  const COACH_TEXT = {
    tap: isTouchDevice ? 'Tap here' : 'Click here',
    drag: 'Drag the mask'
  };
  let coachVisible = false;
  let coachTarget = -1;
  el.coachLabel.textContent = COACH_TEXT.tap;

  function showCoach(mode) {
    coachVisible = true;
    el.coachLabel.textContent = COACH_TEXT[mode];
    el.coach.classList.toggle('drag', mode === 'drag');
    el.coach.classList.add('show');
  }

  function hideCoach() {
    coachVisible = false;
    el.coach.classList.remove('show');
  }

  function placeCoach(x, y, flipWhenPast) {
    el.coach.classList.toggle('flip', x > view.width - flipWhenPast);  // keep the label on screen
    el.coach.style.transform = `translate(${x}px, ${y}px)`;
  }

  // True during the "visible" part of the show / hide cycle
  function inShowWindow(secondsSinceStart) {
    const { show, repeatEvery } = CONFIG.coach;
    return secondsSinceStart >= 0 && (secondsSinceStart % (show + repeatEvery)) < show;
  }

  function updateCoach() {
    const C = CONFIG.coach;
    const t = state.time;

    // After completion: suggest dragging, until the visitor drags once
    if (state.complete) {
      if (state.hasDragged || state.drag) {
        if (coachVisible) hideCoach();
        return;
      }
      const since = t - Math.max(state.finaleAt + C.dragDelayAfterFinale, state.lastAction);
      const shouldShow = inShowWindow(since);
      if (shouldShow && !coachVisible) showCoach('drag');
      if (!shouldShow && coachVisible) hideCoach();
      if (coachVisible) {
        const [x, y] = toScreen(0.72, 0.6);                          // on the right cheek
        placeCoach(x, y, 130);
      }
      return;
    }

    // Before completion: point at the next bubble after a few idle seconds
    const isFirstVisit = state.lastAction === 0 && state.found.every(f => !f);
    const wait = isFirstVisit ? C.firstDelay : C.firstDelay + 1;
    const shouldShow = inShowWindow(t - state.lastAction - wait);

    if (shouldShow && !coachVisible) {
      coachTarget = state.found.findIndex(f => !f);
      if (coachTarget < 0) return;
      showCoach('tap');
    }
    if (!shouldShow && coachVisible) hideCoach();
    if (coachVisible) {
      const bubble = bubbles[coachTarget];
      placeCoach(bubble.x + bubble.radius * 0.15, bubble.y + bubble.radius * 0.1, 110);
    }
  }

  // Any tap, click or key press counts as activity and hides the hand
  function onAnyActivity() {
    state.lastAction = state.time;
    hideCoach();
  }
  window.addEventListener('pointerdown', onAnyActivity, { passive: true });
  window.addEventListener('keydown', onAnyActivity);


  // =====================================================================
  // 11. DRAWING
  // Painted in layers, back to front:
  //   shadow and glow, the fabric (piece by piece), outline, droplets, sparks
  // =====================================================================

  // Pre rendered glow circles, one per colour. Drawing an image is much faster than
  // building a gradient for every droplet on every frame.
  const glowSprites = {};
  function glowSprite(hex) {
    if (glowSprites[hex]) return glowSprites[hex];
    const size = 64;
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = size;
    const g = sprite.getContext('2d');
    const [r, gr, b] = hexToRgb(hex);
    const gradient = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, `rgba(${r},${gr},${b},.95)`);
    gradient.addColorStop(0.3, `rgba(${r},${gr},${b},.45)`);
    gradient.addColorStop(1, `rgba(${r},${gr},${b},0)`);
    g.fillStyle = gradient;
    g.fillRect(0, 0, size, size);
    return (glowSprites[hex] = sprite);
  }

  function isDarkMode() {
    const theme = document.documentElement.dataset.theme;
    return theme === 'dark' || (theme !== 'light' && darkModeQuery.matches);
  }

  function draw() {
    const { width: w, height: h, maskWidth: W, maskHeight: H } = view;
    const t = state.time;
    ctx.clearRect(0, 0, w, h);

    // Where the mask is right now
    let sumX = 0, sumY = 0;
    for (const p of cloth.fabricPoints) { sumX += p.x; sumY += p.y; }
    const center = view.maskCenter = { x: sumX / cloth.fabricPoints.length, y: sumY / cloth.fabricPoints.length };

    drawShadowAndGlow(center, W, H);

    const path = maskPath();
    shadeSheet(path, center, W, H);
    drawShimmer(path, center, W, H);
    drawPieces(path, center, W);

    // Outline: dashed "template" until the mask is complete, a fine solid line after
    if (!state.complete) {
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = 'rgba(120,128,150,.55)';
      ctx.lineWidth = 1.2;
      ctx.stroke(path);
      ctx.setLineDash([]);
    } else {
      ctx.strokeStyle = 'rgba(30,42,68,.14)';
      ctx.lineWidth = 1;
      ctx.stroke(path);
    }

    drawDroplets(t);
    drawSparks();
    ctx.globalAlpha = 1;
  }

  function drawShadowAndGlow(center, W, H) {
    const { width: w, height: h } = view;

    // Soft shadow, darker as more pieces are built
    const builtFraction = state.revealAt.filter(at => at !== null).length / 4;
    const shadow = ctx.createRadialGradient(center.x + 10, center.y + H * 0.18, 0, center.x + 10, center.y + H * 0.18, W * 0.8);
    shadow.addColorStop(0, `rgba(30,42,68,${0.16 * builtFraction})`);
    shadow.addColorStop(1, 'rgba(30,42,68,0)');
    ctx.fillStyle = shadow;
    ctx.fillRect(0, 0, w, h);

    // Warm pearly glow once the mask is complete
    if (state.glow > 0) {
      const glow = ctx.createRadialGradient(center.x, center.y, W * 0.1, center.x, center.y, W * 1.1);
      glow.addColorStop(0, `rgba(255,244,228,${0.55 * state.glow})`);
      glow.addColorStop(0.5, `rgba(214,204,240,${0.25 * state.glow})`);
      glow.addColorStop(1, 'rgba(214,204,240,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
    }
  }

  // Shades the whole sheet into the offscreen layer. Cells that are squashed look darker
  // (like folds) and cells stretched a little look lighter. Nothing appears on screen yet.
  function shadeSheet(path, center, W, H) {
    const { width: w, height: h } = view;
    const g = sheetCtx;
    g.clearRect(0, 0, w, h);
    g.save();
    g.clip(path, 'evenodd');
    g.lineJoin = 'round';
    g.lineWidth = 1;

    for (const cell of cloth.cells) {
      const [a, b, c, d] = cell.corners;
      const area = ((c.x - a.x) * (d.y - b.y) - (d.x - b.x) * (c.y - a.y)) / 2;
      const stretch = area / cell.restArea;          // 1 = flat, below 1 = squashed, negative = flipped
      let light = 251 - Math.max(0, Math.min(0.7, 1 - Math.abs(stretch))) * 55 - cell.v * 8 - cell.u * 3;
      if (stretch < 0) light -= 8;
      if (stretch > 1.08) light += 3;
      const color = `rgb(${(light - 5) | 0},${(light - 3) | 0},${Math.min(255, light + 3) | 0})`;
      g.fillStyle = color;
      g.strokeStyle = color;                         // stroking with the same colour hides seams
      g.beginPath();
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
      g.lineTo(c.x, c.y);
      g.lineTo(d.x, d.y);
      g.closePath();
      g.fill();
      g.stroke();
    }

    // Wet sheen once the mask is complete
    if (state.glow > 0) {
      const sheen = g.createLinearGradient(center.x - W * 0.6, center.y - H * 0.6, center.x + W * 0.5, center.y + H * 0.5);
      sheen.addColorStop(0, 'rgba(255,255,255,.55)');
      sheen.addColorStop(0.45, 'rgba(255,255,255,0)');
      sheen.addColorStop(1, 'rgba(200,210,235,.18)');
      g.globalAlpha = state.glow;
      g.fillStyle = sheen;
      g.fillRect(0, 0, w, h);
      g.globalAlpha = 1;
    }
    g.restore();
  }

  // Finale: a bright band sweeps across the finished sheet
  function drawShimmer(path, center, W, H) {
    if (state.finaleAt === null || reducedMotion) return;
    const F = CONFIG.finale;
    const elapsed = state.time - state.finaleAt - F.shimmerDelay;
    if (elapsed <= 0 || elapsed >= F.shimmerDuration) return;

    const x = center.x - W * 1.1 + (elapsed / F.shimmerDuration) * W * 2.2;
    const band = sheetCtx.createLinearGradient(x - W * 0.3, center.y - H * 0.5, x + W * 0.3, center.y + H * 0.5);
    band.addColorStop(0, 'rgba(255,255,255,0)');
    band.addColorStop(0.5, 'rgba(255,252,245,.85)');
    band.addColorStop(1, 'rgba(255,255,255,0)');
    sheetCtx.save();
    sheetCtx.clip(path, 'evenodd');
    sheetCtx.fillStyle = band;
    sheetCtx.fillRect(0, 0, view.width, view.height);
    sheetCtx.restore();
  }

  // Copies the shaded sheet onto the screen, but only the pieces that have been built.
  function drawPieces(path, center, W) {
    const R = CONFIG.reveal;
    const F = CONFIG.finale;
    const t = state.time;
    const { width: w, height: h } = view;

    ctx.save();

    // Finale: the mask takes one slow breath (grows slightly and settles back)
    if (state.finaleAt !== null && !reducedMotion) {
      const elapsed = t - state.finaleAt - F.breathDelay;
      if (elapsed > 0 && elapsed < F.breathDuration) {
        const scale = 1 + F.breathScale * Math.sin((Math.PI * elapsed) / F.breathDuration);
        ctx.translate(center.x, center.y);
        ctx.scale(scale, scale);
        ctx.translate(-center.x, -center.y);
      }
    }

    // Once everything has settled, draw the sheet in one go (no seams, less work)
    const allSettled = state.complete && state.revealAt.every(at => t - at > 1.6);
    if (allSettled) {
      ctx.drawImage(sheetLayer, 0, 0, w, h);
    } else {
      for (let piece = 0; piece < 4; piece++) {
        const revealAt = state.revealAt[piece];
        if (revealAt === null || t < revealAt) continue;

        const age = t - revealAt;
        const opacity = reducedMotion ? 1 : Math.min(1, age / R.fadeIn);
        const tint = reducedMotion ? 0 : clamp(1 - (age - R.tintHold) / R.tintFade, 0, 1) * R.tintStrength;

        const piecePath = new Path2D();
        addPolygonToPath(piecePath, GEO.piecePolygons[piece], true);

        ctx.save();
        ctx.clip(piecePath);
        ctx.globalAlpha = opacity;
        ctx.drawImage(sheetLayer, 0, 0, w, h);

        // Freshly built pieces glow in their ingredient's colour, then fade to white
        if (tint > 0) {
          ctx.clip(path, 'evenodd');
          ctx.globalAlpha = opacity * tint;
          ctx.fillStyle = INGREDIENTS[piece].color;
          ctx.fillRect(0, 0, w, h);

          const [bx, by] = toScreen(...GEO.pieceCenters[piece]);
          const bloom = ctx.createRadialGradient(bx, by, 0, bx, by, W * 0.45);
          bloom.addColorStop(0, 'rgba(255,255,255,.9)');
          bloom.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.globalAlpha = opacity * tint * 0.8;
          ctx.fillStyle = bloom;
          ctx.fillRect(0, 0, w, h);
        }
        ctx.restore();
      }
    }
    ctx.restore();
  }

  function drawDroplets(t) {
    const G = CONFIG.glow;
    const twinkle = d => (d.landed ? 0.7 + 0.3 * Math.sin(t * 18 + d.seed) : 1);

    // Pass 1: halos. In dark mode they add up like real light.
    ctx.globalCompositeOperation = isDarkMode() ? 'lighter' : 'source-over';
    for (const d of state.droplets) {
      if (t < d.startTime) continue;
      const size = d.radius * (G.halo + G.flash * d.flash);
      const haloColor = d.color === WHITE || d.color === PEARL ? INGREDIENTS[d.piece].color : d.color;
      ctx.globalAlpha = d.alpha * (0.5 + 0.5 * d.flash) * twinkle(d);
      ctx.drawImage(glowSprite(haloColor), d.x - size, d.y - size, size * 2, size * 2);
    }
    ctx.globalCompositeOperation = 'source-over';

    // Pass 2: short motion trail and a bright white core
    ctx.lineCap = 'round';
    for (const d of state.droplets) {
      if (t < d.startTime) continue;
      const tw = twinkle(d);

      let trailX = d.prevX - d.x;
      let trailY = d.prevY - d.y;
      const trailLength = Math.hypot(trailX, trailY);
      if (trailLength > 10) { trailX *= 10 / trailLength; trailY *= 10 / trailLength; }
      if (d.landed) { trailX = 0; trailY = 0; }

      ctx.globalAlpha = d.alpha * 0.9 * tw;
      ctx.strokeStyle = d.color;
      ctx.lineWidth = d.radius * 1.6;
      ctx.beginPath();
      ctx.moveTo(d.x + trailX, d.y + trailY);
      ctx.lineTo(d.x + 0.01, d.y);
      ctx.stroke();

      ctx.globalAlpha = d.alpha * tw * (0.6 + 0.4 * d.flash);
      ctx.fillStyle = WHITE;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.radius * (0.45 + 0.5 * d.flash), 0, TAU);
      ctx.fill();
    }
  }

  function drawSparks() {
    for (const s of state.sparks) {
      const alpha = Math.max(0, s.life);
      const size = s.radius * 8;
      ctx.globalAlpha = alpha * 0.6;
      ctx.drawImage(glowSprite(s.color), s.x - size, s.y - size, size * 2, size * 2);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = WHITE;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius * 0.7, 0, TAU);
      ctx.fill();
    }
  }


  // =====================================================================
  // 12. MAIN LOOP AND START
  // =====================================================================

  function update() {
    state.time = (performance.now() - startTime) / 1000;
    updateCloth();
    updateBubbles();
    updateParticles();
    updateCoach();
    if (state.complete) state.glow = Math.min(1, state.glow + CONFIG.finale.glowFadeIn);
  }

  // Runs about 60 times a second: move everything, then paint it
  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  // Small helpers
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [n >> 16, (n >> 8) & 255, n & 255];
  }

  // Start
  createBubbles();
  layout();
  renderCard(null);
  requestAnimationFrame(() => el.pouch.classList.add('in'));   // fade the pouch in

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layout, 120);                     // wait until resizing stops
  });

  loop();
})();
