/**
 * KI-Deckblatt zu einem Eingang.
 *
 * Das Deckblatt ist der zweite Schritt der Strecke: aus dem unstrukturierten
 * Schreiben wird ein festes Formular mit immer denselben Feldern. Erst darauf
 * setzen die automatischen Prüfungen auf.
 *
 * Die Marke steckt ausschließlich in den CSS-Variablen und in branding.js –
 * das Deckblatt kennt keinen Versicherernamen.
 */

import { useState } from 'react'
import { CheckCircle2, AlertTriangle, Ban, FileSpreadsheet, HelpCircle } from 'lucide-react'
import { PRUEFUNGEN_JE_FELD } from '../utils/pruefkatalog'
import { getMarke } from '../utils/branding'
import LogoImg from './LogoImg'

const AMPEL = {
  clean: { punkt: 'bg-emerald-500', text: 'text-emerald-700', kurz: 'Grün', label: 'Dunkelverarbeitung', Icon: CheckCircle2 },
  be:    { punkt: 'bg-red-500',     text: 'text-red-700',     kurz: 'Rot',  label: 'Prüfung offen',      Icon: AlertTriangle },
  hart:  { punkt: 'bg-slate-500',   text: 'text-slate-700',   kurz: 'Grau', label: 'Formal abgewiesen',  Icon: Ban }
}

const ABSCHNITTE = [
  {
    titel: 'Kunde und Vertrag',
    felder: [
      ['Nachname', 'kundeNachname', 'Nachname des Versicherungsnehmers laut Anschreiben'],
      ['Vorname', 'kundeVorname', 'Vorname des Versicherungsnehmers laut Anschreiben'],
      ['Geburtsdatum', 'kundeGebdat', 'Geburtsdatum des Versicherungsnehmers'],
      ['Straße', 'kundeStrasse', 'Straßenname und Hausnummer des Versicherungsnehmers'],
      ['PLZ', 'kundePlz', 'Postleitzahl des Versicherungsnehmers'],
      ['Ort', 'kundeOrt', 'Wohnort des Versicherungsnehmers'],
      ['Versicherungsnummer', 'vnr', 'Vertragsnummer in Originalform, inklusive Präfix, Nullen und Suffix'],
      ['Sparte', 'sparte', 'Sparte des Vertrags, abgeleitet aus dem Präfix der Versicherungsnummer'],
      ['Nachname laut Vollmacht', 'mvVnNachname', 'Nachname des Vollmachtgebers – dient dem Abgleich mit dem Anschreiben'],
      ['Vorname laut Vollmacht', 'mvVnVorname', 'Vorname des Vollmachtgebers laut Vollmacht']
    ]
  },
  {
    titel: 'Übernehmender Vermittler',
    felder: [
      ['Pool', 'pool', 'Maklerpool oder Abwickler, über den der Vorgang eingereicht wird'],
      ['Vermittler', 'vermittlerName', 'An den Pool gebundenes Maklerunternehmen bzw. Name der Einzelperson'],
      ['Agentur-Nr', 'agenturNr', 'Agenturnummer des Maklers beim Versicherer'],
      ['Vermittlernummer', 'vermittlerNr', 'Vermittlernummer des Maklers beim Versicherer'],
      ['E-Mail', 'maklerEmail', 'Absenderadresse der Mail, mit der der Vorgang eingereicht wurde'],
      ['Straße', 'maklerStrasse', 'Straße und Hausnummer des Maklers laut Anschreiben'],
      ['PLZ', 'maklerPlz', 'Postleitzahl des Maklers'],
      ['Ort', 'maklerOrt', 'Ort des Maklers']
    ]
  },
  {
    titel: 'Klassifikation und Vorgang',
    felder: [
      ['Vorgangstyp', 'vermittlerTyp', 'Einordnung des Absenders: Makler mit Vollmacht oder Mehrfachagent'],
      ['Klassifikation', 'klassifikation', 'Fachliche Einordnung der Mail'],
      ['Übertragungswunsch vorhanden', 'wunschVorhanden', 'Enthält die Mail einen ausdrücklichen Übertragungswunsch?'],
      ['Prüfung Unterlagen', 'pruefungUnterlagen', 'Abgeleitete Vollständigkeitsprüfung der Unterlagen'],
      ['Reminder / Wiedervorlage', 'reminder', 'Handelt es sich um eine Erinnerung zu einem bereits eingereichten Vorgang?']
    ]
  },
  {
    titel: 'Maklervollmacht und Unterschriften',
    felder: [
      ['MV enthalten', 'mvEnthalten', 'Liegt der Mail eine Maklervollmacht bei?'],
      ['MV-Status', 'mvStatus', 'Zusammenfassender Status der Maklervollmacht'],
      ['MV auf Makler ausgestellt', 'mvAufMakler', 'Ist die Vollmacht ausdrücklich auf den Makler ausgestellt oder blanko?'],
      ['MV vollumfänglich', 'mvVollumfaenglich', 'Deckt die Vollmacht den gesamten Bestand ab oder ist sie eingeschränkt?'],
      ['Unterschrift Kunde', 'mvUnterschriftKunde', 'Hat der Versicherungsnehmer die Vollmacht unterschrieben?'],
      ['Untervollmacht erteilt', 'uvErteilt', 'Wurde eine Untervollmacht an einen weiteren Makler oder Pool erteilt?'],
      ['Untervollmacht fehlt', 'uvFehlt', 'Untervollmacht fehlt, weil der Pool in der Vollmacht nicht namentlich genannt ist'],
      ['Unterschriftsdatum', 'mvUnterschriftsdatum', 'Datum der Kundenunterschrift auf der Vollmacht'],
      ['Eingangsdatum', 'mvEingangsdatum', 'Eingangsdatum der Vollmacht bzw. des Betreuungswunsches']
    ]
  },
  {
    titel: 'Unterlagen und Folgearbeit',
    felder: [
      ['Anforderung Unterlagen', 'anfUnterlagen', 'Fordert der Vermittler Unterlagen an?'],
      ['Art der Unterlagen', 'artUnterlagen', 'Welche Unterlagen angefordert wurden – Kennzeichen für die Nachbearbeitung']
    ]
  }
]

/** Kurzbeschreibung des Vorgangs, wie sie unten im Deckblatt steht. */
export function baueZusammenfassung(vorgang) {
  const d = vorgang.deckblatt
  const name = [d.kundeVorname, d.kundeNachname].filter(Boolean).join(' ') || 'unbekannter Versicherungsnehmer'
  const teile = []

  teile.push(
    `${d.klassifikation || 'Vorgang'} für ${name}` +
    `${d.kundeGebdat ? `, geboren am ${d.kundeGebdat}` : ''} – Vertrag ` +
    `${d.vnr || 'ohne angegebene Versicherungsnummer'}${d.sparte ? ` (${d.sparte})` : ''}.`
  )

  teile.push(
    `Übernehmen soll ${d.vermittlerName || 'ein nicht benannter Vermittler'}` +
    `${d.pool ? ` über den Pool ${d.pool}` : ''}` +
    `${d.agenturNr ? `, Agentur-Nr ${d.agenturNr}` : d.vermittlerNr ? `, Vermittlernummer ${d.vermittlerNr}` : ''}.`
  )

  teile.push(
    d.mvEnthalten === 'ja'
      ? `Die Maklervollmacht liegt bei${d.mvUnterschriftsdatum ? ` und ist am ${d.mvUnterschriftsdatum} unterschrieben` : ''} (${d.mvStatus || 'ohne Status'}).`
      : 'Eine Maklervollmacht liegt dem Eingang nicht bei.'
  )

  return teile.join(' ')
}

function Zeile({ label, wert, erklaerung, status, zeigtErklaerung }) {
  const leer = !wert
  const rand = status === 'be' ? 'border-l-red-400' : status === 'info' ? 'border-l-amber-400' : 'border-l-transparent'

  return (
    <div className={`border-l-2 ${rand} pl-2.5 pr-3 py-1.5 ${status === 'be' ? 'bg-red-50/60' : status === 'info' ? 'bg-amber-50/50' : ''}`}>
      <div className="grid grid-cols-[minmax(0,42%)_minmax(0,58%)] gap-2 items-baseline">
        <span className="text-xs text-slate-500 leading-snug">{label}</span>
        <span className={`text-xs font-mono break-words ${leer ? 'text-slate-300' : 'text-slate-800'}`}>
          {wert || 'leer'}
        </span>
      </div>
      {zeigtErklaerung && (
        <div className="mt-0.5 text-[11px] leading-snug text-slate-400">{erklaerung}</div>
      )}
    </div>
  )
}

function Kopfzelle({ label, wert, ton, punkt }) {
  return (
    <div className="px-2.5 py-2 bg-slate-50 min-w-0">
      <div className="text-[10px] uppercase tracking-wide text-slate-400 truncate">{label}</div>
      <div className={`text-xs font-medium truncate flex items-center gap-1.5 ${ton || 'text-slate-800'}`} title={wert}>
        {punkt && <span className={`w-2 h-2 rounded-full shrink-0 ${punkt}`} />}
        <span className="truncate">{wert}</span>
      </div>
    </div>
  )
}

export default function Deckblatt({ vorgang, lauf }) {
  const [zeigtErklaerung, setZeigtErklaerung] = useState(false)
  const marke = getMarke()
  const d = vorgang.deckblatt
  const ampel = AMPEL[lauf.ergebnis.art]

  // Status je Feld: schlechtestes Ergebnis der Prüfungen, die an dem Feld hängen.
  const statusJeFeld = {}
  for (const [feld, ids] of Object.entries(PRUEFUNGEN_JE_FELD)) {
    const schritte = lauf.schritte.filter(s => ids.includes(s.pruefung.id))
    if (schritte.some(s => s.status === 'be')) statusJeFeld[feld] = 'be'
    else if (schritte.some(s => s.status === 'info')) statusJeFeld[feld] = 'info'
  }

  const hinweis = lauf.ergebnis.gruende.length > 0
    ? lauf.ergebnis.gruende.join('; ')
    : lauf.hinweise > 0
      ? 'Keine Ablehnungsgründe. Vermerkte Folgearbeit siehe unten.'
      : ''

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Kopf des Formulars */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-200">
        <p className="text-[11px] italic text-slate-400 leading-snug">
          Pilotbetrieb: Dieses Deckblatt entsteht automatisch aus dem Eingang und wird vor der Verarbeitung
          von einer Sachbearbeiterin oder einem Sachbearbeiter geprüft.
        </p>
        <div className="mt-2.5 flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white text-[11px] font-semibold"
            style={{ background: 'var(--mode-gradient)' }}>
            {marke.logo ? <LogoImg name={marke.logo} size={22} /> : marke.kuerzel}
          </span>
          <div className="min-w-0">
            <div className="text-base font-semibold text-slate-900 leading-tight">Makler-BÜ – KI-Deckblatt</div>
            <div className="text-[11px] text-slate-400">Strukturierte Felder aus dem unstrukturierten Eingang</div>
          </div>
          <button
            onClick={() => setZeigtErklaerung(o => !o)}
            className={`ml-auto shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] border transition-colors ${
              zeigtErklaerung ? 'border-slate-300 bg-slate-100 text-slate-700' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            <HelpCircle size={13} /> Feldhilfe
          </button>
        </div>
      </div>

      {/* Kopfzeile: Vorgang auf einen Blick */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-slate-200 border-b border-slate-200">
        <Kopfzelle label="Lfd-Nr" wert={vorgang.id} />
        <Kopfzelle label="Status" wert={ampel.kurz} ton={ampel.text} punkt={ampel.punkt} />
        <Kopfzelle label="Typ" wert={d.vermittlerTyp || 'Makler'} />
        <Kopfzelle label="Klassifikation" wert={d.klassifikation || 'offen'} />
        <Kopfzelle label="Maklervollmacht" wert={d.mvStatus || 'nicht geprüft'} />
        <Kopfzelle label="Eingang" wert={vorgang.eingang} />
      </div>

      {/* Abschnitte */}
      {ABSCHNITTE.map(abschnitt => (
        <div key={abschnitt.titel}>
          <div className="px-3 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor: 'var(--mode-primary)' }}>
            {abschnitt.titel}
          </div>
          <div className="divide-y divide-slate-100">
            {abschnitt.felder.map(([label, key, erklaerung]) => (
              <Zeile
                key={key}
                label={label}
                wert={d[key]}
                erklaerung={erklaerung}
                status={statusJeFeld[key]}
                zeigtErklaerung={zeigtErklaerung}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Ergebnis */}
      <div>
        <div className="px-3 py-1.5 text-xs font-semibold text-white flex items-center gap-2" style={{ backgroundColor: 'var(--mode-primary)' }}>
          <FileSpreadsheet size={13} /> Ergebnis
        </div>
        <div className="px-3 py-2.5 space-y-2">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-slate-400">Zusammenfassung</div>
            <p className="text-xs text-slate-700 leading-relaxed mt-0.5">{baueZusammenfassung(vorgang)}</p>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-slate-400">Hinweis</div>
            {hinweis
              ? <p className={`text-xs leading-relaxed mt-0.5 ${lauf.ergebnis.gruende.length ? 'text-red-700' : 'text-slate-600'}`}>{hinweis}</p>
              : <p className="text-xs text-slate-300 mt-0.5">leer</p>}
          </div>
          <div className="flex items-center gap-2 pt-1.5 border-t border-slate-100">
            <ampel.Icon size={14} className={`${ampel.text} shrink-0`} strokeWidth={2} />
            <span className={`text-xs font-medium ${ampel.text}`}>{lauf.ergebnis.titel}</span>
            <span className="text-[11px] text-slate-400 ml-auto">{lauf.bestanden} von {lauf.geprueft} Prüfungen bestanden</span>
          </div>
        </div>
      </div>
    </div>
  )
}
