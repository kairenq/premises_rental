const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const axios = require('axios');

let mainWindow;
let backendProcess;
const BACKEND_PORT = 8000;
const BACKEND_URL = `http://127.0.0.1:${BACKEND_PORT}`;

// Определяем пути в зависимости от окружения
const isDev = !app.isPackaged;
const resourcesPath = isDev
  ? path.join(__dirname, '..')
  : process.resourcesPath;

const backendPath = isDev
  ? path.join(resourcesPath, 'backend')
  : path.join(resourcesPath, 'backend-exe');

const frontendPath = isDev
  ? path.join(resourcesPath, 'frontend', 'dist')
  : path.join(resourcesPath, 'frontend-dist');

// Функция запуска backend
function startBackend() {
  return new Promise((resolve, reject) => {
    console.log('Starting backend...');
    console.log('Backend path:', backendPath);

    let backendExecutable;

    if (isDev) {
      // В режиме разработки запускаем через uvicorn
      backendExecutable = 'python';
      const uvicornPath = path.join(backendPath, 'app', 'main.py');

      backendProcess = spawn('uvicorn', [
        'app.main:app',
        '--host', '127.0.0.1',
        '--port', BACKEND_PORT.toString(),
        '--log-level', 'info'
      ], {
        cwd: backendPath,
        shell: true,
        stdio: 'inherit'
      });
    } else {
      // В production запускаем exe файл
      backendExecutable = path.join(backendPath, 'premises_rental_backend.exe');

      backendProcess = spawn(backendExecutable, [], {
        cwd: backendPath,
        stdio: 'inherit'
      });
    }

    backendProcess.on('error', (err) => {
      console.error('Failed to start backend:', err);
      reject(err);
    });

    // Ждем пока backend запустится
    let attempts = 0;
    const maxAttempts = 30;

    const checkBackend = setInterval(async () => {
      attempts++;

      try {
        const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 1000 });
        if (response.status === 200) {
          console.log('Backend is ready!');
          clearInterval(checkBackend);
          resolve();
        }
      } catch (error) {
        if (attempts >= maxAttempts) {
          console.error('Backend failed to start after', maxAttempts, 'attempts');
          clearInterval(checkBackend);
          reject(new Error('Backend startup timeout'));
        }
      }
    }, 1000);
  });
}

// Функция остановки backend
function stopBackend() {
  if (backendProcess) {
    console.log('Stopping backend...');
    backendProcess.kill();
    backendProcess = null;
  }
}

// Создание главного окна
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false, // Не показываем пока не загрузится
    backgroundColor: '#f0f2f5'
  });

  // Убираем меню (опционально)
  Menu.setApplicationMenu(null);

  // Загружаем приложение
  const indexPath = path.join(frontendPath, 'index.html');
  console.log('Loading frontend from:', indexPath);

  mainWindow.loadFile(indexPath).catch(err => {
    console.error('Failed to load frontend:', err);
    // Fallback на backend URL
    mainWindow.loadURL(BACKEND_URL);
  });

  // Показываем окно когда готово
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    // Открываем DevTools в режиме разработки
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Обработка внешних ссылок
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Инициализация приложения
app.whenReady().then(async () => {
  try {
    // Запускаем backend
    await startBackend();

    // Создаем окно
    createWindow();

    console.log('Application started successfully!');
  } catch (error) {
    console.error('Failed to start application:', error);
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Закрытие приложения
app.on('window-all-closed', () => {
  stopBackend();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopBackend();
});

// Обработка ошибок
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  stopBackend();
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});
