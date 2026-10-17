import { useState, type FormEvent } from 'react'
import { UserCheck, X } from 'lucide-react'
import { addPsychologistAccount } from '../../lib/auth'

interface AddPsychologistModalProps {
  onClose: () => void
}

export default function AddPsychologistModal({ onClose }: AddPsychologistModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('bisara123')
  const [focus, setFocus] = useState('Stres & kecemasan')
  const [bisindo, setBisindo] = useState('Dasar')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !password) {
      return setError('Nama, email, dan kata sandi wajib diisi.')
    }

    const res = addPsychologistAccount({
      name: name.trim(),
      email: email.trim(),
      password,
      focus: focus.trim(),
      bisindo,
      photo: 'photo-1573495804664-b1c0849525af',
    })

    if ('error' in res) {
      setError(res.error)
    } else {
      setSuccess(true)
      setTimeout(() => {
        onClose()
      }, 1000)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-[70] grid place-items-center bg-ink/50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-surface p-6 shadow-2xl ring-1 ring-line sm:p-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
              Panel Admin
            </span>
            <h2 className="mt-1 text-2xl font-normal text-ink">Tambah Psikolog / Dokter</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="grid size-9 place-items-center rounded-lg hover:bg-paper"
          >
            <X className="size-5" />
          </button>
        </div>

        {success ? (
          <div className="py-12 text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#2c6e4f]/15 text-[#2c6e4f]">
              <UserCheck className="size-6" />
            </div>
            <p className="mt-4 text-xl font-normal text-ink">Psikolog Berhasil Didaftarkan!</p>
            <p className="mt-1 text-sm text-muted">
              Akun aktif dan otomatis muncul pada daftar psikolog klinik.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Nama Lengkap & Gelar</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="mis. dr. Aisyah Rahma, M.Psi"
                className="mt-1 h-11 w-full rounded-lg bg-paper px-3.5 text-sm outline-none focus:ring-2 focus:ring-brand"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium">Email Akun</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@bisara.id"
                  className="mt-1 h-11 w-full rounded-lg bg-paper px-3.5 text-sm outline-none focus:ring-2 focus:ring-brand"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Kata Sandi Default</span>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="bisara123"
                  className="mt-1 h-11 w-full rounded-lg bg-paper px-3.5 text-sm outline-none focus:ring-2 focus:ring-brand"
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium">Fokus Konseling</span>
                <input
                  type="text"
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="mis. Stres & kecemasan"
                  className="mt-1 h-11 w-full rounded-lg bg-paper px-3.5 text-sm outline-none focus:ring-2 focus:ring-brand"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium">Kemampuan BISINDO</span>
                <select
                  value={bisindo}
                  onChange={(e) => setBisindo(e.target.value)}
                  className="mt-1 h-11 w-full rounded-lg bg-paper px-3 text-sm outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="Dasar">Dasar</option>
                  <option value="Menengah">Menengah</option>
                  <option value="Mahir">Mahir</option>
                  <option value="Belum">Belum menguasai</option>
                </select>
              </label>
            </div>

            {error && <p className="text-sm text-[#b8483e]">{error}</p>}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm text-muted hover:text-ink"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-lg bg-brand px-5 py-2 text-sm font-medium text-white transition hover:bg-brand-strong"
              >
                Simpan Akun Psikolog
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
