const fs = require('fs');
const { execSync } = require('child_process');

const ps = `
$wsh = New-Object -ComObject WScript.Shell
@('SMART PPI.lnk', 'AMBAR.lnk', 'KPI RSAM.lnk', 'SURVEY BUDAYA.lnk') | ForEach-Object {
    $p = "C:\\Users\\User\\OneDrive\\Desktop\\$_"
    if (Test-Path $p) {
        $sc = $wsh.CreateShortcut($p)
        Write-Output "=== $_ ==="
        Write-Output "TargetPath: $($sc.TargetPath)"
        Write-Output "Arguments: $($sc.Arguments)"
        Write-Output "WorkingDirectory: $($sc.WorkingDirectory)"
        Write-Output "IconLocation: $($sc.IconLocation)"
        Write-Output "WindowStyle: $($sc.WindowStyle)"
    }
}
`;

fs.writeFileSync('scripts/inspect_other_shortcuts.ps1', ps, 'utf8');
console.log('Script written');
