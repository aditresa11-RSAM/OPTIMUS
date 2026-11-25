const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

async function buildIco(sourcePngPath, outputIcoPath) {
  const sizes = [16, 24, 32, 48, 64, 128, 256];
  const pngBuffers = [];

  for (const size of sizes) {
    const buf = await sharp(sourcePngPath)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer();
    pngBuffers.push({ size, buffer: buf });
  }

  // Calculate header and offsets
  const headerSize = 6;
  const dirEntrySize = 16;
  const numImages = pngBuffers.length;
  let offset = headerSize + numImages * dirEntrySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(numImages, 4);

  const entries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(item.size === 256 ? 0 : item.size, 0); // width
    entry.writeUInt8(item.size === 256 ? 0 : item.size, 1); // height
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(item.buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    entries.push(entry);
    offset += item.buffer.length;
  }

  const finalIco = Buffer.concat([
    header,
    ...entries,
    ...pngBuffers.map(p => p.buffer)
  ]);

  fs.writeFileSync(outputIcoPath, finalIco);
  console.log(`Generated ${outputIcoPath} (${finalIco.length} bytes) with ${numImages} sizes: ${sizes.join(', ')}`);
}

async function main() {
  const src = 'scripts/extracted_favicon.png';
  const outPublic = 'public/optimus_app.ico';
  await buildIco(src, outPublic);
}

main().catch(console.error);
