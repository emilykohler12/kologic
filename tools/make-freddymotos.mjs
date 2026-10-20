// Convierte las capturas nuevas de freddymotos (carpeta ig) a WebP, sin retoques: la usuaria las revisó y no tienen datos personales.
// Uso: node tools/make-freddymotos.mjs   → src/assets/freddymotos/captura-NN.webp (orden por nombre de archivo) y imprime w/h para data.mjs
import sharp from 'sharp';
import { readdirSync } from 'node:fs';

const DIR = 'C:/Users/Emily Kohler/Documents/proyectos/paginafreddyfotos/ig';
// Repetidas de repuesto.webp y promocion.webp (misma pantalla): se omiten.
const REPETIDAS = ['190538', '190602'];
const files = readdirSync(DIR).filter((f) => f.startsWith('Captura de pantalla 2026-10-20') && f.endsWith('.png') && !REPETIDAS.some((r) => f.includes(r))).sort();
let n = 0;
for (const f of files) {
  const out = `src/assets/freddymotos/captura-${String(++n).padStart(2, '0')}.webp`;
  const info = await sharp(`${DIR}/${f}`).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out);
  console.log(`${out} ${info.width}x${info.height} ${Math.round(info.size / 1024)}KB`);
}
