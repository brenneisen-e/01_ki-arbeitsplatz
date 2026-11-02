import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { AlertTriangle, Lightbulb, ArrowRight, ChevronLeft, ChevronDown, ChevronUp, X, Play } from 'lucide-react';
import { useMode } from '../../hooks/useMode';
import { SCHRITTE } from './schritte';

// Präsentationsmodus: geführter Durchlauf durch die echte Oberfläche. Ein
// Spotlight legt sich auf das Ziel des Schritts (data-praes), unten links
// steht die Karte mit Problem und Lösung. Die App bleibt bedienbar, nur die
// Karte nimmt Zeigerereignisse an. Gestartet wird über den Knopf
// „Präsentation“ im Kopf oder auf der Landing Page (Ereignis
// `kia-praesentation-start`, siehe `startePraesentation`).

const START_EREIGNIS = 'kia-praesentation-start';
const RAND = 8;
const SCRIM = 'rgba(20, 16, 18, 0.55)';

export function startePraesentation() {
  window.dispatchEvent(new CustomEvent(START_EREIGNIS));
}

// Knopf „Präsentation“: auf dem dunklen Kopf weiß wie die Chips daneben, auf
// der hellen Landing Page in der Modusfarbe und so hoch wie ihre Top-Bar.
export function PraesentationsKnopf({ hell = false }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.currentTarget.blur(); startePraesentation(); }}
      title="Präsentation starten"
      className={clsx(
        'flex items-center gap-2 px-3 border text-xs font-semibold transition-colors',
        hell
          ? 'h-9 rounded-[10px] border-(--mode-primary) bg-(--mode-primary) text-white hover:bg-(--mode-primary-light)'
          : 'py-1.5 rounded-lg border-white bg-white text-(--mode-primary) hover:bg-white/90',
      )}
    >
      <Play size={14} strokeWidth={2} fill="currentColor" />
      {/* Im Kopf unter 1280 px nur das Icon, damit die Kopfzeile einzeilig bleibt */}
      <span className={hell ? undefined : 'max-[1279px]:hidden'}>Präsentation</span>
    </button>
  );
}

// Portal in den Modus-Wrapper, damit die Modus-Tokens gelten (wie die Modals).
function portalRoot() {
  if (typeof document === 'undefined') return null;
  return document.querySelector('[data-mode]') || document.body;
}

function wert(v, ctx) {
  return typeof v === 'function' ? v(ctx) : v;
}

function gleich(a, b) {
  if (!a || !b) return a === b;
  return a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height;
}

export default function Praesentation() {
  const mode = useMode();
  const [aktiv, setAktiv] = useState(false);
  const [schritt, setSchritt] = useState(0);
  const [minimiert, setMinimiert] = useState(false);
  const [rect, setRect] = useState(null);

  // Immer die aktuelle Navigation, auch aus Zeitgebern heraus.
  const apiRef = useRef(null);
  const erledigt = useRef(new Set());
  apiRef.current = {
    navigateTo: mode.navigateTo,
    setActiveTab: mode.setActiveTab,
    modeId: mode.modeId,
    einmal: (schluessel) => {
      if (erledigt.current.has(schluessel)) return false;
      erledigt.current.add(schluessel);
      return true;
    },
  };

  const beenden = useCallback(() => {
    setAktiv(false);
    setRect(null);
  }, []);

  // Start über den Knopf. In der Vermögensverwaltung fehlen Top-Lead und
  // Gesprächsvorbereitung, dort läuft die Präsentation im Versicherungsmodus.
  useEffect(() => {
    const start = () => {
      if (mode.modeId === 'vermoegensverwaltung') mode.switchMode('versicherung');
      erledigt.current = new Set();
      setMinimiert(false);
      setSchritt(0);
      setAktiv(true);
    };
    window.addEventListener(START_EREIGNIS, start);
    return () => window.removeEventListener(START_EREIGNIS, start);
  }, [mode]);

  // Schritt betreten und wieder verlassen. Der Wechsel des Modus beim Start
  // greift erst im nächsten Render, deshalb ein kurzer Aufschub.
  useEffect(() => {
    if (!aktiv) return undefined;
    const s = SCHRITTE[schritt];
    const tmr = setTimeout(() => s.betreten?.(apiRef.current), 0);
    return () => {
      clearTimeout(tmr);
      s.verlassen?.(apiRef.current);
    };
  }, [aktiv, schritt]);

  // Ziel suchen (bis 2,5 s), einmal in Position scrollen, dann laufend
  // nachmessen: Aufklappen, Scrollen und Fenstergröße verschieben es.
  useEffect(() => {
    if (!aktiv) return undefined;
    const s = SCHRITTE[schritt];
    setRect(null);
    let el = null;
    let gefunden = false;
    const beginn = Date.now();
    const id = setInterval(() => {
      if (!el || !el.isConnected) {
        el = document.querySelector(`[data-praes="${s.ziel}"]`);
        if (!el) {
          if (Date.now() - beginn > 2500) setRect(null);
          return;
        }
      }
      if (!gefunden) {
        gefunden = true;
        const fest = getComputedStyle(el).position === 'fixed';
        if (!fest) {
          const r = el.getBoundingClientRect();
          // Ziel ins obere Drittel holen, damit die Karte unten links frei bleibt.
          window.scrollTo({ top: Math.max(0, r.top + window.scrollY - 120), behavior: 'smooth' });
        }
        s.nachZiel?.(el, apiRef.current);
      }
      const r = el.getBoundingClientRect();
      const neu = r.width && r.height
        ? { top: Math.round(r.top - RAND), left: Math.round(r.left - RAND), width: Math.round(r.width + RAND * 2), height: Math.round(r.height + RAND * 2) }
        : null;
      setRect(alt => (gleich(alt, neu) ? alt : neu));
    }, 150);
    return () => clearInterval(id);
  }, [aktiv, schritt]);

  const letzter = schritt === SCHRITTE.length - 1;
  const weiter = useCallback(() => {
    document.activeElement?.blur?.();
    if (letzter) beenden();
    else setSchritt(i => i + 1);
  }, [letzter, beenden]);
  const zurueck = useCallback(() => {
    document.activeElement?.blur?.();
    setSchritt(i => Math.max(0, i - 1));
  }, []);

  // Tastatur. Nicht in Eingabefeldern und nicht, solange ein Modal der App
  // offen ist (die Gesprächsvorbereitung schließt selbst mit Esc).
  useEffect(() => {
    if (!aktiv) return undefined;
    const onKey = (e) => {
      if (document.querySelector('[data-modal]')) return;
      // Bild ab/auf senden Presenter-Klicker; die gelten auch in Eingabefeldern,
      // die übrigen Tasten nur, solange das Feld leer ist (dort tun sie nichts).
      const klicker = e.key === 'PageDown' || e.key === 'PageUp';
      const tag = e.target?.tagName;
      const feld = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target?.isContentEditable;
      if (feld && !klicker && (tag === 'SELECT' || e.target.isContentEditable || e.target.value)) return;
      if (['ArrowRight', ' ', 'Enter', 'PageDown'].includes(e.key)) { e.preventDefault(); weiter(); }
      else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); zurueck(); }
      else if (e.key === 'Escape') { e.preventDefault(); beenden(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [aktiv, weiter, zurueck, beenden]);

  if (!aktiv) return null;
  const root = portalRoot();
  if (!root) return null;

  const s = SCHRITTE[schritt];
  const ctx = { modeId: mode.modeId };
  const naechster = SCHRITTE[schritt + 1];

  return createPortal(
    <div className="fixed inset-0 z-[80] pointer-events-none" aria-live="polite">
      {/* Spotlight: Loch über dem Ziel, Rest abgedunkelt; ohne Ziel nur ein leichter Scrim */}
      {rect ? (
        <div
          className="fixed rounded-xl"
          style={{
            top: rect.top, left: rect.left, width: rect.width, height: rect.height,
            boxShadow: `0 0 0 2px var(--mode-accent), 0 0 0 9999px ${SCRIM}`,
            transition: 'all 400ms ease',
          }}
        />
      ) : (
        <div className="fixed inset-0" style={{ background: 'rgba(20, 16, 18, 0.18)', transition: 'background 400ms ease' }} />
      )}

      {/* Karte unten links */}
      <div
        className="fixed left-6 bottom-6 w-[440px] max-w-[calc(100vw-48px)] surface-elevated rounded-2xl pointer-events-auto animate-fade-in-up text-(--text-primary)"
        role="dialog"
        aria-label="Präsentation"
      >
        <div className="flex items-center gap-1.5 px-4 pt-3.5">
          {SCHRITTE.map((x, i) => (
            <button
              key={x.id}
              type="button"
              onClick={(e) => { e.currentTarget.blur(); setSchritt(i); }}
              title={x.titel}
              className={clsx(
                'w-7 h-7 rounded-lg text-xs font-semibold font-mono transition-colors',
                i === schritt
                  ? 'bg-(--mode-primary) text-white'
                  : i < schritt
                    ? 'bg-(--mode-primary-soft) text-(--mode-primary) hover:bg-(--bg-inset)'
                    : 'bg-(--bg-inset) text-(--text-tertiary) hover:text-(--text-primary)',
              )}
            >
              {i + 1}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => { e.currentTarget.blur(); setMinimiert(m => !m); }}
              title={minimiert ? 'Karte aufklappen' : 'Karte einklappen'}
              className="p-1.5 rounded-lg text-(--text-tertiary) hover:text-(--text-primary) hover:bg-(--bg-inset) transition-colors"
            >
              {minimiert ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <button
              type="button"
              onClick={beenden}
              title="Präsentation beenden"
              className="p-1.5 rounded-lg text-(--text-tertiary) hover:text-(--text-primary) hover:bg-(--bg-inset) transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="px-4 pt-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-(--text-tertiary)">
            Schritt {schritt + 1} von {SCHRITTE.length}
          </div>
          <div className="text-lg font-semibold leading-snug mt-0.5">{s.titel}</div>
          <div className="text-sm text-(--text-secondary)">{wert(s.unterzeile, ctx)}</div>
        </div>

        {!minimiert && (
          <div className="px-4 pt-3 space-y-2.5">
            <div className="rounded-xl p-3" style={{ background: 'var(--tint-warning)' }}>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <AlertTriangle size={15} strokeWidth={2} className="text-(--color-warning) shrink-0" />
                Problem
              </div>
              <ul className="mt-1.5 space-y-1 text-sm leading-snug text-(--text-secondary)">
                {wert(s.problem, ctx).map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="mt-[7px] w-1 h-1 rounded-full bg-(--color-warning) shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'var(--mode-primary-soft)' }}>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Lightbulb size={15} strokeWidth={2} className="text-(--mode-primary) shrink-0" />
                Lösung
              </div>
              <p className="mt-1.5 text-sm leading-snug text-(--text-secondary)">{wert(s.loesung, ctx)}</p>
              {s.aktion && (
                <button
                  type="button"
                  onClick={(e) => { e.currentTarget.blur(); s.aktion.ausfuehren(apiRef.current); }}
                  className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-(--mode-primary) text-(--mode-primary) text-xs font-semibold hover:bg-(--bg-card) transition-colors"
                >
                  {s.aktion.label} <ArrowRight size={13} strokeWidth={2} />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="px-4 pt-3 pb-3.5 flex items-center gap-2">
          <button
            type="button"
            onClick={zurueck}
            disabled={schritt === 0}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-inset) disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft size={16} /> Zurück
          </button>
          <button
            type="button"
            onClick={weiter}
            className="ml-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold bg-(--mode-primary) text-white hover:bg-(--mode-primary-light) transition-colors min-w-0"
          >
            <span className="truncate">{letzter ? 'Präsentation beenden' : `Weiter: ${naechster.titel}`}</span>
            {!letzter && <ArrowRight size={15} className="shrink-0" />}
          </button>
        </div>
        {!minimiert && (
          <div className="px-4 pb-3 -mt-1 text-[11px] text-(--text-tertiary)">
            Leertaste oder Pfeil rechts: weiter · Pfeil links: zurück · Esc: beenden
          </div>
        )}
      </div>
    </div>,
    root,
  );
}
