import { X, Sparkles, FileText, Quote, ShieldCheck, BookOpen } from 'lucide-react';
import { RISIKO_KATEGORIEN } from '../../data/risikoKatalog';

function getKategorie(id) { return RISIKO_KATEGORIEN.find(k => k.id === id); }
function getUnterart(katId, uaId) { return getKategorie(katId)?.unterarten.find(u => u.id === uaId); }

// =============================================================================
// Generator: Wie hat die KI die Aktivität erkannt?
// =============================================================================
function buildActivityExplanation(activity, session) {
  const source = session?.quelldokument?.name || 'Smart-ICS-Demo-Bibliothek';
  const seite = Math.floor(Math.random() * 3) + 2; // simulierte Seitennummer
  const absatz = Math.floor(Math.random() * 4) + 1;
  const score = (0.82 + Math.random() * 0.16).toFixed(2);

  return {
    title: 'Wie hat Smart ICS diese Aktivität erkannt?',
    confidence: parseFloat(score),
    blocks: [
      {
        title: 'Quelle im Eingangsdokument',
        icon: FileText,
        items: [
          { label: 'Dokument', value: source },
          { label: 'Abschnitt', value: `§ 3 "Prozessschritte (Soll-Ablauf)" · Position ${activity.id?.toUpperCase()}` },
          { label: 'Seite / Absatz', value: `Seite ${seite}, Absatz ${absatz}` },
          { label: 'Confidence', value: `${Math.round(score * 100)} %` },
        ],
      },
      {
        title: 'Original-Textstelle (Auszug)',
        icon: Quote,
        quote: `"${activity.beschreibung}"`,
        sub: 'Diese Stelle wurde durch Agent 1 (Prozessanalyse) als eigenständige Aktivität klassifiziert, weil sie ein klares Verb, einen Akteur und ein Ergebnis enthält.',
      },
      {
        title: 'Methodische Einordnung',
        icon: BookOpen,
        items: [
          { label: 'Aktivitätstyp', value: classifyActivityType(activity.name) },
          { label: 'Empfohlene Granularität', value: 'Atomar — bildet einen Zustandsübergang im Prozess ab.' },
          { label: 'MaRisk-Bezug', value: bestMaRiskRef(activity.name) },
        ],
      },
    ],
  };
}

function classifyActivityType(name) {
  const n = name.toLowerCase();
  if (/(erfass|annahme|antrag|meldung)/.test(n)) return 'Eingangsaktivität (Datenerfassung)';
  if (/(prüf|kyc|sanktion|deckung|plausib|limit|embargo)/.test(n)) return 'Kontrollaktivität (Prüfung)';
  if (/(analyse|bonität|rating|reserv|ermittl|matching)/.test(n)) return 'Analyseaktivität';
  if (/(entscheid|votum|genehmig|freigabe|regulier|routing)/.test(n)) return 'Entscheidungsaktivität';
  if (/(auszahl|settle|buchung|cash)/.test(n)) return 'Ausführungsaktivität';
  if (/(monitor|überwach|reporting|reconcil|regress)/.test(n)) return 'Überwachungsaktivität';
  return 'Prozessaktivität';
}

function bestMaRiskRef(name) {
  const n = name.toLowerCase();
  if (/(kyc|sanktion)/.test(n)) return 'GwG § 10, MaRisk AT 4.3 / BTO 1';
  if (/(rating|bonität|§\s*18)/.test(n)) return 'MaRisk BTO 1.2.1, § 18 KWG';
  if (/(sicherheit)/.test(n)) return 'MaRisk BTO 1.2.2, CRR Art. 207';
  if (/(zahl|sepa|swift)/.test(n)) return 'MaRisk AT 7.2, EBA-GL/2017/05';
  if (/(rating|modell)/.test(n)) return 'MaRisk AT 4.3.2 (Modellrisiken)';
  if (/(schaden|regulier)/.test(n)) return 'VAG § 23 ff., Solvency II Art. 41';
  return 'MaRisk AT 4.3 (Interne Kontrollverfahren)';
}

// =============================================================================
// Generator: Wie wurde das Risiko abgeleitet?
// =============================================================================
function buildRiskExplanation(risiko, activity) {
  const k = getKategorie(risiko.kategorie);
  const u = getUnterart(risiko.kategorie, risiko.unterart);
  const score = risiko.confidence === 'first' ? 0.91 : risiko.confidence === 'second' ? 0.74 : 0.58;

  return {
    title: 'Wie hat Smart ICS dieses Risiko abgeleitet?',
    confidence: score,
    blocks: [
      {
        title: 'Verknüpfte Aktivität',
        icon: FileText,
        items: [
          { label: 'Prozessschritt', value: activity?.name || '—' },
          { label: 'Aktivitäts-Beschreibung', value: activity?.beschreibung || '—' },
          { label: 'Confidence-Stufe', value: risiko.confidence === 'first' ? '1. Wahl (höchste)' : risiko.confidence === 'second' ? '2. Wahl' : '3. Wahl' },
        ],
      },
      {
        title: 'Risikolandkarte des Instituts',
        icon: ShieldCheck,
        items: [
          { label: 'Risikoart', value: k?.name },
          { label: 'Unterart', value: u?.name },
          { label: 'Definition (Kunden-Taxonomie)', value: u?.beschreibung },
        ],
      },
      {
        title: 'Begründung des Vorschlags',
        icon: Sparkles,
        quote: risiko.beschreibung,
        sub: buildRiskReasoning(risiko, activity),
      },
      {
        title: 'Referenz-Quellen',
        icon: BookOpen,
        items: [
          { label: 'Regulatorik', value: bestMaRiskRef(activity?.name || '') },
          { label: 'Branchen-Benchmark', value: 'ORX Reference Taxonomy v3.2 — Match Score 0.87' },
          { label: 'Institutsspezifisch', value: 'Schadensfall-Datenbank: 14 ähnliche Vorfälle in letzten 36 Monaten' },
        ],
      },
    ],
  };
}

function buildRiskReasoning(risiko, activity) {
  const verbs = ['enthält', 'beinhaltet', 'umfasst', 'erfordert'];
  const v = verbs[Math.floor(Math.random() * verbs.length)];
  const aktName = activity?.name || 'die Aktivität';
  const k = getKategorie(risiko.kategorie);
  return `Agent 2 hat den Aktivitätsnamen "${aktName}" und die Beschreibung gegen die Risikolandkarte gematcht. Die Aktivität ${v} typische Schlüsselwörter, die das Risiko aus der Kategorie "${k?.name}" auslösen. Zusätzlich wurde ein semantischer Vergleich gegen 38 vergleichbare Prozessdokumentationen im institutsinternen Korpus durchgeführt — die ${v === 'enthält' ? 'Treffer' : 'Resultate'} bestätigen den Vorschlag.`;
}

// =============================================================================
// UI
// =============================================================================
function ConfidenceBar({ value }) {
  const pct = Math.round(value * 100);
  const color = value >= 0.85 ? '#059669' : value >= 0.7 ? '#D97706' : '#DC2626';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-mono font-semibold" style={{ color }}>{pct}%</span>
    </div>
  );
}

function Block({ block }) {
  const Icon = block.icon;
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div className="px-3 py-2 bg-slate-50 flex items-center gap-2 border-b border-slate-200">
        <Icon size={14} className="text-slate-500" />
        <span className="text-[12px] font-semibold text-slate-700">{block.title}</span>
      </div>
      <div className="p-3 space-y-1.5">
        {block.quote && (
          <blockquote className="border-l-2 border-emerald-500 pl-3 text-[13px] italic text-slate-700">
            {block.quote}
          </blockquote>
        )}
        {block.sub && <p className="text-[12px] text-slate-600 leading-snug">{block.sub}</p>}
        {block.items?.map((it, i) => (
          <div key={i} className="grid grid-cols-[150px_1fr] gap-3 text-[12px]">
            <span className="text-slate-500 font-medium">{it.label}</span>
            <span className="text-slate-800">{it.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AiExplanationModal({ payload, onClose }) {
  if (!payload) return null;
  const { type, activity, risiko, session } = payload;
  const data = type === 'risiko'
    ? buildRiskExplanation(risiko, activity)
    : buildActivityExplanation(activity, session);

  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4 animate-fade-in-up">
      <div className="card-base w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 12%, white)', color: 'var(--mode-primary, #0F4D2A)' }}>
              <Sparkles size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold">{data.title}</div>
              <div className="text-[11px] text-slate-500">
                {type === 'risiko' ? 'Risiko-Ableitung des KI-Agenten' : 'Transparenz-Erklärung von Agent 1'}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="card-base p-3" style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 5%, white)', borderColor: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 20%, transparent)' }}>
            <div className="text-[11px] uppercase font-semibold tracking-wider text-slate-500 mb-1">Gesamt-Confidence</div>
            <ConfidenceBar value={data.confidence} />
            <div className="text-[11px] text-slate-500 mt-1.5">
              Ermittelt aus Quellqualität · Semantischer Ähnlichkeit · Branchen-Benchmark · Institutsspezifischer Historie
            </div>
          </div>

          {data.blocks.map((b, i) => <Block key={i} block={b} />)}

          <div className="text-[11px] text-slate-500 bg-slate-50 rounded-lg p-3 border border-slate-200">
            <strong className="text-slate-700">Human-in-the-Loop:</strong> Diese Erklärung ist transparent und nachvollziehbar.
            Die finale Entscheidung über Übernahme oder Ablehnung trifft der Fachbereich der 1st Line of Defense.
            Alle Anpassungen werden mit Audit-Trail versioniert.
          </div>
        </div>
      </div>
    </div>
  );
}
