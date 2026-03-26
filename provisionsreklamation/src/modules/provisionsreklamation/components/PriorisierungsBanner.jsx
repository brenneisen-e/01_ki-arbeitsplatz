import { AlertTriangle } from 'lucide-react';

export default function PriorisierungsBanner({ count, onShowDetails }) {
  if (!count || count === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
          <AlertTriangle size={18} className="text-amber-600" strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-medium text-amber-800">
            {count} {count === 1 ? 'Vorgang' : 'Vorgänge'} mit erkannten Auffälligkeiten
          </p>
          <p className="text-xs text-amber-600">
            Mögliche systemische Fehler in der Provisionsberechnung. Sofortige Prüfung empfohlen.
          </p>
        </div>
      </div>
      <button
        onClick={onShowDetails}
        className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors whitespace-nowrap"
      >
        Details anzeigen
      </button>
    </div>
  );
}
