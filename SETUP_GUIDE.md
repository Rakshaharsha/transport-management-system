# Transport Management System - Setup Guide

## Project Overview
Full-stack Transport Management System with Django REST Framework backend and React frontend.

## Features
- JWT Authentication
- Role-based access control (Admin, Driver, Teacher, Student)
- Bus management with seat allocation
- Attendance tracking and approval
- Real-time notifications
- Driver salary management
- Query/complaint system

---

## Backend Setup (Django)

### 1. Prerequisites
- Python 3.8+
- MySQL Server
- pip

### 2. Database Setup
```sql
CREATE DATABASE data CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Update credentials in `transport/transport/settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'data',
        'USER': 'your_mysql_user',
        'PASSWORD': 'your_mysql_password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

### 3. Install Dependencies
```bash
cd transport
pip install -r requirements.txt
```

### 4. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 5. Create Superuser (Admin)
```bash
python manage.py createsuperuser
```

### 6. Run Development Server
```bash
python manage.py runserver
```

Backend will run on: http://localhost:8000

---

## Frontend Setup (React)

### 1. Prerequisites
- Node.js 14+
- npm or yarn

### 2. Install Dependencies
```bash
cd frontend/my_app
npm install
```

### 3. Start Development Server
```bash
npm start
```

Frontend will run on: http://localhost:3000

---

## API Endpoints

### Authentication
- POST `/api/auth/register/` - Register new user
- POST `/api/auth/login/` - Login
- POST `/api/auth/token/refresh/` - Refresh JWT token
- GET `/api/auth/profile/` - Get user profile
- PUT `/api/auth/profile/update/` - Update profile

### Dashboards
- GET `/api/dashboard/admin/` - Admin dashboard stats
- GET `/api/dashboard/driver/` - Driver dashboard
- GET `/api/dashboard/user/` - Teacher/Student dashboard

### Bus Management
- GET `/api/buses/` - List all buses
- POST `/api/buses/` - Create bus (Admin only)
- GET `/api/buses/{id}/` - Get bus details
- PUT `/api/buses/{id}/` - Update bus (Admin only)
- DELETE `/api/buses/{id}/` - Delete bus (Admin only)
- POST `/api/buses/{id}/assign_driver/` - Assign driver (Admin)
- POST `/api/buses/{id}/assign_users/` - Assign students/teachers (Admin)
- PATCH `/api/buses/{id}/update_status/` - Update bus status (Driver)
- PATCH `/api/buses/{id}/update_location/` - Update location (Driver)
- GET `/api/buses/my_bus/` - Get driver's assigned bus

### Seats
- GET `/api/seats/` - List all seats
- GET `/api/seats/my_seat/` - Get user's assigned seat

### Attendance
- GET `/api/attendances/` - List attendances
- POST `/api/attendances/` - Mark attendance (Driver)
- POST `/api/attendances/{id}/approve/` - Approve attendance (Admin)
- GET `/api/attendances/my_attendance/` - Get user's attendance

### Notifications
- GET `/api/notifications/` - List user notifications
- POST `/api/notifications/` - Send notifications (Admin)
- PATCH `/api/notifications/{id}/mark_seen/` - Mark as seen
- POST `/api/notifications/mark_all_seen/` - Mark all as seen

### Queries
- GET `/api/queries/` - List queries
- POST `/api/queries/` - Submit query (Teacher/Student)
- GET `/api/queries/{id}/` - Get query details

---

## User Roles & Permissions

### ADMIN
- Create/update/delete buses
- Assign drivers to buses
- Assign students/teachers to buses
- Approve attendance
- Update driver salaries
- Send notifications to all users
- View all queries

### DRIVER
- View assigned bus
- Update bus status (WORKING/BREAKDOWN/NOT_RUNNING)
- Update current location
- Mark attendance for passengers
- View salary
- View queries about them

### TEACHER/STUDENT
- View assigned bus and seat
- View notifications
- Submit queries about driver
- View own attendance

---

## Database Schema

### User Model
- username, email, password
- role (ADMIN/DRIVER/TEACHER/STUDENT)
- profile_photo, phone, address
- driving_experience, salary, license_number (for drivers)

### Bus Model
- bus_number, source, destination, capacity
- status (WORKING/BREAKDOWN/NOT_RUNNING)
- driver (FK to User)
- current_location

### Seat Model
- bus (FK to Bus)
- seat_number
- assigned_user (FK to User)
- is_available

### Attendance Model
- user (FK to User)
- date, status (PRESENT/ABSENT/LATE)
- is_approved, approved_by (FK to User)
- remarks

### Notification Model
- user (FK to User)
- message, is_seen
- created_by (FK to User)

### Query Model
- user (FK to User)
- driver (FK to User)
- subject, message
- status (PENDING/IN_PROGRESS/RESOLVED)
- response

---

## Testing the System

### 1. Create Admin User
```bash
python manage.py createsuperuser
```

### 2. Access Admin Panel
http://localhost:8000/admin

### 3. Create Test Data
- Create drivers with role='DRIVER'
- Create students/teachers
- Create buses
- Assign drivers to buses
- Assign users to bus seats

### 4. Test Frontend
- Register as different roles
- Login and test role-specific dashboards
- Test bus status updates (Driver)
- Test attendance marking
- Test notifications

---

## Common Issues

### MySQL Connection Error
- Ensure MySQL server is running
- Check database credentials in settings.py
- Install mysqlclient: `pip install mysqlclient`

### CORS Error
- Ensure django-cors-headers is installed
- Check CORS_ALLOWED_ORIGINS in settings.py

### JWT Token Error
- Check if djangorestframework-simplejwt is installed
- Verify token is being sent in Authorization header

---

## Production Deployment

### Backend
1. Set DEBUG=False in settings.py
2. Configure ALLOWED_HOSTS
3. Use environment variables for secrets
4. Set up proper database (PostgreSQL recommended)
5. Configure static/media file serving
6. Use gunicorn/uwsgi for WSGI server

### Frontend
1. Build production bundle: `npm run build`
2. Serve with nginx or similar
3. Update API_BASE_URL in axios.js

---

## API Documentation Format

All API responses follow this format:

**Success Response:**
```json
{
  "id": 1,
  "field1": "value1",
  "field2": "value2"
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

**List Response:**
```json
[
  {"id": 1, "field": "value"},
  {"id": 2, "field": "value"}
]
```

---

## Support
For issues or questions, please check the code comments or create an issue in the repository.
