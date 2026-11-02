# PDD Komposit / Leben – Kommentare N. Garcia-Fernandez (ODPBD) und Rückgabe, umgesetzt in v12 (02.10.2026)

Grundlage: zurückgesandte Fassung `quellen/rueckgabe_0210/PDD_Vorpruefung_BUE_Komposit_Leben_Rueckgabe_ODPBD.docx` (v11 mit deutschen
Änderungen ohne Nachverfolgung und Kommentaren). Ergebnis: `PDD_Vorpruefung_BUE_Komposit_Leben_v12.docx` (Skript `quellen/pdd_kl_v12.py`),
Kommentare entfernt. Mail: `Mail_Entwurf_PDD_v12_Komposit_Leben_021026.eml/.txt` (Änderungen, Erklärung der Fehlerliste, Frage Mahnverfahren).

| Nr. | Kommentar | Antwort E. Brenneisen | Umsetzung |
|---|---|---|---|
| 89 | Wenn die Unterlagen vollständig sind, dann keine BE | – | Bestätigt (Mail). |
| 90 | – | Prüfung: Warum zwei Unterbedingungen | Bedingung vereinfacht: Prüfnotiz, wenn `<BUE_PRUEFUNG_UNTERLAGEN>` einen Mangel nennt („BÜ-Wunsch fehlt“, „MV fehlt“, „MV unvollständig“, „VN-Unterschrift fehlt“). Leer und „Reminder - keine Vollst.-Prüfung“ müssen nicht eigens ausgeschlossen werden; Ergebnis unverändert. DE, EN und Werteliste der Prüfnotizen. |
| 92 | Umgang mit Fehlerliste? Bitte uns mal erklären. | – | Erklärung in der Mail (harte BE vs. Prüfnotiz, Test auf Fehlerliste, Bearbeitungshinweis mit Beispiel). |
| 147 | Die Sonderliste muss ggfs. korrigiert bzw. ergänzt werden können. | Ändern: Muss laufend geprüft und geändert werden | Hinweis DE/EN: Sonderliste (Stand 23.09.2026) muss laufend geprüft und bei Bedarf geändert oder ergänzt werden. |
| 160 | Bitte Prüfung, ob der BÜ-Bot Verträge im Mahnverfahren erkennt. | Per Mail: Prüfung an BÜ-Bot-Team | Als Frage in der Mail: Ist im BÜ-Bot berücksichtigt, dass Verträge im Mahnverfahren erkannt werden? PDD unverändert (Prüf-Bot prüft Mahnverfahren wie alle Verträge). |
| 186 | Bitte um Erklärung (Notizfeld „Komposit / Leben / KV“) | Wird nicht befüllt. Bitte ändern | Eintrag „leer lassen“, Quelle „Feld wird vom Bot nicht befüllt.“ (DE/EN); `BUE_SPARTE` steuert das Notizfeld nicht mehr, Verwendung ohne VI. |
| 189 | Achtung: Hier geben wir nichts an! (Notizfeld „Laufende Nr. aus Vorgangsdatenbank“) | Wird nicht befüllt. Bitte ändern | Pflicht nein, Eintrag „leer lassen“ (DE/EN), Variablentabelle `Vorgang-Lfd-Nr`: Notizfeld wird nicht befüllt, Verwendung „Start“. |

Weitere Änderungen der Rückgabe (deutsch) und ihre Übersetzung:

- Irrläufer im Bot-Postfach: „Keine Tätigkeit notwendig“ (EN „No action required“); Mails außerhalb des Eingangskanals werden gelöscht, nicht mehr weitergeleitet (EN nachgezogen).
- Quellenangaben (K. Rypa, M. Koch) im deutschen Text gestrichen – im Englischen ebenso.
- `<BUE_MV_UNTERSCHRIFT_KUNDE> <> „nein“` in der Rückgabe auf Rückfrage wieder `<> „ja“` (wie v11; sonst BE bei vorhandener Unterschrift).
- Hinweis Spartenweiche: Rückgabe „bei FK“ – jetzt „bei KR …; den Flottenvertrag erkennt der Bot dann in VA230 an „FK““ (DE/EN), passend zu Variablentabelle und Kapitel IV.
- Postkorb-Nummern aus der Rückgabe (ODPP1 D: AA 23949, HSB4 K KO: KO 23724) auch im BE-Handling Kapitel VII (DE/EN). HSB4 K 72 weiter TBD.
- Unverändert übernommen (nur deutsche Tabellen): Ansprechpartner, Sonderliste (Jung DMS Pro und Qualitypool neu, INVERS gestrichen), Ablaufdiagramm, Startpostkorb-Bezeichnung, Zeitangaben.
