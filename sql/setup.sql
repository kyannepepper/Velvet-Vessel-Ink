-- =============================================================================
-- VELVET VESSEL INK — Supabase setup script
-- =============================================================================
-- Paste this entire file into the Supabase SQL Editor (Project → SQL Editor →
-- New query) and run it once against a fresh project. It creates every table,
-- relationship, index, storage bucket, and Row Level Security policy the site
-- needs. Safe to re-run (uses IF NOT EXISTS / DROP POLICY IF EXISTS guards).
--
-- After running this:
--   1. Create Megan's login under Authentication → Users → Add User
--      (email + password). Copy her new User UID.
--   2. Run the INSERT at the bottom of this file (search "ADD YOUR ADMIN
--      USER"), replacing the placeholder UUID/email with her real ones —
--      this is what actually grants dashboard access.
--   3. Copy your Project URL and anon public key from Project Settings → API
--      into js/config.js.
-- =============================================================================

create extension if not exists pgcrypto;

-- =============================================================================
-- 1. ADMIN PROFILES
-- Links Supabase Auth users to studio-dashboard access. A user must have a
-- row here (id = their auth.users id) to sign into /admin.
-- =============================================================================
create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

-- SECURITY DEFINER helper used throughout the policies below so every other
-- table can cheaply check "is the current user an admin?" without exposing
-- the admin_profiles table itself.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_profiles where id = auth.uid()
  );
$$;

-- =============================================================================
-- 2. PORTFOLIO ITEMS — completed tattoos shown on the Portfolio page
-- =============================================================================
create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  style text not null,
  placement text not null,
  size text not null check (size in ('Small', 'Medium', 'Large')),
  price numeric(10,2) not null check (price >= 0),
  description text not null default '',
  image_url text not null,
  image_path text,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_portfolio_items_style on public.portfolio_items(style);
create index if not exists idx_portfolio_items_placement on public.portfolio_items(placement);
create index if not exists idx_portfolio_items_featured on public.portfolio_items(featured);
create index if not exists idx_portfolio_items_price on public.portfolio_items(price);

-- =============================================================================
-- 3. INSPIRATION DESIGNS — the design gallery clients can pick from
-- =============================================================================
create table if not exists public.inspiration_designs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  style text not null,
  suggested_placement text,
  suggested_size text check (suggested_size in ('Small', 'Medium', 'Large')),
  price_min numeric(10,2) check (price_min >= 0),
  price_max numeric(10,2) check (price_max >= 0),
  description text not null default '',
  image_url text not null,
  image_path text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_inspiration_designs_category on public.inspiration_designs(category);
create index if not exists idx_inspiration_designs_style on public.inspiration_designs(style);

-- =============================================================================
-- 4. AVAILABILITY — dates Megan has explicitly opened or closed
-- No row for a date = not yet opened for booking.
-- =============================================================================
create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  is_available boolean not null default true,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_availability_date on public.availability(date);

-- =============================================================================
-- 5. TATTOO REQUESTS — the core booking-request submissions
-- =============================================================================
create table if not exists public.tattoo_requests (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_email text not null,
  client_phone text not null,
  tattoo_idea text not null,
  style text not null,
  placement text not null,
  size text not null check (size in ('Small', 'Medium', 'Large')),
  color_preference text not null default 'black_gray' check (color_preference in ('black_gray', 'color')),
  additional_notes text,
  preferred_date date not null,
  estimated_price_min numeric(10,2),
  estimated_price_max numeric(10,2),
  source_portfolio_item_id uuid references public.portfolio_items(id) on delete set null,
  status text not null default 'new' check (status in ('new', 'under_review', 'approved', 'declined', 'completed')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tattoo_requests_status on public.tattoo_requests(status);
create index if not exists idx_tattoo_requests_preferred_date on public.tattoo_requests(preferred_date);
create index if not exists idx_tattoo_requests_created_at on public.tattoo_requests(created_at desc);

-- =============================================================================
-- 6. REQUEST ↔ SELECTED DESIGNS (many-to-many)
-- One tattoo request can reference multiple inspiration designs the client
-- wants combined.
-- =============================================================================
create table if not exists public.request_selected_designs (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.tattoo_requests(id) on delete cascade,
  design_id uuid references public.inspiration_designs(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_request_selected_designs_request on public.request_selected_designs(request_id);
create index if not exists idx_request_selected_designs_design on public.request_selected_designs(design_id);

-- =============================================================================
-- 7. REQUEST REFERENCE IMAGES — client-uploaded photos, one-to-many
-- =============================================================================
create table if not exists public.request_reference_images (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.tattoo_requests(id) on delete cascade,
  image_path text not null,
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_request_reference_images_request on public.request_reference_images(request_id);

-- =============================================================================
-- 8. CONTACT MESSAGES — general contact form submissions
-- =============================================================================
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  status text not null default 'unread' check (status in ('unread', 'read', 'replied')),
  created_at timestamptz not null default now()
);

create index if not exists idx_contact_messages_status on public.contact_messages(status);
create index if not exists idx_contact_messages_created_at on public.contact_messages(created_at desc);

-- =============================================================================
-- updated_at maintenance trigger (tattoo_requests, portfolio_items, inspiration_designs)
-- =============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_tattoo_requests_updated_at on public.tattoo_requests;
create trigger trg_tattoo_requests_updated_at
  before update on public.tattoo_requests
  for each row execute function public.set_updated_at();

drop trigger if exists trg_portfolio_items_updated_at on public.portfolio_items;
create trigger trg_portfolio_items_updated_at
  before update on public.portfolio_items
  for each row execute function public.set_updated_at();

drop trigger if exists trg_inspiration_designs_updated_at on public.inspiration_designs;
create trigger trg_inspiration_designs_updated_at
  before update on public.inspiration_designs
  for each row execute function public.set_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table public.admin_profiles enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.inspiration_designs enable row level security;
alter table public.availability enable row level security;
alter table public.tattoo_requests enable row level security;
alter table public.request_selected_designs enable row level security;
alter table public.request_reference_images enable row level security;
alter table public.contact_messages enable row level security;

-- ---------- admin_profiles: an admin can only see their own row ----------
drop policy if exists "Admins can view own profile" on public.admin_profiles;
create policy "Admins can view own profile" on public.admin_profiles
  for select using (auth.uid() = id);

-- ---------- portfolio_items: public read, admin write ----------
drop policy if exists "Public can view portfolio" on public.portfolio_items;
create policy "Public can view portfolio" on public.portfolio_items
  for select using (true);

drop policy if exists "Admins can insert portfolio" on public.portfolio_items;
create policy "Admins can insert portfolio" on public.portfolio_items
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Admins can update portfolio" on public.portfolio_items;
create policy "Admins can update portfolio" on public.portfolio_items
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete portfolio" on public.portfolio_items;
create policy "Admins can delete portfolio" on public.portfolio_items
  for delete to authenticated using (public.is_admin());

-- ---------- inspiration_designs: public read, admin write ----------
drop policy if exists "Public can view designs" on public.inspiration_designs;
create policy "Public can view designs" on public.inspiration_designs
  for select using (true);

drop policy if exists "Admins can insert designs" on public.inspiration_designs;
create policy "Admins can insert designs" on public.inspiration_designs
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Admins can update designs" on public.inspiration_designs;
create policy "Admins can update designs" on public.inspiration_designs
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete designs" on public.inspiration_designs;
create policy "Admins can delete designs" on public.inspiration_designs
  for delete to authenticated using (public.is_admin());

-- ---------- availability: public read (calendar), admin write ----------
drop policy if exists "Public can view availability" on public.availability;
create policy "Public can view availability" on public.availability
  for select using (true);

drop policy if exists "Admins can insert availability" on public.availability;
create policy "Admins can insert availability" on public.availability
  for insert to authenticated with check (public.is_admin());

drop policy if exists "Admins can update availability" on public.availability;
create policy "Admins can update availability" on public.availability
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete availability" on public.availability;
create policy "Admins can delete availability" on public.availability
  for delete to authenticated using (public.is_admin());

-- ---------- tattoo_requests: anyone can submit, only admins can read ----------
-- No client account is required, so clients never get a SELECT policy here —
-- this is what keeps one client from ever seeing another client's request.
drop policy if exists "Anyone can submit a request" on public.tattoo_requests;
create policy "Anyone can submit a request" on public.tattoo_requests
  for insert with check (true);

drop policy if exists "Admins can view requests" on public.tattoo_requests;
create policy "Admins can view requests" on public.tattoo_requests
  for select to authenticated using (public.is_admin());

drop policy if exists "Admins can update requests" on public.tattoo_requests;
create policy "Admins can update requests" on public.tattoo_requests
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete requests" on public.tattoo_requests;
create policy "Admins can delete requests" on public.tattoo_requests
  for delete to authenticated using (public.is_admin());

-- ---------- request_selected_designs: insert with the request, admin-only read ----------
drop policy if exists "Anyone can attach selected designs" on public.request_selected_designs;
create policy "Anyone can attach selected designs" on public.request_selected_designs
  for insert with check (true);

drop policy if exists "Admins can view selected designs" on public.request_selected_designs;
create policy "Admins can view selected designs" on public.request_selected_designs
  for select to authenticated using (public.is_admin());

drop policy if exists "Admins can delete selected designs" on public.request_selected_designs;
create policy "Admins can delete selected designs" on public.request_selected_designs
  for delete to authenticated using (public.is_admin());

-- ---------- request_reference_images: insert with the request, admin-only read ----------
drop policy if exists "Anyone can attach reference images" on public.request_reference_images;
create policy "Anyone can attach reference images" on public.request_reference_images
  for insert with check (true);

drop policy if exists "Admins can view reference images" on public.request_reference_images;
create policy "Admins can view reference images" on public.request_reference_images
  for select to authenticated using (public.is_admin());

drop policy if exists "Admins can delete reference images" on public.request_reference_images;
create policy "Admins can delete reference images" on public.request_reference_images
  for delete to authenticated using (public.is_admin());

-- ---------- contact_messages: anyone can submit, only admins can read ----------
drop policy if exists "Anyone can send a message" on public.contact_messages;
create policy "Anyone can send a message" on public.contact_messages
  for insert with check (true);

drop policy if exists "Admins can view messages" on public.contact_messages;
create policy "Admins can view messages" on public.contact_messages
  for select to authenticated using (public.is_admin());

drop policy if exists "Admins can update messages" on public.contact_messages;
create policy "Admins can update messages" on public.contact_messages
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- STORAGE BUCKETS
-- =============================================================================
insert into storage.buckets (id, name, public)
values
  ('portfolio-images', 'portfolio-images', true),
  ('design-gallery-images', 'design-gallery-images', true),
  ('client-reference-images', 'client-reference-images', false)
on conflict (id) do nothing;

-- ---------- portfolio-images: public read (served via public URL), admin write ----------
drop policy if exists "Public can view portfolio images" on storage.objects;
create policy "Public can view portfolio images" on storage.objects
  for select using (bucket_id = 'portfolio-images');

drop policy if exists "Admins can upload portfolio images" on storage.objects;
create policy "Admins can upload portfolio images" on storage.objects
  for insert to authenticated with check (bucket_id = 'portfolio-images' and public.is_admin());

drop policy if exists "Admins can update portfolio images" on storage.objects;
create policy "Admins can update portfolio images" on storage.objects
  for update to authenticated using (bucket_id = 'portfolio-images' and public.is_admin());

drop policy if exists "Admins can delete portfolio images" on storage.objects;
create policy "Admins can delete portfolio images" on storage.objects
  for delete to authenticated using (bucket_id = 'portfolio-images' and public.is_admin());

-- ---------- design-gallery-images: public read, admin write ----------
drop policy if exists "Public can view design images" on storage.objects;
create policy "Public can view design images" on storage.objects
  for select using (bucket_id = 'design-gallery-images');

drop policy if exists "Admins can upload design images" on storage.objects;
create policy "Admins can upload design images" on storage.objects
  for insert to authenticated with check (bucket_id = 'design-gallery-images' and public.is_admin());

drop policy if exists "Admins can update design images" on storage.objects;
create policy "Admins can update design images" on storage.objects
  for update to authenticated using (bucket_id = 'design-gallery-images' and public.is_admin());

drop policy if exists "Admins can delete design images" on storage.objects;
create policy "Admins can delete design images" on storage.objects
  for delete to authenticated using (bucket_id = 'design-gallery-images' and public.is_admin());

-- ---------- client-reference-images: PRIVATE. Anyone can upload their own   ----------
-- ---------- reference photos when submitting a request; only admins can    ----------
-- ---------- ever read them back (via signed URLs in the admin dashboard).  ----------
drop policy if exists "Anyone can upload reference images" on storage.objects;
create policy "Anyone can upload reference images" on storage.objects
  for insert with check (bucket_id = 'client-reference-images');

drop policy if exists "Admins can view reference images in storage" on storage.objects;
create policy "Admins can view reference images in storage" on storage.objects
  for select to authenticated using (bucket_id = 'client-reference-images' and public.is_admin());

drop policy if exists "Admins can delete reference images in storage" on storage.objects;
create policy "Admins can delete reference images in storage" on storage.objects
  for delete to authenticated using (bucket_id = 'client-reference-images' and public.is_admin());

-- =============================================================================
-- ADD YOUR ADMIN USER
-- =============================================================================
-- 1. In the Supabase dashboard: Authentication → Users → Add User.
--    Create Megan's login (email + password), then copy her User UID.
-- 2. Uncomment the insert below, paste her real UID and email, then run
--    just this statement.
--
-- insert into public.admin_profiles (id, full_name, email)
-- values ('00000000-0000-0000-0000-000000000000', 'Megan Klein', 'megan@velvetvesselink.com')
-- on conflict (id) do nothing;
-- =============================================================================

-- =============================================================================
-- OPTIONAL: seed a few portfolio/design rows so the site has real database
-- content immediately (otherwise the site gracefully falls back to its
-- built-in placeholder photos until you add real work in the dashboard).
-- =============================================================================
-- insert into public.portfolio_items (title, style, placement, size, price, description, image_url, featured)
-- values ('Wildflower Trailing Vine', 'Floral', 'Forearm', 'Medium', 320, 'A continuous trailing vine of wildflowers.', 'https://your-image-url.jpg', true);
