"""Procedural sports sound design for the monogram sting (no third-party audio).

    python3 tools/synth_sfx.py

whoosh-l / whoosh-r : fast panned whooshes as each G flies in
hit-1 / hit-2       : punchy hits when each G stops (the second one heavier)
charge              : tension build while the two G pull apart
boom                : the big combined impact (sub drop + crash)
glitch              : digital scramble bursts over the big impact
rise                : bright light swell as the lights appear
sheen               : quick sheen for the final light pass
"""

import os

import numpy as np
import soundfile as sf

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "sfx")
rng = np.random.default_rng(53)


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
    return np.stack([l, l if r is None else r], axis=1)


def whoosh(length=0.36):
    n = int(length * SR)
    t = np.arange(n) / SR
    s = band_sweep(rng.standard_normal(n), 400, 7000)
    return norm(s * (t / length) ** 1.6)


def hit(weight=1.0):
    t = t_axis(0.9)
    n = len(t)
    kick = np.sin(2 * np.pi * np.cumsum(45 + 160 * np.exp(-t * 30)) / SR) * np.exp(-t * (7 / weight))
    snap = hp(rng.standard_normal(n), 1500) * np.exp(-t * 28) * 0.8
    body = lp(rng.standard_normal(n), 900) * np.exp(-t * 12) * 0.5
    return norm(np.tanh(2.0 * (kick + snap + body)))


def charge(length=0.5):
    t = t_axis(length)
    f = 120 * (900 / 120) ** (t / length)
    tone = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3
    trem = 0.6 + 0.4 * np.sin(2 * np.pi * np.cumsum(8 + 40 * t / length) / SR)
    air = band_sweep(rng.standard_normal(len(t)), 600, 8000) * 0.6
    return norm(lp(tone, 4000) * trem + air) * (t / length) ** 1.8


def boom():
    t = t_axis(2.4)
    n = len(t)
    sub = np.sin(2 * np.pi * np.cumsum(32 + 110 * np.exp(-t * 10)) / SR) * np.exp(-t * 1.6)
    crash = hp(rng.standard_normal(n), 3000) * np.exp(-t * 3.5) * 0.45
    knock = lp(rng.standard_normal(n), 700) * np.exp(-t * 14) * 0.9
    return norm(np.tanh(1.8 * (sub + crash + knock)))


def glitch(length=0.42):
    # bursts of bit-crushed buzz, on/off in an irregular (seeded) pattern
    t = t_axis(length)
    n = len(t)
    buzz = np.sign(np.sin(2 * np.pi * 180 * t)) * 0.5 + np.sign(np.sin(2 * np.pi * 1310 * t)) * 0.3
    noise = rng.standard_normal(n) * 0.5
    s = buzz + noise
    s = np.round(s * 6) / 6  # crush
    gate = np.zeros(n)
    k = 0
    while k < n:
        on = int(SR * rng.uniform(0.012, 0.04))
        off = int(SR * rng.uniform(0.005, 0.025))
        gate[k:k + on] = rng.uniform(0.5, 1.0)
        k += on + off
    return norm(hp(s, 200) * gate * np.exp(-t * 2.5))


def rise():
    t = t_axis(1.4)
    n = len(t)
    bells = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * (1.5 + 0.5 * i)) for i, f in enumerate((1046.5, 1568.0, 2093.0, 3136.0)))
    air = band_sweep(rng.standard_normal(n), 2000, 9000) * np.sin(np.pi * np.clip(t / 1.0, 0, 1)) * 0.6
    return norm((bells * 0.4 + air) * np.clip(t / 0.03, 0, 1))


def sheen():
    n = int(0.7 * SR)
    t = np.arange(n) / SR
    s = band_sweep(rng.standard_normal(n), 3000, 10000)
    return norm(s * np.sin(np.pi * t / 0.7) ** 2)


os.makedirs(OUT, exist_ok=True)
for name, sig in {
    "whoosh-l": stereo(whoosh(), whoosh() * 0.3),
    "whoosh-r": stereo(whoosh() * 0.3, whoosh()),
    "hit-1": stereo(hit(1.0)),
    "hit-2": stereo(hit(1.4)),
    "charge": stereo(charge()),
    "boom": stereo(boom()),
    "glitch": stereo(glitch(), glitch()),
    "rise": stereo(rise(), rise()),
    "sheen": stereo(sheen(), sheen()),
}.items():
    sf.write(os.path.join(OUT, f"{name}.wav"), sig.astype(np.float32), SR)
    print(name, round(len(sig) / SR, 3))
