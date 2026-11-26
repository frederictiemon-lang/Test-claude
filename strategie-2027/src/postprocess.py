"""Post-traitement du .docx : transforme les entrées de sommaire en champ TOC Word
et réécrit l'archive sans entrées de dossiers. Usage : python3 postprocess.py in.docx out.docx"""
import re, sys, zipfile

src, dst = sys.argv[1], sys.argv[2]
zin = zipfile.ZipFile(src)
xml = zin.read('word/document.xml').decode('utf-8')

run_re = lambda marker: re.compile(r'<w:r>(?:(?!<w:r>).)*?' + marker + r'</w:t></w:r>', re.S)
begin = ('<w:r><w:fldChar w:fldCharType="begin"/></w:r>'
         '<w:r><w:instrText xml:space="preserve"> TOC \\o "1-2" \\h \\z \\u </w:instrText></w:r>'
         '<w:r><w:fldChar w:fldCharType="separate"/></w:r>')
end = '<w:r><w:fldChar w:fldCharType="end"/></w:r>'
xml, n1 = run_re('§TOCSTART§').subn(lambda m: begin, xml, count=1)
xml, n2 = run_re('§TOCEND§').subn(lambda m: end, xml, count=1)
assert n1 == 1 and n2 == 1, (n1, n2)

# Identifiants de signets uniques (la bibliothèque les numérote tous 1)
counter = {'n': 0}
def renum(m):
    if m.group(1) == 'Start':
        counter['n'] += 1
    return f'<w:bookmark{m.group(1)}{m.group(2)}w:id="{counter["n"]}"'
xml = re.sub(r'<w:bookmark(Start|End)([^>]*?)w:id="\d+"', renum, xml)

# Ordre des bordures de paragraphe conforme au schéma : top, left, bottom, right, between, bar
ORDER = ['top', 'left', 'bottom', 'right', 'between', 'bar']
def fix_pbdr(m):
    items = re.findall(r'<w:(\w+) [^>]*/>', m.group(1))
    els = dict(zip(items, re.findall(r'<w:\w+ [^>]*/>', m.group(1))))
    return '<w:pBdr>' + ''.join(els[k] for k in ORDER if k in els) + '</w:pBdr>'
xml = re.sub(r'<w:pBdr>(.*?)</w:pBdr>', fix_pbdr, xml)

zout = zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED)
def add_linerule(text):
    # Interlignage proportionnel explicite (sans lineRule, LibreOffice applique une hauteur fixe)
    return re.sub(r'<w:spacing((?:(?!/>)[^>])*?) w:line="(\d+)"((?:(?!/>)[^>])*)/>',
                  lambda m: m.group(0) if 'lineRule' in m.group(0) else f'<w:spacing{m.group(1)} w:line="{m.group(2)}" w:lineRule="auto"{m.group(3)}/>', text)

xml = add_linerule(xml)
for item in zin.infolist():
    if item.filename.endswith('/'):
        continue
    if item.filename == 'word/document.xml':
        data = xml.encode('utf-8')
    elif re.match(r'word/(styles|header\d*|footer\d*)\.xml$', item.filename):
        data = add_linerule(zin.read(item.filename).decode('utf-8')).encode('utf-8')
    else:
        data = zin.read(item.filename)
    zout.writestr(item, data)
zout.close()
print('TOC champ inséré ;', dst)
