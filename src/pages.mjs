import { config } from './config.mjs';
import { services, projects, steps, faqs, projectTypes, budgets, deadlines, area, payIntro, payModels } from './data.mjs';
import { icon } from './icons.mjs';
import { mockup, mockStats, mockMobile } from './mockups.mjs';
import { layout, esc, waLink } from './layout.mjs';

const projectHref = (p, root = '') => `${root}proyectos/${p.slug}.html`;
// Portada de un proyecto: primera captura real si existe; si no, una ilustración.
const cover = (p, root = '', lazy = true) => {
  if (!p.images) return mockup(p.mock, `Ilustración de la pantalla principal de ${p.name}`);
  const i = p.images[0];
  return `<img class="cover" src="${root}${i.src}" width="${i.w}" height="${i.h}" alt="${esc(i.alt)}"${lazy ? ' loading="lazy"' : ''}>`;
};
const org = () => ({
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Kologic',
  url: config.siteUrl,
  logo: `${config.siteUrl}/assets/icon-512.png`,
  image: `${config.siteUrl}/assets/og-image.jpg`,
  description: 'Desarrollo de sistemas web, páginas institucionales, tiendas online y automatizaciones a medida.',
  email: config.email,
  slogan: config.tagline,
  address: { '@type': 'PostalAddress', addressLocality: 'Posadas', addressRegion: 'Misiones', addressCountry: 'AR' },
  areaServed: [{ '@type': 'AdministrativeArea', name: 'Misiones' }, { '@type': 'AdministrativeArea', name: 'Corrientes' }, { '@type': 'Country', name: 'Argentina' }, 'Worldwide'],
  sameAs: [config.instagram, config.linkedin].filter(Boolean),
});

function contactSection() {
  const wa = waLink();
  const opt = (arr) => arr.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('');
  return `<section class="section section--silver" id="contacto" aria-labelledby="t-contacto">
  <div class="container contact__grid">
    <div class="reveal">
      <span class="eyebrow">Contacto y presupuestos</span>
      <h2 id="t-contacto">Contanos tu idea y la hacemos realidad</h2>
      <p>Completá el formulario con lo que necesitás. Cuanto más detalle, mejor podemos orientarte. Te respondemos con los próximos pasos. <strong>Todas las consultas y los presupuestos son sin cargo.</strong></p>
      <div class="contact__list">
        <a href="mailto:${esc(config.email)}" data-track="Email"><span class="ci">${icon('mail')}</span>${esc(config.email)}</a>
        ${wa ? `<a href="${esc(wa)}" target="_blank" rel="noopener noreferrer" data-track="WhatsApp contacto"><span class="ci">${icon('chat')}</span>Escribinos por WhatsApp</a>` : ''}
        ${config.instagram ? `<a href="${esc(config.instagram)}" target="_blank" rel="noopener noreferrer" data-track="Instagram"><span class="ci">${icon('instagram')}</span>Instagram ${esc(config.instagramHandle)}</a>` : ''}
        ${config.linkedin ? `<a href="${esc(config.linkedin)}" target="_blank" rel="noopener noreferrer" data-track="LinkedIn"><span class="ci">${icon('linkedin')}</span>LinkedIn</a>` : ''}
      </div>
    </div>
    <form class="form reveal" id="contact-form" novalidate data-endpoint="${esc(config.formEndpoint)}" data-email="${esc(config.email)}" aria-describedby="form-status">
      <div class="form__row">
        <div class="field" id="f-name"><label for="name">Nombre</label><input id="name" name="name" type="text" autocomplete="name" maxlength="100" required aria-required="true"><p class="field__error" role="alert"></p></div>
        <div class="field" id="f-email"><label for="email">Correo electrónico</label><input id="email" name="email" type="email" autocomplete="email" inputmode="email" maxlength="254" required aria-required="true"><p class="field__error" role="alert"></p></div>
      </div>
      <div class="field" id="f-company"><label for="company">Empresa o negocio <span class="opt">(opcional)</span></label><input id="company" name="company" type="text" autocomplete="organization" maxlength="120"><p class="field__error" role="alert"></p></div>
      <div class="form__row">
        <div class="field"><label for="type">Tipo de proyecto <span class="opt">(opcional)</span></label><select id="type" name="type"><option value="">Seleccioná una opción</option>${opt(projectTypes)}</select></div>
        <div class="field"><label for="deadline">Plazo <span class="opt">(opcional)</span></label><select id="deadline" name="deadline"><option value="">Seleccioná una opción</option>${opt(deadlines)}</select></div>
      </div>
      <div class="field"><label for="budget">Presupuesto aproximado <span class="opt">(opcional)</span></label><select id="budget" name="budget"><option value="">Seleccioná una opción</option>${opt(budgets)}</select></div>
      <div class="field" id="f-message"><label for="message">Descripción del proyecto</label><textarea id="message" name="message" maxlength="4000" required aria-required="true" placeholder="¿Qué necesitás resolver? ¿Cómo trabajan hoy? ¿Qué te gustaría lograr?"></textarea><p class="field__error" role="alert"></p></div>
      <div class="hp" aria-hidden="true"><label for="website">No completar este campo</label><input id="website" name="website" type="text" tabindex="-1" autocomplete="off"></div>
      <div class="field" id="f-consent"><label class="check"><input type="checkbox" id="consent" name="consent" required aria-required="true"><span>Acepto la <a href="politica-de-privacidad.html" target="_blank" rel="noopener">política de privacidad</a> y que Kologic use mis datos para responder mi consulta.</span></label><p class="field__error" role="alert"></p></div>
      <button class="btn btn--primary" type="submit" data-track="Enviar formulario">Enviar consulta ${icon('arrow')}</button>
      <div id="form-status" class="form__status" role="status" aria-live="polite"></div>
      <p class="form__fine">Tus datos se usan solo para responderte. Consultas y presupuestos sin cargo y sin compromiso.</p>
    </form>
  </div>
</section>`;
}

function projectCard(p, root = '') {
  return `<article class="pcard reveal">
    <a class="pcard__media" href="${projectHref(p, root)}" tabindex="-1" aria-hidden="true">${cover(p, root)}</a>
    <div class="pcard__body">
      <div class="pcard__tags">${p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
      <h3>${esc(p.name)}</h3>
      <p>${esc(p.short)}</p>
      <ul class="tech" aria-label="Tecnologías">${p.tech.slice(0, 5).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      <a class="btn btn--outline" href="${projectHref(p, root)}" data-track="Ver proyecto: ${esc(p.slug)}">Ver detalles <span class="sr-only">de ${esc(p.name)}</span>${icon('arrow')}</a>
    </div>
  </article>`;
}

export function homePage() {
  const featured = [projects[0], projects[1]];
  const body = `
<section class="hero" id="inicio" aria-labelledby="t-hero">
  <div class="container hero__grid">
    <div>
      <div class="hero__logo"><img src="assets/logo.webp" width="54" height="54" alt="Logo de Kologic" fetchpriority="high"></div>
      <span class="eyebrow">${esc(config.tagline)}</span>
      <h1 id="t-hero">Desarrollamos <span class="text-silver">soluciones digitales</span> a medida para tu negocio</h1>
      <p class="hero__lead">En Kologic creamos sistemas web, páginas, tiendas online y automatizaciones que ordenan tu operación y te ayudan a crecer. Hablamos tu idioma, no el de la tecnología.</p>
      <div class="hero__cta">
        <a class="btn btn--primary" href="#proyectos" data-track="Hero: Ver proyectos">Ver proyectos</a>
        <a class="btn btn--ghost" href="#contacto" data-track="Hero: Solicitar presupuesto">Solicitar presupuesto</a>
      </div>
      <ul class="hero__chips" aria-label="Características">
        <li class="chip">${icon('code')}Desarrollo 100% a medida</li>
        <li class="chip">${icon('check')}Consultas y presupuestos sin cargo</li>
        <li class="chip">${icon('heart')}Trato cercano</li>
      </ul>
    </div>
    <div class="hero__visual" aria-label="Vista previa de proyectos destacados">
      <a class="preview preview--a" href="${projectHref(featured[0])}" data-track="Hero preview: ${featured[0].slug}">${cover(featured[0], '', false)}<span class="preview__cap">${esc(featured[0].shortName || featured[0].name)}</span></a>
      <a class="preview preview--b" href="${projectHref(featured[1])}" data-track="Hero preview: ${featured[1].slug}">${cover(featured[1], '', false)}<span class="preview__cap">${esc(featured[1].shortName || featured[1].name)}</span></a>    </div>
  </div>
</section>

<section class="section" id="sobre" aria-labelledby="t-sobre">
  <div class="container about__grid">
    <div class="reveal">
      <span class="eyebrow">Sobre Kologic</span>
      <h2 id="t-sobre">Tecnología con un toque humano</h2>
      <p class="about__lead">Kologic es un estudio de desarrollo de software que diseña y construye soluciones digitales a medida: sistemas web, páginas institucionales, tiendas online y automatizaciones.</p>
      <p>Acompañamos tanto a emprendedores que dan sus primeros pasos digitales como a empresas que necesitan ordenar, automatizar o escalar su operación: desde una web que presente tu negocio hasta un sistema de gestión completo. Nuestro objetivo es simple: que la tecnología te quite trabajo, no que te lo agregue.</p>
      <div class="remote">${icon('globe')}<p><strong>Remoto o presencial.</strong> ${esc(area.remote)} Atendemos a clientes de otros países con reuniones por videollamada y seguimiento claro en cada etapa. ${esc(area.onsite)}</p></div>
    </div>
    <div class="values reveal">
      <div class="value"><span class="value__icon">${icon('target')}</span><div><h3>Entender antes de construir</h3><p>Primero conocemos tu negocio y tus procesos. Después elegimos la solución, no al revés.</p></div></div>
      <div class="value"><span class="value__icon">${icon('bolt')}</span><div><h3>Tecnología al servicio del negocio</h3><p>Cada función existe porque resuelve algo concreto: ahorrar tiempo, vender más o evitar errores.</p></div></div>
      <div class="value"><span class="value__icon">${icon('heart')}</span><div><h3>Trato cercano y claro</h3><p>Hablamos sin tecnicismos, con avances periódicos y una persona real del otro lado.</p></div></div>
      <div class="value"><span class="value__icon">${icon('shield')}</span><div><h3>Calidad y seguridad</h3><p>Probamos lo que entregamos y cuidamos los datos de tu negocio y de tus clientes.</p></div></div>
    </div>
  </div>
</section>

<section class="section section--silver" id="servicios" aria-labelledby="t-servicios">
  <div class="container">
    <div class="section-head reveal"><span class="eyebrow">Servicios</span><h2 id="t-servicios">Soluciones para cada etapa de tu negocio</h2><p>Desde una presencia web profesional hasta sistemas completos de gestión. Todo se adapta a lo que realmente necesitás.</p></div>
    <div class="cards">
      ${services.map((s) => `<article class="card reveal"><div class="card__icon">${icon(s.icon)}</div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></article>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="section" id="proyectos" aria-labelledby="t-proyectos">
  <div class="container">
    <div class="section-head reveal"><span class="eyebrow">Proyectos y portfolio</span><h2 id="t-proyectos">Sistemas que ya resuelven problemas reales</h2><p>Una muestra de lo que construimos. Entrá a cada proyecto para ver el problema que resuelve, sus funcionalidades y la tecnología utilizada.</p></div>
    <div class="projects">${projects.map((p) => projectCard(p)).join('\n')}</div>
  </div>
</section>

<section class="section section--dark" id="como-trabajamos" aria-labelledby="t-como">
  <div class="container">
    <div class="section-head reveal"><span class="eyebrow">Cómo trabajamos</span><h2 id="t-como">Un proceso claro, de la primera charla a la entrega</h2><p>Sabés qué esperar en cada etapa, qué vas a recibir y cuándo.</p></div>
    <ol class="steps" style="list-style:none;padding:0;margin:0">
      ${steps.map((s) => `<li class="step reveal"><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('\n      ')}
    </ol>
    <div class="pay reveal">
      <h3>Cómo se paga</h3>
      <p>${esc(payIntro)}</p>
      <div class="pay__grid">${payModels.map((m) => `<div class="pay__card"><span class="pay__icon">${icon(m.icon)}</span><div><h4>${esc(m.title)}</h4><p>${esc(m.text)}</p></div></div>`).join('')}</div>
    </div>
  </div>
</section>

${contactSection()}

<section class="section" id="faq" aria-labelledby="t-faq">
  <div class="container">
    <div class="section-head reveal" style="margin-inline:auto;text-align:center"><span class="eyebrow">Preguntas frecuentes</span><h2 id="t-faq">Lo que más nos preguntan</h2></div>
    <div class="faq reveal">
      ${faqs.map((f) => `<details><summary>${esc(f.q)}</summary><div class="faq__a"><p>${esc(f.a)}</p></div></details>`).join('\n      ')}
    </div>
  </div>
</section>`;

  const jsonld = [
    org(),
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ];
  return layout({
    title: 'Kologic | Desarrollo de sistemas web y soluciones digitales a medida',
    description: 'Desarrollamos soluciones digitales a medida para tu negocio: sistemas web, páginas, tiendas online y automatizaciones.',
    path: '/',
    home: true,
    body,
    jsonld,
  });
}

export function projectPage(p) {
  const others = projects.filter((x) => x.slug !== p.slug);
  const wa = waLink();
  const ask = `../index.html?proyecto=${encodeURIComponent(p.name)}&tipo=${encodeURIComponent(p.formType)}#contacto`;
  const demoBtn = p.noDemo ? '' : p.demo
    ? `<a class="btn btn--dark" href="${esc(p.demo)}" target="_blank" rel="noopener noreferrer" data-track="Demo: ${esc(p.slug)}">${esc(p.demoLabel || 'Abrir demo funcional')}</a>`
    : `<a class="btn btn--dark" href="../index.html?proyecto=${encodeURIComponent(p.name)}&tipo=${encodeURIComponent(p.formType)}&demo=${p.presentation ? 'pres' : '1'}#contacto" data-track="Pedir demo: ${esc(p.slug)}">${p.presentation ? 'Pedir una presentación en vivo' : 'Pedir acceso a la demo'}</a>`;
  const shots = p.images
    ? p.images.map((i) => [`<img src="../${i.src}" width="${i.w}" height="${i.h}" alt="${esc(i.alt)}" loading="lazy">`, i.caption])
    : [
        [mockup(p.mock, `Ilustración de la pantalla principal de ${p.name}`), 'Pantalla principal (ilustrativa)'],
        [mockStats(`Ilustración del panel de reportes de ${p.name}`), 'Panel de reportes (ilustrativa)'],
        [mockMobile(`Ilustración de la versión móvil de ${p.name}`), 'Versión para celulares (ilustrativa)'],
      ];
  const poster = p.images ? `../${p.images[0].src}` : '';
  const videos = (p.videos || []).map((v) => `<figure class="vid"><video controls preload="none" playsinline${poster ? ` poster="${poster}"` : ''} aria-label="${esc(v.title)}"><source src="../${v.src}" type="video/mp4">Tu navegador no puede reproducir este video. <a href="../${v.src}">Descargalo</a>.</video><figcaption>${esc(v.title)}</figcaption></figure>`).join('');
  const body = `
<section class="phero">
  <div class="container">
    <nav class="crumbs" aria-label="Ruta de navegación"><a href="../index.html">Inicio</a><span aria-hidden="true">/</span><a href="../index.html#proyectos">Proyectos</a><span aria-hidden="true">/</span><span aria-current="page">${esc(p.name)}</span></nav>
    <div class="pcard__tags">${p.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
    <h1>${esc(p.name)}</h1>
    <p>${esc(p.short)}</p>
  </div>
</section>

<section class="section">
  <div class="container pdetail">
    <div>
      <h2>Descripción y objetivo</h2>
      <p>${esc(p.goal)}</p>
      <h2>El problema que resuelve</h2>
      <p>${esc(p.problem)}</p>
      <h2>Funcionalidades principales</h2>
      <ul class="featlist">${p.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
      ${p.scope ? `<p class="scope">${esc(p.scope)}</p>` : ''}
      ${p.integrations ? `<h2>Integraciones</h2><ul class="tech tech--light">${p.integrations.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
      ${p.stats ? `<h2>En números</h2><dl class="stats">${p.stats.map(([n, l]) => `<div><dt>${esc(n)}</dt><dd>${esc(l)}</dd></div>`).join('')}</dl>` : ''}
    </div>
    <aside class="aside" aria-label="Resumen del proyecto">
      <h2>Tecnologías utilizadas</h2>
      <ul class="tech">${p.tech.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      ${demoBtn}
      ${p.demoNote && (p.demo || p.presentation) ? `<p class="aside__note">${esc(p.demoNote)}</p>` : ''}
      ${p.demo && p.demoAccount ? `<dl class="account" aria-label="Cuenta de prueba"><div><dt>Usuario</dt><dd><code>${esc(p.demoAccount.user)}</code></dd></div><div><dt>Contraseña</dt><dd><code>${esc(p.demoAccount.pass)}</code></dd></div></dl>` : ''}
      ${p.repo ? `<a class="btn btn--outline" href="${esc(p.repo)}" target="_blank" rel="noopener noreferrer" data-track="Código: ${esc(p.slug)}">Ver código en GitHub</a>` : ''}
      <a class="btn btn--primary" href="${ask}" data-track="Solicitar similar: ${esc(p.slug)}">${esc(p.askLabel || 'Solicitar un sistema similar')}</a>
      ${wa ? `<a class="btn btn--wa" href="${esc(wa)}" target="_blank" rel="noopener noreferrer" data-track="WhatsApp proyecto: ${esc(p.slug)}">Consultar por WhatsApp</a>` : ''}
    </aside>
  </div>
</section>

<section class="section section--silver">
  <div class="container">
    <div class="section-head"><h2>Capturas de pantalla</h2><p>${p.images ? 'Imágenes del sistema con datos de ejemplo.' : 'Vistas ilustrativas del sistema. Podés pedir una demo para recorrerlo en vivo.'}</p></div>
    <div class="shots">${shots.map(([svg, cap]) => `<figure class="shot">${svg}<figcaption>${cap}</figcaption></figure>`).join('')}</div>
    ${videos ? `<h2 style="margin-top:48px">Video demostrativo</h2><div class="vids">${videos}</div>` : ''}
    ${p.video ? `<h2 style="margin-top:48px">Video demostrativo</h2><iframe class="video" src="${esc(p.video)}" title="Video demostrativo de ${esc(p.name)}" loading="lazy" allowfullscreen></iframe>` : ''}
  </div>
</section>

<section class="section section--dark cta-band">
  <div class="container">
    <h2>¿Querés algo así para tu negocio?</h2>
    <p>Contanos qué necesitás y te enviamos una propuesta a medida.</p>
    <div class="hero__cta"><a class="btn btn--primary" href="${ask}" data-track="Banner: Solicitar similar">${esc(p.askLabel || 'Solicitar un sistema similar')}</a><a class="btn btn--ghost" href="../index.html#proyectos">Ver otros proyectos</a></div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head"><h2>Otros proyectos</h2></div>
    <div class="other">${others.map((o) => `<a href="${o.slug}.html">${esc(o.name)}<small>${esc(o.tags.join(' · '))}</small></a>`).join('')}</div>
  </div>
</section>`;
  const jsonld = [{
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${config.siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Proyectos', item: `${config.siteUrl}/#proyectos` },
      { '@type': 'ListItem', position: 3, name: p.name, item: `${config.siteUrl}/proyectos/${p.slug}.html` },
    ],
  }];
  return layout({
    title: `${p.name} | Kologic`,
    description: `${p.short} Funcionalidades y tecnologías.`,
    path: `/proyectos/${p.slug}.html`,
    root: '../',
    body,
    jsonld,
  });
}

export function privacyPage() {
  const body = `
<section class="phero"><div class="container"><h1>Política de privacidad</h1><p>Cómo cuidamos tus datos cuando usás este sitio y nos contactás.</p></div></section>
<section class="section"><div class="container prose">
<p><strong>Última actualización:</strong> 17 de octubre de 2026.</p>
<h2>1. Quiénes somos</h2>
<p>Kologic es el responsable del tratamiento de los datos que se recogen a través de este sitio. Podés escribirnos a <a href="mailto:${esc(config.email)}">${esc(config.email)}</a>.</p>
<h2>2. Qué datos recopilamos</h2>
<ul>
<li>Los que completás voluntariamente en el formulario de contacto: nombre, correo electrónico, empresa (opcional), tipo de proyecto, presupuesto aproximado y plazo (opcionales) y la descripción de tu proyecto.</li>
<li>Los datos que nos envíes por correo electrónico, WhatsApp o Instagram si decidís escribirnos por esos medios.</li>
<li>${config.plausibleDomain ? 'Estadísticas de visitas agregadas y anónimas (páginas vistas, país, tipo de dispositivo), obtenidas con una herramienta que no usa cookies ni identifica a personas.' : 'Este sitio no recopila estadísticas de visitas que identifiquen a personas.'}</li>
</ul>
<h2>3. Para qué los usamos</h2>
<p>Usamos tus datos únicamente para responder tu consulta, elaborar presupuestos y, si avanzamos juntos, gestionar el proyecto. No los usamos para enviarte publicidad sin que la hayas pedido y no los vendemos a terceros.</p>
<h2>4. Con quién los compartimos</h2>
<p>Solo con proveedores que nos permiten operar el sitio y atender tus consultas (por ejemplo, el servicio de alojamiento web, el servicio que recibe el formulario y el proveedor de correo electrónico), que los tratan por cuenta nuestra y bajo medidas de seguridad. Podemos usar proveedores ubicados fuera de Argentina. También podremos compartirlos si una autoridad competente lo exige.</p>
<h2>5. Cookies y almacenamiento local</h2>
<p>Este sitio no usa cookies propias ni de publicidad. Guarda en tu navegador, de forma local, solo la hora del último envío del formulario para evitar envíos repetidos por error o spam. No se transmite a ningún servidor.</p>
<h2>6. Cuánto tiempo los conservamos</h2>
<p>Conservamos tu consulta mientras sea necesaria para atenderte y, si no se concreta un proyecto, por un plazo razonable posterior. Podés pedirnos que la eliminemos en cualquier momento.</p>
<h2>7. Tus derechos</h2>
<p>Según la Ley 25.326 de Protección de Datos Personales de la República Argentina, tenés derecho a acceder a tus datos, rectificarlos, actualizarlos y suprimirlos. Para ejercerlos, escribinos a <a href="mailto:${esc(config.email)}">${esc(config.email)}</a> y te respondemos dentro de los plazos legales.</p>
<p>La Agencia de Acceso a la Información Pública, en su carácter de órgano de control de la Ley 25.326, tiene la atribución de atender las denuncias y reclamos de quienes se vean afectados en sus derechos por el incumplimiento de las normas de protección de datos personales.</p>
<h2>8. Seguridad</h2>
<p>Aplicamos medidas técnicas y organizativas razonables para proteger tus datos contra accesos no autorizados, pérdida o alteración.</p>
<h2>9. Cambios en esta política</h2>
<p>Podemos actualizar esta política. La fecha de la última actualización figura al comienzo de esta página.</p>
</div></section>`;
  return layout({
    title: 'Política de privacidad | Kologic',
    description: 'Política de privacidad de Kologic: qué datos recopilamos, para qué los usamos y cómo ejercer tus derechos.',
    path: '/politica-de-privacidad.html',
    root: '',
    body,
  });
}

export function notFoundPage() {
  const body = `<section class="center-page"><div class="container"><h1 style="color:var(--navy-700)">404</h1><h2>No encontramos esta página</h2><p>Puede que el enlace haya cambiado o que la dirección esté mal escrita.</p><a class="btn btn--primary" href="/index.html">Volver al inicio</a></div></section>`;
  return layout({ title: 'Página no encontrada | Kologic', description: 'La página que buscás no existe o cambió de lugar. Volvé al inicio de Kologic para ver nuestros servicios y proyectos.', path: '/404.html', root: '/', body, noindex: true });
}
