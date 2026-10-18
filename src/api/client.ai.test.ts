import { afterEach, describe, expect, it, vi } from 'vitest'
import { api } from './client'

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })

describe('AI request transport', () => {
  it('waits beyond the general API deadline and labels MP4 recordings correctly', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('window', { setTimeout, clearTimeout })
    const fetchMock = vi.fn((_url: string, init: RequestInit) => new Promise<Response>((resolve, reject) => {
      init.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
      setTimeout(() => resolve(Response.json({ success: true, data: {
        prediction: 'Terima kasih', confidence: 0.9, alternatives: [],
        quality: { frames: 30, shoulder_rate: 1, hand_rate: 1 },
      } })), 13_000)
    }))
    vi.stubGlobal('fetch', fetchMock)
    const pending = api.ai.predict('room', new Blob(['video'], { type: 'video/mp4' }))
    await vi.advanceTimersByTimeAsync(13_000)
    expect((await pending).prediction).toBe('Terima kasih')
    const body = fetchMock.mock.calls[0]?.[1].body
    expect(body).toBeInstanceOf(FormData)
    if (!(body instanceof FormData)) throw new Error('Expected multipart video')
    const file = body.get('video')
    expect(file).toBeInstanceOf(File)
    if (!(file instanceof File)) throw new Error('Expected video file')
    expect(file.name).toBe('bisara-sign.mp4')
  })

  it('keeps the TTS deadline until the response body has arrived', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('window', { setTimeout, clearTimeout })
    vi.stubGlobal('fetch', vi.fn((_url: string, init: RequestInit) => Promise.resolve(new Response(new ReadableStream<Uint8Array>({
      start(controller) { init.signal?.addEventListener('abort', () => controller.error(new DOMException('Aborted', 'AbortError'))) },
    }), { headers: { 'content-type': 'audio/wav' } }))))
    const pending = expect(api.ai.tts('room', 'Halo')).rejects.toMatchObject({ code: 'REQUEST_TIMEOUT' })
    await vi.advanceTimersByTimeAsync(135_000)
    await pending
  })
})
