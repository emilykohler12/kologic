---
name: antes-de-publicar
description: Checklist previa a publicar el sitio de Kologic (config.mjs, formulario, videos de Syntri, política de privacidad, repos enlazados, tests, carpeta site/ y cabeceras). Usar cuando la usuaria vaya a subir el sitio o pregunte si está listo.
---

# Antes de publicar el sitio de Kologic

Está tomada de `README.md`, `CRITICA.md` y los avisos de `tools/build.mjs`. **No publiques ni subas nada**: revisá, marcá cada punto como ✅ / ⚠ / ❓ (no se pudo comprobar) y dejá las decisiones a la usuaria. Muchos puntos dependen de cosas que solo ella sabe; preguntá en vez de suponer. Releé la sección más reciente de `CRITICA.md`: si cambió algo desde esta lista, manda `CRITICA.md`.

## 1. Código y tests

- [ ] `npm test` en verde (build + 138 tests). Si falla, no se publica.
- [ ] `npm run build` y leer las líneas `⚠` que imprime: WhatsApp vacío, `formEndpoint` vacío, analítica sin configurar, LinkedIn vacío, `siteUrl` provisorio, proyectos «Sin demo».
- [ ] `git status`: que no haya cambios sin entender. `site/` está en `.gitignore` (se regenera).

## 2. `src/config.mjs`

- [ ] **`siteUrl`**: hoy es `https://kologic.vercel.app` (provisorio). Tiene que ser la dirección **real** donde se publique, porque alimenta canonical, Open Graph, sitemap y robots. Después de publicar: corregirla, `npm run build` y volver a subir.
- [ ] **`formEndpoint`** (Formspree): confirmar que el formulario es de la cuenta correcta y que el correo de recepción está confirmado. **Nunca se probó un envío real** (CRITICA): probarlo desde el sitio publicado y revisar spam. El plan gratuito tiene límite mensual (README: ~50; verificar el vigente).
- [ ] **Contacto**: `email` (`kologic6@gmail.com`; CRITICA recomienda a futuro un correo con dominio propio), `whatsapp` (confirmar que es el número que quiere hacer público), `instagram`, `linkedin` (es un **perfil personal**, no una página de empresa; ¿lo mantiene?).
- [ ] `plausibleDomain` vacío = sin analítica. ¿Es lo que quiere? (Plausible, Cloudflare Web Analytics o ninguna).
- [ ] Que no haya datos personales de más (teléfono o correo personales, rutas del disco).

## 3. Contenido que CRITICA marca como sin confirmar

- [ ] **Compromisos comerciales** de `src/data.mjs`: «sin cargo» en consultas y presupuestos, plazos (semanas/meses), rangos de presupuesto en USD, modalidad de cobro y «los medios de pago se coordinan con vos».
- [ ] **Dos voces**: el sitio habla en plural («nosotros»); su portafolio, en primera persona. ¿Decisión de marca?
- [ ] **Clientes**: confirmar por escrito que los clientes de freddymotos y Nexa aceptan aparecer (nombre, tienda en vivo, capturas).
- [ ] **Proyectos con contenido inferido**: Nexa (CRITICA ronda 3, punto 6) y cualquier dato que la usuaria no haya confirmado.
- [ ] Cifras de LexSearch («341 pruebas automáticas») son tests *escritos*, no corridos: correrlos antes de publicar la cifra.

## 4. Videos y capturas de Syntri

- [ ] Los dos videos de Syntri **están publicados** desde la ronda 3 (decisión de la usuaria: la cuenta de admin es de prueba y se muestra a propósito), pero el README todavía habla de «videos pendientes de revisar» y la ronda 2 de CRITICA registró que el de escritorio mostraba `admin@syntri.local` todo el tiempo y que del de celular solo se verificaron 2 de 27 segundos. **Preguntale si ya los revisó completos y si los quiere públicos.** Pesan 12,9 MB (`demo-escritorio.mp4`) y 3,8 MB (`demo-celular.mp4`); el README sugiere comprimir a < 5 MB o usar YouTube «no listado» (en ese caso, `video:` con URL *embed*).
- [ ] El video de Clinix (38 MB) **no** está publicado; es decisión suya si lo comprime o lo sube a YouTube.
- [ ] Las capturas muestran «Failed» en rojo (Discord) y un gráfico con más fallidos que exitosos: ¿recapturar?
- [ ] No abras los videos ni las imágenes: la revisión de su contenido la hace la usuaria.

## 5. Repos y demos enlazados (riesgos del sistema de los clientes, fuera del sitio)

Verificar su estado actual con la usuaria, porque el sitio los deja «a un clic»:

- [ ] **freddymotos**: contraseña de admin (`admin@freddymotos.com`) en `AdminUserSeeder.php` de un repo público, correo personal en el pie de la tienda real, nombre/marca del cliente y archivos internos en el repo.
- [ ] **Clinix**: la demo muestra a cualquier admin correos reales cargados en *Profesionales* y pacientes → borrarlos de la base; historial con el nombre de un cliente y `Co-Authored-By`; registro abierto + cuenta pública = la demo se ensucia.
- [ ] **Syntri**: README con la cuenta de admin junto al enlace de la demo; claves de Brevo/Neon que quedaron pegadas en una conversación (regenerarlas si se compartió); el repo dice «Creado por Emily Kohler» y no menciona Kologic.
- [ ] **LexSearch**: correo personal como autor de los commits y ruta del disco en el README; la clave de Gemini está en su `.env` (no subir esa carpeta ni mostrarla).
- [ ] Si algún repo no debe verse: pasarlo a privado o quitar `repo:` de `src/data.mjs` (el botón desaparece solo).

## 6. Política de privacidad

- [ ] Es una **plantilla** (Ley 25.326): revisarla con un abogado antes de publicar. Pendiente también si corresponde inscribir la base ante la AAIP y cómo se trata el envío de datos a Formspree (servicio externo).
- [ ] Que el texto coincida con lo que hace el sitio (formulario → Formspree; analítica solo si hay `plausibleDomain`).

## 7. Qué subir y cabeceras

- [ ] Se sube **solo la carpeta `site/`** (generada por `npm run build`; no se edita a mano). Netlify y Cloudflare Pages aceptan arrastrar y soltar.
- [ ] **`site/_headers`** (lo escribe `tools/build.mjs`) debe tener: `Content-Security-Policy` con `connect-src 'self'` + el origen del formulario (`https://formspree.io`), `frame-src` solo YouTube-nocookie y Vimeo, `frame-ancestors 'none'`; `X-Content-Type-Options: nosniff`; `Referrer-Policy: strict-origin-when-cross-origin`; `Permissions-Policy` (cámara, micrófono y geolocalización desactivados); `X-Frame-Options: DENY`; y caché `immutable` de un año para `/assets/*` y `/fonts/*`.
- [ ] **Hosting**: según CRITICA, `_headers` solo lo aplican Netlify y Cloudflare Pages (GitHub Pages lo ignora). El README también menciona Vercel como opción gratuita: confirmá en la documentación del hosting elegido si aplica `_headers` o hay que replicar las cabeceras en su configuración propia.
- [ ] Si se agrega un destino nuevo (analítica, otro formulario, otro video), la CSP debe permitirlo; se cambia en `tools/build.mjs`.
- [ ] `siteUrl` igual a la dirección final (ver punto 2).

## 8. Después de publicar

- [ ] Enviar una consulta de prueba desde el sitio publicado y confirmar que llega.
- [ ] Abrir `/sitemap.xml` y `/robots.txt` y comprobar que las URL son las reales.
- [ ] Recorrer los enlaces externos (demos, repos, WhatsApp, Instagram, LinkedIn) y los videos.
- [ ] Pendientes que CRITICA reconoce como **no probados**: Safari, Firefox y celulares reales; lector de pantalla y teclado completo; Lighthouse en un servidor real.
- [ ] Mejoras conocidas sin hacer: `og-image.jpg` solo tiene el logo (sin nombre ni texto), falta `favicon.ico`, el logo es un raster (conviene SVG).

Para una revisión más profunda del sitio ya construido, se puede pedir al subagente `critico-sitio`.

## Cómo informar

Resumí en una tabla corta: punto → estado (✅ / ⚠ / ❓) → qué decide o hace la usuaria. Empezá por lo bloqueante (formulario, siteUrl, datos personales, política de privacidad, repos y videos) y terminá con «veredicto»: listo / listo con pendientes / no publicar todavía.
