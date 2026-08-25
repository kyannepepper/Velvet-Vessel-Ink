/**
 * admin-app.js — dashboard shell controller: tab switching + shared
 * modal open/close helpers used by every admin-*.js module.
 */
(function () {
  const panels = {};

  function registerPanel(name, initFn) {
    panels[name] = initFn;
  }

  function showPanel(name) {
    document.querySelectorAll('.admin-panel').forEach((p) => p.classList.toggle('is-active', p.id === `panel-${name}`));
    document.querySelectorAll('.admin-nav-item').forEach((b) => b.classList.toggle('is-active', b.dataset.panel === name));
    if (typeof panels[name] === 'function') panels[name]();
  }

  function openModal(overlayEl) {
    overlayEl.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(overlayEl) {
    overlayEl.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function wireModalDismiss() {
    document.querySelectorAll('.overlay').forEach((overlay) => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal(overlay);
      });
      overlay.querySelectorAll('[data-close-modal]').forEach((btn) =>
        btn.addEventListener('click', () => closeModal(overlay))
      );
    });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      document.querySelectorAll('.overlay.is-open').forEach((o) => closeModal(o));
    });
  }

  window.AdminApp = { registerPanel, showPanel, openModal, closeModal };

  document.addEventListener('DOMContentLoaded', () => {
    if (!document.body.classList.contains('admin-body')) return;
    wireModalDismiss();
    document.querySelectorAll('.admin-nav-item').forEach((btn) =>
      btn.addEventListener('click', () => showPanel(btn.dataset.panel))
    );
    // Calendar panel is active by default
    setTimeout(() => showPanel('calendar'), 0);
  });
})();
