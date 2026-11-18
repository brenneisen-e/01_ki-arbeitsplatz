import { createContext, useContext, useState, useRef, useCallback } from 'react'

const AppContext = createContext(null)

/** Kleiner gemeinsamer Zustand: nur die Meldungen oben rechts. Die Demo-Eingänge sind fest und brauchen keinen Speicher. */
export function AppProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const zaehler = useRef(0)

  const removeToast = useCallback((id) => setToasts(alt => alt.filter(t => t.id !== id)), [])

  const showToast = useCallback((message, type = 'info', dauer = 4000) => {
    const id = ++zaehler.current
    setToasts(alt => [...alt, { id, message, type }])
    setTimeout(() => removeToast(id), dauer)
  }, [removeToast])

  return <AppContext.Provider value={{ toasts, showToast, removeToast }}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
