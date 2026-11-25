Add-Type -AssemblyName System.IO.Compression.FileSystem

$zips = @(
    'C:\Users\User\OneDrive\Documents\INOVASI OPTIMUS\OPTIMUS.zip',
    'C:\Users\User\OneDrive\Documents\INOVASI OPTIMUS\optimus (16).zip',
    'C:\Users\User\OneDrive\Documents\INOVASI OPTIMUS\optimus (19).zip',
    'C:\Users\User\Downloads\APLIKASI OPTIMUS.zip',
    'C:\Users\User\Downloads\optimus (1).zip',
    'C:\Users\User\Downloads\optimus.zip'
)

foreach ($zipFile in $zips) {
    if (Test-Path $zipFile) {
        Write-Host "=== ZIP: $zipFile ==="
        $z = [System.IO.Compression.ZipFile]::OpenRead($zipFile)
        foreach ($e in $z.Entries) {
            if ($e.Name -match '\.(mp4|png|jpg|jpeg|webp|gif|sql|json|csv|xlsx|env)' -and $e.Name -notmatch 'package|tsconfig|metadata') {
                Write-Host "  $($e.FullName) ($($e.Length) bytes)"
            }
        }
        $z.Dispose()
    }
}
