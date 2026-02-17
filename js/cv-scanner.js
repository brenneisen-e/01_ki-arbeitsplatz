/**
 * CV Scanner Module - KI-gestütztes Bewerbermanagement (Enhanced)
 * Demo-only: All data is client-side, no real AI backend
 *
 * Features: Insurance-specific scoring, SHAP waterfall, typewriter summaries,
 * animated KPIs, blind screening, candidate comparison, interview questions,
 * skill gap analysis, counterfactual suggestions, toast notifications
 */

// ========================================
// STATE
// ========================================

let cvScannerLoaded = false;
let cvCurrentMode = 'bewerber';
let cvCurrentProfile = null;
let cvChatOpen = false;
let cvBlindScreening = false;
let cvSelectedForCompare = new Set();
let cvCurrentDetailApplicant = null;

// ========================================
// DEMO DATA - Enhanced Bewerber Profiles
// ========================================

const CV_PROFILES = {
    max: {
        id: 'max',
        name: 'Max Berger',
        initials: 'MB',
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
        summary: 'Max Berger bringt 8 Jahre fundierte Vertriebserfahrung in der Allianz Ausschließlichkeitsorganisation mit. Seine IHK-Qualifikation nach §34d, nachgewiesene Führungskompetenz über 3 Mitarbeiter und ein Bestandsvolumen von 2,4 Mio € machen ihn zu einem idealen Kandidaten für die Agenturleitung. Seine Cross-Selling-Quote von 34% liegt deutlich über dem Branchendurchschnitt.',
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
        summary: 'Sarah Klein ist eine motivierte Quereinsteigerin mit 4 Jahren Teamleitungserfahrung im Einzelhandel bei MediaMarkt. Ihre Führungskompetenz über 5 Mitarbeiter und ausgeprägte Kommunikationsstärke bilden eine solide Grundlage für den Versicherungsvertrieb. Die fehlende §34d-Qualifikation kann über das ERGO Trainee-Programm (6 Monate, IHK-Sachkundeprüfung inklusive) erworben werden.',
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
        summary: 'Thomas Wendt verfügt über 20 Jahre Erfahrung in der Kommunalverwaltung, jedoch ohne jeglichen Bezug zum Vertrieb oder zur Versicherungsbranche. Es fehlen grundlegende Voraussetzungen wie §34d-Qualifikation, Vertriebserfahrung und Kundenorientierung. Der Standort Flensburg bietet aktuell keine offenen Positionen. Eine direkte Empfehlung ist nicht möglich — das Quereinsteiger-Programm wäre der einzige Einstiegspfad.',
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

const CV_POSITIONS = [
    { id: 1, title: 'Agenturleiter', city: 'Düsseldorf', region: 'nrw', type: 'Führung', requirements: 'Fachwirt IHK (min.), §34d, 5+ Jahre AO-Vertrieb, Führungserfahrung, Portfoliomanagement' },
    { id: 2, title: 'Vertriebsspezialist Leben', city: 'Köln', region: 'nrw', type: 'Spezialist', requirements: 'IHK §34d, Erfahrung Lebensversicherung/bAV, Beratungskompetenz' },
    { id: 3, title: 'Maklerbetreuer', city: 'Essen', region: 'nrw', type: 'Betreuung', requirements: 'Spartenübergreifende Produktkenntnis, B2B-Erfahrung, Courtage-Verständnis' },
    { id: 4, title: 'Ausschließlichkeitsvermittler', city: 'Dortmund', region: 'nrw', type: 'Vertrieb', requirements: 'IHK §34d (min. Sachkundeprüfung), Vertriebsaffinität, Eigeninitiative' },
    { id: 5, title: 'Trainee Vertrieb', city: 'Köln', region: 'nrw', type: 'Einstieg', requirements: 'Vertriebsaffinität, Kommunikationsstärke, Lernbereitschaft — IHK §34d wird im Programm erworben' },
    { id: 6, title: 'Vertriebspartner Sach/HUK', city: 'Bonn', region: 'nrw', type: 'Vertrieb', requirements: 'IHK §34d, Erfahrung Sachversicherung, Bedarfsanalyse-Kompetenz' },
    { id: 7, title: 'Bezirksdirektor', city: 'Münster', region: 'nrw', type: 'Führung', requirements: 'Fachwirt/Betriebswirt DVA, 8+ Jahre Vertrieb, Führung >5 MA, strategisches Denken' },
    { id: 8, title: 'Kundenberater Innendienst', city: 'Hamburg', region: 'nord', type: 'Beratung', requirements: 'Kaufm. Ausbildung, Kommunikationsstärke, Versicherungskenntnisse' }
];

const CV_DISTANCES = {
    'Düsseldorf': { 'Düsseldorf': 0, 'Köln': 40, 'Essen': 30, 'Dortmund': 60, 'Bonn': 75, 'Münster': 125, 'Hamburg': 410 },
    'Köln': { 'Düsseldorf': 40, 'Köln': 0, 'Essen': 65, 'Dortmund': 90, 'Bonn': 30, 'Münster': 150, 'Hamburg': 430 },
    'Flensburg': { 'Düsseldorf': 530, 'Köln': 570, 'Essen': 500, 'Dortmund': 470, 'Bonn': 600, 'Münster': 400, 'Hamburg': 155 },
    'Essen': { 'Düsseldorf': 30, 'Köln': 65, 'Essen': 0, 'Dortmund': 35, 'Bonn': 95, 'Münster': 100, 'Hamburg': 390 },
    'Bonn': { 'Düsseldorf': 75, 'Köln': 30, 'Essen': 95, 'Dortmund': 120, 'Bonn': 0, 'Münster': 180, 'Hamburg': 460 },
    'Dortmund': { 'Düsseldorf': 60, 'Köln': 90, 'Essen': 35, 'Dortmund': 0, 'Bonn': 120, 'Münster': 65, 'Hamburg': 360 },
    'Hamburg': { 'Düsseldorf': 410, 'Köln': 430, 'Essen': 390, 'Dortmund': 360, 'Bonn': 460, 'Münster': 290, 'Hamburg': 0 },
    'Bremen': { 'Düsseldorf': 340, 'Köln': 370, 'Essen': 310, 'Dortmund': 280, 'Bonn': 390, 'Münster': 220, 'Hamburg': 120 }
};

function getMatchScore(profile, position) {
    const base = profile.totalScore;
    const dist = CV_DISTANCES[profile.city]?.[position.city] || 300;
    const distPenalty = Math.min(dist / 20, 15);
    let typeBonus = 0;
    if (position.type === 'Führung' && profile.scores.vertrieb > 80) typeBonus = 5;
    if (position.type === 'Einstieg' && profile.scores.vertrieb < 70) typeBonus = 8;
    if (position.type === 'Einstieg' && base < 50) typeBonus = 5;
    return Math.max(15, Math.min(98, Math.round(base - distPenalty + typeBonus + (Math.random() * 6 - 3))));
}

function getMatchBadges(profile, position) {
    const badges = [];
    const dist = CV_DISTANCES[profile.city]?.[position.city] || 300;
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

const CV_ALL_APPLICANTS = [
    { ...CV_PROFILES.max, status: 'recommended' },
    { ...CV_PROFILES.sarah, status: 'review' },
    { ...CV_PROFILES.thomas, status: 'rejected' },
    {
        id: 'julia', name: 'Julia Hoffmann', initials: 'JH', age: 31, city: 'Essen', region: 'nrw',
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
        summary: 'Erfahrene Versicherungsmaklerin mit IHK-Qualifikation bei HDI. Fachwirt in Arbeit. Ideal für Maklerbetreuung.',
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
        id: 'markus', name: 'Markus Scholz', initials: 'MS', age: 38, city: 'Bonn', region: 'nrw',
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
        summary: 'Erfahrener Bankberater mit §34f und starkem Vertriebshintergrund. Quereinsteiger aus dem Finanzbereich.',
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
        id: 'anna', name: 'Anna Weber', initials: 'AW', age: 26, city: 'Dortmund', region: 'nrw',
        experience: '2 Jahre Kundenservice (Telekom)', experienceYears: 2,
        education: 'Kauffrau für Büromanagement',
        skills: ['Kundenservice', 'Kommunikation', 'Problemlösung'],
        certifications: ['Kauffrau für Büromanagement (DQR 4)'],
        strengths: ['Kommunikationsstärke', 'Junges Talent', 'Serviceorientiert'],
        weaknesses: ['Wenig Vertriebserfahrung', 'Keine Branchenkenntnisse', 'Kurze Berufserfahrung'],
        scores: { vertrieb: 45, branche: 20, qualifikation: 50, standort: 78, softskills: 72 },
        totalScore: 62, status: 'review',
        summary: 'Junge Berufseinsteigerin mit Kundenservice-Erfahrung. Potenzial vorhanden, aber wenig Vertriebserfahrung.',
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
        id: 'peter', name: 'Peter Müller', initials: 'PM', age: 45, city: 'Köln', region: 'nrw',
        experience: '12 Jahre Außendienst (verschiedene Branchen)', experienceYears: 12,
        education: 'Industriekaufmann',
        skills: ['Außendienst', 'Neukundengewinnung', 'Verhandlung', 'Key Account'],
        certifications: ['Industriekaufmann (DQR 4)'],
        strengths: ['12J Außendienst', 'Neukundengewinnung', 'Verhandlungsstark'],
        weaknesses: ['Keine Versicherungsbranche', 'Häufige Arbeitgeberwechsel'],
        scores: { vertrieb: 78, branche: 30, qualifikation: 55, standort: 85, softskills: 75 },
        totalScore: 72, status: 'review',
        summary: 'Erfahrener Außendienstler mit starker Akquise-Leistung. Branchenwechsel aus Industrie möglich.',
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
        id: 'lisa', name: 'Lisa Krause', initials: 'LK', age: 24, city: 'Düsseldorf', region: 'nrw',
        experience: '1 Jahr Praktikum Versicherung (R+V)', experienceYears: 1,
        education: 'BWL-Studium (Bachelor), laufend IHK §34d',
        skills: ['Versicherungswissen', 'Analyse', 'Digital affin'],
        certifications: ['BWL Bachelor (DQR 6)', 'IHK §34d (in Arbeit)'],
        strengths: ['BWL-Studium', 'IHK in Arbeit', 'Digital affin', 'R+V Praktikum'],
        weaknesses: ['Nur Praktikumserfahrung', 'Berufsanfängerin'],
        scores: { vertrieb: 35, branche: 55, qualifikation: 65, standort: 90, softskills: 70 },
        totalScore: 65, status: 'review',
        summary: 'Berufsanfängerin mit Versicherungspraktikum bei R+V und laufender IHK-Qualifikation. Hohes Potenzial.',
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
        id: 'frank', name: 'Frank Bergmann', initials: 'FB', age: 48, city: 'Hamburg', region: 'nord',
        experience: 'Keine relevante Erfahrung, zuletzt Lagerlogistik', experienceYears: 0,
        education: 'Hauptschulabschluss, Ausbildung Lagerfachkraft',
        skills: ['Logistik', 'Organisation'],
        certifications: ['Lagerfachkraft'],
        strengths: ['Zuverlässigkeit', 'Organisationsfähigkeit'],
        weaknesses: ['Keine Vertriebserfahrung', 'Keine relevante Qualifikation', 'Lücken im Lebenslauf', 'Fehlende Nachweise'],
        scores: { vertrieb: 10, branche: 5, qualifikation: 15, standort: 45, softskills: 30 },
        totalScore: 38, status: 'rejected',
        summary: 'Bewerber ohne Vertriebserfahrung und ohne relevante Qualifikation. Erhebliche Lücken im Lebenslauf.',
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
        id: 'sabine', name: 'Sabine Richter', initials: 'SR', age: 35, city: 'Bremen', region: 'nord',
        experience: '3 Jahre Gastgewerbe, danach 2 Jahre arbeitslos', experienceYears: 3,
        education: 'Realschulabschluss',
        skills: ['Gastronomie', 'Kundenumgang'],
        certifications: [],
        strengths: ['Kundenumgang', 'Belastbarkeit'],
        weaknesses: ['Keine Vertriebserfahrung', 'Keine kaufm. Qualifikation', 'Beschäftigungslücke', 'Fehlende Weiterbildungen'],
        scores: { vertrieb: 20, branche: 5, qualifikation: 15, standort: 35, softskills: 45 },
        totalScore: 42, status: 'rejected',
        summary: 'Bewerberin mit Gastgewerbe-Hintergrund und Beschäftigungslücke. Keine vertriebsrelevante Qualifikation.',
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

function showCVToast(message, type = 'info') {
    const container = document.getElementById('cvToastContainer');
    if (!container) return;
    const icons = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
        warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
    };
    const toast = document.createElement('div');
    toast.className = `cv-toast ${type}`;
    toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ========================================
// ANIMATED KPI COUNTERS
// ========================================

function animateKPICounters() {
    document.querySelectorAll('.cv-kpi-value[data-target]').forEach(el => {
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

function drawSparklines() {
    const datasets = {
        cvSparkline1: [28, 31, 35, 33, 38, 42, 40, 44, 47],
        cvSparkline2: [60, 62, 64, 63, 65, 66, 67, 66, 68],
        cvSparkline3: [5, 6, 7, 8, 7, 9, 10, 11, 12],
        cvSparkline4: [42, 40, 38, 39, 37, 36, 35, 35, 34]
    };
    const colors = {
        cvSparkline1: '#0F172A',
        cvSparkline2: '#2563EB',
        cvSparkline3: '#16A34A',
        cvSparkline4: '#DC2626'
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

function typewriterEffect(element, text, speed = 15) {
    element.innerHTML = '<strong>KI-Zusammenfassung:</strong> <span class="cv-typewriter-text"></span><span class="cv-typewriter-cursor"></span>';
    const textEl = element.querySelector('.cv-typewriter-text');
    const cursor = element.querySelector('.cv-typewriter-cursor');
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

const CV_CHAT_BEWERBER_START = [
    { label: 'Welche Stellen passen zu mir?', icon: 'search', action: 'stellen_passend' },
    { label: 'Was sind die Anforderungen?', icon: 'info', action: 'anforderungen' },
    { label: 'Stellen in meiner Nähe?', icon: 'map', action: 'stellen_naehe' },
    { label: 'Warum wurde ich abgelehnt?', icon: 'alert', action: 'ablehnung' },
    { label: 'Profil verbessern?', icon: 'trending', action: 'profil_verbessern' }
];

const CV_CHAT_ARBEITGEBER_START = [
    { label: 'Pipeline-Überblick', icon: 'bar', action: 'pipeline' },
    { label: 'Top Kandidaten', icon: 'star', action: 'top_kandidaten' },
    { label: 'Kritische Bewerbungen', icon: 'alert', action: 'kritische' },
    { label: 'Absage-Mail generieren', icon: 'mail', action: 'absage_mail' },
    { label: 'Matching-Kriterien', icon: 'info', action: 'matching_kriterien' }
];

const CV_CHAT_RESPONSES = {
    stellen_passend: {
        getText: (profile) => {
            if (!profile) return 'Bitte laden Sie zuerst Ihren Lebenslauf hoch, damit ich passende Stellen identifizieren kann.';
            const matches = getCVMatchesForProfile(profile).slice(0, 3);
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
            const matches = getCVMatchesForProfile(profile).filter(m => m.distance <= 50).slice(0, 3);
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
            const matches = getCVMatchesForProfile(profile);
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

async function openCVScanner() {
    const landingPage = document.getElementById('landingPage');
    if (landingPage) landingPage.style.display = 'none';
    const mainApp = document.getElementById('mainApp');
    if (mainApp) mainApp.style.display = 'none';
    ['bankenModule', 'risikoscoringModule', 'bestandsuebertragungModule', 'pmoToolboxModule'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    const cvModule = document.getElementById('cvScannerModule');
    if (cvModule) {
        cvModule.style.display = 'block';
        if (!cvScannerLoaded) {
            try {
                const response = await fetch('partials/cv-scanner-module.html');
                if (response.ok) {
                    cvModule.innerHTML = await response.text();
                    cvScannerLoaded = true;
                    initCVScanner();
                } else {
                    cvModule.innerHTML = '<div class="error-message">Fehler beim Laden des CV Scanner-Moduls</div>';
                }
            } catch (error) {
                console.error('Error loading CV Scanner module:', error);
                cvModule.innerHTML = '<div class="error-message">Fehler beim Laden des CV Scanner-Moduls</div>';
            }
        }
    }

    document.dispatchEvent(new CustomEvent('moduleChanged', { detail: { module: 'cv-scanner', view: 'bewerber' } }));
}

function closeCVScanner() {
    const cvModule = document.getElementById('cvScannerModule');
    if (cvModule) cvModule.style.display = 'none';
    const chatWindow = document.getElementById('cvChatWindow');
    if (chatWindow) chatWindow.classList.remove('open');
    cvChatOpen = false;
    const landingPage = document.getElementById('landingPage');
    if (landingPage) landingPage.style.display = 'flex';
}

function initCVScanner() {
    const dropzone = document.getElementById('cvDropzone');
    if (dropzone) {
        dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
        dropzone.addEventListener('dragleave', () => { dropzone.classList.remove('dragover'); });
        dropzone.addEventListener('drop', (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); loadDemoProfile('max'); });
    }
    initCVChat();
}

// ========================================
// MODE SWITCHING
// ========================================

function switchCVMode(mode) {
    cvCurrentMode = mode;
    document.querySelectorAll('.cv-mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    const bewerberSection = document.getElementById('cvBewerberMode');
    const arbeitgeberSection = document.getElementById('cvArbeitgeberMode');

    if (mode === 'bewerber') {
        if (bewerberSection) bewerberSection.style.display = 'block';
        if (arbeitgeberSection) arbeitgeberSection.classList.remove('active');
    } else {
        if (bewerberSection) bewerberSection.style.display = 'none';
        if (arbeitgeberSection) {
            arbeitgeberSection.classList.add('active');
            renderEmployerDashboard();
            setTimeout(() => { animateKPICounters(); drawSparklines(); }, 100);
        }
    }
    initCVChat();
    document.dispatchEvent(new CustomEvent('moduleChanged', { detail: { module: 'cv-scanner', view: mode } }));
}

// ========================================
// BEWERBER MODE
// ========================================

function handleCVUpload(event) { loadDemoProfile('max'); }

function loadDemoProfile(profileId) {
    const profile = CV_PROFILES[profileId];
    if (!profile) return;
    cvCurrentProfile = profile;

    document.getElementById('cvUploadSection').style.display = 'none';
    const loadingSection = document.getElementById('cvLoadingSection');
    loadingSection.classList.add('active');

    const bar = document.getElementById('cvLoadingBar');
    const status = document.getElementById('cvLoadingStatus');
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
            setTimeout(() => { loadingSection.classList.remove('active'); showCVResults(profile); }, 400);
        }
    }, 350);
}

function showCVResults(profile) {
    const resultsSection = document.getElementById('cvResultsSection');
    resultsSection.classList.add('active');
    renderProfileCard(profile);

    const rejectionNotice = document.getElementById('cvRejectionNotice');
    if (profile.rejected) {
        rejectionNotice.classList.add('active');
        document.getElementById('cvRejectionText').textContent = profile.rejectionText;
    } else {
        rejectionNotice.classList.remove('active');
    }

    renderCVMatches(profile);
    initCVChat();
    showCVToast('KI-Analyse abgeschlossen', 'success');
}

function renderProfileCard(profile) {
    const card = document.getElementById('cvProfileCard');
    const scoreClass = profile.totalScore >= 80 ? 'high' : profile.totalScore >= 60 ? 'mid' : 'low';
    const circumference = Math.round(2 * Math.PI * 24);
    const offset = Math.round(circumference * (1 - profile.totalScore / 100));

    const certTags = (profile.certifications || []).map(c => `<span class="cv-tag cert">${c}</span>`).join('');
    const greenFlags = (profile.insuranceFlags?.green || []).map(f => `<span class="cv-tag flag-green">${f}</span>`).join('');
    const redFlags = (profile.insuranceFlags?.red || []).map(f => `<span class="cv-tag flag-red">${f}</span>`).join('');

    card.innerHTML = `
        <div class="cv-profile-header">
            <div class="cv-profile-avatar-large">${profile.initials}</div>
            <div class="cv-profile-info">
                <h2>${profile.name}</h2>
                <div class="cv-profile-meta">
                    <span class="cv-profile-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        ${profile.city}
                    </span>
                    <span class="cv-profile-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        ${profile.age} Jahre
                    </span>
                    <span class="cv-profile-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"></rect><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"></path></svg>
                        ${profile.experienceYears} Jahre Erfahrung
                    </span>
                </div>
            </div>
            <div class="cv-score-ring">
                <svg viewBox="0 0 56 56" width="56" height="56">
                    <circle class="score-bg" cx="28" cy="28" r="24"></circle>
                    <circle class="score-fill ${scoreClass}" cx="28" cy="28" r="24" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"></circle>
                </svg>
                <div class="cv-score-value">${profile.totalScore}%</div>
            </div>
        </div>
        <div class="cv-profile-body">
            <div class="cv-profile-section">
                <h4>Berufserfahrung</h4>
                <p style="font-size:var(--font-sm);color:var(--text-secondary);margin:0;">${profile.experience}</p>
            </div>
            <div class="cv-profile-section">
                <h4>Ausbildung & Zertifikate</h4>
                <div class="cv-tags">${certTags || `<span class="cv-tag">${profile.education}</span>`}</div>
            </div>
            <div class="cv-profile-section">
                <h4>Versicherungs-Indikatoren</h4>
                <div class="cv-tags">${greenFlags}${redFlags}</div>
            </div>
            <div class="cv-profile-section">
                <h4>Stärken-Profil</h4>
                <canvas id="cvRadarChart" class="cv-radar-container"></canvas>
            </div>
            ${profile.waterfall ? renderWaterfallHTML(profile.waterfall) : ''}
            <div class="cv-ki-summary" id="cvKiSummary">
                <strong>KI-Zusammenfassung:</strong> ${profile.summary}
            </div>
            ${profile.counterfactual ? `
            <div class="cv-counterfactual" style="grid-column: 1 / -1;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                <div class="cv-counterfactual-text">${profile.counterfactual}</div>
            </div>` : ''}
        </div>
    `;

    setTimeout(() => drawRadarChart(profile), 100);
    setTimeout(() => typewriterEffect(document.getElementById('cvKiSummary'), profile.summary, 12), 200);
}

function renderWaterfallHTML(waterfall) {
    const maxPoints = Math.max(...waterfall.map(w => Math.abs(w.points)));
    const bars = waterfall.map(w => {
        const pct = (Math.abs(w.points) / maxPoints) * 100;
        return `<div class="cv-waterfall-bar">
            <div class="cv-waterfall-label">${w.label}</div>
            <div class="cv-waterfall-track"><div class="cv-waterfall-fill ${w.type === 'positive' ? 'positive' : 'negative'}" style="width:${pct}%"></div></div>
            <div class="cv-waterfall-value ${w.type === 'positive' ? 'positive' : 'negative'}">${w.type === 'positive' ? '+' : ''}${w.points}</div>
        </div>`;
    }).join('');
    return `<div class="cv-waterfall" style="grid-column: 1 / -1;"><h4>Score-Erklärung (SHAP-Analyse)</h4>${bars}</div>`;
}

function drawRadarChart(profile) {
    const canvas = document.getElementById('cvRadarChart');
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

function getCVMatchesForProfile(profile) {
    return CV_POSITIONS.map(pos => {
        const score = getMatchScore(profile, pos);
        const distance = CV_DISTANCES[profile.city]?.[pos.city] || 999;
        const badges = getMatchBadges(profile, pos);
        return { position: pos, score, distance, badges, recommended: score >= 85 && distance <= 50 };
    }).sort((a, b) => b.score - a.score);
}

function renderMatchCard(match, idx) {
    const scoreClass = match.score >= 80 ? 'high' : match.score >= 60 ? 'mid' : 'low';
    const circumference = Math.round(2 * Math.PI * 24);
    const offset = Math.round(circumference * (1 - match.score / 100));
    return `
        <div class="cv-match-card ${match.recommended ? 'recommended' : ''}">
            <div class="cv-match-card-header">
                <div class="cv-match-title-area">
                    <div class="cv-match-title">
                        ${match.position.title}
                        ${match.recommended ? '<span class="cv-recommended-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Empfohlen</span>' : ''}
                    </div>
                    <div class="cv-match-location">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        ${match.position.city} <span class="cv-match-distance">(${match.distance} km)</span>
                    </div>
                </div>
                <div class="cv-score-ring">
                    <svg viewBox="0 0 56 56" width="56" height="56"><circle class="score-bg" cx="28" cy="28" r="24"></circle><circle class="score-fill ${scoreClass}" cx="28" cy="28" r="24" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"></circle></svg>
                    <div class="cv-score-value">${match.score}%</div>
                </div>
            </div>
            <div class="cv-match-badges">${match.badges.map(b => `<span class="cv-match-badge ${b.color}">${b.text}</span>`).join('')}</div>
            <button class="cv-match-expand-btn" onclick="toggleMatchDetails(${idx})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="6 9 12 15 18 9"></polyline></svg>
                Details anzeigen
            </button>
            <div class="cv-match-details" id="cvMatchDetail${idx}">
                <h4 style="font-size:var(--font-sm);font-weight:var(--font-semibold);color:var(--text-primary);margin:0 0 var(--space-2);">Anforderungsprofil</h4>
                <p style="font-size:var(--font-sm);color:var(--text-secondary);margin:0 0 var(--space-3);">${match.position.requirements}</p>
                <h4 style="font-size:var(--font-sm);font-weight:var(--font-semibold);color:var(--text-primary);margin:0 0 var(--space-2);">Stellentyp</h4>
                <p style="font-size:var(--font-sm);color:var(--text-secondary);margin:0;">${match.position.type}</p>
            </div>
        </div>`;
}

function renderCVMatches(profile) {
    const container = document.getElementById('cvMatchesList');
    container.innerHTML = getCVMatchesForProfile(profile).map((m, i) => renderMatchCard(m, i)).join('');
}

function toggleMatchDetails(idx) {
    const detail = document.getElementById('cvMatchDetail' + idx);
    if (detail) {
        detail.classList.toggle('expanded');
        const btn = detail.previousElementSibling;
        const isExpanded = detail.classList.contains('expanded');
        if (btn) btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="transform:${isExpanded ? 'rotate(180deg)' : 'none'}"><polyline points="6 9 12 15 18 9"></polyline></svg> ${isExpanded ? 'Details ausblenden' : 'Details anzeigen'}`;
    }
}

function sortCVMatches(sortBy) {
    if (!cvCurrentProfile) return;
    const container = document.getElementById('cvMatchesList');
    const matches = getCVMatchesForProfile(cvCurrentProfile);
    if (sortBy === 'distance') matches.sort((a, b) => a.distance - b.distance);
    else if (sortBy === 'region') matches.sort((a, b) => a.position.region.localeCompare(b.position.region));
    container.innerHTML = matches.map((m, i) => renderMatchCard(m, i)).join('');
}

function resetCVBewerber() {
    cvCurrentProfile = null;
    document.getElementById('cvUploadSection').style.display = '';
    document.getElementById('cvResultsSection').classList.remove('active');
    document.getElementById('cvLoadingSection').classList.remove('active');
    document.getElementById('cvLoadingBar').style.width = '0%';
    initCVChat();
}

// ========================================
// ARBEITGEBER MODE
// ========================================

function renderEmployerDashboard() {
    const grid = document.getElementById('cvApplicantGrid');
    if (!grid) return;

    grid.innerHTML = CV_ALL_APPLICANTS.map(applicant => {
        const scoreClass = applicant.totalScore >= 80 ? 'high' : applicant.totalScore >= 60 ? 'mid' : 'low';
        const statusLabel = applicant.status === 'recommended' ? 'Empfohlen' : applicant.status === 'review' ? 'Prüfen' : 'Ablehnung empfohlen';
        const isBlind = cvBlindScreening;

        return `
            <div class="cv-applicant-card ${applicant.status === 'rejected' ? 'rejection' : ''} ${isBlind ? 'blind' : ''}" data-region="${applicant.region}" data-score="${applicant.totalScore}" data-status="${applicant.status}" onclick="openCVDetail('${applicant.id}')">
                <input type="checkbox" class="cv-compare-check" onclick="event.stopPropagation(); toggleCompareCandidate('${applicant.id}')" ${cvSelectedForCompare.has(applicant.id) ? 'checked' : ''} title="Zum Vergleich auswählen">
                <div class="cv-applicant-score ${scoreClass}">${applicant.totalScore}</div>
                <div class="cv-applicant-info">
                    <h4>${isBlind ? 'Kandidat/in #' + applicant.id.toUpperCase() : applicant.name}</h4>
                    <div class="cv-applicant-location">${isBlind ? applicant.region.toUpperCase() : applicant.city + ' | ' + applicant.age + ' Jahre'}</div>
                    <div class="cv-applicant-summary">${applicant.summary || ''}</div>
                    <div class="cv-tags">${(applicant.strengths || []).slice(0, 3).map(s => `<span class="cv-tag">${s}</span>`).join('')}</div>
                </div>
                <div class="cv-applicant-status">
                    <span class="cv-status-badge ${applicant.status}">${statusLabel}</span>
                </div>
            </div>`;
    }).join('');
}

function filterCVApplicants() {
    const regionFilter = document.getElementById('cvFilterRegion').value;
    const scoreFilter = document.getElementById('cvFilterScore').value;
    const statusFilter = document.getElementById('cvFilterStatus').value;
    document.querySelectorAll('.cv-applicant-card').forEach(card => {
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

function toggleBlindScreening() {
    cvBlindScreening = document.getElementById('cvBlindToggle')?.checked || false;
    renderEmployerDashboard();
    showCVToast(cvBlindScreening ? 'Blind Screening aktiviert (AGG-konform)' : 'Blind Screening deaktiviert', 'info');
}

// ========================================
// CANDIDATE COMPARISON
// ========================================

function toggleCompareCandidate(id) {
    if (cvSelectedForCompare.has(id)) cvSelectedForCompare.delete(id);
    else if (cvSelectedForCompare.size < 4) cvSelectedForCompare.add(id);
    else { showCVToast('Maximal 4 Kandidaten zum Vergleich', 'warning'); return; }

    const btn = document.getElementById('cvCompareBtn');
    const count = document.getElementById('cvCompareCount');
    if (btn) btn.style.display = cvSelectedForCompare.size >= 2 ? '' : 'none';
    if (count) count.textContent = cvSelectedForCompare.size;
}

function openCVCompare() {
    if (cvSelectedForCompare.size < 2) return;
    const candidates = [...cvSelectedForCompare].map(id => CV_ALL_APPLICANTS.find(a => a.id === id)).filter(Boolean);
    const body = document.getElementById('cvCompareBody');

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
        <table class="cv-compare-table">
            <thead><tr><th>Kriterium</th>${candidates.map(c => `<th>${c.name}</th>`).join('')}</tr></thead>
            <tbody>${rows.map(r => `<tr><td class="cv-compare-label">${r.label}</td>${r.values.map((v, i) => {
                const isBest = !r.isText && v === r.best;
                return `<td class="${isBest ? 'cv-compare-best' : ''}">${v}</td>`;
            }).join('')}</tr>`).join('')}</tbody>
        </table>`;

    document.getElementById('cvCompareOverlay').classList.add('active');
}

function closeCVCompare() {
    document.getElementById('cvCompareOverlay')?.classList.remove('active');
}

// ========================================
// DETAIL VIEW (Enhanced with waterfall, skill gap, counterfactual)
// ========================================

function openCVDetail(applicantId) {
    const applicant = CV_ALL_APPLICANTS.find(a => a.id === applicantId);
    if (!applicant) return;
    cvCurrentDetailApplicant = applicant;

    document.getElementById('cvDetailName').textContent = applicant.name;
    const body = document.getElementById('cvDetailBody');

    const scoreCategories = [
        { label: 'Vertriebserfahrung (30%)', value: applicant.scores?.vertrieb || 0 },
        { label: 'Branchenkenntnis (25%)', value: applicant.scores?.branche || 0 },
        { label: 'Qualifikation (20%)', value: applicant.scores?.qualifikation || 0 },
        { label: 'Standort-Match (15%)', value: applicant.scores?.standort || 0 },
        { label: 'Soft Skills (10%)', value: applicant.scores?.softskills || 0 }
    ];

    body.innerHTML = `
        <div style="display:flex;gap:var(--space-4);margin-bottom:var(--space-6);align-items:center;">
            <div class="cv-profile-avatar-large">${applicant.initials}</div>
            <div>
                <div style="font-size:var(--font-lg);font-weight:var(--font-bold);color:var(--text-primary);">${applicant.name}</div>
                <div style="font-size:var(--font-sm);color:var(--text-secondary);">${applicant.city} | ${applicant.age} Jahre | ${applicant.experience}</div>
                ${(applicant.certifications || []).length ? `<div class="cv-tags" style="margin-top:var(--space-2)">${applicant.certifications.map(c => `<span class="cv-tag cert">${c}</span>`).join('')}</div>` : ''}
            </div>
            <div class="cv-applicant-score ${applicant.totalScore >= 80 ? 'high' : applicant.totalScore >= 60 ? 'mid' : 'low'}" style="margin-left:auto;width:56px;height:56px;font-size:var(--font-lg);">${applicant.totalScore}</div>
        </div>

        <div class="cv-ki-summary" style="margin-bottom:var(--space-6);"><strong>KI-Zusammenfassung:</strong> ${applicant.summary}</div>

        ${applicant.waterfall ? renderWaterfallHTML(applicant.waterfall) : ''}

        <div class="cv-score-breakdown">
            <h4>Score-Aufschlüsselung</h4>
            ${scoreCategories.map(cat => {
                const barClass = cat.value >= 70 ? 'high' : cat.value >= 40 ? 'mid' : 'low';
                return `<div class="cv-score-bar-row"><div class="cv-score-bar-label">${cat.label}</div><div class="cv-score-bar-track"><div class="cv-score-bar-value ${barClass}" style="width:${cat.value}%"></div></div><div class="cv-score-bar-num">${cat.value}</div></div>`;
            }).join('')}
        </div>

        ${applicant.skillGap ? renderSkillGapHTML(applicant.skillGap) : ''}

        ${applicant.counterfactual ? `<div class="cv-counterfactual"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg><div class="cv-counterfactual-text">${applicant.counterfactual}</div></div>` : ''}

        <div class="cv-strengths-weaknesses" style="margin-top:var(--space-6);">
            <div class="cv-sw-section strengths"><h4>Stärken</h4><ul class="cv-sw-list">${(applicant.strengths || []).map(s => `<li><svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>${s}</li>`).join('')}</ul></div>
            <div class="cv-sw-section weaknesses"><h4>Schwächen</h4><ul class="cv-sw-list">${(applicant.weaknesses || []).map(w => `<li><svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>${w}</li>`).join('')}</ul></div>
        </div>`;

    document.getElementById('cvDetailOverlay').classList.add('active');
}

function renderSkillGapHTML(skillGap) {
    const rows = skillGap.dimensions.map(d => {
        const gap = Math.max(0, d.required - d.current);
        const color = gap > 0 ? '#DC2626' : '#16A34A';
        return `<div class="cv-skill-gap-row">
            <div class="cv-skill-gap-label">${d.label}</div>
            <div class="cv-skill-gap-bars">
                <div class="cv-skill-gap-current" style="width:${d.current}%"></div>
                <div class="cv-skill-gap-required" style="left:${d.required}%" title="Anforderung: ${d.required}%"></div>
            </div>
            <div class="cv-skill-gap-pct" style="color:${color}">${gap > 0 ? '-' + gap + '%' : 'OK'}</div>
        </div>`;
    }).join('');
    return `<div class="cv-skill-gap"><h4>Skill-Gap-Analyse (Ist vs. Soll)</h4>${rows}${skillGap.training ? `<div class="cv-training-rec"><strong>Weiterbildungsempfehlung:</strong> ${skillGap.training}</div>` : ''}</div>`;
}

function closeCVDetail() {
    document.getElementById('cvDetailOverlay')?.classList.remove('active');
}

function cvDetailAction(action) {
    const name = cvCurrentDetailApplicant?.name || 'Kandidat';
    if (action === 'einladen') { showCVToast(`${name} wurde zum Gespräch eingeladen`, 'success'); closeCVDetail(); }
    else if (action === 'ablehnen') { showCVToast(`Absage an ${name} wurde vermerkt`, 'warning'); closeCVDetail(); }
    else if (action === 'merken') { showCVToast(`${name} wurde vorgemerkt`, 'info'); }
}

// ========================================
// INTERVIEW QUESTIONS
// ========================================

function generateInterviewQuestions() {
    const applicant = cvCurrentDetailApplicant;
    if (!applicant || !applicant.interviewQuestions) {
        showCVToast('Keine Interviewfragen für diesen Kandidaten verfügbar', 'warning');
        return;
    }

    const body = document.getElementById('cvInterviewBody');
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
            return `<div class="cv-interview-category"><h4>${cat.title}</h4>${questions.map(q => `
                <div class="cv-interview-question">${q.q}<div class="cv-interview-why">Warum diese Frage: ${q.why}</div></div>
            `).join('')}</div>`;
        }).join('')}`;

    document.getElementById('cvInterviewOverlay').classList.add('active');
    showCVToast('Interviewfragen generiert', 'success');
}

function closeInterviewQuestions() {
    document.getElementById('cvInterviewOverlay')?.classList.remove('active');
}

// ========================================
// CHATBOT
// ========================================

function initCVChat() {
    const messagesContainer = document.getElementById('cvChatMessages');
    const buttonsContainer = document.getElementById('cvChatButtons');
    if (!messagesContainer || !buttonsContainer) return;
    messagesContainer.innerHTML = '';
    buttonsContainer.innerHTML = '';
    addCVChatBubble('bot', 'Hallo! Ich bin der ERGO KI-Recruiting-Assistent. Wie kann ich Ihnen helfen?');
    renderCVChatButtons(cvCurrentMode === 'bewerber' ? CV_CHAT_BEWERBER_START : CV_CHAT_ARBEITGEBER_START);
}

function toggleCVChat() {
    const w = document.getElementById('cvChatWindow');
    if (!w) return;
    cvChatOpen = !cvChatOpen;
    w.classList.toggle('open', cvChatOpen);
}

function addCVChatBubble(type, text) {
    const container = document.getElementById('cvChatMessages');
    if (!container) return;
    const bubble = document.createElement('div');
    bubble.className = `cv-chat-bubble ${type}`;
    bubble.innerHTML = text.replace(/\n- /g, '\n<li>').replace(/\n\d+\. /g, (m) => '\n<li>' + m.trim().replace(/^\d+\. /, '')).replace(/\n/g, '<br>');
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
}

function showCVTypingIndicator() {
    const container = document.getElementById('cvChatMessages');
    if (!container) return;
    const typing = document.createElement('div');
    typing.className = 'cv-chat-typing';
    typing.id = 'cvTypingIndicator';
    typing.innerHTML = '<span></span><span></span><span></span>';
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;
}

function removeCVTypingIndicator() {
    document.getElementById('cvTypingIndicator')?.remove();
}

function renderCVChatButtons(buttons) {
    const container = document.getElementById('cvChatButtons');
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
    container.innerHTML = buttons.map(btn => `<button class="cv-chat-btn" onclick="cvChatAction('${btn.action}')">${iconMap[btn.icon] || ''}${btn.label}</button>`).join('');
}

function cvChatAction(action) {
    if (action === 'start') { initCVChat(); return; }
    const response = CV_CHAT_RESPONSES[action];
    if (!response) return;

    const allButtons = [...(cvCurrentMode === 'bewerber' ? CV_CHAT_BEWERBER_START : CV_CHAT_ARBEITGEBER_START)];
    Object.values(CV_CHAT_RESPONSES).forEach(r => { if (r.followUp) allButtons.push(...r.followUp); });
    const clicked = allButtons.find(b => b.action === action);
    if (clicked) addCVChatBubble('user', clicked.label);

    showCVTypingIndicator();
    setTimeout(() => {
        removeCVTypingIndicator();
        const text = typeof response.getText === 'function' ? response.getText(cvCurrentProfile) : response.text;
        addCVChatBubble('bot', text);
        if (response.followUp) renderCVChatButtons(response.followUp);
    }, 800 + Math.random() * 400);
}

// ========================================
// GLOBAL EXPORTS
// ========================================

window.openCVScanner = openCVScanner;
window.closeCVScanner = closeCVScanner;
window.switchCVMode = switchCVMode;
window.handleCVUpload = handleCVUpload;
window.loadDemoProfile = loadDemoProfile;
window.resetCVBewerber = resetCVBewerber;
window.toggleMatchDetails = toggleMatchDetails;
window.sortCVMatches = sortCVMatches;
window.filterCVApplicants = filterCVApplicants;
window.openCVDetail = openCVDetail;
window.closeCVDetail = closeCVDetail;
window.cvDetailAction = cvDetailAction;
window.toggleCVChat = toggleCVChat;
window.cvChatAction = cvChatAction;
window.toggleBlindScreening = toggleBlindScreening;
window.toggleCompareCandidate = toggleCompareCandidate;
window.openCVCompare = openCVCompare;
window.closeCVCompare = closeCVCompare;
window.generateInterviewQuestions = generateInterviewQuestions;
window.closeInterviewQuestions = closeInterviewQuestions;
