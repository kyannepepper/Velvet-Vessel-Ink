/**
 * home.js — populates the homepage's dynamic sections.
 */
(function () {
  const { $, $$, formatPriceRange, escapeHtml, initScrollReveal } = window.VVI;

  function setHeroImages() {
    const hero = document.querySelector('[data-hero-image]');
    const portrait = document.querySelector('[data-portrait-image]');
    const cta = document.querySelector('[data-cta-image]');
    const imgs = window.PLACEHOLDER_IMAGES || {};
    if (hero) hero.src = imgs.hero?.[0] || '';
    if (portrait) portrait.src = imgs.portrait?.[2] || '';
    if (cta) cta.src = imgs.hero?.[2] || imgs.portfolio?.[2] || '';
  }

  // Real Instagram posts featured on the homepage, rendered with
  // Instagram's own official embed widget (embed.js) — this pulls the
  // live photo, caption, and like count directly from Instagram, so there
  // is no local image file to keep in sync.
  const FEATURED_INSTAGRAM_POSTS = [
    'https://www.instagram.com/p/DcSCCSylvpH/',
    'https://www.instagram.com/p/DcAheLTO5mm/',
    'https://www.instagram.com/p/DcaQeKuuaLe/',
  ];

  function loadInstagramEmbedScript() {
    if (window.instgrm) {
      window.instgrm.Embeds.process();
      return;
    }
    if (document.getElementById('ig-embed-script')) return;
    const script = document.createElement('script');
    script.id = 'ig-embed-script';
    script.async = true;
    script.src = 'https://www.instagram.com/embed.js';
    document.body.appendChild(script);
  }

  function setSocialLinks() {
    const cfg = window.SITE_CONFIG?.BUSINESS || {};
    document.querySelectorAll('[data-instagram-link]').forEach((a) => (a.href = cfg.instagram || '#'));
    document.querySelectorAll('[data-tiktok-link]').forEach((a) => (a.href = cfg.tiktok || '#'));
    const grid = $('#social-grid');
    if (grid) {
      grid.innerHTML = FEATURED_INSTAGRAM_POSTS
        .map(
          (url) => `
        <blockquote
          class="instagram-media"
          data-instgrm-permalink="${url}"
          data-instgrm-version="14"
          style="margin: 0 auto;"
        ></blockquote>`
        )
        .join('');
      loadInstagramEmbedScript();
    }
  }

  async function renderFeaturedWork() {
    const grid = $('#featured-grid');
    if (!grid) return;
    try {
      const items = await window.VVI_DATA.fetchPortfolio();
      const featured = items.filter((i) => i.featured).slice(0, 6);
      const list = (featured.length ? featured : items).slice(0, 6);
      if (!list.length) {
        grid.innerHTML = `<div class="empty-state">Portfolio coming soon.</div>`;
        return;
      }
      grid.innerHTML = list
        .map(
          (item) => `
        <a class="feature-card reveal" href="portfolio.html?item=${encodeURIComponent(item.id)}" aria-label="View ${escapeHtml(item.title)}">
          <img src="${item.image_url}" alt="${escapeHtml(item.title)} — ${escapeHtml(item.style)} tattoo" loading="lazy">
          <span class="feature-card-caption">
            <span class="tag">${escapeHtml(item.style)}</span>
            <h3>${escapeHtml(item.title)}</h3>
          </span>
        </a>`
        )
        .join('');
      initScrollReveal();
    } catch (err) {
      console.error(err);
      grid.innerHTML = `<div class="empty-state">Unable to load portfolio right now.</div>`;
    }
  }

  async function renderInspirationPreview() {
    const grid = $('#inspiration-preview-grid');
    if (!grid) return;
    try {
      const items = await window.VVI_DATA.fetchInspirationDesigns();
      const list = items.slice(0, 4);
      grid.innerHTML = list
        .map(
          (d) => `
        <a class="insp-card reveal" href="inspiration.html?design=${encodeURIComponent(d.id)}">
          <img src="${d.image_url}" alt="${escapeHtml(d.name)} tattoo design idea" loading="lazy">
          <span class="insp-card-label">
            <span class="eyebrow">${escapeHtml(d.category || d.style || '')}</span>
            <h4>${escapeHtml(d.name)}</h4>
          </span>
        </a>`
        )
        .join('');
      initScrollReveal();
    } catch (err) {
      console.error(err);
      grid.innerHTML = `<div class="empty-state">Unable to load designs right now.</div>`;
    }
  }

  function renderPricing() {
    const grid = $('#pricing-grid');
    if (!grid) return;
    const tiers = window.PricingCalculator.getTiers();
    const order = ['small', 'medium', 'large'];
    const examples = window.PLACEHOLDER_IMAGES?.sizeExamples || {};
    grid.innerHTML = order
      .map((key) => {
        const t = tiers[key];
        if (!t) return '';
        return `
        <div class="price-card reveal">
          <div class="price-card-image">
            <img src="${examples[key] || ''}" alt="Example of a ${escapeHtml(t.label).toLowerCase()} tattoo" loading="lazy">
          </div>
          <div class="price-card-body">
            <p class="eyebrow">${escapeHtml(t.label)}</p>
            <p class="price-range">${formatPriceRange(t.min, t.max)}</p>
            <p class="desc">${escapeHtml(t.desc)}</p>
          </div>
        </div>`;
      })
      .join('');
    initScrollReveal();
  }

  document.addEventListener('DOMContentLoaded', () => {
    setHeroImages();
    setSocialLinks();
    renderFeaturedWork();
    renderInspirationPreview();
    renderPricing();
    initScrollReveal();
  });
})();
