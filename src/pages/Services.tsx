import { Link } from 'react-router-dom'
import Breadcrumb from '../components/common/Breadcrumb'

const services = [
  { title: 'Layanan Psikolog', description: 'Komunikasi dua arah bersama mitra psikologi yang tersedia di BISARA.', path: '/two-way/layanan-psikolog', status: 'Tersedia' },
  { title: 'Layanan Resepsionis', description: 'Dukungan komunikasi untuk meja penerima layanan publik.', path: '/two-way/resepsionis', status: 'Segera hadir' },
  { title: 'Layanan Publik Lainnya', description: 'Ruang untuk modul layanan publik berikutnya yang terhubung dengan BISARA.', path: '/two-way/layanan-lainnya', status: 'Segera hadir' },
] as const

export default function Services() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-24 pt-36">
      <Breadcrumb items={[{ label: 'Fitur' }, { label: 'Two-way Service' }]} />
      <div className="max-w-3xl">
        <p className="text-sm font-medium text-brand">Two-way Service</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Layanan publik yang mempertemukan orang.</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted">BISARA menyiapkan layanan dua arah yang dapat dipakai sesuai konteks layanan dan kebutuhan pengguna.</p>
      </div>
      <div className="mt-12 divide-y divide-line border-y border-line">
        {services.map((service) => (
          <Link key={service.path} to={service.path} className="grid gap-4 py-7 transition hover:bg-surface sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-4">
            <div>
              <h2 className="text-xl font-semibold text-ink">{service.title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{service.description}</p>
            </div>
            <span className="text-sm font-medium text-brand">{service.status}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
