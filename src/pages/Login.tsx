import { useState, type FormEvent } from 'react'
import logoFull from '../assets/logo-full.png'
import { Button, IMG } from '../components/ui'
import { DEMO, login } from '../lib/auth'
import { usePageMotion } from '../lib/motion'

export default function Login() {
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
      if (!login(email, password)) {
        setError('Email atau kata sandi tidak cocok.')
        setBusy(false)
      }
    }, 500)
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <img src={IMG.hero} alt="" data-hero-bg className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/20" />
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

      <div className="flex flex-col px-6 py-8 sm:px-12">
        <div className="h-10 w-[110px] overflow-hidden">
          <img src={logoFull} alt="Bisara" className="size-full scale-[1.9] object-contain" />
        </div>

        <div data-hero className="mx-auto my-auto w-full max-w-sm py-12">
          <h1 className="text-4xl font-normal tracking-tight">Masuk</h1>
          <p className="mt-2 text-muted">Gunakan akun yang terdaftar di klinik Anda.</p>

          <form onSubmit={submit} className="mt-10 space-y-6" noValidate>
            <label className="block">
              <span className="text-sm">Email</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="mt-2 h-12 w-full border-b border-ink/40 bg-transparent text-lg outline-none transition placeholder:text-muted/50 focus:border-brand"
              />
            </label>
            <label className="block">
              <span className="flex items-center justify-between text-sm">
                Kata sandi
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="text-brand hover:text-ink"
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
                className="mt-2 h-12 w-full border-b border-ink/40 bg-transparent text-lg outline-none transition placeholder:text-muted/50 focus:border-brand"
              />
            </label>
            {error && (
              <p role="alert" className="text-sm text-[#b8483e]">
                {error}
              </p>
            )}
            <Button type="submit" arrow disabled={busy} className="w-full !h-12">
              {busy ? 'Memeriksa…' : 'Masuk'}
            </Button>
          </form>

          <div className="mt-12 border-t border-line pt-6">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Akun demo</p>
            <ul className="mt-3 divide-y divide-line">
              {DEMO.map((d) => (
                <li key={d.email}>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(d.email)
                      setPassword(d.password)
                      setError('')
                    }}
                    className="flex w-full items-center justify-between py-3 text-left text-sm hover:text-brand"
                  >
                    <span>{d.title}</span>
                    <span className="text-muted">{d.email}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-xs text-muted">Data sesi diproses sesuai UU Pelindungan Data Pribadi.</p>
      </div>
    </div>
  )
}
