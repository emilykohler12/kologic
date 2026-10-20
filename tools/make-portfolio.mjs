// Recorta secciones de una captura de página completa del portafolio de Emily (1440 px de ancho) y las pasa a WebP.
// La captura se saca con el sitio corriendo (cd portfolio; npx next dev -p 3100) y Edge sin ventana:
//   msedge --headless=new --hide-scrollbars --window-size=1440,6400 --virtual-time-budget=12000 --screenshot=full.png http://localhost:3100/
// Uso: node tools/make-portfolio.mjs <full.png>
// No se recorta la sección de contacto (tiene teléfono y correo).
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const src = process.argv[2] || 'tools/_cap/full.png';
const out = 'src/assets/portafolio';
mkdirSync(out, { recursive: true });

const crops = [
  ['inicio', 0, 690],
  ['servicios', 1290, 1040],
  ['proyectos', 2450, 960],
  ['proceso', 3450, 960],
  ['habilidades', 4430, 420],
  ['preguntas', 4880, 600],
];
for (const [name, top, height] of crops) {
  const info = await sharp(src).extract({ left: 0, top, width: 1440, height }).resize({ width: 1280 }).webp({ quality: 84 }).toFile(`${out}/${name}.webp`);
  console.log(name, info.width, info.height);
}

// Versión celular: captura aparte con --window-size=390,1000 (se guarda tal cual).
//   msedge --headless=new --hide-scrollbars --window-size=390,1000 --virtual-time-budget=12000 --screenshot=movil.png http://localhost:3100/
const movil = src.replace(/full\.png$/, 'movil.png');
try {
  const i = await sharp(movil).webp({ quality: 84 }).toFile(`${out}/movil.webp`);
  console.log('movil', i.width, i.height);
} catch { console.log('(sin captura movil.png: se conserva la existente)'); }
