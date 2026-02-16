@echo off
echo ========================================
echo Starting Transport Management Frontend
echo ========================================
echo.

cd frontend\my_app

echo Checking Node.js installation...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
call npm install

echo.
echo ========================================
echo Frontend server starting on http://localhost:3000
echo Press Ctrl+C to stop the server
echo ========================================
echo.

call npm start
