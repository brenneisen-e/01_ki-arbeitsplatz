import { useState, useEffect, useMemo, useRef } from 'react';
import { clsx } from 'clsx';
import {
  X, Lock, ShieldCheck, Search, ChevronRight, ArrowLeft, Check, CheckCircle2,
  Landmark, Smartphone, Loader2, Info, AlertTriangle, PawPrint, Mountain,
  Home, Car, Umbrella, Fingerprint, ScanLine, Ban, Wallet, TrendingDown,
  ShoppingCart, ShoppingBag, Train, UtensilsCrossed, Repeat, PiggyBank,
  ArrowDownLeft, Building2, FileText, Eye, EyeOff, RefreshCw, HeartPulse,
  ChevronDown, Sparkles, BadgeCheck, Banknote,
} from 'lucide-react';
import { useMode } from '../../hooks/useMode';
import useTranslation from '../../i18n/useTranslation';
import { getKundeById, SHOWCASE_KUNDE_IDS } from '../../data';
import LogoImg from '../ui/LogoImg';

/* ════════════════════════════════════════════════════════════════════════
   Kunden-Datenabfrage (PSD2 / Open Banking Landing Page)

   Kundenseitige Einwilligungs- und Kontoabruf-Strecke, wie sie der Kunde
   (Demo: Klaus Fischer) per Link vom Berater erhält. Der Versicherer ist
   hier der TPP, finAPI der BaFin-lizenzierte Kontoinformationsdienst (AISP).

   Die Strecke ist bewusst DSGVO-sauber gebaut (vgl. Beratungskontext):
   - Freiwillig (Art. 7 Abs. 4): keine Kopplung an die Kundenkonto-Nutzung
   - Zweckspezifisch (Art. 7): jeder Zweck einzeln an-/abwählbar
   - Informiert (Art. 13): Verantwortliche, Datenarten, Speicherdauer, Logik
   - Widerrufbar (Art. 7 Abs. 3): jederzeit, so einfach wie die Erteilung
   - Art. 9: sensible Buchungen werden an der Quelle (finAPI) herausgefiltert
   - Art. 22: keine automatisierte Einzelentscheidung – nur Beratungshinweise
   ════════════════════════════════════════════════════════════════════════ */

const STEPS = ['welcome', 'bank', 'login', 'sca', 'consent', 'reading', 'result'];

// Banken-Auswahl für den finAPI/Tink-typischen Bank-Picker
const BANKS = [
  { name: 'Sparkasse', display: 'Sparkasse KölnBonn', blz: 'COKSDE33' },
  { name: 'Volksbank', display: 'Volksbank Köln Bonn eG', blz: 'GENODED1BRS' },
  { name: 'Deutsche Bank', display: 'Deutsche Bank', blz: 'DEUTDEDK' },
  { name: 'Commerzbank', display: 'Commerzbank', blz: 'COBADEFF' },
  { name: 'ING', display: 'ING', blz: 'INGDDEFF' },
  { name: 'DKB', display: 'DKB Deutsche Kreditbank', blz: 'BYLADEM1' },
  { name: 'Postbank', display: 'Postbank', blz: 'PBNKDEFF' },
  { name: 'HypoVereinsbank', display: 'HypoVereinsbank (UniCredit)', blz: 'HYVEDEMM' },
  { name: 'Comdirect', display: 'comdirect', blz: 'COBADEHD' },
  { name: 'N26', display: 'N26', blz: 'NTSBDEB1' },
  { name: 'Targobank', display: 'Targobank', blz: 'CMCIDEDD' },
  { name: 'Consorsbank', display: 'Consorsbank', blz: 'CSDBDE71' },
];

// Geldbetrag deutsch/locale formatieren, zwei Nachkommastellen (Kontoauszug)
function eur(val, lang) {
  const loc = lang === 'en' ? 'en-GB' : 'de-DE';
  return val.toLocaleString(loc, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}
function eurJahr(val, lang) {
  const loc = lang === 'en' ? 'en-GB' : 'de-DE';
  return Math.round(val).toLocaleString(loc) + ' €';
}

// ─── Realistischer Kontoauszug für Klaus Fischer ──────────────────────────
// Die signaltragenden Buchungen (Versicherung, Tier, Sport) sind aus den
// echten Demo-Daten abgeleitet (transaktionen, tiere.umsaetze, risikoSignale,
// openFinance.versicherungenFremd). Drumherum liegt – wie vom Kunden gewünscht
// – ein normaler Kontoauszug mit Alltagsbuchungen. Die Versicherungs-
// Lastschriften werden aus den Jahresprämien des Bestands monatlich abgeleitet,
// damit sie zur Finanzübersicht passen. `institut` ist die aktive Marke
// (Zukunftsversicherung, ERGO, Allianz, …) – der eigene Vertrag ("bei uns")
// läuft auf diese Marke, nicht auf den Demo-Default ERGO.
function buildKontoauszug(kunde, lang, institut) {
  const tt = (de, en) => (lang === 'en' ? en : de);
  const heute = new Date();
  const tag = (n) => {
    const d = new Date(heute);
    d.setDate(d.getDate() - n);
    return d;
  };

  // art bestimmt Icon + Behandlung. signal=true → fließt in die Auswertung,
  // sensibel=true → wird herausgefiltert (Art. 9), nie übertragen.
  const rows = [
    // Einkommen
    { n: 5, e: 'Deutsche Telekom AG', z: tt('Gehalt/Bezüge 06/2026', 'Salary 06/2026'), b: 4200, art: 'einkommen' },
    { n: 5, e: 'Land NRW – LBV', z: tt('Bezüge Sarah Fischer', 'Salary Sarah Fischer'), b: 1800, art: 'einkommen' },
    { n: 8, e: 'Familienkasse NRW', z: tt('Kindergeld 2 Kinder', 'Child benefit'), b: 500, art: 'einkommen' },

    // Wohnen & Finanzierung
    { n: 6, e: 'Sparkasse KölnBonn', z: tt('Baufinanzierung Lindenallee 23', 'Mortgage Lindenallee 23'), b: -1050, art: 'finanzierung' },
    { n: 6, e: 'Commerzbank', z: tt('Ratenkredit (Studienkredit Rest)', 'Installment loan'), b: -120, art: 'finanzierung' },
    { n: 7, e: 'RheinEnergie AG', z: tt('Abschlag Strom/Gas', 'Utilities prepayment'), b: -168, art: 'wohnen' },
    { n: 6, e: 'Stadt Köln – Kita', z: tt('Elternbeitrag Kita', 'Daycare fee'), b: -380, art: 'wohnen' },
    { n: 6, e: 'Vodafone Kabel DE', z: tt('Internet & TV', 'Internet & TV'), b: -39.99, art: 'wohnen' },
    { n: 6, e: 'Telekom Deutschland', z: tt('Mobilfunk Vertrag', 'Mobile contract'), b: -49.95, art: 'wohnen' },

    // ── Versicherungs-Lastschriften (Signal) ──
    { n: 4, e: institut, z: tt('Vertrag BU/Kfz/Unfall', 'Policy DI/Motor/Accident'), b: -246.67, art: 'versicherung',
      vertrag: { institut, produkt: tt('BU Comfort + Kfz + Unfall', 'Disability + Motor + Accident'), praemieJahr: 2960, eigen: true } },
    { n: 9, e: 'Allianz Versicherungs-AG', z: tt('Kfz-Vollkasko VW Passat', 'Motor comprehensive VW Passat'), b: -60, art: 'versicherung',
      vertrag: { institut: 'Allianz', produkt: tt('Kfz-Vollkasko (VW Passat, SF-12)', 'Motor comprehensive (VW Passat)'), praemieJahr: 720, eigen: false } },
    { n: 9, e: 'Allianz Lebensvers.-AG', z: tt('Risikolebensversicherung', 'Term life insurance'), b: -45, art: 'versicherung',
      vertrag: { institut: 'Allianz', produkt: tt('Risikoleben 150k (bis 2035)', 'Term life 150k (until 2035)'), praemieJahr: 540, eigen: false } },
    { n: 11, e: 'HUK-COBURG', z: tt('Hausratversicherung', 'Home contents insurance'), b: -15, art: 'versicherung',
      vertrag: { institut: 'HUK-Coburg', produkt: tt('Hausrat (65 m² Standard)', 'Home contents (65 m²)'), praemieJahr: 180, eigen: false } },
    { n: 11, e: 'HUK-COBURG', z: tt('Privathaftpflicht Familie', 'Private liability family'), b: -7.92, art: 'versicherung',
      vertrag: { institut: 'HUK-Coburg', produkt: tt('Privathaftpflicht (10 Mio.)', 'Private liability (10m)'), praemieJahr: 95, eigen: false } },

    // ── Tier (Signal → Tierkranken-Bedarf) ──
    { n: 3, e: 'Fressnapf Köln', z: tt('Tierbedarf', 'Pet supplies'), b: -85, art: 'tier' },
    { n: 12, e: 'Hundeschule Rhein', z: tt('Hundetraining Monatskurs', 'Dog training course'), b: -45, art: 'tier' },
    { n: 18, e: 'Tierarztpraxis Dr. Müller', z: tt('Behandlung/Impfung', 'Treatment/vaccination'), b: -120, art: 'tier' },

    // ── Extremsport (Signal → Unfall-Bedarf) ──
    { n: 14, e: 'DAV Kletterzentrum Köln', z: tt('Bouldern Monatsabo', 'Bouldering membership'), b: -65, art: 'sport' },
    { n: 22, e: 'Skydive Center Marburg', z: tt('Tandem-/Fallschirmsprung', 'Skydiving jump'), b: -320, art: 'sport' },
    { n: 28, e: 'Globetrotter Ausrüstung', z: tt('Kletterschuhe/Ausrüstung', 'Climbing gear'), b: -149, art: 'sport' },

    // Sparen / Anlage
    { n: 2, e: 'Trade Republic', z: tt('ETF-/Aktien-Sparplan', 'ETF/stock savings plan'), b: -200, art: 'sparen' },
    { n: 6, e: 'Sparkasse KölnBonn', z: tt('Dauerauftrag Urlaubskasse', 'Standing order holiday fund'), b: -200, art: 'sparen' },

    // Lebensmittel / Drogerie
    { n: 1, e: 'REWE Köln-Lindenthal', z: tt('Lebensmittel', 'Groceries'), b: -67.43, art: 'lebensmittel' },
    { n: 4, e: 'EDEKA Zurheide', z: tt('Lebensmittel', 'Groceries'), b: -54.12, art: 'lebensmittel' },
    { n: 9, e: 'ALDI SÜD', z: tt('Lebensmittel', 'Groceries'), b: -38.76, art: 'lebensmittel' },
    { n: 13, e: 'REWE Köln-Sülz', z: tt('Lebensmittel', 'Groceries'), b: -72.18, art: 'lebensmittel' },
    { n: 7, e: 'dm-drogerie markt', z: tt('Drogerie', 'Drugstore'), b: -29.84, art: 'haushalt' },
    { n: 2, e: 'Bäckerei Merzenich', z: tt('Bäckerei', 'Bakery'), b: -12.40, art: 'lebensmittel' },

    // Shopping
    { n: 3, e: 'Amazon .de', z: tt('Onlinekauf', 'Online purchase'), b: -89.99, art: 'shopping' },
    { n: 16, e: 'Amazon .de', z: tt('Onlinekauf', 'Online purchase'), b: -34.50, art: 'shopping' },
    { n: 21, e: 'Zalando SE', z: tt('Bekleidung', 'Clothing'), b: -119.95, art: 'shopping' },
    { n: 24, e: 'MediaMarkt Köln', z: tt('Elektronik', 'Electronics'), b: -229.00, art: 'shopping' },
    { n: 19, e: 'IKEA Köln-Godorf', z: tt('Einrichtung', 'Furniture'), b: -156.80, art: 'shopping' },

    // Mobilität
    { n: 5, e: 'Shell Station Köln', z: tt('Kraftstoff', 'Fuel'), b: -78.20, art: 'mobilitaet' },
    { n: 6, e: 'KVB Köln', z: tt('ÖPNV Monatsticket', 'Public transport pass'), b: -114.00, art: 'mobilitaet' },
    { n: 11, e: 'DB Vertrieb GmbH', z: tt('Bahnticket', 'Train ticket'), b: -49.90, art: 'mobilitaet' },

    // Gastronomie
    { n: 15, e: 'Restaurant Bizim Köln', z: tt('Restaurant', 'Restaurant'), b: -63.50, art: 'gastronomie' },
    { n: 26, e: "L'Osteria Köln", z: tt('Restaurant', 'Restaurant'), b: -48.90, art: 'gastronomie' },
    { n: 8, e: 'Lieferando.de', z: tt('Essenslieferung', 'Food delivery'), b: -31.20, art: 'gastronomie' },

    // Abos
    { n: 8, e: 'Netflix', z: tt('Streaming-Abo', 'Streaming'), b: -17.99, art: 'abo' },
    { n: 10, e: 'Spotify', z: tt('Musik-Abo', 'Music'), b: -10.99, art: 'abo' },
    { n: 10, e: 'DAZN', z: tt('Sport-Streaming', 'Sport streaming'), b: -34.99, art: 'abo' },
    { n: 6, e: 'FitX Fitnessstudio', z: tt('Mitgliedsbeitrag', 'Gym membership'), b: -19.90, art: 'abo' },

    // Bargeld
    { n: 17, e: 'GA Sparkasse Neumarkt', z: tt('Bargeldauszahlung', 'ATM withdrawal'), b: -200.00, art: 'bargeld' },

    // ── Sensible Buchungen (Art. 9) → werden herausgefiltert ──
    { n: 7, e: 'Apotheke am Neumarkt', z: tt('Rezept/Gesundheit', 'Pharmacy/health'), b: -42.90, art: 'sensibel', kategorieLabel: tt('Gesundheitsdaten', 'Health data') },
    { n: 6, e: 'Erzbistum Köln', z: tt('Kirchensteuer', 'Church tax'), b: -92.00, art: 'sensibel', kategorieLabel: tt('Religion', 'Religion') },
    { n: 6, e: 'ver.di Landesbezirk NRW', z: tt('Mitgliedsbeitrag', 'Membership fee'), b: -22.00, art: 'sensibel', kategorieLabel: tt('Gewerkschaft', 'Trade union') },
    { n: 23, e: 'DocMorris N.V.', z: tt('Online-Apotheke', 'Online pharmacy'), b: -31.50, art: 'sensibel', kategorieLabel: tt('Gesundheitsdaten', 'Health data') },
  ];

  const loc = lang === 'en' ? 'en-GB' : 'de-DE';
  return rows
    .map((r, i) => ({
      ...r,
      id: i,
      datum: tag(r.n).toLocaleDateString(loc, { day: '2-digit', month: '2-digit', year: 'numeric' }),
      _sort: tag(r.n).getTime(),
    }))
    .sort((a, b) => b._sort - a._sort);
}

// Metadaten je Buchungsart: Icon + Klartext-Label + Signal-/Sensibel-Flag
function artMeta(art, lang) {
  const tt = (de, en) => (lang === 'en' ? en : de);
  const map = {
    einkommen:    { icon: ArrowDownLeft, label: tt('Einkommen', 'Income') },
    versicherung: { icon: Umbrella, label: tt('Versicherung', 'Insurance'), signal: true },
    tier:         { icon: PawPrint, label: tt('Tierhaltung', 'Pet'), signal: true },
    sport:        { icon: Mountain, label: tt('Sport/Freizeit', 'Sport/leisure'), signal: true },
    finanzierung: { icon: Landmark, label: tt('Finanzierung', 'Financing') },
    wohnen:       { icon: Home, label: tt('Wohnen', 'Housing') },
    sparen:       { icon: PiggyBank, label: tt('Sparen/Anlage', 'Savings') },
    lebensmittel: { icon: ShoppingCart, label: tt('Lebensmittel', 'Groceries') },
    haushalt:     { icon: ShoppingCart, label: tt('Drogerie', 'Drugstore') },
    shopping:     { icon: ShoppingBag, label: tt('Shopping', 'Shopping') },
    mobilitaet:   { icon: Train, label: tt('Mobilität', 'Mobility') },
    gastronomie:  { icon: UtensilsCrossed, label: tt('Gastronomie', 'Dining') },
    abo:          { icon: Repeat, label: tt('Abos', 'Subscriptions') },
    bargeld:      { icon: Banknote, label: tt('Bargeld', 'Cash') },
    sensibel:     { icon: Ban, label: tt('Sensibel – gefiltert', 'Sensitive – filtered'), sensibel: true },
  };
  return map[art] || { icon: Wallet, label: art };
}

export default function DatenabfrageFlow({ open, onClose }) {
  const { config, modeId, navigateTo } = useMode();
  const { lang } = useTranslation();
  const tt = (de, en) => (lang === 'en' ? en : de);

  const [step, setStep] = useState('welcome');
  const [selectedBank, setSelectedBank] = useState(null);
  const [bankQuery, setBankQuery] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [scaApproved, setScaApproved] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [explicitConsent, setExplicitConsent] = useState(false);
  const [purposes, setPurposes] = useState({
    versicherungscheck: true,
    luckenanalyse: true,
    benchmark: false,
    doppelversicherung: false,
  });
  const [revealCount, setRevealCount] = useState(0);
  const [readPhase, setReadPhase] = useState(0);
  const timers = useRef([]);

  // Showcase-Kunde des aktuellen Modus (Versicherung → Klaus Fischer KD00001).
  // `open` in den Deps, damit der Kunde erst beim Öffnen aufgelöst wird –
  // dann sind die (lazy/Suspense-)Kundendaten garantiert geladen.
  const kundeId = SHOWCASE_KUNDE_IDS[modeId] || 'KD00001';
  const kunde = useMemo(() => {
    try { return getKundeById(modeId, kundeId); } catch { return null; }
  }, [modeId, kundeId, open]);
  const kundeName = kunde?.name || 'Klaus Fischer';
  const umsaetze = useMemo(() => (kunde ? buildKontoauszug(kunde, lang, config.institut) : []), [kunde, lang, config.institut]);

  const erkannteVertraege = useMemo(
    () => umsaetze.filter((u) => u.art === 'versicherung' && u.vertrag).map((u) => u.vertrag),
    [umsaetze]
  );
  const sensibelCount = umsaetze.filter((u) => u.art === 'sensibel').length;
  const signalCount = umsaetze.filter((u) => artMeta(u.art, lang).signal).length;

  const brandColor = config.colors?.primary || '#1e2a4a';
  const brandGradient = config.colors?.gradient || 'linear-gradient(135deg,#121a30,#1e2a4a)';

  const READ_PHASES = [
    tt('Sichere Verbindung zu finAPI aufgebaut', 'Secure connection to finAPI established'),
    tt('Konten der Sparkasse KölnBonn abgerufen', 'Accounts at Sparkasse KölnBonn retrieved'),
    tt('Kontoumsätze werden geladen', 'Loading account transactions'),
    tt('Umsätze werden kategorisiert', 'Categorising transactions'),
    tt('Sensible Buchungen werden herausgefiltert (Art. 9)', 'Filtering out sensitive transactions (Art. 9)'),
    tt('Versicherungen & Bedarf werden erkannt', 'Detecting insurance & needs'),
  ];

  // Reset beim Öffnen
  useEffect(() => {
    if (open) {
      setStep('welcome');
      setSelectedBank(null);
      setBankQuery('');
      setScaApproved(false);
      setExplicitConsent(false);
      setShowInfo(false);
      setShowPin(false);
      setRevealCount(0);
      setReadPhase(0);
    }
    return () => { timers.current.forEach(clearTimeout); timers.current = []; };
  }, [open]);

  // ESC schließt
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // SCA-Freigabe simulieren
  useEffect(() => {
    if (step !== 'sca') return;
    setScaApproved(false);
    const t = setTimeout(() => setScaApproved(true), 2400);
    timers.current.push(t);
    const t2 = setTimeout(() => setStep('consent'), 3600);
    timers.current.push(t2);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [step]);

  // Kontoabruf-Animation: Phasen zyklisch + Umsätze streamen
  useEffect(() => {
    if (step !== 'reading') return;
    setRevealCount(0);
    setReadPhase(0);
    const phaseTimer = setInterval(() => {
      setReadPhase((p) => Math.min(p + 1, READ_PHASES.length - 1));
    }, 800);
    const streamTimer = setInterval(() => {
      setRevealCount((c) => {
        if (c >= umsaetze.length) { clearInterval(streamTimer); return c; }
        return c + 1;
      });
    }, 90);
    timers.current.push(phaseTimer, streamTimer);
    return () => { clearInterval(phaseTimer); clearInterval(streamTimer); };
  }, [step, umsaetze.length]);

  if (!open) return null;

  const stepIndex = STEPS.indexOf(step);
  const showProgress = ['bank', 'login', 'sca', 'consent', 'reading'].includes(step);
  const canSubmitConsent = explicitConsent && purposes.versicherungscheck;

  function goBack() {
    const order = ['welcome', 'bank', 'login', 'sca', 'consent'];
    const i = order.indexOf(step);
    if (i > 0) setStep(order[i - 1]);
  }

  // Daten in die Beratersicht übernehmen → Finanzübersicht des Kunden öffnen
  function uebernehmen() {
    onClose();
    navigateTo('detail', { kundeId, tab: 'openfinance' });
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-start sm:items-center justify-center bg-slate-950/70 backdrop-blur-md overflow-y-auto py-6 px-4 animate-fade-in">
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Demo-Kundenansicht-Ribbon */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-1.5 text-[11px] font-semibold tracking-wide text-white"
             style={{ background: 'rgba(15,23,42,0.55)' }}>
          <span className="inline-flex items-center gap-1.5">
            <Smartphone size={12} /> {tt('Demo · Kundenansicht (Open Banking)', 'Demo · Customer view (Open Banking)')}
          </span>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/20 transition-colors" aria-label="Close">
            <X size={15} />
          </button>
        </div>

        {/* Marken-Kopf */}
        <div className="px-6 pt-9 pb-5 text-white relative" style={{ background: brandGradient }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center overflow-hidden">
                <LogoImg name={config.institut} size={30} />
              </div>
              <div>
                <div className="font-semibold leading-tight">{config.institut}</div>
                <div className="text-white/70 text-xs">{tt('Sicherer Datencheck', 'Secure data check')}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 border border-white/20 text-[11px]">
              <Lock size={12} /> {tt('256-bit TLS', '256-bit TLS')}
            </div>
          </div>

          {/* Fortschritt */}
          {showProgress && (
            <div className="mt-5">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-white/60 mb-1.5">
                <span>{tt('Schritt', 'Step')} {stepIndex} / 5</span>
                <span className="inline-flex items-center gap-1">
                  {tt('abgesichert durch', 'secured by')} <strong className="text-white">finAPI</strong>
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
                <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${(stepIndex / 5) * 100}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Inhalt je Schritt */}
        <div className="px-6 py-6">
          {step === 'welcome' && (
            <WelcomeStep tt={tt} brandColor={brandColor} institut={config.institut} onStart={() => setStep('bank')} onClose={onClose} />
          )}

          {step === 'bank' && (
            <BankStep
              tt={tt} brandColor={brandColor} banks={BANKS} query={bankQuery} setQuery={setBankQuery}
              onSelect={(b) => { setSelectedBank(b); setStep('login'); }} onBack={goBack}
            />
          )}

          {step === 'login' && (
            <LoginStep
              tt={tt} brandColor={brandColor} bank={selectedBank} showPin={showPin} setShowPin={setShowPin}
              onLogin={() => setStep('sca')} onBack={goBack}
            />
          )}

          {step === 'sca' && (
            <ScaStep tt={tt} brandColor={brandColor} bank={selectedBank} approved={scaApproved} />
          )}

          {step === 'consent' && (
            <ConsentStep
              tt={tt} brandColor={brandColor} institut={config.institut} beraterName={config.beraterName}
              purposes={purposes} setPurposes={setPurposes} explicitConsent={explicitConsent}
              setExplicitConsent={setExplicitConsent} showInfo={showInfo} setShowInfo={setShowInfo}
              canSubmit={canSubmitConsent} onSubmit={() => setStep('reading')} onBack={goBack}
            />
          )}

          {step === 'reading' && (
            <ReadingStep
              tt={tt} brandColor={brandColor} lang={lang} umsaetze={umsaetze} revealCount={revealCount}
              phases={READ_PHASES} readPhase={readPhase} signalCount={signalCount} sensibelCount={sensibelCount}
              done={revealCount >= umsaetze.length} onContinue={() => setStep('result')}
            />
          )}

          {step === 'result' && (
            <ResultStep
              tt={tt} brandColor={brandColor} lang={lang} institut={config.institut} kundeName={kundeName}
              umsaetze={umsaetze} vertraege={erkannteVertraege} sensibelCount={sensibelCount}
              onUebernehmen={uebernehmen} onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Schritt 1: Willkommen / Service-Framing ───────────────────────────── */
function WelcomeStep({ tt, brandColor, institut, onStart }) {
  const vorteile = [
    { icon: Umbrella, t: tt('Alle Versicherungen auf einen Blick', 'All your insurance at a glance'), s: tt('Wir erkennen Ihre Versicherungs-Lastschriften und zeigen Ihren kompletten Schutz – auch bei anderen Anbietern.', 'We detect your insurance debits and show your full coverage – across all providers.') },
    { icon: ShieldCheck, t: tt('Lücken & Unterversicherung finden', 'Find gaps & underinsurance'), s: tt('Sie erfahren, wo wichtiger Schutz fehlt – bevor etwas passiert.', 'You learn where important cover is missing – before anything happens.') },
    { icon: TrendingDown, t: tt('Sparpotenzial aufdecken', 'Uncover savings'), s: tt('Doppelversicherungen und zu hohe Beiträge werden sichtbar.', 'Double cover and overpriced premiums become visible.') },
  ];
  return (
    <div className="space-y-5">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold mb-3"
             style={{ backgroundColor: `${brandColor}14`, color: brandColor }}>
          <Sparkles size={12} /> {tt('Ihr persönlicher Versicherungs-Check', 'Your personal insurance check')}
        </div>
        <h2 className="text-2xl font-bold text-slate-900 leading-tight">
          {tt('Verbinden Sie Ihr Konto – sicher und in 2 Minuten', 'Connect your account – securely in 2 minutes')}
        </h2>
        <p className="text-slate-500 mt-2 text-sm leading-relaxed">
          {tt(`${institut} prüft mit Ihrer ausdrücklichen Einwilligung Ihre Kontoumsätze und findet alle Ihre Versicherungen, deckt Lücken auf und zeigt, wo Sie sparen.`,
              `With your explicit consent, ${institut} reviews your account transactions to find all your insurance, reveal gaps and show where you can save.`)}
        </p>
      </div>

      <div className="space-y-3">
        {vorteile.map((v, i) => {
          const Icon = v.icon;
          return (
            <div key={i} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${brandColor}14`, color: brandColor }}>
                <Icon size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">{v.t}</div>
                <div className="text-xs text-slate-500 leading-relaxed">{v.s}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vertrauens- & Freiwilligkeitshinweise */}
      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2">
        <TrustLine icon={BadgeCheck} text={tt('Datenabruf über finAPI – BaFin-lizenzierter Kontoinformationsdienst (AISP).', 'Data access via finAPI – BaFin-licensed account information service (AISP).')} />
        <TrustLine icon={Lock} text={tt('Ihre Bank-Zugangsdaten geben Sie nur bei Ihrer Bank ein – nie bei uns.', 'You enter your bank credentials only at your bank – never with us.')} />
        <TrustLine icon={Eye} text={tt('Nur Lesezugriff. Keine Überweisungen, keine Kontoänderungen möglich.', 'Read-only access. No transfers, no account changes possible.')} />
        <TrustLine icon={Info} text={tt('Freiwillig: Die Datenfreigabe ist keine Voraussetzung für Ihr Kundenkonto.', 'Voluntary: sharing data is not a condition for using your customer account.')} />
      </div>

      <button onClick={onStart} className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm transition-transform active:scale-[0.99] flex items-center justify-center gap-2"
              style={{ backgroundColor: brandColor }}>
        <Landmark size={18} /> {tt('Konto sicher verbinden', 'Connect account securely')}
      </button>
      <p className="text-center text-[11px] text-slate-400">
        {tt('Mit dem Fortfahren starten Sie den Verbindungsprozess. Die eigentliche Einwilligung erteilen Sie im nächsten Schritt.', 'Continuing starts the connection process. You give your actual consent in the next step.')}
      </p>
    </div>
  );
}

function TrustLine({ icon: Icon, text }) {
  return (
    <div className="flex items-start gap-2 text-xs text-slate-600">
      <Icon size={14} className="text-slate-400 shrink-0 mt-0.5" />
      <span className="leading-relaxed">{text}</span>
    </div>
  );
}

/* ─── Schritt 2: Bank-Auswahl (finAPI/Tink-Picker) ──────────────────────── */
function BankStep({ tt, brandColor, banks, query, setQuery, onSelect, onBack }) {
  const filtered = banks.filter((b) =>
    b.display.toLowerCase().includes(query.toLowerCase()) || b.name.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <div className="space-y-4">
      <StepHeader tt={tt} onBack={onBack} title={tt('Wählen Sie Ihre Bank', 'Select your bank')}
        subtitle={tt('Bei dieser Bank wird Ihr Konto ausgelesen.', 'Your account will be read at this bank.')} />

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder={tt('Bank suchen (z. B. Sparkasse)…', 'Search bank (e.g. Sparkasse)…')}
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
      </div>

      <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] text-amber-800 flex items-center gap-2">
        <Info size={13} className="shrink-0" />
        {tt('Demo-Tipp: Klaus Fischer bankt bei der Sparkasse KölnBonn.', 'Demo tip: Klaus Fischer banks with Sparkasse KölnBonn.')}
      </div>

      <div className="grid grid-cols-1 gap-1.5 max-h-72 overflow-y-auto -mx-1 px-1">
        {filtered.map((b) => (
          <button key={b.display} onClick={() => onSelect(b)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left">
            <div className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
              <LogoImg name={b.name} size={26} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-slate-800 truncate">{b.display}</div>
              <div className="text-[11px] text-slate-400 font-mono">{b.blz}</div>
            </div>
            <ChevronRight size={16} className="text-slate-300" />
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-sm text-slate-400 py-8">{tt('Keine Bank gefunden.', 'No bank found.')}</div>
        )}
      </div>
    </div>
  );
}

/* ─── Schritt 3: Bank-Login (Redirect-Modell) ───────────────────────────── */
function LoginStep({ tt, brandColor, bank, showPin, setShowPin, onLogin, onBack }) {
  return (
    <div className="space-y-4">
      <StepHeader tt={tt} onBack={onBack} title={tt('Anmeldung bei Ihrer Bank', 'Log in to your bank')}
        subtitle={bank?.display} />

      {/* Bank-gebrandeter Login-Kasten */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-50 border-b border-slate-100">
          <LogoImg name={bank?.name} size={22} />
          <span className="text-sm font-semibold text-slate-700">{bank?.display}</span>
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-emerald-600"><Lock size={12} /> {tt('gesichert', 'secured')}</span>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{tt('Anmeldename / VR-NetKey', 'Login name')}</label>
            <input defaultValue="klaus.fischer1983" readOnly
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-700" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{tt('PIN', 'PIN')}</label>
            <div className="relative">
              <input type={showPin ? 'text' : 'password'} defaultValue="48217" readOnly
                className="w-full px-3 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-700 font-mono tracking-widest" />
              <button onClick={() => setShowPin((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
        <ShieldCheck size={14} className="text-slate-400 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          {tt('Sie befinden sich auf der gesicherten Anmeldung Ihrer Bank. finAPI und der Versicherer sehen Ihre Zugangsdaten nicht.',
              'You are on your bank\'s secured login. finAPI and the insurer never see your credentials.')}
        </span>
      </div>

      <button onClick={onLogin} className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm transition-transform active:scale-[0.99] flex items-center justify-center gap-2"
              style={{ backgroundColor: brandColor }}>
        {tt('Anmelden', 'Log in')} <ChevronRight size={18} />
      </button>
    </div>
  );
}

/* ─── Schritt 4: Starke Kundenauthentifizierung (SCA / pushTAN) ──────────── */
function ScaStep({ tt, brandColor, bank, approved }) {
  return (
    <div className="py-4 text-center space-y-5">
      <StepHeader tt={tt} title={tt('Anmeldung bestätigen', 'Confirm login')}
        subtitle={tt('Starke Kundenauthentifizierung (PSD2)', 'Strong customer authentication (PSD2)')} center />

      <div className="relative mx-auto w-24 h-24">
        <div className={clsx('absolute inset-0 rounded-3xl flex items-center justify-center transition-all duration-500',
          approved ? 'scale-100' : 'scale-100')}
          style={{ backgroundColor: approved ? '#10b981' : `${brandColor}14`, color: approved ? '#fff' : brandColor }}>
          {approved ? <Check size={44} strokeWidth={2.5} className="animate-scale-in" /> : <Fingerprint size={40} />}
        </div>
        {!approved && <div className="absolute inset-0 rounded-3xl border-2 border-dashed animate-spin" style={{ borderColor: `${brandColor}40`, animationDuration: '6s' }} />}
      </div>

      {!approved ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-700">
            <Loader2 size={15} className="animate-spin" />
            {tt('Warte auf Freigabe in Ihrer Banking-App…', 'Waiting for approval in your banking app…')}
          </div>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            {tt(`Öffnen Sie die App Ihrer ${bank?.display || 'Bank'} (z. B. pushTAN) und bestätigen Sie den Lesezugriff.`,
                `Open your ${bank?.display || 'bank'} app (e.g. pushTAN) and approve the read access.`)}
          </p>
        </div>
      ) : (
        <div className="text-sm font-semibold text-emerald-600">{tt('Freigabe bestätigt', 'Access approved')}</div>
      )}
    </div>
  );
}

/* ─── Schritt 5: Zweckspezifische Einwilligung (DSGVO-Kern) ──────────────── */
function ConsentStep({ tt, brandColor, institut, beraterName, purposes, setPurposes, explicitConsent, setExplicitConsent, showInfo, setShowInfo, canSubmit, onSubmit, onBack }) {
  const purposeDefs = [
    { id: 'versicherungscheck', core: true, t: tt('Versicherungs-Check', 'Insurance check'),
      s: tt('Erkennung Ihrer Versicherungs-Lastschriften, um Ihren Bestand vollständig anzuzeigen.', 'Detect your insurance debits to show your full portfolio.') },
    { id: 'luckenanalyse', t: tt('Vorsorge- & Lückenanalyse', 'Provision & gap analysis'),
      s: tt('Prüfung, wo wichtiger Schutz fehlt (z. B. Haftpflicht, BU, Tierhalter).', 'Check where key cover is missing (e.g. liability, disability, pet owner).') },
    { id: 'benchmark', t: tt('Beitrags-Benchmark', 'Premium benchmark'),
      s: tt('Vergleich Ihrer Beiträge gegen den Markt – zeigt, wo Sie zu viel zahlen.', 'Compare your premiums against the market – shows where you overpay.') },
    { id: 'doppelversicherung', t: tt('Doppelversicherungs-Check', 'Double-cover check'),
      s: tt('Erkennung redundanter Policen, die Sie unnötig Geld kosten.', 'Detect redundant policies that cost you money.') },
  ];
  return (
    <div className="space-y-4">
      <StepHeader tt={tt} onBack={onBack} title={tt('Wofür dürfen wir Ihre Daten nutzen?', 'What may we use your data for?')}
        subtitle={tt('Sie entscheiden pro Zweck – einzeln und freiwillig.', 'You decide per purpose – individually and voluntarily.')} />

      <div className="space-y-2">
        {purposeDefs.map((p) => (
          <button key={p.id} onClick={() => !p.core && setPurposes((s) => ({ ...s, [p.id]: !s[p.id] }))}
            className={clsx('w-full flex items-start gap-3 p-3 rounded-2xl border text-left transition-colors',
              purposes[p.id] ? 'border-transparent' : 'border-slate-200 hover:bg-slate-50')}
            style={purposes[p.id] ? { backgroundColor: `${brandColor}0d`, borderColor: `${brandColor}40` } : undefined}>
            <span className={clsx('mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 border-2 transition-colors')}
              style={{ backgroundColor: purposes[p.id] ? brandColor : '#fff', borderColor: purposes[p.id] ? brandColor : '#cbd5e1' }}>
              {purposes[p.id] && <Check size={13} className="text-white" strokeWidth={3} />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-800">{p.t}</span>
                {p.core && <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ backgroundColor: `${brandColor}14`, color: brandColor }}>{tt('Basis', 'Core')}</span>}
              </span>
              <span className="block text-xs text-slate-500 leading-relaxed mt-0.5">{p.s}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Art. 9 – Minimierung an der Quelle */}
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 flex items-start gap-2.5">
        <ScanLine size={16} className="text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 leading-relaxed">
          <strong>{tt('Datensparsamkeit:', 'Data minimisation:')}</strong>{' '}
          {tt('Sensible Buchungen (Gesundheit/Apotheke, Kirchensteuer, Gewerkschaft, Parteien) werden bereits bei finAPI herausgefiltert und niemals an ', 'Sensitive transactions (health/pharmacy, church tax, unions, parties) are filtered out at finAPI and never transmitted to ')}
          {institut}{tt(' übertragen.', '.')}
        </div>
      </div>

      {/* Informiertheit (Art. 13) – aufklappbar */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <button onClick={() => setShowInfo((v) => !v)} className="w-full flex items-center justify-between px-3.5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          <span className="flex items-center gap-2"><FileText size={15} className="text-slate-400" /> {tt('Transparenz-Informationen (Art. 13 DSGVO)', 'Transparency information (Art. 13 GDPR)')}</span>
          <ChevronDown size={16} className={clsx('text-slate-400 transition-transform', showInfo && 'rotate-180')} />
        </button>
        {showInfo && (
          <div className="px-3.5 pb-3.5 pt-1 space-y-2.5 text-xs text-slate-600 border-t border-slate-100 animate-fade-in">
            <InfoRow label={tt('Verantwortliche', 'Controllers')} value={`${institut} ${tt('(als Versicherer)', '(as insurer)')} + finAPI GmbH ${tt('(Kontoinformationsdienst, AISP)', '(account information service, AISP)')}`} />
            <InfoRow label={tt('Datenarten', 'Data types')} value={tt('Kontoumsätze (Empfänger, Betrag, Datum, Verwendungszweck) der freigegebenen Konten.', 'Account transactions (payee, amount, date, reference) of the selected accounts.')} />
            <InfoRow label={tt('Speicherdauer', 'Retention')} value={tt('Bis zu 180 Tage je Einwilligung; danach erneute Authentifizierung (PSD2) nötig.', 'Up to 180 days per consent; renewed authentication (PSD2) required afterwards.')} />
            <InfoRow label={tt('Logik', 'Logic')} value={tt('Regelbasierte Kategorisierung der Umsätze. Keine automatisierte Einzelentscheidung mit Rechtswirkung (Art. 22) – die Ergebnisse sind Hinweise für Ihre Beratung.', 'Rule-based categorisation. No automated decision with legal effect (Art. 22) – results are hints for your advisory.')} />
            <InfoRow label={tt('Empfänger', 'Recipient')} value={tt(`Ihr persönlicher Berater: ${beraterName}.`, `Your personal advisor: ${beraterName}.`)} />
            <InfoRow label={tt('Widerruf', 'Withdrawal')} value={tt('Jederzeit widerrufbar – so einfach wie die Erteilung, ohne Angabe von Gründen.', 'Withdrawable at any time – as easy as granting it, without giving reasons.')} />
          </div>
        )}
      </div>

      {/* Ausdrückliche Einwilligung */}
      <button onClick={() => setExplicitConsent((v) => !v)} className="w-full flex items-start gap-3 text-left">
        <span className="mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 border-2 transition-colors"
          style={{ backgroundColor: explicitConsent ? brandColor : '#fff', borderColor: explicitConsent ? brandColor : '#cbd5e1' }}>
          {explicitConsent && <Check size={13} className="text-white" strokeWidth={3} />}
        </span>
        <span className="text-xs text-slate-600 leading-relaxed">
          {tt(`Ich erteile ${institut} und finAPI meine ausdrückliche Einwilligung, meine Kontoumsätze für die oben ausgewählten Zwecke zu verarbeiten. Mir ist bewusst, dass ich diese Einwilligung jederzeit widerrufen kann.`,
              `I give ${institut} and finAPI my explicit consent to process my account transactions for the purposes selected above. I understand I can withdraw this consent at any time.`)}
        </span>
      </button>

      <button onClick={onSubmit} disabled={!canSubmit}
        className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ backgroundColor: brandColor }}>
        <ShieldCheck size={18} /> {tt('Daten sicher freigeben', 'Share data securely')}
      </button>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <div className="font-semibold text-slate-700">{label}</div>
      <div className="leading-relaxed">{value}</div>
    </div>
  );
}

/* ─── Schritt 6: Kontoabruf-Animation + Live-Kategorisierung ─────────────── */
function ReadingStep({ tt, brandColor, lang, umsaetze, revealCount, phases, readPhase, signalCount, sensibelCount, done, onContinue }) {
  const visible = umsaetze.slice(0, revealCount);
  return (
    <div className="space-y-4">
      <StepHeader tt={tt} title={done ? tt('Auswertung abgeschlossen', 'Analysis complete') : tt('Ihre Umsätze werden gelesen', 'Reading your transactions')}
        subtitle={done ? tt('Alle Buchungen analysiert.', 'All transactions analysed.') : phases[readPhase]} center />

      {/* Laufende Zähler */}
      <div className="grid grid-cols-3 gap-2">
        <Counter value={revealCount} label={tt('Buchungen', 'Transactions')} color="#334155" />
        <Counter value={visible.filter((v) => artMeta(v.art, lang).signal).length} label={tt('relevant', 'relevant')} color={brandColor} />
        <Counter value={visible.filter((v) => v.art === 'sensibel').length} label={tt('gefiltert (Art. 9)', 'filtered (Art. 9)')} color="#dc2626" />
      </div>

      {!done && (
        <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
          <Loader2 size={13} className="animate-spin" /> {phases[readPhase]}
        </div>
      )}

      {/* Kontoauszug, der einläuft */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          <Landmark size={13} /> {tt('Kontoauszug Sparkasse KölnBonn', 'Statement Sparkasse KölnBonn')}
        </div>
        <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
          {visible.map((u) => (
            <TxRow key={u.id} u={u} lang={lang} brandColor={brandColor} tt={tt} />
          ))}
        </div>
      </div>

      {done && (
        <button onClick={onContinue} className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm transition-transform active:scale-[0.99] flex items-center justify-center gap-2"
                style={{ backgroundColor: brandColor }}>
          {tt('Ergebnis ansehen', 'View result')} <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}

function Counter({ value, label, color }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-200 px-2 py-2.5 text-center">
      <div className="text-xl font-bold font-mono tabular-nums" style={{ color }}>{value}</div>
      <div className="text-[10px] text-slate-400 uppercase tracking-wide leading-tight mt-0.5">{label}</div>
    </div>
  );
}

// Einzelne Buchungszeile (im Kontoauszug + Ergebnis)
function TxRow({ u, lang, brandColor, tt }) {
  const meta = artMeta(u.art, lang);
  const Icon = meta.icon;
  const sensibel = u.art === 'sensibel';
  const signal = meta.signal;
  return (
    <div className={clsx('flex items-center gap-3 px-3.5 py-2', sensibel && 'bg-red-50/40')}>
      <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center shrink-0')}
        style={{ backgroundColor: sensibel ? '#fee2e2' : signal ? `${brandColor}14` : '#f1f5f9', color: sensibel ? '#dc2626' : signal ? brandColor : '#64748b' }}>
        <Icon size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <div className={clsx('text-sm font-medium truncate', sensibel ? 'text-slate-400 line-through' : 'text-slate-800')}>{u.e}</div>
        <div className="text-[11px] text-slate-400 truncate">{u.datum} · {u.z}</div>
      </div>
      <div className="text-right shrink-0">
        <div className={clsx('text-sm font-mono font-semibold', sensibel ? 'text-slate-400 line-through' : u.b > 0 ? 'text-emerald-600' : 'text-slate-700')}>
          {u.b > 0 ? '+' : ''}{eur(u.b, lang)}
        </div>
        {sensibel ? (
          <div className="text-[10px] text-red-500 font-medium inline-flex items-center gap-0.5 justify-end"><Ban size={9} /> {tt('nicht übertragen', 'not transmitted')}</div>
        ) : signal ? (
          <div className="text-[10px] font-medium inline-flex items-center gap-0.5 justify-end" style={{ color: brandColor }}><Check size={9} /> {meta.label}</div>
        ) : (
          <div className="text-[10px] text-slate-300">{meta.label}</div>
        )}
      </div>
    </div>
  );
}

/* ─── Schritt 7: Ergebnis – erkannte Verträge, Lücken, Service-Framing ───── */
function ResultStep({ tt, brandColor, lang, institut, kundeName, umsaetze, vertraege, sensibelCount, onUebernehmen, onClose }) {
  // Bedarfe / Lücken – aus den Signalen abgeleitet, konsistent zu den
  // Potenzialen in den Demo-Daten (Tierkranken, Unfall, RLV, Hausrat).
  const luecken = [
    { icon: PawPrint, t: tt('Tierkranken- & OP-Schutz fehlt', 'Pet health & surgery cover missing'),
      s: tt('Haustier erkannt: Fressnapf (85 €/Mon.), Hundeschule (45 €/Mon.) und Tierarzt – aber keine Tierkrankenversicherung im Bestand.', 'Pet detected: Fressnapf (€85/mo), dog school (€45/mo) and vet – but no pet health insurance on file.') },
    { icon: Mountain, t: tt('Unfallschutz deckt keinen Extremsport', 'Accident cover excludes extreme sport'),
      s: tt('Bouldern (Monatsabo) und ein Fallschirmsprung erkannt. Der aktuelle Unfall-Basistarif schließt diese Risiken aus.', 'Bouldering and a skydiving jump detected. The current basic accident plan excludes these risks.') },
    { icon: Umbrella, t: tt('Risikoleben unter Baufinanzierung', 'Term life below mortgage'),
      s: tt('150.000 € Deckung stehen 285.000 € Baufinanzierung (Sparkasse KölnBonn) gegenüber – 135.000 € Lücke.', '€150,000 cover vs €285,000 mortgage (Sparkasse KölnBonn) – €135,000 gap.') },
    { icon: Home, t: tt('Hausrat unterversichert', 'Home contents underinsured'),
      s: tt('Hausrat auf 65 m² versichert, tatsächlich 145 m² Wohneigentum – plus fehlender Elementarschutz.', 'Home contents insured for 65 m², actually 145 m² owned home – plus missing natural-hazard cover.') },
  ];

  return (
    <div className="space-y-5">
      {/* Erfolg */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500 flex items-center justify-center animate-scale-in">
          <CheckCircle2 size={30} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{tt('Verbindung erfolgreich', 'Connection successful')}</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          {tt(`Wir haben ${umsaetze.length} Buchungen ausgewertet, ${vertraege.length} Versicherungsverträge erkannt und ${sensibelCount} sensible Buchungen herausgefiltert.`,
              `We analysed ${umsaetze.length} transactions, detected ${vertraege.length} insurance contracts and filtered out ${sensibelCount} sensitive transactions.`)}
        </p>
      </div>

      {/* Erkannte Versicherungsverträge */}
      <div>
        <SectionTitle icon={Umbrella} brandColor={brandColor} title={tt('Erkannte Versicherungen', 'Detected insurance')} count={vertraege.length} />
        <div className="space-y-1.5">
          {vertraege.map((v, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl border border-slate-200">
              <LogoImg name={v.institut} size={22} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-800 truncate">{v.produkt}</div>
                <div className="text-[11px] text-slate-400">{v.institut}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-mono font-semibold text-slate-700">{eurJahr(v.praemieJahr, lang)}<span className="text-[10px] text-slate-400">/{tt('J.', 'yr')}</span></div>
                <span className={clsx('text-[10px] font-semibold px-1.5 py-0.5 rounded', v.eigen ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>
                  {v.eigen ? tt('bei uns', 'with us') : tt('Wettbewerb', 'competitor')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Erkannte Lücken / Bedarf (Service-Framing) */}
      <div>
        <SectionTitle icon={Sparkles} brandColor={brandColor} title={tt('Ihr persönliches Ergebnis', 'Your personal result')} count={luecken.length} />
        <div className="space-y-2">
          {luecken.map((l, i) => {
            const Icon = l.icon;
            return (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: `${brandColor}0a` }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: brandColor }}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-800">{l.t}</div>
                  <div className="text-xs text-slate-500 leading-relaxed mt-0.5">{l.s}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Widerruf-Hinweis (immer sichtbar) */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 flex items-center gap-2 text-[11px] text-slate-500">
        <RefreshCw size={13} className="shrink-0" />
        {tt('Sie können Ihre Einwilligung jederzeit in Ihrem Kundenkonto widerrufen – so einfach wie die Erteilung.', 'You can withdraw your consent any time in your customer account – as easily as you granted it.')}
      </div>

      {/* Aktionen */}
      <div className="space-y-2">
        <button onClick={onUebernehmen} className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm transition-transform active:scale-[0.99] flex items-center justify-center gap-2"
                style={{ backgroundColor: brandColor }}>
          <ArrowDownLeft size={18} /> {tt('Daten in die Beratung übernehmen', 'Transfer data to advisory')}
        </button>
        <button onClick={onClose} className="w-full py-2.5 rounded-2xl text-slate-500 hover:text-slate-700 font-medium text-sm transition-colors">
          {tt('Schließen', 'Close')}
        </button>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, brandColor, title, count }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Icon size={15} style={{ color: brandColor }} />
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      {count != null && <span className="text-xs text-slate-400 font-normal">({count})</span>}
    </div>
  );
}

/* ─── Wiederverwendbarer Schritt-Kopf ───────────────────────────────────── */
function StepHeader({ tt, title, subtitle, onBack, center }) {
  return (
    <div className={clsx('flex items-start gap-2', center && 'flex-col items-center text-center')}>
      {onBack && !center && (
        <button onClick={onBack} className="p-1 -ml-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 mt-0.5" aria-label={tt('Zurück', 'Back')}>
          <ArrowLeft size={18} />
        </button>
      )}
      <div className="min-w-0">
        <h2 className="text-lg font-bold text-slate-900 leading-tight">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
