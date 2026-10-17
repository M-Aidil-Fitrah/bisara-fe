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

  const sId = cleanId(sessionId || 'demo_session')
  const myPeerId = role === 'psikolog' ? `bsr-psi-${sId}` : `bsr-tuli-${sId}`
  const targetPeerId = role === 'psikolog' ? `bsr-tuli-${sId}` : `bsr-psi-${sId}`

  // Attach streams to video elements
  const attachStreams = useCallback(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current
    }
    if (remoteVideoRef.current && remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current
    }
  }, [])

  // Call target peer
  const callPartner = useCallback(() => {
    if (!peerRef.current || !localStreamRef.current) return
    if (currentCallRef.current && currentCallRef.current.open) return

    setCallStatus('calling')
    const call = peerRef.current.call(targetPeerId, localStreamRef.current)

    currentCallRef.current = call

    call.on('stream', (remoteStream) => {
      remoteStreamRef.current = remoteStream
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream
      }
      setCallStatus('connected')
      onPartnerConnected?.()
    })

    call.on('close', () => {
      setCallStatus('waiting')
      remoteStreamRef.current = null
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
      onPartnerDisconnected?.()
    })

    call.on('error', () => {
      setCallStatus('waiting')
    })
  }, [targetPeerId, onPartnerConnected, onPartnerDisconnected])

  useEffect(() => {
    let mounted = true

    // 1. Get user media (camera & mic)
    async function startMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: true,
        })

        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        localStreamRef.current = stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        // 2. Initialize PeerJS client with Google STUN servers
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
          // Auto initiate call after a short delay
          setTimeout(() => {
            if (mounted) callPartner()
          }, 1500)
        })

        // Listen for incoming call
        peer.on('call', (incomingCall) => {
          if (!mounted || !localStreamRef.current) return
          currentCallRef.current = incomingCall

          incomingCall.answer(localStreamRef.current)

          incomingCall.on('stream', (remoteStream) => {
            remoteStreamRef.current = remoteStream
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream
            }
            setCallStatus('connected')
            onPartnerConnected?.()
          })

          incomingCall.on('close', () => {
            setCallStatus('waiting')
            remoteStreamRef.current = null
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
            onPartnerDisconnected?.()
          })
        })

        peer.on('error', (err) => {
          console.warn('PeerJS status notice:', err.type)
          if (err.type === 'peer-unavailable') {
            setCallStatus('waiting')
          } else {
            setErrorMsg(err.message)
          }
        })
      } catch (err: unknown) {
        console.warn('Camera/mic access unavailable, fallback to simulated stream:', err)
        setCallStatus('error')
        const message = err instanceof Error ? err.message : String(err)
        setErrorMsg('Izin kamera/mikrofon tidak aktif: ' + message)
      }
    }

    startMedia()

    // Ping / poll partner availability periodically
    const pollInterval = setInterval(() => {
      if (peerRef.current && (!currentCallRef.current || !currentCallRef.current.open)) {
        callPartner()
      }
    }, 4000)

    return () => {
      mounted = false
      clearInterval(pollInterval)
      if (currentCallRef.current) currentCallRef.current.close()
      if (peerRef.current) peerRef.current.destroy()
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [myPeerId, callPartner])

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
