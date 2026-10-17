import { useEffect, useRef, useState, useCallback } from 'react'
import Peer, { type MediaConnection } from 'peerjs'

export type CallStatus = 'initializing' | 'waiting' | 'calling' | 'connected' | 'error'

interface UseVideoCallOptions {
  sessionId: string
  role: 'tuli' | 'psikolog'
  onPartnerConnected?: () => void
  onPartnerDisconnected?: () => void
}

/**
 * Clean alphanumeric ID for PeerJS compatibility
 */
function cleanId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase()
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

  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null)

  // Normalisasi room ID agar Laptop dan Smartphone selalu terhubung ke ruang konsultasi yang sama persis
  const sId = 'bisara_consultation'
  const myPeerId = role === 'psikolog' ? `bsr-psi-${sId}` : `bsr-tuli-${sId}`
  const targetPeerId = role === 'psikolog' ? `bsr-tuli-${sId}` : `bsr-psi-${sId}`

  // Attach streams to video elements
  const attachStreams = useCallback(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current
    }
    if (remoteVideoRef.current && remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current
      remoteVideoRef.current.play().catch(() => {})
    }
  }, [])

  // Call target peer
  const callPartner = useCallback(() => {
    if (!peerRef.current || peerRef.current.destroyed) return
    if (currentCallRef.current && currentCallRef.current.open) return

    setCallStatus('calling')
    const streamToSend = localStreamRef.current || new MediaStream()
    const call = peerRef.current.call(targetPeerId, streamToSend)
    if (!call) return

    currentCallRef.current = call

    call.on('stream', (remoteStream) => {
      remoteStreamRef.current = remoteStream
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream
        remoteVideoRef.current.play().catch(() => {})
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

    call.on('error', (err) => {
      console.warn('Call attempt error:', err)
      currentCallRef.current = null
      setCallStatus('waiting')
    })
  }, [targetPeerId, onPartnerConnected, onPartnerDisconnected])

  useEffect(() => {
    let mounted = true

    // 1. Get user media dengan fallback fleksibel untuk smartphone Android / Safari iOS
    async function startMedia() {
      let stream: MediaStream | null = null

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: true,
        })
      } catch (err1) {
        console.warn('getUserMedia audio+video gagal, mencoba video saja:', err1)
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: false,
          })
        } catch (err2) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true })
          } catch (err3) {
            console.warn('Kamera tidak dapat diakses:', err3)
            setErrorMsg('Izin kamera/mikrofon belum aktif. Mohon izinkan akses kamera di peramban.')
          }
        }
      }

      if (!mounted) {
        if (stream) stream.getTracks().forEach((t) => t.stop())
        return
      }

      if (stream) {
        localStreamRef.current = stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
          localVideoRef.current.play().catch(() => {})
        }
      }

      // 2. Inisialisasi PeerJS client dengan STUN Server Google
      try {
        const peer = new Peer(myPeerId, {
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:stun2.l.google.com:19302' },
            ],
          },
        })

        peerRef.current = peer

        peer.on('open', () => {
          if (!mounted) return
          setCallStatus('waiting')
          // Psikolog bertindak sebagai inisiator utama
          if (role === 'psikolog') {
            setTimeout(() => {
              if (mounted) callPartner()
            }, 1000)
          }
        })

        // Menjawab panggilan masuk
        peer.on('call', (incomingCall) => {
          if (!mounted) return
          currentCallRef.current = incomingCall

          // Jawab dengan stream lokal jika ada
          incomingCall.answer(localStreamRef.current || undefined)

          incomingCall.on('stream', (remoteStream) => {
            remoteStreamRef.current = remoteStream
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream
              remoteVideoRef.current.play().catch(() => {})
            }
            setCallStatus('connected')
            onPartnerConnected?.()
          })

          incomingCall.on('close', () => {
            currentCallRef.current = null
            setCallStatus('waiting')
            remoteStreamRef.current = null
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
            onPartnerDisconnected?.()
          })
        })

        peer.on('error', (err) => {
          console.warn('PeerJS notice:', err.type)
          if (err.type === 'peer-unavailable') {
            setCallStatus('waiting')
          } else {
            setErrorMsg(err.message)
          }
        })
      } catch (peerInitErr) {
        console.error('PeerJS init failed:', peerInitErr)
      }
    }

    startMedia()

    // Polling berkala: Psikolog memanggil berkala sampai terhubung
    const pollInterval = setInterval(() => {
      if (peerRef.current && (!currentCallRef.current || !currentCallRef.current.open)) {
        if (role === 'psikolog') {
          callPartner()
        }
      }
    }, 3000)

    return () => {
      mounted = false
      clearInterval(pollInterval)
      if (currentCallRef.current) currentCallRef.current.close()
      if (peerRef.current) peerRef.current.destroy()
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [myPeerId, role, callPartner])

  // Toggle Camera
  const toggleCamera = useCallback(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks()
      const nextState = !isCameraOn
      videoTracks.forEach((track) => {
        track.enabled = nextState
      })
      setIsCameraOn(nextState)
    }
  }, [isCameraOn])

  // Toggle Microphone
  const toggleMic = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks()
      const nextState = !isMicOn
      audioTracks.forEach((track) => {
        track.enabled = nextState
      })
      setIsMicOn(nextState)
    }
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
