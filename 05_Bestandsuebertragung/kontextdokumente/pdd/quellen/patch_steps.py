# -*- coding: utf-8 -*-
"""Ersetzt ausschliesslich das Kapitel "Schritt fuer Schritt-Beschreibung"
in einer bestehenden PDD-Fassung. Alle uebrigen Kapitel bleiben unveraendert."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from docx import Document
from docx.oxml.ns import qn
import build as B
from content_steps import steps
from content_steps2 import steps2


NEUE_FELDER = [
    ('BUE_ANF_UNTERLAGEN', 'Kennzeichen, ob beim übernehmenden Makler Unterlagen angefordert werden müssen',
     'Datenpool / KI-Auslesung', 'Pflichtfeld',
     'Feld_Format JN. Ausprägungen: ja, nein. Bei „ja“ wird der Vorgang nicht ausgesteuert; die Unterlagen '
     'werden über die Notiz angefordert.'),
    ('BUE_ART_UNTERLAGEN', 'Art der anzufordernden Unterlagen',
     'Datenpool / KI-Auslesung', 'Pflichtfeld wenn BUE_ANF_UNTERLAGEN = ja',
     'Feld_Format CH. Freitext, mehrere Angaben mit Semikolon getrennt. Steuert die Kennzeichen im Abschnitt '
     '„Folgearbeit für Komposit“ bzw. „Anforderung von Unterlagen“ der Notiz.'),
]


def ergaenze_felder(doc):
    """Haengt neue Datenpoolfelder an die Variablentabelle an."""
    import copy
    for tb in doc.tables:
        if not tb.rows[0].cells[0].text.strip().startswith('Variablenname'):
            continue
        vorhanden = {r.cells[0].text.strip() for r in tb.rows[1:]}
        for zeile in NEUE_FELDER:
            if zeile[0] in vorhanden:
                continue
            tb._tbl.append(copy.deepcopy(tb.rows[-1]._tr))
            for c, wert in zip(tb.rows[-1].cells, zeile):
                B.set_cell(c, wert)
        return
    return


def patch(src, out, variant):
    doc = Document(src)
    el, _ = B.find_p(doc, 'Schritt für Schritt-Beschreibung', style='Heading 1')
    body = doc.element.body
    sect = body.find(qn('w:sectPr'))
    hit, remove = False, []
    for ch in list(body.iterchildren()):
        if ch is el:
            hit = True
            continue
        if hit and ch is not sect:
            remove.append(ch)
    for ch in remove:
        body.remove(ch)

    intro = doc.add_paragraph()
    r = intro.add_run(
        'Notation nach der Vorgabe des Templates. Drei Schreibweisen sind zu unterscheiden: <BUE_…> bezeichnet '
        'ein Eingangsfeld aus dem Datenpool, Variable „…“ einen vom Bot gelesenen oder gesetzten Wert, „…“ ohne '
        'Zusatz ein Feld auf der Hostmaske oder einen festen Wert. Variablen, die aus einer Hostanwendung '
        'gelesen werden, tragen die Anwendung im Namen. Damit ist in jedem Vergleich erkennbar, welche Quelle '
        'gegen welche geprüft wird: Variable „IS100-Nachname“ <> <BUE_KUNDE_NACHNAME> vergleicht den in IS100 '
        'gelesenen Nachnamen mit dem Feld aus dem Datenpool. Schlüsselwörter WENN / DANN / SONST / Weiter / '
        'Ende WENN stehen in der Formatvorlage „WENN DANN“, Initialisierung über „Lese … und speichere als '
        'Variable“, Zuweisung über „=“, Vergleich über „<>“. Das Ergebnis einer fehlgeschlagenen Prüfung '
        'wird mit „Merke …“ festgehalten; die Verarbeitung läuft weiter. Das <BE-Flag> wird erst im Kapitel '
        '„Ablehnungsgründe auswerten und priorisieren“ aus allen gemerkten Gründen gesetzt. Nur die '
        'Vorprüfung bricht sofort ab.')
    r.style = 'Emphasis'
    anchor = B.insert_after(el, intro._p)

    for kind, payload in steps(variant) + steps2(variant):
        if kind == 'S':
            np = doc.add_paragraph(); np.style = 'Heading 2'; np.add_run(payload)
            anchor = B.insert_after(anchor, np._p)
        elif kind == 'K':
            np = doc.add_paragraph(); np.style = 'fachlicher Kontext'; np.add_run(payload)
            B.set_num(np, 8)
            anchor = B.insert_after(anchor, np._p)
        else:
            t = B.make_step_table(doc, len(payload))
            for i, (shot, de, _en) in enumerate(payload):
                cells = t.rows[i].cells
                if shot:
                    B.set_cell_style(cells[0], shot, 'Linke Spalte Tabelle')
                B.set_cell(cells[1], de)
            anchor = B.insert_after(anchor, t._tbl)
            anchor = B.insert_after(anchor, doc.add_paragraph()._p)

    RENAME = [('Nachname', 'IS100-Nachname'), ('Vorname', 'IS100-Vorname'), ('Geb.-Dat', 'IS100-Gebdat'), ('Straße', 'IS100-Strasse'), ('PLZ', 'IS100-PLZ'), ('Sparte-Vertrag', 'VA230-Sparte'), ('Vertragsstatus', 'VA230-Status'), ('AGT-Bestandsinhaber', 'VA230-AGT-Inhaber'), ('Name-Uebernehmer', 'OB726-Name'), ('PNR-Uebernehmer', 'OB726-PNR'), ('Klassifizierung-Vermittler', 'OB726-Klassifizierung'), ('Anbindung-Uebernehmer', 'GH040-Anbindung-Makler'), ('Anbindung-Bestandsinhaber', 'GH040-Anbindung-Inhaber'), ('IS100-Gebdat', 'IS100-Gebdat'), ('IS100-Strasse', 'IS100-Strasse')]
    for tb in doc.tables:
        if not tb.rows[0].cells[0].text.strip().startswith('Variablenname'):
            continue
        for row in tb.rows[1:]:
            name = row.cells[0].text.strip()
            for a, bn in RENAME:
                if name == a and name != bn:
                    B.set_cell(row.cells[0], bn)
                    break

    ergaenze_felder(doc)
    B.enable_update_fields(doc)
    doc.save(out)
    return out


if __name__ == '__main__':
    base = os.path.dirname(os.path.abspath(__file__))
    o = patch(os.path.join(base, 'latest.docx'),
              os.path.join(base, 'PDD_Vorpruefung_BUE_Komposit_Leben.docx'), 'KL')
    print('OK', o, os.path.getsize(o))
