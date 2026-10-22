import assert from 'node:assert/strict'
import { test } from 'node:test'
import { addDays, sharedAcrossLanguages, type Article, type DayFeed } from './api.ts'

function article(partial: Partial<Article> & { title: string }): Article {
  return {
    qid: null,
    description: '',
    views: 0,
    rank: 0,
    history: [],
    thumb: null,
    url: `https://es.wikipedia.org/wiki/${partial.title}`,
    ...partial,
  }
}

function feed(lang: string, articles: Article[]): { lang: string; feed: DayFeed } {
  return { lang, feed: { date: '2026-10-21', articles } }
}

test('addDays cruza mes, año y 29 de febrero sin desfase de zona horaria', () => {
  assert.equal(addDays('2026-10-21', 1), '2026-10-22')
  assert.equal(addDays('2026-10-31', 1), '2026-11-01')
  assert.equal(addDays('2026-01-01', -1), '2025-12-31')
  assert.equal(addDays('2024-02-28', 1), '2024-02-29')
  assert.equal(addDays('2023-03-01', -1), '2023-02-28')
})

test('sharedAcrossLanguages no cruza nada con menos de dos idiomas', () => {
  const uno = [feed('es', [article({ title: 'Messi', qid: 'Q615' })])]
  assert.deepEqual(sharedAcrossLanguages(uno), [])
})

test('agrupa por QID aunque los títulos no coincidan entre idiomas', () => {
  const resultado = sharedAcrossLanguages([
    feed('es', [article({ title: 'Kim Jong-un', qid: 'Q56226', views: 100 })]),
    feed('en', [article({ title: 'Kim Jong Un', qid: 'Q56226', views: 300 })]),
  ])

  assert.equal(resultado.length, 1)
  assert.equal(resultado[0].qid, 'Q56226')
  assert.equal(resultado[0].totalViews, 400)
  assert.deepEqual(
    resultado[0].appearances.map((a) => a.title),
    ['Kim Jong-un', 'Kim Jong Un'],
  )
})

test('descarta lo que solo aparece en un idioma y lo que no trae QID', () => {
  const resultado = sharedAcrossLanguages([
    feed('es', [
      article({ title: 'Solo en español', qid: 'Q1' }),
      article({ title: 'Sin identificador', qid: null }),
      article({ title: 'Compartido', qid: 'Q2' }),
    ]),
    feed('en', [
      article({ title: 'Sin identificador', qid: null }),
      article({ title: 'Shared', qid: 'Q2' }),
    ]),
  ])

  assert.deepEqual(
    resultado.map((item) => item.qid),
    ['Q2'],
  )
})

test('ordena primero por número de idiomas y luego por lecturas totales', () => {
  const resultado = sharedAcrossLanguages([
    feed('es', [
      article({ title: 'En dos idiomas', qid: 'Q_dos', views: 10_000 }),
      article({ title: 'En tres idiomas', qid: 'Q_tres', views: 1 }),
    ]),
    feed('en', [
      article({ title: 'Two languages', qid: 'Q_dos', views: 10_000 }),
      article({ title: 'Three languages', qid: 'Q_tres', views: 1 }),
    ]),
    feed('fr', [article({ title: 'Trois langues', qid: 'Q_tres', views: 1 })]),
  ])

  assert.deepEqual(
    resultado.map((item) => item.qid),
    ['Q_tres', 'Q_dos'],
  )
})

test('la posición es el puesto en la lista, no el rank con huecos de la API', () => {
  // La API devuelve rank 4, 5, 8... porque descuenta la portada y las páginas
  // especiales. Al usuario hay que mostrarle 1, 2, 3.
  const resultado = sharedAcrossLanguages([
    feed('es', [
      article({ title: 'Primero', qid: 'Q_a', rank: 4 }),
      article({ title: 'Segundo', qid: 'Q_b', rank: 8 }),
    ]),
    feed('en', [
      article({ title: 'First', qid: 'Q_a', rank: 11 }),
      article({ title: 'Second', qid: 'Q_b', rank: 2 }),
    ]),
  ])

  const primero = resultado.find((item) => item.qid === 'Q_a')
  const segundo = resultado.find((item) => item.qid === 'Q_b')
  assert.deepEqual(
    primero?.appearances.map((a) => a.position),
    [1, 1],
  )
  assert.deepEqual(
    segundo?.appearances.map((a) => a.position),
    [2, 2],
  )
})
