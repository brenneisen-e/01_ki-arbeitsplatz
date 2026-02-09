/**
 * CV Scanner Module - KI-gestütztes Bewerbermanagement
 * Demo-only: All data is client-side, no real AI backend
 */

// ========================================
// STATE
// ========================================

let cvScannerLoaded = false;
let cvCurrentMode = 'bewerber';
let cvCurrentProfile = null;
let cvChatOpen = false;

// ========================================
// DEMO DATA - Bewerber Profiles
// ========================================

const CV_PROFILES = {
    max: {
        id: 'max',
        name: 'Max Berger',
        initials: 'MB',
        age: 34,
        city: 'Düsseldorf',
        region: 'nrw',
        experience: '8 Jahre Versicherungsvertrieb (Allianz Außendienst)',
        experienceYears: 8,
        education: 'BWL-Studium (B.A.), IHK Versicherungsfachmann',
        skills: ['Kundenakquise', 'Bestandsmanagement', 'Führungserfahrung', 'Vertriebssteuerung', 'Cross-Selling'],
        strengths: ['Kundenakquise', 'Bestandsmanagement', 'Führungserfahrung (3 Mitarbeiter)', 'IHK-qualifiziert'],
        weaknesses: ['Keine ERGO-Erfahrung', 'Wechselbereitschaft unklar'],
        scores: { vertrieb: 95, branche: 90, qualifikation: 88, standort: 92, softskills: 85 },
        totalScore: 92,
        summary: 'Max Berger bringt 8 Jahre fundierte Vertriebserfahrung im Versicherungsaußendienst mit. Seine IHK-Qualifikation, nachgewiesene Führungskompetenz und starke Akquise-Leistung machen ihn zu einem idealen Kandidaten für leitende Vertriebspositionen. Seine Erfahrung bei der Allianz zeigt Branchentreue und Kompetenz im Bestandsmanagement.',
        radarData: [95, 90, 88, 92, 85]
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
        strengths: ['Teamführungserfahrung', 'Kommunikationsstärke', 'Vertriebsaffinität', 'Kundenorientierung'],
        weaknesses: ['Keine Versicherungserfahrung', 'Keine IHK-Qualifikation', 'Branchenwechsel'],
        scores: { vertrieb: 65, branche: 35, qualifikation: 55, standort: 88, softskills: 82 },
        totalScore: 68,
        summary: 'Sarah Klein ist eine motivierte Quereinsteigerin mit solider Vertriebserfahrung aus dem Einzelhandel. Ihre Führungskompetenz und ausgeprägte Kommunikationsstärke sind wertvolle Grundlagen für den Versicherungsvertrieb. Fehlende Branchenkenntnisse können durch das ERGO Trainee-Programm kompensiert werden.',
        radarData: [65, 35, 55, 88, 82]
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
        strengths: ['Langjährige Berufserfahrung', 'Zuverlässigkeit', 'Sorgfalt'],
        weaknesses: ['Keine Vertriebserfahrung', 'Keine Branchenkenntnisse', 'Keine kaufmännische Ausbildung', 'Fehlende Kundenorientierung', 'Standort ohne offene Stellen'],
        scores: { vertrieb: 10, branche: 5, qualifikation: 25, standort: 20, softskills: 35 },
        totalScore: 31,
        summary: 'Thomas Wendt verfügt über 20 Jahre Erfahrung in der Kommunalverwaltung, jedoch ohne jeglichen Bezug zum Vertrieb oder zur Versicherungsbranche. Es fehlen grundlegende Voraussetzungen wie Vertriebserfahrung, kaufmännisches Wissen und Kundenorientierung. Eine Empfehlung für eine Vertriebsposition ist derzeit nicht möglich.',
        radarData: [10, 5, 25, 20, 35],
        rejected: true,
        rejectionText: 'Auf Basis Ihres Profils können wir Ihnen derzeit leider keine passende Vertriebsposition empfehlen. Es fehlen grundlegende Voraussetzungen: keine Vertriebserfahrung, keine Branchenkenntnisse im Versicherungsbereich und keine kaufmännische Ausbildung.'
    }
};

// ========================================
// DEMO DATA - Job Positions
// ========================================

const CV_POSITIONS = [
    { id: 1, title: 'Agenturleiter', city: 'Düsseldorf', region: 'nrw', type: 'Führung', requirements: 'Min. 5 Jahre Vertriebserfahrung, Führungskompetenz, IHK §34d' },
    { id: 2, title: 'Vertriebsspezialist Leben', city: 'Köln', region: 'nrw', type: 'Spezialist', requirements: 'Erfahrung Lebensversicherung, Beratungskompetenz, IHK §34d' },
    { id: 3, title: 'Maklerbetreuer', city: 'Essen', region: 'nrw', type: 'Betreuung', requirements: 'Netzwerk-Fähigkeiten, Branchenkenntnis, Verhandlungsgeschick' },
    { id: 4, title: 'Ausschließlichkeitsvermittler', city: 'Dortmund', region: 'nrw', type: 'Vertrieb', requirements: 'Vertriebsaffinität, Eigeninitiative, Kundenorientierung' },
    { id: 5, title: 'Trainee Vertrieb', city: 'Köln', region: 'nrw', type: 'Einstieg', requirements: 'Vertriebsaffinität, Kommunikationsstärke, Lernbereitschaft' },
    { id: 6, title: 'Vertriebspartner Sach/HUK', city: 'Bonn', region: 'nrw', type: 'Vertrieb', requirements: 'Erfahrung Sachversicherung, Kundenberatung' },
    { id: 7, title: 'Bezirksdirektor', city: 'Münster', region: 'nrw', type: 'Führung', requirements: 'Min. 8 Jahre Vertrieb, Führung >5 MA, strategisches Denken' },
    { id: 8, title: 'Kundenberater Innendienst', city: 'Hamburg', region: 'nord', type: 'Beratung', requirements: 'Kommunikationsstärke, Serviceorientierung, Versicherungskenntnisse' }
];

// Distance matrix (approx. km from profile city to position city)
const CV_DISTANCES = {
    'Düsseldorf': { 'Düsseldorf': 0, 'Köln': 40, 'Essen': 30, 'Dortmund': 60, 'Bonn': 75, 'Münster': 125, 'Hamburg': 410 },
    'Köln': { 'Düsseldorf': 40, 'Köln': 0, 'Essen': 65, 'Dortmund': 90, 'Bonn': 30, 'Münster': 150, 'Hamburg': 430 },
    'Flensburg': { 'Düsseldorf': 530, 'Köln': 570, 'Essen': 500, 'Dortmund': 470, 'Bonn': 600, 'Münster': 400, 'Hamburg': 155 }
};

// Match score generation per profile
function getMatchScore(profile, position) {
    const base = profile.totalScore;
    const dist = CV_DISTANCES[profile.city]?.[position.city] || 300;
    const distPenalty = Math.min(dist / 20, 15);
    // Type bonuses
    let typeBonus = 0;
    if (position.type === 'Führung' && profile.scores.vertrieb > 80) typeBonus = 5;
    if (position.type === 'Einstieg' && profile.scores.vertrieb < 70) typeBonus = 8;
    if (position.type === 'Einstieg' && base < 50) typeBonus = 5;
    const score = Math.max(15, Math.min(98, Math.round(base - distPenalty + typeBonus + (Math.random() * 6 - 3))));
    return score;
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
        experience: '5 Jahre Maklertätigkeit', experienceYears: 5,
        education: 'BWL-Studium, IHK Versicherungsfachfrau',
        skills: ['Maklerbetreuung', 'Verhandlung', 'Führungserfahrung'],
        strengths: ['5J Maklertätigkeit', 'IHK-qualifiziert', 'Führungserfahrung'],
        weaknesses: ['Kein Außendienst-Erfahrung'],
        scores: { vertrieb: 85, branche: 88, qualifikation: 90, standort: 85, softskills: 80 },
        totalScore: 88, status: 'recommended',
        summary: 'Erfahrene Versicherungsmaklerin mit IHK-Qualifikation und Führungserfahrung. Ideal für Maklerbetreuung.'
    },
    {
        id: 'markus', name: 'Markus Scholz', initials: 'MS', age: 38, city: 'Bonn', region: 'nrw',
        experience: '6 Jahre Bankvertrieb (Sparkasse)', experienceYears: 6,
        education: 'Bankkaufmann, Weiterbildung Finanzberatung',
        skills: ['Finanzberatung', 'Kundenakquise', 'Cross-Selling'],
        strengths: ['6J Bankvertrieb', 'Finanzberatung', 'Quereinsteiger Versicherung'],
        weaknesses: ['Keine direkte Versicherungserfahrung'],
        scores: { vertrieb: 82, branche: 65, qualifikation: 78, standort: 80, softskills: 78 },
        totalScore: 84, status: 'recommended',
        summary: 'Erfahrener Bankberater mit starkem Vertriebshintergrund. Guter Quereinsteiger aus dem Finanzbereich.'
    },
    {
        id: 'anna', name: 'Anna Weber', initials: 'AW', age: 26, city: 'Dortmund', region: 'nrw',
        experience: '2 Jahre Kundenservice (Telekom)', experienceYears: 2,
        education: 'Kauffrau für Büromanagement',
        skills: ['Kundenservice', 'Kommunikation', 'Problemlösung'],
        strengths: ['Kommunikationsstärke', 'Junges Talent', 'Serviceorientiert'],
        weaknesses: ['Wenig Vertriebserfahrung', 'Keine Branchenkenntnisse', 'Kurze Berufserfahrung'],
        scores: { vertrieb: 45, branche: 20, qualifikation: 50, standort: 78, softskills: 72 },
        totalScore: 62, status: 'review',
        summary: 'Junge Berufseinsteigerin mit Kundenservice-Erfahrung. Potenzial vorhanden, aber wenig Vertriebserfahrung.'
    },
    {
        id: 'peter', name: 'Peter Müller', initials: 'PM', age: 45, city: 'Köln', region: 'nrw',
        experience: '12 Jahre Außendienst (verschiedene Branchen)', experienceYears: 12,
        education: 'Industriekaufmann',
        skills: ['Außendienst', 'Neukundengewinnung', 'Verhandlung', 'Key Account'],
        strengths: ['12J Außendienst', 'Neukundengewinnung', 'Verhandlungsstark'],
        weaknesses: ['Keine Versicherungsbranche', 'Häufige Arbeitgeberwechsel'],
        scores: { vertrieb: 78, branche: 30, qualifikation: 55, standort: 85, softskills: 75 },
        totalScore: 72, status: 'review',
        summary: 'Erfahrener Außendienstler mit starker Akquise-Leistung. Branchenwechsel aus Industrie möglich.'
    },
    {
        id: 'lisa', name: 'Lisa Krause', initials: 'LK', age: 24, city: 'Düsseldorf', region: 'nrw',
        experience: '1 Jahr Praktikum Versicherung', experienceYears: 1,
        education: 'BWL-Studium (Bachelor), laufend IHK §34d',
        skills: ['Versicherungswissen', 'Analyse', 'Digital affin'],
        strengths: ['BWL-Studium', 'IHK in Arbeit', 'Digital affin'],
        weaknesses: ['Nur Praktikumserfahrung', 'Berufsanfängerin'],
        scores: { vertrieb: 35, branche: 55, qualifikation: 65, standort: 90, softskills: 70 },
        totalScore: 65, status: 'review',
        summary: 'Berufsanfängerin mit Versicherungspraktikum und laufender IHK-Qualifikation. Hohes Potenzial.'
    },
    {
        id: 'frank', name: 'Frank Bergmann', initials: 'FB', age: 48, city: 'Hamburg', region: 'nord',
        experience: 'Keine relevante Erfahrung, zuletzt Lagerlogistik', experienceYears: 0,
        education: 'Hauptschulabschluss, Ausbildung Lagerfachkraft',
        skills: ['Logistik', 'Organisation'],
        strengths: ['Zuverlässigkeit', 'Organisationsfähigkeit'],
        weaknesses: ['Keine Vertriebserfahrung', 'Keine relevante Qualifikation', 'Lücken im Lebenslauf', 'Fehlende Nachweise'],
        scores: { vertrieb: 10, branche: 5, qualifikation: 15, standort: 45, softskills: 30 },
        totalScore: 38, status: 'rejected',
        summary: 'Bewerber ohne Vertriebserfahrung und ohne relevante Qualifikation. Erhebliche Lücken im Lebenslauf.'
    },
    {
        id: 'sabine', name: 'Sabine Richter', initials: 'SR', age: 35, city: 'Bremen', region: 'nord',
        experience: '3 Jahre Gastgewerbe, danach 2 Jahre arbeitslos', experienceYears: 3,
        education: 'Realschulabschluss',
        skills: ['Gastronomie', 'Kundenumgang'],
        strengths: ['Kundenumgang', 'Belastbarkeit'],
        weaknesses: ['Keine Vertriebserfahrung', 'Keine kaufmännische Qualifikation', 'Beschäftigungslücke', 'Fehlende Weiterbildungen'],
        scores: { vertrieb: 20, branche: 5, qualifikation: 15, standort: 35, softskills: 45 },
        totalScore: 42, status: 'rejected',
        summary: 'Bewerberin mit Gastgewerbe-Hintergrund und Beschäftigungslücke. Keine vertriebsrelevante Qualifikation.'
    }
];

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
    // Bewerber Mode
    stellen_passend: {
        getText: (profile) => {
            if (!profile) return 'Bitte laden Sie zuerst Ihren Lebenslauf hoch, damit ich passende Stellen identifizieren kann.';
            const matches = getCVMatchesForProfile(profile).slice(0, 3);
            let text = `Basierend auf Ihrem Profil habe ich ${matches.length > 3 ? 'mehrere' : matches.length} passende Stellen identifiziert.\n\nIhre Top-3 Matches:\n`;
            matches.forEach((m, i) => {
                text += `${i + 1}. ${m.position.title} ${m.position.city} - ${m.score}% Match\n`;
            });
            text += '\nSoll ich Ihnen mehr Details zu einer dieser Stellen zeigen?';
            return text;
        },
        followUp: [
            { label: 'Alle Stellen zeigen', icon: 'list', action: 'alle_stellen' },
            { label: 'Zurück zum Start', icon: 'home', action: 'start' }
        ]
    },
    anforderungen: {
        text: 'Für die meisten Vertriebspositionen bei ERGO suchen wir:\n\n- IHK-Sachkundeprüfung oder vergleichbare Qualifikation\n- Erfahrung in Kundenberatung und Vertrieb\n- Kommunikationsstärke und Eigeninitiative\n- Idealerweise Erfahrung in der Versicherungsbranche\n\nQuereinsteiger sind bei uns willkommen - wir bieten umfangreiche Schulungsprogramme.\n\nSoll ich prüfen, welche Anforderungen Sie bereits erfüllen?',
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
            if (matches.length === 0) {
                return `Basierend auf Ihrem Wohnort ${profile.city} gibt es leider keine Stellen im Umkreis von 30 km. Möchten Sie den Suchradius erweitern?`;
            }
            let text = `Basierend auf Ihrem Wohnort ${profile.city} habe ich folgende Stellen im Umkreis von 50 km gefunden:\n\n`;
            matches.forEach(m => {
                text += `- ${m.position.title} ${m.position.city} - ${m.distance} km - ${m.score}% Match\n`;
            });
            text += '\nMöchten Sie den Suchradius erweitern?';
            return text;
        },
        followUp: [
            { label: 'Radius 100km', icon: 'map', action: 'stellen_passend' },
            { label: 'Alle Stellen', icon: 'list', action: 'alle_stellen' },
            { label: 'Zurück zum Start', icon: 'home', action: 'start' }
        ]
    },
    ablehnung: {
        getText: (profile) => {
            if (!profile) return 'Bitte laden Sie zuerst Ihren Lebenslauf hoch.';
            if (!profile.rejected) return 'Ihr Profil wurde nicht abgelehnt. Sie haben passende Stellenvorschläge erhalten. Soll ich diese anzeigen?';
            return 'Ich verstehe, dass das enttäuschend ist. Hier die Gründe im Detail:\n\n- Keine nachweisbare Vertriebserfahrung (0 von min. 2 Jahren)\n- Fehlende Branchenkenntnis im Versicherungsbereich\n- Standort Flensburg - keine offenen Stellen in der Region\n- Kein kaufmännischer Ausbildungshintergrund\n\nAber: ERGO bietet ein Quereinsteiger-Programm an, das in 6 Monaten auf eine Vertriebsrolle vorbereitet. Interesse?';
        },
        followUp: [
            { label: 'Quereinsteiger-Programm', icon: 'trending', action: 'quereinsteiger' },
            { label: 'Profil verbessern', icon: 'edit', action: 'profil_verbessern' },
            { label: 'Zurück zum Start', icon: 'home', action: 'start' }
        ]
    },
    profil_verbessern: {
        text: 'Basierend auf der Analyse Ihres CVs empfehle ich:\n\n1. IHK Sachkundeprüfung §34d ablegen - steigert Ihren Score um ca. 15 Punkte\n2. Vertriebserfahrung sammeln - auch branchenfremd zählt hier\n3. Weiterbildungen im Bereich Finanzberatung/Versicherung\n4. Soft Skills hervorheben: Kommunikation, Kundenkontakt, Eigenverantwortung\n\nSoll ich Ihnen passende Weiterbildungen vorschlagen?',
        followUp: [
            { label: 'Quereinsteiger-Programm', icon: 'trending', action: 'quereinsteiger' },
            { label: 'Zurück zum Start', icon: 'home', action: 'start' }
        ]
    },
    quereinsteiger: {
        text: 'Das ERGO Quereinsteiger-Programm bietet:\n\n- 6-monatige begleitete Ausbildung\n- IHK-Sachkundeprüfung §34d inklusive\n- Mentoring durch erfahrene Vertriebspartner\n- Garantierte Übernahme bei erfolgreichem Abschluss\n- Attraktive Vergütung während der Ausbildung\n\nDas Programm startet quartalsweise in allen Regionen. Aktuell sind Plätze in NRW und Hamburg verfügbar.',
        followUp: [
            { label: 'Alle Stellen zeigen', icon: 'list', action: 'stellen_passend' },
            { label: 'Zurück zum Start', icon: 'home', action: 'start' }
        ]
    },
    alle_stellen: {
        getText: (profile) => {
            if (!profile) return 'Bitte laden Sie zuerst Ihren Lebenslauf hoch.';
            const matches = getCVMatchesForProfile(profile);
            let text = `Alle ${matches.length} verfügbaren Stellen für Ihr Profil:\n\n`;
            matches.forEach((m, i) => {
                text += `${i + 1}. ${m.position.title} ${m.position.city} - ${m.score}% - ${m.distance} km\n`;
            });
            return text;
        },
        followUp: [
            { label: 'Zurück zum Start', icon: 'home', action: 'start' }
        ]
    },

    // Arbeitgeber Mode
    pipeline: {
        text: 'Aktuelle Recruiting-Pipeline:\n\n- 47 Bewerbungen eingegangen\n- 12 Kandidaten empfohlen (Score >80)\n- 18 Kandidaten zur Prüfung (Score 60-80)\n- 17 Ablehnungen empfohlen (Score <60)\n- Durchschn. Score: 68 Punkte\n- Top-Region: NRW mit 28 Bewerbungen\n\nSoll ich die Top-Kandidaten anzeigen?',
        followUp: [
            { label: 'Top 5 Kandidaten', icon: 'star', action: 'top_kandidaten' },
            { label: 'Ablehnungen prüfen', icon: 'alert', action: 'kritische' },
            { label: 'Zurück zum Start', icon: 'home', action: 'start' }
        ]
    },
    top_kandidaten: {
        text: 'Die 3 stärksten Bewerber:\n\n1. Max Berger (Düsseldorf) - Score 92 - 8J Vertriebserfahrung Allianz, IHK-qualifiziert. Ideal für Agenturleiter\n2. Julia Hoffmann (Essen) - Score 88 - 5J Maklertätigkeit, Führungserfahrung. Maklerbetreuer\n3. Markus Scholz (Bonn) - Score 84 - 6J Bankvertrieb, Quereinsteiger Versicherung. Vertriebsspezialist\n\nSoll ich einen dieser Kandidaten im Detail anzeigen?',
        followUp: [
            { label: 'Detail Max Berger', icon: 'user', action: 'detail_max' },
            { label: 'Kandidaten vergleichen', icon: 'bar', action: 'pipeline' },
            { label: 'Zurück zum Start', icon: 'home', action: 'start' }
        ]
    },
    kritische: {
        text: '3 Bewerbungen mit Score <40 erfordern Bearbeitung:\n\n1. Thomas Wendt (Flensburg) - Score 31 - Keine Vertriebserfahrung, Verwaltungshintergrund\n2. Frank Bergmann (Hamburg) - Score 38 - Berufsanfänger ohne relevante Qualifikation\n3. Sabine Richter (Bremen) - Score 42 - Lücken im Lebenslauf, fehlende Nachweise\n\nEmpfehlung: Standardisierte Absage mit Verweis auf Quereinsteiger-Programm.\nSoll ich eine Absage-Vorlage erstellen?',
        followUp: [
            { label: 'Absage generieren', icon: 'mail', action: 'absage_mail' },
            { label: 'Zurück zum Start', icon: 'home', action: 'start' }
        ]
    },
    absage_mail: {
        text: 'Hier ein Entwurf:\n\n"Sehr geehrte/r Bewerber/in,\n\nvielen Dank für Ihr Interesse an einer Vertriebsposition bei ERGO. Nach sorgfältiger Prüfung Ihrer Unterlagen müssen wir Ihnen leider mitteilen, dass wir Ihre Bewerbung derzeit nicht weiter berücksichtigen können.\n\nWir möchten Sie jedoch auf unser Quereinsteiger-Programm aufmerksam machen, das einen begleiteten Einstieg in den Versicherungsvertrieb ermöglicht.\n\nMit freundlichen Grüßen,\nERGO Recruiting-Team"\n\nSoll ich den Text anpassen?',
        followUp: [
            { label: 'Text anpassen', icon: 'edit', action: 'absage_mail' },
            { label: 'Zurück zum Start', icon: 'home', action: 'start' }
        ]
    },
    matching_kriterien: {
        text: 'Der KI-Score setzt sich aus 5 Teilbereichen zusammen:\n\n- Vertriebserfahrung (30%) - Jahre + Art der Vertriebstätigkeit\n- Branchenkenntnis (25%) - Versicherung, Finanz, Bank\n- Qualifikation (20%) - IHK, Studium, Zertifikate\n- Standort-Match (15%) - Nähe zu offenen Stellen\n- Soft Skills (10%) - Kommunikation, Führung, Kundenorientierung\n\nSoll ich die Gewichtung für eine bestimmte Stelle anpassen?',
        followUp: [
            { label: 'Score-Verteilung', icon: 'bar', action: 'pipeline' },
            { label: 'Zurück zum Start', icon: 'home', action: 'start' }
        ]
    },
    detail_max: {
        text: 'Max Berger (34, Düsseldorf) - Score: 92\n\n- 8 Jahre Versicherungsvertrieb (Allianz Außendienst)\n- IHK Versicherungsfachmann, BWL-Studium\n- Führungserfahrung: 3 Mitarbeiter\n- Stärken: Kundenakquise, Bestandsmanagement\n- Empfohlene Position: Agenturleiter Düsseldorf (5 km)\n\nEmpfehlung: Sofortige Einladung zum Gespräch.',
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
    console.log('CV Scanner öffnen...');

    // Hide landing page
    const landingPage = document.getElementById('landingPage');
    if (landingPage) landingPage.style.display = 'none';

    // Hide main app if visible
    const mainApp = document.getElementById('mainApp');
    if (mainApp) mainApp.style.display = 'none';

    // Hide other modules
    ['bankenModule', 'risikoscoringModule', 'bestandsuebertragungModule', 'pmoToolboxModule'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    // Show CV Scanner module
    const cvModule = document.getElementById('cvScannerModule');
    if (cvModule) {
        cvModule.style.display = 'block';

        if (!cvScannerLoaded) {
            try {
                const response = await fetch('partials/cv-scanner-module.html');
                if (response.ok) {
                    const html = await response.text();
                    cvModule.innerHTML = html;
                    cvScannerLoaded = true;
                    initCVScanner();
                    console.log('CV Scanner Modul geladen');
                } else {
                    cvModule.innerHTML = '<div class="error-message">Fehler beim Laden des CV Scanner-Moduls</div>';
                }
            } catch (error) {
                console.error('Error loading CV Scanner module:', error);
                cvModule.innerHTML = '<div class="error-message">Fehler beim Laden des CV Scanner-Moduls</div>';
            }
        }
    }

    // Dispatch event for Page ID Tracker
    document.dispatchEvent(new CustomEvent('moduleChanged', {
        detail: { module: 'cv-scanner', view: 'bewerber' }
    }));
}

function closeCVScanner() {
    console.log('CV Scanner schließen...');

    const cvModule = document.getElementById('cvScannerModule');
    if (cvModule) cvModule.style.display = 'none';

    // Close chat if open
    const chatWindow = document.getElementById('cvChatWindow');
    if (chatWindow) chatWindow.classList.remove('open');
    cvChatOpen = false;

    const landingPage = document.getElementById('landingPage');
    if (landingPage) landingPage.style.display = 'flex';
}

function initCVScanner() {
    // Setup drag and drop
    const dropzone = document.getElementById('cvDropzone');
    if (dropzone) {
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });
        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('dragover');
        });
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
            // Simulate upload with first demo profile
            loadDemoProfile('max');
        });
    }

    // Init chat
    initCVChat();
}

// ========================================
// MODE SWITCHING
// ========================================

function switchCVMode(mode) {
    cvCurrentMode = mode;

    // Update toggle buttons
    document.querySelectorAll('.cv-mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Show/hide sections
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
        }
    }

    // Update chat buttons
    initCVChat();

    document.dispatchEvent(new CustomEvent('viewChanged', {
        detail: { view: mode }
    }));
}

// ========================================
// BEWERBER MODE - Upload & Analysis
// ========================================

function handleCVUpload(event) {
    // Accept file but load demo data
    loadDemoProfile('max');
}

function loadDemoProfile(profileId) {
    const profile = CV_PROFILES[profileId];
    if (!profile) return;

    cvCurrentProfile = profile;

    // Hide upload, show loading
    document.getElementById('cvUploadSection').style.display = 'none';
    const loadingSection = document.getElementById('cvLoadingSection');
    loadingSection.classList.add('active');

    // Animate loading bar
    const bar = document.getElementById('cvLoadingBar');
    const status = document.getElementById('cvLoadingStatus');
    const steps = [
        { pct: 15, text: 'Dokument wird verarbeitet...' },
        { pct: 35, text: 'Textextraktion läuft...' },
        { pct: 55, text: 'Kompetenzen werden analysiert...' },
        { pct: 75, text: 'Stellenabgleich wird durchgeführt...' },
        { pct: 90, text: 'Ergebnisse werden aufbereitet...' },
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
            setTimeout(() => {
                loadingSection.classList.remove('active');
                showCVResults(profile);
            }, 400);
        }
    }, 350);
}

function showCVResults(profile) {
    const resultsSection = document.getElementById('cvResultsSection');
    resultsSection.classList.add('active');

    // Render profile card
    renderProfileCard(profile);

    // Show rejection notice if applicable
    const rejectionNotice = document.getElementById('cvRejectionNotice');
    if (profile.rejected) {
        rejectionNotice.classList.add('active');
        document.getElementById('cvRejectionText').textContent = profile.rejectionText;
    } else {
        rejectionNotice.classList.remove('active');
    }

    // Render matches
    renderCVMatches(profile);

    // Update chat context
    initCVChat();
}

function renderProfileCard(profile) {
    const card = document.getElementById('cvProfileCard');
    const scoreClass = profile.totalScore >= 80 ? 'high' : profile.totalScore >= 60 ? 'mid' : 'low';

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
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        ${profile.age} Jahre
                    </span>
                    <span class="cv-profile-meta-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"></path></svg>
                        ${profile.experienceYears} Jahre Erfahrung
                    </span>
                </div>
            </div>
            <div class="cv-score-ring">
                <svg viewBox="0 0 56 56" width="56" height="56">
                    <circle class="score-bg" cx="28" cy="28" r="24"></circle>
                    <circle class="score-fill ${scoreClass}" cx="28" cy="28" r="24" stroke-dasharray="${Math.round(2 * Math.PI * 24)}" stroke-dashoffset="${Math.round(2 * Math.PI * 24 * (1 - profile.totalScore / 100))}"></circle>
                </svg>
                <div class="cv-score-value">${profile.totalScore}%</div>
            </div>
        </div>
        <div class="cv-profile-body">
            <div class="cv-profile-section">
                <h4>Berufserfahrung</h4>
                <p style="font-size: var(--font-sm); color: var(--text-secondary); margin: 0;">${profile.experience}</p>
            </div>
            <div class="cv-profile-section">
                <h4>Ausbildung</h4>
                <p style="font-size: var(--font-sm); color: var(--text-secondary); margin: 0;">${profile.education}</p>
            </div>
            <div class="cv-profile-section">
                <h4>Kernkompetenzen</h4>
                <div class="cv-tags">
                    ${profile.skills.map(s => `<span class="cv-tag">${s}</span>`).join('')}
                </div>
            </div>
            <div class="cv-profile-section">
                <h4>Stärken-Profil</h4>
                <canvas id="cvRadarChart" class="cv-radar-container"></canvas>
            </div>
            <div class="cv-ki-summary">
                <strong>KI-Zusammenfassung:</strong> ${profile.summary}
            </div>
        </div>
    `;

    // Draw radar chart
    setTimeout(() => drawRadarChart(profile), 100);
}

function drawRadarChart(profile) {
    const canvas = document.getElementById('cvRadarChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
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
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 25,
                        font: { size: 10 },
                        backdropColor: 'transparent'
                    },
                    pointLabels: {
                        font: { size: 11, weight: '500' },
                        color: '#475569'
                    },
                    grid: { color: 'rgba(0,0,0,0.06)' },
                    angleLines: { color: 'rgba(0,0,0,0.06)' }
                }
            },
            plugins: {
                legend: { display: false }
            }
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
        const recommended = score >= 85 && distance <= 50;
        return { position: pos, score, distance, badges, recommended };
    }).sort((a, b) => b.score - a.score);
}

function renderCVMatches(profile) {
    const container = document.getElementById('cvMatchesList');
    const matches = getCVMatchesForProfile(profile);

    container.innerHTML = matches.map((match, idx) => {
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
                            ${match.position.city}
                            <span class="cv-match-distance">(${match.distance} km)</span>
                        </div>
                    </div>
                    <div class="cv-score-ring">
                        <svg viewBox="0 0 56 56" width="56" height="56">
                            <circle class="score-bg" cx="28" cy="28" r="24"></circle>
                            <circle class="score-fill ${scoreClass}" cx="28" cy="28" r="24" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"></circle>
                        </svg>
                        <div class="cv-score-value">${match.score}%</div>
                    </div>
                </div>
                <div class="cv-match-badges">
                    ${match.badges.map(b => `<span class="cv-match-badge ${b.color}">${b.text}</span>`).join('')}
                </div>
                <button class="cv-match-expand-btn" onclick="toggleMatchDetails(${idx})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                    Details anzeigen
                </button>
                <div class="cv-match-details" id="cvMatchDetail${idx}">
                    <h4 style="font-size: var(--font-sm); font-weight: var(--font-semibold); color: var(--text-primary); margin: 0 0 var(--space-2);">Anforderungsprofil</h4>
                    <p style="font-size: var(--font-sm); color: var(--text-secondary); margin: 0 0 var(--space-3);">${match.position.requirements}</p>
                    <h4 style="font-size: var(--font-sm); font-weight: var(--font-semibold); color: var(--text-primary); margin: 0 0 var(--space-2);">Stellentyp</h4>
                    <p style="font-size: var(--font-sm); color: var(--text-secondary); margin: 0;">${match.position.type}</p>
                </div>
            </div>
        `;
    }).join('');
}

function toggleMatchDetails(idx) {
    const detail = document.getElementById('cvMatchDetail' + idx);
    if (detail) {
        detail.classList.toggle('expanded');
        // Update button text
        const btn = detail.previousElementSibling;
        if (btn) {
            const isExpanded = detail.classList.contains('expanded');
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="transform: ${isExpanded ? 'rotate(180deg)' : 'none'}">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
                ${isExpanded ? 'Details ausblenden' : 'Details anzeigen'}
            `;
        }
    }
}

function sortCVMatches(sortBy) {
    if (!cvCurrentProfile) return;
    const container = document.getElementById('cvMatchesList');
    const matches = getCVMatchesForProfile(cvCurrentProfile);

    if (sortBy === 'distance') {
        matches.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === 'region') {
        matches.sort((a, b) => a.position.region.localeCompare(b.position.region));
    }
    // Default is score (already sorted)

    // Re-render with sorted data
    container.innerHTML = matches.map((match, idx) => {
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
                            ${match.position.city}
                            <span class="cv-match-distance">(${match.distance} km)</span>
                        </div>
                    </div>
                    <div class="cv-score-ring">
                        <svg viewBox="0 0 56 56" width="56" height="56">
                            <circle class="score-bg" cx="28" cy="28" r="24"></circle>
                            <circle class="score-fill ${scoreClass}" cx="28" cy="28" r="24" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"></circle>
                        </svg>
                        <div class="cv-score-value">${match.score}%</div>
                    </div>
                </div>
                <div class="cv-match-badges">
                    ${match.badges.map(b => `<span class="cv-match-badge ${b.color}">${b.text}</span>`).join('')}
                </div>
                <button class="cv-match-expand-btn" onclick="toggleMatchDetails(${idx})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                    Details anzeigen
                </button>
                <div class="cv-match-details" id="cvMatchDetail${idx}">
                    <h4 style="font-size: var(--font-sm); font-weight: var(--font-semibold); color: var(--text-primary); margin: 0 0 var(--space-2);">Anforderungsprofil</h4>
                    <p style="font-size: var(--font-sm); color: var(--text-secondary); margin: 0 0 var(--space-3);">${match.position.requirements}</p>
                    <h4 style="font-size: var(--font-sm); font-weight: var(--font-semibold); color: var(--text-primary); margin: 0 0 var(--space-2);">Stellentyp</h4>
                    <p style="font-size: var(--font-sm); color: var(--text-secondary); margin: 0;">${match.position.type}</p>
                </div>
            </div>
        `;
    }).join('');
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

        return `
            <div class="cv-applicant-card ${applicant.status === 'rejected' ? 'rejection' : ''}" data-region="${applicant.region}" data-score="${applicant.totalScore}" data-status="${applicant.status}" onclick="openCVDetail('${applicant.id}')">
                <div class="cv-applicant-score ${scoreClass}">${applicant.totalScore}</div>
                <div class="cv-applicant-info">
                    <h4>${applicant.name}</h4>
                    <div class="cv-applicant-location">${applicant.city} | ${applicant.age} Jahre</div>
                    <div class="cv-applicant-summary">${applicant.summary || ''}</div>
                    <div class="cv-tags">
                        ${(applicant.strengths || []).slice(0, 3).map(s => `<span class="cv-tag">${s}</span>`).join('')}
                    </div>
                </div>
                <div class="cv-applicant-status">
                    <span class="cv-status-badge ${applicant.status}">${statusLabel}</span>
                </div>
            </div>
        `;
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
// DETAIL VIEW
// ========================================

function openCVDetail(applicantId) {
    const applicant = CV_ALL_APPLICANTS.find(a => a.id === applicantId);
    if (!applicant) return;

    const overlay = document.getElementById('cvDetailOverlay');
    const nameEl = document.getElementById('cvDetailName');
    const body = document.getElementById('cvDetailBody');

    nameEl.textContent = applicant.name;

    const scoreCategories = [
        { label: 'Vertriebserfahrung (30%)', value: applicant.scores?.vertrieb || 0 },
        { label: 'Branchenkenntnis (25%)', value: applicant.scores?.branche || 0 },
        { label: 'Qualifikation (20%)', value: applicant.scores?.qualifikation || 0 },
        { label: 'Standort-Match (15%)', value: applicant.scores?.standort || 0 },
        { label: 'Soft Skills (10%)', value: applicant.scores?.softskills || 0 }
    ];

    body.innerHTML = `
        <div style="display: flex; gap: var(--space-4); margin-bottom: var(--space-6); align-items: center;">
            <div class="cv-profile-avatar-large">${applicant.initials}</div>
            <div>
                <div style="font-size: var(--font-lg); font-weight: var(--font-bold); color: var(--text-primary);">${applicant.name}</div>
                <div style="font-size: var(--font-sm); color: var(--text-secondary);">${applicant.city} | ${applicant.age} Jahre | ${applicant.experience}</div>
            </div>
            <div class="cv-applicant-score ${applicant.totalScore >= 80 ? 'high' : applicant.totalScore >= 60 ? 'mid' : 'low'}" style="margin-left: auto; width: 56px; height: 56px; font-size: var(--font-lg);">
                ${applicant.totalScore}
            </div>
        </div>

        <div class="cv-ki-summary" style="margin-bottom: var(--space-6);">
            <strong>KI-Zusammenfassung:</strong> ${applicant.summary}
        </div>

        <div class="cv-score-breakdown">
            <h4>Score-Aufschlüsselung</h4>
            ${scoreCategories.map(cat => {
                const barClass = cat.value >= 70 ? 'high' : cat.value >= 40 ? 'mid' : 'low';
                return `
                    <div class="cv-score-bar-row">
                        <div class="cv-score-bar-label">${cat.label}</div>
                        <div class="cv-score-bar-track">
                            <div class="cv-score-bar-value ${barClass}" style="width: ${cat.value}%"></div>
                        </div>
                        <div class="cv-score-bar-num">${cat.value}</div>
                    </div>
                `;
            }).join('')}
        </div>

        <div class="cv-strengths-weaknesses">
            <div class="cv-sw-section strengths">
                <h4>Stärken</h4>
                <ul class="cv-sw-list">
                    ${(applicant.strengths || []).map(s => `
                        <li>
                            <svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            ${s}
                        </li>
                    `).join('')}
                </ul>
            </div>
            <div class="cv-sw-section weaknesses">
                <h4>Schwächen</h4>
                <ul class="cv-sw-list">
                    ${(applicant.weaknesses || []).map(w => `
                        <li>
                            <svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            ${w}
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>
    `;

    overlay.classList.add('active');
}

function closeCVDetail() {
    const overlay = document.getElementById('cvDetailOverlay');
    if (overlay) overlay.classList.remove('active');
}

function cvDetailAction(action) {
    // Visual-only actions
    const overlay = document.getElementById('cvDetailOverlay');
    if (action === 'einladen' || action === 'ablehnen') {
        closeCVDetail();
    }
    console.log('CV Detail Action:', action);
}

// ========================================
// CHATBOT
// ========================================

function initCVChat() {
    const messagesContainer = document.getElementById('cvChatMessages');
    const buttonsContainer = document.getElementById('cvChatButtons');
    if (!messagesContainer || !buttonsContainer) return;

    // Clear
    messagesContainer.innerHTML = '';
    buttonsContainer.innerHTML = '';

    // Welcome message
    addCVChatBubble('bot', 'Hallo! Ich bin der ERGO KI-Recruiting-Assistent. Wie kann ich Ihnen helfen?');

    // Show mode-specific buttons
    const buttons = cvCurrentMode === 'bewerber' ? CV_CHAT_BEWERBER_START : CV_CHAT_ARBEITGEBER_START;
    renderCVChatButtons(buttons);
}

function toggleCVChat() {
    const window_ = document.getElementById('cvChatWindow');
    if (!window_) return;

    cvChatOpen = !cvChatOpen;
    if (cvChatOpen) {
        window_.classList.add('open');
    } else {
        window_.classList.remove('open');
    }
}

function addCVChatBubble(type, text) {
    const messagesContainer = document.getElementById('cvChatMessages');
    if (!messagesContainer) return;

    const bubble = document.createElement('div');
    bubble.className = `cv-chat-bubble ${type}`;

    // Convert newlines to <br> and handle lists
    const html = text
        .replace(/\n- /g, '\n<li>')
        .replace(/\n\d+\. /g, (match) => '\n<li>' + match.trim().replace(/^\d+\. /, ''))
        .replace(/\n/g, '<br>');
    bubble.innerHTML = html;

    messagesContainer.appendChild(bubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showCVTypingIndicator() {
    const messagesContainer = document.getElementById('cvChatMessages');
    if (!messagesContainer) return;

    const typing = document.createElement('div');
    typing.className = 'cv-chat-typing';
    typing.id = 'cvTypingIndicator';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messagesContainer.appendChild(typing);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeCVTypingIndicator() {
    const indicator = document.getElementById('cvTypingIndicator');
    if (indicator) indicator.remove();
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

    container.innerHTML = buttons.map(btn => `
        <button class="cv-chat-btn" onclick="cvChatAction('${btn.action}')">
            ${iconMap[btn.icon] || ''}
            ${btn.label}
        </button>
    `).join('');
}

function cvChatAction(action) {
    if (action === 'start') {
        initCVChat();
        return;
    }

    const response = CV_CHAT_RESPONSES[action];
    if (!response) return;

    // Add user button as a message
    const buttons = cvCurrentMode === 'bewerber' ? CV_CHAT_BEWERBER_START : CV_CHAT_ARBEITGEBER_START;
    const allButtons = [...buttons];
    // Search in follow-ups too
    Object.values(CV_CHAT_RESPONSES).forEach(r => {
        if (r.followUp) allButtons.push(...r.followUp);
    });
    const clickedBtn = allButtons.find(b => b.action === action);
    if (clickedBtn) {
        addCVChatBubble('user', clickedBtn.label);
    }

    // Show typing indicator
    showCVTypingIndicator();

    // Simulate delay
    setTimeout(() => {
        removeCVTypingIndicator();

        // Get response text
        let text;
        if (typeof response.getText === 'function') {
            text = response.getText(cvCurrentProfile);
        } else {
            text = response.text;
        }

        // Simulate streaming effect: add bubble then reveal text
        addCVChatBubble('bot', text);

        // Update buttons
        if (response.followUp) {
            renderCVChatButtons(response.followUp);
        }
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
