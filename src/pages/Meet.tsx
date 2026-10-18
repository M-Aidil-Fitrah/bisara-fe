import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { AlertCircle } from 'lucide-react'
import { api, ApiError, WS_BASE_URL, type Meeting, type PssRoom } from '../api/client'
import { useAuth } from '../lib/auth'
import { useVideoCall } from '../lib/videoCall'
import { useAiAssistance } from '../hooks/useAiAssistance'
import { formatMsgTime } from '../lib/time'
import SessionHeader from '../components/session/SessionHeader'
import VideoCallStage from '../components/session/VideoCallStage'
import AvatarStage from '../components/session/AvatarStage'
import type { ChatMessage } from '../components/session/MessageBubble'
import ChatPanel from '../components/session/ChatPanel'
import PssResponseCard from '../components/session/PssResponseCard'
import WaitingRoom from '../components/session/WaitingRoom'

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

  const role: 'USER' | 'ADMIN' = user?.role === 'admin' ? 'ADMIN' : 'USER'

  // Video Call integration
  const videoCall = useVideoCall({
    roomId: room?.id ?? '',
    socket,
    socketJoined,
  })
  const aiAssist = useAiAssistance(room?.id ?? '', videoCall.localStream)

  const videoCallRef = useRef(videoCall)
  useEffect(() => {
    videoCallRef.current = videoCall
  })

  // Poll only while matching. An active room has its own WebSocket lifecycle.
  useEffect(() => {
    if (!partner || !user || room?.status === 'ACTIVE') return
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
        setError(null)
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
  }, [partner, user, room?.status])

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

  const sendAiMessage = () => {
    const value = aiAssist.text.trim()
    if (!value || !socket || socket.readyState !== WebSocket.OPEN || !room) return
    socket.send(JSON.stringify({ type: 'CHAT', payload: { roomId: room.id, text: value, source: 'AI' } }))
    aiAssist.reset()
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

      <main className="mx-auto flex-1 w-full max-w-7xl px-6 py-6">
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

        {room?.status === 'WAITING' && <WaitingRoom partnerName={room.partner.name} onCancel={endSession} />}

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

              <ChatPanel
                messages={messages}
                input={chatInput}
                status={chatStatus}
                big={big}
                mineRole={role}
                scrollRef={chatScrollRef}
                onInputChange={setChatInput}
                onSubmit={sendChat}
              />

              <section className="rounded-2xl border border-line bg-surface p-4" aria-label="Bantuan komunikasi AI">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">Terjemahkan isyarat</h2>
                    <p className="text-xs text-muted">Menggunakan kamera panggilan yang sama, tanpa merekam audio.</p>
                  </div>
                  {aiAssist.status === 'idle' || aiAssist.status === 'error' ? (
                    <button type="button" onClick={aiAssist.start} className="rounded-lg bg-brand px-3 py-2 text-sm text-white">Mulai</button>
                  ) : (
                    <button type="button" onClick={aiAssist.reset} className="rounded-lg border border-line px-3 py-2 text-sm">Batal</button>
                  )}
                </div>
                {aiAssist.status === 'countdown' && <p className="mt-3 text-sm" role="status">Mulai dalam {aiAssist.seconds}…</p>}
                {aiAssist.status === 'recording' && <p className="mt-3 text-sm" role="status">Merekam isyarat selama 3 detik…</p>}
                {aiAssist.status === 'processing' && <p className="mt-3 text-sm" role="status">Memproses video secara aman…</p>}
                {aiAssist.error && <p className="mt-3 text-sm text-red-700" role="alert">{aiAssist.error}</p>}
                {aiAssist.status === 'reviewing' && (
                  <div className="mt-3 space-y-3">
                    <label className="block text-sm font-medium" htmlFor="ai-message">Tinjau dan koreksi hasil sebelum dikirim</label>
                    <input id="ai-message" value={aiAssist.text} onChange={(event) => aiAssist.setText(event.target.value)} maxLength={500} className="w-full rounded-lg border border-line bg-paper px-3 py-2" />
                    <p className="text-xs text-muted">Kepercayaan {Math.round((aiAssist.prediction?.confidence ?? 0) * 100)}% · video dihapus setelah inferensi.</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={sendAiMessage} className="rounded-lg bg-brand px-3 py-2 text-sm text-white">Kirim ke chat</button>
                      <button type="button" onClick={() => void aiAssist.speak()} className="rounded-lg border border-line px-3 py-2 text-sm">Bacakan</button>
                    </div>
                  </div>
                )}
              </section>
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

              <PssResponseCard
                current={current}
                isDone={isDone}
                totalItems={totalItems}
                busy={busy}
                big={big}
                score={pss?.score}
                onAnswer={(value) => void submitAnswer(value)}
                onEnd={endSession}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
