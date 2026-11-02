/* =====================================================================
   Use-Case-Galerie — Datenbestand (Portfolio, englischsprachig)
   =====================================================================

   Eine Karte pro umgesetztem Use Case. Gepflegt wird ausschliesslich
   hier; die Galerie (index.html) rendert daraus alles Weitere. Die
   UI-Sprache ist Englisch, weil die Seite Teil einer Bewerbung ist —
   Kommentare bleiben Deutsch wie im Rest des Repos.

   Felder je Eintrag
   -----------------
   id          eindeutig, klein geschrieben (dient auch als Deep-Link:
               /galerie#dex oeffnet direkt die Detailansicht)
   title       Name des Use Case
   tagline     ein Satz fuer die Karte
   story       zwei bis vier Saetze fuer die Detailansicht
   field       fachliches Cluster (siehe FIELDS weiter unten)
   industries  Liste aus 'insurance' | 'banking' | 'am' | 'internal'
   maturity    'demo' | 'tool' | 'production'
   stack       Technik-Stichworte
   highlights  drei bis fuenf Stichpunkte, was der Use Case konkret kann
   link        { href, external? }  Hauptziel zum Oeffnen
   previewHref optional: andere Ansicht fuer die Live-Vorschau als fuer
               den Oeffnen-Knopf (z. B. direkt die Arbeitsoberflaeche
               statt der Startseite)
   jumps       optionale Direkteinstiege in einzelne Ansichten
   preview     'live'  -> die Karte zeigt die laufende App im Rahmen
                          (kein Screenshot noetig, immer aktueller Stand)
               'image' -> Datei aus 11_galerie/bilder/ verwenden (Feld image)
               'mark'  -> gezeichnetes Motiv aus Kuerzel + Akzentfarbe
   mark        ein bis drei Zeichen fuer das Motiv
   accent      Akzentfarbe des Motivs (CSS-Farbe)
   note        optionaler Hinweis in der Detailansicht

   Neuen Use Case ergaenzen: Objekt an die Liste haengen, fertig. Liegt
   die App auf dieser Plattform, reicht preview:'live' — dann braucht es
   kein Foto, die Karte zeigt die Anwendung selbst.
   ===================================================================== */

/* Kopfbereich der Seite — hier Name, Claim und Kontakt anpassen. */
const PROFILE = {
  name: 'Eike Brenneisen',
  role: 'AI use cases for financial services — designed, built and shipped',
  claim: ['Not slides.', 'Working software.'],
  intro:
    'Every entry in this gallery is a running application, not a concept. ' +
    'Most of them open right here — the card shows the live app, no screenshot involved. ' +
    'Built end to end: problem framing, data model, UI, AI integration, deployment.',
  contact: { label: 'ebrenneisen@deloitte.de', href: 'mailto:ebrenneisen@deloitte.de' },
};

const FIELDS = [
  { id: 'sales',      title: 'Sales & Advisory' },
  { id: 'strategy',   title: 'Strategy & Workshops' },
  { id: 'cockpit',    title: 'Cockpits & Monitoring' },
  { id: 'operations', title: 'Operations & Back Office' },
  { id: 'risk',       title: 'Risk & Control' },
  { id: 'tools',      title: 'Tools & Knowledge' },
];

const INDUSTRIES = {
  insurance: { label: 'Insurance',     color: '#ff6b57' },
  banking:   { label: 'Banking',       color: '#86BC25' },
  am:        { label: 'Asset Mgmt',    color: '#4fb3ff' },
  internal:  { label: 'Internal',      color: '#c39bff' },
};

const MATURITY = {
  demo:       { label: 'Interactive demo' },
  tool:       { label: 'Working tool' },
  production: { label: 'In production' },
};

const USE_CASES = [
  /* ---------------------------------------------------------------- */
  /* Sales & Advisory                                                 */
  /* ---------------------------------------------------------------- */
  {
    id: 'sales-workstation',
    title: 'AI Sales Workstation',
    tagline: 'One workstation for insurance, banking and wealth management — with an AI assistant that answers from the real screen data.',
    story:
      'The origin of the whole platform: agency view, client file, contracts, opportunities and communication in a single ' +
      'surface. Three equal modes cover insurance, banking and wealth management, each with its own client list, KPIs and ' +
      'guided tour. The AI assistant does not run on a script — it reads the same appointments, tasks and opportunities that ' +
      'are shown in the tabs, so what it says and what the screen shows can never drift apart.',
    field: 'sales',
    industries: ['insurance', 'banking', 'am'],
    maturity: 'demo',
    stack: ['React 19', 'Vite', 'Tailwind v4', 'Claude API'],
    highlights: [
      'Client 360 with contracts, balance sheet, family tree and wealth structure',
      'Opportunity scoring, impulses and cross-selling suggestions',
      'FIDA / Open Finance: third-party contracts including consent status',
      'AI assistant grounded in the data on screen — no invented numbers',
      'Guided tours for overview and detail pages',
    ],
    link: { href: '/22_vertriebsarbeitsplatz/dist/index.html' },
    previewHref: '/22_vertriebsarbeitsplatz/dist/index.html#/versicherung/overview/uebersicht',
    jumps: [
      { label: 'Today at a glance', href: '/22_vertriebsarbeitsplatz/dist/index.html#/versicherung/overview/uebersicht' },
      { label: 'Opportunities', href: '/22_vertriebsarbeitsplatz/dist/index.html#/versicherung/overview/potentiale' },
      { label: 'Cockpit', href: '/22_vertriebsarbeitsplatz/dist/index.html#/versicherung/cockpit' },
    ],
    preview: 'live',
  },
  {
    id: 'compensation-engine',
    title: 'Compensation Engine',
    tagline: 'One calculation engine, two tools: simulate a new remuneration model for the whole portfolio, then open the file of a single agent and see exactly what it means for them.',
    story:
      'Two tools, one engine. The simulation box answers on a single page, without wizard steps, what a change of the overall ' +
      'remuneration model does: sliders per compensation component, an editable bonus ladder, guarantees and subsidies — ' +
      'everything recalculates instantly. The migration tool translates the same result into a negotiation position per ' +
      'institution and sales partner. Core principle: the macro result is exactly the sum of the micro results, verified by a ' +
      'consistency check. Brand, colours and wording are fully white-label.',
    field: 'sales',
    industries: ['insurance', 'banking'],
    maturity: 'demo',
    stack: ['React 19', 'Vite', 'Recharts'],
    highlights: [
      'Macro and micro on one engine — every waterfall reconciles to the cent',
      'Three budget views side by side: steady state, present value per cohort, cash-effective first year',
      'Calibration factor per component reconciles to the reported reference-year compensation',
      'Institution dashboard with line-of-business columns and comparison tables',
      'White-label: brand and language swappable without external data',
    ],
    link: { href: '/21_vertragsumstellung/dist/index.html' },
    previewHref: '/21_vertragsumstellung/dist/index.html#/umstellung/ao-02',
    jumps: [
      { label: 'File of a single tied agent', href: '/21_vertragsumstellung/dist/index.html#/umstellung/ao-02' },
      { label: 'Institution file with its advisers', href: '/21_vertragsumstellung/dist/index.html#/umstellung/osd' },
      { label: 'Simulation box (portfolio)', href: '/21_vertragsumstellung/dist/index.html#/simulation' },
    ],
    preview: 'live',
  },
  {
    id: 'hr-pipeline',
    title: 'HR Pipeline',
    tagline: 'Recruiting pipeline from application to decision, with AI-assisted screening.',
    story:
      'Applications move through clearly named stages. The AI screening reads CVs, matches them against the role profile and ' +
      'proposes an order — the judgement stays with the recruiter, the groundwork is done by the machine.',
    field: 'sales',
    industries: ['insurance', 'internal'],
    maturity: 'demo',
    stack: ['React 19', 'Vite'],
    highlights: [
      'Pipeline view with stages and dwell time',
      'CV screening against the role profile',
      'Candidate file with history and notes',
    ],
    link: { href: '/13_HRPipeline/dist/index.html' },
    preview: 'live',
  },
  /* ---------------------------------------------------------------- */
  /* Cockpits & Monitoring                                            */
  /* ---------------------------------------------------------------- */
  {
    id: 'sales-cockpit',
    title: 'Sales Steering Cockpit',
    tagline: 'Sales steering at a glance: portfolio, new business and target achievement per unit.',
    story:
      'The cockpit for sales leadership. Portfolio, new business and target achievement are broken down by unit, region and ' +
      'line of business; deviations surface before they land in the monthly report. Built as a daily steering view, not as a ' +
      'retrospective.',
    field: 'cockpit',
    industries: ['insurance'],
    maturity: 'demo',
    stack: ['React 19', 'Vite', 'Recharts'],
    highlights: [
      'KPIs by unit, region and line of business',
      'Target achievement with status and trend',
      'Drill-down from the KPI into the detail list',
    ],
    link: { href: '/23_VSTCockpit/dist/index.html' },
    preview: 'live',
  },
  {
    id: 'banking-kpi',
    title: 'Banking KPI Report',
    tagline: 'A monthly KPI report that the AI comments on itself.',
    story:
      'The report does not only calculate, it explains. For every KPI the AI writes a short comment: what changed, why, and ' +
      'what follows from it. The figures become a document that goes into the committee meeting without rework.',
    field: 'cockpit',
    industries: ['banking'],
    maturity: 'demo',
    stack: ['React 19', 'Vite'],
    highlights: [
      'KPI set with month-on-month and year-on-year comparison',
      'AI commentary per KPI instead of a bare delta',
      'Report view ready to present',
    ],
    link: { href: '/02_BankenKPI/dist/index.html' },
    preview: 'live',
  },
  {
    id: 'pmo-toolbox',
    title: 'PMO Toolbox',
    tagline: 'Steering view for a transformation programme: work packages, status, dependencies.',
    story:
      'A programme is many work packages that depend on each other. The toolbox shows what is running, what is waiting and ' +
      'what is blocked — on one page, without status slides.',
    field: 'cockpit',
    industries: ['internal'],
    maturity: 'tool',
    stack: ['HTML', 'JavaScript'],
    highlights: [
      'Work packages with status and owners',
      'Dependencies and blockers visible',
      'Programme progress at a glance',
    ],
    link: { href: '/16_PMOToolbox/index.html' },
    preview: 'live',
  },
  /* ---------------------------------------------------------------- */
  /* Operations & Back Office                                         */
  /* ---------------------------------------------------------------- */
  {
    id: 'portfolio-transfer',
    title: 'Portfolio Transfer Management',
    tagline: 'Contract transfers from notification to booking — mass business with many special cases, handled in one flow.',
    story:
      'Portfolio transfers are volume business full of exceptions. The application guides each case from notification through ' +
      'review to booking, keeps the status visible at all times and collects the cases that need a decision in one place.',
    field: 'operations',
    industries: ['insurance'],
    maturity: 'demo',
    stack: ['React 19', 'Vite', 'Tailwind v4'],
    highlights: [
      'Case flow with clear stages and responsibilities',
      'Consolidated view of cases that need a decision',
      'Traceable history per transfer',
    ],
    link: { href: '/05_Bestandsuebertragung/dist/index.html' },
    preview: 'live',
  },
  {
    id: 'commission-claims',
    title: 'Commission Claims',
    tagline: 'Commission complaints checked and answered with AI support.',
    story:
      'The agent says the commission is wrong. The application reads the complaint, pulls the matching transactions, ' +
      'recalculates and drafts a reply. The clerk reviews the draft and sends it — instead of rebuilding every case from ' +
      'scratch.',
    field: 'operations',
    industries: ['insurance'],
    maturity: 'demo',
    stack: ['React 19', 'Vite'],
    highlights: [
      'Match the complaint to the right statement automatically',
      'Calculation path shown step by step',
      'Reply draft to review instead of free text from zero',
      'Custom month/year picker with localised month names',
    ],
    link: { href: '/17_provisionsreklamation/dist/index.html' },
    preview: 'live',
  },
  {
    id: 'commission-validation',
    title: 'Commission Validation',
    tagline: 'Analyse commission data and find the silent errors in the book.',
    story:
      'An analysis tool for commission data: it recalculates reported commissions against the configured model and shows ' +
      'where the two diverge. A standalone application outside this platform.',
    field: 'operations',
    industries: ['insurance'],
    maturity: 'demo',
    stack: ['Cloudflare Pages'],
    highlights: [
      'Reported commission recalculated against the model',
      'Conspicuous contracts and patterns surfaced',
      'Standalone application',
    ],
    link: { href: 'https://provisions-analyzer.pages.dev/', external: true },
    preview: 'live',
  },
  /* ---------------------------------------------------------------- */
  /* Risk & Control                                                   */
  /* ---------------------------------------------------------------- */
  {
    id: 'credit-analysis',
    title: 'AI Credit Analysis',
    tagline: 'Loan applications prepared by machine: read the documents, extract the figures, draft the vote.',
    story:
      'The application arrives as a stack of documents and leaves as a structured decision memo. The analysis extracts key ' +
      'figures from the submitted files, checks them against the rulebook and proposes a rating — including the exact spots ' +
      'where a human has to look. The officer decides, the machine prepares.',
    field: 'risk',
    industries: ['banking'],
    maturity: 'demo',
    stack: ['React 19', 'Vite', 'Tailwind v4'],
    highlights: [
      'Ingest documents and extract key figures automatically',
      'Rule checks with a traceable reason per finding',
      'Vote proposal with flagged review points for the human',
    ],
    link: { href: '/14_kreditanalyse/dist/index.html' },
    preview: 'live',
  },
  {
    id: 'agent-scoring',
    title: 'Agent Risk Scoring',
    tagline: 'Risk rating of sales partners based on portfolio, lapse rates and behavioural patterns.',
    story:
      'Which agents need attention? The scoring condenses portfolio, lapse and behavioural data into a single risk rating and ' +
      'shows which individual values tip the balance. A list of partners turns into an order for the next support round.',
    field: 'risk',
    industries: ['insurance'],
    maturity: 'demo',
    stack: ['HTML', 'JavaScript'],
    highlights: [
      'Score per agent with a breakdown of the drivers',
      'Spot unusual patterns in lapses and new business',
      'Prioritised list for partner support',
    ],
    link: { href: '/18_Risikoscoring/index.html' },
    preview: 'live',
  },
  {
    id: 'controlhub',
    title: 'ControlHub',
    tagline: 'Analyse, streamline and document the internal control system with AI.',
    story:
      'Control systems that have grown over years contain duplicates, gaps and controls nobody needs anymore. ControlHub reads ' +
      'the inventory, groups it by risk and process and shows where controls overlap and where a risk is left uncovered. ' +
      'Previously known as Smart ICS and IKS Control Hub — the old deep links still work.',
    field: 'risk',
    industries: ['banking', 'insurance'],
    maturity: 'demo',
    stack: ['React 19', 'Vite', 'Tailwind v4'],
    highlights: [
      'Control inventory grouped by risk and process',
      'Duplicates and coverage gaps flagged automatically',
      'Optimisation proposals with reasoning',
      'Documentation straight out of the system',
    ],
    link: { href: '/07_ControlHub/dist/index.html' },
    preview: 'live',
  },
  {
    id: 'collections',
    title: 'AI Collections & Recovery',
    tagline: 'Debt collection with a next-best-action queue, agent approvals and risk monitoring.',
    story:
      'The cockpit for a savings bank’s collections department. The next-best-action queue says which case is next and why; ' +
      'AI agents prepare measures that the clerk approves. On top: portfolio segmentation, stage 2 and 3 risk monitoring and ' +
      'a client file with an AI dossier.',
    field: 'risk',
    industries: ['banking'],
    maturity: 'demo',
    stack: ['React 19', 'Vite', 'Tailwind v4'],
    highlights: [
      'Next-best-action queue with a reason per case',
      'Agents propose, the human approves',
      'Portfolio segmentation and stage 2/3 monitoring',
      'Client file with AI dossier',
    ],
    link: { href: '/06_Collections/dist/index.html' },
    preview: 'live',
  },
  /* ---------------------------------------------------------------- */
  /* Strategy & Workshops                                             */
  /* ---------------------------------------------------------------- */
  {
    id: 'banking-horizon',
    title: 'Banking Horizon 2035',
    tagline: 'A board workshop as a walkable picture of the bank: the AI draws the as-is state, then the picture becomes the map through eight dimensions of the future.',
    story:
      'A workshop format that is not made of slides. At the start, an AI chatbot generates the structural picture of the ' +
      'bank as of 2026. From then on that picture is a walkable map with eight zones: each zone leads through three ' +
      'hypothesis comparisons (status quo versus 2035) and an activity image with a jump into a live demo. The group ' +
      'records its assessments directly in the tool. For SharePoint the same app ships as an SPFx package that carries ' +
      'the application in full — no external hosting.',
    field: 'strategy',
    industries: ['banking'],
    maturity: 'demo',
    stack: ['React 19', 'TypeScript', 'GSAP', 'SPFx'],
    highlights: [
      'AI generates the structural picture at the workshop kick-off',
      'Eight zones, three hypothesis comparisons each',
      'Jump from a zone straight into the matching live demo',
      'Available as an SPFx package for SharePoint',
    ],
    link: { href: '/03_banking-horizon/dist/index.html' },
    previewHref: '/03_banking-horizon/dist/index.html#/overview',
    jumps: [
      { label: 'Structural map', href: '/03_banking-horizon/dist/index.html#/overview' },
      { label: 'Start with the AI intro', href: '/03_banking-horizon/dist/index.html' },
    ],
    preview: 'live',
  },
  {
    id: 'operations-2030',
    title: 'Banking Operations 2030',
    tagline: 'Image and video sequence: one day in banking operations, today and in 2030 side by side.',
    story:
      'A narrated sequence instead of a talk. Scenes from the working day show the process as it is today and the same ' +
      'process in 2030; the paths between scenes are edited transitions. One cut remains: the stage version for large ' +
      'projection, with the hypothesis above the scene and the evidence beside it.',
    field: 'strategy',
    industries: ['banking'],
    maturity: 'demo',
    stack: ['React 19', 'Vite', 'Image & video production'],
    highlights: [
      'Scenes from the working day: today versus 2030',
      'Stage cut for large projection, evidence beside the scene',
      'Direct link /operations, optionally with the station time',
    ],
    link: { href: '/03_banking-horizon/dist/index.html#/operations' },
    jumps: [
      { label: 'Start of the day', href: '/03_banking-horizon/dist/index.html#/operations/-1' },
      { label: 'Team meeting (09:00)', href: '/03_banking-horizon/dist/index.html#/operations/4' },
    ],
    preview: 'live',
  },
  {
    id: 'holodeck',
    title: 'Holodeck 2031',
    tagline: 'A walkable command bridge of a bank in 2031, with camera flights instead of slide transitions.',
    story:
      'Extracted from the structural picture and built standalone: a command bridge you move through. The camera flights ' +
      'are animated, the stations show how steering and decisions work in this bank. Intended as the opening image for ' +
      'board sessions.',
    field: 'strategy',
    industries: ['banking'],
    maturity: 'demo',
    stack: ['React 19', 'TypeScript', 'GSAP'],
    highlights: [
      'Walkable command bridge instead of a slide deck',
      'Animated camera flights between stations',
      'Fully self-contained, no dependency on the monorepo',
    ],
    link: { href: '/03_banking-horizon/dist/index.html#/holodeck' },
    preview: 'live',
  },
  /* ---------------------------------------------------------------- */
  /* Tools & Knowledge                                                */
  /* ---------------------------------------------------------------- */
  {
    id: 'dex',
    title: 'DEX — Event Experience Platform',
    tagline: 'Create events, manage participants, send invitations and Outlook appointments automatically — inside SharePoint.',
    story:
      'DEX is the one application in this collection that does not run as a demo but in daily operation. Organisers create ' +
      'events through a wizard, participants register themselves; confirmation mails and Outlook appointments go out via ' +
      'Power Automate flows. On top: check-in at reception, self check-in on a display, a role matrix and an organiser ' +
      'centre. Technically an SPFx web part in React and TypeScript that runs entirely inside SharePoint — the data never ' +
      'leaves the tenant.',
    field: 'tools',
    industries: ['internal'],
    maturity: 'production',
    stack: ['SPFx 1.21', 'React', 'TypeScript', 'SharePoint', 'Power Automate'],
    highlights: [
      'Event wizard for organisers, self-registration for participants',
      'Mails and Outlook appointments through Power Automate flows',
      'Check-in at reception and self check-in on a display',
      'Role matrix, organiser centre and per-event participant lists',
      'Runs entirely inside SharePoint — no data outside the tenant',
    ],
    link: { href: 'https://github.com/brenneisen-e/flowdoku', external: true },
    note: 'Runs inside the SharePoint tenant and cannot be embedded here — hence a visual instead of a live preview.',
    preview: 'image',
    image: 'bilder/dex-orb.png',
    accent: '#86BC25',
  },
  {
    id: 'insurance-101',
    title: 'Insurance 101',
    tagline: 'The German insurance market in thirteen chapters — built for looking things up between two meetings and for learning in week one.',
    story:
      'New consultants need two different things from the same body of knowledge: a fast answer before a client call, and a structured path through ' +
      'the sector in their first week. Insurance 101 serves both from one data set. Thirteen chapters run in learning order, from what insurance ' +
      'actually is to how a project gets positioned in the market. Every one of the 73 units opens at three depths — basics, detail, expert — so the ' +
      'same page works for a two-minute look-up and for an hour of study. Progress, bookmarks and quiz history live in the browser, no sign-in. ' +
      'A full-text command palette searches every paragraph, not just headings, and jumps to the exact block. Diagrams are drawn in the house style ' +
      'rather than pasted as slide images, which keeps them responsive, searchable and readable on a phone.',
    field: 'tools',
    industries: ['insurance'],
    maturity: 'tool',
    stack: ['React 19', 'Vite', 'Tailwind v4'],
    highlights: [
      '13 chapters, 73 learning units, three depths each',
      'Full-text command palette with jump-to-passage',
      '190 quiz questions with spaced repetition of wrong answers',
      '223 glossary terms, linked from inside the text as hover cards',
      'Interactive models: premium build-up, law of large numbers, P&L waterfall, project configurator',
      '263 sourced references, every figure traceable',
    ],
    link: { href: '/19_Versicherungs1x1/dist/index.html' },
    preview: 'live',
  },
  {
    id: 'csv-generator',
    title: 'Test Data Generator',
    tagline: 'Generate test data in any volume — matching the schemas of the demo applications.',
    story:
      'Every demo needs data that looks plausible. The generator produces it in any volume and in the structure the target ' +
      'application expects — including localised formats for dates, amounts and names.',
    field: 'tools',
    industries: ['internal'],
    maturity: 'tool',
    stack: ['HTML', 'JavaScript'],
    highlights: [
      'Records in any volume',
      'Localised formats for dates, amounts and names',
      'Download straight as CSV',
    ],
    link: { href: '/csv-generator.html' },
    preview: 'live',
  },
];
