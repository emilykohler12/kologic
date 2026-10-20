// Utilidades compartidas por los hooks. Cada hook recibe el evento como JSON por stdin.
import { readFileSync } from 'node:fs';
import path from 'node:path';

export function readEvent() {
  try { return JSON.parse(readFileSync(0, 'utf8')); } catch { return {}; }
}

export const projectRoot = (ev) => process.env.CLAUDE_PROJECT_DIR || ev.cwd || process.cwd();

// Ruta del archivo editado, relativa a la raíz del proyecto y con "/" (o null si no hay).
export function relPath(ev) {
  const f = ev.tool_input && ev.tool_input.file_path;
  if (!f) return null;
  const root = projectRoot(ev);
  return path.relative(root, path.resolve(root, f)).split(path.sep).join('/');
}

// Texto nuevo que se escribiría: Write (content), Edit (new_string) o MultiEdit (edits[].new_string).
export function newContent(ev) {
  const t = ev.tool_input || {};
  return [t.content, t.new_string, ...(t.edits || []).map((e) => e.new_string)].filter((s) => typeof s === 'string').join('\n');
}

// exit 2 = bloquea la acción y el mensaje (stderr) le llega a Claude.
export function block(msg) {
  process.stderr.write(msg + '\n');
  process.exit(2);
}

// Resume la salida del runner de tests: solo cuentas y líneas de tests que fallan.
export function summarizeFailures(out) {
  const lines = out.split(/\r?\n/);
  const seen = new Set();
  const failed = [];
  for (const l of lines) {
    if (!/^\s*✖/.test(l) || /failing tests:?\s*$/.test(l)) continue;
    const name = l.trim().replace(/\s*\([\d.]+ms\)\s*$/, '');
    if (!seen.has(name)) { seen.add(name); failed.push(name); }
  }
  const reasons = lines.filter((l) => /^\s*(AssertionError|Error|TypeError|ReferenceError)\b/.test(l)).map((l) => l.trim().slice(0, 200));
  const counts = lines.filter((l) => /^ℹ (tests|pass|fail) /.test(l)).map((l) => l.replace(/^ℹ /, ''));
  return { failed, reasons: [...new Set(reasons)].slice(0, 8), counts };
}
