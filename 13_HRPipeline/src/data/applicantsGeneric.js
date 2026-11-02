// Industrieunspezifische Bewerberliste für den "Zukunfts AG" Recruiter-Dashboard
// Breites Portfolio über HR, Finance, IT, Marketing, Operations, Data

import { HP_PROFILES_GENERIC } from './profilesGeneric.js';

export const HP_ALL_APPLICANTS_GENERIC = [
    { ...HP_PROFILES_GENERIC.laura, status: 'recommended', appliedDate: '2026-02-20', appliedPositionId: 1 },
    { ...HP_PROFILES_GENERIC.jonas, status: 'review', appliedDate: '2026-02-15', appliedPositionId: 8 },
    { ...HP_PROFILES_GENERIC.peter, status: 'rejected', appliedDate: '2026-01-19', appliedPositionId: 5 },

    {
        id: 'ben', name: 'Ben Kowalski', initials: 'BK', photo: './images/AdobeStock_1091012713.jpeg',
        jobFamily: 'Tech & IT', jobFamilyAffinities: ['Tech & IT', 'Data & Analytics'],
        age: 32, city: 'München', region: 'bayern', appliedDate: '2026-02-10', appliedPositionId: 3,
        experience: '6 Jahre Full-Stack-Development (FinTech Scale-up)', experienceYears: 6,
        education: 'M.Sc. Informatik (TU München)',
        skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'GraphQL', 'CI/CD'],
        certifications: ['M.Sc. Informatik (DQR 7)', 'AWS Solutions Architect Associate (2024)', 'Scrum Master PSM I'],
        insuranceFlags: {
            green: ['6J Full-Stack im FinTech', 'AWS-zertifiziert', 'M.Sc. Informatik (DQR 7)', 'Scrum Master'],
            neutral: ['Kein eigenes Team disziplinarisch geführt']
        },
        strengths: ['6 Jahre React/Node.js', 'AWS-Zertifikat', 'M.Sc. Informatik', 'FinTech-Erfahrung'],
        weaknesses: [],
        neutrals: ['Wechselt vom Scale-up in Konzernumfeld'],
        scores: { vertrieb: 90, branche: 82, qualifikation: 92, standort: 95, softskills: 78 },
        totalScore: 89, status: 'recommended',
        summary: '6 Jahre Full-Stack-Erfahrung im FinTech-Umfeld mit modernem Stack (React, TypeScript, Node.js, AWS). M.Sc. Informatik TU München, AWS-zertifiziert und erfahrener Scrum Master. Sehr starker Fit für die Full-Stack-Rolle in München — Wechselmotivation in den Konzernkontext im Interview validieren.',
        waterfall: [
            { label: 'M.Sc. Informatik TU München', points: 15, type: 'positive' },
            { label: '6 Jahre React/Node.js', points: 14, type: 'positive' },
            { label: 'AWS SA Associate', points: 10, type: 'positive' },
            { label: 'Standort München (Match)', points: 8, type: 'positive' },
            { label: 'Scrum Master', points: 6, type: 'positive' },
            { label: 'Konzernumfeld neu', points: -4, type: 'neutral' }
        ],
        counterfactual: 'Mit zusätzlicher AWS Professional-Zertifizierung (6 Monate) oder SRE-Erfahrung steigt der Score von 89 auf 94.',
        interviewQuestions: {
            background: [{ q: 'Beschreiben Sie Ihren typischen Feature-Entwicklungs-Lifecycle im aktuellen FinTech.', why: 'Engineering-Prozess und Ownership-Grad verifizieren' }],
            behavioral: [{ q: 'Wie gehen Sie mit einem Production-Incident um, der Ihre Feature-Arbeit unterbricht?', why: 'Reife im Umgang mit Betrieb und Entwicklung' }],
            technical: [{ q: 'Wie würden Sie eine skalierbare API für Millionen Requests/Tag in AWS aufbauen?', why: 'Architektur- und Cloud-Tiefe' }]
        },
        skillGap: {
            dimensions: [
                { label: 'Fachkompetenz', current: 92, required: 85, reason: 'Moderne Stack-Kenntnisse im relevanten Umfeld nachgewiesen' },
                { label: 'Berufserfahrung', current: 88, required: 80, reason: '6 Jahre in einem schnell wachsenden FinTech mit Senior-Verantwortung' },
                { label: 'Branchen-/Domänenkenntnis', current: 70, required: 70, reason: 'FinTech-Umfeld übertragbar, keine direkte Konzernerfahrung' },
                { label: 'Digital-Kompetenz', current: 95, required: 80, reason: 'Vollumfänglicher moderner Stack und Cloud-First-Mindset' },
                { label: 'Führungskompetenz', current: 60, required: 60, reason: 'Tech-Lead-Erfahrung, keine disziplinarische Führung' }
            ],
            training: 'Kaum Handlungsbedarf — Empfehlung: Mentoring durch Principal Engineer für Konzernkontext.'
        }
    },

    {
        id: 'mira', name: 'Mira Tanaka', initials: 'MT',
        jobFamily: 'Finance', jobFamilyAffinities: ['Finance', 'Data & Analytics'],
        age: 31, city: 'Frankfurt', region: 'hessen', appliedDate: '2026-02-12', appliedPositionId: 2,
        experience: '5 Jahre Controlling bei DAX-Konzern', experienceYears: 5,
        education: 'M.Sc. Finance (Frankfurt School of Finance)',
        skills: ['Financial Planning', 'SAP FI/CO', 'Power BI', 'IFRS', 'Business Partnering'],
        certifications: ['M.Sc. Finance (DQR 7)', 'CIMA Advanced Diploma', 'Power BI PL-300'],
        insuranceFlags: {
            green: ['5J DAX-Controlling', 'CIMA-zertifiziert', 'M.Sc. Finance'],
            neutral: ['Nur ein Arbeitgeber bisher']
        },
        strengths: ['5J Konzern-Controlling', 'CIMA Advanced', 'SAP-Profi', 'Power BI'],
        weaknesses: [],
        neutrals: ['Wechsel von Konzern in mittelgroße Organisation'],
        scores: { vertrieb: 82, branche: 80, qualifikation: 90, standort: 94, softskills: 80 },
        totalScore: 86, status: 'recommended',
        summary: '5 Jahre Controlling-Erfahrung bei einem DAX-Konzern mit Schwerpunkt auf Forecasting und Management-Reporting. M.Sc. Finance (Frankfurt School) und CIMA Advanced Diploma — sehr starke fachliche Basis. Für die Senior-Controller-Rolle ideal aufgestellt.',
        waterfall: [
            { label: 'M.Sc. Finance FS', points: 14, type: 'positive' },
            { label: '5 Jahre DAX-Controlling', points: 13, type: 'positive' },
            { label: 'CIMA Advanced', points: 10, type: 'positive' },
            { label: 'SAP FI/CO + Power BI', points: 8, type: 'positive' },
            { label: 'Standort Frankfurt (Match)', points: 7, type: 'positive' },
            { label: 'Nur ein Arbeitgeber', points: -3, type: 'neutral' }
        ],
        counterfactual: 'Mit zusätzlichem ACCA- oder CFA-Abschluss (12 Monate) und einem internationalen Rollout-Projekt steigt der Score auf 92.',
        skillGap: {
            dimensions: [
                { label: 'Fachkompetenz', current: 88, required: 85, reason: 'IFRS, SAP, Power BI und Business Partnering vollständig abgedeckt' },
                { label: 'Berufserfahrung', current: 82, required: 80, reason: '5 Jahre bei einem Arbeitgeber mit steigender Verantwortung' },
                { label: 'Branchen-/Domänenkenntnis', current: 78, required: 70, reason: 'Konzern-Setup aus DAX, übertragbar auf unser Umfeld' },
                { label: 'Digital-Kompetenz', current: 85, required: 75, reason: 'SAP, Power BI und Analytics Cloud aktiv genutzt' },
                { label: 'Soft Skills', current: 80, required: 70, reason: 'Business Partnering mit Senior-Stakeholdern nachgewiesen' }
            ],
            training: 'Optional: International Assignment oder ACCA zur weiteren Entwicklung Richtung Head of Controlling.'
        }
    },

    {
        id: 'sana', name: 'Sana Osei', initials: 'SO',
        jobFamily: 'Marketing', jobFamilyAffinities: ['Marketing'],
        age: 27, city: 'Hamburg', region: 'nord', appliedDate: '2026-02-17', appliedPositionId: 4,
        experience: '3 Jahre B2B-Marketing (SaaS Scale-up)', experienceYears: 3,
        education: 'B.A. Marketing & Kommunikation (HAW Hamburg)',
        skills: ['HubSpot', 'Content Marketing', 'ABM', 'LinkedIn Ads', 'SEO', 'Webinare'],
        certifications: ['B.A. Marketing (DQR 6)', 'HubSpot Inbound & Marketing Software', 'Google Analytics 4'],
        insuranceFlags: {
            green: ['3J B2B-SaaS-Marketing', 'HubSpot-zertifiziert', 'ABM-Erfahrung'],
            neutral: ['Kein Enterprise-Umfeld']
        },
        strengths: ['3 Jahre B2B-SaaS', 'HubSpot Inbound', 'ABM-Erfahrung', 'Content-Track-Record'],
        weaknesses: ['Enterprise-Erfahrung fehlt'],
        neutrals: [],
        scores: { vertrieb: 70, branche: 65, qualifikation: 72, standort: 90, softskills: 82 },
        totalScore: 78, status: 'review',
        summary: '3 Jahre fundierte B2B-Marketing-Erfahrung aus einem SaaS-Scale-up mit klarem ABM-Schwerpunkt. HubSpot Inbound- und Marketing Software zertifiziert. Für die Marketing-Manager-B2B-Rolle ein sehr interessanter Kandidat — Enterprise-Erfahrung müsste im Onboarding aufgebaut werden.',
        waterfall: [
            { label: '3 Jahre B2B-SaaS-Marketing', points: 11, type: 'positive' },
            { label: 'HubSpot zertifiziert', points: 8, type: 'positive' },
            { label: 'ABM-Erfahrung', points: 7, type: 'positive' },
            { label: 'Standort Hamburg (Match)', points: 6, type: 'positive' },
            { label: 'Enterprise-Fokus fehlt', points: -4, type: 'negative' }
        ],
        counterfactual: 'Nach einer Rotationserfahrung im Enterprise-Team (6 Monate) steigt der Score von 78 auf 86.',
        skillGap: {
            dimensions: [
                { label: 'Fachkompetenz', current: 78, required: 75, reason: 'Alle Kernkomponenten des B2B-Marketings abgedeckt' },
                { label: 'Berufserfahrung', current: 70, required: 70, reason: '3 Jahre mit Ownership für Kampagnen und Lead Gen' },
                { label: 'Branchen-/Domänenkenntnis', current: 65, required: 70, reason: 'SaaS-Background, Enterprise-Verkaufszyklen neu' },
                { label: 'Digital-Kompetenz', current: 85, required: 75, reason: 'HubSpot, Analytics und Content-Tools sicher im Griff' },
                { label: 'Soft Skills', current: 82, required: 70, reason: 'Stakeholder-Management und Storytelling sehr stark' }
            ],
            training: 'Empfehlung: Shadowing im Enterprise-Sales-Team (2 Monate) und ABM Certified Expert Zertifikat.'
        }
    },

    {
        id: 'rafael', name: 'Rafael Oliveira', initials: 'RO',
        jobFamily: 'Tech & IT', jobFamilyAffinities: ['Tech & IT'],
        age: 36, city: 'Düsseldorf', region: 'nrw', appliedDate: '2026-02-08', appliedPositionId: 7,
        experience: '10 Jahre IT-Operations, davon 4 Jahre als Team Lead', experienceYears: 10,
        education: 'B.Sc. Informatik + MBA (berufsbegleitend)',
        skills: ['AWS', 'Azure', 'Linux', 'Kubernetes', 'Incident Management', 'Team Leadership'],
        certifications: ['B.Sc. Informatik (DQR 6)', 'MBA (DQR 7)', 'ITIL v4 Foundation', 'AWS SA Professional', 'CKA'],
        insuranceFlags: {
            green: ['10J IT-Operations', '4J Teamführung', 'AWS Professional', 'MBA'],
            neutral: ['Deutsch fortgeschritten (nicht muttersprachlich)']
        },
        strengths: ['10 Jahre IT-Operations', '4 Jahre Führung', 'AWS SA Professional', 'CKA Kubernetes', 'MBA'],
        weaknesses: [],
        neutrals: ['Deutsch C1, nicht Muttersprache'],
        scores: { vertrieb: 90, branche: 88, qualifikation: 95, standort: 92, softskills: 80 },
        totalScore: 90, status: 'recommended',
        summary: '10 Jahre IT-Operations-Erfahrung, davon 4 Jahre in Führungsverantwortung. Exzellente Zertifizierungen (AWS Professional, CKA, ITIL) und berufsbegleitender MBA. Sehr starker Fit für die IT-Operations-Lead-Rolle in Düsseldorf.',
        waterfall: [
            { label: 'AWS SA Professional', points: 14, type: 'positive' },
            { label: '10 Jahre IT-Operations', points: 15, type: 'positive' },
            { label: '4 Jahre Teamführung', points: 12, type: 'positive' },
            { label: 'MBA (DQR 7)', points: 10, type: 'positive' },
            { label: 'CKA Kubernetes', points: 8, type: 'positive' },
            { label: 'Deutsch C1', points: -3, type: 'neutral' }
        ],
        counterfactual: 'Mit Deutsch-C2-Niveau (Sprachkurs 4 Monate) und einem weiteren SRE-Transformationsprojekt steigt der Score auf 94.',
        skillGap: {
            dimensions: [
                { label: 'Fachkompetenz', current: 92, required: 85, reason: 'Cloud, Kubernetes und Linux auf Senior-Niveau nachgewiesen' },
                { label: 'Berufserfahrung', current: 92, required: 85, reason: '10 Jahre mit klarem Führungs- und SRE-Fokus' },
                { label: 'Branchen-/Domänenkenntnis', current: 82, required: 75, reason: 'Mehrjährige Erfahrung in verschiedenen Konzernen' },
                { label: 'Digital-Kompetenz', current: 95, required: 85, reason: 'Vollständig Cloud-First und Infrastructure-as-Code' },
                { label: 'Führungskompetenz', current: 82, required: 80, reason: '4 Jahre fachliche und disziplinarische Führung eines 8er-Teams' }
            ],
            training: 'Empfehlung: Deutsch C2-Sprachkurs zur Abrundung, ansonsten kaum Entwicklungsbedarf.'
        }
    },

    {
        id: 'eric', name: 'Eric Hoffmann', initials: 'EH',
        jobFamily: 'Human Resources', jobFamilyAffinities: ['Human Resources'],
        age: 24, city: 'Berlin', region: 'berlin', appliedDate: '2026-02-19', appliedPositionId: 5,
        experience: '1 Jahr Werkstudent Recruiting (Agentur) + 6 Monate Praktikum People Ops', experienceYears: 1,
        education: 'B.Sc. BWL mit Schwerpunkt HR (laufend, 5. Semester)',
        skills: ['Active Sourcing', 'Interviews', 'LinkedIn Recruiter', 'Excel', 'Kommunikation'],
        certifications: ['LinkedIn Recruiter Basic', 'Excel Advanced'],
        insuranceFlags: {
            green: ['Erste Recruiting-Erfahrung', 'LinkedIn Recruiter zertifiziert'],
            red: ['Noch kein Abschluss'],
            neutral: ['Berufsanfänger']
        },
        strengths: ['Praktische Recruiting-Erfahrung', 'LinkedIn Recruiter Basic', 'Starker Kommunikator', 'Hohe Motivation'],
        weaknesses: ['Noch kein Studienabschluss', 'Wenig Senioritäts-Erfahrung'],
        neutrals: ['Berufsanfänger'],
        scores: { vertrieb: 60, branche: 55, qualifikation: 55, standort: 95, softskills: 85 },
        totalScore: 68, status: 'review',
        summary: 'Ambitionierter Junior mit erster Recruiting-Praxis aus einer Agentur und einem People-Ops-Praktikum. Studium im 5. Semester (BWL/HR). Ideal für die Junior-Recruiter-Rolle in Berlin — Abschluss und Senioritäts-Erfahrung berufsbegleitend aufbauen.',
        waterfall: [
            { label: '1 Jahr Recruiting-Praxis', points: 10, type: 'positive' },
            { label: 'LinkedIn Recruiter Basic', points: 6, type: 'positive' },
            { label: 'Standort Berlin (Match)', points: 8, type: 'positive' },
            { label: 'Kommunikationsstärke', points: 6, type: 'positive' },
            { label: 'Kein Abschluss', points: -7, type: 'negative' },
            { label: 'Berufsanfänger', points: -5, type: 'neutral' }
        ],
        counterfactual: 'Nach Abschluss des Bachelors und 12 Monaten Berufserfahrung steigt der Score von 68 auf 82.'
    },

    {
        id: 'yvonne', name: 'Yvonne Baumann', initials: 'YB',
        jobFamily: 'Operations', jobFamilyAffinities: ['Operations'],
        age: 41, city: 'Stuttgart', region: 'baden', appliedDate: '2026-02-05', appliedPositionId: 6,
        experience: '15 Jahre Supply Chain (Automotive-Zulieferer), davon 5 Jahre Teamleitung', experienceYears: 15,
        education: 'Diplom Wirtschaftsingenieurwesen (Uni Stuttgart)',
        skills: ['S&OP', 'SAP S/4HANA', 'Lieferantenmanagement', 'Verhandlung', 'Team Leadership'],
        certifications: ['Diplom Wirtschaftsingenieur (DQR 7)', 'APICS CSCP', 'Six Sigma Green Belt'],
        insuranceFlags: {
            green: ['15J Supply Chain Automotive', 'APICS CSCP', 'Diplom DQR 7', '5J Führung'],
            neutral: ['Wechsel aus Automotive in andere Branche']
        },
        strengths: ['15 Jahre Supply Chain', 'APICS CSCP', '5 Jahre Teamführung', 'SAP S/4HANA'],
        weaknesses: [],
        neutrals: ['Automotive-Erfahrung, Transfer in andere Branche'],
        scores: { vertrieb: 92, branche: 82, qualifikation: 92, standort: 94, softskills: 82 },
        totalScore: 89, status: 'recommended',
        summary: '15 Jahre Supply-Chain-Erfahrung aus der Automotive-Zulieferindustrie, davon 5 Jahre in Führungsverantwortung. APICS-zertifiziert (CSCP) und Six Sigma Green Belt. Sehr starker Fit für die Supply-Chain-Manager-Rolle in Stuttgart.',
        waterfall: [
            { label: '15 Jahre Supply Chain', points: 16, type: 'positive' },
            { label: 'APICS CSCP', points: 10, type: 'positive' },
            { label: '5 Jahre Führung', points: 10, type: 'positive' },
            { label: 'Diplom DQR 7', points: 10, type: 'positive' },
            { label: 'Standort Stuttgart (Match)', points: 8, type: 'positive' },
            { label: 'Branchenwechsel', points: -4, type: 'neutral' }
        ],
        counterfactual: 'Nach einer branchenspezifischen Einarbeitung (3 Monate) steigt der Score von 89 auf 93.'
    },

    {
        id: 'dennis', name: 'Dennis Schröder', initials: 'DS',
        jobFamily: 'Tech & IT', jobFamilyAffinities: ['Tech & IT'],
        age: 29, city: 'Dortmund', region: 'nrw', appliedDate: '2026-02-01', appliedPositionId: 3,
        experience: '3 Jahre Frontend-Entwicklung (Agentur)', experienceYears: 3,
        education: 'Ausbildung Fachinformatiker Anwendungsentwicklung',
        skills: ['JavaScript', 'React', 'Vue.js', 'HTML/CSS'],
        certifications: ['Fachinformatiker AE (DQR 4)'],
        insuranceFlags: {
            green: ['3J Frontend-Entwicklung', 'Ausbildung AE'],
            red: ['Keine Backend-/Fullstack-Erfahrung', 'Kein Cloud-Hintergrund'],
            neutral: ['Agenturumfeld, kein Produkt-Setup']
        },
        strengths: ['3 Jahre Frontend', 'Fachinformatiker-Ausbildung'],
        weaknesses: ['Kein Backend/Node.js', 'Kein AWS/Azure-Hintergrund'],
        neutrals: ['Agentur statt Produktfokus'],
        scores: { vertrieb: 55, branche: 45, qualifikation: 55, standort: 65, softskills: 65 },
        totalScore: 58, status: 'review',
        summary: '3 Jahre Frontend-Erfahrung aus einem Agenturumfeld. Für die ausgeschriebene Full-Stack-Rolle fehlt Backend- und Cloud-Know-how. Empfehlung: Alternative Junior-Positionen im Frontend-Team oder gezielte Weiterbildung.',
        waterfall: [
            { label: '3 Jahre Frontend', points: 10, type: 'positive' },
            { label: 'Ausbildung FI AE', points: 6, type: 'positive' },
            { label: 'Kein Backend/Node.js', points: -10, type: 'negative' },
            { label: 'Kein Cloud', points: -8, type: 'negative' },
            { label: 'Agenturumfeld', points: -4, type: 'neutral' }
        ],
        counterfactual: 'Mit einer Node.js/AWS-Weiterbildung (4 Monate) steigt der Score von 58 auf 74.'
    },

    {
        id: 'mike', name: 'Mike Fechner', initials: 'MF',
        jobFamily: 'Operations', jobFamilyAffinities: [],
        age: 47, city: 'Bremen', region: 'nord', appliedDate: '2026-01-22', appliedPositionId: 7,
        experience: '6 Jahre Kleinunternehmer (Einzelhandel), zuvor diverse kurze Engagements', experienceYears: 6,
        education: 'Realschulabschluss',
        skills: ['Kundenkontakt', 'Eigenständigkeit'],
        certifications: [],
        insuranceFlags: {
            green: ['Selbstständigkeits-Erfahrung'],
            red: ['Keine IT-Erfahrung', 'Keine Führung größerer Teams', 'Zu wenig Qualifikation'],
            neutral: ['Häufige kurze Engagements früher']
        },
        strengths: ['Eigenverantwortung aus Selbstständigkeit'],
        weaknesses: ['Keine IT-Kenntnisse', 'Keine akademische/fachliche Qualifikation', 'Kein Bezug zu IT-Operations'],
        neutrals: [],
        scores: { vertrieb: 25, branche: 10, qualifikation: 15, standort: 30, softskills: 45 },
        totalScore: 32, status: 'rejected',
        summary: 'Selbstständigkeits-Erfahrung als Einzelhändler, jedoch ohne jeglichen Bezug zur IT oder zur ausgeschriebenen Führungsrolle. Eine Bewerbung auf "IT Operations Lead" ist fachlich nicht tragfähig. Standardisierte Absage empfohlen.',
        waterfall: [
            { label: 'Eigenständigkeit', points: 4, type: 'positive' },
            { label: 'Keine IT-Erfahrung', points: -18, type: 'negative' },
            { label: 'Keine passende Qualifikation', points: -15, type: 'negative' },
            { label: 'Standort ohne Match', points: -8, type: 'negative' }
        ],
        counterfactual: 'Für die ausgeschriebene Position nicht sinnvoll umqualifizierbar.'
    },

    {
        id: 'kathrin', name: 'Kathrin Lindberg', initials: 'KL',
        jobFamily: 'Human Resources', jobFamilyAffinities: ['Human Resources'],
        age: 39, city: 'Hamburg', region: 'nord', appliedDate: '2026-02-03', appliedPositionId: 1,
        experience: '9 Jahre HR (davon 3 Jahre HR-Manager Retail)', experienceYears: 9,
        education: 'B.A. BWL mit Schwerpunkt HR',
        skills: ['HR-Administration', 'Recruiting', 'Arbeitsrecht-Grundlagen', 'Excel'],
        certifications: ['B.A. BWL (DQR 6)', 'AEVO'],
        insuranceFlags: {
            green: ['9J HR-Erfahrung', 'HR-Manager-Rolle', 'BWL-Abschluss'],
            red: ['Keine reine HR-BP-Rolle bisher'],
            neutral: ['Branchenwechsel Retail → neue Zielbranche']
        },
        strengths: ['9 Jahre HR-Erfahrung', '3 Jahre HR-Management', 'Breite HR-Palette'],
        weaknesses: ['Keine klassische HR-BP-Rolle', 'Kein Change-Management-Schwerpunkt'],
        neutrals: ['Branchenwechsel aus Retail'],
        scores: { vertrieb: 72, branche: 68, qualifikation: 78, standort: 70, softskills: 78 },
        totalScore: 74, status: 'review',
        summary: '9 Jahre breite HR-Erfahrung im Retail, davon 3 Jahre als HR-Manager. Für die Senior-HR-BP-Rolle ein interessanter Kandidat, jedoch fehlt klassisches HR-BP-Profil und Change-Fokus. Empfehlung: 2. Interview zur Prüfung der BP-Eignung und Change-Erfahrung.',
        waterfall: [
            { label: '9 Jahre HR-Erfahrung', points: 13, type: 'positive' },
            { label: 'HR-Manager-Rolle', points: 10, type: 'positive' },
            { label: 'B.A. BWL', points: 8, type: 'positive' },
            { label: 'Keine BP-Rolle bisher', points: -7, type: 'negative' },
            { label: 'Standort Hamburg (Berlin gesucht)', points: -5, type: 'negative' }
        ],
        counterfactual: 'Nach 12 Monaten als HR BP in einer Zwischenrolle oder mit einem großen Change-Projekt steigt der Score von 74 auf 85.'
    }
];
