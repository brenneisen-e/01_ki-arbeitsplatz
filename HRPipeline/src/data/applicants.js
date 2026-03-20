import { HP_PROFILES } from './profiles.js';
import { HP_POSITIONS } from './positions.js';

export const HP_ALL_APPLICANTS = [
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

export const HP_DISTANCES = {
    'Düsseldorf': { 'Düsseldorf': 0, 'Köln': 40, 'Essen': 30, 'Dortmund': 60, 'Bonn': 75, 'Münster': 125, 'Hamburg': 410 },
    'Köln': { 'Düsseldorf': 40, 'Köln': 0, 'Essen': 65, 'Dortmund': 90, 'Bonn': 30, 'Münster': 150, 'Hamburg': 430 },
    'Flensburg': { 'Düsseldorf': 530, 'Köln': 570, 'Essen': 500, 'Dortmund': 470, 'Bonn': 600, 'Münster': 400, 'Hamburg': 155 },
    'Essen': { 'Düsseldorf': 30, 'Köln': 65, 'Essen': 0, 'Dortmund': 35, 'Bonn': 95, 'Münster': 100, 'Hamburg': 390 },
    'Bonn': { 'Düsseldorf': 75, 'Köln': 30, 'Essen': 95, 'Dortmund': 120, 'Bonn': 0, 'Münster': 180, 'Hamburg': 460 },
    'Dortmund': { 'Düsseldorf': 60, 'Köln': 90, 'Essen': 35, 'Dortmund': 0, 'Bonn': 120, 'Münster': 65, 'Hamburg': 360 },
    'Hamburg': { 'Düsseldorf': 410, 'Köln': 430, 'Essen': 390, 'Dortmund': 360, 'Bonn': 460, 'Münster': 290, 'Hamburg': 0 },
    'Bremen': { 'Düsseldorf': 340, 'Köln': 370, 'Essen': 310, 'Dortmund': 280, 'Bonn': 390, 'Münster': 220, 'Hamburg': 120 }
};

export function getHPMatchScore(profile, position) {
    const base = profile.totalScore;
    const dist = HP_DISTANCES[profile.city]?.[position.city] || 300;
    const distPenalty = Math.min(dist / 20, 15);
    let typeBonus = 0;
    if (position.type === 'Führung' && profile.scores.vertrieb > 80) typeBonus = 5;
    if (position.type === 'Einstieg' && profile.scores.vertrieb < 70) typeBonus = 8;
    if (position.type === 'Einstieg' && base < 50) typeBonus = 5;
    return Math.max(15, Math.min(98, Math.round(base - distPenalty + typeBonus + (Math.random() * 6 - 3))));
}

export function getHPMatchBadges(profile, position) {
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

export function anonymizeText(text, applicant) {
    if (!text || !applicant) return text;
    let result = text;
    if (applicant.name) result = result.replace(new RegExp(applicant.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 'Kandidat/in');
    const parts = (applicant.name || '').split(' ');
    if (parts.length >= 2) {
        const lastName = parts[parts.length - 1];
        result = result.replace(new RegExp('(?:Herr|Frau)\\s+' + lastName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 'Kandidat/in');
        result = result.replace(new RegExp(lastName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 'Kandidat/in');
    }
    if (applicant.city) result = result.replace(new RegExp(applicant.city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), applicant.region?.toUpperCase() || 'Region');
    if (applicant.age) result = result.replace(new RegExp(applicant.age + '\\s*Jahre', 'g'), '— Jahre');
    return result;
}
