import { useState, useEffect, useRef, useCallback } from 'react';
import { UserPlus, Activity, Eye, EyeOff, MapPin, Calendar, Briefcase, CheckCircle, XCircle, Bookmark, HelpCircle, Send, FileText, Phone, Video, Building, ChevronDown } from 'lucide-react';
import { HP_POSITIONS } from '../../data/positions';
import { HP_ALL_APPLICANTS, anonymizeText } from '../../data/applicants';
import { useToast } from '../../hooks/useToast';
import { useInstitut } from '../../hooks/useInstitut';
import WaterfallChart from '../shared/WaterfallChart';
import SkillGapChart from '../shared/SkillGapChart';

function getBlindId(applicantId) {
  const idx = HP_ALL_APPLICANTS.findIndex(a => a.id === applicantId);
  return String(idx + 1).padStart(3, '0');
}

// ======== KPI Section ========
function KPISection() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const animateValue = (target) => animated ? target : 0;

  return (
    <div className="hp-kpi-section">
      <div className="hp-kpi-group-label">
        <UserPlus size={14} /> Bewerbungseingang
      </div>
      <div className="hp-kpi-bar" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="hp-kpi-card">
          <div className="hp-kpi-label">Bewerbungen</div>
          <div className="hp-kpi-value">{animateValue(47)}</div>
          <div className="hp-kpi-desc">Eingegangene Bewerbungen der letzten 30 Tage</div>
          <div className="hp-kpi-trend up">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
            +12% vs. Vormonat
          </div>
        </div>
        <div className="hp-kpi-card">
          <div className="hp-kpi-label">Durchschnittlicher Score</div>
          <div className="hp-kpi-value blue">{animateValue(68)}/100</div>
          <div className="hp-kpi-desc">Mittlerer KI-Score aller Bewerbungen (max. 100)</div>
          <div className="hp-kpi-trend up">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
            +3 Punkte
          </div>
        </div>
        <div className="hp-kpi-card">
          <div className="hp-kpi-label">Empfohlene Kandidaten</div>
          <div className="hp-kpi-value green">{animateValue(12)}</div>
          <div className="hp-kpi-desc">Kandidaten mit KI-Empfehlung „Einladen"</div>
          <div className="hp-kpi-trend up">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
            +4 diese Woche
          </div>
        </div>
      </div>

      <div className="hp-kpi-group-label">
        <Activity size={14} /> Recruiting-Pipeline
      </div>
      <div className="hp-kpi-bar" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {[
          { label: 'Eingeladen', value: '58%', cls: 'blue', desc: 'Anteil Bewerber mit Einladung zum Gespräch', trend: '+6% vs. Vormonat' },
          { label: 'Angebot unterbreitet', value: '23%', cls: '', desc: 'Anteil Bewerber, die ein Vertragsangebot erhalten', trend: '+2% vs. Vormonat' },
          { label: 'Eingestellt', value: '15%', cls: 'green', desc: 'Anteil Bewerber mit unterschriebenem Vertrag', trend: '+3% vs. Vormonat' },
          { label: 'KI-Genauigkeit', value: '94,7%', cls: 'green', desc: 'Recruiter-Übernahme der KI-Empfehlung (12 Monate)', trend: '+1,2% vs. Vorjahr' },
        ].map((kpi, i) => (
          <div key={i} className="hp-kpi-card">
            <div className="hp-kpi-label">{kpi.label}</div>
            <div className={`hp-kpi-value ${kpi.cls}`}>{kpi.value}</div>
            <div className="hp-kpi-desc">{kpi.desc}</div>
            <div className="hp-kpi-trend up">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
              {kpi.trend}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ======== Applicant Card ========
function ApplicantCard({ applicant, isBlind, onClick }) {
  const scoreClass = applicant.totalScore >= 80 ? 'high' : applicant.totalScore >= 60 ? 'mid' : 'low';
  const statusLabel = applicant.status === 'recommended' ? 'Empfohlen' : applicant.status === 'review' ? 'Prüfen' : 'Ablehnung empfohlen';
  const appliedPos = applicant.appliedPositionId ? HP_POSITIONS.find(p => p.id === applicant.appliedPositionId) : null;
  const dateStr = applicant.appliedDate ? new Date(applicant.appliedDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

  return (
    <div
      className={`hp-applicant-card ${applicant.status === 'rejected' ? 'rejection' : ''} ${isBlind ? 'blind' : ''}`}
      onClick={onClick}
    >
      <div className={`hp-applicant-score ${scoreClass}`}>{applicant.totalScore}</div>
      {!isBlind && applicant.photo ? (
        <img src={applicant.photo} alt={applicant.name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
      ) : (
        <div className="hp-profile-avatar-small">{isBlind ? `#${getBlindId(applicant.id)}` : applicant.initials}</div>
      )}
      <div className="hp-applicant-info">
        <h4>{isBlind ? `Kandidat/in #${getBlindId(applicant.id)}` : applicant.name}</h4>
        <div className="hp-applicant-location">
          {isBlind ? applicant.region?.toUpperCase() : `${applicant.city} | ${applicant.age} Jahre`}
        </div>
        {appliedPos && !isBlind && (
          <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <span>{dateStr}</span>
            <span style={{ color: 'var(--border)' }}>|</span>
            <span className="hp-tag" style={{ fontSize: 'var(--font-xs)' }}>{appliedPos.title}, {appliedPos.city}</span>
          </div>
        )}
        <div className="hp-applicant-summary">
          {isBlind ? anonymizeText(applicant.summary, applicant) : (applicant.summary || '')}
        </div>
        <div className="hp-tags">
          {(applicant.strengths || []).slice(0, 3).map((s, i) => <span key={i} className="hp-tag">{s}</span>)}
        </div>
      </div>
      <div className="hp-applicant-status">
        <span className={`hp-status-badge ${applicant.status}`}>{statusLabel}</span>
        {applicant.koKriterium && (
          <span className="hp-status-badge" style={{ background: '#fef2f2', color: '#DC2626', border: '1px solid #fecaca', fontWeight: 700 }}>
            Kritischer Ablehnungsgrund („KO")
          </span>
        )}
      </div>
    </div>
  );
}

// ======== Detail Overlay ========
function DetailOverlay({ applicant, isBlind, onClose }) {
  const showToast = useToast();
  const [actionView, setActionView] = useState(null); // null | 'einladen' | 'ablehnen'
  const [interviewOpen, setInterviewOpen] = useState(false);

  if (!applicant) return null;

  const displayName = isBlind ? `Kandidat/in #${getBlindId(applicant.id)}` : applicant.name;
  const scoreClass = applicant.totalScore >= 80 ? 'high' : applicant.totalScore >= 60 ? 'mid' : 'low';
  const appliedPos = applicant.appliedPositionId ? HP_POSITIONS.find(p => p.id === applicant.appliedPositionId) : null;
  const dateStr = applicant.appliedDate ? new Date(applicant.appliedDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

  const scoreCategories = [
    { label: 'Vertriebserfahrung (30%)', value: applicant.scores?.vertrieb || 0 },
    { label: 'Branchenkenntnis (25%)', value: applicant.scores?.branche || 0 },
    { label: 'Qualifikation (20%)', value: applicant.scores?.qualifikation || 0 },
    { label: 'Standort-Match (15%)', value: applicant.scores?.standort || 0 },
    { label: 'Soft Skills (10%)', value: applicant.scores?.softskills || 0 },
  ];

  const handleAction = (type) => {
    if (type === 'merken') { showToast?.(`${displayName} wurde vorgemerkt`, 'info'); return; }
    setActionView(type);
  };

  return (
    <>
      <div className="hp-detail-overlay active" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="hp-detail-panel">
          <div className="hp-detail-header">
            <h3>{displayName}</h3>
            <button className="hp-detail-close" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div className="hp-detail-split">
            <div className="hp-detail-analysis">
              <div className="hp-detail-body">
                {/* Header */}
                <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', alignItems: 'center' }}>
                  {!isBlind && applicant.photo ? (
                    <img src={applicant.photo} alt={applicant.name} className="hp-profile-avatar-large hp-photo-hover" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div className="hp-profile-avatar-large">{isBlind ? `#${getBlindId(applicant.id)}` : applicant.initials}</div>
                  )}
                  <div>
                    <div style={{ fontSize: 'var(--font-lg)', fontWeight: 'var(--font-bold)', color: 'var(--text-primary)' }}>{displayName}</div>
                    <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                      {isBlind ? `${applicant.region?.toUpperCase()} | — Jahre | ${applicant.experience}` : `${applicant.city} | ${applicant.age} Jahre | ${applicant.experience}`}
                    </div>
                    {(applicant.certifications || []).length > 0 && (
                      <div className="hp-tags" style={{ marginTop: 'var(--space-2)' }}>
                        {applicant.certifications.map((c, i) => <span key={i} className="hp-tag cert">{c}</span>)}
                      </div>
                    )}
                    {appliedPos && (
                      <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <Calendar size={12} />
                        Bewerbung vom {dateStr}
                        <span style={{ color: 'var(--border)' }}>|</span>
                        <span style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{appliedPos.title}, {appliedPos.city}</span>
                      </div>
                    )}
                  </div>
                  <div className={`hp-applicant-score ${scoreClass}`} style={{ marginLeft: 'auto', width: 56, height: 56, fontSize: 'var(--font-lg)' }}>
                    {applicant.totalScore}
                  </div>
                </div>

                {/* Summary */}
                <div className="hp-ki-summary" style={{ marginBottom: 'var(--space-6)' }}>
                  <strong>KI-Zusammenfassung:</strong> {isBlind ? anonymizeText(applicant.summary, applicant) : applicant.summary}
                </div>

                {/* KO Kriterium */}
                {applicant.koKriterium && (
                  <div style={{ background: '#fef2f2', border: '2px solid #DC2626', borderRadius: 'var(--radius-md)', padding: 'var(--space-4) var(--space-5)', marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" width="24" height="24" style={{ flexShrink: 0, marginTop: 2 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    <div>
                      <div style={{ fontWeight: 700, color: '#DC2626', fontSize: 'var(--font-base)', marginBottom: 'var(--space-1)' }}>Kritischer Ablehnungsgrund („KO")</div>
                      <div style={{ color: '#991b1b', fontSize: 'var(--font-sm)' }}>{applicant.koKriterium}</div>
                    </div>
                  </div>
                )}

                {/* Waterfall */}
                <WaterfallChart waterfall={applicant.waterfall} />

                {/* Score Breakdown */}
                <div className="hp-score-breakdown">
                  <h4>Score-Aufschlüsselung</h4>
                  {scoreCategories.map((cat, i) => {
                    const barClass = cat.value >= 70 ? 'high' : cat.value >= 40 ? 'mid' : 'low';
                    return (
                      <div key={i} className="hp-score-bar-row">
                        <div className="hp-score-bar-label">{cat.label}</div>
                        <div className="hp-score-bar-track"><div className={`hp-score-bar-value ${barClass}`} style={{ width: `${cat.value}%` }} /></div>
                        <div className="hp-score-bar-num">{cat.value}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Skill Gap */}
                <SkillGapChart skillGap={applicant.skillGap} />

                {/* Counterfactual */}
                {applicant.counterfactual && (
                  <div className="hp-counterfactual">
                    <HelpCircle size={16} />
                    <div className="hp-counterfactual-text">{applicant.counterfactual}</div>
                  </div>
                )}

                {/* Strengths / Weaknesses */}
                <div className="hp-strengths-weaknesses" style={{ marginTop: 'var(--space-6)' }}>
                  <div className="hp-sw-section strengths">
                    <h4>Stärken</h4>
                    <ul className="hp-sw-list">
                      {(applicant.strengths || []).map((s, i) => (
                        <li key={i}><svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="hp-sw-section weaknesses">
                    <h4>Schwächen</h4>
                    <ul className="hp-sw-list">
                      {(applicant.weaknesses || []).map((w, i) => (
                        <li key={i}><svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>{w}</li>
                      ))}
                      {(applicant.neutrals || []).map((n, i) => (
                        <li key={`n${i}`} style={{ color: 'var(--text-tertiary)' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>{n}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {!actionView ? (
            <div className="hp-detail-actions">
              <button className="hp-action-btn primary" onClick={() => handleAction('einladen')}>
                <CheckCircle size={16} /> Einladen
              </button>
              <button className="hp-action-btn danger" onClick={() => handleAction('ablehnen')}>
                <XCircle size={16} /> Ablehnen
              </button>
              <button className="hp-action-btn" onClick={() => handleAction('merken')}>
                <Bookmark size={16} /> Merken
              </button>
              <button className="hp-action-btn" onClick={() => setInterviewOpen(true)}>
                <HelpCircle size={16} /> Interviewfragen
              </button>
            </div>
          ) : actionView === 'einladen' ? (
            <InviteWorkflow name={displayName} onCancel={() => setActionView(null)} onConfirm={() => { showToast?.(`Einladung an ${displayName} gesendet`, 'success'); onClose(); }} />
          ) : (
            <RejectWorkflow name={displayName} onCancel={() => setActionView(null)} onConfirm={() => { showToast?.(`Absage an ${displayName} gesendet`, 'warning'); onClose(); }} />
          )}
        </div>
      </div>

      {/* Interview Questions Overlay */}
      {interviewOpen && applicant.interviewQuestions && (
        <InterviewOverlay applicant={applicant} onClose={() => setInterviewOpen(false)} />
      )}
    </>
  );
}

// ======== Invite Workflow ========
function InviteWorkflow({ name, onCancel, onConfirm }) {
  const [type, setType] = useState('video');
  const [dateIdx, setDateIdx] = useState(0);
  const [interviewer, setInterviewer] = useState('mueller');

  const dates = generateDateOptions();

  return (
    <div className="hp-detail-actions" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div className="hp-workflow-panel">
        <div className="hp-workflow-header">
          <h4>Einladung für {name}</h4>
          <button className="hp-workflow-close" onClick={onCancel}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="hp-workflow-step">
          <label className="hp-workflow-label">Gesprächsformat</label>
          <div className="hp-workflow-options">
            {[
              { value: 'video', label: 'Video-Interview', icon: <Video size={18} /> },
              { value: 'telefon', label: 'Telefoninterview', icon: <Phone size={18} /> },
              { value: 'vor-ort', label: 'Vor-Ort-Gespräch', icon: <Building size={18} /> },
            ].map(opt => (
              <button key={opt.value} className={`hp-workflow-option ${type === opt.value ? 'selected' : ''}`} onClick={() => setType(opt.value)}>
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="hp-workflow-step">
          <label className="hp-workflow-label">Terminvorschlag</label>
          <div className="hp-workflow-options">
            {dates.map((d, i) => (
              <button key={i} className={`hp-workflow-option ${dateIdx === i ? 'selected' : ''}`} onClick={() => setDateIdx(i)}>{d.label}</button>
            ))}
          </div>
        </div>
        <div className="hp-workflow-step">
          <label className="hp-workflow-label">Interviewer</label>
          <div className="hp-workflow-options">
            {[
              { value: 'mueller', name: 'Sandra Müller', role: 'Teamleiterin Recruiting', initials: 'SM' },
              { value: 'fischer', name: 'Martin Fischer', role: 'Abteilungsleiter Vertrieb', initials: 'MF' },
              { value: 'schmidt', name: 'Katrin Schmidt', role: 'HR Business Partner', initials: 'KS' },
            ].map(opt => (
              <button key={opt.value} className={`hp-workflow-option ${interviewer === opt.value ? 'selected' : ''}`} onClick={() => setInterviewer(opt.value)}>
                <span className="hp-workflow-avatar">{opt.initials}</span>
                {opt.name}<span className="hp-workflow-role">{opt.role}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="hp-workflow-actions">
          <button className="hp-action-btn" onClick={onCancel}>Abbrechen</button>
          <button className="hp-action-btn primary" onClick={onConfirm}><Send size={14} /> Einladung senden</button>
        </div>
      </div>
    </div>
  );
}

// ======== Reject Workflow ========
function RejectWorkflow({ name, onCancel, onConfirm }) {
  const { institut } = useInstitut();
  const [template, setTemplate] = useState('standard');
  const iName = institut.institut;

  const templates = {
    standard: `Sehr geehrte/r ${name},\n\nvielen Dank für Ihre Bewerbung und Ihr Interesse an ${iName}. Nach sorgfältiger Prüfung müssen wir Ihnen leider mitteilen, dass wir uns für andere Kandidat/innen entschieden haben.\n\nWir wünschen Ihnen für Ihre berufliche Zukunft alles Gute.\n\nMit freundlichen Grüßen\n${iName} Recruiting Team`,
    talentpool: `Sehr geehrte/r ${name},\n\nvielen Dank für Ihre Bewerbung. Leider können wir Ihnen aktuell keine passende Position anbieten. Ihr Profil hat uns jedoch überzeugt — wir möchten Sie gerne in unseren Talent-Pool aufnehmen und Sie kontaktieren, sobald eine geeignete Stelle frei wird.\n\nMit freundlichen Grüßen\n${iName} Recruiting Team`,
    empfehlung: `Sehr geehrte/r ${name},\n\nvielen Dank für Ihre Bewerbung. Für die ausgeschriebene Position können wir Ihnen leider kein Angebot machen. Wir empfehlen Ihnen jedoch, sich auf andere offene Stellen in unserem Karriereportal umzusehen, die besser zu Ihrem Profil passen könnten.\n\nMit freundlichen Grüßen\n${iName} Recruiting Team`
  };

  return (
    <div className="hp-detail-actions" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div className="hp-workflow-panel rejection">
        <div className="hp-workflow-header">
          <h4>Absage für {name}</h4>
          <button className="hp-workflow-close" onClick={onCancel}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="hp-workflow-step">
          <label className="hp-workflow-label">E-Mail-Vorlage</label>
          <div className="hp-workflow-options">
            <button className={`hp-workflow-option ${template === 'standard' ? 'selected' : ''}`} onClick={() => setTemplate('standard')}>Standard-Absage</button>
            <button className={`hp-workflow-option ${template === 'talentpool' ? 'selected' : ''}`} onClick={() => setTemplate('talentpool')}>Absage + Talent-Pool</button>
            <button className={`hp-workflow-option ${template === 'empfehlung' ? 'selected' : ''}`} onClick={() => setTemplate('empfehlung')}>Absage + Empfehlung</button>
          </div>
        </div>
        <div className="hp-workflow-step">
          <label className="hp-workflow-label">Vorschau</label>
          <div className="hp-workflow-preview">
            <div className="hp-email-preview" dangerouslySetInnerHTML={{ __html: templates[template].replace(/\n/g, '<br>') }} />
          </div>
        </div>
        <div className="hp-workflow-actions">
          <button className="hp-action-btn" onClick={onCancel}>Abbrechen</button>
          <button className="hp-action-btn danger" onClick={onConfirm}><Send size={14} /> Absage senden</button>
        </div>
      </div>
    </div>
  );
}

// ======== Interview Questions Overlay ========
function InterviewOverlay({ applicant, onClose }) {
  const categories = [
    { key: 'background', title: 'Hintergrund-Verifizierung' },
    { key: 'behavioral', title: 'Verhaltens-/STAR-Fragen' },
    { key: 'technical', title: 'Fachliche Fragen' },
  ];

  return (
    <div className="hp-detail-overlay active" style={{ zIndex: 1001 }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="hp-detail-panel">
        <div className="hp-detail-header">
          <h3>KI-generierte Interviewfragen</h3>
          <button className="hp-detail-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="hp-detail-body">
          <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
            KI-generierte Interviewfragen für <strong>{applicant.name}</strong> (Score: {applicant.totalScore}) — basierend auf CV-Analyse und Zielposition.
          </div>
          {categories.map(cat => {
            const questions = applicant.interviewQuestions?.[cat.key];
            if (!questions?.length) return null;
            return (
              <div key={cat.key} className="hp-interview-category">
                <h4>{cat.title}</h4>
                {questions.map((q, i) => (
                  <div key={i} className="hp-interview-question">
                    {q.q}
                    <div className="hp-interview-why">Warum diese Frage: {q.why}</div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function generateDateOptions() {
  const options = [];
  const now = new Date();
  const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const times = ['10:00', '14:00', '11:00'];
  let count = 0;
  for (let i = 1; count < 3; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    options.push({
      value: d.toISOString().split('T')[0],
      label: `${dayNames[d.getDay()]}, ${d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} · ${times[count]} Uhr`
    });
    count++;
  }
  return options;
}

// ======== Main Arbeitgeber Mode ========
export default function ArbeitgeberMode() {
  const showToast = useToast();
  const [blindScreening, setBlindScreening] = useState(false);
  const [filterRegion, setFilterRegion] = useState('');
  const [filterScore, setFilterScore] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [detailApplicant, setDetailApplicant] = useState(null);

  const toggleBlind = () => {
    setBlindScreening(prev => {
      showToast?.(!prev ? 'Blind Screening aktiviert (AGG-konform)' : 'Blind Screening deaktiviert', 'info');
      return !prev;
    });
  };

  const filteredApplicants = HP_ALL_APPLICANTS.filter(a => {
    if (filterRegion && a.region !== filterRegion) return false;
    if (filterScore) {
      if (filterScore === 'high' && a.totalScore < 80) return false;
      if (filterScore === 'mid' && (a.totalScore < 60 || a.totalScore >= 80)) return false;
      if (filterScore === 'low' && a.totalScore >= 60) return false;
    }
    if (filterStatus && a.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="hp-employer-section active">
      {/* Toolbar */}
      <div className="hp-employer-toolbar">
        <div className="hp-employer-toolbar-left">
          <h3 className="hp-employer-section-title">Recruiting Dashboard</h3>
        </div>
        <div className="hp-employer-toolbar-right">
          <label className="hp-blind-toggle" title="Anonymisierte Ansicht (AGG-konform)">
            <input type="checkbox" checked={blindScreening} onChange={toggleBlind} />
            <span className="hp-blind-toggle-slider" />
            {blindScreening ? <EyeOff size={14} /> : <Eye size={14} />}
            Blind Screening
          </label>
        </div>
      </div>

      <KPISection />

      {/* Filters */}
      <div className="hp-filters">
        <select className="hp-filter-select" value={filterRegion} onChange={e => setFilterRegion(e.target.value)}>
          <option value="">Alle Regionen</option>
          <option value="nrw">Nordrhein-Westfalen</option>
          <option value="nord">Norddeutschland</option>
          <option value="sued">Süddeutschland</option>
        </select>
        <select className="hp-filter-select" value={filterScore} onChange={e => setFilterScore(e.target.value)}>
          <option value="">Alle Scores</option>
          <option value="high">Score &gt; 80</option>
          <option value="mid">Score 60-80</option>
          <option value="low">Score &lt; 60</option>
        </select>
        <select className="hp-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Alle Status</option>
          <option value="recommended">Empfohlen</option>
          <option value="review">Prüfen</option>
          <option value="rejected">Ablehnung empfohlen</option>
        </select>
      </div>

      {/* Applicant Grid */}
      <div className="hp-applicant-grid">
        {filteredApplicants.map(applicant => (
          <ApplicantCard
            key={applicant.id}
            applicant={applicant}
            isBlind={blindScreening}
            onClick={() => setDetailApplicant(applicant)}
          />
        ))}
      </div>

      {detailApplicant && (
        <DetailOverlay
          applicant={detailApplicant}
          isBlind={blindScreening}
          onClose={() => setDetailApplicant(null)}
        />
      )}
    </div>
  );
}
