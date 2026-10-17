import { PageHeader } from '../components/ui'
import { IMG } from '../lib/images'

const ITEMS = [
  ['01', 'Video antarpeserta', 'Media konsultasi dikirim melalui koneksi WebRTC dan tidak memiliki endpoint penyimpanan rekaman di backend BISARA.'],
  ['02', 'Jawaban eksplisit', 'Jawaban baru disimpan setelah pengguna memilih dan mengirimkannya. Tidak ada prediksi isyarat otomatis yang dijadikan jawaban.'],
  ['03', 'Akses terbatas', 'Detail sesi hanya dapat diakses peserta sesi dan administrator yang terautentikasi.'],
  ['04', 'Identitas server', 'Cookie sesi bersifat HttpOnly dan WebSocket memverifikasi identitas serta keanggotaan sesi melalui backend.'],
  ['05', 'Data terukur', 'Backend menyimpan jadwal, teks percakapan, jawaban, catatan psikolog, dan hasil PSS-10; bukan aliran video.'],
  ['06', 'Peran terpisah', 'Pendaftaran publik hanya membuat akun Teman Tuli. Akun psikolog dibuat administrator dengan data profesi dan SIPP.'],
]

export default function About() {
  return (
    <>
      <PageHeader
        image={IMG.hands}
        eyebrow="Privasi"
        title="Privasi & keamanan data"
        desc="Sesi kesehatan mental menuntut rasa aman. Berikut cara BISARA memperlakukan data Anda."
      />
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid border-t border-ink/80 md:grid-cols-2">
          {ITEMS.map(([n, t, d]) => (
            <div
              data-reveal
              key={n}
              className="grid grid-cols-[48px_1fr] border-b border-line py-8 md:odd:pr-10 md:even:pl-10"
            >
              <span className="text-sm text-brand">{n}</span>
              <div>
                <h3 className="text-2xl font-normal">{t}</h3>
                <p className="mt-2 leading-relaxed text-muted">{d}</p>
              </div>
            </div>
          ))}
        </div>
        <div data-reveal className="mt-16 rounded-xl bg-ink p-8 text-paper md:p-10">
          <p className="text-2xl font-normal leading-snug">
            BISARA adalah alat bantu komunikasi, bukan alat diagnosis dan bukan pengganti juru bahasa isyarat.
          </p>
          <p className="mt-4 text-paper/70">
            Interpretasi hasil skrining serta keputusan klinis sepenuhnya menjadi tanggung jawab psikolog.
          </p>
        </div>
      </div>
    </>
  )
}
