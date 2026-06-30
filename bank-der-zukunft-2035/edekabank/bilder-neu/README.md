# Neue Holodeck-Bilder (EDEKABANK 2031)

Ablage für die **neu generierten Bilder** auf Basis der überarbeiteten
Bild-Prompts (Konzeptpapier §8, mit Andreas' Screen-Vorschlägen: Händler-Radar-
Signale, Kaufleute-Module, kaufmannsorientierte Abwicklungs-Metriken, Händler-/
Verbundrisiken, Trust Cockpit).

## Dateinamen (bitte exakt so benennen)

Gleiches Schema wie die produktiven Bilder, damit sie 1:1 übernommen werden
können:

| Datei            | Bereich              | Persona / Screen                          |
|------------------|----------------------|-------------------------------------------|
| `00-anker.png`   | Anker / Brücke       | Maik & Heiko + fünf Stationen             |
| `01-vertrieb.png`| Vertrieb             | Lena Brandt · `HÄNDLER-RADAR`             |
| `02-produkt.png` | Produkt              | Jonas Keller · `LÖSUNGS-BAUKASTEN`        |
| `03-betrieb.png` | Betrieb              | Aylin Demir · `AUTONOME ABWICKLUNG`       |
| `04-risiko.png`  | Risiko & Steuerung   | Robert Hofer · `FRÜHWARNUNG & SZENARIEN`  |
| `05-it.png`      | IT & Daten           | Priya Nair · `DATEN- & KI-PLATTFORM` (Trust Cockpit) |

## Wenn die Bilder final sind

In den produktiven Ordner kopieren (Pfad, den die App lädt):

```bash
cp 0*.png ../../public/images/holodeck/
```

Danach `npm run build` im Ordner `bank-der-zukunft-2035` und committen.
Die Bildpfade im Code (`src/holodeck/data.ts`) bleiben unverändert.
