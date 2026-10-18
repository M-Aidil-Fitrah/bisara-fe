export const PSS_ANSWER_LABELS = [
  'tidak pernah',
  'hampir tidak pernah',
  'kadang-kadang',
  'cukup sering',
  'sangat sering',
] as const

function normalizeAnswer(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('id-ID')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

const ANSWER_ALIASES: Readonly<Record<string, number>> = {
  '0': 0,
  'nol': 0,
  'tidak': 0,
  'tidak pernah': 0,
  '1': 1,
  'satu': 1,
  'hampir tidak': 1,
  'hampir tidak pernah': 1,
  '2': 2,
  'dua': 2,
  'kadang': 2,
  'kadang kadang': 2,
  '3': 3,
  'tiga': 3,
  'cukup': 3,
  'cukup sering': 3,
  '4': 4,
  'empat': 4,
  'sering sekali': 4,
  'sangat sering': 4,
}

export function parsePssAnswer(text: string): number | null {
  return ANSWER_ALIASES[normalizeAnswer(text)] ?? null
}

