# 🚌 Transport Management System - Full Stack Project

## 👨‍💻 Developer: Raksha
**Role:** Full Stack Python Developer  
**Tech Stack:** Django REST Framework + React + PostgreSQL

---

## 📋 Project Overview

A comprehensive web-based transport management system designed for educational institutions to manage buses, drivers, students, attendance, and fees with real-time tracking capabilities.

### 🎯 Key Features
- Role-based access control (Admin, Driver, Student)
- Real-time bus tracking with WebSocket support
- Automated seat assignment with gender-based seating
- Distance-based fee calculation
- Emergency alert system
- Driver leave management
- Student query system
- Attendance tracking

---

## 🏗️ Project Architecture

```
transport-management-system/
│
├── transport/                      # Django Backend
│   ├── transport/                  # Project Configuration
│   │   ├── settings.py            # Django settings & configuration
│   │   ├── urls.py                # Main URL routing
│   │   ├── wsgi.py                # WSGI configuration
│   │   └── asgi.py                # ASGI for WebSocket support
│   │
│   ├── myapp/                     # Main Application
│   │   ├── models.py              # Database models (14 models)
│   │   ├── views.py               # API endpoints & business logic
│   │   ├── serializers.py         # DRF serializers with validation
│   │   ├── urls.py                # App-specific URL routing
│   │   ├── services.py            # Business logic & calculations
│   │   ├── permissions.py         # Custom permissions
│   │   ├── consumers.py           # WebSocket consumers
│   │   ├── routing.py             # WebSocket routing
│   │   └── management/            # Custom management commands
│   │       └── commands/
│   │           └── create_default_admin.py
│   │
│   ├── requirements.txt           # Python dependencies
│   └── manage.py                  # Django management script
│
├── frontend/my_app/               # React Frontend
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   │   ├── ui/               # Base UI components
│   │   │   │   ├── Button.js
│   │   │   │   ├── Card.js
│   │   │   │   ├── Input.js
│   │   │   │   └── Badge.js
│   │   │   ├── Navbar.js
│   │   │   ├── ProtectedRoute.js
│   │   │   ├── BusSeatMap.js
│   │   │   ├── RealisticBusMap.js
│   │   │   └── DriverMap.js
│   │   │
│   │   ├── pages/                # Page components
│   │   │   ├── LoginPage.tsx
│   │   │   ├── Register.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── DriverDashboard.js
│   │   │   ├── UserDashboard.js
│   │   │   ├── Profile.js
│   │   │   └── DriverAttendance.js
│   │   │
│   │   ├── context/              # React Context
│   │   │   └── AuthContext.js   # Authentication state
│   │   │
│   │   ├── api/                  # API configuration
│   │   │   └── axios.js         # Axios instance with interceptors
│   │   │
│   │   ├── App.js               # Main app component
│   │   └── index.js             # Entry point
│   │
│   ├── public/                   # Static assets
│   ├── package.json             # Node dependencies
│   └── tailwind.config.js       # Tailwind CSS configuration
│
├── render.yaml                   # Render deployment config
├── README.md                     # Project documentation
└── DEPLOYMENT_GUIDE.md          # Deployment instructions
```

---

## 🗄️ Backend Architecture (Django)

### 1. **settings.py - Configuration Hub**

```python
# Key Configurations:

# Database - PostgreSQL (Production) / MySQL (Local)
DATABASES = {
    'default': dj_database_url.config(
        default='mysql://root:password@localhost:3306/data',
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# Security Settings
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'fallback-key')
DEBUG = os.environ.get('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost').split(',')

# CORS Configuration
CORS_ALLOWED_ORIGINS = os.environ.get(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:3000'
).split(',')

# JWT Authentication
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

# Static Files (WhiteNoise)
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# WebSocket Support (Channels)
ASGI_APPLICATION = 'transport.asgi.application'
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}
```

**Why These Choices?**
- **PostgreSQL:** Production-grade database with better performance
- **JWT:** Stateless authentication for scalability
- **WhiteNoise:** Efficient static file serving without nginx
- **Channels:** Real-time WebSocket support for live tracking

---

### 2. **models.py - Database Schema (14 Models)**

#### Core Models:

**User Model (Custom AbstractUser)**
```python
class User(AbstractUser):
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    # ADMIN, DRIVER, TEACHER, STUDENT
    
    # Common fields
    phone = models.CharField(max_length=15)
    address = models.TextField()
    
    # Driver-specific
    driving_experience = models.IntegerField()
    license_number = models.CharField(max_length=50)
    driver_status = models.CharField(max_length=15)
    home_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    home_longitude = models.DecimalField(max_digits=9, decimal_places=6)
    
    # Student/Teacher-specific
    college_name = models.CharField(max_length=50)
    year = models.CharField(max_length=5)
    semester = models.IntegerField()
```

**Bus Model**
```python
class Bus(models.Model):
    bus_number = models.IntegerField(unique=True)
    source = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    capacity = models.IntegerField()
    status = models.CharField(max_length=15)  # WORKING, BREAKDOWN
    driver = models.ForeignKey(User, on_delete=models.SET_NULL)
    
    # Location tracking
    source_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    source_longitude = models.DecimalField(max_digits=9, decimal_places=6)
```

**Seat Model**
```python
class Seat(models.Model):
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE)
    seat_number = models.IntegerField()
    assigned_user = models.OneToOneField(User, on_delete=models.SET_NULL)
    is_available = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['bus', 'seat_number']
```

**Fee Model (Distance-based Calculation)**
```python
class Fee(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2)
    pending_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(max_length=10)
    # PENDING, PAID, OVERDUE, PARTIAL
    distance_km = models.DecimalField(max_digits=6, decimal_places=2)
    
    def save(self, *args, **kwargs):
        # Auto-calculate pending amount
        self.pending_amount = self.amount - self.paid_amount
        # Auto-update payment status
        if self.paid_amount >= self.amount:
            self.payment_status = 'PAID'
        super().save(*args, **kwargs)
```

**Other Models:**
- Attendance (Student attendance tracking)
- DriverAttendance (Driver attendance & KM tracking)
- EmergencyAlert (Breakdown alerts)
- DriverLeave (Leave management)
- StudentQuery (Student queries to admin)
- Notification (System notifications)
- Query (General queries)

---

### 3. **Database Migration to PostgreSQL**

**Local Development (MySQL):**
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'data',
        'USER': 'root',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}
```

**Production (PostgreSQL on Render):**
```python
import dj_database_url

DATABASES = {
    'default': dj_database_url.config(
        default='mysql://...',  # Fallback for local
        conn_max_age=600,       # Connection pooling
        conn_health_checks=True, # Health checks
    )
}
```

**Migration Process:**
1. Install `dj-database-url` and `psycopg2-binary`
2. Update settings.py with environment-based config
3. Set `DATABASE_URL` environment variable on Render
4. Run migrations: `python manage.py migrate`
5. Create admin: `python manage.py create_default_admin`

**Why PostgreSQL?**
- Better performance for complex queries
- Advanced features (JSON fields, full-text search)
- Better concurrency handling
- Industry standard for production

---

### 4. **views.py - API Endpoints**

**Authentication Endpoints:**
```python
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

**Admin Endpoints:**
- `/admin/available-drivers/` - Get all drivers
- `/admin/students/` - Get all students with fee status
- `/admin/auto-assign-bus/` - Auto-assign students to bus
- `/admin/update-driver/<id>/` - Update driver details
- `/admin/send-fee-reminder/<id>/` - Send fee reminder

**Driver Endpoints:**
- `/driver/dashboard-stats/` - Get driver statistics
- `/driver/my-bus-students/` - Get assigned students
- `/driver/bulk-mark-attendance/` - Mark attendance
- `/driver/breakdown-alert/` - Send emergency alert

**Student Endpoints:**
- `/dashboard/user/` - Get student dashboard
- `/student-queries/submit/` - Submit query
- `/fees/` - View fee details

---

### 5. **serializers.py - Data Validation**

**Strong Validation Rules:**
```python
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        min_length=8,
        validators=[validate_password]
    )
    phone = serializers.CharField(
        validators=[
            RegexValidator(
                regex=r'^\d{10}$',
                message='Phone must be 10 digits'
            )
        ]
    )
    
    def validate_username(self, value):
        if len(value) < 3:
            raise ValidationError("Min 3 characters")
        return value
    
    def validate(self, attrs):
        # Role-specific validation
        if attrs['role'] == 'DRIVER':
            if not attrs.get('license_number'):
                raise ValidationError("License required")
        return attrs
```

**Validation Features:**
- Password: Min 8 chars, complexity check
- Phone: Exactly 10 digits
- Email: Valid format, unique
- Username: Min 3 chars, alphanumeric
- License: Min 5 chars (drivers)
- Role-specific required fields

---

### 6. **services.py - Business Logic**

**Distance-based Fee Calculation:**
```python
def calculate_distance_fee(student_location, bus_route):
    """
    Calculate fee based on distance from student home to bus route
    Rate: ₹5 per km
    """
    distance = calculate_distance(
        student_location,
        bus_route
    )
    base_fee = 500  # Base monthly fee
    distance_fee = distance * 5
    total_fee = base_fee + distance_fee
    return total_fee, distance
```

**Auto-Assignment Algorithm:**
```python
def auto_assign_students_to_bus(bus_id):
    """
    Smart seat assignment:
    1. Female students in front rows (1-20)
    2. Male students in back rows (21-40)
    3. Location-based matching
    """
    bus = Bus.objects.get(id=bus_id)
    unassigned_students = User.objects.filter(
        role='STUDENT',
        assigned_seat__isnull=True
    )
    
    # Separate by gender
    female_students = unassigned_students.filter(gender='FEMALE')
    male_students = unassigned_students.filter(gender='MALE')
    
    # Assign front seats to females
    front_seats = bus.seats.filter(
        seat_number__lte=20,
        is_available=True
    )
    
    # Assign back seats to males
    back_seats = bus.seats.filter(
        seat_number__gt=20,
        is_available=True
    )
    
    # Perform assignments...
```

---

## 🎨 Frontend Architecture (React)

### 1. **Component Structure**

**Base UI Components (Reusable):**
```javascript
// Button.js - Styled button with variants
export const Button = ({ 
  variant = 'primary',  // primary, secondary, outline, danger
  size = 'md',          // sm, md, lg
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  ...props 
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={isLoading}
      {...props}
    >
      {leftIcon && <span>{leftIcon}</span>}
      {isLoading ? 'Loading...' : children}
      {rightIcon && <span>{rightIcon}</span>}
    </button>
  );
};
```

**Card Component:**
```javascript
export const Card = ({ 
  children, 
  hoverEffect = false,
  className = '' 
}) => {
  return (
    <div className={`
      bg-gray-900/80 
      backdrop-blur-sm 
      border border-gray-800 
      rounded-lg 
      p-6 
      ${hoverEffect ? 'hover:border-emerald-500 transition-all' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};
```

---

### 2. **Authentication System**

**AuthContext.js - Global Auth State:**
```javascript
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token
    const token = sessionStorage.getItem('access_token');
    if (token) {
      loadUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const response = await axiosInstance.post('/auth/login/', credentials);
    sessionStorage.setItem('access_token', response.data.access);
    sessionStorage.setItem('refresh_token', response.data.refresh);
    setUser(response.data.user);
    return response.data.user;
  };

  const logout = () => {
    sessionStorage.clear();
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Protected Routes:**
```javascript
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  
  if (!user) return <Navigate to="/login" />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};
```

---

### 3. **API Integration**

**axios.js - Configured Instance:**
```javascript
const axiosInstance = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

// Response interceptor - Handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = sessionStorage.getItem('refresh_token');
      const response = await axios.post('/auth/token/refresh/', {
        refresh: refreshToken,
      });
      sessionStorage.setItem('access_token', response.data.access);
      // Retry original request
      return axiosInstance(error.config);
    }
    return Promise.reject(error);
  }
);
```

---

### 4. **Dashboard Components**

**Admin Dashboard Features:**
- Bus management (CRUD operations)
- Driver management (Add, Edit, Delete)
- Student management (View, Filter by college/fee status)
- Auto-assign students to buses
- Emergency alerts monitoring
- Leave request approval
- Student query management

**Driver Dashboard Features:**
- View assigned bus and students
- Mark student attendance (bulk)
- Send emergency breakdown alerts
- View driving statistics
- Update location in real-time

**Student Dashboard Features:**
- View assigned bus and seat
- View fee details and payment status
- Submit queries to admin
- View attendance history
- Track bus location in real-time

---

### 5. **Real-time Features**

**Bus Tracking Component:**
```javascript
const RealisticBusMap = ({ busId }) => {
  const [busLocation, setBusLocation] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    // WebSocket connection for real-time updates
    const ws = new WebSocket(
      `wss://backend.com/ws/bus-location/${busId}/`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setBusLocation(data.location);
    };

    return () => ws.close();
  }, [busId]);

  return (
    <div className="bus-map">
      {/* Interactive seat map with student details */}
      <SeatGrid seats={students} />
    </div>
  );
};
```

---

## 🎨 Styling & UI/UX

**Tailwind CSS Configuration:**
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        emerald: {
          500: '#10b981',
          600: '#059669',
        },
        gray: {
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
      },
    },
  },
};
```

**Design System:**
- Dark theme with emerald accents
- Glassmorphism effects (backdrop-blur)
- Smooth animations (Framer Motion)
- Responsive grid layouts
- Accessible color contrast
- Loading states and skeletons

---

## 🚀 Deployment Architecture

**Render.com Configuration:**

```yaml
services:
  # Backend (Django)
  - type: web
    name: transport-backend
    env: python
    buildCommand: "pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate && python manage.py create_default_admin"
    startCommand: "gunicorn transport.wsgi:application"
    envVars:
      - key: DATABASE_URL
        fromDatabase: transport-db
      - key: DJANGO_SECRET_KEY
        generateValue: true
      - key: DEBUG
        value: False

  # Frontend (React)
  - type: static
    name: transport-frontend
    buildCommand: "npm install && npm run build"
    staticPublishPath: build
    envVars:
      - key: REACT_APP_API_URL
        value: https://transport-backend.onrender.com

databases:
  - name: transport-db
    region: singapore
    plan: free
```

**Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string
- `DJANGO_SECRET_KEY`: Secure random key
- `DEBUG`: False in production
- `ALLOWED_HOSTS`: Backend domain
- `CORS_ALLOWED_ORIGINS`: Frontend domain
- `REACT_APP_API_URL`: Backend API URL

---

## 📊 Key Technical Achievements

### Backend:
1. ✅ **Custom User Model** with role-based access
2. ✅ **14 Database Models** with relationships
3. ✅ **JWT Authentication** with token refresh
4. ✅ **Strong Validation** (phone, email, password)
5. ✅ **WebSocket Support** for real-time tracking
6. ✅ **Distance-based Fee Calculation**
7. ✅ **Smart Auto-assignment Algorithm**
8. ✅ **RESTful API** with 50+ endpoints
9. ✅ **Database Migration** (MySQL → PostgreSQL)
10. ✅ **Production-ready** with security best practices

### Frontend:
1. ✅ **React 18** with Hooks and Context API
2. ✅ **Protected Routes** with role-based access
3. ✅ **Responsive Design** (mobile-first)
4. ✅ **Real-time Updates** with WebSocket
5. ✅ **Form Validation** (frontend + backend)
6. ✅ **Error Handling** with user-friendly messages
7. ✅ **Loading States** and optimistic updates
8. ✅ **Tailwind CSS** with custom design system
9. ✅ **Axios Interceptors** for token management
10. ✅ **Component Reusability** (DRY principle)

---

## 🔒 Security Features

1. **Authentication:**
   - JWT tokens with expiration
   - Secure password hashing (Django's PBKDF2)
   - Token refresh mechanism
   - Session management

2. **Authorization:**
   - Role-based access control
   - Protected API endpoints
   - Frontend route protection
   - Permission classes

3. **Data Validation:**
   - Input sanitization
   - SQL injection prevention (ORM)
   - XSS protection
   - CSRF protection

4. **Production Security:**
   - HTTPS enforcement
   - Secure cookies
   - CORS configuration
   - Environment-based secrets

---

## 📈 Performance Optimizations

1. **Database:**
   - Connection pooling (`conn_max_age=600`)
   - Database indexes on foreign keys
   - Query optimization with `select_related()`
   - Health checks

2. **Static Files:**
   - WhiteNoise for efficient serving
   - Compressed static files
   - CDN-ready assets

3. **Frontend:**
   - Code splitting
   - Lazy loading
   - Optimized images
   - Minified production build

4. **API:**
   - Pagination for large datasets
   - Caching strategies
   - Efficient serializers

---

## 🧪 Testing & Quality

**Backend Testing:**
```python
# Example test
class UserModelTest(TestCase):
    def test_create_driver(self):
        driver = User.objects.create_user(
            username='driver1',
            password='testpass123',
            role='DRIVER',
            license_number='DL12345'
        )
        self.assertEqual(driver.role, 'DRIVER')
        self.assertTrue(driver.check_password('testpass123'))
```

**Code Quality:**
- PEP 8 compliance
- Type hints where applicable
- Docstrings for complex functions
- Error handling
- Logging

---

## 📱 Responsive Design

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Mobile-First Approach:**
```javascript
<div className="
  grid 
  grid-cols-1          // Mobile: 1 column
  md:grid-cols-2       // Tablet: 2 columns
  lg:grid-cols-3       // Desktop: 3 columns
  gap-4
">
  {/* Content */}
</div>
```

---

## 🎯 Future Enhancements

1. **SMS Notifications** for fee reminders
2. **Email Verification** for new accounts
3. **GPS Integration** for accurate tracking
4. **Payment Gateway** integration
5. **Mobile App** (React Native)
6. **Analytics Dashboard** with charts
7. **Export Reports** (PDF, Excel)
8. **Multi-language Support**
9. **Dark/Light Theme Toggle**
10. **Push Notifications**

---

## 📞 API Documentation

**Base URL:** `https://transport-backend.onrender.com/api`

**Authentication:**
```
POST /auth/login/
POST /auth/register/
POST /auth/token/refresh/
GET  /auth/profile/
```

**Admin Endpoints:**
```
GET  /admin/available-drivers/
GET  /admin/students/
POST /admin/auto-assign-bus/
PATCH /admin/update-driver/<id>/
DELETE /admin/delete-driver/<id>/
```

**Driver Endpoints:**
```
GET  /driver/dashboard-stats/
GET  /driver/my-bus-students/
POST /driver/bulk-mark-attendance/
POST /driver/breakdown-alert/
```

**Common Endpoints:**
```
GET  /buses/
GET  /seats/
GET  /fees/
GET  /emergency-alerts/
```

---

## 💡 Lessons Learned

1. **Database Design:** Proper relationships and constraints are crucial
2. **Validation:** Both frontend and backend validation needed
3. **Error Handling:** User-friendly error messages improve UX
4. **Security:** Never trust client-side validation alone
5. **Deployment:** Environment-based configuration is essential
6. **Testing:** Test early and often
7. **Documentation:** Good docs save time later
8. **Code Organization:** Modular code is maintainable code

---

## 🏆 Project Highlights

- **Full Stack:** Complete end-to-end implementation
- **Production Ready:** Deployed and accessible online
- **Scalable:** Can handle multiple institutions
- **Secure:** Industry-standard security practices
- **Modern Stack:** Latest technologies and best practices
- **Real-time:** WebSocket for live updates
- **Responsive:** Works on all devices
- **Well-documented:** Comprehensive documentation

---

## 📚 Technologies Used

**Backend:**
- Django 6.0.2
- Django REST Framework 3.15.2
- PostgreSQL (Production)
- MySQL (Development)
- JWT Authentication
- Channels (WebSocket)
- Gunicorn (WSGI Server)
- WhiteNoise (Static Files)

**Frontend:**
- React 18
- Tailwind CSS
- Axios
- React Router
- Framer Motion
- Lucide Icons

**Deployment:**
- Render.com
- GitHub
- PostgreSQL Database

**Tools:**
- Git & GitHub
- VS Code
- Postman (API Testing)
- Chrome DevTools

---

## 🎓 Conclusion

This Transport Management System demonstrates proficiency in:
- Full stack web development
- RESTful API design
- Database modeling and optimization
- Authentication and authorization
- Real-time communication
- Responsive UI/UX design
- Production deployment
- Security best practices

**Live Demo:** https://transport-frontend-bnyo.onrender.com  
**GitHub:** https://github.com/Rakshaharsha/transport-management-system

---

**Developed by Raksha**  
Full Stack Python Developer  
📧 rakesh@gmail.com  
🔗 GitHub: @Rakshaharsha
