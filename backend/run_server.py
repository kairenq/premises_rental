#!/usr/bin/env python3
"""
Entry point for PyInstaller-packaged backend
Запускает uvicorn сервер с FastAPI приложением
"""

import sys
import os

# Добавляем текущую директорию в путь
if getattr(sys, 'frozen', False):
    # Если запущено из .exe
    application_path = sys._MEIPASS
else:
    # Если запущено напрямую из Python
    application_path = os.path.dirname(os.path.abspath(__file__))

sys.path.insert(0, application_path)

import uvicorn
from app.main import app

if __name__ == "__main__":
    print("=" * 60)
    print("Premises Rental Backend Server")
    print("=" * 60)
    print(f"Application path: {application_path}")
    print(f"Python version: {sys.version}")
    print("Starting server on http://127.0.0.1:8000")
    print("=" * 60)

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        log_level="info",
        access_log=True
    )
