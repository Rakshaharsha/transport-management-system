# Transport Management System - Testing Checklist

Use this checklist to verify all features are working correctly.

---

## ✅ Pre-Testing Setup

- [ ] MySQL database created and running
- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Database migrations completed (`python manage.py migrate`)
- [ ] Superuser created (`python manage.py createsuperuser`)
- [ ] Backend server running on http://localhost:8000
- [ ] Frontend server running on http://localhost:3000

---

## 🔐 Authentication Tests

### Registration
- [ ] Register as STUDENT - Success
- [ ] Register as TEACHER - Success
- [ ] Register as DRIVER - Success
- [ ] Register with existing username - Error shown
- [ ] Register with mismatched passwords - Error shown
- [ ] Register with weak password - Error shown
- [ ] JWT tokens received after registration

### Login
- [ ] Login with valid credentials - Success
- [ ] Login with invalid username - Error shown
- [ ] Login with invalid password - Error shown
- [ ] JWT tokens received after login
- [ ] User redirected to dashboard after login

### Token Management
- [ ] Access token works for authenticated requests
- [ ] Expired token triggers refresh automatically
- [ ] Invalid token redirects to login
- [ ] Logout clears tokens and redirects to login

---

## 👤 Profile Management Tests

- [ ] View profile information
- [ ] Update first name - Success
- [ ] Update last name - Success
- [ ] Update email - Success
- [ ] Update phone - Success
- [ ] Update address - Success
- [ ] Profile photo upload (if implemented)
- [ ] Changes persist after page refresh

---

## 🚌 Bus Management Tests (Admin Only)

### Create Bus
- [ ] Create bus with valid data - Success
- [ ] Seats auto-generated based on capacity
- [ ] Create bus with duplicate number - Error shown
- [ ] Create bus with zero capacity - Error shown
- [ ] Create bus with negative capacity - Error shown

### View Buses
- [ ] List all buses
- [ ] View bus details
- [ ] See driver assignment status
- [ ] See seat utilization count
- [ ] See bus status (WORKING/BREAKDOWN/NOT_RUNNING)

### Update Bus
- [ ] Update bus source - Success
- [ ] Update bus destination - Success
- [ ] Update bus capacity - Success
- [ ] Changes reflected immediately

### Delete Bus
- [ ] Delete bus without passengers - Success
- [ ] Delete bus with passengers - Verify behavior
- [ ] Seats deleted with bus (CASCADE)

### Assign Driver
- [ ] Assign driver to bus - Success
- [ ] Driver receives notification
- [ ] Driver removed from previous bus (if any)
- [ ] Only users with DRIVER role can be assigned
- [ ] View driver details in bus list

### Assign Users (Students/Teachers)
- [ ] Assign single user - Success
- [ ] Assign multiple users - Success
- [ ] Users receive notifications with seat numbers
- [ ] Seats marked as unavailable
- [ ] Cannot assign more users than capacity
- [ ] Cannot assign user who already has seat

---

## 🪑 Seat Management Tests

### View Seats
- [ ] List all seats for a bus
- [ ] See seat number
- [ ] See assigned user (if any)
- [ ] See availability status

### My Seat (Student/Teacher)
- [ ] View assigned seat information
- [ ] See bus number
- [ ] See seat number
- [ ] See route (source → destination)
- [ ] Message shown if no seat assigned

---

## 📋 Attendance Tests

### Mark Attendance (Driver)
- [ ] Driver can mark attendance for passengers
- [ ] Select user from their bus
- [ ] Mark as PRESENT - Success
- [ ] Mark as ABSENT - Success
- [ ] Mark as LATE - Success
- [ ] Cannot mark duplicate attendance for same day
- [ ] Attendance shows as pending approval

### Approve Attendance (Admin)
- [ ] View pending attendance records
- [ ] Approve attendance - Success
- [ ] Add remarks - Success
- [ ] User receives notification
- [ ] Attendance marked as approved
- [ ] Approved by admin name shown

### View Attendance
- [ ] Admin sees all attendance
- [ ] Driver sees attendance for their bus passengers
- [ ] Student/Teacher sees own attendance only
- [ ] Filter by date
- [ ] Filter by status
- [ ] Filter by approval status

### My Attendance (Student/Teacher)
- [ ] View own attendance history
- [ ] See date, status, approval status
- [ ] See remarks if any
- [ ] Sorted by date (newest first)

---

## 🔔 Notification Tests

### Automatic Notifications
- [ ] Notification sent when bus assigned
- [ ] Notification sent when seat assigned
- [ ] Notification sent when attendance approved
- [ ] Notification sent when bus status changes
- [ ] Notification sent when bus reassigned

### View Notifications
- [ ] List all notifications
- [ ] Unread notifications highlighted
- [ ] See notification message
- [ ] See timestamp
- [ ] See sender (if applicable)
- [ ] Sorted by date (newest first)

### Mark as Read
- [ ] Mark single notification as read - Success
- [ ] Mark all notifications as read - Success
- [ ] Read notifications styled differently
- [ ] Unread count updates

### Send Notifications (Admin)
- [ ] Send to single user - Success
- [ ] Send to multiple users - Success
- [ ] Send to all users of a role - Success
- [ ] Recipients receive notifications immediately

---

## 💬 Query Management Tests

### Submit Query (Student/Teacher)
- [ ] Submit query about driver - Success
- [ ] Enter subject and message
- [ ] Query status set to PENDING
- [ ] Query appears in my queries list
- [ ] Cannot submit empty query

### View Queries
- [ ] Admin sees all queries
- [ ] Driver sees queries about them
- [ ] Student/Teacher sees own queries only
- [ ] See query subject, message, status
- [ ] See driver information
- [ ] Sorted by date (newest first)

### Query Status
- [ ] Status shows as PENDING initially
- [ ] Status can be updated to IN_PROGRESS
- [ ] Status can be updated to RESOLVED
- [ ] Status badge color changes

---

## 📊 Dashboard Tests

### Admin Dashboard
- [ ] View total buses count
- [ ] View total drivers count
- [ ] View total students count
- [ ] View total teachers count
- [ ] View pending attendance count
- [ ] View breakdown buses count
- [ ] Statistics update in real-time
- [ ] Bus management section visible
- [ ] Can create bus from dashboard

### Driver Dashboard
- [ ] View assigned bus information
- [ ] View salary amount
- [ ] View today's attendance marked count
- [ ] Update bus status buttons visible
- [ ] Update location button visible
- [ ] Message shown if no bus assigned

### Student/Teacher Dashboard
- [ ] View assigned seat information
- [ ] View bus and route details
- [ ] View unread notifications count
- [ ] View total queries count
- [ ] Notifications section visible
- [ ] Queries section visible
- [ ] Can submit new query

---

## 🚗 Driver-Specific Tests

### View Assigned Bus
- [ ] See bus number
- [ ] See route (source → destination)
- [ ] See capacity
- [ ] See current status
- [ ] See current location
- [ ] Message if no bus assigned

### Update Bus Status
- [ ] Update to WORKING - Success
- [ ] Update to BREAKDOWN - Success
- [ ] Update to NOT_RUNNING - Success
- [ ] Admin receives notification
- [ ] Status updates immediately
- [ ] Cannot update other driver's bus

### Update Location
- [ ] Enter current location - Success
- [ ] Location updates immediately
- [ ] Location visible to admin
- [ ] Cannot update other driver's bus

### View Salary
- [ ] Salary amount displayed
- [ ] Formatted correctly (currency)

---

## 🔒 Permission Tests

### Admin Permissions
- [ ] Can access admin dashboard
- [ ] Can create/update/delete buses
- [ ] Can assign drivers
- [ ] Can assign users to buses
- [ ] Can approve attendance
- [ ] Can send notifications
- [ ] Can view all queries
- [ ] Cannot access driver-specific actions
- [ ] Cannot access student/teacher-specific actions

### Driver Permissions
- [ ] Can access driver dashboard
- [ ] Can view assigned bus
- [ ] Can update bus status
- [ ] Can update location
- [ ] Can mark attendance
- [ ] Can view queries about them
- [ ] Cannot create/delete buses
- [ ] Cannot assign users
- [ ] Cannot approve attendance
- [ ] Cannot send notifications

### Teacher/Student Permissions
- [ ] Can access user dashboard
- [ ] Can view assigned seat
- [ ] Can view notifications
- [ ] Can submit queries
- [ ] Can view own attendance
- [ ] Cannot create/update buses
- [ ] Cannot mark attendance
- [ ] Cannot approve attendance
- [ ] Cannot send notifications

### Unauthenticated Access
- [ ] Cannot access dashboard without login
- [ ] Cannot access API endpoints without token
- [ ] Redirected to login page
- [ ] Can access login page
- [ ] Can access register page

---

## 🔄 Business Logic Tests

### Seat Allocation
- [ ] Seats created automatically when bus created
- [ ] Number of seats equals bus capacity
- [ ] Seats numbered sequentially (1, 2, 3...)
- [ ] Users assigned to available seats only
- [ ] Seat marked unavailable when assigned
- [ ] Cannot assign more users than capacity
- [ ] One user can have only one seat

### Attendance Workflow
- [ ] Driver marks attendance (pending)
- [ ] Admin approves attendance
- [ ] User notified after approval
- [ ] Approved by admin recorded
- [ ] One attendance per user per day
- [ ] Cannot mark future attendance

### Bus Breakdown Reassignment
- [ ] Admin marks bus as BREAKDOWN
- [ ] Admin selects new bus
- [ ] All passengers moved to new bus
- [ ] New seats assigned automatically
- [ ] All users notified
- [ ] Old seats freed up
- [ ] Cannot reassign if new bus full

### Notification Triggers
- [ ] Bus assignment → Driver notified
- [ ] Seat assignment → User notified
- [ ] Attendance approval → User notified
- [ ] Bus status change → Admin notified
- [ ] Bus reassignment → All users notified

---

## 🌐 Frontend Tests

### Navigation
- [ ] Navbar shows on all pages (when logged in)
- [ ] Navbar hidden on login/register pages
- [ ] Dashboard link works
- [ ] Profile link works
- [ ] Logout button works
- [ ] User role displayed in navbar

### Routing
- [ ] Protected routes require authentication
- [ ] Role-based routes enforce permissions
- [ ] Redirect to login if not authenticated
- [ ] Redirect to dashboard after login
- [ ] 404 page for invalid routes (if implemented)

### Forms
- [ ] All form fields validate
- [ ] Required fields marked
- [ ] Error messages displayed
- [ ] Success messages displayed
- [ ] Form clears after submission
- [ ] Loading states shown during API calls

### Responsive Design
- [ ] Works on desktop (1920x1080)
- [ ] Works on laptop (1366x768)
- [ ] Works on tablet (768x1024)
- [ ] Works on mobile (375x667)
- [ ] Bootstrap grid responsive
- [ ] Navbar collapses on mobile

---

## 🔧 API Tests

### Authentication Endpoints
- [ ] POST /api/auth/register/ - Works
- [ ] POST /api/auth/login/ - Works
- [ ] POST /api/auth/token/refresh/ - Works
- [ ] GET /api/auth/profile/ - Works
- [ ] PUT /api/auth/profile/update/ - Works

### Dashboard Endpoints
- [ ] GET /api/dashboard/admin/ - Works (Admin only)
- [ ] GET /api/dashboard/driver/ - Works (Driver only)
- [ ] GET /api/dashboard/user/ - Works (Teacher/Student only)

### Bus Endpoints
- [ ] GET /api/buses/ - Works
- [ ] POST /api/buses/ - Works (Admin only)
- [ ] GET /api/buses/{id}/ - Works
- [ ] PUT /api/buses/{id}/ - Works (Admin only)
- [ ] DELETE /api/buses/{id}/ - Works (Admin only)
- [ ] POST /api/buses/{id}/assign_driver/ - Works (Admin only)
- [ ] POST /api/buses/{id}/assign_users/ - Works (Admin only)
- [ ] PATCH /api/buses/{id}/update_status/ - Works (Driver only)
- [ ] PATCH /api/buses/{id}/update_location/ - Works (Driver only)
- [ ] GET /api/buses/my_bus/ - Works (Driver only)

### Seat Endpoints
- [ ] GET /api/seats/ - Works
- [ ] GET /api/seats/my_seat/ - Works

### Attendance Endpoints
- [ ] GET /api/attendances/ - Works
- [ ] POST /api/attendances/ - Works (Driver only)
- [ ] POST /api/attendances/{id}/approve/ - Works (Admin only)
- [ ] GET /api/attendances/my_attendance/ - Works

### Notification Endpoints
- [ ] GET /api/notifications/ - Works
- [ ] POST /api/notifications/ - Works (Admin only)
- [ ] PATCH /api/notifications/{id}/mark_seen/ - Works
- [ ] POST /api/notifications/mark_all_seen/ - Works

### Query Endpoints
- [ ] GET /api/queries/ - Works
- [ ] POST /api/queries/ - Works (Teacher/Student only)
- [ ] GET /api/queries/{id}/ - Works

---

## 🐛 Error Handling Tests

### Backend Errors
- [ ] 400 Bad Request - Proper error message
- [ ] 401 Unauthorized - Redirects to login
- [ ] 403 Forbidden - Permission denied message
- [ ] 404 Not Found - Resource not found message
- [ ] 500 Internal Server Error - Generic error message

### Frontend Errors
- [ ] Network error - User-friendly message
- [ ] API error - Error message displayed
- [ ] Form validation error - Field-specific errors
- [ ] Token expired - Auto-refresh or redirect

### Edge Cases
- [ ] Empty database - No errors
- [ ] No buses - Appropriate message
- [ ] No notifications - Appropriate message
- [ ] No queries - Appropriate message
- [ ] No attendance - Appropriate message

---

## 🔍 Database Tests

### Data Integrity
- [ ] Foreign keys enforced
- [ ] Unique constraints enforced
- [ ] Check constraints enforced
- [ ] NOT NULL constraints enforced
- [ ] Default values applied

### Cascading Deletes
- [ ] Delete bus → Seats deleted
- [ ] Delete user → Attendance deleted
- [ ] Delete user → Notifications deleted
- [ ] Delete user → Queries deleted

### Relationships
- [ ] User → Bus (driver) - Works
- [ ] Bus → Seats - Works
- [ ] Seat → User - Works
- [ ] Attendance → User - Works
- [ ] Notification → User - Works
- [ ] Query → User, Driver - Works

---

## 📈 Performance Tests

### Load Time
- [ ] Dashboard loads in < 2 seconds
- [ ] Bus list loads in < 2 seconds
- [ ] Notifications load in < 2 seconds
- [ ] API responses in < 500ms

### Scalability
- [ ] 100 users - No issues
- [ ] 50 buses - No issues
- [ ] 1000 notifications - No issues
- [ ] 500 attendance records - No issues

---

## ✨ User Experience Tests

### Usability
- [ ] Intuitive navigation
- [ ] Clear labels and instructions
- [ ] Consistent design across pages
- [ ] Helpful error messages
- [ ] Success feedback after actions

### Accessibility
- [ ] Keyboard navigation works
- [ ] Form labels present
- [ ] Color contrast sufficient
- [ ] Alt text for images (if any)

---

## 📝 Testing Summary

**Total Tests:** ~200+

**Categories:**
- Authentication: 15 tests
- Profile: 8 tests
- Bus Management: 30 tests
- Seat Management: 10 tests
- Attendance: 20 tests
- Notifications: 15 tests
- Queries: 12 tests
- Dashboards: 25 tests
- Driver Features: 12 tests
- Permissions: 25 tests
- Business Logic: 15 tests
- Frontend: 20 tests
- API: 30 tests
- Error Handling: 15 tests
- Database: 12 tests
- Performance: 8 tests
- UX: 8 tests

---

## 🎯 Testing Tips

1. **Test in Order** - Follow the checklist from top to bottom
2. **Create Test Data** - Set up users, buses, and assignments first
3. **Use Different Roles** - Test with Admin, Driver, Teacher, Student accounts
4. **Check Notifications** - Verify notifications after each action
5. **Test Edge Cases** - Try invalid inputs, empty states, etc.
6. **Use Browser DevTools** - Check console for errors
7. **Test API Directly** - Use Postman or cURL for API testing
8. **Check Database** - Verify data is saved correctly
9. **Test Permissions** - Try accessing restricted features
10. **Document Issues** - Note any bugs or unexpected behavior

---

## 🚀 Ready for Production?

Before deploying to production, ensure:
- [ ] All critical tests pass
- [ ] No console errors
- [ ] No database errors
- [ ] Security settings configured
- [ ] Environment variables set
- [ ] DEBUG=False
- [ ] ALLOWED_HOSTS configured
- [ ] Static files collected
- [ ] Database backed up
- [ ] SSL certificate installed

---

**Happy Testing! 🎉**
