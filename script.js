/* ═══════════════════════════════════════════════
   script.js  –  Loyola Academy
   ═══════════════════════════════════════════════ */

'use strict';

/* ── 1. HAMBURGER / MOBILE NAV ── */
(function () {
  const hamburger = document.getElementById('hamburger');
  const navList   = document.getElementById('navList');

  if (!hamburger || !navList) return;

  hamburger.addEventListener('click', () => {
    const open = navList.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
  });

  // Dropdown toggle on mobile (tap instead of hover)
  navList.querySelectorAll('.has-drop > a').forEach(link => {
    link.addEventListener('click', e => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        link.closest('.has-drop').classList.toggle('open');
      }
    });
  });

  // Close nav when clicking outside
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !navList.contains(e.target)) {
      navList.classList.remove('open');
    }
  });
})();


/* ── 2. TICKER – duplicate content for seamless loop ── */
(function () {
  const track = document.querySelector('.ticker-track');
  if (!track) return;

  // Clone all children and append so the strip loops smoothly
  const clone = track.cloneNode(true);
  track.parentElement.appendChild(clone);
})();


/* ── 3. SCROLL-REVEAL (Intersection Observer) ── */
(function () {
  // Mark eligible elements
  const targets = document.querySelectorAll(
    '.info-card, .prog-card, .gallery-strip, .section-title, .footer-col'
  );

  targets.forEach(el => el.classList.add('reveal'));

  if (!('IntersectionObserver' in window)) {
    // Fallback: just show everything
    targets.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger children slightly
          setTimeout(() => entry.target.classList.add('visible'), i * 60);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  targets.forEach(el => observer.observe(el));
})();


/* ── 4. BACK TO TOP BUTTON ── */
(function () {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  const onScroll = () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ── 5. STICKY NAV – add shadow on scroll ── */
(function () {
  const nav = document.getElementById('mainNav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.style.boxShadow = window.scrollY > 10
      ? '0 4px 20px rgba(13,43,85,0.15)'
      : '0 2px 12px rgba(13,43,85,0.08)';
  }, { passive: true });
})();


/* ── 6. NOTICE LIST – auto-scroll marquee effect ── */
(function () {
  const list = document.getElementById('noticeList');
  if (!list) return;

  let paused = false;
  let offset = 0;
  const SPEED = 0.4; // px per frame

  // Wrap inner content
  list.style.overflow = 'hidden';
  list.style.position = 'relative';
  list.style.maxHeight = '280px';

  const items = [...list.children];
  const clone  = items.map(li => li.cloneNode(true));
  clone.forEach(li => list.appendChild(li));

  const totalH = () => list.scrollHeight / 2;

  function tick() {
    if (!paused) {
      offset += SPEED;
      if (offset >= totalH()) offset = 0;
      list.scrollTop = offset;
    }
    requestAnimationFrame(tick);
  }

  list.addEventListener('mouseenter', () => paused = true);
  list.addEventListener('mouseleave', () => paused = false);
  list.addEventListener('focusin',    () => paused = true);
  list.addEventListener('focusout',   () => paused = false);

  requestAnimationFrame(tick);
})();


/* ── 7. GALLERY – lightbox on click ── */
(function () {
  const galleryImgs = document.querySelectorAll('.gallery-row img');
  if (!galleryImgs.length) return;

  // Build overlay
  const overlay = document.createElement('div');
  overlay.id = 'lightbox';
  Object.assign(overlay.style, {
    position:       'fixed',
    inset:          '0',
    background:     'rgba(10,20,40,0.92)',
    display:        'none',
    alignItems:     'center',
    justifyContent: 'center',
    zIndex:         '9999',
    cursor:         'zoom-out',
    padding:        '1.5rem',
  });

  const lbImg = document.createElement('img');
  Object.assign(lbImg.style, {
    maxWidth:     '90vw',
    maxHeight:    '88vh',
    borderRadius: '12px',
    boxShadow:    '0 12px 48px rgba(0,0,0,0.6)',
    animation:    'lbFade 0.25s ease',
  });

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  Object.assign(closeBtn.style, {
    position:   'absolute',
    top:        '1rem',
    right:      '1.2rem',
    background: 'none',
    border:     'none',
    color:      'white',
    fontSize:   '2.5rem',
    cursor:     'pointer',
    lineHeight: '1',
  });

  // Add animation keyframe to page
  const style = document.createElement('style');
  style.textContent = `@keyframes lbFade { from { opacity:0; transform:scale(0.94); } to { opacity:1; transform:scale(1); } }`;
  document.head.appendChild(style);

  overlay.appendChild(lbImg);
  overlay.appendChild(closeBtn);
  document.body.appendChild(overlay);

  const open  = src => { lbImg.src = src; overlay.style.display = 'flex'; document.body.style.overflow = 'hidden'; };
  const close = ()  => { overlay.style.display = 'none'; document.body.style.overflow = ''; };

  galleryImgs.forEach(img => img.addEventListener('click', () => open(img.src)));
  overlay.addEventListener('click', e => { if (e.target !== lbImg) close(); });
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();


/* ── 8. PROGRAMMES CARDS – count-up animation ── */
(function () {
  const cards = document.querySelectorAll('.prog-card');
  if (!cards.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const countEl = entry.target.querySelector('.prog-count');
      if (!countEl || countEl.dataset.animated) return;

      const target = parseInt(countEl.textContent, 10);
      if (isNaN(target)) return;

      countEl.dataset.animated = '1';
      let current = 0;
      const step  = Math.max(1, Math.floor(target / 40));
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        countEl.textContent = current;
        if (current >= target) clearInterval(timer);
      }, 30);

      observer.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  cards.forEach(c => observer.observe(c));
})();


/* ── 9. ACTIVE NAV LINK (highlight current section) ── */
(function () {
  const links = document.querySelectorAll('.nav-list > li > a');
  if (!links.length) return;

  // Simple: highlight 'Home' by default; extend later with real section IDs
  links[0].style.color = 'var(--gold)';
})();


/* ── 10. SMOOTH IMAGE LOAD – fade in when ready ── */
(function () {
  document.querySelectorAll('img').forEach(img => {
    img.style.transition = 'opacity 0.4s ease';
    if (!img.complete) {
      img.style.opacity = '0';
      img.addEventListener('load',  () => img.style.opacity = '1');
      img.addEventListener('error', () => img.style.opacity = '0.3');
    }
  });
})();