/**
 * Placeholder for static content pages (Architektur, E-Mail Vorlagen, Prozess, Projektplan, KI Upload)
 */
import { FileText, Mail, GitBranch, CalendarDays, Upload } from 'lucide-react'

const PAGE_CONFIG = {
  'ai-upload': {
    icon: Upload,
    title: 'KI Upload',
    description: 'Laden Sie E-Mails (.eml, .msg) oder Dokumente hoch und lassen Sie diese automatisch von der KI analysieren.',
    content: 'Die KI-Upload-Funktion analysiert E-Mails und deren Anhänge automatisch und extrahiert Bestandsübertragungsdaten.'
  },
  'architektur': {
    icon: GitBranch,
    title: 'Systemarchitektur',
    description: 'Übersicht über die technische Architektur des Bestandsübertragung-Tools.',
    content: 'Outlook → JSON Export → Upload → KI-Erkennung → PV-Validierung → Robotics-Export'
  },
  'vorlagen': {
    icon: Mail,
    title: 'E-Mail Vorlagen',
    description: 'Standardisierte E-Mail-Vorlagen für die Kommunikation mit Maklern.',
    sections: [
      { title: 'Bestätigung Bestandsübertragung', text: 'Sehr geehrte/r [Makler],\n\nwir bestätigen den Eingang Ihres Antrags auf Bestandsübertragung für [Kunde], Versicherungsnummer [VS-Nr].\n\nDie Übertragung wird zum [Datum] wirksam.\n\nMit freundlichen Grüßen\nERGO Bestandsservice' },
      { title: 'Rückfrage fehlende Unterlagen', text: 'Sehr geehrte/r [Makler],\n\nzur Bearbeitung der Bestandsübertragung für [Kunde] benötigen wir noch folgende Unterlagen:\n- Unterschriebene Maklervollmacht\n- Ausweiskopie\n\nBitte reichen Sie diese nach.\n\nMit freundlichen Grüßen\nERGO Bestandsservice' },
      { title: 'Ablehnung', text: 'Sehr geehrte/r [Makler],\n\nleider können wir die Bestandsübertragung für [Kunde], Versicherungsnummer [VS-Nr] nicht durchführen.\n\nGrund: [Ablehnungsgrund]\n\nMit freundlichen Grüßen\nERGO Bestandsservice' }
    ]
  },
  'prozess': {
    icon: CalendarDays,
    title: 'Prozessübersicht',
    description: 'Der End-to-End Prozess der Bestandsübertragung.',
    steps: [
      '1. Makler sendet Übertragungsantrag per E-Mail',
      '2. E-Mail wird in Outlook erfasst und als JSON exportiert',
      '3. JSON wird ins Tool importiert',
      '4. KI erkennt automatisch Kundendaten, VS-Nr, Sparte',
      '5. PV-Mitarbeiter validiert die erkannten Daten',
      '6. Validierte Vorgänge werden für Export freigegeben',
      '7. Export an Robotics-System (CSV)',
      '8. Automatische Verarbeitung im Bestandssystem'
    ]
  },
  'projektplan': {
    icon: FileText,
    title: 'Projektplan',
    description: 'Meilensteine und Zeitplan des Bestandsübertragung-Projekts.',
    milestones: [
      { phase: 'Phase 1', title: 'MVP', status: 'Abgeschlossen', items: ['JSON-Import', 'KI-Erkennung', 'Dashboard'] },
      { phase: 'Phase 2', title: 'Validierung', status: 'Abgeschlossen', items: ['PV-Validierung', 'Export', 'Makler-Übersicht'] },
      { phase: 'Phase 3', title: 'Optimierung', status: 'In Arbeit', items: ['KI Upload (.eml/.msg)', 'Massenvalidierung', 'Duplikat-Erkennung'] },
      { phase: 'Phase 4', title: 'React Migration', status: 'In Arbeit', items: ['React-App', 'Tailwind CSS', 'Komponenten-Architektur'] }
    ]
  }
}

export default function StaticPage({ pageId }) {
  const config = PAGE_CONFIG[pageId]
  if (!config) return <div className="p-6 text-gray-400">Seite nicht gefunden</div>

  const Icon = config.icon

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-[#c41230]/10 rounded-xl flex items-center justify-center">
          <Icon size={24} className="text-[#c41230]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{config.title}</h2>
          <p className="text-sm text-gray-500">{config.description}</p>
        </div>
      </div>

      {config.content && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <p className="text-gray-600 whitespace-pre-line">{config.content}</p>
        </div>
      )}

      {config.sections && config.sections.map((s, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">{s.title}</h3>
            <button onClick={() => { navigator.clipboard.writeText(s.text) }}
              className="text-xs text-[#c41230] hover:text-[#a00f28] px-3 py-1 border border-[#c41230]/30 rounded-lg hover:bg-[#c41230]/5 transition-colors">
              Kopieren
            </button>
          </div>
          <pre className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 rounded-lg p-4 font-sans">{s.text}</pre>
        </div>
      ))}

      {config.steps && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="space-y-3">
            {config.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#c41230]/10 text-[#c41230] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-sm text-gray-700">{step.replace(/^\d+\.\s*/, '')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {config.milestones && (
        <div className="space-y-4">
          {config.milestones.map((m, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs text-gray-400">{m.phase}</span>
                  <h3 className="font-semibold text-gray-800">{m.title}</h3>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  m.status === 'Abgeschlossen' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>{m.status}</span>
              </div>
              <ul className="space-y-1">
                {m.items.map((item, j) => (
                  <li key={j} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-green-500">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
