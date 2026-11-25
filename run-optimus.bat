@echo off
setlocal enabledelayedexpansion
title OPTIMUS - RSUD AL-MULK KOTA SUKABUMI
cd /d "%~dp0"

echo ======================================================================
echo          MEMBUKA APLIKASI OPTIMUS - UOBK RSUD AL-MULK
echo ======================================================================
echo.

set "PORT=3002"
set "APP_URL=http://localhost:3002"
set "PROJECT_DIR=%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"

rem 1. Periksa apakah server sudah aktif di port 3002
netstat -ano | findstr /C:":%PORT% " | findstr /I "LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo [*] Server OPTIMUS sudah aktif di port %PORT%.
    goto BUKA_BROWSER
)

rem 2. Jika belum aktif, jalankan server produksi di latar belakang
echo [*] Menjalankan server OPTIMUS di latar belakang...
if exist ".next\BUILD_ID" (
    start "OPTIMUS Server" /min /d "%PROJECT_DIR%" cmd /c "node node_modules\next\dist\bin\next start -p 3002 -H 0.0.0.0"
) else (
    start "OPTIMUS Server" /min /d "%PROJECT_DIR%" cmd /c "npm run dev"
)

echo [*] Menunggu server siap digunakan...
for /L %%i in (1,1,30) do (
    netstat -ano | findstr /C:":%PORT% " | findstr /I "LISTENING" >nul 2>&1
    if not errorlevel 1 (
        echo [OK] Server berhasil aktif!
        goto BUKA_BROWSER
    )
    timeout /t 1 /nobreak >nul 2>&1
)

echo [!] Peringatan: Server membutuhkan waktu lebih lama untuk memuat.
echo [*] Tetap mencoba membuka browser...

:BUKA_BROWSER
echo [*] Membuka antarmuka aplikasi OPTIMUS...

rem Prioritas 1: Buka via Edge App Mode (tampilan jendela aplikasi bersih tanpa address bar)
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app="%APP_URL%"
    goto SELESAI
)
if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files\Microsoft\Edge\Application\msedge.exe" --app="%APP_URL%"
    goto SELESAI
)

rem Prioritas 2: Buka via Google Chrome App Mode
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="%APP_URL%"
    goto SELESAI
)

rem Prioritas 3: Buka via Default Browser
start "" "%APP_URL%"

:SELESAI
echo [SUKSES] Aplikasi OPTIMUS telah terbuka!
timeout /t 2 /nobreak >nul 2>&1
exit /b 0
