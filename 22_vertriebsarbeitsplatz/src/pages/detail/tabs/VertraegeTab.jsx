import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Card from '../../../components/ui/Card';
import LogoImg from '../../../components/ui/LogoImg';
import { StatusBadge, SparteBadge } from '../../../components/ui/Badge';
import { formatEur } from '../../../utils/formatters';
import { useMode } from '../../../hooks/useMode';
import useTranslation from '../../../i18n/useTranslation';
import { ChevronDown, ChevronRight, ExternalLink, Award, AlertTriangle, Sparkles } from 'lucide-react';
import { resolveVersicherungspartner, interpolateDynamicDates } from '../../../utils/dynamicDates';

// Warnsymbol mit Hover-Popover – zeigt Versicherungslücke + Empfehlung.
// Das Icon nutzt inline-Styles (Spezifität), damit es auf row-hover
// (color: inherit !important) weiterhin amber bleibt. Das Popover wird per
// Portal in document.body gerendert, damit Card-Containment (contain: paint)
// es nicht clippt.
function RisikoBadge({ warnung, institut }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const triggerRef = useRef(null);
  const ctx = { institut };

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setCoords({ top: r.bottom + 6, left: r.left + r.width / 2 });
  }, [open]);

  const titel = interpolateDynamicDates(warnung.titel || '', ctx);
  const beschreibung = interpolateDynamicDates(warnung.beschreibung || '', ctx);
  const konsequenz = interpolateDynamicDates(warnung.konsequenz || '', ctx);
  const empfehlung = interpolateDynamicDates(warnung.empfehlung || '', ctx);

  return (
    <span
      ref={triggerRef}
      className="relative inline-flex pointer-events-auto"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span
        className="inline-flex items-center justify-center w-5 h-5 rounded-full shrink-0 cursor-help"
        style={{ backgroundColor: 'var(--tint-warning)', color: 'var(--color-warning)' }}
        aria-label={titel}
      >
        <AlertTriangle size={12} strokeWidth={2.5} />
      </span>
      {open && coords && createPortal(
        <div
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            transform: 'translateX(-50%)',
            zIndex: 9999,
          }}
          className="w-80 rounded-xl surface-elevated overflow-hidden pointer-events-auto"
        >
          <div className="bg-(--tint-warning) px-4 py-2.5 border-b border-(--border-light) flex items-start gap-2">
            <AlertTriangle size={14} className="text-(--color-warning) mt-0.5 shrink-0" strokeWidth={2.5} />
            <div className="text-sm font-semibold text-(--text-primary) leading-snug">{titel}</div>
          </div>
          <div className="px-4 py-3 space-y-2.5 text-xs leading-relaxed">
            {beschreibung && (
              <p className="text-(--text-secondary)">{beschreibung}</p>
            )}
            {konsequenz && (
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-(--color-warning) mb-0.5">
                  {t('versicherungsluecke')}
                </div>
                <p className="text-(--text-secondary)">{konsequenz}</p>
              </div>
            )}
            {empfehlung && (
              <div className="flex items-start gap-1.5 pt-2 border-t border-(--border-light)">
                <Sparkles size={12} className="text-(--quelle-kommunikation) mt-0.5 shrink-0" />
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-(--quelle-kommunikation) mb-0.5">
                    {t('empfehlungLabel')}
                  </div>
                  <p className="text-(--text-secondary)">{empfehlung}</p>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </span>
  );
}

function ProduktRow({ produkt, modeId, institut, onNavigateKontoumsaetze, t }) {
  const [expanded, setExpanded] = useState(false);
  const isGiro = produkt.typ === 'girokonto';

  return (
    <>
      <tr
        className="border-t border-(--border-light) cursor-pointer transition-colors hover:bg-(--bg-table-hover)"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-(--text-tertiary)">
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
            {produkt.versicherer && <LogoImg name={produkt.versicherer} size={18} />}
            <span className="font-medium text-(--text-primary)">{produkt.produkt}</span>
            {produkt._risikoWarnung && (
              <RisikoBadge warnung={produkt._risikoWarnung} institut={institut} />
            )}
          </div>
        </td>
        <td className="px-4 py-3 text-sm">
          {produkt.sparte ? <SparteBadge sparte={produkt.sparte} /> : '-'}
        </td>
        <td className="px-4 py-3 text-sm text-(--text-secondary)">{produkt.details}</td>
        {modeId === 'banking' && (
          <td className="px-4 py-3 text-sm">
            {produkt.volumen ? <span className="font-mono text-(--text-secondary)">{formatEur(produkt.volumen)}</span> : '-'}
          </td>
        )}
        <td className="px-4 py-3 text-sm"><span className="font-mono font-medium text-(--text-primary)">{formatEur(produkt.praemie)}</span></td>
        <td className="px-4 py-3 text-sm font-mono text-(--text-secondary)">{produkt.seit}</td>
        <td className="px-4 py-3 text-sm">
          <StatusBadge status={produkt.status} />
        </td>
        <td className="px-4 py-3 text-sm">
          {produkt.fbRating ? (
            <FbRatingBadge rating={produkt.fbRating} klasse={produkt.fbKlasse} />
          ) : (
            <span className="text-(--text-tertiary)">–</span>
          )}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-(--bg-table-stripe)">
          <td colSpan={modeId === 'banking' ? 8 : 7} className="px-4 py-3">
            <div className="pl-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[11px] text-(--text-tertiary) uppercase tracking-wider">{t('vertragsbeginn')}</span>
                <div className="font-medium font-mono text-(--text-primary) mt-0.5">{produkt.seit}</div>
              </div>
              <div>
                <span className="text-[11px] text-(--text-tertiary) uppercase tracking-wider">{t('status')}</span>
                <div className="mt-0.5"><StatusBadge status={produkt.status} /></div>
              </div>
              <div>
                <span className="text-[11px] text-(--text-tertiary) uppercase tracking-wider">{t('sparte')}</span>
                <div className="font-medium text-(--text-primary) mt-0.5">{produkt.sparte || '-'}</div>
              </div>
              <div>
                <span className="text-[11px] text-(--text-tertiary) uppercase tracking-wider">{t('details')}</span>
                <div className="font-medium text-(--text-primary) mt-0.5">{produkt.details}</div>
              </div>
              {produkt.fbRating && (
                <div className="col-span-2 md:col-span-4 mt-1">
                  <div className="flex items-center gap-3 surface-inset rounded-lg px-3 py-2">
                    <img src="https://img.logo.dev/franke-bornberg.de?token=pk_H7vb5Y2lTsW47U4Xq-w3HA&size=40&format=png" alt="Franke & Bornberg" className="w-5 h-5 rounded" onError={(e) => e.target.style.display='none'} />
                    <div>
                      <span className="text-xs text-(--text-tertiary)">{t('fbRatingLabel')}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold font-mono ${produkt.fbRating >= 75 ? 'text-(--color-success)' : produkt.fbRating >= 55 ? 'text-(--color-warning)' : 'text-(--color-danger)'}`}>
                          {produkt.fbRating}/100
                        </span>
                        <span className="text-xs text-(--text-tertiary)">{produkt.fbKlasse}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {produkt._risikoWarnung && (
                <div className="col-span-2 md:col-span-4 mt-1">
                  <div className="bg-(--tint-warning) border border-(--border-light) rounded-lg px-3 py-2 flex items-start gap-2">
                    <AlertTriangle size={14} className="text-(--color-warning) mt-0.5 shrink-0" />
                    <div className="text-xs text-(--text-primary) leading-snug">
                      <div className="font-semibold">{interpolateDynamicDates(produkt._risikoWarnung.titel, { institut })}</div>
                      {produkt._risikoWarnung.beschreibung && (
                        <div className="mt-0.5">{interpolateDynamicDates(produkt._risikoWarnung.beschreibung, { institut })}</div>
                      )}
                      {produkt._risikoWarnung.konsequenz && (
                        <div className="mt-1 font-medium">
                          <span className="uppercase tracking-wider text-[11px] text-(--color-warning)">{t('versicherungsluecke')}: </span>
                          {interpolateDynamicDates(produkt._risikoWarnung.konsequenz, { institut })}
                        </div>
                      )}
                      {produkt._risikoWarnung.empfehlung && (
                        <div className="mt-1">
                          <span className="uppercase tracking-wider text-[11px] text-(--color-warning)">{t('empfehlungInline')}: </span>
                          {interpolateDynamicDates(produkt._risikoWarnung.empfehlung, { institut })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {produkt.status === 'optimierbar' && (
                <div className="col-span-2 md:col-span-4 mt-1">
                  <div className="bg-(--tint-warning) border border-(--border-light) rounded-lg px-3 py-2 text-(--text-primary) text-xs flex items-center gap-2">
                    <AlertTriangle size={13} className="text-(--color-warning) shrink-0" />
                    {t('optimierungspotenzial')}
                  </div>
                </div>
              )}
              {isGiro && onNavigateKontoumsaetze && (
                <div className="col-span-2 md:col-span-4 mt-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); onNavigateKontoumsaetze(); }}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors surface-inset text-(--text-primary) hover:border-(--border-medium)"
                  >
                    <ExternalLink size={12} />
                    {t('kontoumsaetzeAnzeigen')}
                  </button>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// Replace the base institut name in product names with the currently selected institut
const INSTITUT_REPLACEMENTS = {
  versicherung: 'ERGO',
  banking: 'VR',
};

// Im Banking-Modus wird R+V als "Haus-Versicherer" der Volksbank in den
// Demo-Daten verwendet. Für andere Banken-Whitelabels wird dieser Name auf
// den jeweiligen Versicherungspartner gemappt (z. B. Zukunftsbank →
// Zukunftsversicherung).
const VERSICHERUNGSPARTNER_BASE_BY_MODE = {
  banking: 'R+V',
};

function adaptProduktName(name, modeId, institut) {
  if (!name) return name;
  let out = name;
  if (institut) {
    const baseInstitut = INSTITUT_REPLACEMENTS[modeId];
    if (baseInstitut) {
      const shortInstitut = institut.split(' ')[0];
      if (shortInstitut !== baseInstitut) {
        out = out.replace(new RegExp(baseInstitut, 'g'), shortInstitut);
      }
    }
    const baseVersicherer = VERSICHERUNGSPARTNER_BASE_BY_MODE[modeId];
    if (baseVersicherer) {
      const partner = resolveVersicherungspartner(institut);
      if (partner && partner !== baseVersicherer) {
        // R+V im Text durch passenden Partner ersetzen. RegExp-escape für das "+"
        out = out.replace(new RegExp(baseVersicherer.replace(/[+]/g, '\\+'), 'g'), partner);
      }
    }
  }
  return out;
}

export default function VertraegeTab({ kunde }) {
  const { t, lang } = useTranslation();
  const { modeId, setActiveTab, config } = useMode();
  const institut = config?.institut;
  // Risiko-Signale aus den Stammdaten den jeweiligen Versicherungs-
  // produkten zuordnen (z. B. Extremsport-Signal → Unfallversicherung),
  // damit in der Produktzeile ein Ausrufezeichen + Konsequenz-Hinweis
  // mit derselben Begruendung wie im Stammdaten-Tab erscheint.
  const sigs = Array.isArray(kunde.risikoSignale) ? kunde.risikoSignale : [];
  const matchProduktRegex = (key) => {
    if (key === 'unfall') return /unfall|extremsport|boulder|kletter|skydive|fallschirm|risikosport/i;
    if (key === 'bu') return /berufsunf|arbeitsunf|\bbu\b/i;
    if (key === 'hausrat') return /einbruch|hausrat/i;
    if (key === 'kfz' || key === 'kfz2' || key === 'kfz_fremd') return /kfz|fahrzeug/i;
    if (key === 'haftpflicht') return /haftpflicht/i;
    if (key === 'rlv' || key === 'leben' || key === 'lv' || key === 'lebensversicherung') return /risikolebens|leben/i;
    return null;
  };
  const findRisikoWarnung = (produkt) => {
    const re = matchProduktRegex(produkt.typ) || matchProduktRegex(produkt.sparte);
    if (!re) return null;
    const hit = sigs.find(s => re.test(`${s.titel || ''} ${s.beschreibung || ''}`));
    if (!hit) return null;
    return {
      titel: hit.titel || 'Risiko-Signal erkannt',
      beschreibung: hit.beschreibung || null,
      konsequenz: hit.konsequenz || null,
      empfehlung: hit.empfehlung || null,
    };
  };

  const produkte = (kunde.eigeneProdukte || []).map(p => ({
    ...p,
    produkt: adaptProduktName(p.produkt, modeId, institut),
    details: adaptProduktName(p.details, modeId, institut),
    _risikoWarnung: findRisikoWarnung(p),
  }));

  const praemieLabel = modeId === 'banking' ? t('jahreskosten') : modeId === 'vermoegensverwaltung' ? t('volumenLabel') : t('gesamtpraemie').replace('/J.', '') + '/J.';
  const sumLabel = modeId === 'banking' ? t('gesamtkostenJ') : modeId === 'vermoegensverwaltung' ? t('gesamtvolumen') : t('gesamtpraemie');

  return (
    <div className="space-y-4">
      <Card hover={false}>
        <h3 className="font-semibold text-(--text-primary) mb-4">
          {t('eigeneProdukte')} ({produkte.length} {modeId === 'banking' ? t('produkteLabel') : t('vertraege')})
        </h3>
        <Card hover={false} padding={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-(--bg-inset)">
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider font-semibold text-(--text-tertiary)">{t('produkt')}</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider font-semibold text-(--text-tertiary)">{t('sparte')}</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider font-semibold text-(--text-tertiary)">{t('tarifDetails')}</th>
                  {modeId === 'banking' && (
                    <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider font-semibold text-(--text-tertiary)">{t('volumenLabel')}</th>
                  )}
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider font-semibold text-(--text-tertiary)">{praemieLabel}</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider font-semibold text-(--text-tertiary)">{t('seit')}</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider font-semibold text-(--text-tertiary)">{t('status')}</th>
                  <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider font-semibold text-(--text-tertiary)">{t('fbRating')}</th>
                </tr>
              </thead>
              <tbody>
                {produkte.map((p, i) => (
                  <ProduktRow
                    key={p.id || i}
                    produkt={p}
                    modeId={modeId}
                    institut={institut}
                    onNavigateKontoumsaetze={p.typ === 'girokonto' ? () => setActiveTab('finanzprofil') : null}
                    t={t}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Card>

      <Card hover={false}>
        <h3 className="font-semibold text-(--text-primary) mb-4">{t('vertragszusammenfassung')}</h3>
        {(() => {
          const EXTERN_COST_TYPES = new Set([
            'versicherung', 'kfz', 'kfz_fremd', 'haftpflicht', 'hausrat',
            'rechtsschutz', 'rlv', 'bu', 'du', 'pkv', 'pkv_ehemann', 'unfall',
            'lebensversicherung', 'praxis_hp', 'betriebshaftpflicht',
            'inhaltsversicherung', 'wohngebaeude', 'it_hp', 'dno', 'kk',
            'kredit', 'konsumkredit', 'privatkredit', 'kffw', 'kfw',
            'baufinanzierung',
          ]);
          const intern = produkte;
          const extern = (kunde.fremdProdukte || []);
          const internKosten = intern.reduce((s, p) => s + (p.praemie || 0), 0);
          const externKosten = extern
            .filter(p => EXTERN_COST_TYPES.has(p.typ))
            .reduce((s, p) => s + (Number(p.volumen) || 0), 0);
          const gesamtAnzahl = intern.length + extern.length;
          const gesamtKosten = internKosten + externKosten;
          const optimierbar = intern.filter(p => p.status === 'optimierbar').length;
          const anzahlLabel = modeId === 'banking' ? t('anzahlProdukte') : t('anzahlVertraege');
          return (
            <div className="grid grid-cols-3 gap-6">
              <div className="rounded-xl surface-inset p-4">
                <div className="text-[11px] text-(--text-tertiary) font-semibold uppercase tracking-wider mb-2">
                  {lang === 'en' ? 'All contracts' : 'Alle Verträge'}
                </div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs text-(--text-tertiary)">{anzahlLabel}</span>
                  <span className="font-mono text-lg font-semibold text-(--text-primary)">{gesamtAnzahl}</span>
                </div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs text-(--text-tertiary)">{sumLabel}</span>
                  <span className="font-mono text-lg font-semibold text-(--text-primary)">{formatEur(gesamtKosten)}</span>
                </div>
              </div>
              <div className="rounded-xl surface-inset p-4 border-l-[3px]" style={{ borderLeftColor: 'var(--mode-primary-light)' }}>
                <div className="text-[11px] text-(--mode-primary-light) font-semibold uppercase tracking-wider mb-2">
                  {lang === 'en' ? 'Internal' : 'Intern'}
                </div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs text-(--text-tertiary)">{anzahlLabel}</span>
                  <span className="font-mono text-lg font-semibold text-(--text-primary)">{intern.length}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-(--text-tertiary)">{sumLabel}</span>
                  <span className="font-mono text-lg font-semibold text-(--text-primary)">{formatEur(internKosten)}</span>
                </div>
              </div>
              <div className="rounded-xl surface-inset p-4">
                <div className="text-[11px] text-(--text-tertiary) font-semibold uppercase tracking-wider mb-2">
                  {lang === 'en' ? 'External' : 'Extern'}
                </div>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs text-(--text-tertiary)">{anzahlLabel}</span>
                  <span className="font-mono text-lg font-semibold text-(--text-primary)">{extern.length}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-(--text-tertiary)">{sumLabel}</span>
                  <span className="font-mono text-lg font-semibold text-(--text-primary)">{formatEur(externKosten)}</span>
                </div>
              </div>
            </div>
          );
        })()}
      </Card>
    </div>
  );
}

function FbRatingBadge({ rating, klasse }) {
  if (!rating) return null;
  const color = rating >= 75 ? 'emerald' : rating >= 55 ? 'amber' : 'red';

  return (
    <div className="flex items-center gap-1.5" title={`Franke & Bornberg: ${rating}/100 – ${klasse || ''}`}>
      <img
        src="https://img.logo.dev/franke-bornberg.de?token=pk_H7vb5Y2lTsW47U4Xq-w3HA&size=32&format=png"
        alt="F&B"
        className="w-3.5 h-3.5 rounded"
        onError={(e) => e.target.style.display='none'}
      />
      <span className={`rh-badge text-xs font-bold px-1.5 py-0.5 rounded ${
        color === 'emerald' ? 'bg-(--tint-success) text-(--color-success)'
        : color === 'amber' ? 'bg-(--tint-warning) text-(--color-warning)'
        : 'bg-(--tint-danger) text-(--color-danger)'
      }`}>
        {rating}
      </span>
    </div>
  );
}

function SummaryItem({ label, value, highlight }) {
  return (
    <div>
      <div className="text-[11px] text-(--text-tertiary) uppercase tracking-wider mb-1">{label}</div>
      <div className={`font-mono text-2xl font-semibold ${highlight ? 'text-(--mode-accent)' : 'text-(--text-primary)'}`}>{value}</div>
    </div>
  );
}
