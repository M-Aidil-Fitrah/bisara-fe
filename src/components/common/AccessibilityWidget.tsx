import { useEffect, useRef, useState } from 'react'
import { Accessibility, Contrast, Droplet, Minus, Plus, RotateCcw, Type, Volume2, X } from 'lucide-react'
import { applyA11yToDOM, DEFAULT_A11Y_SETTINGS, getStoredA11ySettings, saveA11ySettings, speakText, type A11ySettings, type TextSize } from '../../lib/a11y'

const TEXT_SIZES: readonly TextSize[] = ['normal', 'medium', 'large']
const TEXT_SIZE_LABEL: Record<TextSize, string> = { normal: '100%', medium: '115%', large: '130%' }

type ToggleRowProps = { icon: typeof Contrast; title: string; description: string; enabled: boolean; onToggle: () => void }

function ToggleRow({ icon: Icon, title, description, enabled, onToggle }: ToggleRowProps) {
  return <div className="flex items-center justify-between gap-4 py-3"><div className="flex min-w-0 items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand"><Icon aria-hidden="true" className="size-4" /></span><div><p className="text-sm font-medium text-ink">{title}</p><p className="mt-0.5 text-xs leading-relaxed text-muted">{description}</p></div></div><button type="button" role="switch" aria-checked={enabled} onClick={onToggle} className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${enabled ? 'bg-brand' : 'bg-line'}`}><span className={`size-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} /></button></div>
}

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState<A11ySettings>(() => getStoredA11ySettings())
  const panelRef = useRef<HTMLElement>(null)

  useEffect(() => { applyA11yToDOM(settings) }, [settings])
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsOpen(false) }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])
  useEffect(() => {
    const closeOutside = (event: MouseEvent) => { if (panelRef.current && event.target instanceof Node && !panelRef.current.contains(event.target)) setIsOpen(false) }
    if (isOpen) document.addEventListener('mousedown', closeOutside)
    return () => document.removeEventListener('mousedown', closeOutside)
  }, [isOpen])

  const update = <K extends keyof A11ySettings>(key: K, value: A11ySettings[K]) => {
    const next = { ...settings, [key]: value }
    setSettings(next)
    saveA11ySettings(next)
  }
  const changeTextSize = (direction: -1 | 1) => {
    const index = TEXT_SIZES.indexOf(settings.textSize)
    const next = TEXT_SIZES[Math.max(0, Math.min(TEXT_SIZES.length - 1, index + direction))]
    if (next) update('textSize', next)
  }
  const hasCustomSettings = settings.textSize !== 'normal' || settings.highContrast || settings.grayscale || settings.tts

  return <aside ref={panelRef} aria-label="Aksesibilitas" className="fixed bottom-5 left-5 z-[9990] sm:bottom-6 sm:left-6">
    <button type="button" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} aria-controls="panel-aksesibilitas" aria-label={isOpen ? 'Tutup aksesibilitas' : 'Buka aksesibilitas'} className="relative grid size-12 place-items-center rounded-full bg-ink text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand sm:size-13"><Accessibility aria-hidden="true" className="size-5 sm:size-6" />{hasCustomSettings && <span aria-label="Pengaturan aktif" className="absolute right-0.5 top-0.5 size-2.5 rounded-full bg-warn ring-2 ring-paper" />}</button>
    {isOpen && <section id="panel-aksesibilitas" role="dialog" aria-modal="true" aria-labelledby="judul-aksesibilitas" className="absolute bottom-16 left-0 w-[min(22rem,calc(100vw-2.5rem))] origin-bottom rounded-2xl border border-line bg-surface p-4 shadow-2xl animate-[panel-in_180ms_ease-out] sm:bottom-[4.5rem] sm:p-5">
      <div className="flex items-center justify-between border-b border-line pb-3"><div><h2 id="judul-aksesibilitas" className="text-base font-semibold text-ink">Aksesibilitas</h2><p className="mt-0.5 text-xs text-muted">Sesuaikan tampilan sesuai kebutuhan.</p></div><button type="button" onClick={() => setIsOpen(false)} aria-label="Tutup aksesibilitas" className="rounded-lg p-2 text-muted transition hover:bg-brand/10 hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"><X aria-hidden="true" className="size-4" /></button></div>
      <div className="divide-y divide-line">
        <div className="flex items-center justify-between gap-4 py-3"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-brand/10 text-brand"><Type aria-hidden="true" className="size-4" /></span><div><p className="text-sm font-medium text-ink">Ukuran teks</p><p className="mt-0.5 text-xs text-muted">{TEXT_SIZE_LABEL[settings.textSize]}</p></div></div><div className="flex items-center rounded-lg border border-line bg-paper"><button type="button" onClick={() => changeTextSize(-1)} disabled={settings.textSize === 'normal'} aria-label="Perkecil teks" className="grid size-8 place-items-center rounded-l-lg transition hover:bg-brand/10 hover:text-brand disabled:cursor-not-allowed disabled:opacity-35"><Minus aria-hidden="true" className="size-4" /></button><button type="button" onClick={() => changeTextSize(1)} disabled={settings.textSize === 'large'} aria-label="Perbesar teks" className="grid size-8 place-items-center rounded-r-lg border-l border-line transition hover:bg-brand/10 hover:text-brand disabled:cursor-not-allowed disabled:opacity-35"><Plus aria-hidden="true" className="size-4" /></button></div></div>
        <ToggleRow icon={Contrast} title="Kontras tinggi" description="Perjelas teks dan batas elemen." enabled={settings.highContrast} onToggle={() => update('highContrast', !settings.highContrast)} />
        <ToggleRow icon={Droplet} title="Skala abu-abu" description="Kurangi intensitas warna." enabled={settings.grayscale} onToggle={() => update('grayscale', !settings.grayscale)} />
        <ToggleRow icon={Volume2} title="Pembaca teks" description="Bacakan informasi dan notifikasi." enabled={settings.tts} onToggle={() => update('tts', !settings.tts)} />
      </div>
      {settings.tts && <button type="button" onClick={() => speakText('Contoh pembaca teks BISARA berbahasa Indonesia.')} className="mt-3 text-xs font-medium text-brand transition hover:text-brand-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">Coba pembaca teks</button>}
      <div className="mt-3 flex justify-end border-t border-line pt-3"><button type="button" onClick={() => { setSettings(DEFAULT_A11Y_SETTINGS); saveA11ySettings(DEFAULT_A11Y_SETTINGS) }} className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"><RotateCcw aria-hidden="true" className="size-3.5" /> Reset</button></div>
    </section>}
  </aside>
}
