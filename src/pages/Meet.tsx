import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { Send, MessageSquare, AlertCircle } from 'lucide-react'
import { api, ApiError, WS_BASE_URL, type Meeting, type PssRoom } from '../api/client'
import { useAuth } from '../lib/auth'
import { useVideoCall } from '../lib/videoCall'
import { formatMsgTime } from '../lib/time'
import SessionHeader from '../components/session/SessionHeader'
import VideoCallStage from '../components/session/VideoCallStage'
import AvatarStage from '../components/session/AvatarStage'
import MessageBubble, { type ChatMessage } from '../components/session/MessageBubble'

const answers = ['Tidak pernah', 'Hampir tidak pernah', 'Kadang-kadang', 'Cukup sering', 'Sangat sering']

const ChatEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('CHAT'), payload: z.object({ text: z.string(), sender: z.object({ name: z.string(), role: z.enum(['USER', 'ADMIN']) }) }) }),
  z.object({ type: z.literal('ERROR'), error: z.object({ message: z.string() }) }),
  z.object({ type: z.literal('MEETING_ENDED'), payload: z.object({ roomId: z.string() }) }),
  z.object({ type: z.literal('MEETING_JOINED'), payload: z.object({ roomId: z.string(), memberCount: z.number().optional() }) }),
  z.object({ type: z.literal('MEMBER_JOINED'), payload: z.object({ name: z.string(), role: z.enum(['USER', 'ADMIN']), memberCount: z.number().optional() }) }),
  z.object({ type: z.literal('MEMBER_LEFT'), payload: z.object({ name: z.string(), role: z.enum(['USER', 'ADMIN']), memberCount: z.number().optional() }) }),
  z.object({ type: z.literal('PEER_READY'), payload: z.object({ peerId: z.string().uuid(), role: z.enum(['USER', 'ADMIN']) }) }),
  z.object({ type: z.literal('PEER_LEFT'), payload: z.object({ peerId: z.string().uuid() }).optional() }),
])

export default function Meet() {
  const { partner } = useParams()
  const user = useAuth()
  const navigate = useNavigate()

  const [room, setRoom] = useState<Meeting | null>(null)
  const [pss, setPss] = useState<PssRoom | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [partnerOnline, setPartnerOnline] = useState(false)

  // Avatar stage controls
  const [speed, setSpeed] = useState(1)
  const [big, setBig] = useState(false)
  const [signing, setSigning] = useState(false)

  // Realtime Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatStatus, setChatStatus] = useState('Menyambungkan chat…')
  const [socketJoined, setSocketJoined] = useState(false)
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  // Role
  const role: 'USER' | 'ADMIN' = user?.role === 'admin' ? 'ADMIN' : 'USER'

  // Video Call integration
  const videoCall = useVideoCall({
    roomId: room?.id ?? '',
    role,
    socket,
    socketJoined,
  })

  const videoCallRef = useRef(videoCall)
  useEffect(() => {
    videoCallRef.current = videoCall
  })

  // Poll matchmaking status until ACTIVE
  useEffect(() => {
    if (!partner || !user) return
    let alive = true
    let fetching = false

    const refresh = async () => {
      if (fetching) return
      fetching = true
      try {
        const next = await api.meetings.match(partner)
        if (!alive) return
        setRoom(next)
        if (next?.status === 'ACTIVE') {
          const pssData = await api.pss.get(next.id)
          if (alive) setPss(pssData)
        }
      } catch (cause) {
        if (alive) setError(cause instanceof ApiError ? cause.message : 'Antrean tidak tersedia')
      } finally {
        fetching = false
      }
    }

    void refresh()
    const interval = window.setInterval(() => void refresh(), 3_000)
    return () => {
      alive = false
      window.clearInterval(interval)
    }
  }, [partner, user])

  // Single WebSocket connection for active room
  useEffect(() => {
    if (room?.status !== 'ACTIVE') return

    const ws = new WebSocket(WS_BASE_URL)

    ws.onopen = () => {
      setSocket(ws)
      ws.send(JSON.stringify({ type: 'JOIN_MEETING', payload: { roomId: room.id } }))
    }

    ws.onmessage = (event) => {
      try {
        const parsed = ChatEventSchema.safeParse(JSON.parse(String(event.data)))
        if (!parsed.success) return

        const msg = parsed.data
        if (msg.type === 'MEETING_JOINED') {
          setSocketJoined(true)
          setChatStatus('Chat sementara aktif')
          if ((msg.payload.memberCount ?? 1) > 1) {
            setPartnerOnline(true)
          }
        } else if (msg.type === 'MEMBER_JOINED') {
          setPartnerOnline(true)
        } else if (msg.type === 'MEMBER_LEFT') {
          setPartnerOnline(false)
          videoCallRef.current.handleRemotePeerLeft()
        } else if (msg.type === 'PEER_READY') {
          setPartnerOnline(true)
          videoCallRef.current.handleRemotePeerReady(msg.payload.peerId)
        } else if (msg.type === 'PEER_LEFT') {
          videoCallRef.current.handleRemotePeerLeft()
        } else if (msg.type === 'CHAT') {
          const { text, sender } = msg.payload
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              text,
              name: sender.name,
              role: sender.role,
              time: formatMsgTime(Date.now()),
            },
          ])
        } else if (msg.type === 'ERROR') {
          setChatStatus(msg.error.message)
        } else if (msg.type === 'MEETING_ENDED') {
          navigate('/ritz')
        }
      } catch {
        // ignore parse error
      }
    }

    ws.onerror = () => {
      setChatStatus('Chat realtime tidak tersedia')
    }

    ws.onclose = () => {
      setSocketJoined(false)
      setPartnerOnline(false)
      setSocket(null)
    }

    return () => {
      ws.close()
      setSocket(null)
      setSocketJoined(false)
    }
  }, [room?.id, room?.status, navigate])

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages])

  // Current PSS Question & Asset
  const current = pss?.items.find((item) => !pss.answers.some((answer) => answer.itemId === item.id))
  const asset = current?.phrase.animations[0]
  const isDone = Boolean(pss && !current)
  const itemNumber = current ? current.itemNumber : 10
  const totalItems = pss?.items.length || 10

  // Trigger signing when new question loads
  useEffect(() => {
    if (!asset) {
      return undefined
    }
    const timer = window.setTimeout(() => setSigning(false), (asset.durationMs || 3000) / speed)
    return () => {
      window.clearTimeout(timer)
    }
  }, [asset, speed])

  const submitAnswer = async (value: number) => {
    if (!room || !current) return
    setBusy(true)
    try {
      const nextPss = await api.pss.answer(room.id, current.id, value)
      setPss(nextPss)
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Jawaban gagal disimpan')
    } finally {
      setBusy(false)
    }
  }

  const sendChat = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const value = chatInput.trim()
    if (!value || !socket || socket.readyState !== WebSocket.OPEN) return
    socket.send(JSON.stringify({
      type: 'CHAT',
      payload: { roomId: room?.id, text: value },
    }))
    setChatInput('')
  }

  const endSession = async () => {
    if (room) {
      try {
        await api.meetings.end(room.id)
      } catch {
        // ignore
      }
    }
    navigate('/ritz')
  }

  if (user === undefined) {
    return <p className="grid min-h-screen place-items-center text-muted" role="status">Memeriksa akun…</p>
  }
  if (!user) {
    navigate('/login', { replace: true })
    return null
  }

  const partnerDisplayName = room?.partner.name || 'Ritz Konsultan Psikologi'
  const partnerPeerName = role === 'ADMIN'
    ? (room?.user.name || 'Pengguna Layanan')
    : (room?.admin?.name || 'Pendamping Ritz')

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      {/* 1. Header with Partner & Status Bar */}
      <SessionHeader
        partnerName={partnerDisplayName}
        partnerOnline={partnerOnline}
        itemNumber={itemNumber}
        totalItems={totalItems}
        isDone={isDone}
        onLeave={endSession}
      />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        {error && (
          <div role="alert" className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            <AlertCircle className="size-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 2. Waiting Room State */}
        {!room && !error && (
          <div className="my-16 rounded-2xl bg-surface p-12 text-center border border-line" role="status">
            <p className="text-muted text-lg">Mencari pendamping Ritz…</p>
          </div>
        )}

        {room?.status === 'WAITING' && (
          <section className="my-12 mx-auto max-w-2xl rounded-2xl bg-ink p-8 text-paper shadow-2xl border border-white/10 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300 border border-amber-500/20">
              <span className="size-2 rounded-full bg-amber-400 animate-ping" />
              Antrean Privat Aktif
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">Menunggu pendamping Ritz.</h1>
            <p className="mt-3 text-sm text-paper/70 leading-relaxed">
              Anda berada di urutan antrean teratas. Pendamping Ritz akan otomatis dipasangkan ke dalam ruangan ini. Status diperbarui otomatis.
            </p>
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={endSession}
                className="rounded-xl border border-paper/30 px-5 py-2.5 text-sm font-medium hover:bg-paper hover:text-ink transition"
              >
                Batalkan antrean
              </button>
            </div>
          </section>
        )}

        {/* 3. Active Consultation Grid (Exact Restored 2-Column Layout) */}
        {room?.status === 'ACTIVE' && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column: Video Call Stage + Ephemeral Chat */}
            <div className="flex flex-col gap-6">
              <VideoCallStage
                partnerName={partnerPeerName}
                callStatus={videoCall.callStatus}
                isCameraOn={videoCall.isCameraOn}
                isMicOn={videoCall.isMicOn}
                errorMsg={videoCall.errorMsg}
                localVideoRef={videoCall.localVideoRef}
                remoteVideoRef={videoCall.remoteVideoRef}
                toggleCamera={videoCall.toggleCamera}
                toggleMic={videoCall.toggleMic}
                callPartner={videoCall.callPartner}
              />

              {/* Chat Card */}
              <div className="flex flex-col rounded-2xl border border-line bg-surface shadow-sm overflow-hidden min-h-[340px]">
                <div className="flex items-center justify-between border-b border-line px-5 py-3.5 bg-paper/50">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="size-4 text-brand" />
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
                      Percakapan
                    </span>
                  </div>
                  <span role="status" className="text-xs text-muted font-mono">
                    {chatStatus}
                  </span>
                </div>

                {/* Message list */}
                <div ref={chatScrollRef} className="flex-1 max-h-[300px] overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-10 text-center">
                      <p className="text-sm text-muted">
                        Pesan bersifat sementara dan tidak disimpan sebagai riwayat.
                      </p>
                    </div>
                  ) : (
                    messages.map((m) => (
                      <MessageBubble
                        key={m.id}
                        m={m}
                        mine={m.role === role}
                        big={big}
                      />
                    ))
                  )}
                </div>

                {/* Chat Form */}
                <form onSubmit={sendChat} className="border-t border-line p-3 bg-paper/50 flex gap-2">
                  <label className="sr-only" htmlFor="room-chat-message">Pesan chat</label>
                  <input
                    id="room-chat-message"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    maxLength={2000}
                    placeholder="Tulis pesan sementara…"
                    className="flex-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-95 disabled:opacity-50 transition"
                  >
                    <Send className="size-4" />
                    <span>Kirim</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: 3D Avatar Stage + Question & Answer Card */}
            <div className="flex flex-col gap-6">
              <AvatarStage
                signing={signing}
                caption={
                  isDone
                    ? 'Skrining selesai. Terima kasih atas partisipasi Anda.'
                    : current
                      ? current.questionText
                      : 'Memuat butir pertanyaan…'
                }
                speed={speed}
                setSpeed={setSpeed}
                big={big}
                setBig={setBig}
                onReplay={asset ? () => setSigning(true) : undefined}
                modelUrl={asset?.glbUrl}
                actionName={asset?.animationName}
              />

              {/* Response Card */}
              <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
                {!isDone && current ? (
                  <>
                    <div className="border-b border-line pb-4 mb-4">
                      <p className="text-xs uppercase tracking-wider font-semibold text-brand">
                        PSS-10 · Pertanyaan {current.itemNumber} dari {totalItems}
                      </p>
                      <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">
                        Pilih jawaban Anda
                      </h2>
                      <p className="mt-1 text-xs text-muted">
                        Jawaban Anda tersinkronisasi langsung ke pasangan room dan dihapus setelah sesi berakhir.
                      </p>
                    </div>

                    <div className="grid gap-2.5">
                      {answers.map((label, index) => (
                        <button
                          key={label}
                          type="button"
                          disabled={busy}
                          onClick={() => void submitAnswer(index)}
                          className="group flex items-center gap-3.5 rounded-xl border border-line bg-paper px-4 py-3 text-left transition hover:border-brand hover:bg-brand hover:text-white disabled:opacity-50 shadow-sm"
                        >
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-xs font-bold text-brand group-hover:bg-white/20 group-hover:text-white transition">
                            {index}
                          </span>
                          <span className={`${big ? 'text-base font-semibold' : 'text-sm font-medium'} leading-snug`}>
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <span className="inline-flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 mb-3">
                      ✓
                    </span>
                    <h2 className="text-2xl font-semibold tracking-tight text-ink">
                      Skrining selesai
                    </h2>
                    <p className="mt-2 text-sm text-muted">
                      Seluruh 10 pertanyaan PSS-10 telah dijawab.
                    </p>
                    <div className="mt-5 inline-flex items-baseline gap-2 rounded-2xl bg-paper px-6 py-4 border border-line">
                      <span className="text-xs uppercase tracking-wider text-muted font-medium">Skor PSS-10:</span>
                      <span className="text-4xl font-light text-brand tracking-tight">
                        {pss?.score ?? '…'}
                      </span>
                      <span className="text-xs text-muted">/ 40</span>
                    </div>
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={endSession}
                        className="rounded-xl bg-[#b8483e] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#a03d34] transition shadow-md"
                      >
                        Akhiri layanan
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
