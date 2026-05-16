/* =========================================================
   Étienne Royet — Portfolio · script
   ========================================================= */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const navEl = document.querySelector('.topnav');
const navToggle = document.querySelector('.topnav-toggle');
const navLinks = Array.from(document.querySelectorAll('.topnav-link'));
const sections = navLinks
  .map((l) => document.querySelector(l.getAttribute('href')))
  .filter(Boolean);

function closeMobileNav() {
  if (navEl && navEl.classList.contains('is-open')) {
    navEl.classList.remove('is-open');
    navToggle?.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }
}

/* --- Smooth scroll for in-page anchors --- */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (href.length <= 1) return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', href);
      closeMobileNav();
    }
  });
});

/* --- Mobile nav toggle --- */
if (navToggle && navEl) {
  navToggle.addEventListener('click', () => {
    const open = navEl.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  });
}

/* --- Active section highlight (scroll-driven, robust in both directions) --- */
function setActive(id) {
  navLinks.forEach((l) => {
    l.classList.toggle('is-active', l.getAttribute('href') === `#${id}`);
  });
}

if (sections.length) {
  // The "trigger line" is the y-coord (from viewport top) above which a section
  // is considered "passed". Tuned to be just under the sticky topbar.
  const triggerOffset = () => {
    const topbar = document.querySelector('.topbar');
    return (topbar?.getBoundingClientRect().height ?? 60) + 24;
  };

  function updateActiveNav() {
    const line = triggerOffset();
    let activeId = sections[0].id;
    // Walk in DOM order: the active section is the last whose top has crossed above the line.
    for (const section of sections) {
      if (section.getBoundingClientRect().top - line < 0) {
        activeId = section.id;
      } else {
        break;
      }
    }
    // Bottom of page → make sure the last section gets the highlight.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      activeId = sections[sections.length - 1].id;
    }
    setActive(activeId);
  }

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateActiveNav();
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  updateActiveNav();
}

/* --- Subtle scroll-reveal for content blocks --- */
if (!reduceMotion && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.06, rootMargin: '0px 0px -40px 0px' }
  );

  document
    .querySelectorAll('.role-card, .skill-block, .skill-extra, .project-card, .approach-card, .info-block, .contact-card')
    .forEach((el) => {
      el.classList.add('reveal');
      revealObserver.observe(el);
    });
}
