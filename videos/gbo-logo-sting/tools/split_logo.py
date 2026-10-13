"""Split the official GBÔ logo PNG into animation layers without redrawing it.

Every layer is a crop of the original pixels (same colour, same anti-aliased
alpha). Pixels are assigned to layers by connected component, so the layers
recombine into the source exactly; the script checks that before writing.

    python3 tools/split_logo.py
"""

import json
import os

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = os.path.join(ROOT, "assets", "logo", "gbo-logo.png")
OUT = os.path.join(ROOT, "assets", "logo", "layers")

rgba = np.array(Image.open(SRC).convert("RGBA"))
alpha = rgba[..., 3]
labels, count = ndimage.label(alpha > 0, structure=np.ones((3, 3)))
boxes = ndimage.find_objects(labels)

comps = []
for idx, (ys, xs) in enumerate(boxes, start=1):
    comps.append({"id": idx, "x0": xs.start, "y0": ys.start, "x1": xs.stop, "y1": ys.stop})

TAGLINE_TOP = 440  # everything below this line is the signature


def biggest_in(xmin, xmax, ymax):
    c = [c for c in comps if c["y1"] <= ymax and xmin <= c["x0"] < xmax]
    return max(c, key=lambda c: (c["x1"] - c["x0"]) * (c["y1"] - c["y0"]))


marks = [c for c in comps if c["y0"] < TAGLINE_TOP]
by_name = {
    "g": biggest_in(0, 500, TAGLINE_TOP),
    "b": biggest_in(500, 960, TAGLINE_TOP),
    "o-ring": biggest_in(960, 1500, TAGLINE_TOP),
}
rest = [c for c in marks if c not in by_name.values()]
by_name["circumflex"] = min(rest, key=lambda c: c["y0"])
by_name["dumbbell"] = max(rest, key=lambda c: c["y0"])
assert len(marks) == 5, f"expected 5 logo marks, found {len(marks)}"

# signature: group glyph components into words by horizontal gaps
glyphs = sorted([c for c in comps if c["y0"] >= TAGLINE_TOP], key=lambda c: c["x0"])
words, cur = [], [glyphs[0]]
for g in glyphs[1:]:
    gap = g["x0"] - max(c["x1"] for c in cur)
    if gap > 12:
        words.append(cur)
        cur = [g]
    else:
        cur.append(g)
words.append(cur)
WORD_NAMES = ["plus", "qu-une", "pratique", "un", "style", "de", "vie"]
assert len(words) == len(WORD_NAMES), f"expected 7 words, found {len(words)}"

layers = {}
for name, c in by_name.items():
    layers[name] = [c]
for name, w in zip(WORD_NAMES, words):
    layers["w-" + name] = w

os.makedirs(OUT, exist_ok=True)
manifest = {"source": "gbo-logo.png", "width": int(rgba.shape[1]), "height": int(rgba.shape[0]), "layers": []}
recombined = np.zeros_like(rgba)
for name, parts in layers.items():
    x0 = min(c["x0"] for c in parts)
    y0 = min(c["y0"] for c in parts)
    x1 = max(c["x1"] for c in parts)
    y1 = max(c["y1"] for c in parts)
    keep = np.isin(labels[y0:y1, x0:x1], [c["id"] for c in parts])
    crop = rgba[y0:y1, x0:x1].copy()
    crop[~keep] = 0
    recombined[y0:y1, x0:x1][keep] = crop[keep]
    Image.fromarray(crop, "RGBA").save(os.path.join(OUT, f"{name}.png"))
    manifest["layers"].append({"name": name, "x": int(x0), "y": int(y0), "w": int(x1 - x0), "h": int(y1 - y0)})

# marks only (no signature): source for the glow bloom during the build-up
marks_only = rgba.copy()
marks_only[labels == 0] = 0
marks_only[np.isin(labels, [c["id"] for c in glyphs])] = 0
Image.fromarray(marks_only, "RGBA").save(os.path.join(OUT, "marks.png"))

visible = alpha > 0
assert np.array_equal(recombined[visible], rgba[visible]), "layers do not recombine into the source"
with open(os.path.join(OUT, "manifest.json"), "w") as f:
    json.dump(manifest, f, indent=2)
print(json.dumps(manifest["layers"]))
