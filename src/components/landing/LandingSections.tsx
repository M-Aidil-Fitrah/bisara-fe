import { Button, Eyebrow } from '../ui'

type StoryProps = {
  image: string
  alt: string
  eyebrow: string
  title: string
  body: string
  callToAction: string
  onClick: () => void
  flip?: boolean
}

export function LandingStory({ image, alt, eyebrow, title, body, callToAction, onClick, flip }: StoryProps) {
  return (
    <div className="relative grid items-center md:grid-cols-12">
      <div data-reveal className={`aspect-[4/3] w-full overflow-hidden rounded-lg md:col-span-7 md:row-start-1 ${flip ? 'md:col-start-6' : 'md:col-start-1'}`}>
        <img src={image} alt={alt} data-parallax className="size-full scale-[1.18] object-cover" />
      </div>
      <div data-reveal className={`relative -mt-16 mx-4 rounded-lg bg-ink p-8 text-paper md:mx-0 md:mt-0 md:row-start-1 md:col-span-6 md:p-10 ${flip ? 'md:col-start-1 md:translate-y-16' : 'md:col-start-7 md:-translate-y-12'}`}>
        <Eyebrow light>{eyebrow}</Eyebrow>
        <h3 className="mt-4 text-3xl font-normal leading-[1.1] tracking-tight sm:text-4xl">{title}</h3>
        <p className="mt-5 leading-relaxed text-paper/75">{body}</p>
        <Button variant="light" arrow className="mt-8" onClick={onClick}>{callToAction}</Button>
      </div>
    </div>
  )
}

type ScopeListProps = {
  title: string
  items: string[]
  muted?: boolean
}

export function ScopeList({ title, items, muted }: ScopeListProps) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-3 divide-y divide-line border-t border-line text-sm">
        {items.map((item) => <li key={item} className={`py-2.5 ${muted ? 'text-muted line-through decoration-line' : ''}`}>{item}</li>)}
      </ul>
    </div>
  )
}
