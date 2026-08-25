/**
 * portfolio.js — search, filter, and detail-view logic for portfolio.html
 */
(function () {
  const { $, $$, debounce, escapeHtml, formatCurrency, getQueryParam } = window.VVI;

  let allItems = [];
  let filtered = [];

  const grid = $('#portfolio-grid');
  const resultsCount = $('#results-count');
  const searchInput = $('#portfolio-search');
  const styleSelect = $('#filter-style');
  const placementSelect = $('#filter-placement');
  const sizeSelect = $('#filter-size');
  const priceSelect = $('#filter-price');
  const clearBtn = $('#clear-filters');

  const overlay = $('#portfolio-overlay');
  const modalClose = $('#portfolio-modal-close');

  function uniqueSorted(values) {
    return Array.from(new Set(values.filter(Boolean))).sort();
  }

  function populateFilterOptions() {
    const styles = uniqueSorted(allItems.map((i) => i.style));
    const placements = uniqueSorted(allItems.map((i) => i.placement));
    styleSelect.innerHTML =
      '<option value="">All Styles</option>' + styles.map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
    placementSelect.innerHTML =
      '<option value="">All Placements</option>' + placements.map((p) => `<option value="${escapeHtml(p)}">${escapeHtml(p)}</option>`).join('');
  }

  function applyFilters() {
    const q = searchInput.value.trim().toLowerCase();
    const style = styleSelect.value;
    const placement = placementSelect.value;
    const size = sizeSelect.value;
    const priceRange = priceSelect.value;

    filtered = allItems.filter((item) => {
      if (q && !(`${item.title} ${item.description}`.toLowerCase().includes(q))) return false;
      if (style && item.style !== style) return false;
      if (placement && item.placement !== placement) return false;
      if (size && item.size !== size) return false;
      if (priceRange) {
        const [min, max] = priceRange.split('-').map(Number);
        if (item.price < min || item.price > max) return false;
      }
      return true;
    });

    renderGrid();
  }

  function renderGrid() {
    resultsCount.textContent = `${filtered.length} piece${filtered.length === 1 ? '' : 's'}`;
    if (!filtered.length) {
      grid.innerHTML = `<div class="empty-state">No pieces match those filters yet &mdash; try widening your search.</div>`;
      return;
    }
    grid.innerHTML = filtered
      .map(
        (item) => `
      <button class="portfolio-card reveal is-visible" type="button" data-id="${escapeHtml(String(item.id))}" aria-label="View ${escapeHtml(item.title)} detail">
        <span class="portfolio-card-media">
          <img src="${item.image_url}" alt="${escapeHtml(item.title)} — ${escapeHtml(item.style)} tattoo on ${escapeHtml(item.placement)}" loading="lazy">
          <span class="portfolio-card-price">${formatCurrency(item.price)}</span>
        </span>
        <span class="portfolio-card-title">${escapeHtml(item.title)}</span>
        <span class="portfolio-card-meta">${escapeHtml(item.style)} &middot; ${escapeHtml(item.placement)} &middot; ${escapeHtml(item.size)}</span>
      </button>`
      )
      .join('');

    $$('.portfolio-card', grid).forEach((card) =>
      card.addEventListener('click', () => openDetail(card.dataset.id))
    );
  }

  function openDetail(id) {
    const item = allItems.find((i) => String(i.id) === String(id));
    if (!item) return;
    $('#detail-image').src = item.image_url;
    $('#detail-image').alt = `${item.title} — ${item.style} tattoo`;
    $('#detail-style').textContent = item.style;
    $('#detail-title').textContent = item.title;
    $('#detail-description').textContent = item.description;
    $('#detail-meta').innerHTML = `
      <li><strong>Placement:</strong> ${escapeHtml(item.placement)}</li>
      <li><strong>Size:</strong> ${escapeHtml(item.size)}</li>
      <li><strong>Price:</strong> ${formatCurrency(item.price)}</li>
    `;
    $('#detail-use-inspiration').onclick = () => {
      window.IdeasCart.setSourcePortfolioItem(item);
      window.location.href = `booking.html?source=portfolio&id=${encodeURIComponent(item.id)}`;
    };
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    history.replaceState(null, '', `?item=${encodeURIComponent(item.id)}`);
  }

  function closeDetail() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    history.replaceState(null, '', window.location.pathname);
  }

  modalClose.addEventListener('click', closeDetail);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeDetail();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeDetail();
  });

  [searchInput].forEach((el) => el.addEventListener('input', debounce(applyFilters, 200)));
  [styleSelect, placementSelect, sizeSelect, priceSelect].forEach((el) => el.addEventListener('change', applyFilters));
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    styleSelect.value = '';
    placementSelect.value = '';
    sizeSelect.value = '';
    priceSelect.value = '';
    applyFilters();
  });

  async function init() {
    try {
      allItems = await window.VVI_DATA.fetchPortfolio();
      populateFilterOptions();
      applyFilters();

      const deepLinkId = getQueryParam('item');
      if (deepLinkId) openDetail(deepLinkId);
    } catch (err) {
      console.error(err);
      grid.innerHTML = `<div class="empty-state">Unable to load the portfolio right now. Please try again shortly.</div>`;
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
