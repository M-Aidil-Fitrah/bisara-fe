import { useEffect, useState } from 'react'
import { Bell, CheckCircle2, AlertCircle, X } from 'lucide-react'
import { getStoredA11ySettings, speakText, type VisualToastEventDetail } from '../../lib/a11y'

interface ActiveToast extends VisualToastEventDetail {
  id: string
}

export default function VisualToast() {
  const [toasts, setToasts] = useState<ActiveToast[]>([])

  useEffect(() => {
    const handleToast = (event: WindowEventMap['bisara-visual-toast']) => {
      const detail = event.detail
      if (!detail) return

      const newToast: ActiveToast = {
        id: detail.id || String(Date.now()),
        title: detail.title,
        message: detail.message,
        type: detail.type || 'info',
      }

      setToasts((prev) => [newToast, ...prev.slice(0, 2)]) // keep max 3 toasts

      // If TTS is active, speak the notification
      const settings = getStoredA11ySettings()
      if (settings.tts) {
        speakText(`${detail.title}. ${detail.message}`)
      }

      // Auto dismiss after 4.5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id))
      }, 4500)
    }

    window.addEventListener('bisara-visual-toast', handleToast)
    return () => window.removeEventListener('bisara-visual-toast', handleToast)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full px-4"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success'
        const isAlert = toast.type === 'alert'

        return (
          <div
            key={toast.id}
            role="alert"
            className="pointer-events-auto flex items-start gap-3.5 rounded-xl border border-line bg-surface/95 p-4 text-ink shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-4"
          >
            {/* Visual Icon with pulsing indicator */}
            <div
              className={`relative mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg ${
                isSuccess
                  ? 'bg-ok/15 text-ok'
                  : isAlert
                  ? 'bg-warn/15 text-warn'
                  : 'bg-brand/15 text-brand'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="size-5" />
              ) : isAlert ? (
                <AlertCircle className="size-5" />
              ) : (
                <Bell className="size-5" />
              )}
              {/* Soft pulse dot for deaf visual awareness */}
              <span className="absolute -top-1 -right-1 flex size-3">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex size-3 rounded-full bg-brand" />
              </span>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h4 className="text-sm font-semibold tracking-tight text-ink">{toast.title}</h4>
              <p className="mt-0.5 text-xs text-muted leading-relaxed">{toast.message}</p>
            </div>

            {/* Dismiss button */}
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              aria-label="Tutup notifikasi"
              className="rounded-md p-1 text-muted hover:bg-paper hover:text-ink transition"
            >
              <X className="size-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
