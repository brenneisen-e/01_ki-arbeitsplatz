import { useState, useMemo } from 'react';
import { formatEuro } from '../../utils/formatters';

export default function ProvisionCalc() {
  const [sparte, setSparte] = useState('leben');
  const [beitrag, setBeitrag] = useState(150);
  const [laufzeit, setLaufzeit] = useState(35);
  const [satz, setSatz] = useState(40);

  const results = useMemo(() => {
    const mb = beitrag || 150;
    const lz = laufzeit || 35;
    const promille = satz || 40;
    let bws, abschluss, bestand, stornoRate;

    if (sparte === 'leben') {
      bws = mb * 12 * lz;
      abschluss = bws * promille / 1000;
      bestand = mb * 12 * 0.02;
      stornoRate = 0.15;
    } else if (sparte === 'pkv') {
      bws = mb * 7;
      abschluss = bws;
      bestand = mb * 12 * 0.02;
      stornoRate = 0.10;
    } else {
      bws = mb * 12;
      abschluss = bws * 0.05;
      bestand = mb * 12 * 0.20;
      stornoRate = 0;
    }

    const storno = abschluss * stornoRate;
    const netto = abschluss - storno;
    return { bws, abschluss, bestand, storno, netto };
  }, [sparte, beitrag, laufzeit, satz]);

  return (
    <div className="calculator my-6">
      <div className="text-base font-bold text-slate-900 mb-4">Provisionsrechner</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Sparte</label>
          <select
            value={sparte}
            onChange={e => setSparte(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
          >
            <option value="leben">Leben</option>
            <option value="pkv">PKV</option>
            <option value="sach">Komposit/Sach</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Monatsbeitrag (€)</label>
          <input
            type="number"
            value={beitrag}
            onChange={e => setBeitrag(Number(e.target.value))}
            min="10"
            max="5000"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Laufzeit (Jahre)</label>
          <input
            type="number"
            value={laufzeit}
            onChange={e => setLaufzeit(Number(e.target.value))}
            min="1"
            max="50"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Provisionssatz: <span className="font-mono">{satz}‰</span>
          </label>
          <input
            type="range"
            min="10"
            max="60"
            value={satz}
            onChange={e => setSatz(Number(e.target.value))}
            className="calc-slider w-full mt-1"
          />
        </div>
      </div>
      <div className="border-t border-slate-200 pt-4 space-y-2">
        {[
          { label: 'BWS', val: results.bws },
          { label: 'Abschlussprovision', val: results.abschluss, highlight: true },
          { label: 'Bestandsprovision/J.', val: results.bestand },
          { label: 'Storno-Einbehalt (15%)', val: results.storno },
          { label: 'Netto-Auszahlung', val: results.netto },
        ].map((row, i) => (
          <div key={i} className={`flex items-center justify-between py-1.5 ${row.highlight ? 'bg-emerald-50 rounded-lg px-3 -mx-3' : ''}`}>
            <span className="text-sm text-slate-600">{row.label}</span>
            <span className={`text-sm font-mono font-semibold ${row.highlight ? 'text-emerald-700' : 'text-slate-800'}`}>
              {formatEuro(row.val)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
