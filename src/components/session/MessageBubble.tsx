import { CheckCircle2 } from 'lucide-react'
import type { Msg } from '../../types'
import { formatMsgTime } from '../../lib/time'

export interface MessageBubbleProps {
  m: Msg
  mine: boolean
  big?: boolean
}

export default function MessageBubble({ m, mine, big }: MessageBubbleProps) {
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-xl px-4 py-3 shadow-sm ${
          mine ? 'bg-brand text-white' : 'bg-paper text-ink border border-line/60'
        }`}
      >
        <p className={`${big ? 'text-lg' : 'text-[15px]'} leading-snug`}>{m.text}</p>
        <div
          className={`mt-1.5 flex items-center gap-1.5 text-[11px] ${
            mine ? 'text-white/75' : 'text-muted'
          }`}
        >
          <CheckCircle2 className={`size-3 ${mine ? 'text-emerald-300' : 'text-emerald-600'}`} />
          <span>{formatMsgTime(m.at)}</span>
          {m.from === 'tuli' && (
            <span>
              · {m.manual ? 'Pilihan terkonfirmasi' : `Isyarat terkonfirmasi (${Math.round((m.conf ?? 0) * 100)}%)`}
            </span>
          )}
          {m.from === 'psikolog' && (
            <span>
              · Terkonfirmasi {m.phraseMatched !== false ? '(Animasi Aktif)' : '(Teks Saja)'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

