"""Cut the lime-on-black monogram into two transparent layers, plus FX copies.

The logo is one flat ink on pure black. Each pixel's alpha is its projection on
the ink colour (measured in the file); the two glyphs are the two large connected
components. Nothing is redrawn. The re-composite error against the source on
black is printed and stored. Also writes whole-mark copies used by the effects
(alpha mask, lime copy for the glow, white copy for the glitch ghost).

    python3 tools/split_logo.py
"""

import json
import os

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = os.path.join(ROOT, "assets", "logo", "monogramme.png")
OUT = os.path.join(ROOT, "assets", "logo", "layers")
NOISE = 0.06

img = np.asarray(Image.open(SRC).convert("RGB")).astype(np.float64)
H, W, _ = img.shape
lime_px = img[(img[..., 1] > 200) & (img[..., 0] > 150)]
INK = np.median(lime_px, axis=0)
alpha = np.clip((img @ INK) / (INK @ INK), 0, 1)
alpha[alpha < NOISE] = 0

lab, n = ndimage.label(alpha > 0, np.ones((3, 3)))
sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
big = [i + 1 for i in np.argsort(sizes)[::-1][:2]]
boxes = ndimage.find_objects(lab)
big.sort(key=lambda i: boxes[i - 1][1].start)  # left glyph first

os.makedirs(OUT, exist_ok=True)
layers = []
comp = np.zeros_like(img)
for name, idx in zip(("glyph-left", "glyph-right"), big):
    m = lab == idx
    ys, xs = np.where(m)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    rgba = np.zeros((y1 - y0, x1 - x0, 4), np.uint8)
    rgba[..., :3] = np.round(INK).astype(np.uint8)
    rgba[..., 3] = np.where(m[y0:y1, x0:x1], np.round(alpha[y0:y1, x0:x1] * 255), 0).astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(os.path.join(OUT, f"{name}.png"))
    a = rgba[..., 3:].astype(np.float64) / 255
    comp[y0:y1, x0:x1] = a * rgba[..., :3] + (1 - a) * comp[y0:y1, x0:x1]
    layers.append({"name": name, "x": int(x0), "y": int(y0), "w": int(x1 - x0), "h": int(y1 - y0)})

full = np.zeros((H, W, 4), np.uint8)
full[..., 3] = np.where(np.isin(lab, big), np.round(alpha * 255), 0).astype(np.uint8)
Image.fromarray(full, "RGBA").save(os.path.join(OUT, "full-alpha.png"))
# lime copy of the whole mark (glow, glitch slices) and a white copy (glitch ghost)
full[..., :3] = np.round(INK).astype(np.uint8)
Image.fromarray(full, "RGBA").save(os.path.join(OUT, "full-lime.png"))
full[..., :3] = 255
Image.fromarray(full, "RGBA").save(os.path.join(OUT, "full-white.png"))

dropped = int(((alpha > 0) & ~np.isin(lab, big)).sum())
err = np.abs(comp - img)
manifest = {
    "source": "monogramme.png",
    "width": W,
    "height": H,
    "ink": "#%02X%02X%02X" % tuple(int(round(x)) for x in INK),
    "dropped_speck_pixels": dropped,
    "recomposite_error": {"mean": round(float(err.mean()), 3), "p99": round(float(np.percentile(err, 99)), 2)},
    "layers": layers,
}
with open(os.path.join(OUT, "manifest.json"), "w") as f:
    json.dump(manifest, f, indent=2)

print(json.dumps({k: manifest[k] for k in ("ink", "dropped_speck_pixels", "recomposite_error", "layers")}))
