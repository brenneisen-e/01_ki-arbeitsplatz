#!/bin/bash
# Alle Oberflaechen-Bildfolgen der ACHTEN Fassung rendern (10 s, 24 fps).
#
# Unterschied zur v07: die Schreibtisch-Bildschirme werden in 1600x1000
# aufgenommen — genau dem Seitenverhaeltnis der gruenen Flaeche im Bild. In
# v07 liefen s5 bis s7 mit 1600x1138 und wurden beim Stanzen beschnitten;
# unten fehlte dort ein Streifen der Oberflaeche.
#
# f_s4w ist die Wandanzeige des Teamraums (breit, kompakt gesetzt),
# f_handy die Telefonseite der Wohnungsszene (8 s reichen dort).
set -e
H=$(cd "$(dirname "$0")" && pwd)
S=${SCRATCH:?SCRATCH muss auf das Arbeitsverzeichnis zeigen}
python3 "$H/stationen_v08.py"
# s7 hat keinen Bildschirm mehr — 14:00 liest sie auf dem Telefon.
for st in s1 s2 s3 s4 s5 s6 s8 s9; do
  node "$H/schirmfilm.mjs" "$H/stationen_v08.html?s=$st" "$S/ui/v08/f_$st" 10 24 1600 1000
done
# Die Wandanzeige haengt im Raum mit 1,9:1 — die Aufnahme entspricht dem
# gemessenen Kasten (schirme.json besprechung), sonst wird beim Stanzen
# seitlich beschnitten.
node "$H/schirmfilm.mjs" "$H/stationen_v08.html?s=s4&kompakt=0.60&b=1900&h=1000" "$S/ui/v08/f_s4w" 10 24 1140 600
node "$H/schirmfilm.mjs" "$H/handy_v08.html" "$S/ui/v08/f_handy" 8 24 900 1950
node "$H/schirmfilm.mjs" "$H/tag_v08.html" "$S/ui/v08/f_tag" 8 24 900 1950
# Die neun Kundenkacheln (08:10) — durchsichtig aufgenommen, damit sie sich
# als Ebene ueber den Raum legen lassen.
node "$H/schirmfilm.mjs" "$H/entscheidung_v08.html" "$S/ui/v08/f_entsch" 8 24 900 1950
node "$H/schirmfilm.mjs" "$H/kacheln_v08.html" "$S/ui/v08/f_kacheln" 6 24 1920 1080 transparent
echo "UI-RENDER V08 FERTIG"
