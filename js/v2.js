/* ============================================================
   twRty v2 — shared JS
   Powers reveal animations, counters, mobile drawer,
   bento glow, sticky-process, and Medium blog feed.
============================================================ */

(function () {
  'use strict';

  // Mark <html> as JS-enabled. CSS uses this to switch reveal elements
  // from "visible by default" (no-JS fallback) to "hide-then-animate-in".
  // Done synchronously at script start so it runs before paint.
  document.documentElement.classList.add('js');

  // Register service worker (caches static assets for instant repeat loads).
  // Non-blocking and fails silently in unsupported browsers.
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }

  // -------- Animated mesh background (canvas) --------
  // Renders 4 colored radial gradients on a single canvas element with smooth
  // sin/cos animation. Single render layer = no iOS Safari layer-reuse bug.
  // Same visual on desktop and mobile. 30fps target = subtle, smooth, low battery.
  (function meshBackground() {
    const canvas = document.querySelector('.page-bg-canvas');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);  // cap at 2x for perf

    let width = 0, height = 0;

    // Mesh blobs — positioned partially OFF-SCREEN at edges so colors glow inward
    // (matches the original CSS mesh which used negative top/left/right offsets).
    // Higher alpha + multi-stop gradient = concentrated blur-like falloff,
    // not uniform fade. Result: colored corners, dark center.
    const blobs = [
      // Orange — top-left corner, partially off-screen (mesh-1 equivalent)
      { baseX: -0.05, baseY: -0.05, radiusFactor: 0.70, color: '#e35929', alpha: 0.40, sx: 0.00016, sy: 0.00012, ax: 0.04, ay: 0.04, ph: 0 },
      // Purple — top-right corner, partially off-screen (mesh-2 equivalent)
      { baseX: 1.05, baseY: 0.25, radiusFactor: 0.50, color: '#5b2eff', alpha: 0.30, sx: 0.00013, sy: 0.00016, ax: 0.04, ay: 0.05, ph: Math.PI * 0.5 },
      // Blue — bottom-center, partially off-screen below (mesh-3 equivalent)
      { baseX: 0.55, baseY: 1.05, radiusFactor: 0.45, color: '#1a8cff', alpha: 0.24, sx: 0.00011, sy: 0.00014, ax: 0.05, ay: 0.04, ph: Math.PI },
      // Pink — middle-left edge, partially off-screen (mesh-4 equivalent)
      { baseX: -0.05, baseY: 0.65, radiusFactor: 0.35, color: '#ff5e9e', alpha: 0.17, sx: 0.00014, sy: 0.00012, ax: 0.04, ay: 0.05, ph: Math.PI * 1.5 },
    ];

    const alphaToHex = (a) => Math.round(Math.min(1, Math.max(0, a)) * 255).toString(16).padStart(2, '0');

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawFrame(now) {
      ctx.clearRect(0, 0, width, height);
      const viewportSize = Math.max(width, height);
      for (const b of blobs) {
        const x = (b.baseX + Math.sin(now * b.sx + b.ph) * b.ax) * width;
        const y = (b.baseY + Math.cos(now * b.sy + b.ph) * b.ay) * height;
        const r = viewportSize * b.radiusFactor;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        // Soft gradient falloff — mimics CSS filter: blur(110px) on a solid circle.
        // Slight peak softening (90% of alpha at center) avoids harsh hot-spot,
        // gives the dim atmospheric look of the original CSS mesh.
        g.addColorStop(0, b.color + alphaToHex(b.alpha * 0.90));
        g.addColorStop(0.4, b.color + alphaToHex(b.alpha * 0.55));
        g.addColorStop(0.75, b.color + alphaToHex(b.alpha * 0.15));
        g.addColorStop(1, b.color + '00');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      }
    }

    // Animation loop throttled to 30fps (smooth enough for slow mesh, half the work of 60fps)
    const interval = 1000 / 30;
    let lastFrame = 0;
    let running = true;

    function loop(now) {
      if (!running) return;
      if (now - lastFrame >= interval) {
        lastFrame = now;
        drawFrame(now);
      }
      requestAnimationFrame(loop);
    }

    // Pause when tab not visible (saves battery + GPU)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { running = false; }
      else { running = true; lastFrame = 0; requestAnimationFrame(loop); }
    });

    resize();
    window.addEventListener('resize', resize, { passive: true });

    // If user prefers reduced motion, draw once and stop animating
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      drawFrame(0);
    } else {
      requestAnimationFrame(loop);
    }
  })();

  // -------- Reveal-on-scroll --------
  // CRITICAL: Above-the-fold elements get .in IMMEDIATELY (no observer wait).
  // Below-fold uses IntersectionObserver. Prevents "blank page" on slow mobile JS.
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const viewportHeight = window.innerHeight;
    const aboveFoldMargin = viewportHeight * 1.2; // include just-below-fold for safety
    const observableEls = [];

    revealEls.forEach((el) => {
      const rect = el.getBoundingClientRect();
      // Element top is within (or just above) the visible viewport → reveal immediately
      if (rect.top < aboveFoldMargin) {
        el.classList.add('in');
      } else {
        observableEls.push(el);
      }
    });

    if (observableEls.length) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      observableEls.forEach((el) => io.observe(el));
    }
  }

  // -------- Animated counters --------
  const numEls = document.querySelectorAll('[data-count]');
  if (numEls.length) {
    const animateNum = (el) => {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      let current = 0; const step = Math.max(1, Math.ceil(target / 50));
      const tick = () => {
        current += step;
        if (current >= target) { el.textContent = target + suffix; }
        else { el.textContent = current + suffix; requestAnimationFrame(tick); }
      };
      tick();
    };
    const numIo = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { animateNum(e.target); numIo.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    numEls.forEach((el) => numIo.observe(el));
  }

  // -------- Bento mouse-follow glow --------
  document.querySelectorAll('.bento-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // -------- Sticky-scroll process --------
  const steps = document.querySelectorAll('.sp-step');
  const display = document.getElementById('stepDisplay');
  if (steps.length) {
    const stepIo = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && e.intersectionRatio > 0.6) {
          steps.forEach(s => s.classList.remove('is-active'));
          e.target.classList.add('is-active');
          if (display) display.textContent = e.target.dataset.step;
        }
      });
    }, { threshold: [0.6, 0.8] });
    steps.forEach(s => stepIo.observe(s));
  }

  // -------- Mobile drawer --------
  const mobileNav = document.getElementById('mobileNav');
  const menuToggle = document.getElementById('menuToggle');
  const mobileClose = document.getElementById('mobileClose');
  if (mobileNav && menuToggle) {
    const closeMenu = () => { mobileNav.classList.remove('open'); document.body.classList.remove('menu-open'); };
    const openMenu = () => { mobileNav.classList.add('open'); document.body.classList.add('menu-open'); };
    menuToggle.addEventListener('click', openMenu);
    if (mobileClose) mobileClose.addEventListener('click', closeMenu);
    mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  }

  // -------- Medium blog fetch --------
  const blogScroller = document.getElementById('blogScroller');
  if (blogScroller) {
    const cardWidth = 316;
    const mediumUsername = 'twrty.connect';
    const feedUrl = 'https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@' + mediumUsername;

    const shuffleArray = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };
    const extractImage = (html) => {
      const m = html && html.match(/<img[^>]+src="([^">]+)"/);
      return m ? m[1] : null;
    };
    const escapeHtml = (s) => (s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

    fetch(feedUrl)
      .then(r => r.json())
      .then(data => {
        if (!data || !data.items || !data.items.length) {
          blogScroller.innerHTML = '<p style="color:var(--text-faint); padding: 30px;">No posts yet. Visit our <a href="https://medium.com/@twrty.connect" target="_blank" rel="noopener" style="color:var(--accent)">Medium</a>.</p>';
          return;
        }
        shuffleArray(data.items).slice(0, 12).forEach(item => {
          const image = extractImage(item.description) || extractImage(item.content);
          const text = (item.description || '').replace(/<[^>]*>/g, '').slice(0, 110).trim() + '…';
          const card = document.createElement('article');
          card.className = 'blog-card reveal in';
          card.innerHTML = `
            <div class="blog-thumb">
              ${image ? '<img src="' + image + '" alt="" loading="lazy">' : ''}
            </div>
            <div class="blog-body">
              <h4>${escapeHtml(item.title)}</h4>
              <p>${escapeHtml(text)}</p>
              <a href="${item.link}" target="_blank" rel="noopener" class="read">Read article →</a>
            </div>
          `;
          blogScroller.appendChild(card);
        });
      })
      .catch(() => {
        blogScroller.innerHTML = '<p style="color:var(--text-faint); padding: 30px;">Blog posts unavailable right now. Visit our <a href="https://medium.com/@twrty.connect" target="_blank" rel="noopener" style="color:var(--accent)">Medium</a>.</p>';
      });

    const prevBtn = document.getElementById('blogPrev');
    const nextBtn = document.getElementById('blogNext');
    if (prevBtn) prevBtn.addEventListener('click', () => blogScroller.scrollBy({ left: -cardWidth, behavior: 'smooth' }));
    if (nextBtn) nextBtn.addEventListener('click', () => blogScroller.scrollBy({ left: cardWidth, behavior: 'smooth' }));
  }
})();
