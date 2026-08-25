/**
 * admin-designs.js — CRUD for inspiration/design gallery items.
 */
(function () {
  const { $, $$, escapeHtml, formatPriceRange, showToast } = window.VVI;

  let items = [];
  let pendingImage = { file: null };

  const grid = document.getElementById('designs-admin-grid');
  const overlay = document.getElementById('design-form-overlay');
  const form = document.getElementById('design-form');
  const statusEl = document.getElementById('design-form-status');

  function populateSelectOptions() {
    const catSel = $('#df-category');
    const styleSel = $('#df-style');
    if (catSel && !catSel.options.length) {
      catSel.innerHTML = (window.INSPIRATION_CATEGORIES || []).map((c) => `<option value="${c}">${c}</option>`).join('');
    }
    if (styleSel && !styleSel.options.length) {
      styleSel.innerHTML = window.SITE_CONFIG.STYLES.map((s) => `<option value="${s}">${s}</option>`).join('');
    }
  }

  function renderGrid() {
    if (!items.length) {
      grid.innerHTML = `<div class="empty-state">No designs yet. Click "+ Add Design" to create your first one.</div>`;
      return;
    }
    grid.innerHTML = items
      .map(
        (d) => `
      <div class="admin-item-card">
        <div class="admin-item-card-media"><img src="${d.image_url}" alt="${escapeHtml(d.name)}" loading="lazy"></div>
        <div class="admin-item-card-body">
          <h3>${escapeHtml(d.name)}</h3>
          <p class="admin-item-card-meta">${escapeHtml(d.category || '')} &middot; ${formatPriceRange(d.price_min, d.price_max)}</p>
          <div class="admin-item-card-actions">
            <button class="btn btn-outline-dark" data-edit="${d.id}">Edit</button>
          </div>
        </div>
      </div>`
      )
      .join('');
    $$('[data-edit]', grid).forEach((btn) => btn.addEventListener('click', () => openForm(btn.dataset.edit)));
  }

  function resetForm() {
    form.reset();
    $('#df-id').value = '';
    $('#df-image-url').value = '';
    $('#df-image-preview').innerHTML = '';
    $('#df-delete').hidden = true;
    pendingImage = { file: null };
    window.VVI.clearFormStatus(statusEl);
  }

  function openForm(id) {
    resetForm();
    populateSelectOptions();
    if (id) {
      const d = items.find((i) => String(i.id) === String(id));
      document.getElementById('design-form-title').textContent = 'Edit Design';
      $('#df-id').value = d.id;
      $('#df-name').value = d.name;
      $('#df-category').value = d.category || '';
      $('#df-style').value = d.style || '';
      $('#df-placement').value = d.suggested_placement || '';
      $('#df-size').value = d.suggested_size || 'Small';
      $('#df-price-min').value = d.price_min ?? '';
      $('#df-price-max').value = d.price_max ?? '';
      $('#df-description').value = d.description || '';
      $('#df-image-url').value = d.image_url || '';
      $('#df-image-preview').innerHTML = `<img src="${d.image_url}" alt="">`;
      $('#df-delete').hidden = false;
    } else {
      document.getElementById('design-form-title').textContent = 'Add Design';
    }
    window.AdminApp.openModal(overlay);
  }

  document.getElementById('add-design-btn')?.addEventListener('click', () => openForm(null));

  $('#df-image')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    pendingImage.file = file;
    $('#df-image-preview').innerHTML = `<img src="${URL.createObjectURL(file)}" alt="">`;
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    window.VVI.clearFormStatus(statusEl);
    const submitBtn = $('#df-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving…';

    try {
      let imageUrl = $('#df-image-url').value;
      if (pendingImage.file) {
        const uploaded = await window.VVI_DATA.uploadImage(window.SITE_CONFIG.STORAGE.designs, pendingImage.file, 'designs/');
        imageUrl = uploaded.url;
      }
      if (!imageUrl) throw new Error('Please choose an image.');

      const payload = {
        name: $('#df-name').value.trim(),
        category: $('#df-category').value,
        style: $('#df-style').value,
        suggested_placement: $('#df-placement').value.trim(),
        suggested_size: $('#df-size').value,
        price_min: Number($('#df-price-min').value),
        price_max: Number($('#df-price-max').value),
        description: $('#df-description').value.trim(),
        image_url: imageUrl,
      };

      const id = $('#df-id').value;
      if (id) {
        await window.VVI_DATA.updateInspirationDesign(id, payload);
      } else {
        await window.VVI_DATA.createInspirationDesign(payload);
      }
      showToast('Design saved.');
      window.AdminApp.closeModal(overlay);
      init();
    } catch (err) {
      window.VVI.setFormStatus(statusEl, err.message || 'Could not save this design.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Design';
    }
  });

  $('#df-delete')?.addEventListener('click', async () => {
    const id = $('#df-id').value;
    if (!id) return;
    if (!confirm('Delete this design? This cannot be undone.')) return;
    try {
      await window.VVI_DATA.deleteInspirationDesign(id);
      showToast('Design deleted.');
      window.AdminApp.closeModal(overlay);
      init();
    } catch (err) {
      window.VVI.setFormStatus(statusEl, err.message || 'Could not delete this design.', 'error');
    }
  });

  async function init() {
    grid.innerHTML = `<div class="loading-state"><div class="spinner"></div>Loading designs&hellip;</div>`;
    try {
      items = await window.VVI_DATA.fetchInspirationDesigns();
      renderGrid();
    } catch (err) {
      grid.innerHTML = `<div class="empty-state">${err.message || 'Unable to load designs.'}</div>`;
    }
  }

  window.AdminApp.registerPanel('designs', init);
})();
