# Render Deployment Setup Guide

## Backend Service Configuration

### Environment Variables (Required)

Go to your backend service on Render → Environment tab and add:

```
DATABASE_URL=<automatically set by Render when you link PostgreSQL>
DJANGO_SECRET_KEY=<generate at https://djecrety.ir/>
DEBUG=False
ALLOWED_HOSTS=your-backend-name.onrender.com
CORS_ALLOWED_ORIGINS=https://your-frontend-name.onrender.com,http://localhost:3000
```

### Build Command
```bash
pip install -r requirements.txt && python manage.py collectstatic --noinput
```

### Start Command
```bash
python manage.py migrate && gunicorn transport.wsgi:application
```

---

## Frontend Service Configuration

### Environment Variables

Go to your frontend service on Render → Environment tab and add:

```
REACT_APP_API_URL=https://your-backend-name.onrender.com
```

### Build Command
```bash
npm install && npm run build
```

### Publish Directory
```
build
```

---

## PostgreSQL Database Setup

1. Create PostgreSQL database on Render
2. Link it to your backend service (Render will auto-set DATABASE_URL)
3. After backend deploys, run migrations:
   - Go to backend service → Shell
   - Run: `python manage.py migrate`
   - Run: `python manage.py createsuperuser`

---

## Troubleshooting Slow Loading

### Why is it slow?

Render's free tier services "spin down" after 15 minutes of inactivity. The first request after inactivity takes 30-60 seconds to wake up the service.

### Solutions:

1. **Upgrade to Paid Plan** ($7/month) - Services stay active 24/7

2. **Use a Ping Service** (Free) - Keep your service awake:
   - [UptimeRobot](https://uptimerobot.com/) - Free monitoring
   - [Cron-Job.org](https://cron-job.org/) - Free scheduled pings
   - Set to ping your backend URL every 10 minutes

3. **Add Loading States** - Improve UX:
   - Show "Waking up server..." message
   - Add timeout handling in frontend

4. **Optimize Database Queries**:
   - Use `select_related()` and `prefetch_related()`
   - Add database indexes
   - Enable query caching

---

## Testing Your Deployment

### 1. Test Backend API
```bash
curl https://your-backend-name.onrender.com/api/
```

### 2. Test Frontend
Open: `https://your-frontend-name.onrender.com`

### 3. Test Login Flow
- Try logging in
- Check browser console for errors
- Check Network tab for API calls

### 4. Common Issues

**CORS Error:**
- Update `CORS_ALLOWED_ORIGINS` in backend environment variables
- Redeploy backend

**Database Error:**
- Check `DATABASE_URL` is set
- Run migrations in Shell

**Static Files Not Loading:**
- Run `python manage.py collectstatic --noinput`
- Check `STATIC_ROOT` and `STATIC_URL` settings

**502 Bad Gateway:**
- Check backend logs
- Ensure gunicorn is running
- Check start command

---

## Quick Commands

### Backend Shell Commands
```bash
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput

# Check database connection
python manage.py dbshell
```

### View Logs
- Go to service → Logs tab
- Watch for errors during deployment

---

## Performance Tips

1. **Enable Connection Pooling** - Already configured with `conn_max_age=600`
2. **Use Redis for Caching** - Add Redis service on Render
3. **Optimize Images** - Compress before upload
4. **Enable Gzip** - WhiteNoise handles this automatically
5. **Add Database Indexes** - For frequently queried fields

---

## Your Current URLs

Update these with your actual Render URLs:

- **Backend:** https://your-backend-name.onrender.com
- **Frontend:** https://your-frontend-name.onrender.com
- **Database:** (Internal URL, auto-configured)

---

## Need Help?

1. Check Render logs for errors
2. Test API endpoints with Postman
3. Verify environment variables are set
4. Ensure database is linked to backend service
