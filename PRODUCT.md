# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Dos audiencias reales, confirmadas por el origen del proyecto:

- **Quien revisa un portfolio** (reclutador, lead técnico). Abre el enlace, mira
  poco tiempo y decide si quien lo hizo sabe lo que hace.
- **Quien mira los datos** por curiosidad genuina: qué se está leyendo hoy en
  Wikipedia y en qué se parecen o diferencian los idiomas.

*Sin confirmar:* cuál de las dos manda cuando entran en conflicto. Hasta que el
usuario lo decida, se asume que la pantalla debe aguantar uso real y además
tener voz propia, sin sacrificar ninguna de las dos.

## Product Purpose

Mostrar el ranking diario de artículos más leídos de Wikipedia, por idioma, y
destacar qué artículos están arriba en varios idiomas a la vez.

Éxito: que el cruce entre idiomas se entienda sin que nadie lo explique, y que
la pantalla se recuerde como una decisión de diseño, no como una plantilla.

## Positioning

El cruce entre idiomas se hace por `wikibase_item`, el ID de Wikidata, no por
título. Los títulos no coinciden entre wikis (`Kim Jong-un` / `Kim Jong Un`, y
en japonés no se parecen), así que cruzar por texto no funciona. Es el
mecanismo que un proyecto vecino no puede copiar sin haber encontrado antes ese
campo en la respuesta.

## Operating Context

- Navegador, sin backend. La Feed API de Wikimedia no pide clave y sirve CORS
  abierto, así que el cliente la llama directamente.
- El feed de un día publica el ranking del **día anterior**. El día más reciente
  consultable es ayer. Internamente se pide la fecha siguiente a la que elige el
  usuario para que la fecha de pantalla no mienta.
- El campo `rank` de la API trae huecos (4, 5, 6, 8... hasta 50 para 45
  artículos) porque Wikipedia descuenta la portada y las páginas especiales
  conservando el número original. La interfaz numera por posición en la lista.
- Cada idioma devuelve entre 40 y 48 artículos por día. Todos traen descripción
  y 5 días de histórico de lecturas; alrededor del 82% traen miniatura.

## Capabilities and Constraints

- Hasta 4 idiomas en paralelo, de 10 disponibles (es, en, fr, de, it, pt, ru,
  ja, zh, ar). El tope de 4 es una decisión de legibilidad, no de la API.
- Cualquier fecha desde 2016. Antes de eso la API devuelve 404.
- Buscador sobre el ranking, tema claro y oscuro, caché en cliente por idioma y
  fecha.
- Las cifras son lecturas de página, no visitantes únicos. No deben presentarse
  como otra cosa.
- Sin servidor, sin claves, sin almacenamiento: todo lo que no esté en la API no
  existe para este producto.

## Brand Commitments

- Nombre del repositorio: `wikipulso`. Título en pantalla: "Lo más leído en
  Wikipedia".
- Interfaz en español (decisión del usuario).
- Licencia MIT. Repositorio: github.com/d-sanchezseco/wikipulso
- No hay logo, marca ni paleta heredada que preservar.

## Evidence on Hand

- Datos reales en vivo de la Feed API de Wikimedia. No hace falta inventar
  contenido de demostración: el producto siempre tiene datos verdaderos.
- Contenido de Wikipedia bajo CC BY-SA 4.0; las miniaturas vienen de la propia
  API.
- `docs/captura.jpg`: captura del estado actual.
- **No existen** usuarios, métricas de uso, testimonios ni clientes. No deben
  fabricarse.

## Product Principles

1. El dato manda. Cualquier decisión que dificulte leer una cifra o comparar dos
   idiomas está mal, por bonita que sea.
2. No mentir sobre los datos: ni la fecha, ni la numeración, ni qué miden las
   cifras.
3. Sin backend mientras la API lo permita. Cada pieza de infraestructura es una
   pieza que mantener.
4. El cruce entre idiomas es el producto. Todo lo demás es el contexto que lo
   hace legible.

## Accessibility & Inclusion

- Contraste WCAG AA medido en el navegador, no estimado, en los dos temas.
- `prefers-reduced-motion` anula todo el movimiento.
- Navegable por teclado con foco visible en todos los controles.
- Los títulos de artículo llegan en el idioma de su wiki (incluidos japonés,
  chino, ruso y árabe): la tipografía debe degradar con dignidad a la del
  sistema para esos alfabetos, y el árabe es RTL.
