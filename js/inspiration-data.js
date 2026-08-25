/**
 * inspiration-data.js — placeholder "design gallery" clients can pick from.
 * Distinct from portfolio-data.js (which is Megan's completed work).
 * Used automatically until Supabase is connected, and doubles as seed
 * content you can copy into the `inspiration_designs` table.
 */

function buildInspirationPlaceholders() {
  const floral = window.PLACEHOLDER_IMAGES?.floral || [];
  const snake = window.PLACEHOLDER_IMAGES?.snake || [];
  const celestial = window.PLACEHOLDER_IMAGES?.celestial || [];
  const minimal = window.PLACEHOLDER_IMAGES?.minimal || [];

  return [
    { id: 'd1', name: 'Trailing Wildflower', category: 'Flowers', style: 'Floral', suggested_placement: 'Forearm or Ribs', suggested_size: 'Medium', price_min: 220, price_max: 380, image_url: floral[0], description: 'A loose, trailing bundle of wildflowers that can wrap naturally around the arm, ribs, or thigh.' },
    { id: 'd2', name: 'Single Iris Study', category: 'Flowers', style: 'Botanical', suggested_placement: 'Wrist or Ankle', suggested_size: 'Small', price_min: 120, price_max: 200, image_url: floral[1], description: 'A single detailed iris bloom, quiet and small, with soft fine-line petal detail.' },
    { id: 'd3', name: 'Rose & Thorn Vine', category: 'Flowers', style: 'Fine Line', suggested_placement: 'Upper Arm', suggested_size: 'Medium', price_min: 240, price_max: 400, image_url: floral[2], description: 'A classic rose with a thorned stem, rendered as a continuous fine line composition.' },
    { id: 'd4', name: 'Pressed Botanical Set', category: 'Botanical Designs', style: 'Botanical', suggested_placement: 'Forearm', suggested_size: 'Medium', price_min: 260, price_max: 420, image_url: floral[3], description: 'Inspired by pressed-flower herbariums — a scattered, scientific-feeling botanical arrangement.' },
    { id: 'd5', name: 'Peony Bouquet', category: 'Flowers', style: 'Floral', suggested_placement: 'Shoulder or Thigh', suggested_size: 'Large', price_min: 420, price_max: 650, image_url: floral[4], description: 'A fuller, layered peony bouquet built for larger placements with soft black & gray shading.' },
    { id: 'd6', name: 'Solomon\'s Seal Branch', category: 'Botanical Designs', style: 'Fine Line', suggested_placement: 'Spine or Forearm', suggested_size: 'Medium', price_min: 220, price_max: 360, image_url: floral[5], description: 'A delicate flowering branch that suits long, narrow placements beautifully.' },
    { id: 'd7', name: 'William Morris Botanical', category: 'Botanical Designs', style: 'Ornamental', suggested_placement: 'Calf or Back', suggested_size: 'Large', price_min: 450, price_max: 700, image_url: floral[6], description: 'A dense, pattern-based botanical composition inspired by classic textile print design.' },

    { id: 'd8', name: 'Coiled Serpent', category: 'Snakes', style: 'Illustrative', suggested_placement: 'Forearm', suggested_size: 'Medium', price_min: 260, price_max: 420, image_url: snake[0], description: 'A traditionally-inspired coiled snake with bold, graphic scale detail.' },
    { id: 'd9', name: 'Vintage Naturalist Snake', category: 'Snakes', style: 'Black & Gray', suggested_placement: 'Upper Arm', suggested_size: 'Large', price_min: 380, price_max: 600, image_url: snake[1], description: 'Inspired by antique naturalist illustration plates — fine stippled scale texture, quietly scientific.' },
    { id: 'd10', name: 'Minimal Serpent Line', category: 'Snakes', style: 'Fine Line', suggested_placement: 'Ribs or Ankle', suggested_size: 'Small', price_min: 140, price_max: 220, image_url: snake[2], description: 'A single-line, minimal serpent that curls neatly around the wrist or ankle.' },
    { id: 'd11', name: 'Striped Garter Study', category: 'Snakes', style: 'Realism', suggested_placement: 'Calf', suggested_size: 'Medium', price_min: 300, price_max: 460, image_url: snake[3], description: 'A more realistic, textured snake study built with fine cross-hatched shading.' },

    { id: 'd12', name: 'Crescent & Stars', category: 'Moon/Stars', style: 'Fine Line', suggested_placement: 'Behind the Ear or Wrist', suggested_size: 'Small', price_min: 110, price_max: 180, image_url: celestial[4], description: 'A tiny crescent moon with a scatter of stars — one of the most popular first-tattoo placements.' },
    { id: 'd13', name: 'Desert Moonrise', category: 'Moon/Stars', style: 'Illustrative', suggested_placement: 'Forearm', suggested_size: 'Medium', price_min: 240, price_max: 400, image_url: celestial[5], description: 'A full moon rising over a desert horizon line — a nod to St. George\'s own landscape.' },
    { id: 'd14', name: 'Storm Moon', category: 'Moon/Stars', style: 'Black & Gray', suggested_placement: 'Upper Arm', suggested_size: 'Medium', price_min: 260, price_max: 420, image_url: celestial[1], description: 'A moody, cloud-wrapped full moon in soft black & gray realism shading.' },
    { id: 'd15', name: 'Scattered Constellation', category: 'Moon/Stars', style: 'Fine Line', suggested_placement: 'Collarbone or Ribs', suggested_size: 'Small', price_min: 130, price_max: 210, image_url: celestial[2], description: 'A custom constellation piece, easily personalized to a meaningful date or star chart.' },

    { id: 'd16', name: 'Continuous Line Portrait', category: 'Custom Concepts', style: 'Fine Line', suggested_placement: 'Forearm', suggested_size: 'Medium', price_min: 260, price_max: 420, image_url: minimal[1], description: 'An expressive, single-line portrait sketch — great for turning a favorite photo into linework.' },
    { id: 'd17', name: 'Minimalist Gesture Sketch', category: 'Minimalist Designs', style: 'Minimalist', suggested_placement: 'Wrist or Forearm', suggested_size: 'Small', price_min: 120, price_max: 190, image_url: minimal[2], description: 'A loose, minimal gestural sketch — quiet, modern, and intentionally imperfect.' },
    { id: 'd18', name: 'Abstract Ink Face Study', category: 'Custom Concepts', style: 'Illustrative', suggested_placement: 'Upper Arm', suggested_size: 'Medium', price_min: 280, price_max: 440, image_url: minimal[5], description: 'An abstract ink-wash style face study, great as a base for a larger custom concept.' },
    { id: 'd19', name: 'Seated Figure Line Study', category: 'Minimalist Designs', style: 'Fine Line', suggested_placement: 'Ribs or Thigh', suggested_size: 'Small', price_min: 140, price_max: 220, image_url: minimal[3], description: 'A quiet, minimal seated figure rendered in a single continuous line.' },
    { id: 'd20', name: 'Companion Line Sketch', category: 'Animals', style: 'Minimalist', suggested_placement: 'Ankle or Wrist', suggested_size: 'Small', price_min: 130, price_max: 210, image_url: minimal[6], description: 'A minimal line-drawn companion animal sketch — easily customized to your own pet.' },
  ];
}

window.INSPIRATION_PLACEHOLDER_DATA = buildInspirationPlaceholders();
window.INSPIRATION_CATEGORIES = [
  'Flowers', 'Butterflies', 'Snakes', 'Botanical Designs', 'Moon/Stars',
  'Animals', 'Script', 'Minimalist Designs', 'Custom Concepts',
];
