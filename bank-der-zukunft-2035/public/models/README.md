# 3D-Modelle

Ablageort für das geriggte GLB-Modell des Leitfragen-Consultants.

Erwartete Datei: `consultant.glb`

Solange diese Datei fehlt, zeigt die App automatisch eine 2D-SVG-Silhouette
als Consultant an — sie bleibt also voll funktionsfähig.

## Modell erzeugen (Meshy)

```bash
export MESHY_API_KEY=msy_...        # Key: https://www.meshy.ai/api
cd bank-der-zukunft-2035
npm run generate:consultant         # Preview → Refine → Rigging → Animation → GLB
```

Das Script (`scripts/meshy-generate.mjs`) lädt das fertige Modell direkt hierher
(`public/models/consultant.glb`). Danach:

```bash
npm run build      # baut dist/ neu
# dist/ committen
```

Details und Flags: siehe Kopf von `scripts/meshy-generate.mjs`.
