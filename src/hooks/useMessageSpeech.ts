import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../api/client'

// Playback on the listener's device; never feed received messages back into WebRTC.
export function useMessageSpeech(roomId: string) {
  const contextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const generationRef = useRef(0)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => () => {
    generationRef.current += 1
    sourceRef.current?.stop()
    sourceRef.current = null
    const context = contextRef.current
    contextRef.current = null
    if (context && context.state !== 'closed') void context.close()
  }, [roomId])

  const speak = useCallback(async (text: string) => {
    if (!roomId) return
    const generation = ++generationRef.current
    sourceRef.current?.stop()
    sourceRef.current = null
    setError(null)
    setStatus('Menyiapkan suara…')
    try {
      const context = contextRef.current ?? new AudioContext()
      contextRef.current = context
      // Resume during the click gesture, before the network request completes.
      await context.resume()
      const audio = await api.ai.tts(roomId, text)
      if (generation !== generationRef.current) return
      const buffer = await context.decodeAudioData(await audio.arrayBuffer())
      if (generation !== generationRef.current) return
      const source = context.createBufferSource()
      source.buffer = buffer
      source.connect(context.destination)
      sourceRef.current = source
      source.onended = () => {
        source.disconnect()
        if (generation === generationRef.current) {
          sourceRef.current = null
          setStatus(null)
        }
      }
      source.start()
      setStatus('Memutar suara…')
    } catch (cause) {
      if (generation !== generationRef.current) return
      setStatus(null)
      setError(cause instanceof Error ? cause.message : 'Pesan belum dapat dibacakan.')
    }
  }, [roomId])

  return { speak, status, error }
}
