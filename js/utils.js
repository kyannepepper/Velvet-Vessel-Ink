/**
 * utils.js — small reusable helpers shared across all pages.
 */

const $ = (sel, scope = document) => scope.querySelector(sel);
const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

function debounce(fn, wait = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatCurrency(n) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

function formatPriceRange(min, max) {
  if (min == null && max == null) return 'Priced upon consultation';
  if (min != null && max != null) return `${formatCurrency(min)}–${formatCurrency(max)}`;
  return formatCurrency(min ?? max);
}

function formatDate(dateStr, opts = {}) {
  if (!dateStr) return '';
  const d = new Date(dateStr + (dateStr.length <= 10 ? 'T00:00:00' : ''));
  return d.toLocaleDateString('en-US', {
    weekday: opts.weekday ?? 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...opts,
  });
}

function toISODate(date) {
  const d = new Date(date);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d - tzOffset).toISOString().slice(0, 10);
}

function showToast(message, duration = 3200) {
  let toast = $('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('is-visible'), duration);
}

function setFormStatus(el, message, type = 'success') {
  if (!el) return;
  el.textContent = message;
  el.classList.remove('is-error', 'is-success');
  el.classList.add('is-visible', type === 'error' ? 'is-error' : 'is-success');
}

function clearFormStatus(el) {
  if (!el) return;
  el.classList.remove('is-visible', 'is-error', 'is-success');
  el.textContent = '';
}

/** Reveal-on-scroll for any element with class="reveal" */
function initScrollReveal() {
  const items = $$('.reveal');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );
  items.forEach((el) => io.observe(el));
}

/** Simple slug/id generator for client-side temp ids */
function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

window.VVI = {
  $, $$, debounce, escapeHtml, formatCurrency, formatPriceRange,
  formatDate, toISODate, showToast, setFormStatus, clearFormStatus,
  initScrollReveal, uid, getQueryParam,
};
