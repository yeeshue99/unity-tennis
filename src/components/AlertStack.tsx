import React, { useEffect, useRef, useState } from 'react'
import {
  useAlert,
  type AlertItem,
  type AlertSeverity,
} from '@/lib/alert-context'
import CloseIcon from '@mui/icons-material/Close'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

const AUTO_DISMISS_MS = 15_000

const SEVERITY_CONFIG: Record<
  AlertSeverity,
  {
    icon: React.ReactNode
    borderColor: string
    bgColor: string
    iconColor: string
    titleColor: string
    progressColor: string
  }
> = {
  success: {
    icon: <CheckCircleOutlineIcon fontSize="small" />,
    borderColor: '#2e7d32',
    bgColor: 'rgba(46, 125, 50, 0.08)',
    iconColor: '#2e7d32',
    titleColor: '#2e7d32',
    progressColor: '#2e7d32',
  },
  error: {
    icon: <ErrorOutlineIcon fontSize="small" />,
    borderColor: '#c62828',
    bgColor: 'rgba(198, 40, 40, 0.08)',
    iconColor: '#c62828',
    titleColor: '#c62828',
    progressColor: '#c62828',
  },
  warning: {
    icon: <WarningAmberIcon fontSize="small" />,
    borderColor: '#e65100',
    bgColor: 'rgba(230, 81, 0, 0.08)',
    iconColor: '#e65100',
    titleColor: '#e65100',
    progressColor: '#e65100',
  },
  info: {
    icon: <InfoOutlinedIcon fontSize="small" />,
    borderColor: 'var(--color-primary)',
    bgColor: 'rgba(51, 153, 102, 0.08)',
    iconColor: 'var(--color-primary)',
    titleColor: 'var(--color-primary)',
    progressColor: 'var(--color-primary)',
  },
}

function AlertCard({
  alert,
  onDismiss,
}: {
  alert: AlertItem
  onDismiss: (id: string) => void
}) {
  const config = SEVERITY_CONFIG[alert.severity]
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(100)
  const startTime = useRef(Date.now())
  const rafRef = useRef<number | null>(null)

  // Slide-in on mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Countdown progress bar
  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startTime.current
      const remaining = Math.max(0, 100 - (elapsed / AUTO_DISMISS_MS) * 100)
      setProgress(remaining)
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const handleDismiss = () => {
    setVisible(false)
    setTimeout(() => onDismiss(alert.id), 250)
  }

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minWidth: '320px',
        maxWidth: '420px',
        borderRadius: '10px',
        border: `1.5px solid ${config.borderColor}`,
        background: `color-mix(in srgb, var(--color-surface) 92%, transparent)`,
        backdropFilter: 'blur(6px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(110%)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
      }}
    >
      {/* Main content */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          padding: '12px 14px 10px',
          background: config.bgColor,
        }}
      >
        <span
          style={{
            color: config.iconColor,
            marginTop: '1px',
            flexShrink: 0,
            display: 'flex',
          }}
        >
          {config.icon}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          {alert.title && (
            <div
              style={{
                fontWeight: 700,
                fontSize: '0.875rem',
                color: config.titleColor,
                marginBottom: '2px',
                lineHeight: 1.3,
              }}
            >
              {alert.title}
            </div>
          )}
          <div
            style={{
              fontSize: '0.85rem',
              color: 'var(--color-text)',
              lineHeight: 1.4,
              wordBreak: 'break-word',
            }}
          >
            {alert.message}
          </div>
        </div>

        <button
          onClick={handleDismiss}
          aria-label="Dismiss alert"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            opacity: 0.7,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.opacity = '1')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.opacity = '0.7')
          }
        >
          <CloseIcon style={{ fontSize: '1rem' }} />
        </button>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: '3px',
          background: 'var(--color-surface-2)',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: config.progressColor,
            transition: 'width 0.1s linear',
          }}
        />
      </div>
    </div>
  )
}

export default function AlertStack() {
  const { alerts, dismissAlert } = useAlert()

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        alignItems: 'flex-end',
        pointerEvents: 'none',
      }}
    >
      {alerts.map((alert) => (
        <div key={alert.id} style={{ pointerEvents: 'auto' }}>
          <AlertCard alert={alert} onDismiss={dismissAlert} />
        </div>
      ))}
    </div>
  )
}
