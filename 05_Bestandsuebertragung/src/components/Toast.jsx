import { Check, X, AlertTriangle, Info } from 'lucide-react'
import { useApp } from '../context/AppContext'

// Einfarbige Lucide-Icons statt Unicode-Zeichen (keine Emojis im Produkt).
const icons = { success: Check, error: X, warning: AlertTriangle, info: Info }
const colors = {
  success: 'bg-green-600', error: 'bg-red-600',
  warning: 'bg-yellow-500', info: 'bg-blue-500'
}

export default function ToastContainer() {
  const { toasts, removeToast } = useApp()
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map(t => {
        const Icon = icons[t.type] || icons.info
        return (
          <div
            key={t.id}
            className={`${colors[t.type] || colors.info} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 min-w-[280px] animate-[slideIn_0.3s_ease]`}
            onClick={() => removeToast(t.id)}
          >
            <Icon size={18} strokeWidth={2} className="shrink-0" />
            <span className="text-sm">{t.message}</span>
          </div>
        )
      })}
    </div>
  )
}
