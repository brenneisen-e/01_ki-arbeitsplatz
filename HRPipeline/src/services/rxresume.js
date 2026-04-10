/**
 * rxresume.js — Erstellt Demo-CVs auf rxresu.me via OpenAPI (v4/v5 Schema)
 * Proxy-Endpunkt: /api/rxresume (Cloudflare Pages Function)
 * PDF-URLs werden in localStorage gespeichert.
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
    if (!res.ok) throw new Error(`${method} ${path} → HTTP ${res.status}: ${text}`);
    try { return JSON.parse(text); } catch { return text; }
}

// Hilfsfunktion: Datumsbereich als String formatieren (DE)
function period(start, end = '') {
    const fmt = (d) => {
        if (!d) return 'Heute';
        const date = new Date(d + '-01');
        return date.toLocaleDateString('de-DE', { month: 'short', year: 'numeric' });
    };
    return `${fmt(start)} \u2013 ${fmt(end)}`;
}

// Leere Section mit korrektem v4-Schema
function emptySection(id, title) {
    return { title, hidden: true, id, columns: 1, separateLinks: true, items: [] };
}

// Profil-Foto (leer)
function picture() {
    return {
        url: '', size: 64, aspectRatio: 1, borderRadius: 0,
        borderColor: 'rgba(0,0,0,1)', borderWidth: 0,
        shadowColor: 'rgba(0,0,0,0)', shadowWidth: 0, rotation: 0,
        effects: { hidden: false, border: false, grayscale: false },
    };
}

// Metadata mit korrektem v4-Schema
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
        basics: {
            name: 'Max Berger',
            headline: 'Industriekaufmann | Key Account & Vertriebsinnendienst',
            email: 'max.berger@example.com',
            phone: '+49 211 555 1234',
            location: 'Düsseldorf, Deutschland',
            website: { url: '', label: '' },
            customFields: [],
        },
        picture: picture(),
        summary: {
            content: '<p>Erfahrener Industriekaufmann mit 8 Jahren Berufserfahrung im Key Account Management und Vertriebsinnendienst. Bestandsportfolio von 2,4 Mio. € Umsatz, Führungserfahrung über 3 Mitarbeiter und durchschnittliche Zielerreichung von 115 %. Nachgewiesene Stärken in Angebotserstellung, Preisverhandlung und strategischer Kundenentwicklung im B2B-Umfeld.</p>',
        },
        customSections: [],
        sections: {
            profiles: {
                title: 'Profile', hidden: false, columns: 4, separateLinks: true, id: 'profiles',
                items: [
                    { id: uid(), hidden: false, network: 'LinkedIn', username: 'maxberger-dus', url: 'https://linkedin.com/in/maxberger-dus', icon: 'PhLinkedinLogo' },
                ],
            },
            experience: {
                title: 'Berufserfahrung', hidden: false, columns: 1, separateLinks: true, id: 'experience',
                items: [
                    {
                        id: uid(), hidden: false,
                        company: 'Henkel AG & Co. KGaA',
                        position: 'Key Account Manager – Industrievertrieb',
                        location: 'Düsseldorf',
                        period: period('2019-03'),
                        url: '',
                        summary: '<ul><li>Betreuung eines Bestandsportfolios mit 2,4 Mio. € Jahresumsatz</li><li>Steuerung und Entwicklung eines 3-köpfigen Innendienstteams</li><li>Ø 115 % Zielerreichung über fünf Geschäftsjahre</li><li>Neukundenakquise und Angebotserstellung im B2B-Segment</li></ul>',
                        keywords: [],
                    },
                    {
                        id: uid(), hidden: false,
                        company: 'Thyssenkrupp Materials Services GmbH',
                        position: 'Sachbearbeiter Vertriebsinnendienst',
                        location: 'Essen',
                        period: period('2016-09', '2019-02'),
                        url: '',
                        summary: '<ul><li>Auftragsabwicklung und Angebotserstellung für Industriekunden</li><li>Koordination zwischen Einkauf, Logistik und Außendienst</li><li>Pflege von Kundenstammdaten im CRM-System (Salesforce)</li></ul>',
                        keywords: [],
                    },
                ],
            },
            education: {
                title: 'Ausbildung & Studium', hidden: false, columns: 1, separateLinks: true, id: 'education',
                items: [
                    {
                        id: uid(), hidden: false,
                        institution: 'Fachhochschule Düsseldorf',
                        studyType: 'Bachelor of Arts',
                        area: 'Betriebswirtschaftslehre',
                        score: '',
                        location: 'Düsseldorf',
                        period: period('2013-10', '2016-08'),
                        url: '',
                        summary: '<p>Schwerpunkt: Marketing & Vertriebsmanagement · DQR 6</p>',
                        keywords: [],
                    },
                    {
                        id: uid(), hidden: false,
                        institution: 'Robert Bosch GmbH',
                        studyType: 'Ausbildung',
                        area: 'Industriekaufmann (IHK)',
                        score: 'Gut (81 Punkte)',
                        location: 'Düsseldorf',
                        period: period('2010-09', '2013-07'),
                        url: '',
                        summary: '',
                        keywords: [],
                    },
                ],
            },
            certifications: {
                title: 'Zertifikate', hidden: false, columns: 1, separateLinks: true, id: 'certifications',
                items: [
                    { id: uid(), hidden: false, name: 'IHK Industriekaufmann (DQR 4)', issuer: 'IHK Düsseldorf', date: 'Jul 2013', url: '', summary: '' },
                    { id: uid(), hidden: false, name: 'BWL Bachelor of Arts (DQR 6)', issuer: 'FH Düsseldorf', date: 'Aug 2016', url: '', summary: '' },
                    { id: uid(), hidden: false, name: 'Salesforce Certified Sales Representative', issuer: 'Salesforce', date: 'Mär 2021', url: '', summary: '' },
                ],
            },
            skills: {
                title: 'Kenntnisse', hidden: false, columns: 1, separateLinks: true, id: 'skills',
                items: [
                    { id: uid(), hidden: false, name: 'Key Account Management', level: 5, description: '' },
                    { id: uid(), hidden: false, name: 'SAP SD / MM', level: 4, description: '' },
                    { id: uid(), hidden: false, name: 'Salesforce CRM', level: 4, description: '' },
                    { id: uid(), hidden: false, name: 'Angebots- & Preisgestaltung', level: 5, description: '' },
                    { id: uid(), hidden: false, name: 'Teamführung', level: 4, description: '' },
                    { id: uid(), hidden: false, name: 'MS Office (Excel, PowerPoint)', level: 5, description: '' },
                ],
            },
            languages: {
                title: 'Sprachen', hidden: false, columns: 1, separateLinks: true, id: 'languages',
                items: [
                    { id: uid(), hidden: false, name: 'Deutsch', level: 5, description: 'Muttersprache' },
                    { id: uid(), hidden: false, name: 'Englisch', level: 4, description: 'Verhandlungssicher (C1)' },
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
        picture: picture(),
        summary: {
            content: '<p>Motivierte Vertriebspersönlichkeit mit 4 Jahren Erfahrung im Einzelhandel, davon 2 Jahre als Teamleiterin (5 Mitarbeiter) bei MediaMarkt. Ausgeprägte Kommunikationsstärke, Beratungskompetenz und Freude am Kundenkontakt. Aktiv auf der Suche nach einer Herausforderung im B2C- oder B2B-Vertrieb.</p>',
        },
        customSections: [],
        sections: {
            profiles: {
                title: 'Profile', hidden: false, columns: 4, separateLinks: true, id: 'profiles',
                items: [
                    { id: uid(), hidden: false, network: 'LinkedIn', username: 'sarahklein-koeln', url: 'https://linkedin.com/in/sarahklein-koeln', icon: 'PhLinkedinLogo' },
                ],
            },
            experience: {
                title: 'Berufserfahrung', hidden: false, columns: 1, separateLinks: true, id: 'experience',
                items: [
                    {
                        id: uid(), hidden: false,
                        company: 'MediaMarkt Saturn Retail Group',
                        position: 'Teamleiterin Verkauf – Unterhaltungselektronik',
                        location: 'Köln',
                        period: period('2022-04'),
                        url: '',
                        summary: '<ul><li>Führung und Motivation eines 5-köpfigen Verkaufsteams</li><li>Verantwortung für Abteilungsumsatz und Zielerreichung (Ø 108 %)</li><li>Schulung neuer Mitarbeiter in Produktberatung und Verkaufstechniken</li><li>Reklamations- und Beschwerdemanagement</li></ul>',
                        keywords: [],
                    },
                    {
                        id: uid(), hidden: false,
                        company: 'MediaMarkt Saturn Retail Group',
                        position: 'Verkaufsberaterin – Smartphones & Zubehör',
                        location: 'Köln',
                        period: period('2020-09', '2022-03'),
                        url: '',
                        summary: '<ul><li>Aktive Kundenberatung und Verkauf im Bereich Smartphones & Zubehör</li><li>Kassenbetrieb und Tagesabschluss</li><li>Bestandspflege und Wareneingangskontrolle</li></ul>',
                        keywords: [],
                    },
                ],
            },
            education: {
                title: 'Ausbildung & Weiterbildung', hidden: false, columns: 1, separateLinks: true, id: 'education',
                items: [
                    {
                        id: uid(), hidden: false,
                        institution: 'IHK Köln',
                        studyType: 'Weiterbildungszertifikat',
                        area: 'Vertrieb & Kundenkommunikation',
                        score: '',
                        location: 'Köln',
                        period: period('2023-01', '2023-06'),
                        url: '',
                        summary: '',
                        keywords: [],
                    },
                    {
                        id: uid(), hidden: false,
                        institution: 'MediaMarkt Ausbildungszentrum',
                        studyType: 'Ausbildung',
                        area: 'Einzelhandelskauffrau (IHK)',
                        score: '',
                        location: 'Köln',
                        period: period('2017-09', '2020-08'),
                        url: '',
                        summary: '',
                        keywords: [],
                    },
                ],
            },
            certifications: {
                title: 'Qualifikationen', hidden: false, columns: 1, separateLinks: true, id: 'certifications',
                items: [
                    { id: uid(), hidden: false, name: 'Einzelhandelskauffrau (DQR 4)', issuer: 'IHK Köln', date: 'Aug 2020', url: '', summary: '' },
                    { id: uid(), hidden: false, name: 'Weiterbildung Vertrieb & Kommunikation', issuer: 'IHK Köln', date: 'Jun 2023', url: '', summary: '' },
                ],
            },
            skills: {
                title: 'Kenntnisse', hidden: false, columns: 1, separateLinks: true, id: 'skills',
                items: [
                    { id: uid(), hidden: false, name: 'Teamführung', level: 4, description: '' },
                    { id: uid(), hidden: false, name: 'Kundenberatung / B2C-Vertrieb', level: 5, description: '' },
                    { id: uid(), hidden: false, name: 'Reklamationsmanagement', level: 4, description: '' },
                    { id: uid(), hidden: false, name: 'Kassensysteme (SAP POS)', level: 4, description: '' },
                    { id: uid(), hidden: false, name: 'Visual Merchandising', level: 3, description: '' },
                    { id: uid(), hidden: false, name: 'MS Office', level: 3, description: '' },
                ],
            },
            languages: {
                title: 'Sprachen', hidden: false, columns: 1, separateLinks: true, id: 'languages',
                items: [
                    { id: uid(), hidden: false, name: 'Deutsch', level: 5, description: 'Muttersprache' },
                    { id: uid(), hidden: false, name: 'Englisch', level: 3, description: 'Gute Kenntnisse (B2)' },
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
        picture: picture(),
        summary: {
            content: '<p>Erfahrener Verwaltungsfachangestellter mit 20 Jahren Berufserfahrung in der Kommunalverwaltung. Fundierte Kenntnisse in Sachbearbeitung, Dokumentenmanagement und der Anwendung einschlägiger Verwaltungsvorschriften (VwGO, BGB). Sucht nach einer neuen beruflichen Herausforderung außerhalb des öffentlichen Dienstes.</p>',
        },
        customSections: [],
        sections: {
            profiles: {
                title: 'Profile', hidden: false, columns: 4, separateLinks: true, id: 'profiles',
                items: [],
            },
            experience: {
                title: 'Berufserfahrung', hidden: false, columns: 1, separateLinks: true, id: 'experience',
                items: [
                    {
                        id: uid(), hidden: false,
                        company: 'Stadt Flensburg – Ordnungsamt',
                        position: 'Sachbearbeiter',
                        location: 'Flensburg',
                        period: period('2012-01'),
                        url: '',
                        summary: '<ul><li>Bearbeitung von Anträgen und Verwaltungsvorgängen nach VwGO und BGB</li><li>Schriftverkehr mit Bürgern, Behörden und Dienstleistern</li><li>Dokumentenmanagement und Aktenführung</li><li>Anwendung kommunaler IT-Systeme (SAP R/3)</li></ul>',
                        keywords: [],
                    },
                    {
                        id: uid(), hidden: false,
                        company: 'Stadt Flensburg – Einwohnermeldeamt',
                        position: 'Sachbearbeiter',
                        location: 'Flensburg',
                        period: period('2006-03', '2011-12'),
                        url: '',
                        summary: '<ul><li>An- und Abmeldung von Einwohnern, Ausstellung von Meldebescheinigungen</li><li>Bearbeitung von Passanträgen und Personalausweisen</li><li>Bürgerberatung am Schalter</li></ul>',
                        keywords: [],
                    },
                    {
                        id: uid(), hidden: false,
                        company: 'Kreis Schleswig-Flensburg',
                        position: 'Verwaltungsangestellter',
                        location: 'Schleswig',
                        period: period('2004-08', '2006-02'),
                        url: '',
                        summary: '<ul><li>Allgemeine Verwaltungsaufgaben und Sachbearbeitung</li><li>Datenpflege in kommunalen IT-Systemen</li></ul>',
                        keywords: [],
                    },
                ],
            },
            education: {
                title: 'Ausbildung', hidden: false, columns: 1, separateLinks: true, id: 'education',
                items: [
                    {
                        id: uid(), hidden: false,
                        institution: 'Stadt Flensburg / Berufsschule Flensburg',
                        studyType: 'Ausbildung',
                        area: 'Verwaltungsfachangestellter (DQR 4)',
                        score: '',
                        location: 'Flensburg',
                        period: period('2001-08', '2004-07'),
                        url: '',
                        summary: '',
                        keywords: [],
                    },
                ],
            },
            certifications: {
                title: 'Qualifikationen', hidden: false, columns: 1, separateLinks: true, id: 'certifications',
                items: [
                    { id: uid(), hidden: false, name: 'Verwaltungsfachangestellter (DQR 4)', issuer: 'Stadt Flensburg', date: 'Jul 2004', url: '', summary: '' },
                ],
            },
            skills: {
                title: 'Kenntnisse', hidden: false, columns: 1, separateLinks: true, id: 'skills',
                items: [
                    { id: uid(), hidden: false, name: 'Verwaltungsrecht (VwGO, BGB)', level: 5, description: '' },
                    { id: uid(), hidden: false, name: 'Aktenführung & Dokumentation', level: 5, description: '' },
                    { id: uid(), hidden: false, name: 'SAP R/3', level: 3, description: '' },
                    { id: uid(), hidden: false, name: 'MS Office (Word, Excel)', level: 3, description: '' },
                    { id: uid(), hidden: false, name: 'Bürgerservice & Beratung', level: 4, description: '' },
                ],
            },
            languages: {
                title: 'Sprachen', hidden: false, columns: 1, separateLinks: true, id: 'languages',
                items: [
                    { id: uid(), hidden: false, name: 'Deutsch', level: 5, description: 'Muttersprache' },
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
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch { return {}; }
}

export function saveCvUrls(urls) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
}

export function clearCvUrls() {
    localStorage.removeItem(STORAGE_KEY);
}

const CV_DEFINITIONS = [
    { key: 'max',    label: 'Max Berger',    slug: 'max-berger-industriekaufmann',    build: buildMaxBerger },
    { key: 'sarah',  label: 'Sarah Klein',   slug: 'sarah-klein-einzelhandel',        build: buildSarahKlein },
    { key: 'thomas', label: 'Thomas Wendt',  slug: 'thomas-wendt-verwaltung',         build: buildThomasWendt },
];

/**
 * Erstellt alle 3 CVs auf rxresu.me und gibt { max, sarah, thomas } mit PDF-URLs zurück.
 * Ruft onProgress(key, status, url?, errorMsg?) auf.
 */
export async function createAllCVs(onProgress) {
    const urls = {};

    for (const def of CV_DEFINITIONS) {
        onProgress?.(def.key, 'creating');
        try {
            const data = def.build();

            // Resume via Import-Endpunkt anlegen
            const created = await apiCall('POST', '/resumes/import', { data });
            const id = typeof created === 'string' ? created
                : (created.id ?? created.data?.id ?? null);

            if (!id) throw new Error('Keine Resume-ID in der Antwort: ' + JSON.stringify(created));

            onProgress?.(def.key, 'pdf');

            // PDF-URL abrufen
            let pdfUrl = null;
            try {
                const pdfRes = await apiCall('GET', `/resumes/${id}/pdf`);
                pdfUrl = typeof pdfRes === 'string' ? pdfRes : (pdfRes.url ?? null);
            } catch {
                // PDF-Generierung asynchron — URL später abrufbar
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
