import { useState } from 'react';
import { clsx } from 'clsx';
import { Users, Workflow, CalendarDays, User, UserCheck } from 'lucide-react';

// Demo-Daten: fünf Sachbearbeiter:innen des Provisionsservice. Skills,
// Kapazität pro Tag und Rolle treiben Routing- und Vertretungsvorschläge.
const SACHBEARBEITER = [
  { id: 'lisa',    name: 'Lisa Neumann',      rolle: 'Sachbearbeiterin', skills: ['Leben', 'Dynamik', 'Storno'],            kapazitaet: 18 },
  { id: 'tobias',  name: 'Tobias Reichert',   rolle: 'Sachbearbeiter',   skills: ['PKV', 'GKV-Zusatz', 'BAP'],              kapazitaet: 16 },
  { id: 'sandra',  name: 'Sandra Berger',     rolle: 'Sachbearbeiterin', skills: ['Sach/HUK', 'Unfall'],                    kapazitaet: 14 },
  { id: 'marco',   name: 'Marco Heller',      rolle: 'Teamleiter',       skills: ['Eskalation', 'Gewerbe'],                 kapazitaet: 10 },
  { id: 'julia',   name: 'Julia Steinbrecht', rolle: 'Sachbearbeiterin', skills: ['Superprovision', 'Vertriebsvereinbarungen'], kapazitaet: 12 },
];

// Fachliche Segmente, nach denen Reklamationen geroutet werden. Pro Segment
// gibt es eine:n primär Verantwortliche:n und eine Vertretung.
const SEGMENTE = [
  { id: 'leben',      label: 'Leben',                 beschreibung: 'Fondsgebundene & klassische Lebensversicherungen, Dynamik, Storno' },
  { id: 'pkv',        label: 'Kranken (PKV)',         beschreibung: 'PKV-Vollversicherung, BAP, Bestandsprovision' },
  { id: 'gkvzusatz',  label: 'Kranken (GKV-Zusatz)',  beschreibung: 'Ambulant-, Zahn-, stationäre Zusatztarife' },
  { id: 'sach',       label: 'Sach / HUK',            beschreibung: 'Wohngebäude, Hausrat, Haftpflicht, KFZ' },
  { id: 'unfall',     label: 'Unfall',                beschreibung: 'Private Unfallversicherung, Extremsport-Module' },
  { id: 'gewerbe',    label: 'Gewerbe',               beschreibung: 'Gewerbe-Pakete, D&O, Betriebshaftpflicht' },
  { id: 'eskalation', label: 'Eskalation / Auffälligkeiten', beschreibung: 'Systemisch erkannte Muster, Cluster-Vorgänge, orange/rote KI-Bewertungen' },
];

const INITIAL_SEGMENT_ROUTING = {
  leben:      { primaer: 'lisa',   vertretung: 'julia',  aktiv: true },
  pkv:        { primaer: 'tobias', vertretung: 'lisa',   aktiv: true },
  gkvzusatz:  { primaer: 'tobias', vertretung: 'sandra', aktiv: true },
  sach:       { primaer: 'sandra', vertretung: 'julia',  aktiv: true },
  unfall:     { primaer: 'sandra', vertretung: 'julia',  aktiv: true },
  gewerbe:    { primaer: 'marco',  vertretung: 'julia',  aktiv: true },
  eskalation: { primaer: 'marco',  vertretung: 'lisa',   aktiv: true },
};

const INITIAL_VERTRETUNGEN = {
  lisa:   { vertretung: 'julia',  automatisch: true,  modus: 'Bei Urlaub und Krankheit' },
  tobias: { vertretung: 'sandra', automatisch: true,  modus: 'Bei Urlaub und Krankheit' },
  sandra: { vertretung: 'julia',  automatisch: true,  modus: 'Nur bei Abwesenheit > 1 Tag' },
  marco:  { vertretung: 'lisa',   automatisch: false, modus: 'Manuell delegiert' },
  julia:  { vertretung: 'lisa',   automatisch: true,  modus: 'Bei Urlaub und Krankheit' },
};

const VERTRETUNGS_MODI = [
  'Bei Urlaub und Krankheit',
  'Nur bei Urlaub',
  'Nur bei Krankheit',
  'Nur bei Abwesenheit > 1 Tag',
  'Manuell delegiert',
];

// Kalender-Zeitraum: 2 Wochen Mo–Fr ab dem aktuellen Montag.
function getKalenderTage() {
  const heute = new Date();
  const day = heute.getDay() || 7; // So=7, Mo=1
  const montag = new Date(heute);
  montag.setDate(heute.getDate() - (day - 1));
  const tage = [];
  for (let w = 0; w < 2; w += 1) {
    for (let d = 0; d < 5; d += 1) {
      const dt = new Date(montag);
      dt.setDate(montag.getDate() + w * 7 + d);
      tage.push(dt);
    }
  }
  return tage;
}

const STATUS_ORDER = ['verfuegbar', 'reduziert', 'homeoffice', 'urlaub', 'krank'];
const STATUS_META = {
  verfuegbar: { label: 'Verfügbar',   cls: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  reduziert:  { label: 'Reduziert',   cls: 'bg-amber-100 text-amber-700 border-amber-300' },
  homeoffice: { label: 'Homeoffice',  cls: 'bg-blue-100 text-blue-700 border-blue-300' },
  urlaub:     { label: 'Urlaub',      cls: 'bg-slate-200 text-slate-500 border-slate-300' },
  krank:      { label: 'Krank',       cls: 'bg-red-100 text-red-700 border-red-300' },
};

function initialKalender(tage) {
  const out = {};
  SACHBEARBEITER.forEach(sb => {
    out[sb.id] = tage.map((d, i) => {
      const tag = d.getDay();
      const wochenIndex = Math.floor(i / 5);
      if (sb.id === 'sandra' && wochenIndex === 1) return 'urlaub';
      if (sb.id === 'marco' && tag === 4) return 'homeoffice';
      if (sb.id === 'julia' && tag === 5) return 'reduziert';
      if (sb.id === 'tobias' && wochenIndex === 0 && tag === 3) return 'homeoffice';
      if (sb.id === 'lisa' && wochenIndex === 1 && tag === 1) return 'krank';
      return 'verfuegbar';
    });
  });
  return out;
}

const nameOf = (id) => SACHBEARBEITER.find(s => s.id === id)?.name || '—';

export default function AdminView() {
  const [routing, setRouting] = useState(INITIAL_SEGMENT_ROUTING);
  const [vertretungen, setVertretungen] = useState(INITIAL_VERTRETUNGEN);
  const tage = getKalenderTage();
  const [kalender, setKalender] = useState(() => initialKalender(tage));

  const updateRouting = (segId, field, value) => {
    setRouting(prev => ({ ...prev, [segId]: { ...prev[segId], [field]: value } }));
  };

  const updateVertretung = (sbId, field, value) => {
    setVertretungen(prev => ({ ...prev, [sbId]: { ...prev[sbId], [field]: value } }));
  };

  const cycleStatus = (sbId, tagIndex) => {
    setKalender(prev => {
      const curr = prev[sbId][tagIndex];
      const nextStatus = STATUS_ORDER[(STATUS_ORDER.indexOf(curr) + 1) % STATUS_ORDER.length];
      const neueReihe = [...prev[sbId]];
      neueReihe[tagIndex] = nextStatus;
      return { ...prev, [sbId]: neueReihe };
    });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      {/* Intro */}
      <div className="mb-2">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <Workflow size={16} className="text-slate-600" strokeWidth={1.75} />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">Admin — Routing, Vertretungen &amp; Verfügbarkeiten</h2>
        </div>
        <p className="text-sm text-slate-500">
          Steuern Sie, welche Sachbearbeiter:in welches Segment bearbeitet, hinterlegen Sie Vertretungsregelungen und pflegen Sie den Verfügbarkeitskalender.
        </p>
      </div>

      {/* Team-Übersicht */}
      <div className="card-base p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users size={16} className="text-slate-500" strokeWidth={1.75} />
          <h3 className="text-sm font-semibold text-slate-800">Team Provisionsservice</h3>
          <span className="text-xs text-slate-400">({SACHBEARBEITER.length} Mitarbeitende)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {SACHBEARBEITER.map(sb => (
            <div key={sb.id} className="border border-slate-200 rounded-lg p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <User size={20} className="text-slate-400" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800 truncate">{sb.name}</p>
                <p className="text-xs text-slate-500">{sb.rolle}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  Skills: {sb.skills.join(', ')}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Kap./Tag</p>
                <p className="text-sm font-mono font-semibold text-slate-700">{sb.kapazitaet}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Routing nach Segmenten */}
      <div className="card-base p-5">
        <div className="flex items-center gap-2 mb-4">
          <Workflow size={16} className="text-slate-500" strokeWidth={1.75} />
          <h3 className="text-sm font-semibold text-slate-800">Routing nach Segmenten</h3>
          <span className="text-xs text-slate-400">
            ({Object.values(routing).filter(r => r.aktiv).length} von {SEGMENTE.length} aktiv)
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Eingehende Reklamationen werden anhand ihrer Sparte automatisch dem hinterlegten Primär-Sachbearbeiter zugewiesen. Ist diese Person nicht verfügbar, übernimmt die Vertretung.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="text-left py-2 pr-3 font-medium w-[200px]">Segment</th>
                <th className="text-left py-2 pr-3 font-medium">Beschreibung</th>
                <th className="text-left py-2 pr-3 font-medium">Primär zuständig</th>
                <th className="text-left py-2 pr-3 font-medium">Vertretung</th>
                <th className="text-left py-2 font-medium">Aktiv</th>
              </tr>
            </thead>
            <tbody>
              {SEGMENTE.map(seg => {
                const r = routing[seg.id];
                return (
                  <tr key={seg.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                        {seg.label}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-slate-500 max-w-[320px]">{seg.beschreibung}</td>
                    <td className="py-2 pr-3">
                      <select
                        value={r.primaer}
                        onChange={(e) => updateRouting(seg.id, 'primaer', e.target.value)}
                        className="px-2 py-1 border border-slate-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        {SACHBEARBEITER.map(sb => <option key={sb.id} value={sb.id}>{sb.name}</option>)}
                      </select>
                    </td>
                    <td className="py-2 pr-3">
                      <select
                        value={r.vertretung}
                        onChange={(e) => updateRouting(seg.id, 'vertretung', e.target.value)}
                        className="px-2 py-1 border border-slate-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        {SACHBEARBEITER.map(sb => <option key={sb.id} value={sb.id}>{sb.name}</option>)}
                      </select>
                    </td>
                    <td className="py-2">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={r.aktiv}
                          onChange={(e) => updateRouting(seg.id, 'aktiv', e.target.checked)}
                          className="rounded border-slate-300"
                        />
                        <span className={r.aktiv ? 'text-emerald-700' : 'text-slate-400'}>
                          {r.aktiv ? 'aktiv' : 'deaktiviert'}
                        </span>
                      </label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vertretungsregelungen */}
      <div className="card-base p-5">
        <div className="flex items-center gap-2 mb-4">
          <UserCheck size={16} className="text-slate-500" strokeWidth={1.75} />
          <h3 className="text-sm font-semibold text-slate-800">Vertretungsregelungen</h3>
          <span className="text-xs text-slate-400">(persönliche Abwesenheitsvertretung pro Mitarbeitende:r)</span>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Pro Person wird hinterlegt, wer im Abwesenheitsfall die offenen Vorgänge übernimmt und ob die Umleitung automatisch aus dem Kalender gezogen wird.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="text-left py-2 pr-3 font-medium">Mitarbeiter:in</th>
                <th className="text-left py-2 pr-3 font-medium">Vertretung</th>
                <th className="text-left py-2 pr-3 font-medium">Auslöser</th>
                <th className="text-left py-2 font-medium">Automatisch umleiten</th>
              </tr>
            </thead>
            <tbody>
              {SACHBEARBEITER.map(sb => {
                const v = vertretungen[sb.id];
                return (
                  <tr key={sb.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                          <User size={14} className="text-slate-400" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-slate-700 font-medium">{sb.name}</p>
                          <p className="text-[10px] text-slate-400">{sb.rolle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 pr-3">
                      <select
                        value={v.vertretung}
                        onChange={(e) => updateVertretung(sb.id, 'vertretung', e.target.value)}
                        className="px-2 py-1 border border-slate-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        {SACHBEARBEITER.filter(s => s.id !== sb.id).map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 pr-3">
                      <select
                        value={v.modus}
                        onChange={(e) => updateVertretung(sb.id, 'modus', e.target.value)}
                        className="px-2 py-1 border border-slate-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        {VERTRETUNGS_MODI.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </td>
                    <td className="py-2">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={v.automatisch}
                          onChange={(e) => updateVertretung(sb.id, 'automatisch', e.target.checked)}
                          className="rounded border-slate-300"
                        />
                        <span className={v.automatisch ? 'text-emerald-700' : 'text-slate-400'}>
                          {v.automatisch ? 'automatisch aktiv' : 'nur manuell'}
                        </span>
                      </label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-slate-400 mt-3">
          Aus der Kombination von Verfügbarkeitskalender + Vertretung ergibt sich die tatsächliche Zuweisung neuer Vorgänge. Beispiel:
          Ist <span className="font-medium">{nameOf('lisa')}</span> krank, erhalten Leben-Reklamationen automatisch <span className="font-medium">{nameOf(vertretungen.lisa.vertretung)}</span>.
        </p>
      </div>

      {/* Verfügbarkeitskalender */}
      <div className="card-base p-5">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays size={16} className="text-slate-500" strokeWidth={1.75} />
          <h3 className="text-sm font-semibold text-slate-800">Verfügbarkeitskalender</h3>
          <span className="text-xs text-slate-400">(nächste 2 Wochen, Mo–Fr · klicken zum Ändern)</span>
        </div>

        {/* Legende */}
        <div className="flex flex-wrap items-center gap-3 mb-3 text-[11px]">
          {STATUS_ORDER.map(s => (
            <span key={s} className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded border', STATUS_META[s].cls)}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {STATUS_META[s].label}
            </span>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="text-left py-2 pr-3 font-medium text-slate-500 sticky left-0 bg-white">Mitarbeitende</th>
                {tage.map((d, i) => (
                  <th
                    key={i}
                    className={clsx(
                      'px-1 py-2 text-center font-medium text-slate-500 min-w-[72px]',
                      i === 4 && 'border-r border-slate-200'
                    )}
                  >
                    <div>{d.toLocaleDateString('de-DE', { weekday: 'short' })}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SACHBEARBEITER.map(sb => (
                <tr key={sb.id} className="border-t border-slate-100">
                  <td className="py-2 pr-3 text-slate-700 font-medium sticky left-0 bg-white">
                    {sb.name}
                    <div className="text-[10px] text-slate-400 font-normal">{sb.rolle}</div>
                  </td>
                  {kalender[sb.id].map((status, i) => {
                    const meta = STATUS_META[status];
                    return (
                      <td
                        key={i}
                        className={clsx('px-1 py-1 text-center', i === 4 && 'border-r border-slate-200')}
                      >
                        <button
                          type="button"
                          onClick={() => cycleStatus(sb.id, i)}
                          className={clsx(
                            'inline-flex items-center justify-center w-full px-1.5 py-1 rounded border text-[10px] font-medium transition-colors hover:opacity-80',
                            meta.cls
                          )}
                          title={`${sb.name} — ${meta.label}`}
                        >
                          {meta.label}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
