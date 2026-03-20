import { LayoutGrid, BarChart3 } from 'lucide-react'

const tabs = [
  { key: 'uebersicht', label: 'Übersicht', icon: LayoutGrid },
  { key: 'simulation', label: 'Provisionssimulation', icon: BarChart3 },
]

export default function TabBar({ activeTab, onTabChange }) {
  return (
    <div className="vu-tabs">
      {tabs.map(tab => (
        <div
          key={tab.key}
          className={`vu-tab ${activeTab === tab.key ? 'active' : ''}`}
          onClick={() => onTabChange(tab.key)}
        >
          <span className="tab-icon">
            <tab.icon size={16} />
          </span>
          {tab.label}
        </div>
      ))}
    </div>
  )
}
