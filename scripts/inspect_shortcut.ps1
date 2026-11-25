$sh = New-Object -ComObject WScript.Shell
$sc = $sh.CreateShortcut("C:\Users\User\OneDrive\Desktop\OPTIMUS.lnk")
[PSCustomObject]@{
    TargetPath = $sc.TargetPath
    Arguments = $sc.Arguments
    WorkingDirectory = $sc.WorkingDirectory
    IconLocation = $sc.IconLocation
} | Format-List
