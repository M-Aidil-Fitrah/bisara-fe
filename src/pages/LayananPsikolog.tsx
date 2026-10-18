import { Link } from 'react-router-dom'
import ritzLogo from '../assets/logo_ritz.png'
import Breadcrumb from '../components/common/Breadcrumb'

export default function LayananPsikolog() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-24 pt-36">
      <Breadcrumb items={[{ label: 'Fitur', to: '/two-way' }, { label: 'Two-way Service', to: '/two-way' }, { label: 'Layanan Psikolog' }]} />
      <div className="max-w-3xl">
        <p className="text-sm font-medium text-brand">Layanan psikolog</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Salah satu layanan dua arah BISARA.</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">Layanan ini menghubungkan pengguna dengan pendamping dari mitra psikologi. BISARA menyediakan room privat, komunikasi video, chat sementara, serta alur PSS-10; layanan dan pendampingnya berasal dari mitra.</p>
      </div>

      <section className="mt-14 border-y border-line py-8">
        <p className="text-sm font-medium text-muted">Mitra tersedia</p>
        <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div>
            <img src={ritzLogo} alt="Ritz Konsultan Psikologi" className="h-14 w-auto object-contain" />
            <h2 className="mt-6 text-2xl font-semibold">Ritz Konsultan Psikologi</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">Masuk ke layanan Ritz untuk dipasangkan secara privat dengan pendamping yang tersedia. Room dapat diakhiri secara eksplisit dan data PSS sementara dihapus saat sesi berakhir.</p>
          </div>
          <Link to="/two-way/layanan-psikolog/ritz" className="rounded-lg bg-brand px-5 py-3 text-center text-sm font-semibold text-white transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">Lihat layanan Ritz</Link>
        </div>
      </section>
    </section>
  )
}
