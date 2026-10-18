import React, { useRef } from 'react'
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
import type { CallStatus } from '../../lib/videoCall'

export interface VideoCallStageProps {
  partnerName: string
  partnerPhoto?: string | undefined
  callStatus: CallStatus
  isCameraOn: boolean
  isMicOn: boolean
  errorMsg: string | null
  localVideoRef: React.RefObject<HTMLVideoElement | null>
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>
  toggleCamera: () => void
  toggleMic: () => void
  callPartner: () => void
  className?: string | undefined
  caption?: string | undefined
}

export default function VideoCallStage({
  partnerName,
  partnerPhoto,
  callStatus,
  isCameraOn,
  isMicOn,
  errorMsg,
  localVideoRef,
  remoteVideoRef,
  toggleCamera,
  toggleMic,
  callPartner,
  className = '',
  caption,
}: VideoCallStageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
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
      className={`group relative aspect-video overflow-hidden rounded-2xl bg-ink text-paper shadow-xl border border-line/20 ${className}`}
    >
      {/* 1. Main Remote Video Stream (Partner's Webcam) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className={`size-full object-cover transition-opacity duration-500 ${
          isConnected ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
        }`}
      />
      {caption && <p className="absolute bottom-16 left-4 right-4 rounded-lg bg-ink/80 px-3 py-2 text-center text-sm text-paper" aria-live="polite">{caption}</p>}

      {/* 2. Waiting state before partner connects */}
      {!isConnected && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-ink/90 via-ink to-ink p-6 text-center">
          {partnerPhoto ? (
            <div className="relative mb-4">
              <img
                src={partnerPhoto}
                alt={partnerName}
                className="size-20 sm:size-24 rounded-full object-cover ring-4 ring-brand/40 shadow-2xl"
              />
              <span className="absolute -bottom-1 -right-1 flex size-5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex size-5 rounded-full bg-amber-500 ring-2 ring-ink" />
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
            <span className="inline-block size-2 rounded-full bg-amber-400 animate-pulse" />
            <p className="text-xs text-paper/70">
              {callStatus === 'calling'
                ? 'Sedang menghubungkan video P2P…'
                : 'Menunggu lawan bicara bergabung…'}
            </p>
          </div>

          <button
            onClick={callPartner}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand/40 px-4 py-2 text-xs font-medium text-brand-soft hover:bg-brand hover:text-white transition backdrop-blur border border-brand-soft/20 shadow-sm"
          >
            <RefreshCw className="size-3" />
            Hubungkan Ulang
          </button>

          {errorMsg && (
            <p role="alert" className="mt-3 text-xs text-amber-200 bg-amber-950/60 px-3 py-1.5 rounded-lg border border-amber-500/30 max-w-sm">
              {errorMsg}
            </p>
          )}
        </div>
      )}

      {/* 3. Partner Name Badge (Top-Left) */}
      <div className="absolute top-3 left-3 flex items-center gap-2 rounded-xl bg-ink/80 px-3 py-1.5 text-xs text-paper/90 backdrop-blur-md border border-white/10 shadow-md">
        <span
          className={`size-2 rounded-full ${
            isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
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
      <div className="absolute bottom-16 sm:bottom-4 right-3 w-28 sm:w-36 aspect-video overflow-hidden rounded-xl bg-ink/90 shadow-2xl ring-2 ring-white/30 backdrop-blur z-10">
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
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-paper/50">
            <VideoOff className="size-5" />
            <span className="text-[9px] mt-1 font-mono uppercase">Kamera Off</span>
          </div>
        )}
        <div className="absolute bottom-1 left-1.5 text-[9px] text-white/90 bg-black/70 px-1.5 py-0.5 rounded font-mono">
          Anda
        </div>
      </div>

      {/* 5. In-Call Floating Control Bar (Bottom-Center) */}
      <div className="absolute bottom-3 left-3 sm:left-1/2 sm:-translate-x-1/2 flex items-center gap-2 rounded-full bg-ink/85 px-3 py-1.5 backdrop-blur-md border border-white/15 shadow-xl transition-all duration-300 z-10">
        {/* Camera Toggle */}
        <button
          type="button"
          onClick={toggleCamera}
          aria-label={isCameraOn ? 'Matikan Kamera' : 'Nyalakan Kamera'}
          className={`flex size-8 items-center justify-center rounded-full transition ${
            isCameraOn
              ? 'bg-white/15 text-paper hover:bg-white/25'
              : 'bg-amber-600 text-white hover:bg-amber-500'
          }`}
          title={isCameraOn ? 'Matikan Kamera' : 'Nyalakan Kamera'}
        >
          {isCameraOn ? <Video className="size-4" /> : <VideoOff className="size-4" />}
        </button>

        {/* Mic Toggle */}
        <button
          type="button"
          onClick={toggleMic}
          aria-label={isMicOn ? 'Matikan Mikrofon' : 'Nyalakan Mikrofon'}
          className={`flex size-8 items-center justify-center rounded-full transition ${
            isMicOn
              ? 'bg-white/15 text-paper hover:bg-white/25'
              : 'bg-amber-600 text-white hover:bg-amber-500'
          }`}
          title={isMicOn ? 'Matikan Mikrofon' : 'Nyalakan Mikrofon'}
        >
          {isMicOn ? <Mic className="size-4" /> : <MicOff className="size-4" />}
        </button>

        <span className="h-4 w-px bg-white/20 mx-0.5" />

        {/* Fullscreen Toggle */}
        <button
          type="button"
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
