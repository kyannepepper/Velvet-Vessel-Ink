/**
 * about.js — populates images and specialties on about.html
 */
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const imgs = window.PLACEHOLDER_IMAGES || {};
    const portrait = document.getElementById('about-portrait');
    const studio = document.getElementById('about-studio-img');
    const desert = document.getElementById('about-desert-img');
    if (portrait) portrait.src = imgs.portrait?.[0] || '';
    if (studio) studio.src = imgs.studio?.[1] || '';
    if (desert) desert.src = imgs.desert?.[2] || '';

    const list = document.getElementById('specialty-list');
    if (list) {
      const specialties = window.SITE_CONFIG?.SPECIALTIES || [];
      list.innerHTML = specialties
        .map((s) => `<div class="specialty-item"><h3>${s}</h3></div>`)
        .join('');
    }

    window.VVI?.initScrollReveal?.();
  });
})();
