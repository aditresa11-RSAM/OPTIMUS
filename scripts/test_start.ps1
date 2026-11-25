$p = Start-Process -FilePath "node" -ArgumentList "node_modules\next\dist\bin\next", "start", "-p", "3005", "-H", "0.0.0.0" -WorkingDirectory "C:\Users\User\OneDrive\Documents\INOVASI OPTIMUS\OPTIMUS" -PassThru
Start-Sleep -Seconds 3
if ($p.HasExited) {
    Write-Output ("Exited with code: " + $p.ExitCode)
} else {
    Write-Output "Running successfully!"
    Stop-Process -Id $p.Id -Force
}
