import { useNavigate } from 'react-router-dom'
import { PageHeader, Button, Eyebrow } from '../components/ui'
import { IMG } from '../lib/images'

const PREP = [
  ['Cahaya cukup', 'Hadapkan wajah ke sumber cahaya. Hindari cahaya dari belakang.'],
  ['Kamera setinggi dada', 'Pastikan kepala hingga pinggang dan kedua tangan terlihat.'],
  ['Ruangan tenang', 'Kurangi gangguan suara agar percakapan video tetap nyaman.'],
  ['Satu layar, dua tampilan', 'Gunakan mode berdampingan atau dua layar terpisah.'],
]

export default function Guide({ go }: { go?: (p: string) => void }) {
  const navigate = useNavigate()
  const handleNav = (p: string) => {
    if (go) go(p)
    else navigate(p.startsWith('/') ? p : `/${p}`)
  }
  return (
    <>
      <PageHeader
        image={IMG.laptop}
        eyebrow="Panduan"
        title="Siap dalam tiga menit"
        desc="Cara memakai layar informasi dan layanan dua arah BISARA dengan jelas dan nyaman."
      />
      <div className="mx-auto max-w-7xl px-6 py-24">
        <Eyebrow>Sebelum menggunakan layanan</Eyebrow>
        <ol className="mt-6 grid border-t border-ink/80 sm:grid-cols-2 lg:grid-cols-4">
          {PREP.map(([t, d], i) => (
            <li
              data-reveal
              key={t}
              className="border-b border-line py-8 lg:border-b-0 lg:border-r lg:px-6 lg:first:pl-0 lg:last:border-r-0"
            >
              <span className="text-sm text-brand">0{i + 1}</span>
              <p className="mt-6 text-xl">{t}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
            </li>
          ))}
        </ol>

        <div className="mt-24 grid gap-5 md:grid-cols-2">
          <Role
            title="Untuk layar informasi"
            steps={[
              'Buka One-way Service tanpa login.',
              'Tulis pesan dan pilih frasa katalog bila asetnya tersedia.',
              'Bagikan link display privat ke layar tujuan.',
              'Gunakan mode layar penuh pada perangkat display.',
            ]}
          />
          <Role
            dark
            title="Untuk layanan dua arah"
            steps={[
              'Pilih layanan atau mitra yang tersedia dari menu Fitur.',
              'Masuk untuk bergabung ke antrean layanan.',
              'Izinkan kamera dan mikrofon ketika room sudah aktif.',
              'Akhiri layanan saat percakapan selesai agar room ditutup.',
            ]}
          />
        </div>

        <div className="mt-24 flex flex-col items-start justify-between gap-6 border-t border-ink/80 pt-10 sm:flex-row sm:items-center">
          <p className="max-w-lg text-2xl font-normal leading-snug">
            Tidak ada jawaban yang dikirim tanpa persetujuan Anda.
          </p>
          <Button arrow onClick={() => handleNav('/two-way')}>
            Lihat layanan
          </Button>
        </div>
      </div>
    </>
  )
}

function Role({ title, steps, dark }: { title: string; steps: string[]; dark?: boolean }) {
  return (
    <div data-reveal className={`rounded-xl p-8 md:p-10 ${dark ? 'bg-ink text-paper' : 'bg-surface'}`}>
      <h3 className="text-3xl font-normal">{title}</h3>
      <ol
        className={`mt-8 divide-y border-t ${
          dark ? 'divide-paper/15 border-paper/15' : 'divide-line border-line'
        }`}
      >
        {steps.map((s, i) => (
          <li key={s} className="flex gap-5 py-4 leading-relaxed">
            <span className={`w-6 shrink-0 text-sm ${dark ? 'text-brand-soft' : 'text-brand'}`}>{i + 1}</span>
            <span className={dark ? 'text-paper/85' : ''}>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
