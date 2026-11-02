# Banking Horizon 2030 — SPFx-Paket für SharePoint

Dieses Projekt verpackt die komplette App **Banking Horizon 2030** (`../03_banking-horizon`)
als SharePoint-Framework-Lösung (SPFx 1.21.1). Das fertige Paket liegt fertig gebaut unter:

```
sharepoint/solution/banking-horizon-2030.sppkg
```

Die App wird vollständig **im Paket mitgeliefert** (ClientSideAssets) — es ist kein
externes Hosting nötig. Das WebPart rendert die App in einem iframe und löst alle
relativen Pfade der App über einen injizierten `<base>`-Tag gegen die
ClientSideAssets-URL auf.

## Einbindung in SharePoint (Schritt für Schritt)

1. **Paket herunterladen:** `sharepoint/solution/banking-horizon-2030.sppkg` aus diesem Repository.
2. **In den App-Katalog hochladen:** SharePoint-Admin-Center → *Weitere Funktionen* →
   *Apps* → *App-Katalog* → *Apps für SharePoint* → Paket hochladen.
   Beim Hochladen **„Diese App auf allen Websites zur Verfügung stellen"** aktivieren
   (das Paket nutzt `skipFeatureDeployment`), oder die App anschließend gezielt auf
   einzelnen Websites hinzufügen (*Website-Inhalte* → *Neu* → *App* → „Banking Horizon 2030").
3. **Auf einer Seite einbinden:** Moderne SharePoint-Seite bearbeiten → **+** →
   WebPart **„Banking Horizon 2030"** (Gruppe *Advanced*) einfügen.
   Empfehlung: Seitenlayout „Volle Breite" bzw. eine Seite ohne Seitenleiste verwenden.
4. Im WebPart-Eigenschaftenbereich lassen sich einstellen:
   - **Volle Fensterhöhe** (Standard: an) oder feste Höhe in Pixeln,
   - optional eine **externe App-URL** — dann wird statt der mitgelieferten Assets
     eine extern gehostete Instanz (z. B. `https://kiarbeitsplatz.pages.dev/03_banking-horizon/dist/`) eingebettet.

## Hinweise / bekannte Grenzen

- **Office-365-CDN:** Ist das öffentliche Office-365-CDN für ClientSideAssets aktiv,
  werden JS/CSS/Bilder von dort ausgeliefert. Die Standard-Dateitypenliste des CDN
  umfasst kein `.zip`/`.xlsx`/`.mp4` — der Download „Holodeck standalone" und der
  statische KPI-Excel-Link können dann ins Leere laufen (die per Klick generierte
  Hypothesen-Excel funktioniert immer, sie wird im Browser erzeugt). Abhilfe:
  Dateitypen im CDN freischalten (`Set-SPOTenantCdnPolicy`) oder die externe App-URL nutzen.
- **Bearbeitungsmodus:** Die geteilte Persistenz (`/api/content`, Cloudflare KV) steht
  innerhalb von SharePoint nicht zur Verfügung; Änderungen werden dann nur lokal im
  Browser (localStorage) gespeichert. Die App fängt das selbst ab.
- **Bildgrößen:** Beim Paketieren werden große PNGs verlustarm palette-quantisiert
  (sharp/libimagequant, quality 90), damit das `.sppkg` unter 100 MB bleibt.

## Selbst bauen

Voraussetzungen: Node 22 (≥ 22.14).

```bash
cd banking-horizon-spfx
npm install
npm run package
# Ergebnis: sharepoint/solution/banking-horizon-2030.sppkg
```

`npm run package` führt aus:

1. `scripts/prepare-assets.mjs` — kopiert `../03_banking-horizon/dist` nach
   `appassets/app`, quantisiert große PNGs und schreibt die gehashten
   Entry-Dateinamen nach `src/webparts/bankingHorizon2030/generated/appFiles.ts`.
2. `gulp bundle --ship` — baut das WebPart-Bundle.
3. `scripts/copy-assets-to-deploy.mjs` — legt die App-Assets ins Deploy-Verzeichnis.
4. `gulp package-solution --ship` — erzeugt das `.sppkg` inklusive ClientSideAssets.
5. `scripts/strip-dir-entries.mjs` — entfernt Ordner-Einträge aus dem Zip; OPC-Part-URIs
   dürfen nicht mit `/` enden, sonst lehnt SharePoint das Paket als ungültig ab.

`prepare-assets` baut die App vorher selbst in der IIFE-Variante
(`vite.spfx.config.ts` → `dist-spfx/`) — ES-Module würden am CORS des
Office-365-CDN scheitern (Blackscreen).

## Release-Regeln (Lessons Learned aus DEX)

- **Jedes Release erhöht mindestens die MINOR-Version** (1.1 → 1.2 → …).
  SharePoint erkennt Patch-Sprünge im App-Katalog oft nicht und liefert
  dann das alte Bundle weiter aus. Die Version steht an **drei Stellen**
  und muss identisch gepflegt werden:
  1. `package.json` → `"version": "x.y.0"`
  2. `config/package-solution.json` → `solution.version` **und**
     `features[*].version` (vierstellig `x.y.0.0`)
  3. `src/webparts/bankingHorizon2030/version.ts` → `APP_VERSION = 'x.y.0'`
- Der Wert aus `version.ts` wird als **Badge unten rechts im WebPart**
  gerendert — erst wenn der Badge die neue Nummer zeigt (nach hartem
  Reload, Strg+F5), ist das neue Bundle wirklich aktiv.
- Immer **clean bauen**: `rm -rf lib release temp sharepoint` vor dem
  Paketieren (macht `npm run package` nicht automatisch), und prüfen,
  dass in `release/assets/` genau **ein** `…web-part_<hash>.js` liegt.
