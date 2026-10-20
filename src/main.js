/* Kologic — comportamiento del sitio. Sin dependencias. */
(function () {
  'use strict';
  var doc = document;
  doc.documentElement.classList.remove('no-js');

  // Menú móvil
  var toggle = doc.querySelector('.menu-toggle');
  var nav = doc.getElementById('nav');
  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    nav.classList.toggle('is-open', open);
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); toggle.focus(); } });
    window.matchMedia('(min-width: 1061px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });
  }

  // Sombra del header al hacer scroll
  var header = doc.querySelector('.header');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Aparición suave al hacer scroll
  var items = doc.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Analítica: eventos sobre clics marcados con data-track (solo si Plausible está cargado)
  doc.addEventListener('click', function (e) {
    var el = e.target.closest('[data-track]');
    if (el && typeof window.plausible === 'function') window.plausible(el.getAttribute('data-track'), { props: { destino: el.getAttribute('href') || '' } });
  });

  // Formulario de contacto
  var form = doc.getElementById('contact-form');
  if (!form || !window.KologicForm) return;
  var KF = window.KologicForm;
  var startedAt = Date.now();
  var statusEl = doc.getElementById('form-status');
  var submitBtn = form.querySelector('button[type="submit"]');
  var STORE = 'kologic:lastSent';

  function readStore() { try { return Number(window.localStorage.getItem(STORE)) || 0; } catch (e) { return 0; } }
  function writeStore(v) { try { window.localStorage.setItem(STORE, String(v)); } catch (e) { /* modo privado */ } }

  // Prellenado desde la URL (?proyecto=slug&tipo=texto) y desde los botones "solicitar un sistema similar"
  var qs = new URLSearchParams(window.location.search);
  var preset = (qs.get('proyecto') || '').slice(0, 100);
  var typeEl = form.elements.type;
  if (qs.get('tipo') && typeEl) {
    Array.prototype.forEach.call(typeEl.options, function (o) { if (o.value === qs.get('tipo')) typeEl.value = o.value; });
  }
  if (preset && form.elements.message && !form.elements.message.value) {
    form.elements.message.value = (qs.get('demo')
      ? (qs.get('demo') === 'pres' ? 'Hola, quisiera ver una presentación en vivo de «' + preset + '».' : 'Hola, quisiera acceso a la demo de «' + preset + '».')
      : 'Hola, me interesa algo similar a «' + preset + '».') + '\n\n';
  }

  function values() {
    var f = form.elements;
    return {
      name: f.name.value, email: f.email.value, company: f.company.value, type: f.type.value,
      budget: f.budget.value, deadline: f.deadline.value, message: f.message.value,
      consent: f.consent.checked, honeypot: f.website.value, source: preset || 'contacto',
    };
  }
  function showStatus(kind, msg) {
    statusEl.className = 'form__status ' + (kind === 'ok' ? 'is-ok' : 'is-err');
    statusEl.textContent = msg;
  }
  function paintErrors(errors) {
    ['name', 'email', 'company', 'message', 'consent'].forEach(function (k) {
      var wrap = doc.getElementById('f-' + k);
      if (!wrap) return;
      var has = !!errors[k];
      wrap.classList.toggle('has-error', has);
      var input = wrap.querySelector('input,textarea,select');
      if (input) input.setAttribute('aria-invalid', has ? 'true' : 'false');
      var msg = wrap.querySelector('.field__error');
      if (msg) msg.textContent = errors[k] || '';
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = values();
    var errors = KF.validate(v);
    paintErrors(errors);
    var firstKey = Object.keys(errors)[0];
    if (firstKey) {
      showStatus('err', 'Revisá los campos marcados e intentá de nuevo.');
      var bad = doc.querySelector('#f-' + firstKey + ' input, #f-' + firstKey + ' textarea');
      if (bad) bad.focus();
      return;
    }
    // Anti-spam: si parece un bot, simulamos éxito sin enviar nada (no le damos pistas).
    if (KF.spamReason({ honeypot: v.honeypot, startedAt: startedAt, now: Date.now() })) {
      showStatus('ok', '¡Gracias! Recibimos tu consulta.');
      form.reset();
      return;
    }
    if (KF.rateLimited(readStore(), Date.now())) {
      showStatus('err', 'Ya enviaste una consulta hace instantes. Esperá un minuto antes de enviar otra.');
      return;
    }
    var endpoint = form.getAttribute('data-endpoint');
    var email = form.getAttribute('data-email');
    if (!endpoint) {
      // Sin servicio de formularios configurado: se abre el correo del usuario con todo cargado.
      showStatus('ok', 'Se abrió tu aplicación de correo con la consulta lista para enviar. Si no se abrió, escribinos a ' + email + '.');
      window.location.href = KF.buildMailto(v, email);
      return;
    }
    submitBtn.disabled = true;
    var label = submitBtn.textContent;
    submitBtn.textContent = 'Enviando…';
    fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(KF.buildPayload(v)) })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); })
      .then(function () {
        writeStore(Date.now());
        showStatus('ok', '¡Gracias! Recibimos tu consulta y te respondemos a la brevedad.');
        form.reset();
        startedAt = Date.now();
        if (typeof window.plausible === 'function') window.plausible('Formulario enviado');
      })
      .catch(function () {
        showStatus('err', 'No pudimos enviar el formulario. Probá de nuevo o escribinos a ' + email + '.');
      })
      .then(function () { submitBtn.disabled = false; submitBtn.textContent = label; });
  });
})();
