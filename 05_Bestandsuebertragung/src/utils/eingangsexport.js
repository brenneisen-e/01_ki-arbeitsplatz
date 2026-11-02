/**
 * Export und Wiedereinlesen der Prüfstrecken-Eingänge als EML.
 *
 * Die Demo-Eingänge lassen sich als ZIP herunterladen, in einem Mailprogramm
 * ansehen und anschließend wieder in das Werkzeug hochladen. Jede Datei trägt
 * den Kopfeintrag X-Vorgang-Id, damit ein hochgeladener Eingang beim Einlesen
 * wieder seiner hinterlegten Auswertung zugeordnet werden kann, wenn kein
 * API Key gesetzt ist.
 */

import { createZip } from './demo-files-gen.js'
import { VORGAENGE } from './pruefvorgaenge.js'

const enc = new TextEncoder()

const b64 = (text) => btoa(String.fromCharCode(...enc.encode(text)))

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

const monate = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function rfcDatum(deutsch) {
  const [t, m, j] = (deutsch || '').split('.')
  if (!t || !m || !j) return new Date().toUTCString()
  const d = new Date(Number(j), Number(m) - 1, Number(t), 9, 15)
  const wt = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]
  return `${wt}, ${t} ${monate[Number(m) - 1]} ${j} 09:15:00 +0200`
}

const UMSCHRIFT = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'Ä': 'Ae', 'Ö': 'Oe', 'Ü': 'Ue', 'ß': 'ss' }

/**
 * Dateiname ohne Umlaute und Sonderzeichen. ZIP-Archive und Dateidialoge
 * kodieren Umlaute je nach System unterschiedlich; ASCII bleibt überall lesbar.
 */
export function dateiname(vorgang) {
  const kunde = vorgang.kunde.split(',')[0]
    .replace(/[äöüÄÖÜß]/g, z => UMSCHRIFT[z])
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z-]/g, '')
  return `${vorgang.id}_${kunde}.eml`
}

/** Baut die EML-Datei zu einem Vorgang. */
export function baueEml(vorgang) {
  const grenze = '----=_Pruefstrecke_' + vorgang.id.replace(/[^A-Za-z0-9]/g, '')
  const m = vorgang.mail

  let eml = ''
  eml += `From: "${m.vonName}" <${m.von}>\r\n`
  eml += `To: <${m.an}>\r\n`
  eml += `Subject: =?UTF-8?B?${b64(m.betreff)}?=\r\n`
  eml += `Date: ${rfcDatum(m.datum)}\r\n`
  eml += `Message-ID: <${vorgang.id.toLowerCase()}@pruefstrecke.demo>\r\n`
  eml += `X-Vorgang-Id: ${vorgang.id}\r\n`
  eml += `X-Sparte: ${vorgang.sparte}\r\n`
  eml += 'MIME-Version: 1.0\r\n'

  if (m.anhaenge.length === 0) {
    eml += 'Content-Type: text/plain; charset=utf-8\r\n'
    eml += 'Content-Transfer-Encoding: quoted-printable\r\n\r\n'
    eml += quotedPrintable(m.text)
  } else {
    eml += `Content-Type: multipart/mixed; boundary="${grenze}"\r\n\r\n`
    eml += `--${grenze}\r\n`
    eml += 'Content-Type: text/plain; charset=utf-8\r\n'
    eml += 'Content-Transfer-Encoding: quoted-printable\r\n\r\n'
    eml += quotedPrintable(m.text) + '\r\n'
    for (const a of m.anhaenge) {
      // Der Anhang trägt in der Demo nur seine Beschreibung; ein echtes
      // Vollmachtsdokument liegt hier nicht vor.
      const inhalt = `${a.typ}\r\n${a.name}\r\n${a.info}\r\n`
      eml += `\r\n--${grenze}\r\n`
      eml += `Content-Type: text/plain; charset=utf-8; name="${a.name}.txt"\r\n`
      eml += `Content-Disposition: attachment; filename="${a.name}.txt"\r\n`
      eml += 'Content-Transfer-Encoding: base64\r\n\r\n'
      eml += (b64(inhalt).match(/.{1,76}/g) || []).join('\r\n') + '\r\n'
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
      'Demo-Eingaenge der Pruefstrecke Bestandsuebertragung\r\n\r\n' +
      `${vorgaenge.length} unstrukturierte Maklerschreiben im EML-Format.\r\n` +
      'Die Dateien lassen sich in einem Mailprogramm oeffnen und anschliessend\r\n' +
      'im Werkzeug wieder hochladen.\r\n\r\n' +
      'Alle Namen, Adressen, Vertrags- und Vermittlernummern sind erfunden.\r\n'
  })
  const zip = createZip(dateien)
  const url = URL.createObjectURL(new Blob([zip], { type: 'application/zip' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `Pruefstrecke_Eingaenge_${new Date().toISOString().slice(0, 10)}.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  return dateien.length - 1
}

/** Liest die Vorgangs-Id aus dem Rohtext einer EML-Datei. */
export function leseVorgangId(roh) {
  return roh.match(/^X-Vorgang-Id:\s*(\S+)/mi)?.[1] || null
}
