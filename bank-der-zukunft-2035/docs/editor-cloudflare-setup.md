# In-Tool-Editor — geteilte Persistenz über Cloudflare KV

Der Bearbeitungsmodus (Stift-Icon im Kapitel-Reader) erlaubt es, Inhalte direkt
im Tool zu ändern: Hypothesen-Titel und -Texte (Status Quo / 2030), Leitfragen,
Aktivitäts-/Demo-Texte, Bild-Kommentare sowie die Management-Summary-Bausteine
und die KPI-Werte. Änderungen werden **sofort lokal** (localStorage) gespeichert;
der Button **„Für alle speichern"** legt sie **geteilt auf dem Server** ab, sodass
alle Betrachter:innen sie sehen.

## Wie es funktioniert

- **Client:** lädt beim Start `GET /api/content` und legt die gespeicherten
  Overrides über die Basisdaten. „Für alle speichern" sendet `PUT /api/content`.
- **Server:** die Cloudflare Pages Function `functions/api/content.ts` liest/
  schreibt einen einzelnen JSON-Blob im KV-Namespace **`CONTENT_KV`**.
- **Fallback:** ist `CONTENT_KV` nicht gebunden, antwortet der Server neutral und
  der Editor läuft rein lokal (nicht geteilt) weiter — die App bricht nie.

## Einmalige Einrichtung (Cloudflare-Account nötig)

1. KV-Namespace anlegen:

   ```bash
   npx wrangler kv namespace create CONTENT_KV
   ```

2. Bindung setzen — eine der beiden Varianten:

   - **wrangler.toml:** den vorbereiteten Block aktivieren und die zurückgegebene
     `id` eintragen:

     ```toml
     [[kv_namespaces]]
     binding = "CONTENT_KV"
     id = "<die-zurueckgegebene-id>"
     ```

   - **oder Pages-Dashboard:** Projekt → Settings → Functions →
     *KV namespace bindings* → Variable `CONTENT_KV` auf den Namespace binden.

3. Neu deployen. Ab dann ist „Für alle speichern" serverseitig persistent und
   für alle sichtbar.

## Hinweis zum Deploy-Pfad

Der Client ruft `${BASE_URL}api/content` auf (BASE_URL = Vite-`base`, i. d. R.
`/`). Die Pages Function liegt unter `functions/api/content.ts` und wird von
Cloudflare unter `/api/content` bereitgestellt. Wird die App unter einem
Unterpfad ausgeliefert, muss der Funktions-Pfad entsprechend übereinstimmen.

## Nicht editierbar

- Das **Strukturbild** (Master) bleibt bewusst außen vor.
