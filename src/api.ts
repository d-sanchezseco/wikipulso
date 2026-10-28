/**
 * Cliente de la API "featured feed" de Wikimedia.
 *
 * Endpoint: GET /feed/v1/wikipedia/{idioma}/featured/{aaaa}/{mm}/{dd}
 * Sin clave, sin auth, CORS abierto. De toda la respuesta solo usamos
 * `mostread`, que es el ranking de artículos más leídos.
 *
 * Ojo con las fechas: el feed de un día publica el ranking del día ANTERIOR.
 * Aquí trabajamos siempre con la fecha del ranking (lo que ve el usuario) y
 * sumamos un día al consultar, para que la fecha de la UI no mienta.
 */

export type HistoryPoint = { date: string; views: number }

export type Article = {
  /** ID de Wikidata. Es lo que permite cruzar el mismo artículo entre idiomas. */
  qid: string | null
  title: string
  description: string
  views: number
  /**
   * Puesto que devuelve la API. Trae huecos (4, 5, 6, 8...) porque Wikipedia
   * descuenta la portada y las páginas especiales pero conserva su número.
   * Para mostrar al usuario se usa la posición en la lista, no esto.
   */
  rank: number
  history: HistoryPoint[]
  thumb: string | null
  url: string
  /**
   * Dirección e idioma del título, tal y como los declara la API. El árabe
   * llega en RTL y el japonés en su alfabeto: pintarlos sin esto es escribir
   * mal el nombre de alguien.
   */
  dir: "ltr" | "rtl"
  lang: string
}

export type DayFeed = { date: string; articles: Article[] }

export type Language = { code: string; label: string }

export const LANGUAGES: Language[] = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'Inglés' },
  { code: 'fr', label: 'Francés' },
  { code: 'de', label: 'Alemán' },
  { code: 'it', label: 'Italiano' },
  { code: 'pt', label: 'Portugués' },
  { code: 'ru', label: 'Ruso' },
  { code: 'ja', label: 'Japonés' },
  { code: 'zh', label: 'Chino' },
  { code: 'ar', label: 'Árabe' },
]

/** Más de cuatro columnas deja de leerse en cualquier pantalla. */
export const MAX_LANGUAGES = 4

/** El feed no tiene datos anteriores a esto. */
export const FIRST_RANKING_DATE = '2016-01-01'

const BASE = 'https://api.wikimedia.org/feed/v1/wikipedia'

export function toISODate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  date.setUTCDate(date.getUTCDate() + days)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

/** El ranking más reciente que existe es el de ayer. */
export function latestRankingDate(): string {
  return addDays(toISODate(new Date()), -1)
}

type RawArticle = {
  wikibase_item?: string
  normalizedtitle?: string
  titles?: { normalized?: string }
  title?: string
  description?: string
  views?: number
  rank?: number
  view_history?: { date?: string; views?: number }[]
  thumbnail?: { source?: string }
  content_urls?: { desktop?: { page?: string } }
  lang?: string
  dir?: string
}

function normalize(raw: RawArticle, lang: string): Article {
  const title = raw.normalizedtitle ?? raw.titles?.normalized ?? raw.title ?? 'Sin título'
  return {
    qid: raw.wikibase_item ?? null,
    title,
    description: raw.description ?? '',
    views: Number(raw.views) || 0,
    rank: Number(raw.rank) || 0,
    history: Array.isArray(raw.view_history)
      ? raw.view_history.map((point) => ({
          date: String(point.date ?? '').replace(/Z$/, ''),
          views: Number(point.views) || 0,
        }))
      : [],
    thumb: raw.thumbnail?.source ?? null,
    url:
      raw.content_urls?.desktop?.page ??
      `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(raw.title ?? title)}`,
    dir: raw.dir === "rtl" ? "rtl" : "ltr",
    lang: raw.lang ?? lang,
  }
}

async function load(lang: string, rankingDate: string): Promise<DayFeed> {
  const [year, month, day] = addDays(rankingDate, 1).split('-')

  let response: Response
  try {
    response = await fetch(`${BASE}/${lang}/featured/${year}/${month}/${day}`)
  } catch {
    throw new Error('No se pudo conectar con la API de Wikimedia. Revisa tu conexión.')
  }

  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? 'Wikipedia no publicó ranking de lecturas para este día.'
        : `La API de Wikimedia respondió ${response.status}.`,
    )
  }

  const payload: unknown = await response.json()
  const mostread = (payload as { mostread?: { articles?: RawArticle[] } }).mostread
  const articles = mostread?.articles

  if (!Array.isArray(articles) || articles.length === 0) {
    throw new Error('Este idioma no tiene ranking de lecturas para este día.')
  }

  return {
    date: rankingDate,
    articles: articles.map((raw) => normalize(raw, lang)).sort((a, b) => a.rank - b.rank),
  }
}

/**
 * Cachea por idioma + fecha. Volver a una fecha ya vista es instantáneo y no
 * vuelve a pegarle a la API. Los fallos se descartan del caché para que
 * "Reintentar" sirva de algo.
 */
const cache = new Map<string, Promise<DayFeed>>()

export function fetchMostRead(lang: string, rankingDate: string): Promise<DayFeed> {
  const key = `${lang}|${rankingDate}`
  const cached = cache.get(key)
  if (cached) return cached

  const pending = load(lang, rankingDate).catch((error: unknown) => {
    cache.delete(key)
    throw error
  })
  cache.set(key, pending)
  return pending
}

export function clearCache(lang: string, rankingDate: string): void {
  cache.delete(`${lang}|${rankingDate}`)
}

export type SharedArticle = {
  qid: string
  description: string
  thumb: string | null
  totalViews: number
  appearances: {
    lang: string
    title: string
    views: number
    position: number
    url: string
    dir: "ltr" | "rtl"
    titleLang: string
  }[]
}

/**
 * Agrupa por ID de Wikidata los artículos que están en el top de lecturas de
 * más de un idioma a la vez. Los títulos no coinciden entre idiomas
 * ("Kim Jong-un" / "Kim Jong Un"), el QID sí, y por eso el cruce funciona.
 */
export function sharedAcrossLanguages(feeds: { lang: string; feed: DayFeed }[]): SharedArticle[] {
  if (feeds.length < 2) return []

  const groups = new Map<string, SharedArticle>()

  for (const { lang, feed } of feeds) {
    feed.articles.forEach((article, index) => {
      if (!article.qid) return

      let group = groups.get(article.qid)
      if (!group) {
        group = {
          qid: article.qid,
          description: article.description,
          thumb: article.thumb,
          totalViews: 0,
          appearances: [],
        }
        groups.set(article.qid, group)
      }

      if (!group.thumb && article.thumb) group.thumb = article.thumb
      if (!group.description && article.description) group.description = article.description
      group.totalViews += article.views
      group.appearances.push({
        lang,
        title: article.title,
        views: article.views,
        position: index + 1,
        url: article.url,
        dir: article.dir,
        titleLang: article.lang,
      })
    })
  }

  return [...groups.values()]
    .filter((group) => group.appearances.length >= 2)
    .sort((a, b) => b.appearances.length - a.appearances.length || b.totalViews - a.totalViews)
}

const compactNumber = new Intl.NumberFormat('es-ES', { notation: 'compact', maximumFractionDigits: 1 })
const plainNumber = new Intl.NumberFormat('es-ES')

export const formatViews = (views: number) => plainNumber.format(views)
export const formatCompact = (views: number) => compactNumber.format(views)

export function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(Date.UTC(y, m - 1, d)))
}
