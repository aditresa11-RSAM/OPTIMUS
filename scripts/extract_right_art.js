const sharp = require('sharp');

async function extractRightArt() {
  const src = 'C:/Users/User/.gemini/antigravity/brain/bc1bd40a-d89f-426d-b5a2-e8651167bada/.user_uploaded/media_1793063763616_bc10998b.png';
  const meta = await sharp(src).metadata();
  console.log('Original size:', meta.width, meta.height);

  // Let's extract from x=450 to 1024 (width = 574), y=0 to 261
  // Inside the card, the card boundary is y=31 to y=260.
  // Let's see what happens if we crop y from 0 to 261 vs 31 to 261
  await sharp(src)
    .extract({ left: 450, top: 0, width: 1024 - 450, height: 261 })
    .toFile('public/uploads/right_art_full.png');

  await sharp(src)
    .extract({ left: 450, top: 31, width: 1024 - 450, height: 230 })
    .toFile('public/uploads/right_art_inside_card.png');

  console.log('Extracted right_art_full and right_art_inside_card');
}

extractRightArt().catch(console.error);
