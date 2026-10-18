import { useNavigate } from 'react-router-dom'
import { Button, Eyebrow, SectionHeader } from '../components/ui'
import FaqSection from '../components/landing/FaqSection'
import { LandingStory, ScopeList } from '../components/landing/LandingSections'
import { IMG } from '../lib/images'

const featureCards: ReadonlyArray<{
  image: string
  eyebrow: string
  title: string
  description: string
  callToAction: string
  path: string
}> = [
  { image: IMG.light, eyebrow: 'One-way Service', title: 'Pesan untuk layar lain', description: 'Buat tampilan privat untuk monitor atau televisi dengan teks yang selalu terbaca.', callToAction: 'Buka editor', path: '/one-way' },
  { image: IMG.laptop, eyebrow: 'Two-way Service', title: 'Layanan yang terhubung', description: 'Pilih layanan dua arah dari mitra dan modul publik yang tersedia.', callToAction: 'Lihat layanan', path: '/two-way' },
  { image: IMG.smile, eyebrow: 'Kamus', title: 'Frasa dan aset yang jelas', description: 'Lihat frasa resmi serta status aset animasi yang tercatat di server.', callToAction: 'Buka kamus', path: '/dictionary' },
]

export default function Home({ go }: { go?: (p: string) => void }) {
  const navigate = useNavigate()
  const handleNav = (path: string) => {
    if (go) go(path)
    else navigate(path.startsWith('/') ? path : `/${path === 'home' ? '' : path}`)
  }
  return (
    <>
      {/* HERO */}
      <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden bg-ink">
        <img src={IMG.hero} alt="Pengguna memakai perangkat untuk mengakses layanan publik digital" data-hero-bg className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-ink/55" />
        <div data-hero className="relative px-6 pt-24 text-center">
          <h1 className="mx-auto max-w-4xl text-5xl font-normal leading-[1.05] tracking-tight text-paper sm:text-7xl">
            Layanan publik visual yang lebih mudah diakses
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-paper/80">
            Satu tempat untuk membuat layar informasi privat, menemukan frasa, dan mengakses layanan dua arah dari mitra yang tersedia.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button onClick={() => handleNav('/fitur')}>Lihat layanan</Button>
            <Button variant="ghost" className="!text-paper/85 hover:!text-paper" onClick={() => document.getElementById('cara-kerja')?.scrollIntoView({ behavior: 'smooth' })}>Lihat cara kerja</Button>
          </div>
        </div>
      </section>

      {/* STORY BLOCKS */}
      <section id="cara-kerja" className="mx-auto max-w-7xl space-y-24 px-6 py-24 md:space-y-32 md:py-32">
        <LandingStory
          image={IMG.consult} alt="Dua orang berkomunikasi di ruang layanan"
          eyebrow="Layanan publik"
          title="Pesan teks yang dapat dibagikan ke layar"
          body="One-way Service membuat layar privat untuk monitor lain. Teks selalu tampil; avatar 3D hanya digunakan bila katalog backend memiliki asset yang cocok."
          callToAction="Lihat kosakata" onClick={() => handleNav('/dictionary')}
        />
        <LandingStory
          flip image={IMG.signing} alt="Perempuan memperagakan isyarat tangan"
          eyebrow="Layanan dua arah"
          title="Ruang privat untuk layanan yang membutuhkan percakapan"
          body="Setiap layanan memiliki alur sendiri. Layanan psikolog tersedia dengan room privat, PSS-10, chat sementara, dan video langsung."
          callToAction="Lihat layanan dua arah" onClick={() => handleNav('/two-way')}
        />
        <LandingStory
          image={IMG.hands} alt="Dua tangan saling menggenggam"
          eyebrow="Konfirmasi pengguna"
          title="Jawaban berada dalam kendali Anda"
          body="Tidak ada nilai prediksi yang dikarang di browser. Skor PSS-10 dihitung backend dari sepuluh jawaban yang benar-benar tersimpan."
          callToAction="Baca soal privasi" onClick={() => handleNav('/about')}
        />
      </section>

      {/* CARDS */}
      <section className="mx-auto grid max-w-7xl gap-5 px-6 pb-28 md:grid-cols-3">
        {featureCards.map((card) => (
          <article data-reveal key={card.title} className="flex flex-col rounded-xl bg-ink p-3 text-paper">
            <img src={card.image} alt="" className="aspect-[4/3] w-full rounded-lg object-cover" />
            <div className="flex flex-1 flex-col p-4 pt-6">
              <Eyebrow light>{card.eyebrow}</Eyebrow>
              <h3 className="mt-3 text-2xl font-normal leading-tight">{card.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-paper/70">{card.description}</p>
              <Button variant="light" arrow className="mt-6 self-start" onClick={() => handleNav(card.path)}>{card.callToAction}</Button>
            </div>
          </article>
        ))}
      </section>

      {/* AUDIENCE – dark band */}
      <section id="untuk-siapa" className="notch-top bg-ink pb-28 pt-40">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader light align="center" eyebrow="Untuk siapa" title="Satu alat, tiga pihak terbantu" desc="Hambatan komunikasi menjadi tanggung jawab sistem, bukan beban pengguna Tuli." />
          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {[
              [IMG.group, 'Pengguna layanan', 'Gunakan teks, tampilan privat, dan layanan dua arah sesuai kebutuhan.'],
              [IMG.psikolog, 'Mitra layanan', 'Sediakan pendamping dan alur layanan yang terhubung ke room privat BISARA.'],
              [IMG.clinic, 'Instansi publik', 'Siapkan komunikasi visual untuk kebutuhan informasi, resepsionis, dan layanan berikutnya.'],
            ].map(([src, t, d]) => (
              <article data-reveal key={t} className="rounded-xl bg-surface p-3">
                <img src={src} alt="" className="aspect-[16/11] w-full rounded-lg object-cover" />
                <div className="p-4 pt-6">
                  <h3 className="text-2xl font-normal">{t}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{d}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* VERIFIED CAPABILITIES */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <SectionHeader align="center" eyebrow="Cara sistem bekerja" title="Data operasional berasal dari backend" />
        <dl className="mt-16 grid border-t border-line md:grid-cols-3">
          {[
            ['01', 'Display privat, katalog, partner, dan room layanan berasal dari API; browser tidak membuat data pengganti.'],
            ['02', 'Layanan psikolog menghitung PSS-10 dari jawaban room aktif dan menghapusnya saat sesi selesai.'],
            ['03', 'Animasi hanya tampil ketika katalog backend menunjuk aset dan nama klip yang benar-benar tersedia.'],
          ].map(([number, text]) => (
            <div data-reveal key={number} className="border-b border-line py-10 md:border-b-0 md:border-r md:px-8 md:last:border-r-0 md:first:pl-0">
              <dt className="text-6xl font-light tracking-tight text-brand">{number}</dt>
              <dd className="mt-4 leading-relaxed">{text}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* SCOPE */}
      <section id="cakupan" className="mx-auto max-w-7xl px-6 pb-28">
        <div data-reveal className="grid overflow-hidden rounded-xl bg-surface md:grid-cols-2">
          <img src={IMG.device} alt="Seseorang memakai tablet di sofa" className="h-full min-h-[320px] w-full object-cover" />
          <div className="p-8 md:p-12">
            <Eyebrow>Cakupan prototipe</Eyebrow>
            <h2 className="mt-4 text-3xl font-normal leading-tight sm:text-4xl">Jelas apa yang bisa, dan yang belum</h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <ScopeList title="Tersedia saat ini" items={['Layar informasi privat One-way', 'Kamus frasa dan status aset', 'Layanan psikolog', 'Video WebRTC P2P di room aktif']} />
              <ScopeList muted title="Dalam persiapan" items={['Layanan resepsionis', 'Layanan publik lain', 'Pengenalan isyarat otomatis', 'Seluruh variasi BISINDO']} />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-line">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-28 lg:grid-cols-[1fr_1.4fr]">
          <SectionHeader eyebrow="FAQ" title="Pertanyaan yang sering diajukan" />
          <FaqSection />
        </div>
      </section>
    </>
  )
}
