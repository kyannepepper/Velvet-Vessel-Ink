/**
 * contact.js — populates business info and handles the contact form:
 * saves the message to Supabase (when connected) and opens a pre-filled
 * mailto link as an immediate fallback/companion, per spec.
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

  function buildMailto({ name, email, phone, message }) {
    const cfg = window.SITE_CONFIG?.BUSINESS || {};
    const subject = encodeURIComponent(`New message from ${name} via velvetvesselink.com`);
    const bodyLines = [
      message,
      '',
      '---',
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : null,
    ].filter(Boolean);
    const body = encodeURIComponent(bodyLines.join('\n'));
    return `mailto:${cfg.email || ''}?subject=${subject}&body=${body}`;
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

    const submitBtn = $('#contact-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    let savedToDatabase = false;
    try {
      if (window.VVI_DATA.isConfigured()) {
        await window.VVI_DATA.submitContactMessage({ name, email, phone, message });
        savedToDatabase = true;
      }
    } catch (err) {
      console.error('Could not save message to Supabase:', err);
    }

    window.location.href = buildMailto({ name, email, phone, message });

    setFormStatus(
      statusEl,
      savedToDatabase
        ? "Message saved and your email app should now be open to send it along — thank you!"
        : "Your email app should now be open to send your message — thank you!",
      'success'
    );
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
    $('#contact-form').reset();
  }

  document.addEventListener('DOMContentLoaded', () => {
    populateBusinessInfo();
    $('#contact-form').addEventListener('submit', handleSubmit);
  });
})();
