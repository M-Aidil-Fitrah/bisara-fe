import { CheckCircle2 } from 'lucide-react'

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
}

export default function MessageBubble({ m, mine, big }: MessageBubbleProps) {
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
          <span>· Pesan Sementara</span>
        </div>
      </div>
    </div>
  )
}
