$wsh = New-Object -ComObject WScript.Shell
$targets = @(
    "C:\Users\User\Desktop\OPTIMUS.lnk",
    "C:\Users\User\OneDrive\Desktop\OPTIMUS.lnk"
)

$ico = "C:\Users\User\OneDrive\Documents\INOVASI OPTIMUS\OPTIMUS\public\optimus_app.ico"

foreach ($t in $targets) {
    if (Test-Path (Split-Path $t)) {
        $sc = $wsh.CreateShortcut($t)
        $sc.TargetPath = "C:\Users\User\OneDrive\Documents\INOVASI OPTIMUS\OPTIMUS\run-optimus.bat"
        $sc.WorkingDirectory = "C:\Users\User\OneDrive\Documents\INOVASI OPTIMUS\OPTIMUS"
        $sc.IconLocation = "$ico,0"
        $sc.Description = "OPTIMUS - RSUD Al-Mulk"
        $sc.Save()
        Write-Output "Saved shortcut $t"
    }
}

# Force Shell notification
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class ShellHelper {
    [DllImport("shell32.dll")]
    public static extern void SHChangeNotify(int wEventId, uint uFlags, IntPtr dwItem1, IntPtr dwItem2);
}
"@
[ShellHelper]::SHChangeNotify(0x08000000, 0, [IntPtr]::Zero, [IntPtr]::Zero)
Write-Output "Shell notified."
