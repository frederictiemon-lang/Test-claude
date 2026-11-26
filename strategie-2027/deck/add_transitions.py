"""Ajoute une transition sobre (fondu) à chaque diapositive. Usage : python3 add_transitions.py deck.pptx"""
import re, sys, zipfile, shutil, tempfile, os
src = sys.argv[1]
tmp = tempfile.mktemp(suffix='.pptx')
zin = zipfile.ZipFile(src)
zout = zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED)
n = 0
for item in zin.infolist():
    data = zin.read(item.filename)
    if re.match(r'ppt/slides/slide\d+\.xml$', item.filename):
        x = data.decode('utf-8')
        if '<p:transition' not in x:
            tr = '<p:transition spd="med"><p:fade/></p:transition>'
            if '</p:clrMapOvr>' in x:
                x = x.replace('</p:clrMapOvr>', '</p:clrMapOvr>' + tr, 1)
            else:
                x = x.replace('</p:cSld>', '</p:cSld>' + tr, 1)
            n += 1
        data = x.encode('utf-8')
    if not item.filename.endswith('/'):
        zout.writestr(item, data)
zout.close(); zin.close()
shutil.move(tmp, src)
print(f'transitions ajoutées : {n}')
