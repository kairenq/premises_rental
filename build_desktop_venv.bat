@echo off
REM ============================================
REM Build script with Virtual Environment
REM Более надежный вариант
REM ============================================

echo.
echo ============================================
echo Building Premises Rental Desktop App
echo Using Virtual Environment (recommended)
echo ============================================
echo.

REM Проверка наличия Python
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python not found! Please install Python 3.10+
    echo Download: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Step 1: Build Frontend
echo [1/5] Building frontend...
cd frontend
if not exist node_modules (
    echo Installing frontend dependencies...
    call npm install
)
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)
echo Frontend build completed!
echo.

REM Step 2: Create Virtual Environment for Backend
echo [2/5] Creating Python virtual environment...
cd ..\backend
if not exist venv (
    python -m venv venv
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to create virtual environment!
        pause
        exit /b 1
    )
)
echo Virtual environment created!
echo.

REM Step 3: Install dependencies in venv
echo [3/5] Installing Python dependencies...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
python -m pip install pyinstaller
python -m pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo Dependencies installed!
echo.

REM Step 4: Build Backend with PyInstaller
echo [4/5] Building backend executable...
python -m PyInstaller premises_rental.spec --clean --noconfirm
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Backend build failed!
    pause
    exit /b 1
)
call venv\Scripts\deactivate.bat
echo Backend build completed!
echo.

REM Step 5: Prepare Electron
echo [5/5] Preparing Electron application...
cd ..\electron

REM Create directories
if not exist "backend-exe" mkdir backend-exe
if not exist "frontend-dist" mkdir frontend-dist

REM Copy backend exe
echo Copying backend executable...
xcopy /Y ..\backend\dist\premises_rental_backend.exe backend-exe\
if exist ..\backend\uploads (
    xcopy /E /I /Y ..\backend\uploads backend-exe\uploads\
)

REM Copy frontend dist
echo Copying frontend files...
xcopy /E /I /Y ..\frontend\dist\* frontend-dist\

REM Install Electron dependencies
if not exist node_modules (
    echo Installing Electron dependencies...
    call npm install
)

echo.
echo ============================================
echo Build completed successfully!
echo ============================================
echo.
echo Next steps:
echo 1. To build installer: cd electron && npm run build
echo 2. Or run in dev mode: cd electron && npm start
echo.
pause
