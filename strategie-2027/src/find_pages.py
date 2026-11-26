"""Repère la page de chaque titre dans le PDF rendu. Usage : python3 find_pages.py doc.pdf headings.json toc_pages.json"""
import json, re, subprocess, sys, unicodedata

pdf, hj, out = sys.argv[1:4]
heads = json.load(open(hj))
n = int(re.search(r'Pages:\s+(\d+)', subprocess.run(['pdfinfo', pdf], capture_output=True, text=True).stdout).group(1))

def norm(s):
    s = unicodedata.normalize('NFC', s).replace(' ', ' ').replace(' ', ' ').replace('’', "'")
    return re.sub(r'\s+', ' ', s).strip().lower()

pages = []
for i in range(1, n + 1):
    t = subprocess.run(['pdftotext', '-f', str(i), '-l', str(i), '-layout', pdf, '-'], capture_output=True, text=True).stdout
    pages.append(norm(t))

res, missing, start = {}, [], 3  # pages 1-2 : couverture et sommaire
for h in heads:
    key = norm(h['text'])
    found = next((i + 1 for i in range(start - 1, n) if key in pages[i]), None)
    if found is None:
        missing.append(h['text'])
    else:
        res[h['id']] = found
        start = found
json.dump(res, open(out, 'w'), indent=1)
print(f'{len(res)}/{len(heads)} titres repérés sur {n} pages')
for m in missing:
    print('  introuvable :', m)
