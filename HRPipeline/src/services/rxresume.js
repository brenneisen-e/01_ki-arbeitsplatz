/**
 * rxresume.js — Erstellt Demo-CVs auf rxresu.me via OpenAPI
 * Authentifizierung: x-api-key Header
 * Gespeicherte PDF-URLs werden in localStorage abgelegt.
 */

const API_BASE = 'https://rxresu.me/api/openapi';
const API_KEY = 'uEsOtWYyUGGtKgwItLRGnfrAnKtBWnJpfCyKNyoHQBCCUQaDyzeLefgNyNgukpUB';
const STORAGE_KEY = 'hr_rxresume_cv_urls';

const uid = () => crypto.randomUUID();

const H = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
};

async function apiCall(method, path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: H,
        body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`${method} ${path} → HTTP ${res.status}: ${text}`);
    try { return JSON.parse(text); } catch { return text; }
}

function emptySection(id, name) {
    return { name, columns: 1, separateLinks: true, visible: false, id, items: [] };
}

function pic() {
    return {
        url: '', size: 64, aspectRatio: 1, borderRadius: 0,
        borderColor: 'rgba(0,0,0,1)', borderWidth: 0,
        shadowColor: 'rgba(0,0,0,0)', shadowWidth: 0, rotation: 0,
        effects: { hidden: false, border: false, grayscale: false },
    };
}

function meta(primary = '#1d4ed8') {
    return {
        template: 'onyx',
        layout: [[
            ['summary', 'experience', 'education', 'certifications'],
            ['profiles', 'skills', 'languages'],
        ]],
        css: { value: '', visible: false },
        page: { margin: 18, format: 'a4', options: { breakLine: true, pageNumbers: true } },
        theme: { background: '#ffffff', text: '#000000', primary },
        typography: {
            font: { family: 'IBM Plex Serif', subset: 'latin', variants: ['regular', '600'], size: 14 },
            lineHeight: 1.5,
            hideIcons: false,
            underlineLinks: true,
        },
        notes: '',
    };
}

// ── CV 1: Max Berger – Industriekaufmann ──────────────────────────────────────
function buildMaxBerger() {
    return {
        basics: {
            name: 'Max Berger',
            headline: 'Industriekaufmann | Key Account & Vertriebsinnendienst',
            email: 'max.berger@example.com',
            phone: '+49 211 555 1234',
            location: 'Düsseldorf, Deutschland',
            website: { url: '', label: '' },
            customFields: [],
            picture: pic(),
        },
        sections: {
            summary: {
                name: 'Profil', columns: 1, separateLinks: true, visible: true, id: 'summary',
                content: '<p>Erfahrener Industriekaufmann mit 8 Jahren Berufserfahrung im Key Account Management und Vertriebsinnendienst. Bestandsportfolio von 2,4 Mio. € Umsatz, Führungserfahrung über 3 Mitarbeiter und durchschnittliche Zielerreichung von 115 %. Nachgewiesene Stärken in Angebotserstellung, Preisverhandlung und strategischer Kundenentwicklung im B2B-Umfeld.</p>',
            },
            experience: {
                name: 'Berufserfahrung', columns: 1, separateLinks: true, visible: true, id: 'experience',
                items: [
                    {
                        id: uid(), hidden: false,
                        company: 'Henkel AG & Co. KGaA',
                        position: 'Key Account Manager – Industrievertrieb',
                        location: 'Düsseldorf',
                        period: { startDate: '2019-03', endDate: '' },
                        website: { url: 'https://www.henkel.de', label: 'Henkel' },
                        description: '<ul><li>Betreuung eines Bestandsportfolios mit 2,4 Mio. € Jahresumsatz (Chemie, Automotive, Maschinenbau)</li><li>Steuerung und Entwicklung eines 3-köpfigen Innendienstteams</li><li>Ø 115 % Zielerreichung über fünf Geschäftsjahre</li><li>Neukundenakquise und Angebotserstellung im B2B-Segment</li><li>Preisverhandlung und Vertragsgestaltung auf Einkäuferebene</li></ul>',
                        roles: [],
                    },
                    {
                        id: uid(), hidden: false,
                        company: 'Thyssenkrupp Materials Services GmbH',
                        position: 'Sachbearbeiter Vertriebsinnendienst',
                        location: 'Essen',
                        period: { startDate: '2016-09', endDate: '2019-02' },
                        website: { url: 'https://www.thyssenkrupp-materials.com', label: 'Thyssenkrupp' },
                        description: '<ul><li>Auftragsabwicklung und Angebotserstellung für Industriekunden</li><li>Koordination zwischen Einkauf, Logistik und Außendienst</li><li>Pflege von Kundenstammdaten im CRM-System (Salesforce)</li><li>Reklamationsbearbeitung und Kundenzufriedenheitsmanagement</li></ul>',
                        roles: [],
                    },
                ],
            },
            education: {
                name: 'Ausbildung & Studium', columns: 1, separateLinks: true, visible: true, id: 'education',
                items: [
                    {
                        id: uid(), hidden: false,
                        school: 'Fachhochschule Düsseldorf',
                        degree: 'Bachelor of Arts',
                        area: 'Betriebswirtschaftslehre',
                        grade: '',
                        location: 'Düsseldorf',
                        period: { startDate: '2013-10', endDate: '2016-08' },
                        website: { url: '', label: '' },
                        description: '<p>Schwerpunkt: Marketing & Vertriebsmanagement · DQR 6</p>',
                    },
                    {
                        id: uid(), hidden: false,
                        school: 'Robert Bosch GmbH',
                        degree: 'Ausbildung',
                        area: 'Industriekaufmann (IHK)',
                        grade: 'Gut (81 Punkte)',
                        location: 'Düsseldorf',
                        period: { startDate: '2010-09', endDate: '2013-07' },
                        website: { url: '', label: '' },
                        description: '',
                    },
                ],
            },
            certifications: {
                name: 'Zertifikate & Qualifikationen', columns: 1, separateLinks: true, visible: true, id: 'certifications',
                items: [
                    { id: uid(), hidden: false, title: 'IHK Industriekaufmann (DQR 4)', issuer: 'IHK Düsseldorf', date: '2013-07', website: { url: '', label: '' }, description: '' },
                    { id: uid(), hidden: false, title: 'BWL Bachelor of Arts (DQR 6)', issuer: 'FH Düsseldorf', date: '2016-08', website: { url: '', label: '' }, description: '' },
                    { id: uid(), hidden: false, title: 'Salesforce Certified Sales Representative', issuer: 'Salesforce', date: '2021-03', website: { url: '', label: '' }, description: '' },
                ],
            },
            skills: {
                name: 'Kenntnisse', columns: 1, separateLinks: true, visible: true, id: 'skills',
                items: [
                    { id: uid(), hidden: false, name: 'Key Account Management', level: 5, proficiency: 'Expert', icon: '', keywords: [] },
                    { id: uid(), hidden: false, name: 'SAP SD / MM', level: 4, proficiency: 'Advanced', icon: '', keywords: [] },
                    { id: uid(), hidden: false, name: 'Salesforce CRM', level: 4, proficiency: 'Advanced', icon: '', keywords: [] },
                    { id: uid(), hidden: false, name: 'Angebots- & Preisgestaltung', level: 5, proficiency: 'Expert', icon: '', keywords: [] },
                    { id: uid(), hidden: false, name: 'Teamführung', level: 4, proficiency: 'Advanced', icon: '', keywords: [] },
                    { id: uid(), hidden: false, name: 'MS Office (Excel, PowerPoint)', level: 5, proficiency: 'Expert', icon: '', keywords: [] },
                ],
            },
            profiles: {
                name: 'Profile', columns: 4, separateLinks: true, visible: true, id: 'profiles',
                items: [
                    { id: uid(), hidden: false, network: 'LinkedIn', username: 'maxberger-dus', website: { url: 'https://linkedin.com/in/maxberger-dus', label: 'LinkedIn' }, icon: 'PhLinkedinLogo' },
                ],
            },
            languages: {
                name: 'Sprachen', columns: 1, separateLinks: true, visible: true, id: 'languages',
                items: [
                    { id: uid(), hidden: false, language: 'Deutsch', fluency: 'Muttersprache', level: 5 },
                    { id: uid(), hidden: false, language: 'Englisch', fluency: 'Verhandlungssicher (C1)', level: 4 },
                ],
            },
            awards: emptySection('awards', 'Auszeichnungen'),
            publications: emptySection('publications', 'Publikationen'),
            volunteer: emptySection('volunteer', 'Ehrenamt'),
            references: emptySection('references', 'Referenzen'),
            projects: emptySection('projects', 'Projekte'),
            interests: emptySection('interests', 'Interessen'),
        },
        metadata: meta('#1d4ed8'),
    };
}

// ── CV 2: Sarah Klein – Quereinsteigerin ──────────────────────────────────────
function buildSarahKlein() {
    return {
        basics: {
            name: 'Sarah Klein',
            headline: 'Teamleiterin Einzelhandel | Vertrieb & Kundenberatung',
            email: 'sarah.klein@example.com',
            phone: '+49 221 555 6789',
            location: 'Köln, Deutschland',
            website: { url: '', label: '' },
            customFields: [],
            picture: pic(),
        },
        sections: {
            summary: {
                name: 'Profil', columns: 1, separateLinks: true, visible: true, id: 'summary',
                content: '<p>Motivierte Vertriebspersönlichkeit mit 4 Jahren Erfahrung im Einzelhandel, davon 2 Jahre als Teamleiterin (5 Mitarbeiter) bei MediaMarkt. Ausgeprägte Kommunikationsstärke, nachgewiesene Beratungskompetenz und Freude am Kundenkontakt. Aktiv auf der Suche nach einer Herausforderung im B2C- oder B2B-Vertrieb.</p>',
            },
            experience: {
                name: 'Berufserfahrung', columns: 1, separateLinks: true, visible: true, id: 'experience',
                items: [
                    {
                        id: uid(), hidden: false,
                        company: 'MediaMarkt Saturn Retail Group',
                        position: 'Teamleiterin Verkauf – Unterhaltungselektronik',
                        location: 'Köln',
                        period: { startDate: '2022-04', endDate: '' },
                        website: { url: '', label: '' },
                        description: '<ul><li>Führung und Motivation eines 5-köpfigen Verkaufsteams</li><li>Verantwortung für Abteilungsumsatz und Zielerreichung (Ø 108 %)</li><li>Schulung neuer Mitarbeiter in Produktberatung und Verkaufstechniken</li><li>Reklamations- und Beschwerdemanagement</li><li>Umsetzung von Visual-Merchandising-Konzepten</li></ul>',
                        roles: [],
                    },
                    {
                        id: uid(), hidden: false,
                        company: 'MediaMarkt Saturn Retail Group',
                        position: 'Verkaufsberaterin – Smartphones & Zubehör',
                        location: 'Köln',
                        period: { startDate: '2020-09', endDate: '2022-03' },
                        website: { url: '', label: '' },
                        description: '<ul><li>Aktive Kundenberatung und Verkauf im Bereich Smartphones & Zubehör</li><li>Kassenbetrieb und Tagesabschluss</li><li>Bestandspflege und Wareneingangskontrolle</li></ul>',
                        roles: [],
                    },
                ],
            },
            education: {
                name: 'Ausbildung & Weiterbildung', columns: 1, separateLinks: true, visible: true, id: 'education',
                items: [
                    {
                        id: uid(), hidden: false,
                        school: 'IHK Köln',
                        degree: 'Weiterbildungszertifikat',
                        area: 'Vertrieb & Kundenkommunikation',
                        grade: '',
                        location: 'Köln',
                        period: { startDate: '2023-01', endDate: '2023-06' },
                        website: { url: '', label: '' },
                        description: '',
                    },
                    {
                        id: uid(), hidden: false,
                        school: 'MediaMarkt Ausbildungszentrum',
                        degree: 'Ausbildung',
                        area: 'Einzelhandelskauffrau (IHK)',
                        grade: '',
                        location: 'Köln',
                        period: { startDate: '2017-09', endDate: '2020-08' },
                        website: { url: '', label: '' },
                        description: '',
                    },
                ],
            },
            certifications: {
                name: 'Qualifikationen', columns: 1, separateLinks: true, visible: true, id: 'certifications',
                items: [
                    { id: uid(), hidden: false, title: 'Einzelhandelskauffrau (DQR 4)', issuer: 'IHK Köln', date: '2020-08', website: { url: '', label: '' }, description: '' },
                    { id: uid(), hidden: false, title: 'Weiterbildung Vertrieb & Kommunikation', issuer: 'IHK Köln', date: '2023-06', website: { url: '', label: '' }, description: '' },
                ],
            },
            skills: {
                name: 'Kenntnisse', columns: 1, separateLinks: true, visible: true, id: 'skills',
                items: [
                    { id: uid(), hidden: false, name: 'Teamführung', level: 4, proficiency: 'Advanced', icon: '', keywords: [] },
                    { id: uid(), hidden: false, name: 'Kundenberatung / B2C-Vertrieb', level: 5, proficiency: 'Expert', icon: '', keywords: [] },
                    { id: uid(), hidden: false, name: 'Reklamationsmanagement', level: 4, proficiency: 'Advanced', icon: '', keywords: [] },
                    { id: uid(), hidden: false, name: 'Kassensysteme (SAP POS)', level: 4, proficiency: 'Advanced', icon: '', keywords: [] },
                    { id: uid(), hidden: false, name: 'Visual Merchandising', level: 3, proficiency: 'Intermediate', icon: '', keywords: [] },
                    { id: uid(), hidden: false, name: 'MS Office', level: 3, proficiency: 'Intermediate', icon: '', keywords: [] },
                ],
            },
            profiles: {
                name: 'Profile', columns: 4, separateLinks: true, visible: true, id: 'profiles',
                items: [
                    { id: uid(), hidden: false, network: 'LinkedIn', username: 'sarahklein-koeln', website: { url: 'https://linkedin.com/in/sarahklein-koeln', label: 'LinkedIn' }, icon: 'PhLinkedinLogo' },
                ],
            },
            languages: {
                name: 'Sprachen', columns: 1, separateLinks: true, visible: true, id: 'languages',
                items: [
                    { id: uid(), hidden: false, language: 'Deutsch', fluency: 'Muttersprache', level: 5 },
                    { id: uid(), hidden: false, language: 'Englisch', fluency: 'Gute Kenntnisse (B2)', level: 3 },
                ],
            },
            awards: emptySection('awards', 'Auszeichnungen'),
            publications: emptySection('publications', 'Publikationen'),
            volunteer: emptySection('volunteer', 'Ehrenamt'),
            references: emptySection('references', 'Referenzen'),
            projects: emptySection('projects', 'Projekte'),
            interests: emptySection('interests', 'Interessen'),
        },
        metadata: meta('#16a34a'),
    };
}

// ── CV 3: Thomas Wendt – Verwaltungsfachangestellter ─────────────────────────
function buildThomasWendt() {
    return {
        basics: {
            name: 'Thomas Wendt',
            headline: 'Verwaltungsfachangestellter | Kommunalverwaltung',
            email: 'thomas.wendt@example.com',
            phone: '+49 461 555 9012',
            location: 'Flensburg, Deutschland',
            website: { url: '', label: '' },
            customFields: [],
            picture: pic(),
        },
        sections: {
            summary: {
                name: 'Profil', columns: 1, separateLinks: true, visible: true, id: 'summary',
                content: '<p>Erfahrener Verwaltungsfachangestellter mit 20 Jahren Berufserfahrung in der Kommunalverwaltung. Fundierte Kenntnisse in Sachbearbeitung, Dokumentenmanagement und der Anwendung einschlägiger Verwaltungsvorschriften. Sucht nach einer neuen beruflichen Herausforderung außerhalb des öffentlichen Dienstes.</p>',
            },
            experience: {
                name: 'Berufserfahrung', columns: 1, separateLinks: true, visible: true, id: 'experience',
                items: [
                    {
                        id: uid(), hidden: false,
                        company: 'Stadt Flensburg – Ordnungsamt',
                        position: 'Sachbearbeiter',
                        location: 'Flensburg',
                        period: { startDate: '2012-01', endDate: '' },
                        website: { url: '', label: '' },
                        description: '<ul><li>Bearbeitung von Anträgen und Verwaltungsvorgängen nach VwGO und BGB</li><li>Schriftverkehr mit Bürgern, Behörden und Dienstleistern</li><li>Dokumentenmanagement und Aktenführung</li><li>Anwendung kommunaler IT-Systeme (SAP R/3)</li></ul>',
                        roles: [],
                    },
                    {
                        id: uid(), hidden: false,
                        company: 'Stadt Flensburg – Einwohnermeldeamt',
                        position: 'Sachbearbeiter',
                        location: 'Flensburg',
                        period: { startDate: '2006-03', endDate: '2011-12' },
                        website: { url: '', label: '' },
                        description: '<ul><li>An- und Abmeldung von Einwohnern, Ausstellung von Meldebescheinigungen</li><li>Bearbeitung von Passanträgen und Personalausweisen</li><li>Bürgerberatung am Schalter</li></ul>',
                        roles: [],
                    },
                    {
                        id: uid(), hidden: false,
                        company: 'Kreis Schleswig-Flensburg',
                        position: 'Verwaltungsangestellter',
                        location: 'Schleswig',
                        period: { startDate: '2004-08', endDate: '2006-02' },
                        website: { url: '', label: '' },
                        description: '<ul><li>Allgemeine Verwaltungsaufgaben und Sachbearbeitung</li><li>Datenpflege in kommunalen IT-Systemen</li></ul>',
                        roles: [],
                    },
                ],
            },
            education: {
                name: 'Ausbildung', columns: 1, separateLinks: true, visible: true, id: 'education',
                items: [
                    {
                        id: uid(), hidden: false,
                        school: 'Stadt Flensburg / Berufsschule Flensburg',
                        degree: 'Ausbildung',
                        area: 'Verwaltungsfachangestellter (DQR 4)',
                        grade: '',
                        location: 'Flensburg',
                        period: { startDate: '2001-08', endDate: '2004-07' },
                        website: { url: '', label: '' },
                        description: '',
                    },
                ],
            },
            certifications: {
                name: 'Qualifikationen', columns: 1, separateLinks: true, visible: true, id: 'certifications',
                items: [
                    { id: uid(), hidden: false, title: 'Verwaltungsfachangestellter (DQR 4)', issuer: 'Stadt Flensburg', date: '2004-07', website: { url: '', label: '' }, description: '' },
                ],
            },
            skills: {
                name: 'Kenntnisse', columns: 1, separateLinks: true, visible: true, id: 'skills',
                items: [
                    { id: uid(), hidden: false, name: 'Verwaltungsrecht (VwGO, BGB)', level: 5, proficiency: 'Expert', icon: '', keywords: [] },
                    { id: uid(), hidden: false, name: 'Aktenführung & Dokumentation', level: 5, proficiency: 'Expert', icon: '', keywords: [] },
                    { id: uid(), hidden: false, name: 'SAP R/3', level: 3, proficiency: 'Intermediate', icon: '', keywords: [] },
                    { id: uid(), hidden: false, name: 'MS Office (Word, Excel)', level: 3, proficiency: 'Intermediate', icon: '', keywords: [] },
                    { id: uid(), hidden: false, name: 'Bürgerservice & Beratung', level: 4, proficiency: 'Advanced', icon: '', keywords: [] },
                ],
            },
            profiles: {
                name: 'Profile', columns: 4, separateLinks: true, visible: true, id: 'profiles',
                items: [],
            },
            languages: {
                name: 'Sprachen', columns: 1, separateLinks: true, visible: true, id: 'languages',
                items: [
                    { id: uid(), hidden: false, language: 'Deutsch', fluency: 'Muttersprache', level: 5 },
                ],
            },
            awards: emptySection('awards', 'Auszeichnungen'),
            publications: emptySection('publications', 'Publikationen'),
            volunteer: emptySection('volunteer', 'Ehrenamt'),
            references: emptySection('references', 'Referenzen'),
            projects: emptySection('projects', 'Projekte'),
            interests: emptySection('interests', 'Interessen'),
        },
        metadata: meta('#dc2626'),
    };
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Liest gespeicherte CV-URLs aus localStorage. */
export function loadCvUrls() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch { return {}; }
}

/** Speichert CV-URLs in localStorage. */
export function saveCvUrls(urls) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
}

/** Löscht gespeicherte CV-URLs (zum Neu-Erstellen). */
export function clearCvUrls() {
    localStorage.removeItem(STORAGE_KEY);
}

const CV_DEFINITIONS = [
    { key: 'max', label: 'Max Berger', build: buildMaxBerger },
    { key: 'sarah', label: 'Sarah Klein', build: buildSarahKlein },
    { key: 'thomas', label: 'Thomas Wendt', build: buildThomasWendt },
];

/**
 * Erstellt alle 3 CVs auf rxresu.me und gibt ein Objekt { max, sarah, thomas }
 * mit den jeweiligen PDF-URLs zurück. Ruft onProgress(key, status) auf.
 */
export async function createAllCVs(onProgress) {
    const urls = {};

    for (const def of CV_DEFINITIONS) {
        onProgress?.(def.key, 'creating');
        try {
            // 1. Resume via Import-Endpunkt anlegen
            const data = def.build();
            const created = await apiCall('POST', '/resumes/import', { data });
            const id = typeof created === 'string' ? created : (created.id ?? created);

            onProgress?.(def.key, 'pdf');

            // 2. PDF-URL abrufen
            let pdfUrl = null;
            try {
                const pdfRes = await apiCall('GET', `/resumes/${id}/pdf`);
                pdfUrl = typeof pdfRes === 'string' ? pdfRes : (pdfRes.url ?? null);
            } catch {
                // PDF-Generierung kann etwas dauern – URL als null belassen
            }

            urls[def.key] = pdfUrl;
            onProgress?.(def.key, 'done', pdfUrl);
        } catch (err) {
            onProgress?.(def.key, 'error', null, err.message);
            urls[def.key] = null;
        }
    }

    saveCvUrls(urls);
    return urls;
}
