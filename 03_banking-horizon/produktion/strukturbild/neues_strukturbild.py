#!/usr/bin/env python3
"""
Master-Strukturbild neu erzeugen (statt es zu retuschieren).

Warum neu statt flicken: siehe Kopf von personen_retusche.py. Eine einzelne
Person laesst sich in einem fertigen Bild nicht ersetzen, ohne ihre Umgebung zu
beschaedigen — Stuhl, Tischkante und Wand stecken immer mit in der Maske.

Zwei Vorgaben aus der Abnahme des alten Bilds bestimmen diesen Prompt:

1. **Perspektive und Groesse wie im HR-Raum.** Im alten Bild ist genau eine
   Etage richtig: das 1. OG links. Dort blickt man leicht von oben in den Raum,
   sieht die Bodenflaeche vor den Moebeln und jede Person vollstaendig bis zu den
   Schuhen. In den anderen Etagen sind die Personen entweder zu gross oder ihre
   Fuesse werden von der Betonbruestung abgeschnitten. Der Prompt verlangt diesen
   Blick deshalb ausdruecklich fuer JEDE Etage einzeln.
2. **Personen wie in der aktuellen Fassung.** Fotorealistische, normal gebaute
   Menschen in Business-Casual, natuerliche Haare mit weichem Haaransatz, ruhige
   Gesichter — kein waechsernes Stock-Foto-Aussehen, keine Perueckenkanten.

Aufruf:
  export OPENAI_API_KEY=...            # oder $SCRATCH/.openai_env
  python3 produktion/strukturbild/neues_strukturbild.py            # 3 Varianten
  python3 produktion/strukturbild/neues_strukturbild.py --anzahl 6
  python3 produktion/strukturbild/neues_strukturbild.py --modell gpt-image-2

Ergebnis: $SCRATCH/strukturbild/neu/variante_*.png (1536x1024) und ein
Kontaktbogen. Auswahl und Hochskalierung erfolgen danach.
"""
import argparse
import base64
import io
import os
import time

from PIL import Image

from personen_retusche import lade_key, ZIEL

ZIEL_NEU = os.path.join(ZIEL, "neu")
os.makedirs(ZIEL_NEU, exist_ok=True)

PROMPT = """A photograph, not an illustration: architectural photography of a real modern bank
building in 2030, shot on a full-frame camera with a tilt-shift lens in natural daylight —
real materials, real skin, real fabric, real depth of field. Absolutely no illustration
style, no 3D render look, no CGI visualisation, no flat vector shapes, no cartoon faces.

The building is shown as a cross-section — a clean dollhouse cutaway with the front facade
removed so you look straight into every room.
Four stacked floors of equal height, perfectly symmetric, the building centred and filling
the frame, soft natural daylight, calm and premium, boardroom-grade, not toy-like.

MOST IMPORTANT — how each floor is seen: every one of the four floors is drawn from its own
slightly elevated viewpoint, as if you were standing a little above that floor and looking
gently down into it. In EVERY floor without exception you therefore see: the floor surface
as an open strip running across the room in front of the furniture, and every person
complete from head to shoes, standing or sitting on that floor with their feet visible and
touching the ground. No person is ever cut off by the concrete slab edge, no feet are
hidden, no legs disappear behind a parapet. Below each room, a narrow band of the concrete
floor slab is seen edge-on, and the people stand well clear of it.

Consistent scale: people are the same size relative to their room on every floor — a
standing adult reaches roughly three quarters of the room height, a seated adult about half.
Nobody is oversized or dwarfed compared to the other floors. Furniture is at realistic
scale: desks about 74 cm high, tables reaching the seated people's forearms.

The people: photorealistic, ordinary-looking European office workers of mixed ages,
genders and backgrounds in business-casual clothing. Natural hair with a soft, real
hairline and individual strands — never a hard painted hairline, never a wig-like helmet of
hair. Natural skin texture with pores, relaxed everyday expressions, hands with five clearly
separated fingers, proper closed shoes on both feet. Calm, professional, believable — not
glossy stock-photo models, not waxy, not airbrushed.

A central full-height glass elevator shaft runs as a vertical spine between the left and
right rooms, subtly glowing deep green. It contains exactly ONE glass elevator car, stopped
at a single floor, with one person standing inside, complete with shoes on the car floor.
The rest of the shaft is empty glass.

Both outer side walls, left and right, carry large floor-to-ceiling windows on every floor,
symmetric, letting daylight into the rooms on both sides equally.

Top floor, LEFT — sign "BOARDROOM": an executive boardroom, five or six board members seated
in office chairs around a long dark wooden conference table, facing a wall-mounted governance
dashboard with donut charts, bars and KPI tiles. The table legs and the chair pedestals with
castors stand on the visible floor.
Top floor, RIGHT — sign "PRODUCT & INNOVATION": a project room, two people standing at a
whiteboard covered in sticky notes and two people seated at a wooden desk with laptops.

Second floor, LEFT — sign "COMPLIANCE & RISK": a control room, five risk controllers seated
in office chairs at one long desk facing a wall of monitors showing a world map, charts and
dashboards. Each person sits properly on their chair, the chair pedestals with castors on
the floor behind them.
Second floor, RIGHT — sign "TECHNOLOGY": a technology and AI hub, two people standing in
conversation at a comfortable professional distance in front of a large wall display showing
an abstract neural-network visualisation, two engineers seated at desks, a modest row of
server racks along the back wall. All visuals on flat screens, no free-floating holograms.

First floor, LEFT — sign "CORPORATE SERVICES / HR": a bright open HR and learning space with
bookshelves and plants, two small groups seated in green upholstered armchairs at round
wooden tables, relaxed and comfortably spaced.
First floor, RIGHT — sign "OPERATIONS": a calm back-office floor, four people seated at
wooden desks with workflow screens, one colleague standing at a standing desk.

Ground floor, LEFT — sign "BRANCH": a welcoming retail branch with a wooden teller counter,
staff behind it, two customers in front of it, and a row of green self-service terminals.
Ground floor, RIGHT — sign "ADVISORY": a sales advisory meeting, an adviser and two clients
seated in armchairs around a round wooden table, an advisory dashboard on the wall.

Outside, left and right and below: a paved plaza with a few pedestrians walking past, each
complete with shoes and a soft cast shadow, and a low concrete sign block in front of the
building with the words "HORIZON BANK" in deep green letters.

Each room carries one short room label as a neat sign on its back wall, consistent modern
uppercase, deep green on light, spelled exactly as given above. These labels and the plaza
sign are the only text in the image.

Material and colour: light stone and warm wood surfaces, glass, exposed concrete,
professional and restrained. Accent colour deep green #046A38 with a secondary brighter
green #86BC25; screens glow softly in green on dark. Even, clean daylight, high detail,
crisp edges, the tonality and grain of a real architectural photograph. Aspect ratio 3:2."""


def erzeugen(client, modell, n, parallel=4):
    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=parallel) as ex:
        list(ex.map(lambda i: eine(client, modell, i), range(n)))


def eine(client, modell, i):
    for _ in range(1):
        p = os.path.join(ZIEL_NEU, f"variante_{i + 1}.png")
        if os.path.exists(p):
            print(f"variante_{i + 1} vorhanden", flush=True)
            return
        for versuch in range(3):
            try:
                t = time.time()
                r = client.images.generate(model=modell, prompt=PROMPT,
                                           size="1536x1024", quality="high")
                Image.open(io.BytesIO(base64.b64decode(r.data[0].b64_json))).convert(
                    "RGB").save(p)
                print(f"variante_{i + 1} fertig ({time.time() - t:.0f}s)", flush=True)
                break
            except Exception as e:
                print(f"  variante_{i + 1} retry {versuch + 1}: {str(e)[:140]}", flush=True)
                time.sleep(10 * (versuch + 1))


def kontaktbogen():
    dateien = sorted(f for f in os.listdir(ZIEL_NEU) if f.startswith("variante_"))
    if not dateien:
        return
    b, h = 900, 600
    spalten = 2
    zeilen = -(-len(dateien) // spalten)
    bogen = Image.new("RGB", (spalten * b, zeilen * (h + 26)), (20, 20, 20))
    from PIL import ImageDraw
    d = ImageDraw.Draw(bogen)
    for i, f in enumerate(dateien):
        im = Image.open(os.path.join(ZIEL_NEU, f)).resize((b, h))
        x, y = (i % spalten) * b, (i // spalten) * (h + 26)
        bogen.paste(im, (x, y + 26))
        d.text((x + 6, y + 6), f, fill=(230, 230, 230))
    p = os.path.join(ZIEL, "neue_varianten.jpg")
    bogen.save(p, quality=88)
    print("kontaktbogen:", p)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--anzahl", type=int, default=3)
    ap.add_argument("--modell", default=os.environ.get("IMAGE_MODEL", "gpt-image-2"))
    ap.add_argument("--parallel", type=int, default=4)
    a = ap.parse_args()
    lade_key()
    from openai import OpenAI
    erzeugen(OpenAI(), a.modell, a.anzahl, a.parallel)
    kontaktbogen()


if __name__ == "__main__":
    main()
