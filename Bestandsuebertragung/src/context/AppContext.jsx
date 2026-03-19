import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import * as Storage from '../utils/storage.js'
import { loadDemoData } from '../utils/demo-data.js'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [cases, setCases] = useState([])
  const [toasts, setToasts] = useState([])
  const toastIdRef = useRef(0)

  const refresh = useCallback(() => {
    setCases(Storage.getCasesArray())
  }, [])

  useEffect(() => {
    if (loadDemoData()) {
      showToast('26 Demo-Vorgänge wurden geladen', 'success')
    }
    refresh()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function showToast(message, type = 'info', duration = 4000) {
    const id = ++toastIdRef.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }

  function removeToast(id) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const value = { cases, refresh, showToast, removeToast, toasts }
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
