#!/usr/bin/env python3
"""
Banking Horizon 2030 — Strukturbild als 3D-Modell (Blender, prozedural).

Baut den aufgeschnittenen Gebaeudequerschnitt („Dollhouse-Cutaway") aus dem
Master-Strukturbild nach: 4 Etagen x 2 Raeume, glaeserner Aufzug als Spine,
Dachbegruenung, Plaza mit Schild „HORIZON BANK". PBR-Materialien (Poly Haven,
CC0), HDRI-Tageslicht, Cycles-Rendering.

Voraussetzungen:
  pip install bpy pillow             # Blender 4.2+/5.x als Python-Modul
  python3 produktion/blender/assets_holen.py

Aufruf:
  python3 produktion/blender/gebaeude.py                 # baut, exportiert, rendert Uebersicht
  python3 produktion/blender/gebaeude.py --schnell       # kleine Testrender
  python3 produktion/blender/gebaeude.py --kein-render   # nur .blend/.glb
  python3 produktion/blender/gebaeude.py --raum og2_r    # Detail-Render eines Raums
  python3 produktion/blender/gebaeude.py --samples 64    # Render-Qualitaet (Default 160)

Ergebnis in produktion/blender/out/: banking_horizon.blend, banking_horizon.glb,
render_uebersicht.png (3:2, wie ZONES in src/data/chapters.ts), raum_*.png.
Das Skript laeuft auch in Blender selbst (Text-Editor > Run Script).
"""
import math
import os
import random
import sys

import bpy
import bmesh
from mathutils import Vector

HIER = os.path.dirname(os.path.abspath(__file__)) if "__file__" in globals() else os.getcwd()
ASSETS = os.path.join(HIER, "assets")
OUT = os.path.join(HIER, "out")
os.makedirs(OUT, exist_ok=True)
ARGS = sys.argv[1:] if "__file__" in globals() else []
SCHNELL = "--schnell" in ARGS
KEIN_RENDER = "--kein-render" in ARGS
RAUM = ARGS[ARGS.index("--raum") + 1] if "--raum" in ARGS else None
SAMPLES = int(ARGS[ARGS.index("--samples") + 1]) if "--samples" in ARGS else (24 if SCHNELL else 160)

random.seed(2030)

# ── Masse (Meter) ────────────────────────────────────────────────────────────
STUETZE = 0.7          # Breite der Betonstuetzen
RAUM_B = 11.4          # lichte Raumbreite
SCHACHT_B = 2.4        # Aufzugsschacht
TIEFE = 8.0            # Raumtiefe (Vorderkante bis Rueckwand)
RUECKWAND = 0.4
DECKE = 0.45           # Deckenplatte
LICHT_H = 4.0          # lichte Raumhoehe
ETAGE_H = DECKE + LICHT_H
ETAGEN = 4
# x-Positionen
X_L0 = STUETZE                       # linker Raum von
X_L1 = X_L0 + RAUM_B                 # bis
X_S0 = X_L1 + STUETZE                # Schacht von
X_S1 = X_S0 + SCHACHT_B              # bis
X_R0 = X_S1 + STUETZE                # rechter Raum von
X_R1 = X_R0 + RAUM_B                 # bis
BREITE = X_R1 + STUETZE              # Gesamtbreite
HOEHE = ETAGEN * ETAGE_H + DECKE     # Oberkante Dachplatte
MITTE_X = BREITE / 2

GRUEN = (0.016, 0.416, 0.220, 1)     # Deloitte-Gruen #046A38
GRUEN_HELL = (0.525, 0.737, 0.145, 1)  # #86BC25
CYAN = (0.494, 0.784, 1.0, 1)


def etage_z(i):
    """Oberkante Fussboden der Etage i (0 = Erdgeschoss)."""
    return i * ETAGE_H + DECKE


# ── Szene ────────────────────────────────────────────────────────────────────
bpy.ops.wm.read_factory_settings(use_empty=True)
SC = bpy.context.scene
SC.unit_settings.system = "METRIC"
SC.render.engine = "CYCLES"
SC.cycles.device = "CPU"
SC.cycles.samples = SAMPLES
SC.cycles.use_denoising = True
SC.cycles.denoiser = "OPENIMAGEDENOISE"
SC.cycles.caustics_reflective = False
SC.cycles.caustics_refractive = False
SC.cycles.max_bounces = 8
SC.cycles.transmission_bounces = 12
SC.cycles.transparent_max_bounces = 16
SC.view_settings.view_transform = "AgX"
SC.view_settings.look = "AgX - Medium High Contrast"
SC.render.film_transparent = False

COLLS = {}


def coll(name):
    if name not in COLLS:
        c = bpy.data.collections.new(name)
        SC.collection.children.link(c)
        COLLS[name] = c
    return COLLS[name]


def link(obj, cname):
    coll(cname).objects.link(obj)


# ── Materialien ──────────────────────────────────────────────────────────────
MATS = {}
BILDER = {}


def bild(pfad, srgb=True):
    if pfad not in BILDER:
        img = bpy.data.images.load(pfad)
        img.colorspace_settings.name = "sRGB" if srgb else "Non-Color"
        BILDER[pfad] = img
    return BILDER[pfad]


def mat_pbr(name, tex, groesse=2.0, tint=(1, 1, 1, 1), rough_mul=1.0, spec=0.4, hell=0.0):
    """PBR-Material aus Poly-Haven-Texturen, UV-basiert (UV in Metern / groesse).

    tint multipliziert die Farbe, hell hebt sie additiv an (0..0.3)."""
    if name in MATS:
        return MATS[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Roughness"].default_value = 0.7
    bsdf.inputs["Specular IOR Level"].default_value = spec
    nt.links.new(bsdf.outputs[0], out.inputs[0])
    uv = nt.nodes.new("ShaderNodeUVMap")
    mapping = nt.nodes.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = (1 / groesse, 1 / groesse, 1 / groesse)
    nt.links.new(uv.outputs[0], mapping.inputs[0])
    base = os.path.join(ASSETS, "tex", tex)
    diff = nt.nodes.new("ShaderNodeTexImage")
    diff.image = bild(base + "_diffuse.jpg")
    nt.links.new(mapping.outputs[0], diff.inputs[0])
    farbe = diff.outputs[0]
    if tint != (1, 1, 1, 1):
        mix = nt.nodes.new("ShaderNodeMix")
        mix.data_type = "RGBA"
        mix.blend_type = "MULTIPLY"
        mix.inputs["Factor"].default_value = 1.0
        nt.links.new(farbe, mix.inputs["A"])
        mix.inputs["B"].default_value = tint
        farbe = mix.outputs["Result"]
    if hell:
        bc = nt.nodes.new("ShaderNodeBrightContrast")
        bc.inputs["Bright"].default_value = hell
        bc.inputs["Contrast"].default_value = -0.05
        nt.links.new(farbe, bc.inputs["Color"])
        farbe = bc.outputs[0]
    nt.links.new(farbe, bsdf.inputs["Base Color"])
    rough = nt.nodes.new("ShaderNodeTexImage")
    rough.image = bild(base + "_rough.jpg", srgb=False)
    nt.links.new(mapping.outputs[0], rough.inputs[0])
    if rough_mul != 1.0:
        mm = nt.nodes.new("ShaderNodeMath")
        mm.operation = "MULTIPLY"
        mm.inputs[1].default_value = rough_mul
        mm.use_clamp = True
        nt.links.new(rough.outputs[0], mm.inputs[0])
        nt.links.new(mm.outputs[0], bsdf.inputs["Roughness"])
    else:
        nt.links.new(rough.outputs[0], bsdf.inputs["Roughness"])
    nor = nt.nodes.new("ShaderNodeTexImage")
    nor.image = bild(base + "_nor_gl.jpg", srgb=False)
    nt.links.new(mapping.outputs[0], nor.inputs[0])
    nm = nt.nodes.new("ShaderNodeNormalMap")
    nm.inputs["Strength"].default_value = 0.8
    nt.links.new(nor.outputs[0], nm.inputs["Color"])
    nt.links.new(nm.outputs[0], bsdf.inputs["Normal"])
    MATS[name] = m
    return m


def mat_solid(name, farbe, rough=0.5, metal=0.0, spec=0.5, subsurface=0.0):
    if name in MATS:
        return MATS[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = farbe
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    b.inputs["Specular IOR Level"].default_value = spec
    if subsurface:
        b.inputs["Subsurface Weight"].default_value = subsurface
    m.diffuse_color = farbe
    MATS[name] = m
    return m


def mat_glas(name="Glas", tint=(0.86, 0.95, 0.92, 1), rough=0.03):
    if name in MATS:
        return MATS[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = tint
    b.inputs["Roughness"].default_value = rough
    b.inputs["Transmission Weight"].default_value = 1.0
    b.inputs["IOR"].default_value = 1.45
    b.inputs["Alpha"].default_value = 0.25   # fuer glTF/Eevee
    m.blend_method = "BLEND"
    m.diffuse_color = (tint[0], tint[1], tint[2], 0.3)
    MATS[name] = m
    return m


def mat_emit(name, farbe, staerke=3.0):
    if name in MATS:
        return MATS[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (0, 0, 0, 1)
    b.inputs["Emission Color"].default_value = farbe
    b.inputs["Emission Strength"].default_value = staerke
    m.diffuse_color = farbe
    MATS[name] = m
    return m


def mat_bildschirm(name, pfad, staerke=1.6):
    """Emissives Bildschirm-Material aus einem PNG (UV 0..1 auf der Vorderseite)."""
    if name in MATS:
        return MATS[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = bild(pfad)
    uv = nt.nodes.new("ShaderNodeUVMap")
    nt.links.new(uv.outputs[0], tex.inputs[0])
    nt.links.new(tex.outputs[0], b.inputs["Emission Color"])
    nt.links.new(tex.outputs[0], b.inputs["Base Color"])
    b.inputs["Emission Strength"].default_value = staerke
    b.inputs["Roughness"].default_value = 0.15
    b.inputs["Specular IOR Level"].default_value = 0.6
    MATS[name] = m
    return m


# ── Geometrie-Helfer ─────────────────────────────────────────────────────────
def box(name, dims, pos, mat, cname, uv_m=1.0, bevel=0.0, front_uv=False):
    """Quader. pos = Minimum-Ecke (x, y, z), dims = (dx, dy, dz).

    UV: Box-Projektion in Metern (fuer PBR) — oder front_uv=True: Vorderseite (-Y)
    bekommt UV 0..1 (fuer Bildschirme)."""
    dx, dy, dz = dims
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x = (v.co.x + 0.5) * dx
        v.co.y = (v.co.y + 0.5) * dy
        v.co.z = (v.co.z + 0.5) * dz
    uv_layer = bm.loops.layers.uv.new("UVMap")
    for f in bm.faces:
        n = f.normal
        for l in f.loops:
            c = l.vert.co
            if front_uv and n.y < -0.5:
                l[uv_layer].uv = (c.x / dx, c.z / dz)
            elif abs(n.z) > 0.5:
                l[uv_layer].uv = ((c.x + pos[0]) / uv_m, (c.y + pos[1]) / uv_m)
            elif abs(n.x) > 0.5:
                l[uv_layer].uv = ((c.y + pos[1]) / uv_m, (c.z + pos[2]) / uv_m)
            else:
                l[uv_layer].uv = ((c.x + pos[0]) / uv_m, (c.z + pos[2]) / uv_m)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    ob.location = pos
    if mat:
        me.materials.append(mat)
    if bevel:
        md = ob.modifiers.new("Bevel", "BEVEL")
        md.width = bevel
        md.segments = 3
        md.limit_method = "ANGLE"
    link(ob, cname)
    return ob


def zylinder(name, r, h, pos, mat, cname, seg=24, r2=None, rot=(0, 0, 0)):
    """Zylinder/Kegelstumpf, pos = Mittelpunkt der Unterseite."""
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=seg, radius1=r, radius2=r if r2 is None else r2, depth=h)
    for v in bm.verts:
        v.co.z += h / 2
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    ob.location = pos
    ob.rotation_euler = rot
    if mat:
        me.materials.append(mat)
    link(ob, cname)
    return ob


def flaeche(name, dims, pos, mat, cname, rot=(0, 0, 0)):
    """Einfache Ebene (dx, dy) in XY, pos = Mittelpunkt."""
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=0.5)
    for v in bm.verts:
        v.co.x *= dims[0]
        v.co.y *= dims[1]
    uv_layer = bm.loops.layers.uv.new("UVMap")
    for f in bm.faces:
        for l in f.loops:
            l[uv_layer].uv = (l.vert.co.x / dims[0] + 0.5, l.vert.co.y / dims[1] + 0.5)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    ob.location = pos
    ob.rotation_euler = rot
    if mat:
        me.materials.append(mat)
    link(ob, cname)
    return ob


def text3d(name, text, pos, groesse, mat, cname, tiefe=0.02, rot=(math.pi / 2, 0, 0), align="CENTER", fett=True):
    cu = bpy.data.curves.new(name, "FONT")
    cu.body = text
    cu.size = groesse
    cu.extrude = tiefe
    cu.align_x = align
    cu.space_character = 1.04
    fp = os.path.join(ASSETS, "fonts", "WorkSans-Bold.ttf" if fett else "WorkSans-Regular.ttf")
    if os.path.exists(fp):
        cu.font = bpy.data.fonts.load(fp)
    ob = bpy.data.objects.new(name, cu)
    ob.location = pos
    ob.rotation_euler = rot
    cu.materials.append(mat)
    link(ob, cname)
    return ob


# ── Bildschirm-Inhalte (PIL) ─────────────────────────────────────────────────
def screens_erzeugen():
    from PIL import Image, ImageDraw, ImageFont
    d = os.path.join(OUT, "screens")
    os.makedirs(d, exist_ok=True)
    fp = os.path.join(ASSETS, "fonts", "WorkSans-Bold.ttf")
    fr = os.path.join(ASSETS, "fonts", "WorkSans-Regular.ttf")
    BG = (10, 22, 16)
    G1 = (134, 188, 37)
    G2 = (4, 106, 56)
    G3 = (60, 140, 90)
    TXT = (200, 220, 205)
    DIM = (70, 100, 85)

    def font(sz, bold=False):
        try:
            return ImageFont.truetype(fp if bold else fr, sz)
        except Exception:
            return ImageFont.load_default()

    def balken(dr, x, y, w, h, n=8, seed=1):
        rnd = random.Random(seed)
        bw = w / (n * 1.6)
        for i in range(n):
            bh = h * (0.25 + 0.75 * rnd.random())
            dr.rectangle((x + i * bw * 1.6, y + h - bh, x + i * bw * 1.6 + bw, y + h), fill=G1 if i % 3 else G3)

    def linie(dr, x, y, w, h, seed=2):
        rnd = random.Random(seed)
        pts = [(x + i * w / 12, y + h - h * (0.2 + 0.7 * rnd.random())) for i in range(13)]
        dr.line(pts, fill=G1, width=4)
        for p in pts:
            dr.ellipse((p[0] - 5, p[1] - 5, p[0] + 5, p[1] + 5), fill=G1)

    def donut(dr, cx, cy, r, anteile):
        a0 = -90
        farben = [G1, G2, G3, DIM]
        for i, a in enumerate(anteile):
            dr.pieslice((cx - r, cy - r, cx + r, cy + r), a0, a0 + 360 * a, fill=farben[i % 4])
            a0 += 360 * a
        dr.ellipse((cx - r * 0.6, cy - r * 0.6, cx + r * 0.6, cy + r * 0.6), fill=BG)

    def kacheln(dr, x, y, w, h, werte):
        n = len(werte)
        kw = w / n
        for i, (lab, val) in enumerate(werte):
            dr.rectangle((x + i * kw + 6, y, x + (i + 1) * kw - 6, y + h), outline=DIM, width=2)
            dr.text((x + i * kw + 18, y + 12), lab, fill=DIM, font=font(22))
            dr.text((x + i * kw + 18, y + 40), val, fill=TXT, font=font(44, True))

    def zeilen(dr, x, y, w, n, seed=3):
        rnd = random.Random(seed)
        for i in range(n):
            dr.rectangle((x, y + i * 26, x + w * (0.3 + 0.6 * rnd.random()), y + i * 26 + 10), fill=DIM)

    # 1) Governance-Cockpit (Boardroom), 16:9
    im = Image.new("RGB", (1920, 1080), BG)
    dr = ImageDraw.Draw(im)
    dr.text((60, 40), "GOVERNANCE COCKPIT", fill=TXT, font=font(44, True))
    dr.text((60, 95), "Kapital · Liquiditaet · Risiko · Ertrag — live", fill=DIM, font=font(26))
    kacheln(dr, 60, 150, 1800, 110, [("CET1", "15,8 %"), ("LCR", "162 %"), ("RoE", "11,4 %"), ("CIR", "52 %"), ("NPL", "1,6 %")])
    balken(dr, 60, 320, 820, 380, n=10, seed=11)
    linie(dr, 960, 320, 900, 380, seed=12)
    donut(dr, 260, 880, 150, [0.45, 0.3, 0.15, 0.1])
    zeilen(dr, 480, 760, 500, 8, seed=13)
    dr.text((1000, 760), "Szenario-Simulation", fill=TXT, font=font(30, True))
    zeilen(dr, 1000, 810, 800, 7, seed=14)
    im.save(os.path.join(d, "cockpit.png"))

    # 2) Risk-Monitoring (Compliance), sehr breit 3 Panels
    im = Image.new("RGB", (3072, 1024), BG)
    dr = ImageDraw.Draw(im)
    # Panel 1: abstrakte Weltkarte aus Punkten
    rnd = random.Random(7)
    dr.text((40, 30), "GLOBAL EXPOSURE", fill=TXT, font=font(36, True))
    for _ in range(2600):
        x, y = rnd.random(), rnd.random()
        # grobe Landmassen-Silhouette als Summe von Ellipsen
        land = [(0.22, 0.35, 0.16, 0.2), (0.28, 0.65, 0.09, 0.18), (0.52, 0.32, 0.12, 0.14),
                (0.58, 0.55, 0.09, 0.15), (0.72, 0.36, 0.2, 0.18), (0.82, 0.68, 0.07, 0.07)]
        if any(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1 for cx, cy, rx, ry in land):
            px, py = 40 + x * 940, 100 + y * 860
            dr.ellipse((px - 3, py - 3, px + 3, py + 3), fill=G1 if rnd.random() > 0.2 else G2)
    dr.line((1024, 0, 1024, 1024), fill=(30, 45, 38), width=6)
    dr.line((2048, 0, 2048, 1024), fill=(30, 45, 38), width=6)
    dr.text((1070, 30), "RISK MONITORING", fill=TXT, font=font(36, True))
    linie(dr, 1070, 100, 900, 320, seed=21)
    balken(dr, 1070, 480, 900, 300, n=14, seed=22)
    zeilen(dr, 1070, 830, 900, 6, seed=23)
    dr.text((2094, 30), "CONTROL STATUS", fill=TXT, font=font(36, True))
    donut(dr, 2300, 330, 190, [0.62, 0.22, 0.1, 0.06])
    kacheln(dr, 2560, 140, 480, 110, [("Alerts", "12"), ("Open", "3")])
    kacheln(dr, 2560, 280, 480, 110, [("VaR", "4,2 M"), ("Limit", "78 %")])
    balken(dr, 2094, 600, 940, 260, n=12, seed=24)
    zeilen(dr, 2094, 900, 900, 4, seed=25)
    im.save(os.path.join(d, "risk.png"))

    # 3) Neuronales Netz (Technology), 16:9
    im = Image.new("RGB", (1920, 1080), BG)
    dr = ImageDraw.Draw(im)
    dr.text((60, 40), "MODEL GRAPH — LLM SERVING", fill=TXT, font=font(40, True))
    rnd = random.Random(5)
    layers = [4, 7, 9, 9, 7, 4]
    pts = []
    for li, n in enumerate(layers):
        x = 200 + li * 300
        pts.append([(x, 200 + (i + 0.5) * 760 / n) for i in range(n)])
    for a, b in zip(pts, pts[1:]):
        for p in a:
            for q in b:
                if rnd.random() < 0.55:
                    dr.line((p, q), fill=(28, 70, 48), width=2)
    for layer in pts:
        for p in layer:
            r = 12 + rnd.random() * 8
            dr.ellipse((p[0] - r, p[1] - r, p[0] + r, p[1] + r), fill=G1 if rnd.random() > 0.3 else G2)
    im.save(os.path.join(d, "neural.png"))

    # 4) MLOps-Dashboard, 16:9
    im = Image.new("RGB", (1920, 1080), BG)
    dr = ImageDraw.Draw(im)
    dr.text((60, 40), "AI OPERATIONS", fill=TXT, font=font(40, True))
    kacheln(dr, 60, 120, 1800, 110, [("Deployments", "118"), ("Latency p95", "142 ms"), ("Drift", "0,3 %"), ("Uptime", "99,98 %")])
    linie(dr, 60, 280, 1800, 330, seed=31)
    balken(dr, 60, 660, 900, 330, n=16, seed=32)
    zeilen(dr, 1020, 660, 840, 12, seed=33)
    im.save(os.path.join(d, "mlops.png"))

    # 5) Workflow (Operations)
    im = Image.new("RGB", (1920, 1080), BG)
    dr = ImageDraw.Draw(im)
    dr.text((60, 40), "STRAIGHT-THROUGH PROCESSING", fill=TXT, font=font(40, True))
    kacheln(dr, 60, 120, 1800, 110, [("Vorgaenge heute", "8.412"), ("Dunkelquote", "91 %"), ("Sonderfaelle", "37"), ("SLA", "99,2 %")])
    balken(dr, 60, 280, 1800, 380, n=24, seed=41)
    zeilen(dr, 60, 720, 1800, 12, seed=42)
    im.save(os.path.join(d, "workflow.png"))

    # 6) Advisory-Cockpit (Beratung)
    im = Image.new("RGB", (1920, 1080), BG)
    dr = ImageDraw.Draw(im)
    dr.text((60, 40), "ADVISORY COCKPIT", fill=TXT, font=font(40, True))
    balken(dr, 60, 140, 800, 420, n=7, seed=51)
    donut(dr, 1300, 350, 200, [0.5, 0.25, 0.15, 0.1])
    dr.text((60, 620), "Loesungsvorschlag — Segment of One", fill=TXT, font=font(30, True))
    zeilen(dr, 60, 680, 1800, 12, seed=52)
    im.save(os.path.join(d, "advisory.png"))

    # 7) Monitor-Inhalt (klein), 16:9 — Code/Tabellen
    im = Image.new("RGB", (1280, 720), (14, 18, 22))
    dr = ImageDraw.Draw(im)
    rnd = random.Random(9)
    for i in range(24):
        w = 200 + rnd.random() * 800
        dr.rectangle((40 + (20 if i % 4 else 0), 30 + i * 28, 40 + w, 30 + i * 28 + 12), fill=(60, 110, 80) if i % 5 else (134, 188, 37))
    im.save(os.path.join(d, "monitor.png"))

    # 8) Whiteboard mit Klebezetteln
    im = Image.new("RGB", (1600, 1000), (246, 246, 243))
    dr = ImageDraw.Draw(im)
    rnd = random.Random(4)
    farben = [(255, 214, 90), (255, 160, 110), (140, 210, 150), (150, 190, 255), (255, 220, 160)]
    for _ in range(26):
        x, y = 80 + rnd.random() * 1350, 90 + rnd.random() * 760
        c = rnd.choice(farben)
        dr.rectangle((x, y, x + 120, y + 120), fill=c)
        for k in range(3):
            dr.line((x + 14, y + 30 + k * 26, x + 60 + rnd.random() * 46, y + 30 + k * 26), fill=(90, 80, 60), width=3)
    dr.text((80, 24), "PRODUCT SPRINT — SEGMENT OF ONE", fill=(40, 60, 50), font=font(36, True))
    im.save(os.path.join(d, "whiteboard.png"))

    # 9) ATM-Screen
    im = Image.new("RGB", (800, 600), (8, 40, 24))
    dr = ImageDraw.Draw(im)
    dr.text((40, 40), "HORIZON BANK", fill=(200, 230, 205), font=font(48, True))
    dr.text((40, 120), "Guten Tag.", fill=(134, 188, 37), font=font(40))
    zeilen(dr, 40, 220, 700, 6, seed=61)
    im.save(os.path.join(d, "atm.png"))
    return d


SCREENS = screens_erzeugen()

# ── Basismaterialien ─────────────────────────────────────────────────────────
M_BETON = mat_pbr("Beton Fassade", "concrete_wall_006", groesse=3.0, tint=(1.0, 0.98, 0.94, 1), hell=0.07)
M_BETON_INNEN = mat_pbr("Beton Innenwand", "concrete_wall_008", groesse=3.5, tint=(1.0, 0.97, 0.92, 1), rough_mul=1.1, hell=0.06)
M_BODEN = mat_pbr("Boden Sichtestrich", "concrete_floor_02", groesse=4.0, tint=(0.95, 0.9, 0.84, 1), rough_mul=0.75, hell=0.04)
M_DECKE = mat_pbr("Decke Beton", "brushed_concrete", groesse=3.0, tint=(1.0, 1.0, 0.98, 1), hell=0.06)
M_EICHE = mat_pbr("Eiche", "oak_veneer_01", groesse=1.6, tint=(0.95, 0.85, 0.7, 1), rough_mul=0.7, spec=0.5)
M_NUSS = mat_pbr("Nussbaum", "walnut_veneer", groesse=1.8, rough_mul=0.6, spec=0.5)
M_PFLASTER = mat_pbr("Plaza Pflaster", "brick_pavement_02", groesse=2.2, tint=(0.9, 0.82, 0.78, 1))
M_STOFF_GRUEN = mat_pbr("Stoff Gruen", "wool_boucle", groesse=0.6, tint=(0.12, 0.32, 0.22, 1))
M_STOFF_GRAU = mat_pbr("Stoff Grau", "wool_boucle", groesse=0.6, tint=(0.45, 0.45, 0.42, 1))
M_GLAS = mat_glas()
M_GLAS_SCHACHT = mat_glas("Glas Schacht", tint=(0.8, 0.95, 0.88, 1), rough=0.02)
M_STAHL = mat_solid("Stahl dunkel", (0.12, 0.12, 0.13, 1), rough=0.35, metal=0.9)
M_ALU = mat_solid("Aluminium", (0.7, 0.7, 0.72, 1), rough=0.3, metal=1.0)
M_SCHWARZ = mat_solid("Kunststoff schwarz", (0.02, 0.02, 0.02, 1), rough=0.45)
M_MESH = mat_solid("Netzstoff schwarz", (0.03, 0.03, 0.03, 1), rough=0.8)
M_WEISS = mat_solid("Weiss matt", (0.9, 0.9, 0.88, 1), rough=0.6)
M_GRUEN_WAND = mat_solid("Wand Tiefgruen", (0.008, 0.075, 0.04, 1), rough=0.6)
M_GRUEN_LACK = mat_solid("Lack Gruen", (0.02, 0.2, 0.11, 1), rough=0.25, spec=0.6)
M_GRUEN_SCHRIFT = mat_solid("Schrift Gruen", GRUEN, rough=0.35, spec=0.5)
M_SCHILD = mat_solid("Schild hell", (0.93, 0.93, 0.9, 1), rough=0.5)
M_BLATT = mat_solid("Blatt", (0.08, 0.3, 0.1, 1), rough=0.55, subsurface=0.15)
M_HECKE = mat_solid("Hecke", (0.1, 0.28, 0.09, 1), rough=0.8)
M_ERDE = mat_solid("Erde", (0.12, 0.09, 0.06, 1), rough=0.95)
M_TOPF = mat_solid("Topf Beton", (0.55, 0.55, 0.52, 1), rough=0.8)
M_LEDER = mat_solid("Leder braun", (0.28, 0.16, 0.09, 1), rough=0.4, spec=0.5)
M_BEZEL = mat_solid("Bildschirmrahmen", (0.03, 0.03, 0.03, 1), rough=0.3)
M_LICHT = mat_emit("Downlight", (1, 0.95, 0.85, 1), 4)
M_LED = mat_emit("LED gruen", GRUEN_HELL, 8)
M_PUTZ = mat_solid("Putz Nachbarn", (0.72, 0.7, 0.66, 1), rough=0.8)


def mat_fassade(name, glas=(0.18, 0.28, 0.4, 1), rahmen=(0.78, 0.77, 0.74, 1), raster=(1.8, 3.6)):
    """Bueromfassade fuer die Hintergrund-Stadt: Fensterraster aus einer Brick-Textur (UV in Metern)."""
    if name in MATS:
        return MATS[name]
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    uv = nt.nodes.new("ShaderNodeUVMap")
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (1 / raster[0], 1 / raster[1], 1)
    nt.links.new(uv.outputs[0], mp.inputs[0])
    br = nt.nodes.new("ShaderNodeTexBrick")
    br.offset = 0.0
    br.inputs["Color1"].default_value = glas
    br.inputs["Color2"].default_value = glas
    br.inputs["Mortar"].default_value = rahmen
    br.inputs["Scale"].default_value = 1.0
    br.inputs["Mortar Size"].default_value = 0.07
    br.inputs["Brick Width"].default_value = 1.0
    br.inputs["Row Height"].default_value = 1.0
    nt.links.new(mp.outputs[0], br.inputs["Vector"])
    nt.links.new(br.outputs["Color"], b.inputs["Base Color"])
    # Glasflaechen glatt und metallisch-spiegelnd, Rahmen matt
    inv = nt.nodes.new("ShaderNodeMath")
    inv.operation = "SUBTRACT"
    inv.inputs[0].default_value = 1.0
    nt.links.new(br.outputs["Fac"], inv.inputs[1])
    nt.links.new(inv.outputs[0], b.inputs["Metallic"])
    rg = nt.nodes.new("ShaderNodeMath")
    rg.operation = "MULTIPLY_ADD"
    rg.inputs[1].default_value = 0.6
    rg.inputs[2].default_value = 0.1
    nt.links.new(br.outputs["Fac"], rg.inputs[0])
    nt.links.new(rg.outputs[0], b.inputs["Roughness"])
    m.diffuse_color = glas
    MATS[name] = m
    return m


M_HIMMELGLAS = mat_fassade("Fassade Glas blau")
M_FASSADE_HELL = mat_fassade("Fassade Stein", glas=(0.12, 0.16, 0.2, 1), rahmen=(0.82, 0.78, 0.72, 1), raster=(2.4, 3.6))

# ── Rohbau ───────────────────────────────────────────────────────────────────
def rohbau():
    C = "01 Rohbau"
    T = TIEFE + RUECKWAND
    # Deckenplatten (inkl. Bodenplatte EG und Dachplatte)
    for i in range(ETAGEN + 1):
        z = i * ETAGE_H
        box(f"Decke_{i}", (BREITE, T, DECKE), (0, 0, z), M_BETON, C, uv_m=3.0)
    # Stuetzen (vorne, volle Hoehe) — links, Schacht links/rechts, rechts
    for k, x in enumerate([0, X_L1, X_S1, X_R1]):
        box(f"Stuetze_{k}", (STUETZE, STUETZE + 0.1, HOEHE), (x, 0, 0), M_BETON, C, uv_m=3.0)
    # Rueckwand
    box("Rueckwand", (BREITE, RUECKWAND, HOEHE), (0, TIEFE, 0), M_BETON_INNEN, C, uv_m=3.5)
    # Innenseiten der Raumrueckwaende sind Teil der Rueckwand; Boden-Oberflaeche je Etage
    for i in range(ETAGEN):
        z = etage_z(i)
        for name, x0 in (("L", X_L0), ("R", X_R0)):
            box(f"Boden_{i}{name}", (RAUM_B, TIEFE, 0.02), (x0, 0, z - 0.02), M_BODEN, C, uv_m=4.0)
            # Deckenuntersicht (leicht abgesetzt) + Downlights
            box(f"Deckenfeld_{i}{name}", (RAUM_B, TIEFE, 0.02), (x0, 0, z + LICHT_H), M_DECKE, C, uv_m=3.0)
            for j in range(5):
                for k in range(2):
                    zylinder(f"Downlight_{i}{name}{j}{k}", 0.07, 0.01,
                             (x0 + (j + 0.5) * RAUM_B / 5, 1.8 + k * 3.6, z + LICHT_H - 0.005), M_LICHT, C, seg=16)
            # weiches Raumlicht (Deckenfläche), damit Rueckwaende wie im Strukturbild hell sind
            la = bpy.data.lights.new(f"Raumlicht_{i}{name}", "AREA")
            la.shape = "RECTANGLE"
            la.size, la.size_y = RAUM_B - 1.0, TIEFE - 1.0
            la.energy = 550
            la.color = (1.0, 0.97, 0.92)
            lo = bpy.data.objects.new(f"Raumlicht_{i}{name}", la)
            lo.location = (x0 + RAUM_B / 2, TIEFE / 2, z + LICHT_H - 0.06)
            link(lo, "06 Licht")
    # Seitenstuetzen an der Rueckwand (Andeutung Skelett)
    for k, x in enumerate([X_L0 + RAUM_B / 2 - 0.2, X_R0 + RAUM_B / 2 - 0.2]):
        box(f"Rueckpfeiler_{k}", (0.4, 0.05, HOEHE), (x, TIEFE - 0.05, 0), M_BETON_INNEN, C, uv_m=3.5)


def glasfassaden():
    C = "02 Glas"
    # Aussenwaende links/rechts: Glas von Boden bis Decke je Etage, mit Pfosten
    for i in range(ETAGEN):
        z = etage_z(i)
        for name, x in (("L", STUETZE / 2), ("R", BREITE - STUETZE / 2)):
            box(f"Glas_Seite_{i}{name}", (0.03, TIEFE, LICHT_H), (x - 0.015, 0, z), M_GLAS, C)
            for j in range(4):
                box(f"Pfosten_{i}{name}{j}", (0.08, 0.08, LICHT_H), (x - 0.04, 0.02 + j * (TIEFE - 0.1) / 3, z), M_STAHL, C)
            box(f"Riegel_o_{i}{name}", (0.08, TIEFE, 0.08), (x - 0.04, 0, z + LICHT_H - 0.08), M_STAHL, C)
            box(f"Riegel_u_{i}{name}", (0.08, TIEFE, 0.08), (x - 0.04, 0, z), M_STAHL, C)
    # Aufzugsschacht: Glasfront, Glasseiten, Stahlrahmen, durch alle Etagen
    z0, z1 = DECKE, HOEHE - DECKE
    box("Schacht_Glas_Front", (SCHACHT_B, 0.03, z1 - z0), (X_S0, 0.15, z0), M_GLAS_SCHACHT, C)
    box("Schacht_Glas_L", (0.03, TIEFE - 0.15, z1 - z0), (X_S0, 0.15, z0), M_GLAS_SCHACHT, C)
    box("Schacht_Glas_R", (0.03, TIEFE - 0.15, z1 - z0), (X_S1 - 0.03, 0.15, z0), M_GLAS_SCHACHT, C)
    for k, x in enumerate([X_S0 - 0.02, X_S0 + SCHACHT_B / 2 - 0.04, X_S1 - 0.06]):
        box(f"Schacht_Pfosten_{k}", (0.08, 0.1, z1 - z0), (x, 0.12, z0), M_STAHL, C)
    for i in range(ETAGEN + 1):
        box(f"Schacht_Riegel_{i}", (SCHACHT_B + 0.1, 0.1, 0.12), (X_S0 - 0.05, 0.12, i * ETAGE_H + (DECKE if i < ETAGEN else 0) - (0.12 if i == ETAGEN else 0)), M_STAHL, C)
    # Schacht-Rueckwand innen: dunkles Metall + gruenes Lichtband
    box("Schacht_Rueck", (SCHACHT_B, 0.1, z1 - z0), (X_S0, TIEFE - 0.1, z0), M_STAHL, C)
    box("Schacht_LED_L", (0.04, 0.02, z1 - z0), (X_S0 + 0.1, TIEFE - 0.12, z0), M_LED, C)
    box("Schacht_LED_R", (0.04, 0.02, z1 - z0), (X_S1 - 0.14, TIEFE - 0.12, z0), M_LED, C)
    # Fuehrungsschienen
    for k, x in enumerate([X_S0 + 0.3, X_S1 - 0.34]):
        box(f"Schiene_{k}", (0.04, 0.06, z1 - z0), (x, TIEFE - 0.2, z0), M_ALU, C)
    # Kabine im 2. OG (Etage 2)
    z = etage_z(2)
    kab_x, kab_b, kab_t = X_S0 + 0.35, SCHACHT_B - 0.7, 1.9
    box("Kabine_Boden", (kab_b, kab_t, 0.06), (kab_x, 0.8, z), M_STAHL, C)
    box("Kabine_Decke", (kab_b, kab_t, 0.06), (kab_x, 0.8, z + 2.6), M_STAHL, C)
    box("Kabine_Glas_F", (kab_b, 0.02, 2.54), (kab_x, 0.8, z + 0.06), M_GLAS_SCHACHT, C)
    box("Kabine_Glas_L", (0.02, kab_t, 2.54), (kab_x, 0.8, z + 0.06), M_GLAS_SCHACHT, C)
    box("Kabine_Glas_R", (0.02, kab_t, 2.54), (kab_x + kab_b - 0.02, 0.8, z + 0.06), M_GLAS_SCHACHT, C)
    box("Kabine_Rueck", (kab_b, 0.04, 2.54), (kab_x, 0.8 + kab_t - 0.04, z + 0.06), M_ALU, C)
    zylinder("Kabine_Licht", 0.25, 0.01, (kab_x + kab_b / 2, 0.8 + kab_t / 2, z + 2.59), M_LICHT, C, seg=20)
    box("Kabine_Handlauf", (kab_b - 0.1, 0.03, 0.03), (kab_x + 0.05, 0.8 + kab_t - 0.1, z + 1.0), M_ALU, C)
    # Aufzugstuer-Portale je Etage (Rahmen)
    for i in range(ETAGEN):
        zz = etage_z(i)
        box(f"Portal_{i}", (SCHACHT_B - 0.3, 0.05, 0.12), (X_S0 + 0.15, TIEFE - 0.25, zz + 2.4), M_ALU, C)


def dach():
    C = "03 Dach"
    # Dachgarten: Substrat + Hecke (Noise-Displacement)
    box("Dach_Substrat", (BREITE - 0.4, TIEFE + RUECKWAND - 0.4, 0.15), (0.2, 0.2, HOEHE), M_ERDE, C)
    box("Attika", (BREITE, 0.25, 0.35), (0, -0.05, HOEHE), M_BETON, C, uv_m=3.0)
    ob = box("Hecke", (BREITE - 0.6, TIEFE + RUECKWAND - 0.6, 0.9), (0.3, 0.3, HOEHE + 0.1), M_HECKE, C)
    sub = ob.modifiers.new("Sub", "SUBSURF")
    sub.subdivision_type = "SIMPLE"
    sub.levels = 5
    sub.render_levels = 5
    tex = bpy.data.textures.new("HeckeNoise", "CLOUDS")
    tex.noise_scale = 0.35
    tex.noise_depth = 3
    dis = ob.modifiers.new("Displace", "DISPLACE")
    dis.texture = tex
    dis.strength = 0.35
    dis.mid_level = 0.5
    # Blattfarbe variieren
    m = M_HECKE
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 18
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (0.05, 0.18, 0.05, 1)
    ramp.color_ramp.elements[1].color = (0.25, 0.45, 0.14, 1)
    nt.links.new(noise.outputs["Fac"], ramp.inputs[0])
    nt.links.new(ramp.outputs[0], b.inputs["Base Color"])


# ── Moebel ───────────────────────────────────────────────────────────────────
def buerostuhl(name, pos, rot, C, sitz_mat=None):
    """Drehstuhl, pos = Bodenpunkt unter Sitzmitte, rot = Drehung um Z."""
    x, y, z = pos
    e = bpy.data.objects.new(name, None)
    e.location = pos
    e.rotation_euler = (0, 0, rot)
    link(e, C)
    parts = []
    parts.append(zylinder(name + "_Saeule", 0.03, 0.42, (0, 0, 0.05), M_STAHL, C, seg=12))
    for k in range(5):
        a = k * 2 * math.pi / 5
        arm = box(name + f"_Fuss{k}", (0.3, 0.04, 0.03), (0, -0.02, 0.02), M_SCHWARZ, C)
        arm.rotation_euler = (0, 0, a)
        parts.append(arm)
        parts.append(zylinder(name + f"_Rolle{k}", 0.03, 0.03, (0.28 * math.cos(a), 0.28 * math.sin(a), 0), M_SCHWARZ, C, seg=10))
    parts.append(box(name + "_Sitz", (0.5, 0.5, 0.07), (-0.25, -0.25, 0.47), sitz_mat or M_MESH, C, bevel=0.02))
    lehne = box(name + "_Lehne", (0.48, 0.05, 0.55), (-0.24, 0.2, 0.55), M_MESH, C, bevel=0.015)
    lehne.rotation_euler = (math.radians(-8), 0, 0)
    parts.append(lehne)
    for s in (-1, 1):
        parts.append(box(name + f"_Arm{s}", (0.04, 0.3, 0.03), (s * 0.27 - 0.02, -0.15, 0.7), M_SCHWARZ, C))
        parts.append(box(name + f"_ArmStuetze{s}", (0.03, 0.03, 0.2), (s * 0.27 - 0.015, -0.05, 0.5), M_SCHWARZ, C))
    for p in parts:
        p.parent = e
    return e


def sessel(name, pos, rot, C, mat=None):
    """Loungesessel mit Holzbeinen."""
    mat = mat or M_STOFF_GRUEN
    e = bpy.data.objects.new(name, None)
    e.location = pos
    e.rotation_euler = (0, 0, rot)
    link(e, C)
    parts = [
        box(name + "_Sitz", (0.7, 0.7, 0.16), (-0.35, -0.35, 0.36), mat, C, uv_m=0.6, bevel=0.03),
        box(name + "_Lehne", (0.7, 0.1, 0.45), (-0.35, 0.25, 0.52), mat, C, uv_m=0.6, bevel=0.03),
        box(name + "_ArmL", (0.1, 0.62, 0.22), (-0.35, -0.35, 0.52), mat, C, uv_m=0.6, bevel=0.03),
        box(name + "_ArmR", (0.1, 0.62, 0.22), (0.25, -0.35, 0.52), mat, C, uv_m=0.6, bevel=0.03),
    ]
    for sx in (-0.28, 0.28):
        for sy in (-0.28, 0.28):
            parts.append(zylinder(name + f"_Bein{sx:+.0f}{sy:+.0f}", 0.02, 0.36, (sx, sy, 0), M_NUSS, C, seg=10, r2=0.016))
    for p in parts:
        p.parent = e
    return e


def tisch(name, pos, dims, C, mat=None, beine="rund"):
    """Tisch, pos = Mittelpunkt am Boden, dims = (b, t, h)."""
    mat = mat or M_NUSS
    b, t, h = dims
    x, y, z = pos
    box(name + "_Platte", (b, t, 0.05), (x - b / 2, y - t / 2, z + h - 0.05), mat, C, uv_m=1.8)
    if beine == "rund":
        for sx in (-1, 1):
            for sy in (-1, 1):
                zylinder(name + f"_Bein{sx}{sy}", 0.03, h - 0.05, (x + sx * (b / 2 - 0.15), y + sy * (t / 2 - 0.15), z), M_STAHL, C, seg=12)
    elif beine == "saeule":
        zylinder(name + "_Saeule", 0.12, h - 0.05, (x, y, z), mat, C, seg=24, r2=0.09)
        zylinder(name + "_Fuss", 0.3, 0.03, (x, y, z), mat, C, seg=24)
    elif beine == "wange":
        box(name + "_WangeL", (0.05, t - 0.1, h - 0.05), (x - b / 2 + 0.05, y - t / 2 + 0.05, z), M_STAHL, C)
        box(name + "_WangeR", (0.05, t - 0.1, h - 0.05), (x + b / 2 - 0.1, y - t / 2 + 0.05, z), M_STAHL, C)


def monitor(name, pos, rot, C, groesse=0.6, inhalt="monitor.png", staerke=1.4):
    """Monitor auf Standfuss, pos = Standpunkt (Tischoberflaeche), Bildschirm zeigt -Y (nach vorn) bei rot=0."""
    e = bpy.data.objects.new(name, None)
    e.location = pos
    e.rotation_euler = (0, 0, rot)
    link(e, C)
    h = groesse * 9 / 16
    m = mat_bildschirm("Screen_" + inhalt, os.path.join(SCREENS, inhalt), staerke * 0.8)
    parts = [
        zylinder(name + "_Fuss", 0.12, 0.015, (0, 0, 0), M_STAHL, C, seg=20),
        box(name + "_Stange", (0.04, 0.03, 0.25), (-0.02, 0.02, 0.01), M_STAHL, C),
        box(name + "_Rahmen", (groesse + 0.02, 0.03, h + 0.02), (-groesse / 2 - 0.01, 0.0, 0.14), M_BEZEL, C),
        box(name + "_Bild", (groesse, 0.005, h), (-groesse / 2, -0.004, 0.15), m, C, front_uv=True),
    ]
    for p in parts:
        p.parent = e
    return e


def laptop(name, pos, rot, C):
    e = bpy.data.objects.new(name, None)
    e.location = pos
    e.rotation_euler = (0, 0, rot)
    link(e, C)
    parts = [box(name + "_Basis", (0.32, 0.22, 0.015), (-0.16, -0.11, 0), M_ALU, C, bevel=0.004)]
    d = box(name + "_Deckel", (0.32, 0.012, 0.21), (-0.16, 0.1, 0.015), M_ALU, C, bevel=0.004)
    d.rotation_euler = (math.radians(-15), 0, 0)
    s = box(name + "_Screen", (0.29, 0.003, 0.18), (-0.145, 0.097, 0.03), mat_bildschirm("Screen_monitor.png", os.path.join(SCREENS, "monitor.png"), 1.2), C, front_uv=True)
    s.rotation_euler = (math.radians(-15), 0, 0)
    parts += [d, s]
    for p in parts:
        p.parent = e
    return e


def wandbildschirm(name, pos, breite, C, inhalt, staerke=1.6, seitenverhaeltnis=16 / 9):
    """Wandmontierter Screen an der Rueckwand (Vorderseite zeigt -Y). pos = (x_mitte, z_mitte)."""
    x, z = pos
    h = breite / seitenverhaeltnis
    y = TIEFE - 0.06
    box(name + "_Rahmen", (breite + 0.06, 0.05, h + 0.06), (x - breite / 2 - 0.03, y, z - h / 2 - 0.03), M_BEZEL, C)
    box(name + "_Bild", (breite, 0.006, h), (x - breite / 2, y - 0.005, z - h / 2), mat_bildschirm("Screen_" + inhalt, os.path.join(SCREENS, inhalt), staerke * 0.75), C, front_uv=True)


def pflanze(name, pos, C, hoehe=1.4, blaetter=26, topf_r=0.25, palme=False):
    x, y, z = pos
    zylinder(name + "_Topf", topf_r * 0.8, topf_r * 1.6, (x, y, z), M_TOPF, C, seg=24, r2=topf_r)
    zylinder(name + "_Erde", topf_r * 0.95, 0.02, (x, y, z + topf_r * 1.6 - 0.02), M_ERDE, C, seg=24)
    rnd = random.Random(hash(name) & 0xFFFF)
    z0 = z + topf_r * 1.6
    for k in range(blaetter):
        a = k * 2 * math.pi / blaetter * 3.7 + rnd.random() * 0.4
        l = hoehe * (0.45 + 0.55 * rnd.random())
        tilt = math.radians(25 + 45 * rnd.random()) if not palme else math.radians(40 + 45 * rnd.random())
        w = 0.12 + 0.1 * rnd.random()
        bl = flaeche(name + f"_Blatt{k}", (w, l), (0, 0, 0), M_BLATT, C)
        bl.location = (x, y, z0 + (0.1 if not palme else 0.2))
        # Blatt vom Ursprung weg neigen: erst um X kippen, dann um Z drehen
        bl.rotation_euler = (math.pi / 2 - tilt, 0, a)
        bl.delta_location = Vector((0, l / 2, 0))
        bl.delta_rotation_euler = (0, 0, 0)
        # Blattform: Mittelrippe andeuten durch leichte Verjuengung ueber Bevel-Shape nicht noetig
        bl.data.materials[0] = M_BLATT
        # in Blattrichtung verschieben (lokal Y = Laengsachse)
        bl.location = bl.location + bl.rotation_euler.to_matrix() @ Vector((0, l / 2, 0))
        bl.delta_location = Vector((0, 0, 0))
    if palme:
        zylinder(name + "_Stamm", 0.04, 0.3, (x, y, z0), M_NUSS, C, seg=10)


def regal(name, pos, dims, C, faecher=4):
    """Buecherregal mit Buechern. pos = Minimum-Ecke, dims = (b, t, h)."""
    x, y, z = pos
    b, t, h = dims
    box(name + "_Seite0", (0.03, t, h), (x, y, z), M_EICHE, C, uv_m=1.6)
    box(name + "_Seite1", (0.03, t, h), (x + b - 0.03, y, z), M_EICHE, C, uv_m=1.6)
    rnd = random.Random(hash(name) & 0xFFFF)
    for f in range(faecher + 1):
        zf = z + f * (h - 0.03) / faecher
        box(name + f"_Boden{f}", (b, t, 0.03), (x, y, zf), M_EICHE, C, uv_m=1.6)
        if f < faecher:
            bx = x + 0.05
            while bx < x + b - 0.12:
                bb = 0.025 + rnd.random() * 0.03
                bh = 0.18 + rnd.random() * 0.14
                c = rnd.choice([(0.2, 0.3, 0.25, 1), (0.6, 0.55, 0.45, 1), (0.15, 0.2, 0.35, 1), (0.5, 0.2, 0.15, 1), (0.85, 0.85, 0.8, 1), (0.1, 0.1, 0.1, 1), (0.3, 0.5, 0.3, 1)])
                mb = mat_solid(f"Buch_{c}", c, rough=0.65)
                box(name + f"_Buch{f}_{bx:.2f}", (bb, t - 0.08, bh), (bx, y + 0.04, zf + 0.03), mb, C)
                bx += bb + 0.004
                if rnd.random() < 0.08:
                    bx += 0.12


def schild(name, text, x, z, C, breite=None):
    """Raumschild an der Rueckwand: helle Platte + tiefgruener Text."""
    breite = breite or (0.14 * len(text) + 0.5)
    box(name + "_Platte", (breite, 0.02, 0.36), (x - breite / 2, TIEFE - 0.02, z - 0.18), M_SCHILD, C)
    text3d(name + "_Text", text, (x, TIEFE - 0.025, z - 0.09), 0.2, M_GRUEN_SCHRIFT, C, tiefe=0.004, rot=(math.pi / 2, 0, 0))


def sideboard(name, pos, dims, C, mat=None):
    x, y, z = pos
    b, t, h = dims
    box(name, (b, t, h), (x, y, z + 0.08), mat or M_NUSS, C, uv_m=1.8, bevel=0.005)
    for sx in (0.1, b - 0.14):
        for sy in (0.1, t - 0.14):
            box(name + f"_Fuss{sx:.1f}{sy:.1f}", (0.04, 0.04, 0.08), (x + sx, y + sy, z), M_STAHL, C)


def server_rack(name, pos, C, breite=0.7, hoehe=2.1):
    x, y, z = pos
    box(name + "_Korpus", (breite, 0.9, hoehe), (x, y, z), M_SCHWARZ, C, bevel=0.005)
    box(name + "_Front", (breite - 0.08, 0.01, hoehe - 0.1), (x + 0.04, y - 0.005, z + 0.05), M_STAHL, C)
    rnd = random.Random(hash(name) & 0xFF)
    for k in range(int((hoehe - 0.2) / 0.09)):
        zz = z + 0.1 + k * 0.09
        box(name + f"_Einheit{k}", (breite - 0.12, 0.01, 0.07), (x + 0.06, y - 0.012, zz), M_SCHWARZ, C)
        for j in range(3):
            if rnd.random() < 0.7:
                box(name + f"_LED{k}_{j}", (0.015, 0.006, 0.012), (x + 0.1 + j * 0.03, y - 0.017, zz + 0.03),
                    M_LED if rnd.random() < 0.75 else mat_emit("LED weiss", (1, 1, 1, 1), 6), C)


def geldautomat(name, pos, rot, C):
    e = bpy.data.objects.new(name, None)
    e.location = pos
    e.rotation_euler = (0, 0, rot)
    link(e, C)
    parts = [
        box(name + "_Korpus", (0.7, 0.65, 1.55), (-0.35, -0.3, 0), M_GRUEN_LACK, C, bevel=0.01),
        box(name + "_Kopf", (0.7, 0.45, 0.35), (-0.35, -0.1, 1.55), M_GRUEN_LACK, C, bevel=0.01),
        box(name + "_Blende", (0.6, 0.02, 0.5), (-0.3, -0.32, 0.95), M_SCHWARZ, C),
        box(name + "_Screen", (0.42, 0.006, 0.3), (-0.21, -0.325, 1.06), mat_bildschirm("Screen_atm.png", os.path.join(SCREENS, "atm.png"), 1.5), C, front_uv=True),
        box(name + "_Tastatur", (0.3, 0.2, 0.02), (-0.15, -0.35, 0.86), M_ALU, C),
        box(name + "_Schlitz", (0.3, 0.02, 0.03), (-0.15, -0.31, 0.6), M_SCHWARZ, C),
    ]
    for p in parts:
        p.parent = e
    return e


def schreibtisch_arbeitsplatz(name, pos, rot, C, monitore=1, mat=None):
    """Schreibtisch mit Monitor(en) und Drehstuhl. pos = Tischmitte am Boden; Nutzer sitzt auf -Y-Seite (vorn)."""
    x, y, z = pos
    tisch(name + "_Tisch", (x, y, z), (1.6, 0.8, 0.74), C, mat=mat or M_EICHE, beine="wange")
    for k in range(monitore):
        dx = (k - (monitore - 1) / 2) * 0.65
        monitor(name + f"_Mon{k}", (x + dx, y + 0.25, z + 0.74), 0, C, groesse=0.6)
    box(name + "_Tastatur", (0.42, 0.14, 0.02), (x - 0.21, y - 0.25, z + 0.74), M_SCHWARZ, C, bevel=0.004)
    buerostuhl(name + "_Stuhl", (x, y - 0.75, z), math.pi, C)


# ── Raeume ───────────────────────────────────────────────────────────────────
def raum_boardroom():
    C = "10 3.OG Boardroom"
    x0, z = X_L0, etage_z(3)
    cx = x0 + RAUM_B / 2
    schild("Schild_Boardroom", "BOARDROOM", cx, z + 3.4, C)
    wandbildschirm("Cockpit", (cx, z + 2.1), 4.6, C, "cockpit.png", 1.8)
    tisch("Konferenztisch", (cx, 3.6, z), (6.4, 1.5, 0.75), C, mat=M_NUSS, beine="wange")
    for k in range(3):
        buerostuhl(f"Board_Stuhl_V{k}", (cx - 2.2 + k * 2.2, 2.55, z), math.pi, C)
        buerostuhl(f"Board_Stuhl_H{k}", (cx - 2.2 + k * 2.2, 4.65, z), 0, C)
    buerostuhl("Board_Stuhl_L", (cx - 3.7, 3.6, z), math.pi / 2, C)
    buerostuhl("Board_Stuhl_R", (cx + 3.7, 3.6, z), -math.pi / 2, C)
    for k in range(4):
        box(f"Board_Glas{k}", (0.07, 0.07, 0.1), (cx - 2.4 + k * 1.6, 3.5, z + 0.75), M_GLAS, C)
    sideboard("Board_Sideboard", (x0 + 0.4, 6.9, z), (2.4, 0.5, 0.8), C)
    pflanze("Board_Pflanze", (x0 + RAUM_B - 0.6, 7.2, z), C, hoehe=1.3)


def raum_innovation():
    C = "11 3.OG Innovation"
    x0, z = X_R0, etage_z(3)
    cx = x0 + RAUM_B / 2
    schild("Schild_Innovation", "PRODUCT & INNOVATION", cx, z + 3.4, C)
    # Whiteboard links auf Staender
    wb_x = x0 + 2.2
    box("Whiteboard_Rahmen", (3.2, 0.06, 2.0), (wb_x - 1.6, 6.3, z + 0.9), M_ALU, C)
    box("Whiteboard", (3.1, 0.01, 1.9), (wb_x - 1.55, 6.29, z + 0.95), mat_bildschirm("Screen_whiteboard.png", os.path.join(SCREENS, "whiteboard.png"), 0.6), C, front_uv=True)
    for sx in (-1.3, 1.3):
        box(f"Whiteboard_Fuss{sx:+.0f}", (0.05, 0.6, 0.9), (wb_x + sx, 6.05, z), M_ALU, C)
    # zweites Whiteboard rechts an der Wand
    box("Pinnwand_Rahmen", (3.0, 0.05, 1.7), (x0 + RAUM_B - 3.6, TIEFE - 0.05, z + 1.1), M_ALU, C)
    box("Pinnwand", (2.9, 0.01, 1.6), (x0 + RAUM_B - 3.55, TIEFE - 0.06, z + 1.15), mat_bildschirm("Screen_whiteboard.png", os.path.join(SCREENS, "whiteboard.png"), 0.6), C, front_uv=True)
    # Projekttisch mit Laptop
    tisch("Projekttisch", (cx + 1.6, 3.2, z), (2.4, 1.1, 0.74), C, mat=M_EICHE, beine="rund")
    laptop("Projekt_Laptop", (cx + 1.3, 3.3, z + 0.74), 0, C)
    buerostuhl("Projekt_Stuhl0", (cx + 0.9, 2.3, z), math.pi, C)
    buerostuhl("Projekt_Stuhl1", (cx + 2.3, 4.1, z), 0, C)
    for k, (px, py) in enumerate([(x0 + 0.7, 5.5), (x0 + RAUM_B - 0.7, 3.0)]):
        pflanze(f"Innovation_Pflanze{k}", (px, py, z), C, hoehe=1.2 + 0.4 * k)


def raum_compliance():
    C = "12 2.OG Compliance"
    x0, z = X_L0, etage_z(2)
    cx = x0 + RAUM_B / 2
    schild("Schild_Compliance", "COMPLIANCE & RISK", cx, z + 3.5, C)
    wandbildschirm("RiskWall", (cx, z + 2.25), 8.4, C, "risk.png", 1.6, seitenverhaeltnis=3.0)
    # lange Arbeitsreihe mit 5 Plaetzen
    tisch("Risk_Tisch", (cx, 4.4, z), (8.6, 0.9, 0.74), C, mat=M_EICHE, beine="wange")
    for k in range(5):
        px = cx - 3.4 + k * 1.7
        monitor(f"Risk_Mon{k}", (px, 4.65, z + 0.74), 0, C, groesse=0.62)
        box(f"Risk_Tastatur{k}", (0.42, 0.14, 0.02), (px - 0.21, 4.1, z + 0.74), M_SCHWARZ, C)
        buerostuhl(f"Risk_Stuhl{k}", (px, 3.4, z), math.pi, C)
    pflanze("Risk_Pflanze", (x0 + RAUM_B - 0.6, 7.2, z), C, hoehe=1.2)


def raum_technology():
    C = "13 2.OG Technology"
    x0, z = X_R0, etage_z(2)
    cx = x0 + RAUM_B / 2
    schild("Schild_Technology", "TECHNOLOGY", cx, z + 3.5, C)
    wandbildschirm("Neural", (x0 + 2.6, z + 2.2), 3.8, C, "neural.png", 1.7)
    wandbildschirm("MLOps", (x0 + 6.4, z + 2.2), 2.8, C, "mlops.png", 1.5)
    # Serverracks hinten rechts
    for k in range(3):
        server_rack(f"Rack{k}", (x0 + RAUM_B - 2.6 + k * 0.8, TIEFE - 1.0, z), C)
    # Arbeitsplaetze
    schreibtisch_arbeitsplatz("Tech_AP0", (x0 + 2.0, 4.6, z), 0, C, monitore=2)
    schreibtisch_arbeitsplatz("Tech_AP1", (x0 + 5.2, 4.6, z), 0, C, monitore=2, mat=M_NUSS)
    schreibtisch_arbeitsplatz("Tech_AP2", (x0 + 8.3, 3.2, z), 0, C, monitore=1)
    pflanze("Tech_Pflanze", (x0 + RAUM_B - 0.6, 2.0, z), C, hoehe=1.3)


def raum_hr():
    C = "14 1.OG Corporate Services"
    x0, z = X_L0, etage_z(1)
    cx = x0 + RAUM_B / 2
    schild("Schild_HR", "CORPORATE SERVICES / HR", cx, z + 3.5, C)
    regal("Regal0", (x0 + 0.9, TIEFE - 0.45, z), (3.2, 0.35, 2.6), C, faecher=5)
    regal("Regal1", (x0 + 4.4, TIEFE - 0.45, z), (1.6, 0.35, 2.0), C, faecher=4)
    # Lounge-Ecken
    for k, tx in enumerate([x0 + 2.3, x0 + 7.4]):
        tisch(f"Lounge_Tisch{k}", (tx, 3.4, z), (0.9, 0.9, 0.7), C, mat=M_NUSS, beine="saeule")
        sessel(f"Lounge_Sessel{k}a", (tx - 1.05, 3.4, z), math.pi / 2, C)
        sessel(f"Lounge_Sessel{k}b", (tx + 1.05, 3.4, z), -math.pi / 2, C)
    laptop("Lounge_Laptop", (x0 + 2.3, 3.4, z + 0.7), math.pi / 2, C)
    wandbildschirm("Lernscreen", (x0 + RAUM_B - 2.2, z + 2.3), 2.2, C, "advisory.png", 1.3)
    pflanze("HR_Palme", (x0 + 5.6, 6.6, z), C, hoehe=2.2, blaetter=22, topf_r=0.32, palme=True)
    pflanze("HR_Pflanze0", (x0 + 4.9, 2.2, z), C, hoehe=1.0, topf_r=0.2)
    pflanze("HR_Pflanze1", (x0 + RAUM_B - 0.6, 7.2, z), C, hoehe=1.5)


def raum_operations():
    C = "15 1.OG Operations"
    x0, z = X_R0, etage_z(1)
    cx = x0 + RAUM_B / 2
    schild("Schild_Operations", "OPERATIONS", cx, z + 3.5, C)
    wandbildschirm("Workflow", (x0 + 2.8, z + 2.3), 3.0, C, "workflow.png", 1.5)
    schreibtisch_arbeitsplatz("Ops_AP0", (x0 + 1.6, 4.8, z), 0, C, monitore=2, mat=M_NUSS)
    schreibtisch_arbeitsplatz("Ops_AP1", (x0 + 3.6, 4.8, z), 0, C, monitore=1, mat=M_NUSS)
    # Trennwand
    box("Ops_Trennwand", (0.08, 2.6, 1.6), (x0 + 4.9, 3.0, z), M_SCHILD, C)
    schreibtisch_arbeitsplatz("Ops_AP2", (x0 + 6.4, 4.8, z), 0, C, monitore=1, mat=M_NUSS)
    schreibtisch_arbeitsplatz("Ops_AP3", (x0 + 8.4, 4.8, z), 0, C, monitore=2, mat=M_NUSS)
    sideboard("Ops_Sideboard", (x0 + 5.2, 6.8, z), (2.2, 0.5, 1.1), C, mat=M_EICHE)
    pflanze("Ops_Pflanze0", (x0 + 0.6, 7.0, z), C, hoehe=1.6, topf_r=0.28)
    pflanze("Ops_Pflanze1", (x0 + RAUM_B - 0.6, 2.2, z), C, hoehe=1.1, topf_r=0.2)


def raum_filiale():
    C = "16 EG Filiale"
    x0, z = X_L0, etage_z(0)
    cx = x0 + RAUM_B / 2
    # tiefgruene Rueckwand als Verkleidung
    box("Filiale_Wandpaneel", (RAUM_B, 0.04, LICHT_H), (x0, TIEFE - 0.04, z), M_GRUEN_WAND, C)
    schild("Schild_Filiale", "BRANCH", cx, z + 3.4, C)
    # Schalter (Eichenkorpus)
    for k, sx in enumerate([x0 + 0.8, x0 + 4.2]):
        box(f"Schalter{k}", (3.0, 0.8, 1.05), (sx, 4.4, z), M_EICHE, C, uv_m=1.6, bevel=0.006)
        box(f"Schalter{k}_Platte", (3.1, 0.9, 0.04), (sx - 0.05, 4.35, z + 1.05), M_NUSS, C, uv_m=1.8)
        box(f"Schalter{k}_Blende", (3.0, 0.02, 0.35), (sx, 4.38, z + 0.4), M_STAHL, C)
    laptop("Schalter_Laptop", (x0 + 2.3, 4.9, z + 1.09), math.pi, C)
    monitor("Schalter_Monitor", (x0 + 5.6, 5.0, z + 1.09), math.pi, C, groesse=0.5)
    # Geldautomaten rechts
    for k in range(3):
        geldautomat(f"ATM{k}", (x0 + RAUM_B - 2.7 + k * 1.05, TIEFE - 0.45, z), 0, C)
    # Selfservice-Tresen/Lounge vorne
    tisch("SB_Stehtisch", (x0 + 1.5, 1.6, z), (1.2, 0.6, 1.05), C, mat=M_EICHE, beine="saeule")
    pflanze("Filiale_Pflanze", (x0 + 7.2, 1.2, z), C, hoehe=1.3, topf_r=0.22)


def raum_beratung():
    C = "17 EG Beratung"
    x0, z = X_R0, etage_z(0)
    cx = x0 + RAUM_B / 2
    schild("Schild_Beratung", "ADVISORY", cx, z + 3.4, C)
    wandbildschirm("Advisory", (x0 + 3.4, z + 2.3), 3.2, C, "advisory.png", 1.6)
    sideboard("Beratung_Sideboard", (x0 + 1.6, 6.9, z), (4.0, 0.5, 0.7), C)
    tisch("Beratungstisch", (x0 + 3.2, 3.6, z), (1.3, 1.3, 0.74), C, mat=M_NUSS, beine="saeule")
    sessel("Beratung_Sessel0", (x0 + 2.0, 3.6, z), math.pi / 2, C, mat=M_STOFF_GRAU)
    sessel("Beratung_Sessel1", (x0 + 4.4, 3.2, z), -math.pi / 2, C, mat=M_STOFF_GRAU)
    sessel("Beratung_Sessel2", (x0 + 4.2, 4.6, z), -math.pi * 0.7, C, mat=M_STOFF_GRAU)
    pflanze("Beratung_Palme", (x0 + 7.8, 6.4, z), C, hoehe=2.4, blaetter=24, topf_r=0.34, palme=True)
    pflanze("Beratung_Pflanze0", (x0 + 0.6, 4.6, z), C, hoehe=1.6, topf_r=0.28)
    pflanze("Beratung_Pflanze1", (x0 + RAUM_B - 0.7, 2.0, z), C, hoehe=1.2, topf_r=0.22)


# ── Aussenraum ───────────────────────────────────────────────────────────────
def plaza():
    C = "04 Plaza"
    # Pflaster
    box("Plaza_Boden", (140, 120, 0.05), (MITTE_X - 70, -60, -0.05), M_PFLASTER, C, uv_m=2.2)
    # Sockel/Stufe vor dem Gebaeude
    box("Sockel", (BREITE + 1.2, 1.2, 0.25), (-0.6, -1.2, 0), M_BETON, C, uv_m=3.0)
    box("Stufe", (BREITE + 1.2, 0.6, 0.12), (-0.6, -1.8, 0), M_BETON, C, uv_m=3.0)
    # Schild HORIZON BANK
    sb, st, sh = 9.2, 0.9, 1.15
    box("Schild_Block", (sb, st, sh), (MITTE_X - sb / 2, -5.4, 0), M_BETON, C, uv_m=3.0, bevel=0.01)
    text3d("Schild_Text", "HORIZON BANK", (MITTE_X, -5.41, 0.36), 0.62, M_GRUEN_SCHRIFT, C, tiefe=0.015)
    # Bank rechts
    bx = MITTE_X + 12
    box("Bank_Sitz", (2.2, 0.55, 0.14), (bx, -7.6, 0.36), M_NUSS, C, uv_m=1.8, bevel=0.01)
    for k in (0.15, 1.9):
        box(f"Bank_Fuss{k}", (0.06, 0.5, 0.36), (bx + k, -7.58, 0), M_STAHL, C)
    # Beete links/rechts mit Hecken
    for k, x in enumerate([-9.5, BREITE + 3.0]):
        box(f"Beet{k}", (6.5, 5.0, 0.5), (x, 1.0, 0), M_BETON, C, uv_m=3.0)
        h = box(f"Beet{k}_Hecke", (6.1, 4.6, 0.7), (x + 0.2, 1.2, 0.5), M_HECKE, C)
        sub = h.modifiers.new("Sub", "SUBSURF")
        sub.subdivision_type = "SIMPLE"
        sub.levels = 4
        sub.render_levels = 4
        dis = h.modifiers.new("Displace", "DISPLACE")
        dis.texture = bpy.data.textures["HeckeNoise"]
        dis.strength = 0.3
    # Baeume seitlich hinter der Gebaeudefront (wie im Strukturbild: Gruen neben dem Haus)
    for k, (x, y) in enumerate([(-7.5, 14), (-13, 9), (BREITE + 7.5, 14), (BREITE + 13, 9), (-18, 20), (BREITE + 18, 21)]):
        baum(f"Baum{k}", (x, y, 0), C, hoehe=8 + (k % 3) * 1.2)


def baum(name, pos, C, hoehe=8.0):
    """Laubbaum: Stamm, Astansaetze und viele kleine Laubballen in einer Ellipsoid-Krone."""
    x, y, z = pos
    rinde = mat_solid("Rinde", (0.2, 0.15, 0.1, 1), rough=0.9)
    zylinder(name + "_Stamm", 0.22, hoehe * 0.55, (x, y, z), rinde, C, seg=10, r2=0.12)
    rnd = random.Random(hash(name) & 0xFF)
    kx, kz = hoehe * 0.42, hoehe * 0.3   # Kronen-Halbachsen
    cz = z + hoehe * 0.68
    for k in range(3):
        a = rnd.random() * 2 * math.pi
        ast = zylinder(name + f"_Ast{k}", 0.08, hoehe * 0.3, (x, y, z + hoehe * 0.45), rinde, C, seg=8, r2=0.03,
                       rot=(math.radians(35 + rnd.random() * 20), 0, a))
    bm = bmesh.new()
    for k in range(70):
        # zufaelliger Punkt im Ellipsoid, aussen dichter
        while True:
            u, v, w = (rnd.random() * 2 - 1 for _ in range(3))
            if u * u + v * v + w * w <= 1:
                break
        r = hoehe * (0.07 + 0.06 * rnd.random())
        m = bmesh.ops.create_icosphere(bm, subdivisions=2, radius=r)
        for vv in m["verts"]:
            vv.co.x = vv.co.x * (1 + 0.3 * (rnd.random() - 0.5)) + u * kx
            vv.co.y = vv.co.y * (1 + 0.3 * (rnd.random() - 0.5)) + v * kx
            vv.co.z = vv.co.z * 0.75 + w * kz
    me = bpy.data.meshes.new(name + "_Krone")
    bm.to_mesh(me)
    bm.free()
    for p in me.polygons:
        p.use_smooth = True
    ob = bpy.data.objects.new(name + "_Krone", me)
    ob.location = (x, y, cz)
    me.materials.append(M_HECKE)
    link(ob, C)


def nachbarn():
    """Hintergrund-Stadt: Hochhaeuser mit Fensterraster; in der Mitte niedriger, damit Himmel bleibt."""
    C = "05 Stadt"
    rnd = random.Random(11)
    for k in range(13):
        b = 16 + rnd.random() * 16
        t = 16 + rnd.random() * 16
        x = MITTE_X - 120 + k * 20 + rnd.random() * 6
        y = 90 + rnd.random() * 90
        abstand = abs(x + b / 2 - MITTE_X)
        h = (18 + rnd.random() * 22) if abstand < 26 else (30 + rnd.random() * 60)
        m = rnd.choice([M_HIMMELGLAS, M_HIMMELGLAS, M_FASSADE_HELL])
        box(f"Hochhaus{k}", (b, t, h), (x, y, 0), m, C, uv_m=1.0)
        box(f"Hochhaus{k}_Dach", (b + 0.3, t + 0.3, 0.6), (x - 0.15, y - 0.15, h), M_PUTZ, C, uv_m=4)


# ── Welt, Licht, Kamera ──────────────────────────────────────────────────────
def welt():
    w = bpy.data.worlds.new("Welt")
    SC.world = w
    w.use_nodes = True
    nt = w.node_tree
    bg = nt.nodes["Background"]
    hdr = os.path.join(ASSETS, "hdri", "kloofendal_48d_partly_cloudy_puresky_2k.hdr")
    if os.path.exists(hdr):
        env = nt.nodes.new("ShaderNodeTexEnvironment")
        env.image = bpy.data.images.load(hdr)
        mapping = nt.nodes.new("ShaderNodeMapping")
        mapping.inputs["Rotation"].default_value = (0, 0, math.radians(215))
        tc = nt.nodes.new("ShaderNodeTexCoord")
        nt.links.new(tc.outputs["Generated"], mapping.inputs[0])
        nt.links.new(mapping.outputs[0], env.inputs[0])
        nt.links.new(env.outputs[0], bg.inputs["Color"])
        bg.inputs["Strength"].default_value = 1.0
    else:
        bg.inputs["Color"].default_value = (0.55, 0.7, 0.9, 1)
        bg.inputs["Strength"].default_value = 1.0
    # Sonne von vorn-links-oben, damit alle Raeume Tageslicht bekommen
    sun = bpy.data.lights.new("Sonne", "SUN")
    sun.energy = 5.0
    sun.angle = math.radians(1.2)
    sun.color = (1.0, 0.96, 0.9)
    so = bpy.data.objects.new("Sonne", sun)
    so.rotation_euler = (math.radians(48), math.radians(-14), math.radians(15))
    link(so, "06 Licht")
    SC.view_settings.exposure = 0.2
    # weiche Aufhellung von vorn (Himmel-Reflexion der Plaza)
    fill = bpy.data.lights.new("Fuellicht", "AREA")
    fill.energy = 3000
    fill.size = 40
    fill.color = (0.9, 0.95, 1.0)
    fo = bpy.data.objects.new("Fuellicht", fill)
    fo.location = (MITTE_X, -28, 14)
    fo.rotation_euler = (math.radians(70), 0, 0)
    link(fo, "06 Licht")


def kamera(raum=None):
    cam = bpy.data.cameras.new("Kamera")
    co = bpy.data.objects.new("Kamera", cam)
    link(co, "06 Licht")
    SC.camera = co
    cam.sensor_width = 36
    if raum is None:
        # Uebersicht: lange Brennweite, frontal, wie das Strukturbild (3:2)
        cam.lens = 135
        ziel = Vector((MITTE_X, 4.0, HOEHE * 0.5 + 0.6))
        co.location = Vector((MITTE_X, -128, HOEHE * 0.5 + 3.0))
        SC.render.resolution_x, SC.render.resolution_y = (768, 512) if SCHNELL else (3072, 2048)
    else:
        etage = {"eg": 0, "og1": 1, "og2": 2, "og3": 3}[raum.split("_")[0]]
        x0 = X_L0 if raum.endswith("_l") else X_R0
        cam.lens = 80
        ziel = Vector((x0 + RAUM_B / 2, 4.0, etage_z(etage) + 1.7))
        co.location = Vector((x0 + RAUM_B / 2, -44, etage_z(etage) + 3.2))
        SC.render.resolution_x, SC.render.resolution_y = (768, 512) if SCHNELL else (2048, 1365)
    richtung = ziel - co.location
    co.rotation_euler = richtung.to_track_quat("-Z", "Y").to_euler()
    cam.clip_end = 600
    cam.dof.use_dof = False
    return co


# ── Aufbau ───────────────────────────────────────────────────────────────────
rohbau()
glasfassaden()
dach()
raum_boardroom()
raum_innovation()
raum_compliance()
raum_technology()
raum_hr()
raum_operations()
raum_filiale()
raum_beratung()
plaza()
nachbarn()
welt()
kamera(RAUM)

print("Objekte:", len(bpy.data.objects), "Materialien:", len(bpy.data.materials))

# ── Export ───────────────────────────────────────────────────────────────────
if RAUM is None:
    blend = os.path.join(OUT, "banking_horizon.blend")
    # Relative Pfade zu den Assets, nicht gepackt (Assets via assets_holen.py)
    bpy.ops.wm.save_as_mainfile(filepath=blend, relative_remap=True)
    print("gespeichert:", blend)

# ── Render ───────────────────────────────────────────────────────────────────
if not KEIN_RENDER:
    name = "render_uebersicht" if RAUM is None else f"raum_{RAUM}"
    if SCHNELL:
        name += "_schnell"
    SC.render.image_settings.file_format = "PNG"
    SC.render.filepath = os.path.join(OUT, name + ".png")
    bpy.ops.render.render(write_still=True)
    print("gerendert:", SC.render.filepath)

# ── glTF (Web-Fassung: Texturen auf 1k verkleinert, Draco-komprimiert) ───────
if RAUM is None and not SCHNELL:
    glb = os.path.join(OUT, "banking_horizon.glb")
    for img in bpy.data.images:
        if img.size[0] > 1024 and img.filepath.lower().endswith(".jpg"):
            img.scale(1024, int(1024 * img.size[1] / img.size[0]))
    bpy.ops.object.select_all(action="DESELECT")
    for c in COLLS.values():
        if c.name == "05 Stadt":
            continue  # Stadt-Kulisse nicht in die Web-Version
        for o in c.objects:
            o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=glb, export_format="GLB", use_selection=True,
                              export_apply=True, export_image_format="JPEG", export_jpeg_quality=75,
                              export_texture_dir="", export_lights=True, export_cameras=True,
                              export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=6)
    print("exportiert:", glb, round(os.path.getsize(glb) / 1e6, 1), "MB")
