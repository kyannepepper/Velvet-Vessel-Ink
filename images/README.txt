This folder is intentionally empty.

Velvet Vessel Ink's photos are NOT stored as local files in this project —
they live in:

  1. Supabase Storage (once connected) — portfolio photos, design gallery
     images, and client reference uploads all live in Supabase Storage
     buckets and are referenced by URL in the database. Upload real photos
     through the admin dashboard at /admin, and they'll be stored, resized
     for the web, and served automatically.

  2. js/placeholder-images.js — until Supabase is connected, the site runs
     entirely on free Unsplash placeholder photography referenced by URL
     from this file, so there is nothing to download or manage locally.

If you'd prefer to self-host images from this folder instead (e.g. for a
custom hero photo before Supabase is set up), you can add files here and
reference them with a relative path like "images/your-photo.jpg" in place
of a placeholder URL in js/placeholder-images.js or index.html.
