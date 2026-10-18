import type { Phrase } from '../api/client'

export type SignStep = {
  id: string
  label: string
  modelUrl: string
  actionName: string
  durationMs: number
  startOffsetMs: number
  endOffsetMs: number
  kind: 'word' | 'letter'
  hasAnimation: boolean
}

export type AnimationClipTiming = {
  name: string
  durationMs: number
  activeStartMs: number
  activeEndMs: number
}

const LOCAL_MODEL_URL = '/models/avatar.glb'

export function normalizeSignText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('id-ID')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function normalizeAction(value: string): string {
  return normalizeSignText(value).replace(/\s+/g, '_')
}

function findAlphabetAction(letter: string, clips: AnimationClipTiming[]): AnimationClipTiming | undefined {
  const candidates = [letter, `huruf_${letter}`, `letter_${letter}`, `alphabet_${letter}`]
  return clips.find((clip) => candidates.includes(normalizeAction(clip.name)))
}

function playbackTiming(clip: AnimationClipTiming): { durationMs: number; startOffsetMs: number; endOffsetMs: number } {
  const startOffsetMs = Math.min(Math.max(0, clip.activeStartMs - 80), clip.durationMs)
  const endOffsetMs = Math.min(clip.durationMs, Math.max(clip.activeEndMs + 80, startOffsetMs + 400))
  return { startOffsetMs, endOffsetMs, durationMs: endOffsetMs - startOffsetMs + 180 }
}

export function buildSignSequence(text: string, phrases: Phrase[], localClips: AnimationClipTiming[]): SignStep[] {
  const normalized = normalizeSignText(text)
  if (!normalized) return []

  const words = normalized.split(' ')
  const phraseEntries = phrases
    .filter((phrase) => phrase.animations.length > 0)
    .map((phrase) => ({ phrase, words: normalizeSignText(phrase.text).split(' ') }))
    .filter((entry) => entry.words[0] !== '')
    .sort((left, right) => right.words.length - left.words.length)
  const localActions = new Map(localClips.map((clip) => [normalizeAction(clip.name), clip]))
  const localEntries = localClips
    .filter((clip) => !/idle|ready|test|not_bisindo/i.test(clip.name))
    .map((clip) => ({ clip, words: normalizeSignText(clip.name.replaceAll('_', ' ')).split(' ') }))
    .sort((left, right) => right.words.length - left.words.length)
  const steps: SignStep[] = []

  for (let index = 0; index < words.length;) {
    const catalogMatch = phraseEntries.find((entry) => entry.words.every((word, offset) => words[index + offset] === word))
    if (catalogMatch) {
      const asset = catalogMatch.phrase.animations[0]
      if (asset) {
        const localClip = asset.glbUrl === LOCAL_MODEL_URL ? localActions.get(normalizeAction(asset.animationName)) : undefined
        const timing = localClip ? playbackTiming(localClip) : { startOffsetMs: 0, endOffsetMs: asset.durationMs, durationMs: Math.max(asset.durationMs + 300, 1_100) }
        steps.push({ id: `word-${index}-${asset.id}`, label: catalogMatch.phrase.text, modelUrl: asset.glbUrl, actionName: asset.animationName, ...timing, kind: 'word', hasAnimation: true })
        index += catalogMatch.words.length
        continue
      }
    }

    const localPhrase = localEntries.find((entry) => entry.words.every((word, offset) => words[index + offset] === word))
    if (localPhrase) {
      const timing = playbackTiming(localPhrase.clip)
      steps.push({ id: `word-${index}-${localPhrase.clip.name}`, label: localPhrase.words.join(' '), modelUrl: LOCAL_MODEL_URL, actionName: localPhrase.clip.name, ...timing, kind: 'word', hasAnimation: true })
      index += localPhrase.words.length
      continue
    }

    const word = words[index] ?? ''
    const localAction = localActions.get(normalizeAction(word))
    if (localAction) {
      steps.push({ id: `word-${index}-${word}`, label: word, modelUrl: LOCAL_MODEL_URL, actionName: localAction.name, ...playbackTiming(localAction), kind: 'word', hasAnimation: true })
    } else {
      for (const [letterIndex, letter] of [...word].entries()) {
        const alphabetClip = findAlphabetAction(letter, localClips)
        const timing = alphabetClip ? playbackTiming(alphabetClip) : { startOffsetMs: 0, endOffsetMs: 900, durationMs: 1_100 }
        steps.push({ id: `letter-${index}-${letterIndex}-${letter}`, label: letter.toLocaleUpperCase('id-ID'), modelUrl: LOCAL_MODEL_URL, actionName: alphabetClip?.name ?? '', ...timing, kind: 'letter', hasAnimation: Boolean(alphabetClip) })
      }
    }
    index += 1
  }

  return steps
}
