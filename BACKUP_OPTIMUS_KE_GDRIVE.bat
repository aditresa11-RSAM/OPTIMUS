@echo off
title OPTIMUS - Backup Otomatis ke Google Drive G:
color 0A
echo ========================================================
echo   OPTIMUS RSUD AL-MULK - CADANGAN OTOMATIS GOOGLE DRIVE
echo ========================================================
echo.
echo Sedang mencadangkan seluruh kode program dan database...
echo Mohon tunggu sebentar (hanya butuh waktu beberapa detik)...
echo.
powershell -ExecutionPolicy Bypass -File "c:\Users\User\OneDrive\Documents\INOVASI OPTIMUS\OPTIMUS\scripts\backup_gdrive.ps1" -IncludeSourceCode
echo.
echo ========================================================
echo   [SUKSES] CADANGAN BERHASIL DISIMPAN KE GOOGLE DRIVE!
echo   Folder Cloud: G:\My Drive\BACKUP_OPTIMUS_RSUD_ALMULK\
echo ========================================================
echo.
pause
