import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Search, Info, MapPin, AlertCircle, TrendingUp, BarChart3, Star, Mail, Home, List, CheckCircle, Edit, User } from 'lucide-react';

const ICON_MAP = {
  search: Search, info: Info, map: MapPin, alert: AlertCircle, trending: TrendingUp,
  bar: BarChart3, star: Star, mail: Mail, home: Home, list: List, check: CheckCircle,
  edit: Edit, user: User,
};

const BEWERBER_START = [
  { label: 'Welche Stellen passen zu mir?', icon: 'search', action: 'stellen_passend' },
  { label: 'Was sind die Anforderungen?', icon: 'info', action: 'anforderungen' },
  { label: 'Stellen in meiner Nähe?', icon: 'map', action: 'stellen_naehe' },
  { label: 'Warum wurde ich abgelehnt?', icon: 'alert', action: 'ablehnung' },
  { label: 'Profil verbessern?', icon: 'trending', action: 'profil_verbessern' },
];

const ARBEITGEBER_START = [
  { label: 'Pipeline-Überblick', icon: 'bar', action: 'pipeline' },
  { label: 'Top Kandidaten', icon: 'star', action: 'top_kandidaten' },
  { label: 'Kritische Bewerbungen', icon: 'alert', action: 'kritische' },
  { label: 'Absage-Mail generieren', icon: 'mail', action: 'absage_mail' },
  { label: 'Matching-Kriterien', icon: 'info', action: 'matching_kriterien' },
];

const RESPONSES = {
  anforderungen: {
    text: 'Für Vertriebspositionen bei ERGO gelten folgende Kernqualifikationen:\n\n- IHK-Sachkundeprüfung §34d GewO\n- Erfahrung in Kundenberatung und Vertrieb\n- Für Führungspositionen: Fachwirt IHK\n- IDD-Weiterbildung (15 Std./Jahr Pflicht)\n\nQuereinsteiger: Unser Trainee-Programm (6 Monate) beinhaltet die IHK §34d.',
    followUp: [
      { label: 'Quereinsteiger-Programm', icon: 'trending', action: 'quereinsteiger' },
      { label: 'Zurück zum Start', icon: 'home', action: 'start' },
    ],
  },
  profil_verbessern: {
    text: 'Empfehlungen zur Score-Verbesserung:\n\n1. IHK Sachkundeprüfung §34d ablegen (+15 Punkte)\n2. Vertriebserfahrung sammeln\n3. IDD-Weiterbildung absolvieren\n4. Fachwirt IHK für Führungspositionen\n\nJede dieser Maßnahmen erhöht Ihren Match-Score signifikant.',
    followUp: [
      { label: 'Quereinsteiger-Programm', icon: 'trending', action: 'quereinsteiger' },
      { label: 'Zurück zum Start', icon: 'home', action: 'start' },
    ],
  },
  quereinsteiger: {
    text: 'Das ERGO Quereinsteiger-Programm:\n\n- 6 Monate begleitete Ausbildung\n- IHK-Sachkundeprüfung §34d inklusive\n- IDD-Weiterbildung integriert\n- Mentoring durch erfahrene Vertriebspartner\n- Garantierte Übernahme bei Erfolg\n\nStart: Quartalsweise in NRW und Hamburg.',
    followUp: [{ label: 'Zurück zum Start', icon: 'home', action: 'start' }],
  },
  stellen_passend: {
    text: 'Basierend auf dem aktuellen Profil habe ich Top-Matches identifiziert:\n\n1. Agenturleiter Düsseldorf - 92% Match\n2. Vertriebsspezialist Leben Köln - 85% Match\n3. Maklerbetreuer Essen - 80% Match\n\nSoll ich Ihnen mehr Details zeigen?',
    followUp: [
      { label: 'Alle Stellen', icon: 'list', action: 'stellen_passend' },
      { label: 'Zurück zum Start', icon: 'home', action: 'start' },
    ],
  },
  stellen_naehe: {
    text: 'Stellen im näheren Umkreis (NRW):\n\n- Agenturleiter Düsseldorf (0 km)\n- Maklerbetreuer Essen (30 km)\n- Ausschließlichkeitsvermittler Dortmund (60 km)',
    followUp: [{ label: 'Zurück zum Start', icon: 'home', action: 'start' }],
  },
  ablehnung: {
    text: 'Die KI-Analyse zeigt folgende Lücken:\n\n- Keine Vertriebserfahrung\n- Keine §34d GewO Qualifikation\n- Standort ohne offene Stellen\n\nEmpfehlung: Unser Quereinsteiger-Programm bietet einen strukturierten Einstieg.',
    followUp: [
      { label: 'Quereinsteiger-Programm', icon: 'trending', action: 'quereinsteiger' },
      { label: 'Zurück zum Start', icon: 'home', action: 'start' },
    ],
  },
  pipeline: {
    text: 'Recruiting-Pipeline:\n\n- 47 Bewerbungen (+12% vs. Vormonat)\n- 12 empfohlen (Score >80)\n- 18 zur Prüfung (Score 60-80)\n- 17 Ablehnungen (Score <60)\n- Ø Score: 68 (+3 Punkte)\n- EU AI Act Status: Konform',
    followUp: [
      { label: 'Top 5 Kandidaten', icon: 'star', action: 'top_kandidaten' },
      { label: 'Zurück zum Start', icon: 'home', action: 'start' },
    ],
  },
  top_kandidaten: {
    text: 'Top-3 Kandidaten:\n\n1. Max Berger (92) — 8J Allianz AO, IHK §34d\n2. Julia Hoffmann (88) — 5J HDI Makler\n3. Markus Scholz (84) — 6J Sparkasse, §34f\n\nAlle erfüllen die Mindestanforderungen.',
    followUp: [{ label: 'Zurück zum Start', icon: 'home', action: 'start' }],
  },
  kritische: {
    text: 'Bewerbungen mit Score <40:\n\n1. Thomas Wendt (31) — Verwaltung, keine §34d\n2. Frank Bergmann (38) — Lagerlogistik\n3. Sabine Richter (42) — Gastgewerbe\n\nEmpfehlung: Standardisierte Absage mit Quereinsteiger-Hinweis.',
    followUp: [
      { label: 'Absage generieren', icon: 'mail', action: 'absage_mail' },
      { label: 'Zurück zum Start', icon: 'home', action: 'start' },
    ],
  },
  absage_mail: {
    text: 'Absage-Entwurf:\n\n"Sehr geehrte/r Bewerber/in,\n\nvielen Dank für Ihr Interesse an einer Vertriebsposition bei ERGO. Nach Prüfung Ihrer Unterlagen können wir Ihre Bewerbung derzeit leider nicht berücksichtigen.\n\nWir möchten Sie auf unser Quereinsteiger-Programm hinweisen.\n\nMit freundlichen Grüßen,\nERGO Recruiting-Team"',
    followUp: [{ label: 'Zurück zum Start', icon: 'home', action: 'start' }],
  },
  matching_kriterien: {
    text: 'KI-Score Zusammensetzung:\n\n- Vertriebserfahrung (30%)\n- Branchenkenntnis (25%)\n- Qualifikation (20%)\n- Standort-Match (15%)\n- Soft Skills (10%)\n\nGewichtung folgt EU AI Act (Anhang III) mit dokumentierter Bias-Prüfung.',
    followUp: [{ label: 'Zurück zum Start', icon: 'home', action: 'start' }],
  },
};

export default function ChatBot({ mode }) {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [buttons, setButtons] = useState([]);
  const [typing, setTyping] = useState(false);
  const messagesRef = useRef(null);

  const startButtons = mode === 'bewerber' ? BEWERBER_START : ARBEITGEBER_START;

  const initChat = useCallback(() => {
    setMessages([{ type: 'bot', text: 'Hallo! Ich bin der ERGO KI-Recruiting-Assistent. Wie kann ich Ihnen helfen?' }]);
    setButtons(startButtons);
  }, [startButtons]);

  useEffect(() => { initChat(); }, [initChat]);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  const handleAction = (action) => {
    if (action === 'start') { initChat(); return; }
    const response = RESPONSES[action];
    if (!response) return;

    const allBtns = [...startButtons, ...Object.values(RESPONSES).flatMap(r => r.followUp || [])];
    const clicked = allBtns.find(b => b.action === action);
    if (clicked) setMessages(prev => [...prev, { type: 'user', text: clicked.label }]);

    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { type: 'bot', text: response.text }]);
      if (response.followUp) setButtons(response.followUp);
    }, 800 + Math.random() * 400);
  };

  return (
    <>
      <button className="hp-chat-toggle" onClick={() => setOpen(!open)}>
        <MessageSquare size={20} />
      </button>

      {open && (
        <div className="hp-chat-window open">
          <div className="hp-chat-header">
            <div className="hp-chat-bot-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/>
              </svg>
            </div>
            <div className="hp-chat-header-text">
              <h4>ERGO KI-Assistent</h4>
              <span>Recruiting-Unterstützung</span>
            </div>
            <button className="hp-chat-close" onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </div>
          <div className="hp-chat-messages" ref={messagesRef}>
            {messages.map((m, i) => (
              <div key={i} className={`hp-chat-bubble ${m.type}`} dangerouslySetInnerHTML={{ __html: m.text.replace(/\n/g, '<br>') }} />
            ))}
            {typing && (
              <div className="hp-chat-typing">
                <span /><span /><span />
              </div>
            )}
          </div>
          <div className="hp-chat-buttons">
            {buttons.map((btn, i) => {
              const Icon = ICON_MAP[btn.icon];
              return (
                <button key={i} className="hp-chat-btn" onClick={() => handleAction(btn.action)}>
                  {Icon && <Icon size={14} />}
                  {btn.label}
                </button>
              );
            })}
          </div>
          <div className="hp-chat-input-area">
            <div className="hp-chat-input-wrapper">
              <input type="text" placeholder="Demo-Modus -- bitte Buttons nutzen" disabled />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
