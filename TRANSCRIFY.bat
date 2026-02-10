@echo off
title Transcrify Launcher
color 0A

echo.
echo  ████████╗██████╗  █████╗ ███╗   ██╗███████╗ ██████╗██████╗ ██╗███████╗██╗   ██╗
echo  ╚══██╔══╝██╔══██╗██╔══██╗████╗  ██║██╔════╝██╔════╝██╔══██╗██║██╔════╝╚██╗ ██╔╝
echo     ██║   ██████╔╝███████║██╔██╗ ██║███████╗██║     ██████╔╝██║█████╗   ╚████╔╝ 
echo     ██║   ██╔══██╗██╔══██║██║╚██╗██║╚════██║██║     ██╔══██╗██║██╔══╝    ╚██╔╝  
echo     ██║   ██║  ██║██║  ██║██║ ╚████║███████║╚██████╗██║  ██║██║██║        ██║   
echo     ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝╚═╝        ╚═╝   
echo.
echo  Video Transcription Tool - Powered by OpenAI Whisper
echo  =====================================================
echo.

set "SCRIPT_DIR=%~dp0"
set "BACKEND_DIR=%SCRIPT_DIR%TRANSCRIFY\backend"
set "FRONTEND_DIR=%SCRIPT_DIR%TRANSCRIFY\frontend"

echo [1/3] Starting Backend Server...
cd /d "%BACKEND_DIR%"
start "Transcrify Backend" cmd /c "python -m uvicorn main:app --port 8000"

timeout /t 3 /nobreak > nul

echo [2/3] Starting Frontend Server...
cd /d "%FRONTEND_DIR%"
start "Transcrify Frontend" cmd /c "npm run dev"

echo [3/3] Waiting for servers to start...
timeout /t 5 /nobreak > nul

echo.
echo  Opening Transcrify in your browser...
start http://localhost:3000

echo.
echo  =====================================================
echo   Transcrify is running!
echo   
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000
echo  
echo   Close this window to stop the servers.
echo  =====================================================
echo.

pause
taskkill /FI "WINDOWTITLE eq Transcrify Backend*" /F > nul 2>&1
taskkill /FI "WINDOWTITLE eq Transcrify Frontend*" /F > nul 2>&1
