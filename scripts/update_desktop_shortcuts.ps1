$sh = New-Object -ComObject WScript.Shell
$projectDir = "C:\Users\User\OneDrive\Documents\INOVASI OPTIMUS\OPTIMUS"
$batPath = Join-Path $projectDir "run-optimus.bat"
$iconPath = "C:\Users\User\Downloads\favicon (5).ico"

$desktopDirs = @(
    "C:\Users\User\Desktop",
    "C:\Users\User\OneDrive\Desktop"
)

foreach ($dir in $desktopDirs) {
    if (Test-Path $dir) {
        # 1. Update/Create OPTIMUS.lnk
        $lnkPath = Join-Path $dir "OPTIMUS.lnk"
        $sc = $sh.CreateShortcut($lnkPath)
        $sc.TargetPath = $batPath
        $sc.WorkingDirectory = $projectDir
        $sc.WindowStyle = 1 # Normal window
        $sc.Description = "Aplikasi Mutu Rumah Sakit - UOBK RSUD AL-MULK"
        if (Test-Path $iconPath) {
            $sc.IconLocation = "$iconPath,0"
        }
        $sc.Save()
        Write-Output ("Created/Updated Shortcut: " + $lnkPath)

        # 2. Also create BUKA_APLIKASI_OPTIMUS.bat on Desktop for 100% fail-proof launching
        $batDest = Join-Path $dir "BUKA_APLIKASI_OPTIMUS.bat"
        $batContent = "@echo off`r`ncall `"$batPath`"`r`n"
        [System.IO.File]::WriteAllText($batDest, $batContent)
        Write-Output ("Created Direct Batch Launcher: " + $batDest)
    }
}
