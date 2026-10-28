import {
  ArrowClockwiseIcon,
  ArrowSquareOutIcon,
  MagnifyingGlassIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react'
import { formatViews, type Article, type HistoryPoint, type SharedArticle } from './api'

const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lane,var(--line-en))]'

/** La tinta de la columna. La fija la sección del idioma en --lane. */
const LANE = 'var(--lane, var(--line-en))'

/**
 * La evolución de 5 días ya no se dibuja: el minigráfico por fila era el patrón
 * de dashboard que delataba la plantilla, y se comía el ancho del título. El
 * dato no se pierde, viaja en el nombre accesible de la parada.
 */
function tendencia(history: HistoryPoint[]): string {
  if (history.length < 2) return ''
  const first = history[0].views
  const last = history[history.length - 1].views
  if (first === 0) return ''
  const delta = Math.round(((last - first) / first) * 100)
  if (Math.abs(delta) < 1) return 'Estable en los últimos 5 días.'
  return `${delta > 0 ? 'Sube' : 'Baja'} un ${Math.abs(delta)} por ciento en 5 días.`
}

/** Parada normal: la marca perpendicular de la señalética. */
function Tick() {
  return <span aria-hidden="true" className="block h-[3px] w-[13px] bg-porcelain" />
}

/** Transbordo: el anillo. Solo lo llevan los artículos que comparten varias líneas. */
function Ring({ ink = 'var(--porcelain)' }: { ink?: string }) {
  return (
    <span
      aria-hidden="true"
      className="block size-[15px] rounded-full border-[3px] bg-enamel"
      style={{ borderColor: ink }}
    />
  )
}

function Thumb({ src, title }: { src: string | null; title: string }) {
  if (!src) {
    return (
      <div
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center border border-rule bg-enamel-raised text-sm text-porcelain-faint"
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
      width={40}
      height={40}
      className="size-10 shrink-0 border border-rule bg-enamel-raised object-cover"
    />
  )
}

function OpenMark() {
  return (
    <ArrowSquareOutIcon
      size={13}
      aria-hidden="true"
      className="shrink-0 text-porcelain-faint opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
    />
  )
}

/** Un artículo es una parada sobre la línea de su idioma. */
export function Station({
  article,
  position,
  interchange,
}: {
  article: Article
  position: number
  interchange: boolean
}) {
  return (
    <li>
      <a
        href={article.url}
        target="_blank"
        rel="noreferrer"
        aria-label={[
          `${position}. ${article.title}`,
          article.description,
          `${formatViews(article.views)} lecturas`,
          interchange ? 'Transbordo: también en el top de otra línea' : '',
          tendencia(article.history),
        ]
          .filter(Boolean)
          .join('. ')}
        className={`group grid grid-cols-[1.5rem_24px_2.5rem_minmax(0,1fr)_auto] items-center gap-3 py-2.5 transition-colors hover:bg-enamel-raised ${FOCUS}`}
      >
        <span className="text-right text-xs tabular-nums text-porcelain-faint">
          {position}
        </span>

        <span className="flex justify-center">{interchange ? <Ring /> : <Tick />}</span>

        <Thumb src={article.thumb} title={article.title} />

        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span dir={article.dir} lang={article.lang} className="truncate font-medium">
              {article.title}
            </span>
            <OpenMark />
          </span>
          {article.description && (
            <span
              dir={article.dir}
              lang={article.lang}
              className="block truncate text-xs text-porcelain-dim"
            >
              {article.description}
            </span>
          )}
        </span>

        <span className="w-16 text-right text-sm tabular-nums">{formatViews(article.views)}</span>
      </a>
    </li>
  )
}

/** La línea continua que recorre la columna entera por detrás de las paradas. */
export function Via() {
  return (
    <span
      aria-hidden="true"
      className="via absolute top-3 bottom-3 left-12 w-[3px] -translate-x-1/2"
      style={{ background: LANE }}
    />
  )
}

/** Transbordo en la sección de cruces: un anillo por cada línea que lo comparte. */
export function Interchange({
  shared,
  preferredLangs,
}: {
  shared: SharedArticle
  preferredLangs: string[]
}) {
  const primary =
    preferredLangs
      .map((lang) => shared.appearances.find((a) => a.lang === lang))
      .find(Boolean) ?? shared.appearances[0]

  return (
    <li>
      <a
        href={primary.url}
        target="_blank"
        rel="noreferrer"
        className={`group flex items-center gap-3 border-b border-rule py-2.5 transition-colors hover:bg-enamel-raised ${FOCUS}`}
      >
        <span className="flex shrink-0 items-center pr-1">
          {shared.appearances.map((a, index) => (
            <span key={a.lang} style={{ marginLeft: index === 0 ? 0 : -7 }}>
              <Ring ink={`var(--line-${a.lang})`} />
            </span>
          ))}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span dir={primary.dir} lang={primary.titleLang} className="truncate font-medium">
              {primary.title}
            </span>
            <OpenMark />
          </span>
          {shared.description && (
            <span className="block truncate text-xs text-porcelain-dim">{shared.description}</span>
          )}
        </span>

        <span className="shrink-0 text-sm tabular-nums text-porcelain-dim">
          {formatViews(shared.totalViews)}
        </span>
      </a>
    </li>
  )
}

export function SkeletonList({ rows = 8 }: { rows?: number }) {
  return (
    <ul aria-hidden="true" className="relative animate-pulse">
      <span className="absolute top-3 bottom-3 left-12 w-[3px] -translate-x-1/2 bg-rule" />
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="grid grid-cols-[1.5rem_24px_2.5rem_minmax(0,1fr)_auto] items-center gap-3 py-2.5">
          <span className="ml-auto block h-2.5 w-3 bg-enamel-raised" />
          <span className="mx-auto block h-[3px] w-[13px] bg-rule" />
          <span className="size-10 bg-enamel-raised" />
          <span className="space-y-1.5">
            <span className="block h-3.5 w-2/5 bg-enamel-raised" />
            <span className="block h-2.5 w-3/5 bg-enamel-raised" />
          </span>
          <span className="block h-3.5 w-16 bg-enamel-raised" />
        </li>
      ))}
    </ul>
  )
}

export function ErrorNotice({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-start gap-3 border border-rule bg-enamel-raised p-4">
      <WarningCircleIcon
        size={18}
        aria-hidden="true"
        className="mt-0.5 shrink-0"
        style={{ color: 'var(--line-es)' }}
      />
      <div className="min-w-0 space-y-3">
        <p className="text-sm">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className={`sign inline-flex items-center gap-1.5 px-3 py-2 !text-porcelain transition-transform active:scale-[0.98] ${FOCUS}`}
          style={{ background: 'var(--line-es)' }}
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
      <MagnifyingGlassIcon
        size={18}
        aria-hidden="true"
        className="mt-0.5 shrink-0 text-porcelain-faint"
      />
      <p className="text-sm text-porcelain-dim">
        Ninguna parada de esta línea contiene{' '}
        <span className="text-porcelain">{query}</span>. Prueba con otro término o borra el filtro.
      </p>
    </div>
  )
}
