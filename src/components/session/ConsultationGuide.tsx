import { useState } from 'react'
import { CheckCircle2, HeartHandshake, NotebookPen } from 'lucide-react'

interface ConsultationGuideProps {
  role: 'USER' | 'ADMIN'
  started: boolean
  canConsent: boolean
  onConsent: () => void
}

export default function ConsultationGuide({ role, started, canConsent, onConsent }: ConsultationGuideProps) {
  const [notes, setNotes] = useState('')

  if (role === 'ADMIN') {
    return <section className="rounded-xl border border-brand/20 bg-brand-tint/50 p-3" aria-label="Catatan sesi psikolog">
      <label htmlFor="psychologist-notes" className="flex items-center gap-2 text-sm font-semibold text-brand"><NotebookPen className="size-4" /> Catatan psikolog</label>
      <textarea
        id="psychologist-notes"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        rows={3}
        maxLength={1_000}
        placeholder="Tulis catatan sementara selama konsultasi…"
        className="mt-2 w-full resize-none rounded-lg border border-line bg-surface px-3 py-2 text-xs leading-relaxed text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
      />
      <p className="mt-1 text-[10px] text-muted">Catatan hanya tersimpan di halaman ini dan hilang saat sesi ditutup.</p>
    </section>
  }

  if (started) {
    return <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800"><CheckCircle2 className="size-4" /> PSS-10 sedang berlangsung. Jawaban dicatat hanya selama sesi.</div>
  }

  return <div className="rounded-xl border border-brand/20 bg-brand-tint/50 p-3 text-sm">
    <div className="flex items-center gap-2 font-semibold text-brand"><HeartHandshake className="size-4" /> Pembukaan konsultasi</div>
    <div className="mt-2 text-xs leading-relaxed text-ink">
      <p>Psikolog akan mendengarkan ceritamu, lalu mengajukan 10 pertanyaan singkat tentang pengalaman satu bulan terakhir.</p>
      <button type="button" onClick={onConsent} disabled={!canConsent} className="mt-3 rounded-lg bg-brand px-4 py-2 font-semibold text-white disabled:cursor-wait disabled:opacity-50">Bersedia, mulai</button>
      {!canConsent && <span className="ml-2 text-muted">Menyiapkan ruang…</span>}
    </div>
  </div>
}
