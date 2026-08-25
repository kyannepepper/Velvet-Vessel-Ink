/**
 * portfolio-data.js — placeholder "completed work" gallery.
 * Used automatically until Supabase is connected (see supabase-client.js),
 * and as seed content you can copy into the `portfolio_items` table.
 * Replace `image` with a Supabase Storage URL once real photos are uploaded.
 */

function buildPortfolioPlaceholders() {
  const img = window.PLACEHOLDER_IMAGES?.portfolio || [];
  return [
    {
      id: 'p1', title: 'Wildflower Trailing Vine', style: 'Floral', placement: 'Forearm',
      size: 'Medium', price: 320, featured: true, image_url: img[7],
      description: 'A continuous trailing vine of wildflowers and delicate leaves, fine-lined and shaded softly to wrap the forearm without ever feeling heavy.',
    },
    {
      id: 'p2', title: 'Quiet Portrait Study', style: 'Realism', placement: 'Upper Arm',
      size: 'Large', price: 620, featured: true, image_url: img[12],
      description: 'A soft black & gray realism portrait built in layers over several sessions, focused on light, shadow, and quiet expression.',
    },
    {
      id: 'p3', title: 'Single Line Rose', style: 'Fine Line', placement: 'Wrist',
      size: 'Small', price: 150, featured: true, image_url: img[1],
      description: 'A minimal single-line rose kept intentionally small and quiet — a piece meant to be noticed only up close.',
    },
    {
      id: 'p4', title: 'Whispered Script', style: 'Lettering', placement: 'Ribs',
      size: 'Small', price: 180, featured: false, image_url: img[9],
      description: 'A custom hand-lettered phrase in a delicate serif script, placed along the ribs for a piece that feels personal and private.',
    },
    {
      id: 'p5', title: 'Moth & Botanical Study', style: 'Black & Gray', placement: 'Shoulder',
      size: 'Medium', price: 380, featured: true, image_url: img[5],
      description: 'An illustrative black & gray moth resting among botanical linework, rendered with soft dot-shading for depth.',
    },
    {
      id: 'p6', title: 'Behind-the-Ear Crescent', style: 'Fine Line', placement: 'Behind the Ear',
      size: 'Small', price: 120, featured: false, image_url: img[11],
      description: 'A tiny crescent moon tucked behind the ear — one of the most requested "first tattoo" placements in the studio.',
    },
    {
      id: 'p7', title: 'Layered Floral Sleeve (In Progress)', style: 'Floral', placement: 'Upper Arm',
      size: 'Large', price: 680, featured: true, image_url: img[3],
      description: 'An ongoing large-scale floral half-sleeve built session by session, layering peonies, ranunculus, and fine botanical linework.',
    },
    {
      id: 'p8', title: 'Fine Line Portrait Sketch', style: 'Fine Line', placement: 'Forearm',
      size: 'Medium', price: 340, featured: false, image_url: img[13],
      description: 'A sketch-style fine line portrait with intentionally loose, expressive linework rather than tight photorealism.',
    },
    {
      id: 'p9', title: 'Botanical Leg Piece', style: 'Botanical', placement: 'Calf',
      size: 'Large', price: 540, featured: false, image_url: img[14],
      description: 'A large-scale botanical illustration wrapping the calf, composed from pressed-flower reference and layered shading.',
    },
    {
      id: 'p10', title: 'Delicate Grayswash Bouquet', style: 'Black & Gray', placement: 'Forearm',
      size: 'Medium', price: 300, featured: false, image_url: img[10],
      description: 'A soft grayswash floral bouquet, keeping contrast low and the mood quiet and romantic.',
    },
    {
      id: 'p11', title: 'Cover-Up Transformation', style: 'Black & Gray', placement: 'Upper Arm',
      size: 'Large', price: 590, featured: false, image_url: img[2],
      description: 'A full cover-up rebuilding an older piece into a cohesive black & gray design — a specialty Megan takes real care with.',
    },
    {
      id: 'p12', title: 'Studio Session Detail', style: 'Realism', placement: 'Back',
      size: 'Large', price: 700, featured: false, image_url: img[16],
      description: 'Detail shot from an ongoing large-scale back piece, worked in fine layers of black & gray realism.',
    },
    {
      id: 'p13', title: 'Micro Lettering Duo', style: 'Lettering', placement: 'Ankle',
      size: 'Small', price: 130, featured: false, image_url: img[8],
      description: 'Two tiny matching words in a delicate serif, a popular sibling / memorial piece.',
    },
    {
      id: 'p14', title: 'Grayscale Floral Detail', style: 'Floral', placement: 'Hand',
      size: 'Small', price: 190, featured: false, image_url: img[6],
      description: 'A detailed single-stem floral piece on the hand — bold placement, soft and quiet linework.',
    },
  ];
}

window.PORTFOLIO_PLACEHOLDER_DATA = buildPortfolioPlaceholders();
