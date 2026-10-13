"""Cut the Kyria logo (JPG on white) into transparent animation layers.

The logo is three flat inks on white. For every pixel the script measures how much
of each ink it holds (alpha = projection of (white - pixel) on (white - ink)),
keeps the ink with the smallest residual, and writes layers coloured with the ink
measured in the file itself. Nothing is redrawn: shapes and anti-aliasing come
from the source pixels. Re-compositing the layers on white is checked against
the JPG and the error is printed.

    python3 tools/split_logo.py
"""

import json
import os

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = os.path.join(ROOT, "assets", "logo", "kyria-logo.jpg")
OUT = os.path.join(ROOT, "assets", "logo", "layers")
WHITE = 255.0
NOISE = 0.06  # alpha below this is JPEG noise on the white page

img = np.asarray(Image.open(SRC).convert("RGB")).astype(np.float64)
H, W, _ = img.shape


def median_ink(mask):
    return np.median(img[mask], axis=0)


dist = lambda c: np.linalg.norm(img - np.asarray(c, float), axis=2)
INKS = {
    "blue": median_ink(dist((34, 97, 254)) < 20),
    "orange": median_ink(dist((253, 98, 54)) < 20),
    "black": median_ink(img.sum(axis=2) < 60),
}

names = list(INKS)
alphas, residuals = [], []
for n in names:
    c = INKS[n]
    v = WHITE - c
    a = np.clip(((WHITE - img) @ v) / (v @ v), 0, 1)
    recon = a[..., None] * c + (1 - a[..., None]) * WHITE
    alphas.append(a)
    residuals.append(np.linalg.norm(img - recon, axis=2))
alphas = np.stack(alphas)
best = np.argmin(np.stack(residuals), axis=0)
alpha = np.take_along_axis(alphas, best[None], 0)[0]
alpha[alpha < NOISE] = 0

layers = []


def add_layer(name, ink, mask):
    ys, xs = np.where(mask)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    rgba = np.zeros((y1 - y0, x1 - x0, 4), np.uint8)
    m = mask[y0:y1, x0:x1]
    rgba[..., :3] = np.round(INKS[ink]).astype(np.uint8)
    rgba[..., 3] = np.where(m, np.round(alpha[y0:y1, x0:x1] * 255), 0).astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(os.path.join(OUT, f"{name}.png"))
    layers.append({"name": name, "ink": ink, "x": int(x0), "y": int(y0), "w": int(x1 - x0), "h": int(y1 - y0)})


os.makedirs(OUT, exist_ok=True)
structure = np.ones((3, 3))

# the K: one blue arm, one orange arm
for ink, name in (("blue", "arm-blue"), ("orange", "arm-orange")):
    lab, n = ndimage.label((best == names.index(ink)) & (alpha > 0), structure)
    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    add_layer(name, ink, lab == (int(np.argmax(sizes)) + 1))

# the wordmark: black glyphs -> 3 lines -> letters (i/j dots merged with their stems)
lab, n = ndimage.label((best == names.index("black")) & (alpha > 0), structure)
boxes = ndimage.find_objects(lab)
glyphs = []
for i, (ys, xs) in enumerate(boxes, 1):
    if (lab[ys, xs] == i).sum() < 40:  # stray JPEG specks
        continue
    glyphs.append({"ids": [i], "x0": xs.start, "x1": xs.stop, "y0": ys.start, "y1": ys.stop})

# lines: cluster glyph components by vertical centre (dots stay inside their line band)
glyphs.sort(key=lambda g: (g["y0"] + g["y1"]) / 2)
lines, prev = [], None
for g in glyphs:
    mid = (g["y0"] + g["y1"]) / 2
    if prev is None or mid - prev > 80:
        lines.append({"mid": mid, "parts": []})
    lines[-1]["parts"].append(g)
    prev = mid
for line in lines:
    line["mid"] = sum((g["y0"] + g["y1"]) / 2 for g in line["parts"]) / len(line["parts"])

# letters: inside a line, merge parts that mostly overlap horizontally (i-dot + stem)
for line in lines:
    letters = []
    for g in sorted(line["parts"], key=lambda g: g["x0"]):
        for L in letters:
            ov = min(g["x1"], L["x1"]) - max(g["x0"], L["x0"])
            if ov > 0.5 * min(g["x1"] - g["x0"], L["x1"] - L["x0"]):
                L["ids"] += g["ids"]
                L["x0"], L["x1"] = min(L["x0"], g["x0"]), max(L["x1"], g["x1"])
                L["y0"], L["y1"] = min(L["y0"], g["y0"]), max(L["y1"], g["y1"])
                break
        else:
            letters.append(dict(g, ids=list(g["ids"])))
    line["letters"] = letters
WORDS = ["Kyria", "Consultancy", "Services"]
assert len(lines) == 3, f"expected 3 text lines, found {len(lines)}"
for line, word in zip(lines, WORDS):
    line["letters"].sort(key=lambda L: L["x0"])
    assert len(line["letters"]) == len(word), f"{word}: found {len(line['letters'])} letters"
    for k, (L, ch) in enumerate(zip(line["letters"], word)):
        add_layer(f"{word.lower()}-{k:02d}", "black", np.isin(lab, L["ids"]))

# check: layers composited on white vs the JPG
comp = np.full_like(img, WHITE)
for L in layers:
    tile = np.asarray(Image.open(os.path.join(OUT, L["name"] + ".png"))).astype(np.float64)
    a = tile[..., 3:] / 255
    region = comp[L["y"]:L["y"] + L["h"], L["x"]:L["x"] + L["w"]]
    region[:] = a * tile[..., :3] + (1 - a) * region
err = np.abs(comp - img)

# full-logo alpha (all layers) for the specular pass mask
full = np.zeros((H, W, 4), np.uint8)
full[..., 3] = np.round(np.clip(1 - np.min(comp / WHITE, axis=2), 0, 1) * 255).astype(np.uint8)
for L in layers:
    tile = np.asarray(Image.open(os.path.join(OUT, L["name"] + ".png")))
    sl = full[L["y"]:L["y"] + L["h"], L["x"]:L["x"] + L["w"]]
    sl[..., 3] = np.maximum(sl[..., 3], tile[..., 3])
Image.fromarray(full, "RGBA").save(os.path.join(OUT, "full-alpha.png"))
manifest = {
    "source": "kyria-logo.jpg",
    "width": W,
    "height": H,
    "inks": {k: "#%02X%02X%02X" % tuple(int(round(x)) for x in v) for k, v in INKS.items()},
    "recomposite_error": {"mean": round(float(err.mean()), 3), "p99": round(float(np.percentile(err, 99)), 2)},
    "layers": layers,
}
with open(os.path.join(OUT, "manifest.json"), "w") as f:
    json.dump(manifest, f, indent=2)
print(json.dumps({k: manifest[k] for k in ("inks", "recomposite_error")}), len(layers), "layers")
