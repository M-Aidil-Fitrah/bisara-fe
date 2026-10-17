/**
 * Bisara Accessibility Utilities & Preferences Store
 * Conforms to WCAG 2.1 Level AA principles.
 */

export type TextSize = 'normal' | 'medium' | 'large'

export interface A11ySettings {
  textSize: TextSize
  highContrast: boolean
  grayscale: boolean
  tts: boolean
  visualToast: boolean
  reduceMotion: boolean
}

export const DEFAULT_A11Y_SETTINGS: A11ySettings = {
  textSize: 'normal',
  highContrast: false,
  grayscale: false,
  tts: false,
  visualToast: true, // Default ON for visual clarity
  reduceMotion: false,
}

const STORAGE_KEY = 'bisara_a11y_prefs'

export function getStoredA11ySettings(): A11ySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_A11Y_SETTINGS
    return { ...DEFAULT_A11Y_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_A11Y_SETTINGS
  }
}

export function saveA11ySettings(settings: A11ySettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Ignore storage errors in private browsing
  }
}

export function applyA11yToDOM(settings: A11ySettings) {
  if (typeof document === 'undefined') return
  const root = document.documentElement

  // Text size
  root.classList.remove('a11y-text-medium', 'a11y-text-large')
  if (settings.textSize === 'medium') root.classList.add('a11y-text-medium')
  else if (settings.textSize === 'large') root.classList.add('a11y-text-large')

  // High contrast
  root.classList.toggle('a11y-high-contrast', settings.highContrast)

  // Grayscale
  root.classList.toggle('a11y-grayscale', settings.grayscale)

  // Reduce motion
  root.classList.toggle('a11y-reduce-motion', settings.reduceMotion)
}

/**
 * Text to Speech helper for Indonesian language
 */
export function speakText(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

  window.speechSynthesis.cancel() // Stop any current speech

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'id-ID'
  utterance.rate = 0.95 // slightly slower for better clarity
  utterance.pitch = 1.0

  // Try to find Indonesian voice
  const voices = window.speechSynthesis.getVoices()
  const idVoice = voices.find((v) => v.lang.startsWith('id') || v.lang.includes('ID'))
  if (idVoice) utterance.voice = idVoice

  window.speechSynthesis.speak(utterance)
}

export interface VisualToastEventDetail {
  id?: string
  title: string
  message: string
  type?: 'info' | 'success' | 'alert'
}

/**
 * Trigger a prominent visual toast notification for deaf / hard-of-hearing users
 */
export function triggerVisualToast(title: string, message: string, type: 'info' | 'success' | 'alert' = 'info') {
  if (typeof window === 'undefined') return
  const event = new CustomEvent<VisualToastEventDetail>('bisara-visual-toast', {
    detail: { id: String(Date.now()), title, message, type },
  })
  window.dispatchEvent(event)
}
