# -*- coding: utf-8 -*-
"""Ablaufdiagramm v10 (Gesundheit/KV und Komposit/Leben) als editierbare Word-Gruppe."""
from zeichnung import form, pfeil, NS, e


def ablaufdiagramm(sparte='KV'):
    kv = sparte == 'KV'
    B, H, G = 32.0, 11.8, 0.55
    n = 8
    NW = (B - 1.4 - (n - 1) * G) / n
    NH, NY = 3.0, 3.3
    X = [0.7 + i * (NW + G) for i in range(n)]
    cx = lambda i: X[i] + NW / 2
    titel = 'Ablaufdiagramm Prüf-Bot Bestandsübertragung – ' + ('Gesundheit / KV' if kv else 'Komposit / Leben')
    s = [form('Titel', 0, 0, B, 0.7, titel, None, 'rect', sz=20, jc='left', rand=False)]
    # Quellen
    s.append(form('Datenpool', X[0], 1.0, NW, 1.5, 'Datenpool\n35 Felder BUE_… je Vorgang, befüllt durch Celonis', 'src', 'rect', sz=12))
    s.append(form('Deckblatt', X[1], 1.0, NW, 1.5, 'KI-Deckblatt\nBÜ-Wunsch und Betreuungswunsch (MFA), Unterschrift VN und Unterlagen (Makler)', 'src', 'rect', sz=11))
    s.append(form('Host', X[2], 1.0, 4 * NW + 3 * G, 1.5, 'Hostanwendungen\nIS011 mit Scout-Service · VA230 · OB726 · GH040 · Sonderliste TOP-Makler', 'src', 'rect', sz=12))
    knoten = [
        ('Start', 'Start\nVorgang aus dem Themenpostkorb, Datenpool lesen', 'end', 'roundRect'),
        ('Vorpruefung', 'Vorprüfung\nAusschluss-\nkriterium erfüllt?', 'dec', 'flowChartDecision'),
        ('I', 'I. Kunde (VN)\nIS011: Kundennummer über die VNR, Matchcodesuche, Geburtsdatum', 'proc', 'roundRect'),
        ('II', 'II. Abgebender Bestandsinhaber\nVA230 · OB726 · GH040', 'proc', 'roundRect'),
        ('III', 'III. Übernehmender Makler\nOB726, GH040, E-Mail-Adresse', 'proc', 'roundRect'),
        ('IV', 'IV. Vertrag\nVertragsstatus VA230' + ('' if kv else '\nKR: Flotte (FK)?'), 'proc', 'roundRect'),
        ('V', 'V. Test auf\nFehlerliste\nPrüfnotiz vorhanden?', 'dec', 'flowChartDecision'),
        ('VI', 'VI. Abschluss ohne Befund\nNotiz bestücken, Übergabe an den 72-Stunden-BOT', 'end', 'roundRect'),
    ]
    for i, (name, text, art, prst) in enumerate(knoten):
        s.append(form(name, X[i], NY, NW, NH, text, art, prst, sz=12))
    # BE-Handling
    BY, BH = 7.8, 1.9
    ziel = ('Weiterleitung an den Themenpostkorb HSB4K MV' if kv
            else 'Makler als abgebender Bestandsinhaber → ODPB, sonst Themenpostkorb HSB4K KO')
    s.append(form('BE-Handling', X[1], BY, X[6] + NW - X[1], BH,
                  'VII. Abschluss mit Befund – BE-Handling (zentral)\nBearbeitungshinweis mit BE-Klassifikation, den Prüfnotizen der Fehlerliste und allen im Auftrag genannten VNR · ' + ziel,
                  'be', sz=13))
    # Pfeile Quellen -> Knoten
    s.append(pfeil('Quelle', cx(0), 2.5, cx(0), NY))
    s.append(pfeil('Quelle', cx(1), 2.5, cx(1), NY))
    hx = X[2] + (4 * NW + 3 * G) / 2
    s.append(pfeil('Quelle', hx, 2.5, hx, NY))
    # Hauptfluss
    for i in range(n - 1):
        s.append(pfeil('Fluss', X[i] + NW, NY + NH / 2, X[i + 1], NY + NH / 2))
    s.append(form('Label nein', X[1] + NW - 0.05, NY + NH / 2 - 0.55, G + 0.1, 0.5, 'nein', None, 'rect', sz=11, bold=False))
    s.append(form('Label leer', X[6] + NW - 0.05, NY + NH / 2 - 0.55, G + 0.1, 0.5, 'nein', None, 'rect', sz=11, bold=False))
    # BE-Pfeile
    for i, lab in ((1, 'ja'), (2, 'harte BE'), (3, 'harte BE'), (4, 'harte BE'), (5, 'harte BE'), (6, 'ja')):
        s.append(pfeil('BE', cx(i), NY + NH, cx(i), BY))
        s.append(form('Label ' + lab, cx(i) + 0.1, NY + NH + 0.25, 1.6, 0.5, lab, None, 'rect', sz=11, bold=False, jc='left'))
    # Legende
    LY, LH, LW = 10.6, 0.8, 3.0
    for k, (t, art, prst) in enumerate((('Datenquelle', 'src', 'rect'), ('Verarbeitung', 'proc', 'roundRect'),
                                        ('Entscheidung', 'dec', 'flowChartDecision'), ('Business Exception', 'be', 'roundRect'),
                                        ('Start / Ende', 'end', 'roundRect'))):
        s.append(form('Legende ' + t, 0.7 + k * (LW + 0.4), LY, LW, LH, t, art, prst, sz=12, bold=False))
    s.append(form('Legende Text', 18.0, LY, 13.3, LH,
                  'Harte BE: sofortiger Ausstieg in das BE-Handling. Prüfnotiz: Eintrag in der Fehlerliste, die Prüfung läuft weiter; Test am Ende.',
                  None, 'rect', sz=11, bold=False, jc='left'))
    grp = ''.join(s)
    return (f'<w:drawing {NS}><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="{e(B)}" cy="{e(H)}"/>'
            f'<wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="9001" name="Ablaufdiagramm Prüf-Bot {"Gesundheit KV" if kv else "Komposit Leben"}"/>'
            f'<wp:cNvGraphicFramePr/><a:graphic><a:graphicData uri="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup">'
            f'<wpg:wgp><wpg:cNvGrpSpPr/><wpg:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{e(B)}" cy="{e(H)}"/>'
            f'<a:chOff x="0" y="0"/><a:chExt cx="{e(B)}" cy="{e(H)}"/></a:xfrm></wpg:grpSpPr>{grp}</wpg:wgp>'
            f'</a:graphicData></a:graphic></wp:inline></w:drawing>')
