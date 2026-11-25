Add-Type -AssemblyName System.IO.Compression.FileSystem
$z = [System.IO.Compression.ZipFile]::OpenRead('C:\Users\User\Downloads\optimus.zip')
$entry = $z.GetEntry('supabase_schema.sql')
if ($entry) {
    $stream = $entry.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $content = $reader.ReadToEnd()
    Write-Host $content
    $stream.Close()
}
$z.Dispose()
