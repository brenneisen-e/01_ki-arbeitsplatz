import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { X, FileSignature, XCircle, User, ShieldCheck, Briefcase, Check, Loader2, Sparkles } from 'lucide-react';
import { vertragAus } from './vertrag';
import { FARBE, euro, euroKompakt, uhrzeit } from './format';

const euroCent = (v) => v.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

function Zeile({ label, wert, mono = false }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5 border-b border-slate-100 last:border-0 text-sm">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className={clsx('text-slate-800 text-right min-w-0', mono && 'font-mono')}>{wert}</span>
    </div>
  );
}

function Block({ Icon, titel, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <h4 className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase text-slate-500 mb-1">
        <Icon size={13} strokeWidth={2} /> {titel}
      </h4>
      {children}
    </section>
  );
}

/**
 * Der Vertrag zu einem Live-Eingang, als Fenster über Cockpit und Dashboard.
 * Esc und Klick daneben schließen nur das Fenster, nicht die Dashboard-Fläche.
 */
export default function VertragDetail({ e, onClose }) {
  const v = useMemo(() => (e ? vertragAus(e) : null), [e]);

  useEffect(() => {
    if (!e) return undefined;
    const taste = (ev) => {
      if (ev.key !== 'Escape') return;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      onClose();
    };
    window.addEventListener('keydown', taste, true);
    return () => window.removeEventListener('keydown', taste, true);
  }, [e, onClose]);

  if (!e || !v) return null;
  const storno = e.art === 'storno';
  const Icon = storno ? XCircle : FileSignature;
  const statusFarbe = storno ? FARBE.schlecht : v.status === 'Policiert' ? FARBE.gut : FARBE.warn;

  return createPortal(
    <div data-modal className="fixed inset-0 z-[70] flex items-center justify-center p-5">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label={`Vertrag ${v.vertragsNr}`}
        className="relative w-full max-w-[760px] max-h-[calc(100vh-40px)] overflow-y-auto rounded-2xl border border-slate-200 shadow-2xl animate-scale-in"
        style={{ background: '#f6f7f3' }}>
        <div className="px-6 pt-5 pb-4 bg-white border-b border-slate-200 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase" style={{ color: storno ? FARBE.schlecht : FARBE.modusHell }}>
              <Icon size={13} strokeWidth={2} /> {storno ? 'Storno' : 'Abschluss'} · Eingang {uhrzeit(e.zeit)}
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mt-1">{e.produkt} <span className="text-slate-400 font-normal">· {e.tarif}</span></h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              <span className="font-mono">{v.vertragsNr}</span>
              <span className="font-mono">{v.antragNr}</span>
              <span className="flex items-center gap-1.5 font-medium" style={{ color: statusFarbe }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusFarbe }} /> {v.status}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0" title="Schließen (Esc)">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Kennzahlen des Eingangs, dieselben wie im Live-Strom */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Jahresbeitrag', wert: euro(e.beitrag), ton: storno ? FARBE.schlecht : 'inherit', vorzeichen: storno ? '−' : '' },
              { label: 'Neugeschäft (bewertet)', wert: storno ? '–' : euroKompakt(e.ng), unter: storno ? 'entfällt' : 'Jahresbeitrag × 4' },
              { label: 'Provision', wert: storno ? '–' : euro(e.provision), unter: storno ? 'storniert' : v.faktor ? `${(v.faktor / 10).toLocaleString('de-DE')} Jahresbeiträge` : '' },
            ].map(k => (
              <div key={k.label} className="rounded-xl bg-white border border-slate-200 px-4 py-3">
                <div className="text-[11px] text-slate-500">{k.label}</div>
                <div className="font-mono text-lg font-semibold mt-0.5" style={{ color: k.ton === 'inherit' ? undefined : k.ton }}>{k.vorzeichen}{k.wert}</div>
                {k.unter && <div className="text-[11px] text-slate-400 mt-0.5">{k.unter}</div>}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Block Icon={User} titel="Versicherungsnehmer">
              <Zeile label="Name" wert={v.kunde} />
              <Zeile label="Geburtsdatum" wert={`${v.geburtsdatum} (${v.alter} Jahre)`} mono />
              <Zeile label="Region" wert={v.region} />
            </Block>
            <Block Icon={Briefcase} titel="Vertrieb">
              <Zeile label="Vermittler" wert={e.vermittler.name} />
              <Zeile label="Vermittlernummer" wert={e.vermittler.id} mono />
              <Zeile label="Vertriebsweg" wert={e.vertriebsweg} />
            </Block>
            <Block Icon={ShieldCheck} titel="Vertrag">
              <Zeile label="Sparte" wert={e.sparte} />
              <Zeile label="Tarif" wert={e.tarif} />
              <Zeile label={v.leistung.label} wert={v.leistung.wert} />
              <Zeile label="Beginn" wert={v.beginn} mono />
              <Zeile label="Laufzeit" wert={v.laufzeit} />
              <Zeile label="Zahlweise" wert={`${v.zahlweise} · ${euroCent(v.zahlbeitrag)}`} />
            </Block>
            <Block Icon={storno ? XCircle : FileSignature} titel="Bearbeitung">
              <ol className="mt-1 space-y-2">
                {v.verlauf.map((s) => (
                  <li key={s.titel} className="flex items-center gap-2.5 text-sm">
                    <span className={clsx('w-5 h-5 rounded-full flex items-center justify-center shrink-0', s.fertig ? 'text-white' : 'text-slate-500 bg-slate-100')}
                      style={s.fertig ? { background: FARBE.modusHell } : undefined}>
                      {s.fertig ? <Check size={12} strokeWidth={3} /> : <Loader2 size={12} className="animate-spin" />}
                    </span>
                    <span className={clsx('flex-1', s.fertig ? 'text-slate-800' : 'text-slate-500')}>{s.titel}</span>
                    <span className="font-mono text-xs text-slate-400">{s.zeit}</span>
                  </li>
                ))}
              </ol>
              {storno && (
                <p className="mt-3 text-xs text-slate-500">Grund: <span className="text-slate-700">{v.stornoGrund}</span></p>
              )}
            </Block>
          </div>

          <p className="flex items-start gap-2 text-xs text-slate-500">
            <Sparkles size={13} className="shrink-0 mt-0.5" style={{ color: FARBE.gold }} />
            {storno
              ? `Der Storno mindert das Tagesergebnis um ${euro(e.beitrag)} Jahresbeitrag; ${e.vermittler.name} ist zur Rückholung informiert.`
              : `Der Abschluss zählt mit ${euroKompakt(e.ng)} zum Neugeschäft des laufenden Monats und erscheint in allen Kacheln und Dashboards des Cockpits.`}
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
