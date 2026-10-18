import { useEffect, useMemo, useState } from 'react'
import { api, ApiError, type Display, type Phrase } from '../api/client'
import Breadcrumb from '../components/common/Breadcrumb'
import DisplayEditor from '../components/display/DisplayEditor'
import DisplayPreview from '../components/display/DisplayPreview'

export default function OneWay() {
  const [display, setDisplay] = useState<(Display & { editorToken: string }) | null>(null)
  const [phrases, setPhrases] = useState<Phrase[]>([])
  const [text, setText] = useState('')
  const [state, setState] = useState<'idle' | 'creating' | 'saving' | 'error'>('creating')
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { void Promise.all([api.displays.create(), api.catalog.phrases()]).then(([created, items]) => { setDisplay(created); setPhrases(items); setState('idle') }).catch((cause) => { setError(cause instanceof ApiError ? cause.message : 'Layanan display tidak dapat disiapkan'); setState('error') }) }, [])
  const phrase = useMemo(() => phrases.find((item) => item.text.trim().toLocaleLowerCase('id-ID') === text.trim().toLocaleLowerCase('id-ID')) ?? null, [phrases, text])
  const save = async () => { if (!display) return; setState('saving'); try { const updated = await api.displays.update(display.token, display.editorToken, { text, phraseId: phrase?.id ?? null }); setDisplay({ ...updated, editorToken: display.editorToken }); setState('idle') } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Perubahan gagal disimpan'); setState('error') } }
  const url = display ? `${window.location.origin}/display/${display.token}` : ''
  return (
    <section className="mx-auto max-w-7xl px-6 pb-12 pt-32">
      <Breadcrumb items={[{ label: 'Fitur', to: '/two-way' }, { label: 'One-way Service' }]} />
      <div className="mb-6">
        <p className="text-sm font-semibold text-brand">One-way Service</p>
        <h1 className="mt-2 text-3xl font-semibold">Editor dan layar publik privat</h1>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <DisplayEditor text={text} state={state} displayUrl={display ? url : null} error={error} onTextChange={setText} onSave={() => void save()} />
        <DisplayPreview text={text} phrases={phrases} />
      </div>
    </section>
  )
}
