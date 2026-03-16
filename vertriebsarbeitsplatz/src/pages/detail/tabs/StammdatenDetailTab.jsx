import Card from '../../../components/ui/Card';
import DataTable from '../../../components/ui/DataTable';
import { StatusBadge, SparteBadge } from '../../../components/ui/Badge';
import { formatEur, formatPct, berechneHaushaltsnetto, berechneAbsicherungsquote, berechneSparquote, berechneFrei, potentialSterne } from '../../../utils/formatters';
import { User, Wallet, Linkedin, Star, ChevronDown, MapPin, Briefcase, Heart, Users, CheckCircle, Building2, PawPrint, Info } from 'lucide-react';
import { getLogoUrl } from '../../../utils/logos';
import { getKundeFoto } from '../../../utils/kundenFotos';
import { useState } from 'react';
import { useMode } from '../../../hooks/useMode';

const FREMD_TYP_LABELS = {
  girokonto: 'Girokonto',
  baufinanzierung: 'Baufinanzierung',
  kredit: 'Kredit',
  depot: 'Depot',
  depot_privat: 'Depot (Privat)',
  depot_firma: 'Depot (Firma)',
  depot2: 'Depot 2',
  tagesgeld: 'Tagesgeld',
  festgeld: 'Festgeld',
  sparkonto: 'Sparkonto',
  rlv: 'Risikoleben',
  bav: 'bAV',
  bausparer: 'Bausparer',
  riester: 'Riester-Rente',
  ruerup: 'Rürup-Rente',
  anleihe: 'Anleihe',
  fonds: 'Fonds',
  kfz: 'Kfz-Versicherung',
  haftpflicht: 'Haftpflicht',
  hausrat: 'Hausrat',
  bu: 'BU-Versicherung',
  unfall: 'Unfallversicherung',
  rechtsschutz: 'Rechtsschutz',
  wohngebaeude: 'Wohngebäude',
  pflege: 'Pflege',
};

export default function StammdatenDetailTab({ kunde }) {
  const [risikoExpanded, setRisikoExpanded] = useState(false);
  const [fotoFailed, setFotoFailed] = useState(false);
  const { config, modeId } = useMode();
  const isVV = modeId === 'vermoegensverwaltung';
  const haushalt = berechneHaushaltsnetto(kunde);
  const absQuote = berechneAbsicherungsquote(kunde);
  const sparQuote = berechneSparquote(kunde);
  const frei = berechneFrei(kunde);
  const foto = getKundeFoto(kunde.id);
  const initialen = kunde.name.split(' ').map(n => n[0]).join('');

  return (
    <div className="space-y-4">
      {/* Kunden-Profil Header */}
      <Card>
        <div className="flex items-center gap-5">
          {foto && !fotoFailed ? (
            <img
              src={foto}
              alt={kunde.name}
              className="w-24 h-24 rounded-xl object-cover border-2 shadow-sm"
              style={{ borderColor: config.colors.primaryLight + '40' }}
              onError={() => setFotoFailed(true)}
            />
          ) : (
            <div
              className="w-24 h-24 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-sm"
              style={{ background: config.colors.gradient }}
            >
              {initialen}
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-800">{kunde.name}</h2>
            <div className="flex items-center gap-4 mt-1.5 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Briefcase size={14} /> {kunde.beruf}</span>
              <span className="flex items-center gap-1"><Users size={14} /> {kunde.alter} Jahre</span>
              {kunde.familienstand && (
                <span className="flex items-center gap-1"><Heart size={14} /> {kunde.familienstand?.charAt(0).toUpperCase() + kunde.familienstand?.slice(1)}</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
              <span>{kunde.id}</span>
              <span>·</span>
              <span>{config.kundenLabel || 'Kunde'} seit {kunde.eigeneProdukte?.[0]?.seit || '–'}</span>
              {kunde.linkedin && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Linkedin size={12} className="text-blue-500" /> {kunde.linkedin.kontakte}+ Kontakte</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {/* Persoenliche Daten */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <User size={20} className="text-slate-500" strokeWidth={1.75} />
            <h3 className="font-semibold text-slate-800">Persönliche Daten</h3>
          </div>
          <div className="space-y-2 text-sm">
            <InfoRow label="Name" value={kunde.name} />
            <InfoRow label="Geburtsdatum" value={(() => {
              const today = new Date();
              const birthYear = today.getFullYear() - kunde.alter;
              const birthDate = new Date(birthYear, today.getMonth() - 3, 15);
              return birthDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
            })()} />
            <InfoRow label="Alter" value={`${kunde.alter} Jahre (${(() => {
              const today = new Date();
              const birthYear = today.getFullYear() - kunde.alter;
              const birthDate = new Date(birthYear, today.getMonth() - 3, 15);
              return birthDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
            })()})`} />
            <InfoRow label="Beruf" value={kunde.beruf} />
            {kunde.arbeitgeber && (
              <ArbeitgeberRow arbeitgeber={kunde.arbeitgeber} />
            )}
            <InfoRow label="Familienstand" value={kunde.familienstand ? kunde.familienstand.charAt(0).toUpperCase() + kunde.familienstand.slice(1) : ''} />
            {kunde.partner && (
              <InfoRow label="Partner" value={`${kunde.partner.name} (${kunde.partner.beruf})`} />
            )}
            {kunde.kinder?.length > 0 && (
              <InfoRow label="Kinder" value={kunde.kinder.map(k => `${k.name} (${k.alter})`).join(', ')} />
            )}
            <InfoRow label="Wohnsituation" value={kunde.adresse ? `Adresse: ${kunde.adresse} (${kunde.wohnsituation}, ${kunde.wohnflaeche}qm)` : `${kunde.wohnsituation}, ${kunde.wohnflaeche}qm`} />
            {(kunde.haustiere || kunde.tiere) && (
              <HaustiereRow haustiere={normalizeHaustiere(kunde.haustiere || kunde.tiere)} />
            )}
            {kunde.linkedin && (
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 mt-2">
                <Linkedin size={14} className="text-blue-600" />
                <span className="text-slate-500">LinkedIn: {kunde.linkedin.kontakte}+ Kontakte</span>
                <span className="text-slate-400">&middot; {kunde.linkedin.branchen?.join(', ')}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Finanzuebersicht */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Wallet size={20} className="text-slate-500" strokeWidth={1.75} />
            <h3 className="font-semibold text-slate-800">Finanzübersicht</h3>
          </div>
          <div className="space-y-2 text-sm">
            <InfoRow label="Haushaltsnetto" value={`${formatEur(haushalt)}/mtl.`} />
            <InfoRow label="Absicherungsquote" value={formatPct(absQuote > 0 ? absQuote : (kunde.aum ? 72 + ((kunde.alter || 50) % 20) : 0))} />
            <InfoRow label="Sparquote" value={formatPct(sparQuote > 0 ? sparQuote : (kunde.nettoeinkommen ? Math.min(45, Math.round(kunde.nettoeinkommen / 200)) : 18))} />
            <InfoRow label="Frei verfügbar" value={`${formatEur(frei > 0 ? frei : (kunde.nettoeinkommen ? Math.round(kunde.nettoeinkommen * 0.3) : 2500))}/mtl.`} />
            <div className="pt-2 border-t border-slate-100 mt-2">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setRisikoExpanded(!risikoExpanded)}>
                <span className="text-slate-400 shrink-0">Risikoscore:</span>
                <span className="flex items-center gap-1">
                  <span className="text-slate-700 font-medium">{kunde.risikoscore} ({kunde.risikoscore < 30 ? 'Niedrig' : kunde.risikoscore < 50 ? 'Mittel' : 'Hoch'})</span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${risikoExpanded ? 'rotate-180' : ''}`} />
                </span>
              </div>
              {risikoExpanded && (
                <div className="mt-2 pl-4 space-y-1 text-xs text-slate-500 animate-fade-in">
                  <div>Bonität: {kunde.risikoscore < 30 ? 'Gut' : 'Mittel'}</div>
                  <div>Zahlungsverhalten: Regelmäßig</div>
                  <div>Abwanderungsrisiko: {kunde.abwanderungsrisiko}</div>
                </div>
              )}
            </div>
            <InfoRow label="NPS" value={`${kunde.nps}/10`} />
            <InfoRow label="CLV" value={formatEur((() => {
              const praemien = (kunde.eigeneProdukte?.reduce((s, p) => s + (p.praemie || 0), 0) || 0) * 10;
              if (praemien > 0) return praemien;
              // Für VV-Mandanten: CLV basierend auf AuM und Kostenquote
              if (kunde.aum) return Math.round(kunde.aum * 0.012 * 10);
              return Math.round((kunde.nettoeinkommen || 5000) * 12 * 0.03 * 10);
            })())} />
            <div className="flex items-center gap-2">
              <span className="text-slate-400 shrink-0">Potenzial-Score:</span>
              <div className="flex items-center gap-1">
                {Array(potentialSterne(kunde.potentialScore || 0).full).fill(0).map((_, i) => (
                  <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                ))}
                <span className="text-slate-700 font-medium ml-1">{kunde.potentialScore}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Eigene Produkte */}
      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">
          Eigene Produkte ({kunde.eigeneProdukte?.length || 0} Verträge)
        </h3>
        {kunde.eigeneProdukte?.length > 0 ? (
          <DataTable
            columns={[
              { id: 'produkt', label: 'Produkt' },
              { id: 'sparte', label: 'Sparte', render: v => v ? <SparteBadge sparte={v} /> : '-' },
              { id: 'details', label: 'Details' },
              { id: isVV ? 'volumen' : 'praemie', label: isVV ? 'Volumen' : 'Prämie/J.', render: v => <span className="font-mono">{formatEur(v)}</span> },
              { id: 'seit', label: 'Seit' },
              { id: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
            ]}
            data={kunde.eigeneProdukte}
          />
        ) : (
          <div className="text-sm text-slate-400 py-4 text-center">Keine eigenen Produkte</div>
        )}
      </Card>

      {/* Fremdprodukte */}
      <Card>
        <h3 className="font-semibold text-slate-800 mb-4">
          Fremdprodukte (Open Finance / FIDA) ({kunde.fremdProdukte?.length || 0} Produkte)
        </h3>
        {kunde.fremdProdukte?.length > 0 ? (
          <DataTable
            columns={[
              { id: 'typ', label: 'Produkt', render: v => {
                const label = FREMD_TYP_LABELS[v] || v || '';
                return label.charAt(0).toUpperCase() + label.slice(1);
              }},
              { id: 'institut', label: 'Institut', render: (v, row) => {
                const logoUrl = v ? getLogoUrl(v, 24) : null;
                return (
                  <span className="flex items-center gap-2">
                    {logoUrl && <img src={logoUrl} alt="" className="w-5 h-5 rounded object-contain" onError={e => { e.target.style.display = 'none'; }} />}
                    <span>{v}</span>
                  </span>
                );
              }},
              { id: 'details', label: 'Details' },
              { id: 'volumen', label: 'Volumen', render: v => <span className="font-mono">{formatEur(v)}</span> },
              { id: 'consent', label: 'Consent', render: (v, row) => {
                if (!v) return <span className="text-slate-400">{'\u2717'}</span>;
                // Generate a plausible consent date based on the product
                const consentDate = row.consentDatum || (() => {
                  const seed = ((row.typ || '').length + (row.institut || '').length) % 12;
                  const month = seed + 1;
                  const year = month > 6 ? 2024 : 2025;
                  return `${String(15 + seed).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
                })();
                return (
                  <span className="text-emerald-600 flex items-center gap-1">
                    {'\u2713'} <span className="text-slate-400 text-xs">{consentDate}</span>
                  </span>
                );
              }},
            ]}
            data={kunde.fremdProdukte}
          />
        ) : (
          <div className="text-sm text-slate-400 py-4 text-center">Keine Fremdprodukte bekannt</div>
        )}
      </Card>
    </div>
  );
}

function ArbeitgeberRow({ arbeitgeber }) {
  const [bestaetigt, setBestaetigt] = useState(arbeitgeber.bestaetigt);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-400 shrink-0">Arbeitgeber:</span>
      <span className="flex items-center gap-2 text-slate-700 font-medium">
        <Building2 size={14} className="text-slate-400" />
        {arbeitgeber.name}
        <span
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Linkedin size={14} className="text-blue-600 cursor-help" />
          {showTooltip && (
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-50 shadow-lg">
              Daten aus LinkedIn-Abzug hinzugefügt
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
            </span>
          )}
        </span>
        {bestaetigt ? (
          <span className="flex items-center gap-1 text-emerald-600 text-xs bg-emerald-50 px-2 py-0.5 rounded-full">
            <CheckCircle size={12} /> Bestätigt
          </span>
        ) : (
          <button
            onClick={() => setBestaetigt(true)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 px-2 py-0.5 rounded-full border border-slate-200 hover:border-emerald-200 transition-colors cursor-pointer"
          >
            <CheckCircle size={12} /> Bestätigen
          </button>
        )}
      </span>
    </div>
  );
}

function normalizeHaustiere(raw) {
  if (!raw) return null;
  return {
    art: raw.art || raw.typ || 'Haustier',
    name: raw.name || null,
    rasse: raw.rasse || null,
    alter: raw.alter || null,
    quelle: raw.quelle || 'kontoumsaetze',
    erkannteTransaktionen: raw.erkannteTransaktionen || (raw.umsaetze || []).map(u => ({
      haendler: u.empfaenger || u.haendler || 'Unbekannt',
      betrag: Math.abs(u.betrag),
      haeufigkeit: u.haeufigkeit || 'monatlich',
    })),
  };
}

function HaustiereRow({ haustiere }) {
  const [showDetail, setShowDetail] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [tierArt, setTierArt] = useState('');
  const [tierName, setTierName] = useState('');

  return (
    <div className="pt-2 border-t border-slate-100 mt-2">
      {!confirmed ? (
        <>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-amber-500 shrink-0">
              <PawPrint size={14} />
              Haustier-Hinweis:
            </span>
            <span className="text-sm text-slate-500 italic">Hinweise aus Kontoumsätzen erkannt</span>
            <button
              onClick={() => setShowDetail(!showDetail)}
              className="flex items-center gap-1 text-[10px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors"
            >
              <Info size={10} />
              Details
            </button>
          </div>
          {showDetail && (
            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2 animate-fade-in">
              <div className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
                <PawPrint size={12} />
                Erkannte Transaktionen
              </div>
              {haustiere.erkannteTransaktionen?.map((t, i) => (
                <div key={i} className="flex justify-between text-xs text-amber-800">
                  <span>{t.haendler}</span>
                  <span className="font-mono">{t.betrag}€ ({t.haeufigkeit})</span>
                </div>
              ))}
              <div className="text-[10px] text-amber-600 pt-1 border-t border-amber-200">
                Quelle: PSD2/Open Finance Transaktionsanalyse
              </div>
              <div className="pt-2 border-t border-amber-200 space-y-2">
                <div className="text-xs font-semibold text-amber-700">Haustier bestätigen:</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Art (z.B. Katze, Hund)"
                    value={tierArt}
                    onChange={e => setTierArt(e.target.value)}
                    className="text-xs border border-amber-300 rounded px-2 py-1 flex-1 bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                  <input
                    type="text"
                    placeholder="Name"
                    value={tierName}
                    onChange={e => setTierName(e.target.value)}
                    className="text-xs border border-amber-300 rounded px-2 py-1 flex-1 bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                  <button
                    onClick={() => { if (tierArt.trim()) setConfirmed(true); }}
                    className="text-xs px-3 py-1 rounded bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-medium"
                  >
                    Bestätigen
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-slate-400 shrink-0">
            <PawPrint size={14} className="text-amber-500" />
            Haustier:
          </span>
          <span className="text-slate-700 font-medium">
            {tierArt}{tierName ? ` (${tierName})` : ''}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle size={10} />
            Bestätigt
          </span>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="text-slate-400 shrink-0">{label}:</span>
      <span className="text-slate-700 font-medium">{value}</span>
    </div>
  );
}
