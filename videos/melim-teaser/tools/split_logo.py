"""Cut the official MELIM colour logo (PNG on near-white) into transparent layers.

Two flat inks (MELIM blue, night navy) on a near-white page. Each pixel's alpha is
its projection on its ink (measured in the file); shapes and anti-aliasing come from
the source pixels, nothing is redrawn. The white M and drop inside the symbol are
the page itself, so they become transparent: the logo is only ever shown on a white
background, exactly as in the file.

  symbol.png    the blue rounded square with the M and the drop
  wordmark.png  the word MELIM

    python3 tools/split_logo.py
"""

import json
import os

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.join(os.path.dirname(__file__), "..")
SRC = os.path.join(ROOT, "assets", "src", "logo-melim-couleur.png")
OUT = os.path.join(ROOT, "assets", "logo")
NOISE = 0.06

img = np.asarray(Image.open(SRC).convert("RGB")).astype(np.float64)
H, W, _ = img.shape
PAPER = np.median(img[(img > 240).all(axis=2)], axis=0)
dist = lambda c: np.linalg.norm(img - np.asarray(c, float), axis=2)
INKS = {
    "blue": np.median(img[dist((3, 75, 245)) < 40], axis=0),
    "navy": np.median(img[img.sum(axis=2) < 120], axis=0),
}
names = list(INKS)
alphas, residuals = [], []
for n in names:
    c = INKS[n]
    v = PAPER - c
    a = np.clip(((PAPER - img) @ v) / (v @ v), 0, 1)
    alphas.append(a)
    residuals.append(np.linalg.norm(img - (a[..., None] * c + (1 - a[..., None]) * PAPER), axis=2))
best = np.argmin(np.stack(residuals), axis=0)
alpha = np.take_along_axis(np.stack(alphas), best[None], 0)[0]
alpha[alpha < NOISE] = 0


def biggest(ink, n=1):
    lab, k = ndimage.label((best == names.index(ink)) & (alpha > 0), np.ones((3, 3)))
    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, k + 1))
    keep = [i + 1 for i in np.argsort(sizes)[::-1][:n]]
    return lab, keep


def save(name, ink, mask):
    ys, xs = np.where(mask)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    rgba = np.zeros((y1 - y0, x1 - x0, 4), np.uint8)
    rgba[..., :3] = np.round(INKS[ink]).astype(np.uint8)
    rgba[..., 3] = np.where(mask[y0:y1, x0:x1], np.round(alpha[y0:y1, x0:x1] * 255), 0).astype(np.uint8)
    Image.fromarray(rgba, "RGBA").save(os.path.join(OUT, f"{name}.png"))
    return {"name": name, "x": int(x0), "y": int(y0), "w": int(x1 - x0), "h": int(y1 - y0)}


os.makedirs(OUT, exist_ok=True)
lab_b, sym = biggest("blue", 1)
lab_n, letters = biggest("navy", 5)
layers = [save("symbol", "blue", np.isin(lab_b, sym)), save("wordmark", "navy", np.isin(lab_n, letters))]

comp = np.ones_like(img) * PAPER
for L, ink in zip(layers, ("blue", "navy")):
    t = np.asarray(Image.open(os.path.join(OUT, L["name"] + ".png"))).astype(np.float64)
    a = t[..., 3:] / 255
    r = comp[L["y"]:L["y"] + L["h"], L["x"]:L["x"] + L["w"]]
    r[:] = a * t[..., :3] + (1 - a) * r
err = np.abs(comp - img)
hexc = lambda v: "#%02X%02X%02X" % tuple(int(round(x)) for x in v)
manifest = {
    "source": "logo-melim-couleur.png",
    "size": [W, H],
    "paper": hexc(PAPER),
    "inks_measured": {k: hexc(v) for k, v in INKS.items()},
    "brand_book_palette": {"bleu MELIM": "#035BF7", "bleu nuit": "#0A1A33", "blanc": "#FFFFFF", "noir": "#0B1220"},
    "recomposite_error": {"mean": round(float(err.mean()), 3), "p99": round(float(np.percentile(err, 99)), 2)},
    "layers": layers,
}
with open(os.path.join(OUT, "manifest.json"), "w") as f:
    json.dump(manifest, f, indent=2)
print(json.dumps(manifest))
