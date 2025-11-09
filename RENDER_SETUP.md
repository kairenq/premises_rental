# Инструкция по настройке Render

## Настройка Web Service на Render

1. **Зайди в свой проект на Render:** https://dashboard.render.com/

2. **Настройки (Settings):**
   - **Name:** `premises-rental` (или любое другое имя)
   - **Region:** Frankfurt (EU Central) или ближайший к тебе
   - **Branch:** `main` (или твоя основная ветка)
   - **Root Directory:** *(оставь пустым)*
   - **Runtime:** `Python 3`
   - **Build Command:** `./build.sh`
   - **Start Command:** `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Environment Variables (не нужны, если используешь SQLite):**
   - Пока ничего добавлять не нужно
   - SQLite база данных создается автоматически

4. **Сохрани и задеплой:**
   - Нажми "Create Web Service"
   - Render автоматически запустит сборку
   - Процесс займет 3-5 минут

5. **После успешного деплоя:**
   - Получишь URL типа: `https://premises-rental.onrender.com`
   - Открой этот URL в браузере
   - Должна открыться страница фронтенда!

## Проверка

- **Главная страница:** `https://твой-домен.onrender.com/`
- **API Docs:** `https://твой-домен.onrender.com/docs`
- **Health Check:** `https://твой-домен.onrender.com/health`

## Важные моменты

1. **Free tier Render засыпает через 15 минут неактивности:**
   - При первом запросе после сна сервер просыпается ~30-50 секунд
   - Настрой uptime monitoring (UptimeRobot/Cronitor) на `/health` endpoint чтобы сервер не засыпал

2. **База данных SQLite:**
   - Хранится в `/app/backend/database.db`
   - При каждом редеплое база данных СБРАСЫВАЕТСЯ (эфемерная файловая система)
   - Для постоянного хранения нужна внешняя БД (PostgreSQL на Render)

3. **Загруженные фото:**
   - Хранятся в `/uploads`
   - Также сбрасываются при редеплое
   - Для продакшена нужно использовать облачное хранилище (Cloudinary, AWS S3)

## Troubleshooting

### Если билд фейлится:
- Проверь логи сборки в Render Dashboard
- Убедись что `build.sh` имеет права на выполнение (chmod +x)
- Проверь что `requirements.txt` существует в `backend/`

### Если сервер стартует но не работает:
- Проверь логи запуска
- Убедись что Start Command правильный
- Проверь что порт $PORT используется (не 8000)

### Если фронтенд не отображается:
- Убедись что `npm run build` выполнился успешно
- Проверь что папка `frontend/dist` создана
- Проверь логи FastAPI - должно быть сообщение о монтировании статики
