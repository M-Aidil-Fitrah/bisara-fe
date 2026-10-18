import { useCallback, useEffect, useRef, useState } from 'react'
import { api, ApiError, type AiPrediction } from '../api/client'

export type AiAssistStatus = 'idle' | 'countdown' | 'recording' | 'processing' | 'reviewing' | 'error'

export function useAiAssistance(roomId: string, localStream: MediaStream | null, playTts: (audio: Blob) => Promise<void>) {
  const [status, setStatus] = useState<AiAssistStatus>('idle')
  const [seconds, setSeconds] = useState(0)
  const [prediction, setPrediction] = useState<AiPrediction | null>(null)
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<number | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current)
    timerRef.current = null
  }, [])

  const reset = useCallback(() => {
    clearTimer()
    recorderRef.current?.stop()
    recorderRef.current = null
    setStatus('idle')
    setSeconds(0)
    setPrediction(null)
    setText('')
    setError(null)
  }, [clearTimer])

  useEffect(() => () => reset(), [reset])

  const start = useCallback(() => {
    if (!roomId || !localStream || !window.MediaRecorder) {
      setError('Rekaman video belum tersedia di perangkat ini.')
      setStatus('error')
      return
    }
    const videoTrack = localStream.getVideoTracks()[0]
    if (!videoTrack) {
      setError('Nyalakan kamera sebelum merekam isyarat.')
      setStatus('error')
      return
    }
    setError(null)
    setPrediction(null)
    setText('')
    let remaining = 3
    setSeconds(remaining)
    setStatus('countdown')
    timerRef.current = window.setInterval(() => {
      remaining -= 1
      setSeconds(remaining)
      if (remaining > 0) return
      clearTimer()
      const videoOnly = new MediaStream([videoTrack])
      const chunks: BlobPart[] = []
      const recorder = new MediaRecorder(videoOnly, MediaRecorder.isTypeSupported('video/webm;codecs=vp8') ? { mimeType: 'video/webm;codecs=vp8' } : undefined)
      recorderRef.current = recorder
      recorder.ondataavailable = (event) => { if (event.data.size > 0) chunks.push(event.data) }
      recorder.onerror = () => { setError('Rekaman video gagal.'); setStatus('error') }
      recorder.onstop = () => {
        recorderRef.current = null
        const video = new Blob(chunks, { type: recorder.mimeType || 'video/webm' })
        if (video.size === 0) { setError('Rekaman video kosong.'); setStatus('error'); return }
        setStatus('processing')
        void api.ai.predict(roomId, video).then((result) => { setPrediction(result); setText(result.prediction); setStatus('reviewing') }).catch((cause: ApiError) => { setError(cause.message); setStatus('error') })
      }
      recorder.start()
      setStatus('recording')
      window.setTimeout(() => { if (recorder.state === 'recording') recorder.stop() }, 4_000)
    }, 1_000)
  }, [clearTimer, localStream, roomId])

  const speak = useCallback(async () => {
    if (!roomId || !text.trim()) return
    await playTts(await api.ai.tts(roomId, text.trim()))
  }, [playTts, roomId, text])

  return { status, seconds, prediction, text, error, setText, start, reset, speak }
}
