const { execSync } = require('child_process');

const ps = `
$wsh = New-Object -ComObject WScript.Shell
$sc = $wsh.CreateShortcut("C:\\Users\\User\\OneDrive\\Desktop\\SMART PPI.lnk")
Write-Output "TargetPath: $($sc.TargetPath)"
Write-Output "Arguments: $($sc.Arguments)"
Write-Output "WorkingDirectory: $($sc.WorkingDirectory)"
Write-Output "IconLocation: $($sc.IconLocation)"
Write-Output "WindowStyle: $($sc.WindowStyle)"
Write-Output "Description: $($sc.Description)"
`;

try {
  require('fs').writeFileSync('scripts/inspect_smart_ppi.ps1', ps);
  const res = execSync('powershell -ExecutionPolicy Bypass -File scripts/inspect_smart_ppi.ps1').toString();
  console.log(res);
} catch (e) {
  console.error(e);
}
