import { useCallback, useEffect, useRef, useState } from 'react'
import Peer, { type MediaConnection } from 'peerjs'
import { frontendEnv } from '../config/env'

export type CallStatus = 'initializing' | 'waiting' | 'calling' | 'connected' | 'error'

interface UseVideoCallOptions {
  roomId: string
  role: 'USER' | 'ADMIN'
  socket: WebSocket | null
  socketJoined: boolean
}

export function useVideoCall({ roomId, role, socket, socketJoined }: UseVideoCallOptions) {
  const [callStatus, setCallStatus] = useState<CallStatus>('initializing')
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)

  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)
  const peerRef = useRef<Peer | null>(null)
  const currentCallRef = useRef<MediaConnection | null>(null)
  const targetPeerRef = useRef<string | null>(null)
  const ownPeerIdRef = useRef<string | null>(null)

  const socketRef = useRef<WebSocket | null>(socket)
  const socketJoinedRef = useRef(socketJoined)
  const roleRef = useRef(role)
  const callStatusRef = useRef<CallStatus>('initializing')

  // Keep references updated on every render to eliminate stale closures
  useEffect(() => {
    socketRef.current = socket
    socketJoinedRef.current = socketJoined
    roleRef.current = role
    callStatusRef.current = callStatus
  })

  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null)

  // Attach local stream to video element whenever stream changes
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
      void localVideoRef.current.play().catch(() => {})
    }
  }, [localStream])

  // Attach remote stream to video element whenever remote stream changes
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
      void remoteVideoRef.current.play().catch(() => {})
    }
  }, [remoteStream])

  // Bind a MediaConnection and manage stream events without dropping active streams
  const bindCall = useCallback((call: MediaConnection) => {
    if (currentCallRef.current && currentCallRef.current !== call) {
      currentCallRef.current.close()
    }
    currentCallRef.current = call

    call.on('stream', (stream) => {
      remoteStreamRef.current = stream
      setRemoteStream(stream)
      callStatusRef.current = 'connected'
      setCallStatus('connected')
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream
        void remoteVideoRef.current.play().catch(() => {})
      }
    })

    call.on('close', () => {
      if (currentCallRef.current === call) {
        currentCallRef.current = null
        remoteStreamRef.current = null
        setRemoteStream(null)
        callStatusRef.current = 'waiting'
        setCallStatus('waiting')
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null
        }
      }
    })

    call.on('error', () => {
      if (currentCallRef.current === call) {
        callStatusRef.current = 'error'
        setCallStatus('error')
        setErrorMsg('Panggilan video terputus atau gagal tersambung.')
      }
    })
  }, [])

  // Call partner with active-connection protection
  const callPartner = useCallback(() => {
    const peer = peerRef.current
    const target = targetPeerRef.current
    const stream = localStreamRef.current

    if (!peer || peer.destroyed || !target || !stream) {
      return
    }

    // Guard: Never place a redundant call if we already have a functioning connection
    if (callStatusRef.current === 'connected' && currentCallRef.current?.open && remoteStreamRef.current) {
      return
    }

    callStatusRef.current = 'calling'
    setCallStatus('calling')
    try {
      const outgoing = peer.call(target, stream)
      if (outgoing) {
        bindCall(outgoing)
      }
    } catch {
      callStatusRef.current = 'error'
      setCallStatus('error')
      setErrorMsg('Gagal melakukan panggilan ke lawan bicara.')
    }
  }, [bindCall])

  // Announce peer ID over WebSocket without re-triggering component lifecycle
  const announcePeer = useCallback(() => {
    const peerId = ownPeerIdRef.current
    const ws = socketRef.current
    if (ws && ws.readyState === WebSocket.OPEN && socketJoinedRef.current && peerId && roomId) {
      ws.send(
        JSON.stringify({
          type: 'PEER_READY',
          payload: { roomId, peerId },
        })
      )
    }
  }, [roomId])

  // Announce peer whenever WebSocket becomes joined
  useEffect(() => {
    if (socketJoined && ownPeerIdRef.current) {
      announcePeer()
    }
  }, [socketJoined, announcePeer])

  // Single lifetime init for MediaStream and PeerJS instance per room
  useEffect(() => {
    if (!roomId) return

    let mounted = true

    const init = async () => {
      try {
        callStatusRef.current = 'initializing'
        setCallStatus('initializing')
        setErrorMsg(null)

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        })

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        localStreamRef.current = stream
        setLocalStream(stream)

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
          void localVideoRef.current.play().catch(() => {})
        }

        const peer = new Peer(crypto.randomUUID(), {
          host: frontendEnv.VITE_PEER_HOST,
          port: frontendEnv.VITE_PEER_PORT,
          path: frontendEnv.VITE_PEER_PATH,
          secure: frontendEnv.VITE_PEER_SECURE,
          config: {
            iceServers: [{ urls: frontendEnv.VITE_STUN_URL }],
            iceTransportPolicy: 'all',
          },
        })
        peerRef.current = peer

        peer.on('open', (id) => {
          if (!mounted) return
          ownPeerIdRef.current = id
          callStatusRef.current = 'waiting'
          setCallStatus('waiting')
          announcePeer()
        })

        peer.on('call', (incoming) => {
          if (!mounted) return
          // If already connected with active stream, answer gently without closing
          if (currentCallRef.current?.open && remoteStreamRef.current) {
            incoming.answer(localStreamRef.current ?? stream)
            return
          }
          incoming.answer(localStreamRef.current ?? stream)
          bindCall(incoming)
        })

        peer.on('error', (err) => {
          if (!mounted) return
          callStatusRef.current = 'error'
          setCallStatus('error')
          setErrorMsg(`Koneksi video signaling: ${err.type}`)
        })
      } catch {
        if (!mounted) return
        callStatusRef.current = 'error'
        setCallStatus('error')
        setErrorMsg('Izin kamera dan mikrofon diperlukan untuk panggilan video.')
      }
    }

    void init()

    return () => {
      mounted = false
      currentCallRef.current?.close()
      currentCallRef.current = null
      peerRef.current?.destroy()
      peerRef.current = null
      localStreamRef.current?.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
      remoteStreamRef.current = null
      setLocalStream(null)
      setRemoteStream(null)
    }
  }, [roomId, announcePeer, bindCall])

  const handleRemotePeerReady = useCallback(
    (remotePeerId: string) => {
      if (!remotePeerId || remotePeerId === ownPeerIdRef.current) return
      targetPeerRef.current = remotePeerId

      // Guard: If already connected, ignore duplicate PEER_READY
      if (callStatusRef.current === 'connected' && currentCallRef.current?.open && remoteStreamRef.current) {
        return
      }

      // ADMIN automatically calls USER after short delay for peer readiness
      if (roleRef.current === 'ADMIN') {
        const timer = window.setTimeout(() => {
          if (callStatusRef.current !== 'connected') {
            callPartner()
          }
        }, 500)
        return () => window.clearTimeout(timer)
      } else {
        // Fallback for USER: Only call if ADMIN hasn't called after 6 seconds and still not connected
        const timer = window.setTimeout(() => {
          if (callStatusRef.current !== 'connected' && !currentCallRef.current?.open && !remoteStreamRef.current) {
            callPartner()
          }
        }, 6000)
        return () => window.clearTimeout(timer)
      }
    },
    [callPartner]
  )

  const handleRemotePeerLeft = useCallback(() => {
    targetPeerRef.current = null
    currentCallRef.current?.close()
    currentCallRef.current = null
    remoteStreamRef.current = null
    setRemoteStream(null)
    callStatusRef.current = 'waiting'
    setCallStatus('waiting')
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }
  }, [])

  const toggleCamera = useCallback(() => {
    const tracks = localStreamRef.current?.getVideoTracks() ?? []
    const next = !isCameraOn
    tracks.forEach((track) => {
      track.enabled = next
    })
    setIsCameraOn(next)
  }, [isCameraOn])

  const toggleMic = useCallback(() => {
    const tracks = localStreamRef.current?.getAudioTracks() ?? []
    const next = !isMicOn
    tracks.forEach((track) => {
      track.enabled = next
    })
    setIsMicOn(next)
  }, [isMicOn])

  return {
    callStatus,
    isCameraOn,
    isMicOn,
    errorMsg,
    localStream,
    remoteStream,
    localVideoRef,
    remoteVideoRef,
    toggleCamera,
    toggleMic,
    callPartner,
    handleRemotePeerReady,
    handleRemotePeerLeft,
  }
}
