/**
 * contact.js — populates business info and handles the contact form:
 * saves the message to Supabase, which also triggers an email notification
 * to the studio (see supabase-client.js -> notifyStudio). Shows an on-page
 * success message; never redirects to the visitor's own email app.
 */
(function () {
  const { $, setFormStatus, clearFormStatus } = window.VVI;

  function populateBusinessInfo() {
    const cfg = window.SITE_CONFIG?.BUSINESS || {};
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setText('contact-location', cfg.addressLine || '');
    setText('contact-email-inline', cfg.email || '');

    const emailLink = $('#contact-email-link');
    if (emailLink) { emailLink.href = `mailto:${cfg.email || ''}`; emailLink.textContent = cfg.email || ''; }

    const ig = $('#contact-instagram-link');
    if (ig) ig.href = cfg.instagram || '#';
    const tt = $('#contact-tiktok-link');
    if (tt) tt.href = cfg.tiktok || '#';

    const img = $('#contact-image');
    if (img) img.src = window.PLACEHOLDER_IMAGES?.studio?.[0] || '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const statusEl = $('#contact-status');
    clearFormStatus(statusEl);

    const name = $('#c-name').value.trim();
    const email = $('#c-email').value.trim();
    const phone = $('#c-phone').value.trim();
    const message = $('#c-message').value.trim();

    if (!name || !email || !message) {
      setFormStatus(statusEl, 'Please fill in your name, email, and message.', 'error');
      return;
    }

    if (!window.VVI_DATA.isConfigured()) {
      setFormStatus(
        statusEl,
        `This form isn't connected yet. Please email ${window.SITE_CONFIG?.BUSINESS?.email || 'us'} directly.`,
        'error'
      );
      return;
    }

    const submitBtn = $('#contact-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      await window.VVI_DATA.submitContactMessage({ name, email, phone, message });
      setFormStatus(statusEl, "We've received your message and will get back to you soon!", 'success');
      $('#contact-form').reset();
    } catch (err) {
      console.error('Could not save message to Supabase:', err);
      setFormStatus(
        statusEl,
        `Something went wrong sending your message. Please email ${window.SITE_CONFIG?.BUSINESS?.email || 'us'} directly.`,
        'error'
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    populateBusinessInfo();
    $('#contact-form').addEventListener('submit', handleSubmit);
  });
})();
