import type { CSSProperties } from 'react'
import {
  ArrowClockwiseIcon,
  ArrowSquareOutIcon,
  MagnifyingGlassIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react'
import { formatViews, type Article, type HistoryPoint, type SharedArticle } from './api'

const RULE = 'border-b border-rule'
const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

/**
 * Serie de 5 días que ya viene en la respuesta. SVG a pelo: son 5 puntos.
 * Toma el color del idioma por `currentColor`, así que quien lo envuelve
 * decide de qué columna es. `row` escalona el dibujado por la lista.
 */
export function Sparkline({ history, row = 0 }: { history: HistoryPoint[]; row?: number }) {
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
      style={{ '--fila': row } as CSSProperties}
    >
      <polygon points={area} fill="currentColor" fillOpacity={0.12} />
      <polyline
        points={line}
        pathLength={1}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="trazo"
      />
      <circle cx={x(values.length - 1)} cy={y(last)} r="2.2" fill="currentColor" />
    </svg>
  )
}

/** 8 de cada 45 artículos vienen sin miniatura, así que el hueco es la norma. */
function Thumb({ src, title }: { src: string | null; title: string }) {
  if (!src) {
    return (
      <div
        aria-hidden="true"
        className="grid size-11 shrink-0 place-items-center border border-rule bg-paper-sunk text-sm text-ink-faint"
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
      className="size-11 shrink-0 border border-rule bg-paper-sunk object-cover"
    />
  )
}

function ExternalMark() {
  return (
    <ArrowSquareOutIcon
      size={13}
      aria-hidden="true"
      className="shrink-0 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
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
        className={`group grid grid-cols-[1.75rem_2.75rem_minmax(0,1fr)_auto] items-center gap-3 py-2.5 transition-colors hover:bg-paper-sunk ${RULE} ${FOCUS_RING}`}
      >
        <span className="text-right font-mono text-xs tabular-nums text-ink-faint">{position}</span>

        <Thumb src={article.thumb} title={article.title} />

        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="truncate font-medium">{article.title}</span>
            <ExternalMark />
          </span>
          {article.description && (
            <span className="block truncate text-xs text-ink-muted">{article.description}</span>
          )}
        </span>

        <span className="flex items-center gap-3">
          {/* El color sale de --lang, que fija la columna del idioma. */}
          <span className="hidden text-[var(--lang,var(--accent))] sm:block">
            <Sparkline history={article.history} row={position} />
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
        className={`group flex items-center gap-3 py-2.5 transition-colors hover:bg-paper-sunk ${RULE} ${FOCUS_RING}`}
      >
        <Thumb src={shared.thumb} title={primary.title} />

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate font-medium">{primary.title}</span>
            <ExternalMark />
          </span>
          {shared.description && (
            <span className="block truncate text-xs text-ink-muted">{shared.description}</span>
          )}
        </span>

        <span className="flex shrink-0 gap-1">
          {shared.appearances.map((appearance) => (
            <span
              key={appearance.lang}
              title={`Puesto ${appearance.position} en ${appearance.lang}`}
              style={{
                color: `var(--lang-${appearance.lang})`,
                background: 'color-mix(in oklab, currentColor 14%, transparent)',
              }}
              className="px-1.5 py-0.5 font-mono text-[11px] uppercase"
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
          className={`grid grid-cols-[1.75rem_2.75rem_minmax(0,1fr)_auto] items-center gap-3 py-2.5 ${RULE}`}
        >
          <span className="ml-auto block h-3 w-3 bg-paper-sunk" />
          <span className="size-11 bg-paper-sunk" />
          <span className="space-y-1.5">
            <span className="block h-3.5 w-2/5 bg-paper-sunk" />
            <span className="block h-2.5 w-3/5 bg-paper-sunk" />
          </span>
          <span className="block h-3.5 w-18 bg-paper-sunk" />
        </li>
      ))}
    </ul>
  )
}

export function ErrorNotice({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-start gap-3 border border-rule bg-paper-sunk p-4">
      <WarningCircleIcon size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
      <div className="min-w-0 space-y-2.5">
        <p className="text-sm text-ink">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className={`inline-flex items-center gap-1.5 bg-ink px-2.5 py-1.5 text-xs font-medium text-paper transition-transform active:scale-[0.98] ${FOCUS_RING}`}
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
      <MagnifyingGlassIcon size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-ink-faint" />
      <p className="text-sm text-ink-muted">
        Ningún artículo de este idioma contiene <span className="text-ink">{query}</span>. Prueba con
        otro término o borra el filtro.
      </p>
    </div>
  )
}
