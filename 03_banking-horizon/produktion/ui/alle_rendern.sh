#!/bin/bash
# Alle Oberflaechen-Bildfolgen fuer die Montage rendern (10 s, 24 fps).
# f_s4w ist die Wandanzeige des Teamraums (breit, kompakt gesetzt),
# f_handy die Telefonseite der Wohnungsszene (8 s reichen dort).
set -e
H=$(cd "$(dirname "$0")" && pwd)
S=${SCRATCH:-/tmp/claude-0/-home-user-kiarbeitsplatz/4a027885-72f4-58d1-b5d9-f5090d47fbf4/scratchpad}
for st in s1 s2 s3 s4 s5 s6 s7 s8 s9; do
  node "$H/schirmfilm.mjs" "$H/stationen.html?s=$st" "$S/ui/f_$st" 10 24 1600 1138
done
node "$H/schirmfilm.mjs" "$H/stationen.html?s=s4&kompakt=0.60&b=3125&h=1000" "$S/ui/f_s4w" 10 24 1875 600
node "$H/schirmfilm.mjs" "$H/handy.html" "$S/ui/f_handy" 8 24 900 1950
echo "UI-RENDER FERTIG"
