/**
 * placeholder-images.js
 * -----------------------------------------------------------------------
 * Centralized, curated set of free Unsplash placeholder photography used
 * throughout the site until Megan replaces them with her own work.
 *
 * HOW TO REPLACE WITH REAL PHOTOS:
 *   1. Upload the real image to Supabase Storage (see README.md).
 *   2. Copy the public URL Supabase gives you.
 *   3. Paste it in place of the matching Unsplash URL below, or — for
 *      portfolio/inspiration items — simply update the `image_url` field
 *      on that row in the database. Nothing else needs to change.
 * -----------------------------------------------------------------------
 */

function unsplash(id, w = 1600) {
  return `https://images.unsplash.com/photo-${id}?q=80&w=${w}&auto=format&fit=crop`;
}

const PLACEHOLDER_IMAGES = {
  // Hero / editorial moments
  hero: [
    unsplash('1624918959325-4ab1f51306d1', 2000),
    unsplash('1687704487660-8f4bdf39f75a', 2000),
    unsplash('1663946179345-41483ed01b41', 2000),
  ],

  // Studio & process
  studio: [
    unsplash('1501084817091-a4f3d1d19e07'),
    unsplash('1583213261205-63258746ed4c'),
    unsplash('1608666599953-b951163495f4'),
    unsplash('1479767574301-a01c78234a0c'),
    unsplash('1542744383-8c330d91f4b1'),
  ],

  // Artist / portrait (About page, home about preview)
  portrait: [
    unsplash('1650783756107-739513b38177'),
    unsplash('1616879564267-a336232e3a95'),
    unsplash('1604449325317-4967c715538a'),
    unsplash('1625053224167-22362965b56f'),
    unsplash('1671136880406-1ad617787bf5'),
    unsplash('1594070182331-51452dcd61c3'),
  ],

  // Completed tattoo work (Portfolio)
  portfolio: [
    unsplash('1568515045052-f9a854d70bfd'),
    unsplash('1605647533135-51b5906087d0'),
    unsplash('1597852075234-fd721ac361d3'),
    unsplash('1565058379802-bbe93b2f703a'),
    unsplash('1595747644932-abb68f85f419'),
    unsplash('1482375702222-03a768d5ea3c'),
    unsplash('1513078094721-e7b6e0394a6a'),
    unsplash('1598371839696-5c5bb00bdc28'),
    unsplash('1552627019-947c3789ffb5'),
    unsplash('1542727365-19732a80dcfd'),
    unsplash('1564426622559-5af68da63b96'),
    unsplash('1562962230-16e4623d36e6'),
    unsplash('1562379825-415aea84ebcf'),
    unsplash('1531951829979-d658d7e5e8a6'),
    unsplash('1488116708587-d6f24b18d8a4'),
    unsplash('1604374376934-2df6fad6519b'),
    unsplash('1586243287039-23f4c8e2e7ab'),
    unsplash('1651216829588-0d9b40ac344f'),
  ],

  // Inspiration / design gallery, grouped by theme
  floral: [
    unsplash('1607382007937-fe3a9d196b7a'),
    unsplash('1596896734952-c4c1cd2efe0f'),
    unsplash('1514470884303-0dd271e01df0'),
    unsplash('1593105293561-a4f83b74b4e1'),
    unsplash('1605594322009-69759282d5f3'),
    unsplash('1501939387519-cf9c35d4f4eb'),
    unsplash('1626215549618-f2f2aaff7d87'),
  ],
  snake: [
    unsplash('1724925188919-275f570b25fe'),
    unsplash('1571109310639-d0de25b2b61f'),
    unsplash('1618760917918-fb683f50dd8f'),
    unsplash('1635889096265-24e4efa72e42'),
    unsplash('1551494882-33f763d690ed'),
    unsplash('1640202430303-a71359ade259'),
  ],
  celestial: [
    unsplash('1490814525860-594e82bfd34a'),
    unsplash('1514897575457-c4db467cf78e'),
    unsplash('1572925077991-61acf7d70608'),
    unsplash('1562881223-9ba9b969166d'),
    unsplash('1477005264461-b0e201668d92'),
    unsplash('1570751485906-b0bbe415db74'),
  ],
  minimal: [
    unsplash('1765498173413-b428f5d0a17e'),
    unsplash('1780037756259-50472335671f'),
    unsplash('1774112473530-61db0a2f8120'),
    unsplash('1780037685072-65731807e429'),
    unsplash('1764670317877-14e8a3e10330'),
    unsplash('1780037756328-78072fbdf1fc'),
    unsplash('1780037756267-e96b91542977'),
  ],

  // St. George, Utah desert landscape (location / about)
  desert: [
    unsplash('1649113103373-ff47816ae721'),
    unsplash('1627750739839-f8b352c30f2e'),
    unsplash('1633991267862-d24fe49b95a0'),
    unsplash('1709833605648-3015db030ba7'),
    unsplash('1627936581689-51d511e520fa'),
  ],
};

// Expose globally (no build step / bundler in this project)
window.PLACEHOLDER_IMAGES = PLACEHOLDER_IMAGES;
