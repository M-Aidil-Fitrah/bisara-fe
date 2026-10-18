import type { PssRoom } from '../../api/client'

const ANSWERS = ['Tidak pernah', 'Hampir tidak pernah', 'Kadang-kadang', 'Cukup sering', 'Sangat sering']

export default function PssSummary({ pss }: { pss: PssRoom | null }) {
  return <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface" aria-label="Catatan PSS-10"><div className="flex items-center justify-between border-b border-line px-3 py-2"><h2 className="text-xs font-semibold uppercase tracking-wider text-brand">Catatan PSS-10</h2><span className="text-xs text-muted">{pss?.answers.length ?? 0}/10</span></div><div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-2">{pss?.items.map((item) => { const answer = pss.answers.find((entry) => entry.itemId === item.id); return <div key={item.id} className="rounded-lg bg-paper px-2.5 py-2 text-[11px]"><p className="line-clamp-2 text-ink"><span className="font-semibold">{item.itemNumber}.</span> {item.questionText}</p><p className={`mt-1 font-medium ${answer ? 'text-brand' : 'text-muted'}`}>{answer ? ANSWERS[answer.value] : 'Belum dijawab'}</p></div> }) ?? <p className="p-3 text-xs text-muted">Menunggu data PSS-10…</p>}</div></section>
}
