/**
 * calendar-widget.js
 * -----------------------------------------------------------------------
 * Reusable month-calendar renderer shared by the client booking page
 * (read + select a date) and the admin dashboard (read + toggle
 * availability, view request load per day).
 *
 * Day states:
 *   'past'         — before today, never interactive
 *   'available'    — Megan has explicitly opened this date
 *   'unavailable'  — Megan has explicitly closed this date
 *   'requested'    — has an active (non-declined) request pending review
 *   'booked'       — has an approved/completed request
 *   'unset'        — no availability row yet (not selectable by clients)
 * -----------------------------------------------------------------------
 */

const CalendarWidget = (function () {
  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  function pad(n) { return String(n).padStart(2, '0'); }
  function toISO(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}`; }
  function todayISO() { return window.VVI.toISODate(new Date()); }

  /**
   * Builds a demo availability pattern when Supabase isn't connected yet,
   * so the calendar still feels alive: open Tue–Sat, closed Sun/Mon.
   */
  function demoAvailability(year, month) {
    const map = new Map();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dow = date.getDay(); // 0 Sun ... 6 Sat
      const iso = toISO(year, month, d);
      map.set(iso, dow !== 0 && dow !== 1); // closed Sun/Mon
    }
    return map;
  }

  function computeState(iso, { availabilityMap, requestedMap, isAdmin }) {
    if (iso < todayISO()) return 'past';
    const req = requestedMap.get(iso);
    if (req === 'booked') return 'booked';
    if (req === 'requested') return 'requested';
    if (availabilityMap.has(iso)) {
      return availabilityMap.get(iso) ? 'available' : 'unavailable';
    }
    return 'unset';
  }

  /**
   * @param {Object} opts
   * @param {HTMLElement} opts.container
   * @param {number} opts.year
   * @param {number} opts.month 0-indexed
   * @param {Map<string, boolean>} opts.availabilityMap
   * @param {Map<string, 'requested'|'booked'>} opts.requestedMap
   * @param {string|null} opts.selectedDate
   * @param {boolean} opts.isAdmin — if true, all non-past days are clickable
   * @param {(iso:string, state:string)=>void} opts.onSelect
   */
  function render(opts) {
    const { container, year, month, availabilityMap, requestedMap, selectedDate, isAdmin, onSelect } = opts;
    const first = new Date(year, month, 1);
    const startOffset = first.getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const dowLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    let html = `
      <div class="cal-head">
        <button type="button" class="cal-nav" data-cal-prev aria-label="Previous month">&larr;</button>
        <h3 class="cal-title">${MONTH_NAMES[month]} ${year}</h3>
        <button type="button" class="cal-nav" data-cal-next aria-label="Next month">&rarr;</button>
      </div>
      <div class="cal-dow">${dowLabels.map((l) => `<span>${l}</span>`).join('')}</div>
      <div class="cal-grid">
    `;

    cells.forEach((d) => {
      if (d === null) {
        html += `<span class="cal-cell cal-cell--empty" aria-hidden="true"></span>`;
        return;
      }
      const iso = toISO(year, month, d);
      const state = computeState(iso, { availabilityMap, requestedMap, isAdmin });
      const interactive = isAdmin ? state !== 'past' : state === 'available';
      html += `
        <button type="button"
          class="cal-cell cal-cell--${state}${iso === selectedDate ? ' is-selected' : ''}"
          data-date="${iso}"
          data-state="${state}"
          ${interactive ? '' : 'disabled tabindex="-1"'}
          aria-pressed="${iso === selectedDate}"
          aria-label="${iso}, ${state}">
          <span>${d}</span>
        </button>`;
    });

    html += `</div>`;
    container.innerHTML = html;

    container.querySelector('[data-cal-prev]').addEventListener('click', () => opts.onNavigate(-1));
    container.querySelector('[data-cal-next]').addEventListener('click', () => opts.onNavigate(1));

    container.querySelectorAll('.cal-cell[data-date]:not([disabled])').forEach((btn) => {
      btn.addEventListener('click', () => onSelect(btn.dataset.date, btn.dataset.state));
    });
  }

  return { render, demoAvailability, toISO, todayISO, MONTH_NAMES };
})();

window.CalendarWidget = CalendarWidget;
