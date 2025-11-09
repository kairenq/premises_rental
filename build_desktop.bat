@echo off
REM ============================================
REM Build script for Premises Rental Desktop App
REM Windows only
REM ============================================

echo.
echo ============================================
echo Building Premises Rental Desktop App
echo ============================================
echo.

REM Step 1: Build Frontend
echo [1/4] Building frontend...
cd frontend
call npm install
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)
echo Frontend build completed!
echo.

REM Step 2: Build Backend with PyInstaller
echo [2/4] Building backend executable...
cd ..\backend
pip install pyinstaller
pip install -r requirements.txt
pyinstaller premises_rental.spec --clean --noconfirm
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Backend build failed!
    pause
    exit /b 1
)
echo Backend build completed!
echo.

REM Step 3: Copy files to electron directory
echo [3/4] Copying files to electron directory...
cd ..\electron

REM Create directories
if not exist "backend-exe" mkdir backend-exe
if not exist "frontend-dist" mkdir frontend-dist

REM Copy backend exe
xcopy /E /I /Y ..\backend\dist\premises_rental_backend.exe backend-exe\
xcopy /E /I /Y ..\backend\uploads backend-exe\uploads\

REM Copy frontend dist
xcopy /E /I /Y ..\frontend\dist\* frontend-dist\

echo Files copied successfully!
echo.

REM Step 4: Build Electron app
echo [4/4] Building Electron application...
call npm install
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Electron build failed!
    pause
    exit /b 1
)
echo.

echo ============================================
echo Build completed successfully!
echo ============================================
echo.
echo Installer location: electron\dist\
echo.
pause
