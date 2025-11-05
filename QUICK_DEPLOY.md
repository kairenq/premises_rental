# ⚡ Quick Deploy Checklist

Быстрая шпаргалка для деплоя на Render + Netlify

---

## 🔧 Render (Backend)

### 1. Создать Web Service
```
Dashboard → New + → Web Service
→ Connect GitHub repo
```

### 2. Settings
```
Name: premises-rental-api
Root Directory: backend
Runtime: Python 3

Build: pip install -r requirements.txt
Start: uvicorn app.main:app --host 0.0.0.0 --port $PORT

Plan: Free
```

### 3. Environment Variables
```bash
SECRET_KEY=<generate-random-32-chars>
ENVIRONMENT=production
DATABASE_URL=sqlite:///./premises_rental.db
FRONTEND_URL=https://your-site.netlify.app  # добавить позже
```

### 4. Add Persistent Disk ⚠️
```
Disks → Add Disk
Name: data
Mount Path: /opt/render/project/src
Size: 1 GB
```

### 5. Deploy
```
Create Web Service → Wait 3-5 min
→ Copy URL: https://your-api.onrender.com
```

---

## 🎨 Netlify (Frontend)

### 1. Create Site
```
Dashboard → Add new site → Import from Git
→ Select GitHub repo
```

### 2. Settings
```
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

### 3. Environment Variables ⚠️
```bash
VITE_API_URL=https://your-api.onrender.com
```
**Важно:** Используйте ваш реальный Render URL!

### 4. Deploy
```
Deploy site → Wait 3-5 min
→ Your site: https://random-name.netlify.app
```

---

## 🔄 Update Render with Netlify URL

```
Render Dashboard → Your service → Environment
→ Add: FRONTEND_URL=https://your-site.netlify.app
→ Save (auto-redeploy)
```

---

## 👤 Create Admin User

### Option 1: Render Shell
```bash
cd backend
python3 << EOF
from app.db.database import SessionLocal
from app.models.models import User
from app.core.security import get_password_hash

db = SessionLocal()
admin = User(
    full_name="Admin",
    email="admin@example.com",
    role="admin",
    password_hash=get_password_hash("admin123")
)
db.add(admin)
db.commit()
db.close()
EOF
```

### Option 2: Register + Update
```bash
# 1. Register via UI first
# 2. Then in Render Shell:
cd backend
python3 << EOF
from app.db.database import SessionLocal
from app.models.models import User

db = SessionLocal()
user = db.query(User).filter(User.email == "your@email.com").first()
user.role = "admin"
db.commit()
db.close()
EOF
```

---

## ✅ Test

1. Open: `https://your-site.netlify.app`
2. Register/Login
3. Check admin panel (if admin)
4. Add companies, buildings, rooms
5. Upload photos

---

## 🐛 Quick Fixes

### Backend не запускается?
```
→ Check Render Logs
→ Verify all Environment Variables
→ Ensure Persistent Disk is attached
```

### Frontend не видит Backend?
```
→ Check VITE_API_URL in Netlify
→ Check FRONTEND_URL in Render
→ Open browser console (F12) for errors
```

### База данных сбрасывается?
```
→ Check Persistent Disk in Render
→ Path must be: /opt/render/project/src
```

### Фотографии не загружаются?
```
→ Check VITE_API_URL is set
→ Upload photos AFTER deploy (they're in the disk)
→ Check browser console for CORS errors
```

---

## 🔐 Security Checklist

- [ ] Generate strong SECRET_KEY
- [ ] Change default admin password
- [ ] Set ENVIRONMENT=production
- [ ] HTTPS enabled (automatic)

---

## 📝 URLs to Save

```
Backend: https://_____________________.onrender.com
Frontend: https://_____________________.netlify.app
API Docs: https://_____________________.onrender.com/docs

Admin email: _________________________
Admin password: _____________________
```

---

## 🚀 Deploy Updates

```bash
git add .
git commit -m "Your changes"
git push origin main

# Both Render and Netlify auto-deploy!
```

---

**Full guide:** See `DEPLOYMENT.md` for detailed instructions
