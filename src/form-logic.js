/* Lógica pura del formulario (sin DOM): validación, anti-spam y armado de mensajes.
   Funciona en el navegador (window.KologicForm) y en Node (module.exports) para los tests. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KologicForm = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var MIN_FILL_MS = 3000;          // un humano tarda más de 3 s en completar el formulario
  var COOLDOWN_MS = 60 * 1000;     // 1 envío por minuto desde el mismo navegador
  var LIMITS = { name: 100, company: 120, message: 4000 };
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function clean(v) {
    return String(v == null ? '' : v)
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')  // caracteres de control
      .trim();
  }

  // Para campos de una sola línea: sin saltos de línea (evita inyectar cabeceras en el asunto del correo).
  function cleanLine(v) {
    return clean(v).replace(/\s*[\r\n]+\s*/g, ' ');
  }

  function validate(values) {
    var errors = {};
    var name = clean(values.name);
    var email = clean(values.email);
    var message = clean(values.message);
    if (name.length < 2) errors.name = 'Escribí tu nombre.';
    else if (name.length > LIMITS.name) errors.name = 'El nombre es demasiado largo.';
    if (!email) errors.email = 'Escribí tu correo electrónico.';
    else if (!EMAIL_RE.test(email) || email.length > 254) errors.email = 'Revisá el formato del correo (ej: nombre@empresa.com).';
    if (clean(values.company).length > LIMITS.company) errors.company = 'El nombre de la empresa es demasiado largo.';
    if (message.length < 10) errors.message = 'Contanos un poco más sobre tu proyecto (mínimo 10 caracteres).';
    else if (message.length > LIMITS.message) errors.message = 'El mensaje es demasiado largo (máximo ' + LIMITS.message + ' caracteres).';
    if (!values.consent) errors.consent = 'Necesitamos que aceptes la política de privacidad para responderte.';
    return errors;
  }

  // Devuelve un motivo (string) si parece spam, o null si parece humano.
  function spamReason(o) {
    if (clean(o.honeypot)) return 'honeypot';
    if (!o.startedAt || o.now - o.startedAt < MIN_FILL_MS) return 'too-fast';
    return null;
  }

  function rateLimited(lastSentAt, now) {
    return !!lastSentAt && now - lastSentAt < COOLDOWN_MS;
  }

  function buildPayload(values) {
    return {
      nombre: cleanLine(values.name),
      email: cleanLine(values.email),
      empresa: cleanLine(values.company),
      tipo_de_proyecto: cleanLine(values.type),
      presupuesto_aproximado: cleanLine(values.budget),
      plazo: cleanLine(values.deadline),
      descripcion: clean(values.message),
      origen: cleanLine(values.source),
    };
  }

  function buildMailto(values, to) {
    var p = buildPayload(values);
    var lines = ['Nombre: ' + p.nombre, 'Correo: ' + p.email];
    if (p.empresa) lines.push('Empresa: ' + p.empresa);
    if (p.tipo_de_proyecto) lines.push('Tipo de proyecto: ' + p.tipo_de_proyecto);
    if (p.presupuesto_aproximado) lines.push('Presupuesto aproximado: ' + p.presupuesto_aproximado);
    if (p.plazo) lines.push('Plazo: ' + p.plazo);
    lines.push('', p.descripcion);
    var subject = 'Consulta desde kologic.com' + (p.empresa ? ' – ' + p.empresa : '');
    return 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
  }

  return { validate: validate, spamReason: spamReason, rateLimited: rateLimited, buildPayload: buildPayload, buildMailto: buildMailto, clean: clean, cleanLine: cleanLine, MIN_FILL_MS: MIN_FILL_MS, COOLDOWN_MS: COOLDOWN_MS, LIMITS: LIMITS };
});
