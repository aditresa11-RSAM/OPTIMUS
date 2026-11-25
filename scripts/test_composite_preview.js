const sharp = require('sharp');
const path = require('path');

async function testComposite() {
  const cardWidth = 1200;
  const cardHeight = 170;

  // Background: white to emerald gradient
  const bgSvg = `
  <svg width="${cardWidth}" height="${cardHeight}">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="50%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#ecfdf5" stop-opacity="0.8" />
      </linearGradient>
    </defs>
    <rect width="${cardWidth}" height="${cardHeight}" rx="24" ry="24" fill="url(#grad)" stroke="#a7f3d0" stroke-width="1.5" />
  </svg>
  `;

  // Right side hospital bg: width 600, height 170
  const hospitalResized = await sharp('public/uploads/hospital_background_3d.png')
    .resize(600, cardHeight, { fit: 'cover', position: 'center' })
    .toBuffer();

  // Nurses resized to height ~165
  const nursesResized = await sharp('public/uploads/input_nurses_canva_popout.png')
    .resize({ height: 165, fit: 'contain' })
    .toBuffer();
  
  const nursesMeta = await sharp(nursesResized).metadata();

  const cardBase = await sharp(Buffer.from(bgSvg)).png().toBuffer();

  // Composite: hospital bg at right (left = 600), nurses at right (left = 1200 - nursesMeta.width - 40, top = cardHeight - 165)
  const compositeBuffer = await sharp(cardBase)
    .composite([
      {
        input: hospitalResized,
        top: 0,
        left: cardWidth - 600,
        blend: 'over',
      },
      {
        input: nursesResized,
        top: Math.max(0, cardHeight - nursesMeta.height),
        left: cardWidth - nursesMeta.width - 40,
        blend: 'over',
      }
    ])
    .png()
    .toFile('public/uploads/test_banner_composite_preview.png');

  console.log('Test composite saved successfully!');
}

testComposite().catch(console.error);
