#!/usr/bin/env python3
"""Generiert die Hypothesen-Bilder (und optional das Master-Strukturbild) mit der
OpenAI-Images-API aus den Prompt-Markdown-Dateien im Repo.

Voraussetzungen
---------------
1. Netzzugriff auf api.openai.com (in der Umgebung Network access = Custom,
   Allowed domain "api.openai.com"; Änderungen greifen erst in NEUEN Sessions).
2. API-Key in der Umgebungsvariable OPENAI_API_KEY (nicht ins Repo committen).
3. pip install openai

Nutzung
-------
  export OPENAI_API_KEY=sk-...
  python3 scripts/generate-images.py --list          # zeigt alle Bild-Keys
  python3 scripts/generate-images.py                 # alle Hypothesen-Bilder
  python3 scripts/generate-images.py --only 1_1 3_2  # nur bestimmte
  python3 scripts/generate-images.py --master        # zusätzlich Strukturbild.png
  python3 scripts/generate-images.py --model gpt-image-1 --quality high

Hinweis Seitenverhältnis: gpt-image unterstützt 1024x1024, 1536x1024 (quer) und
1024x1536. Die Hypothesen sind 16:9, das Master-Bild 3:2 — beide werden als
1536x1024 (quer) erzeugt; die App rahmt die Vergleichsfläche selbst.
"""
from __future__ import annotations

import argparse
import base64
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HYP_MD = ROOT / "bild-prompt-hypothesen-2030.md"
MASTER_MD = ROOT / "bild-prompt-strukturbild-2030.md"
OUT_DIR = ROOT / "public" / "images"

# Header wie "**Kapitel 1_1.png**" gefolgt vom nächsten ```-Fenced-Block.
HYP_HEADER = re.compile(r"^\*\*Kapitel\s+(\d+_\d+)\.png\*\*")


def extract_hypothesis_prompts() -> dict[str, str]:
    """Mappt "1_1" -> Prompttext aus der Hypothesen-Markdown-Datei."""
    prompts: dict[str, str] = {}
    lines = HYP_MD.read_text(encoding="utf-8").splitlines()
    i = 0
    while i < len(lines):
        m = HYP_HEADER.match(lines[i].strip())
        if not m:
            i += 1
            continue
        key = m.group(1)
        # nächsten Fenced-Block finden
        j = i + 1
        while j < len(lines) and lines[j].strip() != "```":
            j += 1
        if j >= len(lines):
            break
        buf = []
        j += 1
        while j < len(lines) and lines[j].strip() != "```":
            buf.append(lines[j])
            j += 1
        prompts[key] = "\n".join(buf).strip()
        i = j + 1
    return prompts


def extract_master_prompt() -> str | None:
    """Der Ein-Prompt-Block unter '## Ein-Prompt-Variante …' im Master-Markdown."""
    if not MASTER_MD.exists():
        return None
    text = MASTER_MD.read_text(encoding="utf-8")
    idx = text.find("## Ein-Prompt-Variante")
    if idx == -1:
        return None
    after = text[idx:]
    m = re.search(r"```(.*?)```", after, re.DOTALL)
    return m.group(1).strip() if m else None


def generate(client, model: str, prompt: str, size: str, quality: str) -> bytes:
    res = client.images.generate(
        model=model, prompt=prompt, size=size, quality=quality, n=1
    )
    b64 = res.data[0].b64_json
    if not b64:  # manche Modelle liefern URL statt b64
        import urllib.request

        return urllib.request.urlopen(res.data[0].url).read()
    return base64.b64decode(b64)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default=os.environ.get("IMAGE_MODEL", "gpt-image-1"))
    ap.add_argument("--quality", default="high", choices=["low", "medium", "high", "auto"])
    ap.add_argument("--size", default="1536x1024")
    ap.add_argument("--only", nargs="*", help="nur diese Keys, z. B. 1_1 3_2")
    ap.add_argument("--master", action="store_true", help="zusätzlich Strukturbild.png")
    ap.add_argument("--list", action="store_true", help="nur Keys ausgeben")
    args = ap.parse_args()

    hyp = extract_hypothesis_prompts()
    jobs: list[tuple[str, str]] = []  # (Dateiname, Prompt)
    for key, prompt in hyp.items():
        if args.only and key not in args.only:
            continue
        jobs.append((f"Kapitel {key}.png", prompt))
    if args.master:
        mp = extract_master_prompt()
        if mp:
            jobs.append(("Strukturbild.png", mp))

    if args.list:
        for name, p in jobs:
            print(f"{name:22s} ({len(p)} Zeichen)")
        print(f"\n{len(jobs)} Bild(er).")
        return 0

    key = os.environ.get("OPENAI_API_KEY")
    if not key:
        print("FEHLER: OPENAI_API_KEY nicht gesetzt.", file=sys.stderr)
        return 2
    try:
        from openai import OpenAI
    except ImportError:
        print("FEHLER: 'pip install openai' fehlt.", file=sys.stderr)
        return 2

    client = OpenAI(api_key=key)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    ok = 0
    for name, prompt in jobs:
        try:
            print(f"→ {name} …", flush=True)
            data = generate(client, args.model, prompt, args.size, args.quality)
            (OUT_DIR / name).write_bytes(data)
            ok += 1
        except Exception as e:  # noqa: BLE001
            print(f"  FEHLER bei {name}: {e}", file=sys.stderr)
    print(f"\nFertig: {ok}/{len(jobs)} Bilder in {OUT_DIR.relative_to(ROOT)}.")
    print("Danach: npm run build && dist committen.")
    return 0 if ok == len(jobs) else 1


if __name__ == "__main__":
    raise SystemExit(main())
