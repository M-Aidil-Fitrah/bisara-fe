import type { Phrase } from '../api/client'

export type SignStep = {
  id: string
  label: string
  modelUrl: string
  actionName: string
  durationMs: number
  kind: 'word' | 'letter'
  hasAnimation: boolean
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

function findAlphabetAction(letter: string, animationNames: string[]): string {
  const candidates = [letter, `huruf_${letter}`, `letter_${letter}`, `alphabet_${letter}`]
  return animationNames.find((name) => candidates.includes(normalizeAction(name))) ?? ''
}

export function buildSignSequence(text: string, phrases: Phrase[], localAnimationNames: string[]): SignStep[] {
  const normalized = normalizeSignText(text)
  if (!normalized) return []

  const words = normalized.split(' ')
  const phraseEntries = phrases
    .filter((phrase) => phrase.animations.length > 0)
    .map((phrase) => ({ phrase, words: normalizeSignText(phrase.text).split(' ') }))
    .filter((entry) => entry.words[0] !== '')
    .sort((left, right) => right.words.length - left.words.length)
  const localActions = new Map(localAnimationNames.map((name) => [normalizeAction(name), name]))
  const localEntries = localAnimationNames
    .filter((name) => !/idle|ready/i.test(name))
    .map((name) => ({ name, words: normalizeSignText(name.replaceAll('_', ' ')).split(' ') }))
    .sort((left, right) => right.words.length - left.words.length)
  const steps: SignStep[] = []

  for (let index = 0; index < words.length;) {
    const catalogMatch = phraseEntries.find((entry) => entry.words.every((word, offset) => words[index + offset] === word))
    if (catalogMatch) {
      const asset = catalogMatch.phrase.animations[0]
      if (asset) {
        steps.push({ id: `word-${index}-${asset.id}`, label: catalogMatch.phrase.text, modelUrl: asset.glbUrl, actionName: asset.animationName, durationMs: Math.max(asset.durationMs, 800), kind: 'word', hasAnimation: true })
        index += catalogMatch.words.length
        continue
      }
    }

    const localPhrase = localEntries.find((entry) => entry.words.every((word, offset) => words[index + offset] === word))
    if (localPhrase) {
      steps.push({ id: `word-${index}-${localPhrase.name}`, label: localPhrase.words.join(' '), modelUrl: LOCAL_MODEL_URL, actionName: localPhrase.name, durationMs: 1_800, kind: 'word', hasAnimation: true })
      index += localPhrase.words.length
      continue
    }

    const word = words[index] ?? ''
    const localAction = localActions.get(normalizeAction(word))
    if (localAction) {
      steps.push({ id: `word-${index}-${word}`, label: word, modelUrl: LOCAL_MODEL_URL, actionName: localAction, durationMs: 1_800, kind: 'word', hasAnimation: true })
    } else {
      for (const [letterIndex, letter] of [...word].entries()) {
        const actionName = findAlphabetAction(letter, localAnimationNames)
        steps.push({ id: `letter-${index}-${letterIndex}-${letter}`, label: letter.toLocaleUpperCase('id-ID'), modelUrl: LOCAL_MODEL_URL, actionName, durationMs: 750, kind: 'letter', hasAnimation: Boolean(actionName) })
      }
    }
    index += 1
  }

  return steps
}
