# Banking Horizon 2030 — Strukturbild als 3D-Modell (Blender)

Prozedural gebautes 3D-Modell des Master-Strukturbilds (`public/images/Strukturbild.jpg`):
aufgeschnittener Gebaeudequerschnitt mit 4 Etagen x 2 Raeumen, glaesernem Aufzug,
Dachbegruenung, Plaza und Schild „HORIZON BANK". Raumaufteilung wie in
`bild-prompt-strukturbild-2030.md` (Boardroom, Product & Innovation, Compliance & Risk,
Technology, Corporate Services / HR, Operations, Branch, Advisory).

## Dateien

| Datei | Inhalt |
|---|---|
| `gebaeude.py` | Bauskript (Blender-Python). Erzeugt Geometrie, Materialien, Licht, Kamera, Export, Render. |
| `assets_holen.py` | Laedt die CC0-Texturen (Poly Haven) und das Himmels-HDRI nach `assets/` (nicht im Repo). |
| `assets/fonts/` | Work Sans (OFL) fuer Raumschilder und Schriftzug. |
| `modell/banking_horizon.blend` | Fertige Blender-Datei (Texturen relativ verlinkt, siehe unten). |
| `modell/banking_horizon.glb` | glTF-Export mit eingebetteten Texturen (fuer Web / three.js / Sketchfab). |
| `modell/render_uebersicht.jpg` | Cycles-Render der Gesamtansicht (3:2, wie das Strukturbild). |
| `modell/raum_*.jpg` | Detail-Renderings der einzelnen Raeume. |

## Ausfuehren

```bash
pip install bpy pillow                       # Blender 4.2+/5.x als Python-Modul (ca. 400 MB)
python3 produktion/blender/assets_holen.py   # Texturen + HDRI (ca. 60 MB)
python3 produktion/blender/gebaeude.py       # baut, exportiert (.blend/.glb), rendert Uebersicht
python3 produktion/blender/gebaeude.py --raum og2_r --samples 64   # Detail-Render eines Raums
python3 produktion/blender/gebaeude.py --schnell                   # kleiner Testrender
```

Raum-Kennungen fuer `--raum`: `og3_l` Boardroom, `og3_r` Innovation, `og2_l` Compliance,
`og2_r` Technology, `og1_l` HR, `og1_r` Operations, `eg_l` Filiale, `eg_r` Beratung.

Das Skript laeuft auch direkt in Blender (Text-Editor, „Run Script"); dann wird
die Szene im offenen Blender aufgebaut. Ohne GPU rendert Cycles auf der CPU;
Eevee braucht OpenGL und funktioniert in reinen Server-Umgebungen nicht.

## .blend oeffnen

Die `.blend` verweist relativ auf `../assets/tex/*.jpg` und `../assets/hdri/*.hdr`.
Vor dem Oeffnen deshalb einmal `assets_holen.py` laufen lassen, sonst sind die
Materialien rosa. Alternativ in Blender `File > External Data > Pack Resources`
und als eigenstaendige Datei speichern.

## Aufbau der Szene

- Sammlungen `01 Rohbau` … `06 Licht` und je Raum `10 3.OG Boardroom` … `17 EG Beratung`.
- Masse in Metern: Raumbreite 11,4 m, Schacht 2,4 m, Raumtiefe 8 m, lichte Hoehe 4 m,
  Deckenplatte 0,45 m. Aenderungen oben in `gebaeude.py` unter „Masse".
- Bildschirminhalte (Governance-Cockpit, Risk-Wall, Modell-Graph, MLOps, Workflow,
  Advisory, Whiteboard, ATM) werden beim Bauen mit Pillow als PNG erzeugt (`out/screens/`)
  und als emissive Texturen aufgebracht.
- Moebel-Bausteine: `buerostuhl`, `sessel`, `tisch`, `monitor`, `laptop`, `wandbildschirm`,
  `pflanze`, `regal`, `sideboard`, `server_rack`, `geldautomat`, `schreibtisch_arbeitsplatz`.
- Kamera „Uebersicht": 135 mm, frontal, 3:2 — deckt sich mit dem Zuschnitt des
  Strukturbilds, sodass die `ZONES` aus `src/data/chapters.ts` grob passen.

## Personen

Das Modell enthaelt bewusst keine Personen: prozedural gebaute Figuren wirken in
einem fotorealistischen Rendering wie Schaufensterpuppen. Fuer besetzte Raeume
eignen sich gescannte oder generierte Figuren (z. B. Meshy Text-to-3D, Mixamo,
Poly Haven Models), die ueber `bpy.ops.import_scene.gltf` in die jeweiligen
Raum-Sammlungen geladen werden koennen.

## Lizenz der Assets

Texturen und HDRI: Poly Haven, CC0. Schrift: Work Sans, SIL Open Font License
(`assets/fonts/WorkSans-OFL.txt`).
