import { lazy, Suspense, useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import Peer, { type MediaConnection } from 'peerjs'
import { api, ApiError, WS_BASE_URL, type Meeting, type PssRoom } from '../api/client'
import { useAuth } from '../lib/auth'
import { frontendEnv } from '../config/env'

const Avatar = lazy(() => import('../components/Avatar'))
const answers = ['Tidak pernah', 'Hampir tidak pernah', 'Kadang-kadang', 'Cukup sering', 'Sangat sering']
const ChatEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('CHAT'), payload: z.object({ text: z.string(), sender: z.object({ name: z.string(), role: z.enum(['USER', 'ADMIN']) }) }) }),
  z.object({ type: z.literal('ERROR'), error: z.object({ message: z.string() }) }),
  z.object({ type: z.literal('MEETING_ENDED'), payload: z.object({ roomId: z.string() }) }),
  z.object({ type: z.literal('MEETING_JOINED'), payload: z.object({ roomId: z.string() }) }),
  z.object({ type: z.literal('PEER_READY'), payload: z.object({ peerId: z.string().uuid(), role: z.enum(['USER', 'ADMIN']) }) }),
])
type ChatLine = { id: string; text: string; name: string }

function VideoCall({ roomId }: { roomId: string }) {
  const localVideo = useRef<HTMLVideoElement>(null); const remoteVideo = useRef<HTMLVideoElement>(null)
  const [status, setStatus] = useState('Menyiapkan kamera…')
  useEffect(() => {
    let active = true; let stream: MediaStream | null = null; let call: MediaConnection | null = null; let peer: Peer | null = null; const socket = new WebSocket(WS_BASE_URL); let ownId = ''
    const attach = (connection: MediaConnection) => { call?.close(); call = connection; connection.on('stream', (remote) => { if (remoteVideo.current) remoteVideo.current.srcObject = remote; setStatus('Panggilan terhubung') }); connection.on('close', () => setStatus('Panggilan berakhir')); connection.on('error', () => setStatus('Panggilan gagal')) }
    void navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: { echoCancellation: true, noiseSuppression: true } }).then((next) => { if (!active) { next.getTracks().forEach((track) => track.stop()); return } stream = next; if (localVideo.current) localVideo.current.srcObject = next; peer = new Peer(crypto.randomUUID(), { host: frontendEnv.VITE_PEER_HOST, port: frontendEnv.VITE_PEER_PORT, path: frontendEnv.VITE_PEER_PATH, secure: frontendEnv.VITE_PEER_SECURE, config: { iceServers: [{ urls: frontendEnv.VITE_STUN_URL }] } }); peer.on('open', (id) => { ownId = id; if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'PEER_READY', payload: { roomId, peerId: id } })) }); peer.on('call', (incoming) => { incoming.answer(next); attach(incoming) }); peer.on('error', () => setStatus('Signaling video tidak tersedia')) }).catch(() => setStatus('Izin kamera dan mikrofon diperlukan'))
    socket.onopen = () => socket.send(JSON.stringify({ type: 'JOIN_MEETING', payload: { roomId } }))
    socket.onmessage = (event) => { const parsed = ChatEventSchema.safeParse(JSON.parse(String(event.data))); if (!parsed.success || parsed.data.type !== 'PEER_READY' || !peer || !stream || !ownId || parsed.data.payload.peerId === ownId) return; if (ownId < parsed.data.payload.peerId) { const outgoing = peer.call(parsed.data.payload.peerId, stream); if (outgoing) attach(outgoing) } }
    return () => { active = false; socket.close(); call?.close(); peer?.destroy(); stream?.getTracks().forEach((track) => track.stop()) }
  }, [roomId])
  return <section className="rounded-2xl border border-line bg-surface p-5"><div className="flex justify-between"><h2 className="font-semibold">Panggilan video</h2><span className="text-xs text-muted" role="status">{status}</span></div><div className="mt-3 grid gap-3 sm:grid-cols-2"><video ref={localVideo} autoPlay muted playsInline className="aspect-video w-full rounded-xl bg-ink object-cover" /><video ref={remoteVideo} autoPlay playsInline className="aspect-video w-full rounded-xl bg-ink object-cover" /></div></section>
}

function Chat({ roomId, onEnded }: { roomId: string; onEnded: () => void }) {
  const socket = useRef<WebSocket | null>(null)
  const [lines, setLines] = useState<ChatLine[]>([])
  const [text, setText] = useState('')
  const [status, setStatus] = useState('Menyambungkan chat…')
  useEffect(() => {
    const connection = new WebSocket(WS_BASE_URL)
    socket.current = connection
    connection.onopen = () => connection.send(JSON.stringify({ type: 'JOIN_MEETING', payload: { roomId } }))
    connection.onmessage = (event) => {
      const parsed = ChatEventSchema.safeParse(JSON.parse(String(event.data)))
      if (!parsed.success) { setStatus('Event chat tidak valid'); return }
      if (parsed.data.type === 'MEETING_JOINED') setStatus('Chat sementara aktif')
      if (parsed.data.type === 'CHAT') { const chat = parsed.data.payload; setLines((current) => [...current, { id: crypto.randomUUID(), text: chat.text, name: chat.sender.name }]) }
      if (parsed.data.type === 'ERROR') setStatus(parsed.data.error.message)
      if (parsed.data.type === 'MEETING_ENDED') onEnded()
    }
    connection.onerror = () => setStatus('Chat realtime tidak tersedia')
    return () => connection.close()
  }, [roomId, onEnded])
  const send = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const value = text.trim(); if (!value || socket.current?.readyState !== WebSocket.OPEN) return; socket.current.send(JSON.stringify({ type: 'CHAT', payload: { roomId, text: value } })); setText('') }
  return <><VideoCall roomId={roomId} /><section className="rounded-2xl border border-line bg-surface p-5"><div className="flex justify-between gap-3"><h2 className="font-semibold">Chat room</h2><span role="status" className="text-xs text-muted">{status}</span></div><div className="mt-3 h-36 overflow-y-auto rounded-xl bg-paper p-3">{lines.length ? lines.map((line) => <p key={line.id} className="mb-2 text-sm"><strong>{line.name}:</strong> {line.text}</p>) : <p className="text-sm text-muted">Pesan bersifat sementara dan tidak menjadi riwayat.</p>}</div><form onSubmit={send} className="mt-3 flex gap-2"><label className="sr-only" htmlFor="room-chat-message">Pesan chat</label><input id="room-chat-message" value={text} onChange={(event) => setText(event.target.value)} maxLength={2000} className="min-w-0 flex-1 rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-brand" placeholder="Tulis pesan…" /><button className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white hover:brightness-95">Kirim</button></form></section></>
}

export default function Meet() {
  const { partner } = useParams(); const user = useAuth(); const navigate = useNavigate()
  const [room, setRoom] = useState<Meeting | null>(null); const [pss, setPss] = useState<PssRoom | null>(null); const [error, setError] = useState<string | null>(null); const [busy, setBusy] = useState(false)
  useEffect(() => { if (!partner || !user) return; let alive = true; const refresh = async () => { try { const next = await api.meetings.match(partner); if (!alive) return; setRoom(next); if (next?.status === 'ACTIVE') setPss(await api.pss.get(next.id)) } catch (cause) { if (alive) setError(cause instanceof ApiError ? cause.message : 'Antrean tidak tersedia') } }; void refresh(); const interval = window.setInterval(() => void refresh(), 4_000); return () => { alive = false; window.clearInterval(interval) } }, [partner, user])
  if (user === undefined) return <p className="grid min-h-screen place-items-center" role="status">Memeriksa akun…</p>
  if (!user) { navigate('/login', { replace: true }); return null }
  const current = pss?.items.find((item) => !pss.answers.some((answer) => answer.itemId === item.id)); const asset = current?.phrase.animations[0]
  const submit = async (value: number) => { if (!room || !current) return; setBusy(true); try { setPss(await api.pss.answer(room.id, current.id, value)) } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Jawaban gagal disimpan') } finally { setBusy(false) } }
  const end = () => { if (room) void api.meetings.end(room.id).then(() => navigate('/ritz')) }
  return <main className="min-h-screen bg-paper px-4 py-8 sm:p-8"><div className="mx-auto max-w-6xl"><button onClick={() => navigate('/ritz')} className="text-sm text-brand underline">← Kembali ke Ritz</button>{error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}{!room && !error && <p className="mt-8 rounded-xl bg-surface p-6" role="status">Mencari pendamping Ritz…</p>}{room?.status === 'WAITING' && <section className="mt-8 rounded-2xl bg-ink p-8 text-paper"><p className="text-sm text-paper/60">Antrean privat aktif</p><h1 className="mt-3 text-3xl font-semibold">Menunggu pendamping Ritz.</h1><p className="mt-3 text-paper/70">Status diperbarui otomatis setiap beberapa detik.</p><button onClick={end} className="mt-6 rounded-lg border border-paper/30 px-4 py-3 text-sm hover:bg-paper hover:text-ink">Batalkan antrean</button></section>}{room?.status === 'ACTIVE' && <section className="mt-8 grid gap-5 lg:grid-cols-2"><div className="rounded-2xl bg-ink p-6 text-paper"><p className="text-sm text-paper/60">PSS-10 · pertanyaan {current?.itemNumber ?? 10} dari 10</p><h1 className="mt-4 text-2xl font-semibold leading-relaxed">{current?.questionText ?? 'Skrining selesai'}</h1>{asset ? <Suspense fallback={<p className="mt-5 text-sm text-paper/60">Memuat avatar…</p>}><Avatar signing modelUrl={asset.glbUrl} actionName={asset.animationName} className="mt-5 h-72" /></Suspense> : <p className="mt-5 text-sm text-paper/70">Tidak ada aset animasi; teks tetap tersedia.</p>}</div><div className="space-y-5"><div className="rounded-2xl border border-line bg-surface p-6">{current ? <><p className="font-semibold">Pilih jawaban Anda</p><div className="mt-5 grid gap-2">{answers.map((label, value) => <button key={label} disabled={busy} onClick={() => void submit(value)} className="rounded-lg border border-line px-4 py-3 text-left text-sm hover:border-brand hover:bg-paper disabled:opacity-50">{label}</button>)}</div></> : <><h2 className="text-2xl font-semibold">Skrining selesai</h2><p className="mt-3 text-muted">Skor PSS-10: <strong>{pss?.score ?? 'menghitung…'}</strong></p></>}<button onClick={end} className="mt-8 text-sm text-[#b8483e] underline">Akhiri layanan</button></div><Chat roomId={room.id} onEnded={() => navigate('/ritz')} /></div></section>}</div></main>
}
