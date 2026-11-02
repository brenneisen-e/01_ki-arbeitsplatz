/**
 * Präsentationsmodus der Provisionsreklamation.
 *
 * Führt die Strecke an einem einzelnen Vorgang vor, Schritt für Schritt und
 * bildschirmfüllend:
 *
 *   1  Reklamation einreichen   das Vermittlerportal füllt sich Feld für Feld
 *   2  Datenabgleich            die KI holt die Vertragsdaten aus dem Bestand
 *   3  SOLL/IST-Berechnung      jede Provisionsposition wird nachgerechnet
 *   4  Mustererkennung          drei gleiche Fälle ergeben einen Cluster
 *   5  Antwort und Abschluss    der Entwurf entsteht, die Freigabe geht raus
 *   6  Gesamtbild               alle Vorgänge priorisiert im Backoffice
 *
 * Alle Inhalte stammen aus den Demo-Daten der App (Vorgänge, Vertragsdaten,
 * KI-Analysen), damit Präsentation und Oberfläche dieselben Zahlen zeigen.
 * Innerhalb einer Szene laufen die Animationen von selbst. Von Szene zu Szene
 * geht es per Klick, Leertaste oder Pfeiltaste; ein Klick während der
 * Animation springt zuerst an ihr Ende.
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X, ChevronLeft, ChevronRight, Maximize2, Minimize2, Check, Sparkles, AlertTriangle, Lightbulb,
  Database, Send, FileText, Layers, MailCheck, Inbox, RotateCcw, Building2, CheckCircle2, Loader2
} from 'lucide-react';
import { DEMO_VORGAENGE, DEMO_VERTRAGSDATEN, DEMO_KI_ANALYSEN } from '../data/demoData';
import { PROZESS, DEMO_VORGANG_ID } from '../utils/prozess';

// ============================================================
// Hilfen
// ============================================================

/** Läuft die Phasen einer Szene ab: `dauern[i]` ist die Zeit von Phase i nach i+1. */
function useAblauf(dauern, schluessel) {
  const [phase, setPhase] = useState(0);
  const timer = useRef([]);
  const stopp = useCallback(() => { timer.current.forEach(clearTimeout); timer.current = []; }, []);

  useEffect(() => {
    setPhase(0);
    let summe = 0;
    timer.current = dauern.map((ms, i) => { summe += ms; return setTimeout(() => setPhase(i + 1), summe); });
    return stopp;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schluessel]);

  const fertig = phase >= dauern.length;
  const abschliessen = useCallback(() => { stopp(); setPhase(dauern.length); }, [stopp, dauern.length]);
  return { phase, fertig, abschliessen };
}

/** Zählt von 0 bis zum Ziel, sobald `aktiv` ist. */
function useZaehler(ziel, aktiv, dauer = 1400) {
  const [wert, setWert] = useState(0);
  useEffect(() => {
    if (!aktiv) { setWert(0); return; }
    let raf;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dauer);
      setWert(ziel * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ziel, aktiv, dauer]);
  return wert;
}

/** Schreibt einen Text Zeichen für Zeichen, sobald `aktiv` ist; `voll` zeigt ihn sofort ganz. */
function useTipper(text, aktiv, voll, tempo = 14) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!aktiv) { setN(0); return; }
    if (voll) { setN(text.length); return; }
    const id = setInterval(() => setN(x => { if (x >= text.length) { clearInterval(id); return x; } return x + 3; }), tempo);
    return () => clearInterval(id);
  }, [text, aktiv, voll, tempo]);
  return text.slice(0, n);
}

const eur = (v) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(v);
const datum = (iso) => new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const monat = (ym) => { const [j, m] = ym.split('-'); return `${MONATE[Number(m) - 1]} ${j}`; };

/** Entfernt die Markdown-Sterne der Analysetexte für die Bühne. */
const ohneMarkdown = (t) => t.replace(/\*\*/g, '');

function Hinweisbox({ Icon, titel, kinder, ton = 'neutral', sichtbar, className = '' }) {
  const toene = {
    neutral: { rahmen: 'border-slate-200 bg-white', kreis: 'bg-slate-100 text-slate-600' },
    problem: { rahmen: 'border-amber-200 bg-amber-50', kreis: 'bg-amber-100 text-amber-700' },
    loesung: { rahmen: 'bg-white', kreis: 'text-white' },
  };
  const t = toene[ton];
  return (
    <div className={`rounded-2xl border-2 p-4 transition-all duration-500 ${t.rahmen} ${
      sichtbar ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
    } ${className}`} style={ton === 'loesung' ? { borderColor: 'var(--mode-primary-light)' } : undefined}>
      <div className="flex items-center gap-3">
        <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${t.kreis}`}
          style={ton === 'loesung' ? { backgroundColor: 'var(--mode-primary-light)' } : undefined}>
          <Icon size={22} strokeWidth={1.75} />
        </span>
        <span className="text-xl font-semibold text-slate-900 leading-tight">{titel}</span>
      </div>
      <div className="mt-3">{kinder}</div>
    </div>
  );
}

function Erscheint({ sichtbar, children, className = '' }) {
  return (
    <div className={`transition-all duration-500 ${sichtbar ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} ${className}`}>
      {children}
    </div>
  );
}

// Bezeichnungen wie im KI-Analysepanel der App, damit Präsentation und Oberfläche gleich sprechen.
const AMPEL = {
  gruen: { text: 'Berechtigt', klasse: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  gelb: { text: 'Klärungsbedarf', klasse: 'bg-amber-100 text-amber-800 border-amber-200' },
  orange: { text: 'Systemischer Fehler', klasse: 'bg-orange-100 text-orange-800 border-orange-200' },
  rot: { text: 'Unbegründet', klasse: 'bg-red-100 text-red-700 border-red-200' },
  blau: { text: 'Fachliche Anfrage', klasse: 'bg-blue-100 text-blue-700 border-blue-200' },
};

// ============================================================
// Startseite
// ============================================================

function Startseite({ vorgang }) {
  return (
    <div className="h-full grid lg:grid-cols-2 gap-6 items-start">
      <Hinweisbox sichtbar ton="problem" Icon={AlertTriangle} titel="Heute"
        kinder={<ul className="space-y-2 text-lg text-slate-700 leading-relaxed list-disc pl-5">
          <li>Reklamationen kommen formlos und unvollständig an, Rückfragen kosten Tage.</li>
          <li>Jede Abrechnung wird von Hand gegen den Bestand nachgerechnet.</li>
          <li>Ob mehrere Vermittler denselben Fehler melden, fällt erst spät auf.</li>
        </ul>} />
      <Hinweisbox sichtbar ton="loesung" Icon={Lightbulb} titel="Mit KI-Vorprüfung"
        kinder={<ul className="space-y-2 text-lg text-slate-700 leading-relaxed list-disc pl-5">
          <li>Strukturierte Einreichung im Portal, Pflichtfelder vollständig.</li>
          <li>Die KI gleicht mit dem Bestand ab und rechnet SOLL gegen IST.</li>
          <li>Gleiche Fehlerbilder werden als Cluster erkannt und eskaliert.</li>
        </ul>} />
      <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 p-5 text-lg text-slate-700">
        Vorgeführt am Vorgang <span className="font-semibold text-slate-900">{vorgang.id}</span>:
        {' '}{vorgang.vermittler} ({vorgang.agentur}) reklamiert {vorgang.typ.toLowerCase()} für
        {' '}{vorgang.vnName}, Vertrag {vorgang.vsNummer}.
      </div>
    </div>
  );
}

// ============================================================
// Szene 1 – Reklamation einreichen
// ============================================================

function SzeneEinreichen({ vorgang, phase, fertig }) {
  const felder = [
    ['Vermittler', `${vorgang.vermittler} (${vorgang.vermittlerNr})`],
    ['Agentur', vorgang.agentur],
    ['Versicherungsscheinnummer', vorgang.vsNummer],
    ['Sparte', vorgang.sparte],
    ['Reklamationsart', vorgang.typ],
    ['Versicherungsnehmer', vorgang.vnName],
    ['Zeitraum', `${monat(vorgang.zeitraumVon)} bis ${monat(vorgang.zeitraumBis)}`],
    ['Erwartet / erhalten', `${eur(vorgang.erwartet)} / ${eur(vorgang.erhalten)}`],
  ];
  const sichtbar = Math.min(felder.length, phase);
  const beschreibung = useTipper(vorgang.beschreibung, phase >= felder.length, fertig);
  const eingereicht = phase >= felder.length + 1;

  return (
    <div className="grid xl:grid-cols-[1fr_380px] gap-6 items-start">
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center gap-3" style={{ background: 'var(--mode-gradient)' }}>
          <Send size={18} className="text-white" />
          <span className="text-white font-medium">Vermittlerportal · Provisionsreklamation einreichen</span>
        </div>
        <div className="p-5 grid md:grid-cols-2 gap-x-6 gap-y-3">
          {felder.map(([label, wert], i) => (
            <div key={label}>
              <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
              <div className={`mt-1 h-10 px-3 rounded-lg border flex items-center text-base transition-all duration-300 ${
                i < sichtbar ? 'border-blue-300 bg-blue-50/40 text-slate-900' : 'border-slate-200 bg-slate-50 text-transparent'
              }`}>{wert}</div>
            </div>
          ))}
          <div className="md:col-span-2">
            <div className="text-xs uppercase tracking-wide text-slate-400">Beschreibung</div>
            <div className="mt-1 min-h-[96px] px-3 py-2 rounded-lg border border-slate-200 bg-white text-base text-slate-800 leading-relaxed">
              {beschreibung}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Hinweisbox sichtbar={eingereicht} ton="loesung" Icon={CheckCircle2} titel="Eingereicht"
          kinder={<div className="text-lg text-slate-700 leading-relaxed">
            Vorgang <span className="font-mono font-semibold text-slate-900">{vorgang.id}</span> vom {datum(vorgang.eingangsdatum)}.
            Alle Pflichtfelder sind gefüllt, die KI-Vorprüfung startet sofort.
          </div>} />
        <Hinweisbox sichtbar={eingereicht} Icon={FileText} titel="Reklamierte Differenz"
          kinder={<div className="text-3xl font-semibold font-mono text-red-600">{eur(vorgang.differenz)}</div>} />
      </div>
    </div>
  );
}

// ============================================================
// Szene 2 – Datenabgleich
// ============================================================

const VERTRAG_LABEL = {
  produkt: 'Produkt', tarif: 'Tarif', vertragsstatus: 'Vertragsstatus', zahlungsweise: 'Zahlungsweise',
  dynamik: 'Dynamik', courtagevereinbarung: 'Courtagevereinbarung', apSatz: 'AP-Satz', bpSatz: 'BP-Satz',
  stornohaftungszeit: 'Stornohaftungszeit', stornoreserveEinbehalt: 'Stornoreserve-Einbehalt', beitragssumme: 'Beitragssumme',
};

function SzeneAbgleich({ vorgang, vertrag, phase }) {
  const zeilen = Object.entries(vertrag).filter(([k]) => VERTRAG_LABEL[k]);
  const sichtbar = Math.max(0, phase - 1);
  const fertig = sichtbar >= zeilen.length;
  const wichtig = new Set(['tarif', 'dynamik', 'apSatz']);

  return (
    <div className="grid xl:grid-cols-[360px_1fr_380px] gap-6 items-start">
      <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wide"><Send size={15} /> Reklamation</div>
        <div className="mt-3 space-y-2 text-base">
          {[['Vorgang', vorgang.id], ['VS-Nr.', vorgang.vsNummer], ['Art', vorgang.typ], ['Vertragsbeginn', datum(vorgang.vertragsbeginn)],
            ['Monatsbeitrag', eur(vorgang.monatsbeitrag)]].map(([l, w]) => (
            <div key={l} className="flex justify-between gap-3"><span className="text-slate-500">{l}</span><span className="font-medium text-slate-900 text-right">{w}</span></div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wide">
          <Database size={15} /> Bestandssystem · Vertrag {vorgang.vsNummer}
          {phase >= 1 && !fertig && <Loader2 size={15} className="ml-auto animate-spin text-blue-500" />}
          {fertig && <Check size={16} className="ml-auto text-emerald-600" />}
        </div>
        <div className="divide-y divide-slate-100">
          {zeilen.map(([k, w], i) => (
            <div key={k} className={`px-5 py-2.5 flex justify-between gap-4 text-base transition-all duration-300 ${
              i < sichtbar ? 'opacity-100' : 'opacity-0'} ${i < sichtbar && wichtig.has(k) ? 'bg-blue-50' : ''}`}>
              <span className="text-slate-500">{VERTRAG_LABEL[k]}</span>
              <span className={`text-right ${wichtig.has(k) ? 'font-semibold text-slate-900' : 'text-slate-800'}`}>{w}</span>
            </div>
          ))}
        </div>
      </div>

      <Hinweisbox sichtbar={fertig} ton="loesung" Icon={Sparkles} titel="Was die KI daraus liest"
        kinder={<ul className="space-y-2 text-lg text-slate-700 leading-relaxed list-disc pl-5">
          <li>Tarif {vertrag.tarif} mit Dynamik {vertrag.dynamik.replace(/\.$/, '')}.</li>
          <li>Jede Dynamikerhöhung löst Abschlussprovision auf den Mehrbeitrag aus ({vertrag.apSatz}).</li>
          <li>Vertrag {vertrag.vertragsstatus.toLowerCase()}, keine Stornohaftung betroffen.</li>
        </ul>} />
    </div>
  );
}

// ============================================================
// Szene 3 – SOLL/IST-Berechnung
// ============================================================

function Betrag({ wert, aktiv, klasse = '' }) {
  const z = useZaehler(wert, aktiv);
  return <span className={`font-mono ${klasse}`}>{eur(aktiv ? z : 0)}</span>;
}

function SzeneBerechnung({ vorgang, analyse, phase }) {
  const { positionen, gesamt_soll, gesamt_ist, gesamt_differenz, hinweis } = analyse.provisionsberechnung;
  const abweichung = Math.abs(gesamt_differenz) - Math.abs(vorgang.differenz);
  const gleich = Math.abs(abweichung) < 0.005;
  const nichtsGebucht = positionen.every(p => p.ist === 0);
  const gezeigt = Math.min(positionen.length, phase);
  const summe = phase > positionen.length;

  return (
    <div className="grid xl:grid-cols-[1fr_380px] gap-6 items-start">
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[1fr_160px_160px_170px] px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white" style={{ background: 'var(--mode-gradient)' }}>
          <span>Position</span><span className="text-right">SOLL</span><span className="text-right">IST</span><span className="text-right">Differenz</span>
        </div>
        {positionen.map((p, i) => (
          <div key={p.position} className={`grid grid-cols-[1fr_160px_160px_170px] px-5 py-4 text-lg border-b border-slate-100 transition-all duration-500 ${
            i < gezeigt ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3'}`}>
            <span className="text-slate-900">{p.position}</span>
            <span className="text-right"><Betrag wert={p.soll} aktiv={i < gezeigt} /></span>
            <span className="text-right"><Betrag wert={p.ist} aktiv={i < gezeigt} /></span>
            <span className="text-right"><Betrag wert={p.differenz} aktiv={i < gezeigt} klasse={p.differenz < 0 ? 'text-red-600 font-semibold' : 'text-slate-700'} /></span>
          </div>
        ))}
        <div className={`grid grid-cols-[1fr_160px_160px_170px] px-5 py-4 text-xl font-semibold bg-slate-50 transition-opacity duration-500 ${summe ? 'opacity-100' : 'opacity-0'}`}>
          <span>Gesamt</span>
          <span className="text-right"><Betrag wert={gesamt_soll} aktiv={summe} /></span>
          <span className="text-right"><Betrag wert={gesamt_ist} aktiv={summe} /></span>
          <span className="text-right"><Betrag wert={gesamt_differenz} aktiv={summe} klasse="text-red-600" /></span>
        </div>
      </div>
      <div className="space-y-4">
        <Hinweisbox sichtbar={summe} ton="loesung" Icon={Check} titel={gleich ? 'Reklamation nachvollzogen' : `Berechtigt, ${abweichung > 0 ? 'mehr' : 'weniger'} als gemeldet`}
          kinder={<div className="text-lg text-slate-700 leading-relaxed">
            {gleich ? (
              <>Die errechnete Differenz von <span className="font-mono font-semibold text-red-600">{eur(gesamt_differenz)}</span> entspricht der Reklamation.</>
            ) : (
              <>Die errechnete Differenz von <span className="font-mono font-semibold text-red-600">{eur(gesamt_differenz)}</span> liegt{' '}
                <span className="font-mono font-semibold">{eur(Math.abs(abweichung))}</span> {abweichung > 0 ? 'über' : 'unter'} der Meldung
                ({eur(Math.abs(vorgang.differenz))}). {hinweis}</>
            )}
            {nichtsGebucht && <> Keine der Dynamikerhöhungen hat Abschlussprovision ausgelöst.</>}
          </div>} />
        <Hinweisbox sichtbar={summe} Icon={FileText} titel="Grundlage"
          kinder={<div className="text-base text-slate-600 leading-relaxed">
            Vertragsdaten aus dem Bestand, vereinbarte Provisionssätze und die Regel zur Dynamikprovision:
            AP auf den Mehrbeitrag je Erhöhung, über die Restlaufzeit (Mehrbeitrag × 12 × Restlaufzeit × AP-Satz).
          </div>} />
      </div>
    </div>
  );
}

// ============================================================
// Szene 4 – Mustererkennung
// ============================================================

function SzeneMuster({ cluster, analyse, phase }) {
  const gezeigt = Math.min(cluster.length, phase);
  const erkannt = phase > cluster.length;
  const summe = cluster.reduce((s, v) => s + v.differenz, 0);
  // Nachzahlung laut KI-Vorprüfung je Fall (fehlt eine Analyse, zählt die Meldung)
  const laut = (v) => DEMO_KI_ANALYSEN[v.id]?.provisionsberechnung?.gesamt_differenz ?? v.differenz;
  const summeKi = cluster.reduce((s, v) => s + laut(v), 0);
  const tarif = (v) => DEMO_VERTRAGSDATEN[v.vsNummer]?.tarif || '–';

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-5">
        {cluster.map((v, i) => (
          <div key={v.id} className={`rounded-2xl bg-white border-2 p-5 shadow-sm transition-all duration-500 ${
            i < gezeigt ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${erkannt ? 'border-amber-300' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <span className="font-mono font-semibold text-slate-900">{v.id}</span>
              <span className="text-sm text-slate-500">{datum(v.eingangsdatum)}</span>
            </div>
            <div className="mt-2 text-lg font-medium text-slate-900">{v.vermittler}</div>
            <div className="text-sm text-slate-500">{v.agentur}</div>
            <div className="mt-3 space-y-1 text-base">
              <div className="flex justify-between"><span className="text-slate-500">Art</span><span className="text-slate-800">{v.typ}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Tarif</span>
                <span className={`font-semibold ${erkannt ? 'text-amber-700' : 'text-slate-800'}`}>{tarif(v)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Gemeldet</span><span className="font-mono text-slate-800">{eur(v.differenz)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Laut KI</span><span className="font-mono text-red-600">{eur(laut(v))}</span></div>
            </div>
          </div>
        ))}
      </div>

      <div className={`rounded-2xl border-2 border-amber-300 bg-amber-50 p-6 transition-all duration-500 ${erkannt ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-700">
          <Sparkles size={16} /> KI-Cluster erkannt
        </div>
        <div className="mt-2 text-2xl font-semibold text-slate-900">{analyse.bewertung.auffaelligkeit.muster}</div>
        <div className="mt-4 grid md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-white border border-amber-200 p-4">
            <div className="text-sm text-slate-500">Gleiche Reklamationen</div>
            <div className="text-3xl font-semibold text-slate-900">{cluster.length}</div>
            <div className="text-sm text-slate-500">aus {new Set(cluster.map(v => v.agentur)).size} Agenturen</div>
          </div>
          <div className="rounded-xl bg-white border border-amber-200 p-4">
            <div className="text-sm text-slate-500">Nachzahlung laut KI</div>
            <div className="text-3xl font-semibold font-mono text-red-600">{eur(summeKi)}</div>
            <div className="text-sm text-slate-500">gemeldet {eur(summe)}</div>
          </div>
          <div className="rounded-xl bg-white border border-amber-200 p-4">
            <div className="text-sm text-slate-500">Geschätzt betroffen (Schätzung der KI)</div>
            <div className="text-2xl font-semibold text-slate-900">{analyse.bewertung.auffaelligkeit.geschaetzte_betroffene}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Szene 5 – Antwort und Abschluss
// ============================================================

function SzeneAntwort({ vorgang, analyse, phase, fertig }) {
  const text = useTipper(analyse.antwort_entwurf, phase >= 1, fertig || phase >= 2, 12);
  const freigegeben = phase >= 3;
  const zugestellt = phase >= 4;
  const schritte = analyse.bewertung.handlungsempfehlung.split('\n').map(s => s.replace(/^\d+\.\s*/, '')).filter(Boolean);

  return (
    <div className="grid xl:grid-cols-[1fr_400px] gap-6 items-start">
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center gap-2">
          <Sparkles size={16} className="text-blue-600" />
          <span className="font-medium text-slate-700">Antwortentwurf der KI an {vorgang.vermittler}</span>
          {freigegeben && <span className="ml-auto px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium flex items-center gap-1"><Check size={14} /> Freigegeben</span>}
        </div>
        <pre className="p-5 whitespace-pre-wrap font-sans text-base text-slate-800 leading-relaxed min-h-[340px]">{text}</pre>
      </div>
      <div className="space-y-4">
        <Hinweisbox sichtbar={phase >= 2} Icon={Building2} titel="Handlungsempfehlung"
          kinder={<ol className="space-y-1.5 text-base text-slate-700 leading-relaxed list-decimal pl-5">
            {schritte.map(s => <li key={s}>{s}</li>)}
          </ol>} />
        <Hinweisbox sichtbar={zugestellt} ton="loesung" Icon={Inbox} titel="Beim Vermittler angekommen"
          kinder={<div className="text-lg text-slate-700 leading-relaxed">
            Die Antwort liegt im Posteingang von {vorgang.vermittler}. Die Sachbearbeiterin hat geprüft und
            freigegeben; der Vorgang ist abgeschlossen.
          </div>} />
      </div>
    </div>
  );
}

// ============================================================
// Szene 6 – Gesamtbild
// ============================================================

function Kachel({ titel, wert, unter, aktiv, klasse = 'text-slate-900' }) {
  return (
    <div className={`rounded-2xl bg-white border border-slate-200 p-5 shadow-sm transition-all duration-500 ${aktiv ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
      <div className="text-sm text-slate-500">{titel}</div>
      <div className={`mt-1 text-4xl font-semibold ${klasse}`}>{wert}</div>
      {unter && <div className="mt-1 text-sm text-slate-500">{unter}</div>}
    </div>
  );
}

function SzeneGesamtbild({ phase, vonVorn, zumBackoffice }) {
  const alle = DEMO_VORGAENGE;
  const offen = alle.filter(v => !['Geklärt', 'Abgelehnt', 'Beantwortet'].includes(v.status));
  const auffaellig = alle.filter(v => v.auffaellig);
  const cluster = new Set(alle.filter(v => v.clusterId).map(v => v.clusterId));
  const summeOffen = offen.reduce((s, v) => s + Math.abs(v.differenz), 0);
  const ampeln = Object.values(DEMO_KI_ANALYSEN).reduce((m, a) => { m[a.bewertung.ampel] = (m[a.bewertung.ampel] || 0) + 1; return m; }, {});
  const sortiert = [...offen].sort((a, b) => (b.auffaellig - a.auffaellig) || (Math.abs(b.differenz) - Math.abs(a.differenz)));

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Kachel aktiv={phase >= 1} titel="Vorgänge im Backoffice" wert={alle.length} unter={`davon ${offen.length} offen`} />
        <Kachel aktiv={phase >= 1} titel="Offene Differenzen" wert={eur(summeOffen)} klasse="text-red-600 font-mono text-3xl" />
        <Kachel aktiv={phase >= 1} titel="Auffällige Vorgänge" wert={auffaellig.length} unter={`${cluster.size} KI-Cluster erkannt`} klasse="text-amber-600" />
        <Kachel aktiv={phase >= 1} titel="KI-Vorprüfung" wert={Object.values(ampeln).reduce((s, n) => s + n, 0)}
          unter={Object.entries(ampeln).map(([k, n]) => `${n} ${AMPEL[k]?.text || k}`).join(' · ')} />
      </div>

      <div className={`rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden transition-opacity duration-500 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="px-5 py-3 border-b border-slate-200 text-sm font-semibold uppercase tracking-wide text-slate-500">Offene Vorgänge, priorisiert</div>
        {sortiert.map(v => {
          const a = DEMO_KI_ANALYSEN[v.id]?.bewertung.ampel || v.kiBewertung;
          return (
            <div key={v.id} className="px-5 py-2.5 border-b border-slate-100 grid grid-cols-[130px_1fr_1fr_150px_170px] gap-3 items-center text-base">
              <span className="font-mono text-slate-900">{v.id}</span>
              <span className="text-slate-800 truncate">{v.vermittler}</span>
              <span className="text-slate-600 truncate">{v.typ}</span>
              <span className="font-mono text-right text-red-600">{eur(v.differenz)}</span>
              <span className={`justify-self-end px-2.5 py-0.5 rounded-full border text-sm ${AMPEL[a]?.klasse || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                {AMPEL[a]?.text || a}
              </span>
            </div>
          );
        })}
      </div>

      <div className={`flex flex-wrap gap-3 transition-opacity duration-500 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
        <button onClick={zumBackoffice} className="px-5 py-3 rounded-xl text-base font-medium text-white flex items-center gap-2" style={{ backgroundColor: 'var(--mode-primary-light)' }}>
          <Building2 size={18} /> Zum Backoffice
        </button>
        <button onClick={vonVorn} className="px-5 py-3 rounded-xl text-base border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-2">
          <RotateCcw size={18} /> Von vorn
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Rahmen
// ============================================================

function Prozessleiste({ aktiv, aufSchritt }) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {PROZESS.map((s, i) => {
        const ist = i === aktiv;
        const erledigt = i < aktiv;
        return (
          <button key={s.id} onClick={() => aufSchritt(i)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left border transition-colors min-w-0 ${
              ist ? 'text-white border-transparent shadow-md' : erledigt ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-white/60 border-slate-200 text-slate-400 hover:bg-white'
            }`}
            style={ist ? { backgroundColor: 'var(--mode-primary)' } : undefined}>
            <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              ist ? 'bg-white/20' : erledigt ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100'}`}>
              {erledigt ? <Check size={18} strokeWidth={2.5} /> : <s.Icon size={18} strokeWidth={1.75} />}
            </span>
            <span className="min-w-0">
              <span className={`block text-[11px] uppercase tracking-wide ${ist ? 'text-white/70' : 'text-slate-400'}`}>Schritt {s.nr}</span>
              <span className="block text-sm font-semibold leading-tight truncate">{s.titel}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function Praesentation({ offen, startSchritt = 0, onClose, aufBackoffice }) {
  const vorgang = useMemo(() => DEMO_VORGAENGE.find(v => v.id === DEMO_VORGANG_ID) || DEMO_VORGAENGE[0], []);
  const vertrag = DEMO_VERTRAGSDATEN[vorgang.vsNummer] || {};
  const analyse = DEMO_KI_ANALYSEN[vorgang.id];
  const cluster = useMemo(() => DEMO_VORGAENGE.filter(v => v.clusterId && v.clusterId === vorgang.clusterId), [vorgang]);

  const [schritt, setSchritt] = useState(startSchritt);
  const [durchlauf, setDurchlauf] = useState(0);
  const [vollbild, setVollbild] = useState(false);
  const [gestartet, setGestartet] = useState(startSchritt > 0);
  const buehne = useRef(null);

  useEffect(() => { buehne.current?.scrollTo({ top: 0 }); }, [schritt, durchlauf]);

  const vertragZeilen = Object.keys(vertrag).length;
  const dauern = useMemo(() => [
    [...Array(8).fill(380), 2600],
    [500, ...Array(vertragZeilen).fill(260)],
    [...analyse.provisionsberechnung.positionen.map(() => 900), 900],
    [...cluster.map(() => 800), 1000],
    [500, 4200, 900, 900],
    [400, 900],
  ], [vertragZeilen, analyse, cluster]);

  const { phase, fertig, abschliessen } = useAblauf(dauern[schritt], `${durchlauf}-${schritt}`);

  useEffect(() => {
    if (offen) { setSchritt(startSchritt); setGestartet(startSchritt > 0); setDurchlauf(d => d + 1); }
  }, [offen, startSchritt]);

  const start = useCallback(() => { setGestartet(true); setDurchlauf(d => d + 1); }, []);

  const schliessen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    onClose();
  }, [onClose]);

  const letzter = schritt === PROZESS.length - 1;

  const weiter = useCallback(() => {
    document.activeElement?.blur?.();
    if (!gestartet) { start(); return; }
    if (!fertig) { abschliessen(); return; }
    if (letzter) { schliessen(); return; }
    setSchritt(s => s + 1);
  }, [gestartet, start, fertig, abschliessen, letzter, schliessen]);

  const zurueck = useCallback(() => {
    document.activeElement?.blur?.();
    if (schritt > 0) setSchritt(s => s - 1);
  }, [schritt]);
  const vonVorn = useCallback(() => { setSchritt(0); setGestartet(false); setDurchlauf(d => d + 1); }, []);

  useEffect(() => {
    if (!offen) return;
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'Escape') { e.preventDefault(); schliessen(); }
      else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter' || e.key === 'PageDown') { e.preventDefault(); weiter(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); zurueck(); }
      else if (e.key === 'Home') { e.preventDefault(); vonVorn(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [offen, weiter, zurueck, vonVorn, schliessen]);

  useEffect(() => {
    if (!offen) return;
    const alt = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const h = () => setVollbild(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => { document.body.style.overflow = alt; document.removeEventListener('fullscreenchange', h); };
  }, [offen]);

  if (!offen) return null;

  function vollbildUmschalten() {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    else document.documentElement.requestFullscreen?.().catch(() => {});
  }

  const s = PROZESS[schritt];
  const szene = [
    <SzeneEinreichen key="1" vorgang={vorgang} phase={phase} fertig={fertig} />,
    <SzeneAbgleich key="2" vorgang={vorgang} vertrag={vertrag} phase={phase} />,
    <SzeneBerechnung key="3" vorgang={vorgang} analyse={analyse} phase={phase} />,
    <SzeneMuster key="4" cluster={cluster} analyse={analyse} phase={phase} />,
    <SzeneAntwort key="5" vorgang={vorgang} analyse={analyse} phase={phase} fertig={fertig} />,
    <SzeneGesamtbild key="6" phase={phase} vonVorn={vonVorn} zumBackoffice={() => { schliessen(); aufBackoffice?.(); }} />,
  ][schritt];

  return createPortal((
    <div className="fixed inset-0 z-[1100] bg-slate-100 flex flex-col animate-fade-in">
      <div className="px-6 pt-4 pb-3 border-b border-slate-200 bg-white shrink-0 flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <Prozessleiste aktiv={schritt} aufSchritt={i => { setGestartet(true); setSchritt(i); }} />
        </div>
        <button onClick={vollbildUmschalten} title={vollbild ? 'Vollbild beenden' : 'Vollbild'}
          className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 shrink-0">
          {vollbild ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
        <button onClick={schliessen} title="Präsentation beenden (Esc)"
          className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 shrink-0">
          <X size={18} />
        </button>
      </div>

      <div ref={buehne} className="flex-1 min-h-0 overflow-y-auto">
        <div key={`${durchlauf}-${schritt}`} className="min-h-full flex flex-col p-6 2xl:px-8 animate-fade-in">
          <div className="mb-4 flex items-center gap-3 shrink-0">
            <span className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md" style={{ background: 'var(--mode-gradient)' }}>
              <s.Icon size={22} strokeWidth={1.75} />
            </span>
            <span className="text-2xl font-semibold text-slate-900 leading-tight">{gestartet ? s.titel : 'Provisionsreklamation mit KI-Vorprüfung'}</span>
            <span className="text-base text-slate-500 hidden lg:block pl-3 border-l border-slate-300">{gestartet ? s.kurz : 'Worum es geht'}</span>
            <span className="ml-auto text-sm text-slate-400">Schritt {s.nr} von {PROZESS.length}</span>
          </div>
          <div className="flex-1 min-h-0">{gestartet ? szene : <Startseite vorgang={vorgang} />}</div>
        </div>
      </div>

      <div className="px-6 py-3 border-t border-slate-200 bg-white shrink-0 flex items-center gap-3">
        <button onClick={zurueck} disabled={schritt === 0}
          className="px-4 py-2.5 rounded-lg text-base border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-2 disabled:opacity-40 disabled:hover:bg-white">
          <ChevronLeft size={18} /> Zurück
        </button>
        <span className="text-sm text-slate-400 mx-auto hidden md:block">
          Leertaste oder Pfeil rechts: weiter · Pfeil links: zurück · Esc: beenden
        </span>
        <button onClick={weiter}
          className={`px-5 py-2.5 rounded-lg text-base font-medium flex items-center gap-2 ${
            (fertig || !gestartet) ? 'text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
          style={(fertig || !gestartet) ? { backgroundColor: 'var(--mode-primary-light)' } : undefined}>
          {!gestartet ? <>Weiter: Eine Reklamation geht ein <ChevronRight size={18} /></>
            : !fertig ? 'Animation überspringen'
              : letzter ? 'Präsentation beenden'
                : <>Weiter: {PROZESS[schritt + 1].titel}</>}
          {fertig && !letzter && <ChevronRight size={18} />}
        </button>
      </div>
    </div>
  ), document.body);
}
