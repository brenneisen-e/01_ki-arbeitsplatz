/**
 * Eingänge der Angebotsstrecke als Dateien: heraus als EML, hinein als EML,
 * PDF oder Text.
 *
 * Die Demo-Eingänge lassen sich als ZIP herunterladen, in einem Mailprogramm
 * ansehen und wieder hochladen. Jede Datei trägt den Kopfeintrag
 * X-Vorgang-Id, damit ein hochgeladener Eingang seiner hinterlegten
 * Auswertung zugeordnet werden kann.
 *
 * Die fünf Beispielanfragen liegen dem Fachbereich als PDF vor. Werden diese
 * PDF hochgeladen, erkennt das Werkzeug sie an ihrer Prüfsumme (ersatzweise
 * am Dateinamen „Beispiel 1.pdf“ …) und zeigt die hinterlegte Auswertung –
 * die Dateien selbst sind nicht Teil des Werkzeugs.
 */

import { createZip } from './zip.js'
import { dokumentAlsText } from './markierung.js'
import { VORGAENGE, BEISPIELE } from '../daten/vorgaenge.js'

const enc = new TextEncoder()

function b64(text) {
  const bytes = enc.encode(text)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

function quotedPrintable(text) {
  const bytes = enc.encode(text)
  let out = ''
  let zeile = ''
  for (const byte of bytes) {
    const zeichen = (byte === 0x0a) ? '\n'
      : (byte >= 33 && byte <= 126 && byte !== 61) ? String.fromCharCode(byte)
      : (byte === 32) ? ' '
      : '=' + byte.toString(16).toUpperCase().padStart(2, '0')
    if (zeichen === '\n') { out += zeile + '\r\n'; zeile = ''; continue }
    if (zeile.length + zeichen.length > 73) { out += zeile + '=\r\n'; zeile = '' }
    zeile += zeichen
  }
  return out + zeile
}

const MONATE = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const TAGE = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function rfcDatum(datum, uhrzeit = '09:00') {
  const [t, m, j] = (datum || '').split('.').map(Number)
  if (!t || !m || !j) return new Date().toUTCString()
  const d = new Date(j, m - 1, t)
  return `${TAGE[d.getDay()]}, ${String(t).padStart(2, '0')} ${MONATE[m - 1]} ${j} ${uhrzeit}:00 +0100`
}

const UMSCHRIFT = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'Ä': 'Ae', 'Ö': 'Oe', 'Ü': 'Ue', 'ß': 'ss' }

/** Dateiname ohne Umlaute und Sonderzeichen, überall lesbar. */
export function dateiname(vorgang) {
  const kunde = vorgang.kunde
    .replace(/[äöüÄÖÜß]/g, z => UMSCHRIFT[z])
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
  return `${vorgang.id}_${kunde}.eml`
}

/** Baut die EML-Datei zu einem Vorgang: das erste Dokument als Text, weitere als Anhang. */
export function baueEml(vorgang) {
  const grenze = '----=_Angebotsstrecke_' + vorgang.id.replace(/[^A-Za-z0-9]/g, '')
  const m = vorgang.mail
  const [haupt, ...anhaenge] = vorgang.dokumente

  let eml = ''
  eml += `From: =?UTF-8?B?${b64(m.vonName)}?= <${m.von}>\r\n`
  eml += `To: =?UTF-8?B?${b64(m.an)}?= <angebote@example.com>\r\n`
  eml += `Subject: =?UTF-8?B?${b64(m.betreff)}?=\r\n`
  eml += `Date: ${rfcDatum(vorgang.eingang, vorgang.uhrzeit)}\r\n`
  eml += `Message-ID: <${vorgang.id.toLowerCase()}@angebotsstrecke.example>\r\n`
  eml += `X-Vorgang-Id: ${vorgang.id}\r\n`
  eml += 'MIME-Version: 1.0\r\n'

  const text = dokumentAlsText(haupt)
  if (anhaenge.length === 0) {
    eml += 'Content-Type: text/plain; charset=utf-8\r\n'
    eml += 'Content-Transfer-Encoding: quoted-printable\r\n\r\n'
    eml += quotedPrintable(text)
  } else {
    eml += `Content-Type: multipart/mixed; boundary="${grenze}"\r\n\r\n`
    eml += `--${grenze}\r\n`
    eml += 'Content-Type: text/plain; charset=utf-8\r\n'
    eml += 'Content-Transfer-Encoding: quoted-printable\r\n\r\n'
    eml += quotedPrintable(text) + '\r\n'
    for (const a of anhaenge) {
      const name = a.titel.replace(/[äöüÄÖÜß]/g, z => UMSCHRIFT[z]).replace(/[^A-Za-z0-9]+/g, '_') + '.txt'
      eml += `\r\n--${grenze}\r\n`
      eml += `Content-Type: text/plain; charset=utf-8; name="${name}"\r\n`
      eml += `Content-Disposition: attachment; filename="${name}"\r\n`
      eml += 'Content-Transfer-Encoding: base64\r\n\r\n'
      eml += (b64(dokumentAlsText(a)).match(/.{1,76}/g) || []).join('\r\n') + '\r\n'
    }
    eml += `\r\n--${grenze}--\r\n`
  }
  return eml
}

/** Lädt alle Demo-Eingänge als ZIP herunter. Gibt die Anzahl der Dateien zurück. */
export function ladeEingaengeHerunter(vorgaenge = VORGAENGE) {
  const dateien = vorgaenge.map(v => ({ name: dateiname(v), content: baueEml(v) }))
  dateien.push({
    name: 'LIESMICH.txt',
    content:
      'Demo-Eingaenge der Angebotsstrecke\r\n\r\n' +
      `${vorgaenge.length} Angebotsanfragen im EML-Format.\r\n` +
      'Die Dateien lassen sich in einem Mailprogramm oeffnen und anschliessend\r\n' +
      'im Werkzeug wieder hochladen.\r\n\r\n' +
      'Alle Namen, Adressen und Nummern sind erfunden oder Platzhalter.\r\n'
  })
  const zip = createZip(dateien)
  const url = URL.createObjectURL(new Blob([zip], { type: 'application/zip' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `Angebotsstrecke_Eingaenge_${new Date().toISOString().slice(0, 10)}.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 2000)
  return dateien.length - 1
}

/** Liest die Vorgangs-Id aus dem Rohtext einer EML-Datei. */
export function leseVorgangId(roh) {
  return roh.match(/^X-Vorgang-Id:\s*(\S+)/mi)?.[1] || null
}

// SHA-256 der fünf Beispiel-PDF, wie sie der Fachbereich geliefert hat.
const BEISPIEL_PRUEFSUMMEN = {
  f45a72fbaf16763bd40fddea50dc347594a53324f787055743b7d8d088d0633b: 1,
  '6cf628292134734906af80281ecf0db5a28527adfbd895db1f9e0e0a3abca1c3': 2,
  '5eec1b5e8f8ab50644805f49e57066f7f8b4dc1b66d9bcc8a9c6443c60f97250': 3,
  '8428f2a78aaa6304abbb4867306da32b261b4f744b780b64148b6f31c87a44a4': 4,
  c73ffda76eaf900e415b60790070254fae2f50a2f116cfaf7f18d25b6c9f082a: 5
}

async function pruefsumme(bytes) {
  try {
    const hash = await crypto.subtle.digest('SHA-256', bytes)
    return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('')
  } catch {
    return null // ohne sicheren Kontext bleibt die Erkennung am Dateinamen
  }
}

function beispielAusName(name) {
  const nr = name.match(/beispiel[\s_-]*([1-5])(?!\d)/i)?.[1]
  return nr ? Number(nr) : null
}

export const ERLAUBTE_ENDUNGEN = ['.eml', '.pdf', '.txt']

/**
 * Liest eine hochgeladene Datei ein und ordnet sie, wenn möglich, einem
 * hinterlegten Eingang zu.
 * Rückgabe: { name, art: 'eml' | 'pdf' | 'txt', roh, bytes, vorgangId, erkennung }
 */
export async function leseDatei(file) {
  const name = file.name
  const endung = name.toLowerCase().slice(name.lastIndexOf('.'))
  if (!ERLAUBTE_ENDUNGEN.includes(endung)) return null

  if (endung === '.pdf') {
    const bytes = await file.arrayBuffer()
    const summe = await pruefsumme(bytes)
    const nr = (summe && BEISPIEL_PRUEFSUMMEN[summe]) || beispielAusName(name)
    const vorgang = nr ? BEISPIELE.find(v => v.beispiel === nr) : null
    return {
      name, art: 'pdf', bytes, roh: '',
      vorgangId: vorgang?.id || null,
      erkennung: vorgang ? (summe && BEISPIEL_PRUEFSUMMEN[summe] ? `Beispiel ${nr}, an der Prüfsumme erkannt` : `Beispiel ${nr}, am Dateinamen erkannt`) : ''
    }
  }

  const roh = await file.text()
  const id = endung === '.eml' ? leseVorgangId(roh) : null
  const vorgang = id ? VORGAENGE.find(v => v.id === id) : null
  return {
    name, art: endung.slice(1), roh, bytes: null,
    vorgangId: vorgang?.id || null,
    erkennung: vorgang ? 'Demo-Eingang, an der Vorgangs-Id erkannt' : ''
  }
}
