import { useState } from 'react'
import { vermittlerList } from '../data/constants'

function Avatar({ name, foto, size = 42, insurer }) {
  const [imgError, setImgError] = useState(false)

  if (foto && !imgError) {
    return (
      <img
        src={foto}
        alt={name}
        className="vu-vermittler-avatar"
        style={{ width: size, height: size, objectFit: 'cover' }}
        loading="lazy"
        decoding="async"
        onError={() => setImgError(true)}
      />
    )
  }

  // Fallback: initials with gradient
  const initials = name
    .split(' ')
    .filter(w => !['Dr.', 'Prof.', 'von', 'zu'].includes(w))
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className="vu-vermittler-avatar"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${insurer.colors.primary}, ${insurer.colors.accent})`,
        color: 'white',
        fontSize: size * 0.36,
      }}
    >
      {initials}
    </div>
  )
}

export default function VermittlerBar({ selected, onSelect, insurer }) {
  return (
    <div className="vu-vermittler-bar">
      <div className="vu-vermittler-info">
        <Avatar name={selected.name} foto={selected.foto} insurer={insurer} />
        <div className="vu-vermittler-details">
          <h3>{selected.name}</h3>
          <span>BD-VM {selected.id} • {selected.vpt || '–'} • {insurer.beraterTitel} • {insurer.region}</span>
        </div>
      </div>
      <select
        className="vu-vermittler-select"
        value={selected.id}
        onChange={e => {
          const vm = vermittlerList.find(v => v.id === e.target.value)
          if (vm) onSelect(vm)
        }}
      >
        {vermittlerList.map(vm => (
          <option key={vm.id} value={vm.id}>
            {vm.name} ({vm.id})
          </option>
        ))}
      </select>
    </div>
  )
}
