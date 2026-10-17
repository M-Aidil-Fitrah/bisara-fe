import { ANSWERS } from '../data'
import type { SessionRecord } from '../types'

export type Line = { from: 'psikolog' | 'tuli'; text: string; conf?: number; manual?: boolean }

export const REVERSED = [3, 4, 6, 7]
export const scorePss = (answers: string[]): number =>
  answers.reduce((s, a, i) => {
    const idx = ANSWERS.indexOf(a)
    const val = idx >= 0 ? idx : 0
    return s + (REVERSED.includes(i) ? 4 - val : val)
  }, 0)

export const level = (s: number): 'Rendah' | 'Sedang' | 'Tinggi' =>
  s <= 13 ? 'Rendah' : s <= 26 ? 'Sedang' : 'Tinggi'

const KEY = 'bisara-history'
const PSI = ['dr. Nadia Putri, M.Psi', 'Rizky Hanafi, M.Psi', 'Sarah Mutia, M.Psi', 'dr. Teuku Fadli, Sp.KJ']
const KL = ['Rafi A.', 'Intan M.', 'Dimas P.', 'Aulia R.', 'Fajar S.', 'Nabila K.', 'Yusuf H.', 'Cut Rahmi', 'Bima T.', 'Salsa N.']

function seed(): SessionRecord[] {
  const out: SessionRecord[] = []
  let r = 7
  const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280)
  for (let i = 0; i < 38; i++) {
    const d = new Date(2026, 9, 28)
    d.setDate(d.getDate() - Math.floor(i * 1.5 + rnd() * 2))
    d.setHours(8 + Math.floor(rnd() * 8), Math.floor(rnd() * 60))
    const cancelled = rnd() < 0.08
    const answers = Array.from({ length: 10 }, () => {
      const idx = Math.floor(rnd() * 5)
      return ANSWERS[idx] ?? ANSWERS[0]
    })
    const psiName = PSI[Math.floor(rnd() * PSI.length)] ?? PSI[0]
    const klName = KL[Math.floor(rnd() * KL.length)] ?? KL[0]

    out.push({
      id: `BSR-${String(460 - i).padStart(4, '0')}`,
      date: d.toISOString(),
      psikolog: psiName,
      klien: klName,
      durationMin: cancelled ? Math.floor(3 + rnd() * 5) : Math.floor(14 + rnd() * 16),
      score: cancelled ? null : scorePss(answers),
      accuracy: 0.72 + rnd() * 0.24,
      manual: Math.floor(rnd() * 4),
      status: cancelled ? 'Dibatalkan' : 'Selesai',
      notes: cancelled ? 'Sesi dihentikan, koneksi kamera tidak stabil.' : 'Klien kooperatif. Perlu tindak lanjut pada butir terkait kendali diri.',
      lines: cancelled
        ? []
        : answers.flatMap((a, k) => [
            { from: 'psikolog' as const, text: `Butir ${k + 1} PSS-10` },
            { from: 'tuli' as const, text: a, conf: 0.7 + rnd() * 0.28 },
          ]),
    })
  }
  return out
}

export function getHistory(): SessionRecord[] {
  let saved: SessionRecord[] = []
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) saved = JSON.parse(raw) as SessionRecord[]
  } catch {
    // Fallback to default seed on corrupted localStorage
  }
  return [...saved, ...seed()].sort((a, b) => b.date.localeCompare(a.date))
}

export function saveSession(rec: SessionRecord) {
  let saved: SessionRecord[] = []
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) saved = JSON.parse(raw) as SessionRecord[]
  } catch {
    // Ignore parse error and overwrite
  }
  localStorage.setItem(KEY, JSON.stringify([rec, ...saved]))
}

