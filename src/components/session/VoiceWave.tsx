export interface VoiceWaveProps {
  active: boolean
  seed: number
}

export default function VoiceWave({ active, seed }: VoiceWaveProps) {
  return (
    <div className="flex h-7 flex-1 items-center gap-[3px]">
      {Array.from({ length: 28 }).map((_, i) => {
        const h = 25 + ((i * 37 + seed * 13) % 75)
        return (
          <span
            key={i}
            className={`w-[3px] rounded-full ${active ? 'bg-brand' : 'bg-ink/30'}`}
            style={{
              height: `${h}%`,
              animation: active ? `wave ${0.5 + (i % 5) * 0.12}s ease-in-out infinite` : undefined,
            }}
          />
        )
      })}
    </div>
  )
}
