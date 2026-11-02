# -*- coding: utf-8 -*-
"""Schritt-fuer-Schritt-Beschreibung, Teil 1.

Notation nach der PDD-Erklaerung des Templates:
  Schluesselwoerter   WENN / DANN / SONST / Weiter / Ende WENN  (Formatvorlage "WENN DANN")
  Initialisierung     Lese das gelb markierte Feld aus und speichere als Variable "X"
  Zuweisung           Variable "X" = <FELD>
  Vergleich           Variable "X" <> <FELD>
  Merken              Merke "Grund" - jede fehlgeschlagene Pruefung wird nur gemerkt,
                      die Verarbeitung laeuft weiter
  Flag                <BE-Flag> wird erst am Prozessende aus allen gemerkten Gruenden gesetzt
  Eingangsdaten aus dem Datenpool stehen in spitzen Klammern: <BUE_...>

Ausnahme: Die Vorpruefung bricht sofort ab und setzt das <BE-Flag> unmittelbar.
"""


def steps(v):
    KV = (v == 'KV')
    b = []

    # ============================================================ Start
    b += [('S', 'Start')]
    b += [('K', 'Eröffnung Postkorbvorgang und Daten im Datenpool')]
    b += [('T', [
        ('Screenshot: EWMS-Postkorb, Vorgangsübersicht',
         'Postkorbvorgang öffnen.\n'
         'Lese die Vorgang-Lfd-Nr aus und speichere als Variable „Vorgang-Lfd-Nr“.\n'
         'Vorgang-Lfd-Nr ist der Ordnungsbegriff dieses Prozesses.', ''),
        ('Screenshot: Datenpool, Datensatz zum Postkorbvorgang',
         'Datenpool mit Vorgang-Lfd-Nr öffnen.\n'
         'Lese alle in der Tabelle der genutzten Variablen aufgeführten Felder <BUE_…> aus und speichere sie '
         'unter dem dort genannten Namen.\n'
         'Variable „Eingangsdatum-BUE“ = <BUE_MV_EINGANGSDATUM>\n'
         '<BE-Flag> = leer\n'
         'Format: tt.mm.jjjj.', ''),
        ('',
         'Die Trennung nach Sparte erfolgt bereits vor dem Prüf-Bot: KV-Vorgänge und Vorgänge aus Komposit und '
         'Leben liegen in getrennten Postkörben. Der Prüf-Bot bedient ausschließlich den Postkorb '
         + ('Gesundheit; die zu bestückende Notizvorlage ist damit fest BOT2011.\n' if KV else
            'Komposit / Leben; die zu bestückende Notizvorlage ist damit fest BOT1515.\n') +
         
         'Eine Spartenweiche innerhalb des Prozesses ist deshalb nicht erforderlich. Sparte und Vertragsstatus '
         'werden dennoch aus VA230 gelesen und nachrichtlich mitgeführt.', ''),
    ])]

    # ============================================================ Vorpruefung
    b += [('S', 'Vorprüfung – Ausschlusskriterien (Vorschlag, nicht abgestimmt)')]
    b += [('K', 'Ausschlusskriterien aus dem Datenpool prüfen')]
    b += [('T', [
        ('',
         'Vorschlag, im Prozessblatt nicht enthalten. Es bleibt fachlich zu bestätigen, ob der Prüf-Bot diese '
         'vorgelagerten Ausschlusskriterien prüft.\n'
         'WENN\n'
         '<BUE_KLASSIFIKATION> <> „BÜ-Vorgang“\n'
         'DANN\n'
         '<BE-Flag> = „Kein BÜ-Vorgang“\n'
         'Aussteuerung und Verarbeitung beenden\n'
         'SONST\n'
         'Weiter\n'
         'Ende WENN\n'
         'WENN\n'
         '<BUE_WUNSCH_VORHANDEN> = „nein“\n'
         'DANN\n'
         '<BE-Flag> = „BÜ-Wunsch nicht vorhanden“\n'
         'Aussteuerung und Verarbeitung beenden\n'
         'SONST\n'
         'Weiter\n'
         'Ende WENN\n'
         'WENN\n'
         '<BUE_REMINDER> = „ja“\n'
         'DANN\n'
         '<BE-Flag> = „Erinnerung / Reminder“\n'
         'Aussteuerung und Verarbeitung beenden\n'
         'SONST\n'
         'Weiter\n'
         'Ende WENN\n'
         'WENN\n'
         '<BUE_PRUEFUNG_UNTERLAGEN> <> „Vollständig“\n'
         'UND <BUE_ANF_UNTERLAGEN> = „nein“\n'
         'DANN\n'
         '<BE-Flag> = „Unterlagen nicht vollständig“\n'
         'Aussteuerung und Verarbeitung beenden\n'
         'SONST\n'
         'Weiter zu „I. VN – Stammdaten + VNR“\n'
         'Ende WENN\n'
         'Sind Unterlagen unvollständig, aber <BUE_ANF_UNTERLAGEN> = „ja“, wird der Vorgang nicht ausgesteuert. '
         'Die fehlenden Unterlagen werden am Prozessende über die Notiz angefordert.\n'
         'Prüfnotiz: entspricht dem jeweils gesetzten <BE-Flag>.', ''),
    ])]

    # ============================================================ I. VN
    b += [('S', 'I. VN – Stammdaten + VNR')]

    b += [('K', 'VNR-Prüfung (Anwendung VA230)')]
    b += [('T', [
        ('Screenshot: VA230, Einstiegsmaske',
         'Lese <BUE_VNR> aus.\n'
         'Entferne führende Nullen, Leerzeichen, Prüfziffer und „-“, sofern vorhanden, und speichere als '
         'Variable „VNR-normalisiert“.\n'
         'Offener Punkt: Das automatische Auslesen der Versicherungsscheinnummern soll technisch und fachlich '
         'verbessert werden.', ''),
        ('Screenshot: VA230, Vertragsübersicht',
         'VA230 mit VNR-normalisiert öffnen.\n'
         'WENN\n'
         'Vertrag zu Variable „VNR-normalisiert“ nicht vorhanden\n'
         'DANN\n'
         'Merke „VNR nicht korrekt / nicht vorhanden“\n'
         'Weiter\n'
         'SONST\n'
         'Weiter\n'
         'Ende WENN\n'
         'Prüfnotiz: VNR nicht korrekt / nicht vorhanden.', ''),
        ('Screenshot: VA230, Feld Status und Spartenkürzel',
         'Lese das gelb markierte Feld „Sparte“ aus und speichere als Variable „VA230-Sparte“.\n'
         'Lese das gelb markierte Feld „Status“ aus und speichere als Variable „VA230-Status“.\n'
         'VA230-Sparte und VA230-Status werden für die Weiterleitung an den '
         'zuständigen BÜ-Bot benötigt.\n'
         'Dieser Schritt ist aus den Kommentaren des Prozessblatts entnommen und fachlich zu bestätigen.', ''),
    ])]

    b += [('K', 'Namensprüfung (Anwendung IS100)')]
    b += [('T', [
        ('Screenshot: IS100, gelb markiertes Feld Name',
         'IS100 mit VNR-normalisiert öffnen.\n'
         'Lese das gelb markierte Feld aus und speichere als Variable „IS100-Nachname“.\n'
         'WENN\n'
         'Variable „IS100-Nachname“ = leer\n'
         'ODER Variable „IS100-Nachname“ <> <BUE_KUNDE_NACHNAME>\n'
         'DANN\n'
         'Merke „Nachname abweichend“\n'
         'Weiter\n'
         'SONST\n'
         'Weiter\n'
         'Ende WENN\n'
         'Format: keine Ziffern, nur Buchstaben und Sonderzeichen, bis zu 60 Zeichen.\n'
         'Prüfnotiz: Nachname abweichend.', ''),
        ('Screenshot: IS100, gelb markiertes Feld Vorname',
         'Lese das gelb markierte Feld aus und speichere als Variable „IS100-Vorname“.\n'
         'WENN\n'
         'Variable „IS100-Vorname“ = leer\n'
         'ODER Variable „IS100-Vorname“ <> <BUE_KUNDE_VORNAME>\n'
         'DANN\n'
         'Merke „Vorname abweichend“ (Datenpool <BUE_KUNDE_VORNAME> gegen IS100-Vorname)\n'
         'Weiter\n'
         'SONST\n'
         'Weiter\n'
         'Ende WENN\n'
         'Format: keine Ziffern, nur Buchstaben und Sonderzeichen, bis zu 60 Zeichen.\n'
         'Prüfnotiz: Vorname abweichend.\n'
         'Offener Punkt: Juristische Personen sind noch zu betrachten.', ''),
    ])]

    b += [('K', 'Geburtsdatum (Anwendung IS100)')]
    b += [('T', [
        ('Screenshot: IS100, gelb markiertes Feld Geb.-Datum',
         'Lese das gelb markierte Feld aus und speichere als Variable „IS100-Gebdat“.\n'
         'WENN\n'
         'Variable „IS100-Gebdat“ = leer\n'
         'ODER Variable „IS100-Gebdat“ <> <BUE_KUNDE_GEBDAT>\n'
         'DANN\n'
         'Merke „Geb.-Datum abweichend“ (Datenpool <BUE_KUNDE_GEBDAT> gegen IS100-Gebdat)\n'
         'Weiter\n'
         'SONST\n'
         'Weiter\n'
         'Ende WENN\n'
         'Format: tt.mm.jjjj oder tt.mm.jj.\n'
         'Prüfnotiz: Geb.-Datum abweichend.', ''),
    ])]

    b += [('K', 'Adressprüfung (Anwendung IS100)')]
    b += [('T', [
        ('Screenshot: IS100, gelb markiertes Feld Straße',
         'Lese das gelb markierte Feld aus und speichere als Variable „IS100-Strasse“.\n'
         'WENN\n'
         'Variable „IS100-Strasse“ <> <BUE_KUNDE_STRASSE>\n'
         'DANN\n'
         'Merke „Straße abweichend“ (Datenpool <BUE_KUNDE_STRASSE> gegen IS100-Strasse)\n'
         'Weiter\n'
         'SONST\n'
         'Weiter\n'
         'Ende WENN\n'
         'Format: „Straße / Str. / etc. (z. B. Weg)“.\n'
         'Prüfnotiz: Straße abweichend.', ''),
        ('Screenshot: IS100, gelb markiertes Feld PLZ',
         'Lese das gelb markierte Feld aus und speichere als Variable „IS100-PLZ“.\n'
         'WENN\n'
         'Variable „IS100-PLZ“ <> <BUE_KUNDE_PLZ>\n'
         'DANN\n'
         'Merke „PLZ abweichend“ (Datenpool <BUE_KUNDE_PLZ> gegen IS100-PLZ)\n'
         'Weiter\n'
         'SONST\n'
         'Weiter\n'
         'Ende WENN\n'
         'Format: 5 Ziffern.\n'
         'Prüfnotiz: PLZ abweichend.', ''),
    ])]

    return b
