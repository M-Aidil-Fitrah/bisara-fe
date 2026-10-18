import { lazy, Suspense, useMemo, useState } from 'react'
import { ArrowUpRight, X } from 'lucide-react'
import { PageHeader } from '../components/ui'
import { IMG } from '../lib/images'
import { usePhraseCatalog } from '../lib/catalog'
import type { CatalogPhrase } from '../api/client'

const AvatarPreview = lazy(() => import('../components/Avatar'))

export default function Dictionary() {
  const { phrases, loading, error, refetch } = usePhraseCatalog()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Semua')
  const [open, setOpen] = useState<CatalogPhrase | null>(null)
  const categories = ['Semua', ...Array.from(new Set(phrases.map((phrase) => phrase.category)))]
  const list = useMemo(
    () => phrases.filter((phrase) =>
      (category === 'Semua' || phrase.category === category) &&
      phrase.text.toLowerCase().includes(query.toLowerCase())),
    [phrases, query, category],
  )

  return (
    <>
      <PageHeader image={IMG.signing} eyebrow="Kamus" title="Katalog frasa BISARA" desc="Frasa resmi dan status aset animasi yang tersedia pada server BISARA." />
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari frasa" aria-label="Cari frasa" className="w-full border-b border-ink/80 bg-transparent pb-3 text-2xl outline-none placeholder:text-muted/60 md:max-w-sm" />
          <div className="flex gap-1 overflow-x-auto">
            {categories.map((item) => (
              <button key={item} onClick={() => setCategory(item)} className={`h-9 shrink-0 rounded-md px-3 text-sm transition ${category === item ? 'bg-brand text-white' : 'text-ink hover:bg-surface'}`}>
                {item}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="py-16 text-center text-muted">Memuat katalog dari server…</p>}
        {error && (
          <div className="py-16 text-center">
            <p role="alert" className="text-[#b8483e]">{error}</p>
            <button onClick={() => void refetch()} className="mt-3 text-brand underline">Coba lagi</button>
          </div>
        )}
        {!loading && !error && (
          <>
            <p className="mt-10 text-sm text-muted">{list.length} frasa</p>
            <ul className="mt-3 grid border-t border-ink/80 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((phrase) => (
                <li data-reveal key={phrase.id} className="border-b border-line">
                  <button onClick={() => setOpen(phrase)} className="group flex w-full items-center justify-between gap-4 py-5 pr-4 text-left">
                    <span>
                      <span className="block text-lg group-hover:text-brand">{phrase.text}</span>
                      <span className="mt-1 block text-xs text-muted">{phrase.category} · {phrase.animations.length ? 'Animasi tersedia' : 'Teks saja'}</span>
                    </span>
                    <ArrowUpRight className="size-4 shrink-0 text-muted transition group-hover:text-brand" />
                  </button>
                </li>
              ))}
            </ul>
            {list.length === 0 && <p className="py-16 text-center text-muted">Tidak ada frasa yang cocok.</p>}
          </>
        )}
      </div>

      {open && (() => {
        const animation = open.animations[0]
        return (
          <div role="dialog" aria-modal="true" aria-label={open.text} onClick={() => setOpen(null)} className="fixed inset-0 z-[60] grid place-items-center bg-ink/50 p-4">
            <div onClick={(event) => event.stopPropagation()} className="grid w-full max-w-2xl overflow-hidden rounded-xl bg-surface sm:grid-cols-2">
              <div className="min-h-[300px] bg-brand-tint p-6">
                {animation ? <Suspense fallback={<p className="grid h-full min-h-[250px] place-items-center text-sm text-muted">Memuat avatar…</p>}><AvatarPreview signing modelUrl={animation.glbUrl} actionName={animation.animationName} className="mx-auto size-full max-w-[240px]" /></Suspense> : <div className="grid h-full min-h-[250px] place-items-center px-6 text-center text-sm text-muted">Aset animasi tervalidasi belum tersedia.</div>}
              </div>
              <div className="relative flex flex-col p-8">
                <button onClick={() => setOpen(null)} aria-label="Tutup" className="absolute right-4 top-4 grid size-9 place-items-center rounded-md hover:bg-paper"><X className="size-4" /></button>
                <p className="text-xs uppercase tracking-[0.14em] text-brand">{open.category}</p>
                <p className="mt-3 text-2xl leading-snug">{open.text}</p>
                <p className="mt-auto pt-6 text-sm text-muted">{animation ? `Animasi: ${animation.animationName}` : 'Frasa tersedia sebagai teks tanpa pengganti animasi generik.'}</p>
              </div>
            </div>
          </div>
        )
      })()}
    </>
  )
}
