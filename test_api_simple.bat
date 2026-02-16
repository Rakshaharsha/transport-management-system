@echo off
echo ============================================================
echo TRANSPORT MANAGEMENT API - QUICK TEST
echo ============================================================
echo.
echo This will test if your Django server is running and accessible.
echo.
echo Make sure Django server is running in another terminal:
echo    cd transport
echo    python manage.py runserver
echo.
pause
echo.
echo Testing API endpoints...
echo.

curl -X POST http://127.0.0.1:8000/api/auth/login/ -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin\"}" 2>nul

if %errorlevel% equ 0 (
    echo.
    echo ============================================================
    echo SUCCESS! Your API is working!
    echo ============================================================
    echo.
    echo Now you can test in Postman:
    echo 1. Copy the "access" token from above
    echo 2. In Postman, go to Authorization tab
    echo 3. Type: Bearer Token
    echo 4. Token: Paste your access token
    echo 5. Send your request
    echo.
) else (
    echo.
    echo ============================================================
    echo ERROR: Cannot connect to API
    echo ============================================================
    echo.
    echo Make sure Django server is running:
    echo    cd transport
    echo    python manage.py runserver
    echo.
)

pause
