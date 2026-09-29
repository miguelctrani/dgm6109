/*
  EXO-PDRN Centella Mask landing, editable content.
  All client facing ingredient copy lives here.
  Keep claims cosmetic (soothe, hydrate, look plumper, brighter look).
  Avoid drug claims such as antibacterial, anti inflammatory or treats acne (Health Canada).
  color is the accent used for the card border, progress pip and burst particles.
  Order matters: it matches the bubble positions set in main.js (layout, "base" array).
*/
window.MASK_CONTENT = {
  // Online shop. PROGRAMMER: replace `url` with the real Vancouver Laser Shopify product link.
  // `target` "_top" opens the shop in the whole browser window (correct when this page is
  // embedded in an iframe). Use "_blank" to open it in a new tab instead.
  shop: {
    url: "https://example.com/replace-with-vancouver-laser-shopify-link",
    label: "Shop the mask",
    target: "_top",
    price: "$35",
    priceNote: "per mask",
    offer: "Take ten home and save 10%.",
    finalSale: "All mask sales are final.",
    inClinic: "Or ask for it at your next visit."
  },

  ingredients: [
    {name:"Centella vesicles",zh:"植物外囊泡",color:"#7FB08E",img:"assets/images/bubble-centella-vesicles.webp",
     body:"Plant vesicles from Centella asiatica leaf that help soothe and comfort skin, so it looks calm and balanced."},
    {name:"PDRN",zh:"Sodium DNA",color:"#A9A6C4",img:"assets/images/bubble-pdrn.webp",
     body:"Layers in moisture and helps skin look plumper and feel soft."},
    {name:"Niacinamide",zh:"烟酰胺",color:"#B9A6E0",img:"assets/images/bubble-niacinamide.webp",
     body:"Helps improve the look of dullness and uneven tone for a brighter, more even glow."},
    {name:"Peptides",zh:"胜肽",color:"#E3A04F",img:"assets/images/bubble-peptides.webp",
     body:"Help skin feel supple and look smoother."}
  ]
};
