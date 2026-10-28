/**
 * Genera la imagen social a partir de og-source.html.
 * Se regenera con `pnpm og`; no es una captura pegada a mano.
 *
 * Necesita un Chromium de Playwright una sola vez:
 *   pnpm dlx playwright@1.56.0 install chromium
 */
import { chromium } from 'playwright-core'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const raiz = fileURLToPath(new URL('..', import.meta.url))
const fuente = await readFile(new URL('../og-source.html', import.meta.url), 'utf8')

// Servidor efímero: el HTML carga una fuente web y file:// la bloquea.
const server = createServer((_req, res) => {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
  res.end(fuente)
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const { port } = server.address()

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 })
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: `${raiz}public/og.jpg`, type: 'jpeg', quality: 92 })

await browser.close()
server.close()
console.log('public/og.jpg generado a 2400x1260')
