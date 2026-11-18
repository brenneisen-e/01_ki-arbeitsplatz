/**
 * Prozess: der Weg einer Angebotsanfrage heute und mit der Strecke.
 *
 * Acht Schritte vom Eingang bis zur Ablage. Zu jedem Schritt steht, was heute
 * von Hand geschieht, was die Strecke daran ändert, wer es dann tut (KI,
 * Robotics oder Schnittstelle, Mensch) und in welcher Ausbaustufe. Darunter
 * die beiden Stufen, was bewusst beim Menschen bleibt und worauf diese Demo
 * beruht.
 *
 * Die Seite nennt keine Zeiten und keine Mengen: Die gehören in den
 * Business Case des jeweiligen Hauses, nicht in die Demo.
 */

import { clsx } from 'clsx'
import { Sparkles, Workflow, UserCheck, Presentation, Check } from 'lucide-react'
import { VORGAENGE } from '../daten/vorgaenge'
import { ANGEBOTSLAYOUTS } from '../utils/layouts'
import { begriffe } from '../utils/branding'

const ROLLEN = {
  ki: { label: 'KI', Icon: Sparkles, chip: 'bg-(--mode-pastel) text-(--mode-primary) border-(--mode-primary-light)/30' },
  robotics: { label: 'Robotics oder Schnittstelle', kurz: 'Robotics', Icon: Workflow, chip: 'bg-sky-50 text-sky-800 border-sky-200' },
  mensch: { label: 'Mensch', Icon: UserCheck, chip: 'bg-emerald-50 text-emerald-800 border-emerald-200' }
}

function schritte(B) {
  return [
    {
      titel: 'Eingang',
      heute: 'Die Anfrage kommt fast immer als E-Mail: Freitext, Anhänge, oft ein langer Verlauf mit mehreren Beteiligten. Die Angaben stehen verteilt im Betreff, im Text, in der Signatur und im Anhang.',
      kuenftig: 'Bleibt, wie er ist. Vermittler schreiben weiter E-Mails, ein Formular wird nicht vorausgesetzt. Die Mail geht zusätzlich an die KI.',
      wer: [], stufe: 'bleibt'
    },
    {
      titel: 'Lesen und strukturieren',
      heute: 'Mail, Verlauf und Anhänge lesen, oft mehrmals: Was will der Vermittler, welche Angaben sind da, was fehlt?',
      kuenftig: 'Die KI liest alles, auch Scans, und legt das Deckblatt in der Reihenfolge der Erfassung an. Jede Zeile nennt ihre Fundstelle, Herleitungen sind als solche gekennzeichnet.',
      wer: ['ki'], stufe: '1'
    },
    {
      titel: 'Betriebsart bestimmen',
      heute: 'Die Tätigkeit in einer langen Betriebsartenliste suchen. Mischbetriebe sind schwer einzustufen.',
      kuenftig: 'Die KI ordnet jede Tätigkeit der engsten passenden Betriebsart zu, mit Begründung und Aufteilung. Was nicht eindeutig passt, geht an die Fachspezialisten.',
      wer: ['ki', 'mensch'], stufe: '1'
    },
    {
      titel: 'Recherche im Bestand',
      heute: `Agenturnummer heraussuchen, Vorverträge und Vorschäden nachschlagen: ${B.imBestand} und ${B.imSchaden}.`,
      kuenftig: 'Zunächst nennt das Deckblatt, was nachzuschlagen ist. In Stufe 2 schlägt ein Roboter nach: Die Felder stehen dort immer an derselben Stelle, eine KI braucht es dafür nicht.',
      wer: ['mensch', 'robotics'], stufe: '1 und 2'
    },
    {
      titel: 'Rückfrage bei fehlenden Angaben',
      heute: 'Lücken von Hand erkennen, Mail an den Vermittler schreiben, auf die Antwort warten. Der Vorgang liegt.',
      kuenftig: 'Die KI erkennt, was für die Sparte fehlt, und formuliert die Rückfrage vor. Gesendet wird nach Prüfung und Freigabe.',
      wer: ['ki', 'mensch'], stufe: '1'
    },
    {
      titel: `Erfassung ${B.imSystem}`,
      heute: 'Agentur, Betriebsart, Risiko und Kundendaten Feld für Feld eintragen, Anlage hochladen, Angebot erstellen und prüfen.',
      kuenftig: `Zunächst erfasst die Sachbearbeitung direkt vom Deckblatt, ohne den Eingang noch einmal zu lesen. In Stufe 2 geht das Deckblatt als Datensatz per Robotics oder Schnittstelle ${B.anSystem}.`,
      wer: ['mensch', 'robotics'], stufe: '1 und 2'
    },
    {
      titel: 'Versand',
      heute: 'Angebot herunterladen, Vorlage wählen, Mail an den Vermittler schreiben, prüfen, senden.',
      kuenftig: 'Die Antwortmail mit Anhang liegt fertig vor. Die Sachbearbeitung prüft und sendet.',
      wer: ['ki', 'mensch'], stufe: '2'
    },
    {
      titel: 'Ablage',
      heute: 'E-Mail und Angebot zum Vorgang ablegen.',
      kuenftig: 'Bleibt wie heute.',
      wer: [], stufe: 'bleibt'
    }
  ]
}

function Rolle({ id }) {
  const r = ROLLEN[id]
  return (
    <span className={clsx('text-xs px-2 py-0.5 rounded-full border inline-flex items-center gap-1.5 whitespace-nowrap', r.chip)}>
      <r.Icon size={12} /> {r.kurz || r.label}
    </span>
  )
}

function Stufe({ wert }) {
  if (wert === 'bleibt') return <span className="text-xs text-slate-400 whitespace-nowrap">unverändert</span>
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 whitespace-nowrap font-mono">
      Stufe {wert}
    </span>
  )
}

function Rollenkarte({ id, titel, text, zusatz }) {
  const r = ROLLEN[id]
  return (
    <div className="card-base p-5">
      <div className="flex items-center gap-2.5">
        <span className={clsx('text-xs px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5 whitespace-nowrap', r.chip)}>
          <r.Icon size={13} /> {r.label}
        </span>
        {zusatz && <span className="text-xs text-slate-400">{zusatz}</span>}
      </div>
      <h3 className="mt-3 text-lg font-semibold text-slate-900 leading-tight">{titel}</h3>
      <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{text}</p>
    </div>
  )
}

function Punktliste({ punkte, Icon = Check, ton = 'text-emerald-600' }) {
  return (
    <ul className="space-y-2">
      {punkte.map(p => (
        <li key={p} className="flex gap-2.5 text-sm text-slate-700 leading-snug">
          <Icon size={15} className={clsx('mt-0.5 shrink-0', ton)} strokeWidth={2.25} />
          <span>{p}</span>
        </li>
      ))}
    </ul>
  )
}

export default function ProzessPage({ onPraesentation }) {
  const B = begriffe()
  const zeilen = schritte(B)
  const beispiele = VORGAENGE.filter(v => v.beispiel).length
  const erfunden = VORGAENGE.length - beispiele
  const raster = 'lg:grid lg:grid-cols-[2.25rem_minmax(9rem,0.62fr)_minmax(0,1.35fr)_minmax(0,1.5fr)_minmax(8.5rem,auto)] lg:gap-x-5'

  return (
    <div className="p-6 space-y-5 animate-fade-in-up">
      <div className="card-base p-5 flex flex-wrap items-start gap-5">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-semibold text-slate-900">Vom Eingang zum Angebot</h2>
          <p className="mt-1.5 text-base text-slate-600 max-w-5xl leading-relaxed">
            Heute liest, strukturiert und erfasst die Sachbearbeitung jede Anfrage von Hand. Die Strecke nimmt ihr das
            Lesen und Abtippen ab, nicht die Entscheidung: Die KI bereitet vor, ein Roboter oder eine Schnittstelle
            überträgt, der Mensch prüft und gibt frei.
          </p>
        </div>
        <button onClick={onPraesentation}
          className="px-5 py-3 rounded-xl text-base font-medium text-white flex items-center gap-3 shadow-md hover:shadow-lg transition-shadow shrink-0"
          style={{ background: 'var(--mode-gradient)' }}>
          <Presentation size={19} strokeWidth={1.75} /> Präsentation starten
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Rollenkarte id="ki" titel="Liest und strukturiert"
          text="Liest Mail, Verlauf und Anhänge, ordnet die Angaben den Feldern zu, schlägt die Betriebsart vor, erkennt Lücken und formuliert die Rückfrage vor. Wo der Eingang nicht wörtlich passt, interpretiert sie und kennzeichnet das." />
        <Rollenkarte id="robotics" zusatz="ab Stufe 2" titel="Überträgt und schlägt nach"
          text={`Trägt das Deckblatt ${B.imSystem} ein und holt Agenturnummer, Vorvertrag und Vorschäden aus dem Bestand. Feste Masken, feste Felder: Dafür braucht es keine KI.`} />
        <Rollenkarte id="mensch" titel="Prüft und entscheidet"
          text="Sieht Original und Deckblatt nebeneinander, korrigiert, gibt Rückfrage und Antwort frei und entscheidet über Annahme und Sonderfälle. Hinaus geht nichts ohne Freigabe." />
      </div>

      {/* Schritt für Schritt */}
      <div className="card-base overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-base text-slate-800">Schritt für Schritt: heute und mit der Strecke</h3>
        </div>
        <div className={clsx('hidden px-5 py-2.5 bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400', raster)}>
          <span />
          <span>Schritt</span>
          <span>Heute</span>
          <span>Mit der Strecke</span>
          <span>Wer und wann</span>
        </div>
        <div className="divide-y divide-slate-100">
          {zeilen.map((z, i) => (
            <div key={z.titel} className={clsx('px-5 py-4 space-y-2 lg:space-y-0 lg:items-start', raster)}>
              <span className="w-8 h-8 rounded-lg text-sm font-semibold inline-flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: 'var(--mode-primary)' }}>{i + 1}</span>
              <div className="text-base font-semibold text-slate-900 leading-snug lg:pt-0.5">{z.titel}</div>
              <div>
                <div className="lg:hidden text-xs uppercase tracking-wide text-slate-400">Heute</div>
                <p className="text-sm text-slate-600 leading-relaxed">{z.heute}</p>
              </div>
              <div>
                <div className="lg:hidden text-xs uppercase tracking-wide text-slate-400">Mit der Strecke</div>
                <p className={clsx('text-sm leading-relaxed', z.stufe === 'bleibt' ? 'text-slate-500' : 'text-slate-900')}>{z.kuenftig}</p>
              </div>
              <div className="flex flex-wrap lg:flex-col items-start gap-1.5">
                {z.wer.map(w => <Rolle key={w} id={w} />)}
                <Stufe wert={z.stufe} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zwei Ausbaustufen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-base p-5 border-2" style={{ borderColor: 'var(--mode-primary-light)' }}>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">Stufe 1</span>
            <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: 'var(--mode-primary-light)' }}>zeigt diese Demo</span>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-slate-900 leading-tight">Datenstrukturierung</h3>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
            Aus jedem Eingang wird ein Deckblatt. Dafür ist keine Schnittstelle zu den Systemen des Hauses nötig.
          </p>
          <div className="mt-3">
            <Punktliste punkte={[
              'Deckblatt je Eingang, immer gleich aufgebaut, in der Reihenfolge der Erfassung',
              'Zu jedem Wert die Fundstelle im Original',
              'Fehlendes erkannt, Rückfrage vorformuliert',
              'Sonderfälle ausgesteuert, mit Begründung'
            ]} />
          </div>
        </div>
        <div className="card-base p-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">Stufe 2</span>
            <span className="text-xs text-slate-400">Ausblick</span>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-slate-900 leading-tight">Anbindung</h3>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
            Das Deckblatt fließt per Robotics oder Schnittstelle in die Systeme. In der Demo ist das als Datensatz
            angedeutet, der sich je Eingang ansehen und laden lässt.
          </p>
          <div className="mt-3">
            <Punktliste ton="text-slate-400" punkte={[
              `Deckblatt als Datensatz ${B.anSystem}`,
              'Recherche im Bestand durch einen Roboter',
              'Antwortmail mit Anhang vorbereitet',
              'Die Freigabe bleibt bei der Sachbearbeitung'
            ]} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="card-base p-5">
          <h3 className="font-semibold text-base text-slate-800">Was beim Menschen bleibt</h3>
          <div className="mt-3">
            <Punktliste Icon={UserCheck} ton="text-emerald-600" punkte={[
              'Die Entscheidung, ob und wie ein Risiko gezeichnet wird',
              'Tätigkeiten, für die es keine passende Betriebsart gibt',
              'Eingänge, die keine Angebotsanfrage sind, etwa Vertragsänderungen',
              'Jede Mail, die das Haus verlässt',
              'Beratung und die Betreuung der Vermittler'
            ]} />
          </div>
        </div>

        <div className="card-base p-5">
          <h3 className="font-semibold text-base text-slate-800">Warum jede Zeile ihre Fundstelle zeigt</h3>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Ein Sprachmodell kann sich verlesen oder etwas in einen Text hineinlesen. Deshalb steht zu jedem Wert die
            Stelle im Original, Herleitungen sind eigens markiert, und erfasst wird erst nach dem Blick der
            Sachbearbeitung.
          </p>
          <ul className="mt-3 space-y-2">
            {[
              ['probe-gelesen', 'wörtlich gelesen'],
              ['probe-interpretiert', 'von der KI interpretiert, mit Herleitung'],
              ['probe-auffaellig', 'Auffälligkeit, die jemand ansehen sollte']
            ].map(([klasse, text]) => (
              <li key={klasse} className="flex items-center gap-2.5 text-sm text-slate-700 leading-snug">
                <span className={clsx('w-3.5 h-3.5 rounded-sm shrink-0', klasse)} /> {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="card-base p-5">
          <h3 className="font-semibold text-base text-slate-800">Worauf diese Demo beruht</h3>
          <div className="mt-3">
            <Punktliste Icon={Check} ton="text-slate-400" punkte={[
              `${beispiele} Beispielanfragen des Fachbereichs, verfremdet und als Originalseiten gezeigt`,
              `${erfunden} erfundene Eingänge, damit alle ${ANGEBOTSLAYOUTS.length} Layouts und alle drei Ergebnisse vorkommen`,
              `Gliederung der Deckblätter aus der ${B.layoutQuelle}`,
              'Pflichtangaben je Sparte sind eine Annahme, die Betriebsartenliste ist ein Auszug',
              'Die Auswertung der Demo-Eingänge ist hinterlegt. Eigene Anfragen liest die KI live, dafür ist ein API Key nötig.'
            ]} />
          </div>
        </div>
      </div>
    </div>
  )
}
