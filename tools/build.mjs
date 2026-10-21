// Genera el sitio estático en ./site a partir de ./src.   Uso: node tools/build.mjs
import { mkdirSync, writeFileSync, copyFileSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../src/config.mjs';
import { projects } from '../src/data.mjs';
import { homePage, projectPage, privacyPage, notFoundPage } from '../src/pages.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'site');
const src = join(root, 'src');

rmSync(out, { recursive: true, force: true });
const write = (rel, content) => {
  const f = join(out, rel);
  mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, content);
};
const copy = (rel) => {
  const f = join(out, rel);
  mkdirSync(dirname(f), { recursive: true });
  copyFileSync(join(src, rel), f);
};

// Páginas
write('index.html', homePage());
write('politica-de-privacidad.html', privacyPage());
write('404.html', notFoundPage());
for (const p of projects) write(`proyectos/${p.slug}.html`, projectPage(p));

// Capturas y videos de proyectos (los *-preview.png son solo para revisar a ojo y no se publican)
const syntriAssets = readdirSync(join(src, 'assets'), { withFileTypes: true }).filter((d) => d.isDirectory())
  .flatMap((d) => readdirSync(join(src, 'assets', d.name)).filter((f) => /\.(webp|mp4)$/.test(f)).map((f) => `assets/${d.name}/${f}`));
// Recursos estáticos (los originales orig-*.jpg NO se publican: pesan y no se usan)
['styles.css', 'main.js', 'form-logic.js', 'fonts/outfit-latin.woff2', ...syntriAssets,
  'assets/logo.webp', 'assets/logo.png', 'assets/favicon-32.png', 'assets/apple-touch-icon.png',
  'assets/icon-192.png', 'assets/icon-512.png', 'assets/og-image.jpg'].forEach(copy);

// SEO
const urls = ['/', ...projects.map((p) => `/proyectos/${p.slug}.html`), '/politica-de-privacidad.html'];
const today = new Date().toISOString().slice(0, 10);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${config.siteUrl}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${config.siteUrl}/sitemap.xml\n`);

// Cabeceras de seguridad y caché (Netlify / Cloudflare Pages). En otros hosts, configurar el equivalente.
const endpointOrigin = config.formEndpoint ? new URL(config.formEndpoint).origin : '';
const connect = ["'self'", config.plausibleDomain && 'https://plausible.io', endpointOrigin].filter(Boolean).join(' ');
const csp = [
  "default-src 'self'",
  `script-src 'self'${config.plausibleDomain ? ' https://plausible.io' : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "media-src 'self'",
  "font-src 'self'",
  `connect-src ${connect}`,
  'frame-src https://www.youtube-nocookie.com https://player.vimeo.com',
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' mailto:",
].join('; ');
write('_headers', `/*
  Content-Security-Policy: ${csp}
  Strict-Transport-Security: max-age=31536000
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  Cross-Origin-Opener-Policy: same-origin
  X-Frame-Options: DENY

/assets/*
  Cache-Control: public, max-age=31536000, immutable
/fonts/*
  Cache-Control: public, max-age=31536000, immutable
`);

// Con html_handling "none" (wrangler.jsonc) la raíz "/" no sirve index.html sola: se reescribe.
write('_redirects', '/ /index.html 200\n');

// Avisos de configuración pendiente
const todo = [
  [!config.whatsapp, 'WhatsApp vacío: se ocultan los botones de WhatsApp (config.whatsapp).'],
  [!config.formEndpoint, 'formEndpoint vacío: el formulario abre el correo del usuario (mailto) en vez de enviarse solo.'],
  [!config.plausibleDomain, 'plausibleDomain vacío: no hay analítica de visitas.'],
  [!config.linkedin, 'LinkedIn vacío: no se muestra el enlace.'],
  [/(vercel\.app|workers\.dev|pages\.dev)$/.test(config.siteUrl), `siteUrl (${config.siteUrl}) es provisorio: ponelo igual a la dirección real donde publiques.`],
  [projects.some((p) => !p.demo), `Sin demo: ${projects.filter((p) => !p.demo).length} proyectos muestran "Pedir acceso a la demo".`],
];
console.log(`Sitio generado en ./site (${urls.length + 1} páginas).`);
todo.filter(([c]) => c).forEach(([, m]) => console.log('  ⚠ ' + m));
if (!existsSync(join(out, 'index.html'))) process.exit(1);
