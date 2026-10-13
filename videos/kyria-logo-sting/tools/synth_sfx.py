"""Procedural sound design for the Kyria logo sting (no third-party audio).

Calm, precise, "tech consulting": soft blip, two airy swooshes as the K's arms
converge, a warm resolve chord on the lock-up, light ticks for the baselines,
a gentle shimmer, and a soft pad that fades out by the end.

    python3 tools/synth_sfx.py
"""

import os

import numpy as np
import soundfile as sf

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "sfx")
rng = np.random.default_rng(23)


def t_axis(sec):
    return np.arange(int(sec * SR)) / SR


def env(n, a=0.002, d=0.2, curve=4.0):
    t = np.arange(n) / SR
    return np.clip(t / max(a, 1e-4), 0, 1) * np.exp(-curve * np.clip(t - a, 0, None) / max(d, 1e-4))


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


def blip():
    t = t_axis(0.35)
    s = np.sin(2 * np.pi * 1320 * t) * 0.7 + np.sin(2 * np.pi * 2640 * t) * 0.2
    return norm(s * env(len(t), 0.002, 0.3, 6))


def swoosh(f_from, f_to, length=0.55):
    n = int(length * SR)
    t = np.arange(n) / SR
    s = band_sweep(rng.standard_normal(n), f_from, f_to)
    return norm(s * np.sin(np.pi * t / length) ** 2)


def ep_note(freq, length):
    # soft electric-piano-like tone: sine carrier, decaying FM brightness
    t = t_axis(length)
    mod = np.sin(2 * np.pi * freq * 2 * t) * 1.2 * np.exp(-t * 6)
    s = np.sin(2 * np.pi * freq * t + mod)
    return s * env(len(t), 0.004, length, 2.2)


def resolve_chord():
    # Cmaj9 voicing: C3 G3 B3 D4 E4
    notes = [130.81, 196.0, 246.94, 293.66, 329.63]
    length = 2.6
    s = sum(ep_note(f, length) * (1.0 if i == 0 else 0.7) for i, f in enumerate(notes))
    return norm(lp(s, 3500))


def tick():
    t = t_axis(0.08)
    s = np.sin(2 * np.pi * 3200 * t) * 0.6 + hp(rng.standard_normal(len(t)), 5000) * 0.4
    return norm(s * env(len(t), 0.0005, 0.04, 6))


def shimmer():
    t = t_axis(1.2)
    n = len(t)
    bells = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * (3 + i)) for i, f in enumerate((1568, 2093, 2637, 3136)))
    air = band_sweep(rng.standard_normal(n), 2500, 9000) * np.sin(np.pi * np.clip(t / 0.9, 0, 1)) * 0.4
    return norm((bells * 0.4 + air) * np.clip(t / 0.06, 0, 1))


def pad():
    t = t_axis(3.9)
    s = sum(np.sin(2 * np.pi * f * t) for f in (65.41, 98.0, 130.81, 164.81)) / 4
    a = np.clip(t / 0.6, 0, 1) * np.clip((3.9 - t) / 1.8, 0, 1)
    return norm(lp(s, 600) * a, 0.7)


os.makedirs(OUT, exist_ok=True)
for name, sig in {
    "blip": blip(),
    "swoosh-a": swoosh(400, 4200),
    "swoosh-b": swoosh(500, 5200),
    "resolve": resolve_chord(),
    "tick": tick(),
    "shimmer": shimmer(),
    "pad": pad(),
}.items():
    sf.write(os.path.join(OUT, f"{name}.wav"), np.stack([sig, sig], axis=1).astype(np.float32), SR)
    print(name, round(len(sig) / SR, 3))
