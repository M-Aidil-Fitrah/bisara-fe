import { useParams } from 'react-router-dom'
import SignSequencePlayer from '../components/display/SignSequencePlayer'
import { usePhraseCatalog } from '../lib/catalog'
import { usePublicDisplay } from '../hooks/usePublicDisplay'

export default function Display() {
  const { token } = useParams()
  const { display, loading, realtimeConnected, error } = usePublicDisplay(token)
  const { phrases } = usePhraseCatalog()

  return (
    <main className="grid min-h-screen place-items-center bg-ink p-5 text-center text-paper sm:p-8">
      <div className="w-full max-w-6xl">
        {error && !display ? <p role="alert" className="text-xl">{error}</p> : <>
          <p className="text-sm text-paper/60">BISARA · layar publik privat</p>
          <SignSequencePlayer text={display?.text ?? ''} phrases={phrases} className="mx-auto mt-5 h-[min(62vh,620px)] w-full" />
          <h1 className="mx-auto mt-5 max-w-5xl text-3xl font-semibold sm:text-5xl">{loading ? 'Memuat pesan…' : display?.text || 'Menunggu pesan dari editor…'}</h1>
          {!loading && display && <p className="mt-3 text-xs text-paper/45" role="status">{realtimeConnected ? 'Terhubung realtime' : 'Menyambungkan ulang · pembaruan berkala aktif'}</p>}
          <button type="button" onClick={() => void document.documentElement.requestFullscreen?.()} className="mt-6 rounded-lg border border-paper/30 px-4 py-3 text-sm transition hover:bg-paper hover:text-ink">Layar penuh</button>
        </>}
      </div>
    </main>
  )
}
