# 🚀 Transport Management System - Deployment Guide

## Prerequisites
- GitHub account
- Your code pushed to a GitHub repository

---

## Option 1: Deploy on Render (Recommended - FREE)

### Step 1: Prepare Backend for Deployment

1. **Install production dependencies:**
```bash
cd transport
pip install gunicorn whitenoise dj-database-url psycopg2-binary
pip freeze > requirements.txt
```

2. **Update settings.py** (already configured in your project)

3. **Create `render.yaml`** (see file in root directory)

### Step 2: Deploy Backend on Render

1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** transport-backend
   - **Root Directory:** `transport`
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn transport.wsgi:application`
   - **Instance Type:** Free

5. Add Environment Variables:
   ```
   DJANGO_SECRET_KEY=your-secret-key-here
   DEBUG=False
   ALLOWED_HOSTS=your-app-name.onrender.com
   DATABASE_URL=(Render will auto-create PostgreSQL)
   ```

6. Click "Create Web Service"

7. **Add PostgreSQL Database:**
   - Go to Dashboard → "New +" → "PostgreSQL"
   - Name it `transport-db`
   - Copy the "Internal Database URL"
   - Add it to your web service as `DATABASE_URL`

8. **Run Migrations:**
   - In Render dashboard, go to "Shell"
   - Run:
     ```bash
     python manage.py migrate
     python manage.py createsuperuser
     ```

### Step 3: Deploy Frontend on Render

1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name:** transport-frontend
   - **Root Directory:** `frontend/my_app`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `build`

4. Add Environment Variable:
   ```
   REACT_APP_API_URL=https://your-backend-name.onrender.com
   ```

5. Click "Create Static Site"

### Step 4: Update CORS Settings

Update your backend's `settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    'https://your-frontend-name.onrender.com',
]
```

Redeploy backend.

---

## Option 2: Deploy on Railway (Alternative - FREE)

### Step 1: Deploy Backend

1. Go to [railway.app](https://railway.app) and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway auto-detects Django
5. Add Environment Variables:
   ```
   DJANGO_SECRET_KEY=your-secret-key
   DEBUG=False
   PORT=8000
   ```

6. Add PostgreSQL:
   - Click "New" → "Database" → "PostgreSQL"
   - Railway auto-connects it

7. Get your backend URL from Railway dashboard

### Step 2: Deploy Frontend

1. Create new Railway project
2. Connect GitHub repo
3. Set Root Directory: `frontend/my_app`
4. Add Environment Variable:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app
   ```

---

## Option 3: Vercel (Frontend) + Render (Backend)

### Backend on Render
Follow Option 1 steps for backend

### Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend/my_app`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

5. Add Environment Variable:
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com
   ```

6. Click "Deploy"

---

## 📋 Pre-Deployment Checklist

### Backend (Django)
- ✅ `DEBUG = False` in production
- ✅ Set `ALLOWED_HOSTS`
- ✅ Configure `CORS_ALLOWED_ORIGINS`
- ✅ Use PostgreSQL (not SQLite)
- ✅ Collect static files
- ✅ Set strong `SECRET_KEY`
- ✅ Install `gunicorn`, `whitenoise`, `dj-database-url`

### Frontend (React)
- ✅ Update API URL to production backend
- ✅ Build optimized production bundle
- ✅ Test all API endpoints

---

## 🔧 Common Issues & Solutions

### Issue 1: CORS Errors
**Solution:** Add frontend URL to `CORS_ALLOWED_ORIGINS` in backend settings

### Issue 2: Static Files Not Loading
**Solution:** Run `python manage.py collectstatic` and configure WhiteNoise

### Issue 3: Database Connection Error
**Solution:** Check `DATABASE_URL` environment variable

### Issue 4: 502 Bad Gateway
**Solution:** Check backend logs, ensure gunicorn is running

---

## 🎯 Quick Start Commands

### Backend
```bash
cd transport
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
gunicorn transport.wsgi:application
```

### Frontend
```bash
cd frontend/my_app
npm install
npm run build
```

---

## 📱 After Deployment

1. **Test all features:**
   - Login (admin, driver, student)
   - Bus management
   - Seat assignment
   - Attendance marking
   - Fee management
   - Emergency alerts

2. **Create admin user:**
   ```bash
   python manage.py createsuperuser
   ```

3. **Load sample data** (optional):
   - Use Django admin to add buses, drivers, students

---

## 💰 Cost Comparison

| Platform | Backend | Frontend | Database | Total/Month |
|----------|---------|----------|----------|-------------|
| Render   | Free    | Free     | Free     | $0          |
| Railway  | Free    | Free     | Free     | $0          |
| Vercel + Render | Free | Free | Free | $0          |

**Note:** Free tiers have limitations (sleep after inactivity, limited resources)

---

## 🔐 Security Best Practices

1. **Never commit sensitive data:**
   - Use environment variables
   - Add `.env` to `.gitignore`

2. **Use strong passwords:**
   - Generate random `SECRET_KEY`
   - Use password managers

3. **Enable HTTPS:**
   - All platforms provide free SSL

4. **Regular updates:**
   - Keep dependencies updated
   - Monitor security advisories

---

## 📞 Support

If you encounter issues:
1. Check platform documentation
2. Review deployment logs
3. Test locally first
4. Check environment variables

---

## 🎉 You're Ready to Deploy!

Choose your preferred platform and follow the steps above. Good luck! 🚀
