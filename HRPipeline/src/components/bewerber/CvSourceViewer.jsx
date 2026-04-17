import { useState, useMemo } from 'react';
import { Info, Plus, Edit3, Check, X, FileText, MapPin } from 'lucide-react';
import { logoDevUrl } from '../../data/profilesGeneric';

// CV viewer that renders the structured cvSections. Highlights sections
// whose IDs are in `highlightIds`. Supports inline edit-mode for
// experience bullets / summary / adding new stations.
function SectionHeader({ title, onEdit, editable, canAdd, onAdd }) {
  return (
    <div className="cv-sv-section-head">
      <div className="cv-sv-section-title">{title}</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {editable && onEdit && (
          <button className="cv-sv-btn ghost" onClick={onEdit} type="button" title="Bearbeiten">
            <Edit3 size={12} />
          </button>
        )}
        {canAdd && onAdd && (
          <button className="cv-sv-btn ghost" onClick={onAdd} type="button" title="Station hinzufügen">
            <Plus size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

function ExperienceEdit({ section, onSave, onCancel, onDelete }) {
  const [title, setTitle] = useState(section.title || '');
  const [company, setCompany] = useState(section.company || '');
  const [dates, setDates] = useState(section.dates || '');
  const [bullets, setBullets] = useState(section.bullets?.join('\n') || '');

  return (
    <div className="cv-sv-edit">
      <input className="cv-sv-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Rollentitel" />
      <input className="cv-sv-input" value={company} onChange={e => setCompany(e.target.value)} placeholder="Unternehmen · Standort" />
      <input className="cv-sv-input" value={dates} onChange={e => setDates(e.target.value)} placeholder="z. B. 03/2021 – heute" />
      <textarea
        className="cv-sv-textarea"
        value={bullets}
        onChange={e => setBullets(e.target.value)}
        rows={4}
        placeholder="Ein Aufzählungspunkt pro Zeile"
      />
      <div className="cv-sv-edit-actions">
        <button type="button" className="cv-sv-btn primary" onClick={() => onSave({ title, company, dates, bullets: bullets.split('\n').map(s => s.trim()).filter(Boolean) })}>
          <Check size={12} /> Speichern
        </button>
        <button type="button" className="cv-sv-btn ghost" onClick={onCancel}>
          <X size={12} /> Abbrechen
        </button>
        {onDelete && (
          <button type="button" className="cv-sv-btn danger" onClick={onDelete}>Löschen</button>
        )}
      </div>
    </div>
  );
}

function ParagraphEdit({ section, onSave, onCancel }) {
  const [text, setText] = useState(section.text || '');
  return (
    <div className="cv-sv-edit">
      <textarea
        className="cv-sv-textarea"
        value={text}
        onChange={e => setText(e.target.value)}
        rows={5}
      />
      <div className="cv-sv-edit-actions">
        <button type="button" className="cv-sv-btn primary" onClick={() => onSave({ text })}>
          <Check size={12} /> Speichern
        </button>
        <button type="button" className="cv-sv-btn ghost" onClick={onCancel}>
          <X size={12} /> Abbrechen
        </button>
      </div>
    </div>
  );
}

function ListEdit({ section, onSave, onCancel }) {
  const [items, setItems] = useState((section.items || []).join('\n'));
  return (
    <div className="cv-sv-edit">
      <textarea
        className="cv-sv-textarea"
        value={items}
        onChange={e => setItems(e.target.value)}
        rows={6}
        placeholder="Ein Eintrag pro Zeile"
      />
      <div className="cv-sv-edit-actions">
        <button type="button" className="cv-sv-btn primary" onClick={() => onSave({ items: items.split('\n').map(s => s.trim()).filter(Boolean) })}>
          <Check size={12} /> Speichern
        </button>
        <button type="button" className="cv-sv-btn ghost" onClick={onCancel}>
          <X size={12} /> Abbrechen
        </button>
      </div>
    </div>
  );
}

function SectionRenderer({ section, highlighted, editable, editingId, onEdit, onCancel, onSave, onDelete }) {
  const isEditing = editingId === section.id;
  const highlightClass = highlighted ? 'cv-sv-section highlighted' : 'cv-sv-section';

  if (section.type === 'header') {
    return (
      <div id={`cvsec-${section.id}`} className={`${highlightClass} header`}>
        <div className="cv-sv-name">{section.title}</div>
        <div className="cv-sv-headline">{section.subtitle}</div>
        <div className="cv-sv-meta">{section.meta}</div>
      </div>
    );
  }

  if (section.type === 'paragraph') {
    return (
      <div id={`cvsec-${section.id}`} className={highlightClass}>
        <SectionHeader title={section.title} onEdit={editable ? () => onEdit(section.id) : null} editable={editable} />
        {isEditing ? (
          <ParagraphEdit section={section} onSave={data => onSave(section.id, data)} onCancel={onCancel} />
        ) : (
          <p className="cv-sv-paragraph">{section.text}</p>
        )}
      </div>
    );
  }

  if (section.type === 'list') {
    return (
      <div id={`cvsec-${section.id}`} className={highlightClass}>
        <SectionHeader title={section.title} onEdit={editable ? () => onEdit(section.id) : null} editable={editable} />
        {isEditing ? (
          <ListEdit section={section} onSave={data => onSave(section.id, data)} onCancel={onCancel} />
        ) : (
          <ul className="cv-sv-list">
            {(section.items || []).map((it, i) => <li key={i}>{it}</li>)}
          </ul>
        )}
      </div>
    );
  }

  if (section.type === 'experience') {
    return (
      <div id={`cvsec-${section.id}`} className={highlightClass}>
        {isEditing ? (
          <ExperienceEdit
            section={section}
            onSave={data => onSave(section.id, data)}
            onCancel={onCancel}
            onDelete={() => onDelete(section.id)}
          />
        ) : (
          <>
            <div className="cv-sv-exp-head">
              <div>
                <div className="cv-sv-exp-role">{section.title}</div>
                <div className="cv-sv-exp-company">{section.company}</div>
              </div>
              <div className="cv-sv-exp-actions">
                <span className="cv-sv-exp-dates">{section.dates}</span>
                {editable && (
                  <button className="cv-sv-btn ghost" onClick={() => onEdit(section.id)} type="button" title="Station bearbeiten">
                    <Edit3 size={12} />
                  </button>
                )}
              </div>
            </div>
            <ul className="cv-sv-bullets">
              {(section.bullets || []).map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </>
        )}
      </div>
    );
  }

  if (section.type === 'education') {
    return (
      <div id={`cvsec-${section.id}`} className={highlightClass}>
        <div className="cv-sv-exp-head">
          <div>
            <div className="cv-sv-exp-role">{section.title}</div>
            <div className="cv-sv-exp-company">{section.institution}</div>
          </div>
          <span className="cv-sv-exp-dates">{section.dates}</span>
        </div>
        {section.detail && <div className="cv-sv-edu-detail">{section.detail}</div>}
      </div>
    );
  }

  return null;
}

export default function CvSourceViewer({
  profile,
  highlightIds,
  activeLabel,
  editable,
  onSectionsChange,
}) {
  const [sections, setSections] = useState(profile.cvSections || []);
  const [editingId, setEditingId] = useState(null);

  // Keep local state in sync if the profile changes (new upload)
  useMemo(() => setSections(profile.cvSections || []), [profile]);

  const handleSave = (id, data) => {
    const next = sections.map(s => s.id === id ? { ...s, ...data } : s);
    setSections(next);
    setEditingId(null);
    onSectionsChange?.(next);
  };

  const handleDelete = (id) => {
    const next = sections.filter(s => s.id !== id);
    setSections(next);
    setEditingId(null);
    onSectionsChange?.(next);
  };

  const handleAddStation = () => {
    const id = `exp-custom-${Date.now()}`;
    const next = [...sections];
    // insert after last experience section
    const lastExpIdx = next.map(s => s.type).lastIndexOf('experience');
    const newSection = { id, type: 'experience', title: 'Neue berufliche Station', company: 'Unternehmen · Standort', dates: 'MM/JJJJ – MM/JJJJ', bullets: ['Aufgabe oder Erfolg eintragen'] };
    if (lastExpIdx === -1) next.push(newSection); else next.splice(lastExpIdx + 1, 0, newSection);
    setSections(next);
    setEditingId(id);
    onSectionsChange?.(next);
  };

  const tech = profile.techSkills || [];
  const highlightSet = new Set(highlightIds || []);

  return (
    <div className="cv-sv-wrap">
      <div className="cv-sv-toolbar">
        <div className="cv-sv-toolbar-left">
          <FileText size={14} />
          <strong>CV-Ansicht</strong>
          {profile.cvPdf && (
            <a className="cv-sv-pdf-link" href={profile.cvPdf} target="_blank" rel="noreferrer">Original-PDF</a>
          )}
        </div>
        <div className="cv-sv-toolbar-right">
          {activeLabel && (
            <span className="cv-sv-active">
              <MapPin size={12} />
              Quellen für: <strong>{activeLabel}</strong>
            </span>
          )}
          {editable && (
            <button type="button" className="cv-sv-btn primary small" onClick={handleAddStation}>
              <Plus size={12} /> Station hinzufügen
            </button>
          )}
        </div>
      </div>

      {editable && (
        <div className="cv-sv-edit-hint">
          <Info size={12} />
          <span>KI-Vorschlag — Sie können jede Station, das Profil oder die Skills anpassen, bevor Sie sich bewerben.</span>
        </div>
      )}

      {(highlightIds?.length || 0) > 0 && (
        <div className="cv-sv-legend">
          <span className="cv-sv-legend-chip" />
          <span>{highlightIds.length} Quellen-Abschnitt{highlightIds.length === 1 ? '' : 'e'} hervorgehoben</span>
        </div>
      )}

      <div className="cv-sv-document">
        {sections.map(section => (
          <SectionRenderer
            key={section.id}
            section={section}
            highlighted={highlightSet.has(section.id)}
            editable={editable}
            editingId={editingId}
            onEdit={setEditingId}
            onCancel={() => setEditingId(null)}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        ))}

        {tech.length > 0 && (
          <div className="cv-sv-section">
            <SectionHeader title="Software & Tools" />
            <div className="cv-sv-tech-grid">
              {tech.map((t, i) => (
                <div key={i} className="cv-sv-tech-chip" title={`${t.name} — ${t.level || ''}`.trim()}>
                  <img
                    src={logoDevUrl(t.domain, 64)}
                    alt={t.name}
                    className="cv-sv-tech-logo"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div className="cv-sv-tech-text">
                    <div className="cv-sv-tech-name">{t.name}</div>
                    {t.level && <div className="cv-sv-tech-level">{t.level}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
