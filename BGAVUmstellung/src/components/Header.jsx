import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { insurerModes } from '../data/constants'

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
          <img
            src={ins.logo}
            alt={ins.name}
            className="insurer-dropdown-logo"
            onError={e => { e.target.style.display = 'none' }}
          />
          <div className="insurer-dropdown-info">
            <span className="insurer-dropdown-name">{ins.name}</span>
            <span className="insurer-dropdown-model">{ins.modellName}</span>
          </div>
          {ins.key === currentKey && <span className="insurer-dropdown-check">✓</span>}
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
          <img
            src={insurer.logo}
            alt={insurer.name}
            className="vu-header-logo"
            onError={e => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
          <div className="vu-logo-badge" style={{ display: 'none' }}>{insurer.short}</div>
          <div>
            <h1>Vertragsumstellung Insurance</h1>
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
              <img
                src={insurer.logo}
                alt=""
                className="vu-insurer-btn-logo"
                onError={e => { e.target.style.display = 'none' }}
              />
              {insurer.name}
              <ChevronDown size={14} />
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
