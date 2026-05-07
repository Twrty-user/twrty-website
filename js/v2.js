/* ============================================================
   twRty v2 — shared JS
   Powers reveal animations, counters, mobile drawer,
   bento glow, sticky-process, and Medium blog feed.
============================================================ */

(function () {
  'use strict';

  // -------- Reveal-on-scroll --------
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el) => io.observe(el));
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
