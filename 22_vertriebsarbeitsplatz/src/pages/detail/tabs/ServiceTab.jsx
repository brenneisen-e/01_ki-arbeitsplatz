import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
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
  ShieldAlert,
  Heart,
  Home,
  FileText,
  Activity,
  Award,
  Eye,
  X,
  Dog,
  Car,
  Users,
  HeartHandshake,
} from 'lucide-react';
import { formatEur } from '../../../utils/formatters';
import { useMode } from '../../../hooks/useMode';
import useTranslation from '../../../i18n/useTranslation';
import { getLang } from '../../../utils/langHelper';

const STATUS_LABEL_KEYS = {
  versendet: 'serviceStatus.versendet',
  geplant: 'serviceStatus.geplant',
  vorschlag: 'serviceStatus.vorschlag',
};
const KATEGORIE_LABEL_KEYS = {
  finanztipp: 'serviceKategorie.finanztipp',
  geschenk: 'serviceKategorie.geschenk',
  glueckwunsch: 'serviceKategorie.glueckwunsch',
  sparhinweis: 'serviceKategorie.sparhinweis',
  service: 'serviceKategorie.service',
};

// Status als getönte Fläche mit Text in der Statusfarbe (keine Rahmen in Signalfarbe)
const STATUS = {
  versendet: { label: 'Automatisch versendet', icon: CheckCircle2, color: 'var(--color-success)', bg: 'var(--tint-success)', border: 'transparent' },
  geplant:   { label: 'Geplant',                icon: Clock,        color: 'var(--color-info)',    bg: 'var(--tint-info)',    border: 'transparent' },
  vorschlag: { label: 'Vorschlag zur Freigabe', icon: Sparkles,     color: 'var(--color-warning)', bg: 'var(--tint-warning)', border: 'transparent' },
};

// Kategorie: gedämpfter Kategorie-Ton für Icon-Box und Pille
const KATEGORIE_FARBEN = {
  finanztipp:  { label: 'Finanz-Tipp',     color: 'var(--mode-primary)',          bg: 'var(--mode-pastel)' },
  geschenk:    { label: 'Geschenk',        color: 'var(--mode-accent)',           bg: 'color-mix(in oklab, var(--mode-accent) 12%, transparent)' },
  glueckwunsch:{ label: 'Glückwunsch',     color: 'var(--quelle-lebensereignis)', bg: 'color-mix(in oklab, var(--quelle-lebensereignis) 10%, transparent)' },
  sparhinweis: { label: 'Spar-Hinweis',    color: 'var(--color-info)',            bg: 'var(--tint-info)' },
  service:     { label: 'Service',         color: 'var(--text-secondary)',        bg: 'var(--bg-inset)' },
};

// ── KI-Matching: jeder Service hat eine match(kunde) → boolean Bedingung.
// Nur passende Services tauchen beim jeweiligen Kunden auf.
const HELFER = {
  fremdHasDepotOrTagesgeld: (k) =>
    (k.fremdProdukte || []).some(p => /depot|tagesgeld|festgeld|geldmarkt|kapitalmarkt/i.test([p.typ, p.produktart].join(' ')))
    || (k.openFinance?.kapitalmarkt || []).length > 0
    || (k.openFinance?.geldmarkt || []).length > 0,
  eigenHasSpar: (k) =>
    (k.eigeneProdukte || []).some(p => /spar|tagesgeld|festgeld|depot/i.test([p.typ, p.sparte].join(' '))),
  hasFinanzierung: (k) =>
    (k.eigeneProdukte || []).some(p => /kredit|finanzierung|darlehen|baufi/i.test([p.typ, p.produkt, p.sparte].join(' '))),
  kindUnter1: (k) => (k.kinder || []).find(x => (x.alter ?? 99) <= 1),
  kindAlter5bis7: (k) => (k.kinder || []).find(x => (x.alter ?? 0) >= 5 && (x.alter ?? 0) <= 7),
  isSelbststaendig: (k) => k.id === 'BK00002' || /selbst|freibe/i.test(k.beruf || ''),
  isPraxis: (k) => k.id === 'BK00005' || /praxis|arzt|ärzt/i.test(k.beruf || ''),
  hasPartner: (k) => !!k.partner?.einkommen,
  hasVisaOderReisekarte: (k) =>
    (k.eigeneProdukte || []).some(p => /visa|mastercard|kreditkarte|reise/i.test([p.typ, p.produkt].join(' '))),
  liquiditaet: (k) => {
    const sparvolumen = (k.eigeneProdukte || [])
      .filter(p => /spar|tagesgeld|festgeld/i.test([p.typ, p.sparte].join(' ')))
      .reduce((s, p) => s + (p.volumen || 0), 0);
    const monatsausgaben = Math.abs((k.transaktionen || []).filter(t => t.betrag < 0).reduce((s, t) => s + t.betrag, 0));
    return { sparvolumen, monatsausgaben, knapp: monatsausgaben > 0 && sparvolumen < monatsausgaben * 3 };
  },
  hasStromVertrag: (k) =>
    (k.transaktionen || []).some(t => /stadtwerk|strom|eon|vattenfall|enbw|energie/i.test(t.empfaenger || '')),
};

// ── Versicherungs-spezifische Helfer (eigene Verträge analysieren). Während
// die Banking-Helfer auf Kontoumsätze + Sparquoten zielen, geht es hier um
// Vertragsbestand, Lebenslagen und Versicherungslücken.
const VERS_HELFER = {
  hasUnfallBasis: (k) => (k.eigeneProdukte || []).some(p => /unfall/i.test([p.typ, p.produkt].join(' ')) && /basis/i.test(p.details || p.produkt || '')),
  hasHausratUnterversichert: (k) => (k.eigeneProdukte || []).some(p => /hausrat/i.test([p.typ, p.produkt].join(' ')) && /(unterversichert|65qm|falsch)/i.test(p.details || '')),
  hasBu: (k) => (k.eigeneProdukte || []).some(p => /\bbu\b|berufsunf/i.test([p.typ, p.produkt].join(' '))),
  hasRlvFremd: (k) => (k.fremdProdukte || []).some(p => /rlv|risikoleben/i.test([p.typ, p.produktart].join(' '))),
  hasFamilieMitKindern: (k) => (k.kinder || []).length >= 1,
  hasBaufi: (k) =>
    (k.eigeneProdukte || []).some(p => /baufi|finanzierung|darlehen/i.test([p.typ, p.produkt].join(' ')))
    || (k.fremdProdukte || []).some(p => /baufi|finanzierung|darlehen/i.test([p.typ, p.produktart].join(' '))),
  hasRisikoSignalExtremsport: (k) => (k.risikoSignale || []).some(s => /extremsport|boulder|kletter|skydive|fallschirm/i.test([s.typ, s.titel, s.beschreibung].join(' '))),
  hasHundIndikator: (k) => {
    if (k.tiere && (k.tiere.typ === 'hund' || /hund|labrador|retriever|schaeferhund|terrier/i.test([k.tiere.rasse, k.tiere.name].join(' ')))) return true;
    const umsaetze = k.tiere?.umsaetze || k.transaktionen || [];
    return umsaetze.some(t => /hundeschule|fressnapf|futterhaus|tierarzt|tierklinik/i.test(t.empfaenger || ''));
  },
  hasChatbotZuThema: (k, regex) => (k.kommunikation || []).some(m => m.typ === 'chatbot' && regex.test([m.betreff, m.zusammenfassung, m.kiZusammenfassung].join(' '))),
  hasFremdKfz: (k) => (k.fremdProdukte || []).some(p => /kfz/i.test([p.typ, p.produktart].join(' '))),
  eigenHasKfz: (k) => (k.eigeneProdukte || []).some(p => /kfz/i.test([p.typ, p.sparte, p.produkt].join(' '))),
  hasEfhEigentum: (k) => /eigentum|haus/i.test(k.wohnsituation || '') && (k.wohnflaeche || 0) >= 120,
  absicherungFehlt: (k, sparte) => (k.absicherung?.fehlend || []).includes(sparte),
  vertragsbestand: (k) => (k.eigeneProdukte || []).length,
  jahresbeitragGesamt: (k) => (k.eigeneProdukte || []).reduce((s, p) => s + (p.praemie || 0), 0),
};

function buildServicesVersicherung(kunde) {
  const h = VERS_HELFER;
  const vorname = kunde.name?.split(' ')[0] || 'Kunde';
  const kindU1 = HELFER.kindUnter1(kunde);
  const kindSchule = HELFER.kindAlter5bis7(kunde);
  const beitrag = h.jahresbeitragGesamt(kunde);

  const catalog = [
    {
      id: 'vers-steuer-ausfuellhinweise', kategorie: 'service', status: 'versendet', icon: FileText,
      titel: 'Ausfüllhinweise Steuererklärung 2025',
      datum: '2026-03-01', kanal: 'E-Mail + PDF-Beihilfe',
      quelle: `Bestand · ${h.vertragsbestand(kunde)} steuerrelevante Verträge (BU, Unfall, Haftpflicht, RLV)`,
      nachricht: `Hallo ${vorname}, anbei die individuelle Ausfüllhilfe für Ihre Steuererklärung 2025. Wir haben alle bei uns geführten Beiträge bereits den passenden Anlagen zugeordnet:\n\n• Anlage Vorsorgeaufwand, Zeile 46–50 (Sonstige Vorsorge): BU-Beitrag 2.160 EUR + Unfallversicherung 120 EUR + Privathaftpflicht 95 EUR.\n• Anlage Vorsorgeaufwand, Zeile 14–15 (Risikolebensversicherung): RLV-Beitrag 540 EUR (sofern bei der Allianz weiterhin im Bestand).\n• Hausratversicherung: nur absetzbar, wenn häusliches Arbeitszimmer anteilig genutzt wird (Hinweise im PDF).\n\nDie Beträge sind bereits in der elektronischen Steuerbescheinigung (eDaten ELStAM) hinterlegt. Wenn Sie Mein-ELSTER nutzen, werden sie automatisch vorausgefüllt, bitte nur prüfen.`,
      ergebnis: 'Beitragsübersicht zur Steuererklärung, kein Verkaufsanlass',
    },
    h.vertragsbestand(kunde) > 0 && {
      id: 'vers-jahresreview', kategorie: 'service', status: 'geplant', icon: FileText,
      titel: 'Jahres-Vertragsreview – Termin-Vorschlag',
      datum: '2026-05-12', kanal: 'E-Mail + Kalenderlink',
      quelle: `Bestand · ${h.vertragsbestand(kunde)} Verträge, Gesamt-Jahresbeitrag ${formatEur(beitrag)}`,
      nachricht: `Hallo ${vorname}, einmal pro Jahr prüfen wir gemeinsam mit Ihnen alle laufenden Verträge: Deckung, Beitrag, Lebenslage. Für Ihren Bestand schlagen wir einen 30-Min.-Online-Termin vor (kostenfrei, keine Verkaufsabsicht). Sie erhalten danach ein schriftliches Bestands-Protokoll mit Empfehlungen.`,
      ergebnis: 'Bestandspflege ohne Verkaufsdruck',
    },
    h.hasRisikoSignalExtremsport(kunde) && {
      id: 'vers-extremsport-info', kategorie: 'finanztipp', status: 'vorschlag', icon: ShieldAlert,
      titel: 'Hinweis Versicherungslücke Extremsport',
      datum: '2026-04-22', kanal: 'E-Mail (Vorschlag)',
      quelle: 'Open Finance · DAV Boulderhalle + Skydive Center in Kontoumsätzen erkannt',
      nachricht: `Hallo ${vorname}, aus Ihren Aktivitäten (regelmäßiges Bouldern, Fallschirmsprung) leitet sich eine Lücke in Ihrer aktuellen Unfallversicherung Basis ab, denn Extremsport-Risiken sind dort explizit ausgeschlossen. Wir möchten Sie darauf hinweisen, bevor etwas passiert. Im Premium-Tarif oder über den Zusatzbaustein „Sport- & Freizeitrisiken" wären diese Aktivitäten gedeckt.`,
      ergebnis: 'Vorschlag, vor Versand prüfen',
    },
    h.hasHausratUnterversichert(kunde) && {
      id: 'vers-hausrat-flaeche', kategorie: 'service', status: 'versendet', icon: Home,
      titel: 'Wohnflächen-Update Hausrat',
      datum: '2026-03-18', kanal: 'E-Mail',
      quelle: 'Bestand · Hausrat 65 qm, lt. Adressdatenbank Wohnfläche EFH 145 qm',
      nachricht: `Wir möchten Sie auf eine wichtige Sache hinweisen: Ihre Hausratversicherung ist seit dem Umzug 2021 noch auf 65 qm versichert, tatsächlich wohnen Sie in einem 145-qm-Einfamilienhaus. Im Schadensfall droht eine massive Leistungskürzung. Wir bieten Ihnen die kostenfreie Anpassung an + Empfehlung Premium + Elementar.`,
      ergebnis: '55 % Unterversicherung erkannt',
    },
    h.hasBu(kunde) && h.hasFamilieMitKindern(kunde) && {
      id: 'vers-bu-nachvers', kategorie: 'service', status: 'geplant', icon: Activity,
      titel: 'Nachversicherungsoption BU – Geburt',
      datum: '2026-06-04', kanal: 'Brief + Antragsformular',
      quelle: 'Stammdaten · Geburt zweites Kind innerhalb 12 Monaten',
      nachricht: `Hallo ${vorname}, anlässlich der Geburt Ihres zweiten Kindes können Sie Ihre BU-Rente ohne erneute Gesundheitsprüfung erhöhen; diese Option läuft bei Ihrem Tarif 6 Monate nach dem Lebensereignis ab. Wir senden Ihnen das ausgefüllte Antragsformular zu, Sie müssen nur unterschreiben.`,
      ergebnis: 'Schließt Deckungslücke ohne Gesundheitsfragen',
    },
    h.hasBaufi(kunde) && h.hasRlvFremd(kunde) && {
      id: 'vers-rlv-baufi', kategorie: 'sparhinweis', status: 'vorschlag', icon: ShieldCheck,
      titel: 'RLV-Deckung gegen Baufinanzierung prüfen',
      datum: '2026-04-30', kanal: 'E-Mail (Vorschlag)',
      quelle: 'Open Finance · Baufi-Restschuld 285k vs. RLV-Deckung 150k',
      nachricht: `Wir haben festgestellt, dass Ihre bestehende Risikolebensversicherung (Allianz, 150 k) die Restschuld Ihrer Baufinanzierung nicht vollständig abdeckt, eine Lücke von 135 k. Im Todesfall müsste Ihre Familie das Defizit selbst tragen. Eine Aufstockung auf 300 k schließt die Lücke und ist im Bündel mit uns ca. 18 % günstiger.`,
      ergebnis: '135 k Deckungslücke schließen',
    },
    kindU1 && {
      id: 'vers-geburt-unfall', kategorie: 'geschenk', status: 'versendet', icon: Baby,
      titel: 'Willkommensgruß zur Geburt',
      datum: '2025-11-08', kanal: 'Postversand',
      quelle: `Stammdaten · Geburt von ${kindU1.name}`,
      nachricht: `Wir gratulieren herzlich zur Geburt von ${kindU1.name}! Als kleines Willkommens­geschenk legen wir einen handgeschriebenen Glückwunsch + ein Bio-Babymützchen dazu. Hinweis zur Versicherung kommt frühestens nach 6 Monaten, nutzen Sie die Karenzzeit zum Ankommen.`,
      ergebnis: 'Persönlicher Touchpoint ohne Verkaufsdruck',
    },
    kindSchule && {
      id: 'vers-schulanfang-unfall', kategorie: 'geschenk', status: 'geplant', icon: GraduationCap,
      titel: `Schulanfang ${kindSchule.name} – Schulweg-Unfallschutz`,
      datum: '2026-08-15', kanal: 'Postversand + Beilage',
      quelle: `Stammdaten · Einschulung ${kindSchule.name} (${kindSchule.alter} J.)`,
      nachricht: `Geplant: 20 €-Buchgutschein bei „Buchhandlung am Markt" zur Einschulung von ${kindSchule.name} + dezenter Hinweis-Flyer zum Kinder-Unfallschutz auf dem Schulweg (gesetzlich nur in der Schule + Schulweg gedeckt, Freizeitunfälle nicht). Kein direkter Vertragsantrag.`,
      ergebnis: 'Lokales Engagement + sanfter Cross-Sell-Impuls',
    },
    {
      id: 'vers-geburtstag', kategorie: 'glueckwunsch', status: 'geplant', icon: Cake,
      titel: 'Geburtstagsgruß mit Beitrags-Treuegutschrift',
      datum: '2026-09-12', kanal: 'Postkarte',
      quelle: 'Stammdaten · Geburtstag in 24 Wochen',
      nachricht: `Handgeschriebene Glückwunschkarte zum Geburtstag mit Hinweis auf 25 € Beitrags-Treuegutschrift (wird automatisch auf den nächsten BU-Beitrag angerechnet). Kein Verkaufsanlass, kein Cross-Sell.`,
      ergebnis: 'Wertschätzungs-Touchpoint, NPS-Lift',
    },
    {
      id: 'vers-schadenfrei-bonus', kategorie: 'glueckwunsch', status: 'versendet', icon: Award,
      titel: '5 Jahre schadenfrei – Treue-Bonus',
      datum: '2026-02-04', kanal: 'E-Mail',
      quelle: 'Schadenhistorie · 5 Jahre ohne Schadenmeldung in der KFZ-Police',
      nachricht: `Hallo ${vorname}, herzlichen Glückwunsch, Sie sind seit 5 Jahren schadenfrei in Ihrer KFZ-Vollkasko. Dafür bedanken wir uns mit einer einmaligen Beitrags-Treuegutschrift von 60 € auf Ihre nächste Hauptfälligkeit. Kein Anruf nötig, keine Bedingung.`,
      ergebnis: 'Bindungsmoment, Schadenfreiheit honoriert',
    },
    h.hasChatbotZuThema(kunde, /auslandsreise|arkv|reisekranken/i) && {
      id: 'vers-arkv-reise', kategorie: 'service', status: 'vorschlag', icon: Plane,
      titel: 'Auslandsreisekrankenversicherung Familie (Thailand)',
      datum: '2026-05-13', kanal: 'E-Mail (Vorschlag)',
      quelle: 'Chatbot · Anfrage vom 12.05.2026 zu Thailand-Familienreise',
      nachricht: `Hallo ${vorname}, gestern Abend haben Sie über unseren Chatbot nach einer Auslandsreisekrankenversicherung für Ihre geplante Thailand-Reise mit Sarah, Lina und Max gefragt. Da im Bestand aktuell keine ARKV liegt und die Unfallversicherung Basis keinen Krankenrücktransport übernimmt, schlagen wir den Familien-Jahresschutz vor: weltweite Deckung, Rücktransport, ohne Selbstbeteiligung, ca. 49 €/Jahr für alle vier, gilt auch für alle weiteren Auslandsaufenthalte bis 56 Tage. Anbei das ausgefüllte Antrags-PDF, Sie müssen nur unterschreiben.`,
      ergebnis: 'Schließt Reise-Lücke vor Sommerurlaub',
    },
    h.hasBu(kunde) && {
      id: 'vers-vorsorgevollmacht', kategorie: 'service', status: 'vorschlag', icon: FileText,
      titel: 'Hinweis Vorsorgevollmacht & Patientenverfügung',
      datum: '2026-05-20', kanal: 'E-Mail (Vorschlag)',
      quelle: 'Bestand · BU-Police aktiv, keine hinterlegte Vorsorgevollmacht',
      nachricht: `Eine BU-Versicherung greift im Berufsunfähigkeitsfall, sie regelt aber nicht, wer Sie rechtlich vertritt, wenn Sie selbst nicht handeln können. Wir bieten kostenfrei das Vorlagen-Set Vorsorgevollmacht + Patientenverfügung (notariell beglaubigte Mustertexte) per Mail an. Reine Information.`,
      ergebnis: 'Mehrwert ohne Verkauf',
    },
    h.hasHundIndikator(kunde) && {
      id: 'vers-tierhalter-haftpflicht', kategorie: 'finanztipp', status: 'vorschlag', icon: Dog,
      titel: 'Tierhalter-Haftpflicht für Balu (Pflicht in NRW)',
      datum: '2026-05-04', kanal: 'E-Mail (Vorschlag)',
      quelle: 'Open Finance · Fressnapf 85 €/Mon. + Hundeschule Rhein 45 €/Mon. + Tierarztpraxis Dr. Müller 120 €/Quartal',
      nachricht: `Hallo ${vorname}, anhand Ihrer Kontoumsätze (Fressnapf Köln, Hundeschule Rhein, Tierarztpraxis Dr. Müller) gehen wir davon aus, dass Sie einen Hund in der Familie haben. Wichtig zu wissen: In Nordrhein-Westfalen ist eine Tierhalter-Haftpflichtversicherung für Hunde gesetzlich vorgeschrieben (Landeshundegesetz §5). Ihre aktuelle Privathaftpflicht (HUK, Familien-Tarif) schließt Hunde-bezogene Schäden ausdrücklich aus; bei einem Beißvorfall oder Verkehrsschaden würden Sie persönlich haften. Wir schlagen Tierhalter-Haftpflicht Premium (ca. 80 €/J.) vor, optional kombiniert mit Tierkranken Komfort (ca. 280 €/J.). Keine Gesundheitsprüfung bei jungen Hunden.`,
      ergebnis: 'Pflichtversicherung erfüllen, Haftungsrisiko schließen',
    },
    (h.hasChatbotZuThema(kunde, /pflege/i) || h.absicherungFehlt(kunde, 'pflege')) && {
      id: 'vers-pflegezusatz-eltern', kategorie: 'service', status: 'vorschlag', icon: HeartHandshake,
      titel: 'Pflegezusatz für die Eltern: Follow-up',
      datum: '2026-05-18', kanal: 'E-Mail (Vorschlag)',
      quelle: 'Chatbot · Anfrage vom 20.01.2026 zu Pflegezusatz Eltern (68 + 71 J.)',
      nachricht: `Hallo ${vorname}, im Januar hatten Sie unseren Chatbot zur Pflegezusatzversicherung für Ihre Eltern (68 und 71 Jahre) angefragt; Sie wollten das Thema in Ruhe mit Sarah besprechen. Da bei Ihrer Mutter (68) jeder Monat Wartezeit die Monatsprämie spürbar erhöht und ab dem 70. Lebensjahr in vielen Tarifen keine Annahme mehr erfolgt, möchten wir Ihnen unverbindlich zwei vorgerechnete Varianten zusenden: Pflege-Tagegeld (50 €/Tag ab PG 2, ca. 135 €/mtl.) und Pflege-Monatsgeld (1.500 €/mtl. ab PG 3, ca. 110 €/mtl.). Beide mit vereinfachter Gesundheitsprüfung. Keine Verkaufsabsicht; falls das Thema nicht mehr aktuell ist, einfach ignorieren.`,
      ergebnis: 'Warmer Follow-up, kein Verkaufsdruck',
    },
    h.hasEfhEigentum(kunde) && {
      id: 'vers-wohngebaeude-elementar', kategorie: 'sparhinweis', status: 'vorschlag', icon: Home,
      titel: 'Wohngebäude + Elementarschutz prüfen',
      datum: '2026-05-09', kanal: 'E-Mail (Vorschlag)',
      quelle: `Stammdaten · Eigentum EFH ${kunde.wohnflaeche} qm, Baufinanzierung in Open Finance erkannt`,
      nachricht: `Hallo ${vorname}, im Bestand sehen wir bislang keinen Wohngebäudevertrag bei uns; bei einem Einfamilienhaus mit ${kunde.wohnflaeche} qm in Köln und einer laufenden Baufinanzierung über 285 k ist das ein kritisches Risiko: Bei Feuer-, Leitungswasser- oder Sturmschäden haftet im Zweifel der Eigentümer, die Bank kann die Restschuld dann sofort fällig stellen. Wir schlagen Wohngebäude Premium inkl. Elementarschutz (Überschwemmung, Starkregen, Rückstau) vor; bei Bündelung mit der bereits angepassten Hausrat-Police rund 15 % Familienrabatt. Wir bringen den Vorschlag gerne in den Jahres-Vertragsreview im Mai mit.`,
      ergebnis: 'Existenzielle Lücke schließen, Bündelrabatt nutzen',
    },
    h.hasFamilieMitKindern(kunde) && {
      id: 'vers-kinder-invaliditaet', kategorie: 'service', status: 'vorschlag', icon: Users,
      titel: 'Kinder-Invaliditätsversicherung Lina & Max',
      datum: '2026-05-22', kanal: 'E-Mail (Vorschlag)',
      quelle: 'Stammdaten · 2 Kinder unter 18 (Lina 7 J., Max 1 J.), keine Kinder-Invalidität im Bestand',
      nachricht: `Hallo ${vorname}, in unseren Gesprächen zur Familie haben wir bislang über BU und Familien-Unfallschutz gesprochen. Eine wichtige Ergänzung gerade für junge Familien fehlt aber: die Kinder-Invaliditätsversicherung. Im Gegensatz zur Unfallversicherung greift sie auch, wenn ein Kind durch eine schwere Erkrankung (z. B. Meningitis, Krebs, neurologische Diagnose) dauerhaft invalide wird, laut Statistik der häufigere Fall. Für Lina (7 J.) und Max (1 J.) liegt der Beitrag bei jeweils ca. 18 €/mtl. für eine lebenslange Rente von 1.000 €/mtl. ab 50 % Invalidität. Reine Information, keine automatische Anfrage; sagen Sie kurz Bescheid, wenn Sie ein Angebot möchten.`,
      ergebnis: 'Familienabsicherung um Krankheits-Invalidität ergänzen',
    },
    h.hasFremdKfz(kunde) && h.eigenHasKfz(kunde) && {
      id: 'vers-kfz-buendel', kategorie: 'sparhinweis', status: 'vorschlag', icon: Car,
      titel: 'Zweitwagen-Bündel mit Familienrabatt',
      datum: '2026-05-28', kanal: 'E-Mail (Vorschlag)',
      quelle: 'Open Finance · Fremd-KFZ in fremdProdukte (separater Versicherer), eigener KFZ-Vertrag bei uns',
      nachricht: `Hallo ${vorname}, Ihr eigener KFZ-Vertrag (VW Tiguan, Vollkasko, SF-12) läuft bei uns; der zweite Familienwagen (VW Passat, SF-12) ist laut Open-Finance-Sicht bei der Allianz versichert (ca. 720 €/J.). Bei Zusammenführung in unseren Familien-Bündel-Tarif greift der Mehrwagenrabatt (~10 %) plus identische SF-Klasse-Übertragung, zusammen rund 130–170 €/J. Ersparnis. Wechsel zum nächsten Stichtag (01.01.2027) ist problemlos möglich, Kündigungsfrist 30.11.2026. Wenn Sie wollen, übernehmen wir die Kündigung beim Vorversicherer.`,
      ergebnis: 'Geschätzte Ersparnis 130–170 €/J. + ein Ansprechpartner',
    },
    {
      id: 'vers-praevention-kursangebot', kategorie: 'finanztipp', status: 'versendet', icon: Heart,
      titel: 'Kostenfreier Präventionskurs (Rücken/Stress)',
      datum: '2026-01-15', kanal: 'E-Mail',
      quelle: 'Bestand · Kranken-/BU-Police aktiv',
      nachricht: `Als Bestandskunde erhalten Sie 2 kostenfreie Online-Präventionskurse pro Jahr (Rücken, Stress, Ernährung; kooperierender Anbieter Online-Akademie Gesundheit). Wir bezuschussen den Kurs zu 100 %. Anmeldung über den Link in der Mail, keine weitere Verpflichtung.`,
      ergebnis: 'Gesundheitsbenefit, Bindungsfaktor',
    },
  ];

  return catalog.filter(Boolean);
}

function buildServices(kunde) {
  const h = HELFER;
  const liq = h.liquiditaet(kunde);
  const vorname = kunde.name?.split(' ')[0] || 'Kunde';
  const kindU1 = h.kindUnter1(kunde);
  const kindSchule = h.kindAlter5bis7(kunde);

  const catalog = [
    h.fremdHasDepotOrTagesgeld(kunde) && h.eigenHasSpar(kunde) && {
      id: 'freistellung-mismatch', kategorie: 'finanztipp', status: 'versendet', icon: ShieldCheck,
      titel: 'Freistellungsauftrag optimieren', datum: '2026-04-12', kanal: 'E-Mail',
      quelle: 'Open Finance · Erträge bei externen Depots/Tagesgeldkonten erkannt',
      nachricht: `Hallo ${vorname}, Ihr Freistellungsauftrag bei uns liegt bei 600 EUR. Tatsächlich haben Sie in diesem Jahr aber nur ca. 200 EUR Kapitalerträge bei der Volksbank; bei Ihren externen Depots/Tagesgeldkonten sind hingegen rund 600 EUR Zinserträge angefallen, die ungenutzt versteuert werden. Eine Aufteilung des Pauschbetrags spart rund 158 EUR Steuern pro Jahr. Antworten Sie einfach auf diese E-Mail, wir passen das gerne kostenfrei für Sie an.`,
      ergebnis: 'Steuerersparnis ca. 158 EUR / Jahr',
    },
    kindU1 && {
      id: 'geburt-schnuller', kategorie: 'geschenk', status: 'versendet', icon: Baby,
      titel: 'Willkommensgruß zur Geburt', datum: '2025-11-08', kanal: 'Postversand',
      quelle: `Daueraufträge an Familienkasse + Eingang Elterngeld – KI erkannt: Geburt von ${kindU1.name}`,
      nachricht: `Wir haben uns ganz bewusst gegen einen sofortigen Kindersparplan-Anschreiben entschieden, stattdessen ein handgeschriebener Glückwunsch und ein gebrandeter Bio-Schnuller in unserer Bankfarbe. Der Sparplan-Hinweis kommt frühestens nach 6 Monaten, wenn der erste Trubel vorbei ist.`,
      ergebnis: 'Persönlicher Touchpoint ohne Verkaufsdruck',
    },
    h.isSelbststaendig(kunde) && {
      id: 'selbststaendigkeit-ruecklage', kategorie: 'finanztipp', status: 'vorschlag', icon: Briefcase,
      titel: 'Hinweis zur Steuerrückstellung', datum: '2026-04-22', kanal: 'E-Mail (Vorschlag)',
      quelle: 'Open Finance · Wegfall Gehaltseingang, dafür unregelmäßige Rechnungseingänge – Lebenslage „Selbstständigkeit"',
      nachricht: `Hallo ${vorname}, seit ca. 3 Monaten verbuchen wir keine klassischen Gehaltseingänge mehr, dafür gehen Rechnungsbeträge von verschiedenen Auftraggebern ein. Falls Sie sich selbstständig gemacht haben: Herzlichen Glückwunsch! Praxistipp: Legen Sie automatisch ca. 10 % jeder eingehenden Rechnung auf ein separates Tagesgeldkonto zur Seite, für Steuernachzahlungen und USt.-Voranmeldungen. Wir richten Ihnen das gerne kostenfrei als automatische Regel ein.`,
      ergebnis: 'Vorschlag, vor Versand prüfen',
    },
    h.isPraxis(kunde) && {
      id: 'praxis-ruecklage', kategorie: 'finanztipp', status: 'vorschlag', icon: Briefcase,
      titel: 'Steuer- & Investitionsrücklage Praxis', datum: '2026-04-22', kanal: 'E-Mail (Vorschlag)',
      quelle: 'Open Finance · Erhöhte USt-Vorauszahlungen + Investitionen Praxisausstattung',
      nachricht: `Hallo ${vorname}, durch die Praxis-Erweiterung steigen Steuerlast und Invest-Bedarf. Wir empfehlen: 12 % jeder Honorareingang automatisch auf ein Geschäfts-Tagesgeld zur Steuerrücklage + 5 % auf eine Investitions-Rücklage. Wir richten beides als Regel ein: keine Bindung, jederzeit anpassbar.`,
      ergebnis: 'Vorschlag, vor Versand prüfen',
    },
    (kunde.id === 'BK00002' || kunde.id === 'BK00003' || kunde.id === 'BK00004') && {
      id: 'geburtstag-blumen', kategorie: 'glueckwunsch', status: 'geplant', icon: Cake,
      titel: 'Geburtstagsgruß mit Blumengutschein', datum: '2026-06-14', kanal: 'Postkarte + Gutschein',
      quelle: 'Stammdaten · Geburtstag in 7 Wochen',
      nachricht: `Handgeschriebene Glückwunschkarte zum Geburtstag mit einem 25-EUR-Blumengutschein bei „Blumen Müller" (lokaler Partner). Kein Verkaufsanlass, kein Cross-Sell-Hinweis, reiner Wertschätzungs-Touchpoint.`,
      ergebnis: 'NPS-Lift erwartet, Beleg lokales Engagement',
    },
    h.hasPartner(kunde) && {
      id: 'streaming-doppelt', kategorie: 'sparhinweis', status: 'versendet', icon: Repeat,
      titel: 'Doppelter Dauerauftrag erkannt', datum: '2026-03-28', kanal: 'In-App-Push',
      quelle: `Transaktionsanalyse · Netflix 12,99 EUR auf Hauptkonto + Konto ${kunde.partner.name || 'Partner/in'}`,
      nachricht: `Uns ist aufgefallen, dass sowohl auf Ihrem Konto als auch auf dem Konto Ihrer/Ihres Partner/in monatlich 12,99 EUR an Netflix abgebucht werden. Vermutlich zwei separate Abos, die Sie zu einem Familien-Account zusammenlegen können. Ersparnis: ca. 156 EUR pro Jahr, und mehr Profile inklusive.`,
      ergebnis: 'Ersparnis ca. 156 EUR / Jahr',
    },
    liq.knapp && {
      id: 'notgroschen-hinweis', kategorie: 'finanztipp', status: 'vorschlag', icon: PiggyBank,
      titel: 'Sanfter Hinweis Notgroschen', datum: '2026-04-25', kanal: 'In-App-Banner',
      quelle: `Liquiditäts-Analyse · Sparguthaben (${formatEur(liq.sparvolumen)}) < 3 Monatsausgaben (${formatEur(liq.monatsausgaben * 3)})`,
      nachricht: `Empfehlung: 2-3 Monatsausgaben als jederzeit verfügbare Reserve. Wir schlagen Ihnen vor, einen kleinen Dauerauftrag (z. B. 100 EUR/Monat) auf ein Tagesgeldkonto einzurichten, komplett ohne Bindung. Reine Information, keine Aufdringlichkeit.`,
      ergebnis: 'Vorschlag, vor Versand prüfen',
    },
    h.hasVisaOderReisekarte(kunde) && {
      id: 'reise-tipp', kategorie: 'service', status: 'versendet', icon: Plane,
      titel: 'Reise-Service vor Auslandsreise', datum: '2026-02-19', kanal: 'In-App-Push',
      quelle: 'Kartenumsatz · Buchung Lufthansa BCN, Übernachtungen erkannt',
      nachricht: `Schöne Reise nach Barcelona! Drei Hinweise vor der Abreise: (1) Ihre VR-Visa Gold ist im Ausland inklusive Reise-Krankenversicherung gültig. (2) Aktivieren Sie kurz die Auslandsfreigabe in der App, damit es bei der ersten Zahlung kein Sicherheits-Stop gibt. (3) Notfall-Hotline für Kartensperre: +49 116 116. Gute Reise!`,
      ergebnis: 'Service ohne Verkaufsanlass',
    },
    kindSchule && {
      id: 'schulanfang', kategorie: 'geschenk', status: 'geplant', icon: GraduationCap,
      titel: `Schulanfangs-Gutschein für ${kindSchule.name}`, datum: '2026-08-15', kanal: 'Postversand',
      quelle: `Stammdaten · Kind ${kindSchule.name} (${kindSchule.alter} J.) · Einschulung im Sommer`,
      nachricht: `Geplant: 20-EUR-Gutschein bei „Schreibwaren Becker" (lokaler Partner) zur Einschulung von ${kindSchule.name}, handgeschrieben, kein Verkaufs-Beilagen. Optional: Erinnerung an Junior-Sparbuch erst ab Klasse 2.`,
      ergebnis: 'Lokales Partnernetz, NPS-Effekt',
    },
    h.hasStromVertrag(kunde) && {
      id: 'energie-check', kategorie: 'sparhinweis', status: 'vorschlag', icon: Zap,
      titel: 'Energievertrag günstiger möglich', datum: '2026-04-26', kanal: 'E-Mail (Vorschlag)',
      quelle: 'Transaktion · Stadtwerke 142 EUR/Monat, ca. 18 % über Marktdurchschnitt',
      nachricht: `Ihr aktueller Stromtarif liegt rund 18 % über dem Marktdurchschnitt für Haushalte vergleichbarer Größe in Ihrer Region. Wir bieten unseren Mitgliedern einen kostenfreien Tarifcheck (über Verivox); Wechsel optional, wir verkaufen Ihnen nichts. Ersparnispotenzial laut Schätzung: ca. 280 EUR / Jahr.`,
      ergebnis: 'Ersparnispotenzial ca. 280 EUR / Jahr',
    },
    h.hasFinanzierung(kunde) && {
      id: 'tilgung-fertig', kategorie: 'glueckwunsch', status: 'geplant', icon: PartyPopper,
      titel: 'Glückwunsch zur letzten Rate', datum: '2027-01-10', kanal: 'Brief + Sekt-Gutschein',
      quelle: 'Tilgungsplan · letzte Rate erkannt',
      nachricht: `Geplant zur Schluss-Rate Ihrer Immobilienfinanzierung: persönlicher Brief Ihres Beraters mit handschriftlichem Glückwunsch + Sekt-Gutschein bei einem regionalen Weinhändler. Kein Anschluss-Cross-Sell in dieser Sendung; der Hinweis auf eine mögliche Modernisierungs-Finanzierung kommt separat 4 Wochen später.`,
      ergebnis: 'Bindungsmoment am Lebensereignis',
    },
  ];

  return catalog.filter(Boolean);
}

function ServiceCard({ service, onPreview }) {
  const { t } = useTranslation();
  const status = STATUS[service.status];
  const kat = KATEGORIE_FARBEN[service.kategorie];
  const StatusIcon = status.icon;
  const Icon = service.icon;
  const datumDe = new Date(service.datum).toLocaleDateString(getLang() === 'en' ? 'en-GB' : 'de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="surface-card p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: kat.bg, color: kat.color }}>
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: kat.bg, color: kat.color }}>
              {t(KATEGORIE_LABEL_KEYS[service.kategorie] || '') || kat.label}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border" style={{ background: status.bg, color: status.color, borderColor: status.border }}>
              <StatusIcon size={12} />
              {t(STATUS_LABEL_KEYS[service.status] || '') || status.label}
            </span>
            <span className="text-xs text-(--text-secondary)">{datumDe} · {service.kanal}</span>
          </div>
          <h3 className="mt-1 text-base font-semibold text-(--text-primary)">{service.titel}</h3>
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs text-(--text-secondary) surface-inset rounded-lg px-3 py-2">
        <Info size={14} className="shrink-0 mt-0.5 text-(--text-secondary)" />
        <span><span className="font-medium text-(--text-primary)">{t('serviceTrigger')}</span> {service.quelle}</span>
      </div>

      <p className="text-sm text-(--text-primary) leading-relaxed line-clamp-3">{service.nachricht}</p>

      <div className="flex items-center justify-between pt-1 mt-auto">
        <div className="text-xs text-(--text-secondary)">
          <span className="font-medium text-(--text-primary)">{t('serviceEffekt')}</span> {service.ergebnis}
        </div>
        <button
          type="button"
          onClick={() => onPreview(service)}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg surface-inset hover:border-(--border-medium) text-(--text-primary) transition-colors"
        >
          <Eye size={14} />
          {t('serviceVorschau')}
        </button>
      </div>
    </div>
  );
}

function PreviewModal({ service, onClose }) {
  const { t } = useTranslation();
  if (!service) return null;
  const status = STATUS[service.status];
  const StatusIcon = status.icon;
  const datumDe = new Date(service.datum).toLocaleDateString(getLang() === 'en' ? 'en-GB' : 'de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: 'rgba(28, 26, 23, 0.45)' }} onClick={onClose}>
      <div className="surface-elevated rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-(--border-light) flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail size={20} className="text-(--mode-primary)" />
            <div>
              <h3 className="text-base font-semibold text-(--text-primary)">{service.titel}</h3>
              <div className="text-xs text-(--text-secondary)">{datumDe} · {service.kanal}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-(--bg-inset) text-(--text-secondary)" aria-label={t('serviceSchliessen')}>
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border" style={{ background: status.bg, color: status.color, borderColor: status.border }}>
            <StatusIcon size={12} />
            {t(STATUS_LABEL_KEYS[service.status] || '') || status.label}
          </div>
          <div className="text-sm text-(--text-primary) whitespace-pre-line leading-relaxed">{service.nachricht}</div>
          <div className="text-xs text-(--text-secondary) surface-inset rounded-lg px-3 py-2">
            <span className="font-medium text-(--text-primary)">{t('serviceTrigger')}</span> {service.quelle}
          </div>
        </div>
        {service.status === 'vorschlag' && (
          <div className="px-6 py-4 border-t border-(--border-light) flex items-center justify-end gap-2">
            <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg surface-inset text-(--text-primary) hover:border-(--border-medium) transition-colors">
              {t('serviceVerwerfen')}
            </button>
            <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg text-white inline-flex items-center gap-1.5 bg-(--mode-primary) hover:bg-(--mode-primary-light) transition-colors">
              <Send size={14} />
              {t('serviceFreigebenSenden')}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default function ServiceTab({ kunde }) {
  const { t } = useTranslation();
  const { modeId } = useMode();
  const services = useMemo(
    () => modeId === 'versicherung' ? buildServicesVersicherung(kunde) : buildServices(kunde),
    [kunde, modeId]
  );
  const [preview, setPreview] = useState(null);

  const counts = useMemo(() => ({
    versendet: services.filter(s => s.status === 'versendet').length,
    geplant:   services.filter(s => s.status === 'geplant').length,
    vorschlag: services.filter(s => s.status === 'vorschlag').length,
  }), [services]);

  return (
    <div className="space-y-6">
      <div className="surface-card p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-(--mode-primary) text-white">
            <Sparkles size={20} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-(--text-primary)">{t('automatisierteKiService')}</h2>
            <p className="text-sm text-(--text-secondary) mt-1">
              {t('serviceIntro')}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border" style={{ background: STATUS.versendet.bg, color: STATUS.versendet.color, borderColor: STATUS.versendet.border }}>
                <CheckCircle2 size={12} /> {t('serviceVersendet', { count: counts.versendet })}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border" style={{ background: STATUS.geplant.bg, color: STATUS.geplant.color, borderColor: STATUS.geplant.border }}>
                <Clock size={12} /> {t('serviceGeplant', { count: counts.geplant })}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border" style={{ background: STATUS.vorschlag.bg, color: STATUS.vorschlag.color, borderColor: STATUS.vorschlag.border }}>
                <Sparkles size={12} /> {t('serviceZurFreigabe', { count: counts.vorschlag })}
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
        <div className="surface-card p-8 text-center text-sm text-(--text-tertiary)">
          {t('serviceKeineAnlaesse')}
        </div>
      )}

      <PreviewModal service={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
