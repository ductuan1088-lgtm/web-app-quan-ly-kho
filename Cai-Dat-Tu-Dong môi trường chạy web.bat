@echo off
chcp 65001 >nul
title HE THONG CAI DAT THU VIEN TU DONG
color 0A

echo ========================================================
echo   TIEN TRINH CAI DAT HE THONG QUAN LY KHO (TU DONG)
echo ========================================================
echo.

:: 1. Kiem tra xem may da cai Node.js chua
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [LOI] May tinh nay chua cai dat Node.js!
    echo Vui long tai va cai Node.js tai https://nodejs.org/ truoc khi chay file nay.
    echo.
    pause
    exit /b
)

:: 2. Cai dat thu vien cho Backend (server)
echo [1/2] Dang cai dat thu vien cho Backend (Server SQLite)...
cd /d "%~dp0server"
call npm install
if %errorlevel% neq 0 (
    echo.
    echo [CANH BAO] Co loi xay ra khi cai dat thu vien Backend!
    pause
    exit /b
)
echo.
echo -> Cai dat Backend THANH CONG!
echo.

:: 3. Cai dat thu vien cho Frontend (V2)
echo [2/2] Dang cai dat thu vien cho Frontend (React/Vite)...
cd /d "%~dp0V2"
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo.
    echo [CANH BAO] Co loi xay ra khi cai dat thu vien Frontend!
    pause
    exit /b
)
echo.
echo -> Cai dat Frontend THANH CONG!
echo.

echo ========================================================
echo   DA HOAN TAT CAI DAT TOAN BO THU VIEN CHO HE THONG!
echo   Bay gio ban co the chay file bat web kho de su dung.
echo ========================================================
echo.
pause