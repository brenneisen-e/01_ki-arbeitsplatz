# -*- coding: utf-8 -*-
"""Die neun Bildschirme der achten Fassung.

Jede Station ist hier ein Python-String, damit die wiederkehrenden Bausteine
(Agentenspur, Haken-Zeile, Schienensymbole) nur einmal geschrieben werden.
Das Ergebnis wird mit Kopf und Fuss der v07-Seite zu stationen_v08.html
zusammengesetzt — dasselbe Designsystem, dieselbe Ablauf-Engine.
"""

RAIL = '''  <div class="rail">
    <i class="an"><svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg></i>
    <i><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg></i>
    <i><svg viewBox="0 0 24 24"><path d="M4 19V5m0 14h16M8 15V9m4 6V6m4 9v-4"/></svg></i>
    <i><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h5"/></svg></i>
    <i><svg viewBox="0 0 24 24"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/></svg></i>
    <i><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 3v3m0 12v3M3 12h3m12 0h3"/></svg></i>
  </div>
'''

# Die Bildmarke der Deutschen Bank, oben rechts auf jedem Bildschirm — die
# Datei kommt von logo.dev (db_logo.png, blaues Zeichen auf weissem Quadrat),
# nicht nachgezeichnet. Die Seiten werden ueber file:// aufgenommen, deshalb
# liegt das Bild neben ihnen und wird relativ eingebunden.
LOGO = '<img class="marke-db" src="db_logo.png" alt="Deutsche Bank">'

# Das Designsystem kommt aus der v07-Seite und bleibt dort, wie es ist. Die
# v08 setzt darauf die Primaerfarben der Deutschen Bank: Deep Blue 30|42|120,
# Dark Blue 22|24|78, Mid Blue 0|105|177, Bright Blue 52|166|220, Light Blue
# 205|235|246, Ice Blue 236|244|252, Grey 237|241|247. Der Grund bleibt
# schwarz; Karten und Raender bekommen nur einen Hauch Dark Blue. Das
# Bernstein bleibt, weil es etwas bedeutet (wartet, Muster gefunden) — die
# Bankpalette hat dafuer keinen Ton. Alles Gruene und alle warmen Toene der
# hellen Karte werden ersetzt; die Tabelle wird beim Zusammensetzen auf Kopf
# UND Inhalt angewandt, damit nichts durchrutscht.
DB_FARBEN = [
    # Grundtoene
    ('#171c22', '#141a2b'), ('#232a32', '#242b48'), ('#e9edf1', '#ecf4fc'),
    ('#8a95a1', '#93a3bb'), ('#c4ccd4', '#c3cde0'), ('#1d242c', '#1b2238'),
    ('#262d36', '#252c4a'), ('#2a323b', '#2a3150'), ('#4b5a68', '#4a5878'),
    ('#171c21', '#16184e'),
    # s3 (08:15) stand in Bernstein — als einziger Bildschirm ohne Bankblau
    # sah er aus, als haette ihn die Palette nicht erreicht. Jetzt Bright Blue
    # wie alle; Bernstein bleibt den "wartet"-Chips vorbehalten.
    ('section[data-station="s3"] { --gruen: #d29a3c; --gruen-weich: rgba(210, 154, 60, 0.16); }',
     'section[data-station="s3"] { --gruen: #34a6dc; --gruen-weich: rgba(52, 166, 220, 0.16); }'),
    # Akzent: Gruen -> Bright Blue
    ('#34a06a', '#34a6dc'), ('rgba(52, 160, 106, ', 'rgba(52, 166, 220, '),
    ('#8fd6ac', '#9fd3ef'), ('#2b7a52', '#0069b1'),
    # Stationsakzente: Blau, Violett, Tuerkis, Orange -> Bright / Light Blue
    ('#5b8def', '#cdebf6'), ('rgba(91, 141, 239, 0.16)', 'rgba(205, 235, 246, 0.16)'),
    ('#8b7ce8', '#34a6dc'), ('rgba(139, 124, 232, 0.16)', 'rgba(52, 166, 220, 0.16)'),
    ('#45b8c8', '#34a6dc'), ('rgba(69, 184, 200, 0.15)', 'rgba(52, 166, 220, 0.15)'),
    ('#2fa397', '#34a6dc'), ('rgba(47, 163, 151, 0.15)', 'rgba(52, 166, 220, 0.15)'),
    ('#e08a4c', '#cdebf6'), ('rgba(224, 138, 76, 0.16)', 'rgba(205, 235, 246, 0.16)'),
    # Die helle Karte: Creme -> Grey / Ice Blue, Schrift in Dark Blue
    ('#f2efe8', '#edf1f7'), ('#e3ddcf', '#d3dbe8'), ('#1d2227', '#16184e'),
    ('#444c55', '#3d4666'), ('#ddd5c4', '#d3dbe8'), ('#8b8677', '#6f7a95'),
    ('#e0d9c9', '#d3dbe8'), ('#c9c2b2', '#b9c4d6'), ('#e2dccd', '#d9e1ec'),
    ('#b9b0a0', '#9aa7bd'), ('#7d7healed', '#7f8aa3'),
]

LOGO_CSS = '''  /* Die Bildmarke sitzt auf der Buehne, nicht in der Sicht: die Sichten
     blenden ueber, die Marke bleibt stehen. */
  .marke-db { position: absolute; top: 34px; right: 40px; width: 46px; height: 46px; z-index: 5;
    border-radius: 9px; object-fit: contain; }
</style>'''


def db_farben(html):
    for alt, neu in DB_FARBEN:
        html = html.replace(alt, neu)
    return html


HAKEN = '<svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 7"/></svg>'
# Derselbe Haken auf heller Karte — dort traegt das Element keine Klasse.
HELL = ('<svg viewBox="0 0 24 24" style="width:19px;height:19px;stroke:#2b7a52;'
        'fill:none;stroke-width:2.6;flex:none"><path d="M4 12.5l5 5L20 7"/></svg>')


def agent(von, bis, text, fertig, schritte, zeile=None):
    """Die Agentenspur unten in einer Karte: Spinner, Schritte, Fortschritt."""
    z = f' data-zeile="{zeile}"' if zeile else ''
    ss = ''.join(f'<div class="schritt">{HAKEN}{s}</div>' for s in schritte)
    return (
        f'<div class="agent" data-von="{von}" data-bis="{bis}"{z}>'
        '<div class="lauf"><svg class="spinner" viewBox="0 0 42 42">'
        '<circle class="bahn" cx="21" cy="21" r="17"/><circle class="arc" cx="21" cy="21" r="17"/>'
        f'</svg><b data-text="{text}" data-fertig="{fertig}">{text}</b></div>'
        f'<div class="schritte">{ss}</div>'
        '<div class="fortschritt"><i></i></div></div>'
    )


def zeile(text, rechts, ein='0.9', gruppe='h', farbe='var(--gruen)'):
    """Erledigt-Zeile mit Haken links und Zeitstempel rechts."""
    return (
        f'<div data-ein="{ein}" data-gruppe="{gruppe}" style="display:flex;align-items:center;'
        'gap:12px;padding:14px 0;border-top:1px solid var(--rand);font-size:21px">'
        f'<span style="color:{farbe};display:flex">{HAKEN}</span>'
        f'<span style="flex:1">{text}</span>'
        f'<span style="color:var(--leise);font-size:18px">{rechts}</span></div>'
    )


def kachel(titel, zahl, kurve, suffix='', praefix='', farbe='#34a06a', von='0.2', bis='1.4'):
    d = ('M2 40 L28 34 L54 37 L80 25 L106 29 L132 18 L158 22 L184 12 L210 16 L238 8'
         if kurve == 'auf' else
         'M2 26 L28 29 L54 22 L80 32 L106 24 L132 34 L158 27 L184 37 L210 30 L238 38')
    return (
        f'<div class="karte kachel"><h2>{titel}</h2>'
        f'<em data-zahl="{zahl}" data-suffix="{suffix}" data-praefix="{praefix}">0</em>'
        '<svg viewBox="0 0 240 52" preserveAspectRatio="none">'
        f'<path data-kurve data-von="{von}" data-bis="{bis}" fill="none" stroke="{farbe}" '
        f'stroke-width="2.6" d="{d}"/></svg></div>'
    )


def sektion(sid, inhalt):
    return (f'<section data-station="{sid}">{RAIL}<div class="buehne">{LOGO}'
            f'<div class="sicht">{inhalt}</div></div></section>\n')


def kopf(h1, span):
    return f'<div class="kopf"><h1>{h1}</h1><span>{span}</span></div>'


# ─── 08:00 · Prevention overview ─────────────────────────────────────────────
# Review: „128 patterns" wirkte zu gross, und 128 - 96 - 3 liess 29 Muster
# ungeklaert. Es sind jetzt genau sieben, und die Tabelle zeigt alle sieben:
# vier geloest, drei eskaliert. Die Zahl am Handy und die Zahl hier sind
# dieselbe Zahl.
PATTERN = [
    ('Garnishment exemption underpaid', 'Dependants read from case file, not population register', 58, 'ESCALATED'),
    ('Recurring fee dispute', 'Fee applied after account closure', 94, 'RESOLVED'),
    ('Failed direct debit', 'Insufficient funds at collection', 91, 'RESOLVED'),
    ('Duplicate charge', 'Retry logic triggered twice', 87, 'RESOLVED'),
    ('Standing order rejected', 'Mandate expired at counterparty', 89, 'RESOLVED'),
    ('Fee reversal delayed', 'Batch cut-off missed twice', 61, 'ESCALATED'),
    ('Address change loop', 'Conflicting records in two systems', 54, 'ESCALATED'),
]

zeilen = ''
for name, ursache, konf, status in PATTERN:
    warn = ' warn' if status == 'ESCALATED' else ''
    zeilen += (
        f'<tr data-ein="0.85" data-gruppe="l"><td>{name}</td>'
        f'<td class="leise">{ursache}</td>'
        f'<td><div class="balken{warn}"><i data-w="{konf}" data-von="1.1"></i></div></td>'
        f'<td><span class="chip{warn}">{status}</span></td></tr>'
    )

S1 = sektion('s1',
    kopf('Prevention overview', 'Complaints Management &middot; overnight')
    + '<div class="reihe kpi" style="--n:4">'
    + kachel('CASES RESOLVED OVERNIGHT', 370, 'auf')
    + kachel('PATTERNS DETECTED', 7, 'auf')
    + kachel('RESOLVED AT ROOT CAUSE', 4, 'auf')
    + kachel('NEEDS YOUR JUDGEMENT', 3, 'ab', farbe='#d29a3c')
    + '</div>'
    + '<div class="reihe zwei">'
    + '<div class="karte"><h2>ALL SEVEN PATTERNS OF THE NIGHT</h2>'
    + '<table><tr><th>PATTERN</th><th>ROOT CAUSE</th><th>CONFIDENCE</th><th>STATUS</th></tr>'
    + zeilen + '</table></div>'
    + '<div class="karte"><h2>ASSISTANT</h2>'
    + '<p class="text">Seven patterns detected. Four I resolved at the root cause overnight; '
    + '370 cases closed without you.</p>'
    + '<p class="text">Three fell below the confidence threshold. They are the three your '
    + 'briefing named at 07:00 — first in line is the garnishment exemption pattern.</p>'
    + '<p class="text">Contact avoidance for the resolved four: <b>98.6 %</b>.</p>'
    + agent('2.0', '4.3', 'Preparing the three for review', 'Ready for your review',
            ['Grouping affected cases', 'Checking fairness and cost to serve',
             'Drafting the 09:00 briefing'], zeile='tr[data-ein]')
    + '</div></div>')


# ─── 08:05 · Remedy approval ─────────────────────────────────────────────────
# Review: statt EINES Falls mit 2.450 EUR jetzt der ganze Stapel. Je Fall
# 2 bis 25 EUR, unten die Summe gegen das eingeplante Tagesbudget. Die neun
# gezeigten Kunden sind dieselben neun, die 08:10 auf den Kacheln erscheinen.
REMEDY = [
    ('Daniel R.', 'Service fee charged after account model change', 'Fee refunded + cinema voucher', '18 EUR'),
    ('Aylin K.', 'Direct debit failed three times in a row', 'Return fees waived', '25 EUR'),
    ('Marek P.', 'Card charged twice on the same purchase', 'Duplicate reversed + goodwill credit', '12 EUR'),
    ('Sofia L.', 'Standing order rejected, rent paid late', 'Apology credit, no late fee', '25 EUR'),
    ('Jonas W.', 'Overdraft interest caused by a delayed bank process', 'Interest reversed', '9 EUR'),
    ('Nadia B.', 'Statement fee on a closed savings account', 'Free private banking consultation', 'in kind'),
    ('Tomas H.', 'Not served &mdash; arrived just after the branch closed', 'Fuel voucher for the wasted drive', 'in kind'),
    ('Elif D.', 'Transfer delayed over a weekend', 'Value date corrected', '2 EUR'),
    ('Bernd S.', 'Notification not delivered before the charge', 'Charge reversed', '14 EUR'),
]

remedy_zeilen = ''
for name, was, vorschlag, betrag in REMEDY:
    remedy_zeilen += (
        f'<tr data-ein="0.7" data-gruppe="r"><td>{name}</td>'
        f'<td class="leise">{was}</td>'
        f'<td>{vorschlag}</td>'
        f'<td class="rechts">{betrag}</td></tr>'
    )

S2 = sektion('s2',
    kopf('Remedies awaiting approval',
         '370 customers &middot; prepared overnight by agent')
    + '<div class="reihe zwei">'
    + '<div class="karte"><h2>NINE OF 370 &mdash; ONE LINE PER CUSTOMER</h2>'
    + '<table style="table-layout:fixed">'
    + '<colgroup><col style="width:150px"><col><col style="width:330px">'
    + '<col style="width:110px"></colgroup>'
    + '<tr><th>CUSTOMER</th><th>WHAT HAPPENED</th><th>AGENT PROPOSAL</th>'
    + '<th style="text-align:right">GESTURE</th></tr>'
    + remedy_zeilen + '</table></div>'
    + '<div class="karte">'
    + '<h2>PRICED PER CUSTOMER</h2>'
    + '<div class="werte" style="margin-top:6px">'
    + '<div data-ein="1.0" data-gruppe="w"><b>RELATIONSHIP VALUE</b><em>Weighted per customer</em></div>'
    + '<div data-ein="1.0" data-gruppe="w"><b>PREVIOUS SERVICE EXPERIENCE</b><em>Weighted per customer</em></div>'
    + '<div data-ein="1.0" data-gruppe="w"><b>FAIRNESS CHECK</b><em>370 of 370 passed</em></div>'
    + '<div data-ein="1.0" data-gruppe="w"><b>RANGE PER CASE</b><em>2 to 25 EUR &middot; two in kind</em></div>'
    + '</div>'
    + '<h2 style="margin-top:auto;padding-top:24px">AGAINST TODAY&rsquo;S GOODWILL BUDGET</h2>'
    + '<div class="balken" style="width:100%;margin-top:12px;height:14px">'
    + '<i data-w="82" data-von="1.6"></i></div>'
    + '<div style="display:flex;justify-content:space-between;margin-top:10px;'
    + 'font-size:19px;color:var(--leise)"><span>2,450 EUR proposed</span>'
    + '<span>3,000 EUR planned for today</span></div>'
    + '<div class="geste"><u>TOTAL FOR ALL 370 CUSTOMERS</u>'
    + '<strong data-zahl="2450" data-suffix=" EUR" data-von="1.2" data-bis="2.4">0</strong>'
    + '<span class="warten" data-von="3.2">Waiting for your approval</span></div>'
    + '</div></div>')


# ─── 08:15 · Escalated pattern 1 of 3 ────────────────────────────────────────
# Review: der Bildschirm soll eines der eskalierten Muster zeigen und das
# Briefing fuer 09:00 vorbereiten — nicht einen fremden Behoerdenfall.
S3 = sektion('s3',
    kopf('Escalated pattern 1 of 3',
         'Garnishment exemption underpaid &middot; held back for your judgement')
    + '<div class="reihe zwei">'
    + '<div class="karte"><h2>PATTERN</h2>'
    + '<div style="display:flex;gap:44px;margin-top:14px;font-size:22px">'
    + '<div><b style="display:block;font-size:15px;letter-spacing:.08em;color:var(--leise)">'
    + 'CASES AFFECTED</b>34</div>'
    + '<div><b style="display:block;font-size:15px;letter-spacing:.08em;color:var(--leise)">'
    + 'CONFIDENCE</b>58 %</div>'
    + '<div><b style="display:block;font-size:15px;letter-spacing:.08em;color:var(--leise)">'
    + 'FIRST SEEN</b>11 days ago</div></div>'
    + '<div class="balken warn" style="width:100%;margin-top:16px">'
    + '<i data-w="58" data-von="0.5"></i></div>'
    + '<p class="text">Exemptions came out too low because dependants were taken from the case '
    + 'file. The population register holds a newer record for 34 debtors.</p>'
    + '<h2 style="margin-top:22px">EVIDENCE ASSEMBLED &mdash; NOTHING SEARCHED FOR</h2>'
    + zeile('Affected garnishment cases', '06:41', gruppe='h')
    + zeile('Exemption calculations replayed', '06:44', gruppe='h')
    + zeile('Legal basis &sect; 850c ZPO', '06:47', gruppe='h')
    + zeile('Comparable prior decisions', '06:52', gruppe='h')
    + zeile('Data-sharing constraints', '06:55', gruppe='h')
    + '</div>'
    + '<div class="karte"><h2>WHAT THE AGENT DOES NOT KNOW</h2>'
    + '<p class="text" data-ein="1.4" data-gruppe="d">Whether the register lookup is permitted '
    + 'for cases already served &mdash; policy is silent.</p>'
    + '<p class="text" data-ein="1.4" data-gruppe="d">Whether corrections should be applied '
    + 'retroactively to the 34 cases, or only going forward.</p>'
    + '<p class="text" data-ein="1.4" data-gruppe="d">Both questions are decisions, not lookups. '
    + 'That is why this pattern is on your screen and not in the resolved four.</p>'
    + agent('2.2', '4.4', 'Preparing the 09:00 briefing',
            'Briefing ready &mdash; team meeting 09:00',
            ['Ranking the three escalated patterns', 'Drafting the decision options',
             'Inviting the agent roles concerned'])
    + '</div></div>')


# ─── 09:00 · Daily operating review (Wandanzeige) ────────────────────────────
# Review: der geflaggte Agent kam auf keinem Bildschirm vor. Thema ist jetzt
# das Muster von 08:15, daneben die Kapazitaet der sechs Agentenrollen.
FLOTTE = [
    ('Garnishment processor', 96, 1284, 'HEALTHY'),
    ('Complaint preventer', 94, 1846, 'HEALTHY'),
    ('Remedy pricer', 93, 370, 'HEALTHY'),
    ('Evidence assembler', 91, 742, 'HEALTHY'),
    ('Exemption calculator', 58, 934, 'ON THE AGENDA'),
    ('Regulatory responder', 92, 310, 'HEALTHY'),
]
flotte_zeilen = ''
for name, kal, faelle, status in FLOTTE:
    warn = ' warn' if status != 'HEALTHY' else ''
    flotte_zeilen += (
        f'<tr data-ein="0.9" data-gruppe="f"><td>{name}</td>'
        f'<td class="rechts" style="padding-right:18px">{faelle:,}</td>'
        f'<td><div class="balken{warn}"><i data-w="{kal}" data-von="1.2"></i></div></td>'
        f'<td><span class="chip{warn}">{status}</span></td></tr>'
    )

S4 = sektion('s4',
    # Abstand nach oben: der Hypothesen-Verlauf der Buehne dimmt die
    # obersten Prozent des Bildes.
    # Verdichtete Tabellenzeilen: sechs Rollen muessen unter die zwei
    # Karten passen, ohne unter die Bildschirmkante zu laufen.
    '<style>section[data-station="s4"] td, section[data-station="s4"] th'
    '{padding-top:8px;padding-bottom:8px}</style>'
    + '<div style="height:60px"></div>'
    + kopf('Daily operating review',
         'Topic: garnishment exemption pattern &middot; 370 cases handled overnight')
    + '<div class="reihe" style="grid-template-columns:1fr 1fr">'

    # 1 — worum es geht
    + '<div class="karte"><h2>THE PATTERN SHE BRINGS IN &mdash; HELD BACK AT 08:15</h2>'
    + '<div style="display:flex;gap:34px;margin-top:10px;align-items:baseline">'
    + '<em class="kachel" style="font-size:74px;font-weight:700" data-zahl="34">0</em>'
    + '<div style="color:var(--leise);font-size:21px">garnishment cases with an '
    + 'under-calculated exemption</div></div>'
    + '<p class="text">Root cause: dependants read from the case file. The population register '
    + 'holds a newer record for all 34.</p>'
    + '<div class="posten" style="margin-top:14px">'
    + '<div data-ein="0.7" data-gruppe="a"><span>Exemption as calculated</span>'
    + '<span>660 EUR attachable</span></div>'
    + '<div data-ein="0.7" data-gruppe="a"><span>Exemption with the register</span>'
    + '<span>130 EUR attachable</span></div>'
    + '<div data-ein="0.7" data-gruppe="a"><span>Difference per case</span>'
    + '<span>530 EUR too much</span></div>'
    + '</div>'
    + '</div>'

    # 2 — was das Team entscheidet
    + '<div class="karte"><h2>WHAT THIS ROOM DECIDES</h2>'
    + zeile('Who owns the fix', 'Exemption calculator', ein='0.8', gruppe='d')
    + zeile('Retroactive or forward only', 'open &mdash; 11:15', ein='0.8', gruppe='d',
            farbe='var(--bernstein)')
    + zeile('Register lookup permitted', 'open &mdash; 11:15', ein='0.8', gruppe='d',
            farbe='var(--bernstein)')
    + '<h2 style="margin-top:22px">CAPACITY OF THE FLEET</h2>'
    + '<div class="paar" style="margin-top:8px">'
    + '<div data-ein="1.2" data-gruppe="k">'
    + '<span>Today<span style="display:block;font-size:16px;color:var(--leise)">'
    + '78 % of the fleet, 5 % human</span></span><div class="stapel">'
    + '<i class="mensch" data-w="5" data-von="1.4"></i>'
    + '<i class="agent" data-w="78" data-von="1.5"></i></div></div>'
    + '<div data-ein="1.2" data-gruppe="k">'
    + '<span>After the fix<span style="display:block;font-size:16px;color:var(--leise)">'
    + '52 % of the fleet, 5 % human</span></span><div class="stapel">'
    + '<i class="mensch" data-w="5" data-von="1.4"></i>'
    + '<i class="agent" data-w="52" data-von="1.5"></i></div></div>'
    + '</div>'
    + '<p class="text" style="margin-top:auto">Freed capacity becomes two new agent roles &mdash; '
    + 'reviewed at 16:00.</p>'
    + '</div>'

    # 3 — die Rollen der Einheit
    + '<div class="karte" style="grid-column:1/-1"><h2>AGENT ROLES OF THIS UNIT</h2>'
    + '<table style="table-layout:fixed"><colgroup><col><col style="width:120px">'
    + '<col style="width:170px"><col style="width:170px"></colgroup>'
    + '<tr><th>ROLE</th><th style="text-align:right;padding-right:18px">OVERNIGHT</th>'
    + '<th>CALIBRATION</th><th>STATUS</th></tr>'
    + flotte_zeilen + '</table>'
    + '</div></div>')


# ─── 10:30 · Execution trace ─────────────────────────────────────────────────
# Review: die Szene braucht einen Link nach vorn und nach hinten. Sie prueft
# jetzt genau den Weg, den ein Agent fuer das Muster von 08:15 gefunden hat —
# und der Weg wird als Logikfassung 4.3 vorgeschlagen.
SPUR = [
    ('09:02', 'Case opened', '00:15'),
    ('09:04', 'Claim received', '00:12'),
    ('09:11', 'Debtor search', '01:35'),
    ('09:14', 'Employment verified', '00:08'),
    ('09:18', 'Population register queried &mdash; not in the documented flow', '00:09'),
    ('09:22', 'Exemption recalculated', '00:06'),
    ('09:29', 'Order sent to employer', '00:07'),
    ('10:05', 'Acknowledgement received', '00:04'),
]
spur_zeilen = ''.join(
    f'<div data-ein="0.7" data-gruppe="s"><span>{t}</span><span>{w}</span><span>{d}</span></div>'
    for t, w, d in SPUR)

S5 = sektion('s5',
    kopf('The route the agent found',
         'Garnishment GARN-2026-0157 &middot; on the phone: T. Brandt, Second Line')
    + '<div class="reihe zwei">'
    + '<div class="karte"><h2>ROUTE &mdash; ASSEMBLED AT RUN TIME</h2>'
    + '<svg class="route" viewBox="0 0 720 170">'
    + '<path class="kante" data-kurve data-von="0.3" data-bis="0.9" d="M78 46 L188 46"/>'
    + '<path class="kante" data-kurve data-von="0.7" data-bis="1.3" d="M252 46 L360 46"/>'
    + '<path class="kante" data-kurve data-von="1.1" data-bis="1.7" d="M390 64 C390 92 96 88 78 108"/>'
    + '<path class="kante" data-kurve data-von="1.5" data-bis="2.1" d="M78 118 L188 118"/>'
    + '<path class="kante" data-kurve data-von="1.9" data-bis="2.5" d="M252 118 L528 118"/>'
    + '<g class="knoten" data-ein="0.2"><circle cx="60" cy="46" r="15"/><text x="34" y="24">Claim</text></g>'
    + '<g class="knoten" data-ein="0.5"><circle cx="220" cy="46" r="15"/><text x="176" y="24">Debtor search</text></g>'
    + '<g class="knoten" data-ein="0.9"><circle cx="390" cy="46" r="15" style="stroke:#d29a3c"/>'
    + '<text x="330" y="24">Register lookup</text></g>'
    + '<g class="knoten" data-ein="1.3"><circle cx="60" cy="118" r="15"/><text x="30" y="152">Exemption</text></g>'
    + '<g class="knoten" data-ein="1.7"><circle cx="220" cy="118" r="15"/><text x="184" y="152">Order</text></g>'
    + '<g class="knoten" data-ein="2.1"><circle cx="560" cy="118" r="15"/><text x="500" y="152">Acknowledged</text></g>'
    + '</svg>'
    + '<div class="spur">' + spur_zeilen + '</div></div>'
    + '<div class="karte"><h2>EXEMPTION &mdash; BEFORE AND AFTER THE LOOKUP</h2>'
    + '<div class="posten" style="margin-top:6px">'
    + '<div data-ein="1.1" data-gruppe="e"><span>Monthly net income</span><span>3,450 EUR</span></div>'
    + '<div data-ein="1.1" data-gruppe="e"><span>Basic personal allowance</span><span>&minus; 1,410 EUR</span></div>'
    + '<div data-ein="1.1" data-gruppe="e" style="color:var(--leise);text-decoration:line-through">'
    + '<span>Dependants, case file (2)</span><span>&minus; 1,060 EUR</span></div>'
    + '<div data-ein="1.1" data-gruppe="e" style="color:#8fd6ac">'
    + '<span>Dependants, register (3)</span><span>&minus; 1,590 EUR</span></div>'
    + '<div data-ein="1.1" data-gruppe="e"><span>Work-related costs</span><span>&minus; 320 EUR</span></div>'
    + '</div>'
    + '<div class="geste"><u>ATTACHABLE AMOUNT &mdash; CORRECTED</u>'
    + '<strong data-zahl="130" data-suffix=" EUR" data-von="1.4" data-bis="2.6">0</strong>'
    + '<span style="display:block;font-size:19px;color:var(--leise);margin-top:6px">'
    + 'was 660 EUR under the documented flow</span></div>'
    + '<p class="text" data-ein="2.2" style="margin-top:14px">On the call: '
    + '<b>T. Brandt, Second Line</b> &mdash; he joins you at the shared desk at 11:15.</p>'
    + agent('2.6', '4.6', 'Comparing with the documented process',
            'Two deviations, both compliant &mdash; propose as logic v4.3',
            ['Replaying the documented path', 'Matching against the actual steps',
             'Checking guardrails'])
    + '</div></div>')


# ─── 11:15 · Three lines of defense, in real time ────────────────────────────
# Review + Transkript: die Kontrollszene rutscht VOR die Zertifizierung. Sie
# laeuft mit, waehrend Mara die Garnishment-Logik anpasst.
KONTROLLEN = [
    ('2nd line &middot; Risk', 'Maximum garnishment rate', 'Within appetite', True),
    ('2nd line &middot; Risk', 'Protected minimum income', 'Raised &mdash; passes', True),
    ('2nd line &middot; Compliance', '&sect; 850c ZPO exemption table', 'Conforms', True),
    ('2nd line &middot; Conduct', 'Retroactive correction of 34 cases', 'Needs your decision', False),
    ('3rd line &middot; Audit', 'Register lookup logged and traceable', 'Evidence complete', True),
    ('3rd line &middot; Audit', 'Rollback path to v4.2', 'Available', True),
]
kontroll_zeilen = ''
for linie, regel, urteil, ok in KONTROLLEN:
    farbe = 'var(--gruen)' if ok else 'var(--bernstein)'
    kontroll_zeilen += (
        f'<div data-ein="0.9" data-gruppe="c" style="display:flex;align-items:center;gap:12px;'
        'padding:13px 0;border-top:1px solid var(--rand);font-size:20px">'
        f'<span style="color:{farbe};display:flex">{HAKEN}</span>'
        f'<span style="flex:1">{regel}<span style="display:block;font-size:16px;'
        f'color:var(--leise);letter-spacing:.04em">{linie}</span></span>'
        f'<span style="color:{farbe};font-size:18px">{urteil}</span></div>'
    )

S6 = sektion('s6',
    kopf('Garnishment logic &mdash; being edited',
         'Second and third line checking live &middot; no handover, no queue')
    + '<div class="reihe zwei">'
    + '<div class="karte"><h2>YOUR EDIT IN PROGRESS</h2>'
    + '<div class="regeln" style="margin-top:12px">'
    + '<div data-ein="0.6" data-gruppe="r">1. Do not garnish if debt is under 150 EUR</div>'
    + '<div data-ein="0.6" data-gruppe="r">2. Maximum garnishment is 30% of disposable income</div>'
    + '<div data-ein="0.6" data-gruppe="r">3. Always protect 1,000 EUR of disposable income</div>'
    + '<div class="weg" data-ein="0.6" data-gruppe="r">4. Retrieve dependants from the case file</div>'
    + '<div class="neu" data-ein="0.6" data-gruppe="r">4. Retrieve dependants from the population register</div>'
    + '<div data-ein="0.6" data-gruppe="r">5. Apply standard priority order of debts</div>'
    + '<div class="neu" data-ein="0.6" data-gruppe="r">6. Round final amount to the nearest euro</div>'
    + '</div>'
    + '<p class="text">This is the route from 10:30, written as a rule. Every keystroke is being '
    + 'tested while you type.</p>'
    + '<div class="ring">'
    + '<svg viewBox="0 0 120 120"><circle class="bahn" cx="60" cy="60" r="50"/>'
    + '<circle class="wert" cx="60" cy="60" r="50" data-kurve data-von="0.5" data-bis="2.4"/></svg>'
    + '<b><span style="font-size:34px;color:var(--gruen)" data-zahl="5" data-suffix=" / 6">0</span>'
    + 'controls cleared as you type<span>one is a decision, not a check</span></b></div>'
    + '</div>'
    + '<div class="karte"><h2>SECOND AND THIRD LINE &mdash; LIVE</h2>'
    + kontroll_zeilen
    + agent('2.8', '4.8', 'Testing the draft against policy',
            'Five cleared &mdash; one needs your decision',
            ['Reading risk appetite', 'Replaying 34 affected cases',
             'Writing the control evidence'])
    + '</div></div>')


# ─── 14:00 · Certification ───────────────────────────────────────────────────
# Review + Transkript: die Zertifizierung steht jetzt HINTER der Kontrolle.
# Sie traegt die Befunde von 11:15 als Anlage.
S7 = sektion('s7',
    kopf('Garnishment decision logic',
         '<span class="versionspille">v4.2 in force</span> &nbsp;&rarr;&nbsp; '
         '<span class="versionspille">v4.3 ready to certify</span>')
    + '<div class="reihe zwei">'
    + '<div class="karte"><h2>WHAT CHANGES WITH VERSION 4.3</h2>'
    + '<div class="regeln" style="margin-top:12px">'
    + '<div data-ein="0.7" data-gruppe="r">1. Do not garnish if debt is under 150 EUR</div>'
    + '<div data-ein="0.7" data-gruppe="r">2. Maximum garnishment is 30% of disposable income</div>'
    + '<div data-ein="0.7" data-gruppe="r">3. Always protect 1,000 EUR of disposable income</div>'
    + '<div class="weg" data-ein="0.7" data-gruppe="r">4. Retrieve dependants from the case file</div>'
    + '<div class="neu" data-ein="0.7" data-gruppe="r">4. Retrieve dependants from the population register</div>'
    + '<div data-ein="0.7" data-gruppe="r">5. Apply standard priority order of debts</div>'
    + '<div class="neu" data-ein="0.7" data-gruppe="r">6. Round final amount to the nearest euro</div>'
    + '</div>'
    + '<p class="text">One rule changed. It governs every garnishment order every agent in the '
    + 'fleet will process from the moment you certify.</p>'
    + '<h2 style="margin-top:auto;padding-top:22px">WHAT THE ONE RULE DOES TO THE 34 CASES</h2>'
    + '<div class="posten" style="margin-top:4px">'
    + '<div data-ein="1.5" data-gruppe="w"><span>Attachable amount under v4.2</span>'
    + '<span>660 EUR</span></div>'
    + '<div data-ein="1.5" data-gruppe="w"><span>Attachable amount under v4.3</span>'
    + '<span style="color:#8fd6ac">130 EUR</span></div>'
    + '<div data-ein="1.5" data-gruppe="w"><span>Returned to the 34 debtors</span>'
    + '<span>18,020 EUR</span></div>'
    + '</div>'
    + '</div>'
    + '<div class="karte"><h2>WHAT YOU ARE CERTIFYING</h2>'
    + zeile('Unit tests 128 / 128', 'Passed', ein='0.9', gruppe='t')
    + zeile('Regression tests 96 / 96', 'Passed', ein='0.9', gruppe='t')
    + zeile('Policy scenarios 24 / 24', 'Passed', ein='0.9', gruppe='t')
    + zeile('Real-time control evidence from 11:15', 'Attached', ein='0.9', gruppe='t')
    + zeile('Retroactive correction of 34 cases', 'Approved by you', ein='0.9', gruppe='t')
    + zeile('Rollback to v4.2', 'One click', ein='0.9', gruppe='t')
    + '<div class="geste"><u>DECISIONS PER YEAR UNDER THIS LOGIC</u>'
    + '<strong data-zahl="184000" data-von="1.4" data-bis="2.8">0</strong>'
    + '<span style="display:block;font-size:19px;color:var(--leise);margin-top:6px">'
    + 'none of them individually signed &mdash; 0.4 s each instead of 20 min</span>'
    + '<span class="warten" data-von="3.4">Waiting for your certification</span></div>'
    + '</div></div>')


# ─── 15:30 · Authority request ───────────────────────────────────────────────
# Review: als Upload/Chat wie in einer Claude-Arbeitsumgebung, mit
# Verifikation der Behoerde, Meilensteinen und der Freigabekette. Aus dem
# Transkript: der Kanal ist heute noch der Brief, morgen die Schnittstelle.
S8 = sektion('s8',
    kopf('Regulatory agent',
         'Tax authority request &middot; arrived by post, scanned 14:52')
    + '<div class="reihe zwei">'
    + '<div class="karte licht"><h2>REQUEST &mdash; VERIFIED</h2>'
    + '<div style="display:flex;gap:16px;align-items:flex-start;margin-top:14px">'
    + '<div style="width:120px;height:160px;flex:none;background:#fff;border:1px solid #ddd5c4;'
    + 'border-radius:6px;padding:10px 9px;font-size:7px;line-height:1.5;color:#7d7healed">'
    + '<div style="height:9px;width:56%;background:#c9c2b2;margin-bottom:7px"></div>'
    + '<div style="height:4px;width:88%;background:#e2dccd;margin-bottom:4px"></div>'
    + '<div style="height:4px;width:80%;background:#e2dccd;margin-bottom:4px"></div>'
    + '<div style="height:4px;width:90%;background:#e2dccd;margin-bottom:4px"></div>'
    + '<div style="height:4px;width:62%;background:#e2dccd;margin-bottom:12px"></div>'
    + '<div style="height:4px;width:84%;background:#e2dccd;margin-bottom:4px"></div>'
    + '<div style="height:4px;width:76%;background:#e2dccd;margin-bottom:4px"></div>'
    + '<div style="height:4px;width:88%;background:#e2dccd;margin-bottom:22px"></div>'
    + '<div style="height:22px;width:52px;border:1.5px solid #b9b0a0;border-radius:50%;'
    + 'transform:rotate(-8deg)"></div></div>'
    + '<div style="flex:1;font-size:19px;line-height:1.6;color:#444c55">'
    + '<div style="font-size:22px;color:#1d2227;font-weight:700">Finanzamt Frankfurt am Main III</div>'
    + '<div style="margin-top:6px">Letter of 21 August 2026 &middot; ref. 045/2026/StA-7712</div>'
    + '<div style="margin-top:14px;display:flex;align-items:center;gap:9px;color:#2b7a52;'
    + 'font-weight:700">' + HELL + 'Sender authenticated</div>'
    + '<div style="margin-top:7px;display:flex;align-items:center;gap:9px;color:#2b7a52;'
    + 'font-weight:700">' + HELL + 'Legitimate interest established</div>'
    + '<div style="margin-top:12px;font-size:17px;color:#8b8677">Same route applies to the '
    + 'verified digital channel &mdash; letter today, interface tomorrow.</div>'
    + '</div></div>'
    + '<div class="chat" style="margin-top:20px">'
    + '<div class="blase a" data-ein="0.8" data-gruppe="c"><b>REGULATORY AGENT</b>'
    + 'I read the letter. They want account data for 11 named holders, 24 months, '
    + 'including closed accounts. Legal basis checks out &mdash; Directive 2011/16/EU, '
    + '&sect; 93 AO.</div>'
    + '<div class="blase a" data-ein="0.8" data-gruppe="c"><b>REGULATORY AGENT</b>'
    + 'Two questions before I draft: do we disclose the two accounts held jointly with '
    + 'non-named persons, and do we include the flagged account under investigation?</div>'
    + '<div class="blase b" data-ein="0.8" data-gruppe="c"><b>MARA</b>'
    + 'Joint accounts yes, with the co-holder redacted. Leave the flagged one out and say '
    + 'why.</div>'
    + '<div class="blase a" data-ein="0.8" data-gruppe="c"><b>REGULATORY AGENT</b>'
    + 'Understood. Drafting now &mdash; ready for your review at 17:30.</div>'
    + '</div></div>'
    + '<div class="karte"><h2>WHAT THE AGENT WILL DO, AND BY WHEN</h2>'
    + zeile('Scope confirmed with the authority', '15:10', ein='0.9', gruppe='m')
    + zeile('Records selected across four systems', '15:25', ein='0.9', gruppe='m')
    + zeile('Draft ready for your review', 'today 17:30', ein='0.9', gruppe='m',
            farbe='var(--bernstein)')
    + zeile('Submission to the authority', '27 Aug, 3 days early', ein='0.9', gruppe='m',
            farbe='var(--bernstein)')
    + '<h2 style="margin-top:24px">WHO HAS TO SIGN &mdash; DERIVED BY THE AGENT</h2>'
    + '<div class="posten" style="margin-top:4px">'
    + '<div data-ein="1.3" data-gruppe="a"><span>J. Kramer &middot; Finance Controlling</span>'
    + '<span style="color:var(--gruen)">confirmed 3 h ago</span></div>'
    + '<div data-ein="1.3" data-gruppe="a"><span>A. Waldmann &middot; Legal</span>'
    + '<span style="color:var(--gruen)">confirmed 1 h ago</span></div>'
    + '<div data-ein="1.3" data-gruppe="a"><span>S. Ott &middot; Data Protection</span>'
    + '<span style="color:var(--gruen)">confirmed 40 min ago</span></div>'
    + '<div data-ein="1.3" data-gruppe="a"><span>Mara V. &middot; Operations</span>'
    + '<span style="color:var(--bernstein)">with you now</span></div>'
    + '</div>'
    + agent('2.6', '4.8', 'Working the request', 'Two questions for you, then I draft',
            ['Reading the scanned letter', 'Deriving the approval chain',
             'Collecting sign-off in parallel'])
    + '</div></div>')


# ─── 16:00 · Workforce portfolio ─────────────────────────────────────────────
# Review: die Charts waren informationsarm. Jetzt Auslastung je Agentenrolle,
# zwei Agenten ohne Arbeit, und die KPIs aus den Vorszenen.
LAST = [
    ('Garnishment processor', 88, '1,284 cases', False),
    ('Complaint preventer', 74, '1,846 cases', False),
    ('Evidence assembler', 66, '742 packs', False),
    ('Regulatory responder', 41, '310 requests', False),
    ('Remedy pricer', 0, 'no open work since 08:10', True),
    ('Duplicate-charge detector', 0, 'root cause closed at 08:00', True),
]
last_zeilen = ''
for name, w, hinweis, leer in LAST:
    farbe = 'warn' if leer else ''
    stil = 'background:var(--bernstein)' if leer else ''
    last_zeilen += (
        f'<div data-ein="1.0" data-gruppe="k">'
        f'<span>{name}<span style="display:block;font-size:16px;color:var(--leise)">'
        f'{w} % utilised &middot; {hinweis}</span></span>'
        f'<div class="stapel"><i class="agent" data-w="{max(w, 2)}" data-von="1.3" '
        f'style="{stil}"></i></div></div>'
    )

S9 = sektion('s9',
    kopf('Workforce portfolio', 'Two specialists, 120 agent instances &middot; today')
    + '<div class="reihe kpi" style="--n:4">'
    + kachel('AGENT INSTANCES', 120, 'auf', farbe='#e08a4c')
    + kachel('WITH NO OPEN WORK', 2, 'ab', farbe='#d29a3c')
    + kachel('PATTERNS CLOSED TODAY', 4, 'auf', farbe='#e08a4c')
    + kachel('CONTACT AVOIDANCE', 98, 'auf', suffix='.6 %', farbe='#e08a4c')
    + '</div>'
    + '<div class="reihe zwei">'
    + '<div class="karte"><h2>UTILISATION BY AGENT ROLE</h2>'
    + '<div class="paar">' + last_zeilen + '</div>'
    + '<h2 style="margin-top:auto;padding-top:24px">THE DAY IN THREE NUMBERS</h2>'
    + '<div class="posten" style="margin-top:4px">'
    + '<div data-ein="1.6" data-gruppe="n"><span>Patterns detected / resolved / judged</span>'
    + '<span>7 / 4 / 3</span></div>'
    + '<div data-ein="1.6" data-gruppe="n"><span>Cases resolved overnight</span>'
    + '<span>370</span></div>'
    + '<div data-ein="1.6" data-gruppe="n"><span>Customers made whole</span>'
    + '<span>370 &middot; 2,450 EUR</span></div>'
    + '</div></div>'
    + '<div class="karte"><h2>WHAT TO DO WITH THE IDLE TWO</h2>'
    + '<p class="text">Two agent roles ran out of work today &mdash; not because demand fell, '
    + 'but because this morning’s fixes removed the cause.</p>'
    + '<div class="posten" style="margin-top:6px">'
    + '<div data-ein="1.4" data-gruppe="i"><span>Remedy pricer</span>'
    + '<span>retask to exemption review</span></div>'
    + '<div data-ein="1.4" data-gruppe="i"><span>Duplicate-charge detector</span>'
    + '<span>retire, keep the monitor</span></div>'
    + '</div>'
    + agent('2.8', '4.8', 'Rebalancing the fleet', 'Two proposals for tomorrow',
            ['Reading utilisation over seven days', 'Matching skills to open demand',
             'Costing the retirement'])
    + '</div></div>')


SEKTIONEN = S1 + S2 + S3 + S4 + S5 + S6 + S7 + S8 + S9

if __name__ == '__main__':
    # Kopf (Designsystem + Ablauf-Engine) und Fuss (Stationswahl) kommen aus
    # der v07-Seite. Die v08 legt darauf die Bankpalette (DB_FARBEN) und die
    # Bildmarke — die v07-Seite selbst bleibt unveraendert.
    import os
    hier = os.path.dirname(os.path.abspath(__file__))
    v07 = open(os.path.join(hier, 'stationen.html')).read()
    kopf_html = v07[:v07.index('<section data-station="s1">')]
    fuss_html = v07[v07.index('<script>\n  // Welche Station gezeigt wird'):]
    kopf_html = kopf_html.replace(
        '<title>Banking Operations 2030 — Bildschirme</title>',
        '<title>Banking Operations 2030 — Bildschirme (v08)</title>')
    # Erst die Farben, dann das Logo-CSS: die Ersetzung darf die neuen
    # Werte nicht noch einmal anfassen.
    kopf_html = db_farben(kopf_html).replace('</style>', LOGO_CSS, 1)
    open(os.path.join(hier, 'stationen_v08.html'), 'w').write(
        kopf_html + db_farben(SEKTIONEN) + fuss_html)
    print('stationen_v08.html geschrieben')
