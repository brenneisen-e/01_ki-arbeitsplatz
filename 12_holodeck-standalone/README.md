# EDEKABANK Holodeck 2031 — Standalone

Eigenständige Version des Holodecks (begehbare Kommandobrücke der EDEKABANK 2031),
herausgelöst aus dem `kiarbeitsplatz`-Monorepo (`bank-der-zukunft-2035`). Das Projekt
ist vollständig self-contained: Quellcode, Bilder und Build-Setup — keine Abhängigkeit
zum ursprünglichen Repo.

**Stack:** Vite + React 19 + TypeScript · GSAP (Kameraflüge) · Lucide Icons

## Lokal starten

```bash
npm install
npm run dev        # Dev-Server auf http://localhost:5181
```

## Build

```bash
npm run build      # TypeScript-Check + Vite-Build nach dist/
npm run preview    # gebaute Version lokal testen
```

## Umzug in ein eigenes GitHub-Repo

```bash
# Im entpackten Projektordner:
git init
git add .
git commit -m "EDEKABANK Holodeck 2031 — Standalone"
git branch -M main
git remote add origin https://github.com/<DEIN-ACCOUNT>/<DEIN-REPO>.git
git push -u origin main
```

## Deployment auf Cloudflare Pages (eigene Domain)

1. In das [Cloudflare-Dashboard](https://dash.cloudflare.com) → **Workers & Pages** →
   **Create** → **Pages** → **Connect to Git** → das neue GitHub-Repo auswählen.
2. Build-Einstellungen:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
3. **Save and Deploy** — die Seite ist danach unter `https://<projekt>.pages.dev` erreichbar.
4. Eigene Domain: im Pages-Projekt unter **Custom domains** → **Set up a custom domain**
   die gewünschte Domain eintragen (liegt die Domain bei Cloudflare, wird der
   CNAME-Eintrag automatisch gesetzt).

Da die App `base: './'` verwendet und ein reines Hash-Routing (`#/holodeck/…`) hat,
funktioniert sie ohne weitere Redirect-/Rewrite-Regeln — sowohl unter der Domain-Root
als auch in Unterverzeichnissen.

## Projektstruktur

```
├── index.html                     Einstiegspunkt (Titel, Favicon, Meta)
├── package.json                   Abhängigkeiten & Scripts
├── vite.config.ts                 Vite-Konfiguration (base './', Port 5181)
├── tsconfig.json                  TypeScript-Konfiguration (strict)
├── public/
│   └── images/holodeck/           Ankerbild + 5 Deep-Dive-Bilder (PNG)
└── src/
    ├── main.tsx                   Standalone-Einstieg (rendert direkt das Holodeck)
    ├── index.css                  Design-Tokens (Farben, Typo, Radien, Motion)
    ├── hooks/useReducedMotion.ts  prefers-reduced-motion-Hook
    └── holodeck/
        ├── Holodeck.tsx           Kommandobrücke: Übersicht, Hotspots, Kameraflug
        ├── data.ts                Inhalte der 5 Steuerungsräume + Hash-Deep-Links
        ├── szenarien.ts           Szenario-Matrix (Vorspann-Inhalte)
        ├── SzenarioVorspann.tsx   Interaktiver Auftakt vor der Brücke
        └── DebugZoneEditor.tsx    Hotspot-Justage (Taste „D" bzw. ?debug)
```

## Bedienung

- **Klick auf eine Station** → Kameraflug in den Deep-Dive (Bild links, Text rechts)
- **← / →** blättern zwischen den fünf Steuerungsräumen, **Esc** zurück zur Übersicht
- **D** öffnet den Debug-Editor zum Justieren der Hotspot-Zonen
- Deep-Links: `#/holodeck` (Übersicht) bzw. `#/holodeck/<bereich>` (z. B. `#/holodeck/vertrieb`)
