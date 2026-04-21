/**
 * GuideStepCard.jsx
 *
 * Ein einzelner Schritt der Bilderanleitung: links die Erklärung (Kapitel,
 * Beschreibung, zugeordnete Parser-Treffer), rechts die stilisierte
 * SAP-Maske mit dem hervorgehobenen Zielfeld.
 */

import { BookOpen, ArrowDownToLine } from 'lucide-react';
import SapMaskMockup from './SapMaskMockup';
import { MASKEN_MAPPING } from '../../../data/maskenMapping';

export default function GuideStepCard({ step, parserHits = [] }) {
  const relevantHits = parserHits.filter((h) => step.mappedKeys?.includes(h.key));

  return (
    <section
      id={step.id}
      className="bg-surface-card border border-border rounded-lg overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
        {/* Erklärtext */}
        <div className="lg:col-span-2 p-5 border-b lg:border-b-0 lg:border-r border-border bg-slate-50/60">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 font-semibold text-sm font-mono">
              {step.id.match(/step-(\d+)/)?.[1] || '•'}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-headline font-semibold text-text-primary leading-snug">
                {step.title}
              </h3>
              <p className="text-xs text-text-secondary font-body mt-2 leading-relaxed">
                {step.description}
              </p>
              {step.handbuchRef && (
                <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-text-muted font-body">
                  <BookOpen size={11} strokeWidth={1.5} />
                  <span>SAP-Handbuch: {step.handbuchRef}</span>
                </div>
              )}

              {relevantHits.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary font-body mb-1.5">
                    <ArrowDownToLine size={11} strokeWidth={1.5} />
                    Werte aus dem aktuell hochgeladenen PDF:
                  </div>
                  <ul className="space-y-1">
                    {relevantHits.map((h) => {
                      const m = MASKEN_MAPPING[h.key];
                      return (
                        <li
                          key={h.key}
                          className="text-[11px] font-body text-text-primary bg-primary/5 border border-primary/15 rounded px-2 py-1 flex items-baseline gap-2"
                        >
                          <span className="text-text-muted">{m?.label || h.key}:</span>
                          <span className="font-mono">{String(h.value)}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SAP-Masken-Mockup */}
        <div className="lg:col-span-3 p-5 bg-slate-100/40">
          <SapMaskMockup
            title={step.tabTitle}
            breadcrumb={step.breadcrumb}
            tabs={step.tabs}
            fields={step.fields}
            highlightedNote={step.highlightedNote}
          />
        </div>
      </div>
    </section>
  );
}
