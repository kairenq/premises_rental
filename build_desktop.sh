#!/bin/bash
# ============================================
# Build script for Premises Rental Desktop App
# Linux/macOS
# ============================================

set -e  # Exit on error

echo ""
echo "============================================"
echo "Building Premises Rental Desktop App"
echo "============================================"
echo ""

# Step 1: Build Frontend
echo "[1/4] Building frontend..."
cd frontend
npm install
npm run build
echo "Frontend build completed!"
echo ""

# Step 2: Build Backend with PyInstaller
echo "[2/4] Building backend executable..."
cd ../backend
pip install pyinstaller
pip install -r requirements.txt
pyinstaller premises_rental.spec --clean --noconfirm
echo "Backend build completed!"
echo ""

# Step 3: Copy files to electron directory
echo "[3/4] Copying files to electron directory..."
cd ../electron

# Create directories
mkdir -p backend-exe
mkdir -p frontend-dist

# Copy backend exe
cp -r ../backend/dist/premises_rental_backend backend-exe/
cp -r ../backend/uploads backend-exe/uploads/ 2>/dev/null || :

# Copy frontend dist
cp -r ../frontend/dist/* frontend-dist/

echo "Files copied successfully!"
echo ""

# Step 4: Build Electron app
echo "[4/4] Building Electron application..."
npm install
npm run build
echo ""

echo "============================================"
echo "Build completed successfully!"
echo "============================================"
echo ""
echo "Installer location: electron/dist/"
echo ""
