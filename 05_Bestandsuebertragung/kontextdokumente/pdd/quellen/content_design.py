# -*- coding: utf-8 -*-
"""Antworten der Design-Tabellen und Variablentabelle."""

# Design – Definition des zu bearbeitenden Elements (Antwort DE, answer EN)
ELEMENT = [
    ('Ein Postkorbeingang.\nGenauer: ein Bestandsübertragungs-Vorgang im EWMS-Postkorb mit den zugehörigen '
     'Vorgangsdaten im Datenpool.', ''),
    ('Vorgang-Lfd-Nr des Postkorbvorgangs.\nErgänzender Ordnungsbegriff für das Reporting: die geprüfte '
     'Versicherungsscheinnummer.', ''),
    ('Nein.\nNach erfolgreicher Verarbeitung ist der Vorgang mit bestückter Notiz an den BÜ-Bot bzw. den '
     '72-Stunden-BOT übergeben.\nOffener Punkt: Es ist zu bestätigen, wie eine erneute Zuweisung desselben '
     'Postkorbvorgangs an den Roboter behandelt werden soll.', ''),
    ('Ja, jedoch nur vollständig von vorne.\nDer Prüf-Bot speichert keine Zwischenstände. Ein abgebrochener '
     'Vorgang wird beim Wiederanlauf komplett neu durchlaufen.\nDie Prüfschritte in VA230, IS100, OB726, GH040 '
     'und EOS sind lesend. Schreibende Schritte sind die Notizbestückung sowie die Weiterleitung bzw. Ablage am '
     'Prozessende; ein Wiederanlauf ist zulässig, solange diese noch nicht erfolgt sind.\nTechnisch zu '
     'bestätigen.', ''),
]

LIEFERUNG = [
    ('Noch nicht final abgestimmt und steht zur Klärung. Vorgesehen ist die Eröffnung des Postkorbvorgangs mit '
     'vollständig im Datenpool vorliegenden Vorgangsdaten.',
     'By input management / the scanning unit via the EWMS mailbox. The cover sheet data is written to the data pool '
     'automatically by the AI extraction.'),
    ('Arbeitstäglich, laufend. Die Taktung ist noch in Klärung und wird mit dem Robotics-Betrieb abgestimmt.',
     'Every working day, continuously. The robot reads the mailbox at least hourly between 06:00 and 20:00; the final '
     'schedule is agreed with robotics operations.'),
    ('Ja. Peaks entstehen zu Monatsbeginn sowie bei der Übertragung ganzer Bestände (Maklerwechsel, Poolwechsel), '
     'bei denen mehrere hundert Einzelvorgänge an einem Tag eingehen können.',
     'Yes. Peaks occur at the beginning of the month and when entire portfolios are transferred (change of broker or '
     'pool), where several hundred individual cases may arrive on a single day.'),
    ('Ja. Bleibt die Lieferung an einem Arbeitstag vollständig aus, versendet der Roboter eine Information an den '
     'Betriebsinformationsempfänger (Gruppenpostfach), damit die vorgelagerte Befüllung des Datenpools geprüft werden kann.',
     'Yes. If no delivery arrives on a working day, the robot sends a notification to the operations contact (group '
     'mailbox) so that the cover sheet extraction chain can be checked.'),
]

SYNCHRONITAET = [
    ('Nein. Innerhalb des Prüf-Bots gibt es keine Wartezustände und keine Wiedervorlage. Die Weiterverarbeitung erfolgt '
     'asynchron durch den nachgelagerten BÜ-BOT bzw. den 72-Stunden-BOT.',
     'No. There are no waiting states and no resubmission within the checking bot. Further processing is carried out '
     'asynchronously by the downstream transfer bot or the 72-hour bot.'),
    ('Ja. Die Vorgangsdokumente unterliegen dem Löschkonzept des EWMS; der Prüf-Bot legt keine eigenen Dateien ab. '
     'Vom Roboter empfangene und versendete Mails werden nach 6 Monaten gelöscht.',
     'Yes. The case documents are subject to the EWMS deletion concept; the checking bot does not store any files of its '
     'own. Mails received and sent by the robot are deleted after 6 months.'),
    ('Nein. Es wird ausschließlich lesend auf Hostanwendungen und den Datenpool zugegriffen. Gemeinsam genutzte Dateien '
     'werden nicht verwendet.',
     'No. Host applications and the data pool are accessed read-only. No shared files are used.'),
]

HOUSEKEEPING = [
    None,  # Zeile 1 ist im Template bereits mit "6 Monate" befüllt
    ('<Themenpostkorb gezielt benennen – durch Fachbereich zu liefern>',
     '<Topic mailbox portfolio transfer – to be named by the business unit>'),
    ('Mails, die nicht dem definierten Eingangskanal entsprechen, werden unverändert an den unter Zeile 2 genannten '
     'Verteiler weitergeleitet und anschließend aus dem Bot-Postfach gelöscht. Der Bot beantwortet sie nicht.',
     'Mails that do not match the defined input channel are forwarded unchanged to the distribution list named in row 2 '
     'and then deleted from the bot mailbox. The bot does not reply to them.'),
    None,  # Zeile 4 ist im Template bereits befüllt
]

# Variablentabelle: (Name, Kurzbeschreibung, Herkunft, Pflichtfeld, Bemerkung)
# Datenpoolfelder laut Feldbezeichnungsliste. Die dort gestrichenen Felder BUE_LFD_NR,
# BUE_STATUS und BUE_VORGANGSTYP sind entfallen. Auspraegungen und Formate entsprechen
# dem Datenpool. Feld_Format nach ICR-Konvention: CH = Text, NU = Zahl, DA = Datum,
# JN = Boolean; die Feldlaenge betraegt immer 50 Zeichen.
VARIABLEN = [
    ('BUE_VERMITTLER_TYP', 'Typ des übernehmenden Vermittlers',
     'Datenpool', 'Pflichtfeld',
     'Feld_Format CH. Ausprägungen: Makler, MFA. Wird mitgeführt und in die Notiz übernommen, keine eigene Prüfung.'),
    ('BUE_KUNDE_NACHNAME', 'Nachname des Versicherungsnehmers des Versicherungsnehmers',
     'Datenpool, Feld „Kunde_Nachname“', 'Pflichtfeld',
     'Feld_Format CH. Abgleich gegen IS100. Keine Ziffern, nur Buchstaben und Sonderzeichen, bis zu 60 Zeichen.'),
    ('BUE_KUNDE_VORNAME', 'Vorname des Versicherungsnehmers des Versicherungsnehmers',
     'Datenpool, Feld „Kunde_Vorname“', 'Pflichtfeld',
     'Feld_Format CH. Abgleich gegen IS100. Keine Ziffern, nur Buchstaben und Sonderzeichen, bis zu 60 Zeichen.'),
    ('BUE_KUNDE_GEBDAT', 'Geburtsdatum des Versicherungsnehmers',
     'Datenpool, Feld „Geburtsdatum VN“', 'optional',
     'Feld_Format DA. Format tt.mm.jjjj. Ist das Feld leer, entfällt die Prüfung.'),
    ('BUE_KUNDE_STRASSE', 'Straßenname und Hausnummer des Versicherungsnehmers',
     'Datenpool, Feld „Kunde_Strasse“', 'optional',
     'Feld_Format CH. Der Datenpool liefert „Straße“ grundsätzlich als „Str.“; IS100 ist vor dem Vergleich '
     'entsprechend zu normalisieren.'),
    ('BUE_KUNDE_PLZ', 'Postleitzahl des Versicherungsnehmers',
     'Datenpool, Feld „Kunde_PLZ“', 'optional', 'Feld_Format CH. 5 Ziffern.'),
    ('BUE_KUNDE_ORT', 'Wohnort des Versicherungsnehmers',
     'Datenpool, Feld „Kunde_Ort“', 'optional',
     'Feld_Format CH. Wird mitgeführt, keine eigene Prüfung.'),
    ('BUE_VNR', 'Versicherungsnummer des zu übertragenden Vertrags',
     'Datenpool, Feld „Versicherungsnummer“', 'Pflichtfeld',
     'Feld_Format CH. Originalform aus dem Dokument inklusive Buchstaben-Präfix, führender Nullen und Suffixen. '
     'Mehrere Verträge kommagetrennt; je Vertrag wird ein Schleifendurchlauf ausgeführt.'),
    ('BUE_SPARTE', 'Sparte des Vertrags als Kürzel',
     'Datenpool, Feld „Sparte“', 'Pflichtfeld',
     'Feld_Format CH. Ausprägungen KO, KV, LF, KR, abgeleitet aus dem Buchstaben-Präfix der Versicherungsnummer. '
     'Für die Weiterleitung ist Sparte-Vertrag aus VA230 maßgeblich.'),
    ('BUE_MV_VN_NACHNAME', 'Nachname des Vollmachtgebers laut Maklervollmacht',
     'Datenpool, Feld „MV_VN_Nachname“', 'Pflichtfeld wenn MV enthalten',
     'Feld_Format CH. Abgleich gegen BUE_KUNDE_NACHNAME.'),
    ('BUE_MV_VN_VORNAME', 'Vorname des Vollmachtgebers laut Maklervollmacht',
     'Datenpool, Feld „MV_VN_Vorname“', 'optional',
     'Feld_Format CH. Wird mitgeführt, keine eigene Prüfung.'),
    ('BUE_POOL', 'Maklerpool bzw. Abwickler, über den eingereicht wird',
     'Datenpool, Feld „Pool“', 'optional',
     'Feld_Format CH. Konsolidierter Poolname oder leer. Wird in die Notiz übernommen.'),
    ('BUE_VERMITTLER_NAME', 'Name des übernehmenden Maklerunternehmens bzw. der Person',
     'Datenpool, Feld „Vermittler“', 'Pflichtfeld',
     'Feld_Format CH. Abgleich gegen OB726. Enthält der Name in OB726 den Bestandteil „Inaktiv“, wird '
     '„Keine Zusammenarbeit“ in die BE-Liste eingetragen.'),
    ('BUE_AGENTUR_NR', 'Agenturnummer des Maklers beim Versicherer',
     'Datenpool, Feld „Agentur-Nr“', 'Pflichtfeld, alternativ zu BUE_VERMITTLER_NR',
     'Feld_Format CH. 7 bis 9 Ziffern nach der Bereinigung; achtstellige Werte sind die neuen Agenturen nach ZAV.'),
    ('BUE_VERMITTLER_NR', 'Personal- bzw. Vermittlernummer des Maklers beim Versicherer',
     'Datenpool, Feld „Personalnummer“', 'Pflichtfeld, alternativ zu BUE_AGENTUR_NR',
     'Feld_Format CH. Weniger als 7 Ziffern nach der Bereinigung, in der Regel 5 oder 6; neu vergebene PNR '
     'sind 7-stellig.'),
    ('BUE_MAKLER_EMAIL', 'Absenderadresse der Mail, mit der der Vorgang eingereicht wurde',
     'Datenpool, Feld „Makler_E-Mail“', 'Pflichtfeld',
     'Feld_Format CH. Ist das Feld leer, wird die Adresse über OB729 zur Agenturnummer ermittelt. Adressen der '
     'Domäne ergo.de führen zur Business Exception.'),
    ('BUE_MAKLER_STRASSE', 'Straßenname und Hausnummer des Maklers',
     'Datenpool, Feld „Makler_Strasse“', 'optional',
     'Feld_Format CH. Wird mitgeführt, keine eigene Prüfung.'),
    ('BUE_MAKLER_PLZ', 'Postleitzahl des Maklers', 'Datenpool, Feld „Makler_PLZ“', 'optional',
     'Feld_Format CH. Wird mitgeführt, keine eigene Prüfung.'),
    ('BUE_MAKLER_ORT', 'Ort des Maklers', 'Datenpool, Feld „Makler_Ort“', 'optional',
     'Feld_Format CH. Wird mitgeführt, keine eigene Prüfung.'),
    ('BUE_KLASSIFIKATION', 'Fachliche Einordnung des Anliegens',
     'Datenpool, Feld „Klassifikation“', 'Pflichtfeld',
     'Feld_Format CH. Ausprägungen: BÜ-Vorgang, Anfrage-Ruecksprache, Antrag-Aenderung, Schadenmeldung, '
     'Nicht-Standard, Kein-Makler-Vorgang. Nur „BÜ-Vorgang“ wird weiterverarbeitet.'),
    ('BUE_WUNSCH_VORHANDEN', 'Enthält die Mail einen ausformulierten Auftrag zur Bestandsübertragung?',
     'Datenpool, Feld „BÜ-Wunsch vorhanden“', 'Pflichtfeld',
     'Feld_Format JN. Ausprägungen ja, nein. Bei „nein“ Business Exception.'),
    ('BUE_PRUEFUNG_UNTERLAGEN', 'Abgeleitete Vollständigkeitsprüfung der eingereichten Unterlagen',
     'Datenpool, Feld „Prüfung Unterlagen“', 'Pflichtfeld',
     'Feld_Format CH. Ausprägungen: leer, „Reminder - keine Vollst.-Prüfung“, „Vollständig“, „BÜ-Wunsch fehlt“, '
     '„MV fehlt“, „MV unvollständig“, „VN-Unterschrift fehlt“. Mehrere Mängel kommagetrennt. Das Feld fasst die '
     'Bewertung der Vollmachtsfelder bereits zusammen.'),
    ('BUE_REMINDER', 'Handelt es sich um eine Erinnerung zu einem bereits eingereichten Vorgang?',
     'Datenpool, Feld „Reminder/Wiedervorlage“', 'Pflichtfeld',
     'Feld_Format JN. Ausprägungen ja, nein. Bei „ja“ Business Exception.'),
    ('BUE_MV_ENTHALTEN', 'Liegt der Mail eine Maklervollmacht bei?',
     'Datenpool, Feld „MV enthalten“', 'Pflichtfeld',
     'Feld_Format JN. Ausprägungen ja, nein.'),
    ('BUE_MV_STATUS', 'Zusammenfassender Status der Maklervollmacht',
     'Datenpool, Feld „MV-Status“', 'Pflichtfeld',
     'Feld_Format CH. Ausprägungen: OK, MV unvollständig, MV fehlt, kein Anhang, nicht prüfbar.'),
    ('BUE_MV_AUF_MAKLER', 'Ist die Vollmacht explizit auf den Makler ausgestellt oder blanko?',
     'Datenpool, Feld „MV auf Makler ausgestellt“', 'optional',
     'Feld_Format CH. Ausprägungen: ja, nein, nicht prüfbar. Wird mitgeführt; die Bewertung ist bereits in '
     'BUE_PRUEFUNG_UNTERLAGEN enthalten.'),
    ('BUE_MV_VOLLUMFAENGLICH', 'Deckt die Vollmacht den gesamten Bestand ab?',
     'Datenpool, Feld „MV vollumfänglich“', 'optional',
     'Feld_Format CH. Ausprägungen: ja, teilweise, nein, nicht prüfbar. Wird mitgeführt; die Bewertung ist '
     'bereits in BUE_PRUEFUNG_UNTERLAGEN enthalten.'),
    ('BUE_MV_UNTERSCHRIFT_KUNDE', 'Hat der Versicherungsnehmer die Maklervollmacht unterschrieben?',
     'Datenpool, Feld „Unterschrift Kunde“', 'optional',
     'Feld_Format CH. Ausprägungen: ja, nein, nicht prüfbar. Wird mitgeführt; die Bewertung ist bereits in '
     'BUE_PRUEFUNG_UNTERLAGEN enthalten. Der Feldname nutzt die maximal zulässigen 25 Zeichen.'),
    ('BUE_UV_ERTEILT', 'Wurde eine Untervollmacht an einen weiteren Makler oder Pool erteilt?',
     'Datenpool, Feld „Untervollmacht erteilt“', 'optional',
     'Feld_Format CH. Ausprägungen: ja, nein, nicht prüfbar. Steuert in der Krankenversicherung die Ausprägung '
     '„BÜ mit UV“ des Notizfeldes „Bearbeitung nach“. In Komposit und Leben kennt die Notizvorlage BOT1515 '
     'diese Ausprägung nicht; das Feld wird dort nur mitgeführt.'),
    ('BUE_UV_FEHLT', 'Kennzeichen, ob eine erforderliche Untervollmacht fehlt',
     'Datenpool', 'optional',
     'Feld_Format JN. Steuert die Ausprägung „Bearbeitung nach“ in der Notiz und ist kein Ablehnungsgrund. '
     'Offener Punkt: Das Feld ist in der Datenpoolliste enthalten, hat aber im Datenpool keine Entsprechung; '
     'die Herleitung ist zu bestätigen.'),
    ('BUE_MV_UNTERSCHRIFTSDATUM', 'Datum, an dem der Kunde die Maklervollmacht unterschrieben hat',
     'Datenpool, Feld „MV_Unterschriftsdatum“', 'optional',
     'Feld_Format DA. Format tt.mm.jjjj. Wird mitgeführt, keine eigene Prüfung. Der Feldname nutzt die maximal '
     'zulässigen 25 Zeichen.'),
    ('BUE_MV_EINGANGSDATUM', 'Eingangsdatum der Maklervollmacht bzw. des Betreuungswunsches',
     'Datenpool, Feld „MV_Eingangsdatum“', 'Pflichtfeld',
     'Feld_Format DA. Format tt.mm.jjjj. Ist das Feld leer, wird das Eröffnungsdatum des Postkorbvorgangs '
     'verwendet. Pflichtfeld der Notiz.'),

    ('BUE_ANF_UNTERLAGEN', 'Kennzeichen, ob beim übernehmenden Makler Unterlagen angefordert werden müssen',
     'Datenpool, Feld „Anforderung Unterlagen“', 'Pflichtfeld',
     'Feld_Format JN. Ausprägungen: ja, nein. Bei „ja“ wird der Vorgang nicht ausgesteuert; die Unterlagen '
     'werden über die Notiz angefordert.'),
    ('BUE_ART_UNTERLAGEN', 'Art der anzufordernden Unterlagen',
     'Datenpool, Feld „Art der Unterlagen“', 'Pflichtfeld wenn BUE_ANF_UNTERLAGEN = ja',
     'Feld_Format CH. Freitext, mehrere Angaben mit Semikolon getrennt. Steuert die Kennzeichen im Abschnitt '
     '„Folgearbeit für Komposit“ bzw. „Anforderung von Unterlagen“ der Notiz.'),

    ('Vorgang-Lfd-Nr', 'Laufende Nummer des Postkorbvorgangs; Ordnungsbegriff des Roboters',
     'EWMS-Postkorb, Schritt „Postkorbvorgang lesen“', 'Pflichtfeld',
     'Ordnungsbegriff für Queue und Reporting. Wird in der Notiz im Feld „Laufende Nr. aus Vorgangsdatenbank“ '
     'übergeben.'),
    ('Eingangsdatum-BUE', 'Maßgebliches Eingangsdatum des Vorgangs',
     'Abgeleitet: BUE_MV_EINGANGSDATUM, sonst EWMS-Postkorb, Eröffnungsdatum', 'Pflichtfeld',
     'Format tt.mm.jjjj. Pflichtfeld der Notiz.'),
    ('VNR-normalisiert', 'Bereinigte Versicherungsscheinnummer für den Hostaufruf',
     'Abgeleitet aus BUE_VNR, Schritt „Versicherungsscheinnummer normalisieren“', 'Pflichtfeld',
     'Ohne führende Nullen, Leerzeichen, Bindestriche, Punkte und Prüfziffer.'),
    ('Vertragsstatus', 'Status des Vertrags', 'VA230, Schritt „Vertragsstatus und Sparte auslesen“', 'Pflichtfeld',
     'Nur der Status „aktuell“ führt zur Weiterverarbeitung; sonst „Storno“.'),
    ('Sparte-Vertrag', 'Spartenkürzel des Vertrags aus dem Bestandssystem (KV oder Non-KV)',
     'VA230, Schritt „Vertragsstatus und Sparte auslesen“', 'Pflichtfeld',
     'Steuert die Trennung der Sparte und damit die Weiterleitung an BOT2011 oder BOT1515.'),
    ('AGT-Bestandsinhaber', 'Agentur-Nr. (A…) des bisherigen Bestandsinhabers',
     'VA230, Schritt „Agentur-Nr. des Bestandsinhabers ermitteln“', 'Pflichtfeld',
     'Grundlage für die Ermittlung des Vertriebskanals; wird in die Notiz übernommen.'),
    ('IS100-Nachname', 'Nachname des Versicherungsnehmers im Bestandssystem',
     'IS100, Schritt „IS100 aufrufen und Stammdaten auslesen“, gelb markiertes Feld Nr. 1', 'Pflichtfeld',
     'Abgleich gegen BUE_KUNDE_NACHNAME, hartes Kriterium.'),
    ('IS100-Vorname', 'Vorname des Versicherungsnehmers im Bestandssystem',
     'IS100, gelb markiertes Feld Nr. 2', 'optional', 'Abgleich gegen BUE_KUNDE_VORNAME, weiches Kriterium.'),
    ('IS100-Gebdat', 'Geburtsdatum des Versicherungsnehmers im Bestandssystem',
     'IS100, gelb markiertes Feld Nr. 3', 'optional', 'Abgleich gegen BUE_KUNDE_GEBDAT, weiches Kriterium.'),
    ('IS100-Strasse', 'Straße des Versicherungsnehmers im Bestandssystem',
     'IS100, gelb markiertes Feld Nr. 4', 'optional', 'Abgleich gegen BUE_KUNDE_STRASSE, weiches Kriterium.'),
    ('IS100-PLZ', 'Postleitzahl des Versicherungsnehmers im Bestandssystem',
     'IS100, gelb markiertes Feld Nr. 5', 'optional', 'Abgleich gegen BUE_KUNDE_PLZ, weiches Kriterium.'),
    ('AGT-Uebernehmer', 'Agentur-Nr. (A…) des übernehmenden Vermittlers',
     'OB726 bzw. EOS, Schritt „Stammagentur-Nr. ermitteln“', 'Pflichtfeld',
     'Pflichtfeld der Notiz (Feld Agenturnummer).'),
    ('PNR-Uebernehmer', 'Vermittler-Nr. (PNR) des übernehmenden Vermittlers',
     'OB726, Schritt „Variante A“ bzw. „Variante B“', 'Pflichtfeld',
     'Pflichtfeld der Notiz (Feld Personalnummer bzw. KNR Makler).'),
    ('Name-Uebernehmer', 'Name des übernehmenden Vermittlers aus dem Bestandssystem',
     'OB726, Schritt „Name des übernehmenden Maklers prüfen“', 'Pflichtfeld',
     'Pflichtfeld der Notiz (Feld Maklername).'),
    ('Klassifizierung-Vermittler', 'Klassifizierung des übernehmenden Vermittlers',
     'OB726, Schritt „Klassifizierung auslesen“', 'Pflichtfeld',
     'Ausprägungen: Makler, Mehrfachagent, Courtagefortzahler.'),
    ('Anbindung-Uebernehmer', 'Anbindungsstatus des übernehmenden Vermittlers',
     'GH040, Schritt „Anbindung des übernehmenden Vermittlers prüfen“', 'Pflichtfeld',
     'Ausprägungen aktiv, inaktiv. Bei „inaktiv“ Eintrag „Keine Zusammenarbeit“ in die BE-Liste.'),
    ('Anbindung-Bestandsinhaber', 'Anbindungsstatus des bisherigen Bestandsinhabers',
     'GH040, Schritt „Anbindung des Bestandsinhabers prüfen“', 'Pflichtfeld',
     'Ausprägungen aktiv, inaktiv.'),
    ('Makler-Email', 'E-Mail-Adresse für die Ablehnungs- oder Informationsinformation',
     'Abgeleitet, Schritt „E-Mail-Adresse des übernehmenden Vermittlers ermitteln“', 'Pflichtfeld',
     'Quelle in fester Reihenfolge: Sonderliste TOP-Makler, BUE_MAKLER_EMAIL, OB729.'),
    ('Vertriebskanal', 'Vertriebskanal des bisherigen Bestandsinhabers',
     'Abgeleitet aus AGT-Bestandsinhaber, Schritt „Vertriebskanal ermitteln“', 'Pflichtfeld',
     'Ausprägungen: AO, Makler, unbesetzte Agentur.'),
    ('Vorgangstyp-BUE', 'Richtung der Bestandsübertragung',
     'Abgeleitet aus Vertriebskanal, Schritt „Vorgangstyp bestimmen“', 'Pflichtfeld',
     'Ausprägungen: Makler zu Makler, AO zu Makler. Steuert die Weiterleitung an den 72-Stunden-BOT und die '
     'Zuordnung des Zielpostkorbs.'),
    ('Bearbeitung-nach', 'Ausprägung des Notizfeldes „Bearbeitung nach“',
     'Abgeleitet, Schritt „Maklervollmacht prüfen“', 'Pflichtfeld',
     'Wird in der Notiz gesetzt; die Ausprägungen unterscheiden sich je Notizvorlage.'),
    ('BE-Liste', 'Sammlung aller Business Exceptions des Vorgangs',
     'Abgeleitet aus allen Prüfschritten', 'Pflichtfeld',
     'Liste aus Ablehnungsgrund und Prüfnotiz. Jede fehlgeschlagene Prüfung erzeugt einen Eintrag; die '
     'Verarbeitung läuft weiter. Wird im Kapitel „BE überprüfen und priorisieren“ bewertet: leer ergibt '
     'Übergabe an den BÜ-Bot, ein Eintrag ergibt die Reaktion laut Zuordnungstabelle, mehrere Einträge '
     'ergeben Aussteuerung.'),
    ('Reaktion', 'Ergebnis der Priorisierung der Ablehnungsgründe',
     'Abgeleitet, Schritt „Ablehnungsgründe priorisieren“', 'optional',
     'Ausprägungen: direkte Ablehnungsinformation, Information an den übernehmenden Makler, Aussteuerung.'),
]

VARIABLEN_KV_ZUSATZ = [
    ('KNR-Uebernehmer', 'Kundennummer (KNR) des übernehmenden Maklers',
     'OB726, Schritt „Name des übernehmenden Maklers prüfen“', 'Pflichtfeld',
     'Feld „KNR Makler“ der Notizvorlage BOT2011.'),
    ('KNR-Abgebender', 'Kundennummer (KNR) des abgebenden Maklers',
     'OB726 über AGT-Bestandsinhaber', 'optional',
     'Feld „KNR abgebender Makler“ der Notizvorlage BOT2011. Entfällt, wenn der Bestandsinhaber der AO '
     'zugeordnet ist.'),
    ('KNR-UV', 'Kundennummer (KNR) des Unterbevollmächtigten',
     'OB726 über den im Datenpool genannten Unterbevollmächtigten', 'optional',
     'Feld „KNR UV“ der Notizvorlage BOT2011, sofern BUE_UV_ERTEILT = ja.'),
]

VARIABLEN_KL_ZUSATZ = []
