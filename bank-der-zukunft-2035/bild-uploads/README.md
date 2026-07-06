# Bild-Uploads — Drop-Zone pro Kapitel

Lege deine generierten Bilder **mit beliebigem Dateinamen** (z. B. ChatGPTs
`file_00000...png`) in den passenden Kapitel-Ordner. Ich benenne sie dann in den
korrekten `Kapitel N_M.png`-Slot um und lege sie nach `public/images/` **und**
`dist/images/`, danach Build + Push.

Bei mehreren Bildern pro Kapitel entweder in der Reihenfolge 1, 2, 3 … ablegen
(oder kurz dazuschreiben, welches welche Hypothese ist) — sonst ordne ich sie
anhand des Motivs selbst zu.

## Zuordnung Ordner → Ziel-Dateien (neue Nummerierung)

| Ordner | Kapitel | Ziel-Dateien |
|---|---|---|
| `00_master` | Strukturbild | `Strukturbild.png` (1536×1024) |
| `01_kunde` | 01 Kundenperspektive | `Kapitel 1_1..1_3.png`, `Kapitel 1_Demo.png` |
| `02_vertrieb` | 02 Markt & Vertrieb | `Kapitel 2_1..2_3.png`, `Kapitel 2_Demo.png` |
| `03_marktfolge` | 03 Marktfolge | `Kapitel 3_1..3_4.png`, `Kapitel 3_Demo.png` |
| `04_corporate` | 04 Corporate Services / HR | `Kapitel 4_1..4_5.png`, `Kapitel 4_Demo.png` |
| `05_it` | 05 Technologie / IT | `Kapitel 5_1..5_3.png`, `Kapitel 5_Demo.png` |
| `06_compliance` | 06 Compliance & Risk | `Kapitel 6_1..6_4.png`, `Kapitel 6_Demo.png` |
| `07_projekt` | 07 Produkte & Innovation | `Kapitel 7_1..7_3.png`, `Kapitel 7_Demo.png` |
| `08_vorstand` | 08 Vorstand & Governance | `Kapitel 8_1..8_3.png`, `Kapitel 8_Demo.png` |

**09 Transformation mit Deloitte** hat **keine** Hypothesen-/Vergleichsbilder —
dort kommen die Deloitte-Offerings hin (kein Bild-Ordner).

> Hinweis: Diese Drop-Zone liegt bewusst außerhalb von `public/`, wird also nicht
> mit ausgeliefert. Nach dem Umbenennen/Verschieben können die Dateien hier
> wieder gelöscht werden.
