// Servidor estático mínimo para ver ./site en local. Uso: node tools/serve.mjs [puerto]
// Solo escucha en 127.0.0.1 (no se ve desde otros equipos de la red) y solo sirve archivos dentro de ./site.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = join(dirname(fileURLToPath(import.meta.url)), '..', 'site');
const port = Number(process.argv[2]) || 4173;
const HOST = '127.0.0.1';
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
const send = (res, code, headers, body) => res.writeHead(code, { 'X-Content-Type-Options': 'nosniff', ...headers }).end(body);

createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { Allow: 'GET, HEAD' });
  let p;
  try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { return send(res, 400, {}, 'bad request'); }
  if (p.includes('\0')) return send(res, 400, {}, 'bad request');
  if (p.endsWith('/')) p += 'index.html';
  const file = normalize(join(site, p));
  // Debe quedar DENTRO de site (con separador: así "site-otro" no pasa como si fuera "site")
  if (file !== site && !file.startsWith(site + sep)) return send(res, 403, {}, 'forbidden');
  try {
    if (!(await stat(file)).isFile()) throw new Error('nf');
    send(res, 200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' }, req.method === 'HEAD' ? undefined : await readFile(file));
  } catch {
    let page = 'not found';
    try { page = await readFile(join(site, '404.html')); } catch { /* sin 404.html */ }
    send(res, 404, { 'Content-Type': 'text/html; charset=utf-8' }, page);
  }
}).listen(port, HOST, () => console.log(`http://localhost:${port}`));
