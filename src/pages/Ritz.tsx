import { Link, useNavigate } from 'react-router-dom'
import ritzLogo from '../assets/logo_ritz.png'
import { useAuth } from '../lib/auth'

export default function Ritz() {
  const user = useAuth()
  const navigate = useNavigate()

  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 pt-36">
      <div className="border-b border-line pb-10">
        <p className="text-sm font-medium text-brand">Mitra layanan</p>
        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <img src={ritzLogo} alt="Ritz Konsultan Psikologi" className="h-16 w-auto object-contain" />
            <h1 className="mt-8 text-4xl font-semibold tracking-tight sm:text-5xl">Layanan psikolog bersama Ritz.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
              Ritz adalah salah satu mitra dalam layanan dua arah BISARA. Pengguna dan pendamping dipasangkan ke room privat untuk komunikasi video, chat sementara, dan alur PSS-10.
            </p>
          </div>
          {user === undefined ? <p className="text-sm text-muted" role="status">Memeriksa sesi Anda…</p> : user ? (
            <button onClick={() => navigate('/meet/ritz-konsultan-psikologi')} className="shrink-0 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">Masuk layanan</button>
          ) : (
            <Link to="/login" state={{ returnTo: '/two-way/layanan-psikolog/ritz' }} className="shrink-0 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">Masuk untuk melanjutkan</Link>
          )}
        </div>
      </div>
      <div className="grid gap-8 py-10 md:grid-cols-3">
        <div><h2 className="text-base font-semibold">Room privat</h2><p className="mt-2 text-sm leading-relaxed text-muted">Akses diberikan hanya kepada pasangan USER dan ADMIN yang sah.</p></div>
        <div><h2 className="text-base font-semibold">Komunikasi langsung</h2><p className="mt-2 text-sm leading-relaxed text-muted">Video dan chat dipakai selama room aktif; chat tidak menjadi riwayat.</p></div>
        <div><h2 className="text-base font-semibold">Sesi yang jelas</h2><p className="mt-2 text-sm leading-relaxed text-muted">Akhiri layanan untuk menutup room dan menghapus jawaban PSS sementara.</p></div>
      </div>
      <Link to="/two-way/layanan-psikolog" className="border-b border-ink pb-1 text-sm font-medium hover:text-brand">Kembali ke informasi layanan psikolog</Link>
    </section>
  )
}
