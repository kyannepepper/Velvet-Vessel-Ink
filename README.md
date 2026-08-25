# Velvet Vessel Ink — Website

A complete, premium tattoo-artist website for **Megan Klein / Velvet Vessel Ink**
(St. George, Utah), built with plain HTML, CSS, and vanilla JavaScript on the
frontend and **Supabase** (Postgres database, Auth, and Storage) on the backend.
No React/Vue/Angular/Tailwind/Bootstrap — just organized, hand-written code.

The site works immediately, out of the box, on placeholder content and free
Unsplash photography. Connecting Supabase (about 10 minutes, steps below)
upgrades it to a fully working, persistent backend with a protected admin
dashboard for Megan.

---

## 1. Preview it right now

No build step, no install. From this folder, run any static file server, e.g.:

```bash
python3 -m http.server 8000
# then open http://localhost:8000/index.html
```

(Opening `index.html` directly by double-clicking also works in most
browsers, but a local server is recommended and required for `/admin`.)

Everything — the portfolio, inspiration gallery, calendar, and pricing
calculator — works immediately using built-in placeholder data. Nothing is
saved permanently until Supabase is connected (see below); form submissions
will show a friendly message asking you to connect Supabase first.

---

## 2. Project structure

```
index.html            Homepage
portfolio.html         Completed-work gallery (search + filter)
inspiration.html       Design gallery ("My Ideas" multi-select)
booking.html            Tattoo request form + availability calendar
about.html              Megan's story
aftercare.html          Prep & healing information
faq.html                 FAQ accordion
contact.html             Contact form

admin/
  index.html             Studio login (Supabase Auth)
  dashboard.html          Protected dashboard (calendar, requests, portfolio,
                           design gallery, messages)

css/
  variables.css           Design tokens (colors, type, spacing)
  base.css                Reset, layout system, nav/footer, buttons, forms,
                           modals — shared across every page
  home.css, portfolio.css, inspiration.css, booking.css, about.css,
  info-pages.css, faq.css, contact.css, admin.css
                           Page-specific styles

js/
  config.js                ← EDIT THIS: Supabase keys, business info, pricing
  placeholder-images.js    Curated Unsplash placeholder photo URLs
  portfolio-data.js        Placeholder portfolio items (fallback + seed data)
  inspiration-data.js      Placeholder design gallery items (fallback + seed data)
  supabase-client.js       ALL data access goes through this one file
  utils.js                 Shared helpers ($ , formatCurrency, toasts, etc.)
  ideas-cart.js             "My Ideas" localStorage cart
  pricing-calculator.js     Shared price-estimate logic
  calendar-widget.js        Shared month-calendar renderer (client + admin)
  nav.js                    Renders the header/footer on every page
  home.js, portfolio.js, inspiration.js, booking.js, about.js, contact.js
                             Page-specific behavior
  admin/
    admin-auth.js            Login + dashboard access guard
    admin-app.js              Tab switching + modal helpers
    admin-calendar.js         Availability management
    admin-requests.js         Review & approve/decline requests
    admin-portfolio.js        Portfolio CRUD
    admin-designs.js          Design gallery CRUD
    admin-messages.js         Contact message inbox

sql/
  setup.sql                Paste into the Supabase SQL Editor once — creates
                            every table, index, storage bucket, and RLS policy
```

Nothing is in one giant file — every page loads only the CSS/JS it needs,
and shared logic (data access, pricing, calendar, nav) lives in one place
each so there's a single spot to update when something changes.

---

## 3. Connect Supabase (~10 minutes)

1. **Create a project** at [supabase.com](https://supabase.com) (free tier is fine).
2. **Run the setup script.** Open your project → SQL Editor → New query, paste
   the entire contents of `sql/setup.sql`, and run it. This creates every
   table, relationship, index, storage bucket, and Row Level Security policy
   the site needs.
3. **Create Megan's login.** Project → Authentication → Users → Add User.
   Enter her email + a password. Copy the new user's **UID**.
4. **Grant dashboard access.** Back in the SQL Editor, run:
   ```sql
   insert into public.admin_profiles (id, full_name, email)
   values ('PASTE-HER-USER-UID-HERE', 'Megan Klein', 'her@email.com');
   ```
   (This is the step that actually lets her sign into `/admin` — creating the
   auth user alone isn't enough.)
5. **Copy your API keys.** Project → Settings → API. Copy the **Project URL**
   and the **anon public key**.
6. **Paste them into `js/config.js`:**
   ```js
   SUPABASE_URL: 'https://your-project-ref.supabase.co',
   SUPABASE_ANON_KEY: 'your-anon-public-key',
   ```
7. Reload the site. Portfolio/inspiration data now comes from Supabase, the
   booking form and contact form save real submissions, and Megan can sign
   into `/admin/index.html` with the email/password from step 3.

That's it — no server to deploy, no environment variables beyond that one
file. Host the static files anywhere (Netlify, Vercel, GitHub Pages, S3,
etc.) once you're ready to go live.

### Storage buckets (created automatically by setup.sql)

| Bucket                     | Visibility | Used for                                  |
|-----------------------------|-----------|--------------------------------------------|
| `portfolio-images`           | Public    | Completed tattoo photos                    |
| `design-gallery-images`      | Public    | Inspiration design images                  |
| `client-reference-images`    | **Private** | Client-uploaded reference photos — only admins can view them (via short-lived signed URLs), never a public link |

---

## 4. Editing content

Almost everything a non-developer would want to change lives in one file:
**`js/config.js`** — business name, email, phone, Instagram/TikTok URLs,
pricing tiers, style/placement option lists.

- **Portfolio & design gallery items:** once Supabase is connected, manage
  these entirely from `/admin` — no code editing needed. Until then, edit
  `js/portfolio-data.js` / `js/inspiration-data.js` directly.
- **Photos:** replace any Unsplash placeholder by uploading a real photo in
  the admin dashboard (it goes straight to Supabase Storage), or by editing
  the URLs in `js/placeholder-images.js` before Supabase is connected.
- **Page copy** (About bio, Aftercare instructions, FAQ answers): edit the
  text directly in the relevant `.html` file — it's plain, readable markup.
- **Colors & fonts:** all defined as CSS custom properties at the top of
  `css/variables.css`.

---

## 5. How the booking flow works

1. Client browses the **Portfolio** or **Inspiration** gallery (or skips
   straight to the request form with their own idea).
2. Selected inspiration designs are held in `localStorage` only (see
   `js/ideas-cart.js`) until the client actually submits a request — nothing
   touches the database until then, per spec.
3. On `booking.html`, the client picks an **open** date from the calendar
   (Megan controls which dates are open from `/admin` → Calendar), fills in
   their idea/style/placement/size, sees a **live, non-binding price
   estimate**, and submits.
4. The request — plus any selected designs and uploaded reference images —
   is saved to Supabase with status `new`. **Nothing is booked
   automatically.**
5. Megan reviews every request in `/admin` → Tattoo Requests, and moves it
   through New → Under Review → Approved/Declined → Completed herself.

No client account or login is ever required to submit a request or browse
the site — only Megan's studio dashboard is protected.

---

## 6. Notes & good defaults already built in

- **No deposit is collected** anywhere on the site, per spec — pricing is
  always labeled as an estimate.
- The **calendar defaults to "not open"** for any date Megan hasn't
  explicitly marked available — this is intentional so the studio never
  looks bookable before she's actually curated her schedule.
- Every page is keyboard-navigable, uses semantic HTML landmarks, includes
  descriptive `alt` text, and respects `prefers-reduced-motion`.
- If Supabase isn't connected yet, write actions (booking submissions,
  contact form, admin login) fail gracefully with a clear message rather
  than pretending to succeed.
