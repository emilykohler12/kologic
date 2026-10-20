# Kologic — sitio institucional

Sitio estático en español (es-AR), sin framework. Se genera con Node.js: `src/` → `npm run build` → `site/` (lo que se publica). Única dependencia: `sharp` (solo para procesar imágenes).

**`site/` es resultado del build: no se edita a mano** (se borra y regenera en cada build). Tampoco `package-lock.json`.

## Qué editar

| Para cambiar… | Archivo |
|---|---|
| Correo, WhatsApp, Instagram, LinkedIn, formulario (`formEndpoint`), analítica, dominio (`siteUrl`) | `src/config.mjs` |
| Servicios, proyectos, pasos, modalidad de cobro, preguntas frecuentes, tipos/presupuestos del formulario | `src/data.mjs` |
| Estructura de cada página | `src/pages.mjs`, `src/layout.mjs` |
| Ilustraciones/íconos | `src/mockups.mjs`, `src/icons.mjs` |
| Colores y estilos | `src/styles.css` (variables al inicio) |
| Comportamiento del navegador / formulario | `src/main.js`, `src/form-logic.js` |
| Sitemap, robots, `_headers` (CSP) | `tools/build.mjs` |

Un valor vacío en `config.mjs` oculta su botón/enlace; el build avisa qué falta.

## Comandos

```
npm run build                  # genera ./site y avisa configuración pendiente
npm start                      # build + servidor en http://localhost:4173
npm test                       # build + 138 tests (tests/site.test.mjs y tests/form-logic.test.js)
npm run assets                 # regenera logos/íconos desde src/assets/orig-1.jpg
node tools/make-projects.mjs   # regenera capturas de proyectos (tapa nombres personales)
node tools/make-portfolio.mjs <full.png>   # recorta secciones del portafolio de Emily (sin la de contacto)
```

## Reglas de contenido (las hacen cumplir los tests)

Si un test falla, corregí el contenido; no relajes el test sin que lo pida la usuaria.

- **No deben aparecer** en la página de LexSearch: Boletín Oficial, vigía/vigilante normativo, simulador de audiencia, probabilidad de éxito, anonimización, hosting, Tailscale (fases 7+ no terminadas), ni las frases borradas sobre Gemini («A Gemini (Google) viajan», «se envían a Gemini», «activar la facturación») ni «avisos de plazos son solo en pantalla». Tampoco promesas como «siempre correcto», «listo para producción», «multiusuario».
- **Nexa**: no debe volver «Demo pública de un estudio de belleza»; sin repo ni cuenta.
- **«remoto/presencial»** se dice una sola vez, en el recuadro «Sobre Kologic» de la home (`<div class="remote">`); en ninguna otra página ni texto visible. La ubicación (Posadas, Misiones, Corrientes) vive solo en los datos estructurados.
- **Cuentas de prueba públicas**: solo Clinix y Syntri, solo en su página, nunca en la home ni en otros proyectos.
- **Datos que nunca deben llegar a `site/`**: cualquier correo que no esté en la lista blanca del test «SEGURIDAD» (`kologic6@gmail.com` y las dos cuentas de prueba autorizadas), claves/tokens/cadenas de conexión y cuentas de prueba ajenas. Los correos personales **no se escriben en el repo** (es público): el test usa lista blanca, no lista negra.
- **Portafolio**: sin teléfono ni correo personal en la página; solo dos enlaces externos (sitio en vivo y código). **freddymotos**: sin cuenta de admin ni promesas de facturación electrónica, stock automático, reembolsos automáticos, etc.
- **Videos**: solo se publican los .mp4 referenciados en `videos` de `data.mjs` (hoy, Syntri), con `preload="none"`, poster y `aria-label`. Un .mp4 sin referencia hace fallar el test.
- Capturas: `w`/`h` en `data.mjs` deben coincidir con el .webp real; `alt` ≥ 20 caracteres.
- Ya impuestos además: contraste AA, presupuesto de peso (CSS < 30 KB, JS < 15 KB, logo < 40 KB), CSP, sitemap, JSON-LD, 6 proyectos en orden fijo.

**Antes de cambiar textos de proyectos, leé la última sección de `CRITICA.md`** («Actualización» más reciente, arriba del archivo): dice qué está verificado y qué no, y qué decidió la usuaria. **`CRITICA.md` es un archivo solo local** (está en `.gitignore`: tiene datos personales y riesgos de sistemas de clientes; el repo de GitHub es público). No lo agregues a git ni copies su contenido a archivos versionados.

## Honestidad y datos personales

- Describir solo lo que está hecho y confirmado. No inventar funciones, cifras, clientes, plazos ni tecnologías; si falta un dato, pedírselo a la usuaria.
- No mostrar en textos ni capturas: teléfono o correo personales (el contacto público es el de `config.mjs`, `kologic6@gmail.com`), rutas del disco (`C:\Users\…`, `Documents\proyectos`), nombres de clientes reales, datos de repositorios (autores de commits, claves, `.env`).
- `src/assets/*` contiene capturas de proyectos: no abrir ni transcribir imágenes o videos; basta con listar nombres de archivo.

## Notas

- **Videos de Syntri: pospuestos por decisión de la usuaria.** Los dos `.mp4` están en `videos-pendientes-de-revisar/` (ignorada por git) y `src/data.mjs` no los referencia. Para publicarlos: copiarlos a `src/assets/syntri/` y volver a agregar `videos` al proyecto (ver README).
- Hosting todavía sin elegir: `site/_headers` solo lo aplican Netlify y Cloudflare Pages; con otro hosting hay que replicar las cabeceras.
- Antes de dar algo por terminado: **`npm test`** en verde.
