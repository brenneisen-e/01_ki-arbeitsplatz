import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, Sparkles, X, Send, Bot, User } from 'lucide-react';
import { useMode } from '../../hooks/useMode';
import useTranslation from '../../i18n/useTranslation';
import { KUNDEN_BY_MODE, TERMINE_BY_MODE, AUFGABEN_BY_MODE } from '../../data';
import { findeTopLead, neueLeads } from '../../utils/topLead';
import { VV_LEADS } from '../../data/vvExtended';
import { getLang, tx, invalidateLangCache } from '../../utils/langHelper';
import { MODE_CONFIGS } from '../../data/modeConfig';
import { getKundeFoto } from '../../utils/kundenFotos';
import { formatEur } from '../../utils/formatters';
import { interpolateDynamicDates } from '../../utils/dynamicDates';
import { neutral } from '../../utils/whitelabel';
import { NUR_WHITELABEL, whitelabelVariante } from '../../utils/einbettung';

// Einfarbige Lucide-Pfade als Inline-SVG für die HTML-Antworten – ersetzen die
// Unicode-Symbole (→ ↑ ↓) und erben die Textfarbe über currentColor.
const svgIcon = (paths, size = 13) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-2px;margin-right:3px">${paths}</svg>`;
const ARROW_SVG = svgIcon('<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>');
const ARROW_UP_SVG = svgIcon('<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>');
const ARROW_DOWN_SVG = svgIcon('<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>');
const BULB_SVG = svgIcon('<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>');
const CHECK_CIRCLE_SVG = svgIcon('<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>');

function getAdvisorSignature() {
  const customName = typeof window !== 'undefined' ? localStorage.getItem('kia_user_fullname') : null;
  let modeId = 'vermoegensverwaltung';
  let variant = null;
  try {
    const stored = localStorage.getItem('kia_last_mode');
    if (stored) {
      const parsed = JSON.parse(stored);
      modeId = parsed.modeId || modeId;
      variant = parsed.variant || null;
    }
  } catch {}
  // Eingebettet mit ?whitelabel unterschreibt immer die Whitelabel-Marke.
  if (NUR_WHITELABEL) variant = whitelabelVariante(modeId);
  const cfg = MODE_CONFIGS[modeId] || MODE_CONFIGS.vermoegensverwaltung;
  const name = customName || cfg.beraterName;
  const title = variant?.beraterTitel || cfg.beraterTitel;
  const institut = variant?.institut || cfg.institut;
  return { name, title, institut };
}

function getWelcomeMessage(modeId, t) {
  const keys = {
    versicherung: 'welcomeVersicherung',
    banking: 'welcomeBanking',
    vermoegensverwaltung: 'welcomeVermoegensverwaltung',
  };
  return t(keys[modeId] || keys.versicherung);
}

function getQuickActions(modeId, t) {
  const actions = {
    versicherung: [t('neueLeadsAnzeigen'), t('kundenpotenzialAnalysieren'), t('gespraechsleitfadenErstellen'), t('crossSellingChancen')],
    banking: [t('qaWasStehtHeuteAn'), t('qaMeineNeuenLeads'), t('qaAuslaufendeKredite6Monate')],
    vermoegensverwaltung: [t('neueLeadsAnzeigen'), t('mandantenpotenzialAnalysieren'), t('gespraechsleitfadenErstellen'), t('portfolioAnalyse')],
  };
  return actions[modeId] || actions.versicherung;
}

// Extended suggestion catalogue for the Banking chatbot. Grouped by capability
// so the advisor can discover what the assistant can do with FIDA context.
const BANKING_SUGGESTIONS = [
  {
    category: tx('Tagesplanung', 'Daily Planning'),
    prompts: [
      tx('Was steht heute an?', "What's on today?"),
      tx('Meine neuen Leads', 'My new leads'),
      tx('Priorisiere meine offenen Leads nach Ertragspotenzial', 'Prioritize my open leads by revenue potential'),
      tx('Welche FIDA-Consents fehlen mir noch?', 'Which FIDA consents am I still missing?'),
    ],
  },
  {
    category: tx('Gesprächsvorbereitung', 'Meeting Preparation'),
    prompts: [
      tx('Bereite mir ein Erstgespräch mit Markus Wagner vor', 'Prepare an initial meeting with Markus Wagner for me'),
      tx('Was sollte ich bei Sandra Müller ansprechen?', 'What should I bring up with Sandra Müller?'),
      tx('Gib mir Argumente für den Depot-Wechsel zu uns', 'Give me arguments for switching the securities account to us'),
    ],
  },
  {
    category: tx('Analyse on-the-fly', 'Analysis On-the-Fly'),
    prompts: [
      tx('Welche Kunden haben auslaufende Kredite in den nächsten 6 Monaten?', 'Which customers have loans expiring in the next 6 months?'),
      tx('Wer von meinen Kunden hat Fremdbank-Depots über 20.000€?', 'Which of my customers have third-party bank securities accounts above €20,000?'),
      tx('Zeig mir alle Kunden ohne BU-Versicherung unter 40', 'Show me all customers without disability insurance under 40'),
      tx('Welche Kunden passen zur neuen Baufi-Aktion?', 'Which customers fit the new mortgage campaign?'),
    ],
  },
  {
    category: tx('Formulierungshilfe', 'Drafting Assistance'),
    prompts: [
      tx('Schreib ein Anschreiben zum Kreditgespräch Immobilienfinanzierung für Klaus Fischer', 'Write a letter about the mortgage financing meeting for Klaus Fischer'),
      tx('Formuliere eine Nachfass-Mail für die Depot-Wechsel-Prämie an Peter Hoffmann', 'Draft a follow-up email about the account transfer bonus for Peter Hoffmann'),
      tx('Erstelle einen Gesprächsleitfaden Tierhalterhaftpflicht', 'Create a conversation guide for pet owner liability insurance'),
    ],
  },
  {
    category: tx('Rechenbeispiele', 'Calculation Examples'),
    prompts: [
      tx('Rechne mir eine Baufinanzierung für Wagner – 42k Eigenkapital, 840€ Rate', 'Calculate a mortgage for Wagner – €42k equity, €840 installment'),
      tx('Was spart Fischer beim Trade-Republic-Wechsel zu uns?', 'What does Fischer save by switching from Trade Republic to us?'),
      tx('Wie viel Risikoleben braucht ein 34-Jähriger mit Neugeborenem bei 3.200€ Netto?', 'How much term life cover does a 34-year-old with a newborn and €3,200 net income need?'),
    ],
  },
];

// Detail-view quick actions that change based on customer context
function getDetailQuickActions(modeId, kunde, t) {
  if (modeId === 'vermoegensverwaltung' && kunde) {
    const leads = VV_LEADS.filter(l => l.referenzMandant === kunde.id);
    const hasLeads = leads.length > 0;
    const actions = [t('anschreibenFormulieren'), t('gespraechsleitfadenErstellen')];
    if (hasLeads) actions.push(t('leadsAnalysieren'));
    actions.push(t('portfolioAnalyse'));
    return actions;
  }
  if (modeId === 'banking') {
    return [t('anschreibenFormulieren'), t('gespraechsleitfadenErstellen'), t('kreditanalyseStarten'), t('crossSellingChancen')];
  }
  return [t('anschreibenFormulieren'), t('gespraechsleitfadenErstellen'), t('kundenpotenzialAnalysieren'), t('crossSellingChancen')];
}

function getAnschreibenLeadOptions(kundeId) {
  return VV_LEADS.filter(l => l.referenzMandant === kundeId);
}

function generateAnschreibenResponse(lead, kunde) {
  const isEn = getLang() === 'en';
  const name = kunde?.name || tx('Mandant', 'Client');
  const firstName = name.split(/\s+/).filter(w => !/^(Dr\.|Prof\.|Fam\.)$/i.test(w))[0] || tx('Herr/Frau', 'Mr./Ms.');
  const anrede = isEn
    ? (name.includes('Dr.') ? `Dear Mr. ${name.replace('Dr. ', '')}` : `Dear ${name}`)
    : (name.includes('Dr.') ? `Sehr geehrter Herr ${name.replace('Dr. ', '')}` : `Sehr geehrter ${name}`);
  const advisor = getAdvisorSignature();
  const dateLocale = isEn ? 'en-US' : 'de-DE';
  const today = new Date().toLocaleDateString(dateLocale, { day: '2-digit', month: '2-digit', year: 'numeric' });

  let thema = lead.name;
  let bezug = '';
  let whitepaper = '';

  if (lead.id === 'BM016') {
    thema = 'Defense & Aerospace Investments';
    bezug = isEn
      ? 'your interest in the topic of defense investments, which we have noted across several touchpoints'
      : 'Ihr Interesse am Thema Defense-Investments, das wir in mehreren Kontaktpunkten registriert haben';
    whitepaper = 'European Defense Stocks: Due Diligence Report 2026';
  } else if (lead.quelle === 'fremdbank') {
    thema = isEn ? 'Consolidation of Your Assets' : 'Konsolidierung Ihrer Vermögenswerte';
    bezug = isEn
      ? `the optimization opportunities regarding your ${lead.name}`
      : `die Optimierungsmöglichkeiten bei Ihrem ${lead.name}`;
  } else if (lead.quelle === 'liquiditaet') {
    thema = isEn ? 'Reinvestment Strategy' : 'Wiederanlage-Strategie';
    bezug = isEn
      ? `the upcoming maturity and liquidity related to ${lead.name}`
      : `die bevorstehende Fälligkeit bzw. Liquidität im Rahmen von ${lead.name}`;
  } else if (lead.quelle === 'lifeevent') {
    thema = isEn ? 'Succession Planning' : 'Nachfolgeplanung';
    bezug = isEn
      ? `your strategic planning in the area of ${lead.name}`
      : `Ihre strategische Planung im Bereich ${lead.name}`;
  } else {
    bezug = isEn ? `the topic of ${lead.name}` : `das Thema ${lead.name}`;
  }

  const wpRef = whitepaper
    ? (isEn
      ? `\n\nAs a basis for our discussion, I would like to bring you our latest whitepaper "${whitepaper}", which we published two days ago. It contains a thorough analysis of current investment opportunities and regulatory frameworks.`
      : `\n\nAls Gesprächsgrundlage möchte ich Ihnen gerne unser aktuelles Whitepaper „${whitepaper}" mitbringen, das wir vor zwei Tagen veröffentlicht haben. Es enthält eine fundierte Analyse der aktuellen Investmentchancen und regulatorischen Rahmenbedingungen.`)
    : '';

  const brief = isEn
    ? `${anrede},

I hope this message finds you well. I am writing to you regarding ${bezug}.

I would be delighted to discuss the opportunities and potential that arise for your portfolio in a personal meeting.${wpRef}

May I suggest an appointment within the next two weeks? I am flexible with timing and happy to accommodate your schedule.

Kind regards,
${advisor.name}
${advisor.title} | ${advisor.institut}`
    : `${anrede},

ich hoffe, es geht Ihnen gut. Ich schreibe Ihnen bezüglich ${bezug}.

Gerne würde ich mit Ihnen in einem persönlichen Gespräch die Möglichkeiten und Potenziale besprechen, die sich für Ihr Portfolio ergeben.${wpRef}

Darf ich Ihnen einen Termin in den kommenden zwei Wochen vorschlagen? Ich bin zeitlich flexibel und richte mich gerne nach Ihrem Kalender.

Mit freundlichen Grüßen
${advisor.name}
${advisor.title} | ${advisor.institut}`;

  const emailSubject = isEn
    ? `Invitation: Personal Meeting on ${thema}`
    : `Einladung: Persönliches Gespräch zu ${thema}`;

  const docxSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:4px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`;
  const emailSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:4px"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;

  // Encode the brief text and email subject as base64 to safely embed in data attributes
  const briefBase64 = btoa(unescape(encodeURIComponent(brief)));
  const subjectBase64 = btoa(unescape(encodeURIComponent(emailSubject)));

  return `<div class="space-y-3">
    <p class="font-semibold">${tx('Anschreiben generiert für:', 'Letter generated for:')} ${lead.name}</p>

    <div class="bg-(--bg-card) border border-(--border-light) rounded-lg p-3 text-xs space-y-1">
      <div class="flex items-center gap-2 mb-2">
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-(--mode-pastel) text-(--mode-primary) text-[10px] font-medium">
          ${docxSvg} ${tx('DOCX Anschreiben', 'DOCX Letter')}
        </span>
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-(--mode-pastel) text-(--mode-primary) text-[10px] font-medium">
          ${emailSvg} ${tx('EML E-Mail', 'EML Email')}
        </span>
      </div>
      <div class="bg-(--bg-inset) rounded p-2.5 text-[11px] leading-relaxed whitespace-pre-line font-mono">${brief}</div>
    </div>

    <div class="bg-(--bg-inset) border border-(--border-light) rounded-lg p-2 text-xs text-(--text-primary)">
      <strong>${tx('Betreff (E-Mail):', 'Subject (Email):')} </strong> ${emailSubject}
    </div>

    <div class="flex gap-2 mt-2">
      <button data-action="download-docx" data-brief="${briefBase64}" class="inline-flex items-center px-3 py-1.5 bg-(--mode-primary) text-white rounded-lg text-xs font-medium hover:bg-(--mode-primary-light) transition-colors">${docxSvg} ${tx('Als DOCX herunterladen', 'Download as DOCX')}</button>
      <button data-action="open-email" data-brief="${briefBase64}" data-subject="${subjectBase64}" class="inline-flex items-center px-3 py-1.5 surface-inset text-(--text-primary) rounded-lg text-xs font-medium hover:border-(--mode-accent) transition-colors">${emailSvg} ${tx('Als E-Mail öffnen', 'Open as Email')}</button>
    </div>
  </div>`;
}

function getCockpitQuickActions(t) {
  return [t('top5NachErgebnis'), t('performanceUeberblick'), t('auffaelligeVermittler')];
}

function getCockpitDemoResponse(message) {
  const lower = message.toLowerCase();

  if ((lower.includes('top') && lower.includes('ergebnis')) || (lower.includes('top') && lower.includes('result'))) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">${tx('Top 5 Vermittler nach Ergebnis:', 'Top 5 Agents by Result:')}</p>
        <ol class="list-decimal pl-4 space-y-1 text-[13px]">
          <li><strong>Maria Musterfrau</strong> · €890k</li>
          <li><strong>Thomas Weber</strong> · €820k</li>
          <li><strong>Sabine Danzig</strong> · €780k</li>
          <li><strong>Klaus Richter</strong> · €750k</li>
          <li><strong>Petra Hoffmann</strong> · €720k</li>
        </ol>
        <p class="text-xs text-slate-500 mt-2">${ARROW_SVG} <em>${tx('Die Tabelle zeigt jetzt die Top 5 Vermittler.', 'The table now shows the top 5 agents.')}</em></p>
      </div>`,
      cockpitAction: { view: 'table', tableView: 'agenturen' },
    };
  }

  if (lower.includes('top') && lower.includes('neugeschäft')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">${tx('Top 5 Vermittler nach Neugeschäft:', 'Top 5 Agents by New Business:')}</p>
        <ol class="list-decimal pl-4 space-y-1 text-[13px]">
          <li><strong>Maria Musterfrau</strong> · €890k</li>
          <li><strong>Thomas Weber</strong> · €820k</li>
          <li><strong>Sabine Danzig</strong> · €780k</li>
          <li><strong>Klaus Richter</strong> · €750k</li>
          <li><strong>Petra Hoffmann</strong> · €720k</li>
        </ol>
        <p class="text-xs text-slate-500 mt-2">${ARROW_SVG} <em>${tx('Die Tabelle zeigt jetzt die Top 5 Vermittler.', 'The table now shows the top 5 agents.')}</em></p>
      </div>`,
      cockpitAction: { view: 'table', tableView: 'agenturen' },
    };
  }

  if (lower.includes('performance') || lower.includes('gesamt') || lower.includes('overview')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">${tx('Gesamt-Performance Überblick:', 'Overall Performance Overview:')}</p>
        <table class="w-full text-xs mt-1 border-collapse">
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">${tx('Neugeschäft YTD', 'New Business YTD')}</td><td class="py-1.5 font-medium font-mono">€38,1 ${tx('Mio', 'M')}</td></tr>
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">${tx('Bestand', 'Portfolio')}</td><td class="py-1.5 font-medium font-mono">€141,9 ${tx('Mrd', 'B')}</td></tr>
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">${tx('Stornoquote', 'Cancellation Rate')}</td><td class="py-1.5 font-medium"><span class="text-emerald-600">4,9%</span> (${tx('Ziel', 'Target')}: &lt;5,0%)</td></tr>
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">NPS Score</td><td class="py-1.5 font-medium">48 <span class="text-emerald-600">(+6 YoY)</span></td></tr>
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">Combined Ratio</td><td class="py-1.5 font-medium">91,0%</td></tr>
          <tr><td class="py-1.5 text-slate-500">${tx('Gesamtergebnis', 'Total Result')}</td><td class="py-1.5 font-medium font-mono text-emerald-600">€1,9 ${tx('Mio', 'M')}</td></tr>
        </table>
        <p class="text-xs text-slate-500 mt-2">${ARROW_SVG} <em>${tx('Positive Entwicklung über alle KPIs.', 'Positive trend across all KPIs.')}</em></p>
      </div>`,
    };
  }

  if (lower.includes('auffällig') || lower.includes('auffallig') || lower.includes('ungewöhnlich') || lower.includes('anomalie') || lower.includes('notable agents') || lower.includes('anomal')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">${tx('Auffällige Vermittler (Anomalie-Erkennung):', 'Notable Agents (Anomaly Detection):')}</p>
        <p class="text-[13px]">${tx('4 Vermittler mit auffälligen Werten identifiziert:', '4 agents with notable values identified:')}</p>
        <div class="space-y-1.5 mt-2">
          <div class="flex items-center gap-2 text-[13px]"><span class="w-2 h-2 rounded-full bg-red-500"></span><strong>2×</strong> ${tx('Hohe Stornoquote', 'High Cancellation Rate')} (&gt;15%)</div>
          <div class="flex items-center gap-2 text-[13px]"><span class="w-2 h-2 rounded-full bg-amber-500"></span><strong>1×</strong> ${tx('Niedriger NPS Score', 'Low NPS Score')} (&lt;30)</div>
          <div class="flex items-center gap-2 text-[13px]"><span class="w-2 h-2 rounded-full bg-orange-500"></span><strong>1×</strong> ${tx('Bestandsrückgang', 'Portfolio Decline')} (&gt;10% YoY)</div>
        </div>
        <p class="text-xs text-slate-500 mt-2">${ARROW_SVG} <em>${tx('Die KI-Analyse-Spalte zeigt Ursachen und Handlungsempfehlungen.', 'The AI analysis column shows causes and recommended actions.')}</em></p>
      </div>`,
      cockpitAction: { view: 'table', tableView: 'agenturen' },
    };
  }

  if (lower.includes('bundesland') || lower.includes('bundesländ')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">${tx('Bundesland-Ranking nach Performance:', 'Federal State Ranking by Performance:')}</p>
        <ol class="list-decimal pl-4 space-y-1 text-[13px]">
          <li><strong>Bayern</strong> · Score: 87 · ${tx('NG', 'NB')}: €5,8 ${tx('Mio', 'M')} · ${tx('Storno', 'Canc.')}: 4,8%</li>
          <li><strong>Baden-Württemberg</strong> · Score: 84 · ${tx('NG', 'NB')}: €5,2 ${tx('Mio', 'M')} · ${tx('Storno', 'Canc.')}: 4,9%</li>
          <li><strong>NRW</strong> · Score: 81 · ${tx('NG', 'NB')}: €6,1 ${tx('Mio', 'M')} · ${tx('Storno', 'Canc.')}: 5,2%</li>
          <li><strong>Hessen</strong> · Score: 78 · ${tx('NG', 'NB')}: €4,2 ${tx('Mio', 'M')} · ${tx('Storno', 'Canc.')}: 5,0%</li>
          <li><strong>Hamburg</strong> · Score: 75 · ${tx('NG', 'NB')}: €3,8 ${tx('Mio', 'M')} · ${tx('Storno', 'Canc.')}: 4,5%</li>
        </ol>
        <p class="text-xs text-slate-500 mt-2">${ARROW_SVG} <em>${tx('Performance-Score = gewichteter Mix aus NG, Storno, NPS', 'Performance score = weighted mix of NB, cancellations, NPS')}</em></p>
      </div>`,
      cockpitAction: { view: 'table', tableView: 'bundeslaender' },
    };
  }

  if (lower.includes('storno') && lower.includes('segment')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">${tx('Stornoquoten nach Segment:', 'Cancellation Rates by Segment:')}</p>
        <table class="w-full text-xs mt-1 border-collapse">
          <tr class="border-b border-slate-200"><td class="py-1 font-medium">${tx('Leben', 'Life')}</td><td class="py-1 font-mono">5,8%</td><td class="py-1 text-emerald-600">-0,3%</td></tr>
          <tr class="border-b border-slate-200"><td class="py-1 font-medium">${tx('Kranken', 'Health')}</td><td class="py-1 font-mono">4,2%</td><td class="py-1 text-emerald-600">-0,5%</td></tr>
          <tr class="border-b border-slate-200"><td class="py-1 font-medium">${tx('Schaden', 'Property & Casualty')}</td><td class="py-1 font-mono">8,5%</td><td class="py-1 text-red-500">+0,2%</td></tr>
          <tr><td class="py-1 font-medium">${tx('Kfz', 'Auto')}</td><td class="py-1 font-mono">12,1%</td><td class="py-1 text-emerald-600">-0,8%</td></tr>
        </table>
        <p class="text-xs text-slate-500 mt-2">${ARROW_SVG} <em>${tx('Gesamt: 8,2% (Ziel: <8,0%)', 'Total: 8.2% (Target: <8.0%)')}</em></p>
      </div>`,
    };
  }

  if (lower.includes('nps')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">${tx('NPS Score Entwicklung:', 'NPS Score Trend:')}</p>
        <table class="w-full text-xs mt-1 border-collapse">
          <tr class="border-b border-slate-200"><td class="py-1 text-slate-500">${tx('Jan', 'Jan')} 2024</td><td class="py-1 font-mono">38</td></tr>
          <tr class="border-b border-slate-200"><td class="py-1 text-slate-500">${tx('Apr', 'Apr')} 2024</td><td class="py-1 font-mono">40</td></tr>
          <tr class="border-b border-slate-200"><td class="py-1 text-slate-500">${tx('Jul', 'Jul')} 2024</td><td class="py-1 font-mono">41</td></tr>
          <tr class="border-b border-slate-200"><td class="py-1 text-slate-500">${tx('Okt', 'Oct')} 2024</td><td class="py-1 font-mono">42</td></tr>
          <tr><td class="py-1 text-slate-500">${tx('Jan', 'Jan')} 2025</td><td class="py-1 font-mono font-semibold text-emerald-600">48</td></tr>
        </table>
        <p class="text-xs text-slate-500 mt-2">${ARROW_SVG} <em>${tx('Trend: +10 Punkte YoY (+26%). Kranken zeigt stärkste Verbesserung.', 'Trend: +10 points YoY (+26%). Health shows strongest improvement.')}</em></p>
      </div>`,
    };
  }

  // Cockpit fallback
  return {
    content: `<div class="space-y-2">
      <p>${tx('Ich habe die Dashboard-Daten analysiert.', 'I have analyzed the dashboard data.')}</p>
      <p><strong>${tx('Verfügbare Abfragen:', 'Available queries:')}</strong></p>
      <ul class="list-disc pl-4 space-y-1 text-[13px]">
        <li>${tx('Top 5 Vermittler nach Neugeschäft', 'Top 5 Agents by New Business')}</li>
        <li>${tx('Bundesland Performance Ranking', 'Federal State Performance Ranking')}</li>
        <li>${tx('NPS Score Entwicklung', 'NPS Score Trend')}</li>
        <li>${tx('Stornoquoten nach Segment', 'Cancellation Rates by Segment')}</li>
        <li>${tx('Auffällige Vermittler', 'Notable Agents')}</li>
      </ul>
    </div>`,
  };
}

// „Meine neuen Leads": erste Nachricht mit der Zahl der identifizierten
// Potenziale und einem Sprung zur Lead-Ansicht, zweite Nachricht (nach kurzem
// Denken) der wichtigste neue Lead als Karte mit Foto, Titel, Volumen und
// KI-Kurzfassung; „Kunden öffnen" führt in die Akte, Reiter Stammdaten.
function buildNeueLeadsAntwort(modeId, currentView, ctx = {}) {
  // Wichtigster Lead nach derselben Regel wie das Badge „Top-Lead“ im Reiter
  // Leads der Kundenakte (src/utils/topLead.js).
  const identifiziert = neueLeads(modeId);
  const top = findeTopLead(modeId);
  const n = identifiziert.length;
  const leadsTab = currentView === 'detail' ? 'impulse' : 'potentiale';
  const linkLeads = `<button type="button" data-action="open-tab" data-tab="${leadsTab}" class="font-semibold text-(--mode-primary) underline decoration-2 decoration-(--mode-accent) underline-offset-2 hover:text-(--mode-primary-light)">${tx('Leads', 'Leads')}</button>`;
  const content = `<div class="space-y-1.5">
      <p class="font-semibold">${tx('Deine neuen Leads', 'Your new leads')}</p>
      <p>${tx(
        `Du hast insgesamt <strong>${n} neue Leads</strong> aus dem letzten Agentenlauf. Alle findest du unter ${linkLeads}.`,
        `You have <strong>${n} new leads</strong> in total from the latest agent run. You can find all of them under ${linkLeads}.`,
      )}</p>
    </div>`;
  if (!top) return { content };

  const foto = getKundeFoto(top.kundeId);
  const initialen = (top.kundeName || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const heute = new Date().toLocaleDateString(getLang() === 'en' ? 'en-GB' : 'de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const volumen = top.volumen ? `${formatEur(top.volumen)}${top.volumenTyp === 'jaehrlich' ? tx('/J.', '/yr') : ''}` : '';
  const beschreibung = interpolateDynamicDates(top.beschreibung || '', ctx);
  const avatar = foto
    ? `<img src="${foto}" alt="" class="w-12 h-12 rounded-full object-cover shrink-0" style="box-shadow: 0 0 0 2px var(--bg-card)">`
    : `<span class="w-12 h-12 rounded-full bg-(--mode-primary) text-white flex items-center justify-center font-semibold shrink-0">${initialen}</span>`;
  // Einordnung vor der Karte: warum gerade dieser Lead, und dass er neu ist.
  const QUELLEN_LABEL = {
    finanztransaktion: tx('Kontoumsätze', 'account data'), bestand: tx('Bestand', 'holdings'),
    kommunikation: tx('Kommunikation', 'communication'), lebensereignis: tx('Lebensereignis', 'life event'),
    wettbewerb: tx('Wettbewerb', 'competition'), direktvertrieb: tx('Direktvertrieb', 'direct channel'), markt: tx('Markt', 'market'),
  };
  const ZAHLWORT = getLang() === 'en' ? ['', 'one', 'two', 'three', 'four', 'five'] : ['', 'ein', 'zwei', 'drei', 'vier', 'fünf'];
  const quellen = (top.quellen || []).map(q => QUELLEN_LABEL[q] || q);
  const anzahl = quellen.length;
  const quellenText = quellen.length > 1 ? `${quellen.slice(0, -1).join(', ')} ${tx('und', 'and')} ${quellen[quellen.length - 1]}` : quellen[0] || '';
  const einordnung = anzahl > 1
    ? tx(
        `Neuer Top-Lead: <strong>${top.kundeName}</strong>. Gleich ${ZAHLWORT[anzahl] || anzahl} unabhängige Signale, ${quellenText}, sprechen für „${top.titel}“${volumen ? ` mit einem Volumen von ${volumen}` : ''}. Hier die Zusammenfassung:`,
        `New top lead: <strong>${top.kundeName}</strong>. ${ZAHLWORT[anzahl] || anzahl} independent signals, ${quellenText}, point to "${top.titel}"${volumen ? ` with a volume of ${volumen}` : ''}. Here is the summary:`,
      )
    : tx(
        `Neuer Top-Lead: <strong>${top.kundeName}</strong> mit „${top.titel}“${volumen ? ` (${volumen})` : ''}. Hier die Zusammenfassung:`,
        `New top lead: <strong>${top.kundeName}</strong> with "${top.titel}"${volumen ? ` (${volumen})` : ''}. Here is the summary:`,
      );
  const karte = `<p class="mb-3 leading-snug">${einordnung}</p>
    <div class="flex gap-3 items-start">
      ${avatar}
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2 flex-wrap">
          <strong>${top.kundeName}</strong>
          <span class="rh-badge inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-(--color-success) text-white">${tx('Neu', 'New')} · ${heute}</span>
        </div>
        <div class="text-[13px] font-semibold mt-0.5">${top.titel}${volumen ? ` · <span class="font-mono">${volumen}</span>` : ''}</div>
        <p class="text-[13px] mt-1 leading-snug text-(--text-secondary)"><span class="font-semibold text-(--text-primary)">${tx('KI-Zusammenfassung', 'AI summary')}:</span> ${beschreibung}</p>
        <button type="button" data-action="open-kunde" data-kunde-id="${top.kundeId}" data-tab="stammdaten" class="group mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-(--mode-primary) text-white text-xs font-semibold cursor-pointer transition-all hover:bg-(--mode-primary-light) hover:shadow-lg hover:-translate-y-0.5 hover:ring-2 hover:ring-(--mode-accent)">${tx('Kunden öffnen', 'Open customer')} <span class="inline-flex transition-transform group-hover:translate-x-0.5">${ARROW_SVG}</span></button>
      </div>
    </div>`;
  return { content, followUp: { content: karte, delay: 1100 } };
}

export function getDemoResponse(message, { currentView, modeId, ctx = {} }) {
  const lower = message.toLowerCase();

  if (lower.includes('vertriebspotentiale') || lower.includes('vertriebspotenziale') || lower.includes('neue leads') || lower.includes('neuen leads') || lower.includes('meine leads') || lower.includes('leads anzeigen') || lower.includes('show leads') || lower.includes('analyze leads') || lower.includes('new leads') || lower.includes('my leads')) {
    if (modeId === 'vermoegensverwaltung') {
      return {
        content: `<div class="space-y-3">
          <p class="font-semibold">${tx('Aktuelle Leads', 'Current Leads')}</p>
          <p>${tx('Ich habe <strong>12 aktive Leads</strong> in deiner Pipeline identifiziert:', 'I have identified <strong>12 active leads</strong> in your pipeline:')}</p>
          <p class="text-xs font-semibold text-slate-600 mt-1">${tx('Neue Mandate (6):', 'New Mandates (6):')} </p>
          <ol class="list-decimal pl-4 space-y-1">
            <li><strong>Dr. Katharina Bauer</strong>: ${tx('Empfehlung Prof. Hartmann, 3,5M, Termin steht', 'Referral Prof. Hartmann, 3.5M, appointment scheduled')}</li>
            <li><strong>Charlotte Keller</strong>: ${tx('NextGen, Anwältin, 800k Eigenvermögen', 'NextGen, lawyer, 800k own assets')}</li>
            <li><strong>Dipl.-Ing. Stefan Müller</strong>: ${tx('Presse/Firmenverkauf, 6M Erlös', 'Press/company sale, 6M proceeds')}</li>
          </ol>
          <p class="text-xs font-semibold text-slate-600 mt-1">${tx('Bestandsmandate (6):', 'Existing Mandates (6):')} </p>
          <ol class="list-decimal pl-4 space-y-1">
            <li><strong>Lindenberg Cash 5,5M</strong>: ${tx('Fremdbank-Konsolidierung, kritisch', 'Third-party bank consolidation, critical')}</li>
            <li><strong>Hartmann PE +300k</strong>: ${tx('Mandats-Erweiterung, Angebot läuft', 'Mandate expansion, offer pending')}</li>
            <li><strong>Weber Sparkasse 500k</strong>: ${tx('Festgeld-Fälligkeit 2027', 'Fixed deposit maturity 2027')}</li>
          </ol>
          <p class="text-xs text-slate-500 mt-2">${ARROW_SVG} ${tx('Wechsel zum Tab <em>Leads</em> für Details...', 'Switch to the <em>Leads</em> tab for details...')}</p>
        </div>`,
        navigateTo: currentView === 'detail' ? 'impulse' : 'pipeline',
      };
    }
    // Banking und Versicherung: echte Potenziale aus derselben Quelle wie der
    // Potenziale-Tab (CLAUDE.md: keine hardcodierten Namen). Zwei Nachrichten:
    // erst die Zahl mit Sprung zu „Leads", dann der wichtigste Lead als Karte.
    return buildNeueLeadsAntwort(modeId, currentView, ctx);
  }

  if (lower.includes('bu') || lower.includes('berufsunfähigkeit') || lower.includes('disability insurance')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">${tx('BU-Analyse', 'Disability Insurance Analysis')}</p>
        <p>${tx(
          'Der Kunde weist aufgrund seines Berufsbilds <strong>(kaufm. Angestellter, 38 J.)</strong> ein moderates Risikoprofil auf.',
          'Based on the occupational profile <strong>(commercial employee, age 38)</strong>, the customer has a moderate risk profile.'
        )}</p>
        <table class="w-full text-xs mt-2 border-collapse">
          <tr class="border-b border-slate-200"><td class="py-1 text-slate-500">${tx('Empfehlung', 'Recommendation')}</td><td class="py-1 font-medium">${tx('BU-Rente min. 1.800 €/mtl.', 'DI pension min. €1,800/mo.')}</td></tr>
          <tr class="border-b border-slate-200"><td class="py-1 text-slate-500">${tx('Absicherungslücke', 'Coverage Gap')}</td><td class="py-1 font-medium text-red-600">${tx('ca. 1.200 €/Monat', 'approx. €1,200/month')}</td></tr>
          <tr><td class="py-1 text-slate-500">${tx('Extras', 'Extras')}</td><td class="py-1 font-medium">${tx('Nachversicherungsgarantie empfohlen', 'Subsequent insurance guarantee recommended')}</td></tr>
        </table>
      </div>`,
    };
  }

  if (lower.includes('cross-selling') || lower.includes('cross selling') || lower.includes('cross-sell')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">${tx('Cross-Selling Chancen', 'Cross-Selling Opportunities')}</p>
        <p>${tx('Basierend auf dem aktuellen Vertragsbestand:', 'Based on the current contract portfolio:')}</p>
        <div class="space-y-2 mt-2">
          <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-emerald-500"></span><strong>${tx('bAV', 'Company Pension')}</strong>: ${tx('AG-Zuschuss nicht ausgeschöpft', 'Employer subsidy not fully utilized')} <span class="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">${tx('85% Potenzial', '85% Potential')}</span></div>
          <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-amber-500"></span><strong>${tx('Rechtsschutz', 'Legal Protection')}</strong>: ${tx('Kein bestehender Vertrag', 'No existing contract')} <span class="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">${tx('70% Potenzial', '70% Potential')}</span></div>
          <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-blue-500"></span><strong>${tx('Unfallversicherung', 'Accident Insurance')}</strong>: ${tx('Nur Grundschutz', 'Basic coverage only')} <span class="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">${tx('55% Potenzial', '55% Potential')}</span></div>
        </div>
      </div>`,
    };
  }

  if (lower.includes('kundenpotenzial') || lower.includes('potenzial') || lower.includes('analysieren') || lower.includes('customer potential') || lower.includes('client potential') || lower.includes('mandant potential')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">${tx('Kundenpotenzial-Analyse', 'Customer Potential Analysis')}</p>
        <table class="w-full text-xs mt-1 border-collapse">
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">${tx('Absicherungsgrad', 'Coverage Level')}</td><td class="py-1.5 font-medium">62% <span class="text-amber-600">${tx('(Lücken bei AK & AV)', '(gaps in accident & pension insurance)')}</span></td></tr>
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">${tx('Lebenssituation', 'Life Situation')}</td><td class="py-1.5 font-medium">${tx(`Familiengründung vor 2 J. ${ARROW_SVG} RL + Kinderabsicherung`, `Family founded 2 yrs ago ${ARROW_SVG} term life + child coverage`)}</td></tr>
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">${tx('Einkommen', 'Income')}</td><td class="py-1.5 font-medium text-emerald-600">${tx(`Überdurchschnittlich ${ARROW_SVG} Kapitalanlage-Potenzial`, `Above average ${ARROW_SVG} investment potential`)}</td></tr>
          <tr><td class="py-1.5 text-slate-500">${tx('Nächster Impuls', 'Next Action')}</td><td class="py-1.5 font-medium">${tx('Jahresgespräch in 3 Wochen terminieren', 'Schedule annual review in 3 weeks')}</td></tr>
        </table>
      </div>`,
    };
  }

  if (lower.includes('gesprächsleitfaden') || lower.includes('gespräch') || lower.includes('leitfaden') || lower.includes('conversation guide')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">${tx('Gesprächsleitfaden', 'Conversation Guide')}</p>
        <ol class="list-decimal pl-4 space-y-1.5 text-[13px]">
          <li><strong>${tx('Einstieg', 'Opening')}</strong>: ${tx('Bezug auf letztes Gespräch, aktuelle Lebenssituation erfragen', 'Reference last conversation, ask about current life situation')}</li>
          <li><strong>${tx('Bedarfsanalyse', 'Needs Analysis')}</strong>: ${tx('Veränderungen seit letztem Kontakt? Neue Wünsche/Sorgen?', 'Changes since last contact? New wishes/concerns?')}</li>
          <li><strong>${tx('Absicherungscheck', 'Coverage Check')}</strong>: ${tx('Bestehende Verträge gemeinsam durchgehen, Lücken aufzeigen', 'Review existing contracts together, identify gaps')}</li>
          <li><strong>${tx('Empfehlung', 'Recommendation')}</strong>: ${tx('Max. 2 konkrete Produktvorschläge unterbreiten', 'Present max. 2 concrete product suggestions')}</li>
          <li><strong>${tx('Abschluss', 'Closing')}</strong>: ${tx('Nächste Schritte vereinbaren, Folgetermin festlegen', 'Agree on next steps, schedule follow-up')}</li>
        </ol>
        <div class="mt-2 p-2 bg-(--mode-pastel) border border-(--border-light) rounded text-xs text-(--text-primary)">
          ${BULB_SVG}<strong>${tx('Tipp:', 'Tip:')}</strong> ${tx('Den Kunden zuerst erzählen lassen, offene Fragen stellen!', 'Let the customer talk first, ask open-ended questions!')}
        </div>
      </div>`,
    };
  }

  if (lower.includes('kredit') || lower.includes('finanzierung') || lower.includes('credit analysis') || lower.includes('loan')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">${tx('Kreditanalyse: Empfohlene Schritte', 'Credit Analysis: Recommended Steps')}</p>
        <ol class="list-decimal pl-4 space-y-1">
          <li><strong>${tx('Bonitätsprüfung', 'Credit Check')}</strong>: ${tx('Schufa-Score und Einkommensnachweise prüfen', 'Review credit score and income documentation')}</li>
          <li><strong>${tx('Kapitaldienstfähigkeit', 'Debt Service Capacity')}</strong>: ${tx('Monatl. Belastungsquote (max. 35–40%)', 'Monthly debt-to-income ratio (max. 35–40%)')}</li>
          <li><strong>${tx('Sicherheiten', 'Collateral')}</strong>: ${tx('Vorhandene Sicherheiten bewerten', 'Evaluate available collateral')}</li>
          <li><strong>${tx('Konditionsvergleich', 'Rate Comparison')}</strong>: ${tx('Passende Kreditprodukte gegenüberstellen', 'Compare suitable credit products')}</li>
        </ol>
      </div>`,
    };
  }

  if (lower.includes('portfolio') || lower.includes('anlage') || lower.includes('depot') || lower.includes('portfolio analysis')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">${tx('Portfolio-Analyse', 'Portfolio Analysis')}</p>
        <table class="w-full text-xs mt-1 border-collapse">
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">${tx('Allokation', 'Allocation')}</td><td class="py-1.5 font-medium">${tx('45% Aktien · 30% Anleihen · 15% Immo · 10% Cash', '45% Equities · 30% Bonds · 15% Real Estate · 10% Cash')}</td></tr>
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">${tx('Risikoprofil', 'Risk Profile')}</td><td class="py-1.5 font-medium">${tx('Ausgewogen (Stufe 3/5)', 'Balanced (Level 3/5)')}</td></tr>
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">Performance YTD</td><td class="py-1.5 font-medium text-emerald-600">+4,2% (Benchmark: +3,8%)</td></tr>
          <tr><td class="py-1.5 text-slate-500">${tx('Empfehlung', 'Recommendation')}</td><td class="py-1.5 font-medium">${tx(`EU-Dividendenwerte ${ARROW_UP_SVG} · Liquidität auf 5% ${ARROW_DOWN_SVG}`, `EU dividend stocks ${ARROW_UP_SVG} · Liquidity to 5% ${ARROW_DOWN_SVG}`)}</td></tr>
        </table>
      </div>`,
    };
  }

  // ─── Extended Banking handlers (FIDA-powered assistant scenarios) ───

  if (modeId === 'banking') {
    const isEn = getLang() === 'en';
    // Tagesstart / Was steht heute an — liest aus denselben Datenquellen,
    // die auch in der Übersichts-Ansicht (TERMINE_BY_MODE, AUFGABEN_BY_MODE)
    // angezeigt werden, damit die Antwort konsistent ist.
    if (lower.includes('heute') || lower.includes('tagesplan') || lower.includes('tagesstart') || lower.includes('steht an')) {
      const termine = (TERMINE_BY_MODE.banking || []).slice(0, 4);
      const aufgaben = (AUFGABEN_BY_MODE.banking || []);
      const heute = new Date();
      const heuteStr = heute.toISOString().split('T')[0];
      const termineToday = termine.filter(t => t.datum === heuteStr);
      const termineRest = termine.filter(t => t.datum !== heuteStr);
      const aufgabeHeute = aufgaben.find(a => /heute|today/i.test(a.faellig || ''));

      const formatDatum = (iso) => {
        const d = new Date(iso);
        return d.toLocaleDateString(isEn ? 'en-US' : 'de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
      };

      const terminLines = [
        ...termineToday.map(t =>
          `<div class="flex items-start gap-2"><span class="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5"></span><div><strong>${t.zeit} ${t.kunde}</strong>: ${t.betreff} <span class="text-xs text-red-500">· ${tx('heute', 'today')}</span></div></div>`
        ),
        ...termineRest.map(t =>
          `<div class="flex items-start gap-2"><span class="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></span><div><strong>${formatDatum(t.datum)} · ${t.zeit} ${t.kunde}</strong>: ${t.betreff}</div></div>`
        ),
      ].join('');

      const aufgabenLines = aufgaben.slice(0, 3).map((a) => {
        const isToday = /heute|today/i.test(a.faellig || '');
        const dotClass = isToday ? 'bg-amber-500' : 'bg-slate-400';
        const textClass = isToday ? 'text-amber-600' : 'text-slate-500';
        return `<div class="flex items-start gap-2"><span class="w-1.5 h-1.5 rounded-full ${dotClass} mt-1.5"></span><div><strong>${a.text}</strong> <span class="text-xs ${textClass}">· ${a.faellig}</span></div></div>`;
      }).join('');

      // Top-Priorität = erste Aufgabe mit „Heute"-Fälligkeit oder erster Termin heute
      const topPrio = aufgabeHeute
        ? aufgabeHeute.text
        : (termineToday[0] ? `${termineToday[0].kunde}: ${termineToday[0].betreff}` : null);

      return {
        content: `<div class="space-y-2">
          <p class="font-semibold">${tx('Dein Tag im Überblick', 'Your day at a glance')}</p>
          <div class="space-y-1.5 text-[13px]">
            ${terminLines || `<div class="text-slate-500 italic text-xs">${tx('Keine Termine geplant.', 'No appointments scheduled.')}</div>`}
            ${aufgabenLines}
          </div>
          ${topPrio ? `<div class="mt-2 p-2 bg-(--mode-pastel) border border-(--border-light) rounded text-xs text-(--text-primary)">
            <strong>${tx('Top-Priorität:', 'Top priority:')}</strong> ${topPrio}
          </div>` : ''}
        </div>`,
      };
    }

    // Auslaufende Kredite
    if ((lower.includes('auslauf') || lower.includes('zinsbindung') || lower.includes('expiring'))
        && (lower.includes('kredit') || lower.includes('loan') || lower.includes('6 monat'))) {
      return {
        content: `<div class="space-y-2">
          <p class="font-semibold">${tx('Auslaufende Kredite (nächste 6 Monate)', 'Expiring loans (next 6 months)')}</p>
          <table class="w-full text-xs mt-1">
            <tr class="border-b border-slate-200"><td class="py-1.5"><strong>Klaus Fischer</strong></td><td class="py-1.5 font-mono">1.680€ (Commerzbank)</td><td class="py-1.5 text-emerald-600">06/2026</td></tr>
            <tr class="border-b border-slate-200"><td class="py-1.5"><strong>Peter Hoffmann</strong></td><td class="py-1.5 font-mono">45.000€ ${tx('Rahmen', 'credit line')}</td><td class="py-1.5 text-amber-600">07/2026</td></tr>
            <tr><td class="py-1.5"><strong>Andrea Lang</strong></td><td class="py-1.5 font-mono">85.000€</td><td class="py-1.5 text-amber-600">09/2026</td></tr>
          </table>
          <p class="text-xs text-slate-500 mt-2">${ARROW_SVG} <em>${tx(`Bei Fischer werden 840€/Mon. frei ${ARROW_SVG} Immobilienfinanzierung ansprechen!`, `Fischer frees up €840/mo. ${ARROW_SVG} bring up mortgage financing!`)}</em></p>
        </div>`,
      };
    }

    // Fremdbank-Depots
    if (lower.includes('fremdbank') || (lower.includes('depot') && (lower.includes('über') || lower.includes('ueber')))) {
      return {
        content: `<div class="space-y-2">
          <p class="font-semibold">${tx('Kunden mit Fremdbank-Depots', 'Customers with third-party bank securities accounts')}</p>
          <div class="space-y-1.5 text-[13px]">
            <div class="flex items-center justify-between py-1 border-b border-slate-200"><span><strong>Klaus Fischer</strong> · Trade Republic</span><span class="font-mono text-slate-600">28.000€</span></div>
            <div class="flex items-center justify-between py-1 border-b border-slate-200"><span><strong>Klaus Fischer</strong> · ${tx('ING Tagesgeld', 'ING call money')}</span><span class="font-mono text-slate-600">22.000€</span></div>
            <div class="flex items-center justify-between py-1 border-b border-slate-200"><span><strong>Peter Hoffmann</strong> · ${tx('Union Investment Firmendepot', 'Union Investment corporate account')}</span><span class="font-mono text-slate-600">85.000€</span></div>
            <div class="flex items-center justify-between py-1"><span><strong>Stefan Braun</strong> · comdirect ETF</span><span class="font-mono text-slate-600">18.500€</span></div>
          </div>
          <p class="text-xs text-slate-500 mt-2">${ARROW_SVG} <em>${tx('4 Kunden passen zur Depot-Wechsel-Prämie.', '4 customers qualify for the account transfer bonus.')}</em></p>
        </div>`,
      };
    }

    // Kunden ohne BU unter 40
    if (lower.includes('ohne bu') || lower.includes('keine bu') || (lower.includes('bu') && lower.includes('unter'))) {
      return {
        content: `<div class="space-y-2">
          <p class="font-semibold">${tx('Bestandslücken-Analyse: BU-Versicherung (&lt;40 Jahre)', 'Coverage gap analysis: disability insurance (&lt;40 years)')}</p>
          <ol class="list-decimal pl-4 space-y-1 text-[13px]">
            <li><strong>Markus Wagner</strong>: ${tx('29, junge Familie mit Neugeborenem, keine BU', '29, young family with newborn, no disability cover')}</li>
            <li><strong>Sandra Müller</strong>: ${tx('33, junge Familie, keine BU/RL', '33, young family, no disability/term life cover')}</li>
            <li><strong>Stefan Braun</strong>: ${tx('36, IT-Selbstständig, kein Schutz', '36, self-employed in IT, no cover')}</li>
          </ol>
          <div class="mt-2 p-2 bg-(--tint-success) rounded text-xs text-(--color-success)">
            ${CHECK_CIRCLE_SVG}${tx('Alle drei qualifizieren für die R+V VorsorgePlus-Aktion.', 'All three qualify for the R+V VorsorgePlus campaign.')}
          </div>
        </div>`,
      };
    }

    // Baufi-Aktion Matching
    if ((lower.includes('baufi') && lower.includes('aktion')) || lower.includes('passen zur') || lower.includes('kampagne')) {
      return {
        content: `<div class="space-y-2">
          <p class="font-semibold">${tx('Kampagnen-Matching: Frühlings-Baufi-Aktion', 'Campaign matching: Spring mortgage campaign')}</p>
          <table class="w-full text-xs mt-1">
            <tr class="border-b border-slate-200"><td class="py-1.5"><strong>Klaus Fischer</strong></td><td class="py-1.5 text-center"><span class="font-bold text-emerald-700">97%</span></td><td class="py-1.5 text-slate-500">${tx('Commerzbank-Ratenkredit läuft aus, Bausparer zuteilungsreif, Newsletter-Interesse', 'Commerzbank installment loan expiring, building-society savings ready for allocation, newsletter interest')}</td></tr>
            <tr class="border-b border-slate-200"><td class="py-1.5"><strong>Sandra Müller</strong></td><td class="py-1.5 text-center"><span class="font-bold text-emerald-700">92%</span></td><td class="py-1.5 text-slate-500">${tx('Baufi vorbereiten, Ehepartner als Neukunde', 'Prepare mortgage, spouse as new customer')}</td></tr>
            <tr><td class="py-1.5"><strong>Markus Wagner</strong></td><td class="py-1.5 text-center"><span class="font-bold text-lime-700">78%</span></td><td class="py-1.5 text-slate-500">${tx('Junge Familie mit Neugeborenem – Eigenheim-Wunsch', 'Young family with newborn – desire for own home')}</td></tr>
          </table>
        </div>`,
      };
    }

    // Gesprächsvorbereitung mit konkreten Kunden
    if ((lower.includes('bereite') || lower.includes('erstgespräch') || lower.includes('vorbereit')) && !lower.includes('leitfaden')) {
      const kunde = lower.includes('wagner') ? 'Markus Wagner'
                  : lower.includes('fischer') ? 'Klaus Fischer'
                  : lower.includes('müller') || lower.includes('mueller') ? 'Sandra Müller'
                  : lower.includes('hoffmann') ? 'Peter Hoffmann'
                  : 'Markus Wagner';
      return {
        content: `<div class="space-y-2">
          <p class="font-semibold">${tx('Gesprächsvorbereitung', 'Meeting preparation')} ${kunde}</p>
          <p class="text-xs text-slate-500">${tx('Kombinierte FIDA-Analyse · Impulse · Kampagnen-Matches', 'Combined FIDA analysis · prompts · campaign matches')}</p>
          <div class="mt-2 space-y-2">
            <div class="border-l-2 border-(--border-medium) pl-2">
              <div class="text-xs font-bold text-(--text-secondary)">1. ${tx('Einstieg', 'Opening')}</div>
              <div class="text-[12px] text-slate-700">${tx('Bezug auf letzten Kontakt, allgemeine Lebenssituation', 'Reference last contact, general life situation')}</div>
            </div>
            <div class="border-l-2 border-(--mode-primary) pl-2">
              <div class="text-xs font-bold text-(--mode-primary)">2. ${tx('Top-Thema: Immobilienfinanzierung', 'Top topic: mortgage financing')}</div>
              <div class="text-[12px] text-slate-700">${tx('Höchstes Ertragspotenzial · Kunde zeigt Such-Signale im Baufi-Rechner', 'Highest revenue potential · customer shows search signals in the mortgage calculator')}</div>
            </div>
            <div class="border-l-2 border-(--color-success) pl-2">
              <div class="text-xs font-bold text-(--color-success)">3. ${tx('Quick Win: BU-Versicherung', 'Quick win: disability insurance')}</div>
              <div class="text-[12px] text-slate-700">${tx('Bei 29 Jahren optimaler Einstiegszeitpunkt · VR-VorsorgePlus Aktion läuft', 'At 29 the ideal entry point · VR-VorsorgePlus campaign is running')}</div>
            </div>
            <div class="border-l-2 border-(--border-medium) pl-2">
              <div class="text-xs font-bold text-(--text-secondary)">4. ${tx('Abschluss', 'Closing')}</div>
              <div class="text-[12px] text-slate-700">${tx('Folgetermin, Unterlagen-Checkliste', 'Follow-up appointment, document checklist')}</div>
            </div>
          </div>
        </div>`,
      };
    }

    // Baufinanzierung durchrechnen
    if ((lower.includes('baufinanzierung') || lower.includes('baufi')) && (lower.includes('rechn') || lower.includes('eigenkapital') || lower.includes('rate'))) {
      return {
        content: `<div class="space-y-2">
          <p class="font-semibold">${tx('Baufi-Kalkulation: Markus Wagner', 'Mortgage calculation: Markus Wagner')}</p>
          <table class="w-full text-xs mt-1">
            <tr class="border-b border-slate-200"><td class="py-1 text-slate-500">${tx('Eigenkapital', 'Equity')}</td><td class="py-1 text-right font-mono">42.000€</td></tr>
            <tr class="border-b border-slate-200"><td class="py-1 text-slate-500">${tx('Gewünschte Rate', 'Desired installment')}</td><td class="py-1 text-right font-mono">840€/${tx('Mon.', 'mo.')}</td></tr>
            <tr class="border-b border-slate-200"><td class="py-1 text-slate-500">${tx('Zins (10J. Bindung)', 'Interest (10-yr fixed)')}</td><td class="py-1 text-right font-mono">3,45%</td></tr>
            <tr class="border-b border-slate-200"><td class="py-1 text-slate-500">${tx('Tilgung', 'Repayment')}</td><td class="py-1 text-right font-mono">2,00%</td></tr>
            <tr class="border-b-2 border-slate-300"><td class="py-1 font-semibold">${tx('Darlehenshöhe', 'Loan amount')}</td><td class="py-1 text-right font-mono font-bold">184.000€</td></tr>
            <tr><td class="py-1 font-semibold">${tx('Kaufpreis inkl. EK', 'Purchase price incl. equity')}</td><td class="py-1 text-right font-mono font-bold text-emerald-600">226.000€</td></tr>
          </table>
          <p class="text-xs text-slate-500 mt-2">${ARROW_SVG} <em>${tx('KfW-Förderung prüfen (bis 100k zusätzlich möglich).', 'Check KfW funding (up to 100k additionally possible).')}</em></p>
        </div>`,
      };
    }

    // Depot-Wechsel Vergleichsrechnung
    if ((lower.includes('spart') || lower.includes('wechsel') || lower.includes('vergleich')) && (lower.includes('depot') || lower.includes('trade republic') || lower.includes('sparplan'))) {
      return {
        content: `<div class="space-y-2">
          <p class="font-semibold">${tx('Depot-Wechsel Vergleich: Klaus Fischer', 'Account transfer comparison: Klaus Fischer')}</p>
          <table class="w-full text-xs mt-1">
            <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">${tx('Trade Republic (aktuell)', 'Trade Republic (current)')}</td><td class="py-1.5 text-right font-mono">1€/Trade · ${tx('0% Depotgebühr', '0% custody fee')}</td></tr>
            <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">VR-MeinDepot</td><td class="py-1.5 text-right font-mono">${tx('0€ bis 2026 (Aktion)', '€0 until 2026 (campaign)')}</td></tr>
            <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">${tx('Depot-Wechsel-Prämie', 'Account transfer bonus')}</td><td class="py-1.5 text-right font-mono text-emerald-600">+ 250€</td></tr>
            <tr><td class="py-1.5 font-semibold">${tx('Vorteil über 3 Jahre', 'Benefit over 3 years')}</td><td class="py-1.5 text-right font-mono font-bold text-emerald-600">~ 430€</td></tr>
          </table>
          <p class="text-xs text-slate-500 mt-2">${ARROW_SVG} <em>${tx('Plus Beratungskontinuität und ESG-Fonds im Sortiment.', 'Plus advisory continuity and ESG funds in the range.')}</em></p>
        </div>`,
      };
    }

    // Risikoleben Bedarfsermittlung
    if (lower.includes('risikoleben') || lower.includes('wie viel') && lower.includes('schutz')) {
      return {
        content: `<div class="space-y-2">
          <p class="font-semibold">${tx('Risikoleben-Bedarf (34J., Kind, 3.200€ Netto)', 'Term life needs (age 34, child, €3,200 net)')}</p>
          <table class="w-full text-xs mt-1">
            <tr class="border-b border-slate-200"><td class="py-1 text-slate-500">${tx('Einkommensersatz (5×Jahresnetto)', 'Income replacement (5× annual net)')}</td><td class="py-1 text-right font-mono">192.000€</td></tr>
            <tr class="border-b border-slate-200"><td class="py-1 text-slate-500">${tx('Restschulden (Annahme Baufi)', 'Remaining debt (assumed mortgage)')}</td><td class="py-1 text-right font-mono">180.000€</td></tr>
            <tr class="border-b border-slate-200"><td class="py-1 text-slate-500">${tx('Ausbildung Kind bis 25', 'Child education until 25')}</td><td class="py-1 text-right font-mono">80.000€</td></tr>
            <tr class="border-b-2 border-slate-300"><td class="py-1 font-semibold">${tx('Empfohlene Summe', 'Recommended sum')}</td><td class="py-1 text-right font-mono font-bold">~ 450.000€</td></tr>
            <tr><td class="py-1 text-slate-500">${tx('Monatsbeitrag R+V', 'Monthly premium R+V')}</td><td class="py-1 text-right font-mono text-emerald-600">${tx('ca. 22€', 'approx. €22')}</td></tr>
          </table>
        </div>`,
      };
    }

    // Einladungsschreiben / Nachfass-Mail
    if (lower.includes('einladung') || lower.includes('schreib') || lower.includes('formuliere') || lower.includes('mail')) {
      return {
        content: `<div class="space-y-2">
          <p class="font-semibold">${tx('Entwurf: Einladung zur Beratung', 'Draft: Invitation to a consultation')}</p>
          <div class="bg-(--bg-inset) border border-(--border-light) rounded p-3 text-[12px] whitespace-pre-line font-mono leading-relaxed">${tx(`Sehr geehrter Herr Wagner,

in unseren letzten Gesprächen hat sich gezeigt, dass Sie sich mit dem Thema Immobilienfinanzierung auseinandersetzen. Die aktuellen Rahmenbedingungen sind für Ihre Ausgangslage sehr interessant – gerne zeige ich Ihnen in einem persönlichen Gespräch, welche Optionen sich für Sie konkret ergeben.

Darf ich Ihnen einen Termin in den kommenden zwei Wochen vorschlagen?

Mit freundlichen Grüßen
Nadine Müller
Volksbank Mittelhessen`, `Dear Mr. Wagner,

our recent conversations have shown that you are exploring the topic of mortgage financing. The current conditions are very attractive for your situation – I would be glad to show you in a personal meeting which options are available to you specifically.

May I suggest an appointment within the next two weeks?

Kind regards,
Nadine Müller
Volksbank Mittelhessen`)}</div>
          <p class="text-xs text-slate-500 mt-2">${ARROW_SVG} <em>${tx('FIDA-Interna bleiben unerwähnt, Anlass wird persönlich formuliert.', 'FIDA internals remain unmentioned, the occasion is phrased personally.')}</em></p>
        </div>`,
      };
    }

    // Priorisierung Leads
    if (lower.includes('priorisiere') || lower.includes('ertragspotenzial') || (lower.includes('leads') && lower.includes('prio'))) {
      return {
        content: `<div class="space-y-2">
          <p class="font-semibold">${tx('Leads nach Ertragspotenzial', 'Leads by revenue potential')}</p>
          <ol class="list-decimal pl-4 space-y-1 text-[13px]">
            <li><strong>Klaus Fischer</strong>: ${tx('Kreditgespräch Immobilienfinanzierung 250k', 'Mortgage financing meeting 250k')} <span class="text-emerald-600 font-semibold">· ~12.085€</span></li>
            <li><strong>Sandra Müller</strong>: ${tx('Baufi + Ehemann als Neukunde', 'Mortgage + husband as new customer')} <span class="text-emerald-600 font-semibold">· ~12.011€</span></li>
            <li><strong>Peter Hoffmann</strong>: ${tx('Firmendepot + bAV', 'Corporate account + company pension')} <span class="text-emerald-600 font-semibold">· ~6.135€</span></li>
            <li><strong>Andrea Lang</strong>: ${tx('Praxiskredit + Absicherung', 'Practice loan + cover')} <span class="text-emerald-600 font-semibold">· ~3.186€</span></li>
            <li><strong>Stefan Braun</strong>: ${tx('Gewerbekonto Umstellung', 'Business account migration')} <span class="text-emerald-600 font-semibold">· ~3.102€</span></li>
          </ol>
        </div>`,
      };
    }

    // FIDA-Consents
    if (lower.includes('consent') || lower.includes('fida')) {
      return {
        content: `<div class="space-y-2">
          <p class="font-semibold">${tx('Offene FIDA-Consents', 'Pending FIDA consents')}</p>
          <div class="space-y-1 text-[13px]">
            <div class="flex items-center justify-between py-1 border-b border-slate-200"><span><strong>Peter Hoffmann</strong> · ${tx('GmbH-Konten', 'GmbH accounts')}</span><span class="text-xs text-amber-600 font-semibold">${tx('ausstehend', 'pending')}</span></div>
            <div class="flex items-center justify-between py-1"><span><strong>Andrea Lang</strong> · ${tx('Praxiskonto', 'Practice account')}</span><span class="text-xs text-amber-600 font-semibold">${tx('ausstehend', 'pending')}</span></div>
          </div>
          <p class="text-xs text-slate-500 mt-2">${ARROW_SVG} <em>${tx('Empfehlung: beim nächsten Besuch persönlich ansprechen.', 'Recommendation: bring it up in person at the next visit.')}</em></p>
        </div>`,
      };
    }

    // Tierhalterhaftpflicht Leitfaden
    if (lower.includes('tierhalter') || lower.includes('tierschutz') || (lower.includes('haftpflicht') && lower.includes('tier'))) {
      return {
        content: `<div class="space-y-2">
          <p class="font-semibold">${tx('Gesprächsleitfaden: Tierhalterhaftpflicht', 'Conversation guide: Pet owner liability insurance')}</p>
          <ol class="list-decimal pl-4 space-y-1 text-[13px]">
            <li><strong>${tx('Eröffnung', 'Opening')}</strong>: ${tx('"Sie haben ja Hund/Katze, wie ist dort aktuell der Schutz geregelt?"', '"You have a dog/cat, how is the cover arranged there at the moment?"')}</li>
            <li><strong>${tx('Risiko aufzeigen', 'Highlight risk')}</strong>: ${tx('Beispiel-Schaden (fremde Person gebissen: 15k–40k)', 'Example claim (third party bitten: 15k–40k)')}</li>
            <li><strong>${tx('Angebot', 'Offer')}</strong>: ${tx('R+V TierSchutz ab ~3,50€/Monat', 'R+V TierSchutz from ~€3.50/month')}</li>
            <li><strong>${tx('Bezug zu FIDA', 'Link to FIDA')}</strong>: ${tx(`Fressnapf/Tierarzt-Umsätze sichtbar ${ARROW_SVG} natürlicher Anlass`, `Pet store/vet transactions visible ${ARROW_SVG} natural occasion`)}</li>
            <li><strong>${tx('Abschluss', 'Closing')}</strong>: ${tx('Sofort online abschließen oder Unterlagen mitgeben', 'Conclude online immediately or hand over documents')}</li>
          </ol>
        </div>`,
      };
    }
  }

  return {
    content: `<div class="space-y-2">
      <p>${tx('Ich habe die relevanten Kundendaten und Vertriebsinformationen analysiert.', 'I have analyzed the relevant customer data and sales information.')}</p>
      <p>${tx('Basierend auf dem aktuellen Bestand empfehle ich:', 'Based on the current portfolio, I recommend:')}</p>
      <ul class="list-disc pl-4 space-y-1">
        <li>${tx('Bestehende Vertragsbeziehungen prüfen', 'Review existing contract relationships')}</li>
        <li>${tx('Identifizierte Bedarfslücken gezielt ansprechen', 'Address identified coverage gaps')}</li>
        <li>${tx('Nächsten Kundenkontakt terminieren', 'Schedule next customer contact')}</li>
      </ul>
      <p class="text-slate-500">${tx('Soll ich einen konkreten Bereich genauer analysieren?', 'Would you like me to analyze a specific area in more detail?')}</p>
    </div>`,
  };
}

// Bot-Avatar: volle Modusfarbe mit weißem Icon, damit der Assistent im
// hellen Cockpit auffällt (Cockpit 2026, Modusfarbe als Akzent).
function BotAvatar() {
  return (
    <div className="w-9 h-9 rounded-full bg-(--mode-primary) text-white flex items-center justify-center shrink-0 mt-0.5">
      <Bot size={18} />
    </div>
  );
}

const BUBBLE_ASSISTANT = 'max-w-[85%] rounded-xl rounded-tl-none px-4 py-3 bg-(--mode-pastel) border border-(--mode-primary-soft) text-(--text-primary)';
const BUBBLE_USER = 'max-w-[85%] rounded-xl rounded-tr-none px-4 py-3 bg-(--mode-primary) text-white';

export default function VertriebsAssistent() {
  const { t, lang } = useTranslation();
  useEffect(() => { invalidateLangCache(); }, [lang]);
  const { modeId, config, currentView, activeTab, setActiveTab, selectedKundeId, navigateTo } = useMode();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [anschreibenStep, setAnschreibenStep] = useState(null); // null | 'select_lead'
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const hasAutoOpened = useRef(false);

  // Cockpit 2026: der Assistent trägt die Modusfarbe des aktiven Instituts
  // (Knopf, Nutzer-Blasen, Senden) und Gold nur als Hairline – keine eigene
  // Lila-Identität mehr. Alle Farben kommen aus den Tokens in index.css.

  // Get current customer data for detail view
  const currentKunde = currentView === 'detail' && selectedKundeId
    ? (KUNDEN_BY_MODE[modeId] || []).find(k => k.id === selectedKundeId)
    : null;
  const kundeLeads = currentKunde
    ? getAnschreibenLeadOptions(currentKunde.id)
    : [];

  // Auto-open on detail page
  useEffect(() => {
    if (currentView === 'detail' && !hasAutoOpened.current) {
      setIsOpen(true);
      hasAutoOpened.current = true;
    }
    if (currentView !== 'detail') {
      hasAutoOpened.current = false;
    }
  }, [currentView]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Reset messages when mode changes
  useEffect(() => {
    setMessages([]);
    setAnschreibenStep(null);
  }, [modeId]);

  const sendMessage = useCallback(
    (text) => {
      if (!text.trim() || isTyping) return;
      const userMsg = { role: 'user', content: text.trim() };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');

      // Handle "Anschreiben formulieren" flow
      const lowerText = text.trim().toLowerCase();
      if ((lowerText.includes('anschreiben formulieren') || lowerText.includes('draft letter')) && currentView === 'detail' && kundeLeads.length > 0) {
        setIsTyping(true);
        setTimeout(() => {
          setMessages((prev) => [...prev, {
            role: 'assistant',
            content: lang === 'en'
              ? `<div class="space-y-2">
              <p class="font-semibold">Compose Letter</p>
              <p>On which topic should I compose a letter for <strong>${currentKunde?.name || 'the client'}</strong>?</p>
              <p class="text-xs text-slate-500">Please select a lead:</p>
            </div>`
              : `<div class="space-y-2">
              <p class="font-semibold">Anschreiben formulieren</p>
              <p>Zu welchem Thema soll ich ein Anschreiben für <strong>${currentKunde?.name || 'den Mandanten'}</strong> erstellen?</p>
              <p class="text-xs text-slate-500">Bitte wähle einen Lead aus:</p>
            </div>`,
            isHtml: true,
          }]);
          setIsTyping(false);
          setAnschreibenStep('select_lead');
        }, 800);
        return;
      }

      // Handle lead selection in Anschreiben flow
      if (anschreibenStep === 'select_lead') {
        const selectedLead = kundeLeads.find(l =>
          text.toLowerCase().includes(l.name.toLowerCase()) ||
          text.toLowerCase().includes(l.id.toLowerCase())
        );
        if (selectedLead) {
          setAnschreibenStep(null);
          setIsTyping(true);
          setTimeout(() => {
            const response = generateAnschreibenResponse(selectedLead, currentKunde);
            setMessages((prev) => [...prev, { role: 'assistant', content: response, isHtml: true }]);
            setIsTyping(false);
          }, 1500);
          return;
        }
      }

      setIsTyping(true);

      setTimeout(() => {
        const result = currentView === 'cockpit'
          ? getCockpitDemoResponse(text)
          : getDemoResponse(text, { currentView, modeId, ctx: { institut: config?.institut } });
        setMessages((prev) => [...prev, { role: 'assistant', content: result.content, isHtml: true }]);
        setAnschreibenStep(null);
        if (result.followUp) {
          // Zweite Nachricht nach kurzem „Denken": der Assistent bleibt so lange im Tipp-Zustand.
          setTimeout(() => {
            setMessages((prev) => [...prev, { role: 'assistant', content: result.followUp.content, isHtml: true }]);
            setIsTyping(false);
          }, result.followUp.delay || 900);
        } else {
          setIsTyping(false);
        }

        // Navigate to tab if response requests it
        if (result.navigateTo) {
          setTimeout(() => {
            setActiveTab(result.navigateTo);
          }, 800);
        }

        // Cockpit-specific navigation via custom event
        if (result.cockpitAction) {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('cockpit-navigate', { detail: result.cockpitAction }));
          }, 600);
        }
      }, 1200);
    },
    [isTyping, currentView, setActiveTab, anschreibenStep, kundeLeads, currentKunde, modeId, lang, config?.institut],
  );

  const handleSend = () => sendMessage(input);

  // Allow other components (e.g. the inline KIAssistentCard) to open the
  // floating chat and submit a prompt via a window event.
  useEffect(() => {
    function onExternalSend(e) {
      const msg = e?.detail?.message;
      if (!msg) return;
      setIsOpen(true);
      // Defer so the panel is mounted before dispatching the message
      setTimeout(() => sendMessage(msg), 50);
    }
    window.addEventListener('kia-chatbot-send', onExternalSend);
    return () => window.removeEventListener('kia-chatbot-send', onExternalSend);
  }, [sendMessage]);

  // Präsentationsmodus (components/praesentation): Panel öffnen bzw. schließen,
  // ohne eine Nachricht zu senden.
  useEffect(() => {
    const oeffnen = () => setIsOpen(true);
    const schliessen = () => setIsOpen(false);
    window.addEventListener('kia-chatbot-open', oeffnen);
    window.addEventListener('kia-chatbot-close', schliessen);
    return () => {
      window.removeEventListener('kia-chatbot-open', oeffnen);
      window.removeEventListener('kia-chatbot-close', schliessen);
    };
  }, []);

  // Event delegation for Anschreiben action buttons (rendered via dangerouslySetInnerHTML)
  const handleMessagesClick = useCallback((e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.getAttribute('data-action');

    // Sprünge aus Antworten heraus: Lead-Ansicht oder Kundenakte öffnen
    if (action === 'open-tab') {
      const tab = btn.getAttribute('data-tab');
      if (tab) setActiveTab(tab);
      return;
    }
    if (action === 'open-kunde') {
      const kundeId = btn.getAttribute('data-kunde-id');
      const tab = btn.getAttribute('data-tab') || undefined;
      if (kundeId) navigateTo('detail', { kundeId, tab });
      return;
    }

    const briefB64 = btn.getAttribute('data-brief');
    const subjectB64 = btn.getAttribute('data-subject');

    // Decode base64 → UTF-8
    const decodeBrief = (b64) => {
      try { return decodeURIComponent(escape(atob(b64))); } catch { return atob(b64); }
    };

    if (action === 'download-docx' && briefB64) {
      const briefText = neutral(decodeBrief(briefB64));
      const htmlContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${getLang() === 'en' ? 'Letter' : 'Anschreiben'}</title>
<style>body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.6; white-space: pre-line; }</style>
</head><body>${briefText.replace(/\n/g, '<br>')}</body></html>`;
      const blob = new Blob(['﻿', htmlContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getLang() === 'en' ? 'Letter.docx' : 'Anschreiben.docx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    if (action === 'open-email' && briefB64) {
      const briefText = decodeBrief(briefB64);
      const subject = subjectB64 ? decodeBrief(subjectB64) : (getLang() === 'en' ? 'Letter' : 'Anschreiben');
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(briefText)}`;
      window.open(mailtoUrl, '_blank');
    }
  }, [setActiveTab, navigateTo]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const welcomeMessage = currentView === 'cockpit'
    ? t('welcomeCockpit')
    : currentView === 'detail' && currentKunde
      ? t('welcomeDetail', { name: currentKunde.name })
      : getWelcomeMessage(modeId, t);
  const quickActions = currentView === 'cockpit'
    ? getCockpitQuickActions(t)
    : currentView === 'detail' && currentKunde
      ? getDetailQuickActions(modeId, currentKunde, t)
      : getQuickActions(modeId, t);

  // Don't show on landing page
  if (currentView === 'landing') return null;

  return (
    <>
      {/* Schwebender Knopf: rund, Modusfarbe, Gold-Hairline */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-(--mode-primary) hover:bg-(--mode-primary-light) text-white flex items-center justify-center transition-colors"
          style={{ boxShadow: '0 0 0 1px var(--mode-accent), 0 10px 28px rgba(28, 26, 23, 0.28)' }}
          title={t('kiVertriebsassistent')}
          aria-label={t('kiVertriebsassistent')}
        >
          <MessageSquare size={22} />
        </button>
      )}

      {/* Chat-Panel: weiß mit tiefem Schatten (surface-elevated) */}
      {isOpen && (
        <div
          data-praes="assistent"
          className="fixed bottom-6 right-6 z-50 w-[520px] h-[640px] rounded-2xl surface-elevated flex flex-col overflow-hidden"
          style={{ maxHeight: 'calc(100vh - 48px)', boxShadow: '0 0 0 1px var(--mode-primary-soft), 0 24px 60px rgba(28, 26, 23, 0.28)' }}
        >
          {/* Kopfzeile in Modusfarbe: weißer Titel, goldene Status-Marke */}
          <div className="flex items-center gap-3 px-5 py-3.5 shrink-0 bg-(--mode-primary) text-white">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255, 255, 255, 0.16)' }}>
              <Sparkles size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-semibold leading-tight truncate">{t('kiVertriebsassistent')}</div>
              <div className="flex items-center gap-1.5 text-[11px] mt-0.5" style={{ color: 'rgba(255, 255, 255, 0.78)' }}>
                <span className={`w-1.5 h-1.5 rounded-full ${isTyping ? 'animate-pulse' : ''}`} style={{ background: 'var(--mode-accent)' }} />
                {isTyping ? t('analysiere') : tx('bereit', 'ready')}
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-white/80 hover:text-white transition-colors"
              style={{ background: 'rgba(255, 255, 255, 0.0)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.0)'; }}
              aria-label={tx('Schließen', 'Close')}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4" onClick={handleMessagesClick}>
            {/* Welcome message */}
            {messages.length === 0 && (
              <div className="space-y-4">
                {/* Bot welcome */}
                <div className="flex gap-2.5">
                  <BotAvatar />
                  <div className={`${BUBBLE_ASSISTANT} text-base`}>
                    {welcomeMessage}
                  </div>
                </div>

                {/* Quick action chips */}
                <div className="pl-11 flex flex-wrap gap-2">
                  {quickActions.map((action) => (
                    <button
                      key={action}
                      onClick={() => sendMessage(action)}
                      className="px-3.5 py-2 text-sm font-medium rounded-full bg-(--bg-card) border border-(--mode-primary) text-(--mode-primary) hover:bg-(--mode-primary) hover:text-white transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat messages */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}
              >
                {msg.role === 'assistant' && <BotAvatar />}
                {msg.isHtml ? (
                  <div
                    className={`text-sm ${msg.role === 'user' ? BUBBLE_USER : BUBBLE_ASSISTANT}`}
                    dangerouslySetInnerHTML={{ __html: msg.content }}
                  />
                ) : (
                  <div className={`text-sm whitespace-pre-wrap ${msg.role === 'user' ? BUBBLE_USER : BUBBLE_ASSISTANT}`}>
                    {msg.content}
                  </div>
                )}
                {msg.role === 'user' && (
                  <div className="w-9 h-9 rounded-full surface-inset text-(--text-secondary) flex items-center justify-center shrink-0 mt-0.5">
                    <User size={18} />
                  </div>
                )}
              </div>
            ))}

            {/* Lead selection chips for Anschreiben flow */}
            {anschreibenStep === 'select_lead' && kundeLeads.length > 0 && (
              <div className="pl-11 flex flex-wrap gap-1.5">
                {kundeLeads.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => sendMessage(lead.name)}
                    className={`px-2.5 py-1.5 text-[11px] rounded-lg border transition-colors text-left leading-tight hover:border-(--mode-accent) ${
                      lead.isNeuerLead
                        ? 'bg-(--tint-success) border-(--border-light) text-(--color-success)'
                        : 'surface-inset text-(--text-primary) hover:bg-(--bg-card)'
                    }`}
                  >
                    {lead.isNeuerLead && <span className="text-[9px] font-semibold block">{lang === 'en' ? 'NEW' : 'NEU'}</span>}
                    {lead.name}
                  </button>
                ))}
              </div>
            )}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2.5">
                <BotAvatar />
                <div className={`${BUBBLE_ASSISTANT} text-sm text-(--text-secondary)`}>
                  <span className="inline-flex gap-1 text-(--text-tertiary)">
                    <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                  </span>
                  {' '}{t('analysiere')}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area: getönter Fuß, damit Eingabe und Sendeknopf sich absetzen */}
          <div className="p-4 border-t border-(--mode-primary-soft) bg-(--mode-pastel) shrink-0">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('nachrichtEingeben')}
                rows={1}
                className="flex-1 px-4 py-2.5 rounded-xl bg-(--bg-card) border border-(--border-medium) text-sm text-(--text-primary) placeholder:text-(--text-tertiary) resize-none"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="w-11 h-11 rounded-xl bg-(--mode-primary) hover:bg-(--mode-primary-light) text-white flex items-center justify-center shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-(--mode-primary)"
                aria-label={t('senden')}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
