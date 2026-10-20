// Tests unitarios de la lógica del formulario. Ejecutar: npm test
const test = require('node:test');
const assert = require('node:assert/strict');
const KF = require('../src/form-logic.js');

const ok = { name: 'Ana Pérez', email: 'ana@empresa.com', company: '', message: 'Necesito un sistema de turnos para mi consultorio.', consent: true };

test('validate: datos correctos no dan errores', () => {
  assert.deepEqual(KF.validate(ok), {});
});

test('validate: exige nombre, correo, mensaje y consentimiento', () => {
  const e = KF.validate({ name: '', email: '', message: '', consent: false });
  assert.deepEqual(Object.keys(e).sort(), ['consent', 'email', 'message', 'name']);
});

test('validate: rechaza correos mal formados', () => {
  for (const bad of ['ana', 'ana@', '@x.com', 'ana@x', 'a na@x.com', 'ana@x.c']) {
    assert.ok(KF.validate({ ...ok, email: bad }).email, `debería rechazar ${bad}`);
  }
});

test('validate: acepta correos válidos (subdominios, +, .ar)', () => {
  for (const good of ['a@b.co', 'ana+kologic@mail.empresa.com.ar', 'AnA@Empresa.COM']) {
    assert.equal(KF.validate({ ...ok, email: good }).email, undefined, `debería aceptar ${good}`);
  }
});

test('validate: espacios solos no cuentan como contenido', () => {
  const e = KF.validate({ ...ok, name: '   ', message: '           ' });
  assert.ok(e.name && e.message);
});

test('validate: respeta límites de longitud', () => {
  assert.ok(KF.validate({ ...ok, name: 'x'.repeat(101) }).name);
  assert.ok(KF.validate({ ...ok, message: 'x'.repeat(4001) }).message);
  assert.equal(KF.validate({ ...ok, message: 'x'.repeat(4000) }).message, undefined);
});

test('validate: tolera valores nulos sin lanzar', () => {
  assert.doesNotThrow(() => KF.validate({}));
  assert.doesNotThrow(() => KF.validate({ name: null, email: undefined, message: 0 }));
});

test('clean: elimina caracteres de control pero conserva acentos, ñ y saltos de línea', () => {
  assert.equal(KF.clean('Hola\u0000\u0007 Ñandú\nmañana'), 'Hola Ñandú\nmañana');
});

test('spamReason: honeypot completo = spam', () => {
  assert.equal(KF.spamReason({ honeypot: 'http://spam', startedAt: 0 + 1, now: 100000 }), 'honeypot');
});

test('spamReason: envío demasiado rápido = spam', () => {
  assert.equal(KF.spamReason({ honeypot: '', startedAt: 1000, now: 1000 + KF.MIN_FILL_MS - 1 }), 'too-fast');
  assert.equal(KF.spamReason({ honeypot: '', startedAt: 0, now: 5000 }), 'too-fast'); // startedAt inválido
});

test('spamReason: humano normal pasa', () => {
  assert.equal(KF.spamReason({ honeypot: '', startedAt: 1000, now: 1000 + KF.MIN_FILL_MS }), null);
});

test('rateLimited: bloquea dentro del minuto y libera después', () => {
  assert.equal(KF.rateLimited(0, 1000), false);
  assert.equal(KF.rateLimited(1000, 1000 + KF.COOLDOWN_MS - 1), true);
  assert.equal(KF.rateLimited(1000, 1000 + KF.COOLDOWN_MS), false);
});

test('buildMailto: codifica bien y omite campos opcionales vacíos', () => {
  const url = KF.buildMailto({ ...ok, company: '', type: '', budget: '', deadline: '' }, 'kologic6@gmail.com');
  assert.ok(url.startsWith('mailto:kologic6@gmail.com?subject='));
  const body = decodeURIComponent(url.split('&body=')[1]);
  assert.equal(body, 'Nombre: Ana Pérez\nCorreo: ana@empresa.com\n\nNecesito un sistema de turnos para mi consultorio.');
  assert.ok(!/Empresa:|Plazo:|Presupuesto/.test(body));
});

test('buildMailto: incluye opcionales cuando existen y no permite inyectar cabeceras', () => {
  const url = KF.buildMailto({ ...ok, company: 'ACME\r\nBcc: x@y.com', type: 'Tienda online / e-commerce', budget: 'USD 500 – 1.500', deadline: 'Sin apuro' }, 'a@b.com');
  assert.ok(!url.includes('%0D%0ABcc') && !url.includes('\r'));
  const body = decodeURIComponent(url.split('&body=')[1]);
  assert.match(body, /Empresa: ACME/);
  assert.match(body, /Tipo de proyecto: Tienda online \/ e-commerce/);
  assert.match(body, /Presupuesto aproximado: USD 500 – 1\.500/);
});

test('buildPayload: devuelve solo campos esperados y limpios', () => {
  const p = KF.buildPayload({ ...ok, name: '  Ana  ', honeypot: 'x', consent: true });
  assert.equal(p.nombre, 'Ana');
  assert.deepEqual(Object.keys(p).sort(), ['descripcion', 'email', 'empresa', 'nombre', 'origen', 'plazo', 'presupuesto_aproximado', 'tipo_de_proyecto']);
});
