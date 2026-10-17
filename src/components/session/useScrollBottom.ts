import { useEffect, useRef } from 'react'

type ScrollDependency = string | number | boolean | null | undefined

export function useScrollBottom<T extends HTMLElement = HTMLDivElement>(dep: ScrollDependency) {
  const ref = useRef<T>(null)
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' })
  }, [dep])
  return ref
}
