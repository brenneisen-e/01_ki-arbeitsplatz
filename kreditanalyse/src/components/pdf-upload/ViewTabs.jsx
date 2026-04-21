/**
 * ViewTabs.jsx
 *
 * Tab-Umschalter der PDF-Upload-Seite. Trennt die Ergebnisansicht
 * (gruppierte Parser-Treffer) von der Bilderanleitung durch SAP Complex
 * Loans.
 */

import { ClipboardList, BookOpen } from 'lucide-react';

const TABS = [
  { key: 'result', label: 'Extraktionsergebnis', icon: ClipboardList },
  { key: 'guide', label: 'Bilderanleitung SAP Complex Loans', icon: BookOpen },
];

export default function ViewTabs({ activeTab, onChange }) {
  return (
    <div className="flex items-end gap-0 border-b border-border">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={
              'flex items-center gap-2 px-4 py-2.5 text-sm font-body border-b-2 -mb-px transition-colors ' +
              (active
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-text-muted hover:text-text-primary')
            }
          >
            <Icon size={14} strokeWidth={1.5} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
