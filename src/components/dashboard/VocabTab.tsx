import { SIGNS } from '../../data'

const pct = (n: number) => `${Math.round(n * 100)}%`

export default function VocabTab() {
  const rows = SIGNS.map((s, i) => ({
    ...s,
    acc: s.hasClip ? 0.78 + ((i * 17) % 20) / 100 : 0,
    uses: 40 + ((i * 53) % 180),
  }))
  const ready = rows.filter((r) => r.hasClip).length

  return (
    <>
      <div data-dash className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-normal tracking-tight">Katalog Kosakata</h1>
          <p className="mt-2 text-muted">Status animasi avatar dan akurasi pengenalan untuk setiap kata.</p>
        </div>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        {[
          ['Total kata', rows.length],
          ['Animasi 3D siap', ready],
          ['Masih alfabet jari', rows.length - ready],
        ].map(([k, v]) => (
          <div key={k as string} data-dash className="rounded-xl bg-surface p-6">
            <p className="text-sm text-muted">{k}</p>
            <p className="mt-3 text-5xl font-light">{v}</p>
          </div>
        ))}
      </div>

      <div data-dash className="rounded-xl bg-surface p-2">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr className="border-b border-line">
                <th className="px-4 py-3 font-normal">Kata</th>
                <th className="px-4 py-3 font-normal">Kategori</th>
                <th className="px-4 py-3 font-normal">Avatar</th>
                <th className="px-4 py-3 font-normal">Akurasi pengenalan</th>
                <th className="px-4 py-3 font-normal">Dipakai</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.word} className="border-b border-line last:border-0 hover:bg-paper/50">
                  <td className="px-4 py-3.5 font-medium">{r.word}</td>
                  <td className="px-4 py-3.5 text-muted">{r.category}</td>
                  <td className="px-4 py-3.5">
                    {r.hasClip ? (
                      <span className="rounded-md bg-brand-tint px-2 py-1 text-xs text-brand">Animasi 3D</span>
                    ) : (
                      <span className="rounded-md bg-paper px-2 py-1 text-xs text-warn">Alfabet jari</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {r.hasClip ? (
                      <div className="flex items-center gap-3">
                        <div className="h-1 w-24 overflow-hidden rounded-full bg-line">
                          <div className="h-full bg-brand" style={{ width: pct(r.acc) }} />
                        </div>
                        <span className="text-muted">{pct(r.acc)}</span>
                      </div>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-muted">{r.uses}×</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
