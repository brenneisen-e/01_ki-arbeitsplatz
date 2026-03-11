import Card from '../../../components/ui/Card';
import DonutChart from '../../../components/charts/DonutChart';
import { formatEur, berechneHaushaltsnetto, berechneFrei } from '../../../utils/formatters';

export default function FinanzprofilTab({ kunde }) {
  const transaktionen = kunde.transaktionen || [];
  const einnahmen = transaktionen.filter(t => t.betrag > 0);
  const ausgaben = transaktionen.filter(t => t.betrag < 0);
  const totalEin = einnahmen.reduce((s, t) => s + t.betrag, 0);
  const totalAus = ausgaben.reduce((s, t) => s + Math.abs(t.betrag), 0);
  const frei = totalEin - totalAus;

  // Kategorien fuer Donut
  const kategorieMap = {};
  ausgaben.forEach(t => {
    const kat = kategorieLabel(t.kategorie);
    kategorieMap[kat] = (kategorieMap[kat] || 0) + Math.abs(t.betrag);
  });
  if (frei > 0) kategorieMap['Frei'] = frei;

  const donutData = Object.entries(kategorieMap).map(([name, value]) => ({ name, value }));
  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#6b7280', '#14b8a6', '#f97316', '#a855f7', '#ef4444', '#06b6d4'];

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Einnahmen / Ausgaben */}
      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">Einnahmen & Ausgaben</h3>

        <div className="mb-4">
          <div className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
            <span>Einnahmen</span>
            <span className="font-mono text-emerald-600">{formatEur(totalEin)}</span>
          </div>
          <div className="border-t border-slate-200 pt-2 space-y-1.5">
            {einnahmen.map((t, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-slate-500">{kategorieLabel(t.kategorie)}</span>
                <span className="font-mono text-slate-700">{formatEur(t.betrag)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
            <span>Ausgaben</span>
            <span className="font-mono text-red-500">{formatEur(totalAus)}</span>
          </div>
          <div className="border-t border-slate-200 pt-2 space-y-1.5">
            {ausgaben.map((t, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-slate-500">{kategorieLabel(t.kategorie)}</span>
                <span className="font-mono text-slate-700">{formatEur(Math.abs(t.betrag))}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t-2 border-slate-300 pt-3">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-slate-800">FREI VERFUEGBAR</span>
            <span className={`font-mono ${frei >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{formatEur(frei)}</span>
          </div>
        </div>
      </Card>

      {/* Donut Ausgabenverteilung */}
      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">Ausgaben-Verteilung</h3>
        <DonutChart
          data={donutData}
          height={260}
          centerValue={formatEur(totalAus)}
          centerLabel="Ausgaben"
          colors={COLORS}
        />
        <div className="mt-4 space-y-1.5">
          {donutData.map((d, i) => (
            <div key={d.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-slate-600">{d.name}</span>
              </div>
              <span className="font-mono text-slate-700">
                {((d.value / (totalAus + Math.max(0, frei))) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function kategorieLabel(kat) {
  const labels = {
    gehalt: 'Gehalt',
    gehalt_partner: 'Gehalt Partner',
    kindergeld: 'Kindergeld',
    rente: 'Rente',
    rente_partner: 'Rente Partner',
    einkommen: 'Einkommen',
    gf_gehalt: 'GF-Gehalt',
    baufi: 'Baufinanzierung',
    miete: 'Miete',
    kredit: 'Kredit',
    versicherung_eigen: 'Versicherung (eigen)',
    versicherung_fremd: 'Versicherung (fremd)',
    versicherung: 'Versicherung',
    versicherung_firma: 'Versicherung Firma',
    sparplan: 'Sparplan',
    sparplan2: 'Sparplan 2',
    sparen: 'Sparen',
    kinder: 'Kinder',
    konsum: 'Konsum',
    mobilitaet: 'Mobilitaet',
    abos: 'Abos/Freizeit',
    haus: 'Haus/Nebenkosten',
    software: 'Software',
    geschaeft: 'Geschaeft',
  };
  return labels[kat] || kat;
}
