import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, ShieldCheck, Users } from 'lucide-react'
import ritzLogo from '../assets/logo_ritz.png'
import { useAuth } from '../lib/auth'

export default function Ritz() {
  const user = useAuth()
  const navigate = useNavigate()

  return (
    <section className="mx-auto max-w-3xl px-6 pb-24 pt-36">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-muted">
        <Link to="/two-way" className="hover:text-brand transition">Two-way Service</Link>
        <span>/</span>
        <Link to="/two-way/layanan-psikolog" className="hover:text-brand transition">Layanan Psikolog</Link>
        <span>/</span>
        <span className="text-ink font-medium">Ritz</span>
      </nav>

      <div className="flex items-center justify-between">
        <img src={ritzLogo} alt="Ritz Konsultan Psikologi" className="h-16 w-auto object-contain" />
        <Link
          to="/two-way/layanan-psikolog"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink transition"
        >
          <ArrowLeft className="size-3.5" />
          <span>Kembali ke info mitra</span>
        </Link>
      </div>

      <p className="mt-8 text-sm font-semibold text-brand">Mitra layanan</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Layanan Psikolog bersama Ritz.</h1>
      <p className="mt-5 leading-relaxed text-muted">
        Setelah masuk, pengguna akan ditempatkan pada antrean privat. Admin Ritz mengambil pengguna yang menunggu
        paling lama; percakapan dan sinyal panggilan tidak disimpan sebagai riwayat klinis.
      </p>

      {/* Highlights */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-line bg-surface p-4">
          <Clock className="size-5 text-brand" />
          <h4 className="mt-2 text-sm font-semibold">Matchmaking Otomatis</h4>
          <p className="mt-1 text-xs text-muted">Antrean antarpengguna dan admin dipasangkan secara instan.</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <Users className="size-5 text-brand" />
          <h4 className="mt-2 text-sm font-semibold">Tatap Muka HD</h4>
          <p className="mt-1 text-xs text-muted">Video P2P WebRTC langsung dengan pendamping.</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <ShieldCheck className="size-5 text-brand" />
          <h4 className="mt-2 text-sm font-semibold">Privasi Terjamin</h4>
          <p className="mt-1 text-xs text-muted">Sesi berakhir menghapus seluruh data pertukaran.</p>
        </div>
      </div>

      {user === undefined ? (
        <p className="mt-8 rounded-xl bg-paper p-4 text-sm text-muted" role="status">
          Memeriksa sesi Anda…
        </p>
      ) : user ? (
        <button
          onClick={() => navigate('/meet/ritz-konsultan-psikologi')}
          className="mt-8 rounded-lg bg-brand px-6 py-3 font-semibold text-white transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand shadow-sm"
        >
          Masuk antrean layanan
        </button>
      ) : (
        <Link
          to="/login"
          state={{ returnTo: '/two-way/layanan-psikolog/ritz' }}
          className="mt-8 inline-block rounded-lg bg-brand px-6 py-3 font-semibold text-white transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand shadow-sm"
        >
          Masuk untuk melanjutkan
        </Link>
      )}
    </section>
  )
}
