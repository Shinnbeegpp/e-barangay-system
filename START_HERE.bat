@echo off
echo ======================================
echo  E-Barangay Management System
echo  Barangay Tinurik, Tanauan City
echo ======================================
echo.
echo [1/2] Starting Backend Server...
start "E-Barangay Backend" cmd /k "cd server && npm start"
timeout /t 3 /nobreak > nul
echo.
echo [2/2] Starting Frontend...
start "E-Barangay Frontend" cmd /k "cd client && npm run dev"
timeout /t 3 /nobreak > nul
echo.
echo ======================================
echo  App is starting up!
echo  Open: http://localhost:5173
echo ======================================
pause
