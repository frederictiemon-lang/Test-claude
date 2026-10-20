"""Cut the GBÔ AFRICA GROUP logo (lime on black PNG) into transparent layers.

One flat ink on black. Each pixel's alpha is its projection on the ink colour
measured in the file; nothing is redrawn and the ink is the file's own colour.
Connected components give the parts:

  mark.png      G, B, Ô ring, circumflex and dumbbell (the logo without its tagline)
  tagline.png   "Plus qu'une pratique, un style de vie"
  dumbbell.png  the dumbbell alone (source of its glow only, never shown sharp)

All layers keep the source canvas (1254 x 1254) so they stack at the same origin.
Isolated noise specks in the black background (small and away from the logo) are
dropped and counted. The re-composite error against the source is stored.

    python3 tools/split_logo.py
"""

import json
import os

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = os.path.join(ROOT, "assets", "logo", "gbo-africa-group.png")
OUT = os.path.join(ROOT, "assets", "logo", "layers")
NOISE = 0.06
TAGLINE_TOP = 780  # the tagline sits below this line

img = np.asarray(Image.open(SRC).convert("RGB")).astype(np.float64)
H, W, _ = img.shape
INK = np.median(img[(img[..., 1] > 200) & (img[..., 0] > 150)], axis=0)
alpha = np.clip((img @ INK) / (INK @ INK), 0, 1)
alpha[alpha < NOISE] = 0

lab, n = ndimage.label(alpha > 0, np.ones((3, 3)))
sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
boxes = ndimage.find_objects(lab)

# real parts: big components, plus small ones touching them (anti-aliasing fragments)
core = np.isin(lab, [i + 1 for i in range(n) if sizes[i] > 30])
near = ndimage.binary_dilation(core, iterations=3)
keep_ids = [i + 1 for i in range(n) if sizes[i] > 30 or near[boxes[i]][lab[boxes[i]] == i + 1].any()]
keep = np.isin(lab, keep_ids)

big = sorted([i + 1 for i in range(n) if sizes[i] > 5000], key=lambda i: boxes[i - 1][1].start)
marks_ids = [i for i in keep_ids if boxes[i - 1][0].start < TAGLINE_TOP]
tag_ids = [i for i in keep_ids if boxes[i - 1][0].start >= TAGLINE_TOP]
# the dumbbell: the big component sitting inside the Ô ring
ring = max(big, key=lambda i: boxes[i - 1][1].stop)
rx, ry = boxes[ring - 1][1], boxes[ring - 1][0]
inside = [i for i in big if i != ring and boxes[i - 1][1].start > rx.start and boxes[i - 1][1].stop < rx.stop
          and boxes[i - 1][0].start > ry.start and boxes[i - 1][0].stop < ry.stop]
assert len(inside) == 1, f"expected one dumbbell inside the Ô, found {len(inside)}"
dumbbell_id = inside[0]


def save(name, ids):
    m = np.isin(lab, ids)
    rgba = np.zeros((H, W, 4), np.uint8)
    rgba[..., :3] = np.round(INK).astype(np.uint8)
    rgba[..., 3] = np.where(m, np.round(alpha * 255), 0).astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(os.path.join(OUT, f"{name}.png"))
    ys, xs = np.where(m)
    return {"name": name, "x0": int(xs.min()), "y0": int(ys.min()), "x1": int(xs.max() + 1), "y1": int(ys.max() + 1)}


os.makedirs(OUT, exist_ok=True)
layers = [save("mark", marks_ids), save("tagline", tag_ids), save("dumbbell", [dumbbell_id])]

comp = np.where(keep[..., None], alpha[..., None] * INK, 0)
err = np.abs(comp - img)
hexc = lambda v: "#%02X%02X%02X" % tuple(int(round(x)) for x in v)
manifest = {
    "source": "gbo-africa-group.png",
    "width": W,
    "height": H,
    "ink_measured": hexc(INK),
    "brand_spec": "#C6F202",
    "dropped_speck_pixels": int(((alpha > 0) & ~keep).sum()),
    "recomposite_error": {"mean": round(float(err.mean()), 3), "p99": round(float(np.percentile(err, 99)), 2)},
    "layers": layers,
}
with open(os.path.join(OUT, "manifest.json"), "w") as f:
    json.dump(manifest, f, indent=2)
print(json.dumps(manifest))
