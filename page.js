// Page behaviour. Copy lives in locales/*.json and is loaded by boot.js
// onto window.__I18N__ before this file is eval'd by the runtime.

const EMAIL = 'jbernardopinheiro@gmail.com';
const HOME_PROJECT_LIMIT = 3;
const LANG_KEY = 'jose-lang';
const DEFAULT_LANG = 'pt-PT';

const GSAP_SRC = [
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
];
const CARDS = '.showcase .work-card';

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

// An odd count leaves one card alone on the last row of a two-column grid,
// so the first card spans the full width instead.
function withFeature(list) {
  return list.map((project, i) => ({
    ...project,
    cardClass: i === 0 && list.length % 2 === 1 ? 'work-card--feature' : '',
  }));
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
function readLang() {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === 'en' || stored === 'pt-PT') return stored;
  } catch (_) { /* ignore */ }
  return DEFAULT_LANG;
}

function writeLang(lang) {
  try { localStorage.setItem(LANG_KEY, lang); } catch (_) { /* ignore */ }
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
  state = { menuOpen: false, sent: false, sending: false, formError: false, lang: readLang(), filter: 'all' };

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
    if (reduced && !onGalleryPage()) {
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
    if (this.reduced) return; // gallery still gets an opacity-only crossfade

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

  // Fade the current cards out, swap the list, fade the new ones in (componentDidUpdate).
  setFilter(filter) {
    const gsap = this.gsap;
    if (!gsap) return this.setState({ filter });
    if (filter === (this.pendingFilter ?? this.state.filter)) return;
    this.pendingFilter = filter;
    this.killCardTriggers();
    gsap.to(CARDS, {
      opacity: 0,
      y: this.reduced ? 0 : -6,
      duration: 0.14,
      ease: 'power2.out',
      overwrite: true,
      onStart: moving(true),
      onComplete: () => {
        this.pendingFilter = null;
        this.cardsIn = true;
        if (filter === this.state.filter) this.componentDidUpdate();
        else this.setState({ filter });
      },
    });
  }

  componentDidUpdate() {
    if (this.cardsIn) {
      this.cardsIn = false;
      this.gsap.fromTo(CARDS, { opacity: 0, y: this.reduced ? 0 : 10 }, {
        opacity: 1,
        y: 0,
        duration: this.reduced ? 0.2 : 0.32,
        ease: 'power3.out',
        stagger: this.reduced ? 0 : 0.04,
        overwrite: true,
        clearProps: 'opacity,transform',
        onStart: moving(true),
        onComplete: moving(false),
      });
    }

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

  setLang(lang) {
    writeLang(lang);
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
    const counts = { professional: 0, personal: 0 };
    for (const p of allProjects) counts[p.type] += 1;
    const filter = this.state.filter;
    const shown = filter === 'all' ? allProjects : allProjects.filter((p) => p.type === filter);

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
      projects: withFeature(gallery ? shown : allProjects.slice(0, HOME_PROJECT_LIMIT)),
      projectCount: allProjects.length,
      professionalCount: counts.professional,
      personalCount: counts.personal,
      filterAllClass: filter === 'all' ? 'is-active' : '',
      filterProClass: filter === 'professional' ? 'is-active' : '',
      filterPersonalClass: filter === 'personal' ? 'is-active' : '',
      filterIsAll: filter === 'all',
      filterIsPro: filter === 'professional',
      filterIsPersonal: filter === 'personal',
      showAll: () => this.setFilter('all'),
      showProfessional: () => this.setFilter('professional'),
      showPersonal: () => this.setFilter('personal'),
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
    };
  }
}
