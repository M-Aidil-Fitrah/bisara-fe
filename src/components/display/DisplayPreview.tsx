import type { Phrase } from '../../api/client'
import SignSequencePlayer from './SignSequencePlayer'

export default function DisplayPreview({ text, phrases }: { text: string; phrases: Phrase[] }) {
  return <div className="rounded-2xl bg-ink p-4 text-paper">
    <div className="mb-3 flex items-center justify-between gap-3 px-1"><p className="text-sm text-paper/60">Preview layar</p><p className="text-xs text-paper/40">Kata → ejaan huruf</p></div>
    <SignSequencePlayer text={text} phrases={phrases} className="h-[430px]" />
    <p className="mt-4 line-clamp-2 text-center text-xl font-semibold">{text || 'Pesan Anda akan muncul di sini.'}</p>
  </div>
}
