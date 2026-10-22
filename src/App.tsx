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
import { ArticleRow, EmptyNotice, ErrorNotice, SharedRow, SkeletonList } from './components'

const TOP_LIMIT = 15
const THEME_KEY = 'wikipulso:tema'

/** Strings completos para que Tailwind los vea en el build. */
const GRID_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 lg:grid-cols-2',
  3: 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3',
  // Cuatro columnas solo a partir de 1536: por debajo cada una se queda
  // demasiado estrecha para el título y la cifra.
  4: 'grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4',
}

const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'
const FIELD = `border border-rule bg-paper px-2.5 py-1.5 text-sm text-ink ${FOCUS_RING}`
const LABEL = 'font-mono text-[11px] tracking-[0.12em] text-ink-muted uppercase'

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
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      // Modo incógnito o almacenamiento bloqueado: el tema vive solo en memoria.
    }
  }, [theme])

  return { theme, toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')) }
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

  const [langs, setLangs] = useState<string[]>(['es', 'en'])
  const [date, setDate] = useState(maxDate)
  const [query, setQuery] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [nonce, setNonce] = useState(0)

  const states = useFeeds(langs, date, nonce)

  const loadedFeeds = useMemo(
    () =>
      langs.flatMap((lang) => {
        const state = states[lang]
        return state?.status === 'ok' ? [{ lang, feed: state.feed }] : []
      }),
    [langs, states],
  )

  const shared = useMemo(() => {
    const all = sharedAcrossLanguages(loadedFeeds)
    if (!query) return all
    // El buscador filtra también aquí: si no, se queda enseñando resultados
    // que contradicen el filtro que el usuario acaba de escribir.
    const needle = query.toLowerCase()
    return all.filter(
      (item) =>
        item.description.toLowerCase().includes(needle) ||
        item.appearances.some((appearance) => appearance.title.toLowerCase().includes(needle)),
    )
  }, [loadedFeeds, query])

  function toggleLang(code: string) {
    setLangs((current) => {
      if (current.includes(code)) {
        // Nunca dejar la pantalla sin ningún idioma.
        return current.length === 1 ? current : current.filter((lang) => lang !== code)
      }
      if (current.length >= MAX_LANGUAGES) return current
      return [...current, code]
    })
  }

  function retry() {
    retryLanguages(langs, date)
    setNonce((current) => current + 1)
  }

  const atLanguageLimit = langs.length >= MAX_LANGUAGES

  return (
    <div className="min-h-[100dvh]">
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10">
        <header className="flex items-end justify-between gap-6 border-b-4 border-double border-ink pb-3">
          <div>
            <h1 className="text-3xl leading-[1.1] font-semibold tracking-[-0.02em] sm:text-4xl">
              Lo más leído en Wikipedia
            </h1>
            <p className={`mt-2 ${LABEL}`}>{formatLongDate(date)}</p>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            className={`shrink-0 border border-rule p-2 text-ink-muted transition-colors hover:bg-paper-sunk active:scale-[0.98] ${FOCUS_RING}`}
          >
            {theme === 'dark' ? (
              <SunIcon size={16} aria-hidden="true" />
            ) : (
              <MoonIcon size={16} aria-hidden="true" />
            )}
          </button>
        </header>

        <div className="mt-7 flex flex-col gap-5 border-b border-rule pb-6 lg:flex-row lg:items-start lg:gap-10">
          <div className="flex flex-col gap-2">
            <label htmlFor="fecha" className={LABEL}>
              Día del ranking
            </label>
            <input
              id="fecha"
              type="date"
              value={date}
              min={FIRST_RANKING_DATE}
              max={maxDate}
              onChange={(event) => setDate(event.target.value || maxDate)}
              className={`${FIELD} font-mono`}
            />
          </div>

          <fieldset className="flex min-w-0 flex-col gap-2">
            <legend className={`mb-2 ${LABEL}`}>Idiomas (máximo {MAX_LANGUAGES})</legend>
            {/* Cada idioma seleccionado se tiñe de su color, así que la fila de
                botones hace de leyenda de todo lo que viene debajo. */}
            <div className="flex flex-wrap gap-1.5">
              {LANGUAGES.map((language) => {
                const selected = langs.includes(language.code)
                const blocked = !selected && atLanguageLimit
                return (
                  <button
                    key={language.code}
                    type="button"
                    aria-pressed={selected}
                    disabled={blocked}
                    onClick={() => toggleLang(language.code)}
                    title={blocked ? `Quita un idioma para añadir ${language.label}` : undefined}
                    style={
                      selected
                        ? {
                            background: `var(--lang-${language.code})`,
                            borderColor: `var(--lang-${language.code})`,
                            color: 'var(--paper)',
                          }
                        : undefined
                    }
                    className={`border px-2.5 py-1 text-sm transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS_RING} ${
                      selected ? '' : 'border-rule text-ink-muted hover:bg-paper-sunk'
                    }`}
                  >
                    {language.label}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="flex flex-col gap-2 lg:ml-auto">
            <label htmlFor="buscar" className={LABEL}>
              Buscar en el ranking
            </label>
            <div className="relative">
              <MagnifyingGlassIcon
                size={15}
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-ink-faint"
              />
              <input
                id="buscar"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className={`${FIELD} w-full pl-8 lg:w-56`}
              />
            </div>
          </div>
        </div>

        {langs.length > 1 && shared.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold tracking-[-0.01em]">Coinciden en varios idiomas</h2>
            <p className="mt-1.5 max-w-[65ch] text-sm text-ink-muted">
              El mismo artículo en el top de lecturas de más de un idioma, cruzado por su ID de
              Wikidata.
            </p>
            <ul className="mt-5 grid gap-x-10 sm:grid-cols-2 2xl:grid-cols-3">
              {shared.slice(0, 6).map((item) => (
                <SharedRow key={item.qid} shared={item} preferredLangs={langs} />
              ))}
            </ul>
          </section>
        )}

        <section className={`mt-12 grid gap-x-10 gap-y-12 ${GRID_COLS[langs.length] ?? GRID_COLS[4]}`}>
          {langs.map((code) => {
            const language = LANGUAGES.find((item) => item.code === code)
            const state = states[code]
            const articles = state?.status === 'ok' ? state.feed.articles : []
            // La posición se fija antes de filtrar: buscar no debe renumerar el ranking.
            const ranked = articles.map((article, index) => ({ article, position: index + 1 }))
            const filtered = ranked.filter((entry) => matches(entry.article, query))
            const visible = showAll ? filtered : filtered.slice(0, TOP_LIMIT)
            const totalViews = articles.reduce((sum, article) => sum + article.views, 0)

            return (
              <section
                key={code}
                aria-labelledby={`idioma-${code}`}
                className="min-w-0"
                style={{ '--lang': `var(--lang-${code})` } as CSSProperties}
              >
                <div
                  className="flex items-baseline justify-between gap-3 border-b-2 pb-2"
                  style={{ borderColor: 'var(--lang)' }}
                >
                  <h2 id={`idioma-${code}`} className="font-semibold">
                    {language?.label ?? code}
                  </h2>
                  {state?.status === 'ok' && (
                    <p className="font-mono text-xs tabular-nums text-ink-muted">
                      {articles.length} artículos · {formatCompact(totalViews)} lecturas
                    </p>
                  )}
                </div>

                {(!state || state.status === 'loading') && <SkeletonList />}

                {state?.status === 'error' && (
                  <div className="mt-5">
                    <ErrorNotice message={state.message} onRetry={retry} />
                  </div>
                )}

                {state?.status === 'ok' &&
                  (visible.length > 0 ? (
                    <ol>
                      {visible.map(({ article, position }) => (
                        <ArticleRow
                          key={`${code}-${article.title}-${position}`}
                          article={article}
                          position={position}
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
            onClick={() => setShowAll((current) => !current)}
            className={`mt-10 border border-rule px-3 py-1.5 text-sm text-ink-muted transition-colors hover:bg-paper-sunk active:scale-[0.98] ${FOCUS_RING}`}
          >
            {showAll ? `Ver solo el top ${TOP_LIMIT}` : 'Ver el ranking completo'}
          </button>
        )}

        <footer className="mt-20 max-w-[65ch] border-t border-rule pt-6 text-xs text-ink-muted">
          <p>
            Datos de la{' '}
            <a
              href="https://api.wikimedia.org/wiki/Feed_API/Featured_content"
              target="_blank"
              rel="noreferrer"
              className={`text-ink underline decoration-rule hover:decoration-accent ${FOCUS_RING}`}
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
              className={`text-ink underline decoration-rule hover:decoration-accent ${FOCUS_RING}`}
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
