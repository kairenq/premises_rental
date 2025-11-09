#!/usr/bin/env bash
# Build script for Render

set -o errexit

echo "📦 Installing backend dependencies..."
pip install -r backend/requirements.txt

echo "🔨 Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "✅ Build completed successfully!"
