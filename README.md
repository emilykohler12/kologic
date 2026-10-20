# Kologic — sitio web

Sitio institucional estático (HTML, CSS y JavaScript sin dependencias en el navegador). Se genera con Node.js.

## Comandos

```bash
npm install        # una sola vez (solo instala "sharp", usado para procesar los logos)
npm run build      # genera la carpeta ./site (lo que se publica)
npm start          # build + servidor local en http://localhost:4173
npm test           # build + 138 tests automáticos
npm run assets     # regenera logos/íconos (usa src/assets/orig-1.jpg)
node tools/make-projects.mjs   # prepara las capturas de los proyectos (tapa nombres personales)
```

## Qué editar

| Quiero cambiar… | Archivo |
|-----------------|---------|
| Correo, WhatsApp, Instagram, LinkedIn, formulario, analítica, dominio | `src/config.mjs` |
| Servicios, proyectos (textos, tecnologías, demo, video), pasos, preguntas frecuentes | `src/data.mjs` |
| Estructura de cada página | `src/pages.mjs` y `src/layout.mjs` |
| Colores y estilos | `src/styles.css` (variables al principio) |

Después de editar: `npm run build`. Lo que esté vacío en `config.mjs` se oculta solo (nunca queda un botón roto); el build avisa qué falta.

### Agregar un proyecto
Sumá un objeto al arreglo `projects` en `src/data.mjs` (copiá uno existente). `mock` elige la ilustración (`agenda`, `flow`, `shop`, `clients`). Cuando tengas una demo o un video, completá `demo` / `video` (para video usá una URL de YouTube-nocookie o Vimeo en formato *embed*).

## Conectar el formulario (para que las consultas lleguen a tu correo)

Hoy, sin servicio de envío, el botón "Enviar consulta" abre el programa de correo del visitante. Si usa Gmail desde el navegador, no pasa nada y perdés el contacto. Solución gratuita:

1. Entrá a **formspree.io** y creá una cuenta con `kologic6@gmail.com`.
2. "New form" → ponele nombre "Kologic" → confirmá el correo donde querés recibir las consultas.
3. Te da una dirección tipo `https://formspree.io/f/abcdwxyz`.
4. Pegala en `src/config.mjs`, campo `formEndpoint`, y ejecutá `npm run build`.

El plan gratuito de Formspree permite unos 50 envíos por mes (verificá el límite vigente). Los datos del formulario viajan a ese servicio, y la política de privacidad ya lo contempla.

## Sin dominio propio
Podés publicar gratis sin dominio: Vercel, Netlify o Cloudflare Pages te dan una dirección (por ejemplo `kologic.vercel.app`). Después de publicar, copiá la dirección real en `siteUrl` de `src/config.mjs` y volvé a ejecutar `npm run build`.

## Videos de proyectos
Hay dos videos de Syntri en `videos-pendientes-de-revisar/`: **no están publicados** porque muestran la cuenta de admin. Cuando tengas versiones limpias, copialos a `src/assets/syntri/` y agregá `videos: [{ src: 'assets/syntri/demo.mp4', title: '…' }]` en el proyecto. Pesan 13 MB y 4 MB: conviene comprimirlos (menos de 5 MB) o subirlos a YouTube como "no listado".

## Publicar
Subí la carpeta `site/` a Netlify, Cloudflare Pages o similar (arrastrar y soltar alcanza). Apuntá el dominio y actualizá `siteUrl` en `config.mjs`. Netlify y Cloudflare Pages aplican `site/_headers` (seguridad y caché) automáticamente.

Antes de publicar, leé `CRITICA.md` (archivo solo local, no se sube a git porque tiene datos personales): lista lo que hay que verificar (contenido de proyectos, demos, WhatsApp, formulario, dominio, política de privacidad).

## Estructura
```
src/        código fuente, assets y datos
tools/      build.mjs, serve.mjs, make-assets.mjs
tests/      form-logic.test.js (lógica del formulario) y site.test.mjs (sitio generado)
site/       resultado del build (se publica esto)
```

## Nota sobre las imágenes de proyectos
Las imágenes ya procesadas están en `src/assets/<proyecto>/` y son lo que usa el sitio: **no hace falta nada más para construirlo**. `node tools/make-projects.mjs` solo se usa para regenerarlas desde tus capturas originales (carpetas `Documents/proyectos/...`), tapando nombres personales.

## Capturas del portafolio de Emily
`node tools/make-portfolio.mjs <full.png>` recorta las secciones desde una captura de página completa (el comando para sacarla con Edge está en el encabezado del script). Las imágenes ya procesadas están en `src/assets/portafolio/`.
