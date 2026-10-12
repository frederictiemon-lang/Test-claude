#!/usr/bin/env bash
# Regenerates the six voice-over lines with HyperFrames' local Kokoro TTS
# (voice ff_siwis, French). Requires: pip install kokoro-onnx soundfile, and espeak-ng.
# Run from the project root:  bash tools/make_vo.sh
set -euo pipefail
cd "$(dirname "$0")/.."
i=1
while IFS= read -r line; do
  [ -z "$line" ] && continue
  npx hyperframes tts "$line" --voice ff_siwis -o "assets/vo/vo$i.wav" </dev/null
  echo "vo$i $(ffprobe -v error -show_entries format=duration -of csv=p=0 assets/vo/vo$i.wav)s | $line"
  i=$((i + 1))
done < assets/vo/script.txt
