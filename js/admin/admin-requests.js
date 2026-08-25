/**
 * admin-requests.js — review, filter, and update status of tattoo requests.
 */
(function () {
  const { $, $$, escapeHtml, formatDate, formatPriceRange, showToast } = window.VVI;

  const STATUSES = ['new', 'under_review', 'approved', 'declined', 'completed'];
  const STATUS_LABELS = {
    new: 'New', under_review: 'Under Review', approved: 'Approved',
    declined: 'Declined', completed: 'Completed',
  };

  let allRequests = [];
  let activeFilter = 'all';

  const tbody = document.getElementById('requests-tbody');
  const filterBar = document.getElementById('request-status-filters');
  const overlay = document.getElementById('request-overlay');
  const content = document.getElementById('request-detail-content');
  const badge = document.getElementById('badge-requests');

  function renderFilters() {
    const counts = { all: allRequests.length };
    STATUSES.forEach((s) => (counts[s] = allRequests.filter((r) => r.status === s).length));
    const options = ['all', ...STATUSES];
    filterBar.innerHTML = options
      .map(
        (s) => `<button type="button" class="chip${s === activeFilter ? ' is-active' : ''}" data-filter="${s}">
          ${s === 'all' ? 'All' : STATUS_LABELS[s]} (${counts[s]})
        </button>`
      )
      .join('');
    $$('.chip', filterBar).forEach((chip) =>
      chip.addEventListener('click', () => {
        activeFilter = chip.dataset.filter;
        renderFilters();
        renderTable();
      })
    );
  }

  function renderTable() {
    const list = activeFilter === 'all' ? allRequests : allRequests.filter((r) => r.status === activeFilter);
    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state">No requests here yet.</div></td></tr>`;
      return;
    }
    tbody.innerHTML = list
      .map(
        (r) => `
      <tr data-id="${r.id}">
        <td>${escapeHtml(r.client_name)}<br><span style="color:var(--text-muted);font-size:var(--fs-tiny);">${escapeHtml(r.client_email)}</span></td>
        <td class="ellipsis">${escapeHtml(r.tattoo_idea)}</td>
        <td>${escapeHtml(r.style)}</td>
        <td>${formatDate(r.preferred_date)}</td>
        <td>${formatPriceRange(r.estimated_price_min, r.estimated_price_max)}</td>
        <td><span class="status-pill status-pill--${r.status === 'under_review' ? 'review' : r.status}">${STATUS_LABELS[r.status]}</span></td>
      </tr>`
      )
      .join('');
    $$('tr[data-id]', tbody).forEach((row) => row.addEventListener('click', () => openDetail(row.dataset.id)));
  }

  async function openDetail(id) {
    const r = allRequests.find((x) => String(x.id) === String(id));
    if (!r) return;

    const designs = r.request_selected_designs || [];
    const images = r.request_reference_images || [];
    // Reference images live in a private bucket — resolve short-lived signed
    // URLs for viewing rather than ever exposing a public link.
    const signedImages = await Promise.all(
      images.map(async (img) => {
        try {
          const url = await window.VVI_DATA.getSignedUrl(window.SITE_CONFIG.STORAGE.references, img.image_path, 900);
          return { ...img, signedUrl: url };
        } catch {
          return { ...img, signedUrl: null };
        }
      })
    );

    content.innerHTML = `
      <div class="request-detail-head">
        <div>
          <p class="eyebrow">${escapeHtml(r.style)} &middot; ${escapeHtml(r.placement)} &middot; ${escapeHtml(r.size)}</p>
          <h2>${escapeHtml(r.client_name)}</h2>
        </div>
        <span class="status-pill status-pill--${r.status === 'under_review' ? 'review' : r.status}">${STATUS_LABELS[r.status]}</span>
      </div>
      <dl class="request-detail-grid">
        <div><dt>Email</dt><dd>${escapeHtml(r.client_email)}</dd></div>
        <div><dt>Phone</dt><dd>${escapeHtml(r.client_phone)}</dd></div>
        <div><dt>Requested Date</dt><dd>${formatDate(r.preferred_date, { weekday: 'long' })}</dd></div>
        <div><dt>Color Preference</dt><dd>${r.color_preference === 'color' ? 'Color' : 'Black & Gray'}</dd></div>
        <div><dt>Estimated Price</dt><dd>${formatPriceRange(r.estimated_price_min, r.estimated_price_max)}</dd></div>
        <div><dt>Submitted</dt><dd>${formatDate(r.created_at)}</dd></div>
      </dl>
      <p><strong>Tattoo Idea</strong></p>
      <p style="margin-bottom:1rem;">${escapeHtml(r.tattoo_idea)}</p>
      ${r.additional_notes ? `<p><strong>Additional Thoughts</strong></p><p style="margin-bottom:1rem;">${escapeHtml(r.additional_notes)}</p>` : ''}
      ${designs.length ? `
        <p><strong>Selected Inspiration Designs</strong></p>
        <div class="request-designs-list">${designs.map((d) => `<span>${escapeHtml(d.inspiration_designs?.name || 'Design (removed)')}</span>`).join('')}</div>
      ` : ''}
      ${signedImages.length ? `
        <p><strong>Reference Images</strong></p>
        <div class="request-images">${signedImages.map((img) => img.signedUrl ? `<img src="${img.signedUrl}" alt="Reference image" onclick="window.open('${img.signedUrl}', '_blank')">` : '').join('')}</div>
      ` : ''}
      <hr class="hr">
      <p><strong>Update Status</strong></p>
      <div class="status-actions" id="status-action-buttons"></div>
      <div class="field" style="margin-top:1rem;">
        <label for="admin-notes">Admin Notes <span class="hint">(private)</span></label>
        <textarea id="admin-notes">${escapeHtml(r.admin_notes || '')}</textarea>
      </div>
      <button class="btn btn-outline-dark" id="save-notes-btn" type="button">Save Notes</button>
    `;

    const statusButtons = content.querySelector('#status-action-buttons');
    statusButtons.innerHTML = STATUSES.map(
      (s) => `<button class="btn btn-sm ${s === r.status ? 'btn-primary' : 'btn-outline-dark'}" data-status="${s}">${STATUS_LABELS[s]}</button>`
    ).join('');
    statusButtons.querySelectorAll('[data-status]').forEach((btn) =>
      btn.addEventListener('click', async () => {
        try {
          await window.VVI_DATA.updateRequestStatus(r.id, btn.dataset.status);
          showToast(`Marked ${STATUS_LABELS[btn.dataset.status]}.`);
          window.AdminApp.closeModal(overlay);
          init();
        } catch (err) {
          showToast(err.message || 'Could not update status.');
        }
      })
    );

    content.querySelector('#save-notes-btn').addEventListener('click', async () => {
      try {
        await window.VVI_DATA.updateRequestStatus(r.id, r.status, content.querySelector('#admin-notes').value);
        showToast('Notes saved.');
      } catch (err) {
        showToast(err.message || 'Could not save notes.');
      }
    });

    window.AdminApp.openModal(overlay);
  }

  async function init() {
    tbody.innerHTML = `<tr><td colspan="6"><div class="loading-state"><div class="spinner"></div>Loading requests&hellip;</div></td></tr>`;
    try {
      allRequests = await window.VVI_DATA.fetchAllRequests();
      const newCount = allRequests.filter((r) => r.status === 'new').length;
      badge.hidden = newCount === 0;
      badge.textContent = newCount;
      renderFilters();
      renderTable();
    } catch (err) {
      console.error(err);
      tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state">${err.message || 'Unable to load requests.'}</div></td></tr>`;
    }
  }

  window.AdminApp.registerPanel('requests', init);
})();
