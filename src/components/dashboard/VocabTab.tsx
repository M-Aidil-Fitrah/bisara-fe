import { usePhraseCatalog } from '../../lib/catalog'

export default function VocabTab() {
  const { phrases, loading, error, refetch } = usePhraseCatalog()
  const ready = phrases.filter((phrase) => phrase.animations.length > 0).length
  const metrics: ReadonlyArray<{ label: string; value: number }> = [
    { label: 'Total frasa', value: phrases.length },
    { label: 'Animasi tersedia', value: ready },
    { label: 'Tanpa animasi', value: phrases.length - ready },
  ]

  return (
    <>
      <div data-dash className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-normal tracking-tight">Katalog Frasa</h1>
          <p className="mt-2 text-muted">Data frasa dan aset animasi yang tercatat di server.</p>
        </div>
        <button onClick={() => void refetch()} className="text-sm text-brand hover:text-ink">Sinkronkan</button>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} data-dash className="rounded-xl bg-surface p-6">
            <p className="text-sm text-muted">{metric.label}</p>
            <p className="mt-3 text-5xl font-light">{metric.value}</p>
          </div>
        ))}
      </div>

      {loading && <p className="rounded-xl bg-surface p-8 text-muted">Memuat katalog dari server…</p>}
      {error && <p role="alert" className="rounded-xl bg-surface p-8 text-[#b8483e]">{error}</p>}
      {!loading && !error && (
        <div data-dash className="rounded-xl bg-surface p-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs text-muted">
                <tr className="border-b border-line">
                  <th className="px-4 py-3 font-normal">Frasa</th>
                  <th className="px-4 py-3 font-normal">Kategori</th>
                  <th className="px-4 py-3 font-normal">Aset avatar</th>
                  <th className="px-4 py-3 font-normal">Nama animasi</th>
                </tr>
              </thead>
              <tbody>
                {phrases.map((phrase) => {
                  const animation = phrase.animations[0]
                  return (
                    <tr key={phrase.id} className="border-b border-line last:border-0 hover:bg-paper/50">
                      <td className="max-w-xl px-4 py-3.5 font-medium">{phrase.text}</td>
                      <td className="px-4 py-3.5 text-muted">{phrase.category}</td>
                      <td className="px-4 py-3.5">
                        <span className={`rounded-md px-2 py-1 text-xs ${animation ? 'bg-brand-tint text-brand' : 'bg-paper text-muted'}`}>
                          {animation ? 'Tersedia' : 'Belum tersedia'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-muted">{animation?.animationName ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {phrases.length === 0 && <p className="p-10 text-center text-muted">Katalog server masih kosong.</p>}
          </div>
        </div>
      )}
    </>
  )
}
