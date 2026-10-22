import {
  ArrowClockwiseIcon,
  ArrowSquareOutIcon,
  MagnifyingGlassIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react'
import { formatViews, type Article, type HistoryPoint, type SharedArticle } from './api'

const ROW_BORDER = 'border-b border-zinc-200/80 dark:border-zinc-800/80'
const FOCUS_RING =
  'rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

/** Serie de 5 días que ya viene en la respuesta. SVG a pelo: son 5 puntos. */
export function Sparkline({ history }: { history: HistoryPoint[] }) {
  if (history.length < 2) return null

  const values = history.map((point) => point.views)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const width = 76
  const height = 26
  const pad = 3

  const x = (index: number) => pad + (index * (width - pad * 2)) / (values.length - 1)
  const y = (value: number) => height - pad - ((value - min) / span) * (height - pad * 2)

  const line = values.map((value, index) => `${x(index).toFixed(1)},${y(value).toFixed(1)}`).join(' ')
  const area = `${x(0).toFixed(1)},${height} ${line} ${x(values.length - 1).toFixed(1)},${height}`

  const first = values[0]
  const last = values[values.length - 1]
  const delta = first === 0 ? null : Math.round(((last - first) / first) * 100)
  const label =
    delta === null
      ? `Evolución de los últimos ${values.length} días.`
      : `Evolución de los últimos ${values.length} días: ${
          delta >= 0 ? 'sube' : 'baja'
        } un ${Math.abs(delta)} por ciento.`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
      className="shrink-0"
    >
      <polygon points={area} className="fill-accent/15" />
      <polyline
        points={line}
        fill="none"
        className="stroke-accent"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={x(values.length - 1)} cy={y(last)} r="2.2" className="fill-accent" />
    </svg>
  )
}

/** 8 de cada 45 artículos vienen sin miniatura, así que el hueco es la norma. */
function Thumb({ src, title }: { src: string | null; title: string }) {
  if (!src) {
    return (
      <div
        aria-hidden="true"
        className="grid size-11 shrink-0 place-items-center rounded-md bg-zinc-200 font-mono text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
      >
        {title.slice(0, 1).toUpperCase()}
      </div>
    )
  }
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      width={44}
      height={44}
      className="size-11 shrink-0 rounded-md bg-zinc-200 object-cover dark:bg-zinc-800"
    />
  )
}

export function ArticleRow({ article, position }: { article: Article; position: number }) {
  return (
    <li>
      <a
        href={article.url}
        target="_blank"
        rel="noreferrer"
        className={`group grid grid-cols-[1.75rem_2.75rem_minmax(0,1fr)_auto] items-center gap-3 py-2.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 ${ROW_BORDER} ${FOCUS_RING}`}
      >
        <span className="font-mono text-xs tabular-nums text-zinc-400 dark:text-zinc-600">
          {position}
        </span>

        <Thumb src={article.thumb} title={article.title} />

        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="truncate font-medium">{article.title}</span>
            <ArrowSquareOutIcon
              size={13}
              aria-hidden="true"
              className="shrink-0 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
            />
          </span>
          {article.description && (
            <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">
              {article.description}
            </span>
          )}
        </span>

        <span className="flex items-center gap-3">
          <span className="hidden sm:block">
            <Sparkline history={article.history} />
          </span>
          <span className="w-18 text-right font-mono text-sm tabular-nums">
            {formatViews(article.views)}
          </span>
        </span>
      </a>
    </li>
  )
}

export function SharedRow({
  shared,
  preferredLangs,
}: {
  shared: SharedArticle
  preferredLangs: string[]
}) {
  // El título se muestra en el primer idioma que el usuario tenga seleccionado.
  const primary =
    preferredLangs
      .map((lang) => shared.appearances.find((appearance) => appearance.lang === lang))
      .find(Boolean) ?? shared.appearances[0]

  return (
    <li>
      <a
        href={primary.url}
        target="_blank"
        rel="noreferrer"
        className={`group flex items-center gap-3 py-2.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900 ${ROW_BORDER} ${FOCUS_RING}`}
      >
        <Thumb src={shared.thumb} title={primary.title} />

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate font-medium">{primary.title}</span>
            <ArrowSquareOutIcon
              size={13}
              aria-hidden="true"
              className="shrink-0 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
            />
          </span>
          {shared.description && (
            <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">
              {shared.description}
            </span>
          )}
        </span>

        <span className="flex shrink-0 gap-1">
          {shared.appearances.map((appearance) => (
            <span
              key={appearance.lang}
              title={`Puesto ${appearance.position} en ${appearance.lang}`}
              className="rounded-sm bg-accent/15 px-1.5 py-0.5 font-mono text-[11px] uppercase text-accent"
            >
              {appearance.lang}
            </span>
          ))}
        </span>
      </a>
    </li>
  )
}

/** Mismo esqueleto que ArticleRow, para que no salte el layout al cargar. */
export function SkeletonList({ rows = 8 }: { rows?: number }) {
  return (
    <ul aria-hidden="true" className="animate-pulse">
      {Array.from({ length: rows }, (_, index) => (
        <li
          key={index}
          className={`grid grid-cols-[1.75rem_2.75rem_minmax(0,1fr)_auto] items-center gap-3 py-2.5 ${ROW_BORDER}`}
        >
          <span className="h-3 w-3 rounded-sm bg-zinc-200 dark:bg-zinc-800" />
          <span className="size-11 rounded-md bg-zinc-200 dark:bg-zinc-800" />
          <span className="space-y-1.5">
            <span className="block h-3.5 w-2/5 rounded-sm bg-zinc-200 dark:bg-zinc-800" />
            <span className="block h-2.5 w-3/5 rounded-sm bg-zinc-200/70 dark:bg-zinc-800/70" />
          </span>
          <span className="h-3.5 w-18 rounded-sm bg-zinc-200 dark:bg-zinc-800" />
        </li>
      ))}
    </ul>
  )
}

export function ErrorNotice({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-zinc-200 bg-zinc-100/60 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
      <WarningCircleIcon size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
      <div className="min-w-0 space-y-2">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className={`inline-flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-50 transition-transform active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900 ${FOCUS_RING}`}
        >
          <ArrowClockwiseIcon size={13} aria-hidden="true" />
          Reintentar
        </button>
      </div>
    </div>
  )
}

export function EmptyNotice({ query }: { query: string }) {
  return (
    <div className="flex items-start gap-3 py-6">
      <MagnifyingGlassIcon size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-zinc-400" />
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Ningún artículo de este idioma contiene <span className="font-medium">{query}</span>. Prueba
        con otro término o borra el filtro.
      </p>
    </div>
  )
}
