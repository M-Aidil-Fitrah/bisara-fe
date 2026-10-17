import { Link } from 'react-router-dom'
import { Button } from '../ui'

export default function SessionLoginPrompt() {
  return (
    <div className="mx-auto flex min-h-[75vh] max-w-2xl flex-col items-center justify-center px-6 py-32 text-center">
      <span className="rounded-full bg-brand/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-brand">
        Akses Sesi Konsultasi
      </span>
      <h1 className="mt-6 text-4xl font-normal tracking-tight sm:text-5xl">
        Silakan masuk untuk memulai sesi
      </h1>
      <p className="mt-4 max-w-lg leading-relaxed text-muted">
        Untuk menghubungkan ruang tunggu klien dengan psikolog yang bertugas, silakan masuk dengan akun Teman Tuli atau Psikolog Anda.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link to="/login">
          <Button arrow>
            Masuk Sekarang
          </Button>
        </Link>
        <Link to="/register">
          <Button variant="outline">
            Daftar Akun Baru
          </Button>
        </Link>
      </div>
    </div>
  )
}
