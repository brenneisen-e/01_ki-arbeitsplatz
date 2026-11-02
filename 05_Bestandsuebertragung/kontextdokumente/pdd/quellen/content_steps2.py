# -*- coding: utf-8 -*-
"""Schritt-fuer-Schritt-Beschreibung, Teil 2. Notation wie Teil 1."""


def steps2(v):
    KV = (v == 'KV')
    bot = 'BOT2011' if KV else 'BOT1515'
    b = []

    # ============================================================ II. Makler
    b += [('S', 'II. Übernehmender Makler – Agenturnummer/Vermittler-Nr. (PNR)')]

    b += [('K', 'Agenturnummer (A,…) des übernehmenden Maklers (Anwendung OB726)')]
    b += [('T', [
        ('',
         'WENN\n'
         '<BUE_AGENTUR_NR> = leer\n'
         'DANN\n'
         'Weiter zum fachlichen Kontext „Vermittler-Nr. (PNR) des übernehmenden Maklers“\n'
         'SONST\n'
         'Weiter\n'
         'Ende WENN', ''),
        ('Screenshot: OB726, Einstieg über Agenturnummer',
         'OB726 mit <BUE_AGENTUR_NR> öffnen.\n'
         'WENN\n'
         'Agentur zu <BUE_AGENTUR_NR> nicht vorhanden\n'
         'DANN\n'
         'Merke „Agenturnummer abweichend“\n'
         'Weiter\n'
         'SONST\n'
         'Variable „AGT-Uebernehmer“ = <BUE_AGENTUR_NR>\n'
         'Weiter\n'
         'Ende WENN\n'
         'Format: 7-9 stellige Zahlen.\n'
         'Prüfnotiz: Agenturnummer abweichend.', ''),
        ('Screenshot: OB726, Feld Name des Maklers',
         'Lese das gelb markierte Feld aus und speichere als Variable „OB726-Name“.\n'
         'WENN\n'
         'Variable „OB726-Name“ <> <BUE_VERMITTLER_NAME>\n'
         'DANN\n'
         'Merke „Name übernehmender Makler abweichend“\n'
         'Weiter\n'
         'SONST\n'
         'Weiter\n'
         'Ende WENN\n'
         'Format: Ziffern, Buchstaben und Sonderzeichen, bis zu 60 Zeichen.\n'
         'Prüfnotiz: Name übernehmender Makler abweichend.', ''),
        ('',
         'WENN\n'
         'Variable „OB726-Name“ enthält „INAKTIV“\n'
         'DANN\n'
         'Merke „Keine Zusammenarbeit“\n'
         'Weiter\n'
         'SONST\n'
         'Weiter\n'
         'Ende WENN', ''),
        ('Screenshot: OB726, Feld Vermittler-Nr. (PNR)',
         'Lese das gelb markierte Feld aus und speichere als Variable „OB726-PNR“.\n'
         'WENN\n'
         'Variable „OB726-PNR“ = leer\n'
         'DANN\n'
         'Merke „Vermittlernummer / PNR abweichend“\n'
         'Weiter\n'
         'SONST\n'
         'Weiter\n'
         'Ende WENN\n'
         'Format: < 7 stellige Zahlen (neue PNR = 7 stellig).\n'
         'Prüfnotiz: Vermittlernummer / PNR abweichend.', ''),
        ('Screenshot: GH040, Anbindungsstatus',
         'GH040 mit OB726-PNR öffnen.\n'
         'Lese das gelb markierte Feld aus und speichere als Variable „GH040-Anbindung-Makler“.\n'
         'WENN\n'
         'Variable „GH040-Anbindung-Makler“ <> „aktiv“\n'
         'DANN\n'
         'Merke „Keine Zusammenarbeit“\n'
         'Weiter\n'
         'SONST\n'
         'Weiter\n'
         'Ende WENN', ''),
        ('Screenshot: OB726, Feld Klassifizierung',
         'Lese das gelb markierte Feld aus und speichere als Variable „OB726-Klassifizierung“.\n'
         'Format: Makler, Mehrfachagent, Courtagefortzahler.\n'
         'Weiter', ''),
        ('',
         'Variable „Makler-Email“ = <BUE_MAKLER_EMAIL>\n'
         'WENN\n'
         'Variable „Makler-Email“ endet auf „@ergo.de“\n'
         'DANN\n'
         'Merke „Absender ist eine interne ERGO-Adresse“\n'
         'Weiter\n'
         'SONST\n'
         'Weiter\n'
         'Ende WENN\n'
         'Offener Punkt: Für fünf TOP-Makler soll die E-Mailadresse fest vorgegeben werden, eventuell über PNR '
         'und E-Mailadresse. Die Liste ist zu liefern.', ''),
    ])]

    b += [('K', 'Vermittler-Nr. (PNR) des übernehmenden Maklers (Anwendung OB726)')]
    b += [('T', [
        ('Screenshot: OB726, Einstieg über Vermittler-Nr.',
         'OB726 mit <BUE_VERMITTLER_NR> öffnen.\n'
         'WENN\n'
         'Vermittler zu <BUE_VERMITTLER_NR> nicht vorhanden\n'
         'DANN\n'
         'Merke „Vermittlernummer / PNR abweichend“\n'
         'Weiter\n'
         'SONST\n'
         'Variable „OB726-PNR“ = <BUE_VERMITTLER_NR>\n'
         'Weiter\n'
         'Ende WENN\n'
         'Format: < 7 stellige Zahlen (neue PNR = 7 stellig).', ''),
        ('Screenshot: OB726, Feld Name des Maklers',
         'Lese das gelb markierte Feld aus und speichere als Variable „OB726-Name“.\n'
         'WENN\n'
         'Variable „OB726-Name“ <> <BUE_VERMITTLER_NAME>\n'
         'ODER Variable „OB726-Name“ enthält „INAKTIV“\n'
         'DANN\n'
         'Merke „Name übernehmender Makler abweichend“\n'
         'Weiter\n'
         'SONST\n'
         'Weiter\n'
         'Ende WENN', ''),
        ('Screenshot: GH040, Anbindungsstatus',
         'GH040 mit OB726-PNR öffnen.\n'
         'Lese das gelb markierte Feld aus und speichere als Variable „GH040-Anbindung-Makler“.\n'
         'WENN\n'
         'Variable „GH040-Anbindung-Makler“ <> „aktiv“\n'
         'DANN\n'
         'Merke „Keine Zusammenarbeit“\n'
         'Weiter\n'
         'SONST\n'
         'Weiter\n'
         'Ende WENN', ''),
        ('Screenshot: EOS, Zuordnung Vermittler-Nr. zu Stammagentur',
         'EOS mit OB726-PNR öffnen.\n'
         'Lese die Stammagentur-Nr. (A,…) aus und speichere als Variable „AGT-Uebernehmer“.\n'
         'WENN\n'
         'Variable „AGT-Uebernehmer“ = leer\n'
         'DANN\n'
         'Merke „Stammagentur nicht ermittelbar“\n'
         'Weiter\n'
         'SONST\n'
         'Weiter\n'
         'Ende WENN\n'
         'Offener Punkt: Nach welchen Kriterien wird die Stammagentur ermittelt? Zusätzlich ist ein '
         'Datenschutzthema zu klären.', ''),
        ('',
         'Variable „Makler-Email“ = <BUE_MAKLER_EMAIL>\n'
         'Weiter', ''),
    ])]

    b += [('K', 'Agentur-Nr. (A,…) des Bestandsinhabers ermitteln')]
    b += [('T', [
        ('Screenshot: VA230, Feld Agentur-Nr. des Bestandsinhabers',
         'VA230 mit VNR-normalisiert öffnen.\n'
         'Lese das gelb markierte Feld aus und speichere als Variable „VA230-AGT-Inhaber“.', ''),
        ('Screenshot: GH040, Anbindungsstatus des Bestandsinhabers',
         'GH040 mit VA230-AGT-Inhaber öffnen.\n'
         'Lese das gelb markierte Feld aus und speichere als Variable „GH040-Anbindung-Inhaber“.\n'
         'WENN\n'
         'Variable „GH040-Anbindung-Inhaber“ <> „aktiv“\n'
         'DANN\n'
         'Merke „Anbindung Bestandsinhaber nicht aktiv“\n'
         'Weiter\n'
         'SONST\n'
         'Weiter\n'
         'Ende WENN\n'
         'Die Anbindungsprüfung ist vor allem für den Bestandsinhaber relevant.', ''),
    ])]

    b += [('K', 'Ermittlung Vertriebskanal')]
    b += [('T', [
        ('',
         'Lese den Vertriebskanal zu VA230-AGT-Inhaber aus und speichere als Variable '
         '„Vertriebskanal“.\n'
         'Format: AO (Ausschließlichkeitsorganisation), Makler, unbesetzte Agentur.\n'
         'Offener Punkt: Die Kriterien zur Ermittlung des Vertriebskanals sind in diesem PDD vollständig zu '
         'beschreiben. Ein Verweis auf das PDD des 72-Stunden-BOT ist nicht ausreichend. Die Nummernkreise '
         'bzw. die Ableitungsregel sind vom Fachbereich zu liefern.', ''),
        ('',
         'WENN\n'
         'Variable „Vertriebskanal“ = „AO“\n'
         'DANN\n'
         'Variable „Vorgangstyp-BUE“ = „AO zu Makler“\n'
         'SONST\n'
         'Variable „Vorgangstyp-BUE“ = „Makler zu Makler“\n'
         'Ende WENN', ''),
    ])]

    # ============================================================ BE
    b += [('S', 'BE überprüfen und priorisieren')]
    b += [('K', 'Ablehnungsgründe auswerten und priorisieren')]
    b += [('T', [
        ('',
         'An dieser Stelle sind alle Prüfungen durchlaufen. Jede fehlgeschlagene Prüfung wurde unterwegs nur '
         'gemerkt; das <BE-Flag> wird erst jetzt gesetzt.\n'
         'Bearbeitungsnotiz = alle gemerkten Gründe\n'
         'WENN\n'
         'es wurde kein Grund gemerkt\n'
         'DANN\n'
         'Weiter zum System „Weiterleitung an den BÜ-Bot“\n'
         'SONST\n'
         'Weiter\n'
         'Ende WENN\n'
         'Für die Weiterleitung der BE ist Vorgangstyp-BUE maßgeblich.', ''),
        ('',
         'WENN\n'
         'es wurde mehr als ein Grund gemerkt\n'
         'DANN\n'
         '<BE-Flag> = „Mehrere Ablehnungsgründe“\n'
         'Bearbeitungsnotiz am Postkorbvorgang hinterlegen\n'
         'Vorgang an den Themenpostkorb weiterleiten\n'
         'Aussteuerung und Verarbeitung beenden\n'
         'SONST\n'
         'Weiter\n'
         'Ende WENN', ''),
        ('',
         'Es wurde genau ein Grund gemerkt. Setze <BE-Flag> auf diesen Grund und bestimme die Reaktion:\n'
         '- „VN passt nicht zu Maklervollmacht“ ergibt direkte Ablehnungsinformation an den übernehmenden '
         'Vermittler\n'
         '- „Historischer Vertrag / Storno“ ergibt direkte Ablehnungsinformation\n'
         '- „Übertragung bereits erfolgt“ ergibt Information an den übernehmenden Makler\n'
         '- „Keine Zusammenarbeit“ ergibt direkte Ablehnungsinformation\n'
         '- „Maklervollmacht nicht vorhanden“ ergibt direkte Ablehnungsinformation\n'
         + ('- „Courtagefortzahler“ ergibt Aussteuerung\n' if KV else
            '- „Courtagefortzahler“ ergibt automatische Ablehnung an den übernehmenden Makler und Übertragung '
            'des Vertrags auf die unbesetzte Agentur\n') +
         '- alle übrigen Gründe ergeben Aussteuerung an den Themenpostkorb\n'
         'Aussteuerung und Verarbeitung beenden\n'
         'Offener Punkt: Umgang mit Rahmenverträgen (SU) und Verträgen im Mahnverfahren ist offen. Es ist zu '
         'definieren, in welchen Postkörben die BE landen; die Postkorbnamen sind gezielt zu benennen.', ''),
    ])]

    # ============================================================ Weiterleitung
    b += [('S', 'Weiterleitung an den BÜ-Bot')]
    b += [('K', '72-Stunden-BOT (für alle Sparten)')]
    b += [('T', [
        ('',
         'WENN\n'
         'Variable „Vorgangstyp-BUE“ = „Makler zu Makler“\n'
         'DANN\n'
         'Weiter zum fachlichen Kontext „Notizbestückung von Prüf-Bot auf BÜ-Bot“\n'
         'SONST\n'
         'Vorgang an den 72-Stunden-BOT weiterleiten\n'
         'Verarbeitung beenden\n'
         'Ende WENN', ''),
    ])]

    b += [('K', 'Notizbestückung von Prüf-Bot auf BÜ-Bot')]
    if KV:
        b += [('T', [
            ('Screenshot: Maske „Neue Notiz anlegen: BÜ auf Makler Robotics“',
             'Es wurde kein Grund gemerkt. Der Vorgang wird an den BÜ-Bot übergeben.\n'
             'Notiz der Vorlage „BÜ auf Makler Robotics“ (BOT2011) anlegen und bestücken:\n'
             'Feld „Maklername/MFA-Name“ = Variable „OB726-Name“\n'
             'Feld „Agenturnummer“ = Variable „AGT-Uebernehmer“\n'
             'Feld „KNR Makler“ = Variable „KNR-Uebernehmer“\n'
             'Feld „Laufende Nr. aus Vorgangsdatenbank“ = Variable „Vorgang-Lfd-Nr“\n'
             'Fachliche Prüfung der Notizbestückung ist erforderlich.', ''),
            ('',
             'WENN\n'
             '<BUE_UV_FEHLT> = „ja“\n'
             'DANN\n'
             'Feld „Bearbeitung nach“ = „UV fehlt“\n'
             'SONST WENN\n'
             '<BUE_UV_ERTEILT> = „ja“\n'
             'DANN\n'
             'Feld „Bearbeitung nach“ = „BÜ mit UV“\n'
             'SONST\n'
             'Feld „Bearbeitung nach“ = „mit BÜ“\n'
             'Ende WENN', ''),
            ('Screenshot: Notizmaske, Abschnitt Sonstiges',
             'WENN\n'
             '<BUE_ANF_UNTERLAGEN> = „ja“\n'
             'DANN\n'
             'Kennzeichen „Anforderung von Unterlagen“ setzen\n'
             'Zerlege <BUE_ART_UNTERLAGEN> am Semikolon und führe die einzelnen Unterlagenarten im Notiztext auf\n'
             'SONST\n'
             'Weiter\n'
             'Ende WENN\n'
             'Notiz speichern.', ''),
        ])]
    else:
        b += [('T', [
            ('Screenshot: Maske „Telefonnotiz erstellen – 1515 Bestandsübertragung Robotics PB“',
             'Es wurde kein Grund gemerkt. Der Vorgang wird an den BÜ-Bot übergeben.\n'
             'Telefonnotiz der Vorlage „1515 – Bestandsübertragung Robotics PB“ (BOT1515) anlegen und die '
             'Pflichtfelder bestücken:\n'
             'Feld „Eingangsdatum“ = Variable „Eingangsdatum-BUE“, Format tt.mm.jjjj\n'
             'Feld „Maklername“ = Variable „OB726-Name“\n'
             'Feld „Agenturnummer“ = Variable „AGT-Uebernehmer“\n'
             'Feld „Personalnummer“ = Variable „OB726-PNR“\n'
             'Feld „E-Mail aufnehmender Makler“ = Variable „Makler-Email“\n'
             'Feld „VNR“ = Variable „VNR-normalisiert“\n'
             'Fachliche Prüfung der Notizbestückung ist erforderlich.', ''),
            ('',
             'WENN\n'
             '<BUE_UV_FEHLT> = „ja“\n'
             'DANN\n'
             'Feld „Bearbeitung nach“ = „Untervollmacht fehlt“\n'
             'SONST\n'
             'Feld „Bearbeitung nach“ = „Mit BÜ-Wunsch“\n'
             'Ende WENN', ''),
            ('Screenshot: Notizmaske, Abschnitt Folgearbeit für Komposit',
             'WENN\n'
             '<BUE_ANF_UNTERLAGEN> = „nein“\n'
             'DANN\n'
             'kein Kennzeichen im Abschnitt „Folgearbeit für Komposit“ setzen\n'
             'SONST\n'
             'Zerlege <BUE_ART_UNTERLAGEN> am Semikolon in die einzelnen Unterlagenarten und setze je Art das '
             'zugehörige Kennzeichen:\n'
             '- Police, Vertragsspiegel, Vertragsauszug oder Ersatzrechnung setzt das Kennzeichen '
             '„Police/Vertragsspiegel/Vertragsauszug/Ersatzrechnung usw.“\n'
             '- Schadenaufstellung oder Schadenrenta setzt das Kennzeichen „Schadenaufstellung/Schadenrenta usw.“\n'
             '- jede weitere Angabe setzt das Kennzeichen „Sonstige Unterlagen“\n'
             'Ende WENN\n'
             'Offener Punkt: Die zulässigen Ausprägungen von <BUE_ART_UNTERLAGEN> sind mit dem Fachbereich '
             'abzustimmen, damit die Zuordnung zu den drei Kennzeichen eindeutig ist.', ''),
            ('',
             'Trage in das Freitextfeld „Komposit / Leben / KV“ die VA230-Sparte ein.\n'
             'Notiz speichern.\n'
             'Offener Punkt: Für das Auswahlfeld „Betroffene VNR“ und für die Kennzeichen „Rahmenvertrag '
             'übertragbar“ bzw. „nicht übertragbar“ liefert der Datenpool kein Feld. Es ist zu entscheiden, ob '
             'weitere Datenpoolfelder aufgenommen werden.', ''),
        ])]

    b += [('K', 'Prozessende')]
    b += [('T', [
        ('',
         'Vorgang mit der bestückten Notiz an den BÜ-Bot ' + bot + ' weiterleiten.\n'
         'Vorgang im Postkorb ablegen mit Status vollständig bearbeitet.\n'
         'Verarbeitung beenden', ''),
    ])]

    return b
