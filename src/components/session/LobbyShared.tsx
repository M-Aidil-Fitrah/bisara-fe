import React from 'react'
import type { SessionRecord } from '../../types'
import { level } from '../../lib/history'

export function LobbyHero({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className="bg-ink pb-14 pt-32 text-paper">
      <div data-hero className="mx-auto max-w-6xl px-6">
        <p className="text-xs uppercase tracking-[0.14em] text-brand-soft">{eyebrow}</p>
        <h1 className="mt-4 text-5xl font-normal tracking-tight sm:text-6xl">{title}</h1>
        <p className="mt-4 max-w-xl text-paper/70">{desc}</p>
      </div>
    </div>
  )
}

export function LobbyLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs uppercase tracking-[0.14em] text-brand">{children}</p>
}

export function ScoreTag({ h }: { h: SessionRecord }) {
  if (h.score === null) return <span className="text-xs text-muted">Dibatalkan</span>
  const l = level(h.score)
  return (
    <span
      className={`justify-self-end rounded-md px-2 py-1 text-xs ${
        l === 'Tinggi' ? 'bg-ink text-paper' : l === 'Sedang' ? 'bg-brand text-white' : 'bg-brand-tint text-brand'
      }`}
    >
      {h.score} · {l}
    </span>
  )
}
