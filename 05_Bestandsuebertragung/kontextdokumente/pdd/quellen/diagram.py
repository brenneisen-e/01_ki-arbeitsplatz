# -*- coding: utf-8 -*-
"""Erzeugt das Ablaufdiagramm des Prüf-Bots als PNG."""
import textwrap, html, cairosvg

FONT = "DejaVu Sans, Arial, sans-serif"
C_PROC = ('#DEEAF6', '#1F3864')
C_DEC  = ('#FFF2CC', '#7F6000')
C_BE   = ('#FBE4E4', '#A50E0E')
C_END  = ('#E2EFDA', '#375623')
C_SYS  = ('#F2F2F2', '#595959')


def esc(s):
    return html.escape(s, quote=False)


class Svg:
    def __init__(self, w, h):
        self.w, self.h, self.p = w, h, []

    def box(self, x, y, w, h, lines, colors=C_PROC, rx=10, tag=None, fs=19):
        fill, stroke = colors
        self.p.append(
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" ry="{rx}" '
            f'fill="{fill}" stroke="{stroke}" stroke-width="2.5"/>')
        if tag:
            self.p.append(
                f'<text x="{x+12}" y="{y+22}" font-family="{FONT}" font-size="15" '
                f'font-weight="bold" fill="{stroke}">{esc(tag)}</text>')
        top = y + h / 2 - (len(lines) - 1) * (fs + 5) / 2 + fs / 3 + (10 if tag else 0)
        for i, ln in enumerate(lines):
            self.p.append(
                f'<text x="{x+w/2}" y="{top + i*(fs+5)}" font-family="{FONT}" font-size="{fs}" '
                f'text-anchor="middle" fill="#1a1a1a">{esc(ln)}</text>')

    def diamond(self, cx, cy, w, h, lines, fs=18):
        fill, stroke = C_DEC
        pts = f'{cx},{cy-h/2} {cx+w/2},{cy} {cx},{cy+h/2} {cx-w/2},{cy}'
        self.p.append(f'<polygon points="{pts}" fill="{fill}" stroke="{stroke}" stroke-width="2.5"/>')
        top = cy - (len(lines) - 1) * (fs + 4) / 2 + fs / 3
        for i, ln in enumerate(lines):
            self.p.append(
                f'<text x="{cx}" y="{top + i*(fs+4)}" font-family="{FONT}" font-size="{fs}" '
                f'text-anchor="middle" fill="#1a1a1a">{esc(ln)}</text>')

    def arrow(self, pts, label=None, lx=None, ly=None):
        d = ' '.join(f'{x},{y}' for x, y in pts)
        self.p.append(
            f'<polyline points="{d}" fill="none" stroke="#404040" stroke-width="2.5" '
            f'marker-end="url(#a)"/>')
        if label:
            x, y = (lx, ly) if lx is not None else (pts[0][0] + 10, pts[0][1] - 8)
            self.p.append(
                f'<text x="{x}" y="{y}" font-family="{FONT}" font-size="17" font-weight="bold" '
                f'fill="#404040">{esc(label)}</text>')

    def title(self, x, y, t, fs=27):
        self.p.append(
            f'<text x="{x}" y="{y}" font-family="{FONT}" font-size="{fs}" font-weight="bold" '
            f'fill="#1F3864">{esc(t)}</text>')

    def render(self, path):
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.w}" height="{self.h}" '
               f'viewBox="0 0 {self.w} {self.h}">'
               f'<defs><marker id="a" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">'
               f'<path d="M0,0 L10,4 L0,8 z" fill="#404040"/></marker></defs>'
               f'<rect width="{self.w}" height="{self.h}" fill="#ffffff"/>'
               + ''.join(self.p) + '</svg>')
        cairosvg.svg2png(bytestring=svg.encode('utf-8'), write_to=path, scale=1.0)


def build(variant, path):
    KV = variant == 'KV'
    bot = 'BOT2011' if KV else 'BOT1515'
    lbl = 'Gesundheit (KV)' if KV else 'Komposit / Leben'
    s = Svg(2560, 1400)
    s.title(40, 46, f'Ablaufdiagramm Prüf-Bot Bestandsübertragung – {lbl}')

    MX, MW = 700, 640
    RX, RW = 1660, 760
    LX, LW = 120, 460
    y, H = 90, 74
    def cx(x, w): return x + w / 2

    # Datenquelle links
    s.box(LX, 210, LW, 150, ['Datenpool', '', 'Einzige Datenquelle des Bots.',
                             'Felder BUE_*, je Vorgang vollständig',
                             'befüllt bei Eröffnung des Vorgangs.'], C_SYS, fs=17)
    s.box(LX, 400, LW, 122, ['Hostanwendungen', '', 'VA230 · IS100 · OB726',
                             'GH040 · EOS'], C_SYS, fs=17)

    s.box(MX, y, MW, H, ['Start: Eröffnung Postkorbvorgang'], C_END); y1 = y + H

    y = y1 + 30
    s.box(MX, y, MW, 74, ['Vorgangsdaten aus dem Datenpool lesen'], C_PROC, fs=18)
    s.arrow([(cx(MX, MW), y1), (cx(MX, MW), y - 4)])
    s.arrow([(LX + LW, 285), (MX - 6, y + 37)])
    y2 = y + 74

    y = y2 + 30
    s.diamond(cx(MX, MW), y + 56, 660, 124,
              ['Ausschlusskriterien erfüllt?', '(Vorschlag, fachlich nicht abgestimmt)'], fs=17)
    s.arrow([(cx(MX, MW), y2), (cx(MX, MW), y - 6)])
    s.box(RX, y + 22, RW, 70, ['Aussteuerung ohne Hostzugriff:',
                               'Kein BÜ-Vorgang · kein BÜ-Wunsch ·',
                               'Reminder · Unterlagen unvollständig'], C_BE, fs=16)
    s.arrow([(cx(MX, MW) + 330, y + 56), (RX - 6, y + 56)], 'nein', cx(MX, MW) + 350, y + 46)
    y3 = y + 118

    y = y3 + 32
    s.box(MX, y, MW, 128, ['VNR-Prüfung (VA230)',
                           'Namensprüfung (IS100)',
                           'Geburtsdatum und Adresse (IS100)'],
          C_PROC, tag='I. VN – Stammdaten + VNR', fs=17)
    s.arrow([(cx(MX, MW), y3), (cx(MX, MW), y - 4)], 'ja')
    s.arrow([(LX + LW, 461), (MX - 6, y + 64)])
    y4 = y + 128

    y = y4 + 26
    s.box(MX, y, MW, 128, ['Agenturnummer bzw. Vermittler-Nr. (OB726)',
                           'Anbindung (GH040) · Stammagentur (EOS)',
                           'Bestandsinhaber · Vertriebskanal'],
          C_PROC, tag='II. Übernehmender Makler', fs=17)
    s.arrow([(cx(MX, MW), y4), (cx(MX, MW), y - 4)])
    s.box(RX, y + 26, RW, 70, ['Aussteuerung oder Ablehnung',
                               'bei jedem fehlgeschlagenen Prüfschritt'], C_BE, fs=17)
    s.arrow([(MX + MW, y + 64), (RX - 6, y + 61)], 'nein', MX + MW + 24, y + 54)
    y5 = y + 128

    y = y5 + 30
    s.box(MX, y, MW, 84, ['BE überprüfen und priorisieren'], C_PROC, fs=18)
    s.arrow([(cx(MX, MW), y5), (cx(MX, MW), y - 4)], 'ja')
    y6 = y + 84

    y = y6 + 30
    s.diamond(cx(MX, MW), y + 52, 620, 118, ['Vertriebskanal', 'Bestandsinhaber = AO?'])
    s.arrow([(cx(MX, MW), y6), (cx(MX, MW), y - 6)])
    s.box(RX, y + 14, RW, H, ['Weiterleitung an den 72-Stunden-BOT'], C_END, fs=18)
    s.arrow([(cx(MX, MW) + 310, y + 52), (RX - 6, y + 52)], 'ja', cx(MX, MW) + 330, y + 42)
    y7 = y + 110

    y = y7 + 32
    s.box(MX, y, MW, 96, ['Trennung der Sparte,', f'Notizbestückung {bot},',
                          f'Weiterleitung an den BÜ-Bot {bot}'], C_END, fs=18)
    s.arrow([(cx(MX, MW), y7), (cx(MX, MW), y - 4)], 'nein')

    lx, ly = 620, 1300
    s.box(lx, ly, 250, 46, ['Datenquelle'], C_SYS, fs=17)
    s.box(lx + 280, ly, 250, 46, ['Verarbeitung'], C_PROC, fs=17)
    s.diamond(lx + 680, ly + 23, 260, 60, ['Entscheidung'], fs=17)
    s.box(lx + 840, ly, 320, 46, ['Aussteuerung / Ablehnung'], C_BE, fs=17)
    s.box(lx + 1190, ly, 250, 46, ['Start / Ende'], C_END, fs=17)
    s.render(path)
    return path


if __name__ == '__main__':
    import sys
    build(sys.argv[1], sys.argv[2])
