// Preload script для безопасной работы с Electron
const { contextBridge } = require('electron');

// Можно добавить API для взаимодействия между renderer и main процессом
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  version: process.versions.electron
});
