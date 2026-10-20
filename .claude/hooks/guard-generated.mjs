// PreToolUse (Edit|Write|MultiEdit): site/ es resultado del build y package-lock.json lo maneja npm.
import { readEvent, relPath, block } from './lib.mjs';

const rel = relPath(readEvent());
if (rel && /^site\//.test(rel)) {
  block(`Bloqueado: ${rel} está en site/, que se genera con "npm run build" y se borra en cada build. Editá el origen en src/ (data.mjs, pages.mjs, layout.mjs, styles.css…) y volvé a generar.`);
}
if (rel === 'package-lock.json') {
  block('Bloqueado: package-lock.json lo gestiona npm; no se edita a mano. Si hace falta cambiarlo, pedíselo a la usuaria.');
}
