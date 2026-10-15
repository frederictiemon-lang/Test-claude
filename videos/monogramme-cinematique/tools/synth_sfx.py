"""Procedural cinematic sound design for the monogram reveal (no third-party audio).

    python3 tools/synth_sfx.py

drone   : dark low drone that opens the piece and carries the reveal
streak  : airy swell for the anamorphic light streak
fly-l / fly-r : panned whooshes as each G flies in from its side
impact  : deep cinematic hit when the two G collide
whirl   : the fast spin after the impact
lock    : soft low hit as the mark returns to place with the zoom
shimmer : fine metallic sheen for the specular pass
tail    : long reverb-like resonance that fades out by the end
"""

import os

import numpy as np
import soundfile as sf

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "sfx")
rng = np.random.default_rng(41)


def t_axis(sec):
    return np.arange(int(sec * SR)) / SR


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


def stereo(l, r=None):
    r = l if r is None else r
    return np.stack([l, r], axis=1)


def drone():
    t = t_axis(3.2)
    s = (np.sin(2 * np.pi * 36.7 * t) + 0.6 * np.sin(2 * np.pi * 55.0 * t + 0.4 * np.sin(2 * np.pi * 0.3 * t))
         + 0.25 * np.sin(2 * np.pi * 73.4 * t))
    rumble = lp(rng.standard_normal(len(t)), 120) * 2.5
    a = np.clip(t / 1.2, 0, 1) ** 1.5 * np.clip((3.2 - t) / 0.8, 0, 1)
    return norm((s + rumble) * a, 0.8)


def streak():
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    air = band_sweep(rng.standard_normal(n), 800, 7000)
    shape = np.sin(np.pi * np.clip(t / 1.6, 0, 1)) ** 2
    return norm(air * shape)


def sweep(f_from, f_to, length=1.7):
    n = int(length * SR)
    t = np.arange(n) / SR
    s = band_sweep(rng.standard_normal(n), f_from, f_to)
    return norm(s * np.sin(np.pi * np.clip(t / length, 0, 1)) ** 1.5)


def impact():
    t = t_axis(3.0)
    n = len(t)
    sub = np.sin(2 * np.pi * np.cumsum(30 + 90 * np.exp(-t * 9)) / SR) * np.exp(-t * 1.4)
    body = lp(rng.standard_normal(n), 600) * np.exp(-t * 6) * 0.8
    air = hp(rng.standard_normal(n), 3000) * np.exp(-t * 18) * 0.25
    return norm(np.tanh(1.5 * (sub + body + air)))


def shimmer():
    t = t_axis(1.8)
    n = len(t)
    partials = sum(np.sin(2 * np.pi * f * t + i) * np.exp(-t * (1.8 + 0.6 * i)) for i, f in enumerate((1318.5, 1975.5, 2637.0, 3951.1)))
    air = band_sweep(rng.standard_normal(n), 3500, 10000) * np.sin(np.pi * np.clip(t / 1.0, 0, 1)) * 0.5
    return norm((partials * 0.35 + air) * np.clip(t / 0.15, 0, 1))


def tail():
    t = t_axis(3.4)
    s = sum(np.sin(2 * np.pi * f * t) * w for f, w in ((55.0, 1), (82.4, 0.5), (110.0, 0.35), (164.8, 0.2)))
    a = np.clip(t / 0.3, 0, 1) * np.exp(-t * 0.9)
    return norm(lp(s, 500) * a, 0.7)


def fly_in(length=0.75):
    # rising whoosh that crescendos into the collision
    n = int(length * SR)
    t = np.arange(n) / SR
    s = band_sweep(rng.standard_normal(n), 250, 6000)
    return norm(s * (t / length) ** 2.2)


def whirl(length=0.85):
    # fast spin: an airy band whose flutter slows down as the turn decelerates
    n = int(length * SR)
    t = np.arange(n) / SR
    air = band_sweep(rng.standard_normal(n), 2500, 700)
    rate = 26 * np.exp(-t * 2.2) + 4
    flutter = 0.55 + 0.45 * np.sin(2 * np.pi * np.cumsum(rate) / SR)
    return norm(air * flutter * np.exp(-t * 2.0) * np.clip(t / 0.02, 0, 1))


def lock():
    # soft low hit as the mark returns to place
    t = t_axis(1.2)
    s = np.sin(2 * np.pi * np.cumsum(70 + 60 * np.exp(-t * 25)) / SR) * np.exp(-t * 4.5)
    click = hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 60) * 0.25
    return norm(np.tanh(1.3 * (s + click)))


os.makedirs(OUT, exist_ok=True)
for name, sig in {
    "drone": stereo(drone()),
    "streak": stereo(streak(), streak()),
    "fly-l": stereo(fly_in(), fly_in() * 0.35),
    "fly-r": stereo(fly_in() * 0.35, fly_in()),
    "whirl": stereo(whirl(), whirl()),
    "lock": stereo(lock()),
    "impact": stereo(impact()),
    "shimmer": stereo(shimmer(), shimmer()),
    "tail": stereo(tail()),
}.items():
    sf.write(os.path.join(OUT, f"{name}.wav"), sig.astype(np.float32), SR)
    print(name, round(len(sig) / SR, 3))
