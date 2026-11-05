// Page behaviour. Copy lives in locales/*.json and is loaded by boot.js
// onto window.__I18N__ before this file is eval'd by the runtime.

const EMAIL = 'jbernardopinheiro@gmail.com';
const HOME_PER_COLUMN = 2;
const LANG_KEY = 'jose-lang';
const DEFAULT_LANG = 'pt-PT';

const GSAP_SRC = [
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
];
const CARDS = '.showcase .work-card';
const TO_TOP_AFTER = 0.6; // show the back-to-top button after scrolling this share of the viewport

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// GSAP owns these inline styles; flag the card so its CSS transform transition
// doesn't chase the tween, and hand control back to CSS (hover lift) when done.
const moving = (on) => function () {
  for (const el of this.targets()) el.toggleAttribute('data-moving', on);
};

const SOCIAL = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jose-pinheiro/' },
  { label: 'GitHub', href: 'https://github.com/pinheirojose' },
];

function onGalleryPage() {
  return /(?:^|\/)projects\.html$/i.test(location.pathname);
}

function withHomeBase(href) {
  if (!onGalleryPage() || !String(href).startsWith('#')) return href;
  return './index.html' + href;
}

const PROJECT_TYPES = ['professional', 'personal'];

function withProjectUrl(project, copy) {
  const href = String(project.url || '').trim();
  const external = /^https?:/i.test(href);
  const type = PROJECT_TYPES.includes(project.type) ? project.type : 'personal';
  return {
    ...project,
    type,
    typeLabel: (copy.projectTypes || {})[type] || type,
    tags: project.tags || [],
    url: href,
    isPrivate: !href,
    target: external ? '_blank' : '_self',
    rel: external ? 'noopener noreferrer' : '',
  };
}

function hydrateCopy(raw) {
  if (!raw) return raw;
  const contactLinks = (raw.contactLinks || []).map((link) => {
    if (link.id === 'email') {
      return { label: link.label, text: EMAIL, href: 'mailto:' + EMAIL, target: '_self', rel: '' };
    }
    if (link.id === 'linkedin') {
      return { label: link.label, text: link.text, href: SOCIAL[0].href, target: '_blank', rel: 'noopener noreferrer' };
    }
    if (link.id === 'github') {
      return { label: link.label, text: link.text, href: SOCIAL[1].href, target: '_blank', rel: 'noopener noreferrer' };
    }
    return link;
  });
  return { ...raw, contactLinks };
}

function messagesFor(lang) {
  const catalog = (typeof window !== 'undefined' && window.__I18N__) || {};
  return hydrateCopy(catalog[lang] || catalog[DEFAULT_LANG] || {});
}
const LANG_PARAM = { en: 'en', pt: 'pt-PT', 'pt-pt': 'pt-PT' };

// ?lang= first (and remembered, so internal links keep it), then the stored
// choice, then the browser language, then the default.
function readLang() {
  const fromUrl = LANG_PARAM[String(new URLSearchParams(location.search).get('lang')).toLowerCase()];
  if (fromUrl) {
    writeLang(fromUrl);
    return fromUrl;
  }
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === 'en' || stored === 'pt-PT') return stored;
  } catch (_) { /* ignore */ }
  const browser = navigator.language;
  if (browser) return /^pt/i.test(browser) ? 'pt-PT' : 'en';
  return DEFAULT_LANG;
}

function writeLang(lang) {
  try { localStorage.setItem(LANG_KEY, lang); } catch (_) { /* ignore */ }
}

// Keep the language in the address bar (hash and other params untouched),
// so a copied link opens in the same language.
function syncLangParam(lang) {
  const url = new URL(location.href);
  url.searchParams.set('lang', lang === 'en' ? 'en' : 'pt');
  history.replaceState(history.state, '', url);
}

function syncDocument(copy) {
  document.documentElement.lang = copy.htmlLang;
  document.title = copy.docTitle;
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute('content', copy.docDescription);
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', copy.docTitle);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', copy.docDescription);
  const ogLocale = document.querySelector('meta[property="og:locale"]');
  if (ogLocale) ogLocale.setAttribute('content', copy.ogLocale);
}

class Component extends DCLogic {
  state = { menuOpen: false, sent: false, sending: false, formError: false, lang: readLang(), showTop: false };

  submit = (e) => {
    e.preventDefault();
    if (this.state.sent || this.state.sending) return;

    const form = e.currentTarget;
    if (form.querySelector('[name="_honey"]')?.value) return;

    const name = String(form.elements.name?.value || '').trim();
    const from = String(form.elements.email?.value || '').trim();
    const message = String(form.elements.message?.value || '').trim();
    if (!name || !from || !message) return;

    this.setState({ sending: true, formError: false });

    fetch('https://formsubmit.co/ajax/' + encodeURIComponent(EMAIL), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        name,
        email: from,
        message,
        _replyto: from,
        _subject: 'Contacto — ' + name,
        _captcha: 'false',
        _template: 'table',
      }),
    })
      .then((res) => res.json().then((data) => ({ res, data }), () => ({ res, data: {} })))
      .then(({ res, data }) => {
        if (!res.ok || data.success === false || data.success === 'false') {
          throw new Error('formsubmit');
        }
        this.setState({ sending: false, sent: true, formError: false });
      })
      .catch(() => {
        this.setState({ sending: false, sent: false, formError: true });
      });
  };

  componentDidMount() {
    this.wide = window.matchMedia('(min-width: 720px)');
    this.onWide = (e) => { if (e.matches) this.setState({ menuOpen: false }); };
    this.wide.addEventListener('change', this.onWide);
    this.onKey = (e) => { if (e.key === 'Escape') this.setState({ menuOpen: false }); };
    window.addEventListener('keydown', this.onKey);

    // Back-to-top: one rAF-throttled check per frame, and setState only when it flips.
    this.onScroll = () => {
      if (this.scrollTick) return;
      this.scrollTick = requestAnimationFrame(() => {
        this.scrollTick = 0;
        const showTop = window.scrollY > window.innerHeight * TO_TOP_AFTER;
        if (showTop !== this.state.showTop) this.setState({ showTop });
      });
    };
    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.onScroll();

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced && 'IntersectionObserver' in window) {
      document.documentElement.classList.add('reveal-on');
      this.reveals = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-in');
          this.reveals.unobserve(entry.target);
        }
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      this.observeReveals();
    }

    this.reduced = reduced;
    if (reduced) {
      this.cardsIO = true; // nothing to animate; reduced motion skips reveals entirely
      return;
    }
    loadScript(GSAP_SRC[0])
      .then(() => loadScript(GSAP_SRC[1]))
      .then(() => this.startCardMotion(), () => {
        // CDN unavailable: cards fall back to the IntersectionObserver reveal.
        this.cardsIO = true;
        this.observeReveals();
      });
  }

  startCardMotion() {
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);
    this.gsap = gsap;
    if (this.reduced) return;

    // Hide inline first, then lift the CSS reveal off the cards, so nothing flashes.
    gsap.set(CARDS, { opacity: 0, y: 16 });
    document.documentElement.classList.add('cards-motion');
    this.cardTriggers = ScrollTrigger.batch(CARDS, {
      start: 'top 92%',
      once: true,
      onEnter: (batch) => gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'expo.out',
        stagger: 0.07,
        overwrite: true,
        clearProps: 'opacity,transform',
        onStart: moving(true),
        onComplete: moving(false),
      }),
    });
  }

  killCardTriggers() {
    for (const t of this.cardTriggers || []) t.kill();
    this.cardTriggers = null;
  }

  componentDidUpdate() {
    if (this._lang && this._lang !== this.state.lang) {
      for (const node of document.querySelectorAll('.reveal')) {
        node.classList.add('is-in');
        node.setAttribute('data-observed', '');
      }
    }
    this._lang = this.state.lang;
    this.observeReveals();
  }

  componentWillUnmount() {
    this.wide.removeEventListener('change', this.onWide);
    window.removeEventListener('keydown', this.onKey);
    window.removeEventListener('scroll', this.onScroll);
    cancelAnimationFrame(this.scrollTick);
    this.reveals?.disconnect();
    this.killCardTriggers();
    this.gsap?.killTweensOf(CARDS);
    document.documentElement.classList.remove('reveal-on', 'cards-motion');
  }

  observeReveals() {
    if (!this.reveals) return;
    // Cards wait for GSAP; they only join the observer if it fails to load.
    const sel = this.cardsIO ? '.reveal' : '.reveal:not(.work-card)';
    for (const node of document.querySelectorAll(sel + ':not([data-observed])')) {
      node.setAttribute('data-observed', '');
      this.reveals.observe(node);
    }
  }

  scrollToTop = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    // Keyboard users land at the top too, not on a button that is about to hide.
    document.querySelector('.header__mark')?.focus({ preventScroll: true });
  };

  setLang(lang) {
    writeLang(lang);
    syncLangParam(lang);
    this.setState({ lang, menuOpen: false, sent: false });
  }

  renderVals() {
    const copy = messagesFor(this.state.lang);
    const gallery = onGalleryPage();
    syncDocument(gallery
      ? { ...copy, docTitle: copy.galleryDocTitle, docDescription: copy.galleryLead }
      : copy);
    const isPt = this.state.lang === 'pt-PT';
    const allProjects = (copy.projects || []).map((p) => withProjectUrl(p, copy));
    const byType = (type) => {
      const list = allProjects.filter((p) => p.type === type);
      return gallery ? list : list.slice(0, HOME_PER_COLUMN);
    };
    const professionalProjects = byType('professional');
    const personalProjects = byType('personal');
    const count = (type) => allProjects.filter((p) => p.type === type).length;

    return {
      copy,
      nav: (copy.nav || []).map((item) => ({ ...item, href: withHomeBase(item.href) })),
      homeHref: gallery ? './index.html' : '#top',
      talkHref: withHomeBase('#contact'),
      galleryHref: './projects.html',
      social: SOCIAL,
      contactLinks: copy.contactLinks,
      primaryContact: 'mailto:' + EMAIL,
      pillars: copy.pillars || [],
      professionalProjects,
      personalProjects,
      professionalCount: count('professional'),
      personalCount: count('personal'),
      timeline: copy.timeline || [],
      toolbox: copy.toolbox || [],
      notes: copy.notes || [],
      year: new Date().getFullYear(),

      heroVisual: this.props.heroVisual ?? true,
      showForm: this.props.showContactForm ?? true,

      menuOpen: this.state.menuOpen,
      menuLabel: this.state.menuOpen ? copy.menuClose : copy.menuOpen,
      drawerClass: this.state.menuOpen ? 'is-open' : '',
      toggleMenu: () => this.setState((s) => ({ menuOpen: !s.menuOpen })),
      closeMenu: () => this.setState({ menuOpen: false }),

      ptClass: isPt ? 'is-active' : '',
      enClass: isPt ? '' : 'is-active',
      isPt,
      isEn: !isPt,
      setPt: () => this.setLang('pt-PT'),
      setEn: () => this.setLang('en'),

      sent: this.state.sent,
      formBusy: this.state.sent || this.state.sending,
      sendLabel: this.state.sending ? copy.sending : (this.state.sent ? copy.sent : copy.send),
      sentMessage: this.state.sent ? copy.sentThanks : (this.state.formError ? copy.sendFail : ''),
      statusClass: 'form__status' + (this.state.formError ? ' form__status--error' : ''),
      submit: this.submit,

      toTopClass: this.state.showTop ? 'is-visible' : '',
      scrollToTop: this.scrollToTop,
    };
  }
}
