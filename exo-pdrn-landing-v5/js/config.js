/*
  EXO-PDRN Centella Mask: settings
  ==================================
  Every number that changes how the experience looks or feels lives here,
  so you can tune it without touching the logic in main.js.

  Units: times are in seconds, sizes in CSS pixels, unless a comment says otherwise.
  Tip: change one value, refresh the page, and watch what happens.
*/
window.MASK_CONFIG = {

  // Screen layout
  layout: {
    mobileBreakpoint: 760,        // below this width the mobile layout is used
    maxDevicePixelRatio: 2,       // caps canvas resolution on very sharp screens (performance)

    // Where each bubble floats, measured from the mask centre in mask widths (x) and heights (y).
    // Order matches js/content.js: Centella vesicles, PDRN, Niacinamide, Peptides.
    bubbleOffsets: [[-0.92, -0.5], [-1.02, 0.14], [0.98, -0.24], [-0.5, 0.84]],
    bubbleFloat: { x: 10, y: 12 },  // how far bubbles drift while idle
    mobileLiftWhenComplete: 0,     // on phones, how far the finished mask floats up when the offer appears
    mobileTextSpace: 245           // room kept free at the bottom of phone screens for the info text
  },

  // The fabric simulation (the sheet is a grid of points joined by springs)
  cloth: {
    columns: 24,                  // grid resolution: higher is smoother but heavier on older phones
    rows: 30,
    damping: 0.975,               // 1 = never slows down, lower = moves through thicker "water"
    solverIterations: 8,          // how many times per frame the springs are corrected

    shearStiffness: 0.45,         // diagonal springs, stop the grid from skewing
    bendStiffness: 0.3,           // springs that skip a point, resist sharp creases
    shapeKeeping: 0.09,           // pull back toward the face shape each iteration (stops folding)
    maxTilt: 0.7,                 // most the sheet may rotate, in radians (0.7 is about 40 degrees)

    homePull: 0.0035,             // gentle pull back to its resting place
    homePullWhileDragging: 0.0012,
    homePullOnEntry: 0.01,        // stronger pull while the mask floats in at page load
    entryDuration: 2,
    entryOffset: 70,              // the mask starts this far below its resting place

    float: { x: 7, y: 9 },        // idle bobbing
    current: 0.035,               // soft side to side water current

    dragRadius: 0.16,             // points this close to your finger (in mask widths) get pulled too
    dragSpread: 0.35              // how strongly those nearby points follow
  },

  input: {
    grabRadiusMouse: 34,          // how close to the fabric a click must land to grab it
    grabRadiusTouch: 46           // fingers are less precise, so this is bigger
  },

  // How each piece appears once its droplets arrive
  reveal: {
    fadeIn: 0.45,
    tintStrength: 0.55,           // how strongly the piece is coloured when it first appears
    tintHold: 0.25,               // how long the colour holds before fading to white
    tintFade: 1.3
  },

  // The particle swirl that builds each piece
  swirl: {
    countDesktop: 230,            // droplets per bubble
    countMobile: 150,
    burst: 0.35,                  // phase 1: droplets fly out of the bubble
    orbit: 1.15,                  // phase 2: droplets circle the mask
    snap: 0.6,                    // phase 3: droplets spring into place
    stagger: 0.45                 // random extra wait per droplet, so they don't all land at once
  },

  // Droplet glow
  glow: {
    halo: 7,                      // halo size while flying, in droplet radii
    flash: 11,                    // extra halo size at the moment of landing
    flashFade: 0.35,              // how fast that flash dims
    linger: 0.9                   // how long a landed droplet twinkles before disappearing
  },

  // The finale that plays when the mask is complete
  finale: {
    rippleDuration: 1.1,
    rippleStrength: 2.2,
    shimmerDelay: 0.25,
    shimmerDuration: 1.3,
    breathDelay: 1.1,
    breathDuration: 1.8,
    breathScale: 0.035,           // 0.035 means the mask grows 3.5% at the top of the breath
    sparkCount: 90,
    glowFadeIn: 0.02              // per frame
  },

  // The hand that guides visitors who don't know what to do
  coach: {
    firstDelay: 2.5,              // idle seconds before the hand first appears
    show: 3,                      // how long it stays each time
    repeatEvery: 7,               // gap before it comes back, while the visitor stays idle
    dragDelayAfterFinale: 2.2     // wait after the finale before suggesting a drag
  }
};
