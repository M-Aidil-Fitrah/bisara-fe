type DisplayEditorProps = {
  text: string
  state: 'creating' | 'ready' | 'saving' | 'error'
  displayUrl: string | null
  error: string | null
  catalogWarning: string | null
  isDirty: boolean
  onTextChange: (text: string) => void
  onSave: () => void
  onRetry: () => void
}

export default function DisplayEditor({ text, state, displayUrl, error, catalogWarning, isDirty, onTextChange, onSave, onRetry }: DisplayEditorProps) {
  const cannotSave = state === 'creating' || state === 'saving' || state === 'error' || !text.trim()
  const buttonLabel = state === 'saving' ? 'Menyimpan…' : state === 'creating' ? 'Menyiapkan layar…' : isDirty ? 'Tampilkan ke layar' : 'Pesan tersimpan'

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <label className="text-sm font-semibold" htmlFor="display-text">Teks untuk layar</label>
      <textarea id="display-text" value={text} onChange={(event) => onTextChange(event.target.value)} maxLength={2000} className="mt-3 min-h-64 w-full rounded-xl border border-line bg-paper p-4 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" placeholder="Tulis pesan yang ingin ditampilkan…" />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" disabled={cannotSave || !isDirty} onClick={onSave} className="rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60">{buttonLabel}</button>
        {state === 'error' && <button type="button" onClick={onRetry} className="rounded-lg border border-brand px-4 py-3 text-sm font-semibold text-brand transition hover:bg-brand/10">Coba lagi</button>}
      </div>
      {displayUrl && !isDirty && <p className="mt-4 break-all text-sm text-muted">Link layar privat: <a className="text-brand underline" href={displayUrl} target="_blank" rel="noreferrer">{displayUrl}</a></p>}
      {displayUrl && isDirty && <p className="mt-3 text-sm text-muted">Simpan perubahan agar layar privat menampilkan teks terbaru.</p>}
      {catalogWarning && <p role="status" className="mt-3 text-sm text-amber-700">{catalogWarning}</p>}
      {error && <p role="alert" className="mt-3 text-sm text-[#b8483e]">{error}</p>}
    </div>
  )
}
