$wsh = New-Object -ComObject WScript.Shell

$targets = @(
    "C:\Users\User\OneDrive\Desktop\OPTIMUS.lnk",
    "C:\Users\User\Desktop\OPTIMUS.lnk"
)

$targetBat = "C:\Users\User\OneDrive\Documents\INOVASI OPTIMUS\OPTIMUS\run-optimus.bat"
$workingDir = "C:\Users\User\OneDrive\Documents\INOVASI OPTIMUS\OPTIMUS"
$icoPath = "C:\Users\User\OneDrive\Documents\INOVASI OPTIMUS\OPTIMUS\public\optimus_app.ico"

foreach ($t in $targets) {
    $parent = Split-Path $t
    if (Test-Path $parent) {
        $sc = $wsh.CreateShortcut($t)
        $sc.TargetPath = $targetBat
        $sc.WorkingDirectory = $workingDir
        $sc.IconLocation = "$icoPath,0"
        $sc.Description = "OPTIMUS - RSUD Al-Mulk Sukabumi"
        $sc.WindowStyle = 1
        $sc.Save()
        Write-Output "Successfully created: $t"
    }
}

# Verify shortcuts exist
foreach ($t in $targets) {
    if (Test-Path $t) {
        $sc = $wsh.CreateShortcut($t)
        Write-Output "VERIFIED: $t -> Target: $($sc.TargetPath), Icon: $($sc.IconLocation)"
    } else {
        Write-Output "MISSING: $t"
    }
}
