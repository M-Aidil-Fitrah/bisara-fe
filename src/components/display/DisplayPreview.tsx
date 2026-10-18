import { lazy, Suspense } from 'react'
import type { Phrase } from '../../api/client'

const Avatar = lazy(() => import('../Avatar'))

export default function DisplayPreview({ text, phrase }: { text: string; phrase: Phrase | null }) {
  const asset = phrase?.animations[0]
  return <div className="grid min-h-96 place-items-center rounded-2xl bg-ink p-8 text-center text-paper"><div className="w-full"><p className="text-sm text-paper/60">Preview layar</p><p className="mt-5 text-3xl font-semibold">{text || 'Pesan Anda akan muncul di sini.'}</p>{asset ? <Suspense fallback={<p className="mt-5 text-sm text-paper/60">Memuat avatar…</p>}><Avatar signing modelUrl={asset.glbUrl} actionName={asset.animationName} className="mx-auto mt-5 h-56 max-w-sm" /></Suspense> : <p className="mt-8 text-sm text-paper/60">{text ? 'Tidak ada aset animasi untuk teks ini; layar tetap menampilkan teks.' : 'Avatar akan dimuat hanya jika teks tepat cocok dengan katalog backend.'}</p>}</div></div>
}
