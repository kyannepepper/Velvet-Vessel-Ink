/**
 * admin-portfolio.js — CRUD for completed-work portfolio items.
 */
(function () {
  const { $, $$, escapeHtml, formatCurrency, showToast } = window.VVI;

  let items = [];
  let pendingImage = { file: null, url: null, path: null };

  const grid = document.getElementById('portfolio-admin-grid');
  const overlay = document.getElementById('portfolio-form-overlay');
  const form = document.getElementById('portfolio-form');
  const statusEl = document.getElementById('portfolio-form-status');

  function populateSelectOptions() {
    const cfg = window.SITE_CONFIG;
    const styleSel = $('#pf-style');
    const placementSel = $('#pf-placement');
    if (styleSel && !styleSel.options.length) {
      styleSel.innerHTML = cfg.STYLES.map((s) => `<option value="${s}">${s}</option>`).join('');
    }
    if (placementSel && !placementSel.options.length) {
      placementSel.innerHTML = cfg.PLACEMENTS.map((p) => `<option value="${p}">${p}</option>`).join('');
    }
  }

  function renderGrid() {
    if (!items.length) {
      grid.innerHTML = `<div class="empty-state">No portfolio items yet. Click "+ Add Tattoo" to create your first one.</div>`;
      return;
    }
    grid.innerHTML = items
      .map(
        (item) => `
      <div class="admin-item-card">
        <div class="admin-item-card-media"><img src="${item.image_url}" alt="${escapeHtml(item.title)}" loading="lazy"></div>
        <div class="admin-item-card-body">
          <h3>${escapeHtml(item.title)}${item.featured ? '<span class="featured-flag">&#9733; Featured</span>' : ''}</h3>
          <p class="admin-item-card-meta">${escapeHtml(item.style)} &middot; ${escapeHtml(item.placement)} &middot; ${escapeHtml(item.size)} &middot; ${formatCurrency(item.price)}</p>
          <div class="admin-item-card-actions">
            <button class="btn btn-outline-dark" data-edit="${item.id}">Edit</button>
          </div>
        </div>
      </div>`
      )
      .join('');
    $$('[data-edit]', grid).forEach((btn) => btn.addEventListener('click', () => openForm(btn.dataset.edit)));
  }

  function resetForm() {
    form.reset();
    $('#pf-id').value = '';
    $('#pf-image-url').value = '';
    $('#pf-image-preview').innerHTML = '';
    $('#pf-delete').hidden = true;
    pendingImage = { file: null, url: null, path: null };
    window.VVI.clearFormStatus(statusEl);
  }

  function openForm(id) {
    resetForm();
    populateSelectOptions();
    if (id) {
      const item = items.find((i) => String(i.id) === String(id));
      document.getElementById('portfolio-form-title').textContent = 'Edit Tattoo';
      $('#pf-id').value = item.id;
      $('#pf-title').value = item.title;
      $('#pf-style').value = item.style;
      $('#pf-placement').value = item.placement;
      $('#pf-size').value = item.size;
      $('#pf-price').value = item.price;
      $('#pf-description').value = item.description;
      $('#pf-featured').checked = !!item.featured;
      $('#pf-image-url').value = item.image_url;
      $('#pf-image-preview').innerHTML = `<img src="${item.image_url}" alt="">`;
      $('#pf-delete').hidden = false;
    } else {
      document.getElementById('portfolio-form-title').textContent = 'Add Tattoo';
    }
    window.AdminApp.openModal(overlay);
  }

  $('#add-portfolio-btn')?.addEventListener('click', () => openForm(null));

  $('#pf-image')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    pendingImage.file = file;
    $('#pf-image-preview').innerHTML = `<img src="${URL.createObjectURL(file)}" alt="">`;
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    window.VVI.clearFormStatus(statusEl);
    const submitBtn = $('#pf-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving…';

    try {
      let imageUrl = $('#pf-image-url').value;
      if (pendingImage.file) {
        const uploaded = await window.VVI_DATA.uploadImage(window.SITE_CONFIG.STORAGE.portfolio, pendingImage.file, 'portfolio/');
        imageUrl = uploaded.url;
      }
      if (!imageUrl) throw new Error('Please choose an image.');

      const payload = {
        title: $('#pf-title').value.trim(),
        style: $('#pf-style').value,
        placement: $('#pf-placement').value,
        size: $('#pf-size').value,
        price: Number($('#pf-price').value),
        description: $('#pf-description').value.trim(),
        featured: $('#pf-featured').checked,
        image_url: imageUrl,
      };

      const id = $('#pf-id').value;
      if (id) {
        await window.VVI_DATA.updatePortfolioItem(id, payload);
      } else {
        await window.VVI_DATA.createPortfolioItem(payload);
      }
      showToast('Portfolio item saved.');
      window.AdminApp.closeModal(overlay);
      init();
    } catch (err) {
      window.VVI.setFormStatus(statusEl, err.message || 'Could not save this item.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Tattoo';
    }
  });

  $('#pf-delete')?.addEventListener('click', async () => {
    const id = $('#pf-id').value;
    if (!id) return;
    if (!confirm('Delete this portfolio item? This cannot be undone.')) return;
    try {
      await window.VVI_DATA.deletePortfolioItem(id);
      showToast('Portfolio item deleted.');
      window.AdminApp.closeModal(overlay);
      init();
    } catch (err) {
      window.VVI.setFormStatus(statusEl, err.message || 'Could not delete this item.', 'error');
    }
  });

  async function init() {
    grid.innerHTML = `<div class="loading-state"><div class="spinner"></div>Loading portfolio&hellip;</div>`;
    try {
      items = await window.VVI_DATA.fetchPortfolio();
      renderGrid();
    } catch (err) {
      grid.innerHTML = `<div class="empty-state">${err.message || 'Unable to load portfolio.'}</div>`;
    }
  }

  window.AdminApp.registerPanel('portfolio', init);
})();
