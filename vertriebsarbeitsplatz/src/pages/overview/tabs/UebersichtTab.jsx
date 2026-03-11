import { Sun, Clock, Zap, CheckSquare, Calendar, Phone, AlertTriangle } from 'lucide-react';
import Card from '../../../components/ui/Card';
import { PrioBadge } from '../../../components/ui/Badge';
import { useMode } from '../../../hooks/useMode';
import { KUNDEN_BY_MODE, TERMINE_BY_MODE, AUFGABEN_BY_MODE, getAllPotentiale } from '../../../data';
import { formatEur } from '../../../utils/formatters';

const MINI_KPIS = {
  versicherung: [
    { label: 'Abschluesse', value: '12', subtext: 'diese Woche' },
    { label: 'Neugeschaeft', value: '18k', subtext: 'diese Woche' },
    { label: 'Termine', value: '28', subtext: 'diesen Monat' },
    { label: 'Quote', value: '68%', subtext: 'Abschluss' },
  ],
  banking: [
    { label: 'Abschluesse', value: '8', subtext: 'diese Woche' },
    { label: 'Ertrag', value: '24,8k', subtext: 'dieser Monat' },
    { label: 'Termine', value: '18', subtext: 'diesen Monat' },
    { label: 'NPS', value: '8,4', subtext: 'Durchschnitt' },
  ],
  vermoegensverwaltung: [
    { label: 'AuM', value: '78M', subtext: 'gesamt' },
    { label: 'NNM', value: '+5,8M', subtext: 'YTD' },
    { label: 'Performance', value: '+5,6%', subtext: 'YTD \u00d8' },
    { label: 'Pipeline', value: '45M', subtext: '12 Leads' },
  ],
};

const FOKUS = {
  versicherung: { text: 'Peter Schmidt - BU-Nachversicherung', next: '17:30 Amira Koenig' },
  banking: { text: 'Klaus Fischer - Anschlussfinanzierung 09/2026', next: '14:00 Klaus Fischer' },
  vermoegensverwaltung: { text: 'Keller NextGen - WpHG-Fragebogen + Geeignetheitsbericht', next: '10:00 Dr. Anna Fischer (Onboarding)' },
};

const TAGESSTART_ITEMS = {
  versicherung: [
    { icon: Calendar, text: '3 Termine', size: 14 },
    { icon: Phone, text: '2 Rueckrufe', size: 14 },
    { icon: AlertTriangle, text: '1 Warnung', size: 14, className: 'text-amber-500' },
  ],
  banking: [
    { icon: Calendar, text: '4 Termine', size: 14 },
    { icon: Phone, text: '1 Rueckruf', size: 14 },
    { icon: AlertTriangle, text: '2 FIDA-Consents offen', size: 14, className: 'text-amber-500' },
  ],
  vermoegensverwaltung: [
    { icon: Calendar, text: '2 Mandate-Meetings', size: 14 },
    { icon: AlertTriangle, text: '1 Rebalancing faellig', size: 14, className: 'text-amber-500' },
    { icon: AlertTriangle, text: '1 WpHG abgelaufen', size: 14, className: 'text-red-500' },
  ],
};

export default function UebersichtTab() {
  const { modeId, navigateTo } = useMode();
  const potentiale = getAllPotentiale(modeId).sort((a, b) => {
    const prio = { kritisch: 0, hoch: 1, mittel: 2, niedrig: 3 };
    return (prio[a.prioritaet] || 3) - (prio[b.prioritaet] || 3);
  }).slice(0, 5);

  const termine = (TERMINE_BY_MODE[modeId] || TERMINE_BY_MODE.versicherung).slice(0, 4);
  const aufgaben = AUFGABEN_BY_MODE[modeId] || AUFGABEN_BY_MODE.versicherung;
  const miniKpis = MINI_KPIS[modeId] || MINI_KPIS.versicherung;
  const fokus = FOKUS[modeId] || FOKUS.versicherung;
  const tagesItems = TAGESSTART_ITEMS[modeId] || TAGESSTART_ITEMS.versicherung;

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Linke Spalte 2/3 */}
      <div className="col-span-2 space-y-4 min-w-0">
        {/* Tagesstart */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sun size={20} className="text-amber-500" strokeWidth={1.75} />
              <h3 className="font-semibold text-slate-800">Tagesstart</h3>
            </div>
            <span className="text-sm text-slate-400">11.03.2026</span>
          </div>
          <div className="flex gap-4 text-sm text-slate-600 mb-3">
            {tagesItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <span key={i} className="flex items-center gap-1">
                  <Icon size={item.size} className={item.className} />
                  {item.text}
                </span>
              );
            })}
          </div>
          <div className="text-sm text-slate-700 mb-2">
            <span className="font-medium">Fokus:</span> {fokus.text}
          </div>
          <div className="text-sm text-slate-500">
            Naechster Termin: {fokus.next}
          </div>

          {/* Mini KPIs */}
          <div className="grid grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
            {miniKpis.map((kpi, i) => (
              <MiniKPI key={i} label={kpi.label} value={kpi.value} subtext={kpi.subtext} />
            ))}
          </div>
        </Card>

        {/* Vertriebspotentiale */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap size={20} style={{ color: 'var(--mode-primary-light)' }} strokeWidth={1.75} />
              <h3 className="font-semibold text-slate-800">
                {modeId === 'vermoegensverwaltung' ? 'Mandate & Potentiale' : 'Vertriebspotentiale'}
              </h3>
            </div>
            <span className="text-sm text-slate-400">Top-5 von {getAllPotentiale(modeId).length}</span>
          </div>
          <div className="space-y-2">
            {potentiale.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => navigateTo('detail', { kundeId: p.kundeId })}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-sm font-medium text-slate-700 w-32 truncate">{p.kundeName}</span>
                  <span className="text-sm text-slate-500 truncate flex-1">{p.titel}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <PrioBadge prioritaet={p.prioritaet} />
                  <span className="text-sm font-mono font-medium text-slate-700 w-24 text-right">
                    {p.volumen > 0 ? formatEur(p.volumen) : '-'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-3 text-sm font-medium hover:underline" style={{ color: 'var(--mode-primary-light)' }}>
            +{Math.max(0, getAllPotentiale(modeId).length - 5)} weitere anzeigen
          </button>
        </Card>

        {/* Aufgaben */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare size={20} className="text-slate-500" strokeWidth={1.75} />
              <h3 className="font-semibold text-slate-800">Aktuelle Aufgaben</h3>
            </div>
            <span className="text-sm text-slate-400">{aufgaben.length} offen</span>
          </div>
          <div className="space-y-2">
            {aufgaben.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300" readOnly />
                  <span className="text-sm text-slate-700">{a.text}</span>
                </div>
                <span className="text-xs text-slate-400">{a.faellig}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Rechte Spalte 1/3 - Termine */}
      <div className="col-span-1 min-w-0">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} className="text-slate-500" strokeWidth={1.75} />
            <h3 className="font-semibold text-slate-800">Anstehende Termine</h3>
          </div>
          <div className="space-y-4">
            {termine.map((t, i) => (
              <div
                key={i}
                className="py-3 border-b border-slate-100 last:border-0 cursor-pointer hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors"
                onClick={() => navigateTo('detail', { kundeId: t.kundeId })}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">{t.datum} {t.zeit}</span>
                </div>
                <div className="text-sm font-medium text-slate-700">{t.kunde}</div>
                <div className="text-xs text-slate-500">{t.betreff}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function MiniKPI({ label, value, subtext }) {
  return (
    <div className="text-center">
      <div className="font-mono text-xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-xs text-slate-400">{subtext}</div>
    </div>
  );
}
