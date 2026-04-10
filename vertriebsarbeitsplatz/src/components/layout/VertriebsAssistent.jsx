import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, FileText, Mail } from 'lucide-react';
import { useMode } from '../../hooks/useMode';
import useTranslation from '../../i18n/useTranslation';
import { KUNDEN_BY_MODE } from '../../data';
import { VV_LEADS } from '../../data/vvExtended';
import { getLang, tx, invalidateLangCache } from '../../utils/langHelper';
import { MODE_CONFIGS } from '../../data/modeConfig';

function getAdvisorSignature() {
  const customName = typeof window !== 'undefined' ? localStorage.getItem('kia_user_fullname') : null;
  let modeId = 'vermoegensverwaltung';
  try {
    const stored = localStorage.getItem('kia_last_mode');
    if (stored) modeId = JSON.parse(stored).modeId || modeId;
  } catch {}
  const cfg = MODE_CONFIGS[modeId] || MODE_CONFIGS.vermoegensverwaltung;
  const name = customName || cfg.beraterName;
  const title = cfg.beraterTitel;
  const institut = cfg.institut;
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
    banking: ['Was steht heute an?', 'Erstgespräch Markus Wagner vorbereiten', 'Auslaufende Kredite 6 Monate', 'Kunden zur Baufi-Aktion'],
    vermoegensverwaltung: [t('neueLeadsAnzeigen'), t('mandantenpotenzialAnalysieren'), t('gespraechsleitfadenErstellen'), t('portfolioAnalyse')],
  };
  return actions[modeId] || actions.versicherung;
}

// Extended suggestion catalogue for the Banking chatbot. Grouped by capability
// so the advisor can discover what the assistant can do with FIDA context.
const BANKING_SUGGESTIONS = [
  {
    category: 'Tagesplanung',
    prompts: [
      'Was steht heute an?',
      'Priorisiere meine offenen Leads nach Ertragspotenzial',
      'Welche FIDA-Consents fehlen mir noch?',
    ],
  },
  {
    category: 'Gesprächsvorbereitung',
    prompts: [
      'Bereite mir ein Erstgespräch mit Markus Wagner vor',
      'Was sollte ich bei Sandra Müller ansprechen?',
      'Gib mir Argumente für den Depot-Wechsel zu uns',
    ],
  },
  {
    category: 'Analyse on-the-fly',
    prompts: [
      'Welche Kunden haben auslaufende Kredite in den nächsten 6 Monaten?',
      'Wer von meinen Kunden hat Fremdbank-Depots über 20.000€?',
      'Zeig mir alle Kunden ohne BU-Versicherung unter 40',
      'Welche Kunden passen zur neuen Baufi-Aktion?',
    ],
  },
  {
    category: 'Formulierungshilfe',
    prompts: [
      'Schreib eine Einladung zur Immobilienfinanzierung für Markus Wagner',
      'Formuliere eine Nachfass-Mail für die Depot-Wechsel-Prämie an Klaus Fischer',
      'Erstelle einen Gesprächsleitfaden Tierhalterhaftpflicht',
    ],
  },
  {
    category: 'Rechenbeispiele',
    prompts: [
      'Rechne mir eine Baufinanzierung für Wagner – 42k Eigenkapital, 840€ Rate',
      'Was spart Fischer beim Trade-Republic-Wechsel zu uns?',
      'Wie viel Risikoleben braucht ein 34-Jähriger mit Neugeborenem bei 3.200€ Netto?',
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
    whitepaper = 'European Defense Stocks — Due Diligence Report 2026';
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
    ? `Invitation: Personal Meeting — ${thema}`
    : `Einladung: Persönliches Gespräch — ${thema}`;

  const docxSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:4px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`;
  const emailSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:4px"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;

  // Encode the brief text and email subject as base64 to safely embed in data attributes
  const briefBase64 = btoa(unescape(encodeURIComponent(brief)));
  const subjectBase64 = btoa(unescape(encodeURIComponent(emailSubject)));

  return `<div class="space-y-3">
    <p class="font-semibold">${tx('Anschreiben generiert für:', 'Letter generated for:')} ${lead.name}</p>

    <div class="bg-white border border-slate-200 rounded-lg p-3 text-xs space-y-1">
      <div class="flex items-center gap-2 mb-2">
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-medium">
          ${docxSvg} ${tx('DOCX Anschreiben', 'DOCX Letter')}
        </span>
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-medium">
          ${emailSvg} ${tx('EML E-Mail', 'EML Email')}
        </span>
      </div>
      <div class="bg-slate-50 rounded p-2.5 text-[11px] leading-relaxed whitespace-pre-line font-mono">${brief}</div>
    </div>

    <div class="bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs text-amber-800">
      <strong>${tx('Betreff (E-Mail):', 'Subject (Email):')} </strong> ${emailSubject}
    </div>

    <div class="flex gap-2 mt-2">
      <button data-action="download-docx" data-brief="${briefBase64}" class="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">${docxSvg} ${tx('Als DOCX herunterladen', 'Download as DOCX')}</button>
      <button data-action="open-email" data-brief="${briefBase64}" data-subject="${subjectBase64}" class="inline-flex items-center px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700">${emailSvg} ${tx('Als E-Mail öffnen', 'Open as Email')}</button>
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
          <li><strong>Maria Musterfrau</strong> — €890k</li>
          <li><strong>Thomas Weber</strong> — €820k</li>
          <li><strong>Sabine Danzig</strong> — €780k</li>
          <li><strong>Klaus Richter</strong> — €750k</li>
          <li><strong>Petra Hoffmann</strong> — €720k</li>
        </ol>
        <p class="text-xs text-slate-500 mt-2">→ <em>${tx('Die Tabelle zeigt jetzt die Top 5 Vermittler.', 'The table now shows the top 5 agents.')}</em></p>
      </div>`,
      cockpitAction: { view: 'table', tableView: 'agenturen' },
    };
  }

  if (lower.includes('top') && lower.includes('neugeschäft')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">${tx('Top 5 Vermittler nach Neugeschäft:', 'Top 5 Agents by New Business:')}</p>
        <ol class="list-decimal pl-4 space-y-1 text-[13px]">
          <li><strong>Maria Musterfrau</strong> — €890k</li>
          <li><strong>Thomas Weber</strong> — €820k</li>
          <li><strong>Sabine Danzig</strong> — €780k</li>
          <li><strong>Klaus Richter</strong> — €750k</li>
          <li><strong>Petra Hoffmann</strong> — €720k</li>
        </ol>
        <p class="text-xs text-slate-500 mt-2">→ <em>${tx('Die Tabelle zeigt jetzt die Top 5 Vermittler.', 'The table now shows the top 5 agents.')}</em></p>
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
        <p class="text-xs text-slate-500 mt-2">→ <em>${tx('Positive Entwicklung über alle KPIs.', 'Positive trend across all KPIs.')}</em></p>
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
        <p class="text-xs text-slate-500 mt-2">→ <em>${tx('Die KI-Analyse-Spalte zeigt Ursachen und Handlungsempfehlungen.', 'The AI analysis column shows causes and recommended actions.')}</em></p>
      </div>`,
      cockpitAction: { view: 'table', tableView: 'agenturen' },
    };
  }

  if (lower.includes('bundesland') || lower.includes('bundesländ')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">${tx('Bundesland-Ranking nach Performance:', 'Federal State Ranking by Performance:')}</p>
        <ol class="list-decimal pl-4 space-y-1 text-[13px]">
          <li><strong>Bayern</strong> — Score: 87 · ${tx('NG', 'NB')}: €5,8 ${tx('Mio', 'M')} · ${tx('Storno', 'Canc.')}: 4,8%</li>
          <li><strong>Baden-Württemberg</strong> — Score: 84 · ${tx('NG', 'NB')}: €5,2 ${tx('Mio', 'M')} · ${tx('Storno', 'Canc.')}: 4,9%</li>
          <li><strong>NRW</strong> — Score: 81 · ${tx('NG', 'NB')}: €6,1 ${tx('Mio', 'M')} · ${tx('Storno', 'Canc.')}: 5,2%</li>
          <li><strong>Hessen</strong> — Score: 78 · ${tx('NG', 'NB')}: €4,2 ${tx('Mio', 'M')} · ${tx('Storno', 'Canc.')}: 5,0%</li>
          <li><strong>Hamburg</strong> — Score: 75 · ${tx('NG', 'NB')}: €3,8 ${tx('Mio', 'M')} · ${tx('Storno', 'Canc.')}: 4,5%</li>
        </ol>
        <p class="text-xs text-slate-500 mt-2">→ <em>${tx('Performance-Score = gewichteter Mix aus NG, Storno, NPS', 'Performance score = weighted mix of NB, cancellations, NPS')}</em></p>
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
        <p class="text-xs text-slate-500 mt-2">→ <em>${tx('Gesamt: 8,2% (Ziel: <8,0%)', 'Total: 8.2% (Target: <8.0%)')}</em></p>
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
        <p class="text-xs text-slate-500 mt-2">→ <em>${tx('Trend: +10 Punkte YoY (+26%). Kranken zeigt stärkste Verbesserung.', 'Trend: +10 points YoY (+26%). Health shows strongest improvement.')}</em></p>
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

export function getDemoResponse(message, { currentView, modeId }) {
  const lower = message.toLowerCase();

  if (lower.includes('vertriebspotentiale') || lower.includes('vertriebspotenziale') || lower.includes('neue leads') || lower.includes('leads anzeigen') || lower.includes('show leads') || lower.includes('analyze leads') || lower.includes('new leads')) {
    if (modeId === 'vermoegensverwaltung') {
      return {
        content: `<div class="space-y-3">
          <p class="font-semibold">${tx('Aktuelle Leads', 'Current Leads')}</p>
          <p>${tx('Ich habe <strong>12 aktive Leads</strong> in deiner Pipeline identifiziert:', 'I have identified <strong>12 active leads</strong> in your pipeline:')}</p>
          <p class="text-xs font-semibold text-slate-600 mt-1">${tx('Neue Mandate (6):', 'New Mandates (6):')} </p>
          <ol class="list-decimal pl-4 space-y-1">
            <li><strong>Dr. Katharina Bauer</strong> — ${tx('Empfehlung Prof. Hartmann, 3,5M, Termin steht', 'Referral Prof. Hartmann, 3.5M, appointment scheduled')}</li>
            <li><strong>Charlotte Keller</strong> — ${tx('NextGen, Anwältin, 800k Eigenvermögen', 'NextGen, lawyer, 800k own assets')}</li>
            <li><strong>Dipl.-Ing. Stefan Müller</strong> — ${tx('Presse/Firmenverkauf, 6M Erlös', 'Press/company sale, 6M proceeds')}</li>
          </ol>
          <p class="text-xs font-semibold text-slate-600 mt-1">${tx('Bestandsmandate (6):', 'Existing Mandates (6):')} </p>
          <ol class="list-decimal pl-4 space-y-1">
            <li><strong>Lindenberg Cash 5,5M</strong> — ${tx('Fremdbank-Konsolidierung, kritisch', 'Third-party bank consolidation, critical')}</li>
            <li><strong>Hartmann PE +300k</strong> — ${tx('Mandats-Erweiterung, Angebot läuft', 'Mandate expansion, offer pending')}</li>
            <li><strong>Weber Sparkasse 500k</strong> — ${tx('Festgeld-Fälligkeit 2027', 'Fixed deposit maturity 2027')}</li>
          </ol>
          <p class="text-xs text-slate-500 mt-2">${tx('→ Wechsel zum Tab <em>Leads</em> für Details...', '→ Switch to the <em>Leads</em> tab for details...')}</p>
        </div>`,
        navigateTo: currentView === 'detail' ? 'impulse' : 'pipeline',
      };
    }
    if (modeId === 'banking') {
      return {
        content: `<div class="space-y-3">
          <p class="font-semibold">${tx('Aktuelle Leads', 'Current Leads')}</p>
          <p>${tx('Ich habe <strong>8 aktive Vertriebschancen</strong> identifiziert:', 'I have identified <strong>8 active sales opportunities</strong>:')}</p>
          <p class="text-xs font-semibold text-slate-600 mt-1">${tx('Neukunden (4):', 'New Customers (4):')} </p>
          <ol class="list-decimal pl-4 space-y-1">
            <li><strong>Dr. Martin Schäfer</strong> — ${tx('Baufinanzierung 380k, Termin vereinbart', 'Mortgage 380k, appointment arranged')}</li>
            <li><strong>Lisa & Tom Bergmann</strong> — ${tx('Hauskauf geplant, Kreditbedarf 420k', 'House purchase planned, credit need 420k')}</li>
            <li><strong>Firma Elektro Wenzel</strong> — ${tx('Betriebsmittelkredit, 150k', 'Working capital loan, 150k')}</li>
          </ol>
          <p class="text-xs font-semibold text-slate-600 mt-1">${tx('Bestandskunden (4):', 'Existing Customers (4):')} </p>
          <ol class="list-decimal pl-4 space-y-1">
            <li><strong>Schmidt ${tx('Anschlussfinanzierung', 'Refinancing')}</strong> — ${tx('Zinsbindung läuft 09/2027, 285k', 'Fixed rate expires 09/2027, 285k')}</li>
            <li><strong>Meier ${tx('Sparplan-Erhöhung', 'Savings Plan Increase')}</strong> — ${tx('Gehaltsanpassung, +200€/mtl.', 'Salary adjustment, +200€/mo.')}</li>
            <li><strong>Weber ${tx('Festgeld-Fälligkeit', 'Fixed Deposit Maturity')}</strong> — ${tx('50k, Wiederanlage beraten', '50k, reinvestment advice')}</li>
          </ol>
          <p class="text-xs text-slate-500 mt-2">${tx('→ Wechsel zum Tab <em>Potenziale</em> für Details...', '→ Switch to the <em>Potentials</em> tab for details...')}</p>
        </div>`,
        navigateTo: currentView === 'detail' ? 'impulse' : 'potentiale',
      };
    }
    // versicherung
    return {
      content: `<div class="space-y-3">
        <p class="font-semibold">${tx('Aktuelle Leads', 'Current Leads')}</p>
        <p>${tx('Ich habe <strong>10 aktive Vertriebschancen</strong> identifiziert:', 'I have identified <strong>10 active sales opportunities</strong>:')}</p>
        <p class="text-xs font-semibold text-slate-600 mt-1">${tx('Neukunden (4):', 'New Customers (4):')} </p>
        <ol class="list-decimal pl-4 space-y-1">
          <li><strong>Familie Richter</strong> — ${tx('Empfehlung Bestandskunde, Komplettabsicherung', 'Referral from existing customer, full coverage')}</li>
          <li><strong>Jan Krüger</strong> — ${tx('Berufsstart, BU + Haftpflicht', 'Career start, disability + liability insurance')}</li>
          <li><strong>Dr. Eva Lorenz</strong> — ${tx('PKV-Wechsel, Ärztetarif', 'Private health insurance switch, physician rate')}</li>
        </ol>
        <p class="text-xs font-semibold text-slate-600 mt-1">${tx('Bestandskunden (6):', 'Existing Customers (6):')} </p>
        <ol class="list-decimal pl-4 space-y-1">
          <li><strong>Braun ${tx('Pflegezusatz', 'Care Supplement')}</strong> — ${tx('Ehepaar, Cross-Sell Potenzial', 'Married couple, cross-sell potential')}</li>
          <li><strong>Schmidt ${tx('BU-Erhöhung', 'DI Increase')}</strong> — ${tx('Gehaltsanpassung, Nachversicherung', 'Salary adjustment, subsequent insurance')}</li>
          <li><strong>Weber ${tx('LV-Ablauf 2028', 'Life Insurance Expiry 2028')}</strong> — ${tx('Wiederanlage + Rentenvorsorge', 'Reinvestment + pension provision')}</li>
        </ol>
        <p class="text-xs text-slate-500 mt-2">${tx('→ Wechsel zum Tab <em>Potenziale</em> für Details...', '→ Switch to the <em>Potentials</em> tab for details...')}</p>
      </div>`,
      navigateTo: currentView === 'detail' ? 'impulse' : 'potentiale',
    };
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
          <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-emerald-500"></span><strong>${tx('bAV', 'Company Pension')}</strong> — ${tx('AG-Zuschuss nicht ausgeschöpft', 'Employer subsidy not fully utilized')} <span class="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">${tx('85% Potenzial', '85% Potential')}</span></div>
          <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-amber-500"></span><strong>${tx('Rechtsschutz', 'Legal Protection')}</strong> — ${tx('Kein bestehender Vertrag', 'No existing contract')} <span class="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">${tx('70% Potenzial', '70% Potential')}</span></div>
          <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-blue-500"></span><strong>${tx('Unfallversicherung', 'Accident Insurance')}</strong> — ${tx('Nur Grundschutz', 'Basic coverage only')} <span class="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">${tx('55% Potenzial', '55% Potential')}</span></div>
        </div>
      </div>`,
    };
  }

  if (lower.includes('kundenpotenzial') || lower.includes('potenzial') || lower.includes('analysieren') || lower.includes('customer potential') || lower.includes('client potential') || lower.includes('mandant potential')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">${tx('Kundenpotenzial-Analyse', 'Customer Potential Analysis')}</p>
        <table class="w-full text-xs mt-1 border-collapse">
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">${tx('Absicherungsgrad', 'Coverage Level')}</td><td class="py-1.5 font-medium">62% <span class="text-amber-600">${tx('— Lücken bei AK & AV', '— Gaps in accident & pension insurance')}</span></td></tr>
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">${tx('Lebenssituation', 'Life Situation')}</td><td class="py-1.5 font-medium">${tx('Familiengründung vor 2 J. → RL + Kinderabsicherung', 'Family founded 2 yrs ago → term life + child coverage')}</td></tr>
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">${tx('Einkommen', 'Income')}</td><td class="py-1.5 font-medium text-emerald-600">${tx('Überdurchschnittlich → Kapitalanlage-Potenzial', 'Above average → investment potential')}</td></tr>
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
          <li><strong>${tx('Einstieg', 'Opening')}</strong> — ${tx('Bezug auf letztes Gespräch, aktuelle Lebenssituation erfragen', 'Reference last conversation, ask about current life situation')}</li>
          <li><strong>${tx('Bedarfsanalyse', 'Needs Analysis')}</strong> — ${tx('Veränderungen seit letztem Kontakt? Neue Wünsche/Sorgen?', 'Changes since last contact? New wishes/concerns?')}</li>
          <li><strong>${tx('Absicherungscheck', 'Coverage Check')}</strong> — ${tx('Bestehende Verträge gemeinsam durchgehen, Lücken aufzeigen', 'Review existing contracts together, identify gaps')}</li>
          <li><strong>${tx('Empfehlung', 'Recommendation')}</strong> — ${tx('Max. 2 konkrete Produktvorschläge unterbreiten', 'Present max. 2 concrete product suggestions')}</li>
          <li><strong>${tx('Abschluss', 'Closing')}</strong> — ${tx('Nächste Schritte vereinbaren, Folgetermin festlegen', 'Agree on next steps, schedule follow-up')}</li>
        </ol>
        <div class="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
          💡 <strong>${tx('Tipp:', 'Tip:')}</strong> ${tx('Den Kunden zuerst erzählen lassen — offene Fragen stellen!', 'Let the customer talk first — ask open-ended questions!')}
        </div>
      </div>`,
    };
  }

  if (lower.includes('kredit') || lower.includes('finanzierung') || lower.includes('credit analysis') || lower.includes('loan')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">${tx('Kreditanalyse — Empfohlene Schritte', 'Credit Analysis — Recommended Steps')}</p>
        <ol class="list-decimal pl-4 space-y-1">
          <li><strong>${tx('Bonitätsprüfung', 'Credit Check')}</strong> — ${tx('Schufa-Score und Einkommensnachweise prüfen', 'Review credit score and income documentation')}</li>
          <li><strong>${tx('Kapitaldienstfähigkeit', 'Debt Service Capacity')}</strong> — ${tx('Monatl. Belastungsquote (max. 35–40%)', 'Monthly debt-to-income ratio (max. 35–40%)')}</li>
          <li><strong>${tx('Sicherheiten', 'Collateral')}</strong> — ${tx('Vorhandene Sicherheiten bewerten', 'Evaluate available collateral')}</li>
          <li><strong>${tx('Konditionsvergleich', 'Rate Comparison')}</strong> — ${tx('Passende Kreditprodukte gegenüberstellen', 'Compare suitable credit products')}</li>
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
          <tr><td class="py-1.5 text-slate-500">${tx('Empfehlung', 'Recommendation')}</td><td class="py-1.5 font-medium">${tx('EU-Dividendenwerte ↑ · Liquidität auf 5% ↓', 'EU dividend stocks ↑ · Liquidity to 5% ↓')}</td></tr>
        </table>
      </div>`,
    };
  }

  // ─── Extended Banking handlers (FIDA-powered assistant scenarios) ───

  if (modeId === 'banking') {
    // Tagesstart / Was steht heute an
    if (lower.includes('heute') || lower.includes('tagesplan') || lower.includes('tagesstart') || lower.includes('steht an')) {
      return {
        content: `<div class="space-y-2">
          <p class="font-semibold">Dein Tag im Überblick</p>
          <div class="space-y-1.5 text-[13px]">
            <div class="flex items-start gap-2"><span class="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5"></span><div><strong>16:30 Stefan Braun</strong> — Gewerbekonto-Beratung <span class="text-xs text-red-500">· heute</span></div></div>
            <div class="flex items-start gap-2"><span class="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5"></span><div><strong>Anschlussfinanzierung Fischer vorbereiten</strong> — Zinsbindung 04/2026 <span class="text-xs text-amber-600">· kritisch</span></div></div>
            <div class="flex items-start gap-2"><span class="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></span><div><strong>2 FIDA-Consents offen</strong> — Hoffmann, Lang</div></div>
            <div class="flex items-start gap-2"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5"></span><div><strong>1 Rückruf</strong> — Sandra Müller (Baufi-Vorgespräch)</div></div>
          </div>
          <div class="mt-2 p-2 bg-indigo-50 border border-indigo-200 rounded text-xs text-indigo-800">
            💡 <strong>Top-Priorität:</strong> Fischer — nur noch ~4 Wochen bis Zinsbindungsende.
          </div>
        </div>`,
      };
    }

    // Auslaufende Kredite
    if ((lower.includes('auslauf') || lower.includes('zinsbindung') || lower.includes('expiring'))
        && (lower.includes('kredit') || lower.includes('loan') || lower.includes('6 monat'))) {
      return {
        content: `<div class="space-y-2">
          <p class="font-semibold">Auslaufende Kredite (nächste 6 Monate)</p>
          <table class="w-full text-xs mt-1">
            <tr class="border-b border-slate-200"><td class="py-1.5"><strong>Klaus Fischer</strong></td><td class="py-1.5 font-mono">185.000€</td><td class="py-1.5 text-red-600">04/2026</td></tr>
            <tr class="border-b border-slate-200"><td class="py-1.5"><strong>Peter Hoffmann</strong></td><td class="py-1.5 font-mono">45.000€ Rahmen</td><td class="py-1.5 text-amber-600">07/2026</td></tr>
            <tr><td class="py-1.5"><strong>Andrea Lang</strong></td><td class="py-1.5 font-mono">85.000€</td><td class="py-1.5 text-amber-600">09/2026</td></tr>
          </table>
          <p class="text-xs text-slate-500 mt-2">→ <em>Forward-Darlehen bei Fischer dringend!</em></p>
        </div>`,
      };
    }

    // Fremdbank-Depots
    if (lower.includes('fremdbank') || (lower.includes('depot') && (lower.includes('über') || lower.includes('ueber')))) {
      return {
        content: `<div class="space-y-2">
          <p class="font-semibold">Kunden mit Fremdbank-Depots</p>
          <div class="space-y-1.5 text-[13px]">
            <div class="flex items-center justify-between py-1 border-b border-slate-200"><span><strong>Klaus Fischer</strong> — Trade Republic</span><span class="font-mono text-slate-600">28.000€</span></div>
            <div class="flex items-center justify-between py-1 border-b border-slate-200"><span><strong>Klaus Fischer</strong> — ING Tagesgeld</span><span class="font-mono text-slate-600">22.000€</span></div>
            <div class="flex items-center justify-between py-1 border-b border-slate-200"><span><strong>Peter Hoffmann</strong> — Union Investment Firmendepot</span><span class="font-mono text-slate-600">85.000€</span></div>
            <div class="flex items-center justify-between py-1"><span><strong>Stefan Braun</strong> — comdirect ETF</span><span class="font-mono text-slate-600">18.500€</span></div>
          </div>
          <p class="text-xs text-slate-500 mt-2">→ <em>4 Kunden passen zur Depot-Wechsel-Prämie.</em></p>
        </div>`,
      };
    }

    // Kunden ohne BU unter 40
    if (lower.includes('ohne bu') || lower.includes('keine bu') || (lower.includes('bu') && lower.includes('unter'))) {
      return {
        content: `<div class="space-y-2">
          <p class="font-semibold">Bestandslücken-Analyse — BU-Versicherung (&lt;40 Jahre)</p>
          <ol class="list-decimal pl-4 space-y-1 text-[13px]">
            <li><strong>Markus Wagner</strong> — 29, keine BU, optimaler Einstieg</li>
            <li><strong>Sandra Müller</strong> — 33, junge Familie, keine BU/RL</li>
            <li><strong>Stefan Braun</strong> — 36, IT-Selbstständig, kein Schutz</li>
          </ol>
          <div class="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
            💡 Alle drei qualifizieren für die R+V VorsorgePlus-Aktion.
          </div>
        </div>`,
      };
    }

    // Baufi-Aktion Matching
    if ((lower.includes('baufi') && lower.includes('aktion')) || lower.includes('passen zur') || lower.includes('kampagne')) {
      return {
        content: `<div class="space-y-2">
          <p class="font-semibold">Kampagnen-Matching — Frühlings-Baufi-Aktion</p>
          <table class="w-full text-xs mt-1">
            <tr class="border-b border-slate-200"><td class="py-1.5"><strong>Klaus Fischer</strong></td><td class="py-1.5 text-center"><span class="font-bold text-emerald-700">97%</span></td><td class="py-1.5 text-slate-500">Zinsbindung läuft aus, Bausparer zuteilungsreif</td></tr>
            <tr class="border-b border-slate-200"><td class="py-1.5"><strong>Sandra Müller</strong></td><td class="py-1.5 text-center"><span class="font-bold text-emerald-700">92%</span></td><td class="py-1.5 text-slate-500">Baufi vorbereiten, Ehepartner als Neukunde</td></tr>
            <tr><td class="py-1.5"><strong>Markus Wagner</strong></td><td class="py-1.5 text-center"><span class="font-bold text-lime-700">78%</span></td><td class="py-1.5 text-slate-500">Junges Alter, erstes Eigenheim-Interesse</td></tr>
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
          <p class="font-semibold">Gesprächsvorbereitung ${kunde}</p>
          <p class="text-xs text-slate-500">Kombinierte FIDA-Analyse · Impulse · Kampagnen-Matches</p>
          <div class="mt-2 space-y-2">
            <div class="border-l-2 border-emerald-500 pl-2">
              <div class="text-xs font-bold text-emerald-700">1. Einstieg</div>
              <div class="text-[12px] text-slate-700">Bezug auf letzten Kontakt, allgemeine Lebenssituation</div>
            </div>
            <div class="border-l-2 border-indigo-500 pl-2">
              <div class="text-xs font-bold text-indigo-700">2. Top-Thema: Immobilienfinanzierung</div>
              <div class="text-[12px] text-slate-700">Höchstes Ertragspotenzial · Kunde zeigt Such-Signale im Baufi-Rechner</div>
            </div>
            <div class="border-l-2 border-amber-500 pl-2">
              <div class="text-xs font-bold text-amber-700">3. Quick Win: BU-Versicherung</div>
              <div class="text-[12px] text-slate-700">Bei 29 Jahren optimaler Einstiegszeitpunkt · VR-VorsorgePlus Aktion läuft</div>
            </div>
            <div class="border-l-2 border-slate-400 pl-2">
              <div class="text-xs font-bold text-slate-600">4. Abschluss</div>
              <div class="text-[12px] text-slate-700">Folgetermin, Unterlagen-Checkliste</div>
            </div>
          </div>
        </div>`,
      };
    }

    // Baufinanzierung durchrechnen
    if ((lower.includes('baufinanzierung') || lower.includes('baufi')) && (lower.includes('rechn') || lower.includes('eigenkapital') || lower.includes('rate'))) {
      return {
        content: `<div class="space-y-2">
          <p class="font-semibold">Baufi-Kalkulation — Markus Wagner</p>
          <table class="w-full text-xs mt-1">
            <tr class="border-b border-slate-200"><td class="py-1 text-slate-500">Eigenkapital</td><td class="py-1 text-right font-mono">42.000€</td></tr>
            <tr class="border-b border-slate-200"><td class="py-1 text-slate-500">Gewünschte Rate</td><td class="py-1 text-right font-mono">840€/Mon.</td></tr>
            <tr class="border-b border-slate-200"><td class="py-1 text-slate-500">Zins (10J. Bindung)</td><td class="py-1 text-right font-mono">3,45%</td></tr>
            <tr class="border-b border-slate-200"><td class="py-1 text-slate-500">Tilgung</td><td class="py-1 text-right font-mono">2,00%</td></tr>
            <tr class="border-b-2 border-slate-300"><td class="py-1 font-semibold">Darlehenshöhe</td><td class="py-1 text-right font-mono font-bold">184.000€</td></tr>
            <tr><td class="py-1 font-semibold">Kaufpreis inkl. EK</td><td class="py-1 text-right font-mono font-bold text-emerald-600">226.000€</td></tr>
          </table>
          <p class="text-xs text-slate-500 mt-2">→ <em>KfW-Förderung prüfen (bis 100k zusätzlich möglich).</em></p>
        </div>`,
      };
    }

    // Depot-Wechsel Vergleichsrechnung
    if ((lower.includes('spart') || lower.includes('wechsel') || lower.includes('vergleich')) && (lower.includes('depot') || lower.includes('trade republic') || lower.includes('sparplan'))) {
      return {
        content: `<div class="space-y-2">
          <p class="font-semibold">Depot-Wechsel Vergleich — Klaus Fischer</p>
          <table class="w-full text-xs mt-1">
            <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">Trade Republic (aktuell)</td><td class="py-1.5 text-right font-mono">1€/Trade · 0% Depotgebühr</td></tr>
            <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">VR-MeinDepot</td><td class="py-1.5 text-right font-mono">0€ bis 2026 (Aktion)</td></tr>
            <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">Depot-Wechsel-Prämie</td><td class="py-1.5 text-right font-mono text-emerald-600">+ 250€</td></tr>
            <tr><td class="py-1.5 font-semibold">Vorteil über 3 Jahre</td><td class="py-1.5 text-right font-mono font-bold text-emerald-600">~ 430€</td></tr>
          </table>
          <p class="text-xs text-slate-500 mt-2">→ <em>Plus Beratungskontinuität und ESG-Fonds im Sortiment.</em></p>
        </div>`,
      };
    }

    // Risikoleben Bedarfsermittlung
    if (lower.includes('risikoleben') || lower.includes('wie viel') && lower.includes('schutz')) {
      return {
        content: `<div class="space-y-2">
          <p class="font-semibold">Risikoleben-Bedarf (34J., Kind, 3.200€ Netto)</p>
          <table class="w-full text-xs mt-1">
            <tr class="border-b border-slate-200"><td class="py-1 text-slate-500">Einkommensersatz (5×Jahresnetto)</td><td class="py-1 text-right font-mono">192.000€</td></tr>
            <tr class="border-b border-slate-200"><td class="py-1 text-slate-500">Restschulden (Annahme Baufi)</td><td class="py-1 text-right font-mono">180.000€</td></tr>
            <tr class="border-b border-slate-200"><td class="py-1 text-slate-500">Ausbildung Kind bis 25</td><td class="py-1 text-right font-mono">80.000€</td></tr>
            <tr class="border-b-2 border-slate-300"><td class="py-1 font-semibold">Empfohlene Summe</td><td class="py-1 text-right font-mono font-bold">~ 450.000€</td></tr>
            <tr><td class="py-1 text-slate-500">Monatsbeitrag R+V</td><td class="py-1 text-right font-mono text-emerald-600">ca. 22€</td></tr>
          </table>
        </div>`,
      };
    }

    // Einladungsschreiben / Nachfass-Mail
    if (lower.includes('einladung') || lower.includes('schreib') || lower.includes('formuliere') || lower.includes('mail')) {
      return {
        content: `<div class="space-y-2">
          <p class="font-semibold">Entwurf — Einladung zur Beratung</p>
          <div class="bg-slate-50 border border-slate-200 rounded p-3 text-[12px] whitespace-pre-line font-mono leading-relaxed">Sehr geehrter Herr Wagner,

in unseren letzten Gesprächen hat sich gezeigt, dass Sie sich mit dem Thema Immobilienfinanzierung auseinandersetzen. Die aktuellen Rahmenbedingungen sind für Ihre Ausgangslage sehr interessant – gerne zeige ich Ihnen in einem persönlichen Gespräch, welche Optionen sich für Sie konkret ergeben.

Darf ich Ihnen einen Termin in den kommenden zwei Wochen vorschlagen?

Mit freundlichen Grüßen
Nadine Müller
Volksbank Mittelhessen</div>
          <p class="text-xs text-slate-500 mt-2">→ <em>FIDA-Interna bleiben unerwähnt, Anlass wird persönlich formuliert.</em></p>
        </div>`,
      };
    }

    // Priorisierung Leads
    if (lower.includes('priorisiere') || lower.includes('ertragspotenzial') || (lower.includes('leads') && lower.includes('prio'))) {
      return {
        content: `<div class="space-y-2">
          <p class="font-semibold">Leads nach Ertragspotenzial</p>
          <ol class="list-decimal pl-4 space-y-1 text-[13px]">
            <li><strong>Klaus Fischer</strong> — Anschlussfinanzierung 185k <span class="text-emerald-600 font-semibold">· ~8.951€</span></li>
            <li><strong>Sandra Müller</strong> — Baufi + Ehemann als Neukunde <span class="text-emerald-600 font-semibold">· ~12.011€</span></li>
            <li><strong>Peter Hoffmann</strong> — Firmendepot + bAV <span class="text-emerald-600 font-semibold">· ~6.135€</span></li>
            <li><strong>Andrea Lang</strong> — Praxiskredit + Absicherung <span class="text-emerald-600 font-semibold">· ~3.186€</span></li>
            <li><strong>Stefan Braun</strong> — Gewerbekonto Umstellung <span class="text-emerald-600 font-semibold">· ~3.102€</span></li>
          </ol>
        </div>`,
      };
    }

    // FIDA-Consents
    if (lower.includes('consent') || lower.includes('fida')) {
      return {
        content: `<div class="space-y-2">
          <p class="font-semibold">Offene FIDA-Consents</p>
          <div class="space-y-1 text-[13px]">
            <div class="flex items-center justify-between py-1 border-b border-slate-200"><span><strong>Peter Hoffmann</strong> — GmbH-Konten</span><span class="text-xs text-amber-600 font-semibold">ausstehend</span></div>
            <div class="flex items-center justify-between py-1"><span><strong>Andrea Lang</strong> — Praxiskonto</span><span class="text-xs text-amber-600 font-semibold">ausstehend</span></div>
          </div>
          <p class="text-xs text-slate-500 mt-2">→ <em>Empfehlung: beim nächsten Besuch persönlich ansprechen.</em></p>
        </div>`,
      };
    }

    // Tierhalterhaftpflicht Leitfaden
    if (lower.includes('tierhalter') || lower.includes('tierschutz') || (lower.includes('haftpflicht') && lower.includes('tier'))) {
      return {
        content: `<div class="space-y-2">
          <p class="font-semibold">Gesprächsleitfaden — Tierhalterhaftpflicht</p>
          <ol class="list-decimal pl-4 space-y-1 text-[13px]">
            <li><strong>Eröffnung</strong> — "Sie haben ja Hund/Katze — wie ist dort aktuell der Schutz geregelt?"</li>
            <li><strong>Risiko aufzeigen</strong> — Beispiel-Schaden (fremde Person gebissen: 15k–40k)</li>
            <li><strong>Angebot</strong> — R+V TierSchutz ab ~3,50€/Monat</li>
            <li><strong>Bezug zu FIDA</strong> — Fressnapf/Tierarzt-Umsätze sichtbar → natürlicher Anlass</li>
            <li><strong>Abschluss</strong> — Sofort online abschließen oder Unterlagen mitgeben</li>
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

export default function VertriebsAssistent() {
  const { t, lang } = useTranslation();
  useEffect(() => { invalidateLangCache(); }, [lang]);
  const { modeId, config, currentView, activeTab, setActiveTab, selectedKundeId } = useMode();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [anschreibenStep, setAnschreibenStep] = useState(null); // null | 'select_lead'
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const hasAutoOpened = useRef(false);

  // The floating assistant now uses the same lila theme as the inline
  // KIAssistentCard so it visually identifies as an AI surface regardless
  // of the active institut mode.
  const primary = '#7c3aed';       // violet-600
  const primaryLight = '#8b5cf6';  // violet-500
  const gradient = 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)';

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
          : getDemoResponse(text, { currentView, modeId });
        setMessages((prev) => [...prev, { role: 'assistant', content: result.content, isHtml: true }]);
        setIsTyping(false);
        setAnschreibenStep(null);

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
    [isTyping, currentView, setActiveTab, anschreibenStep, kundeLeads, currentKunde, modeId, lang],
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

  // Event delegation for Anschreiben action buttons (rendered via dangerouslySetInnerHTML)
  const handleMessagesClick = useCallback((e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const action = btn.getAttribute('data-action');
    const briefB64 = btn.getAttribute('data-brief');
    const subjectB64 = btn.getAttribute('data-subject');

    // Decode base64 → UTF-8
    const decodeBrief = (b64) => {
      try { return decodeURIComponent(escape(atob(b64))); } catch { return atob(b64); }
    };

    if (action === 'download-docx' && briefB64) {
      const briefText = decodeBrief(briefB64);
      const htmlContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${getLang() === 'en' ? 'Letter' : 'Anschreiben'}</title>
<style>body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.6; white-space: pre-line; }</style>
</head><body>${briefText.replace(/\n/g, '<br>')}</body></html>`;
      const blob = new Blob(['\ufeff', htmlContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
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
  }, []);

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
  // On the Übersicht tab the inline KIAssistentCard already covers this –
  // no need for a second floating bubble.
  if (currentView === 'overview' && activeTab === 'uebersicht') return null;

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{ background: gradient }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-105 transition-transform"
          title={t('kiVertriebsassistent')}
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
          style={{ maxHeight: 'calc(100vh - 48px)' }}
        >
          {/* Header */}
          <div
            style={{ background: gradient }}
            className="flex items-center justify-between px-4 py-3 shrink-0"
          >
            <div className="flex items-center gap-2 text-white">
              <Bot size={20} />
              <span className="text-sm font-semibold">{t('kiVertriebsassistent')}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-white/80 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" onClick={handleMessagesClick}>
            {/* Welcome message */}
            {messages.length === 0 && (
              <div className="space-y-4">
                {/* Bot welcome */}
                <div className="flex gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: primary }}
                  >
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-lg rounded-tl-none px-3 py-2 text-sm text-gray-800 max-w-[85%]">
                    {welcomeMessage}
                  </div>
                </div>

                {/* Quick action chips */}
                <div className="pl-9 flex flex-wrap gap-2">
                  {quickActions.map((action) => (
                    <button
                      key={action}
                      onClick={() => sendMessage(action)}
                      className="px-3 py-1.5 text-xs rounded-full border transition-colors"
                      style={{
                        borderColor: primaryLight,
                        color: primary,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = primary;
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = primary;
                      }}
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
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: primary }}
                  >
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                {msg.isHtml ? (
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === 'user'
                        ? 'rounded-tr-none text-white'
                        : 'rounded-tl-none bg-gray-100 text-gray-800'
                    }`}
                    style={msg.role === 'user' ? { backgroundColor: primary } : undefined}
                    dangerouslySetInnerHTML={{ __html: msg.content }}
                  />
                ) : (
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'rounded-tr-none text-white'
                        : 'rounded-tl-none bg-gray-100 text-gray-800'
                    }`}
                    style={msg.role === 'user' ? { backgroundColor: primary } : undefined}
                  >
                    {msg.content}
                  </div>
                )}
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center shrink-0 mt-0.5">
                    <User size={14} className="text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Lead selection chips for Anschreiben flow */}
            {anschreibenStep === 'select_lead' && kundeLeads.length > 0 && (
              <div className="pl-9 flex flex-wrap gap-1.5">
                {kundeLeads.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => sendMessage(lead.name)}
                    className="px-2.5 py-1.5 text-[11px] rounded-lg border transition-colors text-left leading-tight"
                    style={{
                      borderColor: lead.isNeuerLead ? '#10b981' : primaryLight,
                      color: lead.isNeuerLead ? '#059669' : primary,
                      backgroundColor: lead.isNeuerLead ? '#ecfdf5' : undefined,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = lead.isNeuerLead ? '#059669' : primary;
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = lead.isNeuerLead ? '#ecfdf5' : 'transparent';
                      e.currentTarget.style.color = lead.isNeuerLead ? '#059669' : primary;
                    }}
                  >
                    {lead.isNeuerLead && <span className="text-[9px] font-bold block text-emerald-600">{lang === 'en' ? 'NEW' : 'NEU'}</span>}
                    {lead.name}
                  </button>
                ))}
              </div>
            )}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: primary }}
                >
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-gray-100 rounded-lg rounded-tl-none px-3 py-2 text-sm text-gray-500">
                  <span className="inline-flex gap-1">
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

          {/* Input area */}
          <div className="p-3 border-t border-gray-200 shrink-0">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('nachrichtEingeben')}
                rows={1}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 transition-shadow"
                style={{
                  '--tw-ring-color': primaryLight + '40',
                  borderColor: input ? primaryLight : undefined,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = primaryLight;
                }}
                onBlur={(e) => {
                  if (!input) e.currentTarget.style.borderColor = '';
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="px-3 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: primary }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled)
                    e.currentTarget.style.backgroundColor = primaryLight;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = primary;
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
