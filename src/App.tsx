import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { MagnifyingGlassIcon, MoonIcon, SunIcon } from '@phosphor-icons/react'
import {
  FIRST_RANKING_DATE,
  LANGUAGES,
  MAX_LANGUAGES,
  formatCompact,
  formatLongDate,
  latestRankingDate,
  sharedAcrossLanguages,
  type Article,
} from './api'
import { retryLanguages, useFeeds } from './useFeeds'
import { EmptyNotice, ErrorNotice, Interchange, SkeletonList, Station, Via } from './components'

const TOP_LIMIT = 15
const THEME_KEY = 'wikipulso:tema'

/** Strings completos para que Tailwind los vea en el build. */
const GRID_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 lg:grid-cols-2',
  3: 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3',
  // Cuatro en paralelo solo desde 1536: a 1280 cada columna cae a ~290px y el
  // título se queda en 'Yan …'. Por debajo van 2x2 y se avisa en pantalla.
  4: 'grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4',
}

const FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--line-en)]'
const FIELD = `border border-rule bg-enamel-raised px-3 py-2 text-sm text-porcelain ${FOCUS}`

function readStoredTheme(): 'light' | 'dark' | null {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    return stored === 'light' || stored === 'dark' ? stored : null
  } catch {
    return null
  }
}

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () =>
      readStoredTheme() ??
      (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'),
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      // Modo incógnito o almacenamiento bloqueado: el tema vive solo en memoria.
    }
  }, [theme])

  return { theme, toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }
}

/**
 * El día, las líneas y la búsqueda viven en la URL para poder compartir una
 * vista concreta. Lo que llega por query string es entrada no confiable: la
 * fecha se valida en formato y rango, y los códigos de idioma contra la lista.
 */
function readUrlState(maxDate: string) {
  const params = new URLSearchParams(window.location.search)

  const dia = params.get('dia') ?? ''
  const fechaValida =
    /^\d{4}-\d{2}-\d{2}$/.test(dia) && dia >= FIRST_RANKING_DATE && dia <= maxDate

  const lineas = (params.get('lineas') ?? '')
    .split(',')
    .filter((code) => LANGUAGES.some((l) => l.code === code))
    .filter((code, index, all) => all.indexOf(code) === index)
    .slice(0, MAX_LANGUAGES)

  return {
    date: fechaValida ? dia : maxDate,
    langs: lineas.length > 0 ? lineas : ['es', 'en'],
    query: (params.get('q') ?? '').slice(0, 80),
  }
}

function matches(article: Article, query: string): boolean {
  if (!query) return true
  const needle = query.toLowerCase()
  return (
    article.title.toLowerCase().includes(needle) ||
    article.description.toLowerCase().includes(needle)
  )
}

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const maxDate = latestRankingDate()

  const [inicial] = useState(() => readUrlState(maxDate))
  const [langs, setLangs] = useState<string[]>(inicial.langs)
  const [date, setDate] = useState(inicial.date)
  const [query, setQuery] = useState(inicial.query)
  const [showAll, setShowAll] = useState(false)
  const [nonce, setNonce] = useState(0)
  const [moreLines, setMoreLines] = useState(false)
  const [aviso, setAviso] = useState('')

  // replaceState y no pushState: escribir en el buscador no debe dejar
  // cincuenta entradas en el historial del navegador.
  useEffect(() => {
    const params = new URLSearchParams()
    if (date !== maxDate) params.set('dia', date)
    params.set('lineas', langs.join(','))
    if (query) params.set('q', query)
    const qs = params.toString()
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
  }, [date, langs, query, maxDate])

  const states = useFeeds(langs, date, nonce)

  const loadedFeeds = useMemo(
    () =>
      langs.flatMap((lang) => {
        const state = states[lang]
        return state?.status === 'ok' ? [{ lang, feed: state.feed }] : []
      }),
    [langs, states],
  )

  const allShared = useMemo(() => sharedAcrossLanguages(loadedFeeds), [loadedFeeds])

  /** Sin filtrar: marca qué paradas llevan anillo aunque el buscador recorte. */
  const interchangeQids = useMemo(
    () => new Set(allShared.map((item) => item.qid)),
    [allShared],
  )

  const shared = useMemo(() => {
    if (!query) return allShared
    const needle = query.toLowerCase()
    return allShared.filter(
      (item) =>
        item.description.toLowerCase().includes(needle) ||
        item.appearances.some((a) => a.title.toLowerCase().includes(needle)),
    )
  }, [allShared, query])

  const labelOf = (code: string) => LANGUAGES.find((l) => l.code === code)?.label ?? code

  function toggleLang(code: string) {
    if (langs.includes(code)) {
      // Nunca dejar la pantalla sin ninguna línea.
      if (langs.length === 1) return
      setLangs(langs.filter((l) => l !== code))
      setAviso('')
      return
    }
    if (langs.length >= MAX_LANGUAGES) {
      // Retirar una línea que el usuario estaba leyendo no puede ser silencioso.
      const retired = langs[0]
      setLangs([...langs.slice(1), code])
      setAviso(`Se ha retirado ${labelOf(retired)} para añadir ${labelOf(code)}.`)
      return
    }
    setLangs([...langs, code])
    setAviso('')
  }

  function retry() {
    retryLanguages(langs, date)
    setNonce((n) => n + 1)
  }

  return (
    <div className="min-h-[100dvh]">
      <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-10">
        <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-rule pb-4">
          <h1 className="text-2xl leading-none font-semibold tracking-[-0.015em] sm:text-[28px]">
            Lo más leído en Wikipedia
          </h1>
          <div className="flex items-center gap-5">
            <p className="sign">{formatLongDate(date)}</p>
              <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
              className={`shrink-0 border border-rule p-2.5 text-porcelain-dim transition-colors hover:bg-enamel-raised active:scale-[0.98] ${FOCUS}`}
            >
              {theme === 'dark' ? (
                <SunIcon size={16} aria-hidden="true" />
              ) : (
                <MoonIcon size={16} aria-hidden="true" />
              )}
            </button>
          </div>
        </header>

        <div className="mt-7 flex flex-col gap-5 border-b border-rule pb-6 lg:flex-row lg:items-start lg:gap-10">
          <div className="flex flex-col gap-2">
            <label htmlFor="fecha" className="sign">
              Día del ranking
            </label>
            <input
              id="fecha"
              type="date"
              value={date}
              min={FIRST_RANKING_DATE}
              max={maxDate}
              onChange={(e) => setDate(e.target.value || maxDate)}
              className={`${FIELD}`}
            />
          </div>

          <fieldset className="flex min-w-0 flex-col gap-2">
            <legend className="sign mb-2.5">Líneas (máximo {MAX_LANGUAGES})</legend>
            {/* En móvil solo se ven las líneas activas: diez píldoras en cuatro
                filas dejaban la primera parada fuera de la pantalla. */}
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((language) => {
                const selected = langs.includes(language.code)
                return (
                  <button
                    key={language.code}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleLang(language.code)}
                    className={`items-center gap-2 rounded-full border py-1.5 pr-3.5 pl-2.5 text-sm transition-colors active:scale-[0.98] ${FOCUS} ${
                      selected
                        ? 'flex border-transparent bg-enamel-raised text-porcelain'
                        : `border-rule text-porcelain-dim hover:bg-enamel-raised ${
                            moreLines ? 'flex' : 'hidden sm:flex'
                          }`
                    }`}
                    style={
                      selected
                        ? ({ borderColor: `var(--line-${language.code})` } as CSSProperties)
                        : undefined
                    }
                  >
                    <span
                      aria-hidden="true"
                      className="block size-2.5 rounded-full"
                      style={{
                        background: selected
                          ? `var(--line-${language.code})`
                          : 'var(--rule)',
                      }}
                    />
                    {language.label}
                  </button>
                )
              })}
            </div>
            <button
              type="button"
              aria-expanded={moreLines}
              onClick={() => setMoreLines((m) => !m)}
              className={`mt-1 self-start border border-rule px-3 py-1.5 text-sm text-porcelain-dim transition-colors hover:bg-enamel-raised active:scale-[0.98] sm:hidden ${FOCUS}`}
            >
              {moreLines ? 'Ocultar el resto' : 'Ver todas las líneas'}
            </button>
            {/* Retirar una línea que se estaba leyendo se anuncia, no se hace a la callada. */}
            <p aria-live="polite" className="sign min-h-4">{aviso}</p>
          </fieldset>

          <div className="flex flex-col gap-2 lg:ml-auto">
            <label htmlFor="buscar" className="sign">
              Buscar parada
            </label>
            <div className="relative">
              <MagnifyingGlassIcon
                size={15}
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-porcelain-faint"
              />
              <input
                id="buscar"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={`${FIELD} w-full pl-9 lg:w-60`}
              />
            </div>
          </div>
        </div>

        {/* La sección no desaparece cuando no hay cruces: la promesa del producto
            tiene que seguir visible, y "hoy no se repite ninguna" es información. */}
        {langs.length > 1 && (
          <section className="mt-12">
            <h2 className="text-lg font-semibold tracking-[-0.01em]">Transbordos</h2>
            <p className="mt-1.5 max-w-[68ch] text-sm text-porcelain-dim">
              El mismo artículo en el top de varias líneas a la vez. Cada anillo es la línea que lo
              comparte, y se cruzan por su ID de Wikidata, no por el título.
            </p>
            {shared.length > 0 ? (
              <ul className="mt-5 grid gap-x-10 sm:grid-cols-2 xl:grid-cols-3">
                {shared.slice(0, 6).map((item) => (
                  <Interchange key={item.qid} shared={item} preferredLangs={langs} />
                ))}
              </ul>
            ) : (
              loadedFeeds.length === langs.length && (
                <p className="mt-5 border-t border-rule pt-5 text-sm text-porcelain-dim">
                  {query
                    ? `Ningún transbordo contiene ${query}.`
                    : 'Hoy ninguna parada se repite entre estas líneas. Añade otra línea o prueba con otro día.'}
                </p>
              )
            )}
          </section>
        )}

        {langs.length === 4 && (
          <p className="sign mt-12 -mb-6 2xl:hidden">
            Con cuatro líneas, las dos últimas continúan debajo
          </p>
        )}

        <section className={`mt-12 grid gap-x-10 gap-y-12 ${GRID_COLS[langs.length] ?? GRID_COLS[4]}`}>
          {langs.map((code) => {
            const language = LANGUAGES.find((l) => l.code === code)
            const state = states[code]
            const articles = state?.status === 'ok' ? state.feed.articles : []
            const ranked = articles.map((article, index) => ({ article, position: index + 1 }))
            const filtered = ranked.filter((entry) => matches(entry.article, query))
            const visible = showAll ? filtered : filtered.slice(0, TOP_LIMIT)
            const totalViews = articles.reduce((sum, a) => sum + a.views, 0)

            return (
              <section
                key={code}
                aria-labelledby={`linea-${code}`}
                className="min-w-0"
                style={{ '--lane': `var(--line-${code})` } as CSSProperties}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2 id={`linea-${code}`} className="font-semibold">
                    {language?.label ?? code}
                  </h2>
                  {state?.status === 'ok' && (
                    <p className="sign tabular-nums">
                      {articles.length} paradas · {formatCompact(totalViews)} lecturas
                    </p>
                  )}
                </div>
                <div
                  aria-hidden="true"
                  className="mt-2 mb-1 h-1.5"
                  style={{ background: 'var(--lane)' }}
                />

                {(!state || state.status === 'loading') && <SkeletonList />}

                {state?.status === 'error' && (
                  <div className="mt-5">
                    <ErrorNotice message={state.message} onRetry={retry} />
                  </div>
                )}

                {state?.status === 'ok' &&
                  (visible.length > 0 ? (
                    <ol className="relative">
                      <Via />
                      {visible.map(({ article, position }) => (
                        <Station
                          key={`${code}-${article.title}-${position}`}
                          article={article}
                          position={position}
                          interchange={article.qid !== null && interchangeQids.has(article.qid)}
                        />
                      ))}
                    </ol>
                  ) : (
                    <EmptyNotice query={query} />
                  ))}
              </section>
            )
          })}
        </section>

        {loadedFeeds.length > 0 && (
          <button
            type="button"
            onClick={() => setShowAll((s) => !s)}
            className={`sign mt-10 border border-rule px-4 py-2.5 transition-colors hover:bg-enamel-raised active:scale-[0.98] ${FOCUS}`}
          >
            {showAll ? `Ver solo las primeras ${TOP_LIMIT}` : 'Ver la línea completa'}
          </button>
        )}

        <footer className="mt-20 max-w-[68ch] border-t border-rule pt-6 text-xs text-porcelain-dim">
          <p>
            Datos de la{' '}
            <a
              href="https://api.wikimedia.org/wiki/Feed_API/Featured_content"
              target="_blank"
              rel="noreferrer"
              className={`text-porcelain underline decoration-rule hover:decoration-current ${FOCUS}`}
            >
              Feed API de Wikimedia
            </a>
            . Las cifras son lecturas de página del día indicado, no visitantes únicos.
          </p>
          <p className="mt-2">
            El feed publica el ranking del día anterior, así que el día más reciente que puedes
            consultar es ayer. Código en{' '}
            <a
              href="https://github.com/d-sanchezseco/wikipulso"
              target="_blank"
              rel="noreferrer"
              className={`text-porcelain underline decoration-rule hover:decoration-current ${FOCUS}`}
            >
              GitHub
            </a>
            .
          </p>
        </footer>
      </div>
    </div>
  )
}
