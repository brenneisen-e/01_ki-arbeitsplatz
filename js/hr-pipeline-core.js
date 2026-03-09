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
        photo: 'assets/images/AdobeStock_624564221.jpeg',
        age: 34,
        city: 'Düsseldorf',
        region: 'nrw',
        experience: '8 Jahre Versicherungsvertrieb (Allianz AO)',
        experienceYears: 8,
        education: 'BWL-Studium (B.A.), IHK Versicherungsfachmann',
        skills: ['Kundenakquise', 'Bestandsmanagement', 'Führungserfahrung', 'Vertriebssteuerung', 'Kundenbindung'],
        certifications: ['IHK Versicherungsfachmann (§34d)', 'BWL Bachelor (DQR 6)', 'IDD Weiterbildung 2024'],
        insuranceFlags: {
            green: ['8J Allianz AO-Erfahrung', 'IHK §34d qualifiziert', 'Bestandsgröße 2.4 Mio €', 'Ø 115% Zielerreichung'],
            red: ['Kein Fachwirt IHK'],
            neutral: ['Keine ERGO-Erfahrung']
        },
        strengths: ['Kundenakquise', 'Bestandsmanagement', 'Führungserfahrung (3 MA)', 'IHK-qualifiziert', 'Allianz AO-Erfahrung'],
        weaknesses: ['Kein Fachwirt IHK'],
        neutrals: ['Keine ERGO-Erfahrung'],
        scores: { vertrieb: 95, branche: 90, qualifikation: 88, standort: 92, softskills: 85 },
        totalScore: 92,
        summary: '8 Jahre fundierte Vertriebserfahrung in der Allianz Ausschließlichkeitsorganisation. IHK-Qualifikation nach §34d, nachgewiesene Führungskompetenz über 3 Mitarbeiter und Bestandsvolumen von 2,4 Mio €. Durchschnittliche Zielerreichung von 115% belegt überdurchschnittliche Vertriebsleistung. Idealer Kandidat für die Agenturleitung.',
        radarData: [95, 90, 88, 92, 85],
        waterfall: [
            { label: 'IHK Versicherungsfachmann §34d', points: 18, type: 'positive' },
            { label: '8 Jahre AO-Erfahrung (Allianz)', points: 15, type: 'positive' },
            { label: 'Bestandsgröße 2,4 Mio €', points: 14, type: 'positive' },
            { label: 'Führungserfahrung (3 MA)', points: 12, type: 'positive' },
            { label: 'BWL-Studium (DQR 6)', points: 10, type: 'positive' },
            { label: 'Ø 115% Zielerreichung', points: 8, type: 'positive' },
            { label: 'IDD Weiterbildung aktuell', points: 5, type: 'positive' },
            { label: 'Standort Düsseldorf (Match)', points: 7, type: 'positive' },
            { label: 'Kein Fachwirt IHK', points: -7, type: 'negative' },
            { label: 'Keine ERGO-Erfahrung', points: -3, type: 'neutral' }
        ],
        linkedinInsights: [
            { text: 'Nebentätigkeit: Dozent IHK Düsseldorf (seit 2023)', detail: 'Hält Seminare zu Versicherungsvertrieb — im CV nicht erwähnt, zeigt Fachexpertise und Engagement' },
            { text: 'Empfohlen für „Vertriebsführung" von 12 Kontakten', detail: '520+ Kontakte im Versicherungs- und Finanzsektor bestätigen starkes Branchennetzwerk' }
        ],
        counterfactual: 'Wenn dieser Kandidat den Fachwirt für Versicherungen und Finanzen IHK (Bachelor Professional, DQR 6) abschließt, steigt sein Score von 92 auf 97. Empfehlung: DVA-Programm (24 Monate berufsbegleitend, ca. 3.500 €).',
        interviewQuestions: {
            background: [
                { q: 'Ihr CV zeigt 8 Jahre bei der Allianz AO — beschreiben Sie Ihren typischen Bestandskundenbetreuungsprozess.', why: 'Verifizierung der AO-Vertriebserfahrung und Bestandsmanagement-Kompetenz' },
                { q: 'Wie haben Sie Ihr Bestandsvolumen von 2,4 Mio € aufgebaut? Welche Akquise-Strategien waren am erfolgreichsten?', why: 'Quantifizierung der Vertriebsleistung und strategisches Denken' }
            ],
            behavioral: [
                { q: 'Erzählen Sie von einer Situation, in der Sie eine Deckungslücke bei einem Bestandskunden identifiziert haben. Wie sind Sie vorgegangen?', why: 'STAR-Methode: Bedarfsanalyse-Kompetenz und Beratungsqualität' },
                { q: 'Beschreiben Sie eine Herausforderung bei der Führung Ihres 3-köpfigen Teams. Wie haben Sie diese gelöst?', why: 'Führungskompetenz und Konfliktlösungsfähigkeit für Agenturleiter-Rolle' }
            ],
            technical: [
                { q: 'Wie würden Sie eine bAV-Beratung für ein mittelständisches Unternehmen mit 200 Mitarbeitern strukturieren?', why: 'Technisches Fachwissen und Beratungskompetenz im Firmenkundengeschäft' },
                { q: 'Welche Erfahrungen haben Sie mit BiPRO-Schnittstellen und digitalen Vergleichsrechnern?', why: 'Digitale Kompetenz — entscheidend für moderne Vertriebsprozesse' }
            ]
        },
        skillGap: {
            dimensions: [
                { label: 'Regulatorik', current: 85, required: 80, reason: 'IHK §34d vorhanden, IDD aktuell — Fachwirt fehlt für höhere Einstufung' },
                { label: 'Vertriebserfahrung', current: 95, required: 85, reason: '8 Jahre AO mit nachweislich 2,4 Mio € Bestand und 115% Zielerreichung' },
                { label: 'Spartenkenntnis', current: 80, required: 75, reason: 'Komposit/Leben/Kranken im CV belegt, bAV-Tiefe nicht erkennbar' },
                { label: 'Digital-Kompetenz', current: 70, required: 80, reason: 'Keine Erwähnung digitaler Tools (CRM, BiPRO, Vergleichsrechner) im CV' },
                { label: 'Führungskompetenz', current: 78, required: 85, reason: '3 MA geführt — für Agenturleitung (5+ MA) ausbaufähig' }
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
            red: ['Keine Versicherungserfahrung', 'Keine IHK §34d'],
            neutral: ['Branchenwechsel']
        },
        strengths: ['Teamführungserfahrung', 'Kommunikationsstärke', 'Vertriebsaffinität', 'Kundenorientierung'],
        weaknesses: ['Keine Versicherungserfahrung', 'Keine IHK-Qualifikation'],
        neutrals: ['Branchenwechsel'],
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
            { label: 'Branchenwechsel', points: -5, type: 'neutral' }
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
                { label: 'Regulatorik', current: 20, required: 80, reason: 'Keine §34d oder IHK-Qualifikation — muss im Trainee-Programm erworben werden' },
                { label: 'Vertriebserfahrung', current: 65, required: 70, reason: '4 Jahre Einzelhandel mit Umsatzverantwortung — Versicherungsvertrieb fehlt' },
                { label: 'Spartenkenntnis', current: 15, required: 60, reason: 'Kein Bezug zu Versicherungsprodukten im bisherigen Werdegang' },
                { label: 'Digital-Kompetenz', current: 75, required: 65, reason: 'MediaMarkt-Erfahrung zeigt Umgang mit digitalen Systemen und POS' },
                { label: 'Führungskompetenz', current: 72, required: 60, reason: 'Teamleitung 5 MA bei MediaMarkt — übertragbare Führungserfahrung' }
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
                { label: 'Regulatorik', current: 5, required: 80, reason: 'Keine versicherungsrelevante Qualifikation oder Weiterbildung vorhanden' },
                { label: 'Vertriebserfahrung', current: 10, required: 70, reason: 'Lagermitarbeiter ohne Kundenkontakt — keine Vertriebserfahrung erkennbar' },
                { label: 'Spartenkenntnis', current: 5, required: 60, reason: 'Kein Bezug zur Versicherungs- oder Finanzbranche im Werdegang' },
                { label: 'Digital-Kompetenz', current: 30, required: 65, reason: 'Grundlegende PC-Kenntnisse aus Lagerverwaltung — keine CRM/Vertriebstools' },
                { label: 'Führungskompetenz', current: 15, required: 40, reason: 'Keine Führungsverantwortung im bisherigen Werdegang nachweisbar' }
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
    { id: 6, title: 'Vertriebspartner SHUK', city: 'Bonn', region: 'nrw', type: 'Vertrieb', requirements: 'IHK §34d, Erfahrung Sachversicherung, Bedarfsanalyse-Kompetenz', description: 'Als Vertriebspartner/in SHUK sind Sie spezialisiert auf Sachversicherungen, Haftpflicht-, Unfall- und Kfz-Versicherungen. Sie beraten Privat- und Gewerbekunden in Bonn und Umgebung.\n\nIhre Aufgaben:\n- Beratung und Verkauf von Sach-, Haftpflicht-, Unfall- und Kfz-Versicherungen\n- Durchführung von Bedarfsanalysen und Deckungskonzepten\n- Betreuung und Ausbau eines bestehenden Kundenportfolios\n- Schadenmanagement und Unterstützung bei der Schadenregulierung\n- Cross-Selling in weitere ERGO Produktsparten\n\nWas wir erwarten:\n- IHK-Qualifikation nach §34d GewO\n- Erfahrung im Bereich Sachversicherung und Kompositgeschäft\n- Kompetenz in der Bedarfsanalyse und Risikoeinschätzung\n- Kundenorientierung und serviceorientiertes Arbeiten', benefits: ['Attraktive Provisionsregelung', 'Bestandsübernahme möglich', 'Digitale Beratungstools', 'Weiterbildungsangebote', 'Betriebliche Altersvorsorge'] },
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
                { label: 'Regulatorik', current: 15, required: 80, reason: 'Chinesische Zertifikate in Deutschland nicht anerkannt, §34d fehlt' },
                { label: 'Vertriebserfahrung', current: 55, required: 85, reason: '3 Jahre Ping An Insurance — Erfahrung vorhanden, aber nicht im deutschen Markt' },
                { label: 'Spartenkenntnis', current: 30, required: 75, reason: 'Nur Lebensversicherung in China — deutsches Produktportfolio unbekannt' },
                { label: 'Digital-Kompetenz', current: 75, required: 80, reason: 'Digitale Affinität aus Tech-Markt China, aber deutsche Tools (BiPRO etc.) fehlen' },
                { label: 'Sprachkompetenz', current: 10, required: 90, reason: 'KO-Kriterium: Keine Deutschkenntnisse für Kundenkontakt im Vertrieb' }
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
            neutral: ['Kein Außendienst']
        },
        strengths: ['5J Maklertätigkeit HDI', 'IHK-qualifiziert', 'Führungserfahrung', 'Fachwirt in Arbeit'],
        weaknesses: [],
        neutrals: ['Kein Außendienst-Erfahrung'],
        scores: { vertrieb: 85, branche: 88, qualifikation: 90, standort: 85, softskills: 80 },
        totalScore: 88, status: 'recommended',
        summary: '5 Jahre Erfahrung im HDI-Maklervertrieb mit IHK-Qualifikation. Fachwirt in Arbeit und Führungserfahrung machen sie zur idealen Kandidatin für die Maklerbetreuung.',
        waterfall: [
            { label: 'IHK Versicherungsfachfrau §34d', points: 18, type: 'positive' },
            { label: '5 Jahre HDI Maklervertrieb', points: 15, type: 'positive' },
            { label: 'Fachwirt IHK (in Arbeit)', points: 12, type: 'positive' },
            { label: 'B2B-Beziehungsmanagement', points: 10, type: 'positive' },
            { label: 'BWL-Studium', points: 8, type: 'positive' },
            { label: 'Kein AO-Erfahrung', points: -5, type: 'neutral' }
        ],
        counterfactual: 'Nach Abschluss des Fachwirt IHK (voraussichtlich Q3 2026) steigt der Score von 88 auf 94.',
        interviewQuestions: {
            background: [{ q: 'Beschreiben Sie Ihre Erfahrung im HDI-Maklervertrieb.', why: 'Verifizierung der B2B-Vertriebserfahrung' }],
            behavioral: [{ q: 'Wie pflegen Sie langfristige Maklerbeziehungen?', why: 'Beziehungsmanagement-Kompetenz' }],
            technical: [{ q: 'Wie unterscheiden sich Courtage-Modelle bei verschiedenen Sparten?', why: 'Fachliche Tiefe im Maklergeschäft' }]
        },
        skillGap: {
            dimensions: [
                { label: 'Regulatorik', current: 88, required: 80, reason: 'IHK §34d vorhanden, Fachwirt in Arbeit — überdurchschnittlich qualifiziert' },
                { label: 'Vertriebserfahrung', current: 85, required: 85, reason: '5 Jahre HDI-Maklervertrieb mit B2B-Fokus — Sollwert exakt erreicht' },
                { label: 'Spartenkenntnis', current: 82, required: 80, reason: 'Spartenübergreifende Beratung bei HDI nachgewiesen, Komposit + Leben' },
                { label: 'Digital-Kompetenz', current: 72, required: 75, reason: 'Grundlegende CRM-Kenntnisse, BiPRO und digitale Vergleichsrechner fehlen' },
                { label: 'Führungskompetenz', current: 70, required: 70, reason: 'Erfahrung in der Maklerbetreuung — indirekte Führung vorhanden' }
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
            red: ['Keine §34d'],
            neutral: ['Kein direkter Versicherungsvertrieb']
        },
        strengths: ['6J Bankvertrieb', '§34f qualifiziert', 'Finanzberatung', 'Quereinsteiger Versicherung'],
        weaknesses: ['Keine §34d'],
        neutrals: ['Keine direkte Versicherungserfahrung'],
        scores: { vertrieb: 82, branche: 65, qualifikation: 78, standort: 80, softskills: 78 },
        totalScore: 84, status: 'recommended',
        summary: '6 Jahre Bankvertriebserfahrung bei der Sparkasse mit §34f-Qualifikation. Starker Vertriebshintergrund qualifiziert ihn hervorragend als Quereinsteiger in den Versicherungsvertrieb.',
        waterfall: [
            { label: '§34f GewO (Finanzanlagen)', points: 12, type: 'positive' },
            { label: '6 Jahre Bankvertrieb', points: 14, type: 'positive' },
            { label: 'Cross-Selling-Erfahrung', points: 8, type: 'positive' },
            { label: 'Finanzberatungskompetenz', points: 10, type: 'positive' },
            { label: 'Keine §34d Qualifikation', points: -8, type: 'negative' },
            { label: 'Kein Versicherungsvertrieb', points: -6, type: 'neutral' }
        ],
        counterfactual: 'Nach Erwerb der IHK-Sachkundeprüfung §34d (ca. 3 Monate) steigt der Score von 84 auf 91.',
        interviewQuestions: {
            background: [{ q: 'Warum möchten Sie von der Bank in den Versicherungsvertrieb wechseln?', why: 'Wechselmotivation bei Branchenwechsel' }],
            behavioral: [{ q: 'Wie haben Sie Cross-Selling in der Sparkasse umgesetzt?', why: 'Übertragbare Vertriebskompetenz' }],
            technical: [{ q: 'Welche Überschneidungen sehen Sie zwischen §34f und §34d?', why: 'Regulatorisches Verständnis' }]
        },
        skillGap: {
            dimensions: [
                { label: 'Regulatorik', current: 60, required: 80, reason: '§34f vorhanden, §34d fehlt — Umschulung nötig, aber verwandte Grundlage' },
                { label: 'Vertriebserfahrung', current: 82, required: 75, reason: '6 Jahre aktiver Bankvertrieb bei Sparkasse mit Beratungserfahrung' },
                { label: 'Spartenkenntnis', current: 45, required: 70, reason: 'Nur Finanzanlageprodukte bekannt — Komposit/Leben/Kranken fehlen' },
                { label: 'Digital-Kompetenz', current: 68, required: 65, reason: 'Sparkassen-CRM und Online-Banking-Tools — versicherungsspezifische Tools fehlen' },
                { label: 'Führungskompetenz', current: 55, required: 50, reason: 'Informelle Mentoring-Rolle im Team, keine direkte Personalverantwortung' }
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
        weaknesses: ['Wenig Vertriebserfahrung'],
        neutrals: ['Keine Branchenkenntnisse', 'Kurze Berufserfahrung'],
        scores: { vertrieb: 45, branche: 20, qualifikation: 50, standort: 78, softskills: 72 },
        totalScore: 62, status: 'review',
        summary: 'Kundenservice-Erfahrung und Kommunikationsstärke vorhanden. Für den Einstieg in den Versicherungsvertrieb wird Trainee-Programm empfohlen, um Vertriebskompetenz gezielt aufzubauen.',
        waterfall: [
            { label: 'Kaufmännische Ausbildung', points: 8, type: 'positive' },
            { label: 'Kundenservice-Erfahrung', points: 7, type: 'positive' },
            { label: 'Kommunikationsstärke', points: 6, type: 'positive' },
            { label: 'Wenig Vertriebserfahrung', points: -10, type: 'negative' },
            { label: 'Keine Branchenkenntnisse', points: -8, type: 'neutral' },
            { label: 'Keine §34d (Trainee)', points: -6, type: 'neutral' }
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
        text: 'Max Berger (34, Düsseldorf) — Score: 92\n\n- 8J Allianz AO, Bestand 2,4 Mio €\n- IHK §34d, BWL Bachelor, IDD aktuell\n- Führung: 3 MA, Ø 115% Zielerreichung\n- Empfohlen: Agenturleiter Düsseldorf\n\nKI-Empfehlung: Sofortige Einladung.',
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
    ['bankenModule', 'assetModule', 'risikoscoringModule', 'bestandsuebertragungModule', 'pmoToolboxModule',
     'beraterOverviewPage', 'kundenDetailBankPage'].forEach(id => {
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

    // Update URL route
    if (window.AppRouter) AppRouter.navigate('/hr-pipeline');
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

    // Update URL route
    if (window.AppRouter) AppRouter.navigate('/landing');
}

function initHRPipeline() {
    const dropzone = document.getElementById('hpDropzone');
    if (dropzone) {
        dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
        dropzone.addEventListener('dragleave', () => { dropzone.classList.remove('dragover'); });
        dropzone.addEventListener('drop', (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); loadHPDemoProfile('max'); });
    }
    initHPChat();
    // Auto-expand chat on first load
    setTimeout(() => {
        const chatWindow = document.getElementById('hpChatWindow');
        if (chatWindow && !chatWindow.classList.contains('open')) {
            hpChatOpen = true;
            chatWindow.classList.add('open');
        }
    }, 300);
}

window.__registerModule('hr-pipeline-core.js');
