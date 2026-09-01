-- =============================================================================
-- VELVET VESSEL INK — Seed data
-- =============================================================================
-- Populates portfolio_items and inspiration_designs with the site's current
-- placeholder content (same rows the site shows locally), so the live
-- Supabase-backed site has real data to read instead of an empty table.
-- Paste this into the Supabase SQL Editor (Project -> SQL Editor -> New query)
-- and run it once, after sql/setup.sql has already been run.
--
-- Images are still the temporary Unsplash placeholders from
-- js/placeholder-images.js — swap image_url values for real photos in
-- Supabase Storage whenever Megan has them ready.
-- =============================================================================

insert into public.portfolio_items
  (title, style, placement, size, price, description, image_url, featured, sort_order)
values
  ('Wildflower Trailing Vine', 'Floral', 'Forearm', 'Medium', 320, 'A continuous trailing vine of wildflowers and delicate leaves, fine-lined and shaded softly to wrap the forearm without ever feeling heavy.', 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?q=80&w=1600&auto=format&fit=crop', true, 0),
  ('Quiet Portrait Study', 'Realism', 'Upper Arm', 'Large', 620, 'A soft black & gray realism portrait built in layers over several sessions, focused on light, shadow, and quiet expression.', 'https://images.unsplash.com/photo-1562379825-415aea84ebcf?q=80&w=1600&auto=format&fit=crop', true, 1),
  ('Single Line Rose', 'Fine Line', 'Wrist', 'Small', 150, 'A minimal single-line rose kept intentionally small and quiet — a piece meant to be noticed only up close.', 'https://images.unsplash.com/photo-1605647533135-51b5906087d0?q=80&w=1600&auto=format&fit=crop', true, 2),
  ('Whispered Script', 'Lettering', 'Ribs', 'Small', 180, 'A custom hand-lettered phrase in a delicate serif script, placed along the ribs for a piece that feels personal and private.', 'https://images.unsplash.com/photo-1542727365-19732a80dcfd?q=80&w=1600&auto=format&fit=crop', false, 3),
  ('Moth & Botanical Study', 'Black & Gray', 'Shoulder', 'Medium', 380, 'An illustrative black & gray moth resting among botanical linework, rendered with soft dot-shading for depth.', 'https://images.unsplash.com/photo-1482375702222-03a768d5ea3c?q=80&w=1600&auto=format&fit=crop', true, 4),
  ('Behind-the-Ear Crescent', 'Fine Line', 'Behind the Ear', 'Small', 120, 'A tiny crescent moon tucked behind the ear — one of the most requested "first tattoo" placements in the studio.', 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?q=80&w=1600&auto=format&fit=crop', false, 5),
  ('Layered Floral Sleeve (In Progress)', 'Floral', 'Upper Arm', 'Large', 680, 'An ongoing large-scale floral half-sleeve built session by session, layering peonies, ranunculus, and fine botanical linework.', 'https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?q=80&w=1600&auto=format&fit=crop', true, 6),
  ('Fine Line Portrait Sketch', 'Fine Line', 'Forearm', 'Medium', 340, 'A sketch-style fine line portrait with intentionally loose, expressive linework rather than tight photorealism.', 'https://images.unsplash.com/photo-1531951829979-d658d7e5e8a6?q=80&w=1600&auto=format&fit=crop', false, 7),
  ('Botanical Leg Piece', 'Botanical', 'Calf', 'Large', 540, 'A large-scale botanical illustration wrapping the calf, composed from pressed-flower reference and layered shading.', 'https://images.unsplash.com/photo-1488116708587-d6f24b18d8a4?q=80&w=1600&auto=format&fit=crop', false, 8),
  ('Delicate Grayswash Bouquet', 'Black & Gray', 'Forearm', 'Medium', 300, 'A soft grayswash floral bouquet, keeping contrast low and the mood quiet and romantic.', 'https://images.unsplash.com/photo-1564426622559-5af68da63b96?q=80&w=1600&auto=format&fit=crop', false, 9),
  ('Cover-Up Transformation', 'Black & Gray', 'Upper Arm', 'Large', 590, 'A full cover-up rebuilding an older piece into a cohesive black & gray design — a specialty Megan takes real care with.', 'https://images.unsplash.com/photo-1597852075234-fd721ac361d3?q=80&w=1600&auto=format&fit=crop', false, 10),
  ('Studio Session Detail', 'Realism', 'Back', 'Large', 700, 'Detail shot from an ongoing large-scale back piece, worked in fine layers of black & gray realism.', 'https://images.unsplash.com/photo-1586243287039-23f4c8e2e7ab?q=80&w=1600&auto=format&fit=crop', false, 11),
  ('Micro Lettering Duo', 'Lettering', 'Ankle', 'Small', 130, 'Two tiny matching words in a delicate serif, a popular sibling / memorial piece.', 'https://images.unsplash.com/photo-1552627019-947c3789ffb5?q=80&w=1600&auto=format&fit=crop', false, 12),
  ('Grayscale Floral Detail', 'Floral', 'Hand', 'Small', 190, 'A detailed single-stem floral piece on the hand — bold placement, soft and quiet linework.', 'https://images.unsplash.com/photo-1513078094721-e7b6e0394a6a?q=80&w=1600&auto=format&fit=crop', false, 13);

insert into public.inspiration_designs
  (name, category, style, suggested_placement, suggested_size, price_min, price_max, description, image_url, sort_order)
values
  ('Trailing Wildflower', 'Flowers', 'Floral', 'Forearm or Ribs', 'Medium', 220, 380, 'A loose, trailing bundle of wildflowers that can wrap naturally around the arm, ribs, or thigh.', 'https://images.unsplash.com/photo-1607382007937-fe3a9d196b7a?q=80&w=1600&auto=format&fit=crop', 0),
  ('Single Iris Study', 'Flowers', 'Botanical', 'Wrist or Ankle', 'Small', 120, 200, 'A single detailed iris bloom, quiet and small, with soft fine-line petal detail.', 'https://images.unsplash.com/photo-1596896734952-c4c1cd2efe0f?q=80&w=1600&auto=format&fit=crop', 1),
  ('Rose & Thorn Vine', 'Flowers', 'Fine Line', 'Upper Arm', 'Medium', 240, 400, 'A classic rose with a thorned stem, rendered as a continuous fine line composition.', 'https://images.unsplash.com/photo-1514470884303-0dd271e01df0?q=80&w=1600&auto=format&fit=crop', 2),
  ('Pressed Botanical Set', 'Botanical Designs', 'Botanical', 'Forearm', 'Medium', 260, 420, 'Inspired by pressed-flower herbariums — a scattered, scientific-feeling botanical arrangement.', 'https://images.unsplash.com/photo-1593105293561-a4f83b74b4e1?q=80&w=1600&auto=format&fit=crop', 3),
  ('Peony Bouquet', 'Flowers', 'Floral', 'Shoulder or Thigh', 'Large', 420, 650, 'A fuller, layered peony bouquet built for larger placements with soft black & gray shading.', 'https://images.unsplash.com/photo-1605594322009-69759282d5f3?q=80&w=1600&auto=format&fit=crop', 4),
  ('Solomon''s Seal Branch', 'Botanical Designs', 'Fine Line', 'Spine or Forearm', 'Medium', 220, 360, 'A delicate flowering branch that suits long, narrow placements beautifully.', 'https://images.unsplash.com/photo-1501939387519-cf9c35d4f4eb?q=80&w=1600&auto=format&fit=crop', 5),
  ('William Morris Botanical', 'Botanical Designs', 'Ornamental', 'Calf or Back', 'Large', 450, 700, 'A dense, pattern-based botanical composition inspired by classic textile print design.', 'https://images.unsplash.com/photo-1626215549618-f2f2aaff7d87?q=80&w=1600&auto=format&fit=crop', 6),
  ('Coiled Serpent', 'Snakes', 'Illustrative', 'Forearm', 'Medium', 260, 420, 'A traditionally-inspired coiled snake with bold, graphic scale detail.', 'https://images.unsplash.com/photo-1724925188919-275f570b25fe?q=80&w=1600&auto=format&fit=crop', 7),
  ('Vintage Naturalist Snake', 'Snakes', 'Black & Gray', 'Upper Arm', 'Large', 380, 600, 'Inspired by antique naturalist illustration plates — fine stippled scale texture, quietly scientific.', 'https://images.unsplash.com/photo-1571109310639-d0de25b2b61f?q=80&w=1600&auto=format&fit=crop', 8),
  ('Minimal Serpent Line', 'Snakes', 'Fine Line', 'Ribs or Ankle', 'Small', 140, 220, 'A single-line, minimal serpent that curls neatly around the wrist or ankle.', 'https://images.unsplash.com/photo-1618760917918-fb683f50dd8f?q=80&w=1600&auto=format&fit=crop', 9),
  ('Striped Garter Study', 'Snakes', 'Realism', 'Calf', 'Medium', 300, 460, 'A more realistic, textured snake study built with fine cross-hatched shading.', 'https://images.unsplash.com/photo-1635889096265-24e4efa72e42?q=80&w=1600&auto=format&fit=crop', 10),
  ('Crescent & Stars', 'Moon/Stars', 'Fine Line', 'Behind the Ear or Wrist', 'Small', 110, 180, 'A tiny crescent moon with a scatter of stars — one of the most popular first-tattoo placements.', 'https://images.unsplash.com/photo-1477005264461-b0e201668d92?q=80&w=1600&auto=format&fit=crop', 11),
  ('Desert Moonrise', 'Moon/Stars', 'Illustrative', 'Forearm', 'Medium', 240, 400, 'A full moon rising over a desert horizon line — a nod to St. George''s own landscape.', 'https://images.unsplash.com/photo-1570751485906-b0bbe415db74?q=80&w=1600&auto=format&fit=crop', 12),
  ('Storm Moon', 'Moon/Stars', 'Black & Gray', 'Upper Arm', 'Medium', 260, 420, 'A moody, cloud-wrapped full moon in soft black & gray realism shading.', 'https://images.unsplash.com/photo-1514897575457-c4db467cf78e?q=80&w=1600&auto=format&fit=crop', 13),
  ('Scattered Constellation', 'Moon/Stars', 'Fine Line', 'Collarbone or Ribs', 'Small', 130, 210, 'A custom constellation piece, easily personalized to a meaningful date or star chart.', 'https://images.unsplash.com/photo-1572925077991-61acf7d70608?q=80&w=1600&auto=format&fit=crop', 14),
  ('Continuous Line Portrait', 'Custom Concepts', 'Fine Line', 'Forearm', 'Medium', 260, 420, 'An expressive, single-line portrait sketch — great for turning a favorite photo into linework.', 'https://images.unsplash.com/photo-1780037756259-50472335671f?q=80&w=1600&auto=format&fit=crop', 15),
  ('Minimalist Gesture Sketch', 'Minimalist Designs', 'Minimalist', 'Wrist or Forearm', 'Small', 120, 190, 'A loose, minimal gestural sketch — quiet, modern, and intentionally imperfect.', 'https://images.unsplash.com/photo-1774112473530-61db0a2f8120?q=80&w=1600&auto=format&fit=crop', 16),
  ('Abstract Ink Face Study', 'Custom Concepts', 'Illustrative', 'Upper Arm', 'Medium', 280, 440, 'An abstract ink-wash style face study, great as a base for a larger custom concept.', 'https://images.unsplash.com/photo-1780037756328-78072fbdf1fc?q=80&w=1600&auto=format&fit=crop', 17),
  ('Seated Figure Line Study', 'Minimalist Designs', 'Fine Line', 'Ribs or Thigh', 'Small', 140, 220, 'A quiet, minimal seated figure rendered in a single continuous line.', 'https://images.unsplash.com/photo-1780037685072-65731807e429?q=80&w=1600&auto=format&fit=crop', 18),
  ('Companion Line Sketch', 'Animals', 'Minimalist', 'Ankle or Wrist', 'Small', 130, 210, 'A minimal line-drawn companion animal sketch — easily customized to your own pet.', 'https://images.unsplash.com/photo-1780037756267-e96b91542977?q=80&w=1600&auto=format&fit=crop', 19);
