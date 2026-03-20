import { User } from 'lucide-react'
import { vermittlerList } from '../data/constants'

export default function VermittlerBar({ selected, onSelect, insurer }) {
  return (
    <div className="vu-vermittler-bar">
      <div className="vu-vermittler-info">
        <div className="vu-vermittler-avatar" style={{ background: `linear-gradient(135deg, ${insurer.colors.primary}, ${insurer.colors.accent})` }}>
          <User size={22} />
        </div>
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
