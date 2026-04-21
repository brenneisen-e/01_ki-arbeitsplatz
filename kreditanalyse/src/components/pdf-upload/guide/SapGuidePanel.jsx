/**
 * SapGuidePanel.jsx
 *
 * Oberer Einstieg in die Bilderanleitung für SAP S/4HANA Banking for
 * Complex Loans. Zeigt alle Guide-Schritte chronologisch (Partner anlegen
 * → Finanzierung → Syndizierung → Konditionen → Ziehung → Referenzen →
 * Covenants) und blendet oberhalb eine Kurz-Sprungleiste ein.
 *
 * Wenn bereits eine PDF geparst wurde, werden die passenden Werte pro
 * Schritt eingeblendet.
 */

import { BookOpen } from 'lucide-react';
import GuideStepCard from './GuideStepCard';
import { SAP_GUIDE_STEPS } from '../../../data/sapGuideSteps';

export default function SapGuidePanel({ parserHits = [] }) {
  return (
    <div className="space-y-5">
      {/* Einleitung */}
      <div className="bg-surface-card border border-border rounded-lg p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <BookOpen size={18} strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-headline font-semibold text-text-primary">
              Bilderanleitung: Konsortialkredit in SAP Complex Loans erfassen
            </h3>
            <p className="text-xs text-text-secondary font-body mt-1.5 leading-relaxed max-w-3xl">
              Die folgende Schritt-für-Schritt-Anleitung zeigt, in welche Masken des
              Finanzierungsarbeitsplatzes von SAP S/4HANA Banking for Complex Loans die
              einzelnen Werte eines Konsortialvertrags eingetragen werden. Aufbau und
              Feldbezeichnungen folgen dem offiziellen SAP-Handbuch
              (Dokumentversion 1.0, 23.01.2026). Die dargestellten Masken sind stilisierte
              Nachbildungen der Fiori-Oberfläche; gelb hervorgehobene Felder zeigen,
              welche Werte aus dem Konsortialvertrag im jeweiligen Schritt erfasst werden.
            </p>
          </div>
        </div>

        {/* Sprungleiste */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {SAP_GUIDE_STEPS.map((s, idx) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-body text-text-secondary bg-gray-100 hover:bg-primary/10 hover:text-primary border border-border transition-colors"
            >
              <span className="font-mono mr-1.5 text-text-muted">{idx + 1}.</span>
              {s.title.replace(/^\d+\.\s*/, '')}
            </a>
          ))}
        </div>
      </div>

      {/* Schritte */}
      <div className="space-y-5">
        {SAP_GUIDE_STEPS.map((step) => (
          <GuideStepCard key={step.id} step={step} parserHits={parserHits} />
        ))}
      </div>
    </div>
  );
}
