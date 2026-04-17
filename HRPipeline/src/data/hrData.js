// Mode-aware HR data resolver
// Returns the correct positions / profiles / applicants and labels based on institut.mode

import { HP_POSITIONS } from './positions.js';
import { HP_PROFILES } from './profiles.js';
import { HP_ALL_APPLICANTS } from './applicants.js';
import { HP_POSITIONS_GENERIC } from './positionsGeneric.js';
import { HP_PROFILES_GENERIC } from './profilesGeneric.js';
import { HP_ALL_APPLICANTS_GENERIC } from './applicantsGeneric.js';

// Extended distances across both modes (insurance and generic cities)
export const HP_DISTANCES_EXT = {
    // NRW
    'Düsseldorf':  { 'Düsseldorf': 0,   'Köln': 40,  'Essen': 30,  'Dortmund': 60,  'Bonn': 75,  'Münster': 125, 'Hamburg': 410, 'Berlin': 570, 'Frankfurt': 230, 'München': 630, 'Stuttgart': 420, 'Bremen': 320, 'Flensburg': 530 },
    'Köln':        { 'Düsseldorf': 40,  'Köln': 0,   'Essen': 65,  'Dortmund': 90,  'Bonn': 30,  'Münster': 150, 'Hamburg': 430, 'Berlin': 580, 'Frankfurt': 190, 'München': 580, 'Stuttgart': 370, 'Bremen': 370, 'Flensburg': 570 },
    'Essen':       { 'Düsseldorf': 30,  'Köln': 65,  'Essen': 0,   'Dortmund': 35,  'Bonn': 95,  'Münster': 100, 'Hamburg': 390, 'Berlin': 540, 'Frankfurt': 250, 'München': 620, 'Stuttgart': 430, 'Bremen': 310, 'Flensburg': 500 },
    'Dortmund':    { 'Düsseldorf': 60,  'Köln': 90,  'Essen': 35,  'Dortmund': 0,   'Bonn': 120, 'Münster': 65,  'Hamburg': 360, 'Berlin': 500, 'Frankfurt': 240, 'München': 610, 'Stuttgart': 420, 'Bremen': 280, 'Flensburg': 470 },
    'Bonn':        { 'Düsseldorf': 75,  'Köln': 30,  'Essen': 95,  'Dortmund': 120, 'Bonn': 0,   'Münster': 180, 'Hamburg': 460, 'Berlin': 600, 'Frankfurt': 165, 'München': 570, 'Stuttgart': 350, 'Bremen': 400, 'Flensburg': 600 },
    'Münster':     { 'Düsseldorf': 125, 'Köln': 150, 'Essen': 100, 'Dortmund': 65,  'Bonn': 180, 'Münster': 0,   'Hamburg': 290, 'Berlin': 480, 'Frankfurt': 310, 'München': 670, 'Stuttgart': 480, 'Bremen': 180, 'Flensburg': 400 },
    // Nord
    'Hamburg':     { 'Düsseldorf': 410, 'Köln': 430, 'Essen': 390, 'Dortmund': 360, 'Bonn': 460, 'Münster': 290, 'Hamburg': 0,   'Berlin': 290, 'Frankfurt': 500, 'München': 780, 'Stuttgart': 650, 'Bremen': 120, 'Flensburg': 155 },
    'Bremen':      { 'Düsseldorf': 340, 'Köln': 370, 'Essen': 310, 'Dortmund': 280, 'Bonn': 390, 'Münster': 220, 'Hamburg': 120, 'Berlin': 400, 'Frankfurt': 440, 'München': 740, 'Stuttgart': 610, 'Bremen': 0,   'Flensburg': 270 },
    'Flensburg':   { 'Düsseldorf': 530, 'Köln': 570, 'Essen': 500, 'Dortmund': 470, 'Bonn': 600, 'Münster': 400, 'Hamburg': 155, 'Berlin': 440, 'Frankfurt': 650, 'München': 930, 'Stuttgart': 800, 'Bremen': 270, 'Flensburg': 0 },
    // Berlin
    'Berlin':      { 'Düsseldorf': 570, 'Köln': 580, 'Essen': 540, 'Dortmund': 500, 'Bonn': 600, 'Münster': 480, 'Hamburg': 290, 'Berlin': 0,   'Frankfurt': 550, 'München': 590, 'Stuttgart': 630, 'Bremen': 400, 'Flensburg': 440 },
    // Hessen
    'Frankfurt':   { 'Düsseldorf': 230, 'Köln': 190, 'Essen': 250, 'Dortmund': 240, 'Bonn': 165, 'Münster': 310, 'Hamburg': 500, 'Berlin': 550, 'Frankfurt': 0,   'München': 390, 'Stuttgart': 210, 'Bremen': 440, 'Flensburg': 650 },
    // Bayern
    'München':     { 'Düsseldorf': 630, 'Köln': 580, 'Essen': 620, 'Dortmund': 610, 'Bonn': 570, 'Münster': 670, 'Hamburg': 780, 'Berlin': 590, 'Frankfurt': 390, 'München': 0,   'Stuttgart': 230, 'Bremen': 740, 'Flensburg': 930 },
    // Baden
    'Stuttgart':   { 'Düsseldorf': 420, 'Köln': 370, 'Essen': 430, 'Dortmund': 420, 'Bonn': 350, 'Münster': 480, 'Hamburg': 650, 'Berlin': 630, 'Frankfurt': 210, 'München': 230, 'Stuttgart': 0,   'Bremen': 610, 'Flensburg': 800 }
};

export const HP_REGION_OPTIONS = {
    insurance: [
        { value: '', label: 'Alle Regionen' },
        { value: 'nrw', label: 'Nordrhein-Westfalen' },
        { value: 'nord', label: 'Norddeutschland' },
        { value: 'sued', label: 'Süddeutschland' }
    ],
    generic: [
        { value: '', label: 'Alle Regionen' },
        { value: 'berlin', label: 'Berlin' },
        { value: 'nrw', label: 'Nordrhein-Westfalen' },
        { value: 'nord', label: 'Norddeutschland' },
        { value: 'hessen', label: 'Hessen / Rhein-Main' },
        { value: 'bayern', label: 'Bayern' },
        { value: 'baden', label: 'Baden-Württemberg' }
    ]
};

export const HP_SCORE_LABELS = {
    insurance: {
        dimensions: ['Vertrieb', 'Branche', 'Qualifikation', 'Standort', 'Soft Skills'],
        weighted: [
            { label: 'Vertriebserfahrung (30%)', key: 'vertrieb' },
            { label: 'Branchenkenntnis (25%)', key: 'branche' },
            { label: 'Qualifikation (20%)', key: 'qualifikation' },
            { label: 'Standort-Match (15%)', key: 'standort' },
            { label: 'Soft Skills (10%)', key: 'softskills' }
        ],
        indicatorsLabel: 'Versicherungs-Indikatoren'
    },
    generic: {
        dimensions: ['Berufserfahrung', 'Fachkompetenz', 'Qualifikation', 'Standort', 'Soft Skills'],
        weighted: [
            { label: 'Berufserfahrung (30%)', key: 'vertrieb' },
            { label: 'Fachkompetenz (25%)', key: 'branche' },
            { label: 'Qualifikation (20%)', key: 'qualifikation' },
            { label: 'Standort-Match (15%)', key: 'standort' },
            { label: 'Soft Skills (10%)', key: 'softskills' }
        ],
        indicatorsLabel: 'Profil-Indikatoren'
    }
};

export const HP_UI_TEXTS = {
    insurance: {
        portalTitle: 'Karriereportal',
        landingSubtitle: 'Finden Sie Ihre ideale Vertriebsposition bei einem der führenden Versicherungsunternehmen Deutschlands. Unsere KI analysiert Ihren Lebenslauf und findet die besten Stellen für Sie — in Sekunden.',
        positionsTeaserHeading: 'Aktuelle Vertriebspositionen',
        statsFocusRegion: 'NRW',
        statsFocusLabel: 'Schwerpunkt Region',
        loadingSteps: [
            { pct: 10, text: 'Dokument wird verarbeitet...' },
            { pct: 22, text: 'Textextraktion läuft...' },
            { pct: 35, text: 'Qualifikationen werden erkannt (§34d, IHK, Fachwirt)...' },
            { pct: 48, text: 'Versicherungs-Branchenerfahrung wird analysiert...' },
            { pct: 60, text: 'Quellen-Mapping wird erstellt...' },
            { pct: 72, text: 'LinkedIn-Profil wird analysiert...' },
            { pct: 82, text: 'Social-Media-Netzwerk wird ausgewertet...' },
            { pct: 90, text: 'Stellenabgleich wird durchgeführt...' },
            { pct: 96, text: 'SHAP-Erklärung wird generiert...' },
            { pct: 100, text: 'Analyse abgeschlossen!' }
        ],
        demoProfiles: [
            { id: 'max', initials: 'MB', name: 'Max Berger', role: 'Top-Kandidat', score: 'high', title: 'Agenturleiter / AO-Vertrieb', cvPdf: null },
            { id: 'sarah', initials: 'SK', name: 'Sarah Klein', role: 'Quereinsteigerin', score: 'mid', title: 'Teamleiterin Einzelhandel → Vertrieb', cvPdf: null },
            { id: 'thomas', initials: 'TW', name: 'Thomas Wendt', role: 'Ablehnung', score: 'low', title: 'Sachbearbeiter Verwaltung', cvPdf: null }
        ],
        defaultProfileId: 'max',
        teaserPositionIds: [1, 2, 5, 7],
        chatBotName: 'ERGO KI-Recruiting-Assistent'
    },
    generic: {
        portalTitle: 'Karriereportal',
        landingSubtitle: 'Finden Sie Ihre nächste Rolle bei der Zukunfts AG — funktionsübergreifend in HR, Finance, IT, Marketing, Operations oder Data. Unsere KI analysiert Ihren Lebenslauf und findet die passenden Stellen für Sie — in Sekunden.',
        positionsTeaserHeading: 'Aktuelle offene Positionen',
        statsFocusRegion: 'DACH',
        statsFocusLabel: 'Schwerpunkt Region',
        loadingSteps: [
            { pct: 10, text: 'Dokument wird verarbeitet...' },
            { pct: 22, text: 'Textextraktion läuft...' },
            { pct: 35, text: 'Ausbildung und Zertifikate werden erkannt...' },
            { pct: 48, text: 'Berufserfahrung und Fachkompetenzen werden analysiert...' },
            { pct: 60, text: 'Quellen-Mapping wird erstellt...' },
            { pct: 72, text: 'LinkedIn-Profil wird analysiert...' },
            { pct: 82, text: 'Social-Media-Netzwerk wird ausgewertet...' },
            { pct: 90, text: 'Stellenabgleich über alle Jobfamilien wird durchgeführt...' },
            { pct: 96, text: 'SHAP-Erklärung wird generiert...' },
            { pct: 100, text: 'Analyse abgeschlossen!' }
        ],
        demoProfiles: [
            { id: 'laura', initials: 'LS', name: 'Laura Schneider', role: 'Top-Kandidatin (HR)', score: 'high', title: 'Senior HR Business Partner · Berlin', cvPdf: './cv/laura-schneider-cv.pdf' },
            { id: 'jonas', initials: 'JW', name: 'Jonas Weber', role: 'Career Switcher (Data)', score: 'mid', title: 'Business Analyst → Data Analyst · Köln', cvPdf: './cv/jonas-weber-cv.pdf' },
            { id: 'peter', initials: 'PS', name: 'Peter Schmitt', role: 'Ablehnung', score: 'low', title: 'Produktionsmitarbeiter · Flensburg', cvPdf: './cv/peter-schmitt-cv.pdf' }
        ],
        defaultProfileId: 'laura',
        teaserPositionIds: [1, 2, 3, 7],
        chatBotName: 'Zukunfts AG KI-Recruiting-Assistent'
    }
};

export function getHRData(mode) {
    const m = mode === 'generic' ? 'generic' : 'insurance';
    return {
        mode: m,
        positions: m === 'generic' ? HP_POSITIONS_GENERIC : HP_POSITIONS,
        profiles: m === 'generic' ? HP_PROFILES_GENERIC : HP_PROFILES,
        applicants: m === 'generic' ? HP_ALL_APPLICANTS_GENERIC : HP_ALL_APPLICANTS,
        scoreLabels: HP_SCORE_LABELS[m],
        ui: HP_UI_TEXTS[m],
        regionOptions: HP_REGION_OPTIONS[m]
    };
}

// Adjacency groups for "related but not identical" job families.
// Partial match gives a softer penalty than a full mismatch.
const JOB_FAMILY_ADJACENCY = {
    'Human Resources':   ['Human Resources'],
    'Finance':           ['Finance', 'Data & Analytics'],
    'Tech & IT':         ['Tech & IT', 'Data & Analytics'],
    'Marketing':         ['Marketing'],
    'Operations':        ['Operations', 'Finance'],
    'Data & Analytics':  ['Data & Analytics', 'Finance', 'Tech & IT']
};

// Returns a penalty in total-score points based on how far the profile's job
// family is from the position's job family. Only used in generic mode where
// positions span multiple functions.
function jobFamilyPenalty(profile, position) {
    if (!position.jobFamily) return 0;
    const affinities = profile.jobFamilyAffinities || (profile.jobFamily ? [profile.jobFamily] : []);
    if (!affinities.length) return 25;
    if (affinities.includes(position.jobFamily)) return 0;
    // Check adjacency (e.g. Data Analyst is adjacent to Finance)
    const profileFamily = profile.jobFamily || affinities[0];
    const adjacents = JOB_FAMILY_ADJACENCY[profileFamily] || [profileFamily];
    if (adjacents.includes(position.jobFamily)) return 18;
    return 35;
}

// Mode-aware match score. Accepts an optional `mode` arg so the generic mode
// can add a job-family fit component on top of distance and type heuristics.
export function getHPMatchScoreExt(profile, position, mode) {
    const base = profile.totalScore;
    const dist = HP_DISTANCES_EXT[profile.city]?.[position.city] ?? 300;
    const distPenalty = Math.min(dist / 20, 15);
    let typeBonus = 0;
    if (position.type === 'Führung' && profile.scores.vertrieb > 80) typeBonus = 5;
    if (position.type === 'Einstieg' && profile.scores.vertrieb < 70) typeBonus = 8;
    if (position.type === 'Einstieg' && base < 50) typeBonus = 5;
    const familyPenalty = mode === 'generic' ? jobFamilyPenalty(profile, position) : 0;
    return Math.max(15, Math.min(98, Math.round(base - distPenalty - familyPenalty + typeBonus + (Math.random() * 6 - 3))));
}

export function getHPMatchBadgesExt(profile, position, mode) {
    const badges = [];
    const dist = HP_DISTANCES_EXT[profile.city]?.[position.city] ?? 300;
    if (mode === 'generic' && position.jobFamily) {
        const affinities = profile.jobFamilyAffinities || (profile.jobFamily ? [profile.jobFamily] : []);
        if (affinities.includes(position.jobFamily)) {
            badges.push({ text: 'Job-Family-Match', color: 'green' });
        } else {
            const profileFamily = profile.jobFamily || affinities[0];
            const adjacents = JOB_FAMILY_ADJACENCY[profileFamily] || [];
            if (adjacents.includes(position.jobFamily)) {
                badges.push({ text: 'Angrenzende Jobfamilie', color: 'orange' });
            } else {
                badges.push({ text: 'Andere Jobfamilie', color: 'orange' });
            }
        }
    }
    if (dist <= 50) badges.push({ text: 'Wohnortnähe', color: 'green' });
    if (profile.scores.branche > 70) badges.push({ text: mode === 'generic' ? 'Fachkompetenz' : 'Branchenerfahrung', color: 'blue' });
    if (profile.scores.vertrieb > 80) badges.push({ text: mode === 'generic' ? 'Senior-Erfahrung' : 'Vertriebserfahrung', color: 'blue' });
    if (profile.scores.softskills > 75) badges.push({ text: 'Kommunikationsstärke', color: 'green' });
    if (profile.scores.qualifikation > 80) badges.push({ text: mode === 'generic' ? 'Hoch qualifiziert' : 'IHK-qualifiziert', color: 'blue' });
    if (position.type === 'Führung' && (profile.strengths || []).some(s => s.includes('Führung'))) badges.push({ text: 'Führungskompetenz', color: 'green' });
    if (position.type === 'Einstieg') badges.push({ text: 'Einstiegsposition', color: 'orange' });
    return badges.slice(0, 4);
}
