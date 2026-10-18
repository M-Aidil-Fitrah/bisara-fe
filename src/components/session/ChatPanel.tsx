import { MessageSquare, Mic, MicOff, Send } from 'lucide-react'
import type { FormEvent, RefObject } from 'react'
import MessageBubble, { type ChatMessage } from './MessageBubble'

interface ChatPanelProps {
  messages: ChatMessage[]
  input: string
  status: string
  big: boolean
  mineRole: 'USER' | 'ADMIN'
  scrollRef: RefObject<HTMLDivElement | null>
  onInputChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  listening?: boolean
  speechSupported?: boolean
  speechError?: string | null
  onToggleSpeech?: (() => void) | undefined
  onSpeakMessage?: ((text: string) => void) | undefined
  className?: string
}

export default function ChatPanel({ messages, input, status, big, mineRole, scrollRef, onInputChange, onSubmit, listening = false, speechSupported = false, speechError, onToggleSpeech, onSpeakMessage, className = '' }: ChatPanelProps) {
  return <div className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-sm ${className}`}>
    <div className="flex items-center justify-between border-b border-line bg-paper/50 px-4 py-2.5"><div className="flex items-center gap-2"><MessageSquare className="size-4 text-brand" /><span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">Percakapan</span></div><span role="status" className="truncate font-mono text-[10px] text-muted">{status}</span></div>
    <div ref={scrollRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">{messages.length === 0 ? <div className="grid h-full place-items-center text-center"><p className="text-xs text-muted">Ketik pesan atau gunakan suara. Pesan tidak disimpan.</p></div> : messages.map((message) => <MessageBubble key={message.id} m={message} mine={message.role === mineRole} big={big} onSpeak={mineRole === 'ADMIN' && message.role === 'USER' && onSpeakMessage ? () => onSpeakMessage(message.text) : undefined} />)}</div>
    {speechError && <p className="px-3 py-1 text-xs text-red-700" role="alert">{speechError}</p>}
    <form onSubmit={onSubmit} className="flex gap-2 border-t border-line bg-paper/50 p-2"><label className="sr-only" htmlFor="room-chat-message">Pesan chat</label>{onToggleSpeech && <button type="button" onClick={onToggleSpeech} disabled={!speechSupported} aria-label={listening ? 'Hentikan rekam suara' : 'Rekam suara'} className={`grid size-9 shrink-0 place-items-center rounded-lg border transition disabled:opacity-40 ${listening ? 'border-red-500 bg-red-50 text-red-700' : 'border-line bg-surface text-brand hover:border-brand'}`}>{listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}</button>}<input id="room-chat-message" value={input} onChange={(event) => onInputChange(event.target.value)} maxLength={2000} placeholder={listening ? 'Mendengarkan… hasil dapat dikoreksi' : 'Tulis pesan sementara…'} className="min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand" /><button type="submit" disabled={!input.trim()} className="flex h-9 items-center gap-1 rounded-lg bg-brand px-3 text-xs font-semibold text-white transition hover:brightness-95 disabled:opacity-50"><Send className="size-3.5" /><span className="hidden sm:inline">Kirim</span></button></form>
  </div>
}
