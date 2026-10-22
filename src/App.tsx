import { useEffect, useMemo, useState } from 'react'
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

const FOCUS_RING =
  'rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

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
    <div className="min-h-[100dvh] bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-10">
        <header className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Lo más leído en Wikipedia
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-zinc-500 dark:text-zinc-400">
              Ranking de lecturas del {formatLongDate(date)}, comparado entre idiomas.
            </p>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            className={`shrink-0 border border-zinc-300 p-2 text-zinc-600 transition-colors hover:bg-zinc-100 active:scale-[0.98] dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900 ${FOCUS_RING}`}
          >
            {theme === 'dark' ? (
              <SunIcon size={16} aria-hidden="true" />
            ) : (
              <MoonIcon size={16} aria-hidden="true" />
            )}
          </button>
        </header>

        <div className="mt-8 flex flex-col gap-5 border-y border-zinc-200 py-5 lg:flex-row lg:items-start lg:gap-10 dark:border-zinc-800">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="fecha"
              className="text-xs font-medium text-zinc-500 dark:text-zinc-400"
            >
              Día del ranking
            </label>
            <input
              id="fecha"
              type="date"
              value={date}
              min={FIRST_RANKING_DATE}
              max={maxDate}
              onChange={(event) => setDate(event.target.value || maxDate)}
              className={`border border-zinc-300 bg-white px-2.5 py-1.5 font-mono text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 ${FOCUS_RING}`}
            />
          </div>

          <fieldset className="flex min-w-0 flex-col gap-2">
            <legend className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Idiomas (máximo {MAX_LANGUAGES})
            </legend>
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
                    className={`border px-2.5 py-1 text-sm transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS_RING} ${
                      selected
                        ? 'border-zinc-900 bg-zinc-900 text-zinc-50 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                        : 'border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900'
                    }`}
                  >
                    {language.label}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div className="flex flex-col gap-2 lg:ml-auto">
            <label
              htmlFor="buscar"
              className="text-xs font-medium text-zinc-500 dark:text-zinc-400"
            >
              Buscar en el ranking
            </label>
            <div className="relative">
              <MagnifyingGlassIcon
                size={15}
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-zinc-400"
              />
              <input
                id="buscar"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className={`w-full border border-zinc-300 bg-white py-1.5 pr-2.5 pl-8 text-sm text-zinc-900 lg:w-56 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 ${FOCUS_RING}`}
              />
            </div>
          </div>
        </div>

        {langs.length > 1 && shared.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold tracking-tight">Coinciden en varios idiomas</h2>
            <p className="mt-1 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
              El mismo artículo en el top de lecturas de más de un idioma, cruzado por su ID de
              Wikidata.
            </p>
            <ul className="mt-4 grid gap-x-10 sm:grid-cols-2 2xl:grid-cols-3">
              {shared.slice(0, 6).map((item) => (
                <SharedRow key={item.qid} shared={item} preferredLangs={langs} />
              ))}
            </ul>
          </section>
        )}

        <section className={`mt-10 grid gap-x-10 gap-y-10 ${GRID_COLS[langs.length] ?? GRID_COLS[4]}`}>
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
              <section key={code} aria-labelledby={`idioma-${code}`} className="min-w-0">
                <div className="flex items-baseline justify-between gap-3 border-b-2 border-zinc-900 pb-2 dark:border-zinc-100">
                  <h2 id={`idioma-${code}`} className="font-semibold tracking-tight">
                    {language?.label ?? code}
                  </h2>
                  {state?.status === 'ok' && (
                    <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                      {articles.length} artículos · {formatCompact(totalViews)} lecturas
                    </p>
                  )}
                </div>

                {(!state || state.status === 'loading') && <SkeletonList />}

                {state?.status === 'error' && (
                  <div className="mt-4">
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
            className={`mt-8 border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 active:scale-[0.98] dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900 ${FOCUS_RING}`}
          >
            {showAll ? `Ver solo el top ${TOP_LIMIT}` : 'Ver el ranking completo'}
          </button>
        )}

        <footer className="mt-16 border-t border-zinc-200 pt-6 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <p>
            Datos de la{' '}
            <a
              href="https://api.wikimedia.org/wiki/Feed_API/Featured_content"
              target="_blank"
              rel="noreferrer"
              className={`underline underline-offset-2 hover:text-accent ${FOCUS_RING}`}
            >
              Feed API de Wikimedia
            </a>
            . Las cifras son lecturas de página del día indicado, no visitantes únicos.
          </p>
          <p className="mt-1.5">
            El feed publica el ranking del día anterior, así que el día más reciente que puedes
            consultar es ayer. Código en{' '}
            <a
              href="https://github.com/d-sanchezseco/wikipulso"
              target="_blank"
              rel="noreferrer"
              className={`underline underline-offset-2 hover:text-accent ${FOCUS_RING}`}
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
