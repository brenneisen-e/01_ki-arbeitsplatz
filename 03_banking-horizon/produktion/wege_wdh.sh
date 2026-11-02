#!/bin/bash
cd "$(dirname "$0")"
Q="${SCRATCH:-/tmp/claude-0/-home-user-kiarbeitsplatz/4a027885-72f4-58d1-b5d9-f5090d47fbf4/scratchpad}"
for runde in 1 2 3 4 5 6 7 8; do
  fehlt=0
  for f in glas1 glas2 checkin halle-buero buero_weit-platz; do
    [ -f "$Q/veo_neu5/$f.mp4" ] || fehlt=1
  done
  [ $fehlt -eq 0 ] && { echo "ALLE AUFNAHMEN DA"; exit 0; }
  echo "--- Runde $runde ---"
  python3 wege_neu.py
  sleep 45
done
echo "AUFGEGEBEN"
