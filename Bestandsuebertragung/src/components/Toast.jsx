import { useApp } from '../context/AppContext'

const icons = { success: '✔', error: '✕', warning: '△', info: 'ℹ' }
const colors = {
  success: 'bg-green-600', error: 'bg-red-600',
  warning: 'bg-yellow-500', info: 'bg-blue-500'
}

export default function ToastContainer() {
  const { toasts, removeToast } = useApp()
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`${colors[t.type] || colors.info} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 min-w-[280px] animate-[slideIn_0.3s_ease]`}
          onClick={() => removeToast(t.id)}
        >
          <span className="text-lg">{icons[t.type] || icons.info}</span>
          <span className="text-sm">{t.message}</span>
        </div>
      ))}
    </div>
  )
}
