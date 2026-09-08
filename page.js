// Page content and behaviour.
// The runtime evals this as `class Component extends DCLogic` — it is not a
// normal browser script. index.html fetches this file into <script data-dc-script>
// before loading script.js.

const EMAIL = 'jbernardopinheiro@gmail.com';
const DEFAULT_LANG = 'pt-PT';
const LANG_KEY = 'jose-lang';

const SOCIAL = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jose-pinheiro/' },
  { label: 'GitHub', href: 'https://github.com/pinheirojose' },
];

function withProjectUrl(project) {
  const href = String(project.url || '').trim();
  const external = /^https?:/i.test(href);
  return {
    ...project,
    url: href,
    target: external ? '_blank' : '_self',
    rel: external ? 'noopener noreferrer' : '',
  };
}

const COPY = {
  'pt-PT': {
    htmlLang: 'pt-PT',
    ogLocale: 'pt_PT',
    docTitle: 'José — Engenheiro de software',
    docDescription: 'Engenheiro de software a trabalhar em desenvolvimento, bases de dados, DevOps e entrega de projetos.',
    skip: 'Saltar para o conteúdo',
    navAria: 'Principal',
    footerAria: 'Rodapé',
    langLabel: 'Idioma',
    menuOpen: 'Abrir menu',
    menuClose: 'Fechar menu',
    talk: 'Vamos falar →',
    formHeading: 'Enviar mensagem',
    nav: [
      { label: 'Sobre', href: '#about' },
      { label: 'Projetos', href: '#projects' },
      { label: 'Experiência', href: '#experience' },
      { label: 'Contacto', href: '#contact' },
    ],
    heroEyebrow: 'ENGENHEIRO DE SOFTWARE · BASES DE DADOS · DESENVOLVIMENTO · DEVOPS · ENTREGA',
    heroTitle: 'Olá, sou o José.',
    taglineBefore: 'Construo coisas, corrijo coisas e, de vez em quando,',
    taglineMark: 'discuto com bases de dados',
    taglineAfter: '.',
    heroLead: 'Engenheiro de software a trabalhar em desenvolvimento, bases de dados, DevOps e entrega de projetos.',
    seeWork: 'Ver o meu trabalho →',
    aboutEyebrow: 'SOBRE / 01',
    aboutTitle: 'Mais do que um cargo.',
    aboutLede: 'Engenheiro de software de profissão; resolver problemas é o hábito.',
    aboutBody: 'O meu trabalho fica entre software, bases de dados, infraestrutura e fazer as coisas chegar ao fim. Gosto de transformar problemas complicados em soluções práticas — de preferência que ainda façam sentido daqui a seis meses.',
    pillars: [
      { label: 'CONSTRUIR', text: 'Desenvolvimento de software e aplicações.' },
      { label: 'RESOLVER', text: 'Bases de dados, integrações, diagnóstico e problemas técnicos.' },
      { label: 'ENTREGAR', text: 'Projetos, entrega Agile, suporte e comunicação com clientes.' },
      { label: 'LIDERAR', text: 'Liderança técnica, coordenação e ajudar as equipas a avançar.' },
      { label: 'SUCESSO DO CLIENTE', text: 'Garantir que o que foi entregue funciona para quem o usa.' },
      { label: 'SERVIR', text: 'Construir soluções para problemas do dia a dia — úteis para alguém, não só tecnicamente interessantes.' },
    ],
    projectsEyebrow: 'PROJETOS / 02',
    projectsTitle: 'Coisas que construí.',
    projectsLead: 'Alguns projetos, experiências e soluções em que trabalhei — profissionalmente e por conta própria.',
    projectLabel: 'PROJETO',
    roleLabel: 'FUNÇÃO',
    areasLabel: 'ÁREAS',
    resultLabel: 'RESULTADO',
    viewProject: 'VER PROJETO',
    projects: [
      {
        number: '01',
        kind: 'PESSOAL · WEB',
        title: 'Évora Serviços',
        image: './images/evora-servicos.png',
        caption: 'CAPTURA / ÉVORA SERVIÇOS',
        summary: 'Encontrar um profissional de confiança em Évora era perguntar à volta. Construí uma plataforma onde os residentes procuram serviços locais e as empresas aparecem sem precisarem de um site próprio.',
        role: 'Conceber, construir, gerir',
        areas: 'Web · Base de dados · Alojamento',
        result: 'Listagens ativas, a crescer',
        url: 'https://www.evoraservicos.pt/',
      },
      {
        number: '02',
        kind: 'PROFISSIONAL · Base de dados | Desenvolvimento | Entrega de projetos',
        title: 'Migração ERP da Universidade Internacional',
        image: './images/migration.png',
        caption: 'DIAGRAMA / PERCURSO DE MIGRAÇÃO',
        summary: 'Um projeto de migração de ERP universitário em que trabalhei em todo o ciclo de entrega — desde o desenvolvimento da base de dados e da aplicação até ao planeamento técnico, gestão de projeto e entrega final.',
        role: 'Responsável técnico',
        areas: 'Oracle · Java · SQL',
        result: 'Por detrás das bases de dados, das publicações e dos prazos, o projeto acabou por melhorar os sistemas usados todos os dias por milhares de estudantes e funcionários.',
        url: '',
      },
      {
        number: '03',
        kind: 'PROFISSIONAL · DBA | Linux | Oracle',
        title: 'Redesenho da infraestrutura',
        image: './images/database.png',
        caption: 'DIAGRAMA / DBA',
        summary: 'Redesenhei a infraestrutura de bases de dados para criar um ambiente mais escalável e isolado para vários clientes. A solução introduziu instâncias de base de dados dedicadas, a correr em infraestrutura Linux de código aberto, com suporte a várias versões de Oracle, da 11 à 19.',
        role: 'Administração Oracle | Planeamento e standardização',
        areas: 'Linux · Oracle · Infra · Docker',
        result: 'Transformar um ambiente partilhado e cada vez mais difícil de manter numa plataforma de bases de dados estruturada, isolada e escalável, capaz de servir diferentes clientes e versões de Oracle com mais controlo.',
        url: '',
      },
    ],
    experienceEyebrow: 'EXPERIÊNCIA / 03',
    experienceTitle: 'O caminho até aqui.',
    timeline: [
      {
        period: '2021 — PRESENTE',
        title: 'Líder técnico / Entrega',
        org: 'MorphisTech / Projetos de clientes em freelance',
        summary: 'Entrega de ponta a ponta, com um foco forte no sucesso do cliente. Traduzir necessidades de negócio em direção técnica clara, alinhar as partes interessadas, gerir prioridades e orientar as equipas na execução — para entregar soluções fiáveis que cumpram as expectativas do cliente e os objetivos do projeto.',
      },
      {
        period: '2018 — PRESENTE',
        title: 'DevOps e gestão de releases',
        org: 'MorphisTech',
        summary: 'Melhorei os processos de entrega de software com contentorização, automação CI/CD e standardização de ambientes. Ajudei a modernizar serviços antigos, a tornar as publicações reproduzíveis e a reduzir os pontos únicos de conhecimento entre desenvolvimento e operações.',
      },
      {
        period: '2018 — PRESENTE',
        title: 'Gestão de bases de dados',
        org: 'MorphisTech',
        summary: 'Engenharia de bases de dados Oracle e PostgreSQL: infraestrutura, desempenho, migrações, integrações e suporte em produção — com um foco forte na fiabilidade, na otimização e na ligação entre base de dados, aplicação e entrega.',
      },
      {
        period: '2015 — 2018',
        title: 'Desenvolvimento de software',
        org: 'MorphisTech',
        summary: 'Aplicações em Java, ferramentas internas e funcionalidades para clientes.',
      },
    ],
    toolboxEyebrow: 'FERRAMENTAS / 04',
    toolboxTitle: 'Ferramentas do ofício.',
    toolbox: [
      { label: 'DESENVOLVIMENTO', items: ['Java', 'JavaScript', 'React', 'Python', 'APIs'] },
      { label: 'BASES DE DADOS', items: ['Oracle', 'PostgreSQL', 'SQL', 'Administração de bases de dados'] },
      { label: 'DEVOPS', items: ['Docker', 'GitLab CI/CD', 'Publicação'] },
      { label: 'OUTROS', items: ['WordPress', 'Tecnologias web', 'Plataformas cloud', 'Ferramentas de integração'] },
    ],
    notesEyebrow: 'NOTAS / 05',
    notesTitle: 'Algumas coisas que aprendi.',
    notes: [
      { text: 'A maior parte dos problemas é mais simples do que parece à primeira.', aside: '', className: 'note' },
      { text: 'A maior parte dos «atalhos» não o é.', aside: '', className: 'note' },
      { text: 'Bom software é software que se consegue manter.', aside: '', className: 'note' },
      { text: 'Por vezes a base de dados é inocente.', aside: ' …mas nem sempre.', className: 'note note--interactive' },
    ],
    contactEyebrow: 'CONTACTO / 06',
    contactTitle: 'Tem um problema que valha a pena resolver?',
    contactLead: 'Seja um projeto, uma oportunidade ou um problema técnico particularmente teimoso, estou sempre aberto a uma conversa.',
    contactLinks: [
      { label: 'EMAIL', text: EMAIL, href: 'mailto:' + EMAIL, target: '_self', rel: '' },
      { label: 'LINKEDIN', text: '/in/jose', href: SOCIAL[0].href, target: '_blank', rel: 'noopener noreferrer' },
      { label: 'GITHUB', text: '@jose', href: SOCIAL[1].href, target: '_blank', rel: 'noopener noreferrer' },
    ],
    formName: 'NOME',
    formEmail: 'EMAIL',
    formMessage: 'MENSAGEM',
    send: 'Enviar mensagem →',
    sent: 'Mensagem enviada ✓',
    sentThanks: 'Obrigado — respondo em breve.',
    footerRole: 'ENGENHEIRO DE SOFTWARE',
  },
  en: {
    htmlLang: 'en',
    ogLocale: 'en_GB',
    docTitle: 'José — Software Engineer',
    docDescription: 'Software Engineer working across software development, databases, DevOps and project delivery.',
    skip: 'Skip to content',
    navAria: 'Primary',
    footerAria: 'Footer',
    langLabel: 'Language',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    talk: 'Let’s talk →',
    formHeading: 'Send a message',
    nav: [
      { label: 'About', href: '#about' },
      { label: 'Projects', href: '#projects' },
      { label: 'Experience', href: '#experience' },
      { label: 'Contact', href: '#contact' },
    ],
    heroEyebrow: 'SOFTWARE ENGINEER · DATABASES · DEVELOPMENT · DEVOPS · DELIVERY',
    heroTitle: 'Hi, I’m José.',
    taglineBefore: 'I build things, fix things, and occasionally',
    taglineMark: 'argue with databases',
    taglineAfter: '.',
    heroLead: 'Software Engineer working across software development, databases, DevOps and project delivery.',
    seeWork: 'See my work →',
    aboutEyebrow: 'ABOUT / 01',
    aboutTitle: 'More than a job title.',
    aboutLede: 'Software Engineer by profession, problem solver by habit.',
    aboutBody: 'My work sits somewhere between software, databases, infrastructure and getting things delivered. I enjoy turning complicated problems into practical solutions — preferably ones that still make sense six months later.',
    pillars: [
      { label: 'BUILD', text: 'Software and application development.' },
      { label: 'SOLVE', text: 'Databases, integrations, troubleshooting and technical problems.' },
      { label: 'DELIVER', text: 'Projects, Agile delivery, support and client communication.' },
      { label: 'LEAD', text: 'Technical leadership, coordination and helping teams move forward.' },
      { label: 'CLIENT SUCCESS', text: 'Making sure what shipped actually works for the people using it.' },
      { label: 'SERVE', text: 'Building solutions for everyday problems — useful to someone, not just technically interesting.' },
    ],
    projectsEyebrow: 'PROJECTS / 02',
    projectsTitle: 'Things I’ve built.',
    projectsLead: 'A few projects, experiments and solutions I’ve worked on — professionally and independently.',
    projectLabel: 'PROJECT',
    roleLabel: 'ROLE',
    areasLabel: 'AREAS',
    resultLabel: 'RESULT',
    viewProject: 'VIEW PROJECT',
    projects: [
      {
        number: '01',
        kind: 'PERSONAL · WEB',
        title: 'Évora Serviços',
        image: './images/evora-servicos.png',
        caption: 'SCREENSHOT / ÉVORA SERVIÇOS',
        summary: 'Finding a reliable local professional in Évora meant asking around. I built a platform where residents can search local services and businesses can be found without maintaining a website of their own.',
        role: 'Design, build, run',
        areas: 'Web · Database · Hosting',
        result: 'Live, growing listings',
        url: 'https://www.evoraservicos.pt/',
      },
      {
        number: '02',
        kind: 'PROFESSIONAL · Database | Development | Project Delivery',
        title: 'International University ERP Migration',
        image: './images/migration.png',
        caption: 'DIAGRAM / MIGRATION PATH',
        summary: 'A university ERP migration project where I worked across the entire delivery lifecycle — from database and application development to technical planning, project management, and final delivery.',
        role: 'Technical lead',
        areas: 'Oracle · Java · SQL',
        result: 'Behind the databases, deployments and deadlines, the project ultimately helped improve the systems used every day by thousands of students and staff.',
        url: '',
      },
      {
        number: '03',
        kind: 'PROFESSIONAL · DBA | Linux | Oracle',
        title: 'Infrastructure Redesign',
        image: './images/database.png',
        caption: 'DIAGRAM / DBA',
        summary: 'Redesigned the database infrastructure to create a more scalable and isolated environment for multiple clients. The solution introduced dedicated database instances running on open-source Linux infrastructure, supporting multiple Oracle versions, from 11 -> 19.',
        role: 'Oracle Administration | Planning & Standardisation',
        areas: 'Linux · Oracle · Infra · Docker',
        result: 'Turning a shared and increasingly difficult-to-maintain environment into a structured, isolated and scalable database platform that could support different clients and Oracle versions with greater control',
        url: '',
      },
    ],
    experienceEyebrow: 'EXPERIENCE / 03',
    experienceTitle: 'The road so far.',
    timeline: [
      {
        period: '2021 — PRESENT',
        title: 'Technical Lead / Delivery',
        org: 'MorphisTech / Freelance client projects',
        summary: 'Driving end-to-end delivery with a strong focus on client success. Translating business needs into clear technical direction, aligning stakeholders, managing priorities and guiding teams through execution to deliver reliable solutions that meet both client expectations and project objectives.',
      },
      {
        period: '2018 — PRESENT',
        title: 'DevOps & Release Management',
        org: 'MorphisTech',
        summary: 'Improved software delivery processes through containerisation, CI/CD automation and environment standardisation. Helped modernise legacy services, establish reproducible deployments and reduce single points of knowledge across development and operations',
      },
      {
        period: '2018 — PRESENT',
        title: 'Database Management',
        org: 'MorphisTech',
        summary: 'Oracle and PostgreSQL database engineering, covering infrastructure, performance, migrations, integrations and production support — with a strong focus on reliability, optimisation and the connection between database, application and delivery.',
      },
      {
        period: '2015 — 2018',
        title: 'Software Development',
        org: 'MorphisTech',
        summary: 'Java  applications, internal tools and client features.',
      },
    ],
    toolboxEyebrow: 'TOOLBOX / 04',
    toolboxTitle: 'Tools of the trade.',
    toolbox: [
      { label: 'DEVELOPMENT', items: ['Java', 'JavaScript', 'React', 'Python', 'APIs'] },
      { label: 'DATABASES', items: ['Oracle', 'PostgreSQL', 'SQL', 'Database administration'] },
      { label: 'DEVOPS', items: ['Docker', 'GitLab CI/CD', 'Deployment'] },
      { label: 'OTHER', items: ['WordPress', 'Web technologies', 'Cloud platforms', 'Integration tools'] },
    ],
    notesEyebrow: 'NOTES / 05',
    notesTitle: 'A few things I’ve learned.',
    notes: [
      { text: 'Most problems are simpler than they first appear.', aside: '', className: 'note' },
      { text: 'Most “quick fixes” aren’t.', aside: '', className: 'note' },
      { text: 'Good software is software people can maintain.', aside: '', className: 'note' },
      { text: 'Sometimes the database is innocent.', aside: ' …but not always.', className: 'note note--interactive' },
    ],
    contactEyebrow: 'CONTACT / 06',
    contactTitle: 'Got a problem worth solving?',
    contactLead: 'Whether it’s a project, an opportunity, or a particularly stubborn technical problem, I’m always open to a conversation.',
    contactLinks: [
      { label: 'EMAIL', text: EMAIL, href: 'mailto:' + EMAIL, target: '_self', rel: '' },
      { label: 'LINKEDIN', text: '/in/jose', href: SOCIAL[0].href, target: '_blank', rel: 'noopener noreferrer' },
      { label: 'GITHUB', text: '@jose', href: SOCIAL[1].href, target: '_blank', rel: 'noopener noreferrer' },
    ],
    formName: 'NAME',
    formEmail: 'EMAIL',
    formMessage: 'MESSAGE',
    send: 'Send message →',
    sent: 'Message sent ✓',
    sentThanks: 'Thanks — I’ll get back to you.',
    footerRole: 'SOFTWARE ENGINEER',
  },
};

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
  state = { menuOpen: false, sent: false, lang: readLang() };

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
    this.reveals?.disconnect();
    document.documentElement.classList.remove('reveal-on');
  }

  observeReveals() {
    if (!this.reveals) return;
    for (const node of document.querySelectorAll('.reveal:not([data-observed])')) {
      node.setAttribute('data-observed', '');
      this.reveals.observe(node);
    }
  }

  setLang(lang) {
    writeLang(lang);
    this.setState({ lang, menuOpen: false, sent: false });
  }

  renderVals() {
    const copy = COPY[this.state.lang] || COPY[DEFAULT_LANG];
    syncDocument(copy);
    const isPt = this.state.lang === 'pt-PT';

    return {
      copy,
      nav: copy.nav,
      social: SOCIAL,
      contactLinks: copy.contactLinks,
      primaryContact: 'mailto:' + EMAIL,
      pillars: copy.pillars,
      projects: copy.projects.map(withProjectUrl),
      timeline: copy.timeline,
      toolbox: copy.toolbox,
      notes: copy.notes,
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
      sendLabel: this.state.sent ? copy.sent : copy.send,
      sentMessage: this.state.sent ? copy.sentThanks : '',
      submit: (e) => { e.preventDefault(); this.setState({ sent: true }); },
    };
  }
}
