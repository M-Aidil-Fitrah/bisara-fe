import { useState, type FormEvent } from 'react'
import { ArrowLeft } from 'lucide-react'
import logoFull from '../assets/logo-full.png'
import { Button, IMG } from '../components/ui'
import { register } from '../lib/auth'
import { usePageMotion } from '../lib/motion'
import type { Kind } from '../types'

interface RegisterProps {
  onGoLogin: () => void
  onGoHome: () => void
  onSuccess?: () => void
}

export default function Register({ onGoLogin, onGoHome, onSuccess }: RegisterProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [kind, setKind] = useState<Kind>('tuli')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  usePageMotion('register')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim() || !email.trim() || !password) {
      return setError('Semua kolom wajib diisi.')
    }
    if (password.length < 6) {
      return setError('Kata sandi minimal 6 karakter.')
    }

    setBusy(true)
    setTimeout(() => {
      const res = register({ name, email, password, kind })
      if ('error' in res) {
        setError(res.error)
        setBusy(false)
      } else {
        setBusy(false)
        if (onSuccess) onSuccess()
        else onGoHome()
      }
    }, 400)
  }

  return (
    <div className="grid h-screen max-h-screen w-full overflow-hidden lg:grid-cols-2">
      {/* Visual branding half */}
      <div className="relative hidden h-full overflow-hidden bg-ink lg:block">
        <img
          src={IMG.signing}
          alt=""
          data-hero-bg
          className="absolute inset-0 size-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/65 to-ink/25" />
        <div data-hero className="absolute inset-x-0 bottom-0 p-12">
          <p className="text-xs uppercase tracking-[0.14em] text-brand-soft">BISARA</p>
          <p className="mt-4 max-w-md text-5xl font-normal leading-[1.05] tracking-tight text-paper">
            Layanan Inklusif, Ruang Aman.
          </p>
          <p className="mt-4 max-w-sm text-paper/70">
            Daftarkan diri Anda untuk konsultasi skrining kesehatan mental berbasis bahasa isyarat BISINDO.
          </p>
        </div>
      </div>

      {/* Form half */}
      <div className="flex h-full flex-col justify-between overflow-y-auto px-6 py-6 sm:px-12 sm:py-8">
        <div className="flex items-center justify-between">
          <button
            onClick={onGoHome}
            aria-label="Kembali ke Beranda"
            className="h-9 w-[100px] overflow-hidden"
          >
            <img src={logoFull} alt="Bisara" className="size-full scale-[1.9] object-contain" />
          </button>
          <button
            onClick={onGoHome}
            className="flex items-center gap-1.5 text-xs text-muted transition hover:text-ink"
          >
            <ArrowLeft className="size-3.5" /> Beranda
          </button>
        </div>

        <div className="mx-auto my-auto w-full max-w-sm py-3">
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Buat Akun</h1>
          <p className="mt-1.5 text-sm text-muted">Lengkapi data untuk bergabung ke BISARA.</p>

          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">Peran Anda</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setKind('tuli')}
                  className={`h-10 rounded-lg text-xs font-medium transition ${
                    kind === 'tuli'
                      ? 'bg-brand text-white shadow-sm'
                      : 'bg-paper text-ink hover:bg-surface ring-1 ring-line'
                  }`}
                >
                  Teman Tuli
                </button>
                <button
                  type="button"
                  onClick={() => setKind('psikolog')}
                  className={`h-10 rounded-lg text-xs font-medium transition ${
                    kind === 'psikolog'
                      ? 'bg-brand text-white shadow-sm'
                      : 'bg-paper text-ink hover:bg-surface ring-1 ring-line'
                  }`}
                >
                  Psikolog
                </button>
              </div>
            </div>

            <label className="block">
              <span className="text-sm font-medium">Nama Lengkap</span>
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={kind === 'psikolog' ? 'dr. Nama Lengkap, M.Psi' : 'Nama Lengkap Anda'}
                className="mt-1 h-11 w-full border-b border-ink/30 bg-transparent text-sm outline-none transition placeholder:text-muted/50 focus:border-brand"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="mt-1 h-11 w-full border-b border-ink/30 bg-transparent text-sm outline-none transition placeholder:text-muted/50 focus:border-brand"
              />
            </label>

            <label className="block">
              <span className="flex items-center justify-between text-sm font-medium">
                Kata sandi
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="text-xs text-brand hover:text-ink"
                >
                  {show ? 'Sembunyikan' : 'Tampilkan'}
                </button>
              </span>
              <input
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="mt-1 h-11 w-full border-b border-ink/30 bg-transparent text-sm outline-none transition placeholder:text-muted/50 focus:border-brand"
              />
            </label>

            {error && (
              <p role="alert" className="text-sm text-[#b8483e]">
                {error}
              </p>
            )}

            <Button type="submit" arrow disabled={busy} className="w-full !h-11 !rounded-lg mt-3">
              {busy ? 'Mendaftarkan…' : 'Daftar Sekarang'}
            </Button>
          </form>

          <div className="mt-6 border-t border-line pt-4 text-center text-sm">
            <span className="text-muted">Sudah memiliki akun? </span>
            <button
              onClick={onGoLogin}
              className="font-medium text-brand hover:underline"
            >
              Masuk di sini
            </button>
          </div>
        </div>

        <div className="text-center sm:text-left">
          <p className="text-xs text-muted">
            Data pribadi dilindungi dan hanya digunakan untuk pendampingan kesehatan mental.
          </p>
        </div>
      </div>
    </div>
  )
}
