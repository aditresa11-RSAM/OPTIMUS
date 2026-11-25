const sharp = require('sharp');

async function inspectUserUpload() {
  const file = 'C:/Users/User/.gemini/antigravity/brain/bc1bd40a-d89f-426d-b5a2-e8651167bada/.user_uploaded/media_1793067217776_1f43275e.png';
  const meta = await sharp(file).metadata();
  console.log('User upload size:', meta.width, 'x', meta.height);
}

inspectUserUpload().catch(console.error);
