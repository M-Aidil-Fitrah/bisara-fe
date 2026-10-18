import { afterEach, describe, expect, it, vi } from 'vitest'
import { isSpeechCaptionSupported } from './useSpeechCaption'

afterEach(() => vi.unstubAllGlobals())

describe('speech caption fallback', () => {
  it('reports unsupported when the browser has no recognition API', () => {
    vi.stubGlobal('window', {})
    expect(isSpeechCaptionSupported()).toBe(false)
  })
  it('supports standard and prefixed recognition APIs', () => {
    vi.stubGlobal('window', { webkitSpeechRecognition: class {} })
    expect(isSpeechCaptionSupported()).toBe(true)
  })
})
