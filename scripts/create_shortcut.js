const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetBat = path.resolve(__dirname, '..', 'run-optimus.bat');
const workingDir = path.resolve(__dirname, '..');

const desktopDirs = [
  path.join(process.env.USERPROFILE || 'C:\\Users\\User', 'OneDrive', 'Desktop'),
  path.join(process.env.USERPROFILE || 'C:\\Users\\User', 'Desktop')
];

desktopDirs.forEach(desktopDir => {
  if (fs.existsSync(desktopDir)) {
    const shortcutPath = path.join(desktopDir, 'OPTIMUS - RSUD AL-MULK.lnk');
    const vbsScript = `
Set oWS = WScript.CreateObject("WScript.Shell")
sLinkFile = "${shortcutPath.replace(/\\/g, '\\\\')}"
Set oLink = oWS.CreateShortcut(sLinkFile)
oLink.TargetPath = "${targetBat.replace(/\\/g, '\\\\')}"
oLink.WorkingDirectory = "${workingDir.replace(/\\/g, '\\\\')}"
oLink.Description = "Jalankan Aplikasi Mutu OPTIMUS - RSUD AL-MULK"
oLink.IconLocation = "shell32.dll, 14"
oLink.Save
`;
    const tempVbs = path.join(__dirname, 'temp_shortcut.vbs');
    fs.writeFileSync(tempVbs, vbsScript, 'utf8');
    try {
      execSync(`cscript //Nologo "${tempVbs}"`);
      console.log('Shortcut created at:', shortcutPath);
    } catch (e) {
      console.error('Failed to create shortcut at:', shortcutPath, e);
    } finally {
      if (fs.existsSync(tempVbs)) fs.unlinkSync(tempVbs);
    }
  }
});
