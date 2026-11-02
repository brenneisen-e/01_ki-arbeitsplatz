# -*- coding: utf-8 -*-
"""Erzeugt die KV-Fassung aus der aktuellen Komposit/Leben-Fassung.

Uebernimmt alle Korrekturen des Fachbereichs an den vorderen Kapiteln und ersetzt
ausschliesslich die spartenspezifischen Textstellen sowie die Schrittbeschreibung.
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from docx import Document
from docx.oxml.ns import qn
import patch_steps

# Reihenfolge ist relevant: laengste und spezifischste Treffer zuerst
ERSETZUNGEN = [
    ('Vorprüfung Bestandsübertragung (Prüf-Bot) – Komposit / Leben',
     'Vorprüfung Bestandsübertragung (Prüf-Bot) – Gesundheit / Krankenversicherung (KV)'),
    ('Sparten im Bearbeitungsumfang: Komposit (SU, KFZ, Haftpflicht, Unfall, Rechtsschutz, Sach) und Leben/BU.',
     'Sparten im Bearbeitungsumfang: Krankenversicherung (KV) – Voll-, Zusatz- und Pflegeversicherung.'),
    ('Nein. Im Komposit- und Lebensgeschäft werden vom Roboter ausschließlich Vertrags-, Partner- und '
     'Vermittlerstammdaten gelesen. Gesundheitsdaten aus der Risikoprüfung Leben/BU werden nicht aufgerufen '
     'und nicht verarbeitet.',
     'Ja. Der Prozess betrifft Verträge der privaten Krankenversicherung; die Zuordnung einer Person zu einem '
     'KV-Vertrag unterliegt dem Schutz des § 203 StGB. Der Roboter liest ausschließlich Stammdaten, '
     'Vertragsstatus und Vermittlerdaten – keine Diagnosen, Leistungs-, Tarif- oder Risikoprüfungsdaten.'),
    ('Nein. Es werden keine Daten nach Art. 9 oder 10 DSGVO gelesen. Sollte ein Vorgang Verträge mit Bezug zur '
     'Risikoprüfung (Leben/BU) enthalten, beschränkt sich der Roboter auf Vertragsstatus und Bestandsinhaber.',
     'Ja. Die Zugehörigkeit zu einem Krankenversicherungsvertrag lässt einen Rückschluss auf Gesundheitsdaten '
     'im Sinne des Art. 9 DSGVO zu. Gesundheitsdaten selbst werden nicht gelesen und nicht in Notiz oder '
     'Report übernommen.'),
    ('Steuert in der Krankenversicherung die Ausprägung „BÜ mit UV“ des Notizfeldes „Bearbeitung nach“. '
     'In Komposit und Leben kennt die Notizvorlage BOT1515 diese Ausprägung nicht; das Feld wird dort nur '
     'mitgeführt.',
     'Steuert die Ausprägung „BÜ mit UV“ des Notizfeldes „Bearbeitung nach“ der Notizvorlage BOT2011.'),
    ('Betrieb Komposit / Leben', 'Betrieb Gesundheit / Krankenversicherung'),
    ('BÜ Komposit / Leben', 'BÜ Gesundheit (KV)'),
    ('Bestandsübertragung Komposit / Leben', 'Bestandsübertragung Gesundheit (KV)'),
    ('Komposit / Leben', 'Gesundheit (KV)'),
    ('BOT1515', 'BOT2011'),
]

# Stellen, die beide Bots bewusst nennen, werden nach der Pauschalersetzung zurueckgesetzt
NACHKORREKTUR = [
    ('an BOT2011 oder BOT2011', 'an BOT2011 oder BOT1515'),
    ('BOT2011 ergibt Notizbestückung', 'BOT2011 ergibt Notizbestückung'),
]


def ersetze(doc):
    def paras(container):
        for p in container.paragraphs:
            yield p
        for t in container.tables:
            for r in t.rows:
                for c in r.cells:
                    for p in paras(c):
                        yield p
    n = 0
    for p in paras(doc):
        voll = p.text
        neu = voll
        for a, b in ERSETZUNGEN:
            neu = neu.replace(a, b)
        for a, b in NACHKORREKTUR:
            neu = neu.replace(a, b)
        if neu == voll or not voll.strip():
            continue
        # Formatierung des ersten Runs erhalten, uebrige Runs leeren
        runs = p.runs
        if not runs:
            continue
        runs[0].text = neu
        for r in runs[1:]:
            r.text = ''
        n += 1
    return n


KV_VARIABLEN = [
    ('KNR-Uebernehmer', 'Kundennummer (KNR) des übernehmenden Maklers',
     'OB726, Schritt „Name des übernehmenden Maklers prüfen“', 'Pflichtfeld',
     'Feld „KNR Makler“ der Notizvorlage BOT2011.'),
]


def ergaenze_kv_variablen(doc):
    """Haengt die nur in der KV-Fassung genutzten Variablen an die Variablentabelle an."""
    import copy
    from docx.oxml.ns import qn as _qn
    for tb in doc.tables:
        if not tb.rows[0].cells[0].text.strip().startswith('Variablenname'):
            continue
        vorhanden = {r.cells[0].text.strip() for r in tb.rows[1:]}
        for zeile in KV_VARIABLEN:
            if zeile[0] in vorhanden:
                continue
            neu = copy.deepcopy(tb.rows[-1]._tr)
            tb._tbl.append(neu)
            for c, wert in zip(tb.rows[-1].cells, zeile):
                patch_steps.B.set_cell(c, wert)
        return 1
    return 0


if __name__ == '__main__':
    base = os.path.dirname(os.path.abspath(__file__))
    src = os.path.join(base, 'latest.docx')
    tmp = os.path.join(base, '_kv_zwischenstand.docx')
    doc = Document(src)
    print('Spartenspezifische Absaetze ersetzt:', ersetze(doc))
    doc.save(tmp)
    ergaenze_kv_variablen(doc)
    doc.save(tmp)
    out = patch_steps.patch(tmp, os.path.join(base, 'PDD_Vorpruefung_BUE_Gesundheit_KV.docx'), 'KV')
    os.remove(tmp)
    print('OK', out, os.path.getsize(out))
