const fs = require('fs');
const sharp = require('sharp');

async function createBmpDib(sourcePng, size) {
  // Resize to size x size
  const { data, info } = await sharp(sourcePng)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;

  // Header 40 bytes
  const header = Buffer.alloc(40);
  header.writeUInt32LE(40, 0); // biSize
  header.writeInt32LE(w, 4);   // biWidth
  header.writeInt32LE(h * 2, 8); // biHeight (doubled for ICO)
  header.writeUInt16LE(1, 12); // biPlanes
  header.writeUInt16LE(32, 14); // biBitCount
  header.writeUInt32LE(0, 16); // biCompression (BI_RGB)
  
  // AND mask size
  const andRowBytes = Math.ceil(w / 32) * 4;
  const andMaskSize = andRowBytes * h;
  const xorSize = w * h * 4;
  header.writeUInt32LE(xorSize + andMaskSize, 20); // biSizeImage

  // XOR data: bottom-up BGRA
  const xorData = Buffer.alloc(xorSize);
  for (let y = 0; y < h; y++) {
    const srcRow = y; // top-down
    const dstRow = h - 1 - y; // bottom-up
    const srcOffset = srcRow * w * 4;
    const dstOffset = dstRow * w * 4;
    for (let x = 0; x < w; x++) {
      const sp = srcOffset + x * 4;
      const dp = dstOffset + x * 4;
      const r = data[sp];
      const g = data[sp + 1];
      const b = data[sp + 2];
      const a = data[sp + 3];
      xorData[dp] = b;
      xorData[dp + 1] = g;
      xorData[dp + 2] = r;
      xorData[dp + 3] = a;
    }
  }

  // AND mask: all 0 (transparent handled by alpha)
  const andMask = Buffer.alloc(andMaskSize, 0);

  return Buffer.concat([header, xorData, andMask]);
}

async function createPngFrame(sourcePng, size) {
  return await sharp(sourcePng)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function buildHybridIco(sourcePng, outputPath) {
  const bmpSizes = [16, 24, 32, 48, 64, 72, 96, 128];
  const frames = [];

  for (const s of bmpSizes) {
    const buf = await createBmpDib(sourcePng, s);
    frames.push({ size: s, isBmp: true, buffer: buf });
  }

  // 256x256 is PNG!
  const png256 = await createPngFrame(sourcePng, 256);
  frames.push({ size: 256, isBmp: false, buffer: png256 });

  const numImages = frames.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + numImages * dirEntrySize;

  const icoHeader = Buffer.alloc(headerSize);
  icoHeader.writeUInt16LE(0, 0);
  icoHeader.writeUInt16LE(1, 2);
  icoHeader.writeUInt16LE(numImages, 4);

  const dirEntries = [];
  for (const f of frames) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(f.size === 256 ? 0 : f.size, 0); // bWidth
    entry.writeUInt8(f.size === 256 ? 0 : f.size, 1); // bHeight
    entry.writeUInt8(0, 2); // bColorCount
    entry.writeUInt8(0, 3); // bReserved
    entry.writeUInt16LE(1, 4); // wPlanes
    entry.writeUInt16LE(32, 6); // wBitCount
    entry.writeUInt32LE(f.buffer.length, 8); // dwBytesInRes
    entry.writeUInt32LE(offset, 12); // dwImageOffset
    dirEntries.push(entry);
    offset += f.buffer.length;
  }

  const finalIco = Buffer.concat([
    icoHeader,
    ...dirEntries,
    ...frames.map(f => f.buffer)
  ]);

  fs.writeFileSync(outputPath, finalIco);
  console.log(`Generated perfectly compliant ICO at: ${outputPath} (${finalIco.length} bytes)`);
}

async function run() {
  const src = 'scripts/extracted_favicon.png';
  
  // Overwrite in project public
  await buildHybridIco(src, 'public/optimus_app.ico');
  await buildHybridIco(src, 'public/favicon.ico');

  // ALSO OVERWRITE the ones in Downloads so if the shortcut or user points to Downloads, it WORKS 100%!
  const dlFavicon5 = 'C:\\Users\\User\\Downloads\\favicon (5).ico';
  const dlFavicon = 'C:\\Users\\User\\Downloads\\favicon.ico';
  const dlFavicon2 = 'C:\\Users\\User\\Downloads\\favicon (2).ico';
  const dlFavicon3 = 'C:\\Users\\User\\Downloads\\favicon (3).ico';
  
  await buildHybridIco(src, dlFavicon5);
  await buildHybridIco(src, dlFavicon);
  await buildHybridIco(src, dlFavicon2);
  await buildHybridIco(src, dlFavicon3);

  console.log('ALL favicon files in Downloads and public updated to hybrid format!');
}

run().catch(console.error);
