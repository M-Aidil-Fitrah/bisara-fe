import { useCallback, useEffect, useRef, useState } from 'react'
import Peer, { type MediaConnection } from 'peerjs'
import { frontendEnv } from '../config/env'

export type CallStatus = 'initializing' | 'waiting' | 'calling' | 'connected' | 'error'

interface UseVideoCallOptions {
  roomId: string
  socket: WebSocket | null
  socketJoined: boolean
}

export function shouldInitiateCall(ownPeerId: string, remotePeerId: string): boolean {
  return ownPeerId.localeCompare(remotePeerId) < 0
}

export function useVideoCall({ roomId, socket, socketJoined }: UseVideoCallOptions) {
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
  const connectTimerRef = useRef<number | null>(null)

  const socketRef = useRef<WebSocket | null>(socket)
  const socketJoinedRef = useRef(socketJoined)
  const callStatusRef = useRef<CallStatus>('initializing')

  // Keep references updated on every render to eliminate stale closures
  useEffect(() => {
    socketRef.current = socket
    socketJoinedRef.current = socketJoined
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

  const cancelPendingCall = useCallback(() => {
    if (connectTimerRef.current !== null) {
      window.clearTimeout(connectTimerRef.current)
      connectTimerRef.current = null
    }
  }, [])

  // A media connection is exclusive. Duplicate signaling must never replace a live call.
  const bindCall = useCallback((call: MediaConnection) => {
    if (currentCallRef.current && currentCallRef.current !== call) {
      call.close()
      return false
    }
    currentCallRef.current = call

    call.on('stream', (stream) => {
      remoteStreamRef.current = stream
      setRemoteStream(stream)
      cancelPendingCall()
      callStatusRef.current = 'connected'
      setCallStatus('connected')
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream
        void remoteVideoRef.current.play().catch(() => {})
      }
      stream.getTracks().forEach((track) => {
        track.addEventListener('ended', () => {
          if (currentCallRef.current !== call) return
          remoteStreamRef.current = null
          setRemoteStream(null)
          callStatusRef.current = 'waiting'
          setCallStatus('waiting')
        }, { once: true })
      })
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
        currentCallRef.current = null
        remoteStreamRef.current = null
        setRemoteStream(null)
        callStatusRef.current = 'error'
        setCallStatus('error')
        setErrorMsg('Panggilan video terputus atau gagal tersambung.')
      }
    })
    return true
  }, [cancelPendingCall])

  // Call partner with active-connection protection
  const callPartner = useCallback(() => {
    const peer = peerRef.current
    const target = targetPeerRef.current
    const stream = localStreamRef.current

    if (!peer || peer.destroyed || !target || !stream) {
      return
    }

    // A pending or live connection owns the call slot until it explicitly closes.
    if (currentCallRef.current?.open) {
      return
    }

    callStatusRef.current = 'calling'
    setCallStatus('calling')
    try {
      const outgoing = peer.call(target, stream)
      if (outgoing) {
        if (!bindCall(outgoing)) outgoing.close()
      }
    } catch {
      callStatusRef.current = 'error'
      setCallStatus('error')
      setErrorMsg('Gagal melakukan panggilan ke lawan bicara.')
    }
  }, [bindCall])

  const scheduleCall = useCallback(() => {
    const ownPeerId = ownPeerIdRef.current
    const targetPeerId = targetPeerRef.current
    if (!ownPeerId || !targetPeerId || !shouldInitiateCall(ownPeerId, targetPeerId) || currentCallRef.current?.open) return
    cancelPendingCall()
    connectTimerRef.current = window.setTimeout(() => {
      connectTimerRef.current = null
      callPartner()
    }, 300)
  }, [callPartner, cancelPendingCall])

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
          scheduleCall()
        })

        peer.on('call', (incoming) => {
          if (!mounted) return
          if (!bindCall(incoming)) return
          incoming.answer(localStreamRef.current ?? stream)
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
      cancelPendingCall()
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
  }, [roomId, announcePeer, bindCall, cancelPendingCall, scheduleCall])

  const handleRemotePeerReady = useCallback(
    (remotePeerId: string) => {
      if (!remotePeerId || remotePeerId === ownPeerIdRef.current) return
      targetPeerRef.current = remotePeerId

      scheduleCall()
    },
    [scheduleCall]
  )

  const handleRemotePeerLeft = useCallback(() => {
    cancelPendingCall()
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
  }, [cancelPendingCall])

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
