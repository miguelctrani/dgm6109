"""
Regenerates every image in assets/images from the original posters in assets/source.
Run from the project root:  python3 tools/make_assets.py   (needs Pillow: pip install pillow)
Crop boxes are in pixels on the 1080 x 1350 source posters.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / "assets/source", ROOT / "assets/images"
OUT.mkdir(parents=True, exist_ok=True)

silver = Image.open(SRC / "poster-silver-pouch.png")

# Pouch, cut tight to the foil edge so it works on light and dark backgrounds
pouch = silver.crop((212, 413, 616, 991))
pouch.save(OUT / "pouch.webp", quality=90)
pouch.save(OUT / "pouch.png")

# Soft light leaf, used as a decorative glow in the top left of the hero
silver.crop((0, 0, 310, 340)).save(OUT / "leaf-glow.webp", quality=85)

# Ingredient bubbles from the ingredients poster, with a feathered circular alpha
ing = Image.open(SRC / "poster-ingredients-mask.png").convert("RGBA")
bubbles = {
    "bubble-centella-vesicles": 318,
    "bubble-pdrn": 448,
    "bubble-niacinamide": 578,
    "bubble-peptides": 705,
}
for name, cy in bubbles.items():
    c = ing.crop((538, cy - 67, 672, cy + 67)).resize((268, 268), Image.LANCZOS)
    m = Image.new("L", (268, 268), 0)
    ImageDraw.Draw(m).ellipse((14, 14, 254, 254), fill=255)
    c.putalpha(m.filter(ImageFilter.GaussianBlur(7)))
    c.save(OUT / f"{name}.webp", quality=90)
    c.save(OUT / f"{name}.png")

print("Assets written to", OUT)
