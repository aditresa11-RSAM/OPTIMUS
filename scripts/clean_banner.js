const sharp = require('sharp');
const fs = require('fs');

async function cleanBanner() {
  const inputPath = 'C:/Users/User/.gemini/antigravity/brain/bc1bd40a-d89f-426d-b5a2-e8651167bada/.user_uploaded/media_1793063763616_bc10998b.png';
  const img = sharp(inputPath);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const channels = info.channels;

  // We want to make the exterior background transparent.
  // Let's use a Breadth-First-Search (BFS) flood fill starting from the outer boundary pixels:
  // (0,0), (w-1, 0), (0, h-1), (w-1, h-1), and along the top/left/right/bottom border where it's near-white/gray.

  const visited = new Uint8Array(w * h);
  const queue = [];

  function isBackgroundPixel(x, y) {
    const idx = (y * w + x) * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    // Background is near white / light gray (r > 248, g > 248, b > 248)
    // Card border has green tint or darker color (e.g. emerald border r < 235 or g < 245 or blue tint)
    // Popout characters at top have dark hair / green hijab (r < 230, g < 230, b < 230)
    return (r >= 246 && g >= 246 && b >= 246);
  }

  // Seed boundary points
  for (let x = 0; x < w; x++) {
    if (isBackgroundPixel(x, 0)) {
      visited[0 * w + x] = 1;
      queue.push([x, 0]);
    }
    if (isBackgroundPixel(x, h - 1)) {
      visited[(h - 1) * w + x] = 1;
      queue.push([x, h - 1]);
    }
  }

  for (let y = 0; y < h; y++) {
    if (isBackgroundPixel(0, y)) {
      visited[y * w + 0] = 1;
      queue.push([0, y]);
    }
    if (isBackgroundPixel(w - 1, y)) {
      visited[y * w + (w - 1)] = 1;
      queue.push([w - 1, y]);
    }
  }

  // BFS
  let head = 0;
  const dx = [1, -1, 0, 0];
  const dy = [0, 0, 1, -1];

  while (head < queue.length) {
    const [cx, cy] = queue[head++];
    for (let i = 0; i < 4; i++) {
      const nx = cx + dx[i];
      const ny = cy + dy[i];
      if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
        const npos = ny * w + nx;
        if (!visited[npos] && isBackgroundPixel(nx, ny)) {
          visited[npos] = 1;
          queue.push([nx, ny]);
        }
      }
    }
  }

  console.log(`Flood-filled ${queue.length} background pixels out of ${w * h}`);

  // Apply alpha = 0 to all flood-filled pixels
  // Also apply soft anti-aliasing edge: pixels within 1px of boundary can have feathered alpha
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const pos = y * w + x;
      if (visited[pos]) {
        const idx = pos * channels;
        data[idx + 3] = 0; // fully transparent
      }
    }
  }

  // Save the cleaned transparent banner
  const outputPath = 'public/uploads/input_data_card_banner.png';
  await sharp(data, { raw: { width: w, height: h, channels } })
    .png()
    .toFile(outputPath);

  console.log(`Saved transparent banner to ${outputPath}`);
}

cleanBanner().catch(console.error);
