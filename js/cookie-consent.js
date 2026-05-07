/* ============================================================
   twRty — Cookie Consent (GDPR/ePrivacy, opt-in)
   Vanilla JS, no dependencies. Stores choice in localStorage.
   Categories: essential (always on), analytics, marketing.
   Footer link with [data-cookie-preferences] reopens modal.
============================================================ */

(function () {
  'use strict';

  var STORAGE_KEY = 'twrty_cookie_consent_v1';
  var EXPIRY_DAYS = 365;

  function loadConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.savedAt) return null;
      var ageMs = Date.now() - parsed.savedAt;
      if (ageMs > EXPIRY_DAYS * 24 * 60 * 60 * 1000) return null;
      return parsed;
    } catch (e) { return null; }
  }

  function saveConsent(prefs) {
    var payload = {
      savedAt: Date.now(),
      essential: true,
      analytics: !!prefs.analytics,
      marketing: !!prefs.marketing
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch (e) {}
    window.dispatchEvent(new CustomEvent('twrtyCookieConsent', { detail: payload }));
  }

  function buildBanner() {
    var wrap = document.createElement('div');
    wrap.className = 'cc-banner';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-live', 'polite');
    wrap.setAttribute('aria-label', 'Cookie consent');
    wrap.innerHTML =
      '<div class="cc-banner-inner">' +
        '<div class="cc-banner-text">' +
          '<strong>We value your privacy.</strong> ' +
          'We use essential cookies to make the site work. With your consent, we may also use analytics and marketing cookies to improve our services. ' +
          'See our <a href="privacy-policy.html">Privacy Policy</a>.' +
        '</div>' +
        '<div class="cc-banner-actions">' +
          '<button type="button" class="cc-btn cc-btn-ghost" data-cc-action="reject">Reject all</button>' +
          '<button type="button" class="cc-btn cc-btn-ghost" data-cc-action="customize">Customize</button>' +
          '<button type="button" class="cc-btn cc-btn-primary" data-cc-action="accept">Accept all</button>' +
        '</div>' +
      '</div>';
    return wrap;
  }

  function buildModal() {
    var modal = document.createElement('div');
    modal.className = 'cc-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'cc-modal-title');
    modal.innerHTML =
      '<div class="cc-modal-backdrop" data-cc-action="close-modal"></div>' +
      '<div class="cc-modal-card">' +
        '<button type="button" class="cc-modal-close" aria-label="Close" data-cc-action="close-modal">&times;</button>' +
        '<h3 id="cc-modal-title">Cookie preferences</h3>' +
        '<p class="cc-modal-lead">Choose which cookies you allow. You can change this anytime by clicking "Cookie preferences" in the footer.</p>' +
        '<div class="cc-cat">' +
          '<div class="cc-cat-row">' +
            '<div class="cc-cat-label"><strong>Essential cookies</strong><span class="cc-cat-required">Always on</span></div>' +
            '<label class="cc-toggle is-locked"><input type="checkbox" checked disabled aria-label="Essential cookies (required)"><span class="cc-slider"></span></label>' +
          '</div>' +
          '<p class="cc-cat-desc">Necessary for the site to function — security, navigation, and remembering your cookie choice.</p>' +
        '</div>' +
        '<div class="cc-cat">' +
          '<div class="cc-cat-row">' +
            '<div class="cc-cat-label"><strong>Analytics cookies</strong></div>' +
            '<label class="cc-toggle"><input type="checkbox" id="cc-toggle-analytics" aria-label="Analytics cookies"><span class="cc-slider"></span></label>' +
          '</div>' +
          '<p class="cc-cat-desc">Help us understand how visitors use the site through aggregated, anonymised data.</p>' +
        '</div>' +
        '<div class="cc-cat">' +
          '<div class="cc-cat-row">' +
            '<div class="cc-cat-label"><strong>Marketing cookies</strong></div>' +
            '<label class="cc-toggle"><input type="checkbox" id="cc-toggle-marketing" aria-label="Marketing cookies"><span class="cc-slider"></span></label>' +
          '</div>' +
          '<p class="cc-cat-desc">Measure marketing campaign effectiveness and, where applicable, deliver relevant advertising.</p>' +
        '</div>' +
        '<div class="cc-modal-actions">' +
          '<button type="button" class="cc-btn cc-btn-ghost" data-cc-action="reject">Reject all</button>' +
          '<button type="button" class="cc-btn cc-btn-primary" data-cc-action="save">Save preferences</button>' +
        '</div>' +
      '</div>';
    return modal;
  }

  var bannerEl = null;
  var modalEl = null;

  function showBanner() {
    if (bannerEl) return;
    bannerEl = buildBanner();
    document.body.appendChild(bannerEl);
    requestAnimationFrame(function () { bannerEl.classList.add('is-visible'); });
  }

  function hideBanner() {
    if (!bannerEl) return;
    bannerEl.classList.remove('is-visible');
    var el = bannerEl;
    bannerEl = null;
    setTimeout(function () { if (el && el.parentNode) el.parentNode.removeChild(el); }, 300);
  }

  function openModal(preset) {
    if (modalEl) return;
    modalEl = buildModal();
    document.body.appendChild(modalEl);
    document.body.classList.add('cc-no-scroll');
    var current = preset || loadConsent() || { analytics: false, marketing: false };
    var a = modalEl.querySelector('#cc-toggle-analytics');
    var m = modalEl.querySelector('#cc-toggle-marketing');
    if (a) a.checked = !!current.analytics;
    if (m) m.checked = !!current.marketing;
    requestAnimationFrame(function () { modalEl.classList.add('is-visible'); });
  }

  function closeModal() {
    if (!modalEl) return;
    modalEl.classList.remove('is-visible');
    var el = modalEl;
    modalEl = null;
    document.body.classList.remove('cc-no-scroll');
    setTimeout(function () { if (el && el.parentNode) el.parentNode.removeChild(el); }, 300);
  }

  function handleClick(e) {
    var t = e.target;
    if (!t || !t.getAttribute) return;
    var action = t.getAttribute('data-cc-action');
    var prefsLink = t.closest && t.closest('[data-cookie-preferences]');

    if (prefsLink) {
      e.preventDefault();
      openModal();
      return;
    }
    if (!action) return;

    if (action === 'accept') {
      saveConsent({ analytics: true, marketing: true });
      hideBanner(); closeModal();
    } else if (action === 'reject') {
      saveConsent({ analytics: false, marketing: false });
      hideBanner(); closeModal();
    } else if (action === 'customize') {
      openModal();
    } else if (action === 'save') {
      var a = modalEl && modalEl.querySelector('#cc-toggle-analytics');
      var m = modalEl && modalEl.querySelector('#cc-toggle-marketing');
      saveConsent({ analytics: a && a.checked, marketing: m && m.checked });
      hideBanner(); closeModal();
    } else if (action === 'close-modal') {
      closeModal();
    }
  }

  function init() {
    document.addEventListener('click', handleClick, false);
    var existing = loadConsent();
    if (!existing) showBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.twrtyCookieConsent = {
    get: loadConsent,
    open: function () { openModal(); },
    reset: function () { try { localStorage.removeItem(STORAGE_KEY); } catch (e) {} showBanner(); }
  };
})();
