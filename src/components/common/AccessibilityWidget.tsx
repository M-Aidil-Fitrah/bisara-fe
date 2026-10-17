import { useState, useEffect, useRef } from 'react'
import {
  Accessibility,
  X,
  Type,
  Contrast,
  Droplet,
  Volume2,
  BellRing,
  ZapOff,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import {
  getStoredA11ySettings,
  saveA11ySettings,
  applyA11yToDOM,
  speakText,
  triggerVisualToast,
  DEFAULT_A11Y_SETTINGS,
  type A11ySettings,
  type TextSize,
} from '../../lib/a11y'

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState<A11ySettings>(() => getStoredA11ySettings())
  const panelRef = useRef<HTMLDivElement>(null)

  // Synchronize DOM with accessibility settings
  useEffect(() => {
    applyA11yToDOM(settings)
  }, [settings])

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Handle outside click to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const updateSetting = <K extends keyof A11ySettings>(key: K, value: A11ySettings[K]) => {
    const updated = { ...settings, [key]: value }
    setSettings(updated)
    saveA11ySettings(updated)
    applyA11yToDOM(updated)

    if (key === 'tts' && value === true) {
      speakText('Fitur pembaca suara diaktifkan.')
    }
  }

  const handleReset = () => {
    setSettings(DEFAULT_A11Y_SETTINGS)
    saveA11ySettings(DEFAULT_A11Y_SETTINGS)
    applyA11yToDOM(DEFAULT_A11Y_SETTINGS)
    triggerVisualToast('Aksesibilitas', 'Pengaturan aksesibilitas telah dikembalikan ke standar.', 'info')
  }

  const testTTS = () => {
    speakText('Halo! Ini adalah contoh suara pembaca teks Bisara berbahasa Indonesia.')
  }

  const testToast = () => {
    triggerVisualToast('Psikolog Bisara', 'Halo, ada pesan baru dalam sesi konseling Anda!', 'success')
  }

  return (
    <aside aria-label="Aksesibilitas dan Bantuan Tampilan" className="fixed bottom-6 left-6 z-[9990]">
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={isOpen ? 'Tutup panel aksesibilitas' : 'Buka panel aksesibilitas'}
        className="group relative flex size-12 items-center justify-center rounded-2xl bg-[#0f5132] text-white shadow-xl ring-2 ring-white/50 transition-all duration-300 hover:scale-105 hover:bg-[#0c4128] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand"
      >
        <Accessibility className="size-6 transition-transform duration-300 group-hover:rotate-12" />
        <span className="sr-only">Aksesibilitas</span>
        {/* Active dot if any non-default setting is turned on */}
        {(settings.highContrast || settings.grayscale || settings.reduceMotion || settings.textSize !== 'normal') && (
          <span className="absolute -top-1 -right-1 size-3 rounded-full bg-warn ring-2 ring-white" />
        )}
      </button>

      {/* Accessible Popover Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="a11y-panel-title"
          className="absolute bottom-16 left-0 w-[330px] sm:w-[360px] rounded-2xl border border-line bg-surface/98 p-5 text-ink shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-line pb-3.5">
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-4 text-brand" />
                <h3 id="a11y-panel-title" className="text-base font-semibold tracking-tight text-ink">
                  Fitur Aksesibilitas
                </h3>
              </div>
              <p className="mt-0.5 text-xs text-muted">Sesuaikan tampilan & sensorik (WCAG AA)</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Tutup panel"
              className="rounded-lg p-1.5 text-muted hover:bg-paper hover:text-ink transition"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Options List */}
          <div className="mt-4 flex flex-col gap-3.5 max-h-[60vh] overflow-y-auto pr-1">
            {/* 1. Ukuran Teks */}
            <div className="rounded-xl bg-paper/60 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Type className="size-4 text-brand" />
                <span className="text-xs font-semibold text-ink uppercase tracking-wider">Ukuran Teks</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: 'normal', label: '100% Normal' },
                    { id: 'medium', label: '115% Sedang' },
                    { id: 'large', label: '130% Besar' },
                  ] as const
                ).map((size) => (
                  <button
                    key={size.id}
                    onClick={() => updateSetting('textSize', size.id as TextSize)}
                    className={`rounded-lg py-1.5 px-2 text-xs font-medium transition ${
                      settings.textSize === size.id
                        ? 'bg-brand text-white shadow-sm'
                        : 'bg-surface text-ink hover:bg-white border border-line'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Kontras Tinggi */}
            <div className="flex items-center justify-between rounded-xl bg-paper/60 p-3">
              <div className="flex items-center gap-2.5">
                <Contrast className="size-4 text-brand" />
                <div>
                  <div className="text-xs font-semibold text-ink">Kontras Tinggi</div>
                  <div className="text-[11px] text-muted">Perjelas teks & garis pembatas</div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.highContrast}
                onClick={() => updateSetting('highContrast', !settings.highContrast)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  settings.highContrast ? 'bg-brand' : 'bg-line'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    settings.highContrast ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 3. Skala Abu-Abu (Grayscale) */}
            <div className="flex items-center justify-between rounded-xl bg-paper/60 p-3">
              <div className="flex items-center gap-2.5">
                <Droplet className="size-4 text-brand" />
                <div>
                  <div className="text-xs font-semibold text-ink">Skala Abu-abu</div>
                  <div className="text-[11px] text-muted">Redam warna mencolok</div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.grayscale}
                onClick={() => updateSetting('grayscale', !settings.grayscale)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  settings.grayscale ? 'bg-brand' : 'bg-line'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    settings.grayscale ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 4. Pembaca Teks (Text to Speech) */}
            <div className="rounded-xl bg-paper/60 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Volume2 className="size-4 text-brand" />
                  <div>
                    <div className="text-xs font-semibold text-ink">Pembaca Teks (TTS)</div>
                    <div className="text-[11px] text-muted">Suarakan teks & notifikasi</div>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.tts}
                  onClick={() => updateSetting('tts', !settings.tts)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                    settings.tts ? 'bg-brand' : 'bg-line'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      settings.tts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              {settings.tts && (
                <div className="mt-2.5 pt-2 border-t border-line/60 flex justify-end">
                  <button
                    onClick={testTTS}
                    className="text-[11px] font-medium text-brand hover:underline flex items-center gap-1"
                  >
                    🔊 Coba Dengarkan Suara
                  </button>
                </div>
              )}
            </div>

            {/* 5. Notifikasi Visual Toast */}
            <div className="rounded-xl bg-paper/60 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <BellRing className="size-4 text-brand" />
                  <div>
                    <div className="text-xs font-semibold text-ink">Notifikasi Visual Toast</div>
                    <div className="text-[11px] text-muted">Pop-up jelas untuk Teman Tuli</div>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.visualToast}
                  onClick={() => updateSetting('visualToast', !settings.visualToast)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                    settings.visualToast ? 'bg-brand' : 'bg-line'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      settings.visualToast ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <div className="mt-2.5 pt-2 border-t border-line/60 flex justify-end">
                <button
                  onClick={testToast}
                  className="text-[11px] font-medium text-brand hover:underline flex items-center gap-1"
                >
                  🔔 Tes Munculkan Notifikasi
                </button>
              </div>
            </div>

            {/* 6. Kurangi Gerakan (Reduce Motion) */}
            <div className="flex items-center justify-between rounded-xl bg-paper/60 p-3">
              <div className="flex items-center gap-2.5">
                <ZapOff className="size-4 text-brand" />
                <div>
                  <div className="text-xs font-semibold text-ink">Kurangi Gerakan</div>
                  <div className="text-[11px] text-muted">Hentikan transisi & animasi gerak</div>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.reduceMotion}
                onClick={() => updateSetting('reduceMotion', !settings.reduceMotion)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                  settings.reduceMotion ? 'bg-brand' : 'bg-line'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    settings.reduceMotion ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Footer Reset */}
          <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink transition"
            >
              <RotateCcw className="size-3.5" />
              Reset ke Standar
            </button>
            <span className="text-[10px] font-semibold text-muted/80 uppercase tracking-widest">
              WCAG 2.1 AA
            </span>
          </div>
        </div>
      )}
    </aside>
  )
}
