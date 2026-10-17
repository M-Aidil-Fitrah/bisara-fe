import { useState } from 'react'
import { HeartPulse, Search, Shield, Trash2, UserCheck, UserPlus } from 'lucide-react'
import { useUsers, deleteUser } from '../../lib/auth'

interface UsersTabProps {
  onOpenAddPsy: () => void
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })

export default function UsersTab({ onOpenAddPsy }: UsersTabProps) {
  const { users, loading, error } = useUsers()
  const [q, setQ] = useState('')
  const [roleFilter, setRoleFilter] = useState('Semua')

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(q.toLowerCase()) ||
      u.email.toLowerCase().includes(q.toLowerCase())
    if (!matchSearch) return false

    if (roleFilter === 'Semua') return true
    if (roleFilter === 'Teman Tuli') return u.kind === 'tuli'
    if (roleFilter === 'Psikolog') return u.kind === 'psikolog'
    if (roleFilter === 'Admin') return u.role === 'admin'
    return true
  })

  const countTuli = users.filter((u) => u.kind === 'tuli').length
  const countPsy = users.filter((u) => u.kind === 'psikolog').length
  const countAdmin = users.filter((u) => u.role === 'admin').length

  const handleDelete = async (id: string, email: string, name: string) => {
    if (window.confirm(`Yakin ingin menghapus akun ${name} (${email})?`)) {
      try {
        await deleteUser(id)
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Pengguna gagal dihapus')
      }
    }
  }

  return (
    <>
      <div data-dash className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-normal tracking-tight">Manajemen Pengguna</h1>
          <p className="mt-2 text-muted">
            Daftar akun Teman Tuli, Psikolog, dan Administrator terdaftar di sistem.
          </p>
        </div>
        <button
          onClick={onOpenAddPsy}
          className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-strong"
        >
          <UserPlus className="size-4" /> Tambah Psikolog Baru
        </button>
      </div>

      {/* Metrics */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {([
          ['Total Pengguna', String(users.length), UserCheck, 'text-ink'],
          ['Teman Tuli', String(countTuli), HeartPulse, 'text-brand'],
          ['Psikolog', String(countPsy), UserPlus, 'text-brand-strong'],
          ['Admin', String(countAdmin), Shield, 'text-ink'],
        ] as const).map(([title, count, Icon, color]) => (
          <div key={title} data-dash className="rounded-xl bg-surface p-6 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted">{title}</p>
              <p className="mt-2 text-4xl font-light">{count}</p>
            </div>
            <div className="rounded-xl bg-paper p-3">
              <Icon className={`size-6 ${color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div data-dash className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama atau email pengguna..."
            aria-label="Cari pengguna"
            className="h-11 w-full rounded-lg bg-surface pl-10 pr-4 outline-none placeholder:text-muted/70 focus:ring-2 focus:ring-brand"
          />
          <Search className="absolute left-3.5 top-3.5 size-4 text-muted" />
        </div>
        <div className="flex overflow-x-auto rounded-lg bg-surface p-1 text-sm">
          {['Semua', 'Teman Tuli', 'Psikolog', 'Admin'].map((o) => (
            <button
              key={o}
              onClick={() => setRoleFilter(o)}
              className={`h-9 shrink-0 rounded-md px-3 transition ${
                roleFilter === o ? 'bg-brand text-white' : 'text-ink hover:bg-paper'
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      <div data-dash className="rounded-xl bg-surface p-2">
        {loading && <p className="p-10 text-center text-muted">Memuat pengguna dari server…</p>}
        {error && <p role="alert" className="p-10 text-center text-[#b8483e]">{error}</p>}
        {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs text-muted">
              <tr className="border-b border-line">
                <th className="px-4 py-3 font-normal">Nama Pengguna</th>
                <th className="px-4 py-3 font-normal">Peran</th>
                <th className="px-4 py-3 font-normal">Kategori</th>
                <th className="px-4 py-3 font-normal">Tanggal Terdaftar</th>
                <th className="px-4 py-3 text-right font-normal">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const canDelete = u.role !== 'admin'
                const initials = u.name
                  .replace(/^dr\. /, '')
                  .split(' ')
                  .slice(0, 2)
                  .map((w) => w[0] ?? '')
                  .join('')
                return (
                  <tr key={u.email} className="border-b border-line last:border-0 hover:bg-paper/60">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 place-items-center rounded-full bg-ink text-xs text-paper">
                          {initials}
                        </div>
                        <div>
                          <p className="font-medium text-ink">{u.name}</p>
                          <p className="text-xs text-muted">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-ink px-2.5 py-1 text-xs text-paper">
                          <Shield className="size-3" /> Administrator
                        </span>
                      ) : u.kind === 'psikolog' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-brand px-2.5 py-1 text-xs text-white">
                          <UserPlus className="size-3" /> Psikolog
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-tint px-2.5 py-1 text-xs font-medium text-brand">
                          <HeartPulse className="size-3" /> Teman Tuli
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-muted">{u.title ?? '-'}</td>
                    <td className="px-4 py-3.5 text-muted">
                      {u.createdAt ? fmtDate(u.createdAt) : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {canDelete ? (
                        <button
                          onClick={() => void handleDelete(u.id, u.email, u.name)}
                          title="Hapus Pengguna"
                          className="rounded p-1.5 text-muted hover:bg-red-50 hover:text-[#b8483e]"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-muted/60">Dilindungi</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="p-10 text-center text-muted">Tidak ada pengguna yang cocok dengan filter.</p>
          )}
        </div>
        )}
      </div>
    </>
  )
}
