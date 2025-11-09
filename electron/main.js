const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

// URL backend на Render
const BACKEND_URL = 'https://premises-rental.onrender.com';

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
      webviewTag: false
    },
    show: false, // Не показываем пока не загрузится
    backgroundColor: '#f0f2f5',
    autoHideMenuBar: true, // Скрываем меню автоматически
    title: 'Premises Rental System'
  });

  // Убираем меню полностью
  Menu.setApplicationMenu(null);

  // Загружаем приложение с Render
  console.log('Loading application from:', BACKEND_URL);
  mainWindow.loadURL(BACKEND_URL);

  // Показываем окно когда готово
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('Application loaded successfully!');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Обработка внешних ссылок - открываем в браузере
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });

  // Обработка ошибок загрузки
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);

    // Показываем простую страницу с ошибкой
    mainWindow.loadURL(`data:text/html;charset=utf-8,
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: #f0f2f5;
            }
            .error {
              text-align: center;
              padding: 40px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            h1 { color: #ff4d4f; margin-bottom: 16px; }
            p { color: #595959; margin-bottom: 24px; }
            button {
              background: #1890ff;
              color: white;
              border: none;
              padding: 10px 24px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
            }
            button:hover { background: #40a9ff; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>⚠️ Не удалось подключиться</h1>
            <p>Проверьте интернет-соединение и попробуйте снова</p>
            <button onclick="location.reload()">Повторить попытку</button>
          </div>
        </body>
      </html>
    `);
  });
}

// Инициализация приложения
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Закрытие приложения
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
