// PreToolUse (Bash|PowerShell): bloquea push forzado y borrados recursivos de src/ o site/.
import { readEvent, block } from './lib.mjs';

const cmd = String((readEvent().tool_input || {}).command || '');

if (/\bgit\b[^\n;&|]*\bpush\b[^\n;&|]*(--force\b|--force-with-lease\b|\s-[a-zA-Z]*f[a-zA-Z]*\b|\s\+\S)/.test(cmd)) {
  block('Bloqueado: git push forzado (--force / -f / --force-with-lease / +rama) puede pisar historial. Si la usuaria lo quiere de verdad, que lo ejecute ella.');
}

// Borrado recursivo: rm -r/-rf, Remove-Item -Recurse (o alias ri/rm con -Recurse), rmdir /s, rd /s, del /s
// Se evalúa instrucción por instrucción (separadas por ; & | o salto de línea), para no mezclar un borrado
// con texto de otra parte del comando (por ejemplo, un mensaje de commit que nombra "site/").
const recursiveRe = /\brm\b[^\n;&|]*\s-[a-zA-Z]*[rR]|(Remove-Item|\bri\b|\brm\b|\bdel\b|\brmdir\b|\brd\b)[^\n;&|]*(-Recurse\b|\s\/s\b)/i;
// Objetivo: src o site como carpeta (src, ./src, src/..., site\..., "site", pero no "site.test" ni "tests/site.test.mjs")
const targetRe = /(^|[\s'"=])(\.[\\/])?(src|site)([\\/*'"\s;&|]|$)/i;
const dangerous = cmd.split(/[;&|\n]+/).some((part) => recursiveRe.test(part) && targetRe.test(part));
if (dangerous) {
  block('Bloqueado: borrado recursivo sobre src/ o site/. src/ es el código fuente y site/ se regenera con "npm run build" (no hace falta borrarlo a mano). Si la usuaria lo pide expresamente, que lo ejecute ella.');
}
