// Page content and behaviour.
// The runtime evals this as `class Component extends DCLogic` — it is not a
// normal browser script. index.html fetches this file into <script data-dc-script>
// before loading script.js.

// ---------------------------------------------------------------------------
// Content — edit these arrays rather than the markup in index.html
// ---------------------------------------------------------------------------

const EMAIL = 'jbernardopinheiro@gmail.com'; // Placeholder — replace before going live

// Primary navigation (header, drawer, and footer reuse this)
const NAV = [
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
];

// Footer + contact list (placeholder URLs)
const SOCIAL = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jose-pinheiro/' },
  { label: 'GitHub', href: 'https://github.com/pinheirojose' },
];

// Rows in the contact panel (email, LinkedIn, GitHub)
const CONTACT_LINKS = [
  { label: 'EMAIL', text: EMAIL, href: 'mailto:' + EMAIL },
  { label: 'LINKEDIN', text: '/in/jose', href: SOCIAL[0].href, target: '_blank', rel: 'noopener noreferrer' },
  { label: 'GITHUB', text: '@jose', href: SOCIAL[1].href, target: '_blank', rel: 'noopener noreferrer' },
];

// About section cards
const PILLARS = [
  { label: 'BUILD', text: 'Software and application development.' },
  { label: 'SOLVE', text: 'Databases, integrations, troubleshooting and technical problems.' },
  { label: 'DELIVER', text: 'Projects, Agile delivery, support and client communication.' },
  { label: 'LEAD', text: 'Technical leadership, coordination and helping teams move forward.' },
  { label: 'CLIENT SUCCESS', text: 'Making sure what shipped actually works for the people using it.' },
  { label: 'SERVE', text: 'Building solutions for everyday problems — useful to someone, not just technically interesting.' },
];

// href is still a placeholder (#projects) until each project has a real URL
const PROJECTS = [
  {
    number: '01',
    kind: 'PERSONAL · WEB',
    title: 'Évora Serviços',
    href: '#projects',
    caption: 'SCREENSHOT / ÉVORA SERVIÇOS',
    summary: 'Finding a reliable local professional in Évora meant asking around. I built a platform where residents can search local services and businesses can be found without maintaining a website of their own.',
    role: 'Design, build, run',
    areas: 'Web · Database · Hosting',
    result: 'Live, growing listings',
  },
  {
    number: '02',
    kind: 'PROFESSIONAL · DATABASE',
    title: 'A migration nobody wanted to attempt',
    href: '#projects',
    caption: 'DIAGRAM / MIGRATION PATH',
    summary: 'A fifteen-year-old Oracle schema held the business together and nobody fully understood it. I mapped it, rewrote the reporting layer, and moved it to PostgreSQL in stages, with a rollback path at every step. Nothing was switched off until it was proven twice.',
    role: 'Technical lead',
    areas: 'Oracle · PostgreSQL · SQL',
    result: 'Zero data loss, faster reports',
  },
  {
    number: '03',
    kind: 'PROFESSIONAL · DEVOPS',
    title: 'Releases that stopped being events',
    href: '#projects',
    caption: 'DIAGRAM / DEPLOY PIPELINE',
    summary: 'Deployments happened on Friday evenings, by hand, with a checklist in a shared document. I containerised the stack and moved it to GitLab CI/CD with automated checks and repeatable environments. Releases became a normal Tuesday.',
    role: 'Engineer & owner',
    areas: 'Docker · GitLab CI · Infra',
    result: 'Minutes, not evenings',
  },
];

// Employer names are still placeholders ("Company")
const TIMELINE = [
  {
    period: '2021 — PRESENT',
    title: 'Technical Lead / Delivery',
    org: 'Company / Client projects',
    summary: 'Owning delivery end to end: scoping with clients, guiding the technical approach, and keeping the team unblocked. Still writing code, mostly where it matters most.',
  },
  {
    period: '2018 — PRESENT',
    title: 'DevOps & Release Management',
    org: 'Company',
    summary: 'Containerised legacy services, built CI/CD pipelines, and made environments reproducible. Reduced the number of things that could only be done by one person.',
  },
  {
    period: '2018 — PRESENT',
    title: 'Database Management',
    org: 'Company',
    summary: 'Oracle and PostgreSQL administration, performance work, integrations and the occasional 2 a.m. investigation. Learned to read a query plan before blaming the application.',
  },
  {
    period: '2015 — 2018',
    title: 'Software Development',
    org: 'Company',
    summary: 'Java  applications, internal tools and client features.',
  },
];

// Skills grouped by category
const TOOLBOX = [
  { label: 'DEVELOPMENT', items: ['Java', 'JavaScript', 'React', 'Python', 'APIs'] },
  { label: 'DATABASES', items: ['Oracle', 'PostgreSQL', 'SQL', 'Database administration'] },
  { label: 'DEVOPS', items: ['Docker', 'GitLab CI/CD', 'Deployment'] },
  { label: 'OTHER', items: ['WordPress', 'Web technologies', 'Cloud platforms', 'Integration tools'] },
];

class Component extends DCLogic {
  // menuOpen: mobile drawer. sent: contact form has been acknowledged.
  state = { menuOpen: false, sent: false };

  componentDidMount() {
    // Close the drawer when the viewport crosses back to desktop width
    this.wide = window.matchMedia('(min-width: 720px)');
    this.onWide = (e) => { if (e.matches) this.setState({ menuOpen: false }); };
    this.wide.addEventListener('change', this.onWide);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Scroll-in animation: CSS starts hidden only after this class is set
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
  }

  componentDidUpdate() {
    this.observeReveals();
  }

  componentWillUnmount() {
    this.wide.removeEventListener('change', this.onWide);
    this.reveals?.disconnect();
    document.documentElement.classList.remove('reveal-on');
  }

  /** `sc-if` branches mount after the first pass, so this reruns on every update. */
  observeReveals() {
    if (!this.reveals) return;
    for (const node of document.querySelectorAll('.reveal:not([data-observed])')) {
      node.setAttribute('data-observed', '');
      this.reveals.observe(node);
    }
  }

  // Flat object the template binds to via {{ name }}
  renderVals() {
    return {
      // Template lists
      nav: NAV,
      social: SOCIAL,
      contactLinks: CONTACT_LINKS,
      primaryContact: 'mailto:' + EMAIL,
      pillars: PILLARS,
      projects: PROJECTS,
      timeline: TIMELINE,
      toolbox: TOOLBOX,
      year: new Date().getFullYear(),

      // Optional blocks (can be toggled from the Design Component editor)
      heroVisual: this.props.heroVisual ?? true,
      showForm: this.props.showContactForm ?? true,

      // Mobile menu
      menuOpen: this.state.menuOpen,
      toggleMenu: () => this.setState((s) => ({ menuOpen: !s.menuOpen })),
      closeMenu: () => this.setState({ menuOpen: false }),

      // Contact form
      sent: this.state.sent,
      sendLabel: this.state.sent ? 'Message sent ✓' : 'Send message →',
      sentMessage: this.state.sent ? 'Thanks — I’ll get back to you.' : '',
      // Acknowledges locally only; nothing is delivered until this posts to a form endpoint.
      submit: (e) => { e.preventDefault(); this.setState({ sent: true }); },
    };
  }
}
