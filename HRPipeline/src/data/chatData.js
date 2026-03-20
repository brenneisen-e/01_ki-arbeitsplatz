export const HP_CHAT_BEWERBER_START = [
    { label: 'Welche Stellen passen zu mir?', icon: 'search', action: 'stellen_passend' },
    { label: 'Was sind die Anforderungen?', icon: 'info', action: 'anforderungen' },
    { label: 'Stellen in meiner Nähe?', icon: 'map', action: 'stellen_naehe' },
    { label: 'Warum wurde ich abgelehnt?', icon: 'alert', action: 'ablehnung' },
    { label: 'Profil verbessern?', icon: 'trending', action: 'profil_verbessern' }
];

export const HP_CHAT_ARBEITGEBER_START = [
    { label: 'Pipeline-Überblick', icon: 'bar', action: 'pipeline' },
    { label: 'Top Kandidaten', icon: 'star', action: 'top_kandidaten' },
    { label: 'Kritische Bewerbungen', icon: 'alert', action: 'kritische' },
    { label: 'Absage-Mail generieren', icon: 'mail', action: 'absage_mail' },
    { label: 'Matching-Kriterien', icon: 'info', action: 'matching_kriterien' }
];

export const HP_CHAT_RESPONSES = {
    stellen_passend: {
        getText: (profile, getHPMatchesForProfile) => {
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
        getText: (profile, getHPMatchesForProfile) => {
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
        getText: (profile, getHPMatchesForProfile) => {
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
