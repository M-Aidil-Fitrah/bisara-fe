import { CheckCircle2, HeartHandshake } from 'lucide-react'

interface ConsultationGuideProps {
  role: 'USER' | 'ADMIN'
  started: boolean
  canConsent: boolean
  onConsent: () => void
}

export default function ConsultationGuide({ role, started, canConsent, onConsent }: ConsultationGuideProps) {
  if (started) {
    return <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800"><CheckCircle2 className="size-4" /> PSS-10 sedang berlangsung. Jawaban dicatat hanya selama sesi.</div>
  }

  return <div className="rounded-xl border border-brand/20 bg-brand-tint/50 p-3 text-sm">
    <div className="flex items-center gap-2 font-semibold text-brand"><HeartHandshake className="size-4" /> Pembukaan konsultasi</div>
    {role === 'ADMIN' ? (
      <div className="mt-2 space-y-1.5 text-xs leading-relaxed text-ink">
        <p>Mulai dengan menanyakan kabar dan beri ruang pengguna menyampaikan perasaannya.</p>
        <p>Jelaskan bahwa ada 10 pertanyaan tentang pengalaman satu bulan terakhir dengan lima pilihan frekuensi.</p>
        <p className="font-medium">Tunggu pengguna memilih “Bersedia, mulai”.</p>
      </div>
    ) : (
      <div className="mt-2 text-xs leading-relaxed text-ink">
        <p>Psikolog akan mendengarkan ceritamu, lalu mengajukan 10 pertanyaan singkat tentang pengalaman satu bulan terakhir.</p>
        <button type="button" onClick={onConsent} disabled={!canConsent} className="mt-3 rounded-lg bg-brand px-4 py-2 font-semibold text-white disabled:cursor-wait disabled:opacity-50">Bersedia, mulai</button>
        {!canConsent && <span className="ml-2 text-muted">Menyiapkan ruang…</span>}
      </div>
    )}
  </div>
}
