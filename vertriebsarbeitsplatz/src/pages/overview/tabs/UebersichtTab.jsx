import { Sun, Clock, Zap, CheckSquare, Calendar, Phone, AlertTriangle, CheckCircle, FileText, Heart, Car, Home, ShieldAlert, Cake, Euro, Download, Landmark, BarChart3, PiggyBank, Wallet } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Avatar from '../../../components/ui/Avatar';
import { PrioBadge, SparteBadge } from '../../../components/ui/Badge';
import { useMode } from '../../../hooks/useMode';
import { KUNDEN_BY_MODE, TERMINE_BY_MODE, AUFGABEN_BY_MODE, getAllPotentiale } from '../../../data';
import { formatEur } from '../../../utils/formatters';

const MINI_KPIS = {
  versicherung: [
    { label: 'Abschlüsse', value: '12', subtext: '+3 vs. Vorwoche' },
    { label: 'Neugeschäft', value: '€18.450', subtext: '+12%' },
    { label: 'Termine', value: '28', subtext: '±0' },
    { label: 'Abschlussquote', value: '68%', subtext: '+5%' },
  ],
  banking: [
    { label: 'Abschlüsse', value: '8', subtext: 'Diese Woche' },
    { label: 'Ertrag', value: '24,8k', subtext: 'Dieser Monat' },
    { label: 'Termine', value: '18', subtext: 'Diesen Monat' },
    { label: 'NPS', value: '8,4', subtext: 'Durchschnitt' },
  ],
  vermoegensverwaltung: [
    { label: 'AuM', value: '78M', subtext: 'Gesamt' },
    { label: 'NNM', value: '+5,8M', subtext: 'YTD' },
    { label: 'Performance', value: '+5,6%', subtext: 'YTD \u00d8' },
    { label: 'Pipeline', value: '45M', subtext: '12 Leads' },
  ],
};

const FOKUS = {
  versicherung: { text: 'Peter Schmidt - BU-Nachversicherung', next: '17:30 Amira König' },
  banking: { text: 'Klaus Fischer - Anschlussfinanzierung 09/2026', next: '14:00 Klaus Fischer' },
  vermoegensverwaltung: { text: 'Keller NextGen - WpHG-Fragebogen + Geeignetheitsbericht', next: '10:00 Dr. Anna Fischer (Onboarding)' },
};

const TAGESSTART_ITEMS = {
  versicherung: [
    { icon: Calendar, text: '4 Termine heute', size: 14 },
    { icon: Zap, text: '8 offene Potenziale', size: 14 },
    { icon: Phone, text: '3 Follow-ups fällig', size: 14 },
  ],
  banking: [
    { icon: Calendar, text: '4 Termine', size: 14 },
    { icon: Phone, text: '1 Rückruf', size: 14 },
    { icon: AlertTriangle, text: '2 FIDA-Consents offen', size: 14, className: 'text-amber-500' },
  ],
  vermoegensverwaltung: [
    { icon: Calendar, text: '2 Mandate-Meetings', size: 14 },
    { icon: AlertTriangle, text: '1 Rebalancing fällig', size: 14, className: 'text-amber-500' },
    { icon: AlertTriangle, text: '1 WpHG abgelaufen', size: 14, className: 'text-red-500' },
  ],
};

const LETZTE_ABSCHLUESSE = {
  versicherung: [
    { kunde: 'Sabine Danzig', kundeId: 'KD00008', produkt: 'ERGO Risikoleben', sparte: 'leben', betrag: 480, datum: '10.03.2026' },
    { kunde: 'Michael Braun', kundeId: 'KD00005', produkt: 'ERGO Kfz-Komfort', sparte: 'kfz', betrag: 890, datum: '09.03.2026' },
    { kunde: 'Anna Hoffmann', kundeId: 'KD00004', produkt: 'DKV Zahnzusatz', sparte: 'kranken', betrag: 35, datum: '08.03.2026' },
    { kunde: 'Peter Schmidt', kundeId: 'KD00001', produkt: 'ERGO BU-Nachversicherung', sparte: 'leben', betrag: 1680, datum: '07.03.2026' },
  ],
  banking: [
    { kunde: 'Klaus Fischer', kundeId: 'KDB001', produkt: 'Anschlussfinanzierung', sparte: 'kredit', betrag: 185000, datum: '10.03.2026' },
    { kunde: 'Sandra Müller', kundeId: 'KDB002', produkt: 'VR-FinanzPlan', sparte: 'wertpapier', betrag: 25000, datum: '09.03.2026' },
    { kunde: 'Peter Hoffmann', kundeId: 'KDB005', produkt: 'VermögenPlus Depot', sparte: 'wertpapier', betrag: 50000, datum: '08.03.2026' },
  ],
  vermoegensverwaltung: [
    { kunde: 'Dr. Stefan Meier', kundeId: 'VV001', produkt: 'Spezialmandat Dividende', sparte: 'mandat', betrag: 5000000, datum: '10.03.2026' },
    { kunde: 'Familie Keller', kundeId: 'VV002', produkt: 'ESG Impact Fund', sparte: 'mandat', betrag: 2500000, datum: '08.03.2026' },
  ],
};

const GEBURTSTAGE = {
  versicherung: [
    { name: 'Amira König', kundeId: 'KD00002', datum: 'Mi, 12.03.', alter: 29, foto: './images/AdobeStock_252262042.jpeg' },
    { name: 'Thomas Weber', kundeId: 'KD00003', datum: 'Do, 13.03.', alter: 56, foto: './images/AdobeStock_361342769.jpeg' },
    { name: 'Sandra Yilmaz', kundeId: 'KD00008', datum: 'Sa, 15.03.', alter: 45, foto: './images/AdobeStock_612932760.jpeg' },
  ],
  banking: [
    { name: 'Klaus Fischer', kundeId: 'KDB001', datum: 'Mi, 12.03.', alter: 52 },
    { name: 'Andrea Lang', kundeId: 'KDB006', datum: 'Fr, 14.03.', alter: 41 },
  ],
  vermoegensverwaltung: [
    { name: 'Dr. Stefan Meier', kundeId: 'VV001', datum: 'Do, 13.03.', alter: 58 },
  ],
};

const SCHNELLZUGRIFF = {
  versicherung: [
    { label: 'Lebensversicherung', icon: Heart, color: '#ef4444' },
    { label: 'Kfz-Versicherung', icon: Car, color: '#3b82f6' },
    { label: 'Sachversicherung', icon: Home, color: '#8b5cf6' },
    { label: 'Schadenmeldung', icon: ShieldAlert, color: '#f59e0b' },
  ],
  banking: [
    { label: 'VR-FinanzPlan', icon: BarChart3, color: '#10b981' },
    { label: 'Kredit-Antrag', icon: Landmark, color: '#3b82f6' },
    { label: 'Depot eröffnen', icon: PiggyBank, color: '#8b5cf6' },
    { label: 'Wero aktivieren', icon: Wallet, color: '#f59e0b' },
  ],
  vermoegensverwaltung: [
    { label: 'Neues Mandat', icon: FileText, color: '#1a365d' },
    { label: 'WpHG-Fragebogen', icon: FileText, color: '#3b82f6' },
    { label: 'Investmentvorschlag', icon: BarChart3, color: '#10b981' },
    { label: 'Compliance-Check', icon: ShieldAlert, color: '#f59e0b' },
  ],
};

const PROVISIONSABRECHNUNGEN = {
  versicherung: [
    { monat: 'Februar 2026', betrag: 8420, datum: '01.03.2026' },
    { monat: 'Januar 2026', betrag: 7890, datum: '01.02.2026' },
    { monat: 'Dezember 2025', betrag: 9150, datum: '02.01.2026' },
  ],
  banking: [
    { monat: 'Februar 2026', betrag: 24800, datum: '01.03.2026' },
    { monat: 'Januar 2026', betrag: 21400, datum: '01.02.2026' },
    { monat: 'Dezember 2025', betrag: 26400, datum: '02.01.2026' },
  ],
  vermoegensverwaltung: [
    { monat: 'Q4/2025', betrag: 285000, datum: '15.01.2026' },
    { monat: 'Q3/2025', betrag: 248000, datum: '15.10.2025' },
    { monat: 'Q2/2025', betrag: 221000, datum: '15.07.2025' },
  ],
};

export default function UebersichtTab() {
  const { modeId, config, navigateTo, setActiveTab } = useMode();
  const potentiale = getAllPotentiale(modeId).sort((a, b) => {
    const prio = { kritisch: 0, hoch: 1, mittel: 2, niedrig: 3 };
    return (prio[a.prioritaet] || 3) - (prio[b.prioritaet] || 3);
  }).slice(0, 5);

  const termine = (TERMINE_BY_MODE[modeId] || TERMINE_BY_MODE.versicherung).slice(0, 4);
  const aufgaben = AUFGABEN_BY_MODE[modeId] || AUFGABEN_BY_MODE.versicherung;
  const miniKpis = MINI_KPIS[modeId] || MINI_KPIS.versicherung;
  const tagesItems = TAGESSTART_ITEMS[modeId] || TAGESSTART_ITEMS.versicherung;
  const abschluesse = LETZTE_ABSCHLUESSE[modeId] || LETZTE_ABSCHLUESSE.versicherung;
  const geburtstage = GEBURTSTAGE[modeId] || GEBURTSTAGE.versicherung;
  const schnellzugriff = SCHNELLZUGRIFF[modeId] || SCHNELLZUGRIFF.versicherung;
  const abrechnungen = PROVISIONSABRECHNUNGEN[modeId] || PROVISIONSABRECHNUNGEN.versicherung;

  const heute = new Date();
  const datumStr = heute.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Linke Spalte 2/3 */}
      <div className="col-span-2 space-y-4 min-w-0">
        {/* Tagesstart / Begrüßung */}
        <Card>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Sun size={20} className="text-amber-500" strokeWidth={1.75} />
              <span className="text-lg font-semibold text-slate-800">Guten Morgen, {config.beraterName.split(' ')[0]}</span>
            </div>
            <span className="text-sm text-slate-400">{datumStr}</span>
          </div>
          <div className="flex gap-3 text-sm text-slate-600 mb-3 flex-wrap">
            {tagesItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <span key={i} className="flex items-center gap-1">
                  <Icon size={item.size} className={item.className} />
                  {item.text}
                </span>
              );
            })}
            <span className="text-slate-400">·</span>
            <span>Neugeschäft MTD: {modeId === 'versicherung' ? '€12.450' : modeId === 'banking' ? '€248k' : '€5,8M'}</span>
          </div>

          {/* Vertriebskennzahlen */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <BarChart3 size={16} className="text-slate-400" />
                Vertriebskennzahlen
              </h4>
              <div className="flex gap-1 text-xs">
                <span className="px-2 py-1 rounded bg-slate-800 text-white">Woche</span>
                <span className="px-2 py-1 rounded bg-slate-100 text-slate-500 cursor-pointer hover:bg-slate-200">Monat</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {miniKpis.map((kpi, i) => (
                <MiniKPI key={i} label={kpi.label} value={kpi.value} subtext={kpi.subtext} />
              ))}
            </div>
          </div>
        </Card>

        {/* Vertriebspotenziale */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap size={20} style={{ color: 'var(--mode-primary-light)' }} strokeWidth={1.75} />
              <h3 className="font-semibold text-slate-800">
                {modeId === 'vermoegensverwaltung' ? 'Mandate & Potenziale' : 'Vertriebspotenziale'}
              </h3>
            </div>
            <span className="text-sm text-slate-400">Top-5 von {getAllPotentiale(modeId).length}</span>
          </div>
          <div className="space-y-0">
            {potentiale.map((p, i) => (
              <div
                key={i}
                className="grid py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer items-center"
                style={{ gridTemplateColumns: 'minmax(200px, auto) 1fr 140px' }}
                onClick={() => navigateTo('detail', { kundeId: p.kundeId })}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">{p.kundeName}</span>
                  <span className="text-xs text-slate-400 shrink-0">{p.kundeId}</span>
                  <PrioBadge prioritaet={p.prioritaet} />
                </div>
                <div className="min-w-0 px-3">
                  <div className="text-sm font-medium" style={{ color: 'var(--mode-primary-light)' }}>{p.titel}</div>
                  <div className="text-xs text-slate-500 truncate">{p.beschreibung}</div>
                </div>
                <div className="flex items-center gap-4 shrink-0 justify-end">
                  <div className="text-right">
                    <div className="text-[10px] uppercase text-slate-400">Prämie</div>
                    <div className="text-sm font-mono font-medium text-slate-700">
                      {p.volumen > 0 ? `${p.volumen.toLocaleString('de-DE')}€/J.` : '-'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase text-slate-400">Provision</div>
                    <div className="text-sm font-mono font-medium" style={{ color: 'var(--mode-primary-light)' }}>
                      {p.volumen > 0 ? `${Math.round(p.volumen * 0.75).toLocaleString('de-DE')}€` : '-'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            className="mt-3 text-sm font-medium hover:underline"
            style={{ color: 'var(--mode-primary-light)' }}
            onClick={() => setActiveTab('potentiale')}
          >
            +{Math.max(0, getAllPotentiale(modeId).length - 5)} weitere anzeigen →
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
              <div key={i} className="flex items-center justify-between py-2 cursor-pointer hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors"
                onClick={() => a.kundeId && navigateTo('detail', { kundeId: a.kundeId })}>
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300" readOnly />
                  <span className="text-sm text-slate-700">{a.text}</span>
                </div>
                <span className="text-xs text-slate-400">{a.faellig}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Letzte Abschlüsse */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="text-emerald-500" strokeWidth={1.75} />
              <h3 className="font-semibold text-slate-800">Letzte Abschlüsse</h3>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-500">Diese Woche</span>
          </div>
          <div className="space-y-2">
            {abschluesse.map((a, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => navigateTo('detail', { kundeId: a.kundeId, tab: 'vertraege' })}
              >
                <div className="flex items-center gap-3">
                  <SparteBadge sparte={a.sparte} />
                  <div>
                    <span className="text-sm font-medium text-slate-700">{a.kunde}</span>
                    <div className="text-xs text-slate-500">{a.produkt}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-medium text-slate-800">{formatEur(a.betrag)}</div>
                  <div className="text-xs text-slate-400">{a.datum}</div>
                </div>
              </div>
            ))}
          </div>
          <button
            className="mt-3 text-sm font-medium hover:underline"
            style={{ color: 'var(--mode-primary-light)' }}
            onClick={() => setActiveTab('neugeschaeft')}
          >
            Alle Abschlüsse anzeigen →
          </button>
        </Card>
      </div>

      {/* Rechte Spalte 1/3 */}
      <div className="col-span-1 space-y-4 min-w-0">
        {/* Anstehende Termine */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} className="text-slate-500" strokeWidth={1.75} />
            <h3 className="font-semibold text-slate-800">Anstehende Termine</h3>
          </div>
          <div className="space-y-3">
            {termine.map((t, i) => {
              const tDate = new Date(t.datum);
              const todayStr = heute.toISOString().split('T')[0];
              const isToday = t.datum === todayStr;
              const dayLabel = isToday ? 'Heute' : tDate.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0 cursor-pointer hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors"
                  onClick={() => navigateTo('detail', { kundeId: t.kundeId })}
                >
                  <div className="text-center shrink-0 w-14">
                    <div className={`text-[10px] font-semibold uppercase ${isToday ? 'text-red-500' : 'text-slate-400'}`}>{dayLabel}</div>
                    <div className="text-sm font-bold text-slate-700">{t.zeit}</div>
                  </div>
                  <Avatar name={t.kunde} foto={t.foto} size={44} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-700 truncate">{t.kunde}</div>
                    <div className="text-xs text-slate-500 truncate">{t.betreff}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Schnellzugriff Formulare */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <FileText size={20} className="text-slate-500" strokeWidth={1.75} />
            <h3 className="font-semibold text-slate-800">Schnellzugriff Formulare</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {schnellzugriff.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={i}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-center"
                >
                  <Icon size={24} style={{ color: item.color }} strokeWidth={1.5} />
                  <span className="text-xs font-medium text-slate-600">{item.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Provisionsabrechnungen */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Euro size={20} className="text-slate-500" strokeWidth={1.75} />
            <h3 className="font-semibold text-slate-800">
              {modeId === 'vermoegensverwaltung' ? 'Ertragsabrechnungen' : 'Provisionsabrechnungen'}
            </h3>
          </div>
          <div className="space-y-2">
            {abrechnungen.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <Download size={16} className="text-slate-400" />
                  <div>
                    <div className="text-sm font-medium text-slate-700">{a.monat}</div>
                    <div className="text-xs text-slate-400">{a.datum}</div>
                  </div>
                </div>
                <span className="text-sm font-mono font-semibold text-slate-800">{formatEur(a.betrag)}</span>
              </div>
            ))}
          </div>
          <button
            className="mt-3 text-sm font-medium hover:underline"
            style={{ color: 'var(--mode-primary-light)' }}
            onClick={() => setActiveTab('verguetung')}
          >
            Alle Abrechnungen anzeigen →
          </button>
        </Card>

        {/* Geburtstage diese Woche */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Cake size={20} className="text-pink-400" strokeWidth={1.75} />
            <h3 className="font-semibold text-slate-800">Geburtstage diese Woche</h3>
          </div>
          <div className="space-y-3">
            {geburtstage.map((g, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-2 cursor-pointer hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors"
                onClick={() => navigateTo('detail', { kundeId: g.kundeId })}
              >
                <Avatar name={g.name} foto={g.foto} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-700">{g.name}</div>
                  <div className="text-xs text-slate-400">{g.datum} · wird {g.alter}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function MiniKPI({ label, value, subtext }) {
  const isPositive = subtext?.startsWith('+');
  const isNegative = subtext?.startsWith('-');
  return (
    <div className="text-center py-2">
      <div className="font-mono text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
      <div className={`text-xs mt-0.5 font-medium ${isPositive ? 'text-emerald-500' : isNegative ? 'text-red-500' : 'text-slate-400'}`}>
        {subtext}
      </div>
    </div>
  );
}
