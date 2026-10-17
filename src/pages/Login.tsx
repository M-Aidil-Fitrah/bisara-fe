import { useState, type FormEvent } from 'react'
import { ArrowLeft } from 'lucide-react'
import logoFull from '../assets/logo-full.png'
import { Button, IMG } from '../components/ui'
import { login } from '../lib/auth'
import { usePageMotion } from '../lib/motion'

interface LoginProps {
  onGoRegister: () => void
  onGoHome: () => void
  onSuccess?: () => void
}

export default function Login({ onGoRegister, onGoHome, onSuccess }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  usePageMotion('login')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) return setError('Email dan kata sandi wajib diisi.')
    setBusy(true)
    setTimeout(() => {
      const user = login(email, password)
      if (!user) {
        setError('Email atau kata sandi tidak cocok.')
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
          src={IMG.hero}
          alt=""
          data-hero-bg
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />
        <div data-hero className="absolute inset-x-0 bottom-0 p-12">
          <p className="text-xs uppercase tracking-[0.14em] text-brand-soft">BISARA</p>
          <p className="mt-4 max-w-md text-5xl font-normal leading-[1.05] tracking-tight text-paper">
            Saling paham, sana sini.
          </p>
          <p className="mt-4 max-w-sm text-paper/70">
            Konsultasi psikolog dalam BISINDO, untuk Teman Tuli dan tenaga profesional.
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

        <div className="mx-auto my-auto w-full max-w-sm py-4">
          <h1 className="text-4xl font-semibold tracking-tight text-ink">Masuk</h1>
          <p className="mt-2 text-sm text-muted">Gunakan akun yang terdaftar untuk melanjutkan.</p>

          <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="mt-1.5 h-12 w-full border-b border-ink/30 bg-transparent text-base outline-none transition placeholder:text-muted/50 focus:border-brand"
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 h-12 w-full border-b border-ink/30 bg-transparent text-base outline-none transition placeholder:text-muted/50 focus:border-brand"
              />
            </label>

            {error && (
              <p role="alert" className="text-sm text-[#b8483e]">
                {error}
              </p>
            )}

            <Button type="submit" arrow disabled={busy} className="w-full !h-12 !rounded-lg mt-2">
              {busy ? 'Memeriksa…' : 'Masuk'}
            </Button>
          </form>

          <div className="mt-8 border-t border-line pt-5 text-center text-sm">
            <span className="text-muted">Belum memiliki akun? </span>
            <button
              onClick={onGoRegister}
              className="font-medium text-brand hover:underline"
            >
              Daftar sekarang
            </button>
          </div>
        </div>

        <div className="text-center sm:text-left">
          <p className="text-xs text-muted">
            Data sesi diproses sesuai UU Pelindungan Data Pribadi & Rekam Medis.
          </p>
        </div>
      </div>
    </div>
  )
}
