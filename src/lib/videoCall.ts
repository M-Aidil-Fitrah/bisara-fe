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

  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null)

  // Attach local stream to video element whenever stream or ref changes
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

  const bindCall = useCallback((call: MediaConnection) => {
    currentCallRef.current?.close()
    currentCallRef.current = call

    call.on('stream', (stream) => {
      remoteStreamRef.current = stream
      setRemoteStream(stream)
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream
        void remoteVideoRef.current.play().catch(() => {})
      }
      setCallStatus('connected')
    })

    call.on('close', () => {
      currentCallRef.current = null
      remoteStreamRef.current = null
      setRemoteStream(null)
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null
      }
      setCallStatus('waiting')
    })

    call.on('error', () => {
      setCallStatus('error')
      setErrorMsg('Panggilan video terputus atau gagal tersambung.')
    })
  }, [])

  const callPartner = useCallback(() => {
    const peer = peerRef.current
    const target = targetPeerRef.current
    const stream = localStreamRef.current

    if (!peer || peer.destroyed || !target || !stream) {
      return
    }

    setCallStatus('calling')
    try {
      const outgoing = peer.call(target, stream)
      if (outgoing) {
        bindCall(outgoing)
      }
    } catch {
      setCallStatus('error')
      setErrorMsg('Gagal melakukan panggilan ke lawan bicara.')
    }
  }, [bindCall])

  const announcePeer = useCallback(() => {
    const peerId = ownPeerIdRef.current
    if (socket && socket.readyState === WebSocket.OPEN && socketJoined && peerId && roomId) {
      socket.send(
        JSON.stringify({
          type: 'PEER_READY',
          payload: { roomId, peerId },
        })
      )
    }
  }, [roomId, socket, socketJoined])

  // Announce peer when socket becomes joined
  useEffect(() => {
    if (socketJoined && ownPeerIdRef.current) {
      announcePeer()
    }
  }, [socketJoined, announcePeer])

  // Single lifetime init for MediaStream and PeerJS instance
  useEffect(() => {
    if (!roomId) return

    let mounted = true

    const init = async () => {
      try {
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
          setCallStatus('waiting')
          announcePeer()
        })

        peer.on('call', (incoming) => {
          if (!mounted) return
          incoming.answer(localStreamRef.current ?? stream)
          bindCall(incoming)
        })

        peer.on('error', (err) => {
          if (!mounted) return
          setCallStatus('error')
          setErrorMsg(`Koneksi video signaling: ${err.type}`)
        })
      } catch {
        if (!mounted) return
        setCallStatus('error')
        setErrorMsg('Izin kamera dan mikrofon diperlukan untuk panggilan video.')
      }
    }

    void init()

    return () => {
      mounted = false
      currentCallRef.current?.close()
      peerRef.current?.destroy()
      localStreamRef.current?.getTracks().forEach((track) => track.stop())
      localStreamRef.current = null
      setLocalStream(null)
      setRemoteStream(null)
    }
  }, [roomId, announcePeer, bindCall])

  const handleRemotePeerReady = useCallback(
    (remotePeerId: string) => {
      if (remotePeerId === ownPeerIdRef.current) return
      targetPeerRef.current = remotePeerId

      // ADMIN calls USER automatically after short delay for answer readiness
      if (role === 'ADMIN') {
        const timer = window.setTimeout(() => {
          callPartner()
        }, 500)
        return () => window.clearTimeout(timer)
      } else {
        // Fallback for USER: if not connected after 3s, call admin
        const timer = window.setTimeout(() => {
          if (callStatus !== 'connected') {
            callPartner()
          }
        }, 3000)
        return () => window.clearTimeout(timer)
      }
    },
    [callPartner, callStatus, role]
  )

  const handleRemotePeerLeft = useCallback(() => {
    targetPeerRef.current = null
    currentCallRef.current?.close()
    currentCallRef.current = null
    remoteStreamRef.current = null
    setRemoteStream(null)
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }
    setCallStatus('waiting')
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
