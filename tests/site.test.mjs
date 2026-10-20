// Tests del sitio generado (./site). Se ejecutan después de `node tools/build.mjs` (ver `npm test`).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../src/config.mjs';
import { projects, services, steps, faqs, projectTypes } from '../src/data.mjs';
import { icon, iconNames } from '../src/icons.mjs';
import { mockup, mockTypes } from '../src/mockups.mjs';
import { waLink } from '../src/layout.mjs';
import { homePage } from '../src/pages.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = join(ROOT, 'site');
const read = (rel) => readFileSync(join(SITE, rel), 'utf8');
const pages = ['index.html', 'politica-de-privacidad.html', '404.html', ...projects.map((p) => `proyectos/${p.slug}.html`)];
const html = Object.fromEntries(pages.map((p) => [p, read(p)]));
const css = readFileSync(join(SITE, 'styles.css'), 'utf8');

const attr = (tag, name) => (tag.match(new RegExp(`\\s${name}="([^"]*)"`)) || [])[1];
const tags = (src, name) => src.match(new RegExp(`<${name}\\b[^>]*>`, 'g')) || [];
const ids = (src) => [...src.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const text = (src) => src.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');

/* ---------- Estructura y SEO ---------- */
for (const p of pages) {
  const src = html[p];
  test(`[${p}] estructura básica y SEO`, () => {
    assert.match(src, /^<!doctype html>/i);
    assert.match(src, /<html lang="es-AR"/);
    assert.match(src, /<meta name="viewport" content="width=device-width, initial-scale=1">/);
    const title = (src.match(/<title>([^<]*)<\/title>/) || [])[1];
    assert.ok(title && title.length >= 15 && title.length <= 70, `title de ${title?.length} caracteres`);
    const desc = (src.match(/<meta name="description" content="([^"]*)"/) || [])[1];
    assert.ok(desc && desc.length >= 50 && desc.length <= 160, `description de ${desc?.length} caracteres`);
    assert.match(src, /<link rel="canonical" href="https:\/\/[^"]+">/);
    assert.match(src, /<meta property="og:image" content="https:\/\/[^"]+\.jpg">/);
    assert.equal((src.match(/<h1[\s>]/g) || []).length, 1, 'debe haber exactamente un h1');
    assert.equal((src.match(/<main\b/g) || []).length, 1);
    assert.match(src, /class="skip" href="#main"/);
  });

  test(`[${p}] ids únicos`, () => {
    const all = ids(src);
    const dup = all.filter((id, i) => all.indexOf(id) !== i);
    assert.deepEqual(dup, []);
  });

  test(`[${p}] botón de contacto visible (flotante)`, () => {
    assert.match(src, /class="fab\b/);
  });

  test(`[${p}] header y footer presentes con logo, correo y política de privacidad`, () => {
    assert.match(src, /<header class="header">/);
    assert.match(src, /<footer class="footer">/);
    assert.ok(src.includes(`mailto:${config.email}`));
    assert.match(src, /politica-de-privacidad\.html/);
    assert.match(src, /Todos los derechos reservados/);
  });
}

/* ---------- Enlaces y recursos ---------- */
test('todos los enlaces y recursos internos existen (incluidos los #anclas)', () => {
  const problems = [];
  for (const p of pages.filter((x) => x !== '404.html')) { // el 404 usa rutas absolutas a propósito
    const base = dirname(join(SITE, p));
    for (const m of html[p].matchAll(/\s(?:href|src)="([^"]+)"/g)) {
      const url = m[1];
      if (/^(https?:|mailto:|tel:|data:)/.test(url)) continue;
      const [pathPart, frag] = url.split('#');
      const target = pathPart ? resolve(base, pathPart.split('?')[0]) : join(SITE, p);
      if (!existsSync(target)) { problems.push(`${p}: ${url} no existe`); continue; }
      if (frag && target.endsWith('.html') && !ids(readFileSync(target, 'utf8')).includes(frag)) problems.push(`${p}: ancla #${frag} no existe en ${pathPart || p}`);
    }
  }
  assert.deepEqual(problems, []);
});

test('el 404 usa rutas absolutas que existen', () => {
  for (const m of html['404.html'].matchAll(/\s(?:href|src)="(\/[^"#]+)"/g)) assert.ok(existsSync(join(SITE, m[1])), m[1]);
});

test('enlaces externos con target=_blank llevan rel="noopener noreferrer"', () => {
  for (const [p, src] of Object.entries(html)) {
    for (const a of tags(src, 'a').filter((t) => attr(t, 'target') === '_blank')) assert.match(attr(a, 'rel') || '', /noopener/, `${p}: ${a}`);
  }
});

test('el enlace a Instagram apunta a @ko.logic y no arrastra parámetros de seguimiento', () => {
  assert.equal(config.instagram, 'https://www.instagram.com/ko.logic/');
  assert.ok(html['index.html'].includes('href="https://www.instagram.com/ko.logic/"'));
  for (const src of Object.values(html)) assert.ok(!/utm_source/.test(src));
});

/* ---------- Accesibilidad ---------- */
test('toda imagen tiene alt, ancho y alto (evita saltos de diseño)', () => {
  for (const [p, src] of Object.entries(html)) {
    for (const img of tags(src, 'img')) {
      assert.notEqual(attr(img, 'alt'), undefined, `${p}: img sin alt: ${img}`);
      assert.ok(attr(img, 'width') && attr(img, 'height'), `${p}: img sin width/height: ${img}`);
    }
  }
});

test('toda ilustración SVG con role="img" tiene aria-label', () => {
  for (const [p, src] of Object.entries(html)) for (const svg of tags(src, 'svg').filter((t) => /role="img"/.test(t))) assert.ok(attr(svg, 'aria-label'), `${p}: ${svg.slice(0, 80)}`);
});

test('formulario: cada campo tiene su label, el honeypot está oculto y el envío tiene aria-live', () => {
  const src = html['index.html'];
  const form = src.match(/<form[\s\S]*?<\/form>/)[0];
  const fields = [...form.matchAll(/<(input|select|textarea)\b[^>]*\sid="([^"]+)"/g)].map((m) => m[2]);
  assert.deepEqual(fields.sort(), ['budget', 'company', 'consent', 'deadline', 'email', 'message', 'name', 'type', 'website']);
  // Una etiqueta asocia su campo con `for=` o envolviéndolo (ambas formas son válidas).
  const wrapped = [...form.matchAll(/<label\b[^>]*>(?:(?!<\/label>)[\s\S])*?<input[^>]*\sid="([^"]+)"/g)].map((m) => m[1]);
  for (const id of fields) assert.ok(new RegExp(`<label[^>]*for="${id}"`).test(form) || wrapped.includes(id), `falta label para #${id}`);
  assert.match(form, /class="hp" aria-hidden="true"/);
  assert.match(form, /id="website"[^>]*tabindex="-1"[^>]*autocomplete="off"/);
  assert.match(form, /id="form-status"[^>]*aria-live="polite"/);
  assert.match(form, /autocomplete="email"/);
  for (const k of ['f-name', 'f-email', 'f-message', 'f-consent']) assert.ok(form.includes(`id="${k}"`), k);
});

test('el menú móvil es un botón con aria-expanded y aria-controls válidos', () => {
  const src = html['index.html'];
  const btn = tags(src, 'button').find((t) => /menu-toggle/.test(t));
  assert.equal(attr(btn, 'aria-expanded'), 'false');
  assert.ok(ids(src).includes(attr(btn, 'aria-controls')));
});

/* ---------- Contraste de color (WCAG AA) ---------- */
const vars = Object.fromEntries([...css.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]));
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const pairs = [
  ['ink', 'white', 'texto principal'], ['ink-soft', 'white', 'texto secundario'], ['ink-soft', 'silver-100', 'texto secundario en sección gris'],
  ['white', 'pink-600', 'botón primario'], ['white', 'pink-700', 'botón primario hover'], ['pink-700', 'white', 'eyebrow y hover sobre blanco'],
  ['pink-700', 'silver-100', 'eyebrow y hover sobre gris'], ['pink-500', 'navy-900', 'eyebrow sobre oscuro'], ['pink-500', 'navy-950', 'acento sobre muy oscuro'],
  ['silver-200', 'navy-900', 'nav sobre header'], ['silver-300', 'navy-900', 'texto en sección oscura'], ['white', 'navy-900', 'título sobre oscuro'],
  ['silver-300', 'ink', 'footer'], ['silver-400', 'ink', 'footer inferior'], ['white', 'navy-700', 'botón oscuro'], ['navy-700', 'white', 'enlaces'],
  ['pink-700', 'white', 'mensajes de error'], ['white', 'ink', 'texto sobre negro'], ['navy-700', 'silver-100', 'tags sobre gris'],
];
for (const [fg, bg, why] of pairs) {
  test(`contraste AA ≥ 4.5: ${fg} sobre ${bg} (${why})`, () => {
    assert.ok(vars[fg] && vars[bg], 'variable inexistente');
    const r = ratio(vars[fg], vars[bg]);
    assert.ok(r >= 4.5, `${r.toFixed(2)}:1 (${vars[fg]} sobre ${vars[bg]})`);
  });
}
test('contraste: botón de WhatsApp (blanco sobre verde) ≥ 4.5', () => {
  for (const m of css.matchAll(/\.(?:btn|fab)--wa[^{]*\{[^}]*background:\s*(#[0-9a-fA-F]{6})/g)) assert.ok(ratio('#ffffff', m[1]) >= 4.5, `${m[1]} → ${ratio('#ffffff', m[1]).toFixed(2)}`);
});

/* ---------- CSS ---------- */
test('toda clase usada en el HTML tiene estilo definido (detecta errores de tipeo)', () => {
  const used = new Set();
  for (const src of Object.values(html)) for (const m of src.matchAll(/\sclass="([^"]+)"/g)) m[1].split(/\s+/).forEach((c) => used.add(c));
  const missing = [...used].filter((c) => !css.includes(`.${c}`));
  assert.deepEqual(missing, []);
});

test('el CSS respeta prefers-reduced-motion y tiene foco visible', () => {
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /:focus-visible/);
});

test('la paleta incluye azul y rosa del logo, plateado, blanco y negro', () => {
  for (const k of ['navy-700', 'pink-500', 'silver-300', 'white', 'ink']) assert.ok(vars[k], k);
});

/* ---------- Contenido pedido ---------- */
const home = text(html['index.html']);
test('Inicio: frase principal exacta y botones', () => {
  assert.match(home, /Desarrollamos soluciones digitales a medida para tu negocio/);
  assert.ok(html['index.html'].includes('>Ver proyectos</a>'));
  assert.ok(html['index.html'].includes('>Solicitar presupuesto</a>'));
  assert.match(html['index.html'], /alt="Logo de Kologic"/);
});

test('Inicio: vista previa de proyectos destacados enlaza a páginas existentes', () => {
  const previews = tags(html['index.html'], 'a').filter((t) => /class="preview /.test(t));
  assert.ok(previews.length >= 2);
  for (const a of previews) assert.ok(existsSync(join(SITE, attr(a, 'href'))), attr(a, 'href'));
});

test('Sobre Kologic: modalidad remota (país y exterior) y presencial (Posadas, Misiones, parte de Corrientes)', () => {
  assert.match(home, /Sobre Kologic/);
  for (const w of ['remota', 'Argentina', 'otros países', 'presencial', 'Posadas', 'toda la provincia de Misiones', 'parte de Corrientes']) assert.ok(home.includes(w), w);
});

test('remoto/presencial: se dice en un solo lugar (Sobre Kologic) y en ningún otro texto visible; la ubicación sigue en los datos estructurados', () => {
  const src = html['index.html'];
  assert.equal((src.match(/<div class="remote">/g) || []).length, 1);
  for (const [page, s] of Object.entries(html)) {
    const visible = text(s.replace(/<div class="remote">[\s\S]*?<\/div>/, ''));
    assert.ok(!/presencial|remot[oa]/i.test(visible), `${page}: menciona remoto/presencial fuera de «Sobre Kologic»`);
  }
  const a = faqs.find((f) => /otras provincias/.test(f.q)).a;
  assert.ok(/otras provincias/.test(a) && !/remot|presencial|Corrientes|Posadas/i.test(a));
  const org = [...src.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1])).find((o) => o['@type'] === 'ProfessionalService');
  assert.equal(org.address.addressLocality, 'Posadas');
  assert.equal(org.address.addressRegion, 'Misiones');
  assert.ok(org.areaServed.some((x) => x.name === 'Corrientes'));
});

test('modalidad de cobro: pago único (de una vez o en cuotas) o pago inicial + cuotas mensuales o anuales', () => {
  const t = text(html['index.html']);
  assert.ok(t.includes('Cómo se paga'));
  for (const w of ['Pago único', 'todo de una vez o en cuotas', 'Pago inicial y cuotas', 'mensual o anual']) assert.ok(t.includes(w), w);
  assert.equal((html['index.html'].match(/class="pay__card"/g) || []).length, 2);
  const a = faqs.find((f) => /proceso de pago/.test(f.q)).a;
  assert.ok(a.includes('una sola vez') && a.includes('cuotas') && a.includes('mensual o anual'));
});

test('el último enlace del pie no queda tapado por el botón flotante (espacio inferior suficiente)', () => {
  const m = css.match(/\.footer \{[^}]*padding-block:\s*(\d+)px\s+(\d+)px/);
  assert.ok(m, 'no se encontró el padding del pie');
  const fab = css.match(/\.fab \{[^}]*bottom:\s*(\d+)px[^}]*min-height:\s*(\d+)px/);
  assert.ok(Number(m[2]) >= Number(fab[1]) + Number(fab[2]) + 16, `pie ${m[2]}px vs botón ${Number(fab[1]) + Number(fab[2])}px`);
});

test('Servicios: los 6 pedidos y los demás del portfolio', () => {
  assert.equal(services.length, 12);
  for (const t of ['Integración de pagos', 'Automatización de datos y reportes', 'Automatizaciones con IA', 'Testing y calidad', 'Consultoría técnica', 'Migración de sistemas']) assert.ok(services.some((s) => s.title === t), t);
  assert.equal(new Set(services.map((s) => s.id)).size, services.length);
  for (const s of services) assert.ok(home.includes(s.title), s.title);
  for (const t of ['Sistemas web a medida', 'Páginas web institucionales', 'Tiendas online y e-commerce', 'Sistemas de gestión y paneles administrativos', 'Automatizaciones e integraciones', 'Mantenimiento y mejoras']) assert.ok(services.some((s) => s.title.startsWith(t)), t);
});

test('Proyectos: una tarjeta por proyecto con imagen, nombre, descripción, tecnologías y botón', () => {
  assert.equal(projects.length, 7);
  const cards = html['index.html'].match(/<article class="pcard[\s\S]*?<\/article>/g) || [];
  assert.equal(cards.length, projects.length);
  for (const [i, c] of cards.entries()) {
    if (projects[i].images) {
      const img = c.match(/<img class="cover"[^>]*>/)[0];
      assert.ok(attr(img, 'alt') && attr(img, 'width') && attr(img, 'height'), 'portada real con alt, ancho y alto');
    } else assert.match(c, /<svg class="mock"/);
    assert.ok(c.includes(projects[i].name));
    assert.ok(c.includes(projects[i].short));
    assert.match(c, /class="tech"/);
    assert.match(c, new RegExp(`href="proyectos/${projects[i].slug}\\.html"`));
    assert.match(c, /Ver detalles/);
  }
});

for (const p of projects) {
  test(`Proyecto «${p.slug}»: página con todas las secciones pedidas`, () => {
    const src = html[`proyectos/${p.slug}.html`];
    const t = text(src);
    for (const h of ['Descripción y objetivo', 'El problema que resuelve', 'Funcionalidades principales', 'Tecnologías utilizadas', 'Capturas de pantalla', p.askLabel || 'Solicitar un sistema similar']) assert.ok(t.includes(h), h);
    if (p.noDemo) assert.ok(!/Abrir demo funcional|Pedir acceso a la demo|Pedir una presentación/.test(t), 'sin botón de demo');
    else assert.ok(/Abrir demo funcional|Pedir acceso a la demo|Ver la tienda en producción|Pedir una presentación en vivo|Ver el portafolio en vivo/.test(t), 'enlace a demo');
    assert.equal((src.match(/<figure class="shot">/g) || []).length, p.images ? p.images.length : 3);
    assert.equal((src.match(/<li>[^<]+<\/li>/g) || []).length >= p.features.length, true);
    assert.match(src, /href="\.\.\/index\.html\?proyecto=[^"]+#contacto"/);
    if (p.images) assert.ok(!src.includes('(ilustrativa)'), 'las capturas reales no se rotulan como ilustrativas');
    else assert.ok(src.includes('(ilustrativa)'), 'las capturas ilustrativas deben rotularse como tales');
    assert.match(src, /BreadcrumbList/);
  });
  test(`Proyecto «${p.slug}»: datos completos`, () => {
    assert.ok(p.features.length >= 5 && p.tech.length >= 2 && p.goal && p.problem && p.short && mockTypes.includes(p.mock));
    assert.match(p.slug, /^[a-z0-9-]+$/);
  });
}

test('«Solicitar un sistema similar» precarga nombre y tipo reales del proyecto en el formulario', () => {
  for (const p of projects) {
    assert.ok(projectTypes.includes(p.formType), `${p.slug}: formType «${p.formType}» no es una opción del formulario`);
    const src = html[`proyectos/${p.slug}.html`];
    assert.ok(src.includes(`proyecto=${encodeURIComponent(p.name)}&amp;tipo=${encodeURIComponent(p.formType)}`) || src.includes(`proyecto=${encodeURIComponent(p.name)}&tipo=${encodeURIComponent(p.formType)}`), `${p.slug}: enlace sin nombre/tipo`);
  }
  assert.ok(html['index.html'].includes('Tienda online / e-commerce'), 'la opción existe en el select');
});

test('el slug de cada proyecto es único', () => {
  assert.equal(new Set(projects.map((p) => p.slug)).size, projects.length);
});

test('Syntri: datos reales, demo, código y cifras verificadas', () => {
  const p = projects.find((x) => x.slug === 'syntri');
  assert.ok(p);
  assert.equal(p.demo, 'https://sistem-syntri.vercel.app/login?redirect=/');
  assert.equal(p.repo, 'https://github.com/emilykohler12/sistem_Syntri');
  const src = html['proyectos/syntri.html'];
  assert.ok(src.includes('Abrir demo funcional') && src.includes('Ver código en GitHub'));
  assert.ok(src.includes(p.demo) && src.includes(p.repo));
  for (const [n, l] of [['3', 'plataformas de destino'], ['5', 'permisos asignables por rol'], ['59', 'pruebas automáticas']]) assert.ok(p.stats.some(([a, b]) => a === n && b === l), l);
  const t = text(src);
  for (const w of ['Slack', 'Discord', 'Telegram', 'Gmail, WhatsApp o Instagram', 'sin imágenes ni archivos']) assert.ok(t.includes(w), w);
});

test('Syntri: no se promete envío instantáneo ni escala a muchos servidores', () => {
  const t = text(html['proyectos/syntri.html']);
  assert.ok(!/instant[áa]ne|tiempo real|escala (a|para) muchos|millones/i.test(t), 'afirmación que el código no respalda');
});

test('SEGURIDAD: no se publican correos personales, cuentas de prueba ajenas ni claves', () => {
  const all = [];
  (function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (/\.(html|css|js|xml|txt)$|^_headers$/.test(f)) all.push(p); } })(SITE);
  const bad = /admin@freddymotos|pruebared|testred|ADMIN_PASSWORD|neon\.tech|mongodb(\+srv)?:\/\/|xoxb-|xoxp-|BREVO_API|api[_-]?key|BEGIN (RSA )?PRIVATE/i;
  // Lista blanca: cualquier otro correo en el sitio publicado falla (así no hace falta nombrar correos personales acá).
  const okEmails = ['kologic6@gmail.com', 'admin@clinix.com', 'admin@syntri.local', 'nombre@empresa.com' /* ejemplo del mensaje de error del formulario */];
  for (const f of all) {
    const s = readFileSync(f, 'utf8');
    assert.ok(!bad.test(s), f);
    for (const m of s.matchAll(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g)) assert.ok(okEmails.includes(m[0].toLowerCase()), `correo no permitido en ${f}: ${m[0].replace(/^.{3}/, '***')}`);
  }
});

test('SEGURIDAD: el código del repositorio no trae claves, tokens, llaves privadas ni cadenas de conexión con contraseña', () => {
  const secret = /AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{36,}|xox[baprs]-[A-Za-z0-9-]{10,}|sk_live_[A-Za-z0-9]{10,}|sk-ant-[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{35}|AQ\.A[A-Za-z0-9_-]{20,}|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.|-----BEGIN [A-Z ]*PRIVATE KEY-----|(mongodb(\+srv)?|postgres(ql)?|mysql):\/\/[^\s'"\/:@]+:[^\s'"@]+@/;
  const self = fileURLToPath(import.meta.url).toLowerCase();
  const skip = ['node_modules', 'site', '.git', 'videos-pendientes-de-revisar'];
  const bad = [];
  (function walk(d) {
    for (const f of readdirSync(d)) {
      if (skip.includes(f)) continue;
      const p = join(d, f);
      if (statSync(p).isDirectory()) { walk(p); continue; }
      if ((/^\.env(\.|$)/.test(f) && f !== '.env.example') || /\.(pem|key)$/.test(f)) bad.push(`archivo de secretos: ${p}`);
      else if (/\.(mjs|js|css|md|json|html|ya?ml|txt|toml)$/.test(f) && p.toLowerCase() !== self && secret.test(readFileSync(p, 'utf8'))) bad.push(`posible clave en ${p}`);
    }
  })(ROOT);
  assert.deepEqual(bad, []);
});

test('cuentas de prueba: solo las dos autorizadas (Clinix y Syntri), solo en su página y nunca en la home', () => {
  const withAccount = projects.filter((p) => p.demoAccount);
  assert.deepEqual(withAccount.map((p) => p.slug).sort(), ['clinix', 'syntri']);
  assert.deepEqual(withAccount.map((p) => [p.demoAccount.user, p.demoAccount.pass]).sort(), [['admin@clinix.com', 'Admin1234'], ['admin@syntri.local', 'admin123']]);
  for (const p of projects) {
    const src = html[`proyectos/${p.slug}.html`];
    if (p.demoAccount) {
      assert.ok(src.includes(`<code>${p.demoAccount.user}</code>`) && src.includes(`<code>${p.demoAccount.pass}</code>`), p.slug);
      assert.ok(src.includes('class="account"'));
    } else assert.ok(!src.includes('class="account"'), `${p.slug} no debería mostrar cuenta`);
  }
  for (const f of ['index.html', 'politica-de-privacidad.html', '404.html']) assert.ok(!/admin@clinix|admin@syntri|Admin1234|admin123/.test(html[f]), `credenciales en ${f}`);
  const clinix = html['proyectos/clinix.html'], syntri = html['proyectos/syntri.html'];
  assert.ok(!/admin@syntri|admin123/.test(clinix) && !/admin@clinix|Admin1234/.test(syntri), 'cada página muestra solo su cuenta');
});

test('Clinix: datos reales, demo, código, cuenta de prueba y alcance honesto', () => {
  const p = projects.find((x) => x.slug === 'clinix');
  assert.equal(p.demo, 'https://sistema-clinix.vercel.app/');
  assert.equal(p.repo, 'https://github.com/emilykohler12/Sistema-clinix');
  const src = html['proyectos/clinix.html'];
  assert.ok(src.includes(p.demo) && src.includes(p.repo));
  const t = text(src);
  for (const w of ['DNI', 'obra social', 'día, semana, mes y año', 'no asistió', 'código de 6 dígitos', 'nada se borra de verdad', 'solo si el paciente tiene un mail cargado', 'No incluye facturación']) assert.ok(t.includes(w), w);
  assert.ok(!/cumple (con )?(la )?(ley|norma)|HIPAA|100% seguro|historia clínica electrónica certificada/i.test(t), 'no se promete cumplimiento normativo');
  assert.equal(p.images.length, 5);
});

test('LexSearch: las fases 5 y 6 se describen con lo que dice el README del proyecto, no con suposiciones', () => {
  const p = projects.find((x) => x.slug === 'lexsearch');
  const joined = p.features.join(' ');
  for (const w of ['carátula', 'juzgado', 'Próxima', 'Hoy', 'frase que las respalda', 'nada se guarda hasta que confirmás', 'de 2 a 8 documentos', 'enlace al original', 'copiás como resumen']) assert.ok(joined.includes(w), w);
  assert.ok(!/fase 7|v[íi]gía normativo|Bolet[íi]n/i.test(JSON.stringify(p)), 'la fase 7 (en progreso) no se muestra');
});

test('Portafolios: figuran como servicio y como proyecto de ejemplo (el de Emily), sin demo ni datos personales de contacto', () => {
  assert.ok(services.some((s) => s.title === 'Páginas web institucionales y portafolios' && /portafolios profesionales/.test(s.text)));
  const p = projects.find((x) => x.slug === 'portafolio');
  const src = html['proyectos/portafolio.html'];
  const t = text(src);
  assert.ok(!p.noDemo && !p.demoAccount && !p.videos);
  assert.equal(p.demo, 'https://porfafoliokohleremily.vercel.app/');
  assert.equal(p.repo, 'https://github.com/emilykohler12/portfolio');
  assert.ok(src.includes(p.demo) && src.includes(p.repo) && t.includes('Ver el portafolio en vivo') && t.includes('Ver código en GitHub'));
  assert.ok(t.includes('Quiero un portafolio como este') && !t.includes('Solicitar un sistema similar'));
  assert.ok(t.includes('Emily Kohler') && t.includes('En Kologic armamos portafolios profesionales para clientes'));
  for (const w of ['Next.js 16', 'React 19', 'Tailwind CSS 4', 'Se adapta a la pantalla del celular']) assert.ok(t.includes(w), w);
  assert.equal(p.images.length, 7);
  assert.ok(p.images.some((i) => i.caption === 'Versión celular'));
  assert.ok(!/3751 574185|admin@/i.test(src), 'sin correo ni teléfono personales en la página del proyecto');
  assert.equal(outboundLinks(src), 2, 'solo el sitio en vivo y el código');
});

function outboundLinks(src) {
  return tags(src, 'a').map((a) => attr(a, 'href') || '').filter((h) => /vercel|onrender|github/.test(h)).length;
}

test('Nexa: demo y captura real tomadas del portfolio, sin cuenta ni repositorio', () => {
  const p = projects.find((x) => x.slug === 'nexa');
  const src = html['proyectos/nexa.html'];
  assert.equal(p.demo, 'https://lorenestudiodebelleza.vercel.app/'); assert.ok(src.includes(p.demo));
  assert.ok(p.images.length >= 1 && !p.repo && !p.demoAccount && !p.demoNote, 'Nexa no lleva nota de demo');
  assert.ok(!text(src).includes('Demo pública de un estudio de belleza'));
  assert.ok(src.includes('Mercado Pago'));
});

test('LexSearch: solo lo ya hecho, sin demo ni repositorio, con alcance honesto y presentación en vivo', () => {
  const p = projects.find((x) => x.slug === 'lexsearch');
  const src = html['proyectos/lexsearch.html'];
  const t = text(src);
  assert.ok(!p.demo && !p.demoAccount && !p.videos, 'sin demo pública, cuenta ni videos');
  assert.equal(p.repo, 'https://github.com/emilykohler12/lexsearch');
  assert.ok(t.includes('Ver código en GitHub'));
  const outbound = tags(src, 'a').map((a) => attr(a, 'href') || '').filter((h) => /vercel|onrender|github/.test(h));
  assert.deepEqual(outbound, ['https://github.com/emilykohler12/lexsearch'], 'solo el enlace al código');
  assert.ok(t.includes('Pedir una presentación en vivo') && !t.includes('Pedir acceso a la demo'));
  assert.match(src, /demo=pres#contacto/);
  assert.ok(src.includes('class="shot"') && !src.includes('(ilustrativa)') && p.images.length >= 1);
  // Lo que está hecho (fases 0 a 6)
  for (const w of ['por significado y por palabras exactas', 'se resalta la frase', 'OCR', 'carta documento', 'Fichas de cliente', 'nunca la IA', 'Expedientes con línea de tiempo', 'Importar actuaciones con IA', 'Detector de contradicciones', 'de 2 a 8 documentos', 'no es exhaustiva', 'Gemini']) assert.ok(t.includes(w), w);
  // Lo que NO existe o no se terminó: no se menciona
  assert.ok(!/Bolet[íi]n Oficial|v[íi]gilante normativo|vig[íi]a normativo|simulador de audiencia|probabilidad de [ée]xito|anonimiz|hosting|Tailscale/i.test(t), 'fase no terminada mencionada como hecha');
  // Promesas que el propio informe desaconseja
  assert.ok(!/siempre correct|reemplaz(a|o) (al|a la) (abogado|profesional)(?! )|información (legal )?actualizada|listo para producci[óo]n|multiusuario|escala a muchos/i.test(t.replace('no reemplaza al abogado', '')), 'promesa no respaldada');
  for (const w of ['prototipo', 'sin cuentas ni login', 'no reemplaza al abogado', 'No trae leyes incluidas']) assert.ok(t.includes(w), w);
  for (const w of ['A Gemini (Google) viajan', 'se envían a Gemini', 'activar la facturación', 'avisos de plazos son solo en pantalla']) assert.ok(!t.includes(w), `frase borrada que volvió: ${w}`);
  assert.ok(!/GEMINI_API_KEY|AQ\.A|lexsearch_dev|hotmail/i.test(src), 'datos internos del proyecto');
});

test('freddymotos (en producción): sitio y código reales, 8 capturas, sin cuenta de admin y sin promesas que el código no cumple', () => {
  const p = projects.find((x) => x.slug === 'ecommerce-repuestos-motos');
  const src = html['proyectos/ecommerce-repuestos-motos.html'];
  assert.equal(p.demo, 'https://freddymotosweb.onrender.com/');
  assert.equal(p.repo, 'https://github.com/emilykohler12/freddymotos-web');
  assert.ok(src.includes(p.demo) && src.includes(p.repo) && src.includes('Ver la tienda en producción') && src.includes('En producción'));
  assert.equal(p.images.length, 8);
  assert.ok(!p.demoAccount && !src.includes('class="account"'), 'la cuenta de admin de este proyecto no se publica');
  const t = text(src);
  for (const w of ['Mercado Pago', 'WhatsApp', 'llevá X, pagá Y', 'precio fijo según la zona', 'copia de seguridad semanal', 'Alcance actual', 'no incluye facturación electrónica']) assert.ok(t.includes(w), w);
  // Cosas que la ficha técnica dice que NO conviene prometer
  assert.ok(!/facturaci[óo]n (electr[óo]nica )?(autom|incluida)|AFIP|stock autom[áa]tico|pagos 100%|filtro por modelo|env[íi]os inteligentes|reembolsos autom/i.test(t.replace('no incluye facturación electrónica', '')), 'promesa no respaldada');
  assert.ok(!/admin@freddymotos|admin123/.test(src));
});

test('Sistema del Ministerio: prototipo sin demo pública, con presentación en vivo y enlace al código; solo lo que dicen sus documentos', () => {
  const p = projects.find((x) => x.slug === 'sistema-ministerio');
  const src = html['proyectos/sistema-ministerio.html'];
  const t = text(src);
  assert.ok(!p.demo && !p.demoAccount && !p.videos && p.presentation, 'sin demo, cuenta ni videos');
  assert.equal(p.repo, 'https://github.com/emilykohler12/sistema_ministerio');
  assert.equal(outboundLinks(src), 1, 'solo el enlace al código');
  assert.ok(src.includes(p.repo) && t.includes('Ver código en GitHub') && t.includes('Pedir una presentación en vivo') && !t.includes('Pedir acceso a la demo'));
  for (const w of ['Ministerio de Educación de Misiones', 'Prototipo', 'nivel educativo', 'Las instituciones no inician sesión', 'enlaces de descarga temporales', 'Supabase']) assert.ok(t.includes(w), w);
  // No se promete lo que un prototipo sin publicar no tiene
  // (se revisan los datos del proyecto: la página lista las etiquetas de otros proyectos, como «En producción»)
  assert.ok(!/en producci[óo]n|ya lo usan|miles de|multirol|escuelas de toda/i.test(JSON.stringify(p)), 'promesa no respaldada');
  // Sin datos de personas ni del repositorio
  assert.ok(!/hotmail|service_role|\.env/i.test(src), 'datos personales o internos');
});

test('los 7 proyectos, en orden: consultorios, notificaciones, repuestos de motos, estética, LexSearch, portafolio y Ministerio', () => {
  assert.deepEqual(projects.map((p) => p.slug), ['clinix', 'syntri', 'ecommerce-repuestos-motos', 'nexa', 'lexsearch', 'portafolio', 'sistema-ministerio']);
  const hero = html['index.html'].match(/<div class="hero__visual"[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/)[0];
  assert.ok(hero.includes('proyectos/clinix.html') && hero.includes('proyectos/syntri.html'));
});

// Lee ancho y alto de un .webp (lossy VP8, lossless VP8L o extendido VP8X)
function webpSize(buf) {
  assert.equal(buf.toString('ascii', 0, 4), 'RIFF'); assert.equal(buf.toString('ascii', 8, 12), 'WEBP');
  const kind = buf.toString('ascii', 12, 16);
  if (kind === 'VP8 ') return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
  if (kind === 'VP8X') return [1 + buf.readUIntLE(24, 3), 1 + buf.readUIntLE(27, 3)];
  const b = buf.readUInt32LE(21); return [1 + (b & 0x3fff), 1 + ((b >> 14) & 0x3fff)];
}
test('capturas: el ancho y alto declarados en data.mjs coinciden con el archivo real (evita saltos de diseño)', () => {
  for (const p of projects) for (const i of p.images || []) {
    assert.ok(existsSync(join(SITE, i.src)), i.src);
    assert.deepEqual(webpSize(readFileSync(join(SITE, i.src))), [i.w, i.h], i.src);
    assert.ok(i.alt.length >= 20, `alt muy corto: ${i.src}`);
  }
});

test('videos: no se publica ningún .mp4 sin revisar; si hay videos, preload="none", poster y archivo existente', () => {
  const src = html['proyectos/syntri.html'];
  const vids = src.match(/<video\b[^>]*>/g) || [];
  assert.equal(vids.length, (projects.find((x) => x.slug === 'syntri').videos || []).length);
  const published = [];
  (function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (/\.(mp4|mov|webm)$/.test(f)) published.push(f); } })(SITE);
  assert.equal(published.length, vids.length, `videos publicados sin referencia: ${published}`);
  for (const v of vids) {
    assert.ok(attr(v, 'preload') === 'none' && /poster="\.\.\/assets\/syntri\/[^"]+\.webp"/.test(v) && attr(v, 'aria-label'), v);
  }
  for (const m of src.matchAll(/<source src="([^"]+)" type="video\/mp4">/g)) assert.ok(existsSync(join(SITE, 'proyectos', m[1])), m[1]);
  assert.match(read('_headers'), /media-src 'self'/);
});

test('formulario: envía a Formspree (https) y la política de seguridad permite solo ese destino', () => {
  assert.equal(config.formEndpoint, 'https://formspree.io/f/xyekognb');
  assert.ok(html['index.html'].includes(`data-endpoint="${config.formEndpoint}"`));
  assert.match(read('_headers'), /connect-src 'self' https:\/\/formspree\.io(;|\s|$)/);
  assert.ok(!/connect-src[^;]*\*/.test(read('_headers')), 'connect-src no debe ser abierto');
  const js = read('main.js');
  assert.match(js, /'Content-Type': 'application\/json', Accept: 'application\/json'/, 'Formspree exige Accept: application/json para responder sin redirigir');
});

test('contacto: WhatsApp y LinkedIn de Kologic cargados y enlazados', () => {
  assert.equal(config.whatsapp, '5493751574185');
  const src = html['index.html'];
  assert.ok(src.includes('https://wa.me/5493751574185?text='));
  assert.ok(src.includes('href="https://www.linkedin.com/in/emily-noral%C3%AD-kohler-17ba62290"'));
  assert.ok(html['proyectos/syntri.html'].includes('wa.me/5493751574185'));
});

test('«sin cargo»: consultas y presupuestos se anuncian sin cargo en hero, proceso, FAQ y formulario', () => {
  const t = text(html['index.html']);
  assert.ok((t.match(/sin cargo/g) || []).length >= 5, 'aparece pocas veces');
  for (const w of ['Consultas y presupuestos sin cargo', 'Todas las consultas y el envío del presupuesto son sin cargo', 'Recibís el presupuesto por escrito, también sin cargo']) assert.ok(t.includes(w), w);
  assert.ok(!/primera consulta sin cargo/i.test(t), 'el texto viejo ya no corresponde');
});

test('Cómo trabajamos: 6 pasos en orden', () => {
  assert.equal(steps.length, 6);
  const src = html['index.html'];
  const li = src.match(/<li class="step reveal">/g) || [];
  assert.equal(li.length, 6);
  let last = -1;
  for (const s of steps) { const at = src.indexOf(s.title); assert.ok(at > last, s.title); last = at; }
});

test('Contacto: campos pedidos, opcionales, remoto, correo e Instagram', () => {
  const src = html['index.html'];
  for (const l of ['Nombre', 'Correo electrónico', 'Empresa o negocio', 'Descripción del proyecto', 'Tipo de proyecto', 'Plazo', 'Presupuesto aproximado']) assert.ok(src.includes(l), l);
  assert.match(home, /Trabajamos de forma remota/);
  assert.ok(src.includes('kologic6@gmail.com'));
  assert.ok(src.includes('Instagram @ko.logic'));
});

test('FAQ: las 6 preguntas pedidas con <details> y datos estructurados FAQPage', () => {
  assert.equal(faqs.length, 6);
  const src = html['index.html'];
  assert.equal((src.match(/<details>/g) || []).length, 6);
  for (const q of ['¿Cuánto cuesta desarrollar un sistema?', '¿Cuánto tiempo demora un proyecto?', '¿Puedo solicitar funcionalidades personalizadas?', '¿Trabajás con clientes de otras provincias o países?', '¿Ofrecés mantenimiento después de la entrega?', '¿Cómo es el proceso de pago?']) assert.ok(src.includes(q), q);
  const ld = [...src.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const faq = ld.find((o) => o['@type'] === 'FAQPage');
  assert.equal(faq.mainEntity.length, 6);
});

test('datos estructurados: JSON-LD válido en todas las páginas', () => {
  for (const [p, src] of Object.entries(html)) for (const m of src.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) assert.doesNotThrow(() => JSON.parse(m[1]), p);
  const org = [...html['index.html'].matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1])).find((o) => o['@type'] === 'ProfessionalService');
  assert.equal(org.name, 'Kologic');
  assert.ok(org.sameAs.includes(config.instagram));
});

test('Política de privacidad: menciona Ley 25.326, derechos y contacto', () => {
  const t = text(html['politica-de-privacidad.html']);
  assert.match(t, /25\.326/);
  assert.match(t, /suprimirlos/);
  assert.ok(t.includes(config.email));
});

test('Pie de página: enlaces a Inicio, Servicios, Proyectos y Contacto', () => {
  const f = html['index.html'].match(/<footer[\s\S]*<\/footer>/)[0];
  for (const l of ['Inicio', 'Servicios', 'Proyectos', 'Contacto']) assert.match(f, new RegExp(`>${l}</a>`));
});

/* ---------- Integraciones opcionales (WhatsApp / analítica) ---------- */
test('sin WhatsApp configurado no hay enlaces wa.me rotos', () => {
  assert.equal(config.whatsapp === '' ? waLink() : 'skip', config.whatsapp === '' ? '' : 'skip');
  if (config.whatsapp === '') for (const src of Object.values(html)) assert.ok(!src.includes('wa.me'));
});

test('con WhatsApp configurado se generan enlaces correctos y el botón flotante cambia', () => {
  const prev = config.whatsapp;
  try {
    config.whatsapp = '5491112345678';
    assert.equal(waLink(), `https://wa.me/5491112345678?text=${encodeURIComponent(config.whatsappMessage)}`);
    const page = homePage();
    assert.ok(page.includes('class="fab fab--wa"'));
    assert.ok((page.match(/https:\/\/wa\.me\/5491112345678/g) || []).length >= 2);
  } finally { config.whatsapp = prev; }
});

test('la analítica solo se carga si hay dominio configurado', () => {
  const prev = config.plausibleDomain;
  try {
    config.plausibleDomain = '';
    assert.ok(!homePage().includes('plausible.io'));
    config.plausibleDomain = 'kologic.com';
    assert.match(homePage(), /<script defer data-domain="kologic\.com" src="https:\/\/plausible\.io\//);
  } finally { config.plausibleDomain = prev; }
});

test('escapado: datos con HTML no rompen la página', () => {
  const prev = config.instagramHandle;
  try {
    config.instagramHandle = '<img src=x onerror=alert(1)>';
    assert.ok(!homePage().includes('<img src=x'));
  } finally { config.instagramHandle = prev; }
});

/* ---------- Assets, SEO técnico, seguridad y peso ---------- */
test('íconos e ilustraciones: todos generan SVG válido y los inexistentes fallan con claridad', () => {
  for (const n of iconNames) assert.match(icon(n), /^<svg[\s\S]*<\/svg>$/);
  for (const t of mockTypes) assert.match(mockup(t, 'x'), /^<svg[\s\S]*<\/svg>$/);
  assert.throws(() => icon('nope'), /inexistente/);
  assert.throws(() => mockup('nope', 'x'), /inexistente/);
});

test('sitemap.xml lista todas las páginas indexables y robots.txt lo referencia', () => {
  const sm = read('sitemap.xml');
  for (const p of projects) assert.ok(sm.includes(`/proyectos/${p.slug}.html`));
  assert.ok(sm.includes('/politica-de-privacidad.html'));
  assert.ok(!sm.includes('404'));
  assert.match(read('robots.txt'), new RegExp(`Sitemap: ${config.siteUrl}/sitemap.xml`));
});

test('el 404 no se indexa', () => assert.match(html['404.html'], /noindex/));

test('cabeceras de seguridad: CSP restrictiva, sin framing, nosniff', () => {
  const h = read('_headers');
  assert.match(h, /Content-Security-Policy: default-src 'self'/);
  assert.match(h, /frame-ancestors 'none'/);
  assert.match(h, /X-Content-Type-Options: nosniff/);
  assert.ok(!/script-src[^;]*unsafe-inline/.test(h), 'no se permite JS inline');
  assert.ok(!/<script(?![^>]*\ssrc=)(?![^>]*ld\+json)[^>]*>/.test(html['index.html']), 'no debe haber <script> inline ejecutable');
});

test('no se publican los originales pesados ni archivos de desarrollo', () => {
  const all = [];
  (function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : all.push(p); } })(SITE);
  assert.ok(!all.some((f) => /orig-\d\.jpg|\.mjs$|package\.json|node_modules/.test(f)));
});

test('rendimiento: presupuesto de peso', () => {
  const size = (rel) => statSync(join(SITE, rel)).size;
  for (const p of pages) assert.ok(size(p) < 60 * 1024, `${p} pesa ${(size(p) / 1024).toFixed(0)} KB`);
  assert.ok(size('styles.css') < 30 * 1024, 'CSS < 30 KB');
  assert.ok(size('main.js') + size('form-logic.js') < 15 * 1024, 'JS < 15 KB');
  assert.ok(size('assets/logo.webp') < 40 * 1024, 'logo < 40 KB');
  assert.ok(size('assets/og-image.jpg') < 200 * 1024);
});

test('la fuente se sirve desde el propio sitio (sin pedir a Google en cada visita)', () => {
  assert.ok(!/fonts\.(googleapis|gstatic)\.com/.test(css + html['index.html']));
  assert.match(css, /font-display:\s*swap/);
});

test('JS: no usa eval/innerHTML con datos del usuario y la carga de scripts es local', () => {
  const js = readFileSync(join(SITE, 'main.js'), 'utf8') + readFileSync(join(SITE, 'form-logic.js'), 'utf8');
  assert.ok(!/\beval\(|new Function\(|innerHTML|document\.write/.test(js));
});
