param(
    [switch]$IncludeSourceCode
)

$ErrorActionPreference = "Stop"

$gdriveBase = "G:\My Drive"
if (!(Test-Path $gdriveBase)) {
    Write-Error "Drive Google Drive (G:\My Drive) tidak ditemukan atau belum aktif."
    exit 1
}

$targetDir = Join-Path $gdriveBase "BACKUP_OPTIMUS_RSUD_ALMULK"
if (!(Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

$now = Get-Date
$dateStr = $now.ToString("yyyy-MM-dd")
$timeStr = $now.ToString("HH-mm-ss")

# 1. Sync database db.json realtime
$dbSource = "c:\Users\User\OneDrive\Documents\INOVASI OPTIMUS\OPTIMUS\data\db.json"
if (Test-Path $dbSource) {
    Copy-Item -Path $dbSource -Destination (Join-Path $targetDir "db_latest.json") -Force
    Copy-Item -Path $dbSource -Destination (Join-Path $targetDir "db_$dateStr.json") -Force
    Write-Output "DATABASE_SYNCED_OK: $targetDir\db_latest.json"
}

# 2. Sync uploaded files (logo, icons, etc)
$uploadsSource = "c:\Users\User\OneDrive\Documents\INOVASI OPTIMUS\OPTIMUS\public\uploads"
$uploadsTarget = Join-Path $targetDir "uploads"
if (Test-Path $uploadsSource) {
    if (!(Test-Path $uploadsTarget)) {
        New-Item -ItemType Directory -Path $uploadsTarget -Force | Out-Null
    }
    Copy-Item -Path "$uploadsSource\*" -Destination $uploadsTarget -Recurse -Force
    Write-Output "UPLOADS_SYNCED_OK: $uploadsTarget"
}

# 3. Create Full Application Code Zip (EXCLUDING node_modules, .next, .git)
if ($IncludeSourceCode) {
    $tempZipFolder = Join-Path ([System.IO.Path]::GetTempPath()) "optimus_backup_temp_$dateStr"
    if (Test-Path $tempZipFolder) { Remove-Item $tempZipFolder -Recurse -Force }
    New-Item -ItemType Directory -Path $tempZipFolder -Force | Out-Null

    $projRoot = "c:\Users\User\OneDrive\Documents\INOVASI OPTIMUS\OPTIMUS"
    $itemsToCopy = @("src", "data", "public", "scripts", "package.json", "package-lock.json", "tsconfig.json", "next.config.ts", "postcss.config.mjs", "README.md")

    foreach ($item in $itemsToCopy) {
        $srcPath = Join-Path $projRoot $item
        if (Test-Path $srcPath) {
            Copy-Item -Path $srcPath -Destination (Join-Path $tempZipFolder $item) -Recurse -Force
        }
    }

    $zipName = "OPTIMUS_FULL_CODE_${dateStr}_${timeStr}.zip"
    $zipDestination = Join-Path $targetDir $zipName
    Compress-Archive -Path "$tempZipFolder\*" -DestinationPath $zipDestination -Force
    Remove-Item $tempZipFolder -Recurse -Force
    Write-Output "FULL_ZIP_SAVED_OK: $zipDestination"
}

Write-Output "ALL_BACKUP_COMPLETED_SUCCESSFULLY"
