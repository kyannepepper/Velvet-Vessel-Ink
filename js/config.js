/**
 * config.js
 * -----------------------------------------------------------------------
 * Central, editable configuration for the Velvet Vessel Ink website.
 * Non-developers can update almost everything about the site's content
 * and integrations by editing the values in this one file.
 * -----------------------------------------------------------------------
 */

const SITE_CONFIG = {
  // ---------------------------------------------------------------------
  // SUPABASE — paste your project's values here once you've run
  // sql/setup.sql inside your Supabase project. Find these under
  // Project Settings → API in the Supabase dashboard.
  // Until these are filled in, the site automatically runs on the
  // built-in placeholder data so it's fully demoable out of the box.
  // ---------------------------------------------------------------------
  SUPABASE_URL: 'https://YOUR-PROJECT-REF.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR-SUPABASE-ANON-PUBLIC-KEY',

  // Storage bucket names (created by sql/setup.sql)
  STORAGE: {
    portfolio: 'portfolio-images',
    designs: 'design-gallery-images',
    references: 'client-reference-images',
  },

  // ---------------------------------------------------------------------
  // BUSINESS INFO — shown across the site
  // ---------------------------------------------------------------------
  BUSINESS: {
    name: 'Velvet Vessel Ink',
    artist: 'Megan Klein',
    city: 'St. George, Utah',
    email: 'hello@velvetvesselink.com',
    phone: '(435) 555-0142',
    addressLine: 'St. George, Utah · exact studio address shared upon booking',
    instagram: 'https://www.instagram.com/velvetvessel_ink/',
    tiktok: 'https://www.tiktok.com/@velvetvessel.ink',
  },

  // ---------------------------------------------------------------------
  // PRICING — editable ranges used by the pricing calculator.
  // These are estimates only; Megan sets final pricing per request.
  // ---------------------------------------------------------------------
  PRICING: {
    small: { label: 'Small', desc: 'Up to ~3 inches', min: 100, max: 200 },
    medium: { label: 'Medium', desc: 'Roughly 3–6 inches', min: 200, max: 400 },
    large: { label: 'Large', desc: '6+ inches / larger pieces', min: 400, max: 700 },
    colorSurcharge: 0.15, // +15% estimate nudge for full color pieces
  },

  SPECIALTIES: ['Fine Line', 'Floral', 'Realism', 'Black & Gray', 'Lettering'],

  STYLES: [
    'Fine Line', 'Floral', 'Realism', 'Black & Gray', 'Lettering',
    'Botanical', 'Minimalist', 'Illustrative', 'Script', 'Ornamental',
  ],

  PLACEMENTS: [
    'Forearm', 'Upper Arm', 'Shoulder', 'Wrist', 'Hand', 'Ribs',
    'Back', 'Chest', 'Thigh', 'Calf', 'Ankle', 'Behind the Ear', 'Neck',
  ],

  SIZES: ['Small', 'Medium', 'Large'],
};

window.SITE_CONFIG = SITE_CONFIG;
