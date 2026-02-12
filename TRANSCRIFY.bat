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
set "FRONTEND_DIR=%SCRIPT_DIR%"

echo [1/2] Starting Server (Frontend + API)...
cd /d "%FRONTEND_DIR%"
start "Transcrify Server" cmd /c "npm run dev"

echo [2/2] Waiting for server to start...
timeout /t 5 /nobreak > nul

echo.
echo  Opening Transcrify in your browser...
start http://localhost:3000

echo.
echo  =====================================================
echo   Transcrify is running!
echo   
echo   Frontend: http://localhost:3000
echo   API:      http://localhost:3000/api/transcribe
echo  
echo   Close this window to stop the servers.
echo  =====================================================
echo.

pause
taskkill /FI "WINDOWTITLE eq Transcrify Server*" /F > nul 2>&1
