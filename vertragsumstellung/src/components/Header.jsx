import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, ChevronDown, Check } from 'lucide-react'
import { insurerModes } from '../data/constants'

function InsurerLogo({ src, name, size = 36, className }) {
  const [error, setError] = useState(false)
  if (error || !src) {
    const initials = name.slice(0, 2).toUpperCase()
    return (
      <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 800, color: '#64748b', background: '#f1f5f9', width: size, height: size }}>
        {initials}
      </div>
    )
  }
  return <img src={src} alt={name} className={className} style={{ width: size, height: size }} loading="lazy" decoding="async" onError={() => setError(true)} />
}

function InsurerDropdown({ currentKey, onSelect, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  return (
    <div ref={ref} className="insurer-dropdown">
      <div className="insurer-dropdown-title">Versicherer auswählen</div>
      {Object.values(insurerModes).map(ins => (
        <div
          key={ins.key}
          className={`insurer-dropdown-item ${ins.key === currentKey ? 'active' : ''}`}
          onClick={() => { onSelect(ins.key); onClose() }}
        >
          <InsurerLogo src={ins.logo} name={ins.name} size={36} className="insurer-dropdown-logo" />
          <div className="insurer-dropdown-info">
            <span className="insurer-dropdown-name">{ins.name}</span>
            <span className="insurer-dropdown-model">{ins.modellName}</span>
          </div>
          {ins.key === currentKey && <Check size={16} className="insurer-dropdown-check" />}
        </div>
      ))}
    </div>
  )
}

export default function Header({ insurer, onSwitchInsurer, currentKey }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <div className="vu-header" style={{ background: insurer.colors.gradient }}>
      <div className="vu-header-content">
        <div className="vu-header-left">
          <InsurerLogo src={insurer.logo} name={insurer.name} size={52} className="vu-header-logo" />
          <div>
            <h1>Vertragsumstellung</h1>
            <div className="subtitle">Simulationsergebnisse — Provisionsmodell {insurer.modellName}</div>
          </div>
        </div>
        <div className="vu-header-right">
          <div className="vu-header-badge">Arbeitsstand – initiale Einschätzung</div>
          <div className="vu-header-badge">Februar 2026</div>

          <div style={{ position: 'relative' }}>
            <button
              className="vu-insurer-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <InsurerLogo src={insurer.logo} name={insurer.name} size={24} className="vu-insurer-btn-logo" />
              {insurer.name}
              <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />
            </button>
            {dropdownOpen && (
              <InsurerDropdown
                currentKey={currentKey}
                onSelect={onSwitchInsurer}
                onClose={() => setDropdownOpen(false)}
              />
            )}
          </div>

          <button className="vu-back-btn" onClick={() => window.location.href = '/'}>
            <ArrowLeft size={16} />
            Zurück
          </button>
        </div>
      </div>
    </div>
  )
}
