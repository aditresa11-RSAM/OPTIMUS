
$wsh = New-Object -ComObject WScript.Shell
$sc = $wsh.CreateShortcut("C:\Users\User\OneDrive\Desktop\SMART PPI.lnk")
Write-Output "TargetPath: $($sc.TargetPath)"
Write-Output "Arguments: $($sc.Arguments)"
Write-Output "WorkingDirectory: $($sc.WorkingDirectory)"
Write-Output "IconLocation: $($sc.IconLocation)"
Write-Output "WindowStyle: $($sc.WindowStyle)"
Write-Output "Description: $($sc.Description)"
