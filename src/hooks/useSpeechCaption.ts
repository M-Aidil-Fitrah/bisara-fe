import { useCallback, useEffect, useRef, useState } from 'react'

interface SpeechRecognitionEventLike extends Event { results: SpeechRecognitionResultList }
interface SpeechRecognitionErrorEventLike extends Event { error: string }
interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike
type SpeechWindow = Window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }

function recognitionConstructor(): SpeechRecognitionConstructor | null {
  const speechWindow = window as SpeechWindow
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null
}

export function isSpeechCaptionSupported(): boolean {
  return typeof window !== 'undefined' && recognitionConstructor() !== null
}

export function useSpeechCaption(onCaption: (text: string, isFinal: boolean) => void) {
  const [supported] = useState(isSpeechCaptionSupported)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  const stop = useCallback(() => { recognitionRef.current?.stop(); recognitionRef.current = null; setListening(false) }, [])
  useEffect(() => () => stop(), [stop])
  const start = useCallback(() => {
    const Constructor = recognitionConstructor()
    if (!Constructor) { setError('Caption suara belum didukung browser ini.'); return }
    const recognition = new Constructor()
    recognition.lang = 'id-ID'; recognition.continuous = true; recognition.interimResults = true
    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1]
      if (!result) return
      const transcript = result[0]?.transcript.trim()
      if (transcript) onCaption(transcript, result.isFinal)
    }
    recognition.onerror = () => { setError('Caption suara tidak tersedia. Periksa izin mikrofon.'); setListening(false) }
    recognition.onend = () => { recognitionRef.current = null; setListening(false) }
    recognitionRef.current = recognition; setError(null); recognition.start(); setListening(true)
  }, [onCaption])
  return { supported, listening, error, start, stop }
}
