"""Procedural music bed + SFX for the GBÔ FITNESS spot.

Everything here is synthesized from oscillators and seeded noise, so the
audio carries no third-party rights. Re-run to regenerate:

    python3 tools/synth_audio.py

Grid: 120 BPM (one beat = 0.5 s). Scene cuts sit on the grid:
S1 0-3 | S2 3-7.5 | S3 7.5-11.5 | S4 11.5-14 | S5 14-18 | S6 18-30
"""

import os

import numpy as np
import soundfile as sf

SR = 44100
DUR = 30.0
BEAT = 0.5
ROOT = os.path.join(os.path.dirname(__file__), "..", "assets")
rng = np.random.default_rng(7)


def t_axis(sec):
    return np.arange(int(sec * SR)) / SR


def env(n, a=0.002, d=0.2, curve=4.0):
    t = np.arange(n) / SR
    att = np.clip(t / max(a, 1e-4), 0, 1)
    dec = np.exp(-curve * np.clip(t - a, 0, None) / max(d, 1e-4))
    return att * dec


def lowpass(x, cutoff):
    # one-pole low-pass, good enough for shaping noise
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def place(buf, sig, at, gain=1.0):
    i = int(at * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i] * gain


# ---------- instruments ----------

def kick(length=0.45, f0=150, f1=45):
    t = t_axis(length)
    f = f1 + (f0 - f1) * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * env(len(t), 0.001, length, 5)
    click = highpass(rng.standard_normal(len(t)), 3000) * env(len(t), 0.0005, 0.01, 6) * 0.3
    return np.tanh(1.6 * (body + click))


def clap(length=0.25):
    n = int(length * SR)
    noise = highpass(rng.standard_normal(n), 900)
    e = np.zeros(n)
    for off in (0.0, 0.012, 0.024):
        k = int(off * SR)
        e[k:] += env(n - k, 0.0005, 0.06 if off < 0.02 else 0.18, 5)
    return noise * e * 0.5


def shaker(length=0.07, bright=6000):
    n = int(length * SR)
    return highpass(rng.standard_normal(n), bright) * env(n, 0.004, length, 5) * 0.35


def log_drum(freq, length=0.55):
    # amapiano-style "log drum": pitched sine with a fast pitch drop and grit
    t = t_axis(length)
    f = freq * (1 + 0.6 * np.exp(-t * 40))
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) + 0.25 * np.sin(2 * ph)
    return np.tanh(2.2 * s * env(len(t), 0.003, length, 3.5)) * 0.55


def conga(freq, length=0.25):
    t = t_axis(length)
    f = freq * (1 + 0.3 * np.exp(-t * 60))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    return s * env(len(t), 0.001, length, 6) * 0.45


def pad(freqs, length, bright=0.5):
    t = t_axis(length)
    s = np.zeros_like(t)
    for f in freqs:
        for det in (-0.12, 0.0, 0.12):
            ff = f * 2 ** (det / 12)
            s += np.sign(np.sin(2 * np.pi * ff * t)) * 0.25 + np.sin(2 * np.pi * ff * t)
    s = lowpass(s, 900 + 1800 * bright)
    a = np.clip(t / 0.08, 0, 1) * np.clip((length - t) / 0.12, 0, 1)
    return s * a / (len(freqs) * 3)


def riser(length, f0=200, f1=2400):
    n = int(length * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    # sweep a crude band by mixing two low-passes
    out = np.zeros(n)
    seg = 2048
    for k in range(0, n, seg):
        frac = k / n
        cut = f0 * (f1 / f0) ** frac
        chunk = noise[k:k + seg]
        out[k:k + seg] = highpass(lowpass(chunk, cut * 2), cut * 0.5)
    return out * (t / length) ** 2 * 0.5


# ---------- music ----------

music = np.zeros(int(DUR * SR))

# A minor progression, one chord per bar (2 s): Am F C G
CHORDS = [
    [220.0, 261.63, 329.63],
    [174.61, 220.0, 261.63],
    [196.0, 261.63, 329.63],
    [196.0, 246.94, 293.66],
]
BASS = [55.0, 43.65, 65.41, 49.0]


def bar_idx(t):
    return int(t // 2.0) % 4


# Section 1 (0-3): heartbeat kicks + low drone, riser into the reveal
for b in (0.0, 1.0, 1.5, 2.0, 2.5):
    place(music, kick(), b, 0.8 if b else 1.0)
place(music, pad([55.0, 110.0], 3.0, 0.1), 0.0, 0.8)
place(music, riser(1.5), 1.5, 0.7)

# Sections 2-4 (3-14): full groove
def groove(t0, t1, busy=1.0):
    t = t0
    while t < t1 - 1e-6:
        beat_in_bar = round(((t % 2.0) / BEAT)) % 4
        # kick: 1, 2&, 3 (afro push), plus 4 at low level
        if beat_in_bar in (0, 2):
            place(music, kick(), t, 0.95)
        if beat_in_bar == 1 and busy >= 1:
            place(music, kick(0.3), t + 0.25, 0.6)
        # clap on 2 and 4
        if beat_in_bar in (1, 3):
            place(music, clap(), t, 0.75)
        # shaker 16ths with accent on off-8ths
        for s in range(4):
            acc = 1.0 if s == 2 else 0.55
            place(music, shaker(), t + s * BEAT / 4, acc * 0.8 * busy)
        # log drum bass
        if busy >= 1:
            root = BASS[bar_idx(t)]
            if beat_in_bar == 0:
                place(music, log_drum(root * 2), t + 0.25, 0.9)
            if beat_in_bar == 2:
                place(music, log_drum(root * 2), t + 0.125, 0.7)
                place(music, log_drum(root * 3), t + 0.375, 0.6)
        else:
            if beat_in_bar == 0:
                place(music, log_drum(BASS[bar_idx(t)] * 2, 0.8), t, 0.6)
        t += BEAT
    # pads per bar
    b = t0
    while b < t1 - 1e-6:
        length = min(2.0, t1 - b)
        place(music, pad(CHORDS[bar_idx(b)], length, 0.5 * busy), b, 0.55)
        b += 2.0


groove(3.0, 14.0, 1.0)

# Section 5 (14-18): energy lift, conga runs, snare roll riser
groove(14.0, 18.0, 1.0)
for i, t in enumerate(np.arange(14.0, 17.0, BEAT / 2)):
    place(music, conga(330 if i % 3 else 220), t + BEAT / 8, 0.7)
for k in range(16):
    place(music, clap(0.12), 17.0 + k * (1.0 / 16), 0.15 + 0.5 * k / 16)
place(music, riser(1.0, 300, 4000), 17.0, 0.6)

# Section 6 (18-29): lighter groove so the phone numbers stay clear
groove(18.0, 29.0, 0.6)

# Final hit at 29.0 with decaying chord
place(music, kick(0.8), 29.0, 1.0)
place(music, clap(0.4), 29.0, 0.9)
place(music, pad([110.0, 220.0, 261.63, 329.63], 1.0, 0.6), 29.0, 0.9)

# Tail fade 29.4-30
fade = np.ones_like(music)
i0, i1 = int(29.4 * SR), int(30.0 * SR)
fade[i0:i1] = np.linspace(1, 0, i1 - i0)
music *= fade
music = music / np.max(np.abs(music)) * 0.89

# ---------- SFX ----------

def impact():
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(35 + 120 * np.exp(-t * 18)) / SR) * env(n, 0.001, 1.4, 3)
    crack = highpass(rng.standard_normal(n), 1500) * env(n, 0.0005, 0.12, 5)
    return np.tanh(1.8 * (boom + 0.6 * crack)) * 0.95


def whoosh(length=0.5):
    n = int(length * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    shape = np.sin(np.pi * t / length) ** 2
    out = np.zeros(n)
    seg = 1024
    for k in range(0, n, seg):
        cut = 400 + 5000 * np.sin(np.pi * k / n)
        out[k:k + seg] = highpass(lowpass(noise[k:k + seg], cut), 250)
    return out * shape * 0.6


def tick():
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 1800 * t) * 0.5 + highpass(rng.standard_normal(n), 4000) * 0.3) * env(n, 0.0005, 0.06, 6)


def swipe():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 600 + 4000 * t / 0.35
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.01, 0.35, 2) * 0.25 + whoosh(0.35) * 0.6


os.makedirs(os.path.join(ROOT, "music"), exist_ok=True)
os.makedirs(os.path.join(ROOT, "sfx"), exist_ok=True)
sf.write(os.path.join(ROOT, "music", "gbo-bed.wav"), music.astype(np.float32), SR)
for name, sig in {"impact": impact(), "whoosh": whoosh(), "tick": tick(), "swipe": swipe()}.items():
    sig = sig / np.max(np.abs(sig)) * 0.9
    sf.write(os.path.join(ROOT, "sfx", f"{name}.wav"), sig.astype(np.float32), SR)
print("ok")
