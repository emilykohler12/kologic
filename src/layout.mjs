import { config } from './config.mjs';
import { icon } from './icons.mjs';

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export const waLink = () => (config.whatsapp ? `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(config.whatsappMessage)}` : '');

const navItems = [
  ['Inicio', 'inicio'],
  ['Sobre Kologic', 'sobre'],
  ['Servicios', 'servicios'],
  ['Proyectos', 'proyectos'],
  ['Cómo trabajamos', 'como-trabajamos'],
  ['Preguntas', 'faq'],
];

function header(root, home) {
  const href = (id) => (home ? `#${id}` : `${root}index.html${id === 'inicio' ? '' : '#' + id}`);
  const links = navItems.map(([label, id]) => `<a href="${href(id)}">${label}</a>`).join('');
  return `<header class="header">
  <div class="container header__bar">
    <a class="brand" href="${home ? '#inicio' : root + 'index.html'}" aria-label="Kologic, ir al inicio">
      <span class="brand__tile"><img src="${root}assets/logo.webp" width="28" height="28" alt=""></span>Kologic
    </a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="nav" aria-label="Abrir menú">
      <span class="i-open">${icon('menu')}</span><span class="i-close">${icon('close')}</span>
    </button>
    <nav class="nav" id="nav" aria-label="Principal">${links}<a class="btn btn--primary" href="${href('contacto')}" data-track="CTA header">Solicitar presupuesto</a></nav>
  </div>
</header>`;
}

function footer(root) {
  const social = [
    config.instagram && `<li><a href="${esc(config.instagram)}" target="_blank" rel="noopener noreferrer">Instagram ${esc(config.instagramHandle)}</a></li>`,
    config.linkedin && `<li><a href="${esc(config.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>`,
  ].filter(Boolean).join('');
  return `<footer class="footer">
  <div class="container">
    <div class="footer__grid">
      <div class="footer__about">
        <a class="brand" href="${root}index.html" aria-label="Kologic, ir al inicio"><span class="brand__tile"><img src="${root}assets/logo.webp" width="28" height="28" alt="" loading="lazy"></span>Kologic</a>
        <p>${esc(config.tagline)}. Desarrollamos sistemas web, páginas, tiendas online y automatizaciones a medida.</p>
      </div>
      <nav aria-label="Enlaces del pie">
        <h2>Navegación</h2>
        <ul>
          <li><a href="${root}index.html">Inicio</a></li>
          <li><a href="${root}index.html#servicios">Servicios</a></li>
          <li><a href="${root}index.html#proyectos">Proyectos</a></li>
          <li><a href="${root}index.html#contacto">Contacto</a></li>
        </ul>
      </nav>
      <div>
        <h2>Contacto</h2>
        <ul>
          <li><a href="mailto:${esc(config.email)}">${esc(config.email)}</a></li>
          ${social}
        </ul>
      </div>
    </div>
    <div class="footer__bottom">
      <span>© ${config.year} Kologic. Todos los derechos reservados.</span>
      <a href="${root}politica-de-privacidad.html">Política de privacidad</a>
    </div>
  </div>
</footer>`;
}

function fab(root, home) {
  const wa = waLink();
  if (wa) return `<a class="fab fab--wa" href="${esc(wa)}" target="_blank" rel="noopener noreferrer" data-track="WhatsApp flotante">${icon('chat')}<span>WhatsApp</span></a>`;
  return `<a class="fab" href="${home ? '#contacto' : root + 'index.html#contacto'}" data-track="CTA flotante">${icon('mail')}<span>Contactanos</span></a>`;
}

export function layout({ title, description, path, root = '', home = false, body, jsonld = [], noindex = false, scripts = '' }) {
  const url = config.siteUrl + path;
  const ld = jsonld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
  const plausible = config.plausibleDomain
    ? `<script defer data-domain="${esc(config.plausibleDomain)}" src="https://plausible.io/js/script.tagged-events.js"></script>`
    : '';
  return `<!doctype html>
<html lang="es-AR" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#0b1b33">
${home && config.googleSiteVerification ? `<meta name="google-site-verification" content="${esc(config.googleSiteVerification)}">\n` : ''}${noindex ? '<meta name="robots" content="noindex, follow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_AR">
<meta property="og:site_name" content="Kologic">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(config.siteUrl)}/assets/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" sizes="32x32" href="${root}assets/favicon-32.png">
<link rel="apple-touch-icon" href="${root}assets/apple-touch-icon.png">
<link rel="preload" href="${root}fonts/outfit-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${root}styles.css">
${plausible}
${ld}
</head>
<body>
<a class="skip" href="#main">Saltar al contenido</a>
${header(root, home)}
<main id="main">
${body}
</main>
${footer(root)}
${fab(root, home)}
<script src="${root}form-logic.js"></script>
<script src="${root}main.js"></script>
${scripts}
</body>
</html>
`;
}
