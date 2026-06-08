/* ============================================================
   NEXUS LEARN — Main JavaScript
   ============================================================ */

'use strict';

/* ── Navbar scroll effect ── */
const navbar = document.getElementById('navbar');
if (navbar) {
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── Active nav link highlighting ── */
function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href') || '';
    link.classList.toggle('active', href === path || (path === '' && href === 'index.html'));
  });
}
setActiveNav();

/* ── Hamburger / Mobile Nav ── */
const hamburger  = document.getElementById('hamburger');
const mobileNav  = document.getElementById('mobile-nav');

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close on link click
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('active');
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('active');
    }
  });
}

/* ── Smooth scrolling for anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH - 10;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ── Scroll reveal animations ── */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  els.forEach(el => observer.observe(el));
}
initScrollReveal();

/* ── Back to Top ── */
const backBtn = document.getElementById('back-to-top');
if (backBtn) {
  window.addEventListener('scroll', () => {
    backBtn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  backBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ── FAQ Accordion ── */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all
      items.forEach(i => {
        i.classList.remove('active');
        const a = i.querySelector('.faq-answer');
        if (a) a.style.maxHeight = null;
      });

      // Open clicked (if was closed)
      if (!isActive) {
        item.classList.add('active');
        const answer = item.querySelector('.faq-answer');
        const inner  = item.querySelector('.faq-answer-inner');
        if (answer && inner) {
          answer.style.maxHeight = inner.scrollHeight + 'px';
        }
      }
    });
  });
}
initFAQ();

/* ── Testimonials Slider ── */
function initSlider() {
  const track     = document.getElementById('testimonials-track');
  const prevBtn   = document.getElementById('slider-prev');
  const nextBtn   = document.getElementById('slider-next');
  const dotsWrap  = document.getElementById('slider-dots');

  if (!track) return;

  const cards = Array.from(track.querySelectorAll('.testimonial-card'));
  if (!cards.length) return;

  let perView = getPerView();
  let current = 0;
  let autoTimer = null;

  function getPerView() {
    return window.innerWidth < 768 ? 1 : window.innerWidth < 1100 ? 2 : 3;
  }

  function getTotal() {
    return Math.max(1, Math.ceil(cards.length / perView));
  }

  // Each card occupies (100 / perView)% of the track width
  // Track total width = cards.length * (100/perView)% of container
  function setCardWidths() {
    cards.forEach(c => {
      c.style.minWidth = `${100 / perView}%`;
    });
  }

  function goTo(idx) {
    const total = getTotal();
    current = ((idx % total) + total) % total;
    // Move by current * perView cards, each card is (100/perView)% wide
    const translatePct = current * perView * (100 / cards.length);
    track.style.transform = `translateX(-${translatePct}%)`;
    buildDots();
  }

  function buildDots() {
    if (!dotsWrap) return;
    const total = getTotal();
    dotsWrap.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === current ? ' active' : '');
      dot.setAttribute('aria-label', `Slide group ${i + 1}`);
      dot.addEventListener('click', () => { goTo(i); resetAuto(); });
      dotsWrap.appendChild(dot);
    }
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAuto(); });

  function startAuto() { autoTimer = setInterval(next, 4500); }
  function resetAuto() { clearInterval(autoTimer); startAuto(); }

  // Touch/swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); resetAuto(); }
  }, { passive: true });

  window.addEventListener('resize', () => {
    const newPV = getPerView();
    if (newPV !== perView) {
      perView = newPV;
      setCardWidths();
      goTo(0);
    }
  });

  // Track width: must accommodate all cards side by side
  track.style.width = `${(cards.length / perView) * 100}%`;
  setCardWidths();
  buildDots();
  goTo(0);
  startAuto();
}
initSlider();

/* ── Contact Form Validation ── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const successMsg = document.getElementById('form-success');

  function getField(name) {
    return form.querySelector(`[name="${name}"]`);
  }
  function getError(name) {
    return form.querySelector(`[data-error="${name}"]`);
  }

  function showError(name, msg) {
    const field = getField(name);
    const error = getError(name);
    if (field) field.classList.add('error');
    if (error) { error.textContent = msg; error.classList.add('show'); }
    return false;
  }
  function clearError(name) {
    const field = getField(name);
    const error = getError(name);
    if (field) field.classList.remove('error');
    if (error) error.classList.remove('show');
  }

  // Live validation
  ['name', 'email', 'phone', 'message'].forEach(name => {
    const field = getField(name);
    if (field) field.addEventListener('input', () => clearError(name));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    const nameVal    = (getField('name')?.value || '').trim();
    const emailVal   = (getField('email')?.value || '').trim();
    const phoneVal   = (getField('phone')?.value || '').trim();
    const messageVal = (getField('message')?.value || '').trim();

    // Clear all first
    ['name', 'email', 'phone', 'message'].forEach(clearError);

    if (!nameVal || nameVal.length < 2) {
      showError('name', 'Please enter your full name (at least 2 characters).');
      valid = false;
    }
    if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      showError('email', 'Please enter a valid email address.');
      valid = false;
    }
    if (!phoneVal || !/^[\d\s\+\-\(\)]{7,15}$/.test(phoneVal)) {
      showError('phone', 'Please enter a valid phone number.');
      valid = false;
    }
    if (!messageVal || messageVal.length < 10) {
      showError('message', 'Please enter a message (at least 10 characters).');
      valid = false;
    }

    if (valid) {
      form.style.display = 'none';
      if (successMsg) successMsg.classList.add('show');
    }
  });
}
initContactForm();

/* ── Particle background for hero ── */
function initParticles() {
  const canvas = document.getElementById('hero-particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles;
  const COUNT = 60;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function randomParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      a: Math.random() * 0.5 + 0.2,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, randomParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(91, 94, 244, ${p.a})`;
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(91, 94, 244, ${0.08 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  init();
  draw();
  window.addEventListener('resize', init, { passive: true });
}
initParticles();

/* ── Animated counter ── */
function animateCounter(el, target, duration = 1800) {
  let start = null;
  const step = timestamp => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString() + (el.dataset.suffix || '');
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        animateCounter(el, parseInt(el.dataset.counter));
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}
initCounters();

/* ── Typed text effect in hero ── */
function initTyped() {
  const el = document.getElementById('typed-text');
  if (!el) return;

  const words = ['Artificial Intelligence', 'Python Coding', 'Web Development', 'Robotics', 'Future Technology'];
  let wordIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let delay = 100;

  function type() {
    const current = words[wordIdx];
    el.textContent = isDeleting
      ? current.substring(0, charIdx - 1)
      : current.substring(0, charIdx + 1);

    isDeleting ? charIdx-- : charIdx++;

    if (!isDeleting && charIdx === current.length) {
      delay = 1800;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      wordIdx = (wordIdx + 1) % words.length;
      delay = 400;
    } else {
      delay = isDeleting ? 60 : 100;
    }

    setTimeout(type, delay);
  }
  type();
}
initTyped();

/* ── Courses filter (courses page) ── */
function initCourseFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const courseCards = document.querySelectorAll('.course-full-card');

  if (!filterBtns.length || !courseCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      courseCards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.style.display = match ? '' : 'none';
        card.style.opacity = match ? '' : '0';
      });
    });
  });
}
initCourseFilter();

/* ── Navbar active section highlight on scroll ── */
function initSectionObserver() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-links a, .mobile-nav a');
  if (!sections.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
}
initSectionObserver();

/* ── Tilt effect on cards ── */
function initTilt() {
  const tiltEls = document.querySelectorAll('[data-tilt]');
  tiltEls.forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * -14;
      el.style.transform = `perspective(600px) rotateX(${y}deg) rotateY(${x}deg) translateY(-4px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}
initTilt();
