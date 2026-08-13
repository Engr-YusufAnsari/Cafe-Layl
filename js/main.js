// ═══════════════════════════════════════
// CAFE LAYL — SITE-WIDE BEHAVIOUR
// ═══════════════════════════════════════

// ── MOBILE NAV ──
const navToggle = document.getElementById('navToggle');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    document.getElementById('mobileNav').classList.toggle('open');
  });
}
function closeMobileNav() {
  const m = document.getElementById('mobileNav');
  if (m) m.classList.remove('open');
}

// ── STICKY HEADER SHADOW ──
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  nav.style.boxShadow = window.scrollY > 40
    ? '0 4px 24px rgba(17,56,31,0.5)'
    : '0 2px 20px rgba(17,56,31,0.35)';
});

// ── FAQ ACCORDION ──
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  if (!q) return;
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ── SCROLL REVEAL ──
// Cards and content blocks fade + slide up into view as the visitor scrolls.
// (Hero content animates independently via CSS on page load.)
const revealTargets = document.querySelectorAll(
  '.about-card, .about-copy, .review-card, .gallery-item, .contact-card, ' +
  '.catering-cta-card, .catering-grid > div, .feature-pill, .menu-tabs, .how-to-order-box, ' +
  '.category-chip, .process-card, .visit-card, .why-card, .bento-item'
);
if ('IntersectionObserver' in window && revealTargets.length) {
  revealTargets.forEach((el, i) => {
    el.classList.add('reveal-el');
    el.style.transitionDelay = (i % 4) * 0.06 + 's';
  });
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  revealTargets.forEach(el => revealObserver.observe(el));
}

// ── BLUR-TEXT: word-by-word blur/fade entrance for headline ──
// Splits an element's words into spans (keeping any inline children, e.g. an
// accent <span>, intact) and staggers each word's blur-in animation.
document.querySelectorAll('.blur-text').forEach((el) => {
  const nodes = Array.from(el.childNodes);
  el.innerHTML = '';
  el.style.display = 'flex';
  el.style.flexWrap = 'wrap';
  el.style.justifyContent = el.style.justifyContent || 'center';
  el.style.rowGap = '0.1em';

  let wordIndex = 0;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  nodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const words = node.textContent.split(/\s+/).filter(Boolean);
      words.forEach((word) => {
        const span = document.createElement('span');
        span.textContent = word;
        span.className = 'blur-word';
        if (!reduceMotion) span.style.animationDelay = (wordIndex * 45) + 'ms';
        el.appendChild(span);
        wordIndex++;
      });
    } else if (node.nodeName === 'BR') {
      el.appendChild(document.createElement('br'));
      el.style.flexBasis = '100%';
    } else {
      // Element node (e.g. the gradient accent span) — animate as one unit.
      node.classList.add('blur-word');
      if (!reduceMotion) node.style.animationDelay = (wordIndex * 45) + 'ms';
      el.appendChild(node);
      wordIndex++;
    }
  });
});

// ── AMBIENT ORB PARALLAX ──
// Gentle cursor-follow drift on the hero's glass orbs — desktop only.
if (window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const heroEl = document.querySelector('.hero');
  const orbs = document.querySelectorAll('.orb');
  if (heroEl && orbs.length) {
    heroEl.addEventListener('mousemove', (e) => {
      const rect = heroEl.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      orbs.forEach((orb, i) => {
        const strength = 14 + i * 6;
        orb.style.translate = `${px * strength}px ${py * strength}px`;
      });
    });
  }
}
