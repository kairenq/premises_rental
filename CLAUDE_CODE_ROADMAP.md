# 🎯 ROADMAP ДЛЯ CLAUDE CODE
## Полное ТЗ для создания веб-приложений одним промтом

---

## ⚠️ КРИТИЧЕСКИЕ ПРАВИЛА - ОБЯЗАТЕЛЬНО К ИСПОЛНЕНИЮ

**Claude Code, ты читаешь техническое задание. Следуй ВСЕМ инструкциям для создания production-ready приложения БЕЗ правок.**

### ОБЯЗАТЕЛЬНЫЕ ТРЕБОВАНИЯ:
1. ✅ Создать ВСЕ файлы из структуры проекта
2. ✅ Реализовать ПОЛНЫЙ функционал без заглушек
3. ✅ NO placeholder code - всё должно работать
4. ✅ NO комментариев типа "добавьте здесь больше функций"
5. ✅ Протестировать все endpoints перед завершением
6. ✅ Следовать ТОЧНОЙ структуре файлов ниже
7. ✅ Использовать ТОЧНЫЕ паттерны кода из примеров

---

## 📦 ТЕХНОЛОГИЧЕСКИЙ СТЕК (ФИКСИРОВАННЫЙ)

### Backend:
- **FastAPI** 0.104.1+
- **SQLite** (встроенный, без дополнительных настроек)
- **Uvicorn** (сервер)
- **Pydantic** (валидация данных)
- **БЕЗ хеширования паролей** (plain text)
- **БЕЗ JWT токенов** (простая сессия через cookies)

### Frontend:
- **React** 18.2+
- **Vite** 5.0+ (сборщик)
- **React Router DOM** 6.20+ (роутинг)
- **Axios** 1.6+ (HTTP клиент)
- **UI библиотека** (выбрать на основе типа проекта):
  - **Material-UI** (@mui/material) - для корпоративных/профессиональных приложений
  - **Ant Design** (antd) - для админ-панелей с большим количеством данных
  - **Tailwind CSS** - для кастомного дизайна
- **Framer Motion** 10.16+ (анимации)
- **Recharts** 2.10+ ИЛИ **Chart.js** (графики/диаграммы)
- **React Toastify** 9.1+ (уведомления)

---

## 📁 ОБЯЗАТЕЛЬНАЯ СТРУКТУРА ПРОЕКТА

```
project-name/
│
├── backend/
│   ├── main.py                    # Главный файл FastAPI
│   ├── database.py                # Подключение SQLite + инициализация таблиц
│   ├── models.py                  # Pydantic модели
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py               # Аутентификация (Login/Register/Logout/Me)
│   │   ├── admin.py              # Админ-панель (CRUD пользователей, статистика)
│   │   └── [feature].py          # Специфичные для проекта endpoints
│   ├── requirements.txt
│   ├── start_backend.bat         # Скрипт запуска Windows
│   └── start_backend.sh          # Скрипт запуска Linux/Mac
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/             # Компоненты аутентификации
│   │   │   ├── admin/            # Компоненты админ-панели
│   │   │   ├── layout/           # Layout (Navbar, Sidebar, Layout)
│   │   │   └── [feature]/        # Специфичные компоненты
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── AdminPage.jsx
│   │   │   └── [Feature]Page.jsx
│   │   ├── services/
│   │   │   └── api.js            # Axios + API функции
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Контекст аутентификации
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── start_frontend.bat        # Скрипт запуска Windows
│   └── start_frontend.sh         # Скрипт запуска Linux/Mac
│
├── database.db                    # Автоматически создаваемая БД
└── README.md                      # Инструкции по запуску
```

---

## 🔴 BACKEND: ОБЯЗАТЕЛЬНЫЕ ФАЙЛЫ И КОД

### 1. requirements.txt

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
pydantic[email]==2.5.0
python-multipart==0.0.6
```

### 2. database.py - ШАБЛОН (адаптировать под проект)

```python
import sqlite3
from datetime import datetime

class Database:
    def __init__(self, db_name: str = "database.db"):
        self.db_name = db_name
        self.init_database()
    
    def get_connection(self):
        conn = sqlite3.connect(self.db_name)
        conn.row_factory = sqlite3.Row
        return conn
    
    def init_database(self):
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # ОБЯЗАТЕЛЬНО: Таблица users (НЕ ИЗМЕНЯТЬ!)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT 1
            )
        ''')
        
        # ОБЯЗАТЕЛЬНО: Таблица sessions (НЕ ИЗМЕНЯТЬ!)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        ''')
        
        # ОБЯЗАТЕЛЬНО: Создать дефолтного админа (НЕ ИЗМЕНЯТЬ!)
        cursor.execute('''
            INSERT OR IGNORE INTO users (id, username, email, password, role) 
            VALUES (1, 'admin', 'admin@admin.com', 'admin123', 'admin')
        ''')
        
        # ДОБАВИТЬ ТАБЛИЦЫ ДЛЯ СПЕЦИФИЧНОГО ФУНКЦИОНАЛА ПРОЕКТА
        # Пример для task manager:
        # cursor.execute('''CREATE TABLE IF NOT EXISTS projects (...) ''')
        # cursor.execute('''CREATE TABLE IF NOT EXISTS tasks (...) ''')
        
        conn.commit()
        conn.close()

db = Database()
```

### 3. routes/auth.py - ТОЧНЫЙ КОД (НЕ ИЗМЕНЯТЬ!)

```python
from fastapi import APIRouter, HTTPException, Response, Cookie
from typing import Optional
import sqlite3
from models import UserRegister, UserLogin, UserResponse
from database import db

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
def register(user: UserRegister):
    conn = db.get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            (user.username, user.email, user.password)
        )
        conn.commit()
        user_id = cursor.lastrowid
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        new_user = dict(cursor.fetchone())
        return new_user
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    finally:
        conn.close()

@router.post("/login", response_model=UserResponse)
def login(credentials: UserLogin, response: Response):
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM users WHERE username = ? AND password = ? AND is_active = 1",
        (credentials.username, credentials.password)
    )
    user = cursor.fetchone()
    if not user:
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    cursor.execute("INSERT INTO sessions (user_id) VALUES (?)", (user['id'],))
    session_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    response.set_cookie(
        key="session_id", value=str(session_id), httponly=True,
        max_age=86400 * 7, samesite="lax"
    )
    return dict(user)

@router.post("/logout")
def logout(response: Response, session_id: Optional[str] = Cookie(None)):
    if session_id:
        conn = db.get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
        conn.commit()
        conn.close()
    response.delete_cookie(key="session_id")
    return {"message": "Logged out"}

@router.get("/me", response_model=UserResponse)
def get_current_user(session_id: Optional[str] = Cookie(None)):
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT u.* FROM users u
        JOIN sessions s ON u.id = s.user_id
        WHERE s.id = ? AND u.is_active = 1
    """, (session_id,))
    user = cursor.fetchone()
    conn.close()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    return dict(user)
```

### 4. routes/admin.py - ТОЧНЫЙ КОД (НЕ ИЗМЕНЯТЬ!)

```python
from fastapi import APIRouter, HTTPException, Depends
from typing import List
import sqlite3
from models import UserResponse, UserUpdate
from database import db
from routes.auth import get_current_user

router = APIRouter(prefix="/api/admin", tags=["Admin"])

def require_admin(current_user: UserResponse = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.get("/users", response_model=List[UserResponse])
def get_all_users(admin: UserResponse = Depends(require_admin)):
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users ORDER BY created_at DESC")
    users = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return users

@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_update: UserUpdate, admin: UserResponse = Depends(require_admin)):
    conn = db.get_connection()
    cursor = conn.cursor()
    update_fields = []
    values = []
    if user_update.username is not None:
        update_fields.append("username = ?")
        values.append(user_update.username)
    if user_update.email is not None:
        update_fields.append("email = ?")
        values.append(user_update.email)
    if user_update.role is not None:
        update_fields.append("role = ?")
        values.append(user_update.role)
    if user_update.is_active is not None:
        update_fields.append("is_active = ?")
        values.append(1 if user_update.is_active else 0)
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    values.append(user_id)
    query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = ?"
    try:
        cursor.execute(query, values)
        conn.commit()
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        updated_user = cursor.fetchone()
        conn.close()
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")
        return dict(updated_user)
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="Username or email already exists")

@router.delete("/users/{user_id}")
def delete_user(user_id: int, admin: UserResponse = Depends(require_admin)):
    if user_id == 1:
        raise HTTPException(status_code=400, detail="Cannot delete default admin")
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="User not found")
    conn.close()
    return {"message": "User deleted"}

@router.get("/stats")
def get_statistics(admin: UserResponse = Depends(require_admin)):
    conn = db.get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as total FROM users")
    total_users = cursor.fetchone()['total']
    cursor.execute("SELECT COUNT(*) as active FROM users WHERE is_active = 1")
    active_users = cursor.fetchone()['active']
    cursor.execute("SELECT COUNT(*) as admins FROM users WHERE role = 'admin'")
    admin_count = cursor.fetchone()['admins']
    cursor.execute("SELECT COUNT(*) as recent FROM users WHERE created_at >= datetime('now', '-7 days')")
    recent_registrations = cursor.fetchone()['recent']
    conn.close()
    return {
        "total_users": total_users,
        "active_users": active_users,
        "admin_count": admin_count,
        "recent_registrations": recent_registrations
    }
```

### 5. main.py - ШАБЛОН (добавить специфичные роуты)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import db
from routes import auth, admin  # + импортировать специфичные роуты

db.init_database()

app = FastAPI(title="[PROJECT NAME] API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
# Добавить специфичные роуты

@app.get("/")
def root():
    return {"message": "API running", "docs": "/docs"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
```

### 6. models.py - ШАБЛОН (добавить специфичные модели)

```python
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import datetime

# ОБЯЗАТЕЛЬНЫЕ МОДЕЛИ (НЕ ИЗМЕНЯТЬ!)
class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    created_at: str
    is_active: bool

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[Literal['user', 'admin']] = None
    is_active: Optional[bool] = None

# ДОБАВИТЬ СПЕЦИФИЧНЫЕ МОДЕЛИ ПРОЕКТА
```

### 7. Скрипты запуска Backend

**start_backend.bat:**
```batch
@echo off
echo Installing dependencies...
pip install -r requirements.txt
echo Starting server...
python main.py
pause
```

**start_backend.sh:**
```bash
#!/bin/bash
echo "Installing dependencies..."
pip install -r requirements.txt
echo "Starting server..."
python main.py
```

---

## 🔵 FRONTEND: ОБЯЗАТЕЛЬНЫЕ ФАЙЛЫ И КОД

### 1. package.json

```json
{
  "name": "project-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "@mui/material": "^5.14.20",
    "@mui/icons-material": "^5.14.19",
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "framer-motion": "^10.16.16",
    "recharts": "^2.10.3",
    "react-toastify": "^9.1.3"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8"
  }
}
```

### 2. vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
})
```

### 3. src/services/api.js - ТОЧНЫЙ КОД (добавить специфичные API)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

export const adminAPI = {
  getAllUsers: () => api.get('/admin/users'),
  updateUser: (userId, userData) => api.put(`/admin/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getStats: () => api.get('/admin/stats'),
};

// Добавить специфичные API endpoints здесь

export default api;
```

### 4. src/context/AuthContext.jsx - ТОЧНЫЙ КОД (НЕ ИЗМЕНЯТЬ!)

```javascript
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      setUser(response.data);
      toast.success('Успешный вход!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка входа');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      setUser(response.data);
      toast.success('Регистрация успешна!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка регистрации');
      return false;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      toast.info('Вы вышли из системы');
    } catch (error) {
      setUser(null);
    }
  };

  const isAdmin = () => user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### 5. src/App.jsx - ШАБЛОН (добавить специфичные роуты)

```javascript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import Layout from './components/layout/Layout';

const theme = createTheme({
  palette: { mode: 'light', primary: { main: '#1976d2' } },
});

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh'}}>Загрузка...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin()) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
              {/* Добавить специфичные роуты */}
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
```

### 6. Скрипты запуска Frontend

**start_frontend.bat:**
```batch
@echo off
echo Installing dependencies...
call npm install
echo Starting dev server...
npm run dev
pause
```

**start_frontend.sh:**
```bash
#!/bin/bash
echo "Installing dependencies..."
npm install
echo "Starting dev server..."
npm run dev
```

### 7. Обязательные страницы и компоненты

**ОБЯЗАТЕЛЬНО создать:**
- `src/pages/LoginPage.jsx` - страница входа с Material-UI и Framer Motion
- `src/pages/RegisterPage.jsx` - страница регистрации
- `src/pages/DashboardPage.jsx` - главная страница после входа
- `src/pages/AdminPage.jsx` - админ-панель с таблицей пользователей и статистикой
- `src/components/layout/Layout.jsx` - основной layout с Navbar и Sidebar
- `src/components/layout/Navbar.jsx` - навигационная панель
- `src/components/layout/Sidebar.jsx` - боковое меню

---

## 🎨 ДИЗАЙН И UI ПРИНЦИПЫ

### Выбор UI библиотеки:
- **Material-UI** → Корпоративные/профессиональные приложения (CRM, панели управления)
- **Ant Design** → Админ-панели с большим количеством таблиц и данных
- **Tailwind CSS** → Кастомный дизайн, уникальный брендинг

### Анимации (Framer Motion):
```javascript
import { motion } from 'framer-motion';

// Использовать для страниц и карточек
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* контент */}
</motion.div>
```

### Графики (Recharts):
```javascript
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
```

---

## ✅ ЧЕК-ЛИСТ КАЧЕСТВА

### Backend:
- [ ] Все routes работают и протестированы через /docs
- [ ] БД инициализируется автоматически
- [ ] Дефолтный админ создан (admin/admin123)
- [ ] CORS настроен правильно
- [ ] Обработка ошибок реализована

### Frontend:
- [ ] Система аутентификации работает
- [ ] Защищенные routes функционируют
- [ ] Админ-панель доступна только админам
- [ ] Анимации плавные и уместные
- [ ] UI адаптивный
- [ ] Toast уведомления работают
- [ ] Нет пустых/нефункциональных элементов
- [ ] Графики отображают реальные данные (если есть)

### Интеграция:
- [ ] Frontend корректно взаимодействует с Backend
- [ ] Сессии управляются правильно
- [ ] Данные синхронизируются

---

## 📋 ШАБЛОН ПРОМТА ДЛЯ ПОЛЬЗОВАТЕЛЯ

```
Создай полноценное веб-приложение "[НАЗВАНИЕ]" для [ОПИСАНИЕ НАЗНАЧЕНИЯ].

ОСНОВНОЙ ФУНКЦИОНАЛ:
1. [Функция 1]
2. [Функция 2]
3. [Функция 3]

РОЛИ:
- Администратор: [права доступа]
- Пользователь: [права доступа]

СПЕЦИФИЧНЫЕ ТРЕБОВАНИЯ:
[Детали функционала, какие данные хранить, какие операции выполнять]

ДИЗАЙН:
- Современный интерфейс
- [Если нужны] Графики и статистика
- Плавные анимации

ТЕХНОЛОГИИ:
- Backend: FastAPI + SQLite
- Frontend: React + Vite + [выбери подходящую UI библиотеку]
- Анимации: Framer Motion
- Графики: [если нужны] Recharts

ВАЖНО:
- Следуй структуре из ROADMAP
- Все роуты должны работать
- Дефолтный админ: admin / admin123
- Создай скрипты запуска
- Нет пустых UI элементов

Используй ROADMAP для создания качественного проекта с первой попытки.
```

---

## 📝 ПРИМЕРЫ КОНКРЕТНЫХ ПРОЕКТОВ

### Пример 1: Task Manager

```
Создай "TaskFlow" - систему управления задачами.

ФУНКЦИОНАЛ:
1. Создание/редактирование/удаление задач
2. Организация по проектам
3. Приоритеты (low/medium/high) и дедлайны
4. Статусы (todo/in_progress/done)
5. Фильтрация и поиск
6. Статистика с графиками

РОЛИ:
- Администратор: управление всеми проектами и пользователями
- Пользователь: управление своими задачами

ТАБЛИЦЫ:
- projects: id, name, description, user_id, created_at
- tasks: id, title, description, status, priority, deadline, project_id, user_id, created_at

ДАШБОРД:
- Графики выполненных задач
- Распределение по приоритетам
- Канбан-доска

UI: Material-UI
```

### Пример 2: Inventory System

```
Создай "StockMaster" - систему управления складом.

ФУНКЦИОНАЛ:
1. Учет товаров (CRUD)
2. Поступления и отгрузки
3. Алерты о низком уровне
4. История операций
5. Категоризация
6. Отчеты с графиками

РОЛИ:
- Администратор: полное управление, аналитика
- Пользователь: просмотр, создание заявок

ТАБЛИЦЫ:
- categories: id, name, description
- products: id, name, category_id, quantity, min_quantity, price, supplier, last_updated
- transactions: id, product_id, type, quantity, date, user_id, notes

ДАШБОРД:
- Графики динамики запасов
- Топ товаров
- Таблица с низким уровнем (красные алерты)

UI: Ant Design
```

---

## 🎯 ФИНАЛЬНЫЕ ИНСТРУКЦИИ

**Для Claude Code:**
1. Прочитай весь ROADMAP перед началом
2. Создай ПОЛНУЮ структуру проекта
3. Реализуй ВСЕ обязательные компоненты
4. Добавь специфичный функционал
5. Создай рабочие скрипты запуска
6. Напиши README.md
7. Протестируй все endpoints
8. Убедись что frontend + backend работают вместе

**КРИТИЧНО:** Всё должно работать с первой попытки. Без заглушек и placeholder кода!

---

**Версия:** 2.0 | **Дата:** 2025 | **Цель:** Production-ready приложения одним промтом
