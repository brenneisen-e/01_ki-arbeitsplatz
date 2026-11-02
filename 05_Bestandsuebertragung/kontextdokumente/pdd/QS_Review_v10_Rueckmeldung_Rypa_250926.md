# Rückmeldung K. Rypa zur v10 (25.09.2026) – Stand in der v11

Grundlage: Mail K. Rypa (Maklerservice) vom 25.09.2026, 15:34 und 15:58 (Antwort auf „PDDs KV/Non-KV mit der Bitte um QS“ vom 23.09.), mit den
beiden Dateien `PDD_Vorpruefung_BUE_Gesundheit_KV.docx` und `PDD_Vorpruefung_BUE_Komposit_Leben.docx`, in denen Screenshots eingefügt wurden.
Die Dateien enthalten keine Word-Kommentare und keine Textänderungen außer einer Bildunterschrift; die Rückmeldungen stehen farbig in der Mail.
Beide Dateien beruhen auf dem Stand vom 23.09., 20:21 – ohne die BE für Courtagefortzahler und Kontaktgeber vom 24.09.

Ergebnis: `PDD_Vorpruefung_BUE_Gesundheit_KV_v11.docx` und `PDD_Vorpruefung_BUE_Komposit_Leben_v11.docx` – sauber aus dem Build gesetzt
(`quellen/pdd_kv_v10.py`), alle Screenshots aus den beiden Dateien übernommen (`quellen/screenshots_2509/`), plus die Fachlichkeit aus der Mail. Screenshots werden übernommen, wie sie geliefert wurden.

| Nr | Punkt (K. Rypa) | Stand in v11 |
|---|---|---|
| 1 | Vermittlertyp: „Sobald es kein Makler ist, wird es eine BE? Hintergrund: weitere Schritte beim MFA-BÜ-Wunsch nicht beschrieben?“ | keine Änderung nötig – der MFA-Zweig ist in der Vorprüfung beschrieben (BÜ-Wunsch vorhanden, Betreuungswunsch auf den MFA; keine Vollmacht), danach gleiche Prüfstrecke. Nur leer und „Fremdversicherungsunternehmen“ laufen wie Makler. Neu gegenüber der Fassung von K. Rypa: BE „Keine Bestandsübertragung möglich: `<BUE_VERMITTLER_TYP>`“ für Courtagefortzahler und Kontaktgeber (24.09., M. Koch / S. Schwarz) (durch M. Koch bestätigt) |
| 2 | KR-Flottenvertrag: erkennbar in VA230/VAF230 am Feld „Sparte/Vers.Art“ – „FK“ = Flotte, „KR“ = normaler KR-Vertrag; KM001-Variante gelöscht; jeder Vertrag unter einem Mantel wird BE | umgesetzt – Kapitel IV liest `<VA230-VersArt>` (mittlerer Wert des Felds), „FK“ → BE „KR Flottenvertrag“; Variable `VA230-Mantel` ersetzt durch `VA230-VersArt`; Werteliste der BE, Ablaufdiagramm („KR: Flotte (FK)?“) und Hinweise angepasst; Screenshot der Flotte unter dem VA230-Status-Screenshot |
| 3 | Themenpostkörbe: nur Bezeichnungen, keine Nummern: (a) „HSB4 K 72 - Erstinformation“, (b) „ODPP1 D - Ma/Ma Bestandsübertragungen“, (c) „HSB4 K MV Gesundheit Posteingang“, (d) „HSB4 K KO Komposit / Leben Posteingang“ | umgesetzt – Bezeichnungen in Systemtabelle, Eingangskanal, Kurzbeschreibung, Kapitel VI und VII beider Fassungen; Postkorb-Nr. bleibt TBD (Frage in der Antwortmail: reicht die Bezeichnung für die Weiterleitung?) |
| 4 | AO-Erkennung in OB726 über die Vertriebskanalnummer: Makler/Koop 2200, 2215, 2281, 2271, 2300, 2301, 2302, 2400 (2720?); AO 2050, 2100, 2111, 2151, 2130, 2800 | umgesetzt (Komposit/Leben) – Kapitel II liest das Feld „Vertriebskanal“ als `<OB726-AGT-Inh-Vertriebskanal>`; Kapitel VII: Makler/Koop-Kanäle → ODPP1 D, alle übrigen → HSB4 K KO; 2720 als „noch zu bestätigen“ vermerkt; Rückfrage zur Vollständigkeit der Liste (Excel-Anhang, 2111 doppelt) in der Antwortmail |
| 5 | Screenshot Start/Datenpool: „KV und KoLe auf S. 20 ergänzt – was ist mit S. 19?“ | teilweise – der eingefügte Screenshot zeigt das KI-Deckblatt; er steht jetzt in der Vorprüfung (Ausschlusskriterien aus dem KI-Deckblatt) mit Unterschrift. Der Platzhalter auf S. 19 meint den Datensatz im Datenpool (Felder BUE_*), den der Bot liest – bleibt offen (Robotics / Celonis-Umgebung) |
| 6 | IS011-Screenshots geschwärzt (KV S. 23, KoLe S. 23); „KV24 noch schwärzen?“ | umgesetzt – die geschwärzten Match-Code-Screens je Fassung sind übernommen; alle übrigen Screenshots bleiben wie geliefert (Schwärzung liegt beim Fachbereich) |
| 7 | OB726-Screenshot zeigt den übernehmenden Makler – „nicht relevant, ob ab- oder aufnehmender Vermittler“ | angenommen – Screenshot bleibt |
| 8 | OB729-Screenshot (E-Mail-Adresse) ergänzt | umgesetzt – in beiden Fassungen mit Unterschrift „OB729 (OBF722 „Anzeige AGT Betreuungsvermerk“), E-Mail-Adresse im Betreuungsvermerk“ |
| 9 | KV-Notizvorlage BOT2011 ergänzt (S. 33) | umgesetzt – ersetzt in der KV-Fassung den Screenshot der Maske 1515; die Feldtabelle im Kapitel VI folgt weiterhin der Maske 1515 (Feldumfang gleich); ob der Bot die Vorlage bestückt oder eine Freitextnotiz erzeugt, bleibt offen (Robotics) |
| 10 | Komposit/Leben: „warum sollen alle Hostmasken (S. 19–30) ersetzt werden?“ – nur S. 26 (VA230 mit KR-Vertrag) getauscht | angenommen – die Masken sind spartenunabhängig; nur der VA230-Screenshot in Kapitel II zeigt jetzt einen KR-Vertrag |
| 11 | Bearbeitungshinweis Komposit/Leben (S. 34): Rücksprache mit Tanja | offen – Platzhalter bleibt |
| 12 | Notizvorlage KV, Geschäftsbereiche, Abnahmeumgebung: Rücksprache mit Tanja / Pauline | offen – Fragen in der Antwortmail offen an den Verteiler gestellt |
| 13 | QS Ende nächster Woche mit den KV-Kollegen | vorgemerkt |

Offen nach der v11: Postkorb-Nummern (oder Bestätigung, dass die Bezeichnung reicht), Vertriebskanal 2720 und Vollständigkeit der Kanalliste,
Datenpool-Screenshot (S. 19), Bearbeitungshinweis Komposit/Leben, Notizvorlage KV (bestücken oder Freitext), Geschäftsbereiche,
Abnahmeumgebung.
