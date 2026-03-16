import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { useMode } from '../../hooks/useMode';

const WELCOME_MESSAGES = {
  versicherung:
    'Hallo! Ich bin dein KI-Vertriebsassistent. Ich kann dir bei Kundenanalysen, Produktempfehlungen und Vertriebsstrategien helfen.',
  banking:
    'Hallo! Ich unterstütze dich bei Kreditanalysen, Anlageberatung und Kundengesprächen.',
  vermoegensverwaltung:
    'Hallo! Ich helfe dir bei Portfolioanalysen, Mandatsbetreuung und Compliance-Fragen.',
};

const QUICK_ACTIONS = {
  versicherung: [
    'Neue Leads anzeigen',
    'Kundenpotenzial analysieren',
    'Gesprächsleitfaden erstellen',
    'Cross-Selling Chancen',
  ],
  banking: [
    'Neue Leads anzeigen',
    'Kundenpotenzial analysieren',
    'Gesprächsleitfaden erstellen',
    'Kreditanalyse starten',
  ],
  vermoegensverwaltung: [
    'Neue Leads anzeigen',
    'Mandantenpotenzial analysieren',
    'Gesprächsleitfaden erstellen',
    'Portfolio-Analyse',
  ],
};

const COCKPIT_QUICK_ACTIONS = [
  'Top 5 nach Ergebnis',
  'Performance Überblick',
  'Auffällige Vermittler',
];

function getCockpitDemoResponse(message) {
  const lower = message.toLowerCase();

  if (lower.includes('top') && lower.includes('ergebnis')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">Top 5 Vermittler nach Ergebnis:</p>
        <ol class="list-decimal pl-4 space-y-1 text-[13px]">
          <li><strong>Maria Musterfrau</strong> — €890k</li>
          <li><strong>Thomas Weber</strong> — €820k</li>
          <li><strong>Sabine Danzig</strong> — €780k</li>
          <li><strong>Klaus Richter</strong> — €750k</li>
          <li><strong>Petra Hoffmann</strong> — €720k</li>
        </ol>
        <p class="text-xs text-slate-500 mt-2">→ <em>Die Tabelle zeigt jetzt die Top 5 Vermittler.</em></p>
      </div>`,
      cockpitAction: { view: 'table', tableView: 'agenturen' },
    };
  }

  if (lower.includes('top') && lower.includes('neugeschäft')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">Top 5 Vermittler nach Neugeschäft:</p>
        <ol class="list-decimal pl-4 space-y-1 text-[13px]">
          <li><strong>Maria Musterfrau</strong> — €890k</li>
          <li><strong>Thomas Weber</strong> — €820k</li>
          <li><strong>Sabine Danzig</strong> — €780k</li>
          <li><strong>Klaus Richter</strong> — €750k</li>
          <li><strong>Petra Hoffmann</strong> — €720k</li>
        </ol>
        <p class="text-xs text-slate-500 mt-2">→ <em>Die Tabelle zeigt jetzt die Top 5 Vermittler.</em></p>
      </div>`,
      cockpitAction: { view: 'table', tableView: 'agenturen' },
    };
  }

  if (lower.includes('performance') || lower.includes('gesamt')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">Gesamt-Performance Überblick:</p>
        <table class="w-full text-xs mt-1 border-collapse">
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">Neugeschäft YTD</td><td class="py-1.5 font-medium font-mono">€38,1 Mio</td></tr>
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">Bestand</td><td class="py-1.5 font-medium font-mono">€141,9 Mrd</td></tr>
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">Stornoquote</td><td class="py-1.5 font-medium"><span class="text-emerald-600">4,9%</span> (Ziel: &lt;5,0%)</td></tr>
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">NPS Score</td><td class="py-1.5 font-medium">48 <span class="text-emerald-600">(+6 YoY)</span></td></tr>
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">Combined Ratio</td><td class="py-1.5 font-medium">91,0%</td></tr>
          <tr><td class="py-1.5 text-slate-500">Gesamtergebnis</td><td class="py-1.5 font-medium font-mono text-emerald-600">€1,9 Mio</td></tr>
        </table>
        <p class="text-xs text-slate-500 mt-2">→ <em>Positive Entwicklung über alle KPIs.</em></p>
      </div>`,
    };
  }

  if (lower.includes('auffällig') || lower.includes('auffallig') || lower.includes('ungewöhnlich') || lower.includes('anomalie')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">Auffällige Vermittler (Anomalie-Erkennung):</p>
        <p class="text-[13px]">4 Vermittler mit auffälligen Werten identifiziert:</p>
        <div class="space-y-1.5 mt-2">
          <div class="flex items-center gap-2 text-[13px]"><span class="w-2 h-2 rounded-full bg-red-500"></span><strong>2×</strong> Hohe Stornoquote (&gt;15%)</div>
          <div class="flex items-center gap-2 text-[13px]"><span class="w-2 h-2 rounded-full bg-amber-500"></span><strong>1×</strong> Niedriger NPS Score (&lt;30)</div>
          <div class="flex items-center gap-2 text-[13px]"><span class="w-2 h-2 rounded-full bg-orange-500"></span><strong>1×</strong> Bestandsrückgang (&gt;10% YoY)</div>
        </div>
        <p class="text-xs text-slate-500 mt-2">→ <em>Die KI-Analyse-Spalte zeigt Ursachen und Handlungsempfehlungen.</em></p>
      </div>`,
      cockpitAction: { view: 'table', tableView: 'agenturen' },
    };
  }

  if (lower.includes('bundesland') || lower.includes('bundesländ')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">Bundesland-Ranking nach Performance:</p>
        <ol class="list-decimal pl-4 space-y-1 text-[13px]">
          <li><strong>Bayern</strong> — Score: 87 · NG: €5,8 Mio · Storno: 4,8%</li>
          <li><strong>Baden-Württemberg</strong> — Score: 84 · NG: €5,2 Mio · Storno: 4,9%</li>
          <li><strong>NRW</strong> — Score: 81 · NG: €6,1 Mio · Storno: 5,2%</li>
          <li><strong>Hessen</strong> — Score: 78 · NG: €4,2 Mio · Storno: 5,0%</li>
          <li><strong>Hamburg</strong> — Score: 75 · NG: €3,8 Mio · Storno: 4,5%</li>
        </ol>
        <p class="text-xs text-slate-500 mt-2">→ <em>Performance-Score = gewichteter Mix aus NG, Storno, NPS</em></p>
      </div>`,
      cockpitAction: { view: 'table', tableView: 'bundeslaender' },
    };
  }

  if (lower.includes('storno') && lower.includes('segment')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">Stornoquoten nach Segment:</p>
        <table class="w-full text-xs mt-1 border-collapse">
          <tr class="border-b border-slate-200"><td class="py-1 font-medium">Leben</td><td class="py-1 font-mono">5,8%</td><td class="py-1 text-emerald-600">-0,3%</td></tr>
          <tr class="border-b border-slate-200"><td class="py-1 font-medium">Kranken</td><td class="py-1 font-mono">4,2%</td><td class="py-1 text-emerald-600">-0,5%</td></tr>
          <tr class="border-b border-slate-200"><td class="py-1 font-medium">Schaden</td><td class="py-1 font-mono">8,5%</td><td class="py-1 text-red-500">+0,2%</td></tr>
          <tr><td class="py-1 font-medium">Kfz</td><td class="py-1 font-mono">12,1%</td><td class="py-1 text-emerald-600">-0,8%</td></tr>
        </table>
        <p class="text-xs text-slate-500 mt-2">→ <em>Gesamt: 8,2% (Ziel: &lt;8,0%)</em></p>
      </div>`,
    };
  }

  if (lower.includes('nps')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">NPS Score Entwicklung:</p>
        <table class="w-full text-xs mt-1 border-collapse">
          <tr class="border-b border-slate-200"><td class="py-1 text-slate-500">Jan 2024</td><td class="py-1 font-mono">38</td></tr>
          <tr class="border-b border-slate-200"><td class="py-1 text-slate-500">Apr 2024</td><td class="py-1 font-mono">40</td></tr>
          <tr class="border-b border-slate-200"><td class="py-1 text-slate-500">Jul 2024</td><td class="py-1 font-mono">41</td></tr>
          <tr class="border-b border-slate-200"><td class="py-1 text-slate-500">Okt 2024</td><td class="py-1 font-mono">42</td></tr>
          <tr><td class="py-1 text-slate-500">Jan 2025</td><td class="py-1 font-mono font-semibold text-emerald-600">48</td></tr>
        </table>
        <p class="text-xs text-slate-500 mt-2">→ <em>Trend: +10 Punkte YoY (+26%). Kranken zeigt stärkste Verbesserung.</em></p>
      </div>`,
    };
  }

  // Cockpit fallback
  return {
    content: `<div class="space-y-2">
      <p>Ich habe die Dashboard-Daten analysiert.</p>
      <p><strong>Verfügbare Abfragen:</strong></p>
      <ul class="list-disc pl-4 space-y-1 text-[13px]">
        <li>Top 5 Vermittler nach Neugeschäft</li>
        <li>Bundesland Performance Ranking</li>
        <li>NPS Score Entwicklung</li>
        <li>Stornoquoten nach Segment</li>
        <li>Auffällige Vermittler</li>
      </ul>
    </div>`,
  };
}

function getDemoResponse(message, { currentView, modeId }) {
  const lower = message.toLowerCase();

  if (lower.includes('vertriebspotentiale') || lower.includes('vertriebspotenziale') || lower.includes('neue leads') || lower.includes('leads anzeigen')) {
    if (modeId === 'vermoegensverwaltung') {
      return {
        content: `<div class="space-y-3">
          <p class="font-semibold">Aktuelle Leads</p>
          <p>Ich habe <strong>12 aktive Leads</strong> in deiner Pipeline identifiziert:</p>
          <p class="text-xs font-semibold text-slate-600 mt-1">Neue Mandate (6):</p>
          <ol class="list-decimal pl-4 space-y-1">
            <li><strong>Dr. Katharina Bauer</strong> — Empfehlung Prof. Hartmann, 3,5M, Termin steht</li>
            <li><strong>Charlotte von Trott</strong> — NextGen, Anwältin, 800k Eigenvermögen</li>
            <li><strong>Dipl.-Ing. Stefan Müller</strong> — Presse/Firmenverkauf, 6M Erlös</li>
          </ol>
          <p class="text-xs font-semibold text-slate-600 mt-1">Bestandsmandate (6):</p>
          <ol class="list-decimal pl-4 space-y-1">
            <li><strong>Lindenberg Cash 5,5M</strong> — Fremdbank-Konsolidierung, kritisch</li>
            <li><strong>Hartmann PE +300k</strong> — Mandats-Erweiterung, Angebot läuft</li>
            <li><strong>Weber Sparkasse 500k</strong> — Festgeld-Fälligkeit 2027</li>
          </ol>
          <p class="text-xs text-slate-500 mt-2">→ Wechsel zum Tab <em>Leads</em> für Details...</p>
        </div>`,
        navigateTo: currentView === 'detail' ? 'impulse' : 'pipeline',
      };
    }
    if (modeId === 'banking') {
      return {
        content: `<div class="space-y-3">
          <p class="font-semibold">Aktuelle Leads</p>
          <p>Ich habe <strong>8 aktive Vertriebschancen</strong> identifiziert:</p>
          <p class="text-xs font-semibold text-slate-600 mt-1">Neukunden (4):</p>
          <ol class="list-decimal pl-4 space-y-1">
            <li><strong>Dr. Martin Schäfer</strong> — Baufinanzierung 380k, Termin vereinbart</li>
            <li><strong>Lisa & Tom Bergmann</strong> — Hauskauf geplant, Kreditbedarf 420k</li>
            <li><strong>Firma Elektro Wenzel</strong> — Betriebsmittelkredit, 150k</li>
          </ol>
          <p class="text-xs font-semibold text-slate-600 mt-1">Bestandskunden (4):</p>
          <ol class="list-decimal pl-4 space-y-1">
            <li><strong>Schmidt Anschlussfinanzierung</strong> — Zinsbindung läuft 09/2027, 285k</li>
            <li><strong>Meier Sparplan-Erhöhung</strong> — Gehaltsanpassung, +200€/mtl.</li>
            <li><strong>Weber Festgeld-Fälligkeit</strong> — 50k, Wiederanlage beraten</li>
          </ol>
          <p class="text-xs text-slate-500 mt-2">→ Wechsel zum Tab <em>Potenziale</em> für Details...</p>
        </div>`,
        navigateTo: currentView === 'detail' ? 'impulse' : 'potentiale',
      };
    }
    // versicherung
    return {
      content: `<div class="space-y-3">
        <p class="font-semibold">Aktuelle Leads</p>
        <p>Ich habe <strong>10 aktive Vertriebschancen</strong> identifiziert:</p>
        <p class="text-xs font-semibold text-slate-600 mt-1">Neukunden (4):</p>
        <ol class="list-decimal pl-4 space-y-1">
          <li><strong>Familie Richter</strong> — Empfehlung Bestandskunde, Komplettabsicherung</li>
          <li><strong>Jan Krüger</strong> — Berufsstart, BU + Haftpflicht</li>
          <li><strong>Dr. Eva Lorenz</strong> — PKV-Wechsel, Ärztetarif</li>
        </ol>
        <p class="text-xs font-semibold text-slate-600 mt-1">Bestandskunden (6):</p>
        <ol class="list-decimal pl-4 space-y-1">
          <li><strong>Braun Pflegezusatz</strong> — Ehepaar, Cross-Sell Potenzial</li>
          <li><strong>Schmidt BU-Erhöhung</strong> — Gehaltsanpassung, Nachversicherung</li>
          <li><strong>Weber LV-Ablauf 2028</strong> — Wiederanlage + Rentenvorsorge</li>
        </ol>
        <p class="text-xs text-slate-500 mt-2">→ Wechsel zum Tab <em>Potenziale</em> für Details...</p>
      </div>`,
      navigateTo: currentView === 'detail' ? 'impulse' : 'potentiale',
    };
  }

  if (lower.includes('bu') || lower.includes('berufsunfähigkeit')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">BU-Analyse</p>
        <p>Der Kunde weist aufgrund seines Berufsbilds <strong>(kaufm. Angestellter, 38 J.)</strong> ein moderates Risikoprofil auf.</p>
        <table class="w-full text-xs mt-2 border-collapse">
          <tr class="border-b border-slate-200"><td class="py-1 text-slate-500">Empfehlung</td><td class="py-1 font-medium">BU-Rente min. 1.800 €/mtl.</td></tr>
          <tr class="border-b border-slate-200"><td class="py-1 text-slate-500">Absicherungslücke</td><td class="py-1 font-medium text-red-600">ca. 1.200 €/Monat</td></tr>
          <tr><td class="py-1 text-slate-500">Extras</td><td class="py-1 font-medium">Nachversicherungsgarantie empfohlen</td></tr>
        </table>
      </div>`,
    };
  }

  if (lower.includes('cross-selling') || lower.includes('cross selling')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">Cross-Selling Chancen</p>
        <p>Basierend auf dem aktuellen Vertragsbestand:</p>
        <div class="space-y-2 mt-2">
          <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-emerald-500"></span><strong>bAV</strong> — AG-Zuschuss nicht ausgeschöpft <span class="ml-auto text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">85% Potenzial</span></div>
          <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-amber-500"></span><strong>Rechtsschutz</strong> — Kein bestehender Vertrag <span class="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">70% Potenzial</span></div>
          <div class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-blue-500"></span><strong>Unfallversicherung</strong> — Nur Grundschutz <span class="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">55% Potenzial</span></div>
        </div>
      </div>`,
    };
  }

  if (lower.includes('kundenpotenzial') || lower.includes('potenzial') || lower.includes('analysieren')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">Kundenpotenzial-Analyse</p>
        <table class="w-full text-xs mt-1 border-collapse">
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">Absicherungsgrad</td><td class="py-1.5 font-medium">62% <span class="text-amber-600">— Lücken bei AK & AV</span></td></tr>
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">Lebenssituation</td><td class="py-1.5 font-medium">Familiengründung vor 2 J. → RL + Kinderabsicherung</td></tr>
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">Einkommen</td><td class="py-1.5 font-medium text-emerald-600">Überdurchschnittlich → Kapitalanlage-Potenzial</td></tr>
          <tr><td class="py-1.5 text-slate-500">Nächster Impuls</td><td class="py-1.5 font-medium">Jahresgespräch in 3 Wochen terminieren</td></tr>
        </table>
      </div>`,
    };
  }

  if (lower.includes('gesprächsleitfaden') || lower.includes('gespräch') || lower.includes('leitfaden')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">Gesprächsleitfaden</p>
        <ol class="list-decimal pl-4 space-y-1.5 text-[13px]">
          <li><strong>Einstieg</strong> — Bezug auf letztes Gespräch, aktuelle Lebenssituation erfragen</li>
          <li><strong>Bedarfsanalyse</strong> — Veränderungen seit letztem Kontakt? Neue Wünsche/Sorgen?</li>
          <li><strong>Absicherungscheck</strong> — Bestehende Verträge gemeinsam durchgehen, Lücken aufzeigen</li>
          <li><strong>Empfehlung</strong> — Max. 2 konkrete Produktvorschläge unterbreiten</li>
          <li><strong>Abschluss</strong> — Nächste Schritte vereinbaren, Folgetermin festlegen</li>
        </ol>
        <div class="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
          💡 <strong>Tipp:</strong> Den Kunden zuerst erzählen lassen — offene Fragen stellen!
        </div>
      </div>`,
    };
  }

  if (lower.includes('kredit') || lower.includes('finanzierung')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">Kreditanalyse — Empfohlene Schritte</p>
        <ol class="list-decimal pl-4 space-y-1">
          <li><strong>Bonitätsprüfung</strong> — Schufa-Score und Einkommensnachweise prüfen</li>
          <li><strong>Kapitaldienstfähigkeit</strong> — Monatl. Belastungsquote (max. 35–40%)</li>
          <li><strong>Sicherheiten</strong> — Vorhandene Sicherheiten bewerten</li>
          <li><strong>Konditionsvergleich</strong> — Passende Kreditprodukte gegenüberstellen</li>
        </ol>
      </div>`,
    };
  }

  if (lower.includes('portfolio') || lower.includes('anlage') || lower.includes('depot')) {
    return {
      content: `<div class="space-y-2">
        <p class="font-semibold">Portfolio-Analyse</p>
        <table class="w-full text-xs mt-1 border-collapse">
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">Allokation</td><td class="py-1.5 font-medium">45% Aktien · 30% Anleihen · 15% Immo · 10% Cash</td></tr>
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">Risikoprofil</td><td class="py-1.5 font-medium">Ausgewogen (Stufe 3/5)</td></tr>
          <tr class="border-b border-slate-200"><td class="py-1.5 text-slate-500">Performance YTD</td><td class="py-1.5 font-medium text-emerald-600">+4,2% (Benchmark: +3,8%)</td></tr>
          <tr><td class="py-1.5 text-slate-500">Empfehlung</td><td class="py-1.5 font-medium">EU-Dividendenwerte ↑ · Liquidität auf 5% ↓</td></tr>
        </table>
      </div>`,
    };
  }

  return {
    content: `<div class="space-y-2">
      <p>Ich habe die relevanten Kundendaten und Vertriebsinformationen analysiert.</p>
      <p>Basierend auf dem aktuellen Bestand empfehle ich:</p>
      <ul class="list-disc pl-4 space-y-1">
        <li>Bestehende Vertragsbeziehungen prüfen</li>
        <li>Identifizierte Bedarfslücken gezielt ansprechen</li>
        <li>Nächsten Kundenkontakt terminieren</li>
      </ul>
      <p class="text-slate-500">Soll ich einen konkreten Bereich genauer analysieren?</p>
    </div>`,
  };
}

export default function VertriebsAssistent() {
  const { modeId, config, currentView, setActiveTab } = useMode();
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const hasAutoOpened = useRef(false);

  const { primary, primaryLight, gradient } = config.colors;

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
  }, [modeId]);

  const sendMessage = useCallback(
    (text) => {
      if (!text.trim() || isTyping) return;
      const userMsg = { role: 'user', content: text.trim() };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsTyping(true);

      setTimeout(() => {
        const result = currentView === 'cockpit'
          ? getCockpitDemoResponse(text)
          : getDemoResponse(text, { currentView, modeId });
        setMessages((prev) => [...prev, { role: 'assistant', content: result.content, isHtml: true }]);
        setIsTyping(false);

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
    [isTyping, currentView, setActiveTab],
  );

  const handleSend = () => sendMessage(input);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const welcomeMessage = currentView === 'cockpit'
    ? 'Hallo! Ich kann dir bei der Analyse deiner Dashboard-Daten helfen. Hier sind einige Vorschläge:'
    : (WELCOME_MESSAGES[modeId] || WELCOME_MESSAGES.versicherung);
  const quickActions = currentView === 'cockpit' ? COCKPIT_QUICK_ACTIONS : (QUICK_ACTIONS[modeId] || QUICK_ACTIONS.versicherung);

  // Don't show on landing page
  if (currentView === 'landing') return null;

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{ background: gradient }}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-105 transition-transform"
          title="KI-Vertriebsassistent öffnen"
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
              <span className="text-sm font-semibold">KI-Vertriebsassistent</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-white/80 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                  {' '}Analysiere...
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
                placeholder="Nachricht eingeben..."
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
