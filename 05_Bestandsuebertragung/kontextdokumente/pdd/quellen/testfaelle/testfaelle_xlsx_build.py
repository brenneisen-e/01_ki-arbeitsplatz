# -*- coding: utf-8 -*-
"""Excel-Arbeitsmappe Testfallkatalog Pruef-Bot (Aufruf aus pdd/quellen/testfaelle/)."""
import math
import xlsxwriter
import katalog as K

OUT = '../../20260928_Testfaelle_Pruef-Bot.xlsx'
ROT, ROTL, TEAL, TEALD, TEALL, GRAUL, GRAUD, WEISS = '#BF1528', '#F6D9DC', '#0F94A7', '#0B6F7D', '#E6F4F6', '#F2F2F2', '#4A4A4A', '#FFFFFF'
F = 'Arial'

wb = xlsxwriter.Workbook(OUT)
wb.set_properties({'title': 'Testfallkatalog Prüf-Bot Vorprüfung BÜ', 'author': 'Eike Brenneisen', 'subject': K.GRUNDLAGE})
fm = lambda **k: wb.add_format({'font_name': F, 'font_size': 9, 'valign': 'top', 'text_wrap': True, **k})  # noqa: E731
f_kopf = fm(bold=True, font_color=WEISS, bg_color=ROT, border=1, border_color='#D9D9D9', valign='vcenter')
f_kopf2 = fm(bold=True, font_color=WEISS, bg_color=TEALD, border=1, border_color='#D9D9D9', valign='vcenter')
f_zelle = fm(border=1, border_color='#D9D9D9')
f_id = fm(border=1, border_color='#D9D9D9', bold=True)
f_grau = fm(border=1, border_color='#D9D9D9', bg_color=GRAUL)
f_eingabe = fm(border=1, border_color='#BFBFBF', bg_color='#FFF8DC')
f_datum = fm(border=1, border_color='#BFBFBF', bg_color='#FFF8DC', num_format='dd.mm.yyyy')
f_titel = wb.add_format({'font_name': F, 'font_size': 16, 'bold': True, 'font_color': ROT})
f_unter = wb.add_format({'font_name': F, 'font_size': 10, 'font_color': GRAUD, 'text_wrap': True, 'valign': 'top'})
f_abschnitt = wb.add_format({'font_name': F, 'font_size': 11, 'bold': True, 'font_color': TEALD})
f_zahl = fm(border=1, border_color='#D9D9D9', align='center', valign='vcenter')
f_zahl_fett = fm(border=1, border_color='#D9D9D9', align='center', valign='vcenter', bold=True, bg_color=GRAUL)
f_text_fett = fm(border=1, border_color='#D9D9D9', bold=True, bg_color=GRAUL, valign='vcenter')
f_prozent = fm(border=1, border_color='#D9D9D9', align='center', valign='vcenter', num_format='0%')

GNAME = {g: '%s – %s' % (g, n) for g, n, _ in K.GRUPPEN}


def zeilenhoehe(werte, breiten, pt=12.0, min_h=15):
    zeilen = 1
    for w, b in zip(werte, breiten):
        if w is None:
            continue
        cpl = max(8, int(b * 1.18))
        n = sum(max(1, math.ceil(len(p) / cpl)) for p in str(w).split('\n'))
        zeilen = max(zeilen, n)
    return min(409, max(min_h, zeilen * pt + 5))


def nummeriert(liste):
    return '\n'.join('%d. %s' % (i + 1, x) for i, x in enumerate(liste))


f_rot = fm(border=1, border_color='#D9D9D9', bold=True, font_color=ROT)
f_rich_rot = wb.add_format({'font_name': F, 'font_size': 9, 'bold': True, 'font_color': ROT})
f_rich_std = wb.add_format({'font_name': F, 'font_size': 9})
f_label = fm(bold=True, font_color=WEISS, bg_color=TEALD, border=1, border_color='#D9D9D9')
f_gross = wb.add_format({'font_name': F, 'font_size': 22, 'bold': True, 'font_color': ROT, 'align': 'left', 'valign': 'vcenter'})
f_gross_t = wb.add_format({'font_name': F, 'font_size': 22, 'bold': True, 'font_color': TEALD, 'align': 'left', 'valign': 'vcenter'})
f_kpi_t = wb.add_format({'font_name': F, 'font_size': 9, 'bold': True, 'text_wrap': True, 'valign': 'top'})
f_matrix = fm(border=1, border_color='#D9D9D9', align='center', valign='vcenter')
f_matrix_k = fm(border=1, border_color='#D9D9D9', bold=True, bg_color=GRAUL, align='center', valign='vcenter')

KAP_STATUS = {'ok': 'ohne Befund', 'pn': 'Prüfnotiz', 'be': 'Befund', 'aus': 'nicht durchlaufen'}


def kid(x):
    return x.replace('TF-', '')


def vorliegen_vertrag(t):
    out = []
    for v in t['vnr'].split('+'):
        vv = K.VERTRAG[v]
        if not K.relevanz(t)['vertrag']:
            out.append('beliebige gültige %s-VNR (z. B. %s) – der Bot endet vor dem ersten Hostzugriff' % ('KV' if vv[2] == 'KV' else 'Komposit', v))
            continue
        out.append('%s (%s, Kunde %s, %s): %s\n%s\nBereitstellung: %s' % (v, 'KV' if vv[2] == 'KV' else 'Komposit/Leben', vv[3], 'Pflicht' if vv[1] else 'optional',
                                                                           vv[4], '\n'.join('• ' + y for y in vv[5]), vv[6]))
    return '\n\n'.join(out)


def vorliegen_agentur(t):
    if t['agentur'] == 'keine':
        return 'keine – Absender ohne EMMA-Treffer (P-04); im Weg B ist A-01 die Ausgangsagentur'
    a = K.AGENTUR[t['agentur']]
    if not K.relevanz(t)['agentur_host']:
        return '%s %s\nEMMA: %s – nur dieser Eintrag zählt, ein Testeintrag genügt\nHost: gleichgültig, Kapitel III wird nicht erreicht' % (a[0], a[2], a[4])
    return '%s %s (%s)\nHost:\n%s\nEMMA: %s' % (a[0], a[2], 'Pflicht' if a[1] else 'optional', '\n'.join('• ' + y for y in a[3]), a[4])


def vorliegen_mail(t):
    mids = [m for m in t['mail'].replace('+', ' ').split() if m in K.MAIL]
    if not mids:
        return 'keine Mail – Vorgang direkt im Startpostkorb eröffnen'
    out = []
    for m in mids:
        mm = K.MAIL[m]
        out.append('%s %s\nAbsender: %s\nBetreff: %s\nText: %s\nAnhang: %s\nVollmacht bzw. Betreuungswunsch muss enthalten:\n%s'
                   % (m, mm[1], mm[2], mm[3], mm[4], mm[5], '\n'.join('– ' + x for x in mm[6])))
    if t.get('mail_extra'):
        out.append('Besonderheit: ' + t['mail_extra'])
    return '\n\n'.join(out)


def weg_b_text(t):
    teile = []
    if t['weg_b'] or t['weg'].startswith('B'):
        teile.append('Weg B: ' + (t['weg_b'] or 'Standardmail; im Datensatz setzen: ' + '; '.join('%s = %s' % (f, w) for _, f, w, h in t['dp_soll'] if h)))
    if t['hinweis']:
        teile.append('Hinweis: ' + t['hinweis'])
    return '\n'.join(teile)


def dp_abweichend(t):
    x = ['%s = %s' % (f, w) for _, f, w, h in t['dp_soll'] if h]
    return '\n'.join(x) if x else 'keine – alle Felder wie Standard'


def dp_rich(t):
    """Rich-String-Fragmente: abweichende Felder rot und fett."""
    frag = []
    for i, (_, f, w, h) in enumerate(t['dp_soll']):
        z = '%s = %s' % (f, w) + ('\n' if i < len(t['dp_soll']) - 1 else '')
        frag += [f_rich_rot if h else f_rich_std, z]
    return frag


def ablauf_text(t):
    return '\n'.join('%s: %s [%s]' % (k, x, KAP_STATUS[st]) for k, x, st in t['ablauf'])


def schritte_text(t):
    return nummeriert(K.schritte(t))


# ------------------------------------------------------------------ Blaetter
ws_u = wb.add_worksheet('Übersicht')
ws_b = wb.add_worksheet('Testdatenbedarf')
ws = wb.add_worksheet('Testfälle')
ws_o = wb.add_worksheet('Testfallblatt')
ws_d = wb.add_worksheet('Testdaten')
ws_m = wb.add_worksheet('Mail-Vorlagen')
ws_a = wb.add_worksheet('Abdeckung')
ws_k = wb.add_worksheet('Abnahmekriterien')
for w_ in (ws_u, ws_b, ws, ws_o, ws_d, ws_m, ws_a, ws_k):
    w_.hide_gridlines(2)
ws.set_tab_color(ROT); ws_u.set_tab_color(ROT); ws_b.set_tab_color(ROT); ws_o.set_tab_color(TEALD)

# ------------------------------------------------------------------ Testfaelle
SP = [('ID', 10), ('Gruppe', 18), ('Sparte', 8), ('Testfall', 26), ('Ziel / geprüfte Regel', 36), ('PDD-Kapitel', 13), ('Priorität', 8), ('Weg', 9),
      ('Vertrag (VNR)', 11), ('Agentur', 9), ('Mail', 9),
      ('Das muss vorliegen: Vertrag im Host', 52), ('Das muss vorliegen: Agentur (Host und EMMA)', 44), ('Das muss vorliegen: Mail und Vollmacht', 58),
      ('Weg B / Hinweis', 40), ('KI-Deckblatt: abweichende Soll-Werte', 40), ('KI-Deckblatt: alle Soll-Werte (abweichende rot)', 58),
      ('Erwarteter Ablauf je Kapitel', 56), ('Erwartetes Ergebnis', 30), ('Akzeptanzkriterien', 64), ('Testschritte', 64),
      ('Tester', 12), ('Datum', 11), ('Vorgang-Lfd-Nr', 13), ('Ist-Ergebnis', 30), ('Status', 13), ('Bemerkung', 26)]
C_EXEC = 21; C_STATUS = 25
for c, (t, b) in enumerate(SP):
    ws.write(0, c, t, f_kopf2 if c >= C_EXEC else f_kopf)
    ws.set_column(c, c, b)
ws.set_row(0, 32)
ws.freeze_panes(1, 4)
N = len(K.TESTFAELLE)
SPALTEN_TEXT = {}
for r, t in enumerate(K.TESTFAELLE, start=1):
    werte = [t['id'], GNAME[t['gruppe']], t['sparte'], t['titel'], t['ziel_text'], t['kapitel'], t['prio'], t['weg'],
             t['vnr'].replace('+', ', '), t['agentur'], t['mail'], vorliegen_vertrag(t), vorliegen_agentur(t), vorliegen_mail(t), weg_b_text(t),
             dp_abweichend(t), None, ablauf_text(t), t['ergebnis'], nummeriert(t['akzeptanz']), schritte_text(t)]
    SPALTEN_TEXT[t['id']] = werte
    for c, v in enumerate(werte):
        if c == 16:
            ws.write_rich_string(r, c, *dp_rich(t), f_zelle)
        else:
            ws.write(r, c, v, f_id if c in (0, 3) else (f_rot if c == 15 and v and not v.startswith('keine') else f_zelle))
    for c in range(C_EXEC, C_EXEC + 6):
        if c == C_EXEC + 1:
            ws.write_blank(r, c, None, f_datum)
        elif c == C_STATUS:
            ws.write(r, c, 'offen', f_eingabe)
        else:
            ws.write_blank(r, c, None, f_eingabe)
    hw = list(werte); hw[16] = '\n'.join('x' for _ in t['dp_soll'])
    ws.set_row(r, zeilenhoehe(hw, [b for _, b in SP]))
ws.autofilter(0, 0, N, len(SP) - 1)
ws.data_validation(1, C_STATUS, N, C_STATUS, {'validate': 'list', 'source': ['offen', 'in Arbeit', 'bestanden', 'nicht bestanden', 'blockiert', 'entfällt']})
ws.data_validation(1, C_EXEC + 1, N, C_EXEC + 1, {'validate': 'date', 'criteria': 'between', 'minimum': __import__('datetime').date(2026, 1, 1),
                                                  'maximum': __import__('datetime').date(2027, 12, 31), 'input_title': 'Datum', 'input_message': 'Format TT.MM.JJJJ'})
for wert, farbe in [('bestanden', '#D9EAD3'), ('nicht bestanden', ROTL), ('blockiert', '#FCE5CD'), ('in Arbeit', TEALL), ('entfällt', GRAUL)]:
    ws.conditional_format(1, C_STATUS, N, C_STATUS, {'type': 'cell', 'criteria': '==', 'value': '"%s"' % wert, 'format': wb.add_format({'bg_color': farbe})})
ws.conditional_format(1, 6, N, 6, {'type': 'cell', 'criteria': '==', 'value': '"Muss"', 'format': wb.add_format({'bold': True, 'font_color': ROT})})
LETZTE = N + 1
SC = xlsxwriter.utility.xl_col_to_name(C_STATUS)
RNG = lambda col: "'Testfälle'!$%s$2:$%s$%d" % (col, col, LETZTE)  # noqa: E731

# ------------------------------------------------------------------ Testfallblatt (Onepager zum Ausdrucken)
ws_o.set_column(0, 0, 2); ws_o.set_column(1, 1, 30); ws_o.set_column(2, 2, 120)
ws_o.write(0, 1, 'Testfallblatt – ein Testfall auf einer Seite', f_titel)
ws_o.write(1, 1, 'Testfall wählen (Liste in C3); alle Angaben kommen aus dem Blatt „Testfälle“. Druckbereich: eine Seite quer.', f_unter)
ws_o.write(2, 1, 'Testfall-ID', f_label)
ws_o.write(2, 2, K.TESTFAELLE[0]['id'], f_eingabe)
ws_o.data_validation(2, 2, 2, 2, {'validate': 'list', 'source': "='Testfälle'!$A$2:$A$%d" % LETZTE})
ws_o.set_row(2, 20)
FELDER_O = [(3, 'Testfall'), (1, 'Gruppe'), (6, 'Priorität'), (7, 'Weg'), (2, 'Sparte'), (5, 'PDD-Kapitel'), (4, 'Ziel / geprüfte Regel'), (18, 'Erwartetes Ergebnis'),
            (11, 'Das muss vorliegen: Vertrag'), (12, 'Das muss vorliegen: Agentur'), (13, 'Das muss vorliegen: Mail und Vollmacht'), (14, 'Weg B / Hinweis'),
            (15, 'KI-Deckblatt: abweichende Soll-Werte'), (16, 'KI-Deckblatt: alle Soll-Werte'), (17, 'Erwarteter Ablauf je Kapitel'), (19, 'Akzeptanzkriterien'),
            (20, 'Testschritte'), (C_STATUS, 'Status'), (C_EXEC, 'Tester'), (C_EXEC + 2, 'Vorgang-Lfd-Nr'), (C_EXEC + 3, 'Ist-Ergebnis')]
# Zeilenhoehe nach dem laengsten Wert je Feld ueber alle Testfaelle
for i, (c, name) in enumerate(FELDER_O):
    r = 3 + i
    col = xlsxwriter.utility.xl_col_to_name(c)
    ws_o.write(r, 1, name, f_label)
    ws_o.write_formula(r, 2, '=IFERROR(INDEX(\'Testfälle\'!$%s$2:$%s$%d,MATCH($C$3,\'Testfälle\'!$A$2:$A$%d,0))&"","")' % (col, col, LETZTE, LETZTE),
                       f_id if name == 'Testfall' else f_zelle)
    if c < C_EXEC:
        lz = max(sum(max(1, math.ceil(len(p) / 140)) for p in (SPALTEN_TEXT[t['id']][c] if c != 16 else '\n'.join('x' for _ in t['dp_soll'])).split('\n'))
                 if (SPALTEN_TEXT[t['id']][c] if c != 16 else 'x') else 1 for t in K.TESTFAELLE)
        ws_o.set_row(r, min(409, max(15, lz * 12 + 4)))
    else:
        ws_o.set_row(r, 18)
ws_o.set_landscape(); ws_o.fit_to_pages(1, 0); ws_o.set_paper(9); ws_o.print_area(0, 1, 3 + len(FELDER_O), 2)

# ------------------------------------------------------------------ Uebersicht
ws_u.set_column(0, 0, 2)
ws_u.set_column(1, 1, 38)
ws_u.set_column(2, 9, 12)
ws_u.set_column(10, 10, 60)
ws_u.write(0, 1, 'Testfallkatalog Prüf-Bot Vorprüfung Bestandsübertragung', f_titel)
ws_u.write(1, 1, 'Stand %s · Grundlage: %s' % (K.STAND, K.GRUNDLAGE), f_unter)
ws_u.merge_range(2, 1, 2, 10, 'Blatt „Testdatenbedarf“: welche Testagenturen und Verträge ich vorbereiten muss und welche Testfälle sie abdecken. '
                 'Blatt „Testfälle“: je Testfall Vertrag, Agentur, Mail mit Vollmacht, Soll-Werte im KI-Deckblatt, erwarteter Ablauf je Kapitel, '
                 'Akzeptanzkriterien und Testschritte; gelbe Zellen füllt der Tester. Blatt „Testfallblatt“ zeigt einen Testfall als Onepager. '
                 'Die Kennzahlen unten rechnen sich aus dem Status.', f_unter)
ws_u.set_row(2, 44)
ws_u.write(4, 1, 'Stand der Durchführung je Gruppe', f_abschnitt)
kopf = ['Gruppe', 'Testfälle', 'Muss', 'Soll', 'Kann', 'bestanden', 'nicht bestanden', 'offen / in Arbeit', 'Anteil bestanden', 'Worum es geht']
for c, t in enumerate(kopf):
    ws_u.write(5, 1 + c, t, f_kopf)
ws_u.set_row(5, 28)
for i, (g, n, bes) in enumerate(K.GRUPPEN):
    r = 6 + i; x = r + 1
    ws_u.write(r, 1, GNAME[g], f_zelle)
    ws_u.write_formula(r, 2, '=COUNTIF(%s,$B%d)' % (RNG('B'), x), f_zahl)
    for c, p in ((3, 'Muss'), (4, 'Soll'), (5, 'Kann')):
        ws_u.write_formula(r, c, '=COUNTIFS(%s,$B%d,%s,"%s")' % (RNG('B'), x, RNG('G'), p), f_zahl)
    ws_u.write_formula(r, 6, '=COUNTIFS(%s,$B%d,%s,"bestanden")' % (RNG('B'), x, RNG(SC)), f_zahl)
    ws_u.write_formula(r, 7, '=COUNTIFS(%s,$B%d,%s,"nicht bestanden")' % (RNG('B'), x, RNG(SC)), f_zahl)
    ws_u.write_formula(r, 8, '=COUNTIFS(%s,$B%d,%s,"offen")+COUNTIFS(%s,$B%d,%s,"in Arbeit")' % (RNG('B'), x, RNG(SC), RNG('B'), x, RNG(SC)), f_zahl)
    ws_u.write_formula(r, 9, '=IF(C%d=0,0,G%d/C%d)' % (x, x, x), f_prozent)
    ws_u.write(r, 10, bes, f_zelle)
    ws_u.set_row(r, 26)
rs = 6 + len(K.GRUPPEN); xs = rs + 1
ws_u.write(rs, 1, 'Summe', f_text_fett)
for c in range(2, 9):
    col = xlsxwriter.utility.xl_col_to_name(c)
    ws_u.write_formula(rs, c, '=SUM(%s7:%s%d)' % (col, col, rs), f_zahl_fett)
ws_u.write_formula(rs, 9, '=IF(C%d=0,0,G%d/C%d)' % (xs, xs, xs), f_prozent)
ws_u.write_formula(rs, 10, '="Muss bestanden: "&COUNTIFS(%s,"Muss",%s,"bestanden")&" von "&COUNTIF(%s,"Muss")' % (RNG('G'), RNG(SC), RNG('G')), f_text_fett)
r = rs + 2
ws_u.write(r, 1, 'Legende', f_abschnitt)
leg = [('Priorität Muss', 'Nachweis jeder BE, jeder Prüfnotiz und jeder Notizvariante; Voraussetzung für die Abnahme'),
       ('Priorität Soll', 'Varianten und Randfälle; mindestens 90 % bestanden'),
       ('Priorität Kann', 'nur wenn die Testdaten in IMSI vorliegen oder Robotics den Fall herstellen kann'),
       ('Weg A', 'End-to-End: Mail an das Abnahme-Postfach, Celonis extrahiert und füllt das KI-Deckblatt, EMWS eröffnet den Vorgang'),
       ('Weg B', 'Datenmanipulation: Standardvorgang einsteuern und den Datensatz vor der Übergabe an EMWS auf die Soll-Werte setzen (rot markierte Felder)'),
       ('V-01 … V-%02d' % len(K.VERTRAEGE), 'Testverträge (VNR) – Pflicht %s, optional %s; konkrete Nummern im Blatt „Testdaten“ eintragen' % (', '.join(v[0] for v in K.VERTRAEGE if v[1]), ', '.join(v[0] for v in K.VERTRAEGE if not v[1]))),
       ('A-01 … A-11', 'Testagenturen (übernehmender Vermittler) mit EMMA-Eintrag – Pflicht A-01 bis A-06, optional A-07 bis A-10'),
       ('M-01 … M-%02d, P-01 … P-04' % len(K.MAILS), 'Mail-Vorlagen und Absender-Postfächer (Blatt „Mail-Vorlagen“ und „Testdaten“)')]
for i, (k, v) in enumerate(leg):
    ws_u.write(r + 1 + i, 1, k, f_id)
    ws_u.merge_range(r + 1 + i, 2, r + 1 + i, 10, v, f_zelle)
    ws_u.set_row(r + 1 + i, 18)
r = r + 2 + len(leg)
ws_u.write(r, 1, 'Durchführung', f_abschnitt)
for i, (k, v) in enumerate(K.DURCHFUEHRUNG):
    ws_u.write(r + 1 + i, 1, k, f_id)
    ws_u.merge_range(r + 1 + i, 2, r + 1 + i, 10, v, f_zelle)
    ws_u.set_row(r + 1 + i, 26)

r = r + 2 + len(K.DURCHFUEHRUNG)
ws_u.write(r, 1, 'Herleitung: warum %d Testfälle' % N, f_abschnitt)
for c, t in enumerate(['Was die PDD vorgibt', 'Anzahl in der PDD', 'abgedeckt durch', 'Prinzip']):
    if c < 2:
        ws_u.write(r + 1, 1 + c, t, f_kopf)
    elif c == 2:
        ws_u.merge_range(r + 1, 3, r + 1, 9, t, f_kopf)
    else:
        ws_u.write(r + 1, 10, t, f_kopf)
for i, h in enumerate(K.herleitung()):
    rr = r + 2 + i
    ws_u.write(rr, 1, h['name'], f_id); ws_u.write(rr, 2, h['anzahl'], f_zahl)
    ws_u.merge_range(rr, 3, rr, 9, ', '.join(h['testfaelle']), f_zelle); ws_u.write(rr, 10, h['prinzip'], f_zelle)
    ws_u.set_row(rr, zeilenhoehe([h['name'], ', '.join(h['testfaelle']), h['prinzip']], [38, 84, 60]))

# ------------------------------------------------------------------ Testdatenbedarf
B = K.bedarf()
PV = [v for v in K.VERTRAEGE if v[1]]; PA = [a for a in K.AGENTUREN if a[1]]
ws_b.set_column(0, 0, 2); ws_b.set_column(1, 1, 30); ws_b.set_column(2, 2, 34); ws_b.set_column(3, 3, 70); ws_b.set_column(4, 4, 10); ws_b.set_column(5, 20, 7)
ws_b.write(0, 1, 'Testdatenbedarf: meine Testagenturen, ihre Verträge und die Testfälle, die sie abdecken', f_titel)
ws_b.merge_range(1, 1, 1, 12, 'Der Prüf-Bot liest den Host nur und schreibt ausschließlich Telefonnotiz, Bearbeitungshinweis und Weiterleitung. Ein vorbereiteter Vertrag mit '
                 'einer vorbereiteten Agentur trägt deshalb beliebig viele Testfälle; sie unterscheiden sich über Mail und Maklervollmacht (Celonis liest sie '
                 'unterschiedlich aus) oder über den Datensatz vor der Übergabe an EMWS (Weg B). Eigene Testdaten braucht nur, was im Host stehen muss.', f_unter)
ws_b.set_row(1, 44)
kpi = [('Pflichtverträge (VNR)', len(PV), ROT), ('Kunden', len(B['kunden_p']), ROT), ('Pflichtagenturen mit EMMA-Eintrag', len(PA), ROT),
       ('Testfälle auf V-01 + A-01', len([t for t in K.TESTFAELLE if 'V-01' in t['vnr'].split('+') and t['agentur'] == 'A-01']), TEALD),
       ('Testfälle nur über Weg B', len(B['weg_b']), TEALD), ('Muss-Testfälle nur mit Pflichtdaten', sum(t['prio'] == 'Muss' for t in K.TESTFAELLE), TEALD)]
r = 3
for i, (k, v, farbe) in enumerate(kpi):
    rr = r + (i // 3) * 2; cc = 1 + (i % 3)
    ws_b.write(rr, cc, v, f_gross if farbe == ROT else f_gross_t)
    ws_b.write(rr + 1, cc, k, f_kpi_t)
ws_b.set_row(3, 30); ws_b.set_row(5, 30)
ws_b.write(7, 1, 'Hinweis', f_id)
ws_b.merge_range(7, 2, 7, 12, 'Muss-Testfälle vollständig mit Pflichtdaten durchführbar: %s. Optional sind %s und %s; ohne sie fehlen nur Soll- und '
                 'Kann-Fälle. Die Kennzahlen sind aus dem Katalog berechnet (Stand %s).' % ('ja' if B['muss_ok'] else 'nein', ', '.join(v[0] for v in K.VERTRAEGE if not v[1]),
                                                                                       ', '.join(a[0] for a in K.AGENTUREN if not a[1]), K.STAND), f_zelle)
ws_b.set_row(7, 28)

r = 9
ws_b.write(r, 1, 'Meine Testagenturen mit den Verträgen und den Testfällen, die sie abdecken', f_abschnitt)
r += 1
for c, t in enumerate(['Testagentur', 'Vertrag', 'Testfälle (* nur Weg B)', 'Anzahl']):
    ws_b.write(r, 1 + c, t, f_kopf)
ws_b.set_row(r, 22)
r += 1
for a in K.AGENTUREN + [('keine', True, 'ohne Agentur (unbekannter Absender P-04)', '', '')]:
    tfs = [t for t in K.TESTFAELLE if t['agentur'] == a[0]]
    if not tfs:
        continue
    vs = sorted({v for t in tfs for v in t['vnr'].split('+')})
    start = r
    for v in vs:
        vv = K.VERTRAG[v]
        sel = [t for t in tfs if v in t['vnr'].split('+')]
        ids = ', '.join(kid(t['id']) + ('*' if t['weg'].startswith('B') else '') for t in sel)
        ws_b.write(r, 2, '%s  %s (%s, Kunde %s, %s)' % (v, vv[4], 'KV' if vv[2] == 'KV' else 'KL', vv[3], 'Pflicht' if vv[1] else 'optional'), f_zelle)
        ws_b.write(r, 3, ids, f_zelle)
        ws_b.write_formula(r, 4, '=COUNTIFS(%s,"*%s*",%s,"%s")' % (RNG('I'), v, RNG('J'), a[0]), f_zahl)
        ws_b.set_row(r, zeilenhoehe([ids, vv[4] + ' ' * 30], [70, 34]))
        r += 1
    txt = a[0] + '  ' + a[2] + ('' if a[0] == 'keine' else ('  (Pflicht)' if a[1] else '  (optional)'))
    if r - start > 1:
        ws_b.merge_range(start, 1, r - 1, 1, txt, f_id)
    else:
        ws_b.write(start, 1, txt, f_id)

r += 1
ws_b.write(r, 1, 'Matrix Vertrag × Agentur (Anzahl Testfälle, rechnet aus dem Blatt „Testfälle“)', f_abschnitt)
r += 1
ags = [a[0] for a in K.AGENTUREN] + ['keine']
ws_b.write(r, 1, 'Vertrag', f_kopf); ws_b.write(r, 2, 'Bezeichnung', f_kopf)
for j, ag in enumerate(ags):
    ws_b.write(r, 5 + j, ag, f_kopf)
ws_b.write(r, 3, ' ', f_kopf); ws_b.write(r, 4, 'Summe', f_kopf)
r0 = r + 1
for i, v in enumerate(K.VERTRAEGE):
    rr = r0 + i
    ws_b.write(rr, 1, v[0] + ('' if v[1] else ' (optional)'), f_id if v[1] else f_grau)
    ws_b.write(rr, 2, v[4], f_zelle)
    ws_b.write(rr, 3, ' ', f_zelle)
    for j, ag in enumerate(ags):
        ws_b.write_formula(rr, 5 + j, '=COUNTIFS(%s,"*%s*",%s,"%s")' % (RNG('I'), v[0], RNG('J'), ag), f_matrix)
    ws_b.write_formula(rr, 4, '=SUM(%s%d:%s%d)' % ('F', rr + 1, xlsxwriter.utility.xl_col_to_name(4 + len(ags)), rr + 1), f_matrix_k)
ws_b.conditional_format(r0, 5, r0 + len(K.VERTRAEGE) - 1, 4 + len(ags), {'type': 'cell', 'criteria': '>', 'value': 0,
                                                                          'format': wb.add_format({'bg_color': TEALL, 'bold': True})})
ws_b.conditional_format(r0, 5, r0 + len(K.VERTRAEGE) - 1, 4 + len(ags), {'type': 'cell', 'criteria': '==', 'value': 0,
                                                                          'format': wb.add_format({'font_color': '#BFBFBF'})})
r = r0 + len(K.VERTRAEGE) + 1
ws_b.write(r, 1, 'Annahmen (mit Celonis und Robotics zu bestätigen)', f_abschnitt)
for i, x in enumerate(K.ANNAHMEN):
    ws_b.write(r + 1 + i, 1, '%d.' % (i + 1), f_id)
    ws_b.merge_range(r + 1 + i, 2, r + 1 + i, 12, x, f_zelle)
    ws_b.set_row(r + 1 + i, 28)

# ------------------------------------------------------------------ Testdaten
SD = [('ID', 7), ('Pflicht', 9), ('Sparte / Typ', 12), ('Kunde', 8), ('Bezeichnung', 28), ('Anforderung – das muss im Host vorliegen', 70),
      ('EMMA-Abzug bzw. Bereitstellung', 42), ('Anzahl TF', 9), ('Verwendet in', 36),
      ('Konkrete Werte (VNR, KNR, Agentur-Nr., PNR, Adresse)', 40), ('Verantwortlich', 16), ('Bereitgestellt', 12)]
for c, (t, b) in enumerate(SD):
    ws_d.write(0, c, t, f_kopf2 if c >= 9 else f_kopf)
    ws_d.set_column(c, c, b)
ws_d.set_row(0, 30); ws_d.freeze_panes(1, 1)
zeilen = [(v[0], 'Pflicht' if v[1] else 'optional', 'KV' if v[2] == 'KV' else 'Komposit/Leben', v[3], 'Vertrag: ' + v[4], '\n'.join('• ' + y for y in v[5]), v[6]) for v in K.VERTRAEGE] + \
         [(a[0], 'Pflicht' if a[1] else 'optional', 'Agentur', '', 'Agentur: ' + a[2], '\n'.join('• ' + y for y in a[3]), a[4]) for a in K.AGENTUREN] + \
         [(p[0], 'Pflicht', 'Absender', '', 'Absender: ' + p[1], p[2], 'Testpostfach einrichten (Robotics / IT)') for p in K.ABSENDER]
for r, z in enumerate(zeilen, start=1):
    ids = K.verwendet_in(z[0])
    if not ids:
        alt = [t['id'] for t in K.TESTFAELLE if z[0] in (t['weg'] + ' ' + t['weg_b'] + ' ' + t['hinweis'])]
        verw = ('Alternative für ' + ', '.join(alt)) if alt else '–'
    else:
        verw = ', '.join(ids)
    werte = list(z) + [len(ids), verw]
    for c, v in enumerate(werte):
        ws_d.write(r, c, v, f_id if c == 0 else (f_zahl if c == 7 else (f_grau if z[1] == 'optional' else f_zelle)))
    ws_d.write_blank(r, 9, None, f_eingabe); ws_d.write_blank(r, 10, None, f_eingabe); ws_d.write(r, 11, 'nein', f_eingabe)
    ws_d.set_row(r, zeilenhoehe(werte, [b for _, b in SD]))
NZ = len(zeilen)
ws_d.data_validation(1, 11, NZ, 11, {'validate': 'list', 'source': ['nein', 'in Arbeit', 'ja']})
ws_d.conditional_format(1, 11, NZ, 11, {'type': 'cell', 'criteria': '==', 'value': '"ja"', 'format': wb.add_format({'bg_color': '#D9EAD3'})})
ws_d.autofilter(0, 0, NZ, len(SD) - 1)
ws_d.merge_range(NZ + 2, 0, NZ + 2, 8, 'Beispiel für „Konkrete Werte“: V-01 → VNR 12 345 678-9, VN Kundennr. 0012345678 (Person A), mitversicherte Person B Kundennr. 0012345679; '
                 'A-01 → Agentur-Nr. 001234567, PNR 0123456, OB729 makler@beispiel.de. Die echten Werte stammen aus IMSI nach dem PTU-Abzug.', f_unter)
ws_d.set_row(NZ + 2, 30)

# ------------------------------------------------------------------ Mail-Vorlagen
SM = [('ID', 7), ('Zweck', 26), ('Absender', 28), ('Betreff (Muster)', 30), ('Mailtext (Muster)', 58), ('Anhänge', 26),
      ('Anforderungen an Maklervollmacht bzw. Betreuungswunsch', 54), ('Hebel gegenüber Standard', 26), ('Verwendet in', 26)]
for c, (t, b) in enumerate(SM):
    ws_m.write(0, c, t, f_kopf)
    ws_m.set_column(c, c, b)
ws_m.set_row(0, 30); ws_m.freeze_panes(1, 1)
for r, (mid, zweck, abs_, betr, text, anh, anf, hebel) in enumerate(K.MAILS, start=1):
    werte = [mid, zweck, abs_, betr, text, anh, nummeriert(anf), hebel, ', '.join(K.verwendet_in(mid))]
    for c, v in enumerate(werte):
        ws_m.write(r, c, v, f_id if c == 0 else f_zelle)
    ws_m.set_row(r, zeilenhoehe(werte, [b for _, b in SM]))
rr = len(K.MAILS) + 2
ws_m.merge_range(rr, 0, rr, 8, 'Platzhalter in spitzen Klammern durch die Werte aus dem Blatt „Testdaten“ ersetzen. Kundendaten immer auf IMSI-Stand nach dem PTU-Abzug '
                 '(die Produktion ist anonymisiert). Signatur, Vollmachtnehmer und Agenturnummer passend zur gewählten Testagentur setzen, damit Celonis den '
                 'Vermittler im EMMA-Abzug findet.', f_unter)
ws_m.set_row(rr, 30)

# ------------------------------------------------------------------ Abdeckung
SA = [('Art', 14), ('BE-Klassifikation, Prüfnotiz bzw. Merkmal', 52), ('Nachgewiesen durch', 46), ('Anzahl', 9), ('Stand', 16)]
for c, (t, b) in enumerate(SA):
    ws_a.write(0, c, t, f_kopf)
    ws_a.set_column(c, c, b)
ws_a.set_row(0, 24); ws_a.freeze_panes(1, 0)
r = 1
for art, liste in (('BE', K.BE_LISTE), ('Prüfnotiz', K.NOTIZ_LISTE), ('Merkmal', K.MERKMALE)):
    for x in liste:
        ids = [t['id'] for t in K.TESTFAELLE if x in t['deckt']]
        ws_a.write(r, 0, art, f_zelle); ws_a.write(r, 1, x, f_zelle); ws_a.write(r, 2, ', '.join(ids), f_zelle); ws_a.write(r, 3, len(ids), f_zahl)
        arr = '{' + ','.join('"%s"' % i for i in ids) + '}'
        ws_a.write_formula(r, 4, '=IF(SUMPRODUCT(COUNTIFS(%s,%s,%s,"bestanden"))>0,"nachgewiesen","offen")' % (RNG('A'), arr, RNG(SC)), f_zahl)
        ws_a.set_row(r, zeilenhoehe([x, ', '.join(ids)], [52, 46]))
        r += 1
ws_a.conditional_format(1, 4, r - 1, 4, {'type': 'cell', 'criteria': '==', 'value': '"nachgewiesen"', 'format': wb.add_format({'bg_color': '#D9EAD3'})})
ws_a.autofilter(0, 0, r - 1, 4)

# ------------------------------------------------------------------ Abnahmekriterien
ws_k.set_column(0, 0, 2); ws_k.set_column(1, 1, 26); ws_k.set_column(2, 2, 100); ws_k.set_column(3, 3, 34)
ws_k.write(0, 1, 'Abnahmekriterien (Vorschlag, mit Fachbereich und Robotics abzustimmen)', f_titel)
ws_k.write(2, 1, 'Kriterium', f_kopf); ws_k.write(2, 2, 'Anforderung für die Abnahme des Prüf-Bots', f_kopf)
for i, (k, v) in enumerate(K.ABNAHME):
    ws_k.write(3 + i, 1, k, f_id); ws_k.write(3 + i, 2, v, f_zelle); ws_k.set_row(3 + i, 28)
r = 4 + len(K.ABNAHME)
ws_k.write(r, 1, 'Fehlerklassen', f_abschnitt)
ws_k.write(r + 1, 1, 'Klasse', f_kopf); ws_k.write(r + 1, 2, 'Beispiele', f_kopf); ws_k.write(r + 1, 3, 'Wirkung auf die Abnahme', f_kopf)
for i, (k, v, w) in enumerate(K.FEHLERKLASSEN):
    ws_k.write(r + 2 + i, 1, k, f_id); ws_k.write(r + 2 + i, 2, v, f_zelle); ws_k.write(r + 2 + i, 3, w, f_zelle); ws_k.set_row(r + 2 + i, 20)
r = r + 3 + len(K.FEHLERKLASSEN)
ws_k.write(r, 1, 'Durchführung', f_abschnitt)
for i, (k, v) in enumerate(K.DURCHFUEHRUNG):
    ws_k.write(r + 1 + i, 1, k, f_id); ws_k.write(r + 1 + i, 2, v, f_zelle); ws_k.set_row(r + 1 + i, 28)
r = r + 2 + len(K.DURCHFUEHRUNG)
ws_k.write(r, 1, 'Annahmen', f_abschnitt)
for i, x in enumerate(K.ANNAHMEN):
    ws_k.write(r + 1 + i, 1, '%d.' % (i + 1), f_id); ws_k.write(r + 1 + i, 2, x, f_zelle); ws_k.set_row(r + 1 + i, 28)

ws_u.activate()
wb.close()
print('geschrieben:', OUT, '|', N, 'Testfälle')
