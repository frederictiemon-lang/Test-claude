"""Procedural sound design for the GBÔ logo sting (no third-party audio).

    python3 tools/synth_sfx.py

Writes assets/sfx/*.wav. Seeded noise, so every run is identical.
"""

import os

import numpy as np
import soundfile as sf

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "sfx")
rng = np.random.default_rng(11)


def t_axis(sec):
    return np.arange(int(sec * SR)) / SR


def env(n, a=0.002, d=0.2, curve=4.0):
    t = np.arange(n) / SR
    return np.clip(t / max(a, 1e-4), 0, 1) * np.exp(-curve * np.clip(t - a, 0, None) / max(d, 1e-4))


def onepole_lp(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def hp(x, cutoff):
    return x - onepole_lp(x, cutoff)


def swept_band(noise, f_from, f_to, seg=512):
    out = np.zeros_like(noise)
    n = len(noise)
    for k in range(0, n, seg):
        f = f_from * (f_to / f_from) ** (k / n)
        chunk = noise[k:k + seg]
        out[k:k + seg] = hp(onepole_lp(chunk, f * 1.6), f * 0.5)
    return out


def norm(x, peak=0.9):
    return x / (np.max(np.abs(x)) + 1e-9) * peak


def whoosh(length=0.42, f_from=500, f_to=5000):
    n = int(length * SR)
    t = np.arange(n) / SR
    body = swept_band(rng.standard_normal(n), f_from, f_to)
    shape = np.sin(np.pi * np.clip(t / length, 0, 1)) ** 1.5
    return norm(body * shape)


def pop():
    t = t_axis(0.25)
    f = 180 + 520 * np.exp(-t * 35)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.18, 5)
    return norm(s)


def clank():
    # metallic plate hit: inharmonic partials + short noise transient
    t = t_axis(0.9)
    partials = [(523, 1.0, 3.0), (1187, 0.6, 4.5), (1871, 0.45, 6.0), (2634, 0.3, 8.0), (3911, 0.2, 10.0)]
    s = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, a, d in partials)
    tr = hp(rng.standard_normal(len(t)), 2500) * env(len(t), 0.0005, 0.02, 6) * 0.8
    return norm(s * env(len(t), 0.001, 0.9, 1.0) + tr)


def fall():
    # short descending whistle as the circumflex drops
    t = t_axis(0.32)
    f = 1800 * (300 / 1800) ** (t / 0.32)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * (t / 0.32) ** 1.5 * 0.6
    air = swept_band(rng.standard_normal(len(t)), 4000, 800) * (t / 0.32) ** 2
    return norm(s + air)


def impact():
    t = t_axis(2.2)
    n = len(t)
    boom = np.sin(2 * np.pi * np.cumsum(38 + 110 * np.exp(-t * 16)) / SR) * env(n, 0.001, 1.8, 2.6)
    crack = hp(rng.standard_normal(n), 1800) * env(n, 0.0005, 0.09, 5) * 0.7
    tail = onepole_lp(rng.standard_normal(n), 900) * env(n, 0.01, 1.6, 3) * 0.35
    return norm(np.tanh(1.7 * (boom + crack + tail)))


def shimmer():
    t = t_axis(1.4)
    n = len(t)
    bells = sum(np.sin(2 * np.pi * f * t + i) * np.exp(-t * (2.5 + i)) for i, f in enumerate((2093, 2637, 3136, 4186)))
    sweep = swept_band(rng.standard_normal(n), 3000, 9000) * np.sin(np.pi * np.clip(t / 0.8, 0, 1)) * 0.5
    fade_in = np.clip(t / 0.08, 0, 1)
    return norm((bells * 0.5 + sweep) * fade_in)


def riser(length=0.95):
    # tension build from the ring spin into the circumflex impact
    n = int(length * SR)
    t = np.arange(n) / SR
    air = swept_band(rng.standard_normal(n), 300, 6500)
    tone = np.sin(2 * np.pi * np.cumsum(220 * (880 / 220) ** (t / length)) / SR) * 0.25
    return norm((air + tone) * (t / length) ** 2.2)


def sub_tail():
    # low pad that carries the hold after the impact, fades to silence by the end
    t = t_axis(3.5)
    s = np.sin(2 * np.pi * 55 * t) + 0.4 * np.sin(2 * np.pi * 82.4 * t) + 0.25 * np.sin(2 * np.pi * 110 * t)
    a = np.clip(t / 0.4, 0, 1) * np.clip((3.5 - t) / 1.6, 0, 1)
    return norm(onepole_lp(s, 400) * a, 0.7)


os.makedirs(OUT, exist_ok=True)
for name, sig in {
    "whoosh-a": whoosh(0.42, 450, 5200),
    "whoosh-b": whoosh(0.42, 600, 6000),
    "pop": pop(),
    "clank": clank(),
    "fall": fall(),
    "riser": riser(),
    "impact": impact(),
    "shimmer": shimmer(),
    "sub-tail": sub_tail(),
}.items():
    sf.write(os.path.join(OUT, f"{name}.wav"), np.stack([sig, sig], axis=1).astype(np.float32), SR)
    print(name, round(len(sig) / SR, 3))
