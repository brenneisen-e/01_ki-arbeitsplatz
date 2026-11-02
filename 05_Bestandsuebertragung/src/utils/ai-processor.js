/**
 * AI Processor – Claude API Integration für Bestandsübertragung (React)
 * Portiert aus js/bestandsuebertragung/ai-processor.js
 */

const API_CONFIG = {
  model: 'claude-opus-5',
  maxTokens: 16000
}

// ============================================================
// API Key Management (localStorage)
// ============================================================

export function getApiKey() {
  return localStorage.getItem('claude_api_key') || ''
}

export function setApiKey(key) {
  if (key) {
    localStorage.setItem('claude_api_key', key)
  } else {
    localStorage.removeItem('claude_api_key')
  }
}

export function hasApiKey() {
  const key = getApiKey()
  return key.length > 10
}

// ============================================================
// EML Parser (RFC 2822 / MIME)
// ============================================================

export async function parseEmlFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        resolve(parseEmlContent(e.target.result))
      } catch (err) {
        reject(new Error('EML-Parsing fehlgeschlagen: ' + err.message))
      }
    }
    reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden'))
    reader.readAsText(file, 'UTF-8')
  })
}

function parseEmlContent(raw) {
  const splitIdx = raw.search(/\r?\n\r?\n/)
  const headerBlock = splitIdx >= 0 ? raw.substring(0, splitIdx) : raw
  const bodyBlock = splitIdx >= 0 ? raw.substring(splitIdx).replace(/^[\r\n]+/, '') : ''

  const headers = {}
  let currentKey = ''
  for (const line of headerBlock.replace(/\r\n/g, '\n').split('\n')) {
    if (/^\s/.test(line) && currentKey) {
      headers[currentKey] += ' ' + line.trim()
    } else {
      const m = line.match(/^([A-Za-z-]+):\s*(.*)/)
      if (m) {
        currentKey = m[1].toLowerCase()
        headers[currentKey] = m[2].trim()
      }
    }
  }

  const subject = decodeRfc2047(headers['subject'] || '')
  const sender = decodeRfc2047(headers['from'] || '')
  const dateRaw = headers['date'] || ''
  const contentType = headers['content-type'] || 'text/plain'
  const boundaryMatch = contentType.match(/boundary="?([^";\s]+)"?/i)

  let body = ''
  const attachmentTexts = []
  const attachmentNames = []

  if (boundaryMatch) {
    const parts = splitMimeParts(bodyBlock, boundaryMatch[1])
    for (const part of parts) {
      const r = parseMimePart(part)
      if (r.isAttachment) {
        attachmentNames.push(r.filename)
        if (r.textContent) attachmentTexts.push({ type: r.docType, content: r.textContent, filename: r.filename })
      } else if (r.isText && !body) {
        body = r.textContent
      } else if (r.isHtml && !body) {
        body = r.textContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      } else if (r.isMultipart) {
        for (const inner of splitMimeParts(r.rawBody, r.boundary)) {
          const ir = parseMimePart(inner)
          if (ir.isText && !body) body = ir.textContent
          else if (ir.isHtml && !body) body = ir.textContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
          else if (ir.isAttachment) {
            attachmentNames.push(ir.filename)
            if (ir.textContent) attachmentTexts.push({ type: ir.docType, content: ir.textContent, filename: ir.filename })
          }
        }
      }
    }
  } else {
    const encoding = (headers['content-transfer-encoding'] || '').toLowerCase()
    body = decodeMimeBody(bodyBlock, encoding)
  }

  return { subject: clean(subject), sender: clean(sender), date: dateRaw, body: clean(body), attachmentNames, attachmentTexts }
}

function splitMimeParts(body, boundary) {
  const parts = []
  const sections = body.split('--' + boundary)
  for (let i = 1; i < sections.length; i++) {
    if (sections[i].startsWith('--')) break
    parts.push(sections[i].replace(/^[\r\n]+/, ''))
  }
  return parts
}

function parseMimePart(partRaw) {
  const splitIdx = partRaw.search(/\r?\n\r?\n/)
  const headerBlock = splitIdx >= 0 ? partRaw.substring(0, splitIdx) : ''
  const bodyBlock = splitIdx >= 0 ? partRaw.substring(splitIdx).replace(/^[\r\n]+/, '') : partRaw

  const headers = {}
  let currentKey = ''
  for (const line of headerBlock.replace(/\r\n/g, '\n').split('\n')) {
    if (/^\s/.test(line) && currentKey) headers[currentKey] += ' ' + line.trim()
    else {
      const m = line.match(/^([A-Za-z-]+):\s*(.*)/)
      if (m) { currentKey = m[1].toLowerCase(); headers[currentKey] = m[2].trim() }
    }
  }

  const ct = (headers['content-type'] || 'text/plain').toLowerCase()
  const cte = (headers['content-transfer-encoding'] || '').toLowerCase()
  const cd = headers['content-disposition'] || ''

  let filename = ''
  const fnMatch = (cd + ' ' + (headers['content-type'] || '')).match(/name="?([^";\r\n]+)"?/i)
  if (fnMatch) filename = decodeRfc2047(fnMatch[1].trim())

  const isAttachment = cd.includes('attachment') || (filename && !ct.startsWith('text/'))

  const bm = ct.match(/boundary="?([^";\s]+)"?/i)
  if (ct.includes('multipart/')) return { isMultipart: true, boundary: bm?.[1] || '', rawBody: bodyBlock }

  const decoded = decodeMimeBody(bodyBlock, cte)
  const isText = ct.startsWith('text/plain')
  const isHtml = ct.startsWith('text/html')

  let textContent = decoded
  let docType = 'other'
  if (isAttachment && cte === 'base64') {
    try {
      const bin = atob(bodyBlock.replace(/[\r\n\s]/g, ''))
      if (filename.match(/\.docx$/i)) {
        docType = 'word'
        const paras = bin.split(/<\/w:p>/g)
        textContent = paras.map(p => {
          const runs = p.matchAll(/<w:r>([\s\S]*?)<\/w:r>/g)
          let t = ''
          for (const r of runs) {
            for (const m of r[1].matchAll(/<w:t[^>]*>([^<]+)<\/w:t>/g)) t += m[1]
          }
          return t.trim()
        }).filter(Boolean).join('\n')
      } else if (filename.match(/\.xlsx$/i)) {
        docType = 'excel'
        textContent = Array.from(bin.matchAll(/<v>([^<]+)<\/v>|<t[^>]*>([^<]+)<\/t>/g)).map(m => m[1] || m[2]).filter(Boolean).join('\n')
      } else {
        textContent = '[Binäranhang: ' + filename + ']'
      }
    } catch {
      textContent = '[Anhang: ' + filename + ']'
    }
  }

  return { isAttachment, isText, isHtml, filename, contentType: ct, textContent, docType }
}

function decodeMimeBody(body, encoding) {
  if (encoding === 'quoted-printable') {
    const cleaned = body.replace(/=\r?\n/g, '')
    const bytes = []
    for (let i = 0; i < cleaned.length; i++) {
      if (cleaned[i] === '=' && i + 2 < cleaned.length && /^[0-9A-Fa-f]{2}$/.test(cleaned.substring(i + 1, i + 3))) {
        bytes.push(parseInt(cleaned.substring(i + 1, i + 3), 16)); i += 2
      } else if (cleaned.charCodeAt(i) !== 0x0D) {
        bytes.push(cleaned.charCodeAt(i) & 0xFF)
      }
    }
    try { return new TextDecoder('utf-8').decode(new Uint8Array(bytes)) } catch { return cleaned }
  }
  if (encoding === 'base64') {
    try {
      const bin = atob(body.replace(/[\r\n\s]/g, ''))
      const bytes = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
      return new TextDecoder('utf-8').decode(bytes)
    } catch { return body }
  }
  return body
}

function decodeRfc2047(str) {
  return str.replace(/=\?([^?]+)\?([BbQq])\?([^?]*)\?=/g, (_, charset, enc, text) => {
    try {
      let bytes
      if (enc.toUpperCase() === 'B') {
        const bin = atob(text)
        bytes = new Uint8Array(bin.length)
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
      } else {
        const decoded = text.replace(/_/g, ' ')
        const arr = []
        for (let i = 0; i < decoded.length; i++) {
          if (decoded[i] === '=' && i + 2 < decoded.length && /^[0-9A-Fa-f]{2}$/.test(decoded.substring(i + 1, i + 3))) {
            arr.push(parseInt(decoded.substring(i + 1, i + 3), 16)); i += 2
          } else arr.push(decoded.charCodeAt(i) & 0xFF)
        }
        bytes = new Uint8Array(arr)
      }
      return new TextDecoder(charset.toLowerCase().replace(/^utf-?8$/, 'utf-8')).decode(bytes)
    } catch { return text }
  })
}

function clean(str) {
  return (str || '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ').replace(/\s+/g, ' ').trim()
}

// ============================================================
// MSG Parser (simplified)
// ============================================================

export async function parseMsgFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result)
      const text = new TextDecoder('utf-8', { fatal: false }).decode(data)
      const subject = text.match(/Subject[:\s]*([^\x00-\x1F]{5,200})/i)?.[1]?.trim() || ''
      const sender = text.match(/From[:\s]*([^\x00-\x1F]{5,100}@[^\x00-\x1F]{3,50})/i)?.[1]?.trim() || ''
      const body = text.split(/[\x00-\x08\x0B\x0C\x0E-\x1F]+/).filter(b => b.length > 50 && /[a-zA-ZäöüÄÖÜß]{3,}/i.test(b)).sort((a, b) => b.length - a.length)[0] || ''
      resolve({ subject: clean(subject), sender: clean(sender), date: '', body: clean(body), attachmentNames: [], attachmentTexts: [] })
    }
    reader.onerror = () => reject(new Error('MSG konnte nicht gelesen werden'))
    reader.readAsArrayBuffer(file)
  })
}

// ============================================================
// Claude API
// ============================================================

const SYSTEM_PROMPT = `Du bist ein Experte für Versicherungs-Bestandsübertragungen. Du analysierst E-Mails und deren Anhänge und extrahierst strukturierte Daten.

## FELDER PRO VORGANG
- kunde: "Nachname, Vorname"
- versicherungsnummer: exakte Nummer
- sparte: KFZ | Leben | Kranken | Haftpflicht | Hausrat | Wohngebäude | BU | Unfall | Rechtsschutz | Sonstige
- makler: Name des Maklers
- maklerEmail: E-Mail des Maklers
- gueltigkeitsdatum: TT.MM.JJJJ oder null
- status: angefragt | bestaetigt | abgelehnt | in-bearbeitung
- kategorie: "neu" | "erinnerung"
- maklervollmacht: { als_anhang, nur_erwaehnt, unterschrieben, manuell_pruefen, anmerkung }
- fehlende_infos: []
- notizen: ""

## ANTWORTFORMAT (JSON)
{
  "vorgaenge": [...],
  "zusammenfassung": "Kurze Zusammenfassung"
}

WICHTIG: Antworte NUR mit validem JSON.`

async function callClaudeAPI(prompt, system = SYSTEM_PROMPT) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('API Key nicht gesetzt')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: API_CONFIG.model,
      max_tokens: API_CONFIG.maxTokens,
      system,
      messages: [{ role: 'user', content: prompt }]
    })
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.content[0].text
}

export async function analyzeEmail(emailData, attachments = []) {
  let prompt = `Analysiere folgende E-Mail zur Bestandsübertragung:\n\n`
  prompt += `**Betreff:** ${emailData.subject || 'Kein Betreff'}\n`
  prompt += `**Absender:** ${emailData.sender || 'Unbekannt'}\n`
  prompt += `**Inhalt:**\n${emailData.body || 'Kein Inhalt'}\n\n`

  if (attachments.length > 0) {
    prompt += `**Anhänge:**\n`
    for (const att of attachments) {
      prompt += `\n--- ${att.filename} (${att.type}) ---\n`
      prompt += att.content.substring(0, 5000)
      prompt += '\n'
    }
  }

  const response = await callClaudeAPI(prompt)
  const jsonMatch = response.match(/\{[\s\S]*\}/)
  if (jsonMatch) return JSON.parse(jsonMatch[0])
  throw new Error('Ungültiges Antwortformat')
}

export async function processBatch(files, onProgress) {
  const results = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    onProgress?.({ current: i + 1, total: files.length, filename: file.name, status: 'processing' })

    try {
      const lower = file.name.toLowerCase()
      if (lower.endsWith('.eml')) {
        const eml = await parseEmlFile(file)
        const analysis = await analyzeEmail(eml, eml.attachmentTexts || [])
        results.push({ filename: file.name, email: eml, analysis, success: true })
      } else if (lower.endsWith('.msg')) {
        const msg = await parseMsgFile(file)
        const analysis = await analyzeEmail(msg)
        results.push({ filename: file.name, email: msg, analysis, success: true })
      } else {
        results.push({ filename: file.name, type: 'attachment', success: true })
      }
    } catch (err) {
      results.push({ filename: file.name, error: err.message, success: false })
    }

    onProgress?.({ current: i + 1, total: files.length, filename: file.name, status: 'completed' })
  }

  return results
}

// ============================================================
// Feldauslesung für die Prüfstrecke
// ============================================================

const PRUEF_SYSTEM_PROMPT = `Du liest eingehende Schreiben zur Bestandsübertragung einer Versicherung und
gibst die enthaltenen Angaben strukturiert zurück. Die Schreiben sind unstrukturiert: jeder Vermittler
formuliert anders, Angaben stehen im Fließtext, in der Signatur oder nur im Betreff.

Gib ausschließlich ein JSON-Objekt mit genau diesen Feldern zurück:

{
  "kundeNachname": "", "kundeVorname": "", "kundeGebdat": "TT.MM.JJJJ oder leer",
  "kundeStrasse": "", "kundePlz": "", "kundeOrt": "",
  "vnr": "Versicherungs- oder Vertragsnummer", "sparte": "Kfz | Leben | Kranken | Haftpflicht | Hausrat | Wohngebäude | Unfall | Rechtsschutz | Sonstige",
  "mvVnNachname": "Nachname in der Vollmacht", "mvVnVorname": "Vorname in der Vollmacht",
  "pool": "Maklerpool oder leer", "vermittlerName": "Firma des übernehmenden Vermittlers",
  "agenturNr": "7 bis 9 Ziffern oder leer", "vermittlerNr": "weniger als 7 Ziffern oder leer",
  "maklerEmail": "", "maklerStrasse": "", "maklerPlz": "", "maklerOrt": "",
  "klassifikation": "BÜ-Vorgang | Anfrage-Rücksprache | Antrag-Änderung | Sonstiges",
  "wunschVorhanden": "ja | nein",
  "pruefungUnterlagen": "Vollständig | Unvollständig | nicht prüfbar",
  "reminder": "ja | nein",
  "mvEnthalten": "ja | nein", "mvStatus": "OK | MV unvollständig | MV fehlt | kein Anhang | nicht prüfbar",
  "mvAufMakler": "ja | nein | nicht prüfbar", "mvVollumfaenglich": "ja | teilweise | nein | nicht prüfbar",
  "mvUnterschriftKunde": "ja | nein | nicht prüfbar",
  "uvErteilt": "ja | nein | nicht prüfbar", "uvFehlt": "ja | nein",
  "mvUnterschriftsdatum": "TT.MM.JJJJ oder leer", "mvEingangsdatum": "TT.MM.JJJJ oder leer",
  "anfUnterlagen": "ja | nein", "artUnterlagen": "angeforderte Unterlagen, mehrere mit Semikolon getrennt",
  "begruendung": "ein Satz, worauf du die Klassifikation stützt"
}

Regeln:
- Nicht genannte Angaben bleiben leer. Rate nichts und leite nichts aus dem Kontext ab.
- Datumsangaben immer im Format TT.MM.JJJJ.
- "klassifikation" ist nur dann "BÜ-Vorgang", wenn der Vermittler die Übertragung der Betreuung beantragt.
  Reine Sachfragen oder Statusnachfragen ohne Übertragungswunsch sind "Anfrage-Rücksprache".
- Wird die Vollmacht nur angekündigt oder liegt sie nicht bei, ist "mvEnthalten" gleich "nein".
- Antworte ausschließlich mit dem JSON-Objekt, ohne einleitenden Text.`

/** Liest die Deckblattfelder aus einem unstrukturierten Eingang. */
export async function leseDeckblattfelder({ betreff, absender, text, anhaenge = [] }) {
  let prompt = `Betreff: ${betreff || 'ohne Betreff'}\n`
  prompt += `Absender: ${absender || 'unbekannt'}\n`
  prompt += `Anhänge: ${anhaenge.length ? anhaenge.join(', ') : 'keine'}\n\n`
  prompt += `Text des Schreibens:\n${text}`

  const antwort = await callClaudeAPI(prompt, PRUEF_SYSTEM_PROMPT)
  const treffer = antwort.match(/\{[\s\S]*\}/)
  if (!treffer) throw new Error('Die Antwort enthielt kein auswertbares JSON.')
  return JSON.parse(treffer[0])
}
