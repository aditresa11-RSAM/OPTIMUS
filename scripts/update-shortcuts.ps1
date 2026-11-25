$wsh = New-Object -ComObject WScript.Shell
$targets = @(
    "C:\Users\User\Desktop\OPTIMUS.lnk",
    "C:\Users\User\OneDrive\Desktop\OPTIMUS.lnk"
)

$ico = "C:\Users\User\OneDrive\Documents\INOVASI OPTIMUS\OPTIMUS\public\optimus_app.ico"

foreach ($t in $targets) {
    $dir = Split-Path $t
    if (Test-Path $dir) {
        $sc = $wsh.CreateShortcut($t)
        $sc.TargetPath = "C:\Users\User\OneDrive\Documents\INOVASI OPTIMUS\OPTIMUS\run-optimus.bat"
        $sc.WorkingDirectory = "C:\Users\User\OneDrive\Documents\INOVASI OPTIMUS\OPTIMUS"
        $sc.IconLocation = "$ico,0"
        $sc.Description = "OPTIMUS - RSUD Al-Mulk"
        $sc.Save()
        Write-Output "Updated shortcut: $t with Icon: $ico,0"
    }
}

# Notify Windows Shell of Icon / Assoc change
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class ShellNotify {
    [DllImport("shell32.dll")]
    public static extern void SHChangeNotify(int wEventId, uint uFlags, IntPtr dwItem1, IntPtr dwItem2);
}
"@
[ShellNotify]::SHChangeNotify(0x08000000, 0, [IntPtr]::Zero, [IntPtr]::Zero)
Write-Output "Shell notification sent (SHCNE_ASSOCCHANGED)."
