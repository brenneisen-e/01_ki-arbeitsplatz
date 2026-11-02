import { useState } from 'react';
import {
  Calculator, RotateCcw, ChevronDown, Info, TrendingUp, TrendingDown,
  Sigma, Pencil, PlayCircle, ClipboardCheck,
} from 'lucide-react';
import { clsx } from 'clsx';
import {
  ANNAHMEN_DEFAULT, ANNAHMEN_DEFS, ART_ORDER, ART_RAMPE,
  AUSFUEHRUNG_MAP, KONTROLL_TURNUS_LABEL, bucketAufwand,
} from '../../data/istAnalyse';

const nf0 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 });

/** Ein überschreibbarer Zahlenwert: Slider + Rücksetzer. */
function AnnahmeRegler({ label, hilfe, wert, standard, def, onChange }) {
  const geaendert = wert !== standard;
  const anteil = ((wert - def.min) / (def.max - def.min)) * 100;
  return (
    <div className={clsx('rounded-xl border p-3 transition-colors',
      geaendert ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200 bg-white')}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex items-center gap-1.5">
          <span className="text-[12px] font-semibold text-slate-700 leading-tight">{label}</span>
          {hilfe && (
            <span title={hilfe} className="text-slate-300 hover:text-slate-500 cursor-help shrink-0">
              <Info size={12} />
            </span>
          )}
        </div>
        {geaendert && (
          <button onClick={() => onChange(standard)} title={`Auf Standard zurücksetzen (${nf2.format(standard)}${def.einheit})`}
                  className="text-amber-700 hover:text-amber-900 shrink-0 -mt-0.5">
            <RotateCcw size={13} />
          </button>
        )}
      </div>
      <div className="flex items-baseline gap-1 mt-1.5">
        <span className="text-[22px] font-bold leading-none text-slate-800">{nf2.format(wert)}</span>
        <span className="text-[12px] text-slate-500">{def.einheit.trim()}</span>
        {geaendert && (
          <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
            überschrieben
          </span>
        )}
      </div>
      <input
        type="range" min={def.min} max={def.max} step={def.step} value={wert}
        onChange={(e) => onChange(Number(e.target.value))} aria-label={label}
        className="w-full h-1.5 mt-2 appearance-none rounded-full cursor-pointer accent-emerald-700"
        style={{ background: `linear-gradient(to right, var(--mode-primary, #0F4D2A) ${anteil}%, #E2E8F0 ${anteil}%)` }}
      />
      {geaendert && <div className="text-[10.5px] text-slate-500 mt-1.5">Standard: {nf2.format(standard)}{def.einheit}</div>}
    </div>
  );
}

/** Kompakt editierbare Zelle für die Turnus-/Art-Tabellen. */
function AnnahmeZelle({ label, wert, standard, def, onChange, farbe }) {
  const geaendert = wert !== standard;
  return (
    <div className={clsx('rounded-lg border px-2.5 py-2 transition-colors',
      geaendert ? 'border-amber-300 bg-amber-50/50' : 'border-slate-200 bg-white')}>
      <div className="flex items-center gap-1.5 mb-1">
        {farbe && <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: farbe }} />}
        <span className="text-[10.5px] font-semibold text-slate-500 leading-tight truncate" title={label}>{label}</span>
        {geaendert && (
          <button onClick={() => onChange(standard)} title="Zurücksetzen" className="ml-auto text-amber-700 hover:text-amber-900 shrink-0">
            <RotateCcw size={11} />
          </button>
        )}
      </div>
      <input
        type="number" min={def.min} max={def.max} step={def.step} value={wert}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (Number.isFinite(v)) onChange(Math.min(def.max, Math.max(def.min, v)));
        }}
        aria-label={label}
        className="w-full text-[15px] font-bold text-slate-800 tabular-nums bg-transparent border-0 p-0 focus:outline-none focus:ring-0"
      />
    </div>
  );
}

function Tabelle({ defKey, keys, labelFn, farbeFn, annahmen, setAnnahmeDetail, spalten }) {
  const def = ANNAHMEN_DEFS[defKey];
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-[12px] font-semibold text-slate-700">{def.label}</span>
        <span title={def.hilfe} className="text-slate-300 hover:text-slate-500 cursor-help"><Info size={12} /></span>
      </div>
      <div className={clsx('grid gap-2', spalten)}>
        {keys.map(k => (
          <AnnahmeZelle
            key={k}
            label={labelFn(k)}
            farbe={farbeFn?.(k)}
            def={def}
            wert={annahmen[defKey][k]}
            standard={ANNAHMEN_DEFAULT[defKey][k]}
            onChange={(v) => setAnnahmeDetail(defKey, k, v)}
          />
        ))}
      </div>
    </div>
  );
}

const TURNUS_KEYS = Object.keys(ANNAHMEN_DEFAULT.stichprobe);

export default function AufwandHerleitung({
  istAnalyse, istAnalyseStandard, annahmen, setAnnahme, setAnnahmeDetail, resetAnnahmen, annahmenGeaendert,
}) {
  const [offen, setOffen] = useState(true);
  const [tab, setTab] = useState('durchfuehrung');

  const g = istAnalyse.gesamt;
  const delta = g.pt - istAnalyseStandard.gesamt.pt;

  // Rechenbeispiel: der grösste Bucket des aufwandsstärksten Bereichs.
  const bBereich = [...istAnalyse.bereiche].sort((a, b) => b.pt - a.pt)[0];
  const bBucket = [...bBereich.buckets].sort((a, b) => b.anzahl - a.anzahl)[0];
  const r = bucketAufwand(bBucket, annahmen);
  const df = r.durchfuehrung;
  const ts = r.testing;

  const beispielKopf = (
    <div className="flex items-center gap-2 mb-2 flex-wrap">
      <Sigma size={13} className="text-slate-400" />
      <span className="text-[11.5px] font-semibold text-slate-700">Beispielrechnung</span>
      <span className="text-[11px] text-slate-500">
        {bBereich.name} · {AUSFUEHRUNG_MAP[bBucket.art]?.label} · {KONTROLL_TURNUS_LABEL[bBucket.turnus]}
      </span>
      <span className="chip" style={{ padding: '0.05rem 0.4rem' }}>
        {nf0.format(bBucket.anzahl)} Kontrollen, davon {nf0.format(bBucket.schluessel)} Schlüssel
      </span>
    </div>
  );

  return (
    <div className="card-base">
      <button onClick={() => setOffen(o => !o)}
              className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white"
             style={{ background: 'var(--mode-gradient, linear-gradient(135deg,#0F4D2A,#1D7B3F))' }}>
          <Calculator size={20} strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-bold tracking-tight flex items-center gap-2 flex-wrap">
            Herleitung des Aufwands
            {annahmenGeaendert && (
              <span className="text-[9.5px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                Annahmen angepasst
              </span>
            )}
          </div>
          <p className="text-[12px] text-slate-500 mt-0.5">
            KI-basierte Schätzung für Kontrolldurchführung und Kontrolltesting. Jede Annahme ist überschreibbar.
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[22px] font-bold leading-none text-slate-800">
            {nf0.format(g.pt)}<span className="text-[13px] text-slate-400 font-semibold"> PT</span>
          </div>
          {annahmenGeaendert && Math.abs(delta) >= 0.5 ? (
            <div className={clsx('text-[11px] font-semibold mt-1 inline-flex items-center gap-1', delta > 0 ? 'text-red-700' : 'text-emerald-700')}>
              {delta > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {delta > 0 ? '+' : '−'}{nf0.format(Math.abs(delta))} PT vs. Standard
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 mt-1">
              {nf0.format(g.durchfuehrungPT)} + {nf0.format(g.testingPT)} PT
            </div>
          )}
        </div>
        <ChevronDown size={18} className={clsx('text-slate-400 transition-transform shrink-0', offen && 'rotate-180')} />
      </button>

      {offen && (
        <div className="border-t border-slate-200">
          {/* Umschalter zwischen den beiden Aufwandsarten */}
          <div className="px-5 pt-4 flex items-center gap-2 flex-wrap">
            {[
              { id: 'durchfuehrung', label: 'Kontrolldurchführung', icon: PlayCircle, pt: g.durchfuehrungPT, sub: '1st Line, laufender Betrieb' },
              { id: 'testing', label: 'Kontrolltesting', icon: ClipboardCheck, pt: g.testingPT, sub: 'Wirksamkeitsnachweis' },
            ].map(t => {
              const Icon = t.icon;
              const aktiv = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} aria-pressed={aktiv}
                        className={clsx('flex items-center gap-2.5 rounded-xl border-2 px-3.5 py-2.5 transition-all text-left',
                          aktiv ? 'shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300')}
                        style={aktiv ? {
                          borderColor: 'var(--mode-primary, #0F4D2A)',
                          background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 6%, white)',
                        } : undefined}>
                  <Icon size={17} style={{ color: aktiv ? 'var(--mode-primary, #0F4D2A)' : '#94A3B8' }} />
                  <span>
                    <span className="block text-[12.5px] font-bold text-slate-800 leading-tight">{t.label}</span>
                    <span className="block text-[11px] text-slate-500">{t.sub}</span>
                  </span>
                  <span className="text-[15px] font-bold tabular-nums ml-2"
                        style={{ color: aktiv ? 'var(--mode-primary, #0F4D2A)' : '#64748B' }}>
                    {nf0.format(t.pt)}<span className="text-[11px] font-semibold"> PT</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Rechenweg + Beispiel */}
          <div className="px-5 py-4 mt-3 bg-slate-50/70 border-y border-slate-200">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5">Rechenweg</div>

            {tab === 'durchfuehrung' ? (
              <>
                <div className="space-y-1.5 text-[12.5px] text-slate-700 font-mono leading-relaxed">
                  <div><span className="text-slate-400">1</span>{'  '}Zeit je Ausführung = Minuten je Ausführung × Faktor Ausführungsart</div>
                  <div><span className="text-slate-400">2</span>{'  '}Stunden je Kontrolle = Ausführungen je Jahr × Zeit je Ausführung ÷ 60</div>
                  <div><span className="text-slate-400">3</span>{'  '}Durchführung in PT = Summe Stunden ÷ Stunden je Personentag</div>
                </div>
                <div className="mt-3.5 rounded-xl border border-slate-200 bg-white p-3.5">
                  {beispielKopf}
                  <div className="space-y-1 text-[12px] font-mono text-slate-600">
                    <div>
                      Zeit je Ausführung{'  '}= {nf0.format(df.minutenJeAusfuehrung)} Min. × {nf2.format(df.faktor)}
                      {'  '}= <span className="font-semibold text-slate-800">{nf1.format(df.minutenJeAusfuehrung * df.faktor)} Min.</span>
                    </div>
                    <div>
                      × {nf0.format(df.ausfuehrungen)} Ausführungen ÷ 60
                      {'  '}= <span className="font-semibold text-slate-800">{nf1.format(df.stdJeKontrolle)} Std. je Kontrolle</span>
                    </div>
                    <div>
                      × {nf0.format(bBucket.anzahl)} Kontrollen
                      {'  '}= <span className="font-semibold text-slate-800">{nf0.format(df.gesamtStd)} Std.</span>
                    </div>
                    <div className="pt-1.5 mt-1 border-t border-slate-200">
                      ÷ {nf1.format(annahmen.stundenProPT)} Std./PT{'  '}=
                      <span className="font-bold text-[13px] ml-1" style={{ color: 'var(--mode-primary, #0F4D2A)' }}>
                        {nf1.format(df.gesamtStd / annahmen.stundenProPT)} PT
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5 text-[12.5px] text-slate-700 font-mono leading-relaxed">
                  <div><span className="text-slate-400">1</span>{'  '}Aufwand je Kontrolle = (Stichprobenumfang × Minuten je Stichprobe) ÷ 60 + Grundaufwand</div>
                  <div><span className="text-slate-400">2</span>{'  '}Zuschlag Schlüsselkontrollen = Aufwand je Kontrolle × Zuschlagssatz × Anzahl Schlüsselkontrollen</div>
                  <div><span className="text-slate-400">3</span>{'  '}Testing in PT = Summe Stunden ÷ Stunden je Personentag</div>
                </div>
                <div className="mt-3.5 rounded-xl border border-slate-200 bg-white p-3.5">
                  {beispielKopf}
                  <div className="space-y-1 text-[12px] font-mono text-slate-600">
                    <div>
                      Test je Kontrolle{'  '}= {nf0.format(ts.stichprobe)} × {nf0.format(ts.minutenJeStichprobe)} Min. ÷ 60
                      {'  '}= <span className="font-semibold text-slate-800">{nf1.format(ts.testStd)} Std.</span>
                    </div>
                    <div>
                      + Grundaufwand{'   '}= {nf1.format(annahmen.grundaufwandStd)} Std.
                      {'  '}→ <span className="font-semibold text-slate-800">{nf1.format(ts.stdJeKontrolle)} Std. je Kontrolle</span>
                    </div>
                    <div>
                      × {nf0.format(bBucket.anzahl)} Kontrollen{'  '}= <span className="font-semibold text-slate-800">{nf0.format(ts.basisStd)} Std.</span>
                    </div>
                    <div>
                      + Zuschlag{'  '}{nf0.format(bBucket.schluessel)} Schlüsselkontrollen × {nf0.format(annahmen.schluesselZuschlagProzent)} %
                      {'  '}= <span className="font-semibold text-slate-800">{nf0.format(ts.zuschlagStd)} Std.</span>
                    </div>
                    <div className="pt-1.5 mt-1 border-t border-slate-200">
                      = {nf0.format(ts.gesamtStd)} Std. ÷ {nf1.format(annahmen.stundenProPT)} Std./PT{'  '}=
                      <span className="font-bold text-[13px] ml-1" style={{ color: 'var(--mode-primary, #0F4D2A)' }}>
                        {nf1.format(ts.gesamtStd / annahmen.stundenProPT)} PT
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Annahmen */}
          <div className="px-5 py-4 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Pencil size={13} className="text-slate-400" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Annahmen — direkt überschreibbar
                </span>
              </div>
              {annahmenGeaendert && (
                <button onClick={resetAnnahmen}
                        className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg px-2.5 py-1 transition-colors hover:bg-slate-50">
                  <RotateCcw size={12} /> Alle Annahmen zurücksetzen
                </button>
              )}
            </div>

            {tab === 'durchfuehrung' ? (
              <>
                <Tabelle
                  defKey="ausfuehrungenProJahr" keys={TURNUS_KEYS}
                  labelFn={(k) => KONTROLL_TURNUS_LABEL[k] || k}
                  annahmen={annahmen} setAnnahmeDetail={setAnnahmeDetail}
                  spalten="grid-cols-2 sm:grid-cols-4 lg:grid-cols-7"
                />
                <Tabelle
                  defKey="minutenJeAusfuehrung" keys={TURNUS_KEYS}
                  labelFn={(k) => KONTROLL_TURNUS_LABEL[k] || k}
                  annahmen={annahmen} setAnnahmeDetail={setAnnahmeDetail}
                  spalten="grid-cols-2 sm:grid-cols-4 lg:grid-cols-7"
                />
                <Tabelle
                  defKey="artFaktor" keys={ART_ORDER}
                  labelFn={(k) => AUSFUEHRUNG_MAP[k]?.label || k}
                  farbeFn={(k) => ART_RAMPE[k]}
                  annahmen={annahmen} setAnnahmeDetail={setAnnahmeDetail}
                  spalten="grid-cols-2 sm:grid-cols-4"
                />
              </>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-3">
                  {['grundaufwandStd', 'schluesselZuschlagProzent'].map(key => (
                    <AnnahmeRegler
                      key={key} label={ANNAHMEN_DEFS[key].label} hilfe={ANNAHMEN_DEFS[key].hilfe}
                      def={ANNAHMEN_DEFS[key]} wert={annahmen[key]} standard={ANNAHMEN_DEFAULT[key]}
                      onChange={(v) => setAnnahme(key, v)}
                    />
                  ))}
                </div>
                <Tabelle
                  defKey="stichprobe" keys={TURNUS_KEYS}
                  labelFn={(k) => KONTROLL_TURNUS_LABEL[k] || k}
                  annahmen={annahmen} setAnnahmeDetail={setAnnahmeDetail}
                  spalten="grid-cols-2 sm:grid-cols-4 lg:grid-cols-7"
                />
                <Tabelle
                  defKey="minutenJeStichprobe" keys={ART_ORDER}
                  labelFn={(k) => AUSFUEHRUNG_MAP[k]?.label || k}
                  farbeFn={(k) => ART_RAMPE[k]}
                  annahmen={annahmen} setAnnahmeDetail={setAnnahmeDetail}
                  spalten="grid-cols-2 sm:grid-cols-4"
                />
              </>
            )}

            <div className="pt-1 border-t border-slate-100">
              <div className="grid sm:grid-cols-3 gap-3 pt-3">
                <AnnahmeRegler
                  label={ANNAHMEN_DEFS.stundenProPT.label} hilfe={ANNAHMEN_DEFS.stundenProPT.hilfe}
                  def={ANNAHMEN_DEFS.stundenProPT} wert={annahmen.stundenProPT} standard={ANNAHMEN_DEFAULT.stundenProPT}
                  onChange={(v) => setAnnahme('stundenProPT', v)}
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Änderungen wirken sofort auf alle Kennzahlen, Balken und die Bereichstabelle. Die Annahmen bleiben für diese
              Sitzung gespeichert und gelten auch im Optimizer.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
