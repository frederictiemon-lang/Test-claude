"""Add discreet fade transitions to every slide and drop folder entries from the ZIP."""
import re
import sys
import zipfile
import shutil

src = sys.argv[1]
tmp = src + '.tmp'
TRANSITION = '<p:transition spd="slow"><p:fade/></p:transition>'

with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        if item.filename.endswith('/'):
            continue
        data = zin.read(item.filename)
        if re.fullmatch(r'ppt/slides/slide\d+\.xml', item.filename):
            xml = data.decode('utf-8')
            if '<p:transition' not in xml:
                if '<p:timing' in xml:
                    xml = xml.replace('<p:timing', TRANSITION + '<p:timing', 1)
                else:
                    xml = xml.replace('</p:sld>', TRANSITION + '</p:sld>', 1)
            data = xml.encode('utf-8')
        zout.writestr(item, data)
shutil.move(tmp, src)
print('post-processed', src)
