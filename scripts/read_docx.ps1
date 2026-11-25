Add-Type -AssemblyName System.IO.Compression.FileSystem
$docx = 'C:\Users\User\Downloads\Link Aplikasi Optimus.docx'
if (Test-Path $docx) {
    $zip = [System.IO.Compression.ZipFile]::OpenRead($docx)
    $entry = $zip.GetEntry('word/document.xml')
    if ($entry) {
        $stream = $entry.Open()
        $reader = New-Object System.IO.StreamReader($stream)
        $xml = $reader.ReadToEnd()
        $text = [regex]::Replace($xml, '<[^>]+>', ' ')
        Write-Host $text
        $stream.Close()
    }
    $zip.Dispose()
}
