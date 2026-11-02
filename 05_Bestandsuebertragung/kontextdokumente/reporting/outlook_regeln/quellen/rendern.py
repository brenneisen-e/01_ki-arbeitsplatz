# -*- coding: utf-8 -*-
"""Kopie aus pruefbot_testing/quellen (nur Profil angepasst).

Sichtpruefung: rendert die Arbeitsmappe ueber LibreOffice als PDF und legt je Seite ein PNG ab.

Aufruf:  python3 rendern.py <datei.xlsm> <ausgabeordner> [dpi]

LibreOffice laeuft mit eigenem Profil (/tmp/lo_regeln_render, ueber LO_PROFIL_RENDER aenderbar), damit es parallel
laufende Instanzen nicht stoert.
LibreOffice rechnet XLOOKUP/LET nicht – angezeigt werden die mitgeschriebenen Zwischenwerte (wie in Excel nach dem
Oeffnen). Formen mit Makro erscheinen als Flaechen; die Karten (Dialoge) des Generators sind nur in Excel zu sehen.
"""
import os
import subprocess
import sys

import pymupdf


def main():
    quelle = os.path.abspath(sys.argv[1])
    ziel = os.path.abspath(sys.argv[2])
    dpi = int(sys.argv[3]) if len(sys.argv) > 3 else 80
    os.makedirs(ziel, exist_ok=True)
    profil = os.environ.get('LO_PROFIL_RENDER', 'file:///tmp/lo_regeln_render')
    subprocess.run(['soffice', '-env:UserInstallation=' + profil, '--headless', '--norestore',
                    '--convert-to', 'pdf', '--outdir', ziel, quelle], check=True, stdout=subprocess.DEVNULL,
                   stderr=subprocess.DEVNULL, timeout=300)
    pdf = os.path.join(ziel, os.path.splitext(os.path.basename(quelle))[0] + '.pdf')
    doc = pymupdf.open(pdf)
    for i, seite in enumerate(doc):
        seite.get_pixmap(dpi=dpi).save(os.path.join(ziel, 'seite_%02d.png' % (i + 1)))
    print('%d Seiten -> %s' % (doc.page_count, ziel))


if __name__ == '__main__':
    main()
