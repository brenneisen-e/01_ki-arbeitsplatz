// ========================================
// INSURER MODE CONFIGURATION
// ========================================
const LOGO_KEY = 'pk_H7vb5Y2lTsW47U4Xq-w3HA'
export const logoUrl = (domain) => `https://img.logo.dev/${domain}?token=${LOGO_KEY}&size=64&format=png`

export const insurerModes = {
  barmeniagothaer: {
    key: 'barmeniagothaer',
    name: 'BarmeniaGothaer',
    short: 'BG',
    logo: logoUrl('barmenia.de'),
    colors: {
      primary: '#0C2340',
      primaryLight: '#1a4a7a',
      accent: '#00A3E0',
      gradient: 'linear-gradient(135deg, #0C2340 0%, #1a4a7a 60%, #00A3E0 100%)',
      sidebarGradient: 'linear-gradient(180deg, #0C2340 0%, #0f2d52 100%)',
      ubSidebarGradient: 'linear-gradient(180deg, #7c2d12 0%, #9a3412 50%, #7c2d12 100%)',
      ubBorder: '#ea580c',
      simBorder: '#00A3E0',
    },
    beraterTitel: 'Bezirksdirektor',
    region: 'VD Wuppertal',
    modellName: 'ICM2026',
  },
  ergo: {
    key: 'ergo',
    name: 'ERGO',
    short: 'ER',
    logo: logoUrl('ergo.de'),
    colors: {
      primary: '#86181d',
      primaryLight: '#C8102E',
      accent: '#e8c547',
      gradient: 'linear-gradient(135deg, #5a1018 0%, #86181d 40%, #a02028 100%)',
      sidebarGradient: 'linear-gradient(180deg, #5a1018 0%, #86181d 100%)',
      ubSidebarGradient: 'linear-gradient(180deg, #4a0e14 0%, #6b1520 50%, #4a0e14 100%)',
      ubBorder: '#C8102E',
      simBorder: '#C8102E',
    },
    beraterTitel: 'Geschäftsstellenleiter',
    region: 'RD Düsseldorf',
    modellName: 'ProVision 2026',
  },
  allianz: {
    key: 'allianz',
    name: 'Allianz',
    short: 'AZ',
    logo: logoUrl('allianz.de'),
    colors: {
      primary: '#003781',
      primaryLight: '#0062A3',
      accent: '#E87722',
      gradient: 'linear-gradient(135deg, #002a63 0%, #003781 40%, #0062A3 100%)',
      sidebarGradient: 'linear-gradient(180deg, #002a63 0%, #003781 100%)',
      ubSidebarGradient: 'linear-gradient(180deg, #1a2e44 0%, #2a4060 50%, #1a2e44 100%)',
      ubBorder: '#0062A3',
      simBorder: '#0062A3',
    },
    beraterTitel: 'Agenturleiter',
    region: 'FD München',
    modellName: 'AZ-Prov 2026',
  },
  axa: {
    key: 'axa',
    name: 'AXA',
    short: 'AX',
    logo: logoUrl('axa.de'),
    colors: {
      primary: '#00008F',
      primaryLight: '#3032C1',
      accent: '#FF1721',
      gradient: 'linear-gradient(135deg, #000066 0%, #00008F 40%, #3032C1 100%)',
      sidebarGradient: 'linear-gradient(180deg, #000066 0%, #00008F 100%)',
      ubSidebarGradient: 'linear-gradient(180deg, #1a1a4e 0%, #2a2a6e 50%, #1a1a4e 100%)',
      ubBorder: '#3032C1',
      simBorder: '#3032C1',
    },
    beraterTitel: 'Generalagent',
    region: 'BD Köln',
    modellName: 'AXA-Vergütung+',
  },
  generali: {
    key: 'generali',
    name: 'Generali',
    short: 'GE',
    logo: logoUrl('generali.de'),
    colors: {
      primary: '#C8102E',
      primaryLight: '#E03040',
      accent: '#9B2335',
      gradient: 'linear-gradient(135deg, #8a0a1e 0%, #C8102E 40%, #E03040 100%)',
      sidebarGradient: 'linear-gradient(180deg, #8a0a1e 0%, #C8102E 100%)',
      ubSidebarGradient: 'linear-gradient(180deg, #6b0816 0%, #9a0c22 50%, #6b0816 100%)',
      ubBorder: '#C8102E',
      simBorder: '#C8102E',
    },
    beraterTitel: 'Filialdirektor',
    region: 'GD Hamburg',
    modellName: 'GenProv 2026',
  },
  zurich: {
    key: 'zurich',
    name: 'Zurich',
    short: 'ZU',
    logo: logoUrl('zurich.de'),
    colors: {
      primary: '#003399',
      primaryLight: '#2167AE',
      accent: '#00A0DC',
      gradient: 'linear-gradient(135deg, #002266 0%, #003399 40%, #2167AE 100%)',
      sidebarGradient: 'linear-gradient(180deg, #002266 0%, #003399 100%)',
      ubSidebarGradient: 'linear-gradient(180deg, #1a2e55 0%, #2a4475 50%, #1a2e55 100%)',
      ubBorder: '#2167AE',
      simBorder: '#2167AE',
    },
    beraterTitel: 'Bezirksdirektor',
    region: 'BD Frankfurt',
    modellName: 'Z-Provision 2026',
  },
}

export const defaultInsurer = 'barmeniagothaer'

// ========================================
// COMMISSION RATES
// ========================================
export const commissionRates = {
  altModell: {
    leben: { ap: 2.0, bp: 0.3 },
    kranken: { ap: 5.0, bp: 0.5 },
    schaden: { ap: 15.0, bp: 2.0 },
  },
  neu: {
    leben: { ap: 1.8, bp: 0.45 },
    kranken: { ap: 4.5, bp: 0.7 },
    schaden: { ap: 13.0, bp: 3.0 },
  },
}

export const karriereStufen = [
  { key: 'basis', label: 'Basis', min: 0, max: 100000, factor: 0.85 },
  { key: 'standard', label: 'Standard', min: 100000, max: 250000, factor: 0.95 },
  { key: 'premium', label: 'Premium', min: 250000, max: 500000, factor: 1.0 },
  { key: 'top', label: 'Top', min: 500000, max: Infinity, factor: 1.1 },
]

export const sparteLevels = {
  leben: [
    { key: 'LS1', label: 'LS 1', min: 2000, color: '#94a3b8' },
    { key: 'LS2', label: 'LS 2', min: 4000, color: '#3b82f6' },
    { key: 'LS3', label: 'LS 3', min: 6000, color: '#8b5cf6' },
    { key: 'LS4', label: 'LS 4', min: 8000, color: '#f59e0b' },
  ],
  kranken: [
    { key: 'LS1', label: 'LS 1', min: 3000, color: '#94a3b8' },
    { key: 'LS2', label: 'LS 2', min: 5500, color: '#3b82f6' },
    { key: 'LS3', label: 'LS 3', min: 8000, color: '#8b5cf6' },
    { key: 'LS4', label: 'LS 4', min: 12000, color: '#f59e0b' },
  ],
  schaden: [
    { key: 'LS1', label: 'LS 1', min: 10000, color: '#94a3b8' },
    { key: 'LS2', label: 'LS 2', min: 20000, color: '#3b82f6' },
    { key: 'LS3', label: 'LS 3', min: 30000, color: '#8b5cf6' },
    { key: 'LS4', label: 'LS 4', min: 45000, color: '#f59e0b' },
  ],
}

export const defaultSimulation = {
  produktionLeben: 150000,
  produktionKranken: 80000,
  produktionSchaden: 120000,
  bestandLeben: 450000,
  bestandKranken: 220000,
  bestandSchaden: 380000,
}

export const sliderConfig = [
  {
    group: 'Neugeschäft (Produktion)',
    sliders: [
      { field: 'produktionLeben', label: 'Leben', min: 0, max: 500000, step: 10000 },
      { field: 'produktionKranken', label: 'Kranken', min: 0, max: 300000, step: 5000 },
      { field: 'produktionSchaden', label: 'Schaden', min: 0, max: 500000, step: 10000 },
    ],
  },
  {
    group: 'Bestandsprovisionen',
    sliders: [
      { field: 'bestandLeben', label: 'Leben', min: 0, max: 2000000, step: 50000 },
      { field: 'bestandKranken', label: 'Kranken', min: 0, max: 1000000, step: 10000 },
      { field: 'bestandSchaden', label: 'Schaden', min: 0, max: 1500000, step: 10000 },
    ],
  },
]

export const vermittlerList = [
  {
    id: '0055/0310',
    name: 'Maria Musterfrau',
    vpt: 'VPT9957912',
    status: 'Aktiv',
    bdNr: '0000001',
    eintritt: '01.01.2090',
    agenturStatus: 'Ab 01.01.2026',
    simRole: 'Leiter des Service-Centers',
    simStand: '04.12.2025',
    foto: './images/maria-musterfrau.png',
  },
  { id: '0042/0210', name: 'Anna Schmidt', foto: './images/AdobeStock_624564221.jpeg' },
  { id: '0078/0415', name: 'Thomas Weber', foto: './images/AdobeStock_329502726.jpeg' },
  { id: '0091/0520', name: 'Julia Braun', foto: './images/AdobeStock_477904088.jpeg' },
  { id: '0063/0330', name: 'Stefan Klein', foto: './images/AdobeStock_361342769.jpeg' },
]

export const mockVermittler = [
  { nr: '00601257', name: 'Alexander Schreibling', status: 'Vertrag unterz./nicht eingegangen', apAlt: null, apNeu: null, fpAlt: null, fpNeu: null, sonst: null, zusch: null, zusatz: null, vergAlt: null, vergSim: null, diff: 0 },
  { nr: '00601013', name: 'Ali Haydar Koc', status: 'Vertrag unterz./nicht eingegangen', apAlt: 17815, apNeu: 21561, fpAlt: 54565, fpNeu: 56431, sonst: null, zusch: 1500, zusatz: 1500, vergAlt: 73879, vergSim: 79492, diff: 5613 },
  { nr: '00601167', name: 'Amira Harrami', status: 'Austritt', apAlt: 4502, apNeu: 3723, fpAlt: 10914, fpNeu: 11116, sonst: null, zusch: null, zusatz: null, vergAlt: 15416, vergSim: 14839, diff: -577 },
  { nr: '00600152', name: 'Anders OHG', status: 'Vertrag unterz./nicht eingegangen', apAlt: 146285, apNeu: 195287, fpAlt: 194038, fpNeu: 194038, sonst: null, zusch: 12000, zusatz: 27400, vergAlt: 401723, vergSim: 401324, diff: 21601 },
  { nr: '00601174', name: 'Andre Caspar', status: 'Vertrag erneuert (Tranche 3)', apAlt: 1491760, apNeu: 1542575, fpAlt: 2646883, fpNeu: 2648883, sonst: null, zusch: 3702630, zusatz: 24000, vergAlt: 7867273, vergSim: 4215458, diff: -3651815 },
  { nr: '00601246', name: 'Andrea Salamone', status: 'Vertrag unterz./nicht eingegangen', apAlt: 6665, apNeu: 10107, fpAlt: 5374, fpNeu: 4021, sonst: null, zusch: null, zusatz: null, vergAlt: 12039, vergSim: 33328, diff: 2089 },
  { nr: '00600565', name: 'Anne Schulte-Gosewinkel', status: 'Vertrag unterz./nicht eingegangen', apAlt: 28842, apNeu: 38840, fpAlt: 51500, fpNeu: 57509, sonst: null, zusch: 6000, zusatz: null, vergAlt: 92350, vergSim: 96349, diff: 3999 },
  { nr: '00601261', name: 'Apostolos Konstantinidis', status: 'Vertrag unterz./nicht eingegangen', apAlt: 1127, apNeu: 2039, fpAlt: 215, fpNeu: 215, sonst: null, zusch: 24000, zusatz: null, vergAlt: 25341, vergSim: 27153, diff: 1812 },
  { nr: '00601271', name: 'Ardit Bytyqi', status: 'Vertrag unterz./nicht eingegangen', apAlt: null, apNeu: 0, fpAlt: null, fpNeu: 0, sonst: null, zusch: 24000, zusatz: null, vergAlt: 24000, vergSim: 24000, diff: 0 },
  { nr: '00601144', name: 'Becker Finanz GmbH und Co. KG', status: 'Vertrag erneuert (Tranche 3)', apAlt: 159869, apNeu: 417276, fpAlt: 238897, fpNeu: 239758, sonst: 86158, zusch: 129600, zusatz: 25000, vergAlt: 639524, vergSim: 726633, diff: 87109 },
  { nr: '00601266', name: 'Bertan Edes', status: 'Austritt', apAlt: null, apNeu: 0, fpAlt: null, fpNeu: 0, sonst: null, zusch: null, zusatz: null, vergAlt: 19200, vergSim: null, diff: -19200 },
]

export const vzOptions = [
  'Vertriebszentrum Köln',
  'Vertriebszentrum Düsseldorf',
  'Vertriebszentrum München',
  'Vertriebszentrum Hamburg',
]

export const produktionsstandard = {
  headers: ['', '< MPL', 'MPL', '1. LS', '2. LS', '3. LS'],
  rows: [
    ['S/U inkl. Tier', 29, 10, 10, 7, 8],
    ['Kfz', 57, 2, 4, '', 1],
    ['LV', 44, 6, 8, 4, 1],
    ['KV', 17, 4, 13, 6, 24],
  ],
}

export const distributionCharts = [
  { title: 'S/U ohne KFZ', labels: ['40%', '60%', '70%', '80%', '90%'], data: [28, 13, 13, 7, 3] },
  { title: 'KV', labels: ['3,75MB', '5,25MB', '6,25MB', '6,75MB', '7,25MB'], data: [20, 24, 10, 5, 5] },
  { title: 'LV', labels: ['1,5%', '2,0%', '2,3%', '2,5%', '2,7%'], data: [29, 24, 13, 7, 5] },
]

export const agenturFunktionen = {
  labels: ['GST', 'HGST', 'GA I', 'BD II', 'BD I'],
  data: [26, 12, 12, 11, 11],
}

export const zuschuesseData = {
  alt: { allgemein: 736395, buero: 101835 },
  neu: { allgemein: 595285, buero: 101835 },
}

export const chatResponses = {
  'default': 'Ich bin der Umstellungsassistent. Ich kann Ihnen bei Fragen zur Vertragsumstellung, Provisionssimulation und dem neuen Provisionsmodell helfen. Was möchten Sie wissen?',

  'provision|vergütung|commission': `Die Vertragsumstellung bringt folgende Änderungen:\n\n**Abschlussprovision (AP):**\n- Leben: 2.0% → 1.8% (leicht reduziert)\n- Kranken: 5.0% → 4.5%\n- SHUK: 15.0% → 13.0%\n\n**Bestandsprovision (BP):**\n- Leben: 0.3% → 0.45% (deutlich erhöht!)\n- Kranken: 0.5% → 0.7%\n- SHUK: 2.0% → 3.0%\n\n**Fazit:** Der Fokus verschiebt sich hin zu nachhaltiger Bestandsprovision. Bei einem gesunden Bestand profitieren die meisten Vermittler.`,

  'blindpool|sammelvermittler': `Der aktuelle **Blindpool** nutzt eine Sammelvermittlernummer als Zwischenlösung:\n\n- Vermittler sind in der silofremden Systemwelt unbekannt\n- Nutzung einer Sammel-VM-Nr. + Fremdordnungsmerkmal\n- **Empfohlene Lösung (Option 4):** Gegenseitige Stammdatenanlage & Demaskierung\n- Ziel: Jeder VM erhält einheitliche Identifikation\n- Deadline: 30.06.2026`,

  'timeline|zeitplan|roadmap': `**Projektplanung Provision 2026 ff.:**\n\n**2026 – Kurzfristig:**\n- Q1-Q2: Gegenseitige VM-Anlage & Anpassung SST/Servicelayer\n- Q2-Q3: Definition Provisionsregelwerk für BÜ\n- Q3-Q4: Systemupdates (NetWeaver/EHP8)\n\n**2027 – Mittelfristig:**\n- Umstellung echtes Neugeschäft in allen Sparten\n- S/4HANA Upgrade & Journey-to-Cloud\n- Vereinheitlichung Abrechnung\n\n**2028+ – Langfristig:**\n- Weitere Kanäle & Bestandsgeschäft\n- Vollständige Konsolidierung`,

  'status|golive': `**GoLive Status:**\n\n✅ Überführung Vermittler ins neue Modell\n✅ Einheitliche AP/FP für SHUK\n✅ Karrierestufen-Angleichung (Fahrstuhllogik)\n✅ Mitverdienerstrukturen inkl. Untervermittlerlogik\n✅ Neues Produktportfolio provisionsseitig\n\n**Offene Herausforderungen:**\n⚠ Keine identische vertragliche Grundlage\n⚠ Keine gemeinsame Abrechnung (2 Abrechnungen)\n⚠ Getrennte VM-Stammdatenhaltung\n⚠ Zwei aktive Provisionssysteme parallel`,

  'stammdaten|mapping|datenmodell': `**Datenmodell-Mapping:**\n\n- Partner ↔ ADM-Nr. (8-stellig) + BP-ID (10-stellig)\n- Pro Rolle: 1 Provisionsvertrag → 1 BD-VM-Nr.\n- Partner ↔ VPT-Nr. (10-stellig alphanumerisch)\n- 1 VPT → n Allis-Nummern\n- Je Allis: 1 VDAGT-Nr. + 1 GL-Bestandskennzeichen\n\n**Mapping:** BP-ID ↔ VPT-Nr. (eindeutig pro Person) und BD-VM-Nr. ↔ Allis-Nr. als zentrale Schlüssel.`,

  'bestandsübertragung|übertragung': `**Silo-übergreifende Bestandsübertragung:**\n\nDurch die Demaskierung können Bestände silo-übergreifend zugeordnet werden.\n\n**Erwartete Aktivitäten:**\n- Definition Provisionsregelwerk (GeVos, Storno, Minderung, Teilung)\n- Anpassung Prüfservices\n- Anpassung Berechnungslogik Alt und Neu\n- Vollumfängliche Tests`,

  'karrierestufe|revers|staffel': `**Karrierestufen / Revers-Staffelung:**\n\n| Stufe | Produktionsvolumen | Faktor |\n|-------|-------------------|--------|\n| Basis | 0 - 100.000€ | 0.85x |\n| Standard | 100.000 - 250.000€ | 0.95x |\n| Premium | 250.000 - 500.000€ | 1.00x |\n| Top | > 500.000€ | 1.10x |\n\nDie Stufe basiert auf dem Gesamtproduktionsvolumen (Neugeschäft + Bestand) über alle Sparten.`,
}

export const chatSuggestions = {
  initial: [
    'Wie ändert sich meine Provision?',
    'Was ist der Blindpool?',
    'Zeitplan der Umstellung',
    'GoLive Status',
  ],
  'provision|vergütung': ['Karrierestufen erklärt', 'Blindpool-Lösung', 'Timeline anzeigen'],
  'blindpool|stamm': ['Datenmodell-Mapping', 'Bestandsübertragung', 'GoLive Status'],
  default: ['Provision berechnen', 'Blindpool erklärt', 'Roadmap 2026-2028'],
}
