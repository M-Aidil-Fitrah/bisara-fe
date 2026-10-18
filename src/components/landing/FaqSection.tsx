import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'

const FAQ = [
  ['Apa itu BISARA?', 'BISARA adalah platform layanan publik berbasis komunikasi visual dengan One-way Service dan layanan dua arah yang tersedia sesuai kebutuhan.'],
  ['Perangkat apa yang dibutuhkan?', 'Laptop atau tablet dengan kamera, mikrofon, dan browser modern. Tidak perlu instalasi aplikasi.'],
  ['Bagaimana data layanan dikelola?', 'Display One-way memakai token privat. Pada layanan psikolog, jawaban PSS hanya tersedia selama room aktif lalu dihapus saat sesi berakhir atau kedaluwarsa.'],
  ['Apakah video saya disimpan?', 'Backend BISARA tidak menyediakan endpoint penyimpanan rekaman. Media dikirim antarpeserta melalui WebRTC.'],
  ['Apakah semua layanan sudah tersedia?', 'Belum. Layanan resepsionis dan layanan publik lainnya memiliki halaman persiapan yang dapat diakses dari menu Fitur.'],
] as const

export default function FaqSection() {
  const [open, setOpen] = useState(-1)
  return <div className="border-t border-ink/80">{FAQ.map(([question, answer], index) => <div key={question} className="border-b border-line"><button type="button" onClick={() => setOpen(open === index ? -1 : index)} aria-expanded={open === index} className="flex w-full items-center justify-between gap-4 py-6 text-left text-lg">{question}{open === index ? <Minus className="size-4 shrink-0" /> : <Plus className="size-4 shrink-0" />}</button><div className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${open === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}><div className="overflow-hidden"><p className="-mt-2 pb-6 pr-10 leading-relaxed text-muted">{answer}</p></div></div></div>)}</div>
}
