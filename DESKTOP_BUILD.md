# 🖥️ Сборка Desktop приложения (Windows .exe)

Это руководство поможет собрать **Premises Rental System** в полноценное desktop приложение (.exe), которое можно запускать на любом компьютере **без установки Python и Node.js**.

---

## 📋 Требования для сборки

### Необходимое ПО:

1. **Python 3.10+** (только для сборки)
2. **Node.js 18+** (только для сборки)
3. **Git** (опционально)

### Установка зависимостей:

```bash
# Python зависимости
pip install -r backend/requirements.txt
pip install pyinstaller

# Node.js зависимости
cd frontend
npm install
cd ..

cd electron
npm install
cd ..
```

---

## 🚀 Быстрая сборка

### Windows:

Просто запусти батник:

```cmd
build_desktop.bat
```

### Linux/macOS:

```bash
chmod +x build_desktop.sh
./build_desktop.sh
```

---

## 📦 Пошаговая сборка вручную

### Шаг 1: Собрать frontend

```bash
cd frontend
npm install
npm run build
cd ..
```

Результат: `frontend/dist/` - статические файлы React приложения

### Шаг 2: Собрать backend в .exe

```bash
cd backend
pip install pyinstaller
pyinstaller premises_rental.spec --clean --noconfirm
cd ..
```

Результат: `backend/dist/premises_rental_backend.exe` - единый исполняемый файл

### Шаг 3: Скопировать файлы в electron

```bash
cd electron

# Создать директории
mkdir backend-exe
mkdir frontend-dist

# Копировать backend
copy ..\backend\dist\premises_rental_backend.exe backend-exe\

# Копировать frontend
xcopy /E /I ..\frontend\dist\* frontend-dist\
```

### Шаг 4: Собрать Electron приложение

```bash
npm install
npm run build
```

Результат: `electron/dist/Premises Rental System-Setup-1.0.0.exe` 🎉

---

## 📂 Структура проекта после сборки

```
premises_rental/
├── electron/
│   ├── dist/                          # ГОТОВЫЙ УСТАНОВЩИК
│   │   └── Premises Rental System-Setup-1.0.0.exe
│   ├── backend-exe/                   # Backend для упаковки
│   │   └── premises_rental_backend.exe
│   ├── frontend-dist/                 # Frontend для упаковки
│   │   ├── index.html
│   │   └── assets/
│   ├── main.js                        # Главный процесс Electron
│   ├── preload.js                     # Preload скрипт
│   └── package.json                   # Конфигурация Electron
├── build_desktop.bat                  # Скрипт сборки Windows
└── build_desktop.sh                   # Скрипт сборки Linux/Mac
```

---

## 🎨 Добавление иконки приложения

1. Создай иконку 256x256px (PNG)
2. Конвертируй в `.ico`:
   - Онлайн: https://convertio.co/png-ico/
   - Или ImageMagick: `convert icon.png -define icon:auto-resize=256,128,64,32,16 icon.ico`
3. Сохрани как `electron/icon.ico`
4. Пересобери проект

---

## ⚙️ Настройки сборки

### Изменить название приложения:

Отредактируй `electron/package.json`:

```json
{
  "name": "your-app-name",
  "productName": "Your App Name",
  "version": "1.0.0",
  "build": {
    "appId": "com.yourcompany.yourapp"
  }
}
```

### Изменить порт backend:

Отредактируй `electron/main.js`:

```javascript
const BACKEND_PORT = 8000;  // Измени на нужный
```

И `backend/run_server.py`:

```python
uvicorn.run(app, host="127.0.0.1", port=8000)  # Измени на нужный
```

---

## 🐛 Troubleshooting

### Проблема: "Backend failed to start"

**Решение:**
1. Проверь что `premises_rental_backend.exe` создан в `backend/dist/`
2. Запусти `premises_rental_backend.exe` вручную и проверь ошибки
3. Убедись что все зависимости установлены: `pip install -r requirements.txt`

### Проблема: "Frontend not loaded"

**Решение:**
1. Убедись что `frontend/dist/` содержит `index.html`
2. Проверь что файлы скопированы в `electron/frontend-dist/`
3. Запусти `npm run build` в директории `frontend/`

### Проблема: PyInstaller ошибки

**Решение:**
1. Обнови PyInstaller: `pip install --upgrade pyinstaller`
2. Очисти кеш: `pyinstaller --clean premises_rental.spec`
3. Проверь что все импорты правильные в `run_server.py`

### Проблема: Electron build fails

**Решение:**
1. Удали `node_modules`: `rm -rf electron/node_modules`
2. Переустанови зависимости: `npm install`
3. Проверь версию Node.js: `node --version` (должна быть 18+)

### Проблема: "Cannot find module 'axios'"

**Решение:**
```bash
cd electron
npm install axios --save
```

---

## 📊 Размер приложения

**Ожидаемые размеры:**

- **Backend exe:** ~60-80 MB (включает Python runtime, FastAPI, SQLAlchemy)
- **Frontend dist:** ~5-10 MB (React, Ant Design)
- **Electron wrapper:** ~150-200 MB (Chromium + Node.js)
- **Итоговый установщик:** ~250-300 MB

**Для уменьшения размера:**
- Используй UPX компрессию в PyInstaller: `upx=True`
- Удали неиспользуемые зависимости из `requirements.txt`
- Используй production build для frontend

---

## 🚢 Распространение приложения

### Вариант 1: Installer (рекомендуется)

Отдавай пользователям файл:
```
Premises Rental System-Setup-1.0.0.exe
```

Установщик:
- ✅ Создаст ярлыки на рабочем столе
- ✅ Добавит в меню Пуск
- ✅ Настроит удаление через Панель управления

### Вариант 2: Portable (без установки)

Найди папку в `electron/dist/win-unpacked/` и архивируй её:

```bash
cd electron/dist/win-unpacked
7z a ../PremisesRental-Portable.zip *
```

Пользователь просто распаковывает и запускает `Premises Rental System.exe`

---

## 🔐 Безопасность

**Важные замечания:**

1. **База данных SQLite** хранится в директории приложения
   - При переустановке данные сохраняются
   - При удалении через "Удалить программу" - НЕ удаляются

2. **Пароли** хранятся в хешированном виде (bcrypt)

3. **Загруженные файлы** хранятся в `uploads/` рядом с exe

4. **Логи** выводятся в консоль (можно скрыть установив `console=False` в `.spec`)

---

## 📝 Автообновление (опционально)

Для добавления автообновлений используй **electron-updater**:

```bash
cd electron
npm install electron-updater --save
```

И добавь в `main.js`:

```javascript
const { autoUpdater } = require('electron-updater');

app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify();
});
```

Подробнее: https://www.electron.build/auto-update

---

## 🎯 Готово!

После успешной сборки у тебя будет **единый .exe установщик**, который можно распространять пользователям. Приложение будет работать на любом Windows компьютере без необходимости установки Python или Node.js!

**Расположение готового установщика:**
```
electron/dist/Premises Rental System-Setup-1.0.0.exe
```

**Тестовые учетные данные:**
- Admin: `admin@test.com` / `admin123`
- Landlord: `landlord1@test.com` / `landlord123`
- User: `tenant1@test.com` / `user123`

---

## 📧 Поддержка

Если возникли проблемы со сборкой - проверь логи и создай Issue на GitHub.

**Полезные команды для отладки:**

```bash
# Проверить что backend работает
cd backend/dist
premises_rental_backend.exe

# Проверить что frontend собрался
dir frontend/dist

# Запустить Electron в dev режиме
cd electron
npm start
```

Удачи! 🚀
