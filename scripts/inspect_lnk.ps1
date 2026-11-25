
$wsh = New-Object -ComObject WScript.Shell
@('C:\Users\User\Desktop\OPTIMUS.lnk', 'C:\Users\User\OneDrive\Desktop\OPTIMUS.lnk') | ForEach-Object {
    if (Test-Path $_) {
        $sc = $wsh.CreateShortcut($_)
        Write-Output "=== $_ ==="
        Write-Output "TargetPath: $($sc.TargetPath)"
        Write-Output "Arguments: $($sc.Arguments)"
        Write-Output "WorkingDirectory: $($sc.WorkingDirectory)"
        Write-Output "IconLocation: $($sc.IconLocation)"
        Write-Output "WindowStyle: $($sc.WindowStyle)"
    } else {
        Write-Output "NOT FOUND: $_"
    }
}
