/**
 * admin-messages.js — contact form submissions inbox.
 */
(function () {
  const { $, $$, escapeHtml, formatDate, showToast } = window.VVI;

  let messages = [];
  const tbody = document.getElementById('messages-tbody');
  const badge = document.getElementById('badge-messages');

  function renderTable() {
    if (!messages.length) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">No messages yet.</div></td></tr>`;
      return;
    }
    tbody.innerHTML = messages
      .map(
        (m) => `
      <tr>
        <td>${escapeHtml(m.name)}<br><span style="color:var(--text-muted);font-size:var(--fs-tiny);">${escapeHtml(m.email)}</span></td>
        <td class="ellipsis">${escapeHtml(m.message)}</td>
        <td>${formatDate(m.created_at)}</td>
        <td><span class="status-pill status-pill--${m.status === 'unread' ? 'new' : m.status === 'read' ? 'review' : 'approved'}">${escapeHtml(m.status)}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-dark" data-reply="${m.id}">Reply via Email</button>
        </td>
      </tr>`
      )
      .join('');

    $$('[data-reply]', tbody).forEach((btn) =>
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const m = messages.find((x) => String(x.id) === btn.dataset.reply);
        if (!m) return;
        const subject = encodeURIComponent(`Re: your message to Velvet Vessel Ink`);
        const body = encodeURIComponent(`Hi ${m.name},\n\nThanks for reaching out to Velvet Vessel Ink!\n\n`);
        window.location.href = `mailto:${m.email}?subject=${subject}&body=${body}`;
        if (m.status === 'unread') {
          try {
            await window.VVI_DATA.markMessageStatus(m.id, 'replied');
            init();
          } catch (err) {
            showToast(err.message || 'Could not update message status.');
          }
        }
      })
    );

    $$('tr', tbody).forEach((row, idx) => {
      row.addEventListener('click', async () => {
        const m = messages[idx];
        if (!m || m.status !== 'unread') return;
        try {
          await window.VVI_DATA.markMessageStatus(m.id, 'read');
          init();
        } catch (err) {
          console.error(err);
        }
      });
    });
  }

  async function init() {
    tbody.innerHTML = `<tr><td colspan="5"><div class="loading-state"><div class="spinner"></div>Loading messages&hellip;</div></td></tr>`;
    try {
      messages = await window.VVI_DATA.fetchAllMessages();
      const unread = messages.filter((m) => m.status === 'unread').length;
      badge.hidden = unread === 0;
      badge.textContent = unread;
      renderTable();
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state">${err.message || 'Unable to load messages.'}</div></td></tr>`;
    }
  }

  window.AdminApp.registerPanel('messages', init);
})();
