import { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import Header from './components/Header';
import KPICard from './components/KPICard';
import KPIMatrix from './components/KPIMatrix';
import KPIDetailModal from './components/KPIDetailModal';
import AIKommentar from './components/AIKommentar';
import { BANKS, getBank } from './data/banks';
import { SEGMENTS, KPI_GROUPS, getReportDate } from './data/kpiData';
import { exportPpt } from './utils/pptExport';

function readBankId() {
  if (typeof window === 'undefined') return BANKS[0].id;
  try {
    return localStorage.getItem('banken_kpi_active') || BANKS[0].id;
  } catch {
    return BANKS[0].id;
  }
}

export default function App() {
  const [bankId, setBankId] = useState(readBankId);
  const [activeSegment, setActiveSegment] = useState('konzern');
  const [detail, setDetail] = useState(null);

  const bank = useMemo(() => getBank(bankId), [bankId]);
  const segment = SEGMENTS.find((s) => s.id === activeSegment) || SEGMENTS[0];

  function handleBankChange(id) {
    setBankId(id);
    try { localStorage.setItem('banken_kpi_active', id); } catch {}
  }

  async function handleExportPpt() {
    try {
      await exportPpt(bank);
    } catch (e) {
      console.error('PPT-Export fehlgeschlagen', e);
      alert('Fehler beim PowerPoint-Export: ' + e.message);
    }
  }

  function handleExportPdf() {
    window.print();
  }

  return (
    <div className="flex flex-col flex-1 min-w-[1024px]">
      <Header
        bank={bank}
        onBankChange={handleBankChange}
        activeSegment={activeSegment}
        onSegmentChange={setActiveSegment}
        onExportPpt={handleExportPpt}
        onExportPdf={handleExportPdf}
      />

      <main className="flex-1 px-6 py-6 space-y-6 max-w-[1600px] w-full mx-auto">
        <div>
          <h2 className="text-xl font-bold text-slate-800">KPI-Cockpit · {segment.label}</h2>
          <p className="text-sm text-slate-500">
            KPIs gemäß XYZ-Meldung mit 12-Monats-Verlauf, Plan-/Ist-Abweichungen und Ampelbewertung.
            Klick auf eine KPI-Kachel öffnet die Detailansicht inkl. KI-Erläuterung.
          </p>
        </div>

        {/* KPI Cards grouped */}
        {KPI_GROUPS.map((group) => (
          <section key={group.id}>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                {group.label}
              </h3>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {group.kpis.map((kpi, i) => (
                <KPICard
                  key={kpi.id}
                  kpi={kpi}
                  segmentId={activeSegment}
                  segmentLabel={segment.label}
                  bank={bank}
                  onExpand={setDetail}
                  delay={i * 60}
                />
              ))}
            </div>
          </section>
        ))}

        {/* Matrix */}
        <KPIMatrix activeSegment={activeSegment} onSelectSegment={setActiveSegment} />

        {/* AI Kommentar */}
        <AIKommentar bank={bank} />
      </main>

      <footer className="border-t border-slate-200 bg-white px-6 py-4">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Banken-KPI · Whitelabel-Demo · {bank.name} · DUMMY DATEN VERTRAULICH
          </div>
          <div className="flex items-center gap-3">
            <span>Datenstand: {getReportDate()}</span>
            <span className="w-px h-3 bg-slate-300" />
            <span>gem. XYZ-Meldung</span>
          </div>
        </div>
      </footer>

      {detail && (
        <KPIDetailModal data={detail} bank={bank} onClose={() => setDetail(null)} />
      )}
    </div>
  );
}
