# Leitfragen-Consultant (3D-Avatar)

Der Consultant poppt unten rechts im Kapitel-Reader auf und stellt die Leitfrage
des aktuellen Schritts (im „Karl-Klammer"-Prinzip). Er rendert ein geriggtes
3D-Modell; solange keins vorliegt, zeigt er eine 2D-SVG-Silhouette — die App ist
also jederzeit lauffähig.

## Bausteine

| Datei | Zweck |
| --- | --- |
| `src/consultant/ConsultantAvatar.tsx` | Dock, Sprechblase, 2D-Fallback, ErrorBoundary |
| `src/consultant/ConsultantCanvas.tsx` | react-three-fiber-Bühne (lazy → eigener Chunk) |
| `src/consultant/Consultant3D.tsx` | GLB laden, Animationen (idle/greeting/talking) mappen |
| `src/consultant/consultantConfig.ts` | Modell-URL, Clip-Namen, Kamera-Fit |
| `public/models/consultant.glb` | das geriggte, animierte Modell (eingecheckt, einmalig per Meshy erzeugt) |

## Modell erzeugen — zwei Wege (gleiche Meshy-API, gleicher Key)

### A) Standalone-Script (reproduzierbar, CI-tauglich)

```bash
export MESHY_API_KEY=msy_...          # https://www.meshy.ai/api
cd bank-der-zukunft-2035
npm run generate:consultant           # Preview → Refine → Rigging → Idle → normalisieren → optimieren
npm run build                         # dist/ neu bauen, danach dist/ committen
```

Flags: `--prompt "…"`, `--ai-model meshy-6`, `--pose t-pose`, `--polycount 60000`,
`--actions idle=0`, `--skip-rig`.

Das Script erzeugt den Charakter mit **Meshy-6 in T-Pose** (realistische
Proportionen; T-Pose ist Voraussetzung für sauberes Rigging), riggt ihn und legt
den **idle**-Clip darauf. Danach normalisiert es die Materialien und verkleinert
das GLB (Geometrie-Simplify + WebP-1024-Textur) auf ~3–4 MB.

**Warum nur `idle`?** Meshys Auto-Rigging setzt an den Schultern zu grobe
Skin-Weights. Sobald eine Bibliotheks-Animation die Arme **hebt** (wave, talk …),
reißt es den Torso-Mesh zu grotesken „Flügeln" auseinander (an den rohen
Meshy-GLBs verifiziert, nicht erst nach dem Merge). `idle` hält die Arme am
Körper und bleibt stabil; `pickClip()` in `Consultant3D.tsx` fällt für
greeting/talking automatisch auf `idle` zurück. Weitere Clips (Action-IDs aus der
[Meshy-Animation-Library](https://docs.meshy.ai/en/api/animation-library)) nur mit
einem besseren Rig via `--actions idle=0,talk=313`.

### B) Meshy-MCP-Server (interaktiv, agentengesteuert)

Projektweite Konfiguration liegt in `../.mcp.json` (Repo-Wurzel) und bindet
`meshy-ai-mcp-server` ein. Aktivierung:

1. Meshy-API-Key als Umgebungsvariable setzen: `export MESHY_API_KEY=msy_...`
2. Claude Code neu starten (liest `.mcp.json` beim Start), MCP-Server bestätigen.
3. Danach lassen sich die Meshy-Tools direkt aufrufen (Text-to-3D, Rigging,
   Animation, Fortschritts-Streaming, Download). Das fertige GLB nach
   `bank-der-zukunft-2035/public/models/consultant.glb` legen, dann `npm run build`.

Der Key wird per `${MESHY_API_KEY}` aus der Umgebung gelesen — es steht **kein
Secret** im Repo.

> Hinweis: In einer entfernten Web-Session hängt die Erreichbarkeit von npx und
> der Meshy-API von der Netzwerk-Policy der Umgebung ab. Wege A und B teilen sich
> denselben Meshy-Account/-Key.
