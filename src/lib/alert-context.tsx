import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react'

export type AlertSeverity = 'success' | 'error' | 'warning' | 'info'

export interface AlertItem {
  id: string
  message: string
  severity: AlertSeverity
  title?: string
}

interface AlertContextValue {
  alerts: AlertItem[]
  showAlert: (message: string, severity?: AlertSeverity, title?: string) => void
  dismissAlert: (id: string) => void
}

const AlertContext = createContext<AlertContextValue | null>(null)

const AUTO_DISMISS_MS = 15_000

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismissAlert = useCallback((id: string) => {
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const showAlert = useCallback(
    (message: string, severity: AlertSeverity = 'info', title?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      const item: AlertItem = { id, message, severity, title }
      setAlerts((prev) => [...prev, item])

      const timer = setTimeout(() => dismissAlert(id), AUTO_DISMISS_MS)
      timers.current.set(id, timer)
    },
    [dismissAlert],
  )

  return (
    <AlertContext.Provider value={{ alerts, showAlert, dismissAlert }}>
      {children}
    </AlertContext.Provider>
  )
}

export function useAlert(): AlertContextValue {
  const ctx = useContext(AlertContext)
  if (!ctx) throw new Error('useAlert must be used within AlertProvider')
  return ctx
}
