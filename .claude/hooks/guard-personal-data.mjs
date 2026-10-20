// PreToolUse (Edit|Write|MultiEdit): avisa si src/data.mjs, config.mjs o pages.mjs van a recibir datos personales.
import { readEvent, relPath, newContent, block } from './lib.mjs';

const ev = readEvent();
const rel = relPath(ev);
if (!rel || !/^src\/(data|config|pages)\.mjs$/.test(rel)) process.exit(0);

const text = newContent(ev);
if (/pii-ok/.test(text)) process.exit(0); // permiso explícito (ver mensaje)

// Valores públicos ya aprobados: contacto de Kologic, cuentas de prueba autorizadas (Clinix y Syntri) y el WhatsApp de config.mjs.
const okEmails = ['kologic6@gmail.com', 'admin@clinix.com', 'admin@syntri.local'];
const okPhones = ['5493751574185'];

const found = [];
for (const m of text.matchAll(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g)) {
  if (!okEmails.includes(m[0].toLowerCase())) found.push(`correo ${m[0]}`);
}
const withoutOk = okPhones.reduce((s, p) => s.split(p).join(' | '), text);
for (const m of withoutOk.matchAll(/\+?\d(?:[\s.-]?\d){9,}/g)) {
  const digits = m[0].replace(/\D/g, '');
  if (!okPhones.some((p) => p.includes(digits))) found.push(`número de teléfono ${m[0]}`);
}
for (const m of text.matchAll(/[A-Za-z]:[\\/]{1,2}Users[\\/]{1,2}|Documents[\\/]{1,2}proyectos/gi)) found.push(`ruta del disco ${m[0]}`);

if (found.length) {
  block(`Aviso (${rel}): el contenido nuevo parece incluir datos personales:\n  - ${[...new Set(found)].join('\n  - ')}\n` +
    'Por qué: el sitio es público; CRITICA.md pide no mostrar teléfono ni correo personales ni rutas del disco, y el contacto de Kologic es kologic6@gmail.com.\n' +
    'Si es intencional: confirmalo con la usuaria y repetí la edición agregando el comentario "pii-ok" en el texto nuevo (por ejemplo "// pii-ok: autorizado por Emily"). Si no, quitá el dato.');
}
