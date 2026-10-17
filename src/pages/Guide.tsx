import type { Page } from '../App'
import { PageHeader, Button, Eyebrow, IMG } from '../components/ui'

const PREP = [
  ['Cahaya cukup', 'Hadapkan wajah ke sumber cahaya. Hindari cahaya dari belakang.'],
  ['Kamera setinggi dada', 'Pastikan kepala hingga pinggang dan kedua tangan terlihat.'],
  ['Ruangan tenang', 'Psikolog bicara jelas dengan tempo wajar agar transkripsi akurat.'],
  ['Satu layar, dua tampilan', 'Gunakan mode berdampingan atau dua layar terpisah.'],
]

export default function Guide({ go }: { go: (p: Page) => void }) {
  return (
    <>
      <PageHeader
        image={IMG.laptop}
        eyebrow="Panduan"
        title="Siap dalam tiga menit"
        desc="Persiapan singkat agar sesi nyaman dan akurat bagi kedua pihak."
      />
      <div className="mx-auto max-w-6xl px-6 py-24">
        <Eyebrow>Sebelum sesi</Eyebrow>
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
            title="Untuk psikolog"
            steps={[
              'Tekan tombol mikrofon, lalu bacakan kalimat yang tampil.',
              'Tunggu avatar selesai menyampaikan isyarat.',
              'Jawaban klien masuk sebagai teks dan suara setelah dikonfirmasi.',
              'Gunakan ringkasan skor sebagai bahan pertimbangan klinis.',
            ]}
          />
          <Role
            dark
            title="Untuk pengguna Tuli"
            steps={[
              'Perhatikan avatar dan teks. Ulangi atau perlambat isyarat bila perlu.',
              'Tekan “Jawab dengan isyarat”, lalu peragakan jawaban Anda.',
              'Periksa hasil bacaan. Kirim jika benar, ubah jika keliru.',
              'Anda selalu bisa memilih jawaban secara manual.',
            ]}
          />
        </div>

        <div className="mt-24 flex flex-col items-start justify-between gap-6 border-t border-ink/80 pt-10 sm:flex-row sm:items-center">
          <p className="max-w-lg text-2xl font-normal leading-snug">
            Tidak ada jawaban yang dikirim tanpa persetujuan Anda.
          </p>
          <Button arrow onClick={() => go('session')}>
            Saya siap
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
