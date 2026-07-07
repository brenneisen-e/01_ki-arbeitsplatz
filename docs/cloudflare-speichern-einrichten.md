# „Für alle speichern" in Cloudflare einrichten — Schritt für Schritt

Diese Anleitung beschreibt, was im Cloudflare-Dashboard hinterlegt werden muss,
damit der **Änderungsbereich** (Mini-CMS) der App „Bank der Zukunft 2035" nicht
nur lokal im Browser, sondern **geteilt für alle** speichert — inklusive der
Bild-Uploads.

> Der Code ist bereits vorbereitet: Die Server-Funktionen liegen jetzt im
> deployten Root-Verzeichnis `functions/api/` (`content.js`, `upload.js`,
> `asset/[[path]].js`) und werden unter `/api/content`, `/api/upload`,
> `/api/asset/*` bedient. **Du musst nur noch die zwei Bindungen setzen und neu
> deployen** — kein Code mehr nötig.

---

## 0. Wie das Speichern funktioniert (Kurzüberblick)

- **Texte** (Hypothesen, Vision, Business Case, Kernaussagen, Leitfragen …):
  „Für alle speichern" sendet `PUT /api/content`; die Funktion legt einen
  einzelnen JSON-Stand im **KV-Namespace `CONTENT_KV`** ab. Beim Laden holt die
  App `GET /api/content` und legt die Overrides über die Basisdaten.
- **Bilder** („Bild ersetzen"): `POST /api/upload` legt die Datei im
  **R2-Bucket `CONTENT_R2`** ab; ausgeliefert werden sie über `/api/asset/<key>`.
- **Fallback:** Ist eine Bindung nicht gesetzt, bleibt alles beim
  localStorage-Verhalten (nur auf diesem Gerät, nicht geteilt) — die App bricht
  nie. Der Speichern-Button zeigt dann „Server nicht verbunden — nur lokal".

Es sind also **zwei** Dinge einzurichten: **KV** (für Texte, Pflicht) und
optional **R2** (für Bild-Uploads).

---

## Voraussetzungen

- Zugriff auf den Cloudflare-Account mit dem **Pages-Projekt `kiarbeitsplatz`**.
- Rechte, um KV-Namespaces / R2-Buckets anzulegen und Bindungen zu setzen.

Die drei bereits vorhandenen **Secrets** (`WORKSHOP_PASSWORD`, `ACCESS_PASSWORD`,
`ANTHROPIC_API_KEY`) haben mit dem Speichern **nichts** zu tun — die bleiben
unverändert.

---

## Teil A — Textspeichern über KV (Pflicht)

### A1 · KV-Namespace anlegen

1. Cloudflare-Dashboard öffnen.
2. Linke Navigation: **Storage & Databases → KV**.
3. **„Create a namespace"** (bzw. „Create namespace").
4. Namen vergeben, z. B. `kiarbeitsplatz-content`. **Add / Create**.

> Die zurückgegebene Namespace-ID musst du dir **nicht** notieren — beim Binden
> wählst du den Namespace bequem aus einer Liste.

### A2 · Namespace an das Pages-Projekt binden

1. Dashboard: **Workers & Pages** (in manchen Accounts „Compute (Workers)").
2. Projekt **`kiarbeitsplatz`** öffnen.
3. Tab **„Settings"**.
4. Abschnitt **„Bindings"** → **„+ Add"**.
5. Typ: **„KV namespace"**.
6. **Variable name:** `CONTENT_KV`
   — exakt so schreiben, Groß-/Kleinschreibung ist entscheidend.
7. **KV namespace:** den in A1 erstellten Namespace auswählen.
8. Speichern.

### A3 · Neu deployen (unbedingt nötig)

Bindungen wirken **erst für neue Deployments** — ein bestehendes Deployment
kennt sie nicht.

- Tab **„Deployments"** → neuestes **Production**-Deployment → Menü **„⋯"** →
  **„Retry deployment"**.
- Alternativ einen beliebigen Commit auf `main` pushen (löst Auto-Deploy aus).

### A4 · Testen

1. App im Browser öffnen und **einloggen** (die Plattform ist passwortgeschützt).
2. Oben links **„Bearbeiten"** → ein beliebiges Feld ändern → **„Für alle
   speichern"**.
3. Erfolg: Der Button zeigt kurz **„Gespeichert"** (grün).
4. Gegenprobe: In einem zweiten Browser / Inkognito-Fenster einloggen und die App
   öffnen — die Änderung ist da.

Damit sind **Texte, Hypothesen, Leitfragen, Kernaussagen, Vision und Business
Case** geteilt speicherbar.

---

## Teil B — Bild-Uploads über R2 (optional)

Nur nötig, wenn im Editor Bilder per **„Bild ersetzen"** ausgetauscht und geteilt
werden sollen. Textspeichern funktioniert auch ohne R2.

### B1 · R2 aktivieren und Bucket anlegen

1. Dashboard: **R2 Object Storage**.
2. Falls noch nicht aktiv: **„Enable R2"** (einmalig; ggf. Zahlungsmethode
   hinterlegen — es gibt ein kostenloses Kontingent von 10 GB).
3. **„Create bucket"** → Name z. B. `kiarbeitsplatz-assets`
   (Standard-Region / „Automatic" genügt). **Create bucket**.

### B2 · Bucket binden

1. Pages-Projekt **`kiarbeitsplatz`** → **Settings → Bindings → „+ Add"**.
2. Typ: **„R2 bucket"**.
3. **Variable name:** `CONTENT_R2` (exakt so).
4. **R2 bucket:** den in B1 erstellten Bucket auswählen.
5. Speichern.

### B3 · Neu deployen

Wie A3 (Retry deployment oder Commit).

### B4 · Testen

Bearbeiten → an einem Bild **„Bild ersetzen"** → Datei wählen → Bild erscheint →
**„Für alle speichern"**.

---

## Troubleshooting

| Symptom | Ursache / Lösung |
| --- | --- |
| Speichern-Button wird orange, „Server nicht verbunden — nur lokal" | KV-Bindung fehlt **oder** es wurde nach dem Binden **nicht neu deployt** (A2 + A3). Variablenname exakt `CONTENT_KV`? |
| Bild-Upload meldet „Upload nicht möglich" | R2-Bindung `CONTENT_R2` fehlt oder kein Redeploy (B2 + B3). |
| Gespeichert, aber andere sehen nichts | Redeploy vergessen, oder der zweite Browser ist nicht eingeloggt (die ganze Plattform liegt hinter dem Passwort-Login). |
| Beim Testen von außen (z. B. `curl /api/content`) kommt **401** | Normal: die gesamte Seite liegt hinter dem Login-Gate (`_middleware.js`). Im **eingeloggten** Browser wird die API korrekt bedient. |
| Nach Redeploy immer noch nur lokal | Prüfen, ob das Redeploy tatsächlich das **Production**-Deployment betraf und erfolgreich war (Deployments-Tab, Status „Success"). |

---

## Sicherheit & gut zu wissen

- Der geteilte Stand liegt als **ein** JSON-Blob in KV (Key `overrides`, max
  2 MB). Es gibt **keine Versionierung**: Wer „Für alle speichern" klickt,
  überschreibt den gemeinsamen Stand. Also bewusst speichern.
- Alle Editor-Endpunkte liegen hinter dem **Login-Gate** der Plattform
  (`ACCESS_PASSWORD`). Nur eingeloggte Personen können lesen und speichern.
- Hochgeladene Bilder liegen in R2 unter `up/<uuid>.<ext>` und werden über
  `/api/asset/...` mit langem Cache ausgeliefert.
- Das **Strukturbild** (Master) bleibt bewusst nicht editierbar.
