// Genera los logos optimizados a partir del JPG original (fondo blanco, con ruido JPEG).
// Uso: node tools/make-assets.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const SRC = 'src/assets/orig-1.jpg';
const OUT = 'src/assets';
mkdirSync(OUT, { recursive: true });

const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;

// 1) Bounding box del logo (todo lo que no es casi blanco)
let minX = W, minY = H, maxX = 0, maxY = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3;
    if (Math.min(data[i], data[i + 1], data[i + 2]) < 200) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
}
const pad = 6;
const box = { left: minX - pad, top: minY - pad, width: maxX - minX + 1 + pad * 2, height: maxY - minY + 1 + pad * 2 };
console.log('bbox logo', box);

// 2) Blanco -> transparente (des-multiplicado de alfa) para que sirva sobre fondo oscuro sin halo
const out = Buffer.alloc(W * H * 4);
for (let p = 0; p < W * H; p++) {
  const r = data[p * 3], g = data[p * 3 + 1], b = data[p * 3 + 2];
  const a = 255 - Math.min(r, g, b);            // 0 = blanco puro
  const k = a / 255;
  out[p * 4 + 3] = a < 8 ? 0 : a;                // limpia el ruido JPEG del fondo
  if (a < 8) continue;
  out[p * 4] = Math.max(0, Math.min(255, Math.round((r - 255 * (1 - k)) / k)));
  out[p * 4 + 1] = Math.max(0, Math.min(255, Math.round((g - 255 * (1 - k)) / k)));
  out[p * 4 + 2] = Math.max(0, Math.min(255, Math.round((b - 255 * (1 - k)) / k)));
}
const transparent = sharp(out, { raw: { width: W, height: H, channels: 4 } }).extract(box);
await transparent.clone().resize({ height: 256 }).png({ compressionLevel: 9 }).toFile(`${OUT}/logo.png`);
await transparent.clone().resize({ height: 256 }).webp({ quality: 92, alphaQuality: 100 }).toFile(`${OUT}/logo.webp`);

// 3) Iconos (logo centrado sobre baldosa blanca redondeada, como en el banner de Facebook)
async function tile(size, file, radiusRatio = 0.22, logoRatio = 0.62) {
  const logoH = Math.round(size * logoRatio * (box.height / box.width > 1 ? 1 : box.height / box.width));
  const logoBuf = await transparent.clone().resize({ width: Math.round(size * logoRatio) }).png().toBuffer();
  const r = Math.round(size * radiusRatio);
  const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" fill="#ffffff"/></svg>`);
  await sharp(bg).composite([{ input: logoBuf, gravity: 'center' }]).png({ compressionLevel: 9 }).toFile(`${OUT}/${file}`);
  void logoH;
}
await tile(512, 'icon-512.png');
await tile(192, 'icon-192.png');
await tile(32, 'favicon-32.png', 0.18, 0.74);
await tile(180, 'apple-touch-icon.png', 0, 0.62); // iOS aplica su propia máscara

// 4) Imagen para redes (Open Graph 1200x630): degradé de marca + baldosa con logo
const og = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1b33"/><stop offset="0.6" stop-color="#1b3a63"/><stop offset="1" stop-color="#4b3a74"/></linearGradient>
    <radialGradient id="p" cx="0.1" cy="0.5" r="0.5"><stop offset="0" stop-color="#ff4d6d" stop-opacity="0.35"/><stop offset="1" stop-color="#ff4d6d" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/><rect width="1200" height="630" fill="url(#p)"/>
</svg>`);
const tileBuf = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260"><rect width="260" height="260" rx="56" fill="#fff"/></svg>`))
  .composite([{ input: await transparent.clone().resize({ width: 150 }).png().toBuffer(), gravity: 'center' }]).png().toBuffer();
await sharp(og).composite([{ input: tileBuf, left: 470, top: 130 }]).jpeg({ quality: 88 }).toFile(`${OUT}/og-image.jpg`);
console.log('assets listos');
