import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Page-level motion. Opt in with data attributes:
 *  data-hero      – children stagger in on load
 *  data-reveal    – fades up when scrolled into view (batched)
 *  data-parallax  – image drifts while its parent scrolls past
 *  data-count     – animated number counter
 */
export function usePageMotion(key: string) {
  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-hero]').forEach((el) => {
        if (el.children.length) {
          gsap.fromTo(
            el.children,
            { y: 28, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.08, delay: 0.05 },
          )
        }
      })
      gsap.utils.toArray<HTMLElement>('[data-hero-bg]').forEach((el) => {
        gsap.fromTo(el, { scale: 1.12 }, { scale: 1, duration: 1.6, ease: 'power2.out' })
        if (el.parentElement) {
          gsap.to(el, {
            yPercent: 12,
            ease: 'none',
            scrollTrigger: { trigger: el.parentElement, start: 'top top', end: 'bottom top', scrub: true },
          })
        }
      })
      const reveals = gsap.utils.toArray<HTMLElement>('[data-reveal]')
      if (reveals.length) {
        ScrollTrigger.batch(reveals, {
          start: 'top 88%',
          once: true,
          onEnter: (els) =>
            gsap.fromTo(
              els,
              { y: 40, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.08 },
            ),
        })
      }
      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
        if (el.parentElement) {
          gsap.fromTo(
            el,
            { yPercent: -8 },
            { yPercent: 8, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } },
          )
        }
      })
      gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
        const raw = el.dataset.count ?? '0'
        const end = parseFloat(raw.replace(',', '.'))
        const dec = raw.includes(',') ? 1 : 0
        const o = { v: 0 }
        gsap.to(o, {
          v: end,
          duration: 1.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          onUpdate: () => {
            el.textContent = o.v.toFixed(dec).replace('.', ',') + '%'
          },
        })
      })
    })
    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [key])
}
