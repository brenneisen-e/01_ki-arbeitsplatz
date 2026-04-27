import { useState, useMemo } from 'react';
import {
  Sparkles,
  Mail,
  Gift,
  Baby,
  Briefcase,
  Cake,
  Repeat,
  PiggyBank,
  Plane,
  GraduationCap,
  Zap,
  PartyPopper,
  CheckCircle2,
  Clock,
  Send,
  Info,
  ShieldCheck,
  Eye,
  X,
} from 'lucide-react';
import { formatEur } from '../../../utils/formatters';

const STATUS = {
  versendet: { label: 'Automatisch versendet', icon: CheckCircle2, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  geplant:   { label: 'Geplant',                icon: Clock,        color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  vorschlag: { label: 'Vorschlag zur Freigabe', icon: Sparkles,     color: '#a16207', bg: '#fffbeb', border: '#fde68a' },
};

const KATEGORIE_FARBEN = {
  finanztipp:  { label: 'Finanz-Tipp',     color: '#0f766e', bg: '#f0fdfa' },
  geschenk:    { label: 'Geschenk',        color: '#a16207', bg: '#fffbeb' },
  glueckwunsch:{ label: 'Glückwunsch',     color: '#9333ea', bg: '#faf5ff' },
  sparhinweis: { label: 'Spar-Hinweis',    color: '#1d4ed8', bg: '#eff6ff' },
  service:     { label: 'Service',         color: '#475569', bg: '#f8fafc' },
};

function buildServices(kunde) {
  const kindUnter1 = (kunde.kinder || []).find(k => (k.alter ?? 99) <= 1);
  const kindAlter5bis7 = (kunde.kinder || []).find(k => (k.alter ?? 0) >= 5 && (k.alter ?? 0) <= 7);
  const hasGirokonto = (kunde.eigeneProdukte || []).some(p => p.typ === 'girokonto' || p.sparte === 'konto');
  const hasFinanzierung = (kunde.eigeneProdukte || []).some(p => /kredit|finanzierung|darlehen/i.test([p.typ, p.produkt, p.sparte].join(' ')));
  const sparvolumen = (kunde.eigeneProdukte || [])
    .filter(p => /spar|tagesgeld|festgeld/i.test([p.typ, p.sparte].join(' ')))
    .reduce((s, p) => s + (p.volumen || 0), 0);
  const monatsausgaben = Math.abs((kunde.transaktionen || [])
    .filter(t => t.betrag < 0)
    .reduce((s, t) => s + t.betrag, 0));

  const services = [];

  // 1. Freistellungsauftrag-Mismatch
  services.push({
    id: 'freistellung-mismatch',
    kategorie: 'finanztipp',
    status: 'versendet',
    icon: ShieldCheck,
    titel: 'Freistellungsauftrag optimieren',
    datum: '2026-04-12',
    kanal: 'E-Mail',
    quelle: 'Open Finance · Erträge bei Trade Republic & ING erkannt',
    nachricht: `Hallo ${kunde.name?.split(' ')[0] || 'Kunde'}, wir möchten Sie auf eine Optimierungsmöglichkeit hinweisen: Ihr Freistellungsauftrag bei uns liegt bei 600 EUR. Tatsächlich haben Sie in diesem Jahr aber nur ca. 200 EUR Kapitalerträge bei der Volksbank — bei Ihren externen Depots (Trade Republic, ING) sind hingegen rund 600 EUR Zinserträge angefallen, die ungenutzt versteuert werden. Eine Aufteilung des Pauschbetrags spart Ihnen rund 158 EUR Steuern pro Jahr. Antworten Sie einfach auf diese E-Mail, wir passen das gerne kostenfrei für Sie an.`,
    ergebnis: 'Steuerersparnis ca. 158 EUR / Jahr',
  });

  // 2. Geburt vom Kind → Schnuller statt Sparplan
  if (kindUnter1) {
    services.push({
      id: 'geburt-schnuller',
      kategorie: 'geschenk',
      status: 'versendet',
      icon: Baby,
      titel: 'Willkommensgruß zur Geburt',
      datum: '2025-11-08',
      kanal: 'Postversand',
      quelle: `Daueraufträge an Kindergeldkasse + Eingang Elterngeld → KI erkannt: Geburt von ${kindUnter1.name}`,
      nachricht: `Wir haben uns ganz bewusst gegen einen sofortigen Kindersparplan-Anschreiben entschieden — stattdessen schicken wir einen handgeschriebenen Glückwunsch und einen gebrandeten Bio-Schnuller in unserer Bankfarbe. Der Sparplan-Hinweis kommt frühestens nach 6 Monaten, wenn der erste Trubel vorbei ist.`,
      ergebnis: 'Persönlicher Touchpoint ohne Verkaufsdruck',
    });
  }

  // 3. Selbstständigkeit erkannt → 10% Rückstellung
  services.push({
    id: 'selbststaendigkeit-ruecklage',
    kategorie: 'finanztipp',
    status: 'vorschlag',
    icon: Briefcase,
    titel: 'Hinweis zur Steuerrückstellung',
    datum: '2026-04-22',
    kanal: 'E-Mail (Vorschlag)',
    quelle: 'Open Finance · Wegfall Gehaltseingang, dafür unregelmäßige Rechnungseingänge → Lebenslage „Selbstständigkeit"',
    nachricht: `Wir haben festgestellt, dass seit ca. 3 Monaten keine klassischen Gehaltseingänge mehr auf Ihrem Konto verbucht werden — dafür gehen Rechnungsbeträge von verschiedenen Auftraggebern ein. Falls Sie sich selbstständig gemacht haben: Herzlichen Glückwunsch! Ein Tipp aus der Praxis: Legen Sie automatisch ca. 10 % jeder eingehenden Rechnung auf ein separates Tagesgeldkonto zur Seite, um Steuernachzahlungen und USt.-Voranmeldungen entspannt bedienen zu können. Wir richten Ihnen das gerne kostenfrei als automatische Regel ein.`,
    ergebnis: 'Vorschlag — vor Versand prüfen',
  });

  // 4. Geburtstag → Blumengruß
  services.push({
    id: 'geburtstag-blumen',
    kategorie: 'glueckwunsch',
    status: 'geplant',
    icon: Cake,
    titel: 'Geburtstagsgruß mit Blumengutschein',
    datum: '2026-06-14',
    kanal: 'Postkarte + Gutschein',
    quelle: 'Stammdaten · Geburtstag in 7 Wochen',
    nachricht: `Handgeschriebene Glückwunschkarte zum Geburtstag mit einem 25-EUR-Blumengutschein bei „Blumen Müller" (lokaler Partner). Kein Verkaufsanlass, kein Cross-Sell-Hinweis — reiner Wertschätzungs-Touchpoint.`,
    ergebnis: 'NPS-Lift erwartet, Beleg lokales Engagement',
  });

  // 5. Streaming doppelt
  services.push({
    id: 'streaming-doppelt',
    kategorie: 'sparhinweis',
    status: 'versendet',
    icon: Repeat,
    titel: 'Doppelter Dauerauftrag erkannt',
    datum: '2026-03-28',
    kanal: 'In-App-Push',
    quelle: 'Transaktionsanalyse · Netflix 12,99 EUR auf Hauptkonto + Partnerkonto',
    nachricht: `Uns ist aufgefallen, dass sowohl auf Ihrem Konto als auch auf dem Konto Ihrer Partnerin monatlich 12,99 EUR an Netflix abgebucht werden. Vermutlich handelt es sich um zwei separate Abos, die Sie zu einem Familien-Account zusammenlegen können. Ersparnis: ca. 156 EUR pro Jahr — und mehr Profile inklusive.`,
    ergebnis: 'Ersparnis ca. 156 EUR / Jahr',
  });

  // 6. Notgroschen-Hinweis
  if (monatsausgaben > 0 && sparvolumen < monatsausgaben * 3) {
    services.push({
      id: 'notgroschen-hinweis',
      kategorie: 'finanztipp',
      status: 'vorschlag',
      icon: PiggyBank,
      titel: 'Sanfter Hinweis Notgroschen',
      datum: '2026-04-25',
      kanal: 'In-App-Banner',
      quelle: `Liquiditäts-Analyse · Sparguthaben (${formatEur(sparvolumen)}) < 3 Monatsausgaben (${formatEur(monatsausgaben * 3)})`,
      nachricht: `Empfehlung: 2-3 Monatsausgaben als jederzeit verfügbare Reserve. Wir schlagen Ihnen vor, einen kleinen Dauerauftrag (z. B. 100 EUR/Monat) auf ein Tagesgeldkonto einzurichten — komplett ohne Bindung. Reine Information, keine Aufdringlichkeit.`,
      ergebnis: 'Vorschlag — vor Versand prüfen',
    });
  }

  // 7. Reise erkannt → Reise-Tipp
  services.push({
    id: 'reise-tipp',
    kategorie: 'service',
    status: 'versendet',
    icon: Plane,
    titel: 'Reise-Service vor Auslandsreise',
    datum: '2026-02-19',
    kanal: 'In-App-Push',
    quelle: 'Kartenumsatz · Buchung Lufthansa BCN, Übernachtungen erkannt',
    nachricht: `Schöne Reise nach Barcelona! Drei Hinweise vor der Abreise: (1) Ihre VR-Visa Gold ist im Ausland inklusive Reise-Krankenversicherung gültig. (2) Aktivieren Sie kurz die Auslandsfreigabe in der App, damit es bei der ersten Zahlung kein Sicherheits-Stop gibt. (3) Notfall-Hotline für Kartensperre: ${'+49 116 116'}. Gute Reise!`,
    ergebnis: 'Service ohne Verkaufsanlass',
  });

  // 8. Schulanfang Kind
  if (kindAlter5bis7) {
    services.push({
      id: 'schulanfang',
      kategorie: 'geschenk',
      status: 'geplant',
      icon: GraduationCap,
      titel: `Schulanfangs-Gutschein für ${kindAlter5bis7.name}`,
      datum: '2026-08-15',
      kanal: 'Postversand',
      quelle: `Stammdaten · Kind ${kindAlter5bis7.name} (${kindAlter5bis7.alter} J.) — Einschulung im Sommer`,
      nachricht: `Geplant: 20-EUR-Gutschein bei „Schreibwaren Becker" (lokaler Partner) zur Einschulung von ${kindAlter5bis7.name} — handgeschrieben, kein Verkaufs-Beilagen. Optional: Erinnerung an Junior-Sparbuch erst ab Klasse 2.`,
      ergebnis: 'Lokales Partnernetz, NPS-Effekt',
    });
  }

  // 9. Energievertrag-Check
  services.push({
    id: 'energie-check',
    kategorie: 'sparhinweis',
    status: 'vorschlag',
    icon: Zap,
    titel: 'Energievertrag günstiger möglich',
    datum: '2026-04-26',
    kanal: 'E-Mail (Vorschlag)',
    quelle: 'Transaktion · Stadtwerke Gießen 142 EUR/Monat → ca. 18 % über Marktdurchschnitt für 2-Personen-Haushalt',
    nachricht: `Ihr aktueller Stromtarif liegt rund 18 % über dem Marktdurchschnitt für Haushalte vergleichbarer Größe in Ihrer Region. Wir bieten unseren Mitgliedern einen kostenfreien Tarifcheck (über Verivox) — Wechsel optional, wir verkaufen Ihnen nichts. Ersparnispotenzial laut Schätzung: ca. 280 EUR / Jahr.`,
    ergebnis: 'Ersparnispotenzial ca. 280 EUR / Jahr',
  });

  // 10. Tilgung Finanzierung beendet → Glückwunsch
  if (hasFinanzierung) {
    services.push({
      id: 'tilgung-fertig',
      kategorie: 'glueckwunsch',
      status: 'geplant',
      icon: PartyPopper,
      titel: 'Glückwunsch zur letzten Rate',
      datum: '2027-01-10',
      kanal: 'Brief + Sekt-Gutschein',
      quelle: 'Tilgungsplan · letzte Rate erkannt',
      nachricht: `Geplant zur Schluss-Rate Ihrer Immobilienfinanzierung: persönlicher Brief Ihres Beraters mit handschriftlichem Glückwunsch + Sekt-Gutschein bei einem regionalen Weinhändler. Kein Anschluss-Cross-Sell in dieser Sendung — der Hinweis auf eine mögliche Modernisierungs-Finanzierung kommt separat 4 Wochen später.`,
      ergebnis: 'Bindungsmoment am Lebensereignis',
    });
  }

  return services;
}

function ServiceCard({ service, onPreview }) {
  const status = STATUS[service.status];
  const kat = KATEGORIE_FARBEN[service.kategorie];
  const StatusIcon = status.icon;
  const Icon = service.icon;
  const datumDe = new Date(service.datum).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="card-base p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: kat.bg, color: kat.color }}>
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: kat.bg, color: kat.color }}>
              {kat.label}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border" style={{ background: status.bg, color: status.color, borderColor: status.border }}>
              <StatusIcon size={12} />
              {status.label}
            </span>
            <span className="text-xs text-slate-500">{datumDe} · {service.kanal}</span>
          </div>
          <h3 className="mt-1 text-base font-semibold text-slate-900">{service.titel}</h3>
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
        <Info size={14} className="shrink-0 mt-0.5 text-slate-500" />
        <span><span className="font-medium text-slate-700">Trigger:</span> {service.quelle}</span>
      </div>

      <p className="text-sm text-slate-700 leading-relaxed line-clamp-3">{service.nachricht}</p>

      <div className="flex items-center justify-between pt-1 mt-auto">
        <div className="text-xs text-slate-500">
          <span className="font-medium text-slate-700">Effekt:</span> {service.ergebnis}
        </div>
        <button
          type="button"
          onClick={() => onPreview(service)}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700"
        >
          <Eye size={14} />
          Vorschau
        </button>
      </div>
    </div>
  );
}

function PreviewModal({ service, onClose }) {
  if (!service) return null;
  const status = STATUS[service.status];
  const StatusIcon = status.icon;
  const datumDe = new Date(service.datum).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail size={20} className="text-slate-600" />
            <div>
              <h3 className="text-base font-semibold text-slate-900">{service.titel}</h3>
              <div className="text-xs text-slate-500">{datumDe} · {service.kanal}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" aria-label="Schließen">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border" style={{ background: status.bg, color: status.color, borderColor: status.border }}>
            <StatusIcon size={12} />
            {status.label}
          </div>
          <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{service.nachricht}</div>
          <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <span className="font-medium text-slate-700">Trigger:</span> {service.quelle}
          </div>
        </div>
        {service.status === 'vorschlag' && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">
              Verwerfen
            </button>
            <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg text-white inline-flex items-center gap-1.5" style={{ background: 'var(--mode-primary)' }}>
              <Send size={14} />
              Freigeben &amp; senden
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ServiceTab({ kunde }) {
  const services = useMemo(() => buildServices(kunde), [kunde]);
  const [preview, setPreview] = useState(null);

  const counts = useMemo(() => ({
    versendet: services.filter(s => s.status === 'versendet').length,
    geplant:   services.filter(s => s.status === 'geplant').length,
    vorschlag: services.filter(s => s.status === 'vorschlag').length,
  }), [services]);

  return (
    <div className="space-y-6">
      <div className="card-base p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--mode-primary-light, #00843d)', color: 'white' }}>
            <Sparkles size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900">Automatisierte KI-Service-Kommunikation</h2>
            <p className="text-sm text-slate-600 mt-1">
              Auf Basis von Open-Finance-Daten, Transaktionsmustern und Lebenslagen erkennt die KI passende
              Service-Anlässe und versendet — nach Freigabe-Regeln — Hinweise, Glückwünsche oder kleine
              Aufmerksamkeiten. Ziel: dem Kunden einen Mehrwert bieten, ohne sofort zu verkaufen.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border" style={{ background: STATUS.versendet.bg, color: STATUS.versendet.color, borderColor: STATUS.versendet.border }}>
                <CheckCircle2 size={12} /> {counts.versendet} versendet
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border" style={{ background: STATUS.geplant.bg, color: STATUS.geplant.color, borderColor: STATUS.geplant.border }}>
                <Clock size={12} /> {counts.geplant} geplant
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border" style={{ background: STATUS.vorschlag.bg, color: STATUS.vorschlag.color, borderColor: STATUS.vorschlag.border }}>
                <Sparkles size={12} /> {counts.vorschlag} zur Freigabe
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {services.map(s => (
          <ServiceCard key={s.id} service={s} onPreview={setPreview} />
        ))}
      </div>

      {services.length === 0 && (
        <div className="card-base p-8 text-center text-sm text-slate-500">
          Aktuell keine automatisierten Service-Anlässe erkannt.
        </div>
      )}

      <PreviewModal service={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
