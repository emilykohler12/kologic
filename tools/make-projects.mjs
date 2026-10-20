// Prepara las imágenes de los proyectos (WebP optimizadas). Tapa nombres/correos personales con datos de ejemplo.
// Uso: node tools/make-projects.mjs
// Syntri: se usan las capturas originales (la cuenta admin de prueba puede verse); solo el panel de usuarios se retoca.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const HOME = 'C:/Users/Emily Kohler';
const CLINIX = `${HOME}/Documents/proyectos/clinix`;
const SYNTRI = `${HOME}/Documents/proyectos/syntri`;
const PORTFOLIO = `${HOME}/portfolio/public/projects`;
const FONT = 'font-family="Segoe UI, Arial, Helvetica, sans-serif"';

// Tapa una zona con el color de fondo que hay a su alrededor y escribe un texto de ejemplo.
async function render(file, out, patches = []) {
  const img = sharp(file);
  const { width, height } = await img.metadata();
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = (x, y) => { const i = (y * info.width + x) * 3; return `rgb(${data[i]},${data[i + 1]},${data[i + 2]})`; };
  const svg = patches.map((p) => {
    const bg = p.bg || px(p.x + 2, p.y + 2); // color real de fondo (lee un píxel dentro de la zona)
    return `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="${bg}"/><text x="${p.tx ?? p.x + 4}" y="${p.ty}" ${FONT} font-size="${p.size}" font-weight="${p.weight ?? 400}" fill="${p.color}">${p.text}</text>`;
  }).join('');
  let pipeline = sharp(file);
  if (svg) pipeline = pipeline.composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${svg}</svg>`) }]);
  await pipeline.webp({ quality: 84 }).toFile(out);
  console.log(out, width, height);
}

for (const d of ['clinix', 'nexa', 'freddymotos', 'syntri', 'lexsearch']) mkdirSync(`src/assets/${d}`, { recursive: true });

// --- Clinix ---
await render(`${CLINIX}/clinixlogin.png`, 'src/assets/clinix/ingreso.webp');
await render(`${CLINIX}/Captura de pantalla 2026-10-08 192334.png`, 'src/assets/clinix/pacientes.webp', [
  { x: 300, y: 744, w: 110, h: 19, text: 'Dra. Ana López', size: 12.5, color: '#6b7280', ty: 758 },
]);
const chip = (x, w, faded) => ({ bg: faded ? undefined : '#fdeded', x: x + 3, y: 198, w: w - 6, h: 15, text: '09:00 a. m. ana…', size: 11.5, color: faded ? '#e3a8a3' : '#b42318', ty: 210 });
await render(`${CLINIX}/Captura de pantalla 2026-10-08 192342.png`, 'src/assets/clinix/calendario.webp', [chip(150, 112, true), chip(404, 116, false), chip(535, 114, false), chip(663, 113, false)]);
await render(`${CLINIX}/Captura de pantalla 2026-10-08 192412.png`, 'src/assets/clinix/turno.webp');
await render(`${CLINIX}/Captura de pantalla 2026-10-08 192852.png`, 'src/assets/clinix/oscuro.webp');

// --- Syntri: originales (mensajes e ingreso) y panel con las cuentas de prueba de usuarios ocultas ---
await render(`${SYNTRI}/loginsyntri.png`, 'src/assets/syntri/ingreso.webp');
await render(`${SYNTRI}/syntri1.png`, 'src/assets/syntri/mensajes.webp');
await render(`${SYNTRI}/syntri3.png`, 'src/assets/syntri/panel.webp', [
  { x: 14, y: 724, w: 200, h: 24, bg: '#ffffff', text: 'ana@ejemplo.com', size: 14.5, weight: 700, tx: 19, ty: 741, color: '#111827' },
  { x: 14, y: 761, w: 210, h: 24, bg: '#ffffff', text: 'luis@ejemplo.com', size: 14.5, weight: 700, tx: 19, ty: 778, color: '#111827' },
]);

// --- Nexa y freddymotos: imágenes ya publicadas en el portfolio ---
await render(`${PORTFOLIO}/nexa.webp`, 'src/assets/nexa/portada.webp');
// freddymotos: capturas de la tienda en producción (sin datos personales ni de clientes)
const FM = `${HOME}/Documents/proyectos/paginafreddyfotos/ig`;
for (const [file, name] of [
  ['Captura de pantalla 2026-10-16 230054.png', 'inicio'],
  ['Captura de pantalla 2026-10-16 235647.png', 'categorias'],
  ['Captura de pantalla 2026-10-16 235709.png', 'repuesto'],
  ['Captura de pantalla 2026-10-16 235728.png', 'stock'],
  ['Captura de pantalla 2026-10-16 235746.png', 'promocion'],
  ['Captura de pantalla 2026-10-16 235920.png', 'pedido'],
  ['Captura de pantalla 2026-10-16 235940.png', 'ventas'],
  ['Captura de pantalla 2026-10-17 000002.png', 'menu'],
]) await render(`${FM}/${file}`, `src/assets/freddymotos/${name}.webp`);

// --- LexSearch: pantalla de Consultar (la única captura disponible por ahora; sin datos reales) ---
await render(`${PORTFOLIO}/lexsearch.png`, 'src/assets/lexsearch/consultar.webp');
