import { Link } from 'react-router-dom'

type BreadcrumbItem = {
  label: string
  to?: string
}

type BreadcrumbProps = {
  items: readonly BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
      {items.map((item, index) => (
        <span key={`${item.label}-${item.to ?? index}`} className="flex items-center gap-x-2">
          {item.to ? <Link to={item.to} className="transition hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">{item.label}</Link> : <span className="font-medium text-ink">{item.label}</span>}
          {index < items.length - 1 && <span aria-hidden="true">/</span>}
        </span>
      ))}
    </nav>
  )
}
