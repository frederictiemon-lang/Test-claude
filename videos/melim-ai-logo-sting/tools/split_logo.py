"""Cut the MELIM AI logo (opaque PNG on near-white) into transparent layers.

Two flat inks on a #FEFEFE page. For every pixel the script measures how much of
each ink it holds (alpha = projection of (paper - pixel) on (paper - ink)), keeps
the ink with the smallest residual, and writes layers in the ink colour measured
in the file. Shapes and anti-aliasing come from the source pixels; nothing is
redrawn. The re-composite error against the source is printed and stored.

    python3 tools/split_logo.py
"""

import json
import os

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = os.path.join(ROOT, "assets", "logo", "melim-ai-logo.png")
OUT = os.path.join(ROOT, "assets", "logo", "layers")
NOISE = 0.06

img = np.asarray(Image.open(SRC).convert("RGB")).astype(np.float64)
H, W, _ = img.shape
PAPER = np.median(img[(img > 235).all(axis=2)], axis=0)

dist = lambda c: np.linalg.norm(img - np.asarray(c, float), axis=2)
INKS = {
    "blue": np.median(img[dist((8, 88, 245)) < 25], axis=0),
    "navy": np.median(img[img.sum(axis=2) < 80], axis=0),
}
names = list(INKS)
alphas, residuals = [], []
for n in names:
    c = INKS[n]
    v = PAPER - c
    a = np.clip(((PAPER - img) @ v) / (v @ v), 0, 1)
    recon = a[..., None] * c + (1 - a[..., None]) * PAPER
    alphas.append(a)
    residuals.append(np.linalg.norm(img - recon, axis=2))
best = np.argmin(np.stack(residuals), axis=0)
alpha = np.take_along_axis(np.stack(alphas), best[None], 0)[0]
alpha[alpha < NOISE] = 0

os.makedirs(OUT, exist_ok=True)
layers = []


def add_layer(name, ink, mask):
    ys, xs = np.where(mask)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    rgba = np.zeros((y1 - y0, x1 - x0, 4), np.uint8)
    rgba[..., :3] = np.round(INKS[ink]).astype(np.uint8)
    rgba[..., 3] = np.where(mask[y0:y1, x0:x1], np.round(alpha[y0:y1, x0:x1] * 255), 0).astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(os.path.join(OUT, f"{name}.png"))
    layers.append({"name": name, "ink": ink, "x": int(x0), "y": int(y0), "w": int(x1 - x0), "h": int(y1 - y0)})


def components(ink, min_px=200):
    lab, n = ndimage.label((best == names.index(ink)) & (alpha > 0), np.ones((3, 3)))
    out = []
    for i, (ys, xs) in enumerate(ndimage.find_objects(lab), 1):
        m = lab == i
        if m.sum() >= min_px:
            out.append({"mask": m, "x0": xs.start, "x1": xs.stop, "y0": ys.start, "y1": ys.stop, "px": int(m.sum())})
    return out


blue = components("blue")
navy = components("navy")
TEXT_TOP = 780  # the wordmark sits below this line
marks = sorted([c for c in blue if c["y0"] < TEXT_TOP], key=lambda c: -c["px"])
assert len(marks) == 3, f"expected M halves + drop, found {len(marks)}"
m_left, m_right = sorted(marks[:2], key=lambda c: c["x0"])
drop = marks[2]
add_layer("m-left", "blue", m_left["mask"])
add_layer("m-right", "blue", m_right["mask"])
add_layer("drop", "blue", drop["mask"])

word = sorted([c for c in navy if c["y0"] >= TEXT_TOP], key=lambda c: c["x0"])
assert len(word) == 5, f"expected 5 letters in MELIM, found {len(word)}"
for k, (c, ch) in enumerate(zip(word, "MELIM")):
    add_layer(f"melim-{k}-{ch.lower()}", "navy", c["mask"])
ai = sorted([c for c in blue if c["y0"] >= TEXT_TOP], key=lambda c: c["x0"])
assert len(ai) == 2, f"expected A and I, found {len(ai)}"
add_layer("ai-0-a", "blue", ai[0]["mask"])
add_layer("ai-1-i", "blue", ai[1]["mask"])

# check: layers composited on the paper colour vs the source
comp = np.ones_like(img) * PAPER
full = np.zeros((H, W, 4), np.uint8)
for L in layers:
    tile = np.asarray(Image.open(os.path.join(OUT, L["name"] + ".png"))).astype(np.float64)
    a = tile[..., 3:] / 255
    region = comp[L["y"]:L["y"] + L["h"], L["x"]:L["x"] + L["w"]]
    region[:] = a * tile[..., :3] + (1 - a) * region
    fa = full[L["y"]:L["y"] + L["h"], L["x"]:L["x"] + L["w"], 3]
    fa[:] = np.maximum(fa, tile[..., 3].astype(np.uint8))
Image.fromarray(full, "RGBA").save(os.path.join(OUT, "full-alpha.png"))
err = np.abs(comp - img)
hexc = lambda v: "#%02X%02X%02X" % tuple(int(round(x)) for x in v)
manifest = {
    "source": "melim-ai-logo.png",
    "width": W,
    "height": H,
    "paper": hexc(PAPER),
    "inks": {k: hexc(v) for k, v in INKS.items()},
    "recomposite_error": {"mean": round(float(err.mean()), 3), "p99": round(float(np.percentile(err, 99)), 2)},
    "layers": layers,
}
with open(os.path.join(OUT, "manifest.json"), "w") as f:
    json.dump(manifest, f, indent=2)
print(json.dumps({k: manifest[k] for k in ("paper", "inks", "recomposite_error")}))
for L in layers:
    print(L["name"], L["x"], L["y"], L["w"], L["h"])
