const header = document.querySelector('header');
const hamburger = document.querySelector('.hamburger');
const navbar = document.querySelector('.nav-bar');
const navLinks = document.querySelectorAll('.nav-bar li');
const navLinkAnchors = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('#home, #projects, #contact');

// Header hide-on-scroll
window.addEventListener('scroll', () => {
  if (window.scrollY > 0) {
    header.classList.add('nav-show');
  } else {
    header.classList.remove('nav-show');
  }
});

// Hamburger menu
const closeNav = () => {
  navbar.classList.remove('nav-active');
  hamburger.classList.remove('toggle');
  hamburger.setAttribute('aria-expanded', 'false');
  navLinks.forEach((link) => {
    link.style.animation = '';
  });
};

hamburger.addEventListener('click', () => {
  const isOpen = navbar.classList.toggle('nav-active');
  hamburger.classList.toggle('toggle');
  hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

  navLinks.forEach((link, index) => {
    if (isOpen) {
      link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 1}s`;
    } else {
      link.style.animation = '';
    }
  });
});

navLinkAnchors.forEach((link) => {
  link.addEventListener('click', closeNav);
});

// Active nav on scroll
const setActiveNav = (id) => {
  navLinkAnchors.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
  });
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveNav(entry.target.id);
      }
    });
  },
  { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
);

sections.forEach((section) => observer.observe(section));
