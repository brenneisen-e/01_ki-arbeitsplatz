/**
 * rxresume.js — Erstellt Demo-CVs auf rxresu.me via OpenAPI (v4 Schema)
 * Proxy: /api/rxresume (Cloudflare Pages Function, umgeht CORS)
 *
 * Bestätigte v4-Änderungen (aus API-Fehlern abgeleitet):
 *  - data.picture  → top-level in data (nicht in basics)
 *  - data.summary  → top-level { content: "..." } (nicht in sections)
 *  - sections.*    → title statt name, hidden: false ergänzt
 *  - items.period  → String statt Objekt ("Mär 2019 – Heute")
 *  - customSections: [] auf top-level
 *  - metadata.layout → { pages: [[col1, col2]] }
 *  - metadata.css  → { enabled: false, value: "" }
 *  - metadata.page → gapX/gapY/marginX/marginY ergänzt
 *  - metadata.design → neues Pflicht-Objekt
 *  - metadata.typography → body/heading Objekte ergänzt
 *
 *  Alle item-Felder (company, school, degree, language, title …) bleiben
 *  wie in v3 — sie wurden in den Fehlern NICHT beanstandet.
 */

const API_BASE = '/api/rxresume';
const STORAGE_KEY = 'hr_rxresume_cv_urls';

const uid = () => crypto.randomUUID();
const H = { 'Content-Type': 'application/json' };

async function apiCall(method, path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: H,
        body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`${method} ${path} \u2192 HTTP ${res.status}: ${text}`);
    try { return JSON.parse(text); } catch { return text; }
}

/** "Mär 2019 – Heute" */
function period(start, end = '') {
    const fmt = (d) => {
        if (!d) return 'Heute';
        return new Date(d + '-01').toLocaleDateString('de-DE', { month: 'short', year: 'numeric' });
    };
    return `${fmt(start)} \u2013 ${fmt(end)}`;
}

/** Leere versteckte Section (v4: title + hidden) */
function emptySection(id, title) {
    return { title, hidden: true, id, columns: 1, separateLinks: true, items: [] };
}

/** Profil-Foto-Objekt (leer) */
function pic() {
    return {
        url: '', size: 64, aspectRatio: 1, borderRadius: 0,
        borderColor: 'rgba(0,0,0,1)', borderWidth: 0,
        shadowColor: 'rgba(0,0,0,0)', shadowWidth: 0, rotation: 0,
        effects: { hidden: false, border: false, grayscale: false },
    };
}

/** Metadata (v4-Schema) */
function meta(primary = '#1d4ed8') {
    return {
        template: 'onyx',
        layout: {
            pages: [[
                ['experience', 'education', 'certifications'],
                ['profiles', 'skills', 'languages'],
            ]],
        },
        css: { enabled: false, value: '' },
        page: {
            format: 'a4',
            margin: 18,
            marginX: 18,
            marginY: 18,
            gapX: 10,
            gapY: 10,
            options: { breakLine: true, pageNumbers: true },
        },
        theme: { background: '#ffffff', text: '#000000', primary },
        design: {
            colors: { primary, background: '#ffffff', text: '#000000' },
            spacing: 4,
        },
        typography: {
            font: { family: 'IBM Plex Serif', subset: 'latin', variants: ['regular', '600'], size: 14 },
            body: { family: 'IBM Plex Serif', size: 14, weight: 'regular', lineHeight: 1.5 },
            heading: { family: 'IBM Plex Serif', size: 20, weight: '600', lineHeight: 1.3 },
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
        // basics: v3-Felder unverändert (kein Fehler für diese Felder)
        basics: {
            name: 'Max Berger',
            headline: 'Industriekaufmann | Key Account & Vertriebsinnendienst',
            email: 'max.berger@example.com',
            phone: '+49 211 555 1234',
            location: 'Düsseldorf, Deutschland',
            website: { url: '', label: '' },
            customFields: [],
        },
        // v4: picture top-level (nicht in basics)
        picture: pic(),
        // v4: summary top-level (nicht in sections)
        summary: {
            content: '<p>Erfahrener Industriekaufmann mit 8 Jahren Berufserfahrung im Key Account Management und Vertriebsinnendienst. Bestandsportfolio 2,4 Mio. €, Führung von 3 Mitarbeitern, Ø 115 % Zielerreichung.</p>',
        },
        // v4: customSections pflicht
        customSections: [],
        sections: {
            // v4: title + hidden statt name + visible
            profiles: {
                title: 'Profile', hidden: false, id: 'profiles', columns: 4, separateLinks: true,
                // v3 item-Felder: network, username, website, icon
                items: [
                    { id: uid(), hidden: false, network: 'LinkedIn', username: 'maxberger-dus', website: { url: 'https://linkedin.com/in/maxberger-dus', label: 'LinkedIn' }, icon: 'PhLinkedinLogo' },
                ],
            },
            experience: {
                title: 'Berufserfahrung', hidden: false, id: 'experience', columns: 1, separateLinks: true,
                items: [
                    {
                        id: uid(), hidden: false,
                        // v3 item-Felder: company, position, location, date/period, website, description, roles
                        company: 'Henkel AG & Co. KGaA',
                        position: 'Key Account Manager – Industrievertrieb',
                        location: 'Düsseldorf',
                        period: period('2019-03'),          // v4: String statt Objekt
                        website: { url: 'https://www.henkel.de', label: 'Henkel' },
                        description: '<ul><li>Bestandsportfolio 2,4 Mio. € (Chemie, Automotive, Maschinenbau)</li><li>Steuerung 3-köpfiges Innendienstteam</li><li>Ø 115 % Zielerreichung über 5 Jahre</li><li>Neukundenakquise B2B, Angebotserstellung, Preisverhandlung</li></ul>',
                        roles: [],
                    },
                    {
                        id: uid(), hidden: false,
                        company: 'Thyssenkrupp Materials Services GmbH',
                        position: 'Sachbearbeiter Vertriebsinnendienst',
                        location: 'Essen',
                        period: period('2016-09', '2019-02'),
                        website: { url: '', label: '' },
                        description: '<ul><li>Auftragsabwicklung und Angebotserstellung für Industriekunden</li><li>Koordination Einkauf/Logistik/Außendienst</li><li>CRM-Pflege (Salesforce)</li></ul>',
                        roles: [],
                    },
                ],
            },
            education: {
                title: 'Ausbildung & Studium', hidden: false, id: 'education', columns: 1, separateLinks: true,
                items: [
                    {
                        id: uid(), hidden: false,
                        // v3 item-Felder: school, degree, area, grade, location, period, website, description
                        school: 'Fachhochschule Düsseldorf',
                        degree: 'Bachelor of Arts',
                        area: 'Betriebswirtschaftslehre',
                        grade: '',
                        location: 'Düsseldorf',
                        period: period('2013-10', '2016-08'),
                        website: { url: '', label: '' },
                        description: 'Schwerpunkt: Marketing & Vertriebsmanagement · DQR 6',
                    },
                    {
                        id: uid(), hidden: false,
                        school: 'Robert Bosch GmbH',
                        degree: 'Ausbildung',
                        area: 'Industriekaufmann (IHK)',
                        grade: 'Gut (81 Punkte)',
                        location: 'Düsseldorf',
                        period: period('2010-09', '2013-07'),
                        website: { url: '', label: '' },
                        description: '',
                    },
                ],
            },
            certifications: {
                title: 'Zertifikate', hidden: false, id: 'certifications', columns: 1, separateLinks: true,
                // v3 item-Felder: title, issuer, date, website, description
                items: [
                    { id: uid(), hidden: false, title: 'IHK Industriekaufmann (DQR 4)', issuer: 'IHK Düsseldorf', date: 'Jul 2013', website: { url: '', label: '' }, description: '' },
                    { id: uid(), hidden: false, title: 'BWL Bachelor of Arts (DQR 6)', issuer: 'FH Düsseldorf', date: 'Aug 2016', website: { url: '', label: '' }, description: '' },
                    { id: uid(), hidden: false, title: 'Salesforce Certified Sales Representative', issuer: 'Salesforce', date: 'Mär 2021', website: { url: '', label: '' }, description: '' },
                ],
            },
            skills: {
                title: 'Kenntnisse', hidden: false, id: 'skills', columns: 1, separateLinks: true,
                // v3 item-Felder: name, level, proficiency, icon, keywords
                items: [
                    { id: uid(), hidden: false, name: 'Key Account Management', level: 5, proficiency: 'Expert', icon: '', keywords: [] },
                    { id: uid(), hidden: false, name: 'SAP SD / MM', level: 4, proficiency: 'Advanced', icon: '', keywords: [] },
                    { id: uid(), hidden: false, name: 'Salesforce CRM', level: 4, proficiency: 'Advanced', icon: '', keywords: [] },
                    { id: uid(), hidden: false, name: 'Angebots- & Preisgestaltung', level: 5, proficiency: 'Expert', icon: '', keywords: [] },
                    { id: uid(), hidden: false, name: 'Teamführung', level: 4, proficiency: 'Advanced', icon: '', keywords: [] },
                    { id: uid(), hidden: false, name: 'MS Office (Excel, PowerPoint)', level: 5, proficiency: 'Expert', icon: '', keywords: [] },
                ],
            },
            languages: {
                title: 'Sprachen', hidden: false, id: 'languages', columns: 1, separateLinks: true,
                // v3 item-Felder: language, fluency, level
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
        },
        picture: pic(),
        summary: {
            content: '<p>Motivierte Vertriebspersönlichkeit mit 4 Jahren Erfahrung im Einzelhandel, davon 2 Jahre Teamleitung (5 MA) bei MediaMarkt. Kommunikationsstärke und Beratungskompetenz als Grundlage für den Wechsel in den B2C-/B2B-Vertrieb.</p>',
        },
        customSections: [],
        sections: {
            profiles: {
                title: 'Profile', hidden: false, id: 'profiles', columns: 4, separateLinks: true,
                items: [
                    { id: uid(), hidden: false, network: 'LinkedIn', username: 'sarahklein-koeln', website: { url: 'https://linkedin.com/in/sarahklein-koeln', label: 'LinkedIn' }, icon: 'PhLinkedinLogo' },
                ],
            },
            experience: {
                title: 'Berufserfahrung', hidden: false, id: 'experience', columns: 1, separateLinks: true,
                items: [
                    {
                        id: uid(), hidden: false,
                        company: 'MediaMarkt Saturn Retail Group',
                        position: 'Teamleiterin Verkauf – Unterhaltungselektronik',
                        location: 'Köln',
                        period: period('2022-04'),
                        website: { url: '', label: '' },
                        description: '<ul><li>Führung und Motivation eines 5-köpfigen Verkaufsteams</li><li>Verantwortung für Abteilungsumsatz (Ø 108 % Zielerreichung)</li><li>Schulung neuer Mitarbeiter in Produktberatung</li><li>Reklamations- und Beschwerdemanagement</li></ul>',
                        roles: [],
                    },
                    {
                        id: uid(), hidden: false,
                        company: 'MediaMarkt Saturn Retail Group',
                        position: 'Verkaufsberaterin – Smartphones & Zubehör',
                        location: 'Köln',
                        period: period('2020-09', '2022-03'),
                        website: { url: '', label: '' },
                        description: '<ul><li>Aktive Kundenberatung und Verkauf</li><li>Kassenbetrieb und Tagesabschluss</li><li>Bestandspflege und Wareneingangskontrolle</li></ul>',
                        roles: [],
                    },
                ],
            },
            education: {
                title: 'Ausbildung & Weiterbildung', hidden: false, id: 'education', columns: 1, separateLinks: true,
                items: [
                    {
                        id: uid(), hidden: false,
                        school: 'IHK Köln',
                        degree: 'Weiterbildungszertifikat',
                        area: 'Vertrieb & Kundenkommunikation',
                        grade: '',
                        location: 'Köln',
                        period: period('2023-01', '2023-06'),
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
                        period: period('2017-09', '2020-08'),
                        website: { url: '', label: '' },
                        description: '',
                    },
                ],
            },
            certifications: {
                title: 'Qualifikationen', hidden: false, id: 'certifications', columns: 1, separateLinks: true,
                items: [
                    { id: uid(), hidden: false, title: 'Einzelhandelskauffrau (DQR 4)', issuer: 'IHK Köln', date: 'Aug 2020', website: { url: '', label: '' }, description: '' },
                    { id: uid(), hidden: false, title: 'Weiterbildung Vertrieb & Kommunikation', issuer: 'IHK Köln', date: 'Jun 2023', website: { url: '', label: '' }, description: '' },
                ],
            },
            skills: {
                title: 'Kenntnisse', hidden: false, id: 'skills', columns: 1, separateLinks: true,
                items: [
                    { id: uid(), hidden: false, name: 'Teamführung', level: 4, proficiency: 'Advanced', icon: '', keywords: [] },
                    { id: uid(), hidden: false, name: 'Kundenberatung / B2C-Vertrieb', level: 5, proficiency: 'Expert', icon: '', keywords: [] },
                    { id: uid(), hidden: false, name: 'Reklamationsmanagement', level: 4, proficiency: 'Advanced', icon: '', keywords: [] },
                    { id: uid(), hidden: false, name: 'Kassensysteme (SAP POS)', level: 4, proficiency: 'Advanced', icon: '', keywords: [] },
                    { id: uid(), hidden: false, name: 'Visual Merchandising', level: 3, proficiency: 'Intermediate', icon: '', keywords: [] },
                    { id: uid(), hidden: false, name: 'MS Office', level: 3, proficiency: 'Intermediate', icon: '', keywords: [] },
                ],
            },
            languages: {
                title: 'Sprachen', hidden: false, id: 'languages', columns: 1, separateLinks: true,
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
        },
        picture: pic(),
        summary: {
            content: '<p>Verwaltungsfachangestellter mit 20 Jahren Berufserfahrung in der Kommunalverwaltung. Fundierte Kenntnisse in Sachbearbeitung, Dokumentenmanagement und Verwaltungsrecht (VwGO, BGB). Sucht neue Herausforderung außerhalb des öffentlichen Dienstes.</p>',
        },
        customSections: [],
        sections: {
            profiles: {
                title: 'Profile', hidden: false, id: 'profiles', columns: 4, separateLinks: true,
                items: [],
            },
            experience: {
                title: 'Berufserfahrung', hidden: false, id: 'experience', columns: 1, separateLinks: true,
                items: [
                    {
                        id: uid(), hidden: false,
                        company: 'Stadt Flensburg – Ordnungsamt',
                        position: 'Sachbearbeiter',
                        location: 'Flensburg',
                        period: period('2012-01'),
                        website: { url: '', label: '' },
                        description: '<ul><li>Bearbeitung von Anträgen nach VwGO und BGB</li><li>Schriftverkehr mit Bürgern und Behörden</li><li>Dokumentenmanagement und Aktenführung</li><li>SAP R/3-Anwendung</li></ul>',
                        roles: [],
                    },
                    {
                        id: uid(), hidden: false,
                        company: 'Stadt Flensburg – Einwohnermeldeamt',
                        position: 'Sachbearbeiter',
                        location: 'Flensburg',
                        period: period('2006-03', '2011-12'),
                        website: { url: '', label: '' },
                        description: '<ul><li>An-/Abmeldungen, Meldebescheinigungen</li><li>Passanträge und Personalausweise</li><li>Bürgerberatung am Schalter</li></ul>',
                        roles: [],
                    },
                    {
                        id: uid(), hidden: false,
                        company: 'Kreis Schleswig-Flensburg',
                        position: 'Verwaltungsangestellter',
                        location: 'Schleswig',
                        period: period('2004-08', '2006-02'),
                        website: { url: '', label: '' },
                        description: '<ul><li>Allgemeine Verwaltungsaufgaben und Datenpflege</li></ul>',
                        roles: [],
                    },
                ],
            },
            education: {
                title: 'Ausbildung', hidden: false, id: 'education', columns: 1, separateLinks: true,
                items: [
                    {
                        id: uid(), hidden: false,
                        school: 'Stadt Flensburg / Berufsschule Flensburg',
                        degree: 'Ausbildung',
                        area: 'Verwaltungsfachangestellter (DQR 4)',
                        grade: '',
                        location: 'Flensburg',
                        period: period('2001-08', '2004-07'),
                        website: { url: '', label: '' },
                        description: '',
                    },
                ],
            },
            certifications: {
                title: 'Qualifikationen', hidden: false, id: 'certifications', columns: 1, separateLinks: true,
                items: [
                    { id: uid(), hidden: false, title: 'Verwaltungsfachangestellter (DQR 4)', issuer: 'Stadt Flensburg', date: 'Jul 2004', website: { url: '', label: '' }, description: '' },
                ],
            },
            skills: {
                title: 'Kenntnisse', hidden: false, id: 'skills', columns: 1, separateLinks: true,
                items: [
                    { id: uid(), hidden: false, name: 'Verwaltungsrecht (VwGO, BGB)', level: 5, proficiency: 'Expert', icon: '', keywords: [] },
                    { id: uid(), hidden: false, name: 'Aktenführung & Dokumentation', level: 5, proficiency: 'Expert', icon: '', keywords: [] },
                    { id: uid(), hidden: false, name: 'SAP R/3', level: 3, proficiency: 'Intermediate', icon: '', keywords: [] },
                    { id: uid(), hidden: false, name: 'MS Office (Word, Excel)', level: 3, proficiency: 'Intermediate', icon: '', keywords: [] },
                    { id: uid(), hidden: false, name: 'Bürgerservice & Beratung', level: 4, proficiency: 'Advanced', icon: '', keywords: [] },
                ],
            },
            languages: {
                title: 'Sprachen', hidden: false, id: 'languages', columns: 1, separateLinks: true,
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

export function loadCvUrls() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}
export function saveCvUrls(urls) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
}
export function clearCvUrls() {
    localStorage.removeItem(STORAGE_KEY);
}

const CV_DEFINITIONS = [
    { key: 'max',    label: 'Max Berger',   build: buildMaxBerger },
    { key: 'sarah',  label: 'Sarah Klein',  build: buildSarahKlein },
    { key: 'thomas', label: 'Thomas Wendt', build: buildThomasWendt },
];

export async function createAllCVs(onProgress) {
    const urls = {};
    for (const def of CV_DEFINITIONS) {
        onProgress?.(def.key, 'creating');
        try {
            const data = def.build();
            const created = await apiCall('POST', '/resumes/import', { data });
            const id = typeof created === 'string' ? created
                : (created.id ?? created.data?.id ?? null);
            if (!id) throw new Error('Keine ID in der Antwort: ' + JSON.stringify(created).slice(0, 200));

            onProgress?.(def.key, 'pdf');
            let pdfUrl = null;
            try {
                const pdfRes = await apiCall('GET', `/resumes/${id}/pdf`);
                pdfUrl = typeof pdfRes === 'string' ? pdfRes : (pdfRes.url ?? null);
            } catch { /* PDF wird asynchron generiert */ }

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
