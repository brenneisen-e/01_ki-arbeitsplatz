import { useState, useMemo } from 'react';
import {
  Sparkles,
  Wallet,
  Home,
  Shield,
  TrendingUp,
  Landmark,
  PiggyBank,
  CreditCard,
  Phone,
  Mail,
  Calendar,
  Users,
  Building2,
  AlertTriangle,
  Check,
  Circle,
  CircleDot,
  RefreshCw,
  Briefcase,
  Heart,
  ArrowUp,
  ArrowDown,
  Clock,
} from 'lucide-react';
import Card from './Card';
import { formatEur } from '../../utils/formatters';

/* ──────────────────────────────────────────────────────
 * 1) KI-Zusammenfassung
 * ──────────────────────────────────────────────────── */
export function KISummaryBlock({ kunde }) {
  const summary = useMemo(() => buildKundenSummary(kunde), [kunde]);
  const urgencyColor = summary.urgency === 'high'
    ? '#dc2626'
    : summary.urgency === 'medium'
    ? '#f59e0b'
    : '#6366f1';
  const urgencyBg = summary.urgency === 'high'
    ? '#fef2f2'
    : summary.urgency === 'medium'
    ? '#fffbeb'
    : '#eef2ff';

  return (
    <Card hover={false} className="relative overflow-hidden">
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: urgencyColor }}
      />
      <div className="pl-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: urgencyBg }}
            >
              <Sparkles size={16} style={{ color: urgencyColor }} strokeWidth={2} />
            </div>
            <h3 className="font-semibold text-slate-800">KI-Zusammenfassung</h3>
            {summary.urgency === 'high' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                <AlertTriangle size={10} /> Hoher Handlungsbedarf
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Aktualisiert heute</span>
            <button
              className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
              title="Neu generieren"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed">
          {summary.text}
        </p>

        {summary.recommendation && (
          <div
            className="mt-3 rounded-lg p-3 flex items-start gap-2"
            style={{ backgroundColor: urgencyBg, border: `1px solid ${urgencyColor}30` }}
          >
            <Sparkles size={14} className="shrink-0 mt-0.5" style={{ color: urgencyColor }} />
            <div className="text-sm text-slate-800">
              <span className="font-bold">Empfehlung: </span>
              {summary.recommendation}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function buildKundenSummary(kunde) {
  const name = kunde.name;
  const beruf = kunde.beruf || 'Berufsperson';
  const arbeitgeber = kunde.arbeitgeber?.name;
  const partnerName = kunde.partner?.name;
  const familienstand = kunde.familienstand;
  const kinderInfo = kunde.kinder?.length
    ? `${kunde.kinder.length === 1 ? 'einem Kind' : `${kunde.kinder.length} Kindern`} (${kunde.kinder.map(k => k.alter).join(', ')})`
    : null;
  const seitJahr = kunde.eigeneProdukte?.[0]?.seit?.slice(0, 4);
  const jahre = seitJahr ? new Date().getFullYear() - parseInt(seitJahr, 10) : null;

  const internCount = kunde.eigeneProdukte?.length || 0;
  const fremdCount = kunde.fremdProdukte?.length || 0;
  const hatBaufi = kunde.eigeneProdukte?.some(p => /baufi|baufinanzierung/i.test(p.produkt));
  const hatBSV = kunde.eigeneProdukte?.some(p => /bsv|bauspar/i.test(p.produkt));
  const hatBU = kunde.eigeneProdukte?.some(p => /berufsunfähigkeit|bu-vers|bu /i.test(p.produkt));

  // Build text
  const parts = [];
  parts.push(`${name} ist seit ${jahre ? `${jahre} Jahren ` : ''}Kunde${arbeitgeber ? `, ${beruf} bei ${arbeitgeber}` : `, ${beruf}`}${familienstand === 'verheiratet' && partnerName ? `, verheiratet mit ${partnerName}` : ''}${kinderInfo ? `, ${kinderInfo}` : ''}.`);

  if (kunde.abwanderungsrisiko === 'mittel' || kunde.abwanderungsrisiko === 'hoch') {
    parts.push(`Aktuell zeigt der Kunde Anzeichen für ein erhöhtes Abwanderungsrisiko (${kunde.abwanderungsrisiko}).`);
  }
  if (fremdCount > 0) {
    parts.push(`FIDA-Daten zeigen ${fremdCount} Produkte bei Fremdbanken — hier liegt Konsolidierungspotenzial.`);
  }
  if (hatBaufi && !hatBU) {
    parts.push(`Es besteht eine Baufinanzierung, aber keine Risikolebens- oder Berufsunfähigkeitsabsicherung.`);
  }

  const text = parts.join(' ');

  // Recommendation
  let recommendation = '';
  let urgency = 'low';

  if (hatBaufi && !hatBU && kinderInfo) {
    recommendation = 'Absicherungslücken (BU/RLV) als Alleinverdiener-Familie schließen. Anschluss-Beratung für Baufinanzierung priorisieren.';
    urgency = 'high';
  } else if (hatBaufi && !hatBU) {
    recommendation = 'BU/RLV-Absicherung im Anschluss an die Baufinanzierung anbieten.';
    urgency = 'medium';
  } else if (kunde.abwanderungsrisiko === 'mittel') {
    recommendation = 'Bindungsgespräch führen, Cross-Selling und Depot-Konsolidierung anbieten.';
    urgency = 'medium';
  } else if (hatBSV) {
    recommendation = 'Bausparvertrag prüfen — Zuteilung für Anschlussfinanzierung oder Sondertilgung nutzen.';
    urgency = 'low';
  } else {
    recommendation = `Jahresgespräch mit ${name.split(' ')[0]} terminieren — Absicherung und Vorsorge gemeinsam durchgehen.`;
    urgency = 'low';
  }

  return { text, recommendation, urgency };
}

/* ──────────────────────────────────────────────────────
 * 2) Produktbestand (Intern + FIDA)
 * ──────────────────────────────────────────────────── */
export function ProduktbestandBlock({ kunde }) {
  const intern = kunde.eigeneProdukte || [];
  const fida = kunde.fremdProdukte || [];

  return (
    <Card hover={false}>
      <div className="flex items-center gap-2 mb-4">
        <Wallet size={18} className="text-slate-500" strokeWidth={1.75} />
        <h3 className="font-semibold text-slate-800">Produktbestand</h3>
        <span className="ml-auto text-xs text-slate-400">
          {intern.length} bei uns · {fida.length} fremd
        </span>
      </div>

      {/* Intern */}
      {intern.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Bei uns
          </div>
          <div className="grid grid-cols-2 gap-2">
            {intern.map((p, i) => (
              <ProductCard key={i} product={p} type="intern" />
            ))}
          </div>
        </div>
      )}

      {/* FIDA */}
      {fida.length > 0 && (
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            Bei Fremdbanken (FIDA)
          </div>
          <div className="grid grid-cols-2 gap-2">
            {fida.map((p, i) => (
              <ProductCard key={i} product={p} type="fida" />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function ProductCard({ product, type }) {
  const isFida = type === 'fida';
  const Icon = getProductIcon(product);
  const label = product.produkt || product.produktart || product.typ || 'Produkt';
  const detail = product.details || (product.volumen ? formatEur(product.volumen) : '');
  const provider = product.institut;

  return (
    <div
      className={`rounded-lg p-2.5 border ${
        isFida ? 'bg-purple-50/40 border-purple-200' : 'bg-slate-50 border-slate-200'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon size={13} className={isFida ? 'text-purple-600' : 'text-slate-500'} strokeWidth={2} />
        <span className="text-[12px] font-bold text-slate-800 truncate flex-1">{label}</span>
      </div>
      {provider && (
        <div className="text-[10px] font-semibold text-purple-700 mb-0.5">{provider}</div>
      )}
      <div className="text-[10px] text-slate-500 truncate">{detail}</div>
      {product.seit && (
        <div className="text-[10px] text-slate-400 font-mono mt-0.5">seit {product.seit}</div>
      )}
      {product.volumen != null && product.volumen > 0 && !detail.includes('€') && (
        <div className="text-[10px] font-mono font-semibold text-slate-700 mt-0.5">
          {formatEur(product.volumen)}
        </div>
      )}
    </div>
  );
}

function getProductIcon(p) {
  const t = (p.typ || p.produktart || p.produkt || '').toLowerCase();
  if (/giro/.test(t)) return Wallet;
  if (/spar|piggy/.test(t)) return PiggyBank;
  if (/baufi|kredit|loan|finanzier/.test(t)) return Home;
  if (/depot|fonds|etf/.test(t)) return TrendingUp;
  if (/tagesgeld|festgeld/.test(t)) return Landmark;
  if (/visa|karte|kredit\s*karte/.test(t)) return CreditCard;
  if (/versicherung|hpfl|haftpfl|haus|hausrat|kfz|berufsunfähig|leben/.test(t)) return Shield;
  return Briefcase;
}

/* ──────────────────────────────────────────────────────
 * 3) Absicherungs-Check
 * ──────────────────────────────────────────────────── */
export function AbsicherungsCheckBlock({ kunde }) {
  const checks = useMemo(() => buildAbsicherungsChecks(kunde), [kunde]);
  const intern = checks.filter(c => c.status === 'intern').length;
  const missing = checks.filter(c => c.status === 'missing').length;
  const fremd = checks.filter(c => c.status === 'fremd' || c.status === 'fremd_lueckenhaft').length;

  const warnings = useMemo(() => buildAbsicherungsWarnings(kunde, checks), [kunde, checks]);

  return (
    <Card hover={false}>
      <div className="flex items-center gap-2 mb-4">
        <Shield size={18} className="text-slate-500" strokeWidth={1.75} />
        <h3 className="font-semibold text-slate-800">Absicherungs-Check</h3>
      </div>

      <div className="space-y-1.5">
        {checks.map((c, i) => (
          <CheckRow key={i} check={c} />
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
        <span className="font-semibold text-emerald-700">{intern} vorhanden</span>
        {' · '}
        <span className="font-semibold text-red-700">{missing} fehlen</span>
        {' · '}
        <span className="font-semibold text-purple-700">{fremd} fremd</span>
      </div>

      {warnings.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {warnings.map((w, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-[12px] bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5"
            >
              <AlertTriangle size={12} className="text-amber-600 mt-0.5 shrink-0" />
              <span className="text-amber-900">{w}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function CheckRow({ check }) {
  const cfg = {
    intern: { color: '#22c55e', icon: Check, label: 'vorhanden' },
    fremd: { color: '#8b5cf6', icon: CircleDot, label: 'fremd' },
    fremd_lueckenhaft: { color: '#d97706', icon: CircleDot, label: 'fremd · Lücke' },
    missing: { color: '#dc2626', icon: Circle, label: 'fehlt' },
  };
  const c = cfg[check.status] || cfg.missing;
  const Icon = c.icon;
  return (
    <div className="flex items-center gap-2 text-[12px]">
      <Icon size={14} style={{ color: c.color }} strokeWidth={2.5} />
      <span className="text-slate-700 font-medium flex-1">{check.product}</span>
      <span style={{ color: c.color }} className="font-semibold">
        {c.label}
        {check.provider ? ` (${check.provider})` : ''}
      </span>
    </div>
  );
}

function buildAbsicherungsChecks(kunde) {
  // Map: produktartig → status
  const internProducts = kunde.eigeneProdukte || [];
  const fremdProducts = kunde.fremdProdukte || [];

  function findInternal(...needles) {
    return internProducts.find(p => {
      const text = `${p.produkt} ${p.typ}`.toLowerCase();
      return needles.some(n => text.includes(n.toLowerCase()));
    });
  }

  function findFremd(...needles) {
    return fremdProducts.find(p => {
      const text = `${p.produkt || ''} ${p.produktart || ''} ${p.typ || ''}`.toLowerCase();
      return needles.some(n => text.includes(n.toLowerCase()));
    });
  }

  const checks = [];

  function addCheck(productLabel, internalNeedles, fremdNeedles) {
    const intern = findInternal(...internalNeedles);
    const fremd = findFremd(...fremdNeedles);
    if (intern) {
      checks.push({ product: productLabel, status: 'intern', provider: 'R+V' });
    } else if (fremd) {
      checks.push({ product: productLabel, status: 'fremd', provider: fremd.institut || 'Fremdanbieter' });
    } else {
      checks.push({ product: productLabel, status: 'missing' });
    }
  }

  addCheck('Privathaftpflicht', ['privathaftpflicht', 'haftpflicht'], ['privathaftpflicht', 'haftpflicht']);
  addCheck('Berufsunfähigkeit', ['bu-versicherung', 'berufsunfähigkeit'], ['berufsunfähigkeit']);
  addCheck('Risikolebensversicherung', ['risikoleben', 'rlv'], ['risikoleben', 'rlv']);
  addCheck('Hausratversicherung', ['hausrat'], ['hausrat']);
  addCheck('KFZ-Versicherung', ['kfz', 'auto'], ['kfz', 'auto', 'vollkasko']);
  addCheck('Unfallversicherung', ['unfall'], ['unfall']);
  addCheck('Rechtsschutzversicherung', ['rechtsschutz'], ['rechtsschutz']);
  addCheck('Wohngebäudeversicherung', ['wohngebäude'], ['wohngebäude']);

  return checks;
}

function buildAbsicherungsWarnings(kunde, checks) {
  const warnings = [];
  const hasBaufi = (kunde.eigeneProdukte || []).some(p => /baufi/i.test(p.produkt));
  const hasBU = checks.find(c => c.product === 'Berufsunfähigkeit');
  const hasRLV = checks.find(c => c.product === 'Risikolebensversicherung');

  if (hasBaufi && hasRLV?.status === 'missing') {
    warnings.push('Baufinanzierung ohne Risikolebensversicherung.');
  }
  if (kunde.kinder?.length > 0 && hasBU?.status === 'missing') {
    warnings.push(`Familienverantwortung mit ${kunde.kinder.length} ${kunde.kinder.length === 1 ? 'Kind' : 'Kindern'}, aber keine BU vorhanden.`);
  }
  return warnings;
}

/* ──────────────────────────────────────────────────────
 * 4) Kontakt & Beziehung
 * ──────────────────────────────────────────────────── */
export function KontaktBlock({ kunde }) {
  // Demo data — in echter App aus CRM
  const lastContactDays = 29;
  const score = kunde.nps != null ? Math.min(10, kunde.nps) : 7;
  const trend = kunde.abwanderungsrisiko === 'mittel' ? 'sinkend' : 'stabil';

  const contacts = [
    { date: '12.03.2026', type: 'Termin', subject: 'Baufi-Gespräch' },
    { date: '18.01.2026', type: 'Telefon', subject: 'Rückfrage KfW-Kredit' },
    { date: '04.11.2025', type: 'E-Mail', subject: 'Tagesgeld-Konditionen' },
  ];

  return (
    <Card hover={false}>
      <div className="flex items-center gap-2 mb-4">
        <Phone size={18} className="text-slate-500" strokeWidth={1.75} />
        <h3 className="font-semibold text-slate-800">Kontakt & Beziehung</h3>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
            Letzter Kontakt
          </div>
          <div className="font-semibold text-slate-700">
            {contacts[0].date} · {contacts[0].type} · {contacts[0].subject}
          </div>
          {lastContactDays > 90 && (
            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
              <AlertTriangle size={10} /> Kein Kontakt seit 3+ Monaten
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-[12px]">
          <InfoBit label="Bevorzugter Kanal" value="Telefon (vormittags)" />
          <InfoBit label="Bevorzugter Tag" value="Di, Do" />
          <InfoBit label="Beziehung" value={`${score}/10 (${trend})`} />
          <InfoBit label="Kontakte (12 Mo.)" value="6 (3T · 2P · 1M)" />
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Letzte 3 Kontakte
          </div>
          <div className="space-y-1">
            {contacts.map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-[12px] py-1 border-b border-slate-100 last:border-0"
              >
                <span className="text-slate-400 font-mono w-20 shrink-0">{c.date}</span>
                <span className="text-slate-500 w-16 shrink-0">{c.type}</span>
                <span className="text-slate-700 truncate">{c.subject}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function InfoBit({ label, value }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="text-slate-700 font-semibold">{value}</div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
 * 5) Haushalt & Netzwerk
 * ──────────────────────────────────────────────────── */
export function HaushaltBlock({ kunde }) {
  const partner = kunde.partner;
  const kinder = kunde.kinder || [];
  const arbeitgeber = kunde.arbeitgeber?.name;

  // Häushaltspotenziale
  const potentials = [];
  if (partner && !partner.istKunde) {
    potentials.push(`${partner.name} als Kund:in gewinnen (${partner.beruf})`);
  }
  kinder.forEach(k => {
    if (k.alter >= 12 && k.alter < 14) {
      potentials.push(`${k.name}: Junior-Depot ab 14 J. (in ${14 - k.alter} Jahren)`);
    }
    if (k.alter >= 14 && k.alter < 18) {
      potentials.push(`${k.name}: Junior-Depot bereits möglich`);
    }
    if (k.alter >= 17) {
      potentials.push(`${k.name}: Eigenes Konto ab 18 J.`);
    }
  });
  if (kinder.length >= 2) {
    potentials.push('Familien-Rechtsschutz statt Einzel-Police');
  }

  return (
    <Card hover={false}>
      <div className="flex items-center gap-2 mb-4">
        <Users size={18} className="text-slate-500" strokeWidth={1.75} />
        <h3 className="font-semibold text-slate-800">Haushalt & Netzwerk</h3>
      </div>

      {/* Family tree */}
      <div className="bg-slate-50 rounded-lg p-3 mb-3">
        <div className="flex items-start justify-center gap-3">
          <FamilyMember
            name={kunde.name}
            role={kunde.beruf || ''}
            isCustomer
          />
          {partner && (
            <>
              <div className="text-slate-300 mt-6">
                <Heart size={14} className="text-rose-400 fill-rose-400" />
              </div>
              <FamilyMember
                name={partner.name}
                role={partner.beruf || ''}
                isCustomer={false}
              />
            </>
          )}
        </div>
        {kinder.length > 0 && (
          <div className="flex items-start justify-center gap-2 mt-3 pt-3 border-t border-slate-200">
            {kinder.map((k, i) => (
              <FamilyMember
                key={i}
                name={k.name}
                role={`${k.alter} J.`}
                isCustomer={false}
                small
              />
            ))}
          </div>
        )}
      </div>

      {potentials.length > 0 && (
        <div className="mb-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Potenziale im Haushalt
          </div>
          <ul className="space-y-0.5">
            {potentials.map((p, i) => (
              <li key={i} className="text-[12px] text-slate-700 flex items-start gap-1.5">
                <span className="text-indigo-500 mt-0.5">·</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {arbeitgeber && (
        <div className="pt-3 border-t border-slate-100">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Arbeitgeber-Netzwerk
          </div>
          <div className="flex items-center gap-2 text-[12px]">
            <Building2 size={13} className="text-slate-400" />
            <span className="text-slate-700 font-semibold">{arbeitgeber}</span>
            <span className="text-slate-400">· bAV-Potenzial als Gruppe</span>
          </div>
        </div>
      )}
    </Card>
  );
}

function FamilyMember({ name, role, isCustomer, small }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const size = small ? 'w-10 h-10 text-xs' : 'w-12 h-12 text-sm';
  return (
    <div className="flex flex-col items-center min-w-[68px]">
      <div
        className={`${size} rounded-full flex items-center justify-center font-bold text-white shadow-sm`}
        style={{ background: isCustomer ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#94a3b8' }}
      >
        {initials || '?'}
      </div>
      <div className={`text-[10px] font-bold text-slate-700 mt-1 text-center max-w-[80px] truncate`}>
        {name}
      </div>
      <div className="text-[9px] text-slate-500 text-center">{role}</div>
      <div
        className={`text-[8px] font-bold mt-0.5 ${
          isCustomer ? 'text-emerald-600' : 'text-slate-400'
        }`}
      >
        {isCustomer ? '● Kunde' : '○ Nicht Kunde'}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────
 * 6) Nächste Ereignisse & Meilensteine
 * ──────────────────────────────────────────────────── */
export function NaechsteEreignisseBlock({ kunde }) {
  const events = useMemo(() => buildEvents(kunde), [kunde]);

  return (
    <Card hover={false}>
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={18} className="text-slate-500" strokeWidth={1.75} />
        <h3 className="font-semibold text-slate-800">Nächste Ereignisse</h3>
        <span className="ml-auto text-xs text-slate-400">{events.length} Termine</span>
      </div>

      <div className="space-y-3">
        {events.map((e, i) => (
          <EventRow key={i} event={e} />
        ))}
      </div>
    </Card>
  );
}

function EventRow({ event }) {
  const isUrgent = event.urgent;
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 pt-1">
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            isUrgent ? 'bg-amber-500' : 'border-2 border-slate-300 bg-white'
          }`}
          style={isUrgent ? { boxShadow: '0 0 0 3px rgba(245, 158, 11, 0.2)' } : undefined}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-mono text-xs text-slate-500 font-semibold">{event.date}</span>
          <span className="text-sm font-bold text-slate-800">{event.label}</span>
          {event.detail && (
            <span className="text-xs text-slate-500">— {event.detail}</span>
          )}
        </div>
        {event.action && (
          <div className="text-xs text-slate-500 italic mt-0.5 flex items-center gap-1">
            <ArrowUp size={10} className="rotate-45" />
            {event.action}
          </div>
        )}
      </div>
      <div className="text-[10px] font-mono font-bold text-slate-400 shrink-0">
        {event.relative}
      </div>
    </div>
  );
}

function buildEvents(kunde) {
  const events = [];
  const today = new Date();

  // 1) Auslaufende Verträge aus eigeneProdukte
  (kunde.eigeneProdukte || []).forEach(p => {
    if (/zinsbindung|läuft aus|ausläuft|fälligkeit/i.test(p.details || '')) {
      events.push({
        date: '04/2026',
        label: p.produkt,
        detail: 'Zinsbindung läuft aus',
        action: 'Anschlussfinanzierung vorbereiten',
        urgent: true,
        relative: 'demnächst',
      });
    }
    if (/zuteilungsreif|zuteilung 2026/i.test(p.details || '')) {
      events.push({
        date: '2026',
        label: p.produkt,
        detail: 'Zuteilungsreif',
        action: 'Bausparvertrag-Verwendung besprechen',
        urgent: true,
        relative: 'jetzt',
      });
    }
  });

  // 2) Kinder die ein neues Lebensjahr erreichen
  (kunde.kinder || []).forEach(k => {
    if (k.alter === 12) {
      events.push({
        date: `${today.getFullYear() + 2}`,
        label: `${k.name} wird 14`,
        detail: 'Junior-Depot-Alter',
        action: 'Junior-Depot-Eröffnung vorbereiten',
        urgent: false,
        relative: '2 Jahre',
      });
    }
    if (k.alter >= 17 && k.alter < 18) {
      events.push({
        date: `${today.getFullYear() + 1}`,
        label: `${k.name} wird 18`,
        detail: 'Eigenes Konto',
        action: 'Volljährigen-Konto anbieten',
        urgent: false,
        relative: '1 Jahr',
      });
    }
  });

  // Fallback: Standard-Jahresgespräch
  if (events.length === 0) {
    events.push({
      date: `${today.getFullYear()}`,
      label: 'Jahresgespräch',
      detail: null,
      action: 'Bedarfsanalyse + Cross-Selling-Check',
      urgent: false,
      relative: 'dieses Jahr',
    });
  }

  return events;
}
