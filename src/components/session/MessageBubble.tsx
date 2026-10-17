import type { Msg } from '../../types'

export const formatMsgTime = (t: number) =>
  new Date(t).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

export interface MessageBubbleProps {
  m: Msg
  mine: boolean
  big?: boolean
}

export default function MessageBubble({ m, mine, big }: MessageBubbleProps) {
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-xl px-4 py-3 ${mine ? 'bg-brand text-white' : 'bg-paper'}`}>
        <p className={`${big ? 'text-lg' : 'text-[15px]'} leading-snug`}>{m.text}</p>
        <p className={`mt-1 text-[11px] ${mine ? 'text-white/60' : 'text-muted'}`}>
          {formatMsgTime(m.at)}
          {m.from === 'tuli' && (m.manual ? ' · manual' : ` · isyarat ${Math.round((m.conf ?? 0) * 100)}%`)}
        </p>
      </div>
    </div>
  )
}
