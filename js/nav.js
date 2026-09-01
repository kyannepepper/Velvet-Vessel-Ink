/**
 * nav.js — renders the shared site header and footer into every page,
 * highlights the active nav link, and wires up mobile menu + scroll state.
 * Each page just needs: <header id="site-header"></header> and
 * <footer id="site-footer"></footer>, plus body[data-page="..."].
 */

(function () {
  const NAV_LINKS = [
    { href: 'index.html', label: 'Home', page: 'home' },
    { href: 'portfolio.html', label: 'Portfolio', page: 'portfolio' },
    { href: 'inspiration.html', label: 'Inspiration', page: 'inspiration' },
    { href: 'about.html', label: 'About', page: 'about' },
    { href: 'aftercare.html', label: 'Aftercare', page: 'aftercare' },
    { href: 'faq.html', label: 'FAQ', page: 'faq' },
    { href: 'contact.html', label: 'Contact', page: 'contact' },
  ];

  function renderHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;
    const currentPage = document.body.dataset.page || '';
    const linksHtml = NAV_LINKS.map(
      (l) => `<li><a href="${l.href}" ${l.page === currentPage ? 'aria-current="page"' : ''}>${l.label}</a></li>`
    ).join('');
    const phone = window.SITE_CONFIG?.BUSINESS?.phone || '';
    const phoneDigits = phone.replace(/[^\d+]/g, '');

    header.className = 'site-header';
    header.innerHTML = `
      <a class="brand" href="index.html">
        <span class="brand-mark">Velvet Vessel Ink</span>
        <span class="brand-sub">Tattoo Artist &middot; St. George, Utah</span>
      </a>
      <nav class="main-nav" id="main-nav" aria-label="Primary">
        <ul class="nav-links">${linksHtml}</ul>
        ${phoneDigits ? `<a class="btn btn-outline-light nav-call-btn" href="tel:${phoneDigits}">Call Now</a>` : ''}
        <a class="btn btn-accent nav-book-btn" href="booking.html">Book Now</a>
      </nav>
      <button class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="main-nav" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
    `;

    const toggle = document.getElementById('nav-toggle');
    const mainNav = document.getElementById('main-nav');
    toggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    mainNav.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        mainNav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      })
    );

    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (document.body.dataset.solidHeader === 'true') {
      header.classList.add('is-solid');
    }
  }

  function renderFooter() {
    const footer = document.getElementById('site-footer');
    if (!footer) return;
    const cfg = window.SITE_CONFIG?.BUSINESS || {};
    footer.className = 'site-footer';
    footer.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <span class="brand-mark">Velvet Vessel Ink</span>
            <p>Intentional, editorial tattoo artistry by ${cfg.artist || 'Megan Klein'} in ${cfg.city || 'St. George, Utah'}.</p>
          </div>
          <div class="footer-col">
            <div class="footer-heading">Explore</div>
            <a href="portfolio.html">Portfolio</a>
            <a href="inspiration.html">Inspiration</a>
            <a href="about.html">About Megan</a>
            <a href="booking.html">Book Now</a>
          </div>
          <div class="footer-col">
            <div class="footer-heading">Studio</div>
            <a href="aftercare.html">Aftercare</a>
            <a href="faq.html">FAQ</a>
            <a href="contact.html">Contact</a>
            <p>${cfg.addressLine || ''}</p>
          </div>
          <div class="footer-col">
            <div class="footer-heading">Connect</div>
            <a href="${cfg.instagram || '#'}" target="_blank" rel="noopener">Instagram</a>
            <a href="${cfg.tiktok || '#'}" target="_blank" rel="noopener">TikTok</a>
            <a href="mailto:${cfg.email || ''}">${cfg.email || ''}</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>&copy; ${new Date().getFullYear()} Velvet Vessel Ink. All rights reserved.</span>
          <span class="footer-social">
            <a href="${cfg.instagram || '#'}" target="_blank" rel="noopener" aria-label="Instagram">Instagram</a>
            <a href="${cfg.tiktok || '#'}" target="_blank" rel="noopener" aria-label="TikTok">TikTok</a>
            <a href="admin/index.html" aria-label="Studio login">Studio Login</a>
          </span>
        </div>
      </div>
    `;
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderHeader();
    renderFooter();
    if (window.VVI?.initScrollReveal) window.VVI.initScrollReveal();
  });
})();
