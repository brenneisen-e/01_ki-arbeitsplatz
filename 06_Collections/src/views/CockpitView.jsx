import { useMemo, useState } from 'react';
import { clsx } from 'clsx';
import {
  Sparkles, Bot, Phone, Mail, CalendarClock, AlertTriangle, Check, ChevronDown,
  ChevronRight, ShieldCheck, ClipboardCheck, X, FileText, Handshake, Search,
} from 'lucide-react';
import { buildTagesbriefing } from '../data/briefing';
import { buildNbaQueue, prioStufe } from '../data/nextBestActions';
import { buildAgentenStatus, AGENTEN } from '../data/agents';
import { buildSchritte } from '../data/kiAnalyse';
import { getFullCustomerData, SEGMENT_LABEL } from '../data/customerDetails';
import { PORTFOLIO_KPIS } from '../data/portfolio';
import { useCollections } from '../hooks/useCollections';
import { Card, Badge, Modal, EmptyState } from '../components/ui/primitives';
import { euro, zahl, datumLang } from '../utils/format';

const TYP_ICON = {
  anruf: Phone,
  mahnung: Mail,
  ratenplan: Handshake,
  eskalation: AlertTriangle,
  pruefung: Search,
  freigabe: ShieldCheck,
  aufgabe: ClipboardCheck,
};

function KpiStrip() {
  const werte = PORTFOLIO_KPIS.filter(k => k.id !== 'aufgaben');
  return (
    <div className="flex items-center gap-6 flex-wrap text-sm">
      {werte.map(k => (
        <div key={k.id} className="flex items-baseline gap-2">
          <span className="text-slate-500 text-xs">{k.label}</span>
          <span className={clsx('font-semibold tabular-nums', k.highlight ? 'text-emerald-600' : 'text-slate-900')}>
            {k.value}
          </span>
          {k.change && (
            <span className={clsx('text-[11px]',
              k.change.sentiment === 'positive' ? 'text-emerald-600'
                : k.change.sentiment === 'negative' ? 'text-red-600' : 'text-slate-400')}>
              {k.change.text}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function ErledigenDialog({ aktion, onClose, onSpeichern }) {
  const [notiz, setNotiz] = useState('');
  return (
    <Modal
      offen
      onClose={onClose}
      titel="Aktion abschließen"
      subtitel={aktion.titel}
      breite="max-w-lg"
      footer={
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
            Abbrechen
          </button>
          <button
            onClick={() => onSpeichern(notiz.trim())}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
            style={{ background: 'var(--mode-primary)' }}
          >
            <Check size={15} strokeWidth={2.2} /> Erledigt
          </button>
        </div>
      }
    >
      <div className="p-6 space-y-4">
        <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-[13px] text-slate-700">
          {aktion.begruendung}
        </div>
        <label className="block">
          <span className="block text-xs font-semibold text-slate-700 mb-1.5">Ergebnis (wird in der Akte dokumentiert)</span>
          <textarea
            rows={3} value={notiz} onChange={e => setNotiz(e.target.value)}
            placeholder="Was wurde erreicht oder vereinbart?"
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </label>
      </div>
    </Modal>
  );
}

function FallWert({ label, wert, ton }) {
  return (
    <div className="rounded-lg bg-white border border-slate-200 px-3 py-2">
      <div className="text-[9px] uppercase tracking-wide text-slate-500 leading-tight">{label}</div>
      <div className={clsx('text-[13px] font-semibold mt-0.5 tabular-nums', ton || 'text-slate-900')}>{wert}</div>
    </div>
  );
}

function NbaZeile({ aktion, offen, onToggle, onAkte, onErledigen, onVerschieben, onVerwerfen, onFreigeben }) {
  const Icon = TYP_ICON[aktion.typ] || ClipboardCheck;
  const prio = prioStufe(aktion.score);
  const istFreigabe = aktion.typ === 'freigabe';
  const customer = aktion.akteVorhanden ? getFullCustomerData(aktion.kundeId) : null;
  const schritte = customer ? buildSchritte(customer) : [];

  const sekundaer = 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors';

  return (
    <div className={clsx(istFreigabe && 'bg-amber-50/50', offen && !istFreigabe && 'bg-slate-50/70')}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={offen}
        className="w-full px-5 py-3.5 flex items-center gap-3.5 text-left hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <span
          className={clsx('w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
            istFreigabe ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600')}
        >
          <Icon size={16} strokeWidth={1.8} />
        </span>

        <span className="flex-1 min-w-0 block">
          <span className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-slate-800">{aktion.titel}</span>
            <Badge color={prio.color} bg={prio.bg}>{prio.label}</Badge>
            {istFreigabe && <Badge color="#92400e" bg="#fef3c7">Agent wartet auf Freigabe</Badge>}
          </span>
          <span className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 flex-wrap">
            <span>{aktion.kundeId}</span>
            <span className="text-slate-300">·</span>
            <span className={clsx(aktion.ueberfaellig && 'text-red-600 font-medium')}>{aktion.faellig}</span>
            {aktion.effekt != null && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-emerald-700">Erwartete Recovery {euro(aktion.effekt)}</span>
              </>
            )}
            <span className="text-slate-300">·</span>
            <span>Konfidenz {aktion.konfidenz} %</span>
          </span>
        </span>

        <ChevronDown
          size={16}
          className={clsx('shrink-0 text-slate-400 transition-transform', offen && 'rotate-180')}
        />
      </button>

      {offen && (
        <div className="px-5 pb-4 pl-[4.4rem] space-y-3">
          <div className="rounded-lg bg-white border border-slate-200 px-3.5 py-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">
              Warum diese Aktion?
            </div>
            <p className="text-[13px] text-slate-700 leading-relaxed">{aktion.begruendung}</p>
          </div>

          {customer && (
            <div className="grid grid-cols-4 gap-2">
              <FallWert label="Offene Forderung" wert={euro(customer.gesamtforderung || 0)} />
              <FallWert
                label="Verzug"
                wert={customer.dpd > 0 ? `${zahl(customer.dpd)} Tage` : 'kein Verzug'}
                ton={customer.dpd > 90 ? 'text-red-600' : customer.dpd > 30 ? 'text-amber-600' : undefined}
              />
              <FallWert label="Segment" wert={SEGMENT_LABEL[customer.segment] ?? customer.segment} />
              <FallWert label="Mahnstufe" wert={customer.mahnstufe > 0 ? `Stufe ${customer.mahnstufe}` : 'keine'} />
            </div>
          )}

          {!istFreigabe && schritte.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                Empfohlenes Vorgehen der KI
              </div>
              <div className="space-y-1">
                {schritte.map(s => (
                  <div key={s.was} className="flex items-baseline gap-2 text-[13px] text-slate-700">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide w-24 shrink-0">{s.wann}</span>
                    {s.was}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            {istFreigabe ? (
              <>
                <button
                  onClick={() => onFreigeben(aktion)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
                  style={{ background: 'var(--mode-primary)' }}
                >
                  <Check size={13} strokeWidth={2.4} /> Freigeben
                </button>
                <button onClick={() => onVerwerfen(aktion)} className={sekundaer}>
                  <X size={13} /> Ablehnen
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onErledigen(aktion)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
                  style={{ background: 'var(--mode-primary)' }}
                >
                  <Check size={13} strokeWidth={2.4} /> Ausführen
                </button>
                <button onClick={() => onVerschieben(aktion)} className={sekundaer}>
                  <CalendarClock size={13} strokeWidth={1.9} /> Auf morgen
                </button>
                <button onClick={() => onVerwerfen(aktion)} className={sekundaer}>
                  <X size={13} /> Verwerfen
                </button>
              </>
            )}
            {aktion.akteVorhanden && (
              <button onClick={() => onAkte(aktion.kundeId)} className={sekundaer}>
                <FileText size={13} strokeWidth={1.9} /> Akte öffnen
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CockpitView() {
  const {
    nbaEntfernt, nbaEntfernen, freigegeben, freigabeErteilen, oeffneCrm, toast, setChatOffen,
  } = useCollections();
  const [dialog, setDialog] = useState(null);
  const [zeigeAlle, setZeigeAlle] = useState(false);
  const [offenKey, setOffenKey] = useState(null);

  const queue = useMemo(() => buildNbaQueue(nbaEntfernt, freigegeben), [nbaEntfernt, freigegeben]);
  const briefing = useMemo(() => buildTagesbriefing(nbaEntfernt, freigegeben), [nbaEntfernt, freigegeben]);
  const agenten = useMemo(() => buildAgentenStatus(freigegeben), [freigegeben]);

  const sichtbar = zeigeAlle ? queue : queue.slice(0, 8);

  const erledigen = (aktion, notiz) => {
    nbaEntfernen(aktion.key);
    setDialog(null);
    toast(
      notiz
        ? `„${aktion.titel}" erledigt — Ergebnis in der Akte dokumentiert.`
        : `„${aktion.titel}" erledigt.`,
      'success',
    );
    if (aktion.akteVorhanden) {
      setTimeout(() => oeffneCrm(aktion.kundeId, { sektion: 'kommunikation' }), 400);
    }
  };

  const freigeben = aktion => {
    freigabeErteilen(`${aktion.freigabe.kundeId}:${aktion.freigabe.aktionId}`);
    toast(`Freigabe erteilt — ${AGENTEN[aktion.freigabe.agent].name} führt „${aktion.titel.split(':')[0]}" aus.`, 'success');
  };

  return (
    <div className="px-6 py-6 space-y-5">
      {/* Briefing + Agenten-Status */}
      <div className="grid grid-cols-[1.7fr_1fr] gap-5 items-start">
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white"
              style={{ background: 'var(--mode-gradient)' }}
            >
              <Sparkles size={19} strokeWidth={1.8} />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Ihr Tagesbriefing</h2>
              <div className="text-xs text-slate-500">{datumLang('2025-12-15')} · erzeugt vom Dossier-Agenten um 06:05 Uhr</div>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-[14px] text-slate-700 leading-relaxed">
            {briefing.absaetze.map((a, i) => <p key={i}>{a}</p>)}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-2">
              Drei Dinge zuerst
            </div>
            <div className="space-y-1.5">
              {briefing.schwerpunkte.map((s, i) => (
                <button
                  key={i}
                  onClick={() => s.kundeId && oeffneCrm(s.kundeId)}
                  className={clsx('w-full flex items-center gap-3 text-left rounded-lg px-3 py-2 transition-colors',
                    s.kundeId ? 'hover:bg-slate-50' : 'cursor-default')}
                >
                  <span
                    className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0"
                    style={{ background: 'var(--mode-primary)' }}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium text-slate-800 truncate">{s.titel}</span>
                    <span className="block text-[11px] text-slate-500">{s.grund}</span>
                  </span>
                  {s.kundeId && <ChevronRight size={14} className="text-slate-300 shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Bot size={17} className="text-slate-500" strokeWidth={1.8} />
            <h3 className="text-sm font-semibold text-slate-800 flex-1">Agenten über Nacht</h3>
            <Badge color="#047857" bg="#ecfdf5">{zahl(agenten.autonomHeute)} Aktionen</Badge>
          </div>
          <div className="space-y-2.5">
            {agenten.agenten.filter(a => a.id !== 'dossieragent').map(a => (
              <div key={a.id} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-slate-800">{a.name}</div>
                  <div className="text-[11px] text-slate-500 leading-snug">{a.beschreibung}</div>
                </div>
              </div>
            ))}
          </div>
          <div
            className={clsx('mt-4 rounded-lg px-3 py-2.5 text-[13px] font-medium flex items-center gap-2',
              agenten.offeneFreigaben.length ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200')}
          >
            <ShieldCheck size={15} strokeWidth={1.9} className="shrink-0" />
            {agenten.offeneFreigaben.length
              ? `${agenten.offeneFreigaben.length} Vorschläge warten auf Ihre Freigabe — siehe Warteschlange.`
              : 'Keine offenen Freigaben — alle Agenten laufen im Rahmen.'}
          </div>
          <button
            onClick={() => setChatOffen(true)}
            className="mt-3 w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Assistenten fragen
          </button>
        </Card>
      </div>

      {/* Kompakte KPI-Zeile */}
      <Card className="px-5 py-3">
        <KpiStrip />
      </Card>

      {/* NBA-Queue */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Nächste beste Aktionen</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {zahl(queue.length)} offene Aktionen, nach Wirkung und Fälligkeit priorisiert — Klick auf eine Aktion zeigt Begründung, Fall-Kennzahlen und das empfohlene Vorgehen.
            </p>
          </div>
          <Badge color="#b91c1c" bg="#fef2f2">
            {zahl(queue.filter(q => q.ueberfaellig).length)} überfällig
          </Badge>
        </div>

        <div className="divide-y divide-slate-100">
          {sichtbar.map(a => (
            <NbaZeile
              key={a.key}
              aktion={a}
              offen={offenKey === a.key}
              onToggle={() => setOffenKey(k => (k === a.key ? null : a.key))}
              onAkte={id => oeffneCrm(id)}
              onErledigen={setDialog}
              onVerschieben={x => { nbaEntfernen(x.key); toast(`„${x.titel}" auf morgen verschoben.`, 'info'); }}
              onVerwerfen={x => { nbaEntfernen(x.key); toast(`„${x.titel}" verworfen — fließt in das Lernen der Priorisierung ein.`, 'info'); }}
              onFreigeben={freigeben}
            />
          ))}
          {!queue.length && <EmptyState text="Alles abgearbeitet — keine offenen Aktionen." />}
        </div>

        {queue.length > 8 && (
          <button
            onClick={() => setZeigeAlle(v => !v)}
            className="w-full py-2.5 text-xs font-semibold text-slate-600 border-t border-slate-100 hover:bg-slate-50 transition-colors"
          >
            {zeigeAlle ? 'Weniger anzeigen' : `Alle ${zahl(queue.length)} Aktionen anzeigen`}
          </button>
        )}
      </Card>

      {dialog && (
        <ErledigenDialog
          aktion={dialog}
          onClose={() => setDialog(null)}
          onSpeichern={notiz => erledigen(dialog, notiz)}
        />
      )}
    </div>
  );
}
