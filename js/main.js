// ============================================================
// TRANSLATIONS — English and Spanish content
// ============================================================

const translations = {
  en: {
    // Page meta
    'page-title':       'Batres Company Limited — AI Automation',
    'page-description': 'Batres Company Limited — AI automation agency. We build intelligent systems that eliminate repetitive work.',

    // Nav
    'nav-services': 'Services',
    'nav-about':    'About',
    'nav-contact':  'Contact',

    // Hero
    'hero-label':   'AI Automation Agency — Est. 2024',
    'hero-heading': 'Automate the<br><em>repetitive.</em><br>Amplify the<br>human.',
    'hero-sub':     'Batres Company Limited builds AI-powered automation systems that eliminate manual bottlenecks, reduce operational costs, and free your team to focus on work that actually matters.',
    'hero-cta':     'Start a Conversation',

    // Hero spec
    'spec-label-1': 'Specialization',  'spec-value-1': 'AI Process Automation',
    'spec-label-2': 'Delivery',        'spec-value-2': 'Custom Systems',
    'spec-label-3': 'Model',           'spec-value-3': 'Agency / Consultancy',
    'spec-label-4': 'Location',        'spec-value-4': 'Global / Remote',

    // Services
    'section-services': 'Services',
    'services-count':   '04 Offerings',
    's1-title': 'Workflow Automation',
    's1-body':  'We map your business processes end-to-end and replace manual, repetitive steps with intelligent pipelines. WhatsApp → Calendar, email → CRM, forms → spreadsheets — any repetitive workflow, automated.',
    's1-tag':   'Process · Integration · n8n',
    's2-title': 'Custom AI Agents',
    's2-body':  'Autonomous agents that handle customer inquiries, schedule appointments, monitor systems, and make decisions — operating 24/7 without human intervention, on your existing infrastructure.',
    's2-tag':   'Agents · LLM · APIs',
    's3-title': 'Systems Integration',
    's3-body':  'Connect your CRM, ERP, communication tools, and databases into a unified, automated ecosystem — eliminating data silos and redundant manual entry across your entire operation.',
    's3-tag':   'API · Sync · Ops',
    's4-title': 'AI Data Processing',
    's4-body':  'Transform unstructured data — documents, emails, reports — into structured, actionable information using large language models and custom extraction pipelines.',
    's4-tag':   'LLM · ETL · Analysis',

    // About
    'section-about': 'About',
    'about-count':   'Who We Are',
    'about-lead':    'We are a focused AI automation agency. Not a 200-person consultancy with generic playbooks — a specialist team that goes deep on your specific operational problems.',
    'about-body':    'Every engagement starts with a process audit: we identify which tasks are costing you the most time and money, then design and deliver automation that pays for itself within months. We build on proven infrastructure — n8n, Make, OpenAI, Anthropic, and custom APIs — and we hand over systems you own and can run independently.',
    'pillar1-label': '01 — Precision',
    'pillar1-text':  'We solve specific problems, not vague “digital transformation.”',
    'pillar2-label': '02 — Ownership',
    'pillar2-text':  'You own the systems we build. No vendor lock-in.',
    'pillar3-label': '03 — Speed',
    'pillar3-text':  'First working prototype in days, not months.',

    // Contact & form
    'section-contact':  'Contact',
    'contact-count':    'Get In Touch',
    'contact-lead':     'Ready to automate? Tell us about your biggest operational challenge and we’ll respond within one business day.',
    'form-name-label':    'Full Name <span aria-hidden="true">*</span>',
    'form-email-label':   'Email Address <span aria-hidden="true">*</span>',
    'form-phone-label':   'Phone (optional)',
    'form-message-label': 'Message <span aria-hidden="true">*</span>',
    'form-name-ph':    'Jane Smith',
    'form-email-ph':   'jane@company.com',
    'form-phone-ph':   '+1 555 000 0000',
    'form-message-ph': 'Describe your automation challenge...',
    'submit-btn':   'Send Message',
    'submitting':   'Sending…',
    'submitted':    'Sent',
    'form-success': 'Message sent. We will respond within one business day.',
    'form-error':   'Something went wrong. Please email us directly at sebastian@batrescompany.tech',

    // Footer
    'footer-copy': '© 2024–2026 Batres Company Limited. All rights reserved.',
  },

  es: {
    // Page meta
    'page-title':       'Batres Company Limited — Automatización con IA',
    'page-description': 'Batres Company Limited — Agencia de automatización con IA. Construimos sistemas inteligentes que eliminan el trabajo repetitivo.',

    // Nav
    'nav-services': 'Servicios',
    'nav-about':    'Nosotros',
    'nav-contact':  'Contacto',

    // Hero
    'hero-label':   'Agencia de Automatización con IA — Fund. 2024',
    'hero-heading': 'Automatiza lo<br><em>repetitivo.</em><br>Amplifica lo<br>humano.',
    'hero-sub':     'Batres Company Limited construye sistemas de automatización con IA que eliminan cuellos de botella manuales, reducen costos operativos y liberan a tu equipo para enfocarse en el trabajo que realmente importa.',
    'hero-cta':     'Hablemos',

    // Hero spec
    'spec-label-1': 'Especialización', 'spec-value-1': 'Automatización con IA',
    'spec-label-2': 'Entrega',         'spec-value-2': 'Sistemas Personalizados',
    'spec-label-3': 'Modelo',          'spec-value-3': 'Agencia / Consultoría',
    'spec-label-4': 'Ubicación',       'spec-value-4': 'Global / Remoto',

    // Services
    'section-services': 'Servicios',
    'services-count':   '04 Servicios',
    's1-title': 'Automatización de Flujos',
    's1-body':  'Mapeamos tus procesos de extremo a extremo y reemplazamos los pasos manuales con pipelines inteligentes. WhatsApp → Calendar, email → CRM, formularios → hojas de cálculo — cualquier flujo repetitivo, automatizado.',
    's1-tag':   'Proceso · Integración · n8n',
    's2-title': 'Agentes IA Personalizados',
    's2-body':  'Agentes autónomos que atienden consultas de clientes, agendan citas, monitorean sistemas y toman decisiones — operando 24/7 sin intervención humana, en tu infraestructura existente.',
    's2-tag':   'Agentes · LLM · APIs',
    's3-title': 'Integración de Sistemas',
    's3-body':  'Conecta tu CRM, ERP, herramientas de comunicación y bases de datos en un ecosistema unificado — eliminando silos de datos y duplicación manual de información en toda tu operación.',
    's3-tag':   'API · Sincronización · Ops',
    's4-title': 'Procesamiento de Datos con IA',
    's4-body':  'Transforma datos no estructurados — documentos, emails, reportes — en información estructurada y accionable usando modelos de lenguaje y pipelines de extracción personalizados.',
    's4-tag':   'LLM · ETL · Análisis',

    // About
    'section-about': 'Nosotros',
    'about-count':   'Quiénes Somos',
    'about-lead':    'Somos una agencia de automatización con IA enfocada. No una consultora de 200 personas con fórmulas genéricas — un equipo especialista que va a fondo en tus problemas operativos específicos.',
    'about-body':    'Cada proyecto comienza con una auditoría de procesos: identificamos qué tareas te cuestan más tiempo y dinero, luego diseñamos y entregamos automatizaciones que se pagan solas en meses. Construimos sobre infraestructura probada — n8n, Make, OpenAI, Anthropic y APIs personalizadas — y entregamos sistemas que son tuyos y puedes operar de forma independiente.',
    'pillar1-label': '01 — Precisión',
    'pillar1-text':  'Resolvemos problemas específicos, no una vaga “transformación digital.”',
    'pillar2-label': '02 — Propiedad',
    'pillar2-text':  'Los sistemas que construimos son tuyos. Sin dependencia de proveedores.',
    'pillar3-label': '03 — Velocidad',
    'pillar3-text':  'Primer prototipo funcional en días, no meses.',

    // Contact & form
    'section-contact':  'Contacto',
    'contact-count':    'Escríbenos',
    'contact-lead':     '¿Listo para automatizar? Cuéntanos tu mayor reto operativo y te respondemos en un día hábil.',
    'form-name-label':    'Nombre completo <span aria-hidden="true">*</span>',
    'form-email-label':   'Correo electrónico <span aria-hidden="true">*</span>',
    'form-phone-label':   'Teléfono (opcional)',
    'form-message-label': 'Mensaje <span aria-hidden="true">*</span>',
    'form-name-ph':    'Ana García',
    'form-email-ph':   'ana@empresa.com',
    'form-phone-ph':   '+52 55 1234 5678',
    'form-message-ph': 'Describe tu reto de automatización...',
    'submit-btn':   'Enviar Mensaje',
    'submitting':   'Enviando…',
    'submitted':    'Enviado',
    'form-success': 'Mensaje enviado. Te respondemos en un día hábil.',
    'form-error':   'Algo salió mal. Escríbenos directamente a sebastian@batrescompany.tech',

    // Footer
    'footer-copy': '© 2024–2026 Batres Company Limited. Todos los derechos reservados.',
  }
};

// ============================================================
// LANGUAGE ENGINE
// ============================================================

let currentLang = 'en';

function setLanguage(lang) {
  const t = translations[lang];

  // Update <html lang=""> so browsers and screen readers know the language
  document.documentElement.lang = lang;

  // Update page title and meta description
  document.title = t['page-title'];
  document.querySelector('meta[name="description"]').setAttribute('content', t['page-description']);

  // Update every element that has a data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    el.innerHTML = t[el.dataset.i18n] || '';
  });

  // Update input/textarea placeholders
  document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
    el.placeholder = t[el.dataset.i18nPh] || '';
  });

  // Update the language toggle button label
  // If currently English → show "ES" (invite to switch to Spanish)
  // If currently Spanish → show "EN" (invite to switch to English)
  document.getElementById('lang-toggle').textContent = lang === 'en' ? 'ES' : 'EN';

  // Save preference so the choice persists across page refreshes
  localStorage.setItem('lang', lang);

  currentLang = lang;
}

function detectLanguage() {
  // 1. Check if user already made a choice
  const saved = localStorage.getItem('lang');
  if (saved === 'en' || saved === 'es') return saved;

  // 2. Check the browser's language setting
  const browserLang = navigator.language || navigator.userLanguage || 'en';
  return browserLang.toLowerCase().startsWith('es') ? 'es' : 'en';
}

// Apply language as soon as the page loads
setLanguage(detectLanguage());


// ============================================================
// 1. MOBILE NAVIGATION TOGGLE
// ============================================================

const siteHeader = document.querySelector('.site-header');
const navToggle  = document.querySelector('.nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');

navToggle.addEventListener('click', function () {
  const isOpen = siteHeader.classList.toggle('is-open');

  navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  mobileMenu.setAttribute('aria-hidden',  isOpen ? 'false' : 'true');
  navToggle.setAttribute(
    'aria-label',
    isOpen ? 'Close navigation menu' : 'Open navigation menu'
  );
});


// ============================================================
// 2. CLOSE MOBILE MENU WHEN A LINK IS CLICKED
// ============================================================

const mobileLinks = mobileMenu.querySelectorAll('a');

mobileLinks.forEach(function (link) {
  link.addEventListener('click', function () {
    siteHeader.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    navToggle.setAttribute('aria-label', 'Open navigation menu');
  });
});


// ============================================================
// 3. LANGUAGE TOGGLE BUTTON
// ============================================================

document.getElementById('lang-toggle').addEventListener('click', function () {
  setLanguage(currentLang === 'en' ? 'es' : 'en');
});


// ============================================================
// 4. CONTACT FORM — Async submission via Web3Forms
// ============================================================

const form       = document.getElementById('contact-form');
const submitBtn  = document.getElementById('submit-btn');
const successMsg = document.getElementById('form-success');
const errorMsg   = document.getElementById('form-error');

form.addEventListener('submit', async function (event) {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  submitBtn.disabled    = true;
  submitBtn.textContent = translations[currentLang]['submitting'];

  const formData = new FormData(form);

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      successMsg.hidden = false;
      errorMsg.hidden   = true;
      form.reset();
      submitBtn.textContent = translations[currentLang]['submitted'];
    } else {
      throw new Error('Submission failed');
    }

  } catch (err) {
    errorMsg.hidden   = false;
    successMsg.hidden = true;
    submitBtn.disabled    = false;
    submitBtn.textContent = translations[currentLang]['submit-btn'];
  }
});
