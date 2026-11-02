# -*- coding: utf-8 -*-
"""Fünf Entwürfe für die Darstellung von Eingängen und Abgängen im BÜ-Reporting (Verbund, viele Stichtage), jeweils mit Split nach Sparte.
Beispieldaten: 20 Werktage 31.08.–25.09.2026; die Tage 21.–25.09. entsprechen den Summen aus dem Cockpit (Eingänge, Abgänge, Delta),
die Aufteilung auf die Sparten und die Tage davor sind erfunden. Ausgabe: PNG je Entwurf plus Übersicht."""
import datetime as dt
import os
import random

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.patches import Rectangle  # noqa: E402

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'bue_reporting', 'Entwuerfe_Bewegungen')
os.makedirs(OUT, exist_ok=True)
plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 10})

# Cockpit-Farben (bue_reporting_build.py)
TEAL, TEALD, INDIGO, ROT = '#0F94A7', '#0B6F7D', '#3B4F8A', '#BF1528'
SW, GRAUD, GRAU, GRAUM, GRAUL, GRAUXL = '#1A1A1A', '#4A4A4A', '#6B6B6B', '#9AA3AD', '#D0D5DA', '#F3F4F6'
ABBAU, AUFBAU = '#1E7F4F', '#C98A00'          # wie die Delta-Badges: weniger = grün, mehr = gelb
HELL = {'Komposit': '#7FCBD4', 'Leben': '#9AA6CC', 'KV': '#E8919B'}
FARBE = {'Komposit': TEAL, 'Leben': INDIGO, 'KV': ROT}
SPARTEN = ['Komposit', 'Leben', 'KV']

# ------------------------------------------------------------------ Beispieldaten
random.seed(7)
tage = []
d = dt.date(2026, 8, 31)
while len(tage) < 20:
    if d.weekday() < 5:
        tage.append(d)
    d += dt.timedelta(days=1)
echt = {dt.date(2026, 9, 21): (303, 421), dt.date(2026, 9, 22): (258, 116), dt.date(2026, 9, 23): (333, 362),
        dt.date(2026, 9, 24): (266, 426), dt.date(2026, 9, 25): (207, 469)}
anteil = {'Komposit': .47, 'Leben': .19, 'KV': .34}
E = {s: [] for s in SPARTEN}; A = {s: [] for s in SPARTEN}
for t in tage:
    if t in echt:
        e_sum, a_sum = echt[t]
    else:
        e_sum = random.randint(210, 340); a_sum = random.randint(200, 420)
    for liste, summe in ((E, e_sum), (A, a_sum)):
        rest = summe
        for i, s in enumerate(SPARTEN):
            v = rest if i == 2 else int(round(summe * anteil[s] * random.uniform(.85, 1.15)))
            liste[s].append(v); rest -= v
ES = [sum(E[s][i] for s in SPARTEN) for i in range(20)]
AS = [sum(A[s][i] for s in SPARTEN) for i in range(20)]
DS = [e - a for e, a in zip(ES, AS)]
R = [12188]
for dlt in reversed(DS[1:]):
    R.insert(0, R[0] - dlt)
lab = [t.strftime('%d.%m.') for t in tage]
x = list(range(20))


def de(v, vz=False):
    s = f'{abs(v):,}'.replace(',', '.')
    return ('+' if v > 0 else '−' if v < 0 else '±') + s if vz else ('−' + s if v < 0 else s)


def rahmen(fig, nr, titel, unter, warum, excel):
    """Kachel im Cockpit-Stil: Kopfleiste Verbund (petrol), Untertitel, rechts Begründung und Umsetzung."""
    fig.patch.set_facecolor('white')
    fig.add_artist(Rectangle((0, .915), 1, .085, transform=fig.transFigure, color=TEALD))
    fig.text(.012, .957, f'Vorschlag {nr}  ·  {titel}', color='white', fontsize=15, fontweight='bold', va='center')
    fig.text(.012, .885, unter, color=GRAU, fontsize=9.5, va='center')
    fig.add_artist(Rectangle((.765, .03), .225, .82, transform=fig.transFigure, color=GRAUXL))
    fig.text(.777, .815, 'Warum', fontsize=10.5, fontweight='bold', color=TEALD, va='top')
    fig.text(.777, .78, warum, fontsize=9, color=SW, va='top', wrap=True, linespacing=1.45)
    fig.text(.777, .36, 'Umsetzung im Master-Excel', fontsize=10.5, fontweight='bold', color=TEALD, va='top')
    fig.text(.777, .325, excel, fontsize=9, color=SW, va='top', linespacing=1.45)


def achse(ax, ytick=False):
    for sp in ('top', 'right', 'left'):
        ax.spines[sp].set_visible(False)
    ax.spines['bottom'].set_color(GRAUL)
    ax.tick_params(axis='x', colors=GRAU, labelsize=8, length=0)
    if not ytick:
        ax.set_yticks([])
    else:
        ax.tick_params(axis='y', colors=GRAU, labelsize=8, length=0)
        ax.grid(axis='y', color=GRAUXL, lw=.8); ax.set_axisbelow(True)


def umbruch(t, n=44):
    worte, zeilen, z = t.split(), [], ''
    for w in worte:
        if len(z) + len(w) + 1 > n:
            zeilen.append(z); z = w
        else:
            z = (z + ' ' + w).strip()
    return '\n'.join(zeilen + [z])


def speichern(fig, name):
    p = os.path.join(OUT, name)
    fig.savefig(p, dpi=110)
    plt.close(fig)
    return p


dateien = []
DSP = {s: [e - a for e, a in zip(E[s], A[s])] for s in SPARTEN}   # Delta je Sparte und Tag
LUECKE = dict(edgecolor='white', linewidth=1.2)                    # Trennfuge zwischen Segmenten


def legende(fig, y=.835, x=.045, extra=()):
    """Sparten-Legende in einer Zeile oberhalb des Diagramms (feste Reihenfolge Komposit, Leben, KV)."""
    for s in SPARTEN:
        fig.add_artist(Rectangle((x, y - .009), .009, .018, transform=fig.transFigure, color=FARBE[s]))
        fig.text(x + .013, y, s, fontsize=9, color=SW, va='center'); x += .075
    for t in extra:
        fig.text(x, y, t, fontsize=9, color=GRAU, va='center'); x += .012 * len(t) * .62 + .03


def seglabel(ax, xpos, unten, hoehe, v, breite_ok=True, fs=6.8, minh=22):
    if breite_ok and abs(hoehe) >= minh and v:
        ax.text(xpos, unten + hoehe / 2, str(abs(v)), ha='center', va='center', fontsize=fs, color='white')


def badge(ax, xpos, y, v, fs=7.5):
    farbe, grund = (ABBAU, '#DDF3E4') if v < 0 else (AUFBAU, '#FBEFC7')
    ax.text(xpos, y, de(v, True), ha='center', va='center', fontsize=fs, color=farbe, fontweight='bold',
            bbox=dict(boxstyle='round,pad=.25', fc=grund, ec='none'))


# ------------------------------------------------------------------ 1 Spiegelsäule je Tag, nach Sparte gestapelt
fig = plt.figure(figsize=(16, 7.2))
rahmen(fig, 1, 'Eine Säule je Tag: Eingänge nach oben, Abgänge nach unten, je Sparte gestapelt',
       'Verbund · 20 Werktage · statt drei Säulen je Stichtag (Eingänge, Abgänge, Delta) nur eine; das Delta steht als Badge darunter',
       umbruch('Heute belegt jeder Stichtag drei Säulen – bei 20 Tagen sind das 60 Säulen. Hier ist es eine: oben rein, unten raus, '
               'jeweils nach Sparte gestapelt in derselben Reihenfolge (Komposit an der Achse). Die Sparte ist an jedem Segment ablesbar, '
               'das Delta als Badge. Die Delta-Säule mit gemischten Vorzeichen entfällt.'),
       umbruch('Gestapeltes Säulendiagramm mit sechs Reihen: drei Sparten Eingänge (positiv), drei Sparten Abgänge (negativ), gleiche '
               'Farbe je Sparte. Badges wie heute über eine unsichtbare Reihe. Ersetzt die heutigen zwei Diagramme 1:1.'))
legende(fig)
ax = fig.add_axes([.045, .12, .7, .68])
for i in x:
    oben = unten = 0
    for s in SPARTEN:
        e, a = E[s][i], A[s][i]
        ax.bar(i, e, bottom=oben, color=FARBE[s], width=.66, **LUECKE); seglabel(ax, i, oben, e, e); oben += e
        ax.bar(i, -a, bottom=unten, color=FARBE[s], width=.66, **LUECKE); seglabel(ax, i, unten, -a, a); unten -= a
    ax.text(i, oben + 10, str(ES[i]), ha='center', va='bottom', fontsize=7.2, color=GRAUD)
    badge(ax, i, -max(AS) - 75, DS[i], fs=7.2)
ax.axhline(0, color=GRAUD, lw=.9)
achse(ax); ax.set_xticks(x); ax.set_xticklabels(lab); ax.set_ylim(-max(AS) - 115, max(ES) + 60); ax.set_xlim(-.9, 19.6)
ax.text(-.85, max(ES) - 20, 'Eingänge', color=GRAUD, fontsize=9.5, fontweight='bold', rotation=90, va='top')
ax.text(-.85, -40, 'Abgänge', color=GRAUD, fontsize=9.5, fontweight='bold', rotation=90, va='top')
dateien.append(speichern(fig, 'Vorschlag_1_Spiegelsaeule_nach_Sparte.png'))

# ------------------------------------------------------------------ 2 Doppelsäule: Eingänge und Abgänge nebeneinander
N2 = 10
fig = plt.figure(figsize=(16, 7.2))
rahmen(fig, 2, 'Doppelsäule je Tag: Eingänge | Abgänge nebeneinander, je Sparte gestapelt',
       f'Verbund · letzte {N2} Werktage · linke Säule Eingänge, rechte Säule Abgänge; Delta als Badge über dem Paar',
       umbruch('Eingänge und Abgänge stehen direkt nebeneinander auf derselben Grundlinie – ob mehr raus als rein ging, sieht man an '
               'der Höhe, je Sparte am Segment. Keine Werte unter der Achse, kein Umdenken. Mit Zahlen in den Segmenten gut für '
               '5–10 Stichtage; bei mehr Tagen die Wochensicht (Vorschlag 5).'),
       umbruch('Gruppiertes und gestapeltes Säulendiagramm: je Stichtag zwei Kategorien (E, A), drei Reihen Sparte. In Excel über '
               'Kategorienpaare „22.09. E / 22.09. A“ mit Leerspalte als Abstand. Badges über unsichtbare Reihe.'))
legende(fig)
ax = fig.add_axes([.045, .12, .7, .68])
t0 = 20 - N2
for k, i in enumerate(range(t0, 20)):
    for off, quelle, tot in ((-.2, E, ES[i]), (.2, A, AS[i])):
        unten = 0
        for s in SPARTEN:
            v = quelle[s][i]
            ax.bar(k + off, v, bottom=unten, color=FARBE[s], width=.38, **LUECKE); seglabel(ax, k + off, unten, v, v, minh=18); unten += v
        ax.text(k + off, tot + 8, str(tot), ha='center', va='bottom', fontsize=7.5, color=GRAUD)
        ax.text(k + off, -14, 'E' if off < 0 else 'A', ha='center', va='top', fontsize=7.5, color=GRAU)
    badge(ax, k, max(max(ES), max(AS)) + 70, DS[i])
achse(ax); ax.set_xticks(range(N2)); ax.set_xticklabels(lab[t0:]); ax.tick_params(axis='x', pad=16)
ax.set_ylim(-40, max(max(ES), max(AS)) + 105); ax.axhline(0, color=GRAUL, lw=.8)
dateien.append(speichern(fig, 'Vorschlag_2_Doppelsaeule_nach_Sparte.png'))

# ------------------------------------------------------------------ 3 Delta je Sparte, darunter Rückstand
fig = plt.figure(figsize=(16, 7.2))
rahmen(fig, 3, 'Delta je Tag, nach Sparte zerlegt – darunter der Rückstand',
       'Verbund · 20 Werktage · Segment über der Achse = Sparte baut auf, unter der Achse = Sparte baut ab; Punkt = Gesamt-Delta',
       umbruch('Beantwortet direkt „welche Sparte baut ab, welche auf?“. Jede Sparte trägt ihr Delta als Segment in ihrer Farbe; '
               'baut Komposit ab und KV auf, steht Komposit unten und KV oben. Der Punkt zeigt das Gesamt-Delta. '
               'Eingänge und Abgänge selbst stehen in Tooltip oder Tabelle.'),
       umbruch('Gestapelte Säulen aus je zwei Hilfsreihen pro Sparte (positiver und negativer Anteil, MAX/MIN auf 0), dazu eine '
               'Punktreihe Gesamt-Delta. Darunter eigenes Liniendiagramm Rückstand – keine zweite Achse.'))
legende(fig, extra=('●  Gesamt-Delta',))
ax1 = fig.add_axes([.045, .4, .7, .41]); ax2 = fig.add_axes([.045, .08, .7, .24])
for i in x:
    hoch = tief = 0
    for s in SPARTEN:
        v = DSP[s][i]
        if v >= 0:
            ax1.bar(i, v, bottom=hoch, color=FARBE[s], width=.62, **LUECKE); hoch += v
        else:
            ax1.bar(i, v, bottom=tief, color=FARBE[s], width=.62, **LUECKE); tief += v
    ax1.scatter([i], [DS[i]], s=26, color=SW, zorder=4, edgecolor='white', linewidth=1.2)
for i in (DS.index(min(DS)), DS.index(max(DS))):
    ax1.text(i + .38, DS[i], de(DS[i], True), va='center', fontsize=8.5, color=SW, fontweight='bold')
ax1.axhline(0, color=GRAUD, lw=.9)
achse(ax1); ax1.set_xticks(x); ax1.set_xticklabels([]); ax1.set_xlim(-.9, 20.4)
lo = min(sum(min(0, DSP[s][i]) for s in SPARTEN) for i in x); hi = max(sum(max(0, DSP[s][i]) for s in SPARTEN) for i in x)
ax1.set_ylim(lo * 1.15, hi * 1.2)
ax1.text(-.85, hi * 1.05, 'Aufbau', color=AUFBAU, fontsize=9, fontweight='bold', va='top')
ax1.text(-.85, lo * 1.05, 'Abbau', color=ABBAU, fontsize=9, fontweight='bold', va='bottom')
tx = '   ·   '.join(f'{s} {de(sum(DSP[s]), True)}' for s in SPARTEN)
ax1.text(20.3, lo * 1.12, f'Σ 20 Tage:  {tx}', ha='right', va='bottom', fontsize=8.5, color=GRAUD)
ax2.plot(x, R, color=TEALD, lw=2); ax2.scatter([0, 19], [R[0], R[19]], color=TEALD, s=22, zorder=3)
ax2.text(-.3, R[0], de(R[0]), ha='right', va='center', fontsize=8.5, color=SW)
ax2.text(19.3, R[19], de(R[19]), ha='left', va='center', fontsize=8.5, color=SW, fontweight='bold')
achse(ax2); ax2.set_xticks(x); ax2.set_xticklabels(lab); ax2.set_xlim(-.9, 20.4); ax2.set_ylim(min(R) - 200, max(R) + 300)
ax2.text(-.85, max(R) + 280, 'Rückstand Verbund', fontsize=9, color=GRAUD, va='top')
dateien.append(speichern(fig, 'Vorschlag_3_Delta_nach_Sparte.png'))

# ------------------------------------------------------------------ 4 Eine Zeile je Sparte, oben Gesamt
GES_E, GES_A = GRAUD, '#B9BFC6'
fig = plt.figure(figsize=(16, 10))
rahmen(fig, 4, 'Eine Zeile je Sparte, darüber Gesamt: Eingänge oben, Abgänge unten, Delta auf der Achse',
       'Verbund · 20 Werktage · Wert der Eingänge über der Säule, der Abgänge darunter, Delta als Box auf der Nulllinie; rechts die Summen der Periode',
       umbruch('Jede Sparte hat ihr eigenes Band – nichts ist gestapelt, jede Säule beginnt an der Nulllinie. Oben die Gesamtzeile '
               '(Summe der Sparten) für den Gesamteindruck, darunter je Sparte der Verlauf. Die Sparten teilen eine Skala, Leben ist '
               'sichtbar kleiner, so wie es ist. Jede Zahl steht direkt an ihrer Säule, das Delta in der Box auf der Achse '
               '(grün = Abbau, gelb = Aufbau).'),
       umbruch('Vier kleine Säulendiagramme untereinander (je zwei Reihen: Eingänge positiv, Abgänge negativ), Etiketten '
               '„außerhalb Ende“. Delta als unsichtbare Reihe bei 0 mit Etikett aus der Zelle (Box grün/gelb, weiße Kontur). '
               'Summenblock rechts als Formelzellen. Sparten-Chips blenden Zeilen aus.'))
zeilen4 = [('Gesamt', ES, AS, GES_E, GES_A)] + [(s, E[s], A[s], FARBE[s], HELL[s]) for s in SPARTEN]
m_sp = max(max(max(E[s]), max(A[s])) for s in SPARTEN) * 1.2
m_ge = max(max(ES), max(AS)) * 1.2
hoehe, schritt, oben = .17, .197, .655
for k, (nm, e, a, fe, fa) in enumerate(zeilen4):
    y0 = oben - k * schritt
    ax = fig.add_axes([.085, y0, .58, hoehe])
    ax.bar(x, e, color=fe, width=.62, **LUECKE)
    ax.bar(x, [-v for v in a], color=fa, width=.62, **LUECKE)
    ax.axhline(0, color=GRAUD, lw=.8)
    m = m_ge if nm == 'Gesamt' else m_sp
    for i in x:
        ax.text(i, e[i] + m * .03, str(e[i]), ha='center', va='bottom', fontsize=7, color=SW)
        ax.text(i, -a[i] - m * .03, str(a[i]), ha='center', va='top', fontsize=7, color=SW)
        dlt = e[i] - a[i]
        farbe, grund = (ABBAU, '#DDF3E4') if dlt < 0 else (AUFBAU, '#FBEFC7')
        ax.text(i, 0, de(dlt, True), ha='center', va='center', fontsize=6.6, color=farbe, fontweight='bold', zorder=5,
                bbox=dict(boxstyle='round,pad=.28,rounding_size=.55', fc=grund, ec='white', lw=1.6))
    achse(ax); ax.set_ylim(-m, m); ax.set_xlim(-.6, 19.6); ax.set_xticks(x)
    ax.set_xticklabels(lab if k == len(zeilen4) - 1 else [])
    if k < len(zeilen4) - 1:
        ax.spines['bottom'].set_visible(False)
    fig.add_artist(Rectangle((.012, y0 + .02), .004, hoehe - .04, transform=fig.transFigure, color=fe))
    fig.text(.022, y0 + hoehe * .72, nm, fontsize=10.5, fontweight='bold', color=SW)
    fig.text(.022, y0 + hoehe * .44, 'Eingänge ▲', fontsize=8, color=GRAU)
    fig.text(.022, y0 + hoehe * .24, 'Abgänge ▼', fontsize=8, color=GRAU)
    if nm == 'Gesamt':
        fig.text(.022, y0 + hoehe * .04, 'eigene Skala', fontsize=7.5, color=GRAUM, style='italic')
        fig.add_artist(plt.Line2D([.012, .757], [y0 - .014, y0 - .014], transform=fig.transFigure, color=GRAUL, lw=.8))
    se, sa = sum(e), sum(a)
    for j, (tt, v, fett, farbe) in enumerate((('Eingänge', de(se), False, SW), ('Abgänge', de(sa), False, SW),
                                              ('Delta', de(se - sa, True), True, ABBAU if se < sa else AUFBAU))):
        yy = y0 + hoehe * .78 - j * .032
        fig.text(.675, yy, tt, fontsize=8.5, color=GRAU, va='center')
        fig.text(.757, yy, v, fontsize=9.5, color=farbe, va='center', ha='right', fontweight='bold' if fett or nm == 'Gesamt' else 'normal')
fig.text(.675, .852, 'Σ 20 Tage', fontsize=9, color=GRAUD, fontweight='bold', va='center')
fig.text(.085, .852, 'Säule oben = Eingänge (Wert darüber, volle Farbe) · unten = Abgänge (Wert darunter, hell) · Box = Delta',
         fontsize=8.5, color=GRAU, va='center')
dateien.append(speichern(fig, 'Vorschlag_4_Zeile_je_Sparte.png'))

# ------------------------------------------------------------------ 5 Wochensicht
kws = sorted({t.isocalendar()[1] for t in tage})
EW = {s: [sum(v for t, v in zip(tage, E[s]) if t.isocalendar()[1] == kw) for kw in kws] for s in SPARTEN}
AW = {s: [sum(v for t, v in zip(tage, A[s]) if t.isocalendar()[1] == kw) for kw in kws] for s in SPARTEN}
fig = plt.figure(figsize=(16, 7.2))
rahmen(fig, 5, 'Wochensicht: Eingänge | Abgänge je Kalenderwoche, darunter Delta je Sparte',
       'Verbund · KW 36–39 · Doppelsäule je Woche mit Werten in jedem Segment; Tabelle darunter mit dem Delta je Sparte',
       umbruch('Für viele Stichtage die ruhigste Ansicht: vier Wochen statt 20 Tage, jede Zahl lesbar. Die Tabelle beantwortet, '
               'welche Sparte in welcher Woche ab- oder aufgebaut hat. Als Umschaltung „Tagessicht / Wochensicht“, die es im Cockpit '
               'schon gibt – die Tagessicht nimmt dann Vorschlag 1 oder 2.'),
       umbruch('Wie Vorschlag 2, Kategorien sind Kalenderwochen (SUMMEWENNS über die KW-Spalte der Fakten). Die Delta-Tabelle sind '
               'Formelzellen mit bedingter Formatierung grün/gelb direkt unter dem Diagramm.'))
legende(fig)
ax = fig.add_axes([.045, .36, .7, .45])
top = max(max(sum(EW[s][k] for s in SPARTEN), sum(AW[s][k] for s in SPARTEN)) for k in range(len(kws)))
for k in range(len(kws)):
    for off, quelle in ((-.19, EW), (.19, AW)):
        unten = 0
        for s in SPARTEN:
            v = quelle[s][k]
            ax.bar(k + off, v, bottom=unten, color=FARBE[s], width=.34, **LUECKE)
            seglabel(ax, k + off, unten, v, v, fs=8.5, minh=60); unten += v
        ax.text(k + off, unten + 20, de(unten), ha='center', va='bottom', fontsize=9, color=SW, fontweight='bold')
        ax.text(k + off, -30, 'Eingänge' if off < 0 else 'Abgänge', ha='center', va='top', fontsize=8, color=GRAU)
achse(ax); ax.set_xticks(range(len(kws))); ax.set_xticklabels([f'KW {kw}' for kw in kws], fontsize=9.5, color=SW)
ax.tick_params(axis='x', pad=20); ax.set_ylim(-60, top * 1.12); ax.set_xlim(-.6, len(kws) - .4)
tab = fig.add_axes([.045, .04, .7, .2]); tab.set_axis_off(); tab.set_xlim(-.6, len(kws) - .4); tab.set_ylim(0, 5)
tab.text(-.58, 4.5, 'Delta', fontsize=9, fontweight='bold', color=GRAUD, va='center')
for r, s in enumerate(SPARTEN + ['Gesamt']):
    yy = 3.6 - r * .95
    if s in FARBE:
        tab.add_patch(Rectangle((-.58, yy - .22), .03, .44, color=FARBE[s]))
    tab.text(-.52, yy, s, fontsize=9, color=SW, va='center', fontweight='bold' if s == 'Gesamt' else 'normal')
    for k in range(len(kws)):
        v = (sum(EW[q][k] - AW[q][k] for q in SPARTEN) if s == 'Gesamt' else EW[s][k] - AW[s][k])
        badge(tab, k, yy, v, fs=8.5)
    tab.plot([-.58, len(kws) - .45], [yy - .47, yy - .47], color=GRAUXL, lw=.8)
dateien.append(speichern(fig, 'Vorschlag_5_Wochensicht.png'))

# ------------------------------------------------------------------ Übersicht (alle fünf verkleinert)
from PIL import Image  # noqa: E402
ims = [Image.open(p) for p in dateien]
w, h = ims[0].size
s = .5
tw, th = int(w * s), int(h * s)
ges = Image.new('RGB', (tw * 2 + 30, th * 3 + 40), 'white')
for i, im in enumerate(ims):
    ges.paste(im.resize((tw, th)), ((i % 2) * (tw + 30), (i // 2) * (th + 20)))
ges.save(os.path.join(OUT, 'Uebersicht_5_Vorschlaege.png'))
print('\n'.join(dateien))
