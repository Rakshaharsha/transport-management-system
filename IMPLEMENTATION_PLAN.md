# Complete System Implementation Plan

## Current Status
✅ Fixed: Seat click modal now shows student details with college, year, fee status, and remove button

## Pending Requirements - Implementation Order

### PHASE 1: CRITICAL FIXES (Immediate)
1. ✅ Seat click modal - COMPLETED
2. 🔄 Test and verify seat removal functionality
3. 🔄 Verify location-based auto-assignment

### PHASE 2: FEE SYSTEM ENHANCEMENTS
#### 2.1 Unpaid Reminder System
- [ ] Add bulk reminder button in Student Management
- [ ] Individual reminder per student
- [ ] Enhanced reminder with: Name, Bus, Seat, Route, Total/Paid/Pending amounts
- [ ] Track reminder sender (Admin/Driver)

#### 2.2 Distance-Based Fee Calculation
- [ ] Add latitude/longitude to User and Bus models
- [ ] Implement Haversine distance calculation
- [ ] Fee slabs: 0-20km (₹15000), 21-50km (₹30000), 51-60km (₹40000)
- [ ] Store distance in Route/Bus model

#### 2.3 Partial Payment System
- [ ] Add paid_amount, pending_amount to Fee model
- [ ] Allow partial payments
- [ ] Show payment breakdown in student profile

#### 2.4 Term-Wise Fee Reset
- [ ] Create AcademicTerm model
- [ ] Auto-create fees at term start
- [ ] Preserve historical payment records

### PHASE 3: AUTO-ASSIGNMENT SYSTEM
- [ ] Add latitude/longitude fields to User and Bus models
- [ ] Implement Haversine formula for distance
- [ ] Auto-assign nearest bus to student
- [ ] Auto-assign nearest driver to bus
- [ ] Update driver availability_status
- [ ] Create POST /auto-assign/ endpoint

### PHASE 4: BUS VISUALIZATION ENHANCEMENTS
- [ ] Highlight unpaid students in RED on seat map
- [ ] Add "Send Reminder to All Unpaid in Bus" button
- [ ] Ensure seat numbers match across all views
- [ ] Single source of truth: Seat model

### PHASE 5: DRIVER FEATURES
#### 5.1 Status Management
- [ ] Status toggle: WORKING/BREAKDOWN/ON_LEAVE
- [ ] Breakdown notifications to admin and students
- [ ] Leave request system with approval workflow

#### 5.2 Attendance System
- [ ] Daily attendance marking
- [ ] Attendance percentage tracking
- [ ] Total km driven tracking

#### 5.3 Salary Calculation
- [ ] KM-based salary: 0-20km (₹15000), 21-50km (₹30000), 51-60km (₹40000)
- [ ] Auto-calculate based on route distance
- [ ] Store salary per term

#### 5.4 Driver Dashboard
- [ ] Show assigned bus visualization
- [ ] Seat layout with student names
- [ ] Student contact info on seat click

### PHASE 6: STUDENT FEATURES
#### 6.1 Notifications
- [ ] Fee reminders
- [ ] Bus breakdown alerts
- [ ] Driver reassignment notifications
- [ ] Payment confirmations
- [ ] Real-time updates (no page reload)

#### 6.2 Anonymous Query System
- [ ] Student can submit queries (anonymous option)
- [ ] Admin sees: Name (if not anonymous), Seat, Bus, Query
- [ ] Admin reply system
- [ ] Satisfaction feedback (Yes/No)
- [ ] Reopen thread if unsatisfied

### PHASE 7: SYSTEM ARCHITECTURE
#### 7.1 Backend Refactoring
- [ ] Service layer for all business logic
- [ ] Auto-assignment service
- [ ] Salary calculation service
- [ ] Fee calculation service
- [ ] Notification dispatch service

#### 7.2 Frontend Refactoring
- [ ] Remove duplicate business logic
- [ ] All calculations from backend
- [ ] Dynamic updates (no page reload)
- [ ] JWT-based role protection

## Database Schema Changes Required

### New Models
```python
class AcademicTerm(models.Model):
    year = models.CharField(max_length=20)
    term = models.CharField(max_length=20)  # e.g., "Fall 2025"
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=False)

class Route(models.Model):
    source = models.CharField(max_length=200)
    destination = models.CharField(max_length=200)
    distance_km = models.DecimalField(max_digits=6, decimal_places=2)
    source_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    source_longitude = models.DecimalField(max_digits=9, decimal_places=6)
    destination_latitude = models.DecimalField(max_digits=9, decimal_places=6)
    destination_longitude = models.DecimalField(max_digits=9, decimal_places=6)

class StudentQuery(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE)
    seat_number = models.IntegerField()
    message = models.TextField()
    anonymous = models.BooleanField(default=False)
    admin_reply = models.TextField(null=True, blank=True)
    is_satisfied = models.BooleanField(null=True, blank=True)
    status = models.CharField(max_length=20)  # OPEN, REPLIED, CLOSED, REOPENED
    created_at = models.DateTimeField(auto_now_add=True)

class DriverAttendance(models.Model):
    driver = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    status = models.CharField(max_length=20)  # PRESENT, ABSENT, LEAVE
    km_driven = models.DecimalField(max_digits=6, decimal_places=2, default=0)

class DriverSalary(models.Model):
    driver = models.ForeignKey(User, on_delete=models.CASCADE)
    term = models.ForeignKey(AcademicTerm, on_delete=models.CASCADE)
    base_salary = models.DecimalField(max_digits=10, decimal_places=2)
    route_distance = models.DecimalField(max_digits=6, decimal_places=2)
    total_salary = models.DecimalField(max_digits=10, decimal_places=2)
```

### Model Updates
```python
# User model additions
latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
availability_status = models.CharField(max_length=20)  # AVAILABLE, ASSIGNED, ON_LEAVE

# Bus model additions
route = models.ForeignKey(Route, on_delete=models.SET_NULL, null=True)
source_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True)
source_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True)

# Fee model updates
total_amount = models.DecimalField(max_digits=10, decimal_places=2)
paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
pending_amount = models.DecimalField(max_digits=10, decimal_places=2)  # Auto-calculated
term = models.ForeignKey(AcademicTerm, on_delete=models.CASCADE)
distance_km = models.DecimalField(max_digits=6, decimal_places=2)
```

## API Endpoints to Create

### Fee Management
- POST /fees/send-reminder/ - Bulk or individual reminders
- POST /fees/partial-payment/ - Record partial payment
- GET /fees/unpaid-students/ - Get all unpaid students
- POST /fees/send-bus-reminder/<bus_id>/ - Remind all unpaid in bus

### Auto Assignment
- POST /auto-assign/ - Auto-assign student to nearest bus
- POST /auto-assign-driver/ - Auto-assign driver to bus

### Driver Management
- POST /driver/update-status/ - Update driver status
- POST /driver/mark-attendance/ - Mark daily attendance
- GET /driver/salary-details/ - Get salary breakdown
- POST /driver/leave-request/ - Submit leave request

### Query System
- POST /queries/submit/ - Submit student query
- POST /queries/reply/<query_id>/ - Admin reply
- POST /queries/satisfaction/<query_id>/ - Student feedback

### Notifications
- GET /notifications/unread/ - Get unread notifications
- POST /notifications/mark-read/<notification_id>/ - Mark as read
- WebSocket endpoint for real-time notifications

## Implementation Priority

### Week 1: Critical Fixes
1. Fix seat click modal (DONE)
2. Test seat removal
3. Verify auto-assignment

### Week 2: Fee System
1. Unpaid reminder system
2. Distance-based calculation
3. Partial payments

### Week 3: Auto-Assignment
1. Add lat/long fields
2. Implement Haversine
3. Auto-assign logic

### Week 4: Driver Features
1. Status management
2. Attendance system
3. Salary calculation

### Week 5: Student Features
1. Notifications
2. Query system
3. Real-time updates

### Week 6: Refactoring
1. Service layer
2. Remove duplicate logic
3. Testing and optimization

## Next Steps

Would you like me to:
1. Continue with the current fix and test it?
2. Start implementing Phase 2 (Fee System)?
3. Create the database migrations for new models?
4. Implement a specific feature from the list?

Please let me know which priority you'd like to focus on first.
