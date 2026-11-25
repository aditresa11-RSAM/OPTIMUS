const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { execSync } = require('child_process');

async function createBmpDib(sourcePng, size) {
  const { data, info } = await sharp(sourcePng)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;

  const header = Buffer.alloc(40);
  header.writeUInt32LE(40, 0); // biSize
  header.writeInt32LE(w, 4);   // biWidth
  header.writeInt32LE(h * 2, 8); // biHeight (doubled for ICO XOR+AND)
  header.writeUInt16LE(1, 12); // biPlanes
  header.writeUInt16LE(32, 14); // biBitCount
  header.writeUInt32LE(0, 16); // biCompression (BI_RGB)
  
  const andRowBytes = Math.ceil(w / 32) * 4;
  const andMaskSize = andRowBytes * h;
  const xorSize = w * h * 4;
  header.writeUInt32LE(xorSize + andMaskSize, 20); // biSizeImage

  const xorData = Buffer.alloc(xorSize);
  for (let y = 0; y < h; y++) {
    const srcRow = y;
    const dstRow = h - 1 - y;
    const srcOffset = srcRow * w * 4;
    const dstOffset = dstRow * w * 4;
    for (let x = 0; x < w; x++) {
      const sp = srcOffset + x * 4;
      const dp = dstOffset + x * 4;
      xorData[dp] = data[sp + 2];     // B
      xorData[dp + 1] = data[sp + 1]; // G
      xorData[dp + 2] = data[sp];     // R
      xorData[dp + 3] = data[sp + 3]; // A
    }
  }

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
    frames.push({ size: s, buffer: buf });
  }

  const png256 = await createPngFrame(sourcePng, 256);
  frames.push({ size: 256, buffer: png256 });

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
    entry.writeUInt8(f.size === 256 ? 0 : f.size, 0);
    entry.writeUInt8(f.size === 256 ? 0 : f.size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(f.buffer.length, 8);
    entry.writeUInt32LE(offset, 12);
    dirEntries.push(entry);
    offset += f.buffer.length;
  }

  const finalIco = Buffer.concat([
    icoHeader,
    ...dirEntries,
    ...frames.map(f => f.buffer)
  ]);

  fs.writeFileSync(outputPath, finalIco);
  console.log(`Saved ICO: ${outputPath} (${finalIco.length} bytes)`);
}

async function main() {
  const src = 'C:\\Users\\User\\Downloads\\LOGO_2-removebg-preview.png';
  const outPublic = 'public/optimus_app.ico';
  const outFavicon = 'public/favicon.ico';
  const outDlLogo = 'C:\\Users\\User\\Downloads\\LOGO OPTIMUS.ico';
  const outDlFav5 = 'C:\\Users\\User\\Downloads\\favicon (5).ico';

  await buildHybridIco(src, outPublic);
  await buildHybridIco(src, outFavicon);
  await buildHybridIco(src, outDlLogo);
  await buildHybridIco(src, outDlFav5);

  console.log('Icons generated successfully.');

  // Create shortcuts using VBScript
  const targetBat = 'C:\\Users\\User\\OneDrive\\Documents\\INOVASI OPTIMUS\\OPTIMUS\\run-optimus.bat';
  const workingDir = 'C:\\Users\\User\\OneDrive\\Documents\\INOVASI OPTIMUS\\OPTIMUS';
  const icoPath = path.resolve(outPublic);

  const desktopDirs = [
    'C:\\Users\\User\\OneDrive\\Desktop',
    'C:\\Users\\User\\Desktop'
  ];

  desktopDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const lnkPath = path.join(dir, 'OPTIMUS.lnk');
      const vbs = `
Set wsh = CreateObject("WScript.Shell")
Set sc = wsh.CreateShortcut("${lnkPath.replace(/\\/g, '\\\\')}")
sc.TargetPath = "${targetBat.replace(/\\/g, '\\\\')}"
sc.WorkingDirectory = "${workingDir.replace(/\\/g, '\\\\')}"
sc.IconLocation = "${icoPath.replace(/\\/g, '\\\\')},0"
sc.Description = "OPTIMUS - RSUD Al-Mulk Sukabumi"
sc.WindowStyle = 1
sc.Save
`;
      const vbsFile = path.join(__dirname, 'make_lnk.vbs');
      fs.writeFileSync(vbsFile, vbs, 'utf8');
      try {
        execSync(`cscript //Nologo "${vbsFile}"`);
        console.log('Successfully created shortcut:', lnkPath);
      } catch (err) {
        console.error('Error creating shortcut at', lnkPath, err);
      } finally {
        if (fs.existsSync(vbsFile)) fs.unlinkSync(vbsFile);
      }
    }
  });

  // Call SHChangeNotify
  const notifyPs = `
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class ShellHelper {
    [DllImport("shell32.dll")]
    public static extern void SHChangeNotify(int wEventId, uint uFlags, IntPtr dwItem1, IntPtr dwItem2);
}
"@
[ShellHelper]::SHChangeNotify(0x08000000, 0, [IntPtr]::Zero, [IntPtr]::Zero)
Write-Output "Windows shell association change notified."
`;
  const psFile = path.join(__dirname, 'notify.ps1');
  fs.writeFileSync(psFile, notifyPs, 'utf8');
  try {
    const res = execSync(`powershell -ExecutionPolicy Bypass -File "${psFile}"`).toString();
    console.log(res);
  } finally {
    if (fs.existsSync(psFile)) fs.unlinkSync(psFile);
  }
}

main().catch(console.error);
