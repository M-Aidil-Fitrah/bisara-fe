import { describe, expect, it } from 'vitest'
import { FrontendEnvSchema } from './env'

const validEnvironment = {
  VITE_API_URL: 'https://api.example.test/api/',
  VITE_WS_URL: 'wss://api.example.test/',
  VITE_PEER_HOST: 'peer.example.test',
  VITE_PEER_PORT: '443',
  VITE_PEER_PATH: '/',
  VITE_PEER_SECURE: 'true',
  VITE_STUN_URL: 'stun:stun.example.test:3478',
}

describe('FrontendEnvSchema', () => {
  it('memvalidasi dan menormalisasi seluruh konfigurasi koneksi', () => {
    const parsed = FrontendEnvSchema.parse(validEnvironment)

    expect(parsed.VITE_API_URL).toBe('https://api.example.test/api')
    expect(parsed.VITE_WS_URL).toBe('wss://api.example.test')
    expect(parsed.VITE_PEER_PORT).toBe(443)
    expect(parsed.VITE_PEER_SECURE).toBe(true)
  })

  it('menolak konfigurasi wajib yang hilang atau menggunakan protokol keliru', () => {
    expect(FrontendEnvSchema.safeParse({
      ...validEnvironment,
      VITE_API_URL: 'ws://api.example.test',
      VITE_WS_URL: '',
    }).success).toBe(false)
  })
})
