import { createPortal } from 'react-dom';
import { X, ExternalLink, FileText, Calendar, Building2, Euro, User } from 'lucide-react';
import { SparteBadge, StatusBadge } from './Badge';
import LogoImg from './LogoImg';
import { formatEur } from '../../utils/formatters';
import { useMode } from '../../hooks/useMode';
import useTranslation from '../../i18n/useTranslation';
import { getKundeById } from '../../data';

export default function VertragDetailModal({ vertrag, onClose }) {
  const { modeId, navigateTo } = useMode();
  const { t } = useTranslation();

  if (!vertrag) return null;

  const kundeExists = vertrag.kundeId ? !!getKundeById(modeId, vertrag.kundeId) : false;

  const handleOpenKunde = () => {
    if (kundeExists) {
      navigateTo('detail', { kundeId: vertrag.kundeId, tab: 'stammdaten' });
      onClose();
    }
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 backdrop-blur-sm"
        style={{ background: 'rgba(28, 26, 23, 0.45)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="surface-elevated rounded-2xl w-full max-w-lg pointer-events-auto animate-scale-in overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header: weiße Fläche, Modus-Hairline oben, Icon in Modusfarbe */}
          <div
            className="px-6 py-4 flex items-center justify-between border-b border-(--border-light)"
            style={{ boxShadow: 'inset 0 3px 0 var(--mode-primary)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-(--mode-pastel) flex items-center justify-center text-(--mode-primary)">
                <FileText size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-(--text-primary)">{t('vertragsdetails')}</h3>
                <span className="text-xs text-(--text-tertiary) font-mono">{vertrag.id}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-(--text-tertiary) hover:text-(--text-primary) hover:bg-(--bg-inset) transition-colors"
              aria-label={t('schliessen')}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Kunde */}
            <div className="flex items-center gap-3 pb-4 border-b border-(--border-light)">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                style={{ background: 'var(--mode-primary)' }}
              >
                {(vertrag.kunde || '??').split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-(--text-primary)">{vertrag.kunde || 'Unbekannt'}</div>
                <div className="text-xs text-(--text-tertiary) font-mono">{vertrag.kundeId}</div>
              </div>
              {kundeExists && (
                <button
                  onClick={handleOpenKunde}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors text-white bg-(--mode-primary) hover:bg-(--mode-primary-light)"
                >
                  <User size={14} />
                  {t('kundeOeffnen')}
                </button>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <DetailRow icon={<FileText size={14} />} label="Produkt" value={vertrag.produkt} />
              <DetailRow icon={<Calendar size={14} />} label="Datum" value={vertrag.datum} mono />
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
                mono
              />
            </div>

            {/* Sparte & Status */}
            <div className="flex items-center gap-4 pt-3 border-t border-(--border-light)">
              <div>
                <span className="text-xs text-(--text-tertiary) block mb-1">Sparte</span>
                {vertrag.sparte ? <SparteBadge sparte={vertrag.sparte} /> : <span className="text-sm text-(--text-secondary)">–</span>}
              </div>
              <div>
                <span className="text-xs text-(--text-tertiary) block mb-1">Status</span>
                {vertrag.status ? <StatusBadge status={vertrag.status} /> : <span className="text-sm text-(--text-secondary)">–</span>}
              </div>
              {vertrag.provision && (
                <div>
                  <span className="text-xs text-(--text-tertiary) block mb-1">Provision</span>
                  <span className="text-sm font-mono font-medium text-(--mode-accent)">{formatEur(vertrag.provision)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-(--bg-inset) border-t border-(--border-light) flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-card) transition-colors"
            >
              {t('schliessen')}
            </button>
            {kundeExists && (
              <button
                onClick={handleOpenKunde}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors bg-(--mode-primary) hover:bg-(--mode-primary-light)"
              >
                <ExternalLink size={14} />
                {t('kundenmaskeOeffnen')}
              </button>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

function DetailRow({ icon, label, value, mono = false }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="flex items-center gap-1 text-xs text-(--text-tertiary)">{icon} {label}</span>
      <span className={`font-medium text-(--text-primary)${mono ? ' font-mono' : ''}`}>{value}</span>
    </div>
  );
}
