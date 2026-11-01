---
name: wikipulso
description: Diagrama de metro de medianoche para el ranking diario de Wikipedia; cada idioma es una línea y cada artículo una parada.
colors:
  enamel: "#0b1230"
  enamel-raised: "#121b40"
  porcelain: "#ffffff"
  porcelain-dim: "#8fa2c4"
  porcelain-faint: "#7587ad"
  rule: "#1e2a4a"
  line-es: "#e21d2d"
  line-en: "#1e5bff"
  line-fr: "#ffc20e"
  line-de: "#22b14c"
  line-it: "#ff7a1a"
  line-pt: "#00c2d1"
  line-ru: "#c45cff"
  line-ja: "#ff4f9a"
  line-zh: "#7ad11a"
  line-ar: "#00d3a0"
typography:
  display:
    fontFamily: "Overpass Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Overpass Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Overpass Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
  body:
    fontFamily: "Overpass Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
  body-small:
    fontFamily: "Overpass Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
  figure:
    fontFamily: "Overpass Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    fontFeature: "tabular-nums"
  label:
    fontFamily: "Overpass Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    letterSpacing: "0.14em"
rounded:
  none: "0px"
  full: "9999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "20px"
  xl: "28px"
  gutter: "40px"
  section: "48px"
  footer: "80px"
components:
  field:
    backgroundColor: "{colors.enamel-raised}"
    textColor: "{colors.porcelain}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
  line-toggle:
    backgroundColor: "{colors.enamel}"
    textColor: "{colors.porcelain-dim}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    padding: "6px 14px 6px 10px"
  line-toggle-selected:
    backgroundColor: "{colors.enamel-raised}"
    textColor: "{colors.porcelain}"
    typography: "{typography.body}"
    rounded: "{rounded.full}"
    padding: "6px 14px 6px 10px"
  button-outline:
    backgroundColor: "{colors.enamel}"
    textColor: "{colors.porcelain-dim}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "10px 16px"
  button-outline-hover:
    backgroundColor: "{colors.enamel-raised}"
    textColor: "{colors.porcelain-dim}"
  button-alert:
    backgroundColor: "{colors.line-es}"
    textColor: "{colors.porcelain}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
  icon-button:
    backgroundColor: "{colors.enamel}"
    textColor: "{colors.porcelain-dim}"
    rounded: "{rounded.none}"
    padding: "10px"
  station:
    backgroundColor: "{colors.enamel}"
    textColor: "{colors.porcelain}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "10px 0"
  station-hover:
    backgroundColor: "{colors.enamel-raised}"
    textColor: "{colors.porcelain}"
  notice:
    backgroundColor: "{colors.enamel-raised}"
    textColor: "{colors.porcelain}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "16px"
  thumb:
    backgroundColor: "{colors.enamel-raised}"
    textColor: "{colors.porcelain-faint}"
    rounded: "{rounded.none}"
    size: "40px"
---

# Design System: wikipulso

## Overview

**Creative North Star: "El Diagrama de Metro de Medianoche"**

La pantalla es un panel de señalética de una red de transporte leída de noche: suelo de esmalte azul profundo sin zonas claras, rótulos en porcelana, y una tinta saturada por línea. El vocabulario no es decorativo ni metafórico a medias: cada idioma **es** una línea, cada artículo **es** una parada sobre esa línea, y un artículo que varias lenguas leen a la vez **es** un transbordo con su anillo. Quien llega entiende la estructura antes de leer una sola etiqueta.

La densidad es alta y deliberadamente tabular: columnas estrechas, miniaturas cuadradas de 40px, cifras alineadas por avance tabular, filetes de 1px donde hace falta una separación y nada más. No hay sombras, ni degradados, ni cristal, ni tarjetas de métrica: el relieve se consigue con dos valores de esmalte y un filete. El color está racionado a una sola función —identificar línea, selección o estado— y por eso una tinta en pantalla siempre significa algo.

El tema claro es el mismo mundo invertido, no una paleta aparte: los mismos tokens cambian de valor bajo un único `data-theme` en `<html>`, fijado antes del primer pintado, y las diez tintas se reoscurecen lo justo para aguantar contraste sobre porcelana. Rechazo confirmado: la disposición por defecto de la categoría —tarjetas de métrica sobre rejilla neutra gris con un acento azul y tabla ordenable debajo— y el minigráfico de tendencia por fila, retirado durante el build por delatar la plantilla y comerse el ancho del título.

**Key Characteristics:**
- Un solo suelo de esmalte; el relieve es tonal, nunca proyectado.
- Diez tintas de línea, una por idioma, todas por encima de 3:1 en ambos temas.
- Vocabulario de tránsito literal: línea continua, marca perpendicular, anillo.
- Esquinas rectas en todo salvo los conmutadores de línea y los puntos y anillos.
- Una sola familia tipográfica y una sola animación autorizada.

## Colors

Esmalte medianoche como suelo único, porcelana para la voz, y diez tintas de señalética que solo aparecen cuando identifican algo.

### Primary
- **Tintas de línea**, diez, una por idioma: escarlata (es), cobalto (en), ámbar (fr), verde bandera (de), naranja (it), turquesa (pt), violeta (ru), magenta (ja), lima (zh), esmeralda (ar). Pintan la línea vertical de 3px de la columna, la barra gruesa de su cabecera, el punto del conmutador, el anillo de transbordo y el aro de foco de esa columna. Nunca pintan texto corrido ni fondos amplios.
- **Cobalto** (`{colors.line-en}`) es además la tinta de sistema por defecto: selección de texto (al 40% en oklab) y foco de cualquier control que no viva dentro de una columna.
- **Escarlata** (`{colors.line-es}`) es además el caret de los campos y el fondo del botón de reintento tras un error.

### Neutral
- **Esmalte medianoche** (`{colors.enamel}`): fondo de toda la pantalla, sin excepción, y relleno interior del anillo para que el aro se lea como aro y no como disco.
- **Esmalte elevado** (`{colors.enamel-raised}`): la única superficie "por encima" del suelo. Campos, avisos, miniaturas, bloques de esqueleto, hover de parada y conmutador seleccionado.
- **Porcelana** (`{colors.porcelain}`): texto principal, títulos de parada, marca perpendicular de parada simple y anillo sin idioma asignado. Contraste medido 18.37 (oscuro) / 16.99 (claro).
- **Porcelana atenuada** (`{colors.porcelain-dim}`): texto secundario, descripciones, etiquetas de señalética, pie. Medido 7.11 / 6.57.
- **Porcelana tenue** (`{colors.porcelain-faint}`): número de posición, inicial de la miniatura ausente, iconos de apoyo. Medido 5.09 / 5.33.
- **Filete** (`{colors.rule}`): divisiones de 1px, borde de campo y de botón fantasma, barra del esqueleto, subrayado de enlace en reposo y pulgar de la barra de scroll.

### Named Rules
**La Regla de la Tinta Identificadora.** Una tinta de línea solo aparece cuando identifica un idioma, una selección o un estado. Si un elemento no responde a "¿de qué línea es esto?", va en porcelana o en filete.

**La Regla del Suelo Único.** No hay zonas claras dentro de un tema. Toda la pantalla descansa sobre `enamel`; lo único que se levanta es `enamel-raised`, y solo para campos, avisos, miniaturas y hover.

**La Regla del Contraste Medido.** Un valor de color entra en el sistema cuando su contraste se ha medido en el navegador en los dos temas: texto por encima de 4.5:1, tintas por encima de 3:1 sobre su fondo. Estimar no cuenta.

**La Regla de la Inversión Completa.** El tema claro no es otra paleta: son los mismos tokens con otros valores bajo un único `data-theme`. Añadir un color implica añadir sus dos valores a la vez.

## Typography

**Display Font:** Overpass Variable (con `ui-sans-serif`, `system-ui`, `sans-serif`)
**Body Font:** Overpass Variable (la misma, autoalojada por `@fontsource-variable`)
**Label/Mono Font:** ninguna aparte. No hay familia monoespaciada en el sistema.

**Character:** Overpass desciende de la Highway Gothic de la señalética de carreteras: una grotesca humanista de wayfinding, neutra en texto corrido y autoritaria en mayúscula con tracking. Es la voz de un panel de estación, no la de un dashboard.

### Hierarchy
- **Display** (600, 24px y 28px desde `sm`, `line-height: 1`, tracking -0.015em): el título de la pantalla en la cabecera. Uno por pantalla.
- **Headline** (600, 18px, tracking -0.01em): título de la sección de transbordos.
- **Title** (600, 16px): nombre de cada línea sobre su columna.
- **Body** (400, 14px; 500 en los títulos de parada): texto de interfaz, campos y descripciones de sección. Medida de lectura acotada a 68ch en los párrafos largos.
- **Body small** (400, 12px): descripción de parada y pie.
- **Figure** (400, 14px o 12px, `font-variant-numeric: tabular-nums`): cualquier cifra —lecturas, recuentos, número de posición—. Verificado midiendo el avance en el navegador: "111111", "000000", "999999" y "123456" ocupan 59.14px idénticos.
- **Label** (400, 11px, tracking 0.14em, mayúscula, color `porcelain-dim`): el registro `.sign`. Etiquetas de campo, fecha de cabecera, recuentos de columna, avisos y acciones secundarias.

### Named Rules
**La Regla de la Cifra Tabular.** Toda cifra lleva `tabular-nums`. Dos columnas de números tienen que poder compararse en vertical sin que el ojo se descuadre.

**La Regla de una Sola Voz.** Una familia para todo. Lo que pida "parecer técnico" se resuelve con el registro `.sign` o con tracking, nunca con una monoespaciada.

**La Regla del Rótulo.** La mayúscula con tracking de 0.14em es el registro de señalética y solo etiqueta: nombra un control, una fecha, un recuento o un aviso. No se usa para texto que haya que leer en frases.

**La Regla del Alfabeto Invitado.** Los títulos llegan en el idioma de su wiki (japonés, chino, ruso, árabe). La pila degrada a la fuente del sistema para esos alfabetos y el árabe se compone RTL; nada del layout puede depender de que el título sea latino.

## Layout

Contenedor centrado de 1500px máximos con margen lateral de 16px, 24px desde `sm` y 40px desde `lg`. La página es una pila vertical de bloques separados por 48px: cabecera sobre filete, fila de controles sobre filete, sección de transbordos, rejilla de columnas de línea, acción de expandir, y pie a 80px sobre filete.

La rejilla de líneas se adapta al número de líneas activas, no solo al viewport: una línea ocupa una columna; dos pasan a dos columnas desde `lg` (1024px); tres pasan a dos desde `lg` y a tres desde `xl` (1280px); cuatro pasan a dos desde `lg` y a cuatro solo desde `2xl` (1536px), porque a 1280px cada columna cae a ~290px y los títulos se truncan. Cuando hay cuatro líneas y el viewport no llega a 1536px, la pantalla lo dice en registro `.sign` en lugar de dejar que el usuario descubra que faltan dos columnas abajo. Los transbordos van en su propia rejilla —una columna, dos desde `sm`, tres desde `xl`— y se muestran los seis primeros.

Separación entre columnas de 40px y entre filas de 48px. El ritmo interno usa 6 / 8 / 12 / 20px: 12px entre las celdas de una parada, 8px entre etiqueta y campo, 20px entre controles. Cada parada es una rejilla de cinco celdas (24px de posición, 24px de marca, 40px de miniatura, título flexible, 64px de cifra alineada a la derecha) con 10px de aire vertical, de modo que posición, marca, miniatura y cifra caen en el mismo eje en todas las columnas.

### Named Rules
**La Regla de la Columna Legible.** Una columna de línea nunca baja de ~300px. Antes de estrechar columnas para que quepan más, se reparten en dos filas y se avisa en pantalla.

**La Regla del Eje Compartido.** De las cinco celdas de una parada, el título es la única elástica. Las otras cuatro son de ancho fijo para que la lectura en vertical funcione.

## Elevation & Depth

Sistema plano: **no hay ninguna sombra en el build**, ni ambiente ni estructural, en ninguno de los dos temas. La profundidad se consigue con tres recursos y nada más: dos valores tonales de esmalte (`enamel` y `enamel-raised`), un filete de 1px en `rule` donde hace falta una separación, y el orden de pintado —la vía de la columna pasa por detrás de las paradas, y el anillo lleva relleno de `enamel` para que la línea no lo cruce.

### Named Rules
**La Regla del Esmalte Plano.** Ni `box-shadow`, ni degradados, ni `backdrop-filter`. Una superficie que necesite destacarse cambia de valor tonal o se separa con un filete.

**La Regla del Filete Único.** Las separaciones son de 1px en `rule`. El único trazo grueso del sistema es la propia red: 3px en la vía vertical y 6px en la barra de cabecera de columna.

## Shapes

Esquinas rectas (0px) en todo lo rectangular: paneles, avisos, campos de fecha y de búsqueda, botones de acción, miniaturas y bloques de esqueleto. La única forma redonda es el círculo completo, y está reservada a tres piezas del vocabulario de tránsito: el conmutador de línea en píldora, su punto de tinta de 10px y el anillo de transbordo de 15px con aro de 3px.

El repertorio formal es el de un diagrama de red: rectángulo recto, línea vertical continua de 3px, marca perpendicular de 13×3px, aro. Las miniaturas son cuadradas de 40px con filete y recorte `cover`; cuando faltan, el mismo cuadrado lleva la inicial del título en porcelana tenue.

### Named Rules
**La Regla del Radio Binario.** O 0px o círculo completo. No hay radios intermedios: un `border-radius` de 4, 8 o 12px es ajeno a este mundo.

## Components

### Buttons
- **Shape:** rectas (0px), excepto los conmutadores de línea, que son píldora.
- **Fantasma (por defecto):** filete de 1px en `rule`, fondo transparente sobre esmalte, texto en porcelana atenuada; en registro `.sign` cuando la acción es secundaria ("Ver la línea completa"), en 14px cuando es un control de la fila de controles.
- **Hover / Focus:** el hover rellena con `enamel-raised` y solo transiciona color; el foco visible es contorno de 2px con 2px de separación, en la tinta de la columna cuando el botón vive dentro de una columna y en cobalto cuando no.
- **Active:** `scale(0.98)`. Es el único feedback de pulsación del sistema.
- **De alerta:** fondo escarlata con texto porcelana, en registro `.sign`, reservado a reintentar tras un error.
- **De icono:** cuadrado de 40px con filete e icono SVG de 16px en porcelana atenuada; el conmutador de tema es el único caso.

### Chips
- **Style:** píldora con filete de 1px y punto de tinta de 10px a la izquierda, texto de 14px, relleno 6px arriba y abajo, 10px a la izquierda, 14px a la derecha.
- **State:** sin seleccionar, filete en `rule`, texto en porcelana atenuada y punto en color de filete. Seleccionado, fondo `enamel-raised`, texto en porcelana, y borde y punto en la tinta de ese idioma: la pastilla se identifica con su línea. El estado lo porta `aria-pressed`; el color no es el único portador.

### Inputs / Fields
- **Style:** rectos, fondo `enamel-raised`, filete de 1px en `rule`, relleno 8px/12px, texto de 14px en porcelana. El buscador añade 36px de sangrado izquierdo para su lupa, que no recibe puntero.
- **Focus:** contorno de 2px en cobalto con 2px de separación. Sin glow y sin cambio de fondo.
- **Label:** siempre visible encima, en registro `.sign`. El placeholder no hace de etiqueta.

### Cards / Containers
- **Corner Style:** rectos (0px).
- **Background:** `enamel` en las secciones; `enamel-raised` solo en avisos.
- **Shadow Strategy:** ninguna (ver Elevation & Depth).
- **Border:** filete de 1px en `rule`, normalmente como borde superior o inferior de separación en lugar de caja cerrada.
- **Internal Padding:** 16px en los avisos con caja. Las secciones no tienen caja: se separan con 48px y un filete.

### Línea, parada y transbordo (componente firma)

- **Vía:** línea vertical continua de 3px en la tinta del idioma, centrada en el eje de la celda de marca (48px desde el borde izquierdo de la columna), que recorre la columna entera por detrás de las paradas con 12px de retranqueo arriba y abajo.
- **Cabecera de línea:** el nombre del idioma, su recuento de paradas y lecturas en registro `.sign` tabular, y una barra de 6px de alto en su tinta a todo el ancho de la columna.
- **Parada simple:** marca perpendicular de 13×3px en porcelana sobre la vía.
- **Transbordo:** anillo de 15px con aro de 3px y relleno de esmalte. En la columna el aro va en porcelana; en la sección de transbordos hay un anillo por cada idioma que comparte el artículo, en su tinta, solapados -7px para que se lean como aros concéntricos de un intercambiador.
- **Parada (fila):** toda la fila es el enlace. El hover rellena con `enamel-raised` y revela la marca de "abre fuera" (icono SVG de 13px, opacidad 0→1). El nombre accesible lleva posición, título, descripción, lecturas, condición de transbordo y la tendencia de 5 días en texto.
- **Motion:** la vía se traza al llegar los datos con el keyframe `recorrido` (`scaleY` 0→1 desde el borde superior, 0.85s, `cubic-bezier(0.16, 1, 0.3, 1)`, una sola vez). Es el único momento con autoría del sistema.

### Estados de carga, error y vacío
- **Carga:** el esqueleto reproduce la rejilla exacta de la parada con bloques en `enamel-raised` y la vía en color de filete, con pulso de opacidad. La estructura se ve antes que los datos y no hay salto de layout al llegar el feed.
- **Error:** aviso en `enamel-raised` con filete, icono de advertencia en escarlata, mensaje de 14px y botón de reintento escarlata. Es por columna: una línea caída no vacía la pantalla.
- **Vacío:** sin caja. Lupa en porcelana tenue y frase en porcelana atenuada con el término buscado destacado en porcelana.

### Named Rules
**La Regla del Anillo sin Leyenda.** El transbordo se comunica con aros en la tinta de cada línea, nunca con siglas, badges ni un "+2". Si hace falta leyenda para entender el anillo, el anillo está mal dibujado.

**La Regla de la Estructura Primero.** Ningún contenido espera a una animación para existir. El esqueleto tiene la geometría de la lista real y la vía se traza sobre contenido ya presente.

**La Regla del Único Movimiento.** Una sola animación con autoría (`recorrido`) más transiciones de color y el `scale(0.98)` de pulsación. Todo el movimiento muere bajo `prefers-reduced-motion`.

## Do's and Don'ts

### Do:
- **Do** asignar a cada idioma su tinta `--line-<código>` y leerla desde `--lane` dentro de una columna, para que vía, barra, punto, anillo y aro de foco de esa columna coincidan sin excepción.
- **Do** mantener las esquinas a 0px y reservar el círculo completo a los conmutadores de línea, sus puntos y los anillos.
- **Do** poner `tabular-nums` en toda cifra.
- **Do** medir el contraste en el navegador en los dos temas antes de dar por bueno un color, con el texto por encima de 4.5:1 y las tintas por encima de 3:1.
- **Do** añadir cualquier color nuevo en sus dos valores a la vez, oscuro y claro, bajo el mismo token.
- **Do** dar a cada control un foco visible de contorno de 2px con 2px de separación, en la tinta de su columna o en cobalto fuera de ella.
- **Do** anunciar en pantalla lo que el layout retira (una línea desplazada, dos columnas que continúan debajo) en registro `.sign`.
- **Do** dejar que el estado de carga tenga la geometría de la lista real.

### Don't:
- **Don't** usar `box-shadow`, degradados ni `backdrop-filter`: el relieve es tonal y de filete.
- **Don't** emplear radios intermedios (4px, 8px, 12px).
- **Don't** introducir una segunda familia tipográfica ni una monoespaciada para las cifras; `tabular-nums` ya las alinea.
- **Don't** usar una tinta de línea para texto corrido, fondos amplios ni adorno: solo identifica idioma, selección o estado.
- **Don't** apoyar un estado únicamente en el color; acompáñalo de `aria-pressed`, texto o forma.
- **Don't** añadir una segunda animación con autoría, ni ocultar contenido esperando a que una animación termine.
- **Don't** volver al patrón rechazado: tarjetas de métrica sobre rejilla neutra, tabla ordenable debajo, o un minigráfico de tendencia por fila.
- **Don't** explicar el transbordo con siglas, badges o leyenda en lugar de aros.
- **Don't** estrechar las columnas por debajo de ~300px para que quepa una línea más.
