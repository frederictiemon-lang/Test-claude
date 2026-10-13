"""Procedural sound design for the MELIM AI logo sting (no third-party audio).

A drop falls and lands (water "plip"), the ripple blooms, the M rises, a warm
chord locks the mark, five soft notes set M-E-L-I-M, a bright ping lands "AI",
a light shimmer, and a pad that fades out by the end.

    python3 tools/synth_sfx.py
"""

import os

import numpy as np
import soundfile as sf

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "sfx")
rng = np.random.default_rng(31)


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


def fall():
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    s = band_sweep(rng.standard_normal(n), 3000, 700)
    return norm(s * (t / 0.45) ** 2)


def plip():
    # water drop: a sine whose pitch jumps upward right after the hit
    t = t_axis(0.45)
    f = 520 + 1100 * (1 - np.exp(-t * 40))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.25, 5)
    click = hp(rng.standard_normal(len(t)), 3000) * env(len(t), 0.0005, 0.01, 6) * 0.3
    return norm(s + click)


def bloom():
    # the ripple: a low resonant swell that rings out
    t = t_axis(1.8)
    s = sum(np.sin(2 * np.pi * f * t) * a for f, a in ((110, 1.0), (165, 0.5), (220, 0.35), (330, 0.15)))
    a = np.clip(t / 0.12, 0, 1) * np.exp(-t * 2.0)
    return norm(lp(s, 900) * a)


def rise():
    n = int(0.7 * SR)
    t = np.arange(n) / SR
    s = band_sweep(rng.standard_normal(n), 300, 4500)
    return norm(s * np.sin(np.pi * np.clip(t / 0.7, 0, 1)) ** 2)


def ep(freq, length, bright=1.0):
    t = t_axis(length)
    mod = np.sin(2 * np.pi * freq * 2 * t) * bright * np.exp(-t * 6)
    return np.sin(2 * np.pi * freq * t + mod) * env(len(t), 0.004, length, 2.4)


def chord():
    # Fmaj9: F2 C3 A3 E4 G4
    return norm(lp(sum(ep(f, 2.6) * w for f, w in ((87.31, 1), (130.81, 0.8), (220.0, 0.7), (329.63, 0.6), (392.0, 0.5))), 3500))


def note(freq):
    return norm(ep(freq, 0.6, 0.8) * 0.8 + np.sin(2 * np.pi * freq * 2 * t_axis(0.6)) * env(int(0.6 * SR), 0.002, 0.3, 6) * 0.2)


def ping():
    t = t_axis(1.0)
    s = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, d in ((1760, 3.5), (2637, 5), (3520, 7)))
    return norm(s * np.clip(t / 0.002, 0, 1))


def shimmer():
    t = t_axis(1.1)
    n = len(t)
    air = band_sweep(rng.standard_normal(n), 2500, 9000) * np.sin(np.pi * np.clip(t / 0.85, 0, 1))
    bells = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * 4) for f in (2093, 3136))
    return norm(air * 0.6 + bells * 0.3)


def pad():
    t = t_axis(3.6)
    s = sum(np.sin(2 * np.pi * f * t) for f in (87.31, 130.81, 174.61, 220.0)) / 4
    a = np.clip(t / 0.5, 0, 1) * np.clip((3.6 - t) / 1.7, 0, 1)
    return norm(lp(s, 700) * a, 0.7)


os.makedirs(OUT, exist_ok=True)
sounds = {
    "fall": fall(),
    "plip": plip(),
    "bloom": bloom(),
    "rise": rise(),
    "chord": chord(),
    "ping": ping(),
    "shimmer": shimmer(),
    "pad": pad(),
}
# M-E-L-I-M: F major pentatonic, ascending
for i, f in enumerate((523.25, 587.33, 698.46, 783.99, 880.0)):
    sounds[f"note-{i}"] = note(f)
for name, sig in sounds.items():
    sf.write(os.path.join(OUT, f"{name}.wav"), np.stack([sig, sig], axis=1).astype(np.float32), SR)
    print(name, round(len(sig) / SR, 3))
