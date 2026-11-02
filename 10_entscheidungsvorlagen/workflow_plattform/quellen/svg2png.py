# -*- coding: utf-8 -*-
"""Rastert Logos und Lucide-Icons aus bilder/svg nach bilder/png (transparent), über das vorinstallierte Chromium.

Logos: offizielle Dateien (ServiceNow über Wikimedia Commons, Camunda von camunda.com, MuleSoft von mulesoft.com).
Icons: lucide-static (ISC-Lizenz), einfarbig in Deloitte-Grün und Weiß.

Aufruf: python3 svg2png.py
"""
import glob, os, re, subprocess, tempfile

HIER = os.path.dirname(os.path.abspath(__file__))
SVG = os.path.join(HIER, 'bilder', 'svg')
PNG = os.path.join(HIER, 'bilder', 'png')
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
os.makedirs(PNG, exist_ok=True)

FARBEN = {'gruen': '#26890D', 'weiss': '#FFFFFF', 'dunkel': '#046A38', 'grau': '#75787B', 'orange': '#ED8B00', 'rot': '#DA291C'}


def viewbox(svg):
    m = re.search(r'viewBox="([\d.\s-]+)"', svg)
    x, y, w, h = [float(v) for v in m.group(1).split()]
    return w, h


def rastern(svg_text, breite, ziel):
    w, h = viewbox(svg_text)
    hoch = max(1, round(breite * h / w))
    svg_text = re.sub(r'\swidth="[^"]*"', '', svg_text, count=1)
    svg_text = re.sub(r'\sheight="[^"]*"', '', svg_text, count=1)
    svg_text = svg_text.replace('<svg', '<svg width="%d" height="%d"' % (breite, hoch), 1)
    html = ('<html><body style="margin:0;padding:0;background:transparent;overflow:hidden">%s</body></html>' % svg_text)
    with tempfile.NamedTemporaryFile('w', suffix='.html', delete=False, encoding='utf-8') as f:
        f.write(html)
        pfad = f.name
    subprocess.run([CHROME, '--headless', '--disable-gpu', '--hide-scrollbars', '--no-sandbox',
                    '--default-background-color=00000000', '--window-size=%d,%d' % (breite, hoch),
                    '--screenshot=%s' % ziel, 'file://' + pfad], check=True, capture_output=True)
    os.unlink(pfad)


for datei in sorted(glob.glob(os.path.join(SVG, '*.svg'))):
    name = os.path.basename(datei)[:-4]
    text = open(datei, encoding='utf-8').read()
    text = re.sub(r'<\?xml[^>]*\?>', '', text)
    text = re.sub(r'<!--.*?-->', '', text, flags=re.S)
    if name.startswith('icon_'):
        for fname, hexwert in FARBEN.items():
            rastern(text.replace('currentColor', hexwert), 192, os.path.join(PNG, '%s_%s.png' % (name, fname)))
    else:
        rastern(text, 1200, os.path.join(PNG, name + '.png'))
    print('ok', name)
