/**
 * supabase-client.js
 * -----------------------------------------------------------------------
 * Single data-access layer for the whole site. Every page talks to
 * Supabase (or, if Supabase isn't configured yet, to the built-in
 * placeholder data) exclusively through the `VVI_DATA` object defined
 * here — no page should call the Supabase SDK directly.
 *
 * Requires (loaded before this file, in order):
 *   config.js, placeholder-images.js, portfolio-data.js,
 *   inspiration-data.js, and the Supabase JS CDN script tag.
 * -----------------------------------------------------------------------
 */

const VVI_DATA = (function () {
  const cfg = window.SITE_CONFIG;
  let client = null;
  let configured = false;

  try {
    const hasRealConfig =
      cfg &&
      cfg.SUPABASE_URL &&
      cfg.SUPABASE_ANON_KEY &&
      !cfg.SUPABASE_URL.includes('YOUR-PROJECT') &&
      !cfg.SUPABASE_ANON_KEY.includes('YOUR-SUPABASE');
    if (hasRealConfig && window.supabase) {
      client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
      configured = true;
    }
  } catch (err) {
    console.warn('Supabase failed to initialize, falling back to placeholder data.', err);
  }

  function isConfigured() {
    return configured;
  }

  function notConfiguredError() {
    return new Error(
      'This feature requires Supabase to be connected. See README.md, or contact Megan directly at ' +
        (cfg?.BUSINESS?.email || '') +
        '.'
    );
  }

  // Fires the notify-email Edge Function so Megan gets an email for new
  // messages/requests. Best-effort: the database row (already saved) is
  // always the source of truth, so a failure here is only logged, never
  // thrown back to the visitor.
  async function notifyStudio(type, record) {
    if (!configured) return;
    try {
      await client.functions.invoke('notify-email', { body: { type, record } });
    } catch (err) {
      console.warn('notify-email call failed (message/request was still saved):', err);
    }
  }

  // -----------------------------------------------------------------
  // PORTFOLIO (completed tattoos)
  // -----------------------------------------------------------------
  async function fetchPortfolio() {
    if (!configured) return window.PORTFOLIO_PLACEHOLDER_DATA || [];
    const { data, error } = await client
      .from('portfolio_items')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async function fetchPortfolioById(id) {
    if (!configured) {
      return (window.PORTFOLIO_PLACEHOLDER_DATA || []).find((p) => String(p.id) === String(id)) || null;
    }
    const { data, error } = await client.from('portfolio_items').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async function createPortfolioItem(item) {
    if (!configured) throw notConfiguredError();
    const { data, error } = await client.from('portfolio_items').insert(item).select().single();
    if (error) throw error;
    return data;
  }

  async function updatePortfolioItem(id, updates) {
    if (!configured) throw notConfiguredError();
    const { data, error } = await client.from('portfolio_items').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async function deletePortfolioItem(id) {
    if (!configured) throw notConfiguredError();
    const { error } = await client.from('portfolio_items').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  // -----------------------------------------------------------------
  // INSPIRATION / DESIGN GALLERY
  // -----------------------------------------------------------------
  async function fetchInspirationDesigns() {
    if (!configured) return window.INSPIRATION_PLACEHOLDER_DATA || [];
    const { data, error } = await client
      .from('inspiration_designs')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async function fetchInspirationById(id) {
    if (!configured) {
      return (window.INSPIRATION_PLACEHOLDER_DATA || []).find((d) => String(d.id) === String(id)) || null;
    }
    const { data, error } = await client.from('inspiration_designs').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async function createInspirationDesign(item) {
    if (!configured) throw notConfiguredError();
    const { data, error } = await client.from('inspiration_designs').insert(item).select().single();
    if (error) throw error;
    return data;
  }

  async function updateInspirationDesign(id, updates) {
    if (!configured) throw notConfiguredError();
    const { data, error } = await client.from('inspiration_designs').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async function deleteInspirationDesign(id) {
    if (!configured) throw notConfiguredError();
    const { error } = await client.from('inspiration_designs').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  // -----------------------------------------------------------------
  // AVAILABILITY (calendar)
  // -----------------------------------------------------------------
  async function fetchAvailability(startISO, endISO) {
    if (!configured) return []; // no unavailable/booked overrides in demo mode
    const { data, error } = await client
      .from('availability')
      .select('*')
      .gte('date', startISO)
      .lte('date', endISO);
    if (error) throw error;
    return data;
  }

  async function fetchRequestedDates(startISO, endISO) {
    // Dates with an active (non-declined) request, used to shade the calendar.
    // Reads from requested_dates_public, a narrow view (just date + status,
    // no client info) that anonymous visitors are allowed to read -- the
    // tattoo_requests table itself only grants SELECT to admins.
    if (!configured) return [];
    const { data, error } = await client
      .from('requested_dates_public')
      .select('preferred_date, status')
      .gte('preferred_date', startISO)
      .lte('preferred_date', endISO);
    if (error) throw error;
    return data;
  }

  async function setAvailability(dateISO, isAvailable, note = '') {
    if (!configured) throw notConfiguredError();
    const { data, error } = await client
      .from('availability')
      .upsert({ date: dateISO, is_available: isAvailable, note }, { onConflict: 'date' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // -----------------------------------------------------------------
  // TATTOO REQUESTS
  // -----------------------------------------------------------------
  async function submitTattooRequest(payload, selectedDesignIds = [], files = []) {
    if (!configured) throw notConfiguredError();

    // We generate the id client-side and insert WITHOUT .select() here.
    // tattoo_requests only grants SELECT to admins (anyone can INSERT, only
    // admins can read). insert().select() asks Postgres to hand the new row
    // back (RETURNING), and Postgres enforces the SELECT policy on that
    // returned row too -- so for an anonymous visitor it fails with
    // "new row violates row-level security policy", even though the insert
    // itself is perfectly allowed. Skipping .select() avoids that check.
    const request = {
      id: crypto.randomUUID(),
      client_name: payload.name,
      client_email: payload.email,
      client_phone: payload.phone,
      tattoo_idea: payload.idea,
      style: payload.style,
      placement: payload.placement,
      size: payload.size,
      color_preference: payload.colorPreference,
      additional_notes: payload.notes,
      preferred_date: payload.preferredDate,
      estimated_price_min: payload.estimateMin,
      estimated_price_max: payload.estimateMax,
      source_portfolio_item_id: payload.sourcePortfolioItemId || null,
      status: 'new',
    };

    const { error } = await client.from('tattoo_requests').insert(request);
    if (error) throw error;

    if (selectedDesignIds.length) {
      const rows = selectedDesignIds.map((designId) => ({
        request_id: request.id,
        design_id: designId,
      }));
      const { error: designErr } = await client.from('request_selected_designs').insert(rows);
      if (designErr) throw designErr;
    }

    if (files.length) {
      // client-reference-images is a PRIVATE bucket (clients' reference photos
      // are personal) — we store only the storage path here. Admins view these
      // images via short-lived signed URLs (see getSignedUrl below), never a
      // public URL, so one client's uploads can't be guessed/viewed by another.
      for (const file of files) {
        const path = `${request.id}/${Date.now()}-${file.name}`.replace(/\s+/g, '-');
        const { error: uploadErr } = await client.storage
          .from(cfg.STORAGE.references)
          .upload(path, file, { upsert: false });
        if (uploadErr) throw uploadErr;
        const { error: refErr } = await client.from('request_reference_images').insert({
          request_id: request.id,
          image_path: path,
          image_url: null,
        });
        if (refErr) throw refErr;
      }
    }

    notifyStudio('tattoo_request', request);
    return request;
  }

  async function fetchAllRequests() {
    if (!configured) throw notConfiguredError();
    const { data, error } = await client
      .from('tattoo_requests')
      .select('*, request_selected_designs(*, inspiration_designs(name, image_url)), request_reference_images(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async function updateRequestStatus(id, status, adminNotes) {
    if (!configured) throw notConfiguredError();
    const updates = { status, updated_at: new Date().toISOString() };
    if (adminNotes !== undefined) updates.admin_notes = adminNotes;
    const { data, error } = await client.from('tattoo_requests').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  // -----------------------------------------------------------------
  // CONTACT MESSAGES
  // -----------------------------------------------------------------
  async function submitContactMessage(payload) {
    if (!configured) throw notConfiguredError();
    // Same reasoning as submitTattooRequest: contact_messages only grants
    // SELECT to admins, so we generate the id client-side and skip
    // .select() on the insert to avoid the RLS/RETURNING conflict.
    const data = {
      id: crypto.randomUUID(),
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      message: payload.message,
      status: 'unread',
    };
    const { error } = await client.from('contact_messages').insert(data);
    if (error) throw error;
    notifyStudio('contact_message', data);
    return data;
  }

  async function fetchAllMessages() {
    if (!configured) throw notConfiguredError();
    const { data, error } = await client.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async function markMessageStatus(id, status) {
    if (!configured) throw notConfiguredError();
    const { error } = await client.from('contact_messages').update({ status }).eq('id', id);
    if (error) throw error;
    return true;
  }

  // -----------------------------------------------------------------
  // STORAGE (portfolio / design gallery admin uploads)
  // -----------------------------------------------------------------
  async function uploadImage(bucket, file, pathPrefix = '') {
    if (!configured) throw notConfiguredError();
    const path = `${pathPrefix}${Date.now()}-${file.name}`.replace(/\s+/g, '-');
    const { error } = await client.storage.from(bucket).upload(path, file, { upsert: false });
    if (error) throw error;
    const { data } = client.storage.from(bucket).getPublicUrl(path);
    return { path, url: data?.publicUrl || null };
  }

  /** Short-lived signed URL for a private bucket object (e.g. client reference images). */
  async function getSignedUrl(bucket, path, expiresIn = 3600) {
    if (!configured) throw notConfiguredError();
    const { data, error } = await client.storage.from(bucket).createSignedUrl(path, expiresIn);
    if (error) throw error;
    return data?.signedUrl || null;
  }

  // -----------------------------------------------------------------
  // AUTH (admin only)
  // -----------------------------------------------------------------
  async function adminSignIn(email, password) {
    if (!configured) throw notConfiguredError();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      await client.auth.signOut();
      throw new Error('This account is not authorized to access the studio dashboard.');
    }
    return data;
  }

  async function adminSignOut() {
    if (!configured) return;
    await client.auth.signOut();
  }

  async function getSession() {
    if (!configured) return null;
    const { data } = await client.auth.getSession();
    return data?.session || null;
  }

  async function isCurrentUserAdmin() {
    if (!configured) return false;
    const { data: sessionData } = await client.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) return false;
    const { data, error } = await client.from('admin_profiles').select('id').eq('id', user.id).maybeSingle();
    if (error) return false;
    return !!data;
  }

  return {
    isConfigured,
    fetchPortfolio, fetchPortfolioById, createPortfolioItem, updatePortfolioItem, deletePortfolioItem,
    fetchInspirationDesigns, fetchInspirationById, createInspirationDesign, updateInspirationDesign, deleteInspirationDesign,
    fetchAvailability, fetchRequestedDates, setAvailability,
    submitTattooRequest, fetchAllRequests, updateRequestStatus,
    submitContactMessage, fetchAllMessages, markMessageStatus,
    uploadImage, getSignedUrl,
    adminSignIn, adminSignOut, getSession, isCurrentUserAdmin,
  };
})();

window.VVI_DATA = VVI_DATA;
