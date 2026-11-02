#!/usr/bin/env python3
"""
Strukturbild von 1536x1024 auf 6144x4096 hochskalieren (Real-ESRGAN x4).

Warum ueberhaupt: gpt-image liefert hoechstens 1536x1024, das Masterbild braucht
die vierfache Kantenlaenge. Reines Interpolieren macht die Personen weich — im
alten Strukturbild waren sie scharf, weil es mit einem kreativen Upscaler
(Magnific, siehe produktion/BRIEFING.md) vergroessert wurde, der beim
Vergroessern Struktur erfindet.

Warum nicht gpt-image dafuer: getestet und verworfen. Mit Maske liest das Modell
den Maskenbereich als "fuelle diese Flaeche" und zoomt die Personen
formatfuellend heran — aus drei kleinen Sitzenden werden drei grosse, auch wenn
der Prompt die Groesse ausdruecklich festschreibt. Ohne Maske erfindet es die
Szene neu. gpt-image ist ein Bildgenerator, kein Upscaler.

Real-ESRGAN laeuft lokal auf der CPU. Die Architektur (RRDBNet) steht hier
direkt im Skript, weil die ueblichen Pakete (basicsr, realesrgan) torchvision in
einer Version verlangen, die zur installierten torch-Version nicht passt.

Vorbereitung:
  pip install torch --index-url https://download.pytorch.org/whl/cpu
  curl -sSL -o $SCRATCH/upscale/RealESRGAN_x4plus.pth \\
    https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth

Aufruf:
  python3 produktion/strukturbild/hochskalieren.py <quelle.png> [<ziel.png>]
"""
import os
import sys
import time

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image

S = os.environ.get("SCRATCH", "/tmp/claude-0/-home-user-kiarbeitsplatz/"
                   "27db0dfd-7ffe-5925-98a2-721e8026403b/scratchpad")
GEWICHTE = os.path.join(S, "upscale", "RealESRGAN_x4plus.pth")
KACHEL = 256      # Kachelgroesse der Inferenz (CPU-Speicher)
UEBERLAPP = 16    # Ueberlappung, damit keine Kachelnaehte entstehen


class ResidualDenseBlock(nn.Module):
    def __init__(self, nf=64, gc=32):
        super().__init__()
        self.conv1 = nn.Conv2d(nf, gc, 3, 1, 1)
        self.conv2 = nn.Conv2d(nf + gc, gc, 3, 1, 1)
        self.conv3 = nn.Conv2d(nf + 2 * gc, gc, 3, 1, 1)
        self.conv4 = nn.Conv2d(nf + 3 * gc, gc, 3, 1, 1)
        self.conv5 = nn.Conv2d(nf + 4 * gc, nf, 3, 1, 1)
        self.lrelu = nn.LeakyReLU(0.2, inplace=True)

    def forward(self, x):
        x1 = self.lrelu(self.conv1(x))
        x2 = self.lrelu(self.conv2(torch.cat((x, x1), 1)))
        x3 = self.lrelu(self.conv3(torch.cat((x, x1, x2), 1)))
        x4 = self.lrelu(self.conv4(torch.cat((x, x1, x2, x3), 1)))
        x5 = self.conv5(torch.cat((x, x1, x2, x3, x4), 1))
        return x5 * 0.2 + x


class RRDB(nn.Module):
    def __init__(self, nf, gc=32):
        super().__init__()
        self.rdb1 = ResidualDenseBlock(nf, gc)
        self.rdb2 = ResidualDenseBlock(nf, gc)
        self.rdb3 = ResidualDenseBlock(nf, gc)

    def forward(self, x):
        return self.rdb3(self.rdb2(self.rdb1(x))) * 0.2 + x


class RRDBNet(nn.Module):
    """Real-ESRGAN x4plus: 23 RRDB-Bloecke, zwei Pixel-Shuffle-Stufen."""

    def __init__(self, nf=64, nb=23, gc=32):
        super().__init__()
        self.conv_first = nn.Conv2d(3, nf, 3, 1, 1)
        self.body = nn.Sequential(*[RRDB(nf, gc) for _ in range(nb)])
        self.conv_body = nn.Conv2d(nf, nf, 3, 1, 1)
        self.conv_up1 = nn.Conv2d(nf, nf, 3, 1, 1)
        self.conv_up2 = nn.Conv2d(nf, nf, 3, 1, 1)
        self.conv_hr = nn.Conv2d(nf, nf, 3, 1, 1)
        self.conv_last = nn.Conv2d(nf, 3, 3, 1, 1)
        self.lrelu = nn.LeakyReLU(0.2, inplace=True)

    def forward(self, x):
        feat = self.conv_first(x)
        feat = feat + self.conv_body(self.body(feat))
        feat = self.lrelu(self.conv_up1(F.interpolate(feat, scale_factor=2, mode="nearest")))
        feat = self.lrelu(self.conv_up2(F.interpolate(feat, scale_factor=2, mode="nearest")))
        return self.conv_last(self.lrelu(self.conv_hr(feat)))


def laden():
    netz = RRDBNet()
    sd = torch.load(GEWICHTE, map_location="cpu", weights_only=True)
    netz.load_state_dict(sd.get("params_ema", sd.get("params", sd)), strict=True)
    netz.eval()
    torch.set_num_threads(os.cpu_count() or 4)
    return netz


def hochskalieren(netz, bild):
    """Kachelweise Inferenz mit Ueberlappung; Rueckgabe in vierfacher Groesse."""
    x = torch.from_numpy(np.asarray(bild, np.float32) / 255.0).permute(2, 0, 1).unsqueeze(0)
    _, _, h, w = x.shape
    out = torch.zeros(1, 3, h * 4, w * 4)
    zaehler = 0
    gesamt = ((h + KACHEL - 1) // KACHEL) * ((w + KACHEL - 1) // KACHEL)
    for y0 in range(0, h, KACHEL):
        for x0 in range(0, w, KACHEL):
            y1, x1 = min(y0 + KACHEL, h), min(x0 + KACHEL, w)
            gy0, gx0 = max(0, y0 - UEBERLAPP), max(0, x0 - UEBERLAPP)
            gy1, gx1 = min(h, y1 + UEBERLAPP), min(w, x1 + UEBERLAPP)
            with torch.no_grad():
                teil = netz(x[:, :, gy0:gy1, gx0:gx1])
            # Ueberlappung wieder abschneiden
            oy0, ox0 = (y0 - gy0) * 4, (x0 - gx0) * 4
            out[:, :, y0 * 4:y1 * 4, x0 * 4:x1 * 4] = \
                teil[:, :, oy0:oy0 + (y1 - y0) * 4, ox0:ox0 + (x1 - x0) * 4]
            zaehler += 1
            print(f"\r  Kachel {zaehler}/{gesamt}", end="", flush=True)
    print()
    arr = (out.squeeze(0).permute(1, 2, 0).clamp(0, 1).numpy() * 255).round().astype(np.uint8)
    return Image.fromarray(arr)


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    quelle = sys.argv[1]
    ziel = sys.argv[2] if len(sys.argv) > 2 else quelle.replace(".png", "_x4.png")
    bild = Image.open(quelle).convert("RGB")
    print(f"{quelle}  {bild.size}  →  {bild.size[0] * 4}x{bild.size[1] * 4}")
    t = time.time()
    hochskalieren(laden(), bild).save(ziel)
    print(f"fertig in {time.time() - t:.0f}s: {ziel}")


if __name__ == "__main__":
    main()
