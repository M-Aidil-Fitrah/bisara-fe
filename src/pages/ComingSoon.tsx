import { Link, useParams } from 'react-router-dom'
import Breadcrumb from '../components/common/Breadcrumb'

const services = {
  resepsionis: {
    title: 'Layanan Resepsionis',
    text: 'Modul untuk membantu komunikasi di meja penerima layanan sedang disiapkan.',
  },
  'layanan-lainnya': {
    title: 'Layanan Publik Lainnya',
    text: 'BISARA sedang menyiapkan integrasi untuk kebutuhan layanan publik berikutnya.',
  },
} as const

export default function ComingSoon() {
  const { service } = useParams()
  const content = services[service as keyof typeof services] ?? services['layanan-lainnya']
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 pt-36">
      <Breadcrumb items={[{ label: 'Fitur', to: '/two-way' }, { label: 'Two-way Service', to: '/two-way' }, { label: content.title }]} />
      <p className="text-sm font-medium text-brand">Dalam persiapan</p>
      <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">{content.title}</h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{content.text}</p>
      <Link to="/two-way" className="mt-10 inline-block border-b border-ink pb-1 text-sm font-medium text-ink hover:text-brand">Kembali ke layanan dua arah</Link>
    </section>
  )
}
