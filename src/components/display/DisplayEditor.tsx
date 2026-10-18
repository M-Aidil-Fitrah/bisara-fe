type DisplayEditorProps = {
  text: string
  state: 'idle' | 'creating' | 'saving' | 'error'
  displayUrl: string | null
  error: string | null
  onTextChange: (text: string) => void
  onSave: () => void
}

export default function DisplayEditor({ text, state, displayUrl, error, onTextChange, onSave }: DisplayEditorProps) {
  return <div className="rounded-2xl border border-line bg-surface p-5"><label className="text-sm font-semibold" htmlFor="display-text">Teks untuk layar</label><textarea id="display-text" value={text} onChange={(event) => onTextChange(event.target.value)} maxLength={2000} className="mt-3 min-h-64 w-full rounded-xl border border-line bg-paper p-4 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" placeholder="Tulis pesan yang ingin ditampilkan…" /><button type="button" disabled={state === 'creating' || state === 'saving'} onClick={onSave} className="mt-4 rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60">{state === 'saving' ? 'Menyimpan…' : state === 'creating' ? 'Menyiapkan…' : 'Tampilkan ke layar'}</button>{displayUrl && <p className="mt-4 break-all text-sm text-muted">Link layar privat: <a className="text-brand underline" href={displayUrl} target="_blank" rel="noreferrer">{displayUrl}</a></p>}{error && <p role="alert" className="mt-3 text-sm text-[#b8483e]">{error}</p>}</div>
}
