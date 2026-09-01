/**
 * inspiration.js — filtering, multi-select "My Ideas" cart, and detail
 * view logic for inspiration.html
 */
(function () {
  const { $, $$, debounce, escapeHtml, formatPriceRange, getQueryParam } = window.VVI;

  let allDesigns = [];
  let filtered = [];
  let activeCategory = 'All';

  const grid = $('#inspiration-grid');
  const resultsCount = $('#insp-results-count');
  const searchInput = $('#insp-search');
  const chipContainer = $('#category-chips');
  const overlay = $('#insp-overlay');
  const modalClose = $('#insp-modal-close');
  const ideasBar = $('#ideas-bar');
  const ideasCount = $('#ideas-count');
  const ideasPlural = $('#ideas-plural');

  function renderChips() {
    const categories = ['All', ...(window.INSPIRATION_CATEGORIES || [])];
    chipContainer.innerHTML = categories
      .map((c) => `<button type="button" class="chip${c === activeCategory ? ' is-active' : ''}" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`)
      .join('');
    $$('.chip', chipContainer).forEach((chip) =>
      chip.addEventListener('click', () => {
        activeCategory = chip.dataset.cat;
        renderChips();
        applyFilters();
      })
    );
  }

  function applyFilters() {
    const q = searchInput.value.trim().toLowerCase();
    filtered = allDesigns.filter((d) => {
      if (activeCategory !== 'All' && d.category !== activeCategory) return false;
      if (q && !(`${d.name} ${d.description} ${d.style}`.toLowerCase().includes(q))) return false;
      return true;
    });
    renderGrid();
  }

  function renderGrid() {
    resultsCount.textContent = `${filtered.length} design${filtered.length === 1 ? '' : 's'}`;
    if (!filtered.length) {
      grid.innerHTML = `<div class="empty-state">No designs match yet &mdash; try another category or search term.</div>`;
      return;
    }
    grid.innerHTML = filtered
      .map((d) => {
        const saved = window.IdeasCart.isSaved(d.id);
        return `
      <div class="design-card reveal is-visible" data-id="${escapeHtml(String(d.id))}">
        <div class="design-card-media" data-open-detail>
          <img src="${d.image_url}" alt="${escapeHtml(d.name)} — ${escapeHtml(d.style)} tattoo design idea" loading="lazy">
          <button class="design-card-save" type="button" aria-pressed="${saved}" aria-label="Save ${escapeHtml(d.name)} to My Ideas" data-save-toggle>${saved ? '&#10003;' : '&#43;'}</button>
        </div>
        <div class="design-card-body">
          <span class="design-card-cat">${escapeHtml(d.category || d.style)}</span>
          <h3 class="design-card-name" data-open-detail>${escapeHtml(d.name)}</h3>
          <span class="design-card-meta">${escapeHtml(d.suggested_placement)} &middot; ${escapeHtml(d.suggested_size)}</span>
          <span class="design-card-price">${formatPriceRange(d.price_min, d.price_max)}</span>
          <div class="design-card-actions">
            <button class="btn btn-outline-dark" data-save-toggle>${saved ? 'Saved' : 'Save to My Ideas'}</button>
            <button class="btn btn-primary" data-use-design>Select Inspiration</button>
          </div>
        </div>
      </div>`;
      })
      .join('');

    $$('.design-card', grid).forEach((card) => {
      const id = card.dataset.id;
      card.querySelectorAll('[data-open-detail]').forEach((el) => el.addEventListener('click', () => openDetail(id)));
      card.querySelectorAll('[data-save-toggle]').forEach((el) =>
        el.addEventListener('click', () => {
          const design = allDesigns.find((d) => String(d.id) === id);
          window.IdeasCart.toggle(design);
          renderGrid();
        })
      );
      const useBtn = card.querySelector('[data-use-design]');
      if (useBtn) useBtn.addEventListener('click', () => useDesign(id));
    });
  }

  function useDesign(id) {
    const design = allDesigns.find((d) => String(d.id) === String(id));
    if (!design) return;
    window.IdeasCart.clear();
    window.IdeasCart.add(design);
    window.location.href = 'booking.html?source=ideas';
  }

  function openDetail(id) {
    const d = allDesigns.find((x) => String(x.id) === String(id));
    if (!d) return;
    $('#insp-detail-image').src = d.image_url;
    $('#insp-detail-image').alt = `${d.name} tattoo design idea`;
    $('#insp-detail-category').textContent = d.category || d.style;
    $('#insp-detail-title').textContent = d.name;
    $('#insp-detail-description').textContent = d.description;
    $('#insp-detail-meta').innerHTML = `
      <li><strong>Style:</strong> ${escapeHtml(d.style)}</li>
      <li><strong>Suggested Placement:</strong> ${escapeHtml(d.suggested_placement)}</li>
      <li><strong>Suggested Size:</strong> ${escapeHtml(d.suggested_size)}</li>
      <li><strong>Estimated Price:</strong> ${formatPriceRange(d.price_min, d.price_max)}</li>
    `;
    const saveBtn = $('#insp-detail-save');
    const syncSaveBtn = () => {
      const saved = window.IdeasCart.isSaved(d.id);
      saveBtn.textContent = saved ? 'Saved to My Ideas' : 'Save to My Ideas';
      saveBtn.classList.toggle('is-active', saved);
    };
    syncSaveBtn();
    saveBtn.onclick = () => {
      window.IdeasCart.toggle(d);
      syncSaveBtn();
      renderGrid();
    };
    $('#insp-detail-use').onclick = () => useDesign(d.id);

    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    history.replaceState(null, '', `?design=${encodeURIComponent(d.id)}`);
  }

  function closeDetail() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    history.replaceState(null, '', window.location.pathname);
  }

  modalClose.addEventListener('click', closeDetail);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeDetail(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeDetail(); });

  function updateIdeasBar() {
    const count = window.IdeasCart.count();
    ideasCount.textContent = count;
    ideasPlural.textContent = count === 1 ? '' : 's';
    ideasBar.classList.toggle('is-visible', count > 0);
  }

  $('#ideas-clear').addEventListener('click', () => {
    window.IdeasCart.clear();
  });

  document.addEventListener('ideas-cart:change', updateIdeasBar);
  searchInput.addEventListener('input', debounce(applyFilters, 200));

  async function init() {
    try {
      allDesigns = await window.VVI_DATA.fetchInspirationDesigns();
      renderChips();
      applyFilters();
      updateIdeasBar();

      const deepLinkId = getQueryParam('design');
      if (deepLinkId) openDetail(deepLinkId);
    } catch (err) {
      console.error(err);
      grid.innerHTML = `<div class="empty-state">Unable to load the design gallery right now. Please try again shortly.</div>`;
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
