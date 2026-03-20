/**
 * E-Mail Vorlagen Seite – Herunterladbare .eml Vorlagen
 */
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Mail, Download, Copy, Check } from 'lucide-react'

const TEMPLATES = [
  {
    id: 'bestaetigung',
    title: 'Bestätigung Bestandsübertragung',
    subject: 'Bestätigung Bestandsübertragung - [Kunde] - [VS-Nr]',
    body: `Sehr geehrte/r [Makler],

wir bestätigen den Eingang Ihres Antrags auf Bestandsübertragung für:

Versicherungsnehmer: [Kunde]
Versicherungsnummer: [VS-Nr]
Sparte: [Sparte]

Die Übertragung wird zum [Datum] wirksam.

Bei Rückfragen stehen wir Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen
ERGO Bestandsservice
Sales Operations`,
    color: 'emerald'
  },
  {
    id: 'rueckfrage',
    title: 'Rückfrage fehlende Unterlagen',
    subject: 'Rückfrage zur Bestandsübertragung - [Kunde] - [VS-Nr]',
    body: `Sehr geehrte/r [Makler],

zur Bearbeitung der Bestandsübertragung für:

Versicherungsnehmer: [Kunde]
Versicherungsnummer: [VS-Nr]
Sparte: [Sparte]

benötigen wir noch folgende Unterlagen:

- Unterschriebene Maklervollmacht
- Ausweiskopie des Versicherungsnehmers

Bitte reichen Sie diese bis zum [Datum] nach.

Mit freundlichen Grüßen
ERGO Bestandsservice
Sales Operations`,
    color: 'amber'
  },
  {
    id: 'ablehnung',
    title: 'Ablehnung Bestandsübertragung',
    subject: 'Ablehnung Bestandsübertragung - [Kunde] - [VS-Nr]',
    body: `Sehr geehrte/r [Makler],

leider können wir die Bestandsübertragung für:

Versicherungsnehmer: [Kunde]
Versicherungsnummer: [VS-Nr]
Sparte: [Sparte]

nicht durchführen.

Grund: [Ablehnungsgrund]

Bei Rückfragen stehen wir Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen
ERGO Bestandsservice
Sales Operations`,
    color: 'red'
  },
  {
    id: 'erinnerung',
    title: 'Erinnerung an Makler',
    subject: 'Erinnerung: Fehlende Unterlagen - Bestandsübertragung [Kunde]',
    body: `Sehr geehrte/r [Makler],

wir erinnern Sie an die noch ausstehenden Unterlagen zur Bestandsübertragung:

Versicherungsnehmer: [Kunde]
Versicherungsnummer: [VS-Nr]
Sparte: [Sparte]

Ursprüngliche Anfrage vom: [Datum]

Bitte reichen Sie die fehlenden Unterlagen zeitnah ein, damit wir die Übertragung abschließen können.

Mit freundlichen Grüßen
ERGO Bestandsservice
Sales Operations`,
    color: 'blue'
  }
]

function createEmlContent(template) {
  const date = new Date().toUTCString()
  const boundary = '----=_Part_' + Math.random().toString(36).substring(2, 10)

  // Quoted-printable encoding for UTF-8
  function encodeQP(str) {
    const encoder = new TextEncoder()
    const bytes = encoder.encode(str)
    let result = ''
    let lineLen = 0
    for (const b of bytes) {
      let char
      if (b === 0x0A) {
        char = '\r\n'
        lineLen = 0
      } else if (b === 0x0D) {
        continue
      } else if ((b >= 33 && b <= 126 && b !== 61) || b === 32 || b === 9) {
        char = String.fromCharCode(b)
      } else {
        char = '=' + b.toString(16).toUpperCase().padStart(2, '0')
      }
      if (lineLen + char.length > 75 && char !== '\r\n') {
        result += '=\r\n'
        lineLen = 0
      }
      result += char
      lineLen += char.length
    }
    return result
  }

  // RFC 2047 encode subject
  function encodeSubject(str) {
    const encoder = new TextEncoder()
    const bytes = encoder.encode(str)
    const b64 = btoa(String.fromCharCode(...bytes))
    return '=?UTF-8?B?' + b64 + '?='
  }

  return [
    'MIME-Version: 1.0',
    `Date: ${date}`,
    'From: bestandsservice@ergo.de',
    'To: makler@example.com',
    `Subject: ${encodeSubject(template.subject)}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    'Content-Transfer-Encoding: quoted-printable',
    '',
    encodeQP(template.body)
  ].join('\r\n')
}

function downloadEml(template) {
  const content = createEmlContent(template)
  const blob = new Blob([content], { type: 'message/rfc822' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `vorlage-${template.id}.eml`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const COLOR_MAP = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'text-emerald-500' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'text-amber-500' },
  red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: 'text-red-500' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'text-blue-500' },
}

export default function VorlagenPage() {
  const { showToast } = useApp()
  const [copiedId, setCopiedId] = useState(null)

  function handleCopy(template) {
    navigator.clipboard.writeText(template.body).then(() => {
      setCopiedId(template.id)
      showToast('Vorlage in Zwischenablage kopiert', 'success')
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  function handleDownload(template) {
    downloadEml(template)
    showToast(`${template.title} als .eml heruntergeladen`, 'success')
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--mode-pastel)' }}>
          <Mail size={24} style={{ color: 'var(--mode-primary-light)' }} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">E-Mail Vorlagen</h2>
          <p className="text-base text-slate-500">Standardisierte Vorlagen als .eml herunterladen oder in die Zwischenablage kopieren</p>
        </div>
      </div>

      <div className="space-y-4">
        {TEMPLATES.map(template => {
          const colors = COLOR_MAP[template.color]
          return (
            <div key={template.id} className="card-base overflow-hidden">
              <div className={`flex items-center justify-between px-5 py-3 ${colors.bg} border-b ${colors.border}`}>
                <h3 className={`font-semibold text-base ${colors.text}`}>{template.title}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(template)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    {copiedId === template.id ? <Check size={14} /> : <Copy size={14} />}
                    {copiedId === template.id ? 'Kopiert' : 'Kopieren'}
                  </button>
                  <button
                    onClick={() => handleDownload(template)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg text-white transition-colors"
                    style={{ backgroundColor: 'var(--mode-primary-light)' }}
                  >
                    <Download size={14} /> .eml herunterladen
                  </button>
                </div>
              </div>
              <div className="p-5">
                <div className="text-sm text-slate-400 mb-2">Betreff: {template.subject}</div>
                <pre className="text-base text-slate-600 whitespace-pre-wrap bg-slate-50 rounded-lg p-4 font-sans leading-relaxed">{template.body}</pre>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
