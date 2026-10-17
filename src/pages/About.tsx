import { PageHeader, IMG } from '../components/ui'

const ITEMS = [
  ['01', 'Video tidak disimpan', 'Kamera hanya membaca titik gerak tangan, tubuh, dan wajah secara langsung. Rekaman tidak diunggah.'],
  ['02', 'Persetujuan setiap jawaban', 'Hasil pengenalan isyarat baru diteruskan setelah Anda menekan “Kirim”.'],
  ['03', 'Akses terbatas', 'Ringkasan sesi hanya dapat dilihat psikolog yang menangani sesi tersebut.'],
  ['04', 'Hak menghapus data', 'Anda dapat meminta penghapusan data sesi kapan saja.'],
  ['05', 'Data minimum', 'Kami hanya menyimpan teks jawaban yang telah dikonfirmasi, bukan audio atau video.'],
  ['06', 'Sesuai UU PDP', 'Pengelolaan data mengacu pada UU Pelindungan Data Pribadi dan prinsip etika AI.'],
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
