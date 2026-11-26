#!/usr/bin/env bash
# Construit le deck, ajoute les transitions, valide et rend les diapositives en images de contrôle.
set -euo pipefail
cd "$(dirname "$0")"
OUT=../Strategie_2027_Groupe_KCS_RLCS_LUKE.pptx
SK=/root/.claude/skills/synced/264bb811-9d13-4dd7-8fc1-03af533e7802_e2e44a3b-7bdf-4cd0-82e8-eb2f0916b742/pptx
QA="${1:?dossier de contrôle requis}"
NODE_PATH=./node_modules node build_deck.js "$OUT"
python3 add_transitions.py "$OUT"
python3 "$SK/scripts/office/validate.py" "$OUT" | tail -1
mkdir -p "$QA"
find "$QA" -maxdepth 1 -name 'slide-*.jpg' -delete
python3 "$SK/scripts/office/soffice.py" --headless --convert-to pdf --outdir "$QA" "$OUT" >/dev/null 2>&1
pdftoppm -jpeg -r 80 "$QA/Strategie_2027_Groupe_KCS_RLCS_LUKE.pdf" "$QA/slide"
