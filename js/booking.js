/**
 * booking.js — availability calendar, request form, live pricing,
 * reference image uploads, and submission for booking.html
 */
(function () {
  const { $, $$, escapeHtml, formatPriceRange, setFormStatus, clearFormStatus, toISODate } = window.VVI;

  const state = {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    availabilityMap: new Map(),
    requestedMap: new Map(),
    selectedDate: null,
    size: 'small',
    color: 'black_gray',
    files: [],
  };

  const calendarEl = $('#booking-calendar');
  const dateDisplay = $('#selected-date-display');
  const preferredDateInput = $('#preferred-date');
  const statusEl = $('#booking-status');

  // ---------------------------------------------------------------
  // Selects: style / placement
  // ---------------------------------------------------------------
  function populateSelects() {
    const styleSelect = $('#f-style');
    const placementSelect = $('#f-placement');
    const cfg = window.SITE_CONFIG;
    styleSelect.innerHTML = '<option value="">Select a style&hellip;</option>' +
      cfg.STYLES.map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
    placementSelect.innerHTML = '<option value="">Select placement&hellip;</option>' +
      cfg.PLACEMENTS.map((p) => `<option value="${escapeHtml(p)}">${escapeHtml(p)}</option>`).join('');
  }

  function populateSizeChips() {
    const container = $('#size-chips');
    const tiers = window.PricingCalculator.getTiers();
    const order = ['small', 'medium', 'large'];
    container.innerHTML = order
      .map(
        (key) => `<button type="button" class="chip${key === state.size ? ' is-active' : ''}" data-size="${key}">
          ${escapeHtml(tiers[key].label)} <span class="hint">(${escapeHtml(tiers[key].desc)})</span>
        </button>`
      )
      .join('');
    $$('.chip', container).forEach((chip) =>
      chip.addEventListener('click', () => {
        state.size = chip.dataset.size;
        $$('.chip', container).forEach((c) => c.classList.toggle('is-active', c === chip));
        updateSummary();
      })
    );
  }

  function wireColorChips() {
    const container = $('#color-chips');
    $$('.chip', container).forEach((chip) =>
      chip.addEventListener('click', () => {
        state.color = chip.dataset.color;
        $$('.chip', container).forEach((c) => c.classList.toggle('is-active', c === chip));
        updateSummary();
      })
    );
  }

  // ---------------------------------------------------------------
  // Selected inspiration (from IdeasCart + optional portfolio source)
  // ---------------------------------------------------------------
  function renderSelectedInspiration() {
    const block = $('#inspiration-block');
    const list = $('#selected-designs-list');
    const ideas = window.IdeasCart.getAll();
    const source = window.IdeasCart.getSourcePortfolioItem();

    const items = [];
    if (source) items.push({ kind: 'portfolio', ...source });
    ideas.forEach((d) => items.push({ kind: 'design', ...d }));

    if (!items.length) {
      block.hidden = true;
      return;
    }
    block.hidden = false;
    list.innerHTML = items
      .map((item, idx) => {
        const label = item.kind === 'portfolio' ? item.title : item.name;
        const sub = item.kind === 'portfolio' ? 'Portfolio Piece' : (item.style || 'Design');
        return `
        <span class="selected-chip" data-kind="${item.kind}" data-id="${escapeHtml(String(item.id))}">
          <img src="${item.image_url}" alt="">
          <span class="selected-chip-text"><strong>${escapeHtml(label)}</strong><span>${escapeHtml(sub)}</span></span>
          <button type="button" class="selected-chip-remove" aria-label="Remove ${escapeHtml(label)}">&times;</button>
        </span>`;
      })
      .join('');

    $$('.selected-chip', list).forEach((chip) => {
      chip.querySelector('.selected-chip-remove').addEventListener('click', () => {
        if (chip.dataset.kind === 'portfolio') {
          window.IdeasCart.clearSourcePortfolioItem();
        } else {
          window.IdeasCart.remove(chip.dataset.id);
        }
        renderSelectedInspiration();
        updateSummary();
      });
    });

    // Convenience prefill: suggest a style if none chosen yet
    const styleSelect = $('#f-style');
    if (!styleSelect.value) {
      const suggestion = source?.style || ideas[0]?.style;
      if (suggestion && [...styleSelect.options].some((o) => o.value === suggestion)) {
        styleSelect.value = suggestion;
      }
    }
    updateSummary();
  }

  // ---------------------------------------------------------------
  // Calendar
  // ---------------------------------------------------------------
  async function loadCalendarData() {
    const y = state.year, m = state.month;
    const startISO = window.CalendarWidget.toISO(y, m, 1);
    const endISO = window.CalendarWidget.toISO(y, m, new Date(y, m + 1, 0).getDate());

    if (!window.VVI_DATA.isConfigured()) {
      state.availabilityMap = window.CalendarWidget.demoAvailability(y, m);
      state.requestedMap = new Map();
      return;
    }
    try {
      const [availRows, reqRows] = await Promise.all([
        window.VVI_DATA.fetchAvailability(startISO, endISO),
        window.VVI_DATA.fetchRequestedDates(startISO, endISO),
      ]);
      state.availabilityMap = new Map(availRows.map((r) => [r.date, r.is_available]));
      state.requestedMap = new Map(
        reqRows.map((r) => [r.preferred_date, r.status === 'approved' || r.status === 'completed' ? 'booked' : 'requested'])
      );
    } catch (err) {
      console.error(err);
      state.availabilityMap = new Map();
      state.requestedMap = new Map();
    }
  }

  async function renderCalendar() {
    await loadCalendarData();
    window.CalendarWidget.render({
      container: calendarEl,
      year: state.year,
      month: state.month,
      availabilityMap: state.availabilityMap,
      requestedMap: state.requestedMap,
      selectedDate: state.selectedDate,
      isAdmin: false,
      onNavigate: (dir) => {
        state.month += dir;
        if (state.month < 0) { state.month = 11; state.year -= 1; }
        if (state.month > 11) { state.month = 0; state.year += 1; }
        renderCalendar();
      },
      onSelect: (iso) => {
        state.selectedDate = iso;
        preferredDateInput.value = iso;
        dateDisplay.textContent = window.VVI.formatDate(iso, { weekday: 'long' });
        renderCalendar();
        updateSummary();
      },
    });
  }

  // ---------------------------------------------------------------
  // File uploads
  // ---------------------------------------------------------------
  function wireFileInput() {
    const input = $('#f-files');
    const previewGrid = $('#file-preview-grid');
    input.addEventListener('change', () => {
      Array.from(input.files || []).forEach((file) => state.files.push(file));
      input.value = '';
      renderFilePreviews();
    });

    function renderFilePreviews() {
      previewGrid.innerHTML = '';
      state.files.forEach((file, idx) => {
        const url = URL.createObjectURL(file);
        const item = document.createElement('div');
        item.className = 'file-preview-item';
        item.innerHTML = `<img src="${url}" alt="Reference image ${idx + 1}"><button type="button" class="file-preview-remove" aria-label="Remove image">&times;</button>`;
        item.querySelector('button').addEventListener('click', () => {
          state.files.splice(idx, 1);
          renderFilePreviews();
        });
        previewGrid.appendChild(item);
      });
    }
    wireFileInput._render = renderFilePreviews;
  }

  // ---------------------------------------------------------------
  // Summary sidebar
  // ---------------------------------------------------------------
  function updateSummary() {
    const est = window.PricingCalculator.estimate(state.size, state.color);
    $('#summary-price').textContent = formatPriceRange(est.min, est.max);
    const tiers = window.PricingCalculator.getTiers();
    $('#summary-size').textContent = tiers[state.size]?.label || '';
    $('#summary-color').textContent = state.color === 'color' ? 'Color' : 'Black & Gray';
    $('#summary-date').textContent = state.selectedDate ? window.VVI.formatDate(state.selectedDate) : 'Not selected';
    $('#summary-style').textContent = $('#f-style').value || '—';
    $('#summary-placement').textContent = $('#f-placement').value || '—';
    const designCount = window.IdeasCart.count() + (window.IdeasCart.getSourcePortfolioItem() ? 1 : 0);
    $('#summary-designs').textContent = designCount;
  }

  // ---------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------
  async function handleSubmit(e) {
    e.preventDefault();
    clearFormStatus(statusEl);

    const name = $('#f-name').value.trim();
    const email = $('#f-email').value.trim();
    const phone = $('#f-phone').value.trim();
    const idea = $('#f-idea').value.trim();
    const style = $('#f-style').value;
    const placement = $('#f-placement').value;
    const notes = $('#f-notes').value.trim();

    if (!name || !email || !phone || !idea || !style || !placement) {
      setFormStatus(statusEl, 'Please fill in all required fields before submitting.', 'error');
      return;
    }
    if (!state.selectedDate) {
      setFormStatus(statusEl, 'Please choose an available date from the calendar.', 'error');
      return;
    }

    const est = window.PricingCalculator.estimate(state.size, state.color);
    const source = window.IdeasCart.getSourcePortfolioItem();
    const selectedDesignIds = window.IdeasCart.getAll().map((d) => d.id);

    const submitBtn = $('#booking-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    try {
      await window.VVI_DATA.submitTattooRequest(
        {
          name, email, phone, idea, style, placement,
          size: window.PricingCalculator.getTiers()[state.size]?.label || state.size,
          colorPreference: state.color,
          notes,
          preferredDate: state.selectedDate,
          estimateMin: est.min,
          estimateMax: est.max,
          sourcePortfolioItemId: source?.id || null,
        },
        selectedDesignIds,
        state.files
      );

      window.IdeasCart.clear();
      window.IdeasCart.clearSourcePortfolioItem();
      $('#booking-form').hidden = true;
      $('.booking-summary').hidden = true;
      $('#confirmation-section').hidden = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setFormStatus(
        statusEl,
        err.message || `Something went wrong submitting your request. Please email ${window.SITE_CONFIG.BUSINESS.email} directly.`,
        'error'
      );
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Request';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    populateSelects();
    populateSizeChips();
    wireColorChips();
    wireFileInput();
    renderSelectedInspiration();
    renderCalendar();
    updateSummary();

    $('#f-style').addEventListener('change', updateSummary);
    $('#f-placement').addEventListener('change', updateSummary);
    $('#booking-form').addEventListener('submit', handleSubmit);
    document.addEventListener('ideas-cart:change', () => {
      renderSelectedInspiration();
      updateSummary();
    });
  });
})();
