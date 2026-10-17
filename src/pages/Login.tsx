import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import logoFull from '../assets/logo-full.png'
import AuthHero from '../components/auth/AuthHero'
import { Button } from '../components/ui'
import { IMG } from '../lib/images'
import { login } from '../lib/auth'
import { usePageMotion } from '../lib/motion'

interface LoginProps {
  onGoRegister?: () => void
  onGoHome?: () => void
  onSuccess?: () => void
}

export default function Login({ onGoRegister, onGoHome, onSuccess }: LoginProps) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  usePageMotion('login')

  const handleGoRegister = () => {
    if (onGoRegister) onGoRegister()
    else navigate('/register')
  }

  const handleGoHome = () => {
    if (onGoHome) onGoHome()
    else navigate('/')
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) return setError('Email dan kata sandi wajib diisi.')
    setBusy(true)
    try {
      const user = await login(email, password)
      if (!user) {
        setError('Email atau kata sandi tidak cocok.')
        setBusy(false)
      } else {
        setBusy(false)
        if (onSuccess) {
          onSuccess()
        } else {
          navigate('/ritz')
        }
      }
    } catch {
      setError('Terjadi kendala koneksi ke server. Silakan coba sesaat lagi.')
      setBusy(false)
    }
  }

  return (
    <div className="grid h-screen max-h-screen w-full overflow-hidden lg:grid-cols-2">
      {/* Visual branding half */}
      <AuthHero
        imageSrc={IMG.hero}
        eyebrow="BISARA"
        title="Saling paham, sana sini."
        desc="Masuk untuk menggunakan layanan publik BISARA atau melanjutkan layanan bersama mitra Ritz."
      />

      {/* Form half */}
      <div className="flex h-full flex-col justify-between overflow-y-auto px-6 py-6 sm:px-12 sm:py-8">
        <div className="flex items-center justify-between">
          <button
            onClick={handleGoHome}
            aria-label="Kembali ke Beranda"
            className="h-9 w-[100px] overflow-hidden"
          >
            <img src={logoFull} alt="Bisara" className="size-full scale-[1.9] object-contain" />
          </button>
          <button
            onClick={handleGoHome}
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
              onClick={handleGoRegister}
              className="font-medium text-brand hover:underline"
            >
              Daftar sekarang
            </button>
          </div>
        </div>

        <div className="text-center sm:text-left">
          <p className="text-xs text-muted">
            Data sesi diproses sesuai kebijakan privasi BISARA.
          </p>
        </div>
      </div>
    </div>
  )
}
