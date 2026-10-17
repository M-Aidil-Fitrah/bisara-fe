import { useRef } from 'react'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneCall,
  Maximize2,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { useVideoCall } from '../../lib/videoCall'

export interface VideoCallStageProps {
  sessionId: string
  role: 'tuli' | 'psikolog'
  partnerName: string
  partnerPhoto?: string
  className?: string
}

export default function VideoCallStage({
  sessionId,
  role,
  partnerName,
  partnerPhoto,
  className = '',
}: VideoCallStageProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const {
    callStatus,
    isCameraOn,
    isMicOn,
    errorMsg,
    localVideoRef,
    remoteVideoRef,
    toggleCamera,
    toggleMic,
    callPartner,
  } = useVideoCall({
    sessionId,
    role,
  })

  const isConnected = callStatus === 'connected'

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    } else {
      containerRef.current.requestFullscreen().catch(() => {})
    }
  }

  return (
    <div
      ref={containerRef}
      className={`group relative aspect-video overflow-hidden rounded-xl bg-ink text-paper shadow-xl ${className}`}
    >
      {/* 1. Main Remote Video Stream (Partner's Webcam) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className={`size-full object-cover transition-opacity duration-500 ${
          isConnected ? 'opacity-100' : 'opacity-0 absolute inset-0'
        }`}
      />

      {/* 2. Waiting state before the authenticated partner connects */}
      {!isConnected && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-ink/90 via-ink to-ink-2 p-6 text-center">
          {partnerPhoto ? (
            <div className="relative mb-4">
              <img
                src={partnerPhoto}
                alt={partnerName}
                className="size-20 sm:size-24 rounded-full object-cover ring-4 ring-brand/40 shadow-2xl"
              />
              <span className="absolute -bottom-1 -right-1 flex size-5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-warn opacity-75" />
                <span className="relative inline-flex size-5 rounded-full bg-warn ring-2 ring-ink" />
              </span>
            </div>
          ) : (
            <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-brand/20 ring-4 ring-brand/40">
              <PhoneCall className="size-8 text-brand-soft animate-pulse" />
            </div>
          )}

          <h4 className="text-base sm:text-lg font-medium text-paper tracking-tight">
            {partnerName}
          </h4>

          <div className="mt-1.5 flex items-center gap-2">
            <span className="inline-block size-2 rounded-full bg-warn animate-pulse" />
            <p className="text-xs text-paper/70">
              {callStatus === 'calling'
                ? 'Sedang menghubungkan video P2P…'
                : 'Menunggu lawan bicara bergabung…'}
            </p>
          </div>

          <button
            onClick={callPartner}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand/40 px-3.5 py-1.5 text-xs text-brand-soft hover:bg-brand/70 hover:text-white transition backdrop-blur border border-brand-soft/20"
          >
            <RefreshCw className="size-3" />
            Hubungkan Ulang
          </button>

          {errorMsg && (
            <p className="mt-3 text-[11px] text-warn/90 bg-warn/10 px-3 py-1 rounded-md border border-warn/20">
              {errorMsg}
            </p>
          )}
        </div>
      )}

      {/* 3. Partner Name Badge (Top-Left) */}
      <div className="absolute top-3 left-3 flex items-center gap-2 rounded-lg bg-ink/70 px-2.5 py-1.5 text-xs text-paper/90 backdrop-blur border border-white/10 shadow-md">
        <span
          className={`size-2 rounded-full ${
            isConnected ? 'bg-ok animate-pulse' : 'bg-warn'
          }`}
        />
        <span className="font-medium tracking-wide">{partnerName}</span>
        {isConnected && (
          <span className="text-[10px] text-paper/60 uppercase font-mono tracking-wider ml-1">
            HD P2P
          </span>
        )}
      </div>

      {/* 4. Local Self-View Camera Preview (Picture-in-Picture) */}
      <div className="absolute bottom-16 sm:bottom-4 right-3 w-28 sm:w-36 aspect-video overflow-hidden rounded-lg bg-ink-2 shadow-2xl ring-2 ring-white/30 backdrop-blur z-10">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={`size-full object-cover -scale-x-100 ${
            isCameraOn ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {!isCameraOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink-2 text-paper/50">
            <VideoOff className="size-5" />
            <span className="text-[9px] mt-1 font-mono uppercase">Kamera Off</span>
          </div>
        )}
        <div className="absolute bottom-1 left-1.5 text-[9px] text-white/80 bg-black/60 px-1 rounded font-mono">
          Anda
        </div>
      </div>

      {/* 5. In-Call Floating Control Bar (Bottom-Center) */}
      <div className="absolute bottom-3 left-3 sm:left-1/2 sm:-translate-x-1/2 flex items-center gap-2 rounded-full bg-ink/80 px-3 py-1.5 backdrop-blur-md border border-white/15 shadow-xl transition-all duration-300">
        {/* Camera Toggle */}
        <button
          onClick={toggleCamera}
          aria-label={isCameraOn ? 'Matikan Kamera' : 'Nyalakan Kamera'}
          className={`flex size-8 items-center justify-center rounded-full transition ${
            isCameraOn
              ? 'bg-white/15 text-paper hover:bg-white/25'
              : 'bg-warn text-white hover:bg-warn/90'
          }`}
          title={isCameraOn ? 'Matikan Kamera' : 'Nyalakan Kamera'}
        >
          {isCameraOn ? <Video className="size-4" /> : <VideoOff className="size-4" />}
        </button>

        {/* Mic Toggle */}
        <button
          onClick={toggleMic}
          aria-label={isMicOn ? 'Matikan Mikrofon' : 'Nyalakan Mikrofon'}
          className={`flex size-8 items-center justify-center rounded-full transition ${
            isMicOn
              ? 'bg-white/15 text-paper hover:bg-white/25'
              : 'bg-warn text-white hover:bg-warn/90'
          }`}
          title={isMicOn ? 'Matikan Mikrofon' : 'Nyalakan Mikrofon'}
        >
          {isMicOn ? <Mic className="size-4" /> : <MicOff className="size-4" />}
        </button>

        <span className="h-4 w-px bg-white/20 mx-0.5" />

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          aria-label="Layar Penuh"
          className="flex size-8 items-center justify-center rounded-full text-paper/80 hover:bg-white/15 hover:text-white transition"
          title="Layar Penuh"
        >
          <Maximize2 className="size-3.5" />
        </button>

        {/* Connection status tag */}
        <span className="hidden sm:inline-flex items-center gap-1.5 pl-1.5 text-[11px] text-paper/70 font-mono">
          <Sparkles className="size-3 text-brand-soft" />
          {isConnected ? 'Live Video' : 'Standby'}
        </span>
      </div>
    </div>
  )
}
