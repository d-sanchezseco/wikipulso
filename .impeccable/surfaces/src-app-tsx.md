---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/components.tsx","src/index.css"]
---

---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/components.tsx","src/index.css"]
---

---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/components.tsx","src/index.css"]
---

Ámbito: pantalla única de wikipulso (`src/App.tsx`). Modo del visitante: operate.

Audiencia: quien revisa un portfolio y quien mira de verdad qué se lee hoy en
Wikipedia. Tarea: leer el ranking diario por idioma y detectar qué artículos
están arriba en varios idiomas a la vez. Contenido: Feed API de Wikimedia, sin
clave, sin backend. Restricción: hasta 4 idiomas en paralelo, el día más
reciente es ayer, las cifras son lecturas de página.

Momento memorable: el anillo de transbordo. Un artículo que leen varias líneas
lleva un anillo concéntrico con las tintas de esos idiomas, y se entiende sin
leyenda.

Decisión sin resolver: cuál de las dos audiencias manda cuando entran en
conflicto (registrado igual en PRODUCT.md).

## Direction contract

THESIS: Cada idioma es una línea de una red de transporte y cada artículo una
parada; un artículo leído en varios idiomas es un transbordo. Rechaza la
disposición por defecto de la categoría, que es tarjetas de métrica sobre
rejilla neutra gris con un acento azul y una tabla ordenable debajo.

OWN-WORLD: Esmalte medianoche #0B1230 como suelo de toda la pantalla, sin
zonas claras. Porcelana #FFFFFF para el texto principal y #8FA2C4 para el
secundario. Cuatro tintas de línea del esmalte original, asignadas por idioma: escarlata
#E21D2D, cobalto #1E5BFF, ámbar #FFC20E, verde #22B14C. EXTENSIÓN CITADA: el
producto ofrece diez idiomas y cada uno necesita su tinta, así que la paleta se
amplía a diez con seis tonos más (#FF7A1A, #00C2D1, #C45CFF, #FF4F9A, #7AD11A,
#00D3A0), reoscurecidos para el tema claro. CORRECCIÓN: una versión anterior de
este bloque decía que las diez iban a la misma luminosidad; es falso y está
medido: van de 0,150 (cobalto) a 0,599 (ámbar). La invariante real, y la única
que el sistema promete, es que las diez superan 3:1 sobre su fondo en los dos
temas, de 3,49 a 11,35. Grotesca humanista;
etiquetas en mayúscula con tracking amplio, cifras siempre tabulares con
font-variant-numeric (Overpass las alinea; verificado midiendo el avance).
Una sola familia: no hay monoespaciada.
Filetes de 1px en #1E2A4A. Esquinas rectas en paneles y campos, píldora solo
en los conmutadores de idioma. El color nunca decora: identifica idioma,
selección y estado.

STORY: El visitante entiende en segundos que mira varias redes de lectura en
paralelo, cree que el cruce entre idiomas es real porque ve el anillo y no unas
siglas, y acaba cambiando el día, añadiendo un idioma o abriendo un artículo en
Wikipedia.

FIRST VIEWPORT: Cabecera con el título en porcelana a la izquierda y la fecha
en mayúscula con tracking a la derecha, sobre un filete. Debajo, la barra de
controles estándar: campo de fecha, conmutadores de idioma en píldora con el
punto de su tinta, y buscador alineado a la derecha. A continuación la sección
de transbordos: título, una línea de explicación y una rejilla de tres columnas
donde cada fila lleva los anillos concéntricos de los idiomas que comparten ese
artículo. Debajo, una columna por idioma; cada columna arranca con su nombre y
su recuento y una barra gruesa de su tinta, y cada artículo es una parada sobre
una línea vertical continua de esa tinta que recorre la columna entera: marca
perpendicular si solo lo lee ese idioma, anillo si es transbordo. La acción
principal, abrir el artículo, está en cada parada.

FORM: Diagrama de metro de medianoche. Era mi candidata mejor valorada por
resonancia y además salió repartida como challenger; ganó a la dirección
asignada (teletexto) en los dos ejes, identificación de la audiencia y claridad
de producto. Construcción en código, sin comp. FORM seed:b31ba1b02cfc4b89

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
