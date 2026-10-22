import { useEffect, useMemo, useState } from 'react'
import { clearCache, fetchMostRead, type DayFeed } from './api'

export type FeedState =
  | { status: 'loading' }
  | { status: 'ok'; feed: DayFeed }
  | { status: 'error'; message: string }

type Results = { requestId: string; byLang: Record<string, FeedState> }

function withResult(
  previous: Results,
  requestId: string,
  lang: string,
  state: FeedState,
): Results {
  // Si el requestId cambió (otra fecha u otros idiomas), se tira lo anterior
  // en vez de acumularlo: así no se mezclan datos de dos consultas distintas.
  const byLang = previous.requestId === requestId ? { ...previous.byLang } : {}
  byLang[lang] = state
  return { requestId, byLang }
}

/**
 * Carga un idioma por petición, en paralelo, con el estado de cada uno por
 * separado: que falle el japonés no debería tumbar la columna del español.
 *
 * "Cargando" no se guarda en el estado, se deriva en render de la ausencia de
 * resultado para el requestId actual. Un idioma sin resultado está cargando.
 */
export function useFeeds(
  langs: string[],
  rankingDate: string,
  nonce = 0,
): Record<string, FeedState> {
  const key = langs.join(',')
  const requestId = `${key}|${rankingDate}|${nonce}`
  const [results, setResults] = useState<Results>({ requestId: '', byLang: {} })

  useEffect(() => {
    const codes = key ? key.split(',') : []
    let cancelled = false

    for (const lang of codes) {
      fetchMostRead(lang, rankingDate).then(
        (feed) => {
          if (!cancelled) setResults((prev) => withResult(prev, requestId, lang, { status: 'ok', feed }))
        },
        (error: unknown) => {
          if (cancelled) return
          const message =
            error instanceof Error ? error.message : 'Error inesperado al cargar los datos.'
          setResults((prev) => withResult(prev, requestId, lang, { status: 'error', message }))
        },
      )
    }

    return () => {
      cancelled = true
    }
  }, [requestId, key, rankingDate])

  // Identidad estable mientras no cambien los datos, para no invalidar los
  // useMemo de App en cada render.
  return useMemo(() => {
    const current = results.requestId === requestId ? results.byLang : {}
    const codes = key ? key.split(',') : []
    return Object.fromEntries(
      codes.map((lang) => [lang, current[lang] ?? ({ status: 'loading' } as FeedState)]),
    )
  }, [results, requestId, key])
}

export function retryLanguages(langs: string[], rankingDate: string): void {
  for (const lang of langs) clearCache(lang, rankingDate)
}
