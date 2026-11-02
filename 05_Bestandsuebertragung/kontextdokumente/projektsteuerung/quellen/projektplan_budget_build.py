# -*- coding: utf-8 -*-
"""Projektplan Anwesenheiten Makler meets KI (Phase 2) bis Budgetende – Excel mit Formeln.
Grundlage: Angebot Deloitte vom 05.08.2026 (Project Leader 43 PT à 1.669 EUR, Consultant 43 PT à 1.224 EUR),
Rechnung August vom 15.09.2026 (je 14 PT), September laut Timesheet je 22 PT, Abwesenheiten Oktober laut E. Brenneisen."""
import datetime as dt
import xlsxwriter

OUT = '../20260929_Projektplan_Anwesenheit_Budget.xlsx'
ROT, ROTL, TEALD, TEALL, GRAUL, GRAUD, GRUENL = '#BF1528', '#F6D9DC', '#0B6F7D', '#CCEBED', '#F2F2F2', '#4A4A4A', '#D9EAD3'
F = 'Arial'

PERSONEN = [  # Name, Rolle, SL, Tagessatz, PT Angebot, PT August (Rechnung), PT September
    ('Eike Brenneisen', 'Project Leader (Manager)', 4, 1669, 43, 14, 22),
    ('Marco Jeglorz', 'Consultant', 2, 1224, 43, 14, 22),
]
TAGE = [dt.date(2026, 10, d) for d in range(1, 32)]


def status(person, d):
    if d.weekday() >= 5:
        return ''
    if d.day in (2, 9):
        return 'kein Projekttag'
    if person == 0:
        return 'Urlaub' if d.day in (5, 6) else 'Projekt'
    if d.day == 12:
        return 'Urlaub'
    return 'Projekt' if d.day <= 15 else 'Projektende'


wb = xlsxwriter.Workbook(OUT)
wb.set_properties({'title': 'Projektplan Anwesenheit bis Budgetende – Makler meets KI', 'author': 'Eike Brenneisen'})
fm = lambda **k: wb.add_format({'font_name': F, 'font_size': 10, 'valign': 'vcenter', **k})  # noqa: E731
f_titel = fm(font_size=16, bold=True, font_color=ROT)
f_unter = fm(font_color=GRAUD, text_wrap=True, valign='top')
f_kopf = fm(bold=True, font_color='white', bg_color=TEALD, text_wrap=True, border=1, border_color='#D9D9D9', align='center')
f_txt = fm(border=1, border_color='#D9D9D9')
f_fett = fm(border=1, border_color='#D9D9D9', bold=True)
f_zahl = fm(border=1, border_color='#D9D9D9', num_format='#,##0.0', align='center')
f_ein = fm(border=1, border_color='#BFBFBF', num_format='#,##0.0', align='center', bg_color='#FFF8DC')
f_ein_txt = fm(border=1, border_color='#BFBFBF', bg_color='#FFF8DC', align='center')
f_eur = fm(border=1, border_color='#D9D9D9', num_format='#,##0.00 "€"')
f_eur_ein = fm(border=1, border_color='#BFBFBF', num_format='#,##0.00 "€"', bg_color='#FFF8DC')
f_datum = fm(border=1, border_color='#D9D9D9', num_format='dd.mm.yyyy', align='center')
f_datum_f = fm(border=1, border_color='#D9D9D9', num_format='dd.mm.yyyy', align='center', bold=True, font_color=ROT)
f_summe = fm(border=1, border_color='#D9D9D9', num_format='#,##0.0', align='center', bold=True, bg_color=GRAUL)
f_summe_eur = fm(border=1, border_color='#D9D9D9', num_format='#,##0.00 "€"', bold=True, bg_color=GRAUL)
f_summe_txt = fm(border=1, border_color='#D9D9D9', bold=True, bg_color=GRAUL)
f_abschnitt = fm(font_size=11, bold=True, font_color=TEALD)

ws_b = wb.add_worksheet('Budget')
ws_o = wb.add_worksheet('Oktober')
ws_k = wb.add_worksheet('Kalender')
for w in (ws_b, ws_o, ws_k):
    w.hide_gridlines(2)

# ------------------------------------------------------------------ Oktober (Tagesplan)
ws_o.set_column(0, 0, 11); ws_o.set_column(1, 1, 5); ws_o.set_column(2, 2, 9)
ws_o.write(0, 0, 'Anwesenheit Oktober 2026 je Tag', f_titel)
ws_o.write(1, 0, 'Gelbe Zellen = Status je Tag (Auswahlliste). Ein Projekttag zählt nur, solange Budget übrig ist; danach „Budget leer“.', f_unter)
kopf = ['Datum', 'Tag', 'Arbeitstag']
for p in PERSONEN:
    kopf += [p[0].split()[0] + ': Status', 'PT', 'PT kumuliert', 'Anwesenheit']
for c, t in enumerate(kopf):
    ws_o.write(2, c, t, f_kopf)
ws_o.set_row(2, 30)
for i in range(len(PERSONEN)):
    b = 3 + i * 4
    ws_o.set_column(b, b, 15); ws_o.set_column(b + 1, b + 1, 6); ws_o.set_column(b + 2, b + 2, 11); ws_o.set_column(b + 3, b + 3, 15)
# Startzeile: kumuliert 0
ws_o.write(3, 0, 'Start', f_fett)
for i in range(len(PERSONEN)):
    ws_o.write(3, 3 + i * 4 + 2, 0, f_zahl)
WT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
R0 = 4
for r, d in enumerate(TAGE, start=R0):
    x = r + 1
    ws_o.write_datetime(r, 0, dt.datetime(d.year, d.month, d.day), f_datum)
    ws_o.write(r, 1, WT[d.weekday()], f_txt)
    ws_o.write_formula(r, 2, '=IF(WEEKDAY(A%d,2)<=5,"ja","nein")' % x, f_txt)
    for i in range(len(PERSONEN)):
        b = 3 + i * 4
        cs, cp, ck, ca = [xlsxwriter.utility.xl_col_to_name(b + j) for j in range(4)]
        rest = "Budget!$H$%d" % (6 + i)
        ws_o.write(r, b, status(i, d), f_ein_txt)
        ws_o.write_formula(r, b + 1, '=IF(AND($C{x}="ja",{s}{x}="Projekt",{k}{p}<{rest}),1,0)'.format(x=x, s=cs, k=ck, p=x - 1, rest=rest), f_zahl)
        ws_o.write_formula(r, b + 2, '={k}{p}+{pt}{x}'.format(k=ck, p=x - 1, pt=cp, x=x), f_zahl)
        ws_o.write_formula(r, b + 3, '=IF($C{x}<>"ja","",IF({pt}{x}=1,"anwesend",IF({s}{x}="Projekt","Budget leer",{s}{x})))'.format(x=x, pt=cp, s=cs), f_txt)
R1 = R0 + len(TAGE) - 1
for i in range(len(PERSONEN)):
    b = 3 + i * 4
    ws_o.data_validation(R0, b, R1, b, {'validate': 'list', 'source': ['Projekt', 'Urlaub', 'kein Projekttag', 'Projektende', '']})
    ws_o.conditional_format(R0, b + 3, R1, b + 3, {'type': 'cell', 'criteria': '==', 'value': '"anwesend"', 'format': wb.add_format({'bg_color': GRUENL})})
    ws_o.conditional_format(R0, b + 3, R1, b + 3, {'type': 'cell', 'criteria': '==', 'value': '"Budget leer"',
                                                   'format': wb.add_format({'bg_color': ROTL, 'font_color': ROT, 'bold': True})})
ws_o.conditional_format(R0, 0, R1, 2, {'type': 'formula', 'criteria': '=$C%d="nein"' % (R0 + 1), 'format': wb.add_format({'font_color': '#9A9A9A'})})
ws_o.freeze_panes(4, 3)

# ------------------------------------------------------------------ Budget
ws_b.set_column(0, 0, 2); ws_b.set_column(1, 1, 18); ws_b.set_column(2, 2, 22); ws_b.set_column(3, 3, 11)
ws_b.set_column(4, 12, 12); ws_b.set_column(13, 15, 15)
ws_b.write(0, 1, 'Makler meets KI (Phase 2) – Anwesenheit bis Budgetende', f_titel)
ws_b.merge_range(1, 1, 2, 15, 'Grundlage: Angebot Deloitte vom 05.08.2026 (Leistungszeitraum 10.08.–31.10.2026, Time & Material), Rechnung August vom '
                 '15.09.2026, September laut Timesheet. Gelbe Zellen sind Eingaben; der Oktober ergibt sich aus dem Blatt „Oktober“. '
                 'Partnertage (2 × 1 PT) sind rabattiert (0 €) und hier nicht enthalten.', f_unter)
kopf = ['Person', 'Rolle', 'Tagessatz', 'PT Angebot', 'PT August (Rechnung)', 'PT September', 'Rest ab 01.10.', 'PT Oktober (im Budget)',
        'PT Oktober geplant (Status Projekt)', 'Rest Ende Oktober', 'Geplante Tage ohne Budget', 'Letzter Tag im Budget', 'Budget Angebot', 'Verbraucht bis Ende Okt.',
        'Rest Budget']
for c, t in enumerate(kopf):
    ws_b.write(4, 1 + c, t, f_kopf)
ws_b.set_row(4, 45)
for i, (name, rolle, sl, satz, pt, aug, sep) in enumerate(PERSONEN):
    r = 5 + i; x = r + 1
    b = 3 + i * 4
    cs, cp, ck = [xlsxwriter.utility.xl_col_to_name(b + j) for j in range(3)]
    ws_b.write(r, 1, name, f_fett); ws_b.write(r, 2, '%s, SL %d' % (rolle, sl), f_txt)
    ws_b.write_number(r, 3, satz, f_eur_ein); ws_b.write_number(r, 4, pt, f_ein); ws_b.write_number(r, 5, aug, f_ein); ws_b.write_number(r, 6, sep, f_ein)
    ws_b.write_formula(r, 7, '=E%d-F%d-G%d' % (x, x, x), f_zahl)
    ws_b.write_formula(r, 8, "=SUM(Oktober!%s%d:%s%d)" % (cp, R0 + 1, cp, R1 + 1), f_zahl)
    ws_b.write_formula(r, 9, '=COUNTIFS(Oktober!%s%d:%s%d,"Projekt",Oktober!$C$%d:$C$%d,"ja")' % (cs, R0 + 1, cs, R1 + 1, R0 + 1, R1 + 1), f_zahl)
    ws_b.write_formula(r, 10, '=H%d-I%d' % (x, x), f_zahl)
    ws_b.write_formula(r, 11, '=MAX(0,J%d-H%d)' % (x, x), f_zahl)
    ws_b.write_formula(r, 12, '=IF(H{x}<=0,"schon leer",IFERROR(INDEX(Oktober!$A${a}:$A${e},MATCH(H{x},Oktober!{k}{a}:{k}{e},0)),"reicht bis 31.10."))'.format(
        x=x, a=R0 + 1, e=R1 + 1, k=ck), f_datum_f)
    ws_b.write_formula(r, 13, '=D%d*E%d' % (x, x), f_eur)
    ws_b.write_formula(r, 14, '=D%d*(F%d+G%d+I%d)' % (x, x, x, x), f_eur)
    ws_b.write_formula(r, 15, '=N%d-O%d' % (x, x), f_eur)
rs = 5 + len(PERSONEN); xs = rs + 1
ws_b.write(rs, 1, 'Summe', f_summe_txt); ws_b.write(rs, 2, '', f_summe_txt); ws_b.write(rs, 3, '', f_summe_txt)
for c in range(4, 12):
    col = xlsxwriter.utility.xl_col_to_name(c)
    ws_b.write_formula(rs, c, '=SUM(%s6:%s%d)' % (col, col, rs), f_summe)
ws_b.write(rs, 12, '', f_summe_txt)
for c in range(13, 16):
    col = xlsxwriter.utility.xl_col_to_name(c)
    ws_b.write_formula(rs, c, '=SUM(%s6:%s%d)' % (col, col, rs), f_summe_eur)
ws_b.conditional_format(5, 11, rs - 1, 11, {'type': 'cell', 'criteria': '>', 'value': 0, 'format': wb.add_format({'bg_color': ROTL, 'font_color': ROT, 'bold': True})})

r = rs + 2
ws_b.write(r, 1, 'Abwesenheiten und Annahmen', f_abschnitt)
hinweise = ['September: je 22 PT (alle 22 Arbeitstage, laut Timesheet M. Jeglorz) – Eingabe in Spalte G.',
            'E. Brenneisen: Urlaub 05.–06.10.2026.', 'M. Jeglorz: Urlaub 12.10.2026, letzter Projekttag 15.10.2026.',
            'Beide: 02.10. und 09.10.2026 keine Projektarbeit.', 'Oktober 2026 ohne bundeseinheitlichen Feiertag an Werktagen (03.10. ist ein Samstag).',
            'Ein Tag zählt nur, solange Rest-PT vorhanden sind; geplante Projekttage darüber hinaus erscheinen als „Budget leer“ und in Spalte „Geplante Tage ohne Budget“.']
for i, h in enumerate(hinweise):
    ws_b.merge_range(r + 1 + i, 1, r + 1 + i, 15, '• ' + h, f_unter)
ws_b.freeze_panes(5, 2)

# ------------------------------------------------------------------ Kalender (Übersicht je Person und Tag)
ws_k.set_column(0, 0, 18); ws_k.set_column(1, len(TAGE), 3.6)
ws_k.write(0, 0, 'Kalender Oktober 2026', f_titel)
ws_k.write(1, 0, 'A = anwesend · U = Urlaub · – = kein Projekttag · E = Projektende · B = Budget leer', f_unter)
f_kk = fm(bold=True, font_size=8, align='center', text_wrap=True, border=1, border_color='#D9D9D9', bg_color=GRAUL)
f_kz = fm(font_size=9, align='center', border=1, border_color='#D9D9D9')
for c, d in enumerate(TAGE, start=1):
    ws_k.write(2, c, '%s\n%02d.' % (WT[d.weekday()], d.day), f_kk)
ws_k.set_row(2, 28)
for i, p in enumerate(PERSONEN):
    ws_k.write(3 + i, 0, p[0], f_fett)
    ca = xlsxwriter.utility.xl_col_to_name(3 + i * 4 + 3)
    for c, d in enumerate(TAGE, start=1):
        x = R0 + c
        ws_k.write_formula(3 + i, c, '=IF(Oktober!{a}{x}="anwesend","A",IF(Oktober!{a}{x}="Urlaub","U",IF(Oktober!{a}{x}="kein Projekttag","–",'
                           'IF(Oktober!{a}{x}="Projektende","E",IF(Oktober!{a}{x}="Budget leer","B","")))))'.format(a=ca, x=x), f_kz)
    ws_k.set_row(3 + i, 22)
rng = (3, 1, 3 + len(PERSONEN) - 1, len(TAGE))
for wert, farbe, schrift in [('A', GRUENL, '#1A1A1A'), ('B', ROTL, ROT), ('U', TEALL, TEALD), ('–', GRAUL, '#7F7F7F'), ('E', GRAUL, '#7F7F7F')]:
    ws_k.conditional_format(*rng, {'type': 'cell', 'criteria': '==', 'value': '"%s"' % wert, 'format': wb.add_format({'bg_color': farbe, 'font_color': schrift})})
for c, d in enumerate(TAGE, start=1):
    if d.weekday() >= 5:
        ws_k.conditional_format(3, c, 3 + len(PERSONEN) - 1, c, {'type': 'no_errors', 'format': wb.add_format({'bg_color': '#E7E6E6'})})
r = 4 + len(PERSONEN)
for i, p in enumerate(PERSONEN):
    ws_k.write(r + i, 0, p[0].split()[0] + ': letzter Tag im Budget', f_txt)
    ws_k.merge_range(r + i, 1, r + i, 4, '=Budget!M%d' % (6 + i), f_datum_f)
    ws_k.write(r + i, 5, 'ohne Budget:', f_txt)
    ws_k.merge_range(r + i, 6, r + i, 8, '', f_zahl)
    ws_k.write_formula(r + i, 6, '=Budget!L%d' % (6 + i), f_zahl)
ws_k.set_landscape(); ws_k.fit_to_pages(1, 0)

ws_b.activate()
wb.close()
print('geschrieben:', OUT)
