// PostToolUse (Edit|Write|MultiEdit): si se editó src/**/*.{mjs,js,css}, corre npm test y resume solo lo que falla.
// Si tarda más de LIMIT_MS, se queda con "npm run build" y lo avisa.
import { spawnSync } from 'node:child_process';
import { readEvent, relPath, projectRoot, summarizeFailures } from './lib.mjs';

const LIMIT_MS = Number(process.env.KOLOGIC_HOOK_LIMIT_MS) || 30000;
const ev = readEvent();
const rel = relPath(ev);
if (!rel || !/^src\/.+\.(mjs|js|css)$/.test(rel)) process.exit(0);

const run = (cmd, ms) => spawnSync(cmd, { cwd: projectRoot(ev), shell: true, encoding: 'utf8', timeout: ms, maxBuffer: 20 * 1024 * 1024 });
const info = (msg) => { process.stdout.write(JSON.stringify({ systemMessage: msg }) + '\n'); process.exit(0); };

const t = run('npm test -- --test-reporter=spec', LIMIT_MS);
if (t.error && t.error.code === 'ETIMEDOUT') {
  const b = run('npm run build', LIMIT_MS);
  if (b.status !== 0) {
    process.stderr.write(`npm test tardó más de ${LIMIT_MS / 1000} s y se cortó; "npm run build" también falló:\n${(b.stderr || b.stdout || '').trim().slice(-800)}\n`);
    process.exit(2);
  }
  info(`npm test tardó más de ${LIMIT_MS / 1000} s: solo se corrió "npm run build" (OK). Corré "npm test" a mano antes de terminar.`);
}

const out = `${t.stdout || ''}\n${t.stderr || ''}`;
if (t.status === 0) {
  const c = summarizeFailures(out).counts;
  info(`npm test OK tras editar ${rel}${c.length ? ` (${c.join(', ')})` : ''}`);
}

const s = summarizeFailures(out);
const lines = [`npm test FALLÓ tras editar ${rel}:`];
if (s.failed.length) lines.push(...s.failed.slice(0, 15).map((n) => '  ' + n));
else lines.push('  (el build o el runner falló antes de los tests) ' + out.trim().split(/\r?\n/).slice(-6).join(' | ').slice(0, 500));
if (s.reasons.length) lines.push('Motivos:', ...s.reasons.map((r) => '  ' + r));
if (s.counts.length) lines.push(s.counts.join(', '));
process.stderr.write(lines.join('\n') + '\n');
process.exit(2);
