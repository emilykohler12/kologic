---
name: nuevo-proyecto
description: Agregar un proyecto al portafolio del sitio de Kologic (arreglo `projects` de src/data.mjs, capturas en src/assets/<proyecto>/, tools/make-projects.mjs y tests). Usar cuando la usuaria quiera sumar, reemplazar o rehacer un proyecto.
---

# Agregar un proyecto a Kologic

Regla madre: **solo se muestra lo que está hecho y confirmado.** No inventes funciones, cifras, tecnologías, clientes ni enlaces. Si falta un dato, pedíselo a la usuaria (paso 1) y no avances hasta tenerlo. Antes de empezar, leé la sección más reciente de `CRITICA.md` (arriba del archivo) y mirá un proyecto parecido en `src/data.mjs` como modelo.

## 1. Pedir los datos (no inventar)

Pedí todo junto, en una sola lista, y dejá en blanco lo que no tenga:

- **Nombre** y qué es, en una frase (`name`, `shortName`, `short`). El `slug` sale del nombre: solo `a-z`, `0-9` y `-`, y único.
- **Qué hace** hoy (`features`, al menos 5, solo funciones ya hechas), **qué problema resuelve** (`problem`), **descripción y objetivo** (`goal`).
- **Tecnologías** reales (`tech`, al menos 2; en las tarjetas se ven las primeras 5) e **integraciones** (`integrations`, opcional).
- **Cifras verificadas** (`stats`: pares `['16', 'pantallas']`) — solo si las comprobó; avisá si es un conteo de tests escritos y no de tests que pasan.
- **Alcance / límites** (`scope`): qué NO hace todavía. Es lo que evita promesas falsas.
- **Demo**: URL pública (`demo`), si hay **cuenta de prueba** (`demoAccount`) o si no hay demo. Sin demo hay dos caminos: `presentation: true` (botón «Pedir una presentación en vivo») o `noDemo: true` (sin botón).
- **Repositorio** (`repo`): ¿es público? Mirá en `CRITICA.md` qué problemas dieron los repos anteriores (claves en el README, correo personal como autor de commits, nombre de un cliente, líneas `Co-Authored-By`).
- **Video**: enlace *embed* de YouTube-nocookie o Vimeo (`video`) o archivos `.mp4` (`videos`).
- **Capturas**: ¿cuáles y dónde están los originales? ¿Tienen nombres, correos, teléfonos o datos de clientes reales?
- **¿El cliente autorizó** que aparezca su nombre/marca? (pasó con freddymotos y Nexa).
- Tipo de proyecto para el formulario (`formType`): debe ser **exactamente** una de las opciones de `projectTypes` en `src/data.mjs`.

## 2. Capturas: `src/assets/<proyecto>/`

- Las imágenes publicables van en `src/assets/<slug-o-carpeta>/` como `.webp`. `tools/build.mjs` copia solo los `.webp` y `.mp4` de cada subcarpeta de `src/assets/`, así que no hay que tocar el build.
- Se generan con `tools/make-projects.mjs` (usa `sharp`). Para sumar las de este proyecto:
  1. Agregá el nombre de la carpeta a la lista del `for ... mkdirSync` (línea ~29).
  2. Agregá una línea `await render('<ruta/original.png>', 'src/assets/<carpeta>/<nombre>.webp', [parches])`.
  3. **Parches** (`{ x, y, w, h, text, size, color, ty, bg?, tx?, weight? }`): tapan una zona con el color de fondo y escriben un texto de ejemplo (por ejemplo `ana@ejemplo.com`, `Dra. Ana López`). Se usan para nombres personales, correos o clientes reales. Las coordenadas dependen de la imagen: **pedile a la usuaria que indique qué hay que tapar o que revise ella el resultado**; no abras imágenes por tu cuenta.
  4. Antes de correr el script entero comprobá que existan todas las rutas originales que usa (están en `C:/Users/Emily Kohler/...`): regenera *todas* las capturas y fallaría si falta alguna. Si hace falta, probá solo tus líneas en un script aparte.
- No se publican capturas con: correos personales, teléfono, rutas del disco, claves/`.env`, terminales, datos reales de clientes ni (salvo Clinix y Syntri) cuentas de admin.
- Cada imagen en `images` lleva `src`, `w`, `h` (**iguales al archivo real**: lo verifica un test), `alt` (≥ 20 caracteres, describe la pantalla) y `caption`. La primera es la portada de la tarjeta y el póster de los videos.
- Los `*-preview.png` o cualquier original pesado no deben quedar dentro de `src/assets/` si no se usan (el test de peso y de «archivos de desarrollo» los vigila).

## 3. Cargar el proyecto en `src/data.mjs`

Agregá un objeto **al final** de `projects` (los dos primeros se usan en la portada: no los muevas sin que lo pida). Campos reales que usa el sitio, tomados de los proyectos existentes:

| Campo | Notas |
|---|---|
| `slug`, `shortName`, `name`, `short`, `tags`, `tech`, `goal`, `problem`, `features` | obligatorios |
| `formType` | una opción de `projectTypes` |
| `mock` | `agenda`, `flow`, `shop` o `clients`: ilustración que se usa **solo si no hay `images`** (y entonces las capturas se rotulan «ilustrativa»). Elegí la más parecida: gestión/turnos → `agenda`; automatización → `flow`; tienda → `shop`; clientes/CRM/sitio → `clients` |
| `images` | capturas reales (ver paso 2) |
| `integrations`, `stats`, `scope` | opcionales; `scope` aparece como «Alcance actual» |
| `demo` (URL o `null`), `demoLabel`, `demoNote`, `demoAccount: { user, pass }` | `demoLabel` cambia el texto del botón (por defecto «Abrir demo funcional») |
| `presentation: true` | con `demo: null`: botón «Pedir una presentación en vivo» |
| `noDemo: true` | no muestra botón de demo |
| `repo` | agrega «Ver código en GitHub» |
| `videos: [{ src, title }]` / `video` | `.mp4` propios (con póster y `preload="none"`) / URL embed |
| `askLabel` | texto del botón de pedido (por defecto «Solicitar un sistema similar») |

Textos en castellano rioplatense (voseo), en el mismo tono y largo que los demás. Nada de lenguaje de promesa («siempre», «100%», «listo para producción», «escala a…») que el código no respalde.

## 4. Tests que hay que actualizar o agregar (`tests/site.test.mjs`)

Estos tests tienen el número y el orden de proyectos escritos a mano y **van a fallar** al sumar uno:

- `'Proyectos: una tarjeta por proyecto…'` → `assert.equal(projects.length, 6)` (subir la cifra).
- `'los 6 proyectos, en orden…'` → lista de slugs y título (sumar el nuevo al final).
- `'cuentas de prueba: solo las dos autorizadas (Clinix y Syntri)…'`: si el proyecto tuviera `demoAccount`, solo con autorización expresa de la usuaria, y hay que actualizar ese test **y** la lista `okEmails` de `.claude/hooks/guard-personal-data.mjs`.
- `'videos: no se publica ningún .mp4 sin revisar…'` está escrito solo para Syntri: si el nuevo trae `.mp4`, hay que adaptar ese test.
- Los tests por proyecto (`for (const p of projects)`: secciones, datos completos, `formType`, imágenes con medidas y `alt`) y el de seguridad (correos/claves en todo `site/`) ya lo cubren automáticamente.

Agregá además **un test propio** del proyecto, como los de Clinix, freddymotos o LexSearch: que `demo`/`repo` sean los acordados, que aparezcan las frases clave y el alcance, y que **no** aparezcan las promesas que la ficha del proyecto desaconseja o las funciones aún no terminadas (con `assert.ok(!/…/i.test(t))`).

Como el hook de `src/` corre `npm test` al editar, conviene **editar primero `tests/`** y después `src/data.mjs`, así el resultado sale en verde. Los cambios en `tests/` y `tools/` los pide la usuaria: confirmá con ella antes de tocarlos.

## 5. Cierre

1. `npm test` en verde (el build también avisa «Sin demo» si corresponde).
2. Revisá la página generada (`npm start`, http://localhost:4173/proyectos/<slug>.html), en computadora y en ancho de celular.
3. Resumile a la usuaria qué dato es verificado y cuál queda por confirmar, y ofrecé anotarlo en una nueva «Actualización» arriba de `CRITICA.md`.
