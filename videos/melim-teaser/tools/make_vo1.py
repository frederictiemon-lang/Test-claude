"""Voice line 1 with an explicit phoneme string, so "l'IA" is said "li-a".

Written "l'I.A.", the text front-end turned the dots into sentence breaks and put a
pause between "i" and "a" (heard as "l'ITA"). Here the line is given to Kokoro as
phonemes: the rest of the sentence is Kokoro's own French phonemization, only
"l'IA" is written by hand as [liˈa] (two vowels, stress on "a", no pause).

    python3 tools/make_vo1.py
"""

import os

import soundfile as sf
from kokoro_onnx import Kokoro

CACHE = os.path.expanduser("~/.cache/hyperframes/tts")
ROOT = os.path.join(os.path.dirname(__file__), "..")
PHONEMES = "e sˈi liˈa dəvnˈɛ votʁ mɛjˈœʁ aljˈe ?"  # « Et si l'IA devenait votre meilleur allié ? »

k = Kokoro(os.path.join(CACHE, "models", "kokoro-v1.0.onnx"), os.path.join(CACHE, "voices", "voices-v1.0.bin"))
audio, sr = k.create(PHONEMES, "ff_siwis", speed=1.1, lang="fr-fr", is_phonemes=True)
sf.write(os.path.join(ROOT, "assets", "vo", "vo1.wav"), audio, sr)
print(f"vo1.wav {len(audio) / sr:.2f} s")
