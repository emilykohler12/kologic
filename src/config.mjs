// ÚNICO lugar donde se editan los datos de contacto y las integraciones.
// Lo que esté vacío ("") se oculta solo del sitio: nunca queda un botón roto.
export const config = {
  name: 'Kologic',
  tagline: 'Innovación tecnológica con un toque humano',
  // Dominio final (se usa en canonical, sitemap y Open Graph). Cambiar cuando esté registrado.
  // PROVISORIO: todavía no hay dominio propio; hoy es la dirección de Cloudflare (workers.dev). Reemplazar por el dominio al registrarlo.
  siteUrl: 'https://kologic.kologic6.workers.dev',
  email: 'kologic6@gmail.com',
  // WhatsApp en formato internacional sin "+" ni espacios. Argentina móvil: 549 + código de área + número.
  // Ej: '5491112345678'. Vacío = se ocultan los botones de WhatsApp.
  whatsapp: '5493751574185', // 549 + 3751 + 574185 (móvil de Argentina)
  whatsappMessage: 'Hola Kologic, quiero consultar por un proyecto.',
  instagram: 'https://www.instagram.com/ko.logic/',
  instagramHandle: '@ko.logic',
  linkedin: 'https://www.linkedin.com/in/emily-noral%C3%AD-kohler-17ba62290', // perfil personal. Vacío = no se muestra.
  // Formulario: endpoint compatible con Formspree / Web3Forms / Getform (POST JSON).
  // Vacío = el formulario arma un correo (mailto) como alternativa.
  formEndpoint: 'https://formspree.io/f/xyekognb',
  // Analítica sin cookies (Plausible). Vacío = no se carga ninguna analítica.
  plausibleDomain: '',
  year: 2026,
  locale: 'es-AR',
};
