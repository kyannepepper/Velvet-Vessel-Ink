/**
 * admin-calendar.js — availability management for the studio calendar.
 */
(function () {
  const { $, formatDate, showToast } = window.VVI;

  const state = {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    availabilityMap: new Map(),
    requestedMap: new Map(),
    requestsByDate: new Map(), // date -> [{client_name, status}]
  };

  const calendarEl = document.getElementById('admin-calendar');
  const dayOverlay = document.getElementById('day-overlay');
  const dayContent = document.getElementById('day-modal-content');

  async function loadMonthData() {
    const y = state.year, m = state.month;
    const startISO = window.CalendarWidget.toISO(y, m, 1);
    const endISO = window.CalendarWidget.toISO(y, m, new Date(y, m + 1, 0).getDate());

    try {
      const [availRows, requests] = await Promise.all([
        window.VVI_DATA.fetchAvailability(startISO, endISO),
        window.VVI_DATA.fetchAllRequests().catch(() => []),
      ]);
      state.availabilityMap = new Map(availRows.map((r) => [r.date, r.is_available]));
      state.requestedMap = new Map();
      state.requestsByDate = new Map();
      requests
        .filter((r) => r.preferred_date >= startISO && r.preferred_date <= endISO)
        .forEach((r) => {
          if (r.status !== 'declined') {
            state.requestedMap.set(r.preferred_date, r.status === 'approved' || r.status === 'completed' ? 'booked' : 'requested');
          }
          if (!state.requestsByDate.has(r.preferred_date)) state.requestsByDate.set(r.preferred_date, []);
          state.requestsByDate.get(r.preferred_date).push(r);
        });
    } catch (err) {
      console.error(err);
    }
  }

  async function render() {
    if (!calendarEl) return;
    calendarEl.innerHTML = `<div class="loading-state"><div class="spinner"></div>Loading calendar&hellip;</div>`;
    await loadMonthData();
    window.CalendarWidget.render({
      container: calendarEl,
      year: state.year,
      month: state.month,
      availabilityMap: state.availabilityMap,
      requestedMap: state.requestedMap,
      selectedDate: null,
      isAdmin: true,
      onNavigate: (dir) => {
        state.month += dir;
        if (state.month < 0) { state.month = 11; state.year -= 1; }
        if (state.month > 11) { state.month = 0; state.year += 1; }
        render();
      },
      onSelect: (iso, cellState) => openDayModal(iso, cellState),
    });
  }

  function openDayModal(iso, cellState) {
    const requests = state.requestsByDate.get(iso) || [];
    const isAvailable = state.availabilityMap.has(iso) ? state.availabilityMap.get(iso) : null;

    dayContent.innerHTML = `
      <p class="eyebrow">${cellState === 'booked' ? 'Booked' : cellState === 'requested' ? 'Requested' : 'Manage Date'}</p>
      <h2>${formatDate(iso, { weekday: 'long' })}</h2>
      ${requests.length ? `
        <div class="request-designs-list">
          ${requests.map((r) => `<span>${r.client_name} &middot; ${r.status.replace('_', ' ')}</span>`).join('')}
        </div>
      ` : '<p style="color:var(--text-muted);font-size:var(--fs-small);">No requests for this date.</p>'}
      <hr class="hr">
      <p class="admin-panel-sub" style="margin-bottom:0.75rem;">Set this date's availability for clients:</p>
      <div class="status-actions">
        <button class="btn btn-sm ${isAvailable === true ? 'btn-primary' : 'btn-outline-dark'}" data-set-avail="true">Mark Available</button>
        <button class="btn btn-sm ${isAvailable === false ? 'btn-primary' : 'btn-outline-dark'}" data-set-avail="false">Mark Unavailable</button>
      </div>
    `;

    dayContent.querySelectorAll('[data-set-avail]').forEach((btn) =>
      btn.addEventListener('click', async () => {
        const value = btn.dataset.setAvail === 'true';
        try {
          await window.VVI_DATA.setAvailability(iso, value);
          showToast(`${formatDate(iso)} marked ${value ? 'available' : 'unavailable'}.`);
          window.AdminApp.closeModal(dayOverlay);
          render();
        } catch (err) {
          showToast(err.message || 'Could not update availability.');
        }
      })
    );

    window.AdminApp.openModal(dayOverlay);
  }

  window.AdminApp.registerPanel('calendar', render);
})();
