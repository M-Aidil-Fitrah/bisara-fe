import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthPageLayout from '../components/auth/AuthPageLayout'
import { Button } from '../components/ui'
import { IMG } from '../lib/images'
import { register } from '../lib/auth'
import { usePageMotion } from '../lib/motion'

interface RegisterProps {
  onGoLogin?: () => void
  onGoHome?: () => void
  onSuccess?: () => void
}

export default function Register({ onGoLogin, onGoHome, onSuccess }: RegisterProps) {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  usePageMotion('register')

  const handleGoLogin = () => {
    if (onGoLogin) onGoLogin()
    else navigate('/login')
  }

  const handleGoHome = () => {
    if (onGoHome) onGoHome()
    else navigate('/')
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim() || !email.trim() || !password) {
      return setError('Semua kolom wajib diisi.')
    }
    if (password.length < 12) {
      return setError('Kata sandi minimal 12 karakter.')
    }

    setBusy(true)
    try {
      const res = await register({ name, email, password })
      if ('error' in res) {
        setError(res.error)
        setBusy(false)
      } else {
        setBusy(false)
        if (onSuccess) onSuccess()
        else navigate('/two-way')
      }
    } catch {
      setError('Terjadi kendala koneksi ke server. Silakan coba sesaat lagi.')
      setBusy(false)
    }
  }

  return (
    <AuthPageLayout hero={{ imageSrc: IMG.signing, imageAlt: 'Komunikasi BISINDO', imageOpacityClass: 'opacity-60', eyebrow: 'BISARA', title: 'Layanan Inklusif, Ruang Aman.', desc: 'Daftarkan akun untuk menggunakan layanan publik BISARA sesuai kebutuhan Anda.' }} onBack={handleGoHome} footer={<p className="text-xs text-muted">Akun admin dikelola melalui deployment untuk mendampingi layanan yang sesuai.</p>}>

        <div className="mx-auto my-auto w-full max-w-sm py-4">
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Daftar Akun</h1>
          <p className="mt-2 text-sm text-muted">
            Buat akun untuk melanjutkan layanan publik BISARA.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            <label className="block">
              <span className="text-sm font-medium">Nama Lengkap</span>
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Lengkap Anda"
                className="mt-1 h-12 w-full border-b border-ink/30 bg-transparent text-base outline-none transition placeholder:text-muted/50 focus:border-brand"
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
                className="mt-1 h-12 w-full border-b border-ink/30 bg-transparent text-base outline-none transition placeholder:text-muted/50 focus:border-brand"
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
                placeholder="Minimal 12 karakter"
                className="mt-1 h-12 w-full border-b border-ink/30 bg-transparent text-base outline-none transition placeholder:text-muted/50 focus:border-brand"
              />
            </label>

            {error && (
              <p role="alert" className="text-sm text-[#b8483e]">
                {error}
              </p>
            )}

            <Button type="submit" arrow disabled={busy} className="w-full !h-12 !rounded-lg mt-3">
              {busy ? 'Mendaftarkan…' : 'Daftar Sekarang'}
            </Button>
          </form>

          <div className="mt-6 border-t border-line pt-4 text-center text-sm">
            <span className="text-muted">Sudah memiliki akun? </span>
            <button
              onClick={handleGoLogin}
              className="font-medium text-brand hover:underline"
            >
              Masuk di sini
            </button>
          </div>
        </div>

    </AuthPageLayout>
  )
}
