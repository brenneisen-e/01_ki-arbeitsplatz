// ─────────────────────────────────────────────────────────────────────────────
// Ein Tag in Banking Operations 2030 — Datenmodell & Inhalte
//
// Mara, Operations-Spezialistin (Complaints Management / Garnishment), an einem
// Montag im Jahr 2030: elf Stationen von 07:45 bis 17:00. Je Station eine Szene
// (Bild, spaeter Video-Uebergang) links und die zugehoerige Hypothese rechts.
//
// AUTO-GENERIERT aus 'AI native Banking Operations Demo_Hypothesen_ENG_v04.xlsx'
// (Skript: scratchpad/extract_ops.py). Inhaltliche Aenderungen bitte in der
// Excel pflegen und neu erzeugen.
// ─────────────────────────────────────────────────────────────────────────────

import { V08_TEXTE, v08Belege } from './v08'

export interface OpsPersona {
  name: string
  alter: number
  jahreImHaus: number
  standort: string
  rolle: string
  /** Kurze Vorstellung, ersetzt in der Auftaktszene die Hypothese. */
  text: string
  /**
   * Eine Zeile fuer die Kopfzeile der Buehne. Dort steht sonst die Hypothese
   * der Station; die Auftaktszene hat keine, also stellt sie hier die Person
   * vor — nicht nur den Namen, sondern wer sie ist und was gleich beginnt.
   */
  kopfzeile: string
}

export interface OpsStation {
  id: string
  /** 'persona' = Vorstellungsszene zu Hause, 'hypothese' = Arbeitsszene. */
  art?: 'persona'
  /** Nur bei art === 'persona'. */
  persona?: OpsPersona
  /** Position in der Klickstrecke (0 = Intro, 10 = Recap). */
  klick: number
  /** Uhrzeit der Szene, treibt die analoge Uhr (HH:MM). */
  zeit: string
  dimension: string
  hypothese: string
  /**
   * Drei Punkte, die die Hypothese tragen — in der Buehne stehen sie rechts
   * neben dem Bildschirm, sobald die Szene durchgelaufen ist. Kurz, parallel
   * gebaut, wo moeglich mit Zahl: sie sollen den Satz belegen, nicht ihn
   * wiederholen.
   */
  punkte?: string[]
  statusQuo: string
  future: string
  impact: string
  leitfrage: string
  /** Was in dieser Szene passiert (Bildbeschreibung fuer den Betrachter). */
  szene: string
  /** Erzaehltext des Moderators. */
  script: string
  /** Bild-Prompt (gpt-image-2) — Quelle fuer public/images/operations/<id>.png */
  prompt: string
  /** Prompt fuer den Video-Uebergang zur naechsten Szene (Veo 3.1). */
  transition: string
  /** Szenenbild. */
  bild: string
  /**
   * Nur in der dritten Fassung. Die Szene um 08:10 — die Kundenkacheln —
   * ist dort neu dazugekommen und steht nicht in der Hypothesen-Excel; in
   * v01 und v02 wuerde sie die Klickstrecke veraendern, deshalb bleibt sie
   * dort aus.
   */
  nurV03?: boolean
}

/** Auftakt: Mara zu Hause, bevor der Arbeitstag beginnt (nicht aus der Excel). */
const AUFTAKT: OpsStation = {
  id: 'home',
  art: 'persona',
  klick: -1,
  zeit: '07:00',
  dimension: 'Persona',
  persona: {
    name: 'Mara Vogel',
    alter: 38,
    jahreImHaus: 12,
    standort: 'Frankfurt am Main',
    rolle: 'Operations · Complaints Management & Garnishment',
    kopfzeile:
      'Mara has done this job for twelve years. What starts now barely resembles the job '
      + 'she trained for.',
    text:
      'This is Mara. She is 38, lives in Frankfurt am Main and has been with the bank for twelve '
      + 'years. She started in case processing and today owns Complaints Management and '
      + 'Garnishment. In a moment she will cycle to the office. **What waits for her there shares '
      + 'little more than its name with the job she trained for in 2018.**',
  },
  hypothese: '',
  statusQuo: '',
  future: '',
  impact: '',
  leitfrage: '',
  punkte: [
    '38, Frankfurt, twelve years with the bank; she began in case processing.',
    'Today she owns Complaints Management and Garnishment end to end.',
    'Her overnight briefing was on her phone before she got up: the first hour of her old day is gone.',
  ],
  szene:
    'Mara at home at the kitchen table. Her assistant has already sent the overnight briefing to '
    + 'her phone: everything ran to plan, all agent fleets nominal, one risk pattern building, '
    + 'three cases waiting for her judgement.',
  script:
    'Before we walk into the bank, we meet the person this is about. Mara is not a figure from '
    + 'the future: she does this job today.',
  prompt:
    'A warm, bright modern kitchen in a European city apartment early in the morning, soft daylight through the window. She sits at the kitchen table FACING THE CAMERA in a relaxed frontal three-quarter view, clearly visible face, a cup of coffee in front of her and an open newspaper in her hands, a bicycle helmet and a shoulder bag ready on the chair beside her. Calm, candid morning atmosphere, she looks at the newspaper with a slight smile.',
  transition:
    'Continuous single shot, no cuts. She folds the newspaper, stands up, picks up her helmet and bag, walks through the apartment door and steps out into the bright morning street, where she gets on her bicycle and rides off towards the city. The camera follows her smoothly at a constant distance. Audio: quiet morning room tone, a door, city ambience, no music, no speech.',
  bild: './images/operations/home.jpg',
}

export const OPS_STATIONS: OpsStation[] = [
  AUFTAKT,
  {
    id: 's0',
    klick: 0,
    zeit: '07:45',
    dimension: 'Narrative Opening',
    hypothese: 'The building hasn\'t changed. What happens inside it has.',
    statusQuo: 'Employees arrive at a familiar Frankfurt office building for a day of **case-by-case work**.',
    future: 'Same building, same skyline, but **the operating model running inside it is fully agentic**.',
    impact: '',
    leitfrage: 'What here looks the same on the outside, and what\'s actually completely different once you\'re through the door?',
    punkte: [
      'Same tower, same desk, a gate that knows her watch: nothing physical signals the shift.',
      'Eleven stations follow, 07:45 to 17:00: one ordinary Monday.',
      'Everything that changed sits in the operating model, not in the equipment.',
    ],
    szene: 'Mara arrives for a normal Monday in Frankfurt. The building, the arrival hall and the skyline feel unchanged. On her way in, her personal AI has already briefed her on overnight system behavior, agent health, emerging risks and the few human decisions that may require judgement today.',
    script: 'The world outside looks familiar; the operating model inside does not. Mara is not coming to process cases. She is coming to steer a bank that increasingly runs through agent teams, certified decision logic and continuous improvement loops. The future of operations is not a new building or a new portal. It is a new nervous system beneath the surface.',
    prompt: 'Inside the Arrival & Operations Entry Zone of a major European bank\'s AI-native operations headquarters in Frankfurt, Mara arrives for the start of a normal Monday. The exterior environment feels familiar: recognizable Frankfurt skyline, modern banking tower, access gates and reception area unchanged from today\'s banking world. As Mara enters the building, subtle signs reveal a different operating model beneath the surface. A transparent operations intelligence layer visualizes overnight system behavior, agent health, decision-system status and emerging operational risks. Information flows through the building like a digital nervous system rather than through traditional departments and queues. The image should emphasize the contrast between a familiar physical bank and a radically transformed operating model. The future is not represented by futuristic architecture, but by invisible intelligence embedded throughout the organization. Same AI-native banking operations headquarters in Frankfurt. Premium enterprise architecture. Open operations environment. Dark navy and Deloitte green palette. Human-centered future of work. Cinematic strategy-documentary style. Executive presentation quality. No clutter.',
    transition: 'Mara leaves the Arrival & Operations Entry Zone and walks deeper into the AI-native banking operations headquarters. The camera follows her through a large open operations floor where the traditional structure of banking operations has quietly disappeared. There are no visible complaint queues, paper stacks or large teams processing customer issues. Instead, transparent operational displays are embedded throughout the environment, visualizing agent activity, operational health, emerging patterns and overnight system performance. As Mara walks, the building gradually reveals its digital nervous system. Information flows across architectural surfaces, decision signals move between operational domains and specialized agent clusters appear as living components of the organization\'s operating model. Small groups of human experts supervise exceptions and system behavior rather than process individual cases. The environment feels calm, highly automated and continuously aware. The physical office remains recognizable as a major banking headquarters, yet the nature of work taking place inside is fundamentally different. The camera movement should feel smooth, cinematic and documentary-like, establishing the AI-native operations floor as a coherent environment that connects all subsequent scenes. Same AI-native banking operations headquarters in Frankfurt. Premium enterprise architecture. Open operations environment. Dark navy and Deloitte green palette. Human-centered future of work. Cinematic strategy-documentary style. Executive presentation quality. No clutter. The transition ends as Mara approaches the Prevention Intelligence Center, where large operational displays begin highlighting overnight prevention activity and resolved customer issues.',
    bild: './images/operations/s0.jpg',
  },
  {
    id: 's1',
    klick: 1,
    zeit: '08:00',
    dimension: 'Customer Operations & Solutions',
    hypothese: 'The best complaint is the one that never takes place',
    statusQuo: 'In Complaints Management, contact volume (complaints received, resolution time, reopened cases) **is the primary service metric** - the contact center is staffed and measured around handling that volume well.',
    future: 'An agent detects the pattern that typically generates a complaint (a recurring fee dispute, a repeated failed payment) and **resolves it proactively before the customer ever files one**. **Contact-avoidance rate becomes the north-star metric** for Complaints Management, not resolution speed.',
    impact: '**214 complaints prevented overnight vs. 3 received** - ~98.6% prevention rate (illustrative figure for the demo). **Cost per complaint case reduced by 70-90%**; same operational capacity supports **5-10x higher volume** without linear cost growth. Proactive issue resolution increases trust and retention, creating measurable CLV (Customer Lifetime Value) uplift and reducing customer churn. Customer effort approaches zero for recurring service issues; **complaint volume declines by >90%**.',
    leitfrage: 'Is your Complaints organization still rewarded for handling complaint volume well - when the real win is that volume never being generated in the first place?',
    punkte: [
      'Overnight, agents traced recurring fee disputes and failed payments to their root cause and fixed them.',
      '128 patterns detected, 96 resolved, 3 held back for her judgement.',
      'The service metric moves from resolution speed to contact avoidance; cost per case falls 70-90 %.',
    ],
    szene: 'Mara opens Complaints Management. Instead of a queue of complaints, she sees an overnight prevention feed: agents detected recurring fee disputes and failed-payment patterns, resolved root causes, documented the interventions and escalated only the few cases where policy confidence fell below threshold.',
    script: 'In the old model, Operations was rewarded for handling frustration quickly. In the agentic model, the best service event is the one the customer never has to initiate. The department no longer optimizes the complaint queue; it optimizes the conditions that prevent the queue from forming. Mara\'s review starts with prevented harm, not processed volume.',
    prompt: 'Inside the Prevention Intelligence Center of the AI-native banking operations headquarters, Mara begins her day by reviewing overnight operational outcomes. Rather than facing a queue of customer complaints, Mara stands before a prevention-intelligence workspace that highlights issues resolved before customers ever became aware of them. Large transparent displays visualize recurring fee disputes, failed-payment patterns, root-cause interventions and prevention actions executed overnight by specialized agent teams. The central operational metric is no longer complaint volume or resolution speed. Instead, the environment focuses on prevented customer harm, policy-confidence scores, intervention effectiveness and the small number of cases escalated for human judgement. Around Mara, the Prevention Intelligence Center feels like a strategic operational command hub rather than a traditional contact center. Human experts supervise exception streams while autonomous complaint-prevention agents continuously monitor customer journeys, detect emerging patterns and resolve root causes before customer contact occurs. The image should emphasize that operational success is measured by the absence of problems rather than the handling of problems. Part of the same AI-native banking operations headquarters in Frankfurt. Premium enterprise architecture. Open operations environment. Dark navy and Deloitte green palette. Human-centered future of work. Cinematic strategy-documentary style. Executive presentation quality. No clutter.',
    transition: 'Mara leaves the Prevention Intelligence Center and walks toward the Customer Trust Experience Hub. The camera follows her through the AI-native banking operations floor. Along the way, large operational displays show the transition from internal prevention activity to customer impact. Complaint-prevention agents continue monitoring payment flows, fee events and emerging service risks in the background, while visualizations highlight how resolved issues translate into customer trust and relationship outcomes. As Mara moves through the space, the environment shifts from operational health metrics toward customer-centric intelligence. Transparent displays visualize customer journeys, trust indicators, relationship health scores and proactive service-recovery outcomes. The office atmosphere remains calm and highly automated, with only a small number of human experts overseeing the customer experience ecosystem. The transition should reinforce that preventing operational problems is only the first step. The ultimate objective is creating customer trust, loyalty and confidence through proactive action. The environment gradually evolves from a prevention-focused command center into a relationship-intelligence environment. The camera movement should feel smooth, cinematic and continuous, maintaining visual connection to the same AI-native banking operations headquarters while subtly changing the focus from operational intervention to customer impact. Same AI-native banking operations headquarters in Frankfurt. Premium enterprise architecture. Open operations environment. Dark navy and Deloitte green palette. Human-centered future of work. Cinematic strategy-documentary style. Executive presentation quality. No clutter. The transition ends as Mara enters the Customer Trust Experience Hub, where proactive service recoveries, customer notifications and relationship outcomes become the primary focus of the scene.',
    bild: './images/operations/s1.jpg',
  },
  {
    id: 's2',
    klick: 2,
    zeit: '08:05',
    dimension: 'Customer Perspective',
    hypothese: 'The customer doesn\'t just avoid friction - they\'re rewarded for the trouble the bank caused in the first place.',
    statusQuo: 'A resolved issue today ends with, at best, **a fee refund or an apology letter** - the customer rarely experiences a \'silent fix\' as something positive or even notices it happened.',
    future: 'The moment an issue is proactively fixed, the customer gets a direct notification plus a goodwill gesture - e.g. a cinema or fuel voucher - **turning an invisible save into a visible, positive moment**. Customer Data & AI guide the employee when choosing the right compensation.',
    impact: 'Illustrative: **voucher cost per case vs. avoided complaint-handling cost**, plus potential NPS/loyalty uplift - to be validated with real unit economics.',
    leitfrage: 'If prevention is invisible to the customer, are you capturing the loyalty value it should create - and could a small visible gesture make that value visible and felt?',
    punkte: [
      'The agent arrives with the remedy, not the question: three fees refunded, message drafted, reasoning attached.',
      'The gesture is priced from relationship value, service history, fairness and cost to serve: 2,450 EUR.',
      'Mara judges the reasoning, not the arithmetic; the case closes in seconds.',
    ],
    szene: 'A customer receives a transparent notification: an issue was detected, corrected and compensated before any complaint was filed. The compensation is not generic; a customer-data agent has selected the gesture based on relationship value, previous service experience, fairness rules and cost-to-serve economics.',
    script: 'Prevention only creates trust if the customer can feel it. In 2030, the bank turns an invisible operational save into a visible relationship moment. The point is not the voucher itself. The point is that recovery becomes proactive, explainable and emotionally legible: the bank noticed, acted and made the customer whole before being asked.',
    prompt: 'Inside the Customer Trust Experience Hub of the AI-native banking operations headquarters, Mara reviews how proactive operational interventions are experienced by customers. A customer-facing experience wall visualizes issues that were detected, resolved and compensated before customers ever submitted a complaint. The environment focuses on trust creation rather than complaint handling. Large transparent displays show customer notifications, proactive service recoveries, relationship-impact indicators and personalized goodwill recommendations generated by customer-data agents. At the center of the scene, Mara observes how operational actions become visible customer moments. One display highlights a recently resolved issue, showing how the bank detected the problem, corrected it, selected an appropriate compensation gesture and communicated the resolution transparently before customer frustration emerged. Around her, the Customer Trust Experience Hub resembles a relationship-intelligence center rather than a contact center. Operational excellence, customer understanding and AI-driven personalization converge into a single environment focused on maintaining trust and strengthening long-term relationships. The image should emphasize that customer trust is built not only through solving problems, but through preventing frustration and making recovery visible, transparent and meaningful. Part of the same AI-native banking operations headquarters in Frankfurt. Premium enterprise architecture. Open operations environment. Dark navy and Deloitte green palette. Human-centered future of work. Cinematic strategy-documentary style. Executive presentation quality. No clutter.',
    transition: 'Mara leaves the Customer Trust Experience Hub and walks toward the Evidence Operations Hub. The camera follows her through the AI-native banking operations floor. Along the way, customer-facing outcomes gradually give way to evidence, knowledge and regulatory intelligence. Large transparent displays show how operational events, customer interactions and transaction data are continuously transformed into structured evidence assets available across the organization. As Mara moves through the environment, digital information flows become increasingly visible. Customer histories, transaction records, legal references and prior case outcomes appear as interconnected knowledge streams moving through a shared evidence fabric. The physical boundaries between systems seem to disappear as information from previously separate platforms converges into a unified intelligence layer. Human experts are no longer searching databases or navigating multiple systems. Instead, they review synthesized evidence packages, challenge assumptions and investigate uncertainty flags highlighted by the operating model. The environment feels like a fusion of an intelligence-analysis center and a regulatory operations hub. The transition should communicate the shift from customer trust creation to institutional knowledge orchestration. The focus moves from what customers experience to how the bank assembles, interprets and governs information. The camera movement should feel smooth, cinematic and continuous, reinforcing that every capability exists within the same AI-native banking operations headquarters. The architecture remains consistent while the nature of work evolves from customer engagement to evidence evaluation. Same AI-native banking operations headquarters in Frankfurt. Premium enterprise architecture. Open operations environment. Dark navy and Deloitte green palette. Human-centered future of work. Cinematic strategy-documentary style. Executive presentation quality. No clutter. The transition ends as Mara enters the Evidence Operations Hub, where a newly arrived authority request and a pre-assembled evidence package become the focus of the next scene.',
    bild: './images/operations/s2.jpg',
  },
  {
    id: 's2b',
    klick: 2.5,
    zeit: '08:10',
    nurV03: true,
    dimension: 'Customer Operations & Solutions',
    hypothese: 'One approval, and thousands of customers hear about it at once.',
    statusQuo: 'A resolved case ends in a file. Whether the customer ever noticed is nobody\'s metric.',
    future: 'The moment she approves, **every affected customer is told what was fixed and what they get**, in their own situation, without asking.',
    impact: '',
    leitfrage: 'How many of the problems you solve does your customer ever find out about?',
    punkte: [
      'The same decision reaches every affected customer, each one in their own situation.',
      'Nine of several thousand shown here: kitchen table, tram, supermarket, workshop.',
      'Reach stops being a staffing question and becomes a governance question.',
    ],
    szene: 'Mara approves the proposal. In the same moment the customers are informed: at the kitchen table, on the tram, in the supermarket, in the workshop. She never speaks to any of them.',
    script: 'This is the part that never shows up in a process diagram. One judgement, and the result reaches everyone it concerns, each in their own situation, each with their own case.',
    prompt: '',
    transition: '',
    bild: './images/operations/s2b.jpg',
  },
  {
    id: 's3',
    klick: 3,
    zeit: '08:15',
    dimension: 'Data & Knowledge',
    hypothese: 'No one will search for information anymore - information will find the decision-maker.',
    statusQuo: 'When an Information Request from an authority arrives, a caseworker searches multiple systems - customer records, transaction history, prior disclosures, legal basis documentation - to assemble a response, **often taking days**.',
    future: 'The moment an Information Request is logged, the relevant customer data, applicable legal basis, and comparable prior responses are already assembled and ranked for the caseworker **before the case is even opened - search as an activity disappears**.',
    impact: 'Information-request preparation time **reduced from days to minutes**; **70-90% less manual research effort** while improving consistency and regulatory response quality.',
    leitfrage: 'If \'knowing where to look\' stops being a skill anyone needs for Information Requests, what should your teams be trained and promoted for instead?',
    punkte: [
      'The authority request arrives with its evidence assembled: customer data, transaction context, legal basis, prior disclosures.',
      'Every item is timestamped and traceable to its source.',
      'The deadline is met by review time, not by search time.',
    ],
    szene: 'A public authority request is logged. Before Mara opens the case, an evidence agent has assembled customer records, transaction context, legal basis, prior comparable responses, data-sharing constraints and a recommended response route. The workspace also highlights what the agent does not know and where human judgement may be required.',
    script: 'Expertise used to mean knowing where to search. The agentic bank collapses search, retrieval and first synthesis into the operating model itself. Mara does not start with an empty case file; she starts with a pre-built evidence package and a challenge: is the proposed interpretation defensible, complete and proportionate? Human value moves from finding information to interrogating it.',
    prompt: 'Inside the Evidence Operations Hub of the AI-native banking operations headquarters, Mara reviews a newly received public-authority request. Instead of opening multiple systems and searching for information manually, Mara enters a workspace where an evidence agent has already assembled a comprehensive evidence package. Large transparent displays present customer records, transaction context, legal basis, prior comparable responses, regulatory constraints and recommended response options in a single orchestrated view. At the center of the scene, Mara evaluates not only what the system knows, but also what it does not know. Visible uncertainty indicators, confidence levels and highlighted information gaps draw attention to areas requiring human judgement, interpretation or challenge. Around her, the Evidence Operations Hub resembles an intelligence-analysis center rather than a traditional operations department. Information from formerly separate systems flows into a shared evidence fabric visible throughout the environment. Human experts spend less time retrieving information and more time validating interpretations, identifying blind spots and ensuring defensible decisions. The image should emphasize that expertise is no longer defined by knowing where information resides. Expertise is defined by evaluating evidence, questioning assumptions and exercising judgement where uncertainty remains. Part of the same AI-native banking operations headquarters in Frankfurt. Premium enterprise architecture. Open operations environment. Dark navy and Deloitte green palette. Human-centered future of work. Cinematic strategy-documentary style. Executive presentation quality. No clutter.',
    transition: 'Mara leaves the Customer Trust Experience Hub and walks toward the Evidence Operations Hub. The camera follows her through the AI-native banking operations floor. Along the way, customer-facing outcomes gradually give way to evidence, knowledge and regulatory intelligence. Large transparent displays show how operational events, customer interactions and transaction data are continuously transformed into structured evidence assets available across the organization. As Mara moves through the environment, digital information flows become increasingly visible. Customer histories, transaction records, legal references and prior case outcomes appear as interconnected knowledge streams moving through a shared evidence fabric. The physical boundaries between systems seem to disappear as information from previously separate platforms converges into a unified intelligence layer. Human experts are no longer searching databases or navigating multiple systems. Instead, they review synthesized evidence packages, challenge assumptions and investigate uncertainty flags highlighted by the operating model. The environment feels like a fusion of an intelligence-analysis center and a regulatory operations hub. The transition should communicate the shift from customer trust creation to institutional knowledge orchestration. The focus moves from what customers experience to how the bank assembles, interprets and governs information. The camera movement should feel smooth, cinematic and continuous, reinforcing that every capability exists within the same AI-native banking operations headquarters. The architecture remains consistent while the nature of work evolves from customer engagement to evidence evaluation. Same AI-native banking operations headquarters in Frankfurt. Premium enterprise architecture. Open operations environment. Dark navy and Deloitte green palette. Human-centered future of work. Cinematic strategy-documentary style. Executive presentation quality. No clutter. The transition ends as Mara enters the Evidence Operations Hub, where a newly arrived authority request and a pre-assembled evidence package become the focus of the next scene.',
    bild: './images/operations/s3.jpg',
  },
  {
    id: 's4',
    klick: 4,
    zeit: '09:00',
    dimension: 'Workforce & Organisation',
    hypothese: 'The operational unit will no longer consist of employees, but of agents and employees.',
    statusQuo: 'Complaints Management today **runs as a human team**: intake handlers, investigators, and a resolution team, each staffed and rostered by a team lead against a shared complaints queue.',
    future: 'The Complaints Management unit **becomes an agent team** - specialized agents for intake classification, root-cause investigation, resolution drafting, and regulatory reporting - coordinated as a fleet, with **one human supervisor overseeing calibration and escalations** rather than working the queue.',
    impact: '**One supervisor can orchestrate 50-200 specialized agents**, increasing operational **productivity by 5-10x** without proportional workforce growth.',
    leitfrage: 'What does \'team culture\' or \'onboarding\' mean for a Complaints unit where most \'members\' are agent instances - and does that concept need to survive, or be replaced entirely?',
    punkte: [
      'The morning review reads like a team review: six agent roles, each with calibration and health.',
      '1,582 decisions handled overnight; one agent flagged for attention.',
      'Capacity is planned as fleet configuration, not as headcount.',
    ],
    szene: 'Mara joins the daily operating review. The discussion is no longer about who works which queue. It is about the calibration, drift, exception rate and outcome quality of specialized complaint agents: intake, root-cause analysis, resolution drafting, customer communication, regulatory reporting and continuous improvement.',
    script: 'Mara still leads a team, but team leadership has changed. Some of the most important contributors are agent instances that can be retrained, redeployed or retired within hours. Culture becomes less about proximity and more about operating principles: what standards the agents follow, when they ask for help, and how humans keep the system aligned with customer, risk and conduct expectations.',
    prompt: 'Inside the Agent Workforce Control Room of the AI-native banking operations headquarters, Mara joins the daily operating review. Instead of managing case queues and employee workloads, Mara oversees a fleet of specialized complaint-management agents responsible for intake classification, root-cause analysis, resolution drafting, customer communication, regulatory reporting and continuous improvement. At the center of the room, a large operational command wall visualizes agent performance, calibration status, model drift, exception rates, outcome quality, escalation patterns and operational health across the entire complaints ecosystem. One agent cluster has been flagged for elevated drift, while another is outperforming expected customer outcomes. Mara is not reviewing completed cases. She is evaluating the behavior of the system itself. Human experts around her focus on calibration decisions, governance interventions and performance optimization rather than operational execution. The environment resembles a mission-control center or air-traffic-control tower rather than a traditional banking back office. Human and digital workforce operate as a single coordinated system, with agent fleets serving as the primary operational workforce and humans providing direction, oversight and accountability. The image should emphasize that team leadership has evolved into stewardship of a mixed workforce composed of human experts and specialized AI agents. Success is measured through system outcomes, quality and alignment rather than productivity of individual case handlers. Part of the same AI-native banking operations headquarters in Frankfurt. Premium enterprise architecture. Open operations environment. Dark navy and Deloitte green palette. Human-centered future of work. Cinematic strategy-documentary style. Executive presentation quality. No clutter.',
    transition: 'Mara leaves the Agent Workforce Control Room and walks toward the Process Intelligence Lab. The camera follows her through the AI-native banking operations headquarters as the environment gradually shifts from workforce orchestration to execution transparency. Behind her, large control-room displays continue monitoring agent performance, calibration, drift and exception rates. Ahead, the focus moves toward understanding how decisions are actually executed inside the operating model. As Mara walks, she passes operational visualization walls showing thousands of decisions moving through the bank\'s systems. Unlike traditional workflow boards, these displays do not show fixed queues or predefined process stages. Instead, they reveal dynamic execution paths, decision routes, policy checkpoints and evidence trails continuously adapting to the circumstances of each case. The environment increasingly resembles a laboratory for operational intelligence. Human experts gather around execution analyses, reviewing how agents navigate complex regulatory situations while remaining within approved legal, operational and fairness boundaries. Traditional process diagrams still appear occasionally as faded historical artifacts, contrasted with living execution networks that evolve in real time. The transition should communicate the shift from supervising the workforce to understanding the behavior of the system it operates. The question is no longer who performs the work, but how decisions are executed and how their legitimacy can be proven. The camera movement should feel smooth, cinematic and continuous, maintaining the feeling of one connected AI-native operations headquarters. The architecture remains visually consistent while the operational focus shifts from workforce management to adaptive execution and decision transparency. Same AI-native banking operations headquarters in Frankfurt. Premium enterprise architecture. Open operations environment. Dark navy and Deloitte green palette. Human-centered future of work. Cinematic strategy-documentary style. Executive presentation quality. No clutter. The transition ends as Mara enters the Process Intelligence Lab, where a flagged garnishment case and its adaptive decision trace become the focus of the next scene.',
    bild: './images/operations/s4.jpg',
  },
  {
    id: 's5',
    klick: 5,
    zeit: '10:30',
    dimension: 'Processes & Operations',
    hypothese: 'Process maps will cease to exist.',
    statusQuo: 'Garnishment today is documented as a BPMN flowchart - intake, verification, exemption calculation, creditor notification, hold placement - **a fixed sequence auditors expect to see** and process-excellence teams optimize step by step.',
    future: 'An agent handling a garnishment case pursues the outcome (a compliant, correctly calculated garnishment) within legal guardrails, **choosing its own path** - verifying exemptions before or after creditor notification depending on the case, skipping steps that don\'t apply. **The BPMN map no longer matches any single case\'s actual execution trace**.',
    impact: 'Operations scale elastically without proportional workforce growth. **10x volume spikes absorbed without additional staffing**. **Authority-request preparation reduced from multiple days to minutes**.',
    leitfrage: 'If your Garnishment process documentation assumes a fixed sequence, what replaces it as the artifact auditors and regulators expect to see once execution stops being sequential?',
    punkte: [
      'Each case is assembled at run time from objective, constraints and context.',
      'Two cases with the same label take different routes, and both stay compliant.',
      'What is governed is the goal and the guardrails; the sequence is an outcome, not a rule.',
    ],
    szene: 'Mara reviews an exceptional garnishment case. The agent\'s execution trace does not resemble the official BPMN map: it verified exemptions earlier, skipped irrelevant steps, sequenced creditor notification differently and still reached a compliant outcome with full evidence. The review artifact is no longer a process map; it is a decision trace.',
    script: 'The process was once the control object. In an agentic model, the route can vary while the obligation remains fixed. What matters is not whether every case followed the same path, but whether every path stayed inside legal, operational and fairness guardrails. Auditors will not ask for the one true flow; they will ask for the evidence that the adaptive path was legitimate.',
    prompt: 'Inside the Process Intelligence Lab of the AI-native banking operations headquarters, Mara reviews an exceptional garnishment case that has been flagged for human inspection. A large interactive decision-trace visualization dominates the room. Instead of a traditional BPMN process map, the display shows the actual execution path chosen by the agent: exemptions were verified earlier than usual, irrelevant activities were skipped, creditor notifications followed a different sequence, yet all legal, operational and fairness obligations were satisfied. At the center of the scene, Mara explores the evidence behind the agent\'s decisions. The workspace visualizes execution paths, decision nodes, legal guardrails, policy constraints and compliance evidence rather than fixed process stages. Every decision is traceable, explainable and auditable, even though no two cases necessarily follow the same route. Around her, the Process Intelligence Lab resembles a forensic investigation center focused on understanding adaptive execution. Human experts no longer optimize static workflows step by step. Instead, they analyze how agentic systems navigate complex situations, identify emerging execution patterns and validate that adaptive decisions remain compliant. The environment clearly contrasts traditional process thinking with outcome-oriented execution. What matters is not whether the official sequence was followed, but whether the chosen path remained within all required guardrails and produced a compliant result. The image should emphasize the transition from process-centric operations to evidence-centric operations. The process is no longer the primary artifact. The decision trace is. Part of the same AI-native banking operations headquarters in Frankfurt. Premium enterprise architecture. Open operations environment. Dark navy and Deloitte green palette. Human-centered future of work. Cinematic strategy-documentary style. Executive presentation quality. No clutter.',
    transition: 'Mara leaves the Process Intelligence Lab and walks toward the Governance & Decision Logic Center. The camera follows her through the AI-native banking operations headquarters as the environment gradually shifts from analyzing how decisions were executed to determining how future decisions will be made. Behind her, adaptive execution traces continue flowing across large transparent displays, visualizing the many different routes agents have taken through complex cases. As Mara moves forward, these decision paths begin converging into higher-level policy structures, governance frameworks and decision-rule architectures. The focus moves away from individual execution traces and toward the logic that governs them. Along the corridor, interactive governance displays visualize rule hierarchies, policy dependencies, certification lifecycles, testing environments and deployment pipelines. Human experts are reviewing simulation results, inspecting edge cases and evaluating proposed logic changes rather than investigating individual operational outcomes. The environment increasingly resembles a mission-critical governance and software release center. Operational activity becomes more abstract and strategic. Instead of asking whether a particular decision was executed correctly, the organization is asking whether the underlying logic itself deserves trust. The transition should communicate the shift from understanding individual decision behavior to governing the decision system itself. Adaptive execution creates the need for a new governance model, and Mara is moving toward the place where that governance happens. The camera movement should feel smooth, cinematic and continuous, reinforcing that all decisions, processes and controls remain part of the same AI-native operating system. The architecture stays consistent while the focus moves from execution evidence to decision logic stewardship. Same AI-native banking operations headquarters in Frankfurt. Premium enterprise architecture. Open operations environment. Dark navy and Deloitte green palette. Human-centered future of work. Cinematic strategy-documentary style. Executive presentation quality. No clutter. The transition ends as Mara enters the Governance & Decision Logic Center, where a proposed update to the bank\'s garnishment decision logic awaits certification.',
    bild: './images/operations/s5.jpg',
  },
  {
    id: 's6',
    klick: 6,
    zeit: '11:15',
    dimension: 'Governance & Operating Model',
    hypothese: 'Humans will no longer approve individual decisions - only the decision logic behind them.',
    statusQuo: 'In Garnishment, a caseworker reviews and signs off on each individual garnishment order - checking exemption amounts, creditor priority, and account holds - **case by case, against a delegation-of-authority matrix** built for that purpose.',
    future: 'A human **certifies the garnishment decision logic once** (exemption calculation rules, priority hierarchy, hold triggers) as a tested, version-controlled policy. The agent then processes every incoming garnishment order under that certified logic **without case-by-case sign-off**; the human only recertifies when the logic itself changes.',
    impact: '**0.4 seconds per decision vs. ~20 minutes of manual review** in 2025 - the same headcount can cover **roughly 15× the volume**.',
    leitfrage: 'If you can no longer verify individual garnishment decisions, what exactly are you accountable for when you certify the logic - and does your current delegation-of-authority framework have a category for that?',
    punkte: [
      'Mara compares version 4.2 with 4.3 of the garnishment logic and certifies the difference.',
      'One certification takes the place of a queue of identical sign-offs.',
      'Governance becomes reviewable: versioned, dated, with a visible diff.',
    ],
    szene: 'Mara opens what used to be an approval queue. There are no individual garnishment files waiting for sign-off. Instead, she reviews a proposed version update of the garnishment decision logic: exemption rules, creditor priority, hold triggers, fairness constraints, test results, observed drift and rollback options.',
    script: 'Approval moves upstream. In 2025, Mara approved decisions **one by one** because the bank trusted human review more than system logic. In 2030, the accountable act is certification of the logic that will govern thousands of decisions. That makes governance both more powerful and more dangerous: one certified rule can scale trust, but one flawed rule can scale failure.',
    prompt: 'Inside the Process Intelligence Lab of the AI-native banking operations headquarters, Mara reviews an exceptional garnishment case that has been flagged for human inspection. A large interactive decision-trace visualization dominates the room. Instead of a traditional BPMN process map, the display shows the actual execution path chosen by the agent: exemptions were verified earlier than usual, irrelevant activities were skipped, creditor notifications followed a different sequence, yet all legal, operational and fairness obligations were satisfied. At the center of the scene, Mara explores the evidence behind the agent\'s decisions. The workspace visualizes execution paths, decision nodes, legal guardrails, policy constraints and compliance evidence rather than fixed process stages. Every decision is traceable, explainable and auditable, even though no two cases necessarily follow the same route. Around her, the Process Intelligence Lab resembles a forensic investigation center focused on understanding adaptive execution. Human experts no longer optimize static workflows step by step. Instead, they analyze how agentic systems navigate complex situations, identify emerging execution patterns and validate that adaptive decisions remain compliant. The environment clearly contrasts traditional process thinking with outcome-oriented execution. What matters is not whether the official sequence was followed, but whether the chosen path remained within all required guardrails and produced a compliant result. The image should emphasize the transition from process-centric operations to evidence-centric operations. The process is no longer the primary artifact. The decision trace is. Part of the same AI-native banking operations headquarters in Frankfurt. Premium enterprise architecture. Open operations environment. Dark navy and Deloitte green palette. Human-centered future of work. Cinematic strategy-documentary style. Executive presentation quality. No clutter.',
    transition: 'Mara leaves the Governance & Decision Logic Center and walks toward the Risk Assurance Hub. The camera follows her through the AI-native banking operations headquarters as the environment gradually shifts from certifying decision logic to continuously assuring decision quality in production. Behind her, governance workspaces display approved policy packages, decision-rule architectures, certification workflows and deployment controls. As Mara moves forward, these governance structures become increasingly operational. Large transparent displays visualize how certified logic is executed across thousands of live decisions, continuously monitored for risk exposure, fairness outcomes, conduct compliance and regulatory adherence. Along the way, operational intelligence walls show decision streams flowing through the organization. Validation signals, control indicators and assurance metrics appear directly alongside business outcomes, demonstrating that governance is no longer separated from execution. Human experts review emerging risk patterns, investigate anomalies and challenge model behavior rather than manually rechecking completed cases. The environment increasingly resembles a real-time assurance ecosystem. Traditional approval queues and second-line review backlogs are absent. Instead, live monitoring layers continuously evaluate whether decisions remain aligned with risk appetite, fairness standards and regulatory expectations as they occur. The transition should communicate the shift from governing decision logic before deployment to assuring decision behavior during execution. Governance defines the rules; assurance verifies that the system remains trustworthy in operation. The camera movement should feel smooth, cinematic and continuous, reinforcing that governance and control are no longer separate organizational functions but connected elements of the same operating model. Same AI-native banking operations headquarters in Frankfurt. Premium enterprise architecture. Open operations environment. Dark navy and Deloitte green palette. Human-centered future of work. Cinematic strategy-documentary style. Executive presentation quality. No clutter. The transition ends as Mara enters the Risk Assurance Hub, where embedded control evidence, continuous validation and live assurance become the focus of the next scene.',
    bild: './images/operations/s6.jpg',
  },
  {
    id: 's7',
    klick: 7,
    zeit: '14:00',
    dimension: 'Risk, Compliance & Controls',
    hypothese: 'Control will become part of the decision itself - the three lines of defense will lose their relevance.',
    statusQuo: 'In Collection Recovery Workout, a case handler proposes a workout plan (payment restructuring, write-off recommendation), which is then independently reviewed by a second-line risk function before execution - **two organizationally separate steps**.',
    future: 'The agent proposing a workout plan for Collection Recovery Workout evaluates it against risk appetite, regulatory constraints, and fairness rules **as part of the same decision** - not as a separate downstream review. There is no organizationally distinct second-line act left to perform; only the combined decision-and-control logic is certified upfront (see Thesis 1).',
    impact: '**100% of decisions carry real-time control evidence** vs. a 3–5 day second-line review backlog in 2025. Embedded controls reduce policy breaches and **operational-risk incidents by 50-80%** through continuous real-time validation. New regulatory requirements implemented through policy updates rather than large-scale process transformation programs.',
    leitfrage: 'If the control sits inside the Collection Recovery Workout decision itself, what is left for your second-line risk function to do - and what does \'independent review\' mean when there\'s no separate act to review?',
    punkte: [
      'Risk appetite, affordability, conduct obligations and forbearance rules are tested as the decision is made.',
      'Each case carries its own control evidence: no sample is drawn afterwards.',
      'The three lines blur: assurance is designed in, not inspected on.',
    ],
    szene: 'A collection recovery workout proposal appears. The recommendation already includes embedded evidence that risk appetite, affordability, conduct obligations, fairness requirements and regulatory constraints were evaluated inside the decision. The second-line team sees a live assurance layer rather than a separate backlog of files.',
    script: 'Control no longer waits downstream. It travels with the decision. This changes the meaning of independence: the second line is no longer strongest when it rechecks every case after the fact, but when it certifies, challenges and monitors the control logic before and during execution. The control function becomes a system governor, not a processing checkpoint.',
    prompt: 'Inside the Risk Assurance Hub of the AI-native banking operations headquarters, Mara reviews a Collection Recovery Workout recommendation that has already completed its control assessment. Rather than waiting for a separate risk review, the proposal arrives with embedded evidence showing how risk appetite, affordability criteria, conduct obligations, fairness requirements and regulatory constraints were evaluated during the decision itself. Every recommendation carries its own assurance layer. At the center of the scene, Mara examines a workout proposal surrounded by transparent validation layers. Interactive visualizations reveal how the recommendation was stress-tested against policy constraints, customer circumstances, regulatory requirements and historical outcomes. Control evidence appears as an integrated part of the decision object rather than a separate approval workflow. Around her, specialists from risk, compliance and operations work within a shared assurance environment. There are no stacks of files waiting for second-line review and no visible approval backlog. Instead, large operational displays monitor control effectiveness, model assurance, governance exceptions, fairness metrics and emerging risks across the decision ecosystem. The environment resembles a real-time assurance center where oversight happens continuously rather than sequentially. Human experts challenge assumptions, certify control logic and monitor systemic behavior instead of manually rechecking individual decisions. The image should emphasize that control has moved inside the decision itself. Assurance is no longer a downstream checkpoint. It is a continuous property of the operating system. Part of the same AI-native banking operations headquarters in Frankfurt. Premium enterprise architecture. Open operations environment. Dark navy and Deloitte green palette. Human-centered future of work. Cinematic strategy-documentary style. Executive presentation quality. No clutter.',
    transition: 'Mara leaves the Risk Assurance Hub and walks toward the Institutional Agent Interaction Center. The camera follows her through the AI-native banking operations headquarters as the environment gradually shifts from internal controls and assurance mechanisms to external institutional interaction. Behind her, real-time assurance dashboards continue monitoring fairness, risk appetite, compliance adherence and control effectiveness across thousands of operational decisions. As Mara moves forward, those same controls become increasingly embedded within outward-facing interactions. Risk, compliance and governance signals remain visible, but now appear alongside conversations, information exchanges and evidence delivery processes. Along the way, transparent displays show how requests from customers, authorities and external stakeholders are interpreted, clarified and fulfilled by institutional agents. Traditional portal interfaces, form workflows and navigation trees appear only as faint legacy artifacts embedded in the background. In their place, conversational interactions, intent-recognition flows, reasoning layers and evidence exchanges dominate the environment. The atmosphere increasingly resembles an institutional communications ecosystem rather than a traditional operations floor. Human experts focus on explainability, transparency, policy interpretation and interaction quality rather than maintaining channels, screens or submission forms. The transition should communicate that governance and control do not end at the internal operating model. They become part of every interaction the institution has with external stakeholders. The bank\'s reasoning process becomes visible, explainable and auditable. The camera movement should feel smooth, cinematic and continuous, reinforcing that external interactions are simply another manifestation of the same AI-native operating system already governing decisions, controls and operations inside the organization. Same AI-native banking operations headquarters in Frankfurt. Premium enterprise architecture. Open operations environment. Dark navy and Deloitte green palette. Human-centered future of work. Cinematic strategy-documentary style. Executive presentation quality. No clutter. The transition ends as Mara enters the Institutional Agent Interaction Center, where a public authority is interacting directly with the bank\'s institutional agent through natural dialogue and evidence-based reasoning.',
    bild: './images/operations/s7.jpg',
  },
  {
    id: 's8',
    klick: 8,
    zeit: '15:30',
    dimension: 'Technology & Architecture',
    hypothese: 'The bank\'s most important user interface will no longer be a front end, but an agent.',
    statusQuo: 'Today, authorities and customers submit Information Requests **through a portal or form-based front end**, and internal staff respond via case-management screens designed and maintained by a UX/design organization.',
    future: 'Authorities and customers interact directly with a conversational agent to submit and track Information Requests - **no portal, no form**; the agent understands the request, clarifies scope in dialogue, and returns a compliant response. **The front end shrinks to a rendering surface** behind the agent, if it exists at all.',
    impact: 'New services and regulatory interactions can be introduced **in days instead of months**, as conversational agents replace large parts of traditional channel development.',
    leitfrage: 'What happens to your design organization\'s role and budget once the portal they built for Information Requests becomes optional infrastructure behind an agent?',
    punkte: [
      'Mara states an intent; the agent assembles the data, the checks and the actions behind it.',
      'Screens stop being where work happens and become where work is reviewed.',
      'Integration effort moves from building front ends to defining intents and permissions.',
    ],
    szene: 'A public authority interacts with the bank through a conversational agent. There is no portal journey, no form design and no navigation tree. The authority describes the information need, the agent clarifies scope, checks legal basis, explains limitations and returns a compliant response with a traceable evidence package.',
    script: 'For years, banks optimized front ends. In the agentic bank, the primary interface is not a screen; it is an institutional agent that can understand intent, negotiate scope and execute across systems. Design does not disappear, but its object changes. The new design challenge is how the bank speaks, reasons, clarifies and proves its decisions.',
    prompt: 'Inside the Institutional Agent Interaction Center of the AI-native banking operations headquarters, Mara observes a live interaction between a public authority and the bank\'s institutional agent. There is no traditional portal, navigation tree or form-driven customer journey. Instead, a conversational intelligence environment visualizes how the institutional agent receives a request, clarifies scope, validates legal requirements, explains limitations and assembles a compliant evidence package in real time. At the center of the scene, a transparent interaction workspace displays the ongoing dialogue together with supporting legal reasoning, evidence references, confidence levels and audit trails. The conversation itself is the interface. Screens, forms and workflows have receded into the background infrastructure. Around Mara, specialists monitor the quality of institutional interactions rather than maintaining portals or processing requests manually. Large displays visualize conversation outcomes, resolution effectiveness, evidence quality, policy adherence and trust indicators across thousands of agent-mediated interactions. The environment resembles an institutional communications command center where intent, reasoning and trustworthiness matter more than navigation design. Human experts focus on improving how the bank explains, justifies and demonstrates its decisions rather than optimizing screens and forms. The image should emphasize that the primary interface of the bank is no longer a digital channel but an intelligent institutional agent capable of understanding intent, reasoning about requests and providing transparent, compliant responses. Part of the same AI-native banking operations headquarters in Frankfurt. Premium enterprise architecture. Open operations environment. Dark navy and Deloitte green palette. Human-centered future of work. Cinematic strategy-documentary style. Executive presentation quality. No clutter.',
    transition: 'Mara leaves the Institutional Agent Interaction Center and walks toward the Digital Workforce Portfolio Center. The camera follows her through the AI-native banking operations headquarters as the environment gradually shifts from external institutional interaction to enterprise-wide workforce governance. Behind her, institutional agents continue handling requests from authorities, customers and external stakeholders. Transparent displays visualize ongoing conversations, reasoning flows, evidence exchanges and policy validation. As Mara moves through the operations floor, the focus expands from individual interactions to the organizational systems and agent fleets responsible for delivering them. Along the way, large operational walls display the bank\'s agent ecosystem at scale. Specialized agent populations appear across operational domains including complaints management, information requests, collections, regulatory reporting and decision governance. Real-time indicators show capacity utilization, operational load, model health, escalation activity, drift patterns and portfolio performance. Human experts are visible reviewing workforce health, governance metrics and deployment strategies rather than managing individual transactions. The environment increasingly resembles an asset-management or investment-control center where digital labor is monitored, optimized and strategically allocated across the enterprise. The transition should communicate that once agents become the primary execution layer of the bank, leadership naturally shifts toward managing portfolios of digital workers rather than teams of individual employees. The organization begins to view operational capacity as a managed ecosystem rather than a collection of departments. The camera movement should feel smooth, cinematic and continuous, reinforcing that workforce management is the natural culmination of all previous capabilities. Every agent observed throughout the journey now becomes part of a larger workforce portfolio under active governance and stewardship. Same AI-native banking operations headquarters in Frankfurt. Premium enterprise architecture. Open operations environment. Dark navy and Deloitte green palette. Human-centered future of work. Cinematic strategy-documentary style. Executive presentation quality. No clutter. The transition ends as Mara enters the Digital Workforce Portfolio Center, where a workforce portfolio consisting of human experts, active agent fleets, experimental models and performance metrics becomes the focus of the next scene.',
    bild: './images/operations/s8.jpg',
  },
  {
    id: 's9',
    klick: 9,
    zeit: '16:00',
    dimension: 'Leadership & Performance Management',
    hypothese: 'Every manager will be responsible for more digital than human employees - everyone will become a manager.',
    statusQuo: 'A Collection Recovery Workout team lead **manages 8 human case handlers directly** - coaching, staffing, and being accountable for their casework.',
    future: 'A Collection Recovery Workout lead in 2030 **manages 2 human specialists plus 120 agent instances** handling workout cases across segments - a portfolio-management role focused on calibration and exception review rather than people coaching. The IC-to-lead-to-manager ladder collapses; **everyone ends up managing some digital workforce**.',
    impact: '**15 case handlers + 2 leads (2025) → 2 specialists + 1 manager (2030)** for the same case volume.',
    leitfrage: 'If overseeing 120 workout agents scales completely differently from managing 8 people, what does \'getting promoted\' even mean in Collection Recovery by 2030?',
    punkte: [
      'Her span of control counts agents and people in the same view.',
      'Digital labour is managed on behaviour, drift and quality of escalation.',
      'Leadership becomes setting objectives and reading exceptions, not distributing tasks.',
    ],
    szene: 'Mara reviews a workforce portfolio: two human specialists, 120 operational agents, several agent versions in test, and one underperforming cluster flagged for drift. The conversation focuses on capacity, risk exposure, escalation patterns, customer outcomes, model health and which agents should be upgraded, constrained or retired.',
    script: 'Leadership becomes portfolio management. Managing eight people scaled through coaching and staffing. Managing 120 agents scales through objectives, telemetry, calibration and governance. Promotion is no longer simply a larger human team; it is responsibility for larger decision surfaces, higher-risk logic and more consequential digital labor.',
    prompt: 'Inside the Digital Workforce Portfolio Center of the AI-native banking operations headquarters, Mara conducts the daily workforce portfolio review. The room is designed around the management of a hybrid workforce consisting of human specialists and large fleets of operational agents. At the center of the space, an executive portfolio-management environment visualizes operational capacity, risk exposure, model health, agent performance, escalation patterns, calibration status and business outcomes across the organization\'s digital workforce. Mara is reviewing a workforce portfolio composed of two human specialists, 120 operational agents, several agent versions currently being tested and one underperforming agent cluster flagged for drift. Large transparent displays show workforce allocation, performance trends, upgrade candidates, governance constraints and strategic recommendations for resource deployment. Around her, workforce management resembles investment portfolio management more than traditional people leadership. Human experts collaborate on questions of agent calibration, capacity planning, operational resilience and decision quality rather than staffing levels, shift schedules and individual productivity. The environment feels like an executive command center for digital labor. Every agent fleet is treated as a managed asset with measurable risk, performance, maintenance requirements and strategic value. Human leadership is focused on directing, governing and continuously improving a workforce that is increasingly digital in nature. The image should emphasize that leadership has evolved from managing teams of employees to managing portfolios of human and digital labor. Success is measured by system outcomes, governance quality and operational effectiveness at scale. Part of the same AI-native banking operations headquarters in Frankfurt. Premium enterprise architecture. Open operations environment. Dark navy and Deloitte green palette. Human-centered future of work. Cinematic strategy-documentary style. Executive presentation quality. No clutter.',
    transition: 'Mara leaves the Digital Workforce Portfolio Center and walks toward the Operations Reflection & Learning Hub. The camera follows her through the AI-native banking operations headquarters as the environment gradually shifts from active workforce supervision to reflection, learning and systemic improvement. Behind her, large portfolio-management displays continue tracking agent performance, calibration health, operational capacity, risk exposure and workforce allocation. As Mara moves through the operations floor, these live operational views begin to consolidate into higher-level outcome perspectives. Individual agent fleets fade into the background while organizational learning, adaptation and long-term system performance move into focus. Along the way, transparent visualization walls show how the operating model evolved throughout the day. Feedback loops connect customer prevention outcomes, authority-request handling, adaptive execution traces, certified decision logic, embedded controls and workforce performance. The various operational domains encountered earlier in the journey appear as interconnected elements of a single learning system. Human experts are visible conducting end-of-day reviews, discussing exceptions, governance interventions and emerging patterns. Rather than measuring completed work, they evaluate how effectively the decision ecosystem learned from new situations and improved future performance. The atmosphere becomes quieter, more reflective and strategic. The focus is no longer on executing decisions but on understanding how the operating model continuously improves itself. The environment makes clear that operational excellence is no longer defined by throughput, but by adaptability, learning and system stewardship. The transition should communicate that all previous capabilities ultimately converge into one objective: managing an intelligent operating system that continuously evolves. Every prevention action, evidence package, decision trace, control mechanism and digital worker contributes to the collective learning of the organization. The camera movement should feel smooth, cinematic and continuous, bringing the visual journey toward a calm and thoughtful conclusion. The same AI-native banking operations headquarters remains recognizable while the perspective broadens from operational management to organizational evolution. Same AI-native banking operations headquarters in Frankfurt. Premium enterprise architecture. Open operations environment. Dark navy and Deloitte green palette. Human-centered future of work. Cinematic strategy-documentary style. Executive presentation quality. No clutter. The transition ends as Mara enters the Operations Reflection & Learning Hub, where the entire day is viewed as a connected system of decisions, outcomes, feedback loops and continuous learning.',
    bild: './images/operations/s9.jpg',
  },
  {
    id: 's10',
    klick: 10,
    zeit: '17:00',
    dimension: 'Recap',
    hypothese: 'Not one task today was case work.',
    statusQuo: 'Employees end the day having personally worked through cases, files, and approvals one by one.',
    future: 'Mara ends the day having certified logic, reviewed exceptions, and managed a portfolio of agents and people - **no case work at all**.',
    impact: '-',
    leitfrage: '-',
    punkte: [
      'She certified logic, judged exceptions and recalibrated agents.',
      'Customers were served, authorities answered, garnishments processed: none of it by her hand.',
      'The unit of management moved from the case to the decision system.',
    ],
    szene: 'Mara reviews the day. Customers were supported, authority requests answered, garnishments processed, recovery decisions controlled and agent performance recalibrated. Yet she did not personally process a single case. Her day was spent steering the decision system that processed them.',
    script: 'The biggest shift is not that work became faster. It is that the unit of management changed. Mara no longer manages tasks, queues or individual approvals. She manages goals, logic, exceptions and digital labor. Banking Operations has moved from case work to decision-system stewardship, and tomorrow the system will have learned from today\'s choices.',
    prompt: 'Inside the Operations Reflection & Learning Hub of the AI-native banking operations headquarters, Mara concludes her day by reviewing how the operating system performed across all major operational domains. A large executive timeline visualizes the day\'s outcomes: customer issues prevented before complaints emerged, authority requests resolved, adaptive garnishment decisions executed, governance logic certified, control effectiveness monitored and digital workforce performance recalibrated. The focus is not on completed tasks but on the behavior and evolution of the decision system itself. At the center of the scene, Mara stands before an integrated operations-learning display. Transparent visualizations show how the system adapted throughout the day, what exceptions occurred, how decisions were challenged, and where agents improved their behavior through feedback and supervision. The operating model appears less like a collection of departments and more like a living decision ecosystem. Around her, the office floor grows quieter as the workday ends. Yet the operational system remains active. Agent fleets continue learning, monitoring and optimizing in the background. The building itself appears unchanged, reinforcing the central theme of the journey: physical infrastructure stayed the same while the operating model fundamentally transformed. The environment feels reflective, strategic and slightly symbolic. It serves as the culmination of the entire journey, bringing together every previous operational capability into a single coherent view of how the bank now functions. The image should emphasize that Mara did not spend her day processing cases. She spent her day governing objectives, logic, exceptions and digital labor. Banking Operations has evolved from task execution to stewardship of an intelligent decision system. Part of the same AI-native banking operations headquarters in Frankfurt. Premium enterprise architecture. Open operations environment. Dark navy and Deloitte green palette. Human-centered future of work. Cinematic strategy-documentary style. Executive presentation quality. No clutter.',
    transition: 'OPTIONAL: Mara leaves the Operations Reflection & Learning Hub and walks toward the building exit as the workday comes to an end. The camera follows her through the AI-native banking operations headquarters for one final journey. She passes the same operational spaces she moved through earlier in the day: prevention intelligence, evidence operations, workforce orchestration, governance and assurance. The environments appear calmer now, yet large transparent displays reveal that operational activity continues uninterrupted. As Mara approaches the lobby, agent fleets remain active in the background. Operational health indicators continue updating, decision systems continue learning, monitoring remains active and continuous-improvement loops keep running without human intervention. The building itself feels unchanged, familiar and recognizable. Mara walks through the reception area, passes the access gates and exits the headquarters. The camera follows her outside and slowly pulls back to reveal the Frankfurt skyline at sunset. The same building seen at the beginning of the story stands before the viewer once again. Subtle digital intelligence flows remain visible behind parts of the glass facade, suggesting that the operating system inside continues working, learning and adapting even after employees leave for the day. The transition should feel reflective, cinematic and conclusive. It should communicate that the transformation was never about new buildings, new screens or new technology. It was about the operating model running beneath the surface. The camera movement should be smooth and emotionally resonant, creating a visual callback to the opening scene. What changed during the day is not the building. What changed is the viewer\'s understanding of what happens inside it. Same AI-native banking operations headquarters in Frankfurt. Premium enterprise architecture. Familiar banking tower. Sunset lighting across the Frankfurt skyline. Dark navy and Deloitte green accents. Human-centered future of work. Cinematic strategy-documentary style. Executive presentation quality. No clutter. Final frame: Mara disappears into the city while the bank\'s invisible digital nervous system continues operating inside the building. The outside world sees the same bank it has always seen. Inside, an entirely different operating model is at work.',
    bild: './images/operations/s10.jpg',
  },
]

/** Fassungen, die als Buehne laufen: Szene randlos, Aussage im Panel. */
export function istBuehne(variante: OpsVariante): boolean {
  return variante !== 'v01' && variante !== 'v02'
}

/**
 * v05: Szene und Wege durchgehend im Vollbild; die drei Belege liegen als
 * glaeserne Sprechblasen AUF dem Bild und zeigen auf ihre Stelle. Kein
 * Seitenpanel, kein Zoom — das Bild ist die Buehne, die Blasen erklaeren.
 */
export function istVollbild(variante: OpsVariante): boolean {
  return (
    variante === 'v05' || variante === 'v06' || variante === 'v07' || variante === 'v08'
  )
}

/**
 * Die Stationen einer Fassung — die Buehnen haben eine mehr.
 *
 * v08 ist dieselbe Strecke mit den Aenderungen aus dem Review vom 25.08.2026:
 * getauschte Texte, getauschte Reihenfolge von 11:15 und 14:00. Sie wird hier
 * ueber die v07-Stationen gelegt, damit v07 unveraendert daneben stehen bleibt.
 */
export function opsStationen(variante: OpsVariante): OpsStation[] {
  const liste = OPS_STATIONS.filter((s) => istBuehne(variante) || !s.nurV03)
  return variante === 'v08' ? liste.map(v08Station) : liste
}

/** Eine Station mit den v08-Aenderungen — unveraendert, wo es keine gibt. */
function v08Station(station: OpsStation): OpsStation {
  const aenderung = V08_TEXTE[station.id]
  const belege = v08Belege(station.id)
  if (!aenderung && !belege.length) return station
  const { personaText, personaKopfzeile, ...felder } = aenderung ?? {}
  return {
    ...station,
    ...felder,
    punkte: felder.punkte ?? (belege.length ? belege.map((b) => b.text) : station.punkte),
    persona:
      station.persona && (personaText || personaKopfzeile)
        ? {
            ...station.persona,
            text: personaText ?? station.persona.text,
            kopfzeile: personaKopfzeile ?? station.persona.kopfzeile,
          }
        : station.persona,
  }
}

/**
 * Bildpfad einer Station in der gewuenschten Fassung. v02 hat einen eigenen
 * Satz Szenenbilder — modernere Oberflaechen, offenere Raeume, um 08:05 die
 * Kundensicht —, damit man beide Fassungen nebeneinander zeigen kann. Die
 * Wohnung um 07:00 teilen sich beide.
 */
export function opsBild(station: OpsStation, variante: OpsVariante): string {
  if (variante === 'v01') return station.bild
  // v05 ist eine reine Darstellungsfassung auf den v04-Bildern. v06 hat einen
  // EIGENEN Bildsatz (Kopie der v04 mit vollbreitem Teamraum-Banner) und
  // eigene, neu gedrehte Wege.
  const ordner = variante === 'v05' ? 'v04' : variante
  return station.bild.replace('/images/operations/', `/images/operations-${ordner}/`)
}

/**
 * Bild des BILDSCHIRMS einer Station — dieselbe HTML-Oberflaeche, die auch in
 * die gruene Flaeche gestanzt wird, nur unbeschnitten und in voller Groesse.
 * In der Buehne steht sie nach dem Szenenwechsel links neben der Aussage: dort
 * geht es nicht mehr um den Raum, sondern um das, was auf dem Schirm steht.
 * Stationen ohne Bildschirm (Wohnung, Halle, Dachgarten) geben `null`.
 */
// 08:10 fehlt bewusst: dort zoomt die Buehne auf die KACHELN, nicht auf den
// Monitor — ein Monitor-Overlay laege mitten auf dem Kachelfeld.
const MIT_SCHIRM = new Set(['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9'])

export function opsSchirmBild(station: OpsStation, variante: OpsVariante): string | null {
  if (!MIT_SCHIRM.has(station.id)) return null
  return `./images/operations-${variante === 'v05' ? 'v04' : variante}/ui/${station.id}.jpg`
}

/** Alle Szenenbilder einer Fassung — fuer das Vorladen. */
export function opsBildSrcs(variante: OpsVariante): string[] {
  return OPS_STATIONS.map((s) => opsBild(s, variante))
}

/**
 * Fassung des Tools. `v01` ist die ausfuehrliche Variante mit Heute/2030,
 * Wirkung und Leitfrage. `v02` zeigt nur noch die 2030-Aussage, dafuer
 * deutlich groesser. `v03` geht einen Schritt weiter: die Szene fuellt das
 * ganze Bild, und sobald der Weg durch ist, steht rechts die Aussage mit drei
 * Punkten. `v04` ist dieselbe Buehne mit einem neuen Satz Raeume: moderne
 * Wohnung, Schranke mit Uhr-Check-in, Telefon als eigener Bildschirm. Alle
 * vier laufen parallel, damit man sie nebeneinander zeigen kann — v03 bleibt
 * unangetastet stehen.
 */
export type OpsVariante = 'v01' | 'v02' | 'v03' | 'v04' | 'v05' | 'v06' | 'v07' | 'v08'

/**
 * Die jeweils neueste Fassung. Wer ohne Versionsangabe einsteigt — etwa ueber
 * den Knopf auf der Startseite — landet hier, nicht mehr auf der aeltesten.
 *
 * BEI JEDER NEUEN FASSUNG MITZIEHEN. Das ist die einzige Stelle: der Knopf
 * auf der Startseite, der Fallback des Hash-Parsers und alles andere ohne
 * ausdrueckliche Version lesen sie von hier.
 */
export const OPS_NEUESTE: OpsVariante = 'v08'

/**
 * Deep-Link auf die Strecke erkennen. Die gueltige Adresse ist
 * `#/operations[/<klick>]` — ohne Versionsnummer. Die alten Kurzlinks
 * (`#/v01` … `#/v08`, `#/operations-v0x`) werden weiter erkannt, damit
 * geteilte Links nicht ins Leere laufen; die Strecke schreibt sie beim
 * ersten Rendern auf `#/operations/<klick>` um (OperationsTag).
 */
export function isOperationsHash(): boolean {
  if (typeof window === 'undefined') return false
  const raw = window.location.hash.replace(/^#/, '').toLowerCase()
  return raw.startsWith('/operations') || /^\/v0[1-8](\/|$)/.test(raw)
}

/**
 * Fassung der Strecke. Es gibt nur noch eine — die Vorfassungen v01 bis v07
 * sind samt Bildern und Wegen entfernt; jeder Link, auch ein alter mit
 * Versionsnummer, oeffnet sie.
 */
export function operationsVariante(): OpsVariante {
  return OPS_NEUESTE
}

/**
 * Station aus `#/operations/<klick>` — damit ein geteilter Link genau die
 * Szene öffnet, auf die er zeigt. Ohne Angabe beginnt der Tag am Anfang.
 */
export function operationsStartIndex(variante: OpsVariante = 'v01'): number {
  if (typeof window === 'undefined') return 0
  const teil = window.location.hash.replace(/^#/, '').split('/')[2]
  if (teil === undefined || teil === '') return 0
  const klick = Number.parseFloat(teil)
  if (!Number.isFinite(klick)) return 0
  const n = opsStationen(variante).findIndex((s) => s.klick === klick)
  return n < 0 ? 0 : n
}
