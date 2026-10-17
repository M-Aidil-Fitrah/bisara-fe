import { useCallback, useEffect, useRef, useState } from 'react'
import Peer, { type MediaConnection } from 'peerjs'
import { WS_BASE_URL } from '../api/client'

export type CallStatus = 'initializing' | 'waiting' | 'calling' | 'connected' | 'error'

interface UseVideoCallOptions {
  sessionId: string
  role: 'tuli' | 'psikolog'
  onPartnerConnected?: () => void
  onPartnerDisconnected?: () => void
}

export function useVideoCall({
  sessionId,
  role,
  onPartnerConnected,
  onPartnerDisconnected,
}: UseVideoCallOptions) {
  const [callStatus, setCallStatus] = useState<CallStatus>('initializing')
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)
  const peerRef = useRef<Peer | null>(null)
  const currentCallRef = useRef<MediaConnection | null>(null)
  const targetPeerRef = useRef<string | null>(null)
  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null)

  const attachStreams = useCallback(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStreamRef.current
  }, [])

  const bindCall = useCallback((call: MediaConnection) => {
    currentCallRef.current?.close()
    currentCallRef.current = call
    call.on('stream', (remoteStream) => {
      remoteStreamRef.current = remoteStream
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream
        void remoteVideoRef.current.play()
      }
      setCallStatus('connected')
      onPartnerConnected?.()
    })
    call.on('close', () => {
      currentCallRef.current = null
      remoteStreamRef.current = null
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
      setCallStatus('waiting')
      onPartnerDisconnected?.()
    })
    call.on('error', () => setCallStatus('error'))
  }, [onPartnerConnected, onPartnerDisconnected])

  const callPartner = useCallback(() => {
    const peer = peerRef.current
    const target = targetPeerRef.current
    const stream = localStreamRef.current
    if (!peer || peer.destroyed || !target || !stream || currentCallRef.current?.open) return
    setCallStatus('calling')
    const call = peer.call(target, stream)
    if (call) bindCall(call)
  }, [bindCall])

  useEffect(() => {
    let mounted = true
    const peerHost = import.meta.env.VITE_PEER_HOST
    const stunUrl = import.meta.env.VITE_STUN_URL
    if (!peerHost || !stunUrl) {
      queueMicrotask(() => {
        if (!mounted) return
        setCallStatus('error')
        setErrorMsg('Video dinonaktifkan: PeerServer dan STUN belum dikonfigurasi.')
      })
      return () => { mounted = false }
    }

    const coordination = new WebSocket(WS_BASE_URL)
    let joined = false
    let ownPeerId: string | null = null
    const announcePeer = () => {
      if (joined && ownPeerId && coordination.readyState === WebSocket.OPEN) {
        coordination.send(JSON.stringify({
          type: 'PEER_READY', payload: { sessionId, peerId: ownPeerId },
        }))
      }
    }
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: { echoCancellation: true, noiseSuppression: true },
        })
        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        localStreamRef.current = stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
          void localVideoRef.current.play()
        }

        const peer = new Peer(crypto.randomUUID(), {
          host: peerHost,
          port: Number(import.meta.env.VITE_PEER_PORT || 443),
          path: import.meta.env.VITE_PEER_PATH || '/',
          secure: import.meta.env.VITE_PEER_SECURE !== 'false',
          config: {
            iceServers: [{
              urls: stunUrl,
            }],
            iceTransportPolicy: 'all',
          },
        })
        peerRef.current = peer
        peer.on('open', (peerId) => {
          setCallStatus('waiting')
          ownPeerId = peerId
          announcePeer()
        })
        peer.on('call', (incoming) => {
          incoming.answer(stream)
          bindCall(incoming)
        })
        peer.on('error', (error) => {
          setCallStatus('error')
          setErrorMsg(`Koneksi video gagal: ${error.type}`)
        })
      } catch {
        setCallStatus('error')
        setErrorMsg('Akses kamera dan mikrofon diperlukan untuk video konsultasi.')
      }
    }

    coordination.onopen = () => {
      coordination.send(JSON.stringify({ type: 'JOIN_ROOM', payload: { sessionId } }))
      void start()
    }
    coordination.onmessage = (event) => {
      try {
        const message = JSON.parse(String(event.data)) as {
          type?: string
          payload?: { peerId?: string; role?: 'TULI' | 'PSIKOLOG' }
        }
        const partnerRole = role === 'psikolog' ? 'TULI' : 'PSIKOLOG'
        if (message.type === 'ROOM_JOINED') {
          joined = true
          announcePeer()
        } else if (message.type === 'PEER_READY' && message.payload?.role === partnerRole && message.payload.peerId) {
          targetPeerRef.current = message.payload.peerId
          if (role === 'psikolog') callPartner()
        }
      } catch {
        setErrorMsg('Koordinasi video mengirim data tidak valid.')
      }
    }

    return () => {
      mounted = false
      coordination.close()
      currentCallRef.current?.close()
      peerRef.current?.destroy()
      localStreamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [bindCall, callPartner, role, sessionId])

  const toggleCamera = useCallback(() => {
    const tracks = localStreamRef.current?.getVideoTracks() ?? []
    const next = !isCameraOn
    tracks.forEach((track) => { track.enabled = next })
    setIsCameraOn(next)
  }, [isCameraOn])

  const toggleMic = useCallback(() => {
    const tracks = localStreamRef.current?.getAudioTracks() ?? []
    const next = !isMicOn
    tracks.forEach((track) => { track.enabled = next })
    setIsMicOn(next)
  }, [isMicOn])

  return {
    callStatus,
    isCameraOn,
    isMicOn,
    errorMsg,
    localVideoRef,
    remoteVideoRef,
    toggleCamera,
    toggleMic,
    callPartner,
    attachStreams,
  }
}
