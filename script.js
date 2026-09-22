// ===== HIDE OS CURSOR (force) =====
(function forceHideOSCursor() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  var blank = 'url("images/blank.png") 0 0, none';

  function hide(el) {
    if (!el || !el.style) return;
    try {
      el.style.setProperty('cursor', 'none', 'important');
      el.style.cursor = blank;
    } catch (e) {}
  }

  function hideAll() {
    hide(document.documentElement);
    hide(document.body);
  }

  hideAll();

  ['mousemove', 'mousedown', 'mouseup', 'click', 'pointerdown', 'pointermove', 'pointerup'].forEach(function (evt) {
    document.addEventListener(evt, hideAll, { passive: true });
  });

  document.addEventListener('mouseover', function (e) {
    hide(e.target);
  }, { passive: true });

  window.addEventListener('pageshow', hideAll);
  window.addEventListener('focus', hideAll);
  document.addEventListener('DOMContentLoaded', hideAll);
})();

// ===== CUSTOM CURSOR =====
function initCursor() {
  const cursor = document.querySelector('.cursor');
  const follower = document.querySelector('.cursor-follower');
  if (!cursor || !follower || !window.matchMedia('(pointer: fine)').matches) return;

  let mouseX = 0;
  let mouseY = 0;
  try {
    const saved = sessionStorage.getItem('cursor_pos');
    if (saved) {
      const pos = JSON.parse(saved);
      mouseX = pos.x || 0;
      mouseY = pos.y || 0;
    }
  } catch (e) {}

  let followerX = mouseX - 20;
  let followerY = mouseY - 20;

  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
  follower.style.left = followerX + 'px';
  follower.style.top = followerY + 'px';
  cursor.style.opacity = '1';
  follower.style.opacity = '1';

  // Avoid duplicate listeners on soft nav
  if (!window.__cursorMoveBound) {
    window.__cursorMoveBound = true;
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      const c = document.querySelector('.cursor');
      if (c) {
        c.style.left = mouseX + 'px';
        c.style.top = mouseY + 'px';
      }
      try {
        sessionStorage.setItem('cursor_pos', JSON.stringify({ x: mouseX, y: mouseY }));
      } catch (err) {}
      window.__mouseX = mouseX;
      window.__mouseY = mouseY;
    });

    function animateFollower() {
      const f = document.querySelector('.cursor-follower');
      const mx = window.__mouseX != null ? window.__mouseX : mouseX;
      const my = window.__mouseY != null ? window.__mouseY : mouseY;
      followerX += (mx - 20 - followerX) * 0.15;
      followerY += (my - 20 - followerY) * 0.15;
      if (f) {
        f.style.left = followerX + 'px';
        f.style.top = followerY + 'px';
      }
      requestAnimationFrame(animateFollower);
    }
    window.__mouseX = mouseX;
    window.__mouseY = mouseY;
    animateFollower();
  }

  bindCursorHover();
}

function bindCursorHover() {
  const cursor = document.querySelector('.cursor');
  const follower = document.querySelector('.cursor-follower');
  if (!cursor || !follower) return;

  const hoverTargets = 'a, button, .btn, .skill-chip, .project-card, .contact-card, .meta-item, .form-submit, .btn-small, .logo, .project-link, .back-link';
  document.querySelectorAll(hoverTargets).forEach(el => {
    if (el.dataset.cursorBound) return;
    el.dataset.cursorBound = '1';
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hover');
      follower.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hover');
      follower.classList.remove('hover');
    });
  });
}

// ===== NAV SCROLL =====
function initNavScroll() {
  const nav = document.querySelector('.nav');
  if (!nav || nav.dataset.scrollBound) return;
  nav.dataset.scrollBound = '1';
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });
}

// ===== MOBILE MENU =====
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!menuToggle || !navLinks) return;
  if (menuToggle.dataset.bound) return;
  menuToggle.dataset.bound = '1';

  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });
}

// ===== NAV DROPDOWN (Projects) =====
function initDropdown() {
  const dropdownBtn = document.querySelector('#dropdownBtn');
  const dropdownMenu = document.querySelector('#dropdownMenu');
  if (!dropdownBtn || !dropdownMenu) return;

  function closeDropdown() {
    dropdownMenu.classList.remove('show');
    dropdownBtn.classList.remove('active');
    dropdownBtn.setAttribute('aria-expanded', 'false');
  }

  if (!dropdownBtn.dataset.bound) {
    dropdownBtn.dataset.bound = '1';

    dropdownBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      dropdownMenu.classList.toggle('show');
      dropdownBtn.classList.toggle('active');
      dropdownBtn.setAttribute('aria-expanded', dropdownMenu.classList.contains('show') ? 'true' : 'false');
    });

    // Close the dropdown after a menu item is picked
    dropdownMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeDropdown);
    });
  }

  // Bonus: close when clicking outside the dropdown (bound once globally,
  // re-queries current elements since soft-nav swaps the nav markup)
  if (!window.__dropdownOutsideBound) {
    window.__dropdownOutsideBound = true;

    document.addEventListener('click', function (e) {
      const btn = document.querySelector('#dropdownBtn');
      const menu = document.querySelector('#dropdownMenu');
      if (!btn || !menu) return;
      if (!btn.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove('show');
        btn.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      const btn = document.querySelector('#dropdownBtn');
      const menu = document.querySelector('#dropdownMenu');
      if (btn && menu) {
        menu.classList.remove('show');
        btn.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

// ===== SOFT NAVIGATION (no full reload → OS cursor stays hidden) =====
function initSoftNav() {
  document.querySelectorAll('a[href$=".html"]').forEach(link => {
    if (link.dataset.softBound) return;
    link.dataset.softBound = '1';

    link.addEventListener('click', async (e) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto:')) return;

      // Same-page hash-only etc.
      const current = window.location.pathname.split('/').pop() || 'index.html';
      if (href === current) {
        e.preventDefault();
        return;
      }

      e.preventDefault();

      // Force hide OS cursor during transition
      try {
        document.documentElement.style.setProperty('cursor', 'none', 'important');
        document.body.style.setProperty('cursor', 'none', 'important');
      } catch (err) {}

      const transition = document.querySelector('.page-transition');
      if (transition) {
        transition.classList.add('active');
        transition.style.setProperty('cursor', 'none', 'important');
      }

      try {
        const res = await fetch(href, { cache: 'no-cache' });
        if (!res.ok) throw new Error('fetch failed');
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Update title
        const newTitle = doc.querySelector('title');
        if (newTitle) document.title = newTitle.textContent;

        // Swap main content + footer (keep cursor nodes & transition & bg)
        const newMain = doc.querySelector('main');
        const newFooter = doc.querySelector('footer');
        const newNav = doc.querySelector('nav.nav');
        const curMain = document.querySelector('main');
        const curFooter = document.querySelector('footer');
        const curNav = document.querySelector('nav.nav');

        if (newNav && curNav) {
          curNav.innerHTML = newNav.innerHTML;
          // re-bind mobile toggle after innerHTML replace
          const mt = curNav.querySelector('.menu-toggle');
          if (mt) delete mt.dataset.bound;
        }
        if (newMain && curMain) curMain.innerHTML = newMain.innerHTML;
        if (newFooter && curFooter) curFooter.innerHTML = newFooter.innerHTML;

        // Copy any page-specific <style> from new head (project pages)
        document.querySelectorAll('style[data-page-style]').forEach(s => s.remove());
        doc.querySelectorAll('head style').forEach(styleEl => {
          if (styleEl.id === 'hide-os-cursor') return;
          const s = document.createElement('style');
          s.setAttribute('data-page-style', '1');
          s.textContent = styleEl.textContent;
          document.head.appendChild(s);
        });

        // Run page-specific scripts that are inline in body (e.g. transmissions)
        // Strip and re-eval simple inline scripts inside main/footer if needed
        document.querySelectorAll('script[data-page-script]').forEach(s => s.remove());

        history.pushState({ href }, '', href);

        // Re-init interactive bits
        setTimeout(() => {
          if (transition) transition.classList.remove('active');
          initMobileMenu();
          initDropdown();
          initNavScroll();
          bindCursorHover();
          initReveal();
          initTimeline();
          initProjectTilt();
          initForm();
          initTypewriter();
          initActiveNav();
          initTransmissionsPage();
          window.scrollTo(0, 0);

          // Keep OS cursor hidden
          try {
            document.documentElement.style.setProperty('cursor', 'none', 'important');
            document.body.style.setProperty('cursor', 'none', 'important');
          } catch (err) {}
        }, 450);
      } catch (err) {
        // Fallback to full navigation if fetch fails (e.g. some file:// cases)
        console.warn('Soft nav failed, falling back', err);
        setTimeout(() => { window.location.href = href; }, 400);
      }
    });
  });
}

window.addEventListener('popstate', () => {
  // Full reload on back/forward for simplicity
  window.location.reload();
});

// ===== SCROLL REVEAL =====
function initReveal() {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .reveal-scale, .timeline-item, .project-card, .contact-card, .skill-chip, .contact-form'
  ).forEach(el => {
    el.classList.remove('visible');
    revealObserver.observe(el);
  });

  document.querySelectorAll('.skill-chip').forEach((chip, i) => {
    chip.style.transitionDelay = `${i * 0.06}s`;
  });
  document.querySelectorAll('.project-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.12}s`;
  });
  document.querySelectorAll('.contact-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.1}s`;
  });
}

// ===== TIMELINE =====
function initTimeline() {
  const timelineItems = document.querySelectorAll('.timeline-item');
  if (!timelineItems.length) return;
  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const i = Array.from(timelineItems).indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('visible'), i * 120);
      }
    });
  }, { threshold: 0.2 });
  timelineItems.forEach(item => timelineObserver.observe(item));
}

// ===== 3D TILT =====
function initProjectTilt() {
  document.querySelectorAll('.project-card').forEach(card => {
    if (card.dataset.tiltBound) return;
    card.dataset.tiltBound = '1';
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 18;
      const rotateY = (centerX - x) / 18;
      card.style.transform = `translateY(-12px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ===== FORM =====
function initForm() {
  const form = document.querySelector('.contact-form form');
  if (!form || form.dataset.bound) return;
  form.dataset.bound = '1';

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');

    const name = (form.querySelector('#name') || {}).value || '';
    const email = (form.querySelector('#email') || {}).value || '';
    const subject = (form.querySelector('#subject') || {}).value || '';
    const message = (form.querySelector('#message') || {}).value || '';

    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      time: new Date().toISOString()
    };

    try {
      const key = 'joemark_transmissions';
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      list.push(entry);
      localStorage.setItem(key, JSON.stringify(list));
    } catch (err) {
      console.warn('Could not save transmission', err);
    }

    btn.textContent = 'TRANSMITTING...';
    btn.style.background = 'linear-gradient(135deg, #00ff9d, #00f0ff)';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = 'MESSAGE SENT ✓';
      btn.style.background = 'linear-gradient(135deg, #00ff9d, #00b8d4)';

      const transition = document.querySelector('.page-transition');
      setTimeout(() => {
        if (transition) transition.classList.add('active');
        setTimeout(() => {
          // Prefer soft nav to transmissions
          const a = document.createElement('a');
          a.href = 'transmissions.html';
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          a.remove();
          // fallback
          setTimeout(() => {
            if (!location.pathname.endsWith('transmissions.html')) {
              window.location.href = 'transmissions.html';
            }
          }, 600);
        }, 500);
      }, 700);
    }, 900);
  });
}

// ===== TYPEWRITER =====
function initTypewriter() {
  const typeTarget = document.querySelector('.typewriter');
  if (!typeTarget || typeTarget.dataset.typing) return;
  typeTarget.dataset.typing = '1';

  const texts = [
    'Building digital experiences',
    'Crafting clean interfaces',
    'Exploring AI frontiers',
    'Turning ideas into code'
  ];
  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function type() {
    if (!document.querySelector('.typewriter')) return;
    const current = texts[textIndex];

    if (isDeleting) {
      typeTarget.textContent = current.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typeTarget.textContent = current.substring(0, charIndex + 1);
      charIndex++;
    }

    let speed = isDeleting ? 40 : 80;

    if (!isDeleting && charIndex === current.length) {
      speed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % texts.length;
      speed = 400;
    }

    setTimeout(type, speed);
  }

  type();
}

// ===== ACTIVE NAV =====
function initActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// ===== TRANSMISSIONS PAGE =====
function initTransmissionsPage() {
  const listEl = document.getElementById('messages-list');
  if (!listEl) return;

  const STORAGE_KEY = 'joemark_transmissions';

  function loadMessages() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveMessages(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function formatTime(iso) {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function render() {
    const list = loadMessages();
    const container = document.getElementById('messages-list');
    const countEl = document.getElementById('msg-count');
    if (!container || !countEl) return;

    countEl.textContent = list.length === 1
      ? '1 transmission'
      : list.length + ' transmissions';

    if (list.length === 0) {
      container.innerHTML = `
        <div class="empty-state reveal visible">
          <div class="icon">📡</div>
          <h3>No transmissions yet</h3>
          <p>When someone sends a message from the Contact page, it will appear here.</p>
          <a href="contact.html" class="btn btn-primary" style="display:inline-flex;">Go to Contact</a>
        </div>`;
      initSoftNav();
      bindCursorHover();
      return;
    }

    const sorted = [...list].reverse();
    container.innerHTML = sorted.map((m, i) => `
      <article class="message-card visible" data-id="${m.id}" style="transition-delay: ${i * 0.08}s">
        <div class="message-meta">
          <div>
            <div class="message-from">${escapeHtml(m.name || 'Anonymous')}</div>
            <div class="message-email">${escapeHtml(m.email || '—')}</div>
          </div>
          <div class="message-time">${formatTime(m.time)}</div>
        </div>
        ${m.subject ? `<div class="message-subject">${escapeHtml(m.subject)}</div>` : ''}
        <div class="message-body">${escapeHtml(m.message || '')}</div>
      </article>
    `).join('');
  }

  const clearBtn = document.getElementById('clear-all');
  if (clearBtn && !clearBtn.dataset.bound) {
    clearBtn.dataset.bound = '1';
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear all transmissions from this browser?')) {
        saveMessages([]);
        render();
      }
    });
  }

  render();
  initSoftNav();
}

// ===== BOOT =====
function boot() {
  initCursor();
  initNavScroll();
  initMobileMenu();
  initDropdown();
  initSoftNav();
  initReveal();
  initTimeline();
  initProjectTilt();
  initForm();
  initTypewriter();
  initActiveNav();
  initTransmissionsPage();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
