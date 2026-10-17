import { useEffect, useRef } from 'react'

export function useScrollBottom<T extends HTMLElement = HTMLDivElement>(dep: unknown) {
  const ref = useRef<T>(null)
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' })
  }, [dep])
  return ref
}
