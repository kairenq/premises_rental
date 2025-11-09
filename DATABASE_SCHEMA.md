# 🗄️ Database Schema - Premises Rental System

## Структура базы данных

Всего **14 таблиц** с полными связями.

---

## 📋 Основные таблицы

### 1. **users** (Пользователи)
- `user_id` (PK) - ID пользователя
- `full_name` - Полное имя
- `email` (UNIQUE) - Email
- `phone` - Телефон
- `role` - Роль: `admin`, `landlord`, `user`
- `password_hash` - Хеш пароля
- `created_at` - Дата регистрации

**Связи:**
- `1 → N` activity_log
- `1 → N` notifications
- `1 → N` reviews
- `1 → N` favorites
- `1 → N` leases (как tenant)
- `1 → N` maintenance_requests

---

### 2. **companies** (Компании)
- `company_id` (PK) - ID компании
- `name` - Название
- `tax_id` (UNIQUE) - ИНН
- `address` - Адрес
- `contact_person` - Контактное лицо
- `phone` - Телефон
- `email` - Email
- `description` - Описание

**Связи:**
- `1 → N` buildings

---

### 3. **buildings** (Здания)
- `building_id` (PK) - ID здания
- `company_id` (FK) → companies
- `name` - Название
- `address` - Адрес
- `year_built` - Год постройки
- `total_area` - Общая площадь
- `description` - Описание

**Связи:**
- `N → 1` companies
- `1 → N` rooms

---

### 4. **room_categories** (Категории помещений)
- `category_id` (PK) - ID категории
- `name` - Название (Офис, Склад, Коворкинг, и т.д.)
- `description` - Описание

**Связи:**
- `1 → N` rooms

---

### 5. **rooms** (Помещения)
- `room_id` (PK) - ID помещения
- `building_id` (FK, NULLABLE) → buildings
- `category_id` (FK) → room_categories
- `room_number` - Номер помещения
- `floor` - Этаж
- `area` - Площадь (м²)
- `price_per_month` - Цена за месяц (₽)
- `status` - Статус: `available`, `occupied`, `maintenance`
- `description` - Описание

**Связи:**
- `N → 1` buildings (может быть NULL)
- `N → 1` room_categories
- `1 → N` room_photos
- `1 → N` reviews
- `1 → N` favorites
- `1 → N` leases
- `1 → N` maintenance_requests

---

### 6. **leases** (Аренды)
- `lease_id` (PK) - ID аренды
- `room_id` (FK) → rooms
- `tenant_id` (FK) → users
- `start_date` - Дата начала
- `end_date` - Дата окончания
- `monthly_rent` - Аренда в месяц (₽)
- `deposit` - Депозит (₽)
- `status` - Статус: `active`, `expired`, `terminated`
- `created_at` - Дата создания

**Связи:**
- `N → 1` rooms
- `N → 1` users (tenant)
- `1 → N` payments
- `1 → N` lease_history

---

### 7. **payments** (Платежи)
- `payment_id` (PK) - ID платежа
- `lease_id` (FK) → leases
- `payment_date` - Дата платежа
- `amount` - Сумма (₽)
- `payment_method` - Способ оплаты
- `status` - Статус: `pending`, `completed`, `failed`

**Связи:**
- `N → 1` leases

---

### 8. **reviews** (Отзывы)
- `review_id` (PK) - ID отзыва
- `user_id` (FK) → users
- `room_id` (FK) → rooms
- `rating` - Оценка (1-5)
- `comment` - Комментарий
- `created_at` - Дата создания

**Связи:**
- `N → 1` users
- `N → 1` rooms

---

### 9. **maintenance_requests** (Заявки на обслуживание)
- `request_id` (PK) - ID заявки
- `room_id` (FK) → rooms
- `tenant_id` (FK) → users
- `description` - Описание проблемы
- `priority` - Приоритет: `low`, `medium`, `high`
- `status` - Статус: `pending`, `in_progress`, `resolved`, `rejected`
- `created_at` - Дата создания
- `resolved_at` - Дата решения

**Связи:**
- `N → 1` rooms
- `N → 1` users (tenant)

---

### 10. **activity_log** (Логи активности)
- `log_id` (PK) - ID лога
- `user_id` (FK) → users
- `action` - Действие
- `created_at` - Дата и время

**Связи:**
- `N → 1` users

---

### 11. **notifications** (Уведомления)
- `notification_id` (PK) - ID уведомления
- `user_id` (FK) → users
- `message` - Сообщение
- `created_at` - Дата создания
- `is_read` - Прочитано (boolean)

**Связи:**
- `N → 1` users

---

### 12. **favorites** (Избранное)
- `favorite_id` (PK) - ID записи
- `user_id` (FK) → users
- `room_id` (FK) → rooms

**Связи:**
- `N → 1` users
- `N → 1` rooms

---

### 13. **room_photos** (Фотографии помещений)
- `photo_id` (PK) - ID фото
- `room_id` (FK) → rooms
- `photo_url` - URL фото
- `description` - Описание

**Связи:**
- `N → 1` rooms (CASCADE DELETE)

---

### 14. **lease_history** (История аренд)
- `history_id` (PK) - ID записи
- `lease_id` (FK) → leases
- `change_date` - Дата изменения
- `previous_status` - Предыдущий статус
- `new_status` - Новый статус
- `comment` - Комментарий

**Связи:**
- `N → 1` leases

---

## 🔗 Диаграмма связей

```
users (1) ──→ (N) activity_log
users (1) ──→ (N) notifications
users (1) ──→ (N) reviews
users (1) ──→ (N) favorites
users (1) ──→ (N) leases
users (1) ──→ (N) maintenance_requests

companies (1) ──→ (N) buildings

buildings (1) ──→ (N) rooms

room_categories (1) ──→ (N) rooms

rooms (1) ──→ (N) room_photos
rooms (1) ──→ (N) reviews
rooms (1) ──→ (N) favorites
rooms (1) ──→ (N) leases
rooms (1) ──→ (N) maintenance_requests

leases (1) ──→ (N) payments
leases (1) ──→ (N) lease_history
```

---

## 📊 Визуализация

Открой **`database_diagram.html`** в браузере для интерактивной ER-диаграммы!

Или используй **`database_diagram.mmd`** для рендеринга через:
- [Mermaid Live Editor](https://mermaid.live/)
- VS Code расширение "Mermaid Preview"
- GitHub (автоматически рендерит .mmd файлы)

---

## 🔑 Ключевые особенности

1. **Роли пользователей:** admin, landlord, user
2. **Статусы помещений:** available, occupied, maintenance
3. **Статусы аренд:** active, expired, terminated
4. **Nullable building_id** в rooms - помещения могут существовать без здания
5. **Cascade delete** для room_photos - при удалении помещения удаляются все фото
6. **Unique constraints** на email (users) и tax_id (companies)
