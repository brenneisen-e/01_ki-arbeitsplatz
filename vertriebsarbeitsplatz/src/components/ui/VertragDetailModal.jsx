import { X, ExternalLink, FileText, Calendar, Building2, Euro, User } from 'lucide-react';
import { SparteBadge, StatusBadge } from './Badge';
import LogoImg from './LogoImg';
import { formatEur } from '../../utils/formatters';
import { useMode } from '../../hooks/useMode';
import { getKundeById } from '../../data';

export default function VertragDetailModal({ vertrag, onClose }) {
  const { modeId, config, navigateTo } = useMode();

  if (!vertrag) return null;

  const kundeExists = vertrag.kundeId ? !!getKundeById(modeId, vertrag.kundeId) : false;

  const handleOpenKunde = () => {
    if (kundeExists) {
      navigateTo('detail', { kundeId: vertrag.kundeId, tab: 'stammdaten' });
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg pointer-events-auto animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-6 py-4 rounded-t-2xl flex items-center justify-between"
            style={{ background: config.colors.gradient }}
          >
            <div className="flex items-center gap-3 text-white">
              <FileText size={20} />
              <div>
                <h3 className="font-semibold text-sm">Vertragsdetails</h3>
                <span className="text-white/70 text-xs">{vertrag.id}</span>
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-1">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Kunde */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                {(vertrag.kunde || '??').split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-800">{vertrag.kunde || 'Unbekannt'}</div>
                <div className="text-xs text-slate-400">{vertrag.kundeId}</div>
              </div>
              {kundeExists && (
                <button
                  onClick={handleOpenKunde}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors text-white"
                  style={{ backgroundColor: config.colors.primary }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = config.colors.primaryLight}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = config.colors.primary}
                >
                  <User size={14} />
                  Kunde öffnen
                </button>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <DetailRow icon={<FileText size={14} />} label="Produkt" value={vertrag.produkt} />
              <DetailRow icon={<Calendar size={14} />} label="Datum" value={vertrag.datum} />
              <DetailRow
                icon={<Building2 size={14} />}
                label="Versicherer"
                value={
                  <div className="flex items-center gap-1.5">
                    <LogoImg name={vertrag.versicherer || vertrag.institut} size={16} />
                    <span>{vertrag.versicherer || vertrag.institut}</span>
                  </div>
                }
              />
              <DetailRow
                icon={<Euro size={14} />}
                label="Beitrag"
                value={`${formatEur(vertrag.beitrag)}${vertrag.beitragsart ? '/' + vertrag.beitragsart : ''}`}
              />
            </div>

            {/* Sparte & Status */}
            <div className="flex items-center gap-4 pt-3 border-t border-slate-100">
              <div>
                <span className="text-xs text-slate-400 block mb-1">Sparte</span>
                {vertrag.sparte ? <SparteBadge sparte={vertrag.sparte} /> : <span className="text-sm text-slate-500">–</span>}
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-1">Status</span>
                {vertrag.status ? <StatusBadge status={vertrag.status} /> : <span className="text-sm text-slate-500">–</span>}
              </div>
              {vertrag.provision && (
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Provision</span>
                  <span className="text-sm font-mono font-medium text-slate-700">{formatEur(vertrag.provision)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-slate-50 rounded-b-2xl flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
            >
              Schließen
            </button>
            {kundeExists && (
              <button
                onClick={handleOpenKunde}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors"
                style={{ backgroundColor: config.colors.primary }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = config.colors.primaryLight}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = config.colors.primary}
              >
                <ExternalLink size={14} />
                Kundenmaske öffnen
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="flex items-center gap-1 text-xs text-slate-400">{icon} {label}</span>
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  );
}
