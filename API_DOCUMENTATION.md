# Transport Management System - API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication
All endpoints (except register/login) require JWT authentication.

**Header Format:**
```
Authorization: Bearer <access_token>
```

---

## 1. Authentication Endpoints

### 1.1 Register User
**POST** `/auth/register/`

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "password2": "SecurePass123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "STUDENT",
  "phone": "1234567890"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "STUDENT"
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

### 1.2 Login
**POST** `/auth/login/`

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "STUDENT"
  },
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

### 1.3 Refresh Token
**POST** `/auth/token/refresh/`

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

### 1.4 Get Profile
**GET** `/auth/profile/`

**Response:** `200 OK`
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "STUDENT",
  "phone": "1234567890",
  "address": "123 Main St"
}
```

---

### 1.5 Update Profile
**PUT** `/auth/profile/update/`

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "phone": "9876543210",
  "address": "456 Oak Ave"
}
```

**Response:** `200 OK`

---

## 2. Dashboard Endpoints

### 2.1 Admin Dashboard
**GET** `/dashboard/admin/`

**Permission:** Admin only

**Response:** `200 OK`
```json
{
  "total_buses": 10,
  "total_drivers": 8,
  "total_students": 150,
  "total_teachers": 25,
  "pending_attendance": 12,
  "breakdown_buses": 1
}
```

---

### 2.2 Driver Dashboard
**GET** `/dashboard/driver/`

**Permission:** Driver only

**Response:** `200 OK`
```json
{
  "assigned_bus": {
    "id": 1,
    "bus_number": "BUS-001",
    "source": "Downtown",
    "destination": "University"
  },
  "salary": 3000.00,
  "today_attendance_marked": 25
}
```

---

### 2.3 User Dashboard
**GET** `/dashboard/user/`

**Permission:** Teacher/Student only

**Response:** `200 OK`
```json
{
  "assigned_seat": {
    "id": 15,
    "seat_number": 12,
    "bus_details": {
      "bus_number": "BUS-001",
      "source": "Downtown",
      "destination": "University"
    }
  },
  "unread_notifications": 3,
  "total_queries": 2
}
```

---

## 3. Bus Management

### 3.1 List All Buses
**GET** `/buses/`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "bus_number": "BUS-001",
    "source": "Downtown",
    "destination": "University",
    "capacity": 40,
    "status": "WORKING",
    "driver": 5,
    "driver_details": {
      "id": 5,
      "username": "driver1",
      "first_name": "Mike",
      "last_name": "Johnson"
    },
    "current_location": "Main Street",
    "assigned_seats_count": 35
  }
]
```

---

### 3.2 Create Bus
**POST** `/buses/`

**Permission:** Admin only

**Request Body:**
```json
{
  "bus_number": "BUS-002",
  "source": "Airport",
  "destination": "City Center",
  "capacity": 50
}
```

**Response:** `201 Created`

---

### 3.3 Assign Driver to Bus
**POST** `/buses/{id}/assign_driver/`

**Permission:** Admin only

**Request Body:**
```json
{
  "driver_id": 5
}
```

**Response:** `200 OK`

---

### 3.4 Assign Users to Bus
**POST** `/buses/{id}/assign_users/`

**Permission:** Admin only

**Request Body:**
```json
{
  "user_ids": [10, 11, 12, 13]
}
```

**Response:** `200 OK`

---

### 3.5 Update Bus Status
**PATCH** `/buses/{id}/update_status/`

**Permission:** Driver only (assigned to this bus)

**Request Body:**
```json
{
  "status": "BREAKDOWN"
}
```

**Valid Status Values:** `WORKING`, `BREAKDOWN`, `NOT_RUNNING`

**Response:** `200 OK`

---

### 3.6 Update Bus Location
**PATCH** `/buses/{id}/update_location/`

**Permission:** Driver only (assigned to this bus)

**Request Body:**
```json
{
  "current_location": "Near Central Park"
}
```

**Response:** `200 OK`

---

### 3.7 Get My Bus (Driver)
**GET** `/buses/my_bus/`

**Permission:** Driver only

**Response:** `200 OK`

---

## 4. Seat Management

### 4.1 List All Seats
**GET** `/seats/`

**Query Parameters:**
- `bus={bus_id}` - Filter by bus

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "bus": 1,
    "bus_details": {
      "bus_number": "BUS-001",
      "source": "Downtown",
      "destination": "University"
    },
    "seat_number": 1,
    "assigned_user": 10,
    "user_details": {
      "id": 10,
      "username": "student1",
      "name": "Alice Brown",
      "role": "STUDENT"
    },
    "is_available": false
  }
]
```

---

### 4.2 Get My Seat
**GET** `/seats/my_seat/`

**Permission:** Teacher/Student

**Response:** `200 OK`

---

## 5. Attendance Management

### 5.1 List Attendances
**GET** `/attendances/`

**Permissions:**
- Admin: See all
- Driver: See passengers in their bus
- Teacher/Student: See own only

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "user": 10,
    "user_details": {
      "id": 10,
      "username": "student1",
      "name": "Alice Brown",
      "role": "STUDENT"
    },
    "date": "2026-02-13",
    "status": "PRESENT",
    "is_approved": false,
    "approved_by": null,
    "remarks": null
  }
]
```

---

### 5.2 Mark Attendance
**POST** `/attendances/`

**Permission:** Driver only

**Request Body:**
```json
{
  "user": 10,
  "date": "2026-02-13",
  "status": "PRESENT"
}
```

**Valid Status Values:** `PRESENT`, `ABSENT`, `LATE`

**Response:** `201 Created`

---

### 5.3 Approve Attendance
**POST** `/attendances/{id}/approve/`

**Permission:** Admin only

**Request Body:**
```json
{
  "remarks": "Approved after verification"
}
```

**Response:** `200 OK`

---

### 5.4 Get My Attendance
**GET** `/attendances/my_attendance/`

**Permission:** Authenticated user

**Response:** `200 OK`

---

## 6. Notification Management

### 6.1 List My Notifications
**GET** `/notifications/`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "user": 10,
    "message": "You have been assigned Seat 12 in Bus BUS-001",
    "is_seen": false,
    "created_by": 1,
    "created_by_details": {
      "id": 1,
      "username": "admin",
      "name": "Admin User"
    },
    "created_at": "2026-02-13T10:30:00Z"
  }
]
```

---

### 6.2 Send Notifications
**POST** `/notifications/`

**Permission:** Admin only

**Request Body:**
```json
{
  "user_ids": [10, 11, 12],
  "message": "Bus schedule changed for tomorrow"
}
```

**Response:** `201 Created`

---

### 6.3 Mark Notification as Seen
**PATCH** `/notifications/{id}/mark_seen/`

**Response:** `200 OK`

---

### 6.4 Mark All Notifications as Seen
**POST** `/notifications/mark_all_seen/`

**Response:** `200 OK`

---

## 7. Query Management

### 7.1 List Queries
**GET** `/queries/`

**Permissions:**
- Admin: See all
- Driver: See queries about them
- Teacher/Student: See own queries

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "user": 10,
    "user_details": {
      "id": 10,
      "username": "student1",
      "name": "Alice Brown",
      "role": "STUDENT"
    },
    "driver": 5,
    "driver_details": {
      "id": 5,
      "username": "driver1",
      "name": "Mike Johnson"
    },
    "subject": "Late arrival",
    "message": "Bus arrived 15 minutes late today",
    "status": "PENDING",
    "response": null,
    "created_at": "2026-02-13T09:00:00Z"
  }
]
```

---

### 7.2 Submit Query
**POST** `/queries/`

**Permission:** Teacher/Student only

**Request Body:**
```json
{
  "driver": 5,
  "subject": "Late arrival",
  "message": "Bus arrived 15 minutes late today"
}
```

**Response:** `201 Created`

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid data provided"
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "error": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "error": "An unexpected error occurred"
}
```

---

## Rate Limiting
- No rate limiting in development
- Production: 100 requests per minute per user

## Pagination
- Default page size: 50 items
- Use `?page=2` for pagination

## Filtering
Most list endpoints support filtering:
- `/buses/?status=WORKING`
- `/attendances/?date=2026-02-13`
- `/notifications/?is_seen=false`

---

## Testing with cURL

### Login Example
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Authenticated Request Example
```bash
curl -X GET http://localhost:8000/api/buses/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
```

---

## Postman Collection
Import the API endpoints into Postman for easy testing. Set up environment variables:
- `base_url`: http://localhost:8000/api
- `access_token`: (obtained from login)

---

This documentation covers all major endpoints. For detailed field descriptions, refer to the serializers in the codebase.
