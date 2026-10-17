import { z } from 'zod'

const httpUrl = z.url().refine(
  (value) => value.startsWith('http://') || value.startsWith('https://'),
  'harus menggunakan protokol http atau https',
)
const websocketUrl = z.url().refine(
  (value) => value.startsWith('ws://') || value.startsWith('wss://'),
  'harus menggunakan protokol ws atau wss',
)

export const FrontendEnvSchema = z.object({
  VITE_API_URL: httpUrl.transform((value) => value.replace(/\/$/, '')),
  VITE_WS_URL: websocketUrl.transform((value) => value.replace(/\/$/, '')),
  VITE_PEER_HOST: z.string().trim().min(1),
  VITE_PEER_PORT: z.coerce.number().int().min(1).max(65_535),
  VITE_PEER_PATH: z.string().startsWith('/'),
  VITE_PEER_SECURE: z.enum(['true', 'false']).transform((value) => value === 'true'),
  VITE_STUN_URL: z.string().regex(/^(stun|stuns):[^\s]+$/),
})

const envSource = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : (typeof process !== 'undefined' ? process.env : {})
const parsed = FrontendEnvSchema.safeParse(envSource)
if (!parsed.success) {
  const fields = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ')
  throw new Error(`Konfigurasi frontend tidak valid: ${fields}`)
}

export const frontendEnv = parsed.data
