import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Upload, ChevronDown, ChevronLeft, MapPin, Calendar, Briefcase, Activity, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { getHRData, HP_DISTANCES_EXT, getHPMatchScoreExt, getHPMatchBadgesExt } from '../../data/hrData';
import { useToast } from '../../hooks/useToast';
import { useInstitut } from '../../hooks/useInstitut';
import ScoreRing from '../shared/ScoreRing';
import WaterfallChart from '../shared/WaterfallChart';

function getMatchesForProfile(profile, positions, mode) {
  return positions.map(pos => {
    const score = getHPMatchScoreExt(profile, pos, mode);
    const distance = HP_DISTANCES_EXT[profile.city]?.[pos.city] ?? 999;
    const badges = getHPMatchBadgesExt(profile, pos, mode);
    return { position: pos, score, distance, badges, recommended: score >= 85 && distance <= 50 };
  }).sort((a, b) => b.score - a.score);
}

// Typewriter effect hook
function useTypewriter(text, speed = 12) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(prev => prev + text.charAt(i));
        i++;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return { displayed, done };
}

function KiSummary({ text }) {
  const { displayed, done } = useTypewriter(text);
  return (
    <div className="hp-ki-summary">
      <strong>KI-Zusammenfassung:</strong>{' '}
      <span>{displayed}</span>
      {!done && <span className="hp-typewriter-cursor" />}
    </div>
  );
}

// ======== Upload / Landing Section ========
function UploadSection({ onLoadProfile, onJobDetail, hrData }) {
  const { institut } = useInstitut();
  const [linkedinChecked, setLinkedinChecked] = useState(true);
  const [demosExpanded, setDemosExpanded] = useState(false);
  const fileInputRef = useRef(null);
  const { positions, ui } = hrData;

  return (
    <div className="hp-upload-section">
      {/* Hero */}
      <div className="hp-landing-hero">
        <div className="hp-landing-hero-content">
          <div className="hp-landing-badge">
            <CheckCircle size={14} />
            KI-gestützte Stellensuche
          </div>
          <h2 className="hp-landing-title">Willkommen im {institut.institut} {ui.portalTitle}</h2>
          <p className="hp-landing-subtitle">{ui.landingSubtitle}</p>
          <div className="hp-landing-cta">
            <button className="hp-landing-upload-btn" onClick={() => fileInputRef.current?.click()}>
              <Upload size={18} />
              Lebenslauf hochladen
            </button>
            <span className="hp-landing-formats">PDF oder DOCX</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={() => onLoadProfile(ui.defaultProfileId)}
              style={{ display: 'none' }}
            />
          </div>
          <label className="hp-linkedin-toggle">
            <input type="checkbox" checked={linkedinChecked} onChange={e => setLinkedinChecked(e.target.checked)} />
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style={{ color: '#0A66C2' }}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            <span>LinkedIn &amp; Social-Media-Profile automatisch analysieren</span>
          </label>
        </div>
        <div className="hp-landing-hero-visual">
          <div className="hp-landing-stats">
            <div className="hp-landing-stat">
              <div className="hp-landing-stat-value">{positions.length}</div>
              <div className="hp-landing-stat-label">Offene Stellen</div>
            </div>
            <div className="hp-landing-stat">
              <div className="hp-landing-stat-value">{ui.statsFocusRegion}</div>
              <div className="hp-landing-stat-label">{ui.statsFocusLabel}</div>
            </div>
            <div className="hp-landing-stat">
              <div className="hp-landing-stat-value">&lt;30s</div>
              <div className="hp-landing-stat-label">KI-Analyse</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="hp-landing-features">
        <div className="hp-landing-feature">
          <div className="hp-landing-feature-icon"><Upload size={24} /></div>
          <h4>1. Lebenslauf hochladen</h4>
          <p>Laden Sie Ihren Lebenslauf als PDF oder DOCX hoch — sicher und DSGVO-konform.</p>
        </div>
        <div className="hp-landing-feature">
          <div className="hp-landing-feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/></svg>
          </div>
          <h4>2. KI analysiert Ihr Profil</h4>
          <p>Unsere KI erkennt Qualifikationen, Erfahrung und Branchenkenntnisse automatisch.</p>
        </div>
        <div className="hp-landing-feature">
          <div className="hp-landing-feature-icon"><Activity size={24} /></div>
          <h4>3. Passende Stellen finden</h4>
          <p>Erhalten Sie personalisierte Stellenvorschläge mit Match-Score und Entfernungsberechnung.</p>
        </div>
      </div>

      {/* Positions Preview */}
      <div className="hp-landing-positions">
        <h3>{ui.positionsTeaserHeading}</h3>
        <div className="hp-landing-positions-grid">
          {ui.teaserPositionIds.map(id => {
            const pos = positions.find(p => p.id === id);
            return pos ? (
              <div key={id} className="hp-landing-position-card" onClick={() => onJobDetail(id)}>
                <div className="hp-landing-pos-title">{pos.title}</div>
                <div className="hp-landing-pos-meta">{pos.city} · {pos.type}</div>
              </div>
            ) : null;
          })}
        </div>
      </div>

      {/* Demo Profiles */}
      <div className={`hp-demo-profiles ${demosExpanded ? '' : 'collapsed'}`}>
        <div className="hp-demo-divider hp-demo-toggle" onClick={() => setDemosExpanded(!demosExpanded)}>
          <span>Demo-Modus</span>
          <ChevronDown size={16} className="hp-demo-chevron" />
        </div>
        <div className="hp-demo-content">
          <p className="hp-demo-hint">Testen Sie die KI-Analyse mit einem vorgefertigten Profil:</p>
          <div className="hp-demo-grid">
            {ui.demoProfiles.map(dp => (
              <button key={dp.id} className={`hp-demo-btn score-${dp.score}`} onClick={() => onLoadProfile(dp.id)}>
                <div className="hp-demo-avatar">{dp.initials}</div>
                <span className="name">{dp.name}</span>
                <span className="role">{dp.role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ======== Loading Section ========
function LoadingSection({ onDone, steps }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(steps[0]?.text || 'Dokument wird verarbeitet...');

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setProgress(steps[i].pct);
        setStatus(steps[i].text);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(onDone, 400);
      }
    }, 350);
    return () => clearInterval(interval);
  }, [onDone, steps]);

  return (
    <div className="hp-loading-section active">
      <div className="hp-loading-spinner" />
      <h3>KI analysiert Ihren Lebenslauf...</h3>
      <div className="hp-loading-bar">
        <div className="hp-loading-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="hp-loading-status">{status}</div>
    </div>
  );
}

// ======== Profile Card ========
function ProfileCard({ profile, scoreLabels, indicatorsLabel }) {
  const scoreClass = profile.totalScore >= 80 ? 'high' : profile.totalScore >= 60 ? 'mid' : 'low';
  const certTags = profile.certifications || [];
  const greenFlags = profile.insuranceFlags?.green || [];
  const redFlags = profile.insuranceFlags?.red || [];
  const neutralFlags = profile.insuranceFlags?.neutral || [];

  return (
    <div className="hp-profile-card">
      <div className="hp-profile-header">
        {profile.photo ? (
          <img src={profile.photo} alt={profile.name} className="hp-profile-avatar-large" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div className="hp-profile-avatar-large">{profile.initials}</div>
        )}
        <div className="hp-profile-info">
          <h2>{profile.name}</h2>
          <div className="hp-profile-meta">
            <span className="hp-profile-meta-item"><MapPin size={16} />{profile.city}</span>
            <span className="hp-profile-meta-item"><Calendar size={16} />{profile.age} Jahre</span>
            <span className="hp-profile-meta-item"><Briefcase size={16} />{profile.experienceYears} Jahre Erfahrung</span>
          </div>
        </div>
        <ScoreRing score={profile.totalScore} />
      </div>
      <div className="hp-profile-body">
        <div className="hp-profile-section">
          <h4>Berufserfahrung</h4>
          <p style={{ fontSize: 'var(--font-base)', color: 'var(--text-secondary)', margin: 0 }}>{profile.experience}</p>
        </div>
        <div className="hp-profile-section">
          <h4>Ausbildung & Zertifikate</h4>
          <div className="hp-tags">
            {certTags.length ? certTags.map((c, i) => <span key={i} className="hp-tag cert">{c}</span>) : <span className="hp-tag">{profile.education}</span>}
          </div>
        </div>
        <div className="hp-profile-section">
          <h4>{indicatorsLabel}</h4>
          <div className="hp-tags">
            {greenFlags.map((f, i) => <span key={`g${i}`} className="hp-tag flag-green">{f}</span>)}
            {redFlags.map((f, i) => <span key={`r${i}`} className="hp-tag flag-red">{f}</span>)}
            {neutralFlags.map((f, i) => <span key={`n${i}`} className="hp-tag flag-neutral">{f}</span>)}
          </div>
        </div>

        {/* LinkedIn Insights */}
        {profile.linkedinInsights && (
          <div className="hp-profile-section" style={{ gridColumn: '1 / -1' }}>
            <h4>LinkedIn-Erkenntnisse <span className="hp-linkedin-badge"><svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>LinkedIn</span></h4>
            {profile.linkedinInsights.map((ins, i) => (
              <div key={i} className="hp-linkedin-insight">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style={{ color: '#0A66C2', flexShrink: 0, marginTop: 2 }}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                <div>
                  <div className="hp-linkedin-insight-text">{ins.text}</div>
                  <div className="hp-linkedin-insight-detail">{ins.detail}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Radar placeholder - using simple bar chart instead of Chart.js */}
        <div className="hp-profile-section">
          <h4>Stärken-Profil</h4>
          <div className="hp-score-breakdown">
            {scoreLabels.dimensions.map((label, i) => {
              const keys = ['vertrieb', 'branche', 'qualifikation', 'standort', 'softskills'];
              const val = profile.scores[keys[i]];
              const barClass = val >= 70 ? 'high' : val >= 40 ? 'mid' : 'low';
              return (
                <div key={i} className="hp-score-bar-row">
                  <div className="hp-score-bar-label">{label}</div>
                  <div className="hp-score-bar-track"><div className={`hp-score-bar-value ${barClass}`} style={{ width: `${val}%` }} /></div>
                  <div className="hp-score-bar-num">{val}</div>
                </div>
              );
            })}
          </div>
        </div>

        <WaterfallChart waterfall={profile.waterfall} />

        <KiSummary text={profile.summary} />

        {profile.counterfactual && (
          <div className="hp-counterfactual" style={{ gridColumn: '1 / -1' }}>
            <HelpCircle size={16} />
            <div className="hp-counterfactual-text">{profile.counterfactual}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ======== Job Match Card ========
function JobMatchCard({ match, idx, expanded, onToggle, onDetail }) {
  return (
    <div className={`hp-match-card ${match.recommended ? 'recommended' : ''}`} onClick={() => onDetail(match.position.id)}>
      <div className="hp-match-card-header">
        <div className="hp-match-title-area">
          <div className="hp-match-title">
            {match.position.title}
            {match.recommended && (
              <span className="hp-recommended-badge"><CheckCircle size={12} /> Empfohlen</span>
            )}
          </div>
          <div className="hp-match-location">
            <MapPin size={14} />
            {match.position.city} <span className="hp-match-distance">({match.distance} km)</span>
          </div>
        </div>
        <ScoreRing score={match.score} />
      </div>
      <div className="hp-match-badges">
        {match.badges.map((b, i) => <span key={i} className={`hp-match-badge ${b.color}`}>{b.text}</span>)}
      </div>
      <button
        className="hp-match-expand-btn"
        onClick={e => { e.stopPropagation(); onToggle(idx); }}
      >
        <ChevronDown size={14} style={{ transform: expanded ? 'rotate(180deg)' : 'none' }} />
        {expanded ? 'Details ausblenden' : 'Details anzeigen'}
      </button>
      {expanded && (
        <div className="hp-match-details expanded">
          <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)', margin: '0 0 var(--space-2)' }}>Anforderungsprofil</h4>
          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', margin: '0 0 var(--space-3)' }}>{match.position.requirements}</p>
          <h4 style={{ fontSize: 'var(--font-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)', margin: '0 0 var(--space-2)' }}>Stellentyp</h4>
          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', margin: 0 }}>{match.position.type}</p>
        </div>
      )}
    </div>
  );
}

// ======== Job Detail Overlay ========
function JobDetailOverlay({ positionId, onClose, positions }) {
  const position = positions.find(p => p.id === positionId);
  if (!position) return null;

  return (
    <div className="hp-detail-overlay active" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="hp-detail-panel">
        <div className="hp-detail-header">
          <h3>{position.title}</h3>
          <button className="hp-detail-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="hp-detail-body">
          <div className="hp-job-detail-meta">
            <div className="hp-job-detail-meta-item"><MapPin size={16} />{position.city}</div>
            <div className="hp-job-detail-meta-item"><Briefcase size={16} />{position.type}</div>
            <div className="hp-job-detail-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Vollzeit
            </div>
          </div>
          <div className="hp-job-detail-section">
            <h4>Stellenbeschreibung</h4>
            <div className="hp-job-detail-description" dangerouslySetInnerHTML={{ __html: (position.description || '').replace(/\n/g, '<br>') }} />
          </div>
          <div className="hp-job-detail-section">
            <h4>Anforderungen</h4>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>{position.requirements}</p>
          </div>
          {position.benefits?.length > 0 && (
            <div className="hp-job-detail-section">
              <h4>Wir bieten</h4>
              <ul className="hp-job-benefits">
                {position.benefits.map((b, i) => (
                  <li key={i} className="hp-job-benefit-tag">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="hp-detail-actions">
          <button className="hp-action-btn hp-apply-btn" onClick={onClose}>
            <CheckCircle size={16} />
            Jetzt bewerben
          </button>
        </div>
      </div>
    </div>
  );
}

// ======== Results Section ========
function ResultsSection({ profile, onReset, onJobDetail, hrData }) {
  const [sortBy, setSortBy] = useState('score');
  const [expandedIdx, setExpandedIdx] = useState(null);
  const { positions, mode, scoreLabels, ui } = hrData;

  // Compute matches once per profile/positions/mode so scores stay stable
  // across re-renders (otherwise the ±3 random fuzz shuffles the list).
  const baseMatches = useMemo(
    () => getMatchesForProfile(profile, positions, mode),
    [profile, positions, mode]
  );
  const matches = useMemo(() => {
    const copy = [...baseMatches];
    if (sortBy === 'distance') copy.sort((a, b) => a.distance - b.distance);
    else if (sortBy === 'region') copy.sort((a, b) => a.position.region.localeCompare(b.position.region));
    return copy;
  }, [baseMatches, sortBy]);

  return (
    <div className="hp-results-section active">
      <button className="hp-back-to-landing" onClick={onReset}>
        <ChevronLeft size={16} />
        Zurück zur Startseite
      </button>
      <div className="hp-dsgvo-banner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        KI-gestützte Vorauswahl — Die finale Bewertung und Entscheidung wird stets durch qualifiziertes Personal getroffen.
      </div>

      <ProfileCard profile={profile} scoreLabels={scoreLabels} indicatorsLabel={scoreLabels.indicatorsLabel} />

      {profile.rejected && (
        <div className="hp-rejection-notice active">
          <div className="hp-rejection-icon"><AlertCircle size={20} /></div>
          <div>
            <h4>Derzeit keine passende Position verfügbar</h4>
            <p>{profile.rejectionText}</p>
          </div>
        </div>
      )}

      <div className="hp-matches-header">
        <h3>Stellenvorschläge</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button className="hp-action-btn" onClick={onReset} style={{ fontSize: 'var(--font-sm)' }}>
            <Upload size={14} />
            Neuen Lebenslauf hochladen
          </button>
          <div className="hp-matches-sort">
            <label>Sortieren:</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="score">Match-Score</option>
              <option value="distance">Entfernung</option>
              <option value="region">Region</option>
            </select>
          </div>
        </div>
      </div>
      <div>
        {matches.map((m, i) => (
          <JobMatchCard
            key={m.position.id}
            match={m}
            idx={i}
            expanded={expandedIdx === i}
            onToggle={idx => setExpandedIdx(expandedIdx === idx ? null : idx)}
            onDetail={onJobDetail}
          />
        ))}
      </div>
    </div>
  );
}

// ======== Main Bewerber Mode ========
export default function BewerberMode() {
  const showToast = useToast();
  const { institut } = useInstitut();
  const hrData = useMemo(() => getHRData(institut.mode), [institut.mode]);
  const [view, setView] = useState('upload'); // 'upload' | 'loading' | 'results'
  const [currentProfile, setCurrentProfile] = useState(null);
  const [jobDetailId, setJobDetailId] = useState(null);

  // Reset when mode changes so we never render stale data from another mode
  useEffect(() => {
    setCurrentProfile(null);
    setJobDetailId(null);
    setView('upload');
  }, [institut.mode]);

  const handleLoadProfile = useCallback((profileId) => {
    const profile = hrData.profiles[profileId];
    if (!profile) return;
    setCurrentProfile(profile);
    setView('loading');
  }, [hrData]);

  const handleLoadingDone = useCallback(() => {
    setView('results');
    showToast?.('KI-Analyse abgeschlossen', 'success');
  }, [showToast]);

  const handleReset = useCallback(() => {
    setCurrentProfile(null);
    setView('upload');
  }, []);

  return (
    <div className="hp-bewerber-section">
      {view === 'upload' && (
        <UploadSection onLoadProfile={handleLoadProfile} onJobDetail={setJobDetailId} hrData={hrData} />
      )}
      {view === 'loading' && (
        <LoadingSection onDone={handleLoadingDone} steps={hrData.ui.loadingSteps} />
      )}
      {view === 'results' && currentProfile && (
        <ResultsSection profile={currentProfile} onReset={handleReset} onJobDetail={setJobDetailId} hrData={hrData} />
      )}
      {jobDetailId && (
        <JobDetailOverlay positionId={jobDetailId} positions={hrData.positions} onClose={() => { setJobDetailId(null); showToast?.('Bewerbung wurde erfolgreich eingereicht!', 'success'); }} />
      )}
    </div>
  );
}
