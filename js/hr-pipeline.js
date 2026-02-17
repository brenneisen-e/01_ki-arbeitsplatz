/**
 * HR Pipeline Module - KI-gestütztes Recruiting & Bewerbermanagement
 * Demo-only: All data is client-side, no real AI backend
 *
 * Features: Insurance-specific scoring, SHAP waterfall, typewriter summaries,
 * animated KPIs, blind screening, candidate comparison, interview questions,
 * skill gap analysis, counterfactual suggestions, toast notifications
 */

// ========================================
// STATE
// ========================================

let hpPipelineLoaded = false;
let hpCurrentMode = 'bewerber';
let hpCurrentProfile = null;
let hpChatOpen = false;
let hpBlindScreening = false;
let hpSelectedForCompare = new Set();
let hpCurrentDetailApplicant = null;

// ========================================
// BLIND SCREENING HELPER
// ========================================

function anonymizeText(text, applicant) {
    if (!text || !applicant) return text;
    let result = text;
    // Replace full name
    if (applicant.name) result = result.replace(new RegExp(applicant.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 'Kandidat/in');
    // Replace last name (e.g. "Herr Berger" -> "Kandidat/in", "Frau Klein" -> "Kandidat/in")
    const parts = (applicant.name || '').split(' ');
    if (parts.length >= 2) {
        const lastName = parts[parts.length - 1];
        result = result.replace(new RegExp('(?:Herr|Frau)\\s+' + lastName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 'Kandidat/in');
        result = result.replace(new RegExp(lastName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 'Kandidat/in');
    }
    // Replace city with region
    if (applicant.city) result = result.replace(new RegExp(applicant.city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), applicant.region?.toUpperCase() || 'Region');
    // Replace age
    if (applicant.age) result = result.replace(new RegExp(applicant.age + '\\s*Jahre', 'g'), '— Jahre');
    return result;
}

// ========================================
// DEMO DATA - Enhanced Bewerber Profiles
// ========================================

const HP_PROFILES = {
    max: {
        id: 'max',
        name: 'Max Berger',
        initials: 'MB',
        photo: 'AdobeStock_624564221.jpeg',
        age: 34,
        city: 'Düsseldorf',
        region: 'nrw',
        experience: '8 Jahre Versicherungsvertrieb (Allianz AO)',
        experienceYears: 8,
        education: 'BWL-Studium (B.A.), IHK Versicherungsfachmann',
        skills: ['Kundenakquise', 'Bestandsmanagement', 'Führungserfahrung', 'Vertriebssteuerung', 'Cross-Selling'],
        certifications: ['IHK Versicherungsfachmann (§34d)', 'BWL Bachelor (DQR 6)', 'IDD Weiterbildung 2024'],
        insuranceFlags: {
            green: ['8J Allianz AO-Erfahrung', 'IHK §34d qualifiziert', 'Bestandsgröße 2.4 Mio €', 'Cross-Selling-Quote 34%'],
            red: ['Kein Fachwirt IHK']
        },
        strengths: ['Kundenakquise', 'Bestandsmanagement', 'Führungserfahrung (3 MA)', 'IHK-qualifiziert', 'Allianz AO-Erfahrung'],
        weaknesses: ['Keine ERGO-Erfahrung', 'Kein Fachwirt IHK'],
        scores: { vertrieb: 95, branche: 90, qualifikation: 88, standort: 92, softskills: 85 },
        totalScore: 92,
        summary: '8 Jahre fundierte Vertriebserfahrung in der Allianz Ausschließlichkeitsorganisation. IHK-Qualifikation nach §34d, nachgewiesene Führungskompetenz über 3 Mitarbeiter und Bestandsvolumen von 2,4 Mio €. Idealer Kandidat für die Agenturleitung. Cross-Selling-Quote von 34% liegt deutlich über dem Branchendurchschnitt.',
        radarData: [95, 90, 88, 92, 85],
        waterfall: [
            { label: 'IHK Versicherungsfachmann §34d', points: 18, type: 'positive' },
            { label: '8 Jahre AO-Erfahrung (Allianz)', points: 15, type: 'positive' },
            { label: 'Bestandsgröße 2,4 Mio €', points: 14, type: 'positive' },
            { label: 'Führungserfahrung (3 MA)', points: 12, type: 'positive' },
            { label: 'BWL-Studium (DQR 6)', points: 10, type: 'positive' },
            { label: 'Cross-Selling-Quote 34%', points: 8, type: 'positive' },
            { label: 'IDD Weiterbildung aktuell', points: 5, type: 'positive' },
            { label: 'Standort Düsseldorf (Match)', points: 7, type: 'positive' },
            { label: 'Kein Fachwirt IHK', points: -7, type: 'negative' },
            { label: 'Keine ERGO-Erfahrung', points: -3, type: 'negative' }
        ],
        counterfactual: 'Wenn dieser Kandidat den Fachwirt für Versicherungen und Finanzen IHK (Bachelor Professional, DQR 6) abschließt, steigt sein Score von 92 auf 97. Empfehlung: DVA-Programm (24 Monate berufsbegleitend, ca. 3.500 €).',
        interviewQuestions: {
            background: [
                { q: 'Ihr CV zeigt 8 Jahre bei der Allianz AO — beschreiben Sie Ihren typischen Bestandskundenbetreuungsprozess.', why: 'Verifizierung der AO-Vertriebserfahrung und Bestandsmanagement-Kompetenz' },
                { q: 'Wie haben Sie Ihr Bestandsvolumen von 2,4 Mio € aufgebaut? Welche Akquise-Strategien waren am erfolgreichsten?', why: 'Quantifizierung der Vertriebsleistung und strategisches Denken' }
            ],
            behavioral: [
                { q: 'Erzählen Sie von einer Situation, in der Sie eine Deckungslücke bei einem Bestandskunden identifiziert haben. Wie sind Sie vorgegangen?', why: 'STAR-Methode: Bedarfsanalyse-Kompetenz und Cross-Selling-Fähigkeit' },
                { q: 'Beschreiben Sie eine Herausforderung bei der Führung Ihres 3-köpfigen Teams. Wie haben Sie diese gelöst?', why: 'Führungskompetenz und Konfliktlösungsfähigkeit für Agenturleiter-Rolle' }
            ],
            technical: [
                { q: 'Wie würden Sie eine bAV-Beratung für ein mittelständisches Unternehmen mit 200 Mitarbeitern strukturieren?', why: 'Technisches Fachwissen und Beratungskompetenz im Firmenkundengeschäft' },
                { q: 'Welche Erfahrungen haben Sie mit BiPRO-Schnittstellen und digitalen Vergleichsrechnern?', why: 'Digitale Kompetenz — entscheidend für moderne Vertriebsprozesse' }
            ]
        },
        skillGap: {
            dimensions: [
                { label: 'Regulatorik', current: 85, required: 80 },
                { label: 'Vertriebserfahrung', current: 95, required: 85 },
                { label: 'Spartenkenntnis', current: 80, required: 75 },
                { label: 'Digital-Kompetenz', current: 70, required: 80 },
                { label: 'Führungskompetenz', current: 78, required: 85 }
            ],
            training: 'Empfehlung: Fachwirt für Versicherungen und Finanzen IHK (DVA, 24 Monate, ~3.500 €) → Score-Steigerung: +5 Punkte. ROI: Weiterbildungskosten 3.500 € vs. externe Neubesetzung ~18.000 €.'
        }
    },
    sarah: {
        id: 'sarah',
        name: 'Sarah Klein',
        initials: 'SK',
        age: 29,
        city: 'Köln',
        region: 'nrw',
        experience: '4 Jahre Einzelhandel (Teamleitung MediaMarkt)',
        experienceYears: 4,
        education: 'Ausbildung Einzelhandelskauffrau, Weiterbildung Vertrieb',
        skills: ['Teamführung', 'Kundenberatung', 'Vertriebsaffinität', 'Kommunikationsstärke'],
        certifications: ['Ausbildung Einzelhandelskauffrau (DQR 4)', 'Weiterbildung Vertrieb'],
        insuranceFlags: {
            green: ['Teamführungserfahrung (5 MA)', 'Vertriebsaffinität', 'Kommunikationsstärke'],
            red: ['Keine Versicherungserfahrung', 'Keine IHK §34d', 'Branchenwechsel']
        },
        strengths: ['Teamführungserfahrung', 'Kommunikationsstärke', 'Vertriebsaffinität', 'Kundenorientierung'],
        weaknesses: ['Keine Versicherungserfahrung', 'Keine IHK-Qualifikation', 'Branchenwechsel'],
        scores: { vertrieb: 65, branche: 35, qualifikation: 55, standort: 88, softskills: 82 },
        totalScore: 68,
        summary: 'Motivierte Quereinsteigerin mit 4 Jahren Teamleitungserfahrung im Einzelhandel bei MediaMarkt. Führungskompetenz über 5 Mitarbeiter und ausgeprägte Kommunikationsstärke als solide Grundlage für den Versicherungsvertrieb. Fehlende §34d-Qualifikation kann über ERGO Trainee-Programm (6 Monate, IHK-Sachkundeprüfung inklusive) erworben werden.',
        radarData: [65, 35, 55, 88, 82],
        waterfall: [
            { label: 'Teamführung (5 MA)', points: 12, type: 'positive' },
            { label: 'Kommunikationsstärke', points: 10, type: 'positive' },
            { label: 'Vertriebsaffinität', points: 8, type: 'positive' },
            { label: 'Kundenberatungserfahrung', points: 7, type: 'positive' },
            { label: 'Standort Köln (NRW)', points: 6, type: 'positive' },
            { label: 'Kaufmännische Ausbildung', points: 5, type: 'positive' },
            { label: 'Keine Versicherungserfahrung', points: -12, type: 'negative' },
            { label: 'Keine IHK §34d Qualifikation', points: -10, type: 'negative' },
            { label: 'Branchenwechsel-Risiko', points: -5, type: 'negative' }
        ],
        counterfactual: 'Nach Abschluss der IHK-Sachkundeprüfung §34d (über ERGO Trainee-Programm, 6 Monate) steigt der Score von 68 auf 82. Prognose erstes Jahr Neugeschäft: 180.000 € Bestandsaufbau.',
        interviewQuestions: {
            background: [
                { q: 'Was motiviert Sie zum Wechsel vom Einzelhandel in den Versicherungsvertrieb?', why: 'Wechselmotivation und Ernsthaftigkeit der Bewerbung bewerten' },
                { q: 'Beschreiben Sie Ihren Führungsstil bei MediaMarkt und wie Sie Ihr 5-köpfiges Team motiviert haben.', why: 'Übertragbare Führungskompetenz für Versicherungsvertrieb' }
            ],
            behavioral: [
                { q: 'Erzählen Sie von einem schwierigen Kundengespräch im Einzelhandel und wie Sie es gelöst haben.', why: 'Beratungskompetenz und Konfliktlösung — übertragbar auf Versicherungsberatung' },
                { q: 'Wie gehen Sie mit Umsatzzielen um? Geben Sie ein konkretes Beispiel für Zielerreichung.', why: 'Vertriebsmentalität und Zielorientierung bewerten' }
            ],
            technical: [
                { q: 'Was wissen Sie über die Unterschiede zwischen Ausschließlichkeitsvertrieb und Maklervertrieb?', why: 'Grundlegendes Branchenverständnis für Quereinsteiger testen' },
                { q: 'Wie stellen Sie sich Ihren typischen Arbeitstag als Vertriebspartnerin vor?', why: 'Realistische Erwartungshaltung an die Rolle prüfen' }
            ]
        },
        skillGap: {
            dimensions: [
                { label: 'Regulatorik', current: 20, required: 80 },
                { label: 'Vertriebserfahrung', current: 65, required: 70 },
                { label: 'Spartenkenntnis', current: 15, required: 60 },
                { label: 'Digital-Kompetenz', current: 75, required: 65 },
                { label: 'Führungskompetenz', current: 72, required: 60 }
            ],
            training: 'Empfehlung: ERGO Trainee-Programm (6 Monate, IHK §34d inkl.) → Score-Steigerung: +14 Punkte. ROI: Trainee-Kosten ~12.000 € vs. externe Besetzung erfahrener Kandidat ~22.000 €.'
        }
    },
    thomas: {
        id: 'thomas',
        name: 'Thomas Wendt',
        initials: 'TW',
        age: 52,
        city: 'Flensburg',
        region: 'nord',
        experience: '20 Jahre Sachbearbeitung Kommunalverwaltung',
        experienceYears: 20,
        education: 'Verwaltungsfachangestellter',
        skills: ['Verwaltung', 'Sachbearbeitung', 'Dokumentation'],
        certifications: ['Verwaltungsfachangestellter (DQR 4)'],
        insuranceFlags: {
            green: ['Langjährige Berufserfahrung', 'Zuverlässigkeit'],
            red: ['Keine Vertriebserfahrung', 'Keine Versicherungskenntnisse', 'Keine §34d', 'Standort ohne Stellen']
        },
        strengths: ['Langjährige Berufserfahrung', 'Zuverlässigkeit', 'Sorgfalt'],
        weaknesses: ['Keine Vertriebserfahrung', 'Keine Branchenkenntnisse', 'Keine kaufmännische Ausbildung', 'Fehlende Kundenorientierung', 'Standort ohne offene Stellen'],
        scores: { vertrieb: 10, branche: 5, qualifikation: 25, standort: 20, softskills: 35 },
        totalScore: 31,
        summary: '20 Jahre Erfahrung in der Kommunalverwaltung, jedoch ohne Bezug zum Vertrieb oder zur Versicherungsbranche. Es fehlen grundlegende Voraussetzungen: §34d-Qualifikation, Vertriebserfahrung und Kundenorientierung. Standort Flensburg bietet aktuell keine offenen Positionen. Quereinsteiger-Programm wäre einziger Einstiegspfad.',
        radarData: [10, 5, 25, 20, 35],
        rejected: true,
        rejectionText: 'Auf Basis Ihres Profils können wir Ihnen derzeit leider keine passende Vertriebsposition empfehlen. Es fehlen grundlegende Voraussetzungen: keine Vertriebserfahrung, keine §34d-Qualifikation, keine Branchenkenntnisse im Versicherungsbereich.',
        waterfall: [
            { label: 'Langjährige Berufserfahrung', points: 5, type: 'positive' },
            { label: 'Zuverlässigkeit / Sorgfalt', points: 4, type: 'positive' },
            { label: 'Verwaltungsausbildung (DQR 4)', points: 3, type: 'positive' },
            { label: 'Keine Vertriebserfahrung (0 J.)', points: -18, type: 'negative' },
            { label: 'Keine §34d Qualifikation', points: -15, type: 'negative' },
            { label: 'Keine Branchenkenntnisse', points: -12, type: 'negative' },
            { label: 'Standort Flensburg (keine Stellen)', points: -10, type: 'negative' },
            { label: 'Keine IDD-Weiterbildung', points: -5, type: 'negative' }
        ],
        counterfactual: 'Auch nach Abschluss des Quereinsteiger-Programms (6 Monate, IHK §34d) würde der Score nur auf ca. 52 steigen. Ein Standortwechsel nach Hamburg (+10 Punkte) wäre zusätzlich erforderlich.',
        interviewQuestions: {
            background: [
                { q: 'Was motiviert Sie nach 20 Jahren Verwaltung zum Wechsel in den Versicherungsvertrieb?', why: 'Wechselmotivation und Ernsthaftigkeit — kritisch bei so langem Verwaltungshintergrund' }
            ],
            behavioral: [
                { q: 'Beschreiben Sie eine Situation, in der Sie proaktiv auf einen Bürger zugegangen sind.', why: 'Kundenorientierung und Eigeninitiative — zentrale Schwächen im Profil' }
            ],
            technical: [
                { q: 'Was verstehen Sie unter einer Bedarfsanalyse im Versicherungskontext?', why: 'Grundlegendes Verständnis der Versicherungsberatung testen' }
            ]
        },
        skillGap: {
            dimensions: [
                { label: 'Regulatorik', current: 5, required: 80 },
                { label: 'Vertriebserfahrung', current: 10, required: 70 },
                { label: 'Spartenkenntnis', current: 5, required: 60 },
                { label: 'Digital-Kompetenz', current: 30, required: 65 },
                { label: 'Führungskompetenz', current: 15, required: 40 }
            ],
            training: 'Erhebliche Lücken in allen Dimensionen. Mindestens Quereinsteiger-Programm (6 Monate) + Standortwechsel erforderlich. Geschätzte Gesamtinvestition: ~15.000 € bei unsicherer Erfolgsquote.'
        }
    }
};

// ========================================
// DEMO DATA - Enhanced Job Positions
// ========================================

const HP_POSITIONS = [
    { id: 1, title: 'Agenturleiter', city: 'Düsseldorf', region: 'nrw', type: 'Führung', requirements: 'Fachwirt IHK (min.), §34d, 5+ Jahre AO-Vertrieb, Führungserfahrung, Portfoliomanagement', description: 'Als Agenturleiter/in übernehmen Sie die Verantwortung für eine eigenständige ERGO Versicherungsagentur in Düsseldorf. Sie führen ein Team von Vertriebsmitarbeitern, entwickeln Vertriebsstrategien und bauen den Kundenbestand in Ihrer Region systematisch aus.\n\nIhre Aufgaben:\n- Eigenverantwortliche Leitung einer ERGO Agentur mit Umsatzverantwortung\n- Führung, Motivation und Entwicklung eines Teams von 3-5 Vertriebsmitarbeitern\n- Akquise von Neukunden und Ausbau des Bestandskundengeschäfts\n- Durchführung von Bedarfsanalysen und ganzheitliche Kundenberatung über alle Sparten\n- Umsetzung regionaler Vertriebskampagnen und Marktbearbeitung\n\nWas wir erwarten:\n- Mindestens 5 Jahre Erfahrung im Versicherungsvertrieb (AO oder Makler)\n- IHK-Qualifikation nach §34d GewO, idealerweise Fachwirt für Versicherungen\n- Nachgewiesene Führungserfahrung und unternehmerisches Denken\n- Ausgeprägte Akquise-Stärke und Bestandsmanagement-Kompetenz', benefits: ['Attraktives Fixgehalt + Provision', 'Firmenwagen auch zur privaten Nutzung', 'Betriebliche Altersvorsorge', 'Weiterbildungsmöglichkeiten (DVA)', 'Eigenständige Agenturführung'] },
    { id: 2, title: 'Vertriebsspezialist Leben', city: 'Köln', region: 'nrw', type: 'Spezialist', requirements: 'IHK §34d, Erfahrung Lebensversicherung/bAV, Beratungskompetenz', description: 'Als Vertriebsspezialist/in Leben beraten Sie anspruchsvolle Kunden zu Lebensversicherungen, betrieblicher Altersvorsorge und biometrischen Risiken. Sie sind die fachliche Ansprechperson für unsere Agenturen in der Region Köln.\n\nIhre Aufgaben:\n- Spezialisierte Beratung in den Bereichen Lebensversicherung, bAV und Biometrie\n- Fachliche Unterstützung der ERGO Agenturen bei komplexen Beratungsfällen\n- Durchführung von Firmenkunden-Präsentationen zur betrieblichen Altersvorsorge\n- Entwicklung individueller Vorsorgekonzepte für gehobene Privatkunden\n- Schulung und Coaching von Vertriebspartnern im Bereich Leben\n\nWas wir erwarten:\n- IHK-Qualifikation nach §34d und fundierte Erfahrung in der Lebensversicherung\n- Sehr gute Kenntnisse in bAV, Biometrie und Altersvorsorge\n- Beratungskompetenz und sicheres Auftreten bei Firmenkunden\n- Analytisches Denkvermögen und Freude an komplexen Beratungssituationen', benefits: ['Überdurchschnittliche Vergütung', 'Fachkarriere-Perspektive', 'Firmenwagen', 'Umfangreiche Weiterbildung', 'Flexible Arbeitszeiten'] },
    { id: 3, title: 'Maklerbetreuer', city: 'Essen', region: 'nrw', type: 'Betreuung', requirements: 'Spartenübergreifende Produktkenntnis, B2B-Erfahrung, Courtage-Verständnis', description: 'Als Maklerbetreuer/in sind Sie die zentrale Schnittstelle zwischen ERGO und unseren Versicherungsmaklern in der Region Essen/Ruhrgebiet. Sie pflegen bestehende Maklerbeziehungen und gewinnen neue Partner für den ERGO Maklervertrieb.\n\nIhre Aufgaben:\n- Betreuung und Ausbau eines Maklerportfolios von ca. 80-120 Maklern\n- Akquise neuer Maklerpartner und Aufbau langfristiger Geschäftsbeziehungen\n- Spartenübergreifende Produktberatung und Angebotserstellung\n- Durchführung von Maklerschulungen und Produktpräsentationen\n- Courtage-Management und Vertragsverhandlungen\n\nWas wir erwarten:\n- Spartenübergreifende Produktkenntnis im Versicherungsbereich\n- Erfahrung im B2B-Vertrieb, idealerweise im Maklergeschäft\n- Ausgeprägte Netzwerk-Fähigkeiten und Verhandlungsgeschick\n- Verständnis für Courtage-Modelle und Makleranforderungen', benefits: ['Attraktives Grundgehalt + Bonus', 'Firmenwagen', 'Home-Office-Möglichkeit', 'Betriebliche Altersvorsorge', 'Netzwerk-Events'] },
    { id: 4, title: 'Ausschließlichkeitsvermittler', city: 'Dortmund', region: 'nrw', type: 'Vertrieb', requirements: 'IHK §34d (min. Sachkundeprüfung), Vertriebsaffinität, Eigeninitiative', description: 'Als Ausschließlichkeitsvermittler/in vertreten Sie die ERGO exklusiv in Dortmund und Umgebung. Sie beraten Privat- und Gewerbekunden umfassend zu allen Versicherungs- und Vorsorgeprodukten der ERGO Gruppe.\n\nIhre Aufgaben:\n- Ganzheitliche Beratung von Privat- und Gewerbekunden\n- Aktive Neukundenakquise und systematischer Bestandsaufbau\n- Cross-Selling über alle ERGO Produktsparten\n- Schadenservice und Kundenbetreuung als persönlicher Ansprechpartner\n- Teilnahme an regionalen Vertriebsaktionen und Messen\n\nWas wir erwarten:\n- IHK-Sachkundeprüfung §34d oder vergleichbare Qualifikation\n- Hohe Vertriebsaffinität und Eigeninitiative\n- Kundenorientierung und Beratungskompetenz\n- Unternehmerisches Denken und Selbstständigkeit', benefits: ['Leistungsgerechte Provision', 'Bestandssicherung', 'Umfassende Produktpalette', 'Marketing-Unterstützung', 'ERGO Markenbekanntheit'] },
    { id: 5, title: 'Trainee Vertrieb', city: 'Köln', region: 'nrw', type: 'Einstieg', requirements: 'Vertriebsaffinität, Kommunikationsstärke, Lernbereitschaft — IHK §34d wird im Programm erworben', description: 'Unser Trainee-Programm bietet Ihnen den idealen Einstieg in den Versicherungsvertrieb bei ERGO. In 6 Monaten werden Sie systematisch auf Ihre zukünftige Rolle als Vertriebspartner vorbereitet — inklusive IHK-Sachkundeprüfung.\n\nIhre Aufgaben:\n- Teilnahme am strukturierten Ausbildungsprogramm (Theorie und Praxis)\n- Begleitung erfahrener Vertriebspartner im Tagesgeschäft\n- Erwerb der IHK-Sachkundeprüfung §34d (Kosten werden übernommen)\n- Erste eigene Kundenberatungen unter Anleitung eines Mentors\n- Aufbau eines eigenen Kundenportfolios ab dem 4. Monat\n\nWas wir erwarten:\n- Ausgeprägte Vertriebsaffinität und Kommunikationsstärke\n- Hohe Lernbereitschaft und Eigeninitiative\n- Abgeschlossene kaufmännische Ausbildung oder vergleichbar\n- Freude am Umgang mit Menschen und Beratungssituationen', benefits: ['Garantierte Vergütung während der Ausbildung', 'IHK-Prüfung inklusive', 'Persönlicher Mentor', 'Übernahmegarantie bei Erfolg', 'Karriereperspektive Agenturleitung'] },
    { id: 6, title: 'Vertriebspartner Sach/HUK', city: 'Bonn', region: 'nrw', type: 'Vertrieb', requirements: 'IHK §34d, Erfahrung Sachversicherung, Bedarfsanalyse-Kompetenz', description: 'Als Vertriebspartner/in Sach/HUK sind Sie spezialisiert auf Sachversicherungen, Haftpflicht-, Unfall- und Kfz-Versicherungen. Sie beraten Privat- und Gewerbekunden in Bonn und Umgebung.\n\nIhre Aufgaben:\n- Beratung und Verkauf von Sach-, Haftpflicht-, Unfall- und Kfz-Versicherungen\n- Durchführung von Bedarfsanalysen und Deckungskonzepten\n- Betreuung und Ausbau eines bestehenden Kundenportfolios\n- Schadenmanagement und Unterstützung bei der Schadenregulierung\n- Cross-Selling in weitere ERGO Produktsparten\n\nWas wir erwarten:\n- IHK-Qualifikation nach §34d GewO\n- Erfahrung im Bereich Sachversicherung und Kompositgeschäft\n- Kompetenz in der Bedarfsanalyse und Risikoeinschätzung\n- Kundenorientierung und serviceorientiertes Arbeiten', benefits: ['Attraktive Provisionsregelung', 'Bestandsübernahme möglich', 'Digitale Beratungstools', 'Weiterbildungsangebote', 'Betriebliche Altersvorsorge'] },
    { id: 7, title: 'Bezirksdirektor', city: 'Münster', region: 'nrw', type: 'Führung', requirements: 'Fachwirt/Betriebswirt DVA, 8+ Jahre Vertrieb, Führung >5 MA, strategisches Denken', description: 'Als Bezirksdirektor/in übernehmen Sie die strategische und operative Verantwortung für mehrere ERGO Agenturen in der Region Münster/Münsterland. Sie steuern den Vertrieb, entwickeln Ihre Führungskräfte und verantworten die Zielerreichung Ihres Bezirks.\n\nIhre Aufgaben:\n- Strategische Leitung eines Vertriebsbezirks mit mehreren Agenturen\n- Führung und Entwicklung von Agenturleitern und Vertriebspartnern\n- Verantwortung für Umsatz-, Bestands- und Neugeschäftsziele\n- Rekrutierung und Onboarding neuer Vertriebspartner\n- Regionale Marktanalyse und Entwicklung von Vertriebsstrategien\n\nWas wir erwarten:\n- Mindestens 8 Jahre Erfahrung im Versicherungsvertrieb\n- Nachgewiesene Führungserfahrung über mindestens 5 Mitarbeiter\n- Fachwirt oder Betriebswirt DVA (oder vergleichbar)\n- Strategisches Denkvermögen und unternehmerische Kompetenz', benefits: ['Überdurchschnittliches Fixgehalt + Tantiemen', 'Firmenwagen der Oberklasse', 'Betriebliche Altersvorsorge', 'Managemententwicklungsprogramm', 'Breiter Gestaltungsspielraum'] },
    { id: 8, title: 'Kundenberater Innendienst', city: 'Hamburg', region: 'nord', type: 'Beratung', requirements: 'Kaufm. Ausbildung, Kommunikationsstärke, Versicherungskenntnisse', description: 'Als Kundenberater/in im Innendienst sind Sie die erste Ansprechperson für unsere Kunden in Hamburg. Sie beraten telefonisch und digital zu allen Versicherungsfragen und unterstützen unsere Agenturen im Tagesgeschäft.\n\nIhre Aufgaben:\n- Telefonische und digitale Kundenberatung zu allen Versicherungssparten\n- Bearbeitung von Kundenanfragen, Vertragsänderungen und Angebotserstellung\n- Unterstützung der Außendienst-Agenturen bei Serviceanliegen\n- Terminvereinbarung und Vorbereitung für Beratungsgespräche\n- Dokumentation und Pflege der Kundendaten im CRM-System\n\nWas wir erwarten:\n- Abgeschlossene kaufmännische Ausbildung, idealerweise Versicherungskaufmann/-frau\n- Ausgeprägte Kommunikationsstärke und Serviceorientierung\n- Grundlegende Versicherungskenntnisse\n- Sicherer Umgang mit digitalen Tools und CRM-Systemen', benefits: ['Festes Gehalt mit Bonuskomponente', 'Flexible Arbeitszeiten', 'Home-Office möglich', 'Betriebliche Altersvorsorge', '30 Tage Urlaub'] }
];

const HP_DISTANCES = {
    'Düsseldorf': { 'Düsseldorf': 0, 'Köln': 40, 'Essen': 30, 'Dortmund': 60, 'Bonn': 75, 'Münster': 125, 'Hamburg': 410 },
    'Köln': { 'Düsseldorf': 40, 'Köln': 0, 'Essen': 65, 'Dortmund': 90, 'Bonn': 30, 'Münster': 150, 'Hamburg': 430 },
    'Flensburg': { 'Düsseldorf': 530, 'Köln': 570, 'Essen': 500, 'Dortmund': 470, 'Bonn': 600, 'Münster': 400, 'Hamburg': 155 },
    'Essen': { 'Düsseldorf': 30, 'Köln': 65, 'Essen': 0, 'Dortmund': 35, 'Bonn': 95, 'Münster': 100, 'Hamburg': 390 },
    'Bonn': { 'Düsseldorf': 75, 'Köln': 30, 'Essen': 95, 'Dortmund': 120, 'Bonn': 0, 'Münster': 180, 'Hamburg': 460 },
    'Dortmund': { 'Düsseldorf': 60, 'Köln': 90, 'Essen': 35, 'Dortmund': 0, 'Bonn': 120, 'Münster': 65, 'Hamburg': 360 },
    'Hamburg': { 'Düsseldorf': 410, 'Köln': 430, 'Essen': 390, 'Dortmund': 360, 'Bonn': 460, 'Münster': 290, 'Hamburg': 0 },
    'Bremen': { 'Düsseldorf': 340, 'Köln': 370, 'Essen': 310, 'Dortmund': 280, 'Bonn': 390, 'Münster': 220, 'Hamburg': 120 }
};

function getHPMatchScore(profile, position) {
    const base = profile.totalScore;
    const dist = HP_DISTANCES[profile.city]?.[position.city] || 300;
    const distPenalty = Math.min(dist / 20, 15);
    let typeBonus = 0;
    if (position.type === 'Führung' && profile.scores.vertrieb > 80) typeBonus = 5;
    if (position.type === 'Einstieg' && profile.scores.vertrieb < 70) typeBonus = 8;
    if (position.type === 'Einstieg' && base < 50) typeBonus = 5;
    return Math.max(15, Math.min(98, Math.round(base - distPenalty + typeBonus + (Math.random() * 6 - 3))));
}

function getHPMatchBadges(profile, position) {
    const badges = [];
    const dist = HP_DISTANCES[profile.city]?.[position.city] || 300;
    if (dist <= 50) badges.push({ text: 'Wohnortnähe', color: 'green' });
    if (profile.scores.branche > 70) badges.push({ text: 'Branchenerfahrung', color: 'blue' });
    if (profile.scores.vertrieb > 80) badges.push({ text: 'Vertriebserfahrung', color: 'blue' });
    if (profile.scores.softskills > 75) badges.push({ text: 'Kommunikationsstärke', color: 'green' });
    if (profile.scores.qualifikation > 80) badges.push({ text: 'IHK-qualifiziert', color: 'blue' });
    if (position.type === 'Führung' && profile.strengths.some(s => s.includes('Führung'))) badges.push({ text: 'Führungskompetenz', color: 'green' });
    if (position.type === 'Einstieg') badges.push({ text: 'Einstiegsposition', color: 'orange' });
    return badges.slice(0, 4);
}

// ========================================
// DEMO DATA - All Employer Applicants
// ========================================

const HP_ALL_APPLICANTS = [
    { ...HP_PROFILES.max, status: 'recommended', appliedDate: '2026-02-03', appliedPositionId: 1 },
    {
        id: 'miller', name: 'Susan Miller', initials: 'SM', age: 29, city: 'Berlin', region: 'berlin', appliedDate: '2026-02-16', appliedPositionId: 2,
        experience: '3 Jahre Versicherungsvertrieb (Ping An, China)', experienceYears: 3,
        education: 'MBA Finance, University of Shanghai',
        skills: ['Finanzanalyse', 'Vertrieb', 'Data Analytics', 'Kundenberatung'],
        certifications: ['MBA Finance (Shanghai)', 'Insurance License (China)'],
        insuranceFlags: {
            green: ['3J Versicherungserfahrung (Ping An)', 'MBA Finance', 'Analytische Stärke'],
            red: ['KO: Keine Deutschkenntnisse', 'Keine deutsche §34d', 'Keine IDD-Weiterbildung', 'Ausländische Qualifikation nicht anerkannt']
        },
        strengths: ['3J Versicherungserfahrung', 'MBA Finance', 'Analytische Kompetenz', 'Englisch verhandlungssicher'],
        weaknesses: ['KO: Keine Deutschkenntnisse', 'Keine deutsche §34d Qualifikation', 'Qualifikation nicht anerkannt', 'Keine IDD-Weiterbildung'],
        scores: { vertrieb: 55, branche: 40, qualifikation: 20, standort: 60, softskills: 50 },
        totalScore: 38, status: 'rejected',
        koKriterium: 'Keine Deutschkenntnisse — Für Versicherungsvertrieb in Deutschland sind Deutschkenntnisse (mind. B2) zwingend erforderlich.',
        summary: 'Internationale Versicherungserfahrung (Ping An, China) und MBA Finance. KO-Kriterium: Keine Deutschkenntnisse. Für kundennahen Versicherungsvertrieb in Deutschland sind Deutschkenntnisse (mind. B2) zwingend erforderlich. Empfehlung: Ablehnung. Bei Erwerb von Deutschkenntnissen (B2+) und IHK §34d erneute Prüfung möglich.',
        waterfall: [
            { label: '3J Versicherungserfahrung (Ping An)', points: 10, type: 'positive' },
            { label: 'MBA Finance', points: 8, type: 'positive' },
            { label: 'Analytische Kompetenz', points: 5, type: 'positive' },
            { label: 'KO: Keine Deutschkenntnisse', points: -30, type: 'negative' },
            { label: 'Keine deutsche §34d', points: -15, type: 'negative' },
            { label: 'Qualifikation nicht anerkannt', points: -10, type: 'negative' },
            { label: 'Keine IDD-Weiterbildung', points: -5, type: 'negative' }
        ],
        counterfactual: 'Bei Erwerb von Deutschkenntnissen (B2+) und Bestehen der IHK §34d-Prüfung könnte der Score von 38 auf ca. 72 steigen.',
        interviewQuestions: {
            background: [{ q: 'Beschreiben Sie Ihre Erfahrung bei Ping An Insurance in China.', why: 'Verifizierung der internationalen Versicherungserfahrung' }],
            behavioral: [{ q: 'Wie haben Sie in der Vergangenheit Sprachbarrieren im Kundenkontakt überwunden?', why: 'Umgang mit der Hauptschwäche' }],
            technical: [{ q: 'Welche Unterschiede sehen Sie zwischen dem chinesischen und deutschen Versicherungsmarkt?', why: 'Marktverständnis und Anpassungsfähigkeit' }]
        },
        skillGap: {
            dimensions: [
                { label: 'Regulatorik', current: 15, required: 80 },
                { label: 'Vertriebserfahrung', current: 55, required: 85 },
                { label: 'Spartenkenntnis', current: 30, required: 75 },
                { label: 'Digital-Kompetenz', current: 75, required: 80 },
                { label: 'Sprachkompetenz', current: 10, required: 90 }
            ],
            training: 'Voraussetzungen für erneute Prüfung: 1) Deutsch B2-Zertifikat (Goethe-Institut, ca. 12 Monate), 2) IHK §34d Sachkundeprüfung, 3) Anerkennung ausländischer Qualifikation.'
        }
    },
    { ...HP_PROFILES.sarah, status: 'review', appliedDate: '2026-02-07', appliedPositionId: 5 },
    { ...HP_PROFILES.thomas, status: 'rejected', appliedDate: '2026-01-22', appliedPositionId: 4 },
    {
        id: 'julia', name: 'Julia Hoffmann', initials: 'JH', age: 31, city: 'Essen', region: 'nrw', appliedDate: '2026-02-10', appliedPositionId: 3,
        experience: '5 Jahre Maklertätigkeit (HDI)', experienceYears: 5,
        education: 'BWL-Studium, IHK Versicherungsfachfrau, Fachwirt i.A.',
        skills: ['Maklerbetreuung', 'Verhandlung', 'Führungserfahrung', 'Courtage-Management'],
        certifications: ['IHK Versicherungsfachfrau (§34d)', 'BWL Bachelor', 'Fachwirt IHK (in Arbeit)'],
        insuranceFlags: {
            green: ['5J HDI Maklervertrieb', 'IHK §34d', 'Fachwirt in Arbeit', 'B2B-Erfahrung'],
            red: ['Kein Außendienst']
        },
        strengths: ['5J Maklertätigkeit HDI', 'IHK-qualifiziert', 'Führungserfahrung', 'Fachwirt in Arbeit'],
        weaknesses: ['Kein Außendienst-Erfahrung'],
        scores: { vertrieb: 85, branche: 88, qualifikation: 90, standort: 85, softskills: 80 },
        totalScore: 88, status: 'recommended',
        summary: '5 Jahre Erfahrung im HDI-Maklervertrieb mit IHK-Qualifikation. Fachwirt in Arbeit und Führungserfahrung machen sie zur idealen Kandidatin für die Maklerbetreuung.',
        waterfall: [
            { label: 'IHK Versicherungsfachfrau §34d', points: 18, type: 'positive' },
            { label: '5 Jahre HDI Maklervertrieb', points: 15, type: 'positive' },
            { label: 'Fachwirt IHK (in Arbeit)', points: 12, type: 'positive' },
            { label: 'B2B-Beziehungsmanagement', points: 10, type: 'positive' },
            { label: 'BWL-Studium', points: 8, type: 'positive' },
            { label: 'Kein AO-Erfahrung', points: -5, type: 'negative' }
        ],
        counterfactual: 'Nach Abschluss des Fachwirt IHK (voraussichtlich Q3 2026) steigt der Score von 88 auf 94.',
        interviewQuestions: {
            background: [{ q: 'Beschreiben Sie Ihre Erfahrung im HDI-Maklervertrieb.', why: 'Verifizierung der B2B-Vertriebserfahrung' }],
            behavioral: [{ q: 'Wie pflegen Sie langfristige Maklerbeziehungen?', why: 'Beziehungsmanagement-Kompetenz' }],
            technical: [{ q: 'Wie unterscheiden sich Courtage-Modelle bei verschiedenen Sparten?', why: 'Fachliche Tiefe im Maklergeschäft' }]
        },
        skillGap: {
            dimensions: [
                { label: 'Regulatorik', current: 88, required: 80 },
                { label: 'Vertriebserfahrung', current: 85, required: 85 },
                { label: 'Spartenkenntnis', current: 82, required: 80 },
                { label: 'Digital-Kompetenz', current: 72, required: 75 },
                { label: 'Führungskompetenz', current: 70, required: 70 }
            ],
            training: 'Fachwirt IHK abschließen (bereits in Arbeit). Minimaler Handlungsbedarf.'
        }
    },
    {
        id: 'markus', name: 'Markus Scholz', initials: 'MS', age: 38, city: 'Bonn', region: 'nrw', appliedDate: '2026-02-12', appliedPositionId: 6,
        experience: '6 Jahre Bankvertrieb (Sparkasse), §34f', experienceYears: 6,
        education: 'Bankkaufmann, Weiterbildung Finanzberatung, §34f GewO',
        skills: ['Finanzberatung', 'Kundenakquise', 'Cross-Selling', 'Anlageberatung'],
        certifications: ['Bankkaufmann (DQR 4)', '§34f GewO (Finanzanlagen)', 'Weiterbildung Finanzberatung'],
        insuranceFlags: {
            green: ['6J Bankvertrieb Sparkasse', '§34f qualifiziert', 'Cross-Selling-Erfahrung'],
            red: ['Keine §34d', 'Kein direkter Versicherungsvertrieb']
        },
        strengths: ['6J Bankvertrieb', '§34f qualifiziert', 'Finanzberatung', 'Quereinsteiger Versicherung'],
        weaknesses: ['Keine direkte Versicherungserfahrung', 'Keine §34d'],
        scores: { vertrieb: 82, branche: 65, qualifikation: 78, standort: 80, softskills: 78 },
        totalScore: 84, status: 'recommended',
        summary: '6 Jahre Bankvertriebserfahrung bei der Sparkasse mit §34f-Qualifikation. Starker Vertriebshintergrund qualifiziert ihn hervorragend als Quereinsteiger in den Versicherungsvertrieb.',
        waterfall: [
            { label: '§34f GewO (Finanzanlagen)', points: 12, type: 'positive' },
            { label: '6 Jahre Bankvertrieb', points: 14, type: 'positive' },
            { label: 'Cross-Selling-Erfahrung', points: 8, type: 'positive' },
            { label: 'Finanzberatungskompetenz', points: 10, type: 'positive' },
            { label: 'Keine §34d Qualifikation', points: -8, type: 'negative' },
            { label: 'Kein Versicherungsvertrieb', points: -6, type: 'negative' }
        ],
        counterfactual: 'Nach Erwerb der IHK-Sachkundeprüfung §34d (ca. 3 Monate) steigt der Score von 84 auf 91.',
        interviewQuestions: {
            background: [{ q: 'Warum möchten Sie von der Bank in den Versicherungsvertrieb wechseln?', why: 'Wechselmotivation bei Branchenwechsel' }],
            behavioral: [{ q: 'Wie haben Sie Cross-Selling in der Sparkasse umgesetzt?', why: 'Übertragbare Vertriebskompetenz' }],
            technical: [{ q: 'Welche Überschneidungen sehen Sie zwischen §34f und §34d?', why: 'Regulatorisches Verständnis' }]
        },
        skillGap: {
            dimensions: [
                { label: 'Regulatorik', current: 60, required: 80 },
                { label: 'Vertriebserfahrung', current: 82, required: 75 },
                { label: 'Spartenkenntnis', current: 45, required: 70 },
                { label: 'Digital-Kompetenz', current: 68, required: 65 },
                { label: 'Führungskompetenz', current: 55, required: 50 }
            ],
            training: '§34d Sachkundeprüfung (3 Monate) + Spartenkenntnis-Schulung (ERGO intern, 2 Wochen).'
        }
    },
    {
        id: 'anna', name: 'Anna Weber', initials: 'AW', age: 26, city: 'Dortmund', region: 'nrw', appliedDate: '2026-02-14', appliedPositionId: 5,
        experience: '2 Jahre Kundenservice (Telekom)', experienceYears: 2,
        education: 'Kauffrau für Büromanagement',
        skills: ['Kundenservice', 'Kommunikation', 'Problemlösung'],
        certifications: ['Kauffrau für Büromanagement (DQR 4)'],
        strengths: ['Kommunikationsstärke', 'Junges Talent', 'Serviceorientiert'],
        weaknesses: ['Wenig Vertriebserfahrung', 'Keine Branchenkenntnisse', 'Kurze Berufserfahrung'],
        scores: { vertrieb: 45, branche: 20, qualifikation: 50, standort: 78, softskills: 72 },
        totalScore: 62, status: 'review',
        summary: 'Kundenservice-Erfahrung und Kommunikationsstärke vorhanden. Für den Einstieg in den Versicherungsvertrieb wird Trainee-Programm empfohlen, um Vertriebskompetenz gezielt aufzubauen.',
        waterfall: [
            { label: 'Kaufmännische Ausbildung', points: 8, type: 'positive' },
            { label: 'Kundenservice-Erfahrung', points: 7, type: 'positive' },
            { label: 'Kommunikationsstärke', points: 6, type: 'positive' },
            { label: 'Wenig Vertriebserfahrung', points: -10, type: 'negative' },
            { label: 'Keine Branchenkenntnisse', points: -8, type: 'negative' },
            { label: 'Keine §34d', points: -6, type: 'negative' }
        ],
        counterfactual: 'ERGO Trainee-Programm (6 Monate) würde Score von 62 auf 78 steigern.'
    },
    {
        id: 'peter', name: 'Peter Müller', initials: 'PM', age: 45, city: 'Köln', region: 'nrw', appliedDate: '2026-01-28', appliedPositionId: 4,
        experience: '12 Jahre Außendienst (verschiedene Branchen)', experienceYears: 12,
        education: 'Industriekaufmann',
        skills: ['Außendienst', 'Neukundengewinnung', 'Verhandlung', 'Key Account'],
        certifications: ['Industriekaufmann (DQR 4)'],
        strengths: ['12J Außendienst', 'Neukundengewinnung', 'Verhandlungsstark'],
        weaknesses: ['Keine Versicherungsbranche', 'Häufige Arbeitgeberwechsel'],
        scores: { vertrieb: 78, branche: 30, qualifikation: 55, standort: 85, softskills: 75 },
        totalScore: 72, status: 'review',
        summary: 'Starke Akquise-Erfahrung im Außendienst. Vertriebskompetenz lässt sich gut auf den Versicherungsbereich übertragen — IHK-Sachkundeprüfung §34d wäre nächster Schritt.',
        waterfall: [
            { label: '12 Jahre Außendienst', points: 14, type: 'positive' },
            { label: 'Neukundengewinnung', points: 10, type: 'positive' },
            { label: 'Verhandlungskompetenz', points: 8, type: 'positive' },
            { label: 'Keine Versicherungsbranche', points: -10, type: 'negative' },
            { label: 'Häufige Wechsel (Red Flag)', points: -7, type: 'negative' },
            { label: 'Keine §34d', points: -6, type: 'negative' }
        ],
        counterfactual: 'IHK-Sachkundeprüfung §34d (3 Monate) + stabile Vertragslaufzeit → Score 72 auf 85.'
    },
    {
        id: 'lisa', name: 'Lisa Krause', initials: 'LK', age: 24, city: 'Düsseldorf', region: 'nrw', appliedDate: '2026-02-15', appliedPositionId: 5,
        experience: '1 Jahr Praktikum Versicherung (R+V)', experienceYears: 1,
        education: 'BWL-Studium (Bachelor), laufend IHK §34d',
        skills: ['Versicherungswissen', 'Analyse', 'Digital affin'],
        certifications: ['BWL Bachelor (DQR 6)', 'IHK §34d (in Arbeit)'],
        strengths: ['BWL-Studium', 'IHK in Arbeit', 'Digital affin', 'R+V Praktikum'],
        weaknesses: ['Nur Praktikumserfahrung', 'Berufsanfängerin'],
        scores: { vertrieb: 35, branche: 55, qualifikation: 65, standort: 90, softskills: 70 },
        totalScore: 65, status: 'review',
        summary: 'Auf gutem Weg mit laufendem IHK-Sachkundenachweis und Versicherungspraktikum bei R+V. Nach Abschluss der Qualifikation stehen attraktive Einstiegsmöglichkeiten offen.',
        waterfall: [
            { label: 'BWL-Studium (DQR 6)', points: 10, type: 'positive' },
            { label: 'R+V Praktikum', points: 8, type: 'positive' },
            { label: 'IHK §34d in Arbeit', points: 7, type: 'positive' },
            { label: 'Digital-Kompetenz', points: 5, type: 'positive' },
            { label: 'Nur Praktikumserfahrung', points: -12, type: 'negative' },
            { label: 'Berufsanfängerin', points: -8, type: 'negative' }
        ],
        counterfactual: 'Nach IHK §34d Abschluss (Q2 2026) und 1 Jahr Berufserfahrung → Score 65 auf 82.'
    },
    {
        id: 'frank', name: 'Frank Bergmann', initials: 'FB', age: 48, city: 'Hamburg', region: 'nord', appliedDate: '2026-01-15', appliedPositionId: 8,
        experience: 'Keine relevante Erfahrung, zuletzt Lagerlogistik', experienceYears: 0,
        education: 'Hauptschulabschluss, Ausbildung Lagerfachkraft',
        skills: ['Logistik', 'Organisation'],
        certifications: ['Lagerfachkraft'],
        strengths: ['Zuverlässigkeit', 'Organisationsfähigkeit'],
        weaknesses: ['Keine Vertriebserfahrung', 'Keine relevante Qualifikation', 'Lücken im Lebenslauf', 'Fehlende Nachweise'],
        scores: { vertrieb: 10, branche: 5, qualifikation: 15, standort: 45, softskills: 30 },
        totalScore: 38, status: 'rejected',
        summary: 'Profil weist derzeit keine Vertriebserfahrung und keine versicherungsrelevante Qualifikation auf. Empfehlung: Zunächst grundlegende Vertriebserfahrung sammeln und IHK-Sachkundeprüfung §34d anstreben.',
        waterfall: [
            { label: 'Zuverlässigkeit', points: 4, type: 'positive' },
            { label: 'Keine Vertriebserfahrung', points: -18, type: 'negative' },
            { label: 'Keine Qualifikation', points: -15, type: 'negative' },
            { label: 'Lücken im Lebenslauf', points: -10, type: 'negative' },
            { label: 'Fehlende IDD-Weiterbildung', points: -5, type: 'negative' }
        ],
        counterfactual: 'Quereinsteiger-Programm + Standort Hamburg → Score 38 auf maximal 55.'
    },
    {
        id: 'sabine', name: 'Sabine Richter', initials: 'SR', age: 35, city: 'Bremen', region: 'nord', appliedDate: '2026-02-01', appliedPositionId: 4,
        experience: '3 Jahre Gastgewerbe, danach 2 Jahre arbeitslos', experienceYears: 3,
        education: 'Realschulabschluss',
        skills: ['Gastronomie', 'Kundenumgang'],
        certifications: [],
        strengths: ['Kundenumgang', 'Belastbarkeit'],
        weaknesses: ['Keine Vertriebserfahrung', 'Keine kaufm. Qualifikation', 'Beschäftigungslücke', 'Fehlende Weiterbildungen'],
        scores: { vertrieb: 20, branche: 5, qualifikation: 15, standort: 35, softskills: 45 },
        totalScore: 42, status: 'rejected',
        summary: 'Erfahrung aus dem Gastgewerbe vorhanden. Für eine Tätigkeit im Versicherungsvertrieb wird Quereinsteiger-Programm mit integrierter IHK-Sachkundeprüfung §34d empfohlen.',
        waterfall: [
            { label: 'Kundenumgang', points: 5, type: 'positive' },
            { label: 'Belastbarkeit', points: 3, type: 'positive' },
            { label: 'Keine Vertriebserfahrung', points: -15, type: 'negative' },
            { label: 'Keine kaufm. Qualifikation', points: -12, type: 'negative' },
            { label: 'Beschäftigungslücke (2 J.)', points: -8, type: 'negative' },
            { label: 'Keine Weiterbildungen', points: -5, type: 'negative' }
        ],
        counterfactual: 'Quereinsteiger-Programm → Score 42 auf ca. 58. Zusätzliche kaufm. Qualifikation nötig.'
    }
];

// ========================================
// TOAST NOTIFICATIONS
// ========================================

function showHPToast(message, type = 'info') {
    const container = document.getElementById('hpToastContainer');
    if (!container) return;
    const icons = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
        warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
    };
    const toast = document.createElement('div');
    toast.className = `hp-toast ${type}`;
    toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ========================================
// ANIMATED KPI COUNTERS
// ========================================

function animateHPKPICounters() {
    document.querySelectorAll('.hp-kpi-value[data-target]').forEach(el => {
        const target = parseInt(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        const duration = 1500;
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(target * eased);
            el.textContent = current + suffix;
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    });
}

// ========================================
// SPARKLINE CHARTS
// ========================================

function drawHPSparklines() {
    const datasets = {
        hpSparkline1: [28, 31, 35, 33, 38, 42, 40, 44, 47],
        hpSparkline2: [60, 62, 64, 63, 65, 66, 67, 66, 68],
        hpSparkline3: [5, 6, 7, 8, 7, 9, 10, 11, 12],
        hpSparkline4: [42, 40, 38, 39, 37, 36, 35, 35, 34]
    };
    const colors = {
        hpSparkline1: '#0F172A',
        hpSparkline2: '#2563EB',
        hpSparkline3: '#16A34A',
        hpSparkline4: '#DC2626'
    };

    Object.entries(datasets).forEach(([id, data]) => {
        const canvas = document.getElementById(id);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const min = Math.min(...data) - 2;
        const max = Math.max(...data) + 2;
        const step = w / (data.length - 1);

        ctx.clearRect(0, 0, w, h);
        ctx.beginPath();
        ctx.strokeStyle = colors[id] || '#64748B';
        ctx.lineWidth = 1.5;
        ctx.lineJoin = 'round';

        data.forEach((v, i) => {
            const x = i * step;
            const y = h - ((v - min) / (max - min)) * h;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Dot on last point
        const lastX = (data.length - 1) * step;
        const lastY = h - ((data[data.length - 1] - min) / (max - min)) * h;
        ctx.beginPath();
        ctx.arc(lastX, lastY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = colors[id] || '#64748B';
        ctx.fill();
    });
}

// ========================================
// TYPEWRITER EFFECT
// ========================================

function hpTypewriterEffect(element, text, speed = 15) {
    element.innerHTML = '<strong>KI-Zusammenfassung:</strong> <span class="hp-typewriter-text"></span><span class="hp-typewriter-cursor"></span>';
    const textEl = element.querySelector('.hp-typewriter-text');
    const cursor = element.querySelector('.hp-typewriter-cursor');
    let i = 0;
    function type() {
        if (i < text.length) {
            textEl.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            setTimeout(() => cursor.remove(), 1500);
        }
    }
    type();
}

// ========================================
// CHATBOT RESPONSES
// ========================================

const HP_CHAT_BEWERBER_START = [
    { label: 'Welche Stellen passen zu mir?', icon: 'search', action: 'stellen_passend' },
    { label: 'Was sind die Anforderungen?', icon: 'info', action: 'anforderungen' },
    { label: 'Stellen in meiner Nähe?', icon: 'map', action: 'stellen_naehe' },
    { label: 'Warum wurde ich abgelehnt?', icon: 'alert', action: 'ablehnung' },
    { label: 'Profil verbessern?', icon: 'trending', action: 'profil_verbessern' }
];

const HP_CHAT_ARBEITGEBER_START = [
    { label: 'Pipeline-Überblick', icon: 'bar', action: 'pipeline' },
    { label: 'Top Kandidaten', icon: 'star', action: 'top_kandidaten' },
    { label: 'Kritische Bewerbungen', icon: 'alert', action: 'kritische' },
    { label: 'Absage-Mail generieren', icon: 'mail', action: 'absage_mail' },
    { label: 'Matching-Kriterien', icon: 'info', action: 'matching_kriterien' }
];

const HP_CHAT_RESPONSES = {
    stellen_passend: {
        getText: (profile) => {
            if (!profile) return 'Bitte laden Sie zuerst Ihren Lebenslauf hoch, damit ich passende Stellen identifizieren kann.';
            const matches = getHPMatchesForProfile(profile).slice(0, 3);
            let text = `Basierend auf Ihrem Profil habe ich ${matches.length} Top-Matches identifiziert:\n\n`;
            matches.forEach((m, i) => { text += `${i + 1}. ${m.position.title} ${m.position.city} - ${m.score}% Match\n`; });
            text += '\nSoll ich Ihnen mehr Details zu einer dieser Stellen zeigen?';
            return text;
        },
        followUp: [
            { label: 'Alle Stellen zeigen', icon: 'list', action: 'alle_stellen' },
            { label: 'Zurück zum Start', icon: 'home', action: 'start' }
        ]
    },
    anforderungen: {
        text: 'Für Vertriebspositionen bei ERGO gelten folgende Kernqualifikationen:\n\n- IHK-Sachkundeprüfung §34d GewO (oder Kaufmann/-frau für Versicherungen)\n- Erfahrung in Kundenberatung und Vertrieb\n- Für Führungspositionen: Fachwirt IHK (Bachelor Professional, DQR 6)\n- IDD-Weiterbildung (15 Std./Jahr Pflicht)\n\nQuereinsteiger: Unser Trainee-Programm (6 Monate) beinhaltet die IHK §34d.',
        followUp: [
            { label: 'Mein Profil prüfen', icon: 'check', action: 'stellen_passend' },
            { label: 'Quereinsteiger-Programm', icon: 'trending', action: 'quereinsteiger' },
            { label: 'Zurück zum Start', icon: 'home', action: 'start' }
        ]
    },
    stellen_naehe: {
        getText: (profile) => {
            if (!profile) return 'Bitte laden Sie zuerst Ihren Lebenslauf hoch.';
            const matches = getHPMatchesForProfile(profile).filter(m => m.distance <= 50).slice(0, 3);
            if (matches.length === 0) return `Basierend auf Ihrem Wohnort ${profile.city} gibt es leider keine Stellen im Umkreis von 50 km.`;
            let text = `Stellen im Umkreis von 50 km um ${profile.city}:\n\n`;
            matches.forEach(m => { text += `- ${m.position.title} ${m.position.city} (${m.distance} km) - ${m.score}% Match\n`; });
            return text;
        },
        followUp: [
            { label: 'Alle Stellen', icon: 'list', action: 'alle_stellen' },
            { label: 'Zurück zum Start', icon: 'home', action: 'start' }
        ]
    },
    ablehnung: {
        getText: (profile) => {
            if (!profile) return 'Bitte laden Sie zuerst Ihren Lebenslauf hoch.';
            if (!profile.rejected) return 'Ihr Profil wurde nicht abgelehnt — Sie haben passende Stellenvorschläge erhalten.';
            return 'Die KI-Analyse zeigt folgende Lücken:\n\n- Keine Vertriebserfahrung (0 von min. 2 Jahren)\n- Keine §34d GewO Qualifikation\n- Standort ohne offene Stellen\n\nEmpfehlung: Unser Quereinsteiger-Programm bietet einen strukturierten Einstieg.';
        },
        followUp: [
            { label: 'Quereinsteiger-Programm', icon: 'trending', action: 'quereinsteiger' },
            { label: 'Profil verbessern', icon: 'edit', action: 'profil_verbessern' },
            { label: 'Zurück zum Start', icon: 'home', action: 'start' }
        ]
    },
    profil_verbessern: {
        text: 'Empfehlungen zur Score-Verbesserung:\n\n1. IHK Sachkundeprüfung §34d ablegen (+15 Punkte)\n2. Vertriebserfahrung sammeln — auch branchenfremd\n3. IDD-Weiterbildung absolvieren (15 Std./Jahr Pflicht)\n4. Fachwirt IHK für Führungspositionen (DQR 6)\n\nJede dieser Maßnahmen erhöht Ihren Match-Score signifikant.',
        followUp: [
            { label: 'Quereinsteiger-Programm', icon: 'trending', action: 'quereinsteiger' },
            { label: 'Zurück zum Start', icon: 'home', action: 'start' }
        ]
    },
    quereinsteiger: {
        text: 'Das ERGO Quereinsteiger-Programm:\n\n- 6 Monate begleitete Ausbildung\n- IHK-Sachkundeprüfung §34d inklusive\n- IDD-Weiterbildung (15 Std.) integriert\n- Mentoring durch erfahrene Vertriebspartner\n- Garantierte Übernahme bei Erfolg\n\nStart: Quartalsweise in NRW und Hamburg.',
        followUp: [
            { label: 'Alle Stellen', icon: 'list', action: 'stellen_passend' },
            { label: 'Zurück zum Start', icon: 'home', action: 'start' }
        ]
    },
    alle_stellen: {
        getText: (profile) => {
            if (!profile) return 'Bitte laden Sie zuerst Ihren Lebenslauf hoch.';
            const matches = getHPMatchesForProfile(profile);
            let text = `Alle ${matches.length} Stellen:\n\n`;
            matches.forEach((m, i) => { text += `${i + 1}. ${m.position.title} ${m.position.city} - ${m.score}% (${m.distance} km)\n`; });
            return text;
        },
        followUp: [{ label: 'Zurück zum Start', icon: 'home', action: 'start' }]
    },
    pipeline: {
        text: 'Recruiting-Pipeline:\n\n- 47 Bewerbungen (+12% vs. Vormonat)\n- 12 empfohlen (Score >80)\n- 18 zur Prüfung (Score 60-80)\n- 17 Ablehnungen (Score <60)\n- Ø Score: 68 (+3 Punkte)\n- EU AI Act Status: Konform (Anhang III, Nr. 4)',
        followUp: [
            { label: 'Top 5 Kandidaten', icon: 'star', action: 'top_kandidaten' },
            { label: 'Zurück zum Start', icon: 'home', action: 'start' }
        ]
    },
    top_kandidaten: {
        text: 'Top-3 Kandidaten:\n\n1. Max Berger (92) — 8J Allianz AO, IHK §34d → Agenturleiter\n2. Julia Hoffmann (88) — 5J HDI Makler, Fachwirt i.A. → Maklerbetreuer\n3. Markus Scholz (84) — 6J Sparkasse, §34f → Vertriebsspezialist\n\nAlle 3 erfüllen die Mindestanforderungen für ihre Zielposition.',
        followUp: [
            { label: 'Detail Max Berger', icon: 'user', action: 'detail_max' },
            { label: 'Zurück zum Start', icon: 'home', action: 'start' }
        ]
    },
    kritische: {
        text: 'Bewerbungen mit Score <40:\n\n1. Thomas Wendt (31) — Verwaltung, keine §34d\n2. Frank Bergmann (38) — Lagerlogistik, keine Qualifikation\n3. Sabine Richter (42) — Gastgewerbe, Beschäftigungslücke\n\nEmpfehlung: Standardisierte Absage mit Quereinsteiger-Hinweis.',
        followUp: [
            { label: 'Absage generieren', icon: 'mail', action: 'absage_mail' },
            { label: 'Zurück zum Start', icon: 'home', action: 'start' }
        ]
    },
    absage_mail: {
        text: 'Absage-Entwurf:\n\n"Sehr geehrte/r Bewerber/in,\n\nvielen Dank für Ihr Interesse an einer Vertriebsposition bei ERGO. Nach Prüfung Ihrer Unterlagen können wir Ihre Bewerbung derzeit leider nicht berücksichtigen.\n\nWir möchten Sie auf unser Quereinsteiger-Programm hinweisen (6 Monate, IHK §34d inkl.).\n\nMit freundlichen Grüßen,\nERGO Recruiting-Team"',
        followUp: [{ label: 'Zurück zum Start', icon: 'home', action: 'start' }]
    },
    matching_kriterien: {
        text: 'KI-Score Zusammensetzung:\n\n- Vertriebserfahrung (30%) — Jahre + Vertriebskanal\n- Branchenkenntnis (25%) — Versicherung/Finanz/Bank\n- Qualifikation (20%) — §34d, IHK, Fachwirt, DQR-Stufe\n- Standort-Match (15%) — Entfernung zu offenen Stellen\n- Soft Skills (10%) — Kommunikation, Führung\n\nDie Gewichtung folgt dem EU AI Act (Anhang III) mit dokumentierter Bias-Prüfung.',
        followUp: [{ label: 'Zurück zum Start', icon: 'home', action: 'start' }]
    },
    detail_max: {
        text: 'Max Berger (34, Düsseldorf) — Score: 92\n\n- 8J Allianz AO, Bestand 2,4 Mio €\n- IHK §34d, BWL Bachelor, IDD aktuell\n- Führung: 3 MA, Cross-Selling 34%\n- Empfohlen: Agenturleiter Düsseldorf\n\nKI-Empfehlung: Sofortige Einladung.',
        followUp: [
            { label: 'Einladen', icon: 'check', action: 'top_kandidaten' },
            { label: 'Zurück zum Start', icon: 'home', action: 'start' }
        ]
    }
};

// ========================================
// MODULE LIFECYCLE
// ========================================

async function openHRPipeline() {
    const landingPage = document.getElementById('landingPage');
    if (landingPage) landingPage.style.display = 'none';
    const mainApp = document.getElementById('mainApp');
    if (mainApp) mainApp.style.display = 'none';
    ['bankenModule', 'risikoscoringModule', 'bestandsuebertragungModule', 'pmoToolboxModule'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    const cvModule = document.getElementById('hrPipelineModule');
    if (cvModule) {
        cvModule.style.display = 'block';
        if (!hpPipelineLoaded) {
            try {
                const response = await fetch('partials/hr-pipeline-module.html');
                if (response.ok) {
                    cvModule.innerHTML = await response.text();
                    hpPipelineLoaded = true;
                    initHRPipeline();
                } else {
                    cvModule.innerHTML = '<div class="error-message">Fehler beim Laden des HR Pipeline-Moduls</div>';
                }
            } catch (error) {
                console.error('Error loading HR Pipeline module:', error);
                cvModule.innerHTML = '<div class="error-message">Fehler beim Laden des HR Pipeline-Moduls</div>';
            }
        }
    }

    document.dispatchEvent(new CustomEvent('moduleChanged', { detail: { module: 'hr-pipeline', view: 'bewerber' } }));
}

function closeHRPipeline() {
    const cvModule = document.getElementById('hrPipelineModule');
    if (cvModule) cvModule.style.display = 'none';
    const chatWindow = document.getElementById('hpChatWindow');
    if (chatWindow) chatWindow.classList.remove('open');
    hpChatOpen = false;
    const landingPage = document.getElementById('landingPage');
    if (landingPage) landingPage.style.display = 'flex';
    document.dispatchEvent(new CustomEvent('moduleChanged', { detail: { module: 'main', view: 'landing' } }));
}

function initHRPipeline() {
    const dropzone = document.getElementById('hpDropzone');
    if (dropzone) {
        dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
        dropzone.addEventListener('dragleave', () => { dropzone.classList.remove('dragover'); });
        dropzone.addEventListener('drop', (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); loadHPDemoProfile('max'); });
    }
    initHPChat();
}

// ========================================
// MODE SWITCHING
// ========================================

function switchHPMode(mode) {
    hpCurrentMode = mode;
    document.querySelectorAll('.hp-mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    const bewerberSection = document.getElementById('hpBewerberMode');
    const arbeitgeberSection = document.getElementById('hpArbeitgeberMode');

    if (mode === 'bewerber') {
        if (bewerberSection) bewerberSection.style.display = 'block';
        if (arbeitgeberSection) arbeitgeberSection.classList.remove('active');
    } else {
        if (bewerberSection) bewerberSection.style.display = 'none';
        if (arbeitgeberSection) {
            arbeitgeberSection.classList.add('active');
            renderHPDashboard();
            setTimeout(() => { animateHPKPICounters(); drawHPSparklines(); }, 100);
        }
    }
    // Auto-expand chat on mode switch
    setTimeout(() => {
        const chatWindow = document.getElementById('hpChatWindow');
        if (chatWindow && !chatWindow.classList.contains('open')) {
            hpChatOpen = true;
            chatWindow.classList.add('open');
        }
    }, 300);
    initHPChat();
    document.dispatchEvent(new CustomEvent('moduleChanged', { detail: { module: 'hr-pipeline', view: mode } }));
}

// ========================================
// BEWERBER MODE
// ========================================

function handleHPUpload(event) { loadHPDemoProfile('max'); }

function loadHPDemoProfile(profileId) {
    const profile = HP_PROFILES[profileId];
    if (!profile) return;
    hpCurrentProfile = profile;

    document.getElementById('hpUploadSection').style.display = 'none';
    const loadingSection = document.getElementById('hpLoadingSection');
    loadingSection.classList.add('active');

    const bar = document.getElementById('hpLoadingBar');
    const status = document.getElementById('hpLoadingStatus');
    const steps = [
        { pct: 15, text: 'Dokument wird verarbeitet...' },
        { pct: 30, text: 'Textextraktion läuft...' },
        { pct: 50, text: 'Qualifikationen werden erkannt (§34d, IHK, Fachwirt)...' },
        { pct: 70, text: 'Versicherungs-Branchenerfahrung wird analysiert...' },
        { pct: 85, text: 'Stellenabgleich wird durchgeführt...' },
        { pct: 95, text: 'SHAP-Erklärung wird generiert...' },
        { pct: 100, text: 'Analyse abgeschlossen!' }
    ];

    let i = 0;
    const interval = setInterval(() => {
        if (i < steps.length) {
            bar.style.width = steps[i].pct + '%';
            status.textContent = steps[i].text;
            i++;
        } else {
            clearInterval(interval);
            setTimeout(() => { loadingSection.classList.remove('active'); showHPResults(profile); }, 400);
        }
    }, 350);
}

function showHPResults(profile) {
    const resultsSection = document.getElementById('hpResultsSection');
    resultsSection.classList.add('active');
    renderHPProfileCard(profile);

    const rejectionNotice = document.getElementById('hpRejectionNotice');
    if (profile.rejected) {
        rejectionNotice.classList.add('active');
        document.getElementById('hpRejectionText').textContent = profile.rejectionText;
    } else {
        rejectionNotice.classList.remove('active');
    }

    renderHPMatches(profile);
    initHPChat();
    showHPToast('KI-Analyse abgeschlossen', 'success');
}

function renderHPProfileCard(profile) {
    const card = document.getElementById('hpProfileCard');
    const scoreClass = profile.totalScore >= 80 ? 'high' : profile.totalScore >= 60 ? 'mid' : 'low';
    const circumference = Math.round(2 * Math.PI * 24);
    const offset = Math.round(circumference * (1 - profile.totalScore / 100));

    const certTags = (profile.certifications || []).map(c => `<span class="hp-tag cert">${c}</span>`).join('');
    const greenFlags = (profile.insuranceFlags?.green || []).map(f => `<span class="hp-tag flag-green">${f}</span>`).join('');
    const redFlags = (profile.insuranceFlags?.red || []).map(f => `<span class="hp-tag flag-red">${f}</span>`).join('');

    card.innerHTML = `
        <div class="hp-profile-header">
            ${profile.photo ? `<img src="${profile.photo}" alt="${profile.name}" class="hp-profile-avatar-large" style="width:56px;height:56px;border-radius:50%;object-fit:cover;">` : `<div class="hp-profile-avatar-large">${profile.initials}</div>`}
            <div class="hp-profile-info">
                <h2>${profile.name}</h2>
                <div class="hp-profile-meta">
                    <span class="hp-profile-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        ${profile.city}
                    </span>
                    <span class="hp-profile-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        ${profile.age} Jahre
                    </span>
                    <span class="hp-profile-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"></rect><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"></path></svg>
                        ${profile.experienceYears} Jahre Erfahrung
                    </span>
                </div>
            </div>
            <div class="hp-score-ring">
                <svg viewBox="0 0 56 56" width="56" height="56">
                    <circle class="score-bg" cx="28" cy="28" r="24"></circle>
                    <circle class="score-fill ${scoreClass}" cx="28" cy="28" r="24" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"></circle>
                </svg>
                <div class="hp-score-value">${profile.totalScore}%</div>
            </div>
        </div>
        <div class="hp-profile-body">
            <div class="hp-profile-section">
                <h4>Berufserfahrung</h4>
                <p style="font-size:var(--font-sm);color:var(--text-secondary);margin:0;">${profile.experience}</p>
            </div>
            <div class="hp-profile-section">
                <h4>Ausbildung & Zertifikate</h4>
                <div class="hp-tags">${certTags || `<span class="hp-tag">${profile.education}</span>`}</div>
            </div>
            <div class="hp-profile-section">
                <h4>Versicherungs-Indikatoren</h4>
                <div class="hp-tags">${greenFlags}${redFlags}</div>
            </div>
            <div class="hp-profile-section">
                <h4>Stärken-Profil</h4>
                <canvas id="hpRadarChart" class="hp-radar-container"></canvas>
            </div>
            ${profile.waterfall ? renderHPWaterfallHTML(profile.waterfall) : ''}
            <div class="hp-ki-summary" id="hpKiSummary">
                <strong>KI-Zusammenfassung:</strong> ${profile.summary}
            </div>
            ${profile.counterfactual ? `
            <div class="hp-counterfactual" style="grid-column: 1 / -1;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                <div class="hp-counterfactual-text">${profile.counterfactual}</div>
            </div>` : ''}
        </div>
    `;

    setTimeout(() => drawHPRadarChart(profile), 100);
    setTimeout(() => hpTypewriterEffect(document.getElementById('hpKiSummary'), profile.summary, 12), 200);
}

function renderHPWaterfallHTML(waterfall) {
    const maxPoints = Math.max(...waterfall.map(w => Math.abs(w.points)));
    const bars = waterfall.map(w => {
        const pct = (Math.abs(w.points) / maxPoints) * 100;
        return `<div class="hp-waterfall-bar">
            <div class="hp-waterfall-label">${w.label}</div>
            <div class="hp-waterfall-track"><div class="hp-waterfall-fill ${w.type === 'positive' ? 'positive' : 'negative'}" style="width:${pct}%"></div></div>
            <div class="hp-waterfall-value ${w.type === 'positive' ? 'positive' : 'negative'}">${w.type === 'positive' ? '+' : ''}${w.points}</div>
        </div>`;
    }).join('');
    return `<div class="hp-waterfall" style="grid-column: 1 / -1;"><h4>Score-Erklärung (SHAP-Analyse)</h4>${bars}</div>`;
}

function drawHPRadarChart(profile) {
    const canvas = document.getElementById('hpRadarChart');
    if (!canvas || typeof Chart === 'undefined') return;
    new Chart(canvas.getContext('2d'), {
        type: 'radar',
        data: {
            labels: ['Vertrieb', 'Branche', 'Qualifikation', 'Standort', 'Soft Skills'],
            datasets: [{
                label: 'Profil-Score',
                data: profile.radarData,
                backgroundColor: 'rgba(200, 16, 46, 0.1)',
                borderColor: 'rgba(200, 16, 46, 0.7)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(200, 16, 46, 0.8)',
                pointRadius: 3
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: true,
            scales: { r: { beginAtZero: true, max: 100, ticks: { stepSize: 25, font: { size: 10 }, backdropColor: 'transparent' }, pointLabels: { font: { size: 11, weight: '500' }, color: '#475569' }, grid: { color: 'rgba(0,0,0,0.06)' }, angleLines: { color: 'rgba(0,0,0,0.06)' } } },
            plugins: { legend: { display: false } },
            animation: { duration: 800, easing: 'easeOutQuart' }
        }
    });
}

// ========================================
// JOB MATCHES
// ========================================

function getHPMatchesForProfile(profile) {
    return HP_POSITIONS.map(pos => {
        const score = getHPMatchScore(profile, pos);
        const distance = HP_DISTANCES[profile.city]?.[pos.city] || 999;
        const badges = getHPMatchBadges(profile, pos);
        return { position: pos, score, distance, badges, recommended: score >= 85 && distance <= 50 };
    }).sort((a, b) => b.score - a.score);
}

function renderHPMatchCard(match, idx) {
    const scoreClass = match.score >= 80 ? 'high' : match.score >= 60 ? 'mid' : 'low';
    const circumference = Math.round(2 * Math.PI * 24);
    const offset = Math.round(circumference * (1 - match.score / 100));
    return `
        <div class="hp-match-card ${match.recommended ? 'recommended' : ''}" onclick="openHPJobDetail(${match.position.id})">
            <div class="hp-match-card-header">
                <div class="hp-match-title-area">
                    <div class="hp-match-title">
                        ${match.position.title}
                        ${match.recommended ? '<span class="hp-recommended-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Empfohlen</span>' : ''}
                    </div>
                    <div class="hp-match-location">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        ${match.position.city} <span class="hp-match-distance">(${match.distance} km)</span>
                    </div>
                </div>
                <div class="hp-score-ring">
                    <svg viewBox="0 0 56 56" width="56" height="56"><circle class="score-bg" cx="28" cy="28" r="24"></circle><circle class="score-fill ${scoreClass}" cx="28" cy="28" r="24" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"></circle></svg>
                    <div class="hp-score-value">${match.score}%</div>
                </div>
            </div>
            <div class="hp-match-badges">${match.badges.map(b => `<span class="hp-match-badge ${b.color}">${b.text}</span>`).join('')}</div>
            <button class="hp-match-expand-btn" onclick="event.stopPropagation(); toggleHPMatchDetails(${idx})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="6 9 12 15 18 9"></polyline></svg>
                Details anzeigen
            </button>
            <div class="hp-match-details" id="hpMatchDetail${idx}">
                <h4 style="font-size:var(--font-sm);font-weight:var(--font-semibold);color:var(--text-primary);margin:0 0 var(--space-2);">Anforderungsprofil</h4>
                <p style="font-size:var(--font-sm);color:var(--text-secondary);margin:0 0 var(--space-3);">${match.position.requirements}</p>
                <h4 style="font-size:var(--font-sm);font-weight:var(--font-semibold);color:var(--text-primary);margin:0 0 var(--space-2);">Stellentyp</h4>
                <p style="font-size:var(--font-sm);color:var(--text-secondary);margin:0;">${match.position.type}</p>
            </div>
        </div>`;
}

function renderHPMatches(profile) {
    const container = document.getElementById('hpMatchesList');
    container.innerHTML = getHPMatchesForProfile(profile).map((m, i) => renderHPMatchCard(m, i)).join('');
}

function toggleHPMatchDetails(idx) {
    const detail = document.getElementById('hpMatchDetail' + idx);
    if (detail) {
        detail.classList.toggle('expanded');
        const btn = detail.previousElementSibling;
        const isExpanded = detail.classList.contains('expanded');
        if (btn) btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="transform:${isExpanded ? 'rotate(180deg)' : 'none'}"><polyline points="6 9 12 15 18 9"></polyline></svg> ${isExpanded ? 'Details ausblenden' : 'Details anzeigen'}`;
    }
}

function sortHPMatches(sortBy) {
    if (!hpCurrentProfile) return;
    const container = document.getElementById('hpMatchesList');
    const matches = getHPMatchesForProfile(hpCurrentProfile);
    if (sortBy === 'distance') matches.sort((a, b) => a.distance - b.distance);
    else if (sortBy === 'region') matches.sort((a, b) => a.position.region.localeCompare(b.position.region));
    container.innerHTML = matches.map((m, i) => renderHPMatchCard(m, i)).join('');
}

function resetHPBewerber() {
    hpCurrentProfile = null;
    document.getElementById('hpUploadSection').style.display = '';
    document.getElementById('hpResultsSection').classList.remove('active');
    document.getElementById('hpLoadingSection').classList.remove('active');
    document.getElementById('hpLoadingBar').style.width = '0%';
    initHPChat();
}

// ========================================
// ARBEITGEBER MODE
// ========================================

function renderHPDashboard() {
    const grid = document.getElementById('hpApplicantGrid');
    if (!grid) return;

    grid.innerHTML = HP_ALL_APPLICANTS.map(applicant => {
        const scoreClass = applicant.totalScore >= 80 ? 'high' : applicant.totalScore >= 60 ? 'mid' : 'low';
        const statusLabel = applicant.status === 'recommended' ? 'Empfohlen' : applicant.status === 'review' ? 'Prüfen' : 'Ablehnung empfohlen';
        const isBlind = hpBlindScreening;
        const appliedPos = applicant.appliedPositionId ? HP_POSITIONS.find(p => p.id === applicant.appliedPositionId) : null;
        const appliedDateFormatted = applicant.appliedDate ? new Date(applicant.appliedDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

        return `
            <div class="hp-applicant-card ${applicant.status === 'rejected' ? 'rejection' : ''} ${isBlind ? 'blind' : ''}" data-region="${applicant.region}" data-score="${applicant.totalScore}" data-status="${applicant.status}" onclick="openHPDetail('${applicant.id}')">
                <div class="hp-applicant-score ${scoreClass}">${applicant.totalScore}</div>
                <div class="hp-applicant-info">
                    <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-1);">
                        ${!isBlind && applicant.photo ? `<img src="${applicant.photo}" alt="${applicant.name}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;flex-shrink:0;">` : ''}
                        <h4 style="margin:0">${isBlind ? 'Kandidat/in #' + applicant.id.toUpperCase() : applicant.name}</h4>
                    </div>
                    <div class="hp-applicant-location">${isBlind ? applicant.region.toUpperCase() : applicant.city + ' | ' + applicant.age + ' Jahre'}</div>
                    ${appliedPos && !isBlind ? `<div style="font-size:var(--font-xs);color:var(--text-tertiary);margin-top:var(--space-1);display:flex;align-items:center;gap:var(--space-2);flex-wrap:wrap;">
                        <span>${appliedDateFormatted}</span>
                        <span style="color:var(--border)">|</span>
                        <span class="hp-tag" style="cursor:pointer;font-size:var(--font-xs)" onclick="event.stopPropagation(); openHPJobDetail(${appliedPos.id})" title="Stellenbeschreibung anzeigen">${appliedPos.title}, ${appliedPos.city}</span>
                    </div>` : ''}
                    <div class="hp-applicant-summary">${isBlind ? anonymizeText(applicant.summary, applicant) : (applicant.summary || '')}</div>
                    <div class="hp-tags">${(applicant.strengths || []).slice(0, 3).map(s => `<span class="hp-tag">${s}</span>`).join('')}</div>
                </div>
                <div class="hp-applicant-status">
                    <span class="hp-status-badge ${applicant.status}">${statusLabel}</span>
                    ${applicant.koKriterium ? '<span class="hp-status-badge" style="background:#fef2f2;color:#DC2626;border:1px solid #fecaca;font-weight:700">Kritischer Ablehnungsgrund (&bdquo;KO&ldquo;)</span>' : ''}
                </div>
            </div>`;
    }).join('');
}

function filterHPApplicants() {
    const regionFilter = document.getElementById('hpFilterRegion').value;
    const scoreFilter = document.getElementById('hpFilterScore').value;
    const statusFilter = document.getElementById('hpFilterStatus').value;
    document.querySelectorAll('.hp-applicant-card').forEach(card => {
        let show = true;
        if (regionFilter && card.dataset.region !== regionFilter) show = false;
        if (scoreFilter) {
            const score = parseInt(card.dataset.score);
            if (scoreFilter === 'high' && score < 80) show = false;
            if (scoreFilter === 'mid' && (score < 60 || score >= 80)) show = false;
            if (scoreFilter === 'low' && score >= 60) show = false;
        }
        if (statusFilter && card.dataset.status !== statusFilter) show = false;
        card.style.display = show ? '' : 'none';
    });
}

// ========================================
// BLIND SCREENING
// ========================================

function toggleHPBlindScreening() {
    hpBlindScreening = document.getElementById('hpBlindToggle')?.checked || false;
    renderHPDashboard();
    showHPToast(hpBlindScreening ? 'Blind Screening aktiviert (AGG-konform)' : 'Blind Screening deaktiviert', 'info');
}

// ========================================
// CANDIDATE COMPARISON
// ========================================

function toggleHPCompareCandidate(id) {
    if (hpSelectedForCompare.has(id)) hpSelectedForCompare.delete(id);
    else if (hpSelectedForCompare.size < 4) hpSelectedForCompare.add(id);
    else { showHPToast('Maximal 4 Kandidaten zum Vergleich', 'warning'); return; }

    const btn = document.getElementById('hpCompareBtn');
    const count = document.getElementById('hpCompareCount');
    if (btn) btn.style.display = hpSelectedForCompare.size >= 2 ? '' : 'none';
    if (count) count.textContent = hpSelectedForCompare.size;
}

function openHPCompare() {
    if (hpSelectedForCompare.size < 2) return;
    const candidates = [...hpSelectedForCompare].map(id => HP_ALL_APPLICANTS.find(a => a.id === id)).filter(Boolean);
    const body = document.getElementById('hpCompareBody');

    const dims = ['Vertrieb', 'Branche', 'Qualifikation', 'Standort', 'Soft Skills'];
    const keys = ['vertrieb', 'branche', 'qualifikation', 'standort', 'softskills'];

    const rows = [
        { label: 'Gesamt-Score', values: candidates.map(c => c.totalScore), best: Math.max(...candidates.map(c => c.totalScore)) },
        ...keys.map((k, i) => ({ label: dims[i], values: candidates.map(c => c.scores?.[k] || 0), best: Math.max(...candidates.map(c => c.scores?.[k] || 0)) })),
        { label: 'Erfahrung', values: candidates.map(c => c.experienceYears + ' Jahre'), isText: true },
        { label: 'Standort', values: candidates.map(c => c.city), isText: true },
        { label: 'Qualifikation', values: candidates.map(c => c.education), isText: true },
        { label: 'Status', values: candidates.map(c => c.status === 'recommended' ? 'Empfohlen' : c.status === 'review' ? 'Prüfen' : 'Ablehnung'), isText: true }
    ];

    body.innerHTML = `
        <table class="hp-compare-table">
            <thead><tr><th>Kriterium</th>${candidates.map(c => `<th>${c.name}</th>`).join('')}</tr></thead>
            <tbody>${rows.map(r => `<tr><td class="hp-compare-label">${r.label}</td>${r.values.map((v, i) => {
                const isBest = !r.isText && v === r.best;
                return `<td class="${isBest ? 'hp-compare-best' : ''}">${v}</td>`;
            }).join('')}</tr>`).join('')}</tbody>
        </table>`;

    document.getElementById('hpCompareOverlay').classList.add('active');
}

function closeHPCompare() {
    document.getElementById('hpCompareOverlay')?.classList.remove('active');
}

// ========================================
// DETAIL VIEW (Enhanced with waterfall, skill gap, counterfactual)
// ========================================

function openHPDetail(applicantId) {
    const applicant = HP_ALL_APPLICANTS.find(a => a.id === applicantId);
    if (!applicant) return;
    hpCurrentDetailApplicant = applicant;

    const isBlind = hpBlindScreening;
    document.getElementById('hpDetailName').textContent = isBlind ? 'Kandidat/in #' + applicant.id.toUpperCase() : applicant.name;
    const body = document.getElementById('hpDetailBody');

    const scoreCategories = [
        { label: 'Vertriebserfahrung (30%)', value: applicant.scores?.vertrieb || 0 },
        { label: 'Branchenkenntnis (25%)', value: applicant.scores?.branche || 0 },
        { label: 'Qualifikation (20%)', value: applicant.scores?.qualifikation || 0 },
        { label: 'Standort-Match (15%)', value: applicant.scores?.standort || 0 },
        { label: 'Soft Skills (10%)', value: applicant.scores?.softskills || 0 }
    ];

    body.innerHTML = `
        <div style="display:flex;gap:var(--space-4);margin-bottom:var(--space-6);align-items:center;">
            ${!isBlind && applicant.photo ? `<img src="${applicant.photo}" alt="${applicant.name}" class="hp-profile-avatar-large" style="width:56px;height:56px;border-radius:50%;object-fit:cover;">` : `<div class="hp-profile-avatar-large">${isBlind ? '#' + applicant.id.toUpperCase().charAt(0) : applicant.initials}</div>`}
            <div>
                <div style="font-size:var(--font-lg);font-weight:var(--font-bold);color:var(--text-primary);">${isBlind ? 'Kandidat/in #' + applicant.id.toUpperCase() : applicant.name}</div>
                <div style="font-size:var(--font-sm);color:var(--text-secondary);">${isBlind ? applicant.region.toUpperCase() + ' | — Jahre | ' + applicant.experience : applicant.city + ' | ' + applicant.age + ' Jahre | ' + applicant.experience}</div>
                ${(applicant.certifications || []).length ? `<div class="hp-tags" style="margin-top:var(--space-2)">${applicant.certifications.map(c => `<span class="hp-tag cert">${c}</span>`).join('')}</div>` : ''}
                ${(() => {
                    const pos = applicant.appliedPositionId ? HP_POSITIONS.find(p => p.id === applicant.appliedPositionId) : null;
                    const dateStr = applicant.appliedDate ? new Date(applicant.appliedDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
                    return pos ? `<div style="font-size:var(--font-xs);color:var(--text-tertiary);margin-top:var(--space-2);display:flex;align-items:center;gap:var(--space-2);">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        Bewerbung vom ${dateStr}
                        <span style="color:var(--border)">|</span>
                        <span style="cursor:pointer;color:var(--primary);text-decoration:underline;" onclick="event.stopPropagation(); openHPJobDetail(${pos.id})">${pos.title}, ${pos.city}</span>
                    </div>` : '';
                })()}
            </div>
            <div class="hp-applicant-score ${applicant.totalScore >= 80 ? 'high' : applicant.totalScore >= 60 ? 'mid' : 'low'}" style="margin-left:auto;width:56px;height:56px;font-size:var(--font-lg);">${applicant.totalScore}</div>
        </div>

        <div class="hp-ki-summary" style="margin-bottom:var(--space-6);"><strong>KI-Zusammenfassung:</strong> ${isBlind ? anonymizeText(applicant.summary, applicant) : applicant.summary}</div>

        ${applicant.koKriterium ? `
        <div style="background:#fef2f2;border:2px solid #DC2626;border-radius:var(--radius-md);padding:var(--space-4) var(--space-5);margin-bottom:var(--space-6);display:flex;align-items:flex-start;gap:var(--space-3);">
            <svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2" width="24" height="24" style="flex-shrink:0;margin-top:2px"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <div>
                <div style="font-weight:700;color:#DC2626;font-size:var(--font-base);margin-bottom:var(--space-1)">Kritischer Ablehnungsgrund (&bdquo;KO&ldquo;)</div>
                <div style="color:#991b1b;font-size:var(--font-sm)">${applicant.koKriterium}</div>
            </div>
        </div>` : ''}

        ${applicant.waterfall ? renderHPWaterfallHTML(applicant.waterfall) : ''}

        <div class="hp-score-breakdown">
            <h4>Score-Aufschlüsselung</h4>
            ${scoreCategories.map(cat => {
                const barClass = cat.value >= 70 ? 'high' : cat.value >= 40 ? 'mid' : 'low';
                return `<div class="hp-score-bar-row"><div class="hp-score-bar-label">${cat.label}</div><div class="hp-score-bar-track"><div class="hp-score-bar-value ${barClass}" style="width:${cat.value}%"></div></div><div class="hp-score-bar-num">${cat.value}</div></div>`;
            }).join('')}
        </div>

        ${applicant.skillGap ? renderHPSkillGapHTML(applicant.skillGap) : ''}

        ${applicant.counterfactual ? `<div class="hp-counterfactual"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg><div class="hp-counterfactual-text">${applicant.counterfactual}</div></div>` : ''}

        <div class="hp-strengths-weaknesses" style="margin-top:var(--space-6);">
            <div class="hp-sw-section strengths"><h4>Stärken</h4><ul class="hp-sw-list">${(applicant.strengths || []).map(s => `<li><svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>${s}</li>`).join('')}</ul></div>
            <div class="hp-sw-section weaknesses"><h4>Schwächen</h4><ul class="hp-sw-list">${(applicant.weaknesses || []).map(w => `<li><svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>${w}</li>`).join('')}</ul></div>
        </div>`;

    // Show PDF button only for Max Berger (who has a CV PDF)
    const pdfBtn = document.getElementById('hpPdfBtn');
    if (pdfBtn) pdfBtn.style.display = applicant.id === 'max' ? 'inline-flex' : 'none';

    document.getElementById('hpDetailOverlay').classList.add('active');
}

function renderHPSkillGapHTML(skillGap) {
    const rows = skillGap.dimensions.map(d => {
        const gap = Math.max(0, d.required - d.current);
        const color = gap > 0 ? '#DC2626' : '#16A34A';
        return `<div class="hp-skill-gap-row">
            <div class="hp-skill-gap-label">${d.label}</div>
            <div class="hp-skill-gap-bars">
                <div class="hp-skill-gap-current" style="width:${d.current}%"></div>
                <div class="hp-skill-gap-required" style="left:${d.required}%" title="Anforderung: ${d.required}%"></div>
            </div>
            <div class="hp-skill-gap-pct" style="color:${color}">${gap > 0 ? '-' + gap + '%' : 'OK'}</div>
        </div>`;
    }).join('');
    return `<div class="hp-skill-gap"><h4>Skill-Gap-Analyse (Ist vs. Soll)</h4>${rows}${skillGap.training ? `<div class="hp-training-rec"><strong>Weiterbildungsempfehlung:</strong> ${skillGap.training}</div>` : ''}</div>`;
}

function closeHPDetail() {
    document.getElementById('hpDetailOverlay')?.classList.remove('active');
    const panel = document.getElementById('hpDetailPanel');
    const cvPane = document.getElementById('hpDetailCV');
    const iframe = document.getElementById('hpPdfFrame');
    if (panel) panel.classList.remove('side-by-side');
    if (cvPane) cvPane.classList.remove('visible');
    if (iframe) iframe.src = '';
}

function hpDetailAction(action) {
    const name = hpCurrentDetailApplicant?.name || 'Kandidat';
    if (action === 'merken') { showHPToast(`${name} wurde vorgemerkt`, 'info'); return; }

    if (action === 'einladen') {
        showHPActionWorkflow('einladen');
    } else if (action === 'ablehnen') {
        showHPActionWorkflow('ablehnen');
    }
}

function showHPActionWorkflow(type) {
    const applicant = hpCurrentDetailApplicant;
    const name = applicant?.name || 'Kandidat';
    const actionsDiv = document.querySelector('.hp-detail-actions');
    if (!actionsDiv) return;

    if (type === 'einladen') {
        actionsDiv.innerHTML = `
            <div class="hp-workflow-panel">
                <div class="hp-workflow-header">
                    <h4>Einladung für ${name}</h4>
                    <button class="hp-workflow-close" onclick="resetHPDetailActions()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>

                <div class="hp-workflow-step">
                    <label class="hp-workflow-label">Gesprächsformat</label>
                    <div class="hp-workflow-options" id="hpInviteType">
                        <button class="hp-workflow-option selected" data-value="video" onclick="hpSelectOption(this)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                            Video-Interview
                        </button>
                        <button class="hp-workflow-option" data-value="telefon" onclick="hpSelectOption(this)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                            Telefoninterview
                        </button>
                        <button class="hp-workflow-option" data-value="vor-ort" onclick="hpSelectOption(this)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            Vor-Ort-Gespräch
                        </button>
                    </div>
                </div>

                <div class="hp-workflow-step">
                    <label class="hp-workflow-label">Terminvorschlag</label>
                    <div class="hp-workflow-options" id="hpInviteDate">
                        ${generateHPDateOptions().map((d, i) => `<button class="hp-workflow-option${i === 0 ? ' selected' : ''}" data-value="${d.value}" onclick="hpSelectOption(this)">${d.label}</button>`).join('')}
                    </div>
                </div>

                <div class="hp-workflow-step">
                    <label class="hp-workflow-label">Interviewer</label>
                    <div class="hp-workflow-options" id="hpInviteInterviewer">
                        <button class="hp-workflow-option selected" data-value="mueller" onclick="hpSelectOption(this)">
                            <span class="hp-workflow-avatar">SM</span>
                            Sandra Müller<span class="hp-workflow-role">Teamleiterin Recruiting</span>
                        </button>
                        <button class="hp-workflow-option" data-value="fischer" onclick="hpSelectOption(this)">
                            <span class="hp-workflow-avatar">MF</span>
                            Martin Fischer<span class="hp-workflow-role">Abteilungsleiter Vertrieb</span>
                        </button>
                        <button class="hp-workflow-option" data-value="schmidt" onclick="hpSelectOption(this)">
                            <span class="hp-workflow-avatar">KS</span>
                            Katrin Schmidt<span class="hp-workflow-role">HR Business Partner</span>
                        </button>
                    </div>
                </div>

                <div class="hp-workflow-step">
                    <label class="hp-workflow-label">Notiz an den Kandidaten</label>
                    <textarea class="hp-workflow-textarea" id="hpInviteNote" placeholder="Optionale Nachricht zur Einladung..." rows="2"></textarea>
                </div>

                <div class="hp-workflow-actions">
                    <button class="hp-action-btn" onclick="resetHPDetailActions()">Abbrechen</button>
                    <button class="hp-action-btn primary" onclick="confirmHPInvite()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4z"/></svg>
                        Einladung senden
                    </button>
                </div>
            </div>`;
    } else if (type === 'ablehnen') {
        actionsDiv.innerHTML = `
            <div class="hp-workflow-panel rejection">
                <div class="hp-workflow-header">
                    <h4>Absage für ${name}</h4>
                    <button class="hp-workflow-close" onclick="resetHPDetailActions()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>

                <div class="hp-workflow-step">
                    <label class="hp-workflow-label">Ablehnungsgrund</label>
                    <div class="hp-workflow-options vertical" id="hpRejectReason">
                        <button class="hp-workflow-option selected" data-value="qualifikation" onclick="hpSelectOption(this)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            Qualifikation nicht ausreichend
                        </button>
                        <button class="hp-workflow-option" data-value="branche" onclick="hpSelectOption(this)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
                            Fehlende Branchenerfahrung
                        </button>
                        <button class="hp-workflow-option" data-value="standort" onclick="hpSelectOption(this)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            Standort nicht passend
                        </button>
                        <button class="hp-workflow-option" data-value="besetzt" onclick="hpSelectOption(this)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>
                            Position bereits besetzt
                        </button>
                        <button class="hp-workflow-option" data-value="ko" onclick="hpSelectOption(this)">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                            Kritischer Ablehnungsgrund
                        </button>
                    </div>
                </div>

                <div class="hp-workflow-step">
                    <label class="hp-workflow-label">E-Mail-Vorlage</label>
                    <div class="hp-workflow-options" id="hpRejectTemplate">
                        <button class="hp-workflow-option selected" data-value="standard" onclick="hpSelectOption(this); hpUpdateRejectPreview()">
                            Standard-Absage
                        </button>
                        <button class="hp-workflow-option" data-value="talentpool" onclick="hpSelectOption(this); hpUpdateRejectPreview()">
                            Absage + Talent-Pool
                        </button>
                        <button class="hp-workflow-option" data-value="empfehlung" onclick="hpSelectOption(this); hpUpdateRejectPreview()">
                            Absage + Empfehlung
                        </button>
                    </div>
                </div>

                <div class="hp-workflow-step">
                    <label class="hp-workflow-label">Vorschau</label>
                    <div class="hp-workflow-preview" id="hpRejectPreview">
                        ${getHPRejectPreview('standard', name)}
                    </div>
                </div>

                <div class="hp-workflow-actions">
                    <button class="hp-action-btn" onclick="resetHPDetailActions()">Abbrechen</button>
                    <button class="hp-action-btn danger" onclick="confirmHPReject()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4z"/></svg>
                        Absage senden
                    </button>
                </div>
            </div>`;
    }
}

function hpSelectOption(btn) {
    const group = btn.parentElement;
    group.querySelectorAll('.hp-workflow-option').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function generateHPDateOptions() {
    const options = [];
    const now = new Date();
    const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const times = ['10:00', '14:00', '11:00'];
    let count = 0;
    for (let i = 1; count < 3; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() + i);
        if (d.getDay() === 0 || d.getDay() === 6) continue;
        options.push({
            value: d.toISOString().split('T')[0],
            label: `${dayNames[d.getDay()]}, ${d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} · ${times[count]} Uhr`
        });
        count++;
    }
    return options;
}

function getHPRejectPreview(template, name) {
    const templates = {
        standard: `Sehr geehrte/r ${name},\n\nvielen Dank für Ihre Bewerbung und Ihr Interesse an ERGO. Nach sorgfältiger Prüfung müssen wir Ihnen leider mitteilen, dass wir uns für andere Kandidat/innen entschieden haben.\n\nWir wünschen Ihnen für Ihre berufliche Zukunft alles Gute.\n\nMit freundlichen Grüßen\nERGO Recruiting Team`,
        talentpool: `Sehr geehrte/r ${name},\n\nvielen Dank für Ihre Bewerbung. Leider können wir Ihnen aktuell keine passende Position anbieten. Ihr Profil hat uns jedoch überzeugt — wir möchten Sie gerne in unseren Talent-Pool aufnehmen und Sie kontaktieren, sobald eine geeignete Stelle frei wird.\n\nMit freundlichen Grüßen\nERGO Recruiting Team`,
        empfehlung: `Sehr geehrte/r ${name},\n\nvielen Dank für Ihre Bewerbung. Für die ausgeschriebene Position können wir Ihnen leider kein Angebot machen. Wir empfehlen Ihnen jedoch, sich auf andere offene Stellen in unserem Karriereportal umzusehen, die besser zu Ihrem Profil passen könnten.\n\nMit freundlichen Grüßen\nERGO Recruiting Team`
    };
    return `<div class="hp-email-preview">${(templates[template] || templates.standard).replace(/\n/g, '<br>')}</div>`;
}

function hpUpdateRejectPreview() {
    const name = hpCurrentDetailApplicant?.name || 'Kandidat';
    const selected = document.querySelector('#hpRejectTemplate .hp-workflow-option.selected');
    const template = selected?.dataset.value || 'standard';
    const preview = document.getElementById('hpRejectPreview');
    if (preview) preview.innerHTML = getHPRejectPreview(template, name);
}

function confirmHPInvite() {
    const name = hpCurrentDetailApplicant?.name || 'Kandidat';
    const type = document.querySelector('#hpInviteType .selected')?.dataset.value || 'video';
    const date = document.querySelector('#hpInviteDate .selected')?.textContent.trim() || '';
    const interviewer = document.querySelector('#hpInviteInterviewer .selected')?.textContent.trim().split('\n')[0] || '';
    const typeLabels = { video: 'Video-Interview', telefon: 'Telefoninterview', 'vor-ort': 'Vor-Ort-Gespräch' };
    showHPToast(`${typeLabels[type]} mit ${name} geplant: ${date}`, 'success');
    closeHPDetail();
}

function confirmHPReject() {
    const name = hpCurrentDetailApplicant?.name || 'Kandidat';
    const template = document.querySelector('#hpRejectTemplate .selected')?.dataset.value || 'standard';
    const templateLabels = { standard: 'Standard-Absage', talentpool: 'Absage mit Talent-Pool-Aufnahme', empfehlung: 'Absage mit Stellenempfehlung' };
    showHPToast(`${templateLabels[template]} an ${name} gesendet`, 'warning');
    closeHPDetail();
}

function resetHPDetailActions() {
    const actionsDiv = document.querySelector('.hp-detail-actions');
    if (!actionsDiv) return;
    actionsDiv.innerHTML = `
        <button class="hp-action-btn primary" onclick="hpDetailAction('einladen')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Einladen
        </button>
        <button class="hp-action-btn danger" onclick="hpDetailAction('ablehnen')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
            Ablehnen
        </button>
        <button class="hp-action-btn" onclick="hpDetailAction('merken')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"></path></svg>
            Merken
        </button>
        <button class="hp-action-btn" onclick="generateHPInterviewQuestions()" title="KI-generierte Interviewfragen">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            Interviewfragen
        </button>`;
}

// ========================================
// INTERVIEW QUESTIONS
// ========================================

function generateHPInterviewQuestions() {
    const applicant = hpCurrentDetailApplicant;
    if (!applicant || !applicant.interviewQuestions) {
        showHPToast('Keine Interviewfragen für diesen Kandidaten verfügbar', 'warning');
        return;
    }

    const body = document.getElementById('hpInterviewBody');
    const categories = [
        { key: 'background', title: 'Hintergrund-Verifizierung' },
        { key: 'behavioral', title: 'Verhaltens-/STAR-Fragen' },
        { key: 'technical', title: 'Fachliche Fragen' }
    ];

    body.innerHTML = `
        <div style="margin-bottom:var(--space-4);padding:var(--space-3) var(--space-4);background:var(--gray-50);border-radius:var(--radius-md);font-size:var(--font-sm);color:var(--text-secondary);">
            KI-generierte Interviewfragen für <strong>${applicant.name}</strong> (Score: ${applicant.totalScore}) — basierend auf CV-Analyse und Zielposition.
        </div>
        ${categories.map(cat => {
            const questions = applicant.interviewQuestions[cat.key];
            if (!questions || !questions.length) return '';
            return `<div class="hp-interview-category"><h4>${cat.title}</h4>${questions.map(q => `
                <div class="hp-interview-question">${q.q}<div class="hp-interview-why">Warum diese Frage: ${q.why}</div></div>
            `).join('')}</div>`;
        }).join('')}`;

    document.getElementById('hpInterviewOverlay').classList.add('active');
    showHPToast('Interviewfragen generiert', 'success');
}

function closeHPInterviewQuestions() {
    document.getElementById('hpInterviewOverlay')?.classList.remove('active');
}

// ========================================
// JOB DETAIL OVERLAY
// ========================================

function openHPJobDetail(positionId) {
    const position = HP_POSITIONS.find(p => p.id === positionId);
    if (!position) return;

    const overlay = document.getElementById('hpJobDetailOverlay');
    const titleEl = document.getElementById('hpJobDetailTitle');
    const body = document.getElementById('hpJobDetailBody');

    titleEl.textContent = position.title;

    const descriptionHTML = (position.description || '').replace(/\n/g, '<br>');

    body.innerHTML = `
        <div class="hp-job-detail-meta">
            <div class="hp-job-detail-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                ${position.city}
            </div>
            <div class="hp-job-detail-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"></path></svg>
                ${position.type}
            </div>
            <div class="hp-job-detail-meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Vollzeit
            </div>
        </div>

        <div class="hp-job-detail-section">
            <h4>Stellenbeschreibung</h4>
            <div class="hp-job-detail-description">${descriptionHTML}</div>
        </div>

        <div class="hp-job-detail-section">
            <h4>Anforderungen</h4>
            <p style="font-size: var(--font-sm); color: var(--text-secondary); line-height: var(--leading-relaxed);">${position.requirements}</p>
        </div>

        ${position.benefits && position.benefits.length ? `
        <div class="hp-job-detail-section">
            <h4>Wir bieten</h4>
            <ul class="hp-job-benefits">
                ${position.benefits.map(b => `
                    <li class="hp-job-benefit-tag">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ${b}
                    </li>
                `).join('')}
            </ul>
        </div>` : ''}
    `;

    overlay.classList.add('active');
}

function closeHPJobDetail() {
    const overlay = document.getElementById('hpJobDetailOverlay');
    if (overlay) overlay.classList.remove('active');
}

// ========================================
// CHATBOT
// ========================================

function initHPChat() {
    const messagesContainer = document.getElementById('hpChatMessages');
    const buttonsContainer = document.getElementById('hpChatButtons');
    if (!messagesContainer || !buttonsContainer) return;
    messagesContainer.innerHTML = '';
    buttonsContainer.innerHTML = '';
    addHPChatBubble('bot', 'Hallo! Ich bin der ERGO KI-Recruiting-Assistent. Wie kann ich Ihnen helfen?');
    renderHPChatButtons(hpCurrentMode === 'bewerber' ? HP_CHAT_BEWERBER_START : HP_CHAT_ARBEITGEBER_START);
}

function toggleHPChat() {
    const w = document.getElementById('hpChatWindow');
    if (!w) return;
    hpChatOpen = !hpChatOpen;
    w.classList.toggle('open', hpChatOpen);
}

function addHPChatBubble(type, text) {
    const container = document.getElementById('hpChatMessages');
    if (!container) return;
    const bubble = document.createElement('div');
    bubble.className = `hp-chat-bubble ${type}`;
    bubble.innerHTML = text.replace(/\n- /g, '\n<li>').replace(/\n\d+\. /g, (m) => '\n<li>' + m.trim().replace(/^\d+\. /, '')).replace(/\n/g, '<br>');
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
}

function showHPTypingIndicator() {
    const container = document.getElementById('hpChatMessages');
    if (!container) return;
    const typing = document.createElement('div');
    typing.className = 'hp-chat-typing';
    typing.id = 'hpTypingIndicator';
    typing.innerHTML = '<span></span><span></span><span></span>';
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;
}

function removeHPTypingIndicator() {
    document.getElementById('hpTypingIndicator')?.remove();
}

function renderHPChatButtons(buttons) {
    const container = document.getElementById('hpChatButtons');
    if (!container) return;
    const iconMap = {
        search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
        map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
        alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
        trending: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>',
        bar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
        star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
        mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22 6 12 13 2 6"></polyline></svg>',
        home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
        list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>',
        check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
        edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',
        user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
    };
    container.innerHTML = buttons.map(btn => `<button class="hp-chat-btn" onclick="hpChatAction('${btn.action}')">${iconMap[btn.icon] || ''}${btn.label}</button>`).join('');
}

function hpChatAction(action) {
    if (action === 'start') { initHPChat(); return; }
    const response = HP_CHAT_RESPONSES[action];
    if (!response) return;

    const allButtons = [...(hpCurrentMode === 'bewerber' ? HP_CHAT_BEWERBER_START : HP_CHAT_ARBEITGEBER_START)];
    Object.values(HP_CHAT_RESPONSES).forEach(r => { if (r.followUp) allButtons.push(...r.followUp); });
    const clicked = allButtons.find(b => b.action === action);
    if (clicked) addHPChatBubble('user', clicked.label);

    // Also filter in the dashboard when relevant chat actions are triggered
    if (action === 'top_kandidaten' && hpCurrentMode === 'arbeitgeber') {
        const statusFilter = document.getElementById('hpFilterStatus');
        if (statusFilter) { statusFilter.value = 'recommended'; filterHPApplicants(); }
    } else if (action === 'kritische' && hpCurrentMode === 'arbeitgeber') {
        const statusFilter = document.getElementById('hpFilterStatus');
        if (statusFilter) { statusFilter.value = 'rejected'; filterHPApplicants(); }
    }

    showHPTypingIndicator();
    setTimeout(() => {
        removeHPTypingIndicator();
        const text = typeof response.getText === 'function' ? response.getText(hpCurrentProfile) : response.text;
        addHPChatBubble('bot', text);
        if (response.followUp) renderHPChatButtons(response.followUp);
    }, 800 + Math.random() * 400);
}

// ========================================
// GLOBAL EXPORTS
// ========================================

// ========================================
// FILTER BY RECOMMENDED (KPI Card Click)
// ========================================

function filterHPByRecommended() {
    const statusFilter = document.getElementById('hpFilterStatus');
    if (!statusFilter) return;

    // Toggle filter
    if (statusFilter.value === 'recommended') {
        statusFilter.value = '';
        document.querySelector('.hp-kpi-card.clickable')?.classList.remove('active-filter');
    } else {
        statusFilter.value = 'recommended';
        document.querySelector('.hp-kpi-card.clickable')?.classList.add('active-filter');
    }
    filterHPApplicants();
    showHPToast(statusFilter.value === 'recommended' ? 'Gefiltert: Empfohlene Kandidaten' : 'Filter zurückgesetzt', 'info');
}

// ========================================
// SIDE-BY-SIDE CV PREVIEW
// ========================================

function toggleHPSideBySide() {
    const applicant = hpCurrentDetailApplicant;
    if (!applicant || applicant.id !== 'max') return;

    const panel = document.getElementById('hpDetailPanel');
    const cvPane = document.getElementById('hpDetailCV');
    const iframe = document.getElementById('hpPdfFrame');
    const btnText = document.getElementById('hpPdfBtnText');

    if (cvPane.classList.contains('visible')) {
        cvPane.classList.remove('visible');
        panel.classList.remove('side-by-side');
        if (iframe) iframe.src = '';
        if (btnText) btnText.textContent = 'Original-CV';
    } else {
        if (iframe) iframe.src = 'cv/max-berger-cv.html';
        cvPane.classList.add('visible');
        panel.classList.add('side-by-side');
        if (btnText) btnText.textContent = 'CV ausblenden';

        // In blind mode: hide photo and name in the CV iframe
        if (hpBlindScreening && iframe) {
            iframe.onload = function() {
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    const style = iframeDoc.createElement('style');
                    style.textContent = `
                        .cv-photo-wrapper { position: relative; }
                        .cv-photo { filter: blur(20px) brightness(0.7) !important; }
                        .cv-photo-wrapper::after {
                            content: 'ANONYMISIERT';
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            background: rgba(200,16,46,0.9);
                            color: white;
                            padding: 8px 16px;
                            border-radius: 8px;
                            font-size: 11px;
                            font-weight: 700;
                            letter-spacing: 2px;
                            pointer-events: none;
                        }
                        .cv-name, .cv-footer { visibility: hidden !important; }
                        .cv-name::after {
                            content: 'Kandidat/in #MAX';
                            visibility: visible;
                            display: block;
                        }
                    `;
                    iframeDoc.head.appendChild(style);
                } catch(e) { /* cross-origin fallback */ }
            };
        }
    }
}

window.openHRPipeline = openHRPipeline;
window.closeHRPipeline = closeHRPipeline;
window.switchHPMode = switchHPMode;
window.handleHPUpload = handleHPUpload;
window.loadHPDemoProfile = loadHPDemoProfile;
window.resetHPBewerber = resetHPBewerber;
window.toggleHPMatchDetails = toggleHPMatchDetails;
window.sortHPMatches = sortHPMatches;
window.filterHPApplicants = filterHPApplicants;
window.filterHPByRecommended = filterHPByRecommended;
window.openHPDetail = openHPDetail;
window.closeHPDetail = closeHPDetail;
window.hpDetailAction = hpDetailAction;
window.toggleHPChat = toggleHPChat;
window.hpChatAction = hpChatAction;
window.toggleHPBlindScreening = toggleHPBlindScreening;
window.toggleHPCompareCandidate = toggleHPCompareCandidate;
window.openHPCompare = openHPCompare;
window.closeHPCompare = closeHPCompare;
window.generateHPInterviewQuestions = generateHPInterviewQuestions;
window.closeHPInterviewQuestions = closeHPInterviewQuestions;
window.toggleHPSideBySide = toggleHPSideBySide;
window.openHPJobDetail = openHPJobDetail;
window.closeHPJobDetail = closeHPJobDetail;
