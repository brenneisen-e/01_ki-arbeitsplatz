// ========================================
// HR-COCKPIT (H-03) — Frühwarnsystem
// ========================================

let hcInitialized = false;
let hcCurrentView = 'overview';
let hcSelectedRD = null;

// --- Regionaldirektionen Demo Data ---
const HC_REGIONALDIREKTIONEN = [
    { id: 'rd_nrw_west', name: 'RD Düsseldorf', region: 'NRW West', lat: 51.23, lng: 6.78, headcount: 584, budgeted: 620, states: ['Nordrhein-Westfalen'] },
    { id: 'rd_nrw_ost', name: 'RD Dortmund', region: 'NRW Ost', lat: 51.51, lng: 7.47, headcount: 461, budgeted: 500, states: [] },
    { id: 'rd_nrw_sued', name: 'RD Köln', region: 'NRW Süd', lat: 50.94, lng: 6.96, headcount: 523, budgeted: 560, states: ['Rheinland-Pfalz', 'Saarland'] },
    { id: 'rd_nord_west', name: 'RD Hamburg', region: 'Nord-West', lat: 53.55, lng: 9.99, headcount: 392, budgeted: 430, states: ['Hamburg', 'Bremen', 'Schleswig-Holstein'] },
    { id: 'rd_nord_ost', name: 'RD Berlin', region: 'Nord-Ost', lat: 52.52, lng: 13.40, headcount: 341, budgeted: 390, states: ['Berlin', 'Brandenburg', 'Mecklenburg-Vorpommern'] },
    { id: 'rd_mitte_west', name: 'RD Frankfurt', region: 'Mitte-West', lat: 50.11, lng: 8.68, headcount: 482, budgeted: 520, states: ['Hessen'] },
    { id: 'rd_mitte_ost', name: 'RD Erfurt', region: 'Mitte-Ost', lat: 50.98, lng: 11.03, headcount: 251, budgeted: 310, states: ['Thüringen', 'Sachsen-Anhalt'] },
    { id: 'rd_sued_west', name: 'RD Stuttgart', region: 'Süd-West', lat: 48.78, lng: 9.18, headcount: 472, budgeted: 510, states: ['Baden-Württemberg'] },
    { id: 'rd_sued_ost', name: 'RD München', region: 'Süd-Ost', lat: 48.14, lng: 11.58, headcount: 563, budgeted: 600, states: ['Bayern'] },
    { id: 'rd_nord_mitte', name: 'RD Hannover', region: 'Nord-Mitte', lat: 52.37, lng: 9.74, headcount: 351, budgeted: 400, states: ['Niedersachsen'] },
    { id: 'rd_sued_mitte', name: 'RD Nürnberg', region: 'Süd-Mitte', lat: 49.45, lng: 11.08, headcount: 372, budgeted: 420, states: [] },
    { id: 'rd_ost', name: 'RD Dresden', region: 'Ost', lat: 51.05, lng: 13.74, headcount: 222, budgeted: 280, states: ['Sachsen'] }
];

// Map Bundesland name → RD id for coloring the map
const HC_STATE_TO_RD = {};
HC_REGIONALDIREKTIONEN.forEach(rd => {
    (rd.states || []).forEach(s => { HC_STATE_TO_RD[s] = rd.id; });
});

// Format tenure for display: <1 Jahr → Monate, sonst Jahre
function formatTenure(t) {
    if (t < 1) {
        const months = Math.max(1, Math.round(t * 12));
        return months + ' Mon.';
    }
    return Math.round(t) + 'J';
}

// Generate health metrics per RD
function generateHCMetrics() {
    const profiles = [
        { bias: 'good', count: 4 },
        { bias: 'average', count: 5 },
        { bias: 'bad', count: 3 }
    ];
    let profileIdx = 0;
    let profileCount = 0;

    return HC_REGIONALDIREKTIONEN.map((rd, i) => {
        if (profileCount >= profiles[profileIdx].count) {
            profileIdx = Math.min(profileIdx + 1, profiles.length - 1);
            profileCount = 0;
        }
        profileCount++;
        const bias = profiles[profileIdx].bias;

        const base = bias === 'good' ? 75 : bias === 'average' ? 55 : 30;
        const variance = () => Math.round((Math.random() - 0.5) * 20);

        const retention = Math.min(100, Math.max(0, base + variance() + 5));
        const staffing = Math.min(100, Math.max(0, base + variance()));
        const engagement = Math.min(100, Math.max(0, base + variance() + 3));
        const demographics = Math.min(100, Math.max(0, base + variance() - 5));
        const production = Math.min(100, Math.max(0, base + variance() + 2));
        const quality = Math.min(100, Math.max(0, base + variance()));

        const composite = Math.round(
            retention * 0.25 + staffing * 0.15 + engagement * 0.20 +
            demographics * 0.10 + production * 0.15 + quality * 0.15
        );

        const turnoverRate = bias === 'good' ? (5 + Math.random() * 4) : bias === 'average' ? (9 + Math.random() * 5) : (14 + Math.random() * 6);
        const vacancyRate = ((rd.budgeted - rd.headcount) / rd.budgeted * 100);

        // Generate 12-month trend
        const trend = [];
        let trendVal = composite;
        for (let m = 0; m < 12; m++) {
            trendVal = Math.min(100, Math.max(0, trendVal + (Math.random() - 0.5) * 8));
            trend.push(Math.round(trendVal));
        }

        return {
            ...rd,
            metrics: { retention, staffing, engagement, demographics, production, quality },
            composite,
            turnoverRate: Math.round(turnoverRate * 10) / 10,
            vacancyRate: Math.round(vacancyRate * 10) / 10,
            trend,
            tier: composite >= 75 ? 'green' : composite >= 40 ? 'amber' : 'red'
        };
    });
}

// Generate synthetic agents
function generateHCAgents(rdData) {
    const agents = [];
    const firstNames = ['Alexander','Benjamin','Christian','Daniel','Erik','Felix','Georg','Hans','Ingo','Jürgen','Klaus','Lars','Martin','Norbert','Oliver','Peter','Ralf','Stefan','Thomas','Uwe','Werner','Andreas','Bernd','Dieter','Frank','Holger','Michael','Rainer','Volker','Wolfgang','Anna','Barbara','Christine','Doris','Elisabeth','Franziska','Gabriele','Heike','Ingrid','Julia','Karin','Lena','Maria','Nina','Petra','Rita','Sandra','Tanja','Ursula','Vera'];
    const lastNames = ['Müller','Schmidt','Schneider','Fischer','Weber','Meyer','Wagner','Becker','Schulz','Hoffmann','Schäfer','Koch','Bauer','Richter','Klein','Wolf','Schröder','Neumann','Schwarz','Zimmermann','Braun','Krüger','Hofmann','Hartmann','Lange','Werner','Krause','Lehmann','Schmitt','König'];
    // Tenure-abhängige Risikofaktoren — nur Faktoren die für die jeweilige Lebensphase sinnvoll sind
    const factorsByTenure = {
        // <3 Monate: Onboarding-Phase — kein Track Record, kein Bestand, keine Beförderungshistorie
        earlyOnboarding: {
            primary: 'Zugehörigkeit <3 Monate — Frühfluktuation',
            pool: [
                'Zufriedenheit Onboarding-Prozess (letzte Umfrage: niedrig)',
                'Einschätzung Führungskraft: Integration gefährdet',
                'Erwartungslücke Vergütung vs. Realität',
                'Kein Pate/Mentor zugewiesen',
                'Noch kein erster Abschluss erzielt',
                'Geografische Entfernung zum Team/Büro',
                'Wettbewerber-Recruiting aktiv (Branche)',
                'Vorherige Branchenerfahrung: gering'
            ]
        },
        // 3–12 Monate: Einarbeitung — erste Erfahrungen, noch kein stabiler Bestand
        onboarding: {
            primary: 'Zugehörigkeit <12 Monate — Einarbeitungsphase',
            pool: [
                'Zufriedenheit letzte Mitarbeiterumfrage: unterdurchschnittlich',
                'Einschätzung Führungskraft: Entwicklung unter Plan',
                'Bestandsaufbau hinter Erwartung',
                'Erste Stornierungen im jungen Bestand',
                'Geringe Teilnahme an Teamveranstaltungen',
                'Unregelmäßige CRM-Nutzung',
                'Startfinanzierung / Zuschüsse laufen aus',
                'Team-Abgänge (Ansteckungseffekt)',
                'Manager-Wechsel <180 Tage',
                'Wettbewerber-Recruiting aktiv'
            ]
        },
        // 1–2 Jahre: Aufbauphase — erste eigene Ergebnisse, Stabilisierung
        building: {
            primary: 'Zugehörigkeit <24 Monate — kritische Phase',
            pool: [
                'Zufriedenheit letzte Mitarbeiterumfrage: unterdurchschnittlich',
                'Einschätzung Führungskraft: Leistungsentwicklung stagniert',
                'Provisionsrückgang vs. Vorquartal',
                'Zielerfüllung <70%',
                'Stornoquote über Durchschnitt',
                'Bestandsgröße unter Peergroup-Niveau',
                'CRM-Aktivität rückläufig',
                'Team-Abgänge (Ansteckungseffekt)',
                'Manager-Wechsel <180 Tage',
                'Wettbewerber-Recruiting aktiv',
                'Geringe Netzwerk-Integration in der Region'
            ]
        },
        // 2–5 Jahre: Etablierungsphase — vollständiger Leistungsvergleich möglich
        established: {
            pool: [
                'Zufriedenheit letzte Mitarbeiterumfrage: unterdurchschnittlich',
                'Einschätzung Führungskraft: Motivationsrückgang',
                'Provisionsrückgang >20%',
                'Stornoquote über Durchschnitt',
                'Zielerfüllung <70%',
                'Engagement-Score rückläufig',
                'CRM-Aktivität rückläufig',
                'IDD-Weiterbildung unvollständig',
                'Team-Abgänge (Ansteckungseffekt)',
                'Manager-Wechsel <180 Tage',
                'Compa-Ratio <0.80',
                'Wettbewerber-Recruiting aktiv',
                'Keine freiwillige Weiterbildung seit 18 Mon.'
            ]
        },
        // >5 Jahre: Erfahrene Vermittler — voller Feature-Set
        senior: {
            pool: [
                'Einschätzung Führungskraft: Motivationsrückgang',
                'Zufriedenheit letzte Mitarbeiterumfrage: unterdurchschnittlich',
                'Monate seit letzter Beförderung',
                'Provisionsrückgang >20%',
                'Stornoquote über Durchschnitt',
                'Zielerfüllung <70%',
                'Engagement-Score rückläufig',
                'CRM-Aktivität rückläufig',
                'IDD-Weiterbildung unvollständig',
                'Keine freiwillige Weiterbildung seit 18 Mon.',
                'Team-Abgänge (Ansteckungseffekt)',
                'Manager-Wechsel <180 Tage',
                'Compa-Ratio <0.80',
                'Wettbewerber-Recruiting aktiv',
                'Fehlende Karriereperspektive / Stagnation'
            ]
        }
    };

    // Schutzfaktoren je Tenure-Gruppe
    const protectiveByTenure = {
        earlyOnboarding: [
            'Pate/Mentor aktiv zugewiesen',
            'Strukturierter Einarbeitungsplan vorhanden',
            'Startfinanzierung gesichert'
        ],
        onboarding: [
            'Regelmäßige VD-Feedbackgespräche',
            'Erste Abschlüsse erzielt',
            'Hohe Teamintegration',
            'Bestandszuweisung erfolgt'
        ],
        building: [
            'Provisionen steigend',
            'Zufriedenheit letzte Umfrage: hoch',
            'Aktive Teilnahme an Weiterbildung',
            'Stabiler Bestandsaufbau'
        ],
        established: [
            'Hohe Zufriedenheit (letzte Umfrage)',
            'Überdurchschnittliche Zielerreichung',
            'Aktive Weiterbildungsteilnahme',
            'Starke Kundenbeziehungen (niedr. Storno)'
        ],
        senior: [
            'Hohe Zufriedenheit (letzte Umfrage)',
            'Mentorrolle für Nachwuchs',
            'Überdurchschnittliche Zielerreichung',
            'Langjährige stabile Kundenbeziehungen',
            'Regionale Verwurzelung'
        ]
    };

    // Tier-Verteilung: 642 Rot, 512 Gelb, Rest Grün — proportional pro RD
    const totalHC = rdData.reduce((s, r) => s + r.headcount, 0);
    const TARGET_RED = 642, TARGET_AMBER = 512;

    let agentId = 1;
    let globalRedRemaining = TARGET_RED, globalAmberRemaining = TARGET_AMBER, globalGreenRemaining = totalHC - TARGET_RED - TARGET_AMBER;

    rdData.forEach((rd, rdIdx) => {
        const count = rd.headcount;
        const isLast = rdIdx === rdData.length - 1;
        // Proportionale Zuweisung pro RD, letzte RD bekommt Rest
        const rdRed = isLast ? globalRedRemaining : Math.round(TARGET_RED * count / totalHC);
        const rdAmber = isLast ? globalAmberRemaining : Math.round(TARGET_AMBER * count / totalHC);
        const rdGreen = count - rdRed - rdAmber;
        globalRedRemaining -= rdRed;
        globalAmberRemaining -= rdAmber;
        globalGreenRemaining -= rdGreen;

        // Tier-Array mischen
        const tierAssignments = [
            ...Array(rdRed).fill('red'),
            ...Array(rdAmber).fill('amber'),
            ...Array(Math.max(0, rdGreen)).fill('green')
        ].sort(() => Math.random() - 0.5);

        for (let a = 0; a < count; a++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const age = Math.round(53.7 + (Math.random() - 0.5) * 16 + (Math.random() > 0.956 ? -25 : 0));
            // Zugehörigkeitsverteilung: 33% Frühfluktuation (<3 Mon.), 60% <2 Jahre
            const tenureRoll = Math.random();
            let tenure;
            if (tenureRoll < 0.33) tenure = Math.round(Math.random() * 2.5 * 10 + 1) / 120; // 0–3 Monate (in Jahren: 0.01–0.25)
            else if (tenureRoll < 0.60) tenure = Math.round((0.25 + Math.random() * 1.75) * 100) / 100; // 3–24 Monate (0.25–2.0 Jahre)
            else if (tenureRoll < 0.80) tenure = Math.round(2 + Math.random() * 6); // 2–8 Jahre
            else if (age > 50) tenure = Math.round(8 + Math.random() * 20); // langjährige AO-Vermittler
            else tenure = Math.round(3 + Math.random() * 10); // 3–13 Jahre

            // Risiko-Score passend zum zugewiesenen Tier
            const riskTier = tierAssignments[a] || 'green';
            let riskScore, prevScore;
            if (riskTier === 'red') {
                riskScore = Math.round(55 + Math.random() * 23); // 55–78%
            } else if (riskTier === 'amber') {
                riskScore = Math.round(25 + Math.random() * 29); // 25–54%
            } else {
                riskScore = Math.round(5 + Math.random() * 19); // 5–24%
            }
            prevScore = Math.min(78, Math.max(5, Math.round(riskScore + (Math.random() - 0.5) * 12)));

            // Tenure-Gruppe bestimmen
            let tenureGroup, tenureKey;
            if (tenure < 0.25) { tenureGroup = factorsByTenure.earlyOnboarding; tenureKey = 'earlyOnboarding'; }
            else if (tenure < 1) { tenureGroup = factorsByTenure.onboarding; tenureKey = 'onboarding'; }
            else if (tenure < 2) { tenureGroup = factorsByTenure.building; tenureKey = 'building'; }
            else if (tenure < 5) { tenureGroup = factorsByTenure.established; tenureKey = 'established'; }
            else { tenureGroup = factorsByTenure.senior; tenureKey = 'senior'; }

            // Risiko-erhöhende Faktoren zusammenstellen
            const primaryFactor = tenureGroup.primary || null;
            const shuffledPool = [...tenureGroup.pool].sort(() => Math.random() - 0.5);
            const riskFactorList = primaryFactor
                ? [primaryFactor, ...shuffledPool]
                : shuffledPool;

            // Schutzfaktoren für die Tenure-Gruppe
            const protPool = [...(protectiveByTenure[tenureKey] || [])].sort(() => Math.random() - 0.5);

            // SHAP-Werte: müssen sich auf (riskScore - baselineRisk) aufsummieren
            const shapFactors = [];
            const baselineRisk = 15;
            const totalDelta = riskScore - baselineRisk;

            // Bei Grün: 3 Risiko + 2 Schutzfaktoren; bei Gelb: 4+1; bei Rot: 5+0
            const numRisk = riskTier === 'red' ? 5 : riskTier === 'amber' ? 4 : 3;
            const numProt = 5 - numRisk;

            // Gewichte berechnen
            const rawWeights = [];
            for (let f = 0; f < 5; f++) {
                if (f < numRisk) {
                    // Risiko-erhöhend: abnehmende Stärke
                    const w = f < 2 ? (0.5 + Math.random() * 0.5) : (0.15 + Math.random() * 0.25);
                    rawWeights.push(w);
                } else {
                    // Schutzfaktor: negativ
                    const w = 0.1 + Math.random() * 0.2;
                    rawWeights.push(-w);
                }
            }
            const posSum = rawWeights.filter(w => w > 0).reduce((s, w) => s + w, 0);
            const negSum = Math.abs(rawWeights.filter(w => w < 0).reduce((s, w) => s + w, 0));

            // Positive Faktoren skalieren auf totalDelta + Ausgleichsbetrag für negative
            const negBudget = numProt > 0 ? Math.abs(totalDelta) * 0.15 : 0;
            const posBudget = totalDelta + negBudget;

            for (let f = 0; f < 5; f++) {
                let scaledVal;
                if (rawWeights[f] > 0) {
                    scaledVal = (rawWeights[f] / posSum) * posBudget;
                } else {
                    scaledVal = negSum > 0 ? (rawWeights[f] / negSum) * -negBudget : 0;
                }
                const factor = f < numRisk
                    ? riskFactorList[f] || riskFactorList[riskFactorList.length - 1]
                    : protPool[f - numRisk] || 'Stabile Rahmenbedingungen';
                shapFactors.push({ factor, value: Math.round(scaledVal * 10) / 10 });
            }
            shapFactors.sort((a, b) => b.value - a.value);

            agents.push({
                id: `V-${String(agentId).padStart(4, '0')}`,
                name: `${firstName} ${lastName}`,
                rdId: rd.id,
                rdName: rd.name,
                age: Math.min(67, Math.max(22, age)),
                tenure,
                riskScore,
                prevScore,
                riskTier,
                change: riskScore - prevScore,
                topFactor: shapFactors[0]?.factor || 'Keine Auffälligkeiten',
                shapFactors
            });
            agentId++;
        }
    });
    return agents;
}

// Generate alerts
function generateHCAlerts(agents, rdData) {
    const alerts = [];
    const highRiskAgents = agents.filter(a => a.riskTier === 'red').slice(0, 8);
    highRiskAgents.forEach((a, i) => {
        alerts.push({
            type: 'flight_risk',
            severity: 'red',
            title: `Hohes Abgangsrisiko: ${a.name} (${a.id})`,
            desc: `Score ${a.riskScore}% — Top-Faktor: ${a.topFactor}`,
            rd: a.rdName,
            daysAgo: Math.floor(Math.random() * 14)
        });
    });

    const criticalRDs = rdData.filter(r => r.tier === 'red');
    criticalRDs.forEach(rd => {
        alerts.push({
            type: 'unit_health',
            severity: 'amber',
            title: `Kritischer Gesundheitsscore: ${rd.name}`,
            desc: `Composite Score ${rd.composite}/100 — unter Schwellenwert 40`,
            rd: rd.name,
            daysAgo: Math.floor(Math.random() * 7)
        });
    });

    // Contagion alerts
    const contagionRDs = rdData.slice(0, 3);
    contagionRDs.forEach(rd => {
        alerts.push({
            type: 'contagion',
            severity: 'amber',
            title: `Ansteckungseffekt: ${rd.name}`,
            desc: `Abgang vor ${Math.floor(Math.random() * 80 + 20)} Tagen — 135-Tage-Beobachtung aktiv`,
            rd: rd.name,
            daysAgo: Math.floor(Math.random() * 80 + 20)
        });
    });

    return alerts.sort((a, b) => a.daysAgo - b.daysAgo);
}

// Generate Kanban retention actions
function generateHCKanban(agents) {
    const highRisk = agents.filter(a => a.riskTier === 'red');
    const kanban = { identified: [], scheduled: [], action: [], resolved: [] };

    highRisk.slice(0, 5).forEach(a => {
        kanban.identified.push({ id: a.id, rd: a.rdName, tier: 'red', days: Math.floor(Math.random() * 10 + 1), assignee: a.rdName.replace('RD ', 'RDL ') });
    });
    highRisk.slice(5, 9).forEach(a => {
        kanban.scheduled.push({ id: a.id, rd: a.rdName, tier: 'red', days: Math.floor(Math.random() * 20 + 5), assignee: a.rdName.replace('RD ', 'RDL ') });
    });
    highRisk.slice(9, 12).forEach(a => {
        kanban.action.push({ id: a.id, rd: a.rdName, tier: 'amber', days: Math.floor(Math.random() * 30 + 15), assignee: a.rdName.replace('RD ', 'RDL '), action: ['Provisionsanpassung', 'Karrieregespräch', 'Mentoring-Programm'][Math.floor(Math.random() * 3)] });
    });
    highRisk.slice(12, 15).forEach(a => {
        kanban.resolved.push({ id: a.id, rd: a.rdName, tier: 'green', days: Math.floor(Math.random() * 60 + 30), result: ['Verbleib — Provisionserhöhung', 'Verbleib — interne Beförderung', 'Ausgeschieden'][Math.floor(Math.random() * 3)] });
    });

    return kanban;
}

// Stored data
let hcRDData = [];
let hcAgents = [];
let hcAlerts = [];
let hcKanban = {};

function initHRCockpit() {
    if (!hcInitialized) {
        hcRDData = generateHCMetrics();
        hcAgents = generateHCAgents(hcRDData);
        hcAlerts = generateHCAlerts(hcAgents, hcRDData);
        hcKanban = generateHCKanban(hcAgents);
        hcInitialized = true;

        // Populate selectors
        populateHCSelectors();
    }
    switchHCView(hcCurrentView);
}

function populateHCSelectors() {
    const rdSelect = document.getElementById('hcUnitRDSelect');
    const radarSelect = document.getElementById('hcRadarSelect');
    const ewFilterRD = document.getElementById('hcEWFilterRD');
    const shapSelect = document.getElementById('hcShapSelect');

    [rdSelect, radarSelect].forEach(sel => {
        if (!sel) return;
        sel.innerHTML = '';
        hcRDData.forEach(rd => {
            const opt = document.createElement('option');
            opt.value = rd.id;
            opt.textContent = `${rd.name} (${rd.composite}/100)`;
            sel.appendChild(opt);
        });
    });

    if (ewFilterRD) {
        const allOpt = ewFilterRD.querySelector('option[value="all"]');
        ewFilterRD.innerHTML = '';
        if (allOpt) ewFilterRD.appendChild(allOpt);
        else { const o = document.createElement('option'); o.value = 'all'; o.textContent = 'Alle Regionen'; ewFilterRD.appendChild(o); }
        hcRDData.forEach(rd => {
            const opt = document.createElement('option');
            opt.value = rd.id;
            opt.textContent = rd.name;
            ewFilterRD.appendChild(opt);
        });
    }

    if (shapSelect) {
        shapSelect.innerHTML = '<option value="">— Vermittler wählen —</option>';
        hcAgents.filter(a => a.riskTier === 'red').slice(0, 20).forEach(a => {
            const opt = document.createElement('option');
            opt.value = a.id;
            opt.textContent = `${a.id} — Score ${a.riskScore}% (${a.rdName})`;
            shapSelect.appendChild(opt);
        });
    }
}

function switchHCView(view) {
    hcCurrentView = view;
    document.querySelectorAll('.hc-subnav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
    document.querySelectorAll('.hc-view').forEach(v => v.classList.remove('active'));

    const viewMap = { overview: 'hcOverview', regions: 'hcRegions', unit: 'hcUnit', earlywarning: 'hcEarlyWarning' };
    const el = document.getElementById(viewMap[view]);
    if (el) el.classList.add('active');

    if (view === 'overview') renderHCOverview();
    else if (view === 'regions') renderHCRegions();
    else if (view === 'unit') renderHCUnitDetail();
    else if (view === 'earlywarning') renderHCEarlyWarnings();
}

// --- RENDER: Overview ---
function renderHCOverview() {
    renderHCKPIs();
    renderHCMap();
    renderHCFlightRiskDonut();
    renderHCAlerts();
    renderHCRiskMovers();
}

function renderHCKPIs() {
    const totalAgents = hcAgents.length;
    const redCount = hcAgents.filter(a => a.riskTier === 'red').length;
    const amberCount = hcAgents.filter(a => a.riskTier === 'amber').length;
    const greenCount = hcAgents.filter(a => a.riskTier === 'green').length;
    const avgTurnover = (hcRDData.reduce((s, r) => s + r.turnoverRate, 0) / hcRDData.length).toFixed(1);
    const avgEngagement = Math.round(hcRDData.reduce((s, r) => s + r.metrics.engagement, 0) / hcRDData.length);
    const nachwuchsQuote = ((hcAgents.filter(a => a.age < 35).length / totalAgents) * 100).toFixed(1);
    const avgTenure = '7,2';
    const totalVacanzen = hcRDData.reduce((s, r) => s + (r.budgeted - r.headcount), 0);
    const avgComposite = Math.round(hcRDData.reduce((s, r) => s + r.composite, 0) / hcRDData.length);

    const groups = [
        {
            label: 'Vermittlerbestand',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg>',
            cols: 4,
            kpis: [
                { label: 'AO-Vermittler (§84 HGB)', value: totalAgents.toLocaleString('de-DE'), desc: 'Aktive Ausschließlichkeitsvermittler im ERGO Vertrieb Deutschland', trend: '-3,2% vs. Vorjahr', trendDir: 'down', color: '' },
                { label: 'Vakanzen', value: totalVacanzen + ' offen', desc: 'Unbesetzte Planstellen über alle 12 Regionaldirektionen', trend: '+12 vs. Vorquartal', trendDir: 'down', color: totalVacanzen > 400 ? 'red' : '' },
                { label: 'Nachwuchsquote (<35 J.)', value: nachwuchsQuote + '%', desc: 'Anteil Vermittler unter 35 Jahren am Gesamtbestand', trend: '-0,8 Pp. vs. Vorjahr', trendDir: 'down', color: parseFloat(nachwuchsQuote) < 10 ? 'red' : '' },
                { label: 'Ø Unternehmenszugehörigkeit', value: avgTenure + ' Jahre', desc: 'Durchschnittliche Unternehmenszugehörigkeit aller AO-Vermittler', trend: '+0,3J vs. Vorjahr', trendDir: 'up', color: '' }
            ]
        },
        {
            label: 'Risikoanalyse & Fluktuation',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            cols: 4,
            kpis: [
                { label: 'Abgangsrisiko (Rot)', value: redCount.toLocaleString('de-DE'), desc: 'Vermittler mit Abgangswahrscheinlichkeit ≥55% (KI-Modell)', trend: '+' + Math.round(redCount * 0.08) + ' vs. Vormonat', trendDir: 'down', color: 'red' },
                { label: 'Abgangsrisiko (Gelb)', value: amberCount.toLocaleString('de-DE'), desc: 'Vermittler mit Abgangswahrscheinlichkeit 25–54%', trend: '+' + Math.round(amberCount * 0.04) + ' vs. Vormonat', trendDir: 'down', color: 'amber' },
                { label: 'Fluktuationsquote', value: avgTurnover + '%', desc: 'Ø Abgangsrate der letzten 12 Monate über alle RDs', trend: '+1,1 Pp. vs. Vorjahr', trendDir: 'down', color: parseFloat(avgTurnover) > 12 ? 'red' : '' },
                { label: 'Stornoquote', value: '2,8%', desc: 'Durchschnittliche Vertragsstornierungen im Vermittlerbestand', trend: '+0,1 Pp. vs. Vorjahr', trendDir: 'down', color: '' }
            ]
        },
        {
            label: 'Engagement & Gesundheitsscore',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
            cols: 3,
            kpis: [
                { label: 'Engagement Score', value: avgEngagement + '/100', desc: 'Gewichteter Index aus Weiterbildung, CRM-Aktivität und Vertriebsinitiative', trend: '-2 Pkt. vs. Vormonat', trendDir: 'down', color: avgEngagement < 50 ? 'red' : avgEngagement < 70 ? 'amber' : 'green' },
                { label: 'Gesundheitsindex (Gesamt)', value: avgComposite + '/100', desc: 'Ø Gesundheitsscore aller RDs (6 Dimensionen gewichtet)', trend: '-1,5 Pkt. vs. Vorquartal', trendDir: 'down', color: avgComposite < 50 ? 'red' : avgComposite < 70 ? 'amber' : 'green' },
                { label: 'RDs im roten Bereich', value: hcRDData.filter(r => r.tier === 'red').length + ' von ' + hcRDData.length, desc: 'Regionaldirektionen mit Gesundheitsscore unter 40', trend: '', trendDir: 'down', color: hcRDData.filter(r => r.tier === 'red').length > 3 ? 'red' : '' }
            ]
        }
    ];

    const container = document.getElementById('hcKpiSection');
    if (!container) return;
    container.innerHTML = groups.map(g => `
        <div class="hc-kpi-group-label">
            ${g.icon} ${g.label}
        </div>
        <div class="hc-kpi-row" style="grid-template-columns: repeat(${g.cols}, 1fr);">
            ${g.kpis.map(k => `
                <div class="hc-kpi-card">
                    <div class="hc-kpi-label">${k.label}</div>
                    <div class="hc-kpi-value ${k.color}">${k.value}</div>
                    <div class="hc-kpi-desc">${k.desc}</div>
                    ${k.trend ? `<div class="hc-kpi-trend ${k.trendDir === 'up' ? 'up' : 'down'}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                            ${k.trendDir === 'up' ? '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>' : '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>'}
                        </svg>
                        ${k.trend}
                    </div>` : ''}
                </div>
            `).join('')}
        </div>
    `).join('');
}

async function renderHCMap() {
    const container = document.getElementById('hcGermanyMap');
    if (!container || typeof d3 === 'undefined') return;

    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:300px;color:var(--text-tertiary)">Karte wird geladen...</div>';

    const width = 380;
    const height = 500;

    try {
        const geojson = await d3.json('assets/geo/bundeslaender.geo.json');

        container.innerHTML = '';

        // Build RD lookup by state name
        const stateRDMap = {};
        hcRDData.forEach(rd => {
            const origRD = HC_REGIONALDIREKTIONEN.find(r => r.id === rd.id);
            if (origRD && origRD.states) {
                origRD.states.forEach(s => { stateRDMap[s] = rd; });
            }
        });

        const svg = d3.select(container)
            .append('svg')
            .attr('width', '100%')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('class', 'hc-map-svg');

        svg.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'var(--surface, #f8fafc)')
            .attr('rx', 8);

        const projection = d3.geoMercator().fitSize([width - 20, height - 20], geojson);
        const pathGen = d3.geoPath().projection(projection);

        // Tooltip div
        let tooltip = d3.select(container).select('.hc-map-tooltip');
        if (tooltip.empty()) {
            tooltip = d3.select(container).append('div').attr('class', 'hc-map-tooltip');
        }

        // Draw states
        svg.append('g')
            .selectAll('path')
            .data(geojson.features)
            .enter()
            .append('path')
            .attr('d', pathGen)
            .attr('fill', d => {
                const rd = stateRDMap[d.properties.name];
                if (!rd) return '#e5e7eb';
                return rd.tier === 'green' ? 'rgba(22,163,74,0.35)' : rd.tier === 'amber' ? 'rgba(217,119,6,0.35)' : 'rgba(220,38,38,0.35)';
            })
            .attr('stroke', '#94a3b8')
            .attr('stroke-width', 1)
            .style('cursor', d => stateRDMap[d.properties.name] ? 'pointer' : 'default')
            .on('mouseenter', function(event, d) {
                const rd = stateRDMap[d.properties.name];
                d3.select(this).attr('stroke-width', 2.5).attr('stroke', rd ? '#0ea5e9' : '#94a3b8');
                if (rd) {
                    d3.select(this).style('filter', 'drop-shadow(0 2px 6px rgba(14,165,233,0.4))');
                    tooltip.html(`
                        <div style="font-weight:700;margin-bottom:4px">${rd.name}</div>
                        <div style="font-size:11px;color:#64748b;margin-bottom:6px">${d.properties.name}</div>
                        <div style="display:flex;gap:12px;font-size:12px">
                            <span>Score: <b style="color:${rd.tier === 'green' ? '#16A34A' : rd.tier === 'amber' ? '#D97706' : '#DC2626'}">${rd.composite}</b></span>
                            <span>Vermittler: <b>${rd.headcount}</b></span>
                        </div>
                        <div style="font-size:12px;margin-top:4px">Fluktuation: <b>${rd.turnoverRate}%</b> · Vakanzen: <b>${rd.vacancyRate.toFixed(1)}%</b></div>
                    `).style('display', 'block')
                      .style('left', (event.offsetX + 15) + 'px')
                      .style('top', (event.offsetY - 10) + 'px');
                }
            })
            .on('mouseleave', function(event, d) {
                const rd = stateRDMap[d.properties.name];
                d3.select(this).attr('stroke-width', 1).attr('stroke', '#94a3b8').style('filter', 'none');
                tooltip.style('display', 'none');
            })
            .on('click', function(event, d) {
                const rd = stateRDMap[d.properties.name];
                if (rd) selectHCRegion(rd.id);
            });

        // RD markers (circles at city positions)
        const markerGroup = svg.append('g');
        hcRDData.forEach(rd => {
            const origRD = HC_REGIONALDIREKTIONEN.find(r => r.id === rd.id);
            if (!origRD) return;
            const [cx, cy] = projection([origRD.lng, origRD.lat]);
            const color = rd.tier === 'green' ? '#16A34A' : rd.tier === 'amber' ? '#D97706' : '#DC2626';
            const r = Math.max(10, Math.min(18, rd.headcount / 6));

            markerGroup.append('circle')
                .attr('cx', cx).attr('cy', cy).attr('r', r)
                .attr('fill', color).attr('opacity', 0.9)
                .attr('stroke', 'white').attr('stroke-width', 2)
                .style('cursor', 'pointer')
                .style('filter', 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))')
                .on('click', () => selectHCRegion(rd.id));

            markerGroup.append('text')
                .attr('x', cx).attr('y', cy + 1)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'central')
                .attr('fill', 'white')
                .attr('font-size', '9px')
                .attr('font-weight', 'bold')
                .style('pointer-events', 'none')
                .text(rd.composite);
        });

    } catch (error) {
        console.error('HC Map error:', error);
        container.innerHTML = '<div style="text-align:center;color:var(--text-tertiary);padding:2rem">Karte konnte nicht geladen werden</div>';
    }

    // Legend (appended below SVG)
    let legend = container.querySelector('.hc-map-legend');
    if (!legend) {
        legend = document.createElement('div');
        legend.className = 'hc-map-legend';
        legend.innerHTML = `
            <span class="hc-legend-item"><span class="hc-legend-dot" style="background:#16A34A"></span>Gesund (75+)</span>
            <span class="hc-legend-item"><span class="hc-legend-dot" style="background:#D97706"></span>Gefährdet (40–74)</span>
            <span class="hc-legend-item"><span class="hc-legend-dot" style="background:#DC2626"></span>Kritisch (<40)</span>
        `;
        container.appendChild(legend);
    }
}

function selectHCRegion(rdId) {
    hcSelectedRD = rdId;
    const rdSelect = document.getElementById('hcUnitRDSelect');
    if (rdSelect) rdSelect.value = rdId;
    switchHCView('unit');
}

function renderHCFlightRiskDonut() {
    const container = document.getElementById('hcFlightRiskDonut');
    if (!container) return;

    const total = hcAgents.length;
    const red = hcAgents.filter(a => a.riskTier === 'red').length;
    const amber = hcAgents.filter(a => a.riskTier === 'amber').length;
    const green = hcAgents.filter(a => a.riskTier === 'green').length;

    const redPct = red / total;
    const amberPct = amber / total;
    const greenPct = green / total;

    const r = 70;
    const cx = 90;
    const cy = 90;
    const circumference = 2 * Math.PI * r;

    const redLen = circumference * redPct;
    const amberLen = circumference * amberPct;
    const greenLen = circumference * greenPct;

    const redOffset = 0;
    const amberOffset = redLen;
    const greenOffset = redLen + amberLen;

    container.innerHTML = `
        <svg viewBox="0 0 180 180" class="hc-donut-svg">
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#DC2626" stroke-width="24"
                stroke-dasharray="${redLen} ${circumference - redLen}" stroke-dashoffset="${circumference / 4}" />
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#D97706" stroke-width="24"
                stroke-dasharray="${amberLen} ${circumference - amberLen}" stroke-dashoffset="${circumference / 4 - redLen}" />
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#16A34A" stroke-width="24"
                stroke-dasharray="${greenLen} ${circumference - greenLen}" stroke-dashoffset="${circumference / 4 - redLen - amberLen}" />
            <text x="${cx}" y="${cy - 6}" text-anchor="middle" class="hc-donut-total">${total}</text>
            <text x="${cx}" y="${cy + 10}" text-anchor="middle" class="hc-donut-label">Vermittler</text>
        </svg>
        <div class="hc-donut-legend">
            <div class="hc-donut-legend-item"><span class="hc-legend-dot" style="background:#DC2626"></span>Hoch: ${red} (${(redPct * 100).toFixed(0)}%)</div>
            <div class="hc-donut-legend-item"><span class="hc-legend-dot" style="background:#D97706"></span>Mittel: ${amber} (${(amberPct * 100).toFixed(0)}%)</div>
            <div class="hc-donut-legend-item"><span class="hc-legend-dot" style="background:#16A34A"></span>Niedrig: ${green} (${(greenPct * 100).toFixed(0)}%)</div>
        </div>
    `;
}

function renderHCAlerts() {
    const container = document.getElementById('hcAlertsList');
    const countEl = document.getElementById('hcAlertCount');
    if (!container) return;

    if (countEl) countEl.textContent = hcAlerts.length;

    container.innerHTML = hcAlerts.slice(0, 8).map(a => `
        <div class="hc-alert-item ${a.severity}">
            <div class="hc-alert-icon">
                ${a.type === 'flight_risk' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>'
                : a.type === 'contagion' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
                : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'}
            </div>
            <div class="hc-alert-content">
                <div class="hc-alert-title">${a.title}</div>
                <div class="hc-alert-desc">${a.desc}</div>
            </div>
            <div class="hc-alert-meta">
                <span class="hc-alert-rd">${a.rd}</span>
                <span class="hc-alert-time">vor ${a.daysAgo}T</span>
            </div>
        </div>
    `).join('');
}
window.__registerModule('hc-cockpit-data.js');
