# PDD Komposit/Leben v12 aus der Rueckgabe mit Kommentaren N. Garcia-Fernandez (ODPBD): Uebersetzung nachziehen, Kommentare umsetzen
# Aufruf: python3 pdd_kl_v12.py rueckgabe_0210/PDD_Vorpruefung_BUE_Komposit_Leben_Rueckgabe_ODPBD.docx ../PDD_Vorpruefung_BUE_Komposit_Leben_v12.docx
import re, html, sys, shutil, os, zipfile
QUELLE, ZIEL = sys.argv[1], sys.argv[2]
z = zipfile.ZipFile(QUELLE)
teile = {n: z.read(n) for n in z.namelist()}
infos = {n: z.getinfo(n) for n in z.namelist()}
d = teile['word/document.xml'].decode('utf-8')
spans = [m.span() for m in re.finditer(r'<w:p[ >].*?</w:p>', d, re.S)]
P = {i: d[a:b] for i, (a, b) in enumerate(spans)}
neu = dict(P)
esc = lambda s: s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')  # noqa: E731


def text(x):
    return html.unescape(''.join(re.findall(r'<w:t[^>]*>([^<]*)</w:t>', x)))


def ersetze(i, alt, neu_t):
    """alt muss in genau einem w:t stehen."""
    p = neu[i]
    treffer = [m for m in re.finditer(r'(<w:t[^>]*>)([^<]*)(</w:t>)', p) if esc(alt) in m.group(2)]
    assert len(treffer) == 1, (i, alt, text(p))
    m = treffer[0]
    neu[i] = p[:m.start(2)] + m.group(2).replace(esc(alt), esc(neu_t), 1) + p[m.end(2):]


def setze(i, neu_t, farbe_weg=False):
    """ganzer Absatztext in den ersten Lauf, die uebrigen Laeufe leer."""
    p = neu[i]
    ts = list(re.finditer(r'(<w:t)([^>]*)(>)([^<]*)(</w:t>)', p))
    assert ts, i
    out, pos = [], 0
    for k, m in enumerate(ts):
        out.append(p[pos:m.start()])
        out.append('<w:t xml:space="preserve">%s</w:t>' % (esc(neu_t) if k == 0 else ''))
        pos = m.end()
    out.append(p[pos:])
    p = ''.join(out)
    if farbe_weg:
        p = re.sub(r'<w:color w:val="(123E73|14572C)"/>', '', p)
    neu[i] = p


def erwarte(i, anfang):
    assert text(P[i]).startswith(anfang), (i, text(P[i])[:80])


# --- Uebersetzung nachziehen (deutsche Aenderungen der Rueckgabe)
erwarte(450, '<Name the specific topic mailbox')
setze(450, 'No action required')
erwarte(453, 'E-mails that do not correspond')
ersetze(453, 'are forwarded unchanged to the distribution list named in line 2 and then deleted from the bot mailbox',
        'are deleted from the bot mailbox')
erwarte(914, 'Note: Commission recipients')
ersetze(914, ' (M. Koch, 24.09.2026)', '')
erwarte(1456, 'Note: The bot recognises a KR fleet contract')
ersetze(1456, ' (K. Rypa, 25.09.2026, see screenshot)', '')
# BUE_SPARTE steuert die Pruefung bei „KR“; „FK“ ist die Versicherungsart in VA230 (Rueckgabe hatte „FK“ an dieser Stelle)
erwarte(802, 'Hinweis: Eine weitergehende Spartenweiche')
ersetze(802, 'FK', 'KR')
ersetze(802, ' die Prüfung auf Mantelvertrag.', ' die Prüfung auf Mantelvertrag; einen Flottenvertrag erkennt der Bot dann in VA230 an „FK“ im Feld „Sparte/Vers.Art“.')
erwarte(805, 'Note: No further line-of-business switch')
ersetze(805, ' when it is „KR“.', ' when it is „KR“; the bot then recognises a fleet contract in VA230 by „FK“ in the field „Sparte/Vers.Art“.')
# Unterschrift VN: wie v11 jeder Wert ausser „ja“ (Rueckfrage 02.10.2026)
erwarte(844, '<BUE_MV_UNTERSCHRIFT_KUNDE> <> „nein“')
ersetze(844, 'nein', 'ja')

# --- Kommentar 89/90: Pruefung Unterlagen mit einer Bedingung – Pruefnotiz, wenn das Feld einen Mangel nennt
#     (leer und „Reminder - keine Vollst.-Pruefung“ muessen nicht eigens ausgeschlossen werden; Ergebnis unveraendert)
MAENGEL_DE = ' nennt einen Mangel („BÜ-Wunsch fehlt“, „MV fehlt“, „MV unvollständig“ oder „VN-Unterschrift fehlt“)'
MAENGEL_EN = ' names a defect („BÜ-Wunsch fehlt“, „MV fehlt“, „MV unvollständig“ or „VN-Unterschrift fehlt“)'
erwarte(850, '<BUE_PRUEFUNG_UNTERLAGEN> <> „Vollständig“')
ersetze(850, ' <> „Vollständig“', MAENGEL_DE)
erwarte(851, 'UND <BUE_PRUEFUNG_UNTERLAGEN> <> leer')
erwarte(852, 'UND <BUE_PRUEFUNG_UNTERLAGEN> <> „Reminder')
erwarte(903, '<BUE_PRUEFUNG_UNTERLAGEN> <> „Vollständig“')
ersetze(903, ' <> „Vollständig“', MAENGEL_EN)
erwarte(904, 'AND <BUE_PRUEFUNG_UNTERLAGEN> <> empty')
erwarte(905, 'AND <BUE_PRUEFUNG_UNTERLAGEN> <> „Reminder')
for i in (851, 852, 904, 905):
    neu[i] = ''

erwarte(1832, 'Makler: Feldwert weder')
setze(1832, 'Makler: Feldwert nennt einen Mangel („BÜ-Wunsch fehlt“, „MV fehlt“, „MV unvollständig“ oder „VN-Unterschrift fehlt“)')
erwarte(1833, 'Broker: field value neither')
setze(1833, 'Broker: field value names a defect („BÜ-Wunsch fehlt“, „MV fehlt“, „MV unvollständig“ or „VN-Unterschrift fehlt“)')

# --- Postkorb-Nummern aus der Rueckgabe (Geschaeftsbereiche, BE-Postkorb) auch im BE-Handling
for i, alt, nr in ((1672, 'Postkorb-Nr. TBD', 'Postkorb-Nr. AA 23949'), (1674, 'Postkorb-Nr. TBD', 'Postkorb-Nr. KO 23724'),
                   (1689, 'mailbox no. TBD', 'mailbox no. AA 23949'), (1691, 'mailbox no. TBD', 'mailbox no. KO 23724')):
    ersetze(i, alt, nr)

# --- Kommentar 147/148: Sonderliste wird laufend geprueft und geaendert
erwarte(1341, 'Hinweis: Die Sonderliste gilt einmalig')
setze(1341, 'Hinweis: Die Sonderliste (Stand 23.09.2026) muss laufend geprüft und bei Bedarf geändert oder ergänzt werden.')
erwarte(1372, 'Note: The Sonderliste applies')
setze(1372, 'Note: The Sonderliste (as at 23.09.2026) must be reviewed on an ongoing basis and changed or supplemented as required.')

# --- Kommentar 186/187: Notizfeld „Komposit / Leben / KV“ wird nicht befuellt
erwarte(1607, '„Komposit“ oder „Leben“ nach')
setze(1607, 'leer lassen', farbe_weg=True)
setze(1608, 'leave empty', farbe_weg=True)
erwarte(1609, 'Zuordnung der Spartenkürzel')
setze(1609, 'Feld wird vom Bot nicht befüllt.', farbe_weg=True)
setze(1610, 'The bot does not fill this field.', farbe_weg=True)
# --- Kommentar 189/190: Notizfeld „Laufende Nr. aus Vorgangsdatenbank“ wird nicht befuellt
erwarte(1613, 'ja')
setze(1613, 'nein')
setze(1614, 'no')
erwarte(1615, '<Vorgang-Lfd-Nr>')
setze(1615, 'leer lassen', farbe_weg=True)
neu[1615] = re.sub(r'<w:b/>|<w:bCs/>', '', neu[1615])                            # Variable war fett, der Eintrag nicht
en = re.sub(r'(<w:t[^>]*>)leer lassen(</w:t>)', r'\1leave empty\2', neu[1615])
vorlage_en = re.search(r'<w:pPr>.*?</w:pPr>', P[1608], re.S)                 # Absatzformat der englischen Zeile uebernehmen
if vorlage_en:
    en = re.sub(r'<w:pPr>.*?</w:pPr>', lambda m: vorlage_en.group(0), en, count=1, flags=re.S)
en = re.sub(r'<w:bookmark(Start|End) [^>]*/>', '', en)                       # Textmarke und Absatz-IDs nur im deutschen Absatz
en = re.sub(r' w14:(paraId|textId)="[^"]*"', '', en)
neu[1615] = neu[1615] + en
erwarte(1616, 'mehrere Nummern werden nur')
setze(1616, 'Feld wird vom Bot nicht befüllt.')
setze(1617, 'The bot does not fill this field.')
# Variablentabelle
erwarte(560, 'Feld_Format CH. Zwei Buchstaben')
ersetze(560, ' und das Notizfeld „Komposit / Leben / KV“', '')
erwarte(561, 'IV, VI, VII')
p = neu[561]
laeufe = re.findall(r'<w:r[ >].*?</w:r>', p, re.S)
assert len(laeufe) == 5
neu[561] = p.replace(laeufe[2], '', 1).replace(laeufe[3], '', 1)            # „VI, “ entfaellt
erwarte(704, 'Ordnungsbegriff für Queue und Reporting.')
ersetze(704, 'Wird in der Notiz im Feld „Laufende Nr. aus Vorgangsdatenbank“ übergeben.', 'Das Notizfeld „Laufende Nr. aus Vorgangsdatenbank“ wird nicht befüllt.')
erwarte(705, 'VI')
p = neu[705]
neu[705] = re.sub(r'<w:hyperlink [^>]*>(.*?)</w:hyperlink>', r'\1', p, flags=re.S)
setze(705, 'Start')

# --- Dokument zusammensetzen, Kommentare entfernen (umgesetzt bzw. per Mail beantwortet)
out, pos = [], 0
for i, (a, b) in enumerate(spans):
    out.append(d[pos:a]); out.append(neu[i]); pos = b
out.append(d[pos:])
d = ''.join(out)
d = re.sub(r'<w:commentRangeStart [^>]*/>|<w:commentRangeEnd [^>]*/>', '', d)
d = re.sub(r'<w:r>(?:(?!</w:r>).)*?<w:commentReference [^>]*/>(?:(?!</w:r>).)*?</w:r>', '', d, flags=re.S)
d = re.sub(r'<w:r [^>]*>(?:(?!</w:r>).)*?<w:commentReference [^>]*/>(?:(?!</w:r>).)*?</w:r>', '', d, flags=re.S)
assert 'commentReference' not in d
teile['word/document.xml'] = d.encode('utf-8')
for n in [n for n in teile if re.match(r'word/comments(Extended|Extensible|Ids)?\.xml$', n)]:
    del teile[n]
rels = teile['word/_rels/document.xml.rels'].decode('utf-8')
rels = re.sub(r'<Relationship [^>]*Target="comments(Extended|Extensible|Ids)?\.xml"/>', '', rels)
teile['word/_rels/document.xml.rels'] = rels.encode('utf-8')
ct = teile['[Content_Types].xml'].decode('utf-8')
ct = re.sub(r'<Override PartName="/word/comments(Extended|Extensible|Ids)?\.xml"[^>]*/>', '', ct)
teile['[Content_Types].xml'] = ct.encode('utf-8')
with zipfile.ZipFile(ZIEL, 'w', zipfile.ZIP_DEFLATED) as zo:
    for n, b in teile.items():
        zo.writestr(infos[n], b)
print('geschrieben', ZIEL)
