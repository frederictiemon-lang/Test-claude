"""Procedural sound design for the GBÔ AFRICA GROUP logo reveal (no third-party audio).

    python3 tools/synth_sfx.py

whoosh : soft cinematic whoosh that follows the light streak (0.1 -> 1.0 s)
impact : short, deep, refined impact as the logo completes (1.0 s)
"""

import os

import numpy as np
import soundfile as sf

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "sfx")
rng = np.random.default_rng(61)


def lp(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def hp(x, cutoff):
    return x - lp(x, cutoff)


def band_sweep(noise, f_from, f_to, seg=512):
    out = np.zeros_like(noise)
    n = len(noise)
    for k in range(0, n, seg):
        f = f_from * (f_to / f_from) ** (k / n)
        out[k:k + seg] = hp(lp(noise[k:k + seg], f * 1.5), f * 0.5)
    return out


def norm(x, peak=0.9):
    return x / (np.max(np.abs(x)) + 1e-9) * peak


def whoosh(length=0.95):
    # left-to-right pan follows the streak across the screen
    n = int(length * SR)
    t = np.arange(n) / SR
    s = band_sweep(rng.standard_normal(n), 350, 4200)
    shape = np.sin(np.pi * np.clip(t / length, 0, 1)) ** 2 * (0.4 + 0.6 * t / length)
    s = norm(s * shape)
    pan = t / length
    return np.stack([s * np.cos(pan * np.pi / 2), s * np.sin(pan * np.pi / 2)], axis=1)


def impact(length=2.2):
    t = np.arange(int(length * SR)) / SR
    n = len(t)
    sub = np.sin(2 * np.pi * np.cumsum(34 + 70 * np.exp(-t * 14)) / SR) * np.exp(-t * 2.6)
    body = lp(rng.standard_normal(n), 500) * np.exp(-t * 16) * 0.6
    air = hp(rng.standard_normal(n), 4000) * np.exp(-t * 40) * 0.12
    s = norm(np.tanh(1.3 * (sub + body + air)))
    return np.stack([s, s], axis=1)


os.makedirs(OUT, exist_ok=True)
for name, sig in {"whoosh": whoosh(), "impact": impact()}.items():
    sf.write(os.path.join(OUT, f"{name}.wav"), sig.astype(np.float32), SR)
    print(name, round(len(sig) / SR, 3))
