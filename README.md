# 🚌 Transport Management System

A comprehensive web-based transport management system for educational institutions with real-time bus tracking, seat management, attendance tracking, and distance-based fee calculation.

## 🌟 Features

### For Students
- Real-time bus location tracking
- Seat booking and management
- Distance-based fee calculation
- Attendance history
- Emergency alerts

### For Drivers
- Mark student attendance
- View assigned routes
- Update bus location
- Send emergency notifications

### For Administrators
- Manage buses, drivers, and students
- Monitor all routes in real-time
- Generate reports
- Fee management
- System-wide analytics

## 🛠️ Tech Stack

### Backend
- Django 6.0.2
- Django REST Framework
- PostgreSQL (Production) / MySQL (Local)
- JWT Authentication
- WebSocket support with Channels

### Frontend
- React 18
- Tailwind CSS
- Axios for API calls
- React Router for navigation

### Deployment
- **Render** - Backend & Database hosting
- **Render Static** - Frontend hosting
- **PostgreSQL** - Production database
- **WhiteNoise** - Static file serving

## 📦 Local Development

### Prerequisites
- Python 3.12+
- Node.js 16+
- MySQL (for local development)

### Backend Setup
```bash
# Clone repository
git clone https://github.com/Rakshaharsha/transport-management-system.git
cd transport-management-system

# Create virtual environment
python -m venv env
env\Scripts\activate  # Windows
# source env/bin/activate  # Linux/Mac

# Install dependencies
cd transport
pip install -r requirements.txt

# Setup database
python manage.py migrate
python manage.py create_default_admin  # Creates admin/admin123
python manage.py runserver
```

### Frontend Setup
```bash
# In new terminal
cd frontend/my_app
npm install
npm start
```

### Default Login Credentials
- **Username:** admin
- **Password:** admin123
- **Role:** Administrator

*Change password after first login for security*

## 🚀 Production Deployment

### Live Application
- **Frontend:** https://transport-frontend-bnyo.onrender.com
- **Backend API:** https://transport-backend.onrender.com
- **Admin Panel:** https://transport-backend.onrender.com/admin

### Deployment Guide
See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete deployment instructions.

### Quick Deploy with Render Blueprint
1. Fork this repository
2. Connect to Render
3. Use `render.yaml` for one-click deployment
4. Set environment variables
5. Deploy automatically handles migrations and admin creation

## 📋 Environment Variables

### Backend (.env or Render Environment)
```
DATABASE_URL=postgresql://user:pass@host:port/db
DJANGO_SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.onrender.com
CORS_ALLOWED_ORIGINS=https://your-frontend.onrender.com
```

### Frontend (.env or Render Environment)
```
REACT_APP_API_URL=https://your-backend.onrender.com
```

## 🔧 API Endpoints

### Authentication
- `POST /auth/login/` - User login
- `POST /auth/token/refresh/` - Refresh JWT token
- `POST /auth/logout/` - User logout

### Core Features
- `GET /api/buses/` - List all buses
- `GET /api/drivers/` - List all drivers
- `GET /api/students/` - List all students
- `POST /api/attendance/` - Mark attendance
- `GET /api/routes/` - Get bus routes

### WebSocket Endpoints
- `/ws/bus-location/` - Real-time bus tracking
- `/ws/emergency/` - Emergency notifications

## 🐛 Troubleshooting

### Common Issues

**Slow Loading (30-60 seconds):**
- Normal for Render free tier (services sleep after 15 min)
- First request wakes up the service
- Consider upgrading to paid plan or using ping services

**CORS Errors:**
- Check `CORS_ALLOWED_ORIGINS` in backend environment
- Ensure frontend URL is correctly added

**Database Connection:**
- Verify `DATABASE_URL` is set in Render
- Check PostgreSQL service is linked to backend

**Build Failures:**
- Check Render logs for specific errors
- Verify all dependencies in requirements.txt
- Ensure Python version compatibility

## 📊 Project Structure

```
transport-management-system/
├── transport/                 # Django backend
│   ├── myapp/                # Main application
│   ├── transport/            # Project settings
│   ├── requirements.txt      # Python dependencies
│   └── manage.py            # Django management
├── frontend/my_app/          # React frontend
│   ├── src/                 # Source code
│   ├── public/              # Static assets
│   └── package.json         # Node dependencies
├── render.yaml              # Render deployment config
├── DEPLOYMENT_GUIDE.md      # Detailed deployment guide
└── README.md               # This file
```

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (Admin, Driver, Student)
- CORS protection
- HTTPS enforcement in production
- Environment-based configuration
- SQL injection protection via Django ORM

## 📈 Performance Optimizations

- Database connection pooling
- Static file compression with WhiteNoise
- Optimized database queries
- Frontend code splitting
- CDN-ready static assets

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 👤 Author

**Raksha**
- GitHub: [@Rakshaharsha](https://github.com/Rakshaharsha)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for deployment help
- Review troubleshooting section above

---

⭐ **Star this repository if it helped you!**
