const { execSync } = require('child_process');
try {
  const out = execSync('powershell "Get-Process explorer"').toString();
  console.log(out);
} catch (e) {
  console.log('Explorer not running, starting it...');
  execSync('cmd /c start explorer.exe');
  console.log('Started explorer.exe');
}
