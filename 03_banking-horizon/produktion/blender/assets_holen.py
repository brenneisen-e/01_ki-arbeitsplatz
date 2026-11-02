#!/usr/bin/env python3
"""Laedt die CC0-Texturen und das HDRI von Poly Haven fuer gebaeude.py (nicht im Repo).

  python3 produktion/blender/assets_holen.py
"""
import json, os, subprocess
HIER = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(HIER, "assets")
os.makedirs(os.path.join(A, "tex"), exist_ok=True)
os.makedirs(os.path.join(A, "hdri"), exist_ok=True)
TEX = ["concrete_wall_006", "concrete_wall_008", "concrete_floor_02", "oak_veneer_01",
       "walnut_veneer", "brick_pavement_02", "wool_boucle", "brushed_concrete"]
HDRI = "kloofendal_48d_partly_cloudy_puresky"


def get(url, out=None):
    args = ["curl", "-sS", "-L", "-A", "Mozilla/5.0 (kiarbeitsplatz-blender)", "--max-time", "300", url]
    if out:
        subprocess.run(args + ["-o", out], check=True)
        return None
    return subprocess.run(args, check=True, capture_output=True).stdout


for t in TEX:
    files = json.loads(get(f"https://api.polyhaven.com/files/{t}"))
    for kind in ["Diffuse", "nor_gl", "Rough"]:
        entry = files[kind].get("2k", {}).get("jpg") or files[kind].get("1k", {}).get("jpg")
        out = os.path.join(A, "tex", f"{t}_{kind.lower()}.jpg")
        if not os.path.exists(out) or os.path.getsize(out) < 1000:
            get(entry["url"], out)
        print(t, kind, os.path.getsize(out) // 1024, "KB")
h = json.loads(get(f"https://api.polyhaven.com/files/{HDRI}"))
out = os.path.join(A, "hdri", f"{HDRI}_2k.hdr")
if not os.path.exists(out):
    get(h["hdri"]["2k"]["hdr"]["url"], out)
print("hdri", os.path.getsize(out) // 1024, "KB")
