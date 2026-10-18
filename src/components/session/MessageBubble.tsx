import { CheckCircle2, Volume2 } from 'lucide-react'

export interface ChatMessage {
  id: string
  text: string
  name: string
  role: 'USER' | 'ADMIN'
  time?: string
}

export interface MessageBubbleProps {
  m: ChatMessage
  mine: boolean
  big?: boolean
  onSpeak?: (() => void) | undefined
}

export default function MessageBubble({ m, mine, big, onSpeak }: MessageBubbleProps) {
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
          mine
            ? 'bg-brand text-white rounded-br-sm'
            : 'bg-paper text-ink border border-line/70 rounded-bl-sm'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[11px] font-semibold tracking-wide ${mine ? 'text-white/85' : 'text-brand'}`}>
            {m.role === 'ADMIN' ? 'Pendamping Ritz' : 'Pengguna'}
          </span>
        </div>

        <p className={`${big ? 'text-base' : 'text-sm'} leading-relaxed break-words`}>
          <span className="font-semibold text-xs opacity-90">{m.name}: </span>
          <span>{m.text}</span>
        </p>

        <div className={`mt-1.5 flex items-center gap-1.5 text-[10px] ${mine ? 'text-white/70' : 'text-muted'}`}>
          <CheckCircle2 className={`size-3 ${mine ? 'text-emerald-300' : 'text-emerald-600'}`} />
          <span>{m.time || 'Terkirim'}</span>
          {onSpeak && <button type="button" onClick={onSpeak} className="ml-auto inline-flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-brand/10" aria-label="Bacakan pesan"><Volume2 className="size-3" /> Putar</button>}
          <span>· Pesan Sementara</span>
        </div>
      </div>
    </div>
  )
}
