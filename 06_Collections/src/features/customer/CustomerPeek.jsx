import { useMemo } from 'react';
import { Sparkles, Phone, Mail, ArrowRight, ChevronRight } from 'lucide-react';
import { getFullCustomerData, stage, letzteZahlung } from '../../data/customerDetails';
import { buildKurzlage } from '../../data/copilot';
import { buildNbaQueue, prioStufe } from '../../data/nextBestActions';
import { useCollections } from '../../hooks/useCollections';
import { Modal, Badge, WaScore } from '../../components/ui/primitives';
import { euro, zahl } from '../../utils/format';
import { SEGMENT_TON, KpiZelle } from './sections';

/**
 * Schnellblick auf einen Fall: Kopf, vier Kennzahlen, KI-Kurzlage und die
 * nächste beste Aktion. Alles Tiefere lebt in der Akte (Vollprofil) — der
 * Schnellblick ist bewusst eine einzige, kompakte Karte ohne Reiter.
 */
export default function CustomerPeek() {
  const { detailKunde, schliesseKunde, oeffneCrm, nbaEntfernt, freigegeben, toast } = useCollections();

  const customer = detailKunde ? getFullCustomerData(detailKunde.id) : null;
  const naechste = useMemo(() => {
    if (!detailKunde) return null;
    return buildNbaQueue(nbaEntfernt, freigegeben).find(q => q.kundeId === detailKunde.id) || null;
  }, [detailKunde, nbaEntfernt, freigegeben]);

  if (!detailKunde || !customer) return null;

  const seg = SEGMENT_TON[customer.segment] || SEGMENT_TON.unbekannt;
  const stufe = stage(customer);
  const zahlung = letzteZahlung(customer);
  const prio = naechste ? prioStufe(naechste.score) : null;

  const akteOeffnen = sektion => {
    const id = detailKunde.id;
    schliesseKunde();
    oeffneCrm(id, sektion ? { sektion } : {});
  };

  return (
    <Modal
      offen
      onClose={schliesseKunde}
      titel={customer.name}
      subtitel={[detailKunde.id, customer.type, customer.branche].filter(Boolean).join(' · ')}
      breite="max-w-2xl"
      kopfExtra={
        <div className="flex items-center gap-2">
          <Badge color={seg.color} bg={seg.bg}>{seg.label}</Badge>
          <WaScore willingness={customer.willingness} ability={customer.ability} kompakt />
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toast(`Anruf an ${customer.name} wird aufgebaut …`, 'info')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Phone size={13} strokeWidth={1.9} /> Anrufen
            </button>
            <button
              onClick={() => akteOeffnen('kommunikation')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Mail size={13} strokeWidth={1.9} /> Entwurf schreiben
            </button>
          </div>
          <button
            onClick={() => akteOeffnen()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
            style={{ background: 'var(--mode-primary)' }}
          >
            Akte öffnen <ArrowRight size={15} />
          </button>
        </div>
      }
    >
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-4 gap-3">
          <KpiZelle label="Forderung" wert={euro(customer.gesamtforderung)} tone={customer.gesamtforderung > 0 ? 'danger' : 'success'} />
          <KpiZelle label="Verzug" wert={`${zahl(customer.dpd)} Tage`} tone={stufe === 3 ? 'danger' : undefined} />
          <KpiZelle label="Stage / Mahnstufe" wert={`${stufe} / M${customer.mahnstufe || 0}`} />
          <KpiZelle
            label="Letzte Zahlung"
            wert={zahlung ? euro(zahlung.betrag) : '–'}
            tone={zahlung ? 'success' : undefined}
          />
        </div>

        <div className="rounded-xl p-4" style={{ background: seg.bg, border: `1px solid ${seg.color}22` }}>
          <div className="flex items-start gap-2.5">
            <Sparkles size={16} className="shrink-0 mt-0.5" style={{ color: seg.color }} strokeWidth={1.9} />
            <div className="min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-wide mb-1" style={{ color: seg.color }}>
                KI-Kurzlage
              </div>
              <p className="text-[13px] text-slate-700 leading-relaxed">{buildKurzlage(customer)}</p>
            </div>
          </div>
        </div>

        {naechste && (
          <button
            onClick={() => akteOeffnen()}
            className="w-full flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
          >
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Nächste beste Aktion</span>
                {prio && <Badge color={prio.color} bg={prio.bg}>{prio.label}</Badge>}
              </span>
              <span className="block text-[13px] font-medium text-slate-800 mt-1 truncate">{naechste.titel}</span>
              <span className="block text-[11px] text-slate-500 mt-0.5">{naechste.faellig} · Konfidenz {naechste.konfidenz} %</span>
            </span>
            <ChevronRight size={16} className="text-slate-300 shrink-0" />
          </button>
        )}
      </div>
    </Modal>
  );
}
