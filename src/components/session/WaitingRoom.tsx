type WaitingRoomProps = {
  partnerName: string
  onCancel: () => void
}

export default function WaitingRoom({ partnerName, onCancel }: WaitingRoomProps) {
  return (
    <section className="mx-auto my-12 max-w-2xl rounded-2xl border border-white/10 bg-ink p-8 text-center text-paper shadow-2xl">
      <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
        <span className="size-2 animate-ping rounded-full bg-amber-400" />
        Antrean Privat Aktif
      </span>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Menunggu pendamping {partnerName}.</h1>
      <p className="mt-3 text-sm leading-relaxed text-paper/70">
        Anda berada di urutan antrean teratas. Pendamping {partnerName} akan otomatis dipasangkan ke dalam ruangan ini. Status diperbarui otomatis.
      </p>
      <div className="mt-8 flex justify-center">
        <button type="button" onClick={onCancel} className="rounded-xl border border-paper/30 px-5 py-2.5 text-sm font-medium transition hover:bg-paper hover:text-ink">
          Batalkan antrean
        </button>
      </div>
    </section>
  )
}
