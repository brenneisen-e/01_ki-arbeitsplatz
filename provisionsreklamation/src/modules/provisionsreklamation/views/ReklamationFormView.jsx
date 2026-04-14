import { FileText } from 'lucide-react';
import ReklamationForm from '../components/ReklamationForm';
import VermittlerInbox from '../components/VermittlerInbox';

export default function ReklamationFormView({ onSubmit, inboxVorgaenge = [], onMarkAntwortGelesen }) {
  // Wenn es unquittierte Antworten vom Provisionsservice gibt, übernimmt der
  // Vermittler-Inbox die komplette Tab-Fläche — der Nutzer ist „in der
  // Perspektive des Vermittlers" und sieht die Antwort zum Vorgang.
  if (inboxVorgaenge.length > 0) {
    return (
      <VermittlerInbox
        vorgaenge={inboxVorgaenge}
        onMarkGelesen={onMarkAntwortGelesen}
      />
    );
  }

  return (
    <div className="p-6 animate-fade-in-up">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <FileText size={16} className="text-blue-500" strokeWidth={1.75} />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">Provisionsreklamation einreichen</h2>
        </div>
        <p className="text-sm text-slate-500">
          Reichen Sie hier Ihre Provisionsreklamation ein. Alle Pflichtfelder sind mit <span className="text-red-400">*</span> gekennzeichnet.
          Nach Einreichung wird Ihr Vorgang automatisch durch unsere KI-gestützte Vorprüfung analysiert.
        </p>
      </div>
      <ReklamationForm onSubmit={onSubmit} />
    </div>
  );
}
