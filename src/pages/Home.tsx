import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Minus } from 'lucide-react'
import { Button, Eyebrow, SectionHeader } from '../components/ui'
import { IMG } from '../lib/images'

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
        <img src={IMG.hero} alt="Psikolog berbincang dengan klien di ruang konsultasi" data-hero-bg className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-ink/55" />
        <div data-hero className="relative px-6 pt-24 text-center">
          <h1 className="mx-auto max-w-4xl text-5xl font-normal leading-[1.05] tracking-tight text-paper sm:text-7xl">
            Konsultasi psikolog tanpa hambatan bahasa isyarat
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-paper/80">
            Konsultasi video, instrumen PSS-10, dan frasa resmi disatukan dalam ruang sesi yang tersimpan aman di server.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button onClick={() => handleNav('/session')}>Mulai sesi</Button>
            <Button variant="ghost" className="!text-paper/85 hover:!text-paper" onClick={() => document.getElementById('cara-kerja')?.scrollIntoView({ behavior: 'smooth' })}>Lihat cara kerja</Button>
          </div>
        </div>
      </section>

      {/* STORY BLOCKS */}
      <section id="cara-kerja" className="mx-auto max-w-6xl space-y-24 px-6 py-24 md:space-y-32 md:py-32">
        <Story
          image={IMG.consult} alt="Psikolog berbicara dengan klien di sofa"
          eyebrow="Psikolog ke pengguna Tuli"
          title="Ucapan psikolog, tampil dalam BISINDO"
          body="Psikolog memilih frasa resmi PSS-10. Teks selalu tampil, sedangkan avatar 3D hanya digunakan jika aset animasi frasa tersebut tersedia dan tercatat di server."
          cta="Lihat kosakata" onClick={() => handleNav('/dictionary')}
        />
        <Story
          flip image={IMG.signing} alt="Perempuan memperagakan isyarat tangan"
          eyebrow="Pengguna Tuli ke psikolog"
          title="Jawab dengan pilihan yang jelas"
          body="Teman Tuli memilih jawaban PSS-10 secara langsung. Jawaban disimpan ke backend dan dapat dilihat psikolog dalam sesi yang sama tanpa prediksi isyarat buatan."
          cta="Mulai sesi" onClick={() => handleNav('/session')}
        />
        <Story
          image={IMG.hands} alt="Dua tangan saling menggenggam"
          eyebrow="Konfirmasi pengguna"
          title="Jawaban berada dalam kendali Anda"
          body="Tidak ada nilai prediksi yang dikarang di browser. Skor PSS-10 dihitung backend dari sepuluh jawaban yang benar-benar tersimpan."
          cta="Baca soal privasi" onClick={() => handleNav('/about')}
        />
      </section>

      {/* CARDS */}
      <section className="mx-auto grid max-w-6xl gap-5 px-6 pb-28 md:grid-cols-3">
        {[
          [IMG.light, 'Skrining', 'Sepuluh butir PSS-10', 'Pertanyaan stres tersaji berurutan, dengan ringkasan skor sebagai bahan pertimbangan psikolog.', 'Mulai skrining', '/session'],
          [IMG.laptop, 'Persiapan', 'Siap dalam tiga menit', 'Atur cahaya, posisi kamera, dan tampilan berdampingan sebelum sesi dimulai.', 'Baca panduan', '/guide'],
          [IMG.smile, 'Katalog', 'Periksa frasa yang tersedia', 'Lihat frasa resmi dan status aset animasi yang benar-benar tercatat pada server.', 'Buka katalog', '/dictionary'],
        ].map(([src, e, t, d, c, p]) => (
          <article data-reveal key={t} className="flex flex-col rounded-xl bg-ink p-3 text-paper">
            <img src={src} alt="" className="aspect-[4/3] w-full rounded-lg object-cover" />
            <div className="flex flex-1 flex-col p-4 pt-6">
              <Eyebrow light>{e}</Eyebrow>
              <h3 className="mt-3 text-2xl font-normal leading-tight">{t}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-paper/70">{d}</p>
              <Button variant="light" arrow className="mt-6 self-start" onClick={() => handleNav(p)}>{c}</Button>
            </div>
          </article>
        ))}
      </section>

      {/* AUDIENCE – dark band */}
      <section id="untuk-siapa" className="notch-top bg-ink pb-28 pt-40">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader light align="center" eyebrow="Untuk siapa" title="Satu alat, tiga pihak terbantu" desc="Hambatan komunikasi menjadi tanggung jawab sistem, bukan beban pengguna Tuli." />
          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {[
              [IMG.group, 'Pengguna Tuli', 'Ikuti butir PSS-10 melalui teks dan aset animasi yang tersedia, lalu pilih jawaban secara langsung.'],
              [IMG.psikolog, 'Psikolog', 'Pandu frasa resmi, lakukan konsultasi video, dan tinjau jawaban serta riwayat yang tersimpan.'],
              [IMG.clinic, 'Klinik & kampus', 'Sarana komunikasi yang dapat dipakai ulang lintas sesi, klien, dan tenaga profesional.'],
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
      <section className="mx-auto max-w-6xl px-6 py-28">
        <SectionHeader align="center" eyebrow="Cara sistem bekerja" title="Data operasional berasal dari backend" />
        <dl className="mt-16 grid border-t border-line md:grid-cols-3">
          {[
            ['01', 'Jadwal, pengguna, sesi, pesan, dan riwayat dibaca dari API; browser tidak membuat data klinis pengganti.'],
            ['02', 'Skor PSS-10 dihitung backend dari sepuluh jawaban tersimpan dan aturan pembalikan butir resmi.'],
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
      <section id="cakupan" className="mx-auto max-w-6xl px-6 pb-28">
        <div data-reveal className="grid overflow-hidden rounded-xl bg-surface md:grid-cols-2">
          <img src={IMG.device} alt="Seseorang memakai tablet di sofa" className="h-full min-h-[320px] w-full object-cover" />
          <div className="p-8 md:p-12">
            <Eyebrow>Cakupan prototipe</Eyebrow>
            <h2 className="mt-4 text-3xl font-normal leading-tight sm:text-4xl">Jelas apa yang bisa, dan yang belum</h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <Scope title="Didukung" items={['Sapaan dan percakapan pembuka', '10 butir skrining PSS-10', '5 pilihan jawaban eksplisit', 'Konsultasi video WebRTC P2P']} />
              <Scope muted title="Belum didukung" items={['Pengenalan isyarat otomatis', 'Seluruh variasi BISINDO', 'Diagnosis klinis', 'Pengganti juru bahasa']} />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-28 lg:grid-cols-[1fr_1.4fr]">
          <SectionHeader eyebrow="FAQ" title="Pertanyaan yang sering diajukan" />
          <Faq />
        </div>
      </section>
    </>
  )
}

function Story({ image, alt, eyebrow, title, body, cta, onClick, flip }: { image: string; alt: string; eyebrow: string; title: string; body: string; cta: string; onClick: () => void; flip?: boolean }) {
  return (
    <div className="relative grid items-center md:grid-cols-12">
      <div data-reveal className={`aspect-[4/3] w-full overflow-hidden rounded-lg md:col-span-7 md:row-start-1 ${flip ? 'md:col-start-6' : 'md:col-start-1'}`}>
        <img src={image} alt={alt} data-parallax className="size-full scale-[1.18] object-cover" />
      </div>
      <div data-reveal className={`relative -mt-16 mx-4 rounded-lg bg-ink p-8 text-paper md:mx-0 md:mt-0 md:row-start-1 md:col-span-6 md:p-10 ${flip ? 'md:col-start-1 md:translate-y-16' : 'md:col-start-7 md:-translate-y-12'}`}>
        <Eyebrow light>{eyebrow}</Eyebrow>
        <h3 className="mt-4 text-3xl font-normal leading-[1.1] tracking-tight sm:text-4xl">{title}</h3>
        <p className="mt-5 leading-relaxed text-paper/75">{body}</p>
        <Button variant="light" arrow className="mt-8" onClick={onClick}>{cta}</Button>
      </div>
    </div>
  )
}

function Scope({ title, items, muted }: { title: string; items: string[]; muted?: boolean }) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-3 divide-y divide-line border-t border-line text-sm">
        {items.map((t) => <li key={t} className={`py-2.5 ${muted ? 'text-muted line-through decoration-line' : ''}`}>{t}</li>)}
      </ul>
    </div>
  )
}

const FAQ = [
  ['Apakah BISARA bisa mendiagnosis?', 'Tidak. BISARA adalah alat bantu komunikasi. Skor PSS-10 hanya bahan pertimbangan; interpretasi dan keputusan klinis tetap pada psikolog.'],
  ['Perangkat apa yang dibutuhkan?', 'Laptop atau tablet dengan kamera, mikrofon, dan browser modern. Tidak perlu instalasi aplikasi.'],
  ['Bagaimana jawaban saya dicatat?', 'Anda memilih jawaban PSS-10 yang tampil. Backend menyimpan pilihan tersebut dan menghitung skor setelah sepuluh butir selesai.'],
  ['Apakah video saya disimpan?', 'Backend BISARA tidak menyediakan endpoint penyimpanan rekaman. Media dikirim antarpeserta melalui WebRTC.'],
  ['Apakah menggantikan juru bahasa isyarat?', 'Tidak. BISARA membantu pada sesi awal dan skrining. Untuk konseling mendalam, juru bahasa bersertifikat tetap disarankan.'],
]

function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <div className="border-t border-ink/80">
      {FAQ.map(([q, a], i) => (
        <div key={q} className="border-b border-line">
          <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 py-6 text-left text-lg">
            {q}
            {open === i ? <Minus className="size-4 shrink-0" /> : <Plus className="size-4 shrink-0" />}
          </button>
          {open === i && <p className="-mt-2 pb-6 pr-10 leading-relaxed text-muted">{a}</p>}
        </div>
      ))}
    </div>
  )
}
