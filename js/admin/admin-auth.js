/**
 * admin-auth.js — handles the login form (index.html) and guards the
 * dashboard (dashboard.html), redirecting unauthorized visitors.
 */
(function () {
  const { $, setFormStatus, clearFormStatus } = window.VVI;
  const onLoginPage = !!document.getElementById('admin-login-form');
  const onDashboard = document.body.classList.contains('admin-body');

  async function handleLoginSubmit(e) {
    e.preventDefault();
    const statusEl = $('#login-status');
    clearFormStatus(statusEl);

    if (!window.VVI_DATA.isConfigured()) {
      setFormStatus(
        statusEl,
        'Supabase is not connected yet. Add your project URL and anon key to js/config.js, then run sql/setup.sql — see README.md.',
        'error'
      );
      return;
    }

    const email = $('#login-email').value.trim();
    const password = $('#login-password').value;
    const submitBtn = $('#login-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in…';

    try {
      await window.VVI_DATA.adminSignIn(email, password);
      window.location.href = 'dashboard.html';
    } catch (err) {
      setFormStatus(statusEl, err.message || 'Sign in failed. Check your email and password.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    }
  }

  async function guardDashboard() {
    if (!window.VVI_DATA.isConfigured()) {
      document.body.innerHTML = `
        <div class="admin-login-wrap">
          <div class="admin-login-card">
            <div class="admin-login-brand"><span class="brand-mark">Velvet Vessel Ink</span><span class="brand-sub">Studio Dashboard</span></div>
            <p style="text-align:center;color:var(--text-muted);font-size:var(--fs-small);">Supabase isn't connected yet. Add your project URL and anon key to <code>js/config.js</code>, then run <code>sql/setup.sql</code> in your Supabase project. See README.md for step-by-step instructions.</p>
            <p style="text-align:center;margin-top:1rem;"><a href="index.html">&larr; Back to login</a></p>
          </div>
        </div>`;
      return;
    }
    const isAdmin = await window.VVI_DATA.isCurrentUserAdmin();
    if (!isAdmin) {
      window.location.href = 'index.html';
    }
  }

  function wireSignOut() {
    const btn = document.getElementById('admin-signout');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      await window.VVI_DATA.adminSignOut();
      window.location.href = 'index.html';
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (onLoginPage) {
      document.getElementById('admin-login-form').addEventListener('submit', handleLoginSubmit);
    }
    if (onDashboard) {
      guardDashboard();
      wireSignOut();
    }
  });
})();
