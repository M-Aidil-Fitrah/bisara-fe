import { lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { usePublicDisplay } from '../hooks/usePublicDisplay'

const Avatar = lazy(() => import('../components/Avatar'))

export default function Display() {
  const { token } = useParams()
  const { display, error } = usePublicDisplay(token)
  const asset = display?.phrase?.animations[0]

  return (
    <main className="grid min-h-screen place-items-center bg-ink p-8 text-center text-paper">
      <div>
        {error ? <p role="alert" className="text-xl">{error}</p> : <>
          <p className="text-sm text-paper/60">BISARA · layar publik privat</p>
          <h1 className="mt-6 max-w-5xl text-5xl font-semibold sm:text-7xl">{display?.text || 'Memuat pesan…'}</h1>
          {asset && <Suspense fallback={<p className="mt-5 text-sm text-paper/60">Memuat avatar…</p>}><Avatar signing modelUrl={asset.glbUrl} actionName={asset.animationName} className="mx-auto mt-6 h-64 max-w-md" /></Suspense>}
          <button type="button" onClick={() => void document.documentElement.requestFullscreen?.()} className="mt-10 rounded-lg border border-paper/30 px-4 py-3 text-sm transition hover:bg-paper hover:text-ink">Layar penuh</button>
        </>}
      </div>
    </main>
  )
}
