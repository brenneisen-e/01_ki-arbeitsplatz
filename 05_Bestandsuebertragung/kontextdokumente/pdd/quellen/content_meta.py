# -*- coding: utf-8 -*-
"""Kopf-, Betriebs- und Designinhalte der beiden PDDs (Variante KV / KL)."""

V = {
    'KV': dict(
        titel='Vorprüfung Bestandsübertragung (Prüf-Bot) – Gesundheit / Krankenversicherung (KV)',
        kurz='Gesundheit (KV)',
        bot='BOT2011',
        notiz='Neue Notiz anlegen: BÜ auf Makler Robotics (BOT2011)',
        bereich='Betrieb Gesundheit / Krankenversicherung',
        sparten='Krankenversicherung (KV) – Voll-, Zusatz- und Pflegeversicherung',
    ),
    'KL': dict(
        titel='Vorprüfung Bestandsübertragung (Prüf-Bot) – Komposit / Leben',
        kurz='Komposit / Leben',
        bot='BOT1515',
        notiz='Telefonnotiz „1515 – Bestandsübertragung Robotics PB“ (BOT1515)',
        bereich='Betrieb Komposit / Leben',
        sparten='Komposit (SU, KFZ, Haftpflicht, Unfall, Rechtsschutz, Sach) und Leben/BU',
    ),
}

SYSTEME = [
    ('EWMS-Postkorb',
     'Eingangskanal des Prozesses. Postkorbvorgang öffnen, Eröffnungsdatum lesen, Notiz anlegen, '
     'Vorgang ablegen bzw. an Themenpostkorb/Sachbearbeitung weiterleiten.'),
    ('Datenpool',
     'Einzige Datenquelle des Prüf-Bots. Enthält die Vorgangsdaten in den Feldern BUE_*. Wie die Felder '
     'befüllt werden, ist nicht Gegenstand dieses PDD.'),
    ('VA230 – Vertragsauskunft',
     'Prüfung, ob der Vertrag zur VNR existiert. Auslesen von Vertragsstatus, Spartenkürzel und '
     'Agentur-Nr. (A…) des aktuellen Bestandsinhabers.'),
    ('IS100 – Partner-/VN-Auskunft',
     'Auslesen und Abgleich der Stammdaten des Versicherungsnehmers: Nachname, Vorname, '
     'Geburtsdatum, Straße, PLZ, Ort.'),
    ('OB726 – Vermittlerauskunft',
     'Auslesen von Agenturnummer (A…), Vermittler-Nr. (PNR), Name und Klassifizierung '
     '(Makler, Mehrfachagent, Courtagefortzahler) des übernehmenden Vermittlers.'),
    ('GH040 – Anbindung Vermittler',
     'Prüfung des Anbindungsstatus (aktiv / inaktiv) des übernehmenden Vermittlers und des '
     'bisherigen Bestandsinhabers.'),
    ('OB729 – Vermittlerkommunikation',
     'Fallback-Ermittlung der E-Mail-Adresse des übernehmenden Vermittlers über die Agenturnummer (AGT), '
     'sofern der Datenpool keine Adresse liefert.'),
    ('EOS',
     'Ermittlung der Stammagentur-Nr. (A…) zu einer Vermittler-Nr. (PNR), wenn der Einstieg über die PNR erfolgt.'),
    ('Notizanwendung Robotics ({bot})',
     'Bestückung der Notizvorlage für den nachgelagerten BÜ-BOT. Der Prüf-Bot füllt die Notiz, '
     'die Weiterverarbeitung erfolgt asynchron.'),
    ('72-Stunden-BOT',
     'Nachgelagerter Bot für Vorgänge, bei denen der abgebende Bestandsinhaber der Ausschließlichkeitsorganisation (AO) '
     'zugeordnet ist (72-Stunden-Frist, spartenübergreifend).'),
    ('Dopix',
     'Erstellung der Ablehnungsinformation bzw. des Ablehnungsbriefs an den übernehmenden Vermittler.'),
    ('Outlook (Bot-Postfach)',
     'Standard-Postfach des Roboters. Versand der Ablehnungs- und Informationsmails an den übernehmenden '
     'Vermittler sowie Weiterleitung von Irrläufern.'),
]

GB_MANUELL = [
    ('<zu ergänzen>', '<zu ergänzen>', '{bereich}', '<zu ergänzen>',
     'Sichtung des Postkorbvorgangs, Prüfung der eingereichten Unterlagen (Maklervollmacht, Untervollmacht), '
     'Abgleich der VN-Stammdaten in IS100 und Prüfung des Vertrags in VA230.'),
    ('<zu ergänzen>', '<zu ergänzen>', '{bereich}', '<zu ergänzen>',
     'Prüfung des übernehmenden Vermittlers in OB726 und GH040, Ermittlung von Stammagentur und Vertriebskanal, '
     'Erstellung der Notiz für den BÜ-BOT bzw. Erstellung der Ablehnungsinformation.'),
]

GB_AUTOMATISIERT = [
    ('<zu ergänzen>', '<zu ergänzen>', '{bereich}', '<zu ergänzen>',
     'Die formale Vorprüfung (VNR, VN-Stammdaten, Vermittler, Anbindung) wird durch den Prüf-Bot '
     'durchgeführt. Vereinzelt bleiben manuelle Prüfungen notwendig, insbesondere bei ausgesteuerten Vorgängen.'),
    ('<zu ergänzen>', '<zu ergänzen>', '{bereich}', '<zu ergänzen>',
     'Bearbeitung ausschließlich der ausgesteuerten Vorgänge (Business Exceptions) im Themenpostkorb, '
     'fachliche Entscheidung bei mehreren Ablehnungsgründen sowie Pflege und Freigabe der Ablehnungsinformationen.'),
]

ZIEL = """Der Eingang von Bestandsübertragungen (BÜ) wird heute vollständig manuell vorgeprüft. Je Vorgang muss die \
Sachbearbeitung die Versicherungsscheinnummer bereinigen und den Vertrag in VA230 aufrufen, die Stammdaten des \
Versicherungsnehmers in IS100 gegen die Vorgangsdaten abgleichen sowie den übernehmenden Vermittler in OB726 und dessen \
Anbindung in GH040 prüfen. Das sind fünf bis sieben Systemwechsel je Vorgang, bevor überhaupt entschieden werden kann, \
ob der Vorgang bearbeitbar ist. Ein erheblicher Teil der Vorgänge wird nach dieser Prüfung abgelehnt oder ausgesteuert – \
der Prüfaufwand fällt also auch für Vorgänge an, die den Prozess gar nicht durchlaufen.

Ziel der Automatisierung ist es, diese rein formale, regelbasierte Vorprüfung vollständig durch einen Roboter \
durchführen zu lassen:

Der Prüf-Bot sammelt zunächst alle Prüfergebnisse ein, bewertet sie anschließend anhand definierter harter und weicher \
Prüfkriterien und entscheidet erst danach über Ablehnung, Aussteuerung oder Weitergabe. Dadurch sinkt die Zahl der \
ausgesteuerten Geschäftsvorfälle gegenüber einer Prüfung mit sofortigem Abbruch beim ersten Fehler deutlich.

Vorgänge, die alle harten Kriterien erfüllen, werden mit einer vollständig bestückten Notiz an den nachgelagerten \
BÜ-BOT ({bot}) bzw. – bei Vorgängen mit AO-Bestandsinhaber – an den 72-Stunden-BOT übergeben. Die Sachbearbeitung \
bearbeitet nur noch die fachlich begründeten Ausnahmen. Ablehnungen werden unmittelbar und ohne Liegezeit an den \
übernehmenden Vermittler kommuniziert."""

KURZBESCHREIBUNG = """Der Prüf-Bot bearbeitet je Lauf einen BÜ-Vorgang aus dem EWMS-Postkorb. Zu jedem Vorgang \
liegen die Vorgangsdaten im Datenpool in den Feldern BUE_* vor. Wie der Datenpool befüllt wird, ist nicht \
Gegenstand dieses PDD.

Die Gliederung folgt der Prozessbeschreibung:

Vorprüfung – Ausschlusskriterien (Vorschlag, fachlich nicht abgestimmt): Klassifikation, BÜ-Wunsch, Reminder, Vollständigkeit der \
Unterlagen, Vorhandensein der Maklervollmacht und Übereinstimmung des Vollmachtgebers. Erst wenn alle sechs \
Kriterien erfüllt sind, laufen die fachlichen Prüfungen an. Dadurch entfallen die Hostzugriffe für Vorgänge, die \
ohnehin ausgesteuert werden.

I. VN – Stammdaten + VNR: VNR-Prüfung in VA230 sowie Namens-, Geburtsdatums- und Adressprüfung in IS100. Die \
Prüfungen laufen je Versicherungsscheinnummer des Vorgangs.

II. Übernehmender Makler – Agenturnummer/Vermittler-Nr. (PNR): Einstieg in OB726 je nachdem, ob der Datenpool \
eine Agenturnummer oder eine Vermittler-Nr. liefert, Anbindungsprüfung in GH040, Stammagentur über EOS, \
Ermittlung der Agentur-Nr. des Bestandsinhabers und des Vertriebskanals.

BE überprüfen und priorisieren: Die gesammelten Ablehnungsgründe werden bewertet. Der Vorgang wird abgelehnt, \
ausgesteuert oder freigegeben.

Weiterleitung an den BÜ-Bot: Vorgänge mit AO-Bestandsinhaber laufen über den 72-Stunden-BOT, alle übrigen nach \
Trennung der Sparte direkt an den BÜ-Bot ({bot}) mit vollständig bestückter Notiz."""


SIPOC = [
    ('Supplier / Lieferant', 'Input / Eingabe', 'Process / Prozess', 'Output / Ausgabe', 'Customer / Kunde'),
    ('Übernehmender Makler / Mehrfachagent / Maklerpool',
     'BÜ-Antrag mit Maklervollmacht und ggf. Untervollmacht',
     '1. Postkorbvorgang und Vorgangsdaten aus dem Datenpool einlesen',
     'Vollständig bestückte Notiz für den BÜ-BOT ({bot})',
     'BÜ-BOT ({bot}) / 72-Stunden-BOT'),
    ('Eingangsmanagement / Scanstelle',
     'Postkorbvorgang im EWMS mit Eröffnungsdatum',
     '2. Vertrag und Versicherungsnehmer prüfen (VA230, IS100)',
     'Ablehnungsinformation an den übernehmenden Vermittler',
     'Übernehmender Vermittler'),
    ('Datenpool',
     'Datenpoolfelder BUE_* (Kunde, Vertrag, Vermittler, Vollmachten)',
     '3. Übernehmenden Vermittler prüfen (OB726, GH040, EOS, OB729)',
     'Ausgesteuerter Vorgang mit Prüfnotiz im Themenpostkorb',
     'Sachbearbeitung {bereich}'),
    ('Bestandsführende Systeme (VA230, IS100, OB726, GH040, EOS)',
     'Vertrags-, Partner- und Vermittlerstammdaten',
     '4. Prüfergebnisse bündeln, priorisieren und Vorgang aussteuern oder übergeben',
     'MQ-, Daily- und Monthly-Report',
     'Fachlicher Process Owner / Robotics-Betrieb'),
]

DATENSICHERHEIT = {
    'KV': [
        'Ja. Verarbeitet werden Name, Vorname, Geburtsdatum und Anschrift des Versicherungsnehmers, die '
        'Versicherungsscheinnummer sowie Name, Agenturnummer, Vermittler-Nr. und E-Mail-Adresse des übernehmenden Vermittlers.',
        'Ja. Der Prozess betrifft Verträge der privaten Krankenversicherung; die Zuordnung einer Person zu einem '
        'KV-Vertrag unterliegt dem Schutz des § 203 StGB. Der Roboter liest ausschließlich Stammdaten, Vertragsstatus '
        'und Vermittlerdaten – keine Diagnosen, Leistungs-, Tarif- oder Risikoprüfungsdaten.',
        'Ja. Die Zugehörigkeit zu einem Krankenversicherungsvertrag lässt einen Rückschluss auf Gesundheitsdaten im '
        'Sinne des Art. 9 DSGVO zu. Gesundheitsdaten selbst werden nicht gelesen und nicht in Notiz oder Report übernommen.',
        'Die Vorgangsdaten im Datenpool sowie die Bildschirminhalte aus IS100 und VA230 '
        'enthalten Personendaten und sind als C3 (vertraulich) einzustufen. Die Reports des Roboters enthalten '
        'ausschließlich C2-Daten (Ordnungsbegriff, Status, Tags).',
        'Die Verarbeitung erfolgt vollständig innerhalb der ITERGO-Infrastruktur; es findet keine Ablage außerhalb von '
        'EWMS und Datenpool statt. Die Screenshots in diesem PDD enthalten keine echten Personendaten. Reports enthalten '
        'nur die Vorgang-Lfd-Nr, Status und Tags – keine Klarnamen, Geburtsdaten oder Anschriften. Ausgehende Mails gehen '
        'ausschließlich an die im Datenpool bzw. in OB729 hinterlegte Vermittleradresse; Mails an Adressen der Domäne '
        'ergo.de werden als Business Exception ausgesteuert und nicht versendet.',
    ],
    'KL': [
        'Ja. Verarbeitet werden Name, Vorname, Geburtsdatum und Anschrift des Versicherungsnehmers, die '
        'Versicherungsscheinnummer sowie Name, Agenturnummer, Vermittler-Nr. und E-Mail-Adresse des übernehmenden Vermittlers.',
        'Nein. Im Komposit- und Lebensgeschäft werden vom Roboter ausschließlich Vertrags-, Partner- und Vermittlerstammdaten '
        'gelesen. Gesundheitsdaten aus der Risikoprüfung Leben/BU werden nicht aufgerufen und nicht verarbeitet.',
        'Nein. Es werden keine Daten nach Art. 9 oder 10 DSGVO gelesen. Sollte ein Vorgang Verträge mit Bezug zur '
        'Risikoprüfung (Leben/BU) enthalten, beschränkt sich der Roboter auf Vertragsstatus und Bestandsinhaber.',
        'Die Vorgangsdaten im Datenpool sowie die Bildschirminhalte aus IS100 und VA230 '
        'enthalten Personendaten und sind als C3 (vertraulich) einzustufen. Die Reports des Roboters enthalten '
        'ausschließlich C2-Daten (Ordnungsbegriff, Status, Tags).',
        'Die Verarbeitung erfolgt vollständig innerhalb der ITERGO-Infrastruktur; es findet keine Ablage außerhalb von '
        'EWMS und Datenpool statt. Die Screenshots in diesem PDD enthalten keine echten Personendaten. Reports enthalten '
        'nur die Vorgang-Lfd-Nr, Status und Tags – keine Klarnamen, Geburtsdaten oder Anschriften. Ausgehende Mails gehen '
        'ausschließlich an die im Datenpool bzw. in OB729 hinterlegte Vermittleradresse; Mails an Adressen der Domäne '
        'ergo.de werden als Business Exception ausgesteuert und nicht versendet.',
    ],
}

ANSPRECHPARTNER = [
    ('Weiterleitungsempfänger für E-Mails, die an den Bot geschrieben werden',
     '<Gruppenpostfach Bestandsübertragung {kurz} – durch Fachbereich zu benennen>', '{bereich}'),
    ('Abstimmung für Fall-Back-Szenario', '<Name Teamleitung – durch Fachbereich zu benennen>', '{bereich}'),
    ('Betriebsinformationsempfänger (z.B. bei Störungen / Releases)',
     '<Verteiler Betrieb BÜ {kurz} – durch Fachbereich zu benennen>', '{bereich}'),
    ('Beantragung von fachlichen Changes und Fehlermeldung',
     '<Name fachlicher Process Owner – durch Fachbereich zu benennen>', '{bereich}'),
    ('Name der Verteilerliste für die Reports',
     '<Verteiler Reporting BÜ {kurz} – durch Fachbereich zu benennen>', '{bereich}'),
]

FALLBACK = """Fällt der Prüf-Bot aus, bleiben die Vorgänge unverändert im EWMS-Postkorb liegen; es gehen keine Vorgänge \
verloren, da der Roboter ausschließlich lesend auf Postkorb und Datenpool zugreift und den Vorgang erst am Prozessende \
weiterleitet oder ablegt.

Kurzfristiger Ausfall (bis zu einem Arbeitstag): Es ist keine Aktivität erforderlich. Der Roboter arbeitet die \
aufgelaufenen Vorgänge nach Wiederaufnahme des Betriebs in der Reihenfolge des Eingangsdatums nach.

Längerer Ausfall (mehr als ein Arbeitstag) oder Ausfall im Umfeld der 72-Stunden-Frist: Der Betriebsinformationsempfänger \
informiert die Sachbearbeitung. Die Vorgänge werden manuell nach dem bisherigen Verfahren vorgeprüft. Priorisiert werden \
Vorgänge, bei denen der abgebende Bestandsinhaber der AO zugeordnet ist, da hier die 72-Stunden-Frist läuft. Manuell \
bearbeitete Vorgänge werden im Postkorb als bearbeitet gekennzeichnet, damit der Roboter sie nach Wiederanlauf nicht \
erneut aufgreift."""

REPORTING = """Das Reporting ist noch nicht abschließend geklärt und wird derzeit nicht priorisiert.

Vorgesehen ist zunächst der Standardreport von Robotics. Welche Reports darüber hinaus erzeugt werden, wird nach dem Go-Live gemeinsam mit dem Robotics-Betrieb festgelegt."""


REPORTINHALT = [
    'Ordnungsbegriff: Vorgang-Lfd-Nr des Postkorbvorgangs, ergänzend die geprüfte Versicherungsscheinnummer',
    'Status: Completed, Referred, Rejected, Exception, New oder Deferred',
    'Tag „Ergebnis“: Notiz bestückt / Ablehnung versendet / Aussteuerung',
    'Tag „Ablehnungsgrund“: der priorisierte harte Ablehnungsgrund (siehe Kapitel Auswertung und Priorisierung)',
    'Tag „Vermerk“: Anzahl und Art der weichen Abweichungen (Vorname, Geburtsdatum, Straße, PLZ)',
    'Tag „Zielbot“: {bot} oder 72-Stunden-BOT',
    'Tag „Vorgangstyp“: Makler zu Makler oder AO zu Makler',
]

EINGANGSKANAL = """Gewählter Eingangskanal: Postkorberöffnung.

Der Prozess startet mit der Eröffnung eines Postkorbvorgangs im EWMS. Zu diesem Zeitpunkt liegen die \
Vorgangsdaten vollständig im Datenpool vor. Wie der Datenpool befüllt wird, ist nicht Gegenstand dieses PDD.

Der Roboter greift auf folgende Postkorbdaten zu:

- Vorgang-Lfd-Nr des Postkorbvorgangs (Ordnungsbegriff des Roboters)

Die Taktung, in der der Postkorb gelesen wird, ist noch in Klärung. Vorgänge sollen in der Reihenfolge des \
Eröffnungsdatums bearbeitet werden, damit Vorgänge mit AO-Bestandsinhaber die 72-Stunden-Frist einhalten."""

