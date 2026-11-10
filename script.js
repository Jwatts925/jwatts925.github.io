const menuButton = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');

// Keep the technical fastener field consistent anywhere the contact section appears.
document.querySelectorAll('.contact-section').forEach((contactSection) => {
  if (contactSection.querySelector('.contact-fastener-collage')) return;

  const collage = document.createElement('div');
  collage.className = 'contact-fastener-collage';
  collage.setAttribute('aria-hidden', 'true');

  for (let index = 1; index <= 21; index += 1) {
    const paddedIndex = String(index).padStart(2, '0');
    const image = document.createElement('img');
    image.className = `contact-fastener contact-fastener-${paddedIndex}`;
    image.src = `assets/contact-fasteners-layout/fastener-${paddedIndex}.png?v=fasteners-2026-1`;
    image.alt = '';
    collage.appendChild(image);
  }

  contactSection.prepend(collage);
});

if (menuButton && siteNav) {
  menuButton.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    document.body.classList.toggle('menu-open', isOpen);
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
      document.body.classList.remove('menu-open');
    });
  });
}

const revealElements = document.querySelectorAll('.reveal');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealElements.forEach((element) => element.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(
    (entries, revealObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((element) => observer.observe(element));
}

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

// Let the About portrait toggle between its monochrome and color treatments.
document.querySelectorAll('.hero-portrait[role="button"]').forEach((portrait) => {
  const togglePortrait = () => {
    const isColor = portrait.classList.toggle('is-color');
    portrait.setAttribute('aria-pressed', String(isColor));
  };

  portrait.addEventListener('click', togglePortrait);
  portrait.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    togglePortrait();
  });
});


// Open portfolio sections when their navigation link is used.
const portfolioSections = Array.from(document.querySelectorAll('.portfolio-section'));
const siteHeader = document.querySelector('.site-header');
let portfolioScrollTimer;

const closeOtherPortfolioSections = (activeSection) => {
  portfolioSections.forEach((section) => {
    if (section !== activeSection && section.open) section.open = false;
  });
};

const scrollPortfolioSectionToTop = (section) => {
  window.clearTimeout(portfolioScrollTimer);

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      portfolioScrollTimer = window.setTimeout(() => {
        const headerHeight = siteHeader?.getBoundingClientRect().height || 0;
        const sectionTop = window.scrollY + section.getBoundingClientRect().top;

        window.scrollTo({
          top: Math.max(0, sectionTop - headerHeight),
          left: 0,
          behavior: reducedMotion ? 'auto' : 'smooth',
        });
      }, 0);
    });
  });
};

const openPortfolioSection = (section, shouldScroll = false) => {
  if (!section) return;

  const wasAlreadyOpen = section.open;
  closeOtherPortfolioSections(section);
  section.open = true;

  if (shouldScroll && wasAlreadyOpen) {
    scrollPortfolioSectionToTop(section);
  }
};

portfolioSections.forEach((section) => {
  section.addEventListener('toggle', () => {
    if (section.open) {
      closeOtherPortfolioSections(section);
      scrollPortfolioSectionToTop(section);
    }
  });
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href')?.slice(1);
    if (!targetId) return;

    const targetSection = document.getElementById(targetId);
    if (targetSection?.classList.contains('portfolio-section')) {
      event.preventDefault();
      openPortfolioSection(targetSection, true);
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    }
  });
});

document.querySelectorAll('a[href="#top"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    window.scrollTo({ top: 0, left: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  });
});

if (window.location.hash) {
  const initialSection = document.querySelector(window.location.hash);
  if (initialSection?.classList.contains('portfolio-section')) {
    openPortfolioSection(initialSection, true);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  }
}

document.querySelectorAll('.fl-card-return').forEach((button) => {
  const card = button.closest('.fl-pricing-card');
  const details = card.querySelector('.fl-pricing-details');
  const summary = details.querySelector('summary');

  button.addEventListener('click', () => {
    details.open = false;
    summary.focus({ preventScroll: true });
    card.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'instant' : 'smooth' });
  });

  button.hidden = false;
});


// Update the portfolio page indicator as the reader scrolls.
const portfolioReader = document.querySelector('[data-portfolio-reader]');
const portfolioPages = Array.from(document.querySelectorAll('[data-portfolio-page]'));
const portfolioCurrentPage = document.querySelector('#portfolio-current-page');

if (portfolioReader && portfolioPages.length && portfolioCurrentPage) {
  let portfolioTicking = false;

  const updatePortfolioPage = () => {
    const viewportCenter = window.innerHeight * 0.5;
    let closestPage = portfolioPages[0];
    let closestDistance = Number.POSITIVE_INFINITY;

    portfolioPages.forEach((page) => {
      const rect = page.getBoundingClientRect();
      const pageCenter = rect.top + rect.height * 0.5;
      const distance = Math.abs(pageCenter - viewportCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestPage = page;
      }
    });

    const current = Number(closestPage.dataset.portfolioPage || 1);
    portfolioCurrentPage.textContent = String(current).padStart(2, '0');
    portfolioTicking = false;
  };

  const requestPortfolioUpdate = () => {
    if (!portfolioTicking) {
      window.requestAnimationFrame(updatePortfolioPage);
      portfolioTicking = true;
    }
  };

  updatePortfolioPage();
  window.addEventListener('scroll', requestPortfolioUpdate, { passive: true });
  window.addEventListener('resize', requestPortfolioUpdate);
}
