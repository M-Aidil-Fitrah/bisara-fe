import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, HeartPulse, MessageSquare, ShieldCheck, Video } from 'lucide-react'
import ritzLogo from '../assets/logo_ritz.png'
import { useAuth } from '../lib/auth'

export default function LayananPsikolog() {
  const user = useAuth()

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-36">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted">
        <Link to="/two-way" className="hover:text-brand transition">Two-way Service</Link>
        <span>/</span>
        <span className="text-ink font-medium">Layanan Psikolog</span>
      </nav>

      {/* Hero Section */}
      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            <HeartPulse className="size-3.5" />
            Layanan Dua Arah · Kesehatan Mental
          </span>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Layanan Psikolog Inklusif BISARA.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            Konsultasi psikologi dua arah yang menghubungkan Teman Tuli dan Teman Dengar secara setara.
            Dilengkapi peragaan isyarat 3D BISINDO real-time, panggilan tatap muka berdefinisi tinggi, serta
            evaluasi mandiri yang aman dan privat.
          </p>
        </div>

        {/* Quick Highlights Card */}
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm lg:w-80 shrink-0">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">Keunggulan Layanan</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-2 text-ink">
              <CheckCircle2 className="size-4 text-brand shrink-0" />
              <span>Penerjemah Avatar 3D BISINDO</span>
            </li>
            <li className="flex items-center gap-2 text-ink">
              <CheckCircle2 className="size-4 text-brand shrink-0" />
              <span>Video P2P WebRTC Langsung</span>
            </li>
            <li className="flex items-center gap-2 text-ink">
              <CheckCircle2 className="size-4 text-brand shrink-0" />
              <span>Skrining Stres PSS-10 Terpadu</span>
            </li>
            <li className="flex items-center gap-2 text-ink">
              <CheckCircle2 className="size-4 text-brand shrink-0" />
              <span>Chat Ephemeral Tanpa Riwayat</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Mitra Resmi Section */}
      <section className="mt-16">
        <div className="flex items-baseline justify-between border-b border-line pb-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Mitra Resmi Tersedia</h2>
            <p className="mt-1 text-sm text-muted">
              Pilih mitra psikolog berlisensi yang telah terintegrasi dengan teknologi komunikasi BISARA.
            </p>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 border border-emerald-500/20">
            1 Mitra Aktif
          </span>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Active Partner: Ritz */}
          <article className="flex flex-col justify-between rounded-2xl border-2 border-brand/30 bg-surface p-7 shadow-md transition hover:border-brand">
            <div>
              <div className="flex items-center justify-between">
                <img
                  src={ritzLogo}
                  alt="Ritz Konsultan Psikologi"
                  className="h-14 w-auto object-contain"
                />
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  Layanan Aktif
                </span>
              </div>

              <h3 className="mt-5 text-2xl font-semibold text-ink">
                Ritz Konsultan Psikologi
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Lembaga konsultasi psikologi terpercaya yang berfokus pada pendampingan kesehatan mental,
                pengelolaan stres, serta konseling inklusif ramah disabilitas dan Teman Tuli.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-md bg-paper px-2.5 py-1 text-muted border border-line">
                  <Video className="size-3 text-brand" />
                  Video Tatap Muka
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-paper px-2.5 py-1 text-muted border border-line">
                  <MessageSquare className="size-3 text-brand" />
                  Chat Interaktif
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-paper px-2.5 py-1 text-muted border border-line">
                  <ShieldCheck className="size-3 text-brand" />
                  Privat & Terenkripsi
                </span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-line">
              {user === undefined ? (
                <p className="text-sm text-muted">Memeriksa sesi login…</p>
              ) : user ? (
                <Link
                  to="/two-way/layanan-psikolog/ritz"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 font-semibold text-white shadow-sm transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
                >
                  <span>Mulai Konsultasi Bersama Ritz</span>
                  <ArrowRight className="size-4" />
                </Link>
              ) : (
                <Link
                  to="/login"
                  state={{ returnTo: '/two-way/layanan-psikolog/ritz' }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 font-semibold text-white shadow-sm transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
                >
                  <span>Masuk untuk Mulai Konsultasi</span>
                  <ArrowRight className="size-4" />
                </Link>
              )}
            </div>
          </article>

          {/* Placeholder for Upcoming Partner */}
          <article className="flex flex-col justify-between rounded-2xl border border-line bg-surface/50 p-7 shadow-sm opacity-70">
            <div>
              <div className="flex items-center justify-between">
                <div className="size-14 rounded-xl bg-paper flex items-center justify-center border border-line">
                  <HeartPulse className="size-7 text-muted" />
                </div>
                <span className="rounded-full bg-paper px-3 py-1 text-xs font-medium text-muted border border-line">
                  Segera Hadir
                </span>
              </div>

              <h3 className="mt-5 text-2xl font-semibold text-ink">
                Mitra Psikologi Publik Lainnya
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Kami terus membuka kolaborasi dengan rumah sakit, klinik psikologi, dan praktisi kesehatan
                mental di seluruh Indonesia untuk memperluas akses layanan ramah Tuli.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-line">
              <span className="block text-center text-xs text-muted font-medium">
                Pendaftaran kemitraan baru akan segera dibuka
              </span>
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}
