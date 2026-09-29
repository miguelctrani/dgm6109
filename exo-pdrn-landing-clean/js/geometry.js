/*
  EXO-PDRN Centella Mask: mask geometry
  ==================================
  The shape of the mask and its four pieces.

  Everything here is described in "uv space":
    u runs from 0 (left edge) to 1 (right edge) of the rectangle that holds the mask
    v runs from 0 (top edge) to 1 (bottom edge)
  This file knows nothing about pixels or the screen. main.js maps these
  shapes onto the moving fabric every frame.
*/
window.MaskGeometry = (function () {
  const TAU = Math.PI * 2;

  // == Face outline ==

  // True when (u, v) is inside the face outline (the eye, nose and mouth holes are ignored here).
  // The shape is a "superellipse" that narrows toward the chin.
  function isInsideOutline(u, v) {
    const x = (u - 0.5) / 0.5;   // -1 to 1
    const y = (v - 0.5) / 0.5;   // -1 to 1
    const width = y > 0
      ? 1 - 0.3 * y * y          // narrows a lot toward the chin
      : 1 - 0.06 * y * y;        // narrows a little toward the forehead
    return Math.pow(Math.abs(x / width), 2.3) + Math.pow(Math.abs(y), 2.1) <= 1;
  }

  // The outline as a polygon. For 160 directions around the centre, a binary search
  // finds where the shape ends.
  const outline = [];
  for (let k = 0; k < 160; k++) {
    const angle = (k / 160) * TAU;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    let inside = 0;
    let outside = 0.8;
    for (let n = 0; n < 22; n++) {
      const mid = (inside + outside) / 2;
      if (isInsideOutline(0.5 + dx * mid, 0.5 + dy * mid)) inside = mid;
      else outside = mid;
    }
    outline.push([0.5 + dx * inside, 0.5 + dy * inside]);
  }

  // == Holes (eyes, mouth, nose) ==

  // An almond shaped polygon. `rotation` tilts it and makes the outer corner pointier.
  function almond(cx, cy, rx, ry, rotation, steps = 36) {
    const points = [];
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    for (let k = 0; k < steps; k++) {
      const a = (k / steps) * TAU;
      const x = Math.cos(a) * rx;
      const y = Math.sin(a) * ry * (1 - 0.25 * Math.cos(a) * Math.sign(rotation));
      points.push([cx + x * cos - y * sin, cy + x * sin + y * cos]);
    }
    return points;
  }

  const holes = [
    almond(0.31, 0.395, 0.12, 0.05, 0.1),    // left eye
    almond(0.69, 0.395, 0.12, 0.05, -0.1),   // right eye
    almond(0.5, 0.745, 0.15, 0.03, 0),       // mouth
    [[0.5, 0.5], [0.515, 0.6], [0.485, 0.6]] // nose slit
  ];

  // Classic "ray casting" test: is the point (x, y) inside this polygon?
  function isInsidePolygon(polygon, x, y) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      const crosses = (yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (crosses) inside = !inside;
    }
    return inside;
  }

  // True when (u, v) lands on actual fabric: inside the outline and not in a hole.
  function isOnFabric(u, v) {
    if (!isInsideOutline(u, v)) return false;
    return !holes.some(hole => isInsidePolygon(hole, u, v));
  }

  // == The four pieces ==
  // Index 0 to 3 matches the ingredient order in js/content.js.
  const PIECE = { FOREHEAD: 0, LEFT_CHEEK: 1, RIGHT_CHEEK: 2, CHIN: 3 };

  // Wavy seams between the pieces, so they look soft rather than cut.
  const foreheadSeam = u => 0.33 + 0.025 * Math.sin(u * 14);   // forehead / cheeks
  const chinSeam     = u => 0.67 + 0.02 * Math.sin(u * 12 + 1); // cheeks / chin
  const middleSeam   = v => 0.5 + 0.02 * Math.sin(v * 16);      // left cheek / right cheek

  function pieceAt(u, v) {
    if (v < foreheadSeam(u)) return PIECE.FOREHEAD;
    if (v > chinSeam(u)) return PIECE.CHIN;
    return u < middleSeam(v) ? PIECE.LEFT_CHEEK : PIECE.RIGHT_CHEEK;
  }

  // Centre of each piece: where the coach hand and glow bloom aim.
  const pieceCenters = [[0.5, 0.2], [0.27, 0.53], [0.73, 0.53], [0.5, 0.84]];

  // Each piece as a polygon, used as a clipping shape when drawing.
  // Pieces overlap their neighbours slightly (OVERLAP) so no hairline gaps show at the seams.
  // They extend a little past 0 and 1; main.js clamps them onto the fabric.
  const piecePolygons = (function () {
    const STEPS = 40;
    const OVERLAP = 0.014;
    const polys = [[], [], [], []];
    const lerpU = (from, to, f) => from + (to - from) * f;

    // Forehead: across the top, then back along the forehead seam
    const forehead = polys[PIECE.FOREHEAD];
    forehead.push([-0.05, -0.05], [1.05, -0.05]);
    for (let k = STEPS; k >= 0; k--) {
      const u = -0.05 + (1.1 * k) / STEPS;
      forehead.push([u, foreheadSeam(u) + OVERLAP]);
    }

    // Chin: along the chin seam, then across the bottom
    const chin = polys[PIECE.CHIN];
    for (let k = 0; k <= STEPS; k++) {
      const u = -0.05 + (1.1 * k) / STEPS;
      chin.push([u, chinSeam(u) - OVERLAP]);
    }
    chin.push([1.05, 1.05], [-0.05, 1.05]);

    // Cheeks: between the two horizontal seams, split by the middle seam
    const splitTop = middleSeam(0.33);
    const splitBottom = middleSeam(0.67);

    const left = polys[PIECE.LEFT_CHEEK];
    for (let k = 0; k <= STEPS; k++) {                       // top edge, left to right
      const u = lerpU(-0.05, splitTop + OVERLAP, k / STEPS);
      left.push([u, foreheadSeam(u) - OVERLAP]);
    }
    for (let k = 0; k <= STEPS; k++) {                       // middle seam, top to bottom
      const v = 0.3 + (0.4 * k) / STEPS;
      left.push([middleSeam(v) + OVERLAP, v]);
    }
    for (let k = STEPS; k >= 0; k--) {                       // bottom edge, right to left
      const u = lerpU(-0.05, splitBottom + OVERLAP, k / STEPS);
      left.push([u, chinSeam(u) + OVERLAP]);
    }

    const right = polys[PIECE.RIGHT_CHEEK];
    for (let k = 0; k <= STEPS; k++) {                       // top edge, left to right
      const u = lerpU(splitTop - OVERLAP, 1.05, k / STEPS);
      right.push([u, foreheadSeam(u) - OVERLAP]);
    }
    for (let k = STEPS; k >= 0; k--) {                       // bottom edge, right to left
      const u = lerpU(splitBottom - OVERLAP, 1.05, k / STEPS);
      right.push([u, chinSeam(u) + OVERLAP]);
    }
    for (let k = STEPS; k >= 0; k--) {                       // middle seam, bottom to top
      const v = 0.3 + (0.4 * k) / STEPS;
      right.push([middleSeam(v) - OVERLAP, v]);
    }

    return polys;
  })();

  // A random point on the fabric inside one piece: where a droplet will land.
  function randomPointInPiece(piece) {
    for (let attempt = 0; attempt < 400; attempt++) {
      const u = Math.random();
      const v = Math.random();
      if (isOnFabric(u, v) && pieceAt(u, v) === piece) return [u, v];
    }
    return pieceCenters[piece];
  }

  return {
    outline, holes, isInsideOutline, isOnFabric,
    PIECE, pieceAt, pieceCenters, piecePolygons, randomPointInPiece
  };
})();
