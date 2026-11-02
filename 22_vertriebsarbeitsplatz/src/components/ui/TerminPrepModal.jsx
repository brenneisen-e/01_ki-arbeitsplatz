import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Sparkles, Calendar, Clock, MapPin, Target, User, CheckSquare,
  ListChecks, MessageSquare, FileText, Loader2, Phone, Mail, HelpCircle, ArrowRight,
  Wallet, Link2, Bot, Video, UserPlus, Send, Check,
} from 'lucide-react';
import { formatAppointmentDate, formatAppointmentTime, getSimulatedAppointment } from '../../utils/demoClock';
import { useMode } from '../../hooks/useMode';
import LogoImg from './LogoImg';
import { formatEur, berechneAnlagevolumen, berechneKreditvolumen, berechneHaushaltsnetto, berechneFrei } from '../../utils/formatters';
import useTranslation from '../../i18n/useTranslation';
import { tx } from '../../utils/langHelper';

// Portal-Ziel für Modals: der Modus-Wrapper (data-mode), damit die
// Modus-Tokens (Bordeaux, Oliv, Petrol) auch im Modal gelten. Er liegt
// oberhalb der transformierten Tab-Fläche, die sonst zum Bezugsrahmen der
// fixed-Positionierung würde. Fallback: document.body.
function portalRoot() {
  if (typeof document === 'undefined') return null;
  return document.querySelector('[data-mode]') || document.body;
}

/**
 * TerminPrepModal
 *
 * Wird geöffnet, wenn der Berater auf die bestätigte Terminzusage klickt.
 * Liefert eine KI-gestützte Gesprächsvorbereitung mit Kontext, konkreten
 * Gesprächsbausteinen sowie To-Dos vor und nach dem Termin.
 */
export default function TerminPrepModal({ kunde, termin, onClose }) {
  const { t, lang } = useTranslation();
  const [phase, setPhase] = useState('loading');
  const [kiOfferOpen, setKiOfferOpen] = useState(false);
  const [kiOfferMode, setKiOfferMode] = useState('avatar');
  const [kiOfferEskalation, setKiOfferEskalation] = useState(true);
  const [kiOfferSent, setKiOfferSent] = useState(false);
  const appointment = termin?.datum && termin?.zeit
    ? new Date(`${termin.datum}T${termin.zeit}:00`)
    : getSimulatedAppointment();
  const { navigateTo } = useMode();
  const isKlausImmo = kunde?.id === 'BK00001' && (!termin?.betreff || /immobilien|kredit/i.test(termin.betreff));
  // Insurance-Klaus-Showcase: Open-Finance-getriebene KFZ/Haftpflicht/Familienabsicherung-Demo.
  // Greift, wenn der Kunde KD00001 (Versicherungs-Klaus) ist — der heroTermin
  // bei „Nacht simulieren" trägt automatisch den Optimierungs-Betreff, kann
  // aber auch fehlen, dann fallen wir auf einen sinnvollen Default zurück.
  const isKlausVersicherung = kunde?.id === 'KD00001' && (!termin?.betreff || /optimierung|kfz|haftpflicht|familien|versicherung/i.test(termin.betreff));
  const terminTitel = termin?.betreff || (isKlausImmo
    ? t('tpm.titelKreditgespraech')
    : (isKlausVersicherung ? t('tpm.titelVersicherung') : t('tpm.titelBeratungstermin')));

  // KI-Generierung simulieren
  useEffect(() => {
    const tmr = setTimeout(() => setPhase('ready'), 1100);
    return () => clearTimeout(tmr);
  }, []);

  // ESC zum Schließen
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Portal in den Modus-Wrapper (portalRoot), damit transformierte Vorfahren das fixed-Modal
  // nicht in der Seitenmitte statt im Sichtfenster zentrieren.
  return createPortal(
    <div
      data-modal="terminprep"
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
      style={{ background: 'rgba(28, 26, 23, 0.45)' }}
      onClick={onClose}
    >
      <div
        className="surface-elevated w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b" style={{ borderColor: 'var(--border-light)', background: 'var(--bg-inset)' }}>
          <div className="flex items-start gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
              style={{ background: 'var(--mode-primary)' }}
            >
              <Sparkles size={22} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">{t('tpm.titel')}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {terminTitel} · {kunde?.name || t('tpm.kunde')}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="inline-flex items-center gap-1 text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                  <Calendar size={11} /> {formatAppointmentDate(appointment)}
                </span>
                <span className="inline-flex items-center gap-1 text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                  <Clock size={11} /> {formatAppointmentTime(appointment)}{lang === 'en' ? '' : ` ${t('tpm.uhr')}`}
                </span>
                <span className="inline-flex items-center gap-1 text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                  <MapPin size={11} /> {t('tpm.filialeGiessen')}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white transition-colors"
            aria-label={t('schliessen')}
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Body */}
        {phase === 'loading' ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20 text-center">
            <Loader2 size={26} className="animate-spin" style={{ color: 'var(--mode-primary)' }} />
            <div>
              <p className="text-sm font-semibold text-slate-700">{t('tpm.loadingTitel')}</p>
              <p className="text-xs text-slate-500 mt-1">
                {t('tpm.loadingSub')}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {/* Ausgangslage */}
            <Section color="indigo">
              <SectionTitle icon={Target} label={t('tpm.sec.ausgangslage')} color="indigo" />
              <div className="text-sm text-slate-700 leading-relaxed pt-2">
                {isKlausImmo ? (
                  <>{tx(
                    'Klaus Fischer (32) ist seit 2018 Kunde der Volksbank Mittelhessen. Er arbeitet als Vertriebsleiter bei Bosch, ist verheiratet mit Sabine und hat zwei Kinder (Lukas, 4 und Marie, 1). Nettohaushaltseinkommen: ca. 5.700 €/mtl. Die drei erkannten Signale (auslaufender Ratenkredit bei der Commerzbank, zuteilungsreifer Bausparvertrag und langjähriges Newsletter-Interesse) bilden einen sehr starken Vertriebsimpuls für ein Erstgespräch zur Immobilienfinanzierung.',
                    'Klaus Fischer (32) has been a customer of Volksbank Mittelhessen since 2018. He works as a sales manager at Bosch, is married to Sabine and has two children (Lukas, 4 and Marie, 1). Net household income: approx. €5,700/mo. The three detected signals (an expiring installment loan at Commerzbank, a building-savings contract ready for allocation, and long-standing newsletter interest) form a very strong sales trigger for an initial meeting on real estate financing.'
                  )}</>
                ) : isKlausVersicherung ? (
                  <>{tx(
                    'Klaus Fischer (42) ist seit 2018 Kunde, verheiratet mit Sarah, zwei Kinder (Lina, 7 und Max, 1), wohnt im EFH (145 m²) in Köln. Nettoeinkommen 4.200 €/Mon. Auslöser des Termins: Über die Open-Finance-Einwilligung wurden drei konkrete Optimierungsgelegenheiten erkannt: Die HUK-KFZ-Vollkasko liegt rund 160 €/J. über unserem Tarif, die Haftpflicht läuft separat bei einem Drittanbieter und ließe sich ohne Mehrkosten ins Bündel überführen, und die Familienabsicherung weist mehrere bekannte Lücken auf (BU 1.800 €/Mon. unter Bedarf, Hausrat unterversichert, keine Familien-Unfallversicherung).',
                    'Klaus Fischer (42) has been a customer since 2018, married to Sarah, two children (Lina, 7 and Max, 1), living in a detached house (145 m²) in Cologne. Net income €4,200/mo. Trigger for the meeting: the Open Finance consent revealed three concrete optimization opportunities: the HUK comprehensive motor cover is around €160/yr above our tariff, the liability cover runs separately with a third-party provider and could be moved into the bundle at no extra cost, and the family protection shows several known gaps (occupational disability €1,800/mo. below requirement, home contents underinsured, no family accident insurance).'
                  )}</>
                ) : (
                  <>{kunde?.name}{kunde?.alter ? ` (${kunde.alter})` : ''}
                  {kunde?.eigeneProdukte?.[0]?.seit ? tx(` ist seit ${kunde.eigeneProdukte[0].seit.slice(0,4)} Kunde`, ` has been a customer since ${kunde.eigeneProdukte[0].seit.slice(0,4)}`) : tx(' ist Kunde', ' is a customer')}
                  {kunde?.beruf ? tx(`, arbeitet als ${kunde.beruf}`, `, works as ${kunde.beruf}`) : ''}
                  {kunde?.arbeitgeber?.name ? tx(` bei ${kunde.arbeitgeber.name}`, ` at ${kunde.arbeitgeber.name}`) : ''}
                  {kunde?.familienstand ? `, ${kunde.familienstand}` : ''}
                  {kunde?.partner?.name ? tx(` mit ${kunde.partner.name}`, ` with ${kunde.partner.name}`) : ''}
                  {(kunde?.kinder?.length || 0) > 0 ? `, ${kunde.kinder.length} ${tx(kunde.kinder.length === 1 ? 'Kind' : 'Kinder', kunde.kinder.length === 1 ? 'child' : 'children')}` : ''}.
                  {' '}{tx('Anlass des Termins:', 'Reason for the meeting:')} <strong>{terminTitel}</strong>. {tx(
                    'Die KI hat Stammdaten, Bestand und letzte Kommunikation analysiert und unten passende Bausteine für die Vorbereitung zusammengestellt.',
                    'The AI analyzed master data, portfolio and recent communication and compiled suitable building blocks for the preparation below.'
                  )}</>
                )}
              </div>
            </Section>

            {/* Kennzahlen — Klaus-spezifische Story für die Immobilien-Demo */}
            {isKlausImmo && (
              <Section color="slate">
                <SectionTitle icon={FileText} label={t('tpm.sec.kennzahlen')} color="slate" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm pt-2">
                  <KPI label={t('tpm.kpi.freieLiquiditaet')} value={t('tpm.val.mtl')} accent="text-emerald-600" />
                  <KPI label={t('tpm.kpi.bausparZuteilung')} value={lang === 'en' ? '€30,000' : '30.000 €'} accent="text-emerald-600" />
                  <KPI label={t('tpm.kpi.vrSparkonto')} value={lang === 'en' ? '€15,000' : '15.000 €'} />
                  <KPI label={t('tpm.kpi.kreditrahmen')} value={lang === 'en' ? '€250,000' : '250.000 €'} accent="text-indigo-600" />
                </div>
              </Section>
            )}

            {/* Kennzahlen — Klaus-Versicherung-Story (KFZ + Haftpflicht + Familie) */}
            {isKlausVersicherung && (
              <Section color="slate">
                <SectionTitle icon={FileText} label={t('tpm.sec.kennzahlen')} color="slate" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm pt-2">
                  <KPI label={t('tpm.kpi.hukVollkasko')} value={t('tpm.val.proJahr780')} accent="text-amber-700" />
                  <KPI label={t('tpm.kpi.partnerTarif')} value={t('tpm.val.proJahr620')} accent="text-emerald-600" />
                  <KPI label={t('tpm.kpi.ersparnisKfz')} value={t('tpm.val.proJahrMinus160')} accent="text-emerald-700" />
                  <KPI label={t('tpm.kpi.buendelHaftpflicht')} value={t('tpm.val.ohneMehrkosten')} accent="text-emerald-600" />
                </div>
              </Section>
            )}

            {/* Kompakte Finanzübersicht inkl. externe Verbindungen */}
            <Section color="emerald">
              <SectionTitle icon={Wallet} label={t('tpm.sec.finanzuebersicht')} color="emerald" />
            {(() => {
              const haushalt = berechneHaushaltsnetto(kunde);
              const frei = berechneFrei(kunde);
              const anlage = berechneAnlagevolumen(kunde);
              const kredit = berechneKreditvolumen(kunde);
              const netto = anlage - kredit;
              return (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm pt-2">
                  <KPI label={t('tpm.fin.haushaltsnetto')} value={`${formatEur(haushalt)}${t('tpm.fin.proMtl')}`} />
                  <KPI label={t('tpm.fin.freiVerfuegbar')} value={`${formatEur(Math.max(0, frei))}${t('tpm.fin.proMtl')}`} accent="text-emerald-600" />
                  <KPI label={t('tpm.fin.anlagevolumen')} value={formatEur(anlage)} />
                  <KPI label={t('tpm.fin.kreditvolumen')} value={formatEur(kredit)} accent="text-amber-700" />
                  <KPI label={t('tpm.fin.nettoVermoegen')} value={formatEur(netto)} accent={netto >= 0 ? 'text-emerald-700' : 'text-red-600'} />
                </div>
              );
            })()}
            </Section>

            {/* Externe Verbindungen (Open Finance / FIDA) */}
            <Section color="sky">
              <SectionTitle icon={Link2} label={t('tpm.sec.externeVerbindungen')} color="sky" />
            {(() => {
              const fremd = kunde?.fremdProdukte || [];
              if (fremd.length === 0) {
                return <p className="text-xs text-slate-500 italic">{t('tpm.ext.keine')}</p>;
              }
              // Pro Institut zusammenfassen (analog OpenFinanceTab) — Volumen
              // pro Institut + Liste der Produktkategorien.
              const byInst = new Map();
              const cat = (p) => {
                const typ = p.typ || '';
                if (/depot|fonds/.test(typ)) return t('tpm.cat.depot');
                if (/tagesgeld|festgeld|sparkonto|bauspar/.test(typ)) return t('tpm.cat.sparGeldmarkt');
                if (/kredit|baufinanzierung|kffw|kfw/.test(typ)) return t('tpm.cat.kredit');
                if (/kfz|haftpflicht|hausrat|rlv|bu|du|unfall|rechtsschutz|wohngeb|lebensvers|pkv|vers/.test(typ)) return t('tpm.cat.versicherung');
                if (/giro|konto/.test(typ)) return t('tpm.cat.konto');
                return t('tpm.cat.sonstige');
              };
              fremd.forEach(p => {
                const inst = p.institut || '–';
                const entry = byInst.get(inst) || { institut: inst, vol: 0, kategorien: new Set(), consent: false };
                // Ohne Consent kennen wir die konkreten Werte nicht — wir
                // merken das Institut zwar, führen aber kein Volumen oder
                // Kategorie-Detail.
                if (p.consent) {
                  entry.vol += Number(p.volumen) || 0;
                  entry.kategorien.add(cat(p));
                  entry.consent = true;
                }
                byInst.set(inst, entry);
              });
              const list = Array.from(byInst.values()).sort((a, b) => b.vol - a.vol);
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                  {list.map((row, i) => (
                    <div key={i} className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2">
                      <LogoImg name={row.institut} size={22} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-700 truncate">{row.institut}</div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {row.consent ? (Array.from(row.kategorien).join(' · ') || '–') : t('tpm.ext.detailsGesperrt')}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-mono font-semibold text-slate-700">
                          {row.consent ? (row.vol > 0 ? formatEur(row.vol) : '–') : '•••'}
                        </div>
                        <div className={`text-[10px] font-medium ${row.consent ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {row.consent ? t('tpm.ext.consentOk') : t('tpm.ext.consentFehlt')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
            </Section>

            {/* Ziele */}
            {isKlausImmo && (
              <Section color="amber">
                <SectionTitle icon={Target} label={t('tpm.sec.gespraechsziele')} color="amber" />
                <ul className="list-disc list-inside text-sm text-slate-700 space-y-1 pt-2 pl-1">
                  <li>{t('tpm.immo.ziel1')}</li>
                  <li>{t('tpm.immo.ziel2')}</li>
                  <li>{t('tpm.immo.ziel3')}</li>
                  <li>{t('tpm.immo.ziel4')}</li>
                </ul>
              </Section>
            )}

            {/* Ziele — Versicherung-Klaus */}
            {isKlausVersicherung && (
              <Section color="amber">
                <SectionTitle icon={Target} label={t('tpm.sec.gespraechsziele')} color="amber" />
                <ul className="list-disc list-inside text-sm text-slate-700 space-y-1 pt-2 pl-1">
                  <li>{t('tpm.vers.ziel1')}</li>
                  <li>{t('tpm.vers.ziel2')}</li>
                  <li>{t('tpm.vers.ziel3')}</li>
                  <li>{t('tpm.vers.ziel4')}</li>
                </ul>
              </Section>
            )}

            {/* Gesprächsleitfaden — nur für die Klaus-Immo-Demo mit
                ausformuliertem Skript. Andere Termine bekommen einen
                generischen Phasen-Leitfaden weiter unten. */}
            {isKlausImmo && (
            <Section color="violet">
              <SectionTitle icon={MessageSquare} label={t('tpm.sec.gespraechsleitfaden')} color="violet" />
              <div className="space-y-2 pt-2">
              <LeitfadenStep nr={1} title={t('tpm.immo.lf1Titel')} text={t('tpm.immo.lf1Text')} />
              <LeitfadenStep nr={2} title={t('tpm.immo.lf2Titel')} text={t('tpm.immo.lf2Text')} />
              <LeitfadenStep nr={3} title={t('tpm.immo.lf3Titel')} text={t('tpm.immo.lf3Text')} />
              <LeitfadenStep nr={4} title={t('tpm.immo.lf4Titel')} text={t('tpm.immo.lf4Text')} />
              <LeitfadenStep nr={5} title={t('tpm.immo.lf5Titel')} text={t('tpm.immo.lf5Text')} />
              <LeitfadenStep nr={6} title={t('tpm.immo.lf6Titel')} text={t('tpm.immo.lf6Text')} />
              </div>
            </Section>
            )}

            {/* Versicherungs-Klaus-Showcase: ausformulierter Leitfaden */}
            {isKlausVersicherung && (
              <Section color="violet">
                <SectionTitle icon={MessageSquare} label={t('tpm.sec.gespraechsleitfaden')} color="violet" />
                <div className="space-y-2 pt-2">
                  <LeitfadenStep nr={1} title={t('tpm.vers.lf1Titel')} text={t('tpm.vers.lf1Text')} />
                  <LeitfadenStep nr={2} title={t('tpm.vers.lf2Titel')} text={t('tpm.vers.lf2Text')} />
                  <LeitfadenStep nr={3} title={t('tpm.vers.lf3Titel')} text={t('tpm.vers.lf3Text')} />
                  <LeitfadenStep nr={4} title={t('tpm.vers.lf4Titel')} text={t('tpm.vers.lf4Text')} />
                  <LeitfadenStep nr={5} title={t('tpm.vers.lf5Titel')} text={t('tpm.vers.lf5Text')} />
                  <LeitfadenStep nr={6} title={t('tpm.vers.lf6Titel')} text={t('tpm.vers.lf6Text')} />
                </div>
              </Section>
            )}

            {/* Generischer Phasen-Leitfaden für alle anderen Termine */}
            {!isKlausImmo && !isKlausVersicherung && (
              <Section color="violet">
                <SectionTitle icon={MessageSquare} label={t('tpm.sec.gespraechsleitfaden')} color="violet" />
                <div className="space-y-2 pt-2">
                  <LeitfadenStep nr={1} title={t('tpm.gen.lf1Titel')} text={t('tpm.gen.lf1Text')} />
                  <LeitfadenStep nr={2} title={t('tpm.gen.lf2Titel')} text={t('tpm.gen.lf2Text', { titel: terminTitel })} />
                  <LeitfadenStep nr={3} title={t('tpm.gen.lf3Titel')} text={t('tpm.gen.lf3Text')} />
                  <LeitfadenStep nr={4} title={t('tpm.gen.lf4Titel')} text={t('tpm.gen.lf4Text')} />
                  <LeitfadenStep nr={5} title={t('tpm.gen.lf5Titel')} text={t('tpm.gen.lf5Text')} />
                  <LeitfadenStep nr={6} title={t('tpm.gen.lf6Titel')} text={t('tpm.gen.lf6Text')} />
                </div>
              </Section>
            )}

            {/* Mögliche Fragen des Kunden */}
            {isKlausImmo && (
            <Section color="rose">
              <SectionTitle icon={HelpCircle} label={t('tpm.sec.moeglicheFragen')} color="rose" />
              <ul className="space-y-1.5 pt-2">
              {[
                { q: t('tpm.immo.q1'), a: t('tpm.immo.a1') },
                { q: t('tpm.immo.q2'), a: t('tpm.immo.a2') },
                { q: t('tpm.immo.q3'), a: t('tpm.immo.a3') },
                { q: t('tpm.immo.q4'), a: t('tpm.immo.a4') },
                { q: t('tpm.immo.q5'), a: t('tpm.immo.a5') },
              ].map((item, i) => (
                <li key={i} className="rounded-lg border border-rose-200 bg-white px-3 py-2">
                  <div className="text-sm font-medium text-slate-700 flex items-start gap-2">
                    <HelpCircle size={14} className="text-rose-500 mt-0.5 shrink-0" />
                    <span>{item.q}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 pl-6 flex items-start gap-1"><ArrowRight size={12} className="mt-0.5 shrink-0" style={{ color: 'var(--mode-primary)' }} /><span>{item.a}</span></div>
                </li>
              ))}
              </ul>
            </Section>
            )}

            {/* Mögliche Fragen — Versicherung-Klaus */}
            {isKlausVersicherung && (
              <Section color="rose">
                <SectionTitle icon={HelpCircle} label={t('tpm.sec.moeglicheFragen')} color="rose" />
                <ul className="space-y-1.5 pt-2">
                  {[
                    { q: t('tpm.vers.q1'), a: t('tpm.vers.a1') },
                    { q: t('tpm.vers.q2'), a: t('tpm.vers.a2') },
                    { q: t('tpm.vers.q3'), a: t('tpm.vers.a3') },
                    { q: t('tpm.vers.q4'), a: t('tpm.vers.a4') },
                    { q: t('tpm.vers.q5'), a: t('tpm.vers.a5') },
                  ].map((item, i) => (
                    <li key={i} className="rounded-lg border border-rose-200 bg-white px-3 py-2">
                      <div className="text-sm font-medium text-slate-700 flex items-start gap-2">
                        <HelpCircle size={14} className="text-rose-500 mt-0.5 shrink-0" />
                        <span>{item.q}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 pl-6 flex items-start gap-1"><ArrowRight size={12} className="mt-0.5 shrink-0" style={{ color: 'var(--mode-primary)' }} /><span>{item.a}</span></div>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* To-Dos VOR / NACH — Versicherung-Klaus */}
            {isKlausVersicherung && (
              <Section color="sky">
                <SectionTitle icon={CheckSquare} label={t('tpm.sec.todosVor')} color="sky" />
                <div className="pt-2">
                  <TodoList
                    items={[
                      t('tpm.vers.todoVor1'),
                      t('tpm.vers.todoVor2'),
                      t('tpm.vers.todoVor3'),
                      t('tpm.vers.todoVor4'),
                      t('tpm.vers.todoVor5'),
                    ]}
                  />
                </div>
              </Section>
            )}
            {isKlausVersicherung && (
              <Section color="emerald">
                <SectionTitle icon={ListChecks} label={t('tpm.sec.todosNach')} color="emerald" />
                <div className="pt-2">
                  <TodoList
                    items={[
                      t('tpm.vers.todoNach1'),
                      t('tpm.vers.todoNach2'),
                      t('tpm.vers.todoNach3'),
                      t('tpm.vers.todoNach4'),
                      t('tpm.vers.todoNach5'),
                    ]}
                  />
                </div>
              </Section>
            )}

            {/* To-Dos vor + nach dem Termin (nur Klaus-Demo, weil sehr spezifisch) */}
            {isKlausImmo && (
              <Section color="sky">
                <SectionTitle icon={CheckSquare} label={t('tpm.sec.todosVor')} color="sky" />
                <div className="pt-2">
                  <TodoList
                    items={[
                      t('tpm.immo.todoVor1'),
                      t('tpm.immo.todoVor2'),
                      t('tpm.immo.todoVor3'),
                      t('tpm.immo.todoVor4'),
                      t('tpm.immo.todoVor5'),
                    ]}
                  />
                </div>
              </Section>
            )}
            {isKlausImmo && (
              <Section color="emerald">
                <SectionTitle icon={ListChecks} label={t('tpm.sec.todosNach')} color="emerald" />
                <div className="pt-2">
                  <TodoList
                    items={[
                      t('tpm.immo.todoNach1'),
                      t('tpm.immo.todoNach2'),
                      t('tpm.immo.todoNach3'),
                      t('tpm.immo.todoNach4'),
                      t('tpm.immo.todoNach5'),
                    ]}
                  />
                </div>
              </Section>
            )}

            {/* Mitzubringen / Kontakt */}
            <Section color="slate">
              <SectionTitle icon={User} label={t('tpm.sec.kontakt')} color="slate" />
              <div className="grid grid-cols-2 gap-2 text-sm pt-2">
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 bg-white">
                  <Phone size={14} className="text-slate-400" />
                  <span className="text-slate-700">+49 641 55 44 33 22</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 bg-white">
                  <Mail size={14} className="text-slate-400" />
                  <span className="text-slate-700">{(kunde?.name || 'kunde').toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '')}@mail-demo.de</span>
                </div>
              </div>
            </Section>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {t('schliessen')}
          </button>
          {kunde?.id && (
            <button
              onClick={() => {
                onClose?.();
                navigateTo?.('detail', { kundeId: kunde.id, tab: 'stammdaten' });
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors"
            >
              <ArrowRight size={14} /> {t('tpm.btn.kundeOeffnen')}
            </button>
          )}
          <button
            onClick={() => { setKiOfferSent(false); setKiOfferOpen(true); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold surface-inset text-(--text-primary) hover:bg-(--bg-card) transition-colors"
          >
            <Bot size={14} style={{ color: 'var(--mode-primary)' }} /> {t('tpm.btn.kiGespraechAnbieten')}
          </button>
          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-(--mode-primary) hover:bg-(--mode-primary-light) transition-colors"
          >
            <FileText size={14} /> {t('tpm.btn.vorbereitungDrucken')}
          </button>
        </div>
        {kiOfferOpen && (
          <KiOfferModal
            kunde={kunde}
            mode={kiOfferMode}
            setMode={setKiOfferMode}
            eskalation={kiOfferEskalation}
            setEskalation={setKiOfferEskalation}
            sent={kiOfferSent}
            onSend={() => setKiOfferSent(true)}
            onClose={() => setKiOfferOpen(false)}
          />
        )}
      </div>
    </div>,
    portalRoot()
  );
}

// Alle Abschnitte tragen dieselbe ruhige Kennzeichnung: weiße Fläche mit
// Hairline, schmaler Balken und Icon in der Modusfarbe, Titel als Kicker.
// Die `color`-Prop der Aufrufer bleibt aus Kompatibilität erhalten, steuert
// aber keine Pastellfläche mehr (keine sieben Farbtöne nebeneinander).
function Section({ children }) {
  return (
    <section className="relative rounded-xl pl-4 pr-3 py-3 overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
      <span className="absolute left-0 top-0 bottom-0 w-1" style={{ background: 'var(--mode-primary)' }} aria-hidden="true" />
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function SectionTitle({ icon: Icon, label }) {
  return (
    <h4 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
      <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: 'var(--mode-primary-soft)' }}>
        <Icon size={13} style={{ color: 'var(--mode-primary)' }} strokeWidth={2} />
      </span>
      {label}
    </h4>
  );
}

function KPI({ label, value, accent }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
      <div className="text-[11px] text-slate-400">{label}</div>
      <div className={`text-sm font-semibold ${accent || 'text-slate-800'}`}>{value}</div>
    </div>
  );
}

function LeitfadenStep({ nr, title, text }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="w-7 h-7 rounded-full text-xs font-mono font-semibold flex items-center justify-center shrink-0" style={{ background: 'var(--mode-primary-soft)', color: 'var(--mode-primary)' }}>
        {nr}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-slate-800">{title}</div>
        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function TodoList({ items }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
          <div className="mt-0.5 w-4 h-4 rounded border border-slate-300 bg-white shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const KI_OPTIONS = [
  {
    id: 'avatar',
    icon: Video,
    titelKey: 'tpm.offer.avatarTitel',
    beschreibungKey: 'tpm.offer.avatarBeschr',
    eignungKey: 'tpm.offer.avatarEignung',
  },
  {
    id: 'chatbot',
    icon: MessageSquare,
    titelKey: 'tpm.offer.chatbotTitel',
    beschreibungKey: 'tpm.offer.chatbotBeschr',
    eignungKey: 'tpm.offer.chatbotEignung',
  },
];

function KiOfferModal({ kunde, mode, setMode, eskalation, setEskalation, sent, onSend, onClose }) {
  const { t } = useTranslation();
  const vorname = kunde?.name?.split(' ')[0] || t('tpm.offer.derKunde');
  return createPortal(
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: 'rgba(28, 26, 23, 0.45)' }} onClick={onClose}>
      <div className="surface-elevated rounded-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--mode-primary-soft)', color: 'var(--mode-primary)' }}><Bot size={18} /></div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">{t('tpm.offer.titel')}</h3>
              <p className="text-xs text-slate-500">{t('tpm.offer.sub', { name: vorname })}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" aria-label={t('schliessen')}><X size={18} /></button>
        </div>

        {sent ? (
          <div className="px-6 py-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><Check size={24} /></div>
            <h4 className="text-base font-semibold text-slate-900">{t('tpm.offer.versendet')}</h4>
            <p className="text-sm text-slate-600">{t('tpm.offer.versendetText', { name: vorname, modus: mode === 'avatar' ? t('tpm.offer.modusAvatar') : t('tpm.offer.modusChat'), eskalation: eskalation ? t('tpm.offer.eskalationSuffix') : '' })}</p>
            <button onClick={onClose} className="mt-2 text-sm px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">{t('schliessen')}</button>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 space-y-3">
              {KI_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const active = mode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMode(opt.id)}
                    className={`w-full text-left rounded-xl border p-3 flex gap-3 transition-colors ${active ? 'border-(--mode-primary-light) bg-(--mode-primary-soft)' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${active ? 'bg-(--mode-primary) text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">{t(opt.titelKey)}</div>
                      <p className="text-xs text-slate-600 mt-0.5">{t(opt.beschreibungKey)}</p>
                      <p className="text-xs text-slate-500 mt-1 italic">{t(opt.eignungKey)}</p>
                    </div>
                  </button>
                );
              })}
              <label className="flex items-start gap-2 text-sm text-slate-700 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={eskalation}
                  onChange={e => setEskalation(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300"
                  style={{ accentColor: 'var(--mode-primary)' }}
                />
                <span className="flex items-start gap-1.5">
                  <UserPlus size={14} className="text-slate-500 mt-0.5" />
                  {t('tpm.offer.mensch')}
                </span>
              </label>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">{t('abbrechen')}</button>
              <button onClick={onSend} className="text-sm px-4 py-2 rounded-lg text-white inline-flex items-center gap-1.5 bg-(--mode-primary) hover:bg-(--mode-primary-light) transition-colors">
                <Send size={14} />
                {t('tpm.offer.senden', { name: vorname })}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    portalRoot()
  );
}
