import { useState, useMemo } from 'react';
import {
  GitCompareArrows, RefreshCw, Sparkles, ShieldCheck, FileSpreadsheet, Users,
  Clock, CircleSlash, Layers, AlertTriangle, CalendarCheck, Target,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useGapAnalyse } from '../../hooks/useGapAnalyse';
import {
  GAP_TYPEN, GAP_TYP_MAP, SZENARIO_MAP, getKritikalitaet, getKritMap,
} from '../../data/gapAnalyseAgent';
import GapCard from './GapCard';

const nf0 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });

function StatKachel({ icon: Icon, label, wert, einheit, zusatz, farbe }) {
  return (
    <div className="card-base p-4">
      <div className="flex items-center gap-2 text-slate-500 mb-2">
        <Icon size={14} strokeWidth={1.75} />
        <span className="text-[11.5px] font-semibold">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[26px] font-bold leading-none" style={{ color: farbe || '#1E293B' }}>{wert}</span>
        {einheit && <span className="text-[13px] text-slate-400 font-semibold">{einheit}</span>}
      </div>
      {zusatz && <div className="text-[11.5px] text-slate-500 mt-1.5 leading-snug">{zusatz}</div>}
    </div>
  );
}

/**
 * Abdeckungsgrad je Prozessbereich als Meter.
 * Eine Serie, deshalb keine Legende — Titel und Achse benennen, was geplottet
 * wird. Der ungefüllte Track ist eine hellere Stufe derselben Hue.
 */
function AbdeckungsMatrix({ abdeckung, sz }) {
  return (
    <div className="card-base">
      <div className="px-5 py-4 border-b border-slate-200">
        <h3 className="text-[15px] font-bold tracking-tight">Abdeckungsgrad der Zielstruktur je Prozessbereich</h3>
        <p className="text-[12px] text-slate-500 mt-0.5">
          {sz?.id === 'anlehnung'
            ? `Anteil der vom Konzernstandard geforderten Kontrollen, die die ${sz.einheitB.kurz} heute bereits führt.`
            : 'Anteil der fachlich erforderlichen Kontrollen, die die neue Einheit heute schon eigenständig trägt.'}
        </p>
      </div>
      <div className="px-5 py-3 divide-y divide-slate-100">
        {abdeckung.map(a => {
          const kritisch = a.grad < 50;
          // Der ungefüllte Track ist eine hellere Stufe derselben Hue wie die Füllung.
          const fuellung = kritisch ? '#B45309' : '#1D7B3F';
          const track = kritisch ? '#F5E3C7' : '#D6EDE0';
          return (
            <div key={a.bereichId} className="grid gap-3 items-center py-2.5"
                 style={{ gridTemplateColumns: 'minmax(140px,215px) 1fr 54px 96px' }}>
              <div className="min-w-0 pr-1">
                <div className="text-[13px] font-semibold leading-tight">{a.name}</div>
              </div>
              <div style={{ height: 10 }} className="rounded-full overflow-hidden" title={`${a.vorhanden} von ${a.soll} Kontrollen vorhanden`}>
                <div className="h-full w-full rounded-full" style={{ background: track }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${a.grad}%`, minWidth: 3, background: fuellung }}
                  />
                </div>
              </div>
              <div className="text-[12.5px] font-semibold tabular-nums text-right text-slate-700">{a.grad} %</div>
              <div className="text-[11.5px] tabular-nums text-right">
                {a.fehlend > 0 ? (
                  <span className={clsx('font-semibold', kritisch ? 'text-amber-700' : 'text-slate-500')}>
                    {nf0.format(a.fehlend)} fehlen
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold">vollständig</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-5 py-2.5 border-t border-slate-100 text-[11px] text-slate-400">
        Bereiche unter 50 % sind hervorgehoben — dort trägt die Einheit heute weniger als die Hälfte der erforderlichen Kontrollen.
      </div>
    </div>
  );
}

/** Fahrplan: Befunde nach Dringlichkeit gebündelt. */
function Fahrplan({ gaps, stufen }) {
  return (
    <div className="grid md:grid-cols-3 gap-3">
      {stufen.map(k => {
        const eigene = gaps.filter(g => g.typ !== 'deckungsgleich' && g.kritikalitaet === k.id);
        const pt = eigene.reduce((s, g) => s + (g.aufwandPT || 0), 0);
        const erledigt = eigene.filter(g => g.status === 'eingeplant' || g.status === 'nicht_relevant').length;
        return (
          <div key={k.id} className="card-base p-4" style={{ borderColor: `color-mix(in srgb, ${k.color} 30%, var(--color-border))` }}>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide"
                    style={{ background: k.bg, color: k.color }}>
                <Clock size={11} /> {k.label}
              </span>
              <span className="text-[11.5px] text-slate-500">{k.lang}</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2.5">
              <span className="text-[26px] font-bold leading-none" style={{ color: k.color }}>{eigene.length}</span>
              <span className="text-[12px] text-slate-500">Befunde · {nf0.format(pt)} PT</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${eigene.length ? (erledigt / eigene.length) * 100 : 0}%`, background: k.color }} />
            </div>
            <div className="text-[11px] text-slate-500 mt-1.5">{erledigt} von {eigene.length} entschieden</div>
          </div>
        );
      })}
    </div>
  );
}

export default function GapResultBoard() {
  const { analyse, resetGapAnalyse } = useGapAnalyse();
  const [typFilter, setTypFilter] = useState('alle');
  const [kritFilter, setKritFilter] = useState('alle');

  const sz = SZENARIO_MAP[analyse.szenario];
  const { kennzahlen } = analyse;
  const stufen = getKritikalitaet(analyse.szenario);
  const kritMap = getKritMap(analyse.szenario);

  const typenImSzenario = useMemo(
    () => GAP_TYPEN.filter(t => t.szenarien.includes(analyse.szenario) && analyse.gaps.some(g => g.typ === t.id)),
    [analyse]
  );

  const gefiltert = analyse.gaps
    .filter(g => typFilter === 'alle' || g.typ === typFilter)
    .filter(g => kritFilter === 'alle' || g.kritikalitaet === kritFilter)
    .sort((a, b) => (kritMap[b.kritikalitaet].rang - kritMap[a.kritikalitaet].rang) || (b.aufwandPT - a.aufwandPT));

  const entschieden = analyse.gaps.filter(g => g.status === 'eingeplant' || g.status === 'nicht_relevant').length;

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Kopf */}
      <div className="card-base p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1 flex-wrap">
              <GitCompareArrows size={12} className="text-emerald-600" /> Gap Analyzer · {sz.label}
              <span style={{ background: '#DBEAFE', color: '#1E40AF', fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4, letterSpacing: 0.4, textTransform: 'uppercase' }}>Ausblick</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">{analyse.zielName}</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="chip"><FileSpreadsheet size={12} /> {sz.einheitA.kurz}: {analyse.quelldokumentA?.name}</span>
              <span className="chip"><FileSpreadsheet size={12} /> {sz.einheitB.kurz}: {analyse.quelldokumentB?.name}</span>
              {analyse.stichtag && (
                <span className="chip">
                  <Clock size={11} /> {sz.stichtagLabel}: {new Date(analyse.stichtag).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>
          <button onClick={resetGapAnalyse} className="px-3 py-2 rounded-lg text-white text-[13px] font-semibold inline-flex items-center gap-2 shrink-0"
                  style={{ background: 'var(--mode-primary, #0F4D2A)' }}>
            <RefreshCw size={15} /> Neuer Abgleich
          </button>
        </div>

        <div className="mt-4 rounded-xl p-3.5 flex gap-3"
             style={{ background: 'color-mix(in srgb, var(--mode-primary, #0F4D2A) 5%, white)', border: '1px solid color-mix(in srgb, var(--mode-primary, #0F4D2A) 15%, transparent)' }}>
          <Sparkles size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--mode-primary, #0F4D2A)' }} />
          <p className="text-[13px] text-slate-700 leading-relaxed">{analyse.ergebnisIntro}</p>
        </div>
      </div>

      {/* Kennzahlen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatKachel
          icon={ShieldCheck}
          label="Abdeckung heute"
          wert={nf0.format(kennzahlen.abdeckungHeute)}
          einheit="%"
          zusatz={`${nf0.format(kennzahlen.vorhandenGesamt)} von ${nf0.format(kennzahlen.sollGesamt)} erforderlichen Kontrollen vorhanden`}
        />
        <StatKachel
          icon={AlertTriangle}
          label={`${stufen[0].label}-Befunde`}
          wert={nf0.format(kennzahlen.day1)}
          farbe="#B91C1C"
          zusatz={`${stufen[0].lang} · ${nf0.format(kennzahlen.aufwandDay1PT)} PT`}
        />
        <StatKachel
          icon={CircleSlash}
          label="Handlungsbedarf gesamt"
          wert={nf0.format(kennzahlen.handlungsbedarf)}
          zusatz={`von ${nf0.format(kennzahlen.befunde)} Befunden · ${nf0.format(kennzahlen.zielbild)} ohne Fristendruck`}
        />
        <StatKachel
          icon={Target}
          label="Schließungsaufwand"
          wert={nf0.format(kennzahlen.aufwandPT)}
          einheit="PT"
          zusatz="Schätzung des Agents über alle Befunde mit Handlungsbedarf"
        />
      </div>

      {/* Fahrplan */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <CalendarCheck size={16} className="text-emerald-600" />
          <h2 className="text-sm font-bold">{sz.fahrplanTitel}</h2>
        </div>
        <Fahrplan gaps={analyse.gaps} stufen={stufen} />
      </div>

      {/* Abdeckung je Bereich */}
      <AbdeckungsMatrix abdeckung={analyse.abdeckung} sz={sz} />

      {/* Befunde */}
      <div className="card-base p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Layers size={16} className="text-emerald-600" /> Befunde im Detail
            </h2>
            <p className="text-[12px] text-slate-500 mt-0.5">
              {kennzahlen.handlungsbedarf} Befunde mit Handlungsbedarf · einplanen, verwerfen, zuweisen und kommentieren.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
            <Users size={14} className="text-slate-400" />
            <span className="text-[12px] font-semibold text-slate-600">Entschieden: {entschieden}/{analyse.gaps.length}</span>
            <div className="w-24 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${(entschieden / analyse.gaps.length) * 100}%`, background: '#059669' }} />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mr-1">Befundart</span>
            <button onClick={() => setTypFilter('alle')}
                    className={clsx('rounded-full px-2.5 py-1 text-[11.5px] font-semibold border transition-colors',
                      typFilter === 'alle' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50')}>
              Alle ({analyse.gaps.length})
            </button>
            {typenImSzenario.map(t => {
              const anzahl = analyse.gaps.filter(g => g.typ === t.id).length;
              const aktiv = typFilter === t.id;
              return (
                <button key={t.id} onClick={() => setTypFilter(aktiv ? 'alle' : t.id)}
                        className="rounded-full px-2.5 py-1 text-[11.5px] font-semibold border transition-colors"
                        style={aktiv
                          ? { background: t.color, color: 'white', borderColor: t.color }
                          : { background: t.bg, color: t.color, borderColor: `color-mix(in srgb, ${t.color} 25%, transparent)` }}>
                  {t.label} ({anzahl})
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mr-1">Zeitpunkt</span>
            <button onClick={() => setKritFilter('alle')}
                    className={clsx('rounded-full px-2.5 py-1 text-[11.5px] font-semibold border transition-colors',
                      kritFilter === 'alle' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50')}>
              Alle
            </button>
            {stufen.map(k => {
              const anzahl = analyse.gaps.filter(g => g.kritikalitaet === k.id).length;
              const aktiv = kritFilter === k.id;
              return (
                <button key={k.id} onClick={() => setKritFilter(aktiv ? 'alle' : k.id)}
                        className="rounded-full px-2.5 py-1 text-[11.5px] font-semibold border transition-colors"
                        style={aktiv
                          ? { background: k.color, color: 'white', borderColor: k.color }
                          : { background: k.bg, color: k.color, borderColor: `color-mix(in srgb, ${k.color} 25%, transparent)` }}>
                  {k.label} ({anzahl})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {gefiltert.map(g => <GapCard key={g.id} gap={g} szenario={analyse.szenario} />)}
        {gefiltert.length === 0 && (
          <div className="card-base p-8 text-center text-[13px] text-slate-500">
            Keine Befunde für diese Filterkombination.
          </div>
        )}
      </div>
    </div>
  );
}
