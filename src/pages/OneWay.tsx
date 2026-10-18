import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, ApiError, type Display, type Phrase } from '../api/client'
import Breadcrumb from '../components/common/Breadcrumb'
import DisplayEditor from '../components/display/DisplayEditor'
import DisplayPreview from '../components/display/DisplayPreview'

export default function OneWay() {
  const [display, setDisplay] = useState<(Display & { editorToken: string }) | null>(null)
  const [phrases, setPhrases] = useState<Phrase[]>([])
  const [text, setText] = useState('')
  const [state, setState] = useState<'creating' | 'ready' | 'saving' | 'create-error' | 'save-error'>('creating')
  const [error, setError] = useState<string | null>(null)
  const [catalogWarning, setCatalogWarning] = useState<string | null>(null)
  const [savedText, setSavedText] = useState<string | null>(null)

  const prepareDisplay = useCallback(async () => {
    setState('creating')
    setError(null)
    try {
      const created = await api.displays.create()
      setDisplay(created)
      setSavedText(null)
      setState('ready')
    } catch (cause) {
      setDisplay(null)
      setError(cause instanceof ApiError ? cause.message : 'Layanan display tidak dapat disiapkan')
      setState('create-error')
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    void api.displays.create()
      .then((created) => {
        if (cancelled) return
        setDisplay(created)
        setSavedText(null)
        setState('ready')
      })
      .catch((cause) => {
        if (cancelled) return
        setDisplay(null)
        setError(cause instanceof ApiError ? cause.message : 'Layanan display tidak dapat disiapkan')
        setState('create-error')
      })
    void api.catalog.phrases()
      .then((items) => {
        if (cancelled) return
        setPhrases(items)
        setCatalogWarning(null)
      })
      .catch(() => {
        if (!cancelled) setCatalogWarning('Katalog animasi belum dapat dimuat. Teks tetap dapat ditampilkan tanpa avatar.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const phrase = useMemo(() => phrases.find((item) => item.text.trim().toLocaleLowerCase('id-ID') === text.trim().toLocaleLowerCase('id-ID')) ?? null, [phrases, text])
  const normalizedText = text.trim()
  const isDirty = savedText !== normalizedText
  const save = async () => {
    if (!display || !normalizedText) return
    setState('saving')
    setError(null)
    try {
      const updated = await api.displays.update(display.token, display.editorToken, { text: normalizedText, phraseId: phrase?.id ?? null })
      setDisplay({ ...updated, editorToken: display.editorToken })
      setText(updated.text)
      setSavedText(updated.text)
      setState('ready')
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Perubahan gagal disimpan')
      setState('save-error')
    }
  }
  const url = display ? `${window.location.origin}/display/${display.token}` : ''
  return (
    <section className="mx-auto max-w-7xl px-6 pb-12 pt-32">
      <Breadcrumb items={[{ label: 'Fitur', to: '/two-way' }, { label: 'One-way Service' }]} />
      <div className="mb-6">
        <p className="text-sm font-semibold text-brand">One-way Service</p>
        <h1 className="mt-2 text-3xl font-semibold">Editor dan layar publik privat</h1>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <DisplayEditor text={text} state={state} displayUrl={display && savedText ? url : null} error={error} catalogWarning={catalogWarning} isDirty={isDirty} onTextChange={setText} onSave={() => void save()} onRetry={() => void prepareDisplay()} />
        <DisplayPreview text={text} phrases={phrases} />
      </div>
    </section>
  )
}
