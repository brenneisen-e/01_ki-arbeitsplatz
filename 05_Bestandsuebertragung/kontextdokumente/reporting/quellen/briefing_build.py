# -*- coding: utf-8 -*-
import openpyxl, html
wb = openpyxl.load_workbook('../Reminder-und-Hinweis-Analyse_17.06.-09.09.2026.xlsx', data_only=True)
u, k, s = wb['Übersicht'], wb['KW-Verlauf'], wb['Sparten & Duplikate']
def n(v): return f'{int(round(v)):,}'.replace(',', '.')
def p(v): return f'{v*100:.1f} %'.replace('.', ',')
def d(v): return f'{v:.2f}'.replace('.', ',')
V = {u.cell(row=r, column=1).value: u.cell(row=r, column=2).value for r in range(17, 38)}
KW = [[c.value for c in row] for row in k.iter_rows(min_row=5, max_row=17)]
SP = {row[0].value: [c.value for c in row] for row in s.iter_rows(min_row=5, max_row=10)}
KAN = {u.cell(row=r, column=1).value: [u.cell(row=r, column=c).value for c in range(2, 15)] for r in (41, 42)}
JDC_SP = {u.cell(row=r, column=1).value: [u.cell(row=r, column=c).value for c in range(2, 6)] for r in range(47, 52)}
ART = {u.cell(row=r, column=1).value: u.cell(row=r, column=4).value for r in range(56, 59)}
ABS = [(u.cell(row=r, column=1).value, u.cell(row=r, column=4).value, u.cell(row=r, column=5).value) for r in range(63, 78)]
mails, eri, jdc = V['Mails gesamt im Zeitraum'], V['Erinnerungen gesamt'], V['davon von JDC / Jung DMS']
hinw, erst, vertr = V['Hinweis-Mails (zweite Auswertung)'], V['BÜ-Erstvorgänge (Betreff „Bestandsübertragung“)'], V['Verträge mit Erinnerung']
frueh = [r for r in KW if r[0] in ('2026-KW27','2026-KW28','2026-KW29','2026-KW30','2026-KW31','2026-KW32')]
spaet = [r for r in KW if r[0] in ('2026-KW33','2026-KW34','2026-KW35','2026-KW36')]
avg_f = sum(r[19] for r in frueh)/len(frueh); avg_s = sum(r[19] for r in spaet)/len(spaet)
avg_fj = sum(r[24] for r in frueh)/len(frueh); avg_sj = sum(r[24] for r in spaet)/len(spaet)
kv_jdc = JDC_SP['Kranken'][2]; kv_anteil = JDC_SP['Kranken'][3]
def ref(t): return f'<span class="ref">{t}</span>'
def row(label, val, fund, note=''):
    return f'<tr><td>{label}</td><td class="num">{val}</td><td class="fund">{fund}</td><td class="note">{note}</td></tr>'

H = []
H.append(f'''<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Briefing Reminder- und Hinweis-Analyse</title>
<style>
@page {{ size: A4; margin: 16mm 15mm 16mm 15mm; }}
body {{ font-family: "Liberation Sans", Arial, sans-serif; color: #1F1B1D; font-size: 9.5pt; line-height: 1.38; margin: 0; }}
h1 {{ color: #8B1A2B; font-size: 20pt; margin: 0 0 2px; letter-spacing: -.01em; }}
h2 {{ color: #8B1A2B; font-size: 12.5pt; margin: 13px 0 5px; padding-bottom: 3px; border-bottom: 1.5px solid #8B1A2B; page-break-after: avoid; }}
.sub {{ color: #5E5559; font-size: 10pt; margin-bottom: 10px; }}
.meta {{ font-size: 8.5pt; color: #5E5559; border-left: 3px solid #E3DBD8; padding-left: 8px; margin: 8px 0 12px; }}
.kpis {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 8px 0 4px; }}
.kpi {{ border: 1px solid #E3DBD8; border-top: 3px solid #8B1A2B; padding: 7px 9px 6px; }}
.kpi .v {{ font-size: 17pt; font-weight: bold; color: #1F1B1D; line-height: 1.1; }}
.kpi .l {{ font-size: 8.5pt; color: #5E5559; margin-top: 2px; }}
.kpi .r {{ font-size: 7.5pt; color: #8C8286; margin-top: 3px; font-family: "Liberation Mono", monospace; }}
tr, .kpi, .box, table {{ page-break-inside: avoid; }}
table {{ width: 100%; border-collapse: collapse; margin: 5px 0 3px; font-size: 8.8pt; page-break-inside: auto; }}
th {{ background: #8B1A2B; color: #fff; text-align: left; padding: 5px 7px; font-size: 8.5pt; }}
td {{ padding: 4px 7px; border-bottom: 1px solid #E8E2E0; vertical-align: top; }}
tr:nth-child(even) td {{ background: #FAF7F6; }}
td.num {{ text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }}
td.fund, .ref {{ font-family: "Liberation Mono", monospace; font-size: 8pt; color: #5E5559; white-space: nowrap; }}
td.note {{ color: #5E5559; font-size: 8.5pt; }}
.insight {{ background: #FEF2F2; border-left: 3px solid #8B1A2B; padding: 7px 10px; margin: 8px 0; font-size: 9.5pt; page-break-inside: avoid; }}
.insight b {{ color: #8B1A2B; }}
ul {{ margin: 4px 0 6px 18px; padding: 0; }} li {{ margin-bottom: 3px; }}
.two {{ display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }}
.pb {{ page-break-before: always; }}
</style></head><body>
<h1>Briefing: Reminder- und Hinweis-Analyse</h1>
<div class="sub">Makler BÜ meets KI · Erinnerungen und Hinweis-Mails in den Gruppenpostfächern · 17.06. bis 09.09.2026 (KW25 bis KW37, KW37 nur drei Tage)</div>
<div class="meta">Datenbasis: Archivordner der an KWAD weitergeleiteten Mails in <b>maklerauftraege@ergo.de</b> und <b>bestandsuebertragungen@ergo.de</b>. Die Einzelliste (Blatt „Mails“) enthält nur Erinnerungen und BÜ-Erstvorgänge; die Wochensummen aller Mails stammen aus der Postfachzählung. Alle Zahlen in diesem Briefing sind Formeln in der Arbeitsmappe <i>Reminder-und-Hinweis-Analyse_17.06.-09.09.2026.xlsx</i>; die Fundstelle steht jeweils als Blatt!Zelle daneben.</div>

<h2>1. Auf einen Blick</h2>
<div class="kpis">
<div class="kpi"><div class="v">{n(mails)}</div><div class="l">Mails gesamt im Zeitraum</div><div class="r">Übersicht!B17</div></div>
<div class="kpi"><div class="v">{n(eri)}</div><div class="l">Erinnerungen ({p(eri/mails)} aller Mails)</div><div class="r">Übersicht!B18</div></div>
<div class="kpi"><div class="v">{n(jdc)}</div><div class="l">davon von JDC ({p(V['Anteil JDC-Erinnerungen an allen Erinnerungen'])} der Erinnerungen)</div><div class="r">Übersicht!B21</div></div>
<div class="kpi"><div class="v">{n(hinw)}</div><div class="l">Hinweis-Mails (technischer Fehler, seit KW34)</div><div class="r">Übersicht!B32</div></div>
</div>
<div class="kpis">
<div class="kpi"><div class="v">{n(erst)}</div><div class="l">BÜ-Erstvorgänge nach Betreff</div><div class="r">Übersicht!B33</div></div>
<div class="kpi"><div class="v">{n(ART['Erinnerung BÜ'])}</div><div class="l">Erinnerungen mit BÜ-Betreff (sehen aus wie Erstvorgänge)</div><div class="r">Übersicht!D57</div></div>
<div class="kpi"><div class="v">{n(vertr)}</div><div class="l">Verträge mit Erinnerung, Ø {d(V['Ø Erinnerungen je Vertrag'])} je Vertrag</div><div class="r">Übersicht!B34, B37</div></div>
<div class="kpi"><div class="v">{n(kv_jdc)}</div><div class="l">JDC-Erinnerungen zu KV-Verträgen ({p(kv_anteil)} aller JDC-Erinnerungen)</div><div class="r">Übersicht!D47</div></div>
</div>

<div class="insight"><b>Kernbotschaft.</b> Die Erinnerungen sind seit KW33 sprunghaft gestiegen: von durchschnittlich {n(avg_f)} pro Woche (KW27 bis KW32) auf {n(avg_s)} pro Woche (KW33 bis KW36), die JDC-Erinnerungen von {n(avg_fj)} auf {n(avg_sj)}. Parallel dazu tauchen ab KW34 {n(hinw)} Hinweis-Mails auf, die aus dem technischen Fehler stammen, bei dem Ausgangsmails der ERGO erneut im Posteingang landeten und an KWAD weitergeleitet wurden. Beides erhöht die Rückstandszahlen, ohne dass neue Vorgänge dahinterstehen.</div>

<h2>2. Erinnerungen: Mengengerüst und Trend</h2>
<table><tr><th>Kalenderwoche</th><th style="text-align:right">Mails gesamt</th><th style="text-align:right">Erinnerungen</th><th style="text-align:right">davon JDC</th><th style="text-align:right">mit Anhang</th><th style="text-align:right">ohne Anhang</th><th style="text-align:right">Hinweis-Mails</th><th>Fundstelle</th></tr>''')
for i, r in enumerate(KW):
    zr = 5 + i
    H.append(f'<tr><td>{r[0].replace("2026-","")} ({r[1]})</td><td class="num">{n(r[18])}</td><td class="num">{n(r[19])}</td><td class="num">{n(r[24])}</td><td class="num">{n(r[20])}</td><td class="num">{n(r[21])}</td><td class="num">{n(r[26])}</td><td class="fund">KW-Verlauf!S{zr}:AA{zr}</td></tr>')
H.append(f'''</table>
<ul>
<li><b>Anhang als Indiz:</b> {n(V['davon mit Anhang'])} Erinnerungen ({p(V['davon mit Anhang']/eri)}) haben einen Anhang, {n(V['davon ohne Anhang'])} nicht. Bei JDC sind es nur {n(V['JDC-Erinnerungen mit Anhang'])} mit und {n(V['JDC-Erinnerungen ohne Anhang'])} ohne Anhang, also überwiegend reine Nachfass-Mails ohne neue Unterlagen {ref('Übersicht!B19:B24')}.</li>
<li><b>Mehrfach-Erinnerungen:</b> {n(V['davon mit mehr als einer Erinnerung'])} der {n(vertr)} Verträge ({p(V['davon mit mehr als einer Erinnerung']/vertr)}) wurden mehr als einmal erinnert {ref('Übersicht!B35')}; die Einzelaufstellung je Vertrag steht im Blatt „Reminder je Vertrag“ (Spalten F bis L).</li>
<li><b>Bezug zum Erstvorgang:</b> Bei {n(V['davon ohne Erstvorgang im Scan'])} Verträgen ({p(V['davon ohne Erstvorgang im Scan']/vertr)}) wurde im Zeitraum kein Erstvorgang zur selben Vertragsnummer gefunden {ref('Übersicht!B36')}. Die Erinnerungen betreffen also überwiegend Vorgänge, die vor dem 17.06. eingegangen sind.</li>
</ul>

<h2>3. Erstvorgänge, die eigentlich Erinnerungen sind</h2>
<p>Die Einzelliste unterscheidet drei Vorgangsarten nach dem Betreff {ref('Übersicht!A55:D59')}:</p>
<table><tr><th>Vorgangsart</th><th style="text-align:right">Anzahl</th><th>Fundstelle</th><th>Bedeutung</th></tr>
{row('Bestandsübertragung (Erstvorgang)', n(ART['Bestandsübertragung (Erstvorgang)']), 'Übersicht!D56', 'Betreff enthält „Bestandsübertragung“, keine Erinnerungsstichwörter.')}
{row('Erinnerung BÜ', n(ART['Erinnerung BÜ']), 'Übersicht!D57', 'Betreff enthält „Bestandsübertragung“ <b>und</b> ein Erinnerungsstichwort (Erinnerung, Reminder, Mahnung, Wiedervorlage, Nachfass, Sachstandsanfrage). Sieht im Postkorb wie ein neuer BÜ-Vorgang aus, ist aber eine Nachfrage zu einem bestehenden Fall.')}
{row('Sonstige Erinnerung / Mahnung', n(ART['Sonstige Erinnerung / Mahnung']), 'Übersicht!D58', 'Erinnerungsstichwort ohne BÜ-Betreff, z. B. Maklerauftrag, Betreuungswechsel, Zahnzusatz.')}
</table>
<div class="insight"><b>Erkenntnis.</b> {n(ART['Erinnerung BÜ'])} Mails tragen einen BÜ-Betreff und sind trotzdem Erinnerungen, das sind {p(ART['Erinnerung BÜ']/(ART['Erinnerung BÜ']+erst))} aller Mails mit BÜ-Betreff. Ohne Erkennung der Erinnerungsstichwörter würden sie als neue Vorgänge eröffnet. Genau hier setzt die Celonis-Klassifikation mit <span class="ref">BUE_REMINDER</span> an; im Prüf-Bot ist „Erinnerung / Reminder“ ein Ausschlusskriterium in der Vorprüfung.</div>

<h2>4. JDC (Jung, DMS &amp; Cie.)</h2>
<div class="two"><div>
<table><tr><th>Kennzahl</th><th style="text-align:right">Wert</th><th>Fundstelle</th></tr>
{row('JDC-Erinnerungen gesamt', n(jdc), 'Übersicht!B21')}
{row('Anteil an allen Erinnerungen', p(V['Anteil JDC-Erinnerungen an allen Erinnerungen']), 'Übersicht!B31')}
{row('Anteil an allen Mails', p(V['Anteil JDC-Erinnerungen an allen Mails']), 'Übersicht!B30')}
{row('KW27 bis KW32, Ø je Woche', n(avg_fj), 'KW-Verlauf!Y7:Y12')}
{row('KW33 bis KW36, Ø je Woche', n(avg_sj), 'KW-Verlauf!Y13:Y16')}
{row('Spitzenwoche KW36', n(max(r[24] for r in KW)), 'KW-Verlauf!Y16')}
</table></div><div>
<table><tr><th>Absender (Top 5)</th><th style="text-align:right">Erinnerungen</th><th>JDC</th><th>Fundstelle</th></tr>''')
for i, (a, g, j) in enumerate(ABS[:5]):
    H.append(f'<tr><td>{html.escape(a)}</td><td class="num">{n(g)}</td><td>{j}</td><td class="fund">Übersicht!D{63+i}</td></tr>')
H.append(f'''</table></div></div>
<p>JDC tritt mit zwei Absenderadressen auf (jungdms.de und jungdms-api.de); zusammen stellen sie {n(ABS[0][1]+ABS[2][1])} der {n(jdc)} JDC-Erinnerungen, der Rest wurde über Weiterleitungstexte erkannt {ref('Mails!AD')}.</p>

<h2 class="pb">5. Sparten: Wie viel davon ist KV?</h2>
<table><tr><th>Sparte</th><th style="text-align:right">Vorgänge (Verträge)</th><th style="text-align:right">Erinnerungen</th><th style="text-align:right">davon JDC</th><th style="text-align:right">Anteil an JDC</th><th style="text-align:right">Ø Erinnerungen je Vorgang</th><th>Fundstelle</th></tr>''')
for i, sp in enumerate(('Kranken', 'Komposit', 'Leben', 'Unbekannt', 'ohne VNR')):
    r = SP[sp]; zr = {'Komposit': 5, 'Kranken': 6, 'Leben': 7, 'Unbekannt': 8, 'ohne VNR': 9}[sp]
    H.append(f'<tr><td>{sp}</td><td class="num">{n(r[1])}</td><td class="num">{n(r[2])}</td><td class="num">{n(r[3])}</td><td class="num">{p(JDC_SP[sp][3])}</td><td class="num">{d(r[10])}</td><td class="fund">Sparten &amp; Duplikate!A{zr}:K{zr}</td></tr>')
g = SP['Gesamt']
H.append(f'''<tr><td><b>Gesamt</b></td><td class="num"><b>{n(g[1])}</b></td><td class="num"><b>{n(g[2])}</b></td><td class="num"><b>{n(g[3])}</b></td><td class="num"><b>100 %</b></td><td class="num"><b>{d(g[10])}</b></td><td class="fund">Sparten &amp; Duplikate!A10:K10</td></tr></table>
<div class="insight"><b>KV im Fokus.</b> Kranken ist mit {n(SP['Kranken'][2])} Erinnerungen zu {n(SP['Kranken'][1])} Verträgen die zweitgrößte Sparte, bei JDC aber die größte: {n(kv_jdc)} JDC-Erinnerungen ({p(kv_anteil)}) betreffen KV-Verträge {ref('Übersicht!B46:E52')}. Mit Ø {d(SP['Kranken'][10])} Erinnerungen je Vorgang wird in KV häufiger nachgefasst als in Komposit ({d(SP['Komposit'][10])}). Da bei Kranken jede Mail einen eigenen Vorgang auslöst, schlagen Erinnerungen dort direkt auf den Rückstand durch. Die Sparte wird aus dem Präfix der Vertragsnummer abgeleitet; „Unbekannt“ und „ohne VNR“ sind Mails ohne erkennbares Spartenkürzel bzw. ohne Vertragsnummer.</div>

<h2>6. Hinweis-Mails: der technische Fehler</h2>
<p>{n(hinw)} Mails im Zeitraum enthalten das Textmuster „attached message was sent by a member of this shared mailbox“ {ref('Übersicht!B10, B32')}. Es sind Ausgangsmails der ERGO zu abgeschlossenen BÜ-Vorgängen, die statt im Ordner „Gesendet“ erneut im Posteingang lagen und automatisch an KWAD weitergeleitet wurden. Sie treten ab KW34 auf: {n(KW[9][26])}, {n(KW[10][26])}, {n(KW[11][26])} und in den ersten drei Tagen der KW37 {n(KW[12][26])} {ref('KW-Verlauf!AA14:AA17')}. Fast alle laufen über maklerauftraege@ergo.de {ref('Übersicht!N42')}. Die Einzelliste steht im Blatt „Hinweis-Mails“ mit Datum, Absender, Betreff und, soweit erkannt, laufender Nummer und Dokumentart. Nach Rückmeldung von KWAD wurden diese Mails dort teilweise manuell indiziert; sie sind bereits erledigt und erhöhen den Rückstand nur scheinbar.</p>

<h2>7. Eingangskanäle</h2>
<table><tr><th>Kanal</th><th style="text-align:right">Mails</th><th style="text-align:right">Erinnerungen</th><th style="text-align:right">Quote</th><th style="text-align:right">davon JDC</th><th style="text-align:right">BÜ-Erstvorgänge</th><th style="text-align:right">Hinweis-Mails</th><th>Fundstelle</th></tr>''')
for name, zr in (('maklerauftraege@ergo.de', 42), ('bestandsuebertragungen@ergo.de', 41)):
    r = KAN[name]
    H.append(f'<tr><td>{name}</td><td class="num">{n(r[0])}</td><td class="num">{n(r[1])}</td><td class="num">{p(r[7])}</td><td class="num">{n(r[2])}</td><td class="num">{n(r[8])}</td><td class="num">{n(r[12])}</td><td class="fund">Übersicht!A{zr}:N{zr}</td></tr>')
H.append(f'''</table>
<p>Praktisch das gesamte Reminder-Aufkommen läuft über maklerauftraege@ergo.de; das Postfach bestandsuebertragungen@ergo.de ist mit {n(KAN['bestandsuebertragungen@ergo.de'][1])} Erinnerungen kaum betroffen.</p>

<h2>8. Weiterleitung an KWAD und Duplikate</h2>
<p>Im Zeitraum wurde keine Erinnerung als „an KWAD weitergeleitet“ erkannt {ref('Übersicht!B25')}; entsprechend stehen alle Duplikat-Kennzahlen auf null {ref('Übersicht!B28:B29, Sparten &amp; Duplikate!G5:J10')}. Das Erkennungsmerkmal ist die Kategorie „An KWAD weitergeleitet“ am Postfachelement {ref('Übersicht!B12')}. Ob tatsächlich nichts weitergeleitet wurde oder die Kategorie nicht gesetzt wird, ist mit dem Eingangsmanagement zu klären, bevor aus der Null eine Aussage abgeleitet wird.</p>

<h2>9. Lesehilfe: Was steht wo</h2>
<table><tr><th>Blatt</th><th>Inhalt</th><th>Umfang</th></tr>
<tr><td>Übersicht</td><td>Rahmendaten, 21 Kernzahlen, Kanäle, JDC je Sparte, Vorgangsarten, Top-15 Absender</td><td>Kernzahlen B17:B37</td></tr>
<tr><td>KW-Verlauf</td><td>Wochenwerte je Kanal und Gesamt mit Diagramm; blaue Zellen sind Eingaben der Postfachzählung</td><td>13 Wochen, Spalten A:AA</td></tr>
<tr><td>Sparten &amp; Duplikate</td><td>Kennzahlen je Sparte, Vorgänge mit mehrfacher Weiterleitung, Block „Sparte im Fokus: Kranken“</td><td>Zeilen 5 bis 10</td></tr>
<tr><td>Reminder je Vertrag</td><td>Eine Zeile je Vertragsnummer mit Erinnerungen, JDC, Anhang, Erstvorgang, Rangstufe</td><td>{n(vertr)} Zeilen</td></tr>
<tr><td>Hinweis-Mails</td><td>Einzelliste der Hinweis-Mails mit Datum, Kanal, Absender, Betreff, LNR, Dokumentart</td><td>{n(hinw)} Zeilen</td></tr>
<tr><td>Mails</td><td>Einzelliste aller Erinnerungen und BÜ-Erstvorgänge mit Vorgangsart, JDC, VNR, Sparte</td><td>{n(erst+eri)} Zeilen</td></tr>
</table>
<p class="meta">Alle Kennzahlen sind Formeln über die Einzellisten. Abweichend zur Rohauswertung vom 09.09. sind „Unbekannt“ und „ohne VNR“ getrennt ausgewiesen; die Kernzahl Hinweis-Mails zählt alle {n(hinw)} Zeilen, während der Wochenverlauf die {n(KW[0][26]+sum(r[26] for r in KW))} Mails mit Kalenderwoche zeigt.</p>
</body></html>''')
open('briefing.html', 'w', encoding='utf-8').write(''.join(H)); print('html ok')
