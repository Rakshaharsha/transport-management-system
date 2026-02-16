@echo off
echo ========================================
echo Starting Transport Management Backend
echo ========================================
echo.

cd transport

echo Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
pip install -r requirements.txt

echo.
echo Running migrations...
python manage.py makemigrations
python manage.py migrate

echo.
echo ========================================
echo Backend server starting on http://localhost:8000
echo Press Ctrl+C to stop the server
echo ========================================
echo.

python manage.py runserver
