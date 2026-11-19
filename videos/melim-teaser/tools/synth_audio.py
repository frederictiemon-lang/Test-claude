"""Procedural electronic music bed + SFX for the 10 s MELIM teaser (no third-party audio).

    python3 tools/synth_audio.py

120 BPM (one beat = 0.5 s), A minor: Am - F - C - G, one chord per bar (2 s).
  0.0-2.5  intro   pad + filtered pluck arpeggio, soft hats, riser into the screens
  2.5-4.75 groove  four-on-the-floor kick, claps, offbeat bass, arp, snare roll at the end
  4.75     break   a quarter-beat of air before the logo
  5.0-9.0  drop    full groove, brighter chord stabs (logo, tagline, meeting card)
  9.0-10.0 ending  final chord stab, filter closes, tail fades out
SFX: whoosh (screen cuts), tick (UI highlights), burst (light transition), hit (logo).
"""

import os

import numpy as np
import soundfile as sf

SR = 48000
DUR = 10.0
BEAT = 0.5
ROOT = os.path.join(os.path.dirname(__file__), "..", "assets")
rng = np.random.default_rng(97)


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


def lp_sweep(x, c0, c1, seg=256):
    out = np.zeros_like(x)
    n = len(x)
    acc = 0.0
    for k in range(0, n, seg):
        c = c0 * (c1 / c0) ** (k / max(n - 1, 1))
        a = np.exp(-2 * np.pi * c / SR)
        for i in range(k, min(k + seg, n)):
            acc = (1 - a) * x[i] + a * acc
            out[i] = acc
    return out


def hp(x, cutoff):
    return x - lp(x, cutoff)


def norm(x, peak=0.9):
    return x / (np.max(np.abs(x)) + 1e-9) * peak


def place(buf, sig, at, gain=1.0):
    i = int(round(at * SR))
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i] * gain


def saw(f, t):
    return 2 * ((f * t) % 1.0) - 1


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ---------- instruments ----------

def kick(length=0.4):
    t = t_axis(length)
    f = 48 + 130 * np.exp(-t * 32)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, length, 5)
    click = hp(rng.standard_normal(len(t)), 3500) * env(len(t), 0.0005, 0.006, 6) * 0.25
    return np.tanh(1.8 * (body + click))


def clap(length=0.22):
    n = int(length * SR)
    noise = hp(rng.standard_normal(n), 1100)
    e = np.zeros(n)
    for off, d in ((0.0, 0.03), (0.011, 0.03), (0.022, 0.16)):
        k = int(off * SR)
        e[k:] += env(n - k, 0.0005, d, 5)
    return noise * e * 0.45


def hat(length=0.05, open_=False):
    n = int((0.22 if open_ else length) * SR)
    return hp(rng.standard_normal(n), 7000) * env(n, 0.001, 0.2 if open_ else length, 5) * 0.3


def pluck(freq, length=0.22, bright=1.0):
    t = t_axis(length)
    s = saw(freq, t) * 0.6 + saw(freq * 1.005, t) * 0.4
    s = lp_sweep(s, 600 + 3000 * bright, 400)
    return s * env(len(t), 0.002, length, 5)


def bass(freq, length=0.24):
    t = t_axis(length)
    s = saw(freq, t) * 0.5 + np.sin(2 * np.pi * freq * t)
    return lp(s, 380) * env(len(t), 0.004, length, 3)


def stab(freqs, length=0.5, bright=1.0):
    t = t_axis(length)
    s = sum(saw(f * d, t) for f in freqs for d in (0.995, 1.0, 1.006)) / (3 * len(freqs))
    s = lp_sweep(s, 1200 + 4000 * bright, 700)
    return s * env(len(t), 0.003, length, 3.2)


def pad(freqs, length, c0=400, c1=1800):
    t = t_axis(length)
    s = sum(saw(f * d, t) for f in freqs for d in (0.993, 1.0, 1.007)) / (3 * len(freqs))
    s = lp_sweep(s, c0, c1)
    a = np.clip(t / 0.6, 0, 1) * np.clip((length - t) / 0.3, 0, 1)
    return s * a


def riser(length, f0=300, f1=6000):
    n = int(length * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    seg = 1024
    for k in range(0, n, seg):
        cut = f0 * (f1 / f0) ** (k / n)
        out[k:k + seg] = hp(lp(noise[k:k + seg], cut * 1.4), cut * 0.5)
    return out * (t / length) ** 2


# ---------- arrangement ----------

CHORDS = [  # Am, F, C, G (+ Am for the ending)
    [57, 60, 64, 67], [53, 57, 60, 64], [48, 55, 60, 64], [55, 59, 62, 67], [57, 60, 64, 69],
]
ROOTS = [45, 41, 48, 43, 45]
ARP = [0, 2, 3, 1]  # index into the chord, 16th-note pattern


def bar(t):
    return min(int(t // 2.0), 4)


music = np.zeros(int(DUR * SR))

# intro: pad, filtered arpeggio opening up, hats from 1.0, riser into 2.5
place(music, pad([midi(m) for m in CHORDS[0]], 2.6, 300, 1400), 0.0, 0.5)
for k in range(int(2.5 / (BEAT / 4))):
    t = k * BEAT / 4
    m = CHORDS[bar(t)][ARP[k % 4]] + 12
    place(music, pluck(midi(m), 0.2, bright=t / 2.5), t, 0.28 + 0.12 * t / 2.5)
for k in range(int(1.5 / (BEAT / 2))):
    place(music, hat(), 1.0 + k * BEAT / 2, 0.5)
place(music, riser(1.0), 1.5, 0.35)


def groove(t0, t1, busy=1.0, bright=1.0):
    k = 0
    t = t0
    while t < t1 - 1e-6:
        place(music, kick(), t, 0.95)
        beat_in_bar = int(round((t % 2.0) / BEAT)) % 4
        if beat_in_bar in (1, 3):
            place(music, clap(), t, 0.7)
        place(music, hat(open_=True), t + BEAT / 2, 0.45 * busy)
        for s in range(4):
            place(music, hat(), t + s * BEAT / 4, (0.35 if s % 2 else 0.2) * busy)
        place(music, bass(midi(ROOTS[bar(t)])), t + BEAT / 2, 0.8)
        for s in range(4):
            m = CHORDS[bar(t)][ARP[(k * 4 + s) % 4]] + 12
            place(music, pluck(midi(m), 0.18, bright), t + s * BEAT / 4, 0.25 * busy)
        k += 1
        t += BEAT


groove(2.5, 4.75)
# build: snare roll 4.0 -> 4.75, riser, then a breath of silence
for i, t in enumerate(np.arange(4.0, 4.75, 1 / 16)):
    place(music, clap(0.1), t, 0.12 + 0.45 * i / 12)
place(music, riser(0.8, 400, 9000), 3.95, 0.45)

# drop at 5.0: chord stabs on the bar and the "and" of beat 2
groove(5.0, 9.0, busy=1.0, bright=1.4)
for b in (5.0, 7.0):
    for off in (0.0, 0.75, 1.5):
        place(music, stab([midi(m) for m in CHORDS[bar(b)]], 0.45, 1.4), b + off, 0.5)

# ending: big stab + kick at 9.0, tail fades out by 10.0
place(music, kick(0.8), 9.0, 1.0)
place(music, stab([midi(m) for m in CHORDS[4]] + [midi(45)], 1.0, 1.0), 9.0, 0.8)
place(music, pad([midi(m) for m in CHORDS[4]], 1.0, 1500, 300), 9.0, 0.35)
fade = np.ones_like(music)
i0, i1 = int(9.3 * SR), int(10.0 * SR)
fade[i0:i1] = np.linspace(1, 0, i1 - i0) ** 1.5
music *= fade
music = norm(music, 0.89)

# ---------- SFX ----------

def whoosh(length=0.32):
    n = int(length * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    seg = 512
    for k in range(0, n, seg):
        cut = 500 + 6000 * np.sin(np.pi * k / n)
        out[k:k + seg] = hp(lp(noise[k:k + seg], cut), 300)
    return norm(out * np.sin(np.pi * t / length) ** 2)


def tick():
    t = t_axis(0.12)
    s = np.sin(2 * np.pi * 2400 * t) * 0.6 + np.sin(2 * np.pi * 3600 * t) * 0.25
    return norm(s * env(len(t), 0.001, 0.08, 6))


def burst():
    # bright swell as the screen floods with white light
    t = t_axis(0.5)
    n = len(t)
    air = riser(0.5, 1500, 12000)
    bells = sum(np.sin(2 * np.pi * f * t) for f in (1760, 2637, 3520)) * (t / 0.5) ** 2 * 0.3
    return norm(air + bells)


def hit():
    t = t_axis(1.6)
    n = len(t)
    sub = np.sin(2 * np.pi * np.cumsum(38 + 90 * np.exp(-t * 14)) / SR) * np.exp(-t * 3)
    shimmer = hp(rng.standard_normal(n), 5000) * np.exp(-t * 7) * 0.3
    return norm(np.tanh(1.4 * (sub + shimmer)))


os.makedirs(os.path.join(ROOT, "music"), exist_ok=True)
os.makedirs(os.path.join(ROOT, "sfx"), exist_ok=True)
sf.write(os.path.join(ROOT, "music", "melim-electro-120bpm.wav"), np.stack([music, music], 1).astype(np.float32), SR)
for name, sig in {"whoosh": whoosh(), "tick": tick(), "burst": burst(), "hit": hit()}.items():
    sf.write(os.path.join(ROOT, "sfx", f"{name}.wav"), np.stack([sig, sig], 1).astype(np.float32), SR)
print("ok")
