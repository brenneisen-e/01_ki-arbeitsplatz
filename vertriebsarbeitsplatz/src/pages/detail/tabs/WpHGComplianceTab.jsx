import { useMode } from '../../../hooks/useMode';
import { VV_WPHG, VV_PERFORMANCE } from '../../../data/vvExtended';
import { KUNDEN_BY_MODE } from '../../../data/index';
import { formatEur } from '../../../utils/formatters';
import { CheckCircle, AlertTriangle, Shield, FileText, TrendingDown, Receipt, Target, Leaf, Clock } from 'lucide-react';
import clsx from 'clsx';

// ─── Helper: format date DE ───
function fmtDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ─── Helper: days until date ───
function daysUntil(dateStr) {
  if (!dateStr) return Infinity;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ─── Status badge ───
function StatusBadge({ status }) {
  const isOk = status === 'vollstaendig' || status === 'aktuell' || status === 'bereitgestellt' || status === 'Geeignet' || status === 'geeignet';
  const isWarn = status === 'aktualisierung_noetig';
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
      isOk && 'bg-emerald-50 text-emerald-700',
      isWarn && 'bg-amber-50 text-amber-700',
      !isOk && !isWarn && 'bg-slate-100 text-slate-600',
    )}>
      {isOk && <CheckCircle size={12} />}
      {isWarn && <AlertTriangle size={12} />}
      {status === 'vollstaendig' ? 'Vollstaendig' : status === 'aktualisierung_noetig' ? 'Aktualisierung noetig' : status}
    </span>
  );
}

// ─── Experience checkmarks ───
function ErfahrungCheck({ label, value }) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border',
      value ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200',
    )}>
      {value ? <CheckCircle size={11} /> : <span className="w-[11px] h-[11px] rounded-full border border-slate-300" />}
      {label}
    </span>
  );
}

// ─── Info row ───
function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="flex justify-between items-start py-1.5">
      <span className="text-slate-400 text-sm flex items-center gap-1.5">
        {Icon && <Icon size={13} className="text-slate-400" />}
        {label}
      </span>
      <span className="text-slate-700 text-sm font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}

// ─── Verlustschwelle bar ───
function VerlustschwelleBar({ trigger, drawdown }) {
  const absDrawdown = Math.abs(drawdown);
  const absTrigger = Math.abs(trigger);
  const pct = absTrigger > 0 ? (absDrawdown / absTrigger) * 100 : 0;
  const color = pct < 50 ? 'bg-emerald-500' : pct < 75 ? 'bg-amber-500' : 'bg-red-500';
  const textColor = pct < 50 ? 'text-emerald-700' : pct < 75 ? 'text-amber-700' : 'text-red-700';

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-slate-500">
        <span>0%</span>
        <span className={clsx('font-semibold', textColor)}>Aktuell: {drawdown.toFixed(1)}%</span>
        <span className="font-medium text-red-600">Schwelle: {trigger}%</span>
      </div>
      <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
        {/* Trigger marker */}
        <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-red-500 z-10" />
        {/* Progress */}
        <div
          className={clsx('absolute left-0 top-0 bottom-0 rounded-full transition-all', color)}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-400">
        <span>Sicher</span>
        <span>50%</span>
        <span>75%</span>
        <span>Schwelle</span>
      </div>
    </div>
  );
}

// ─── Section card wrapper ───
function Section({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5" style={{ boxShadow: 'var(--card-shadow)' }}>
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon size={18} className="text-slate-500" strokeWidth={1.75} />}
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── Main component ───
export default function WpHGComplianceTab() {
  const { selectedKundeId, modeId } = useMode();
  const kunden = KUNDEN_BY_MODE[modeId] || [];
  const kunde = kunden.find(k => k.id === selectedKundeId);
  const wphg = VV_WPHG[selectedKundeId];
  const perf = VV_PERFORMANCE[selectedKundeId];

  if (!wphg || !kunde) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
        Keine WpHG-Daten fuer diesen Mandanten vorhanden.
      </div>
    );
  }

  const erfahrungLabels = {
    aktien: 'Aktien', anleihen: 'Anleihen', fonds: 'Fonds', pe: 'PE/Alternative',
    derivate: 'Derivate', krypto: 'Krypto',
  };

  const rl = wphg.anlagerichtlinie || {};
  const gp = wphg.geeignetheit || {};
  const ki = wphg.kosteninformation || {};
  const zm = wphg.zielmarktabgleich || {};
  const vs = perf?.verlustschwelle;

  const gpDaysLeft = daysUntil(gp.naechsterFaellig);
  const profilDaysLeft = daysUntil(wphg.naechsteFaelligkeit);

  return (
    <div className="space-y-4">
      {/* 1. WpHG-Bogen (Anlegerprofil) */}
      <Section title="WpHG-Bogen (Anlegerprofil)" icon={FileText}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Status</span>
            <StatusBadge status={wphg.status} />
          </div>
          <InfoRow label="Letzte Aktualisierung" value={fmtDate(wphg.letzteAktualisierung)} icon={Clock} />
          <InfoRow
            label="Naechste Faelligkeit"
            value={
              <span className="flex items-center gap-1.5">
                {fmtDate(wphg.naechsteFaelligkeit)}
                {profilDaysLeft < 60 && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full">
                    <AlertTriangle size={10} /> {profilDaysLeft} Tage
                  </span>
                )}
              </span>
            }
          />
          <InfoRow label="Risikoprofil" value={wphg.risikoprofil} />

          {/* Anlageerfahrung */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-400 mb-2 block">Anlageerfahrung</span>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(wphg.anlageerfahrung || {}).map(([key, val]) => (
                <ErfahrungCheck key={key} label={erfahrungLabels[key] || key} value={val} />
              ))}
            </div>
          </div>

          <InfoRow label="Anlageziel" value={wphg.anlageziel} />
          <InfoRow label="Anlagehorizont" value={wphg.anlagehorizont} />
          <InfoRow label="Verlusttoleranz" value={wphg.verlusttoleranz} />

          {/* ESG-Praeferenzen */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 mb-2">
              <Leaf size={13} className="text-emerald-500" />
              <span className="text-xs text-slate-400">ESG-Praeferenzen</span>
            </div>
            <div className="space-y-1.5 pl-5">
              <InfoRow label="SFDR" value={wphg.esgPraeferenzen?.sfdr || '-'} />
              <InfoRow label="Taxonomie" value={wphg.esgPraeferenzen?.taxonomie || '-'} />
              <InfoRow label="PAI" value={wphg.esgPraeferenzen?.pai ? 'Beruecksichtigt' : 'Nicht beruecksichtigt'} />
            </div>
          </div>

          {/* Anlagerichtlinie */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-400 mb-2 block">Anlagerichtlinie</span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Max. Aktien</span>
                <span className="text-slate-700 font-medium">{rl.maxAktien}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Min. Renten</span>
                <span className="text-slate-700 font-medium">{rl.minRenten}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Krypto</span>
                <span className="text-slate-700 font-medium">{rl.krypto}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Alternatives</span>
                <span className="text-slate-700 font-medium">{rl.alternatives}</span>
              </div>
            </div>
            {rl.benchmark && (
              <div className="mt-2 text-xs text-slate-400">
                Benchmark: <span className="text-slate-600">{rl.benchmark}</span>
              </div>
            )}
          </div>
        </div>
      </Section>

      <div className="grid grid-cols-2 gap-4">
        {/* 2. Geeignetheitspruefung */}
        <Section title="Geeignetheitspruefung" icon={Shield}>
          <div className="space-y-2">
            <InfoRow label="Letzter Bericht" value={gp.letzterBericht || '-'} />
            <InfoRow label="Erstellt" value={fmtDate(gp.erstellt)} />
            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-400 text-sm">Naechste Faelligkeit</span>
              <span className="flex items-center gap-1.5 text-sm font-medium">
                {fmtDate(gp.naechsterFaellig)}
                {gpDaysLeft < 60 && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full">
                    <AlertTriangle size={10} /> {gpDaysLeft}d
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-400 text-sm">Ergebnis</span>
              <StatusBadge status={gp.ergebnis} />
            </div>
          </div>
        </Section>

        {/* 3. Verlustschwelle */}
        <Section title="Verlustschwelle" icon={TrendingDown}>
          {vs ? (
            <div className="space-y-3">
              <VerlustschwelleBar trigger={vs.grenze} drawdown={vs.aktuell} />
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                <div className="text-center">
                  <div className="text-[10px] text-slate-400">Hoechststand</div>
                  <div className="text-sm font-mono font-semibold text-slate-700">
                    {kunde.aum ? formatEur(Math.round(kunde.aum / (1 + vs.aktuell / 100))) : '-'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-slate-400">Aktueller Stand</div>
                  <div className="text-sm font-mono font-semibold text-slate-700">
                    {kunde.aum ? formatEur(kunde.aum) : '-'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-slate-400">Trigger</div>
                  <div className="text-sm font-mono font-semibold text-red-600">{vs.grenze}%</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-400">Keine Verlustschwellendaten vorhanden.</div>
          )}
        </Section>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* 4. Kosteninformation */}
        <Section title="Kosteninformation" icon={Receipt}>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-400 text-sm">Ex-Ante</span>
              <span className="flex items-center gap-2 text-sm">
                <StatusBadge status={ki.exAnte?.status || '-'} />
                <span className="text-xs text-slate-400">{fmtDate(ki.exAnte?.datum)}</span>
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-400 text-sm">Ex-Post</span>
              <span className="flex items-center gap-2 text-sm">
                <StatusBadge status={ki.exPost?.status || '-'} />
                <span className="text-xs text-slate-400">{fmtDate(ki.exPost?.datum)}</span>
              </span>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <InfoRow label="Gesamtkosten" value={formatEur(ki.gesamtkosten)} />
              <InfoRow label="Kostenquote" value={ki.quote ? `${ki.quote.toFixed(2)}% p.a.` : '-'} />
            </div>
          </div>
        </Section>

        {/* 5. Zielmarktabgleich */}
        <Section title="Zielmarktabgleich" icon={Target}>
          <div className="space-y-2">
            <InfoRow label="Positionen geprueft" value={zm.positionen || '-'} />
            <InfoRow label="Konform" value={zm.konform || '-'} />
            {zm.letzterCheck && (
              <InfoRow label="Letzter Check" value={fmtDate(zm.letzterCheck)} />
            )}
            {(zm.konform != null && zm.positionen != null) && (
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {zm.konform === zm.positionen ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                      <CheckCircle size={12} /> Alle Positionen konform
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
                      <AlertTriangle size={12} /> {zm.positionen - zm.konform} nicht konform
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}
