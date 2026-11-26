#!/usr/bin/env bash
# Construit le document en deux passes (la seconde fixe les numéros de page du sommaire).
set -euo pipefail
cd "$(dirname "$0")"
OUT=../Strategie_2027_Groupe_KCS_RLCS_LUKE.docx
SOFFICE=/root/.claude/skills/synced/264bb811-9d13-4dd7-8fc1-03af533e7802_e2e44a3b-7bdf-4cd0-82e8-eb2f0916b742/docx/scripts/office/soffice.py
TMP=${TMPDIR:-/tmp}/strat2027_build; mkdir -p "$TMP"
for pass in 1 2; do
  node build.js "$TMP/raw.docx"
  python3 postprocess.py "$TMP/raw.docx" "$OUT"
  python3 "$SOFFICE" --headless --convert-to pdf --outdir "$TMP" "$OUT" >/dev/null 2>&1
  python3 find_pages.py "$TMP/Strategie_2027_Groupe_KCS_RLCS_LUKE.pdf" headings.json toc_pages.json
done
cp "$TMP/Strategie_2027_Groupe_KCS_RLCS_LUKE.pdf" "$TMP/final.pdf"
echo "PDF de contrôle : $TMP/final.pdf"
