# Distance-Based Bus Fee Calculation

## Overview
The system now automatically calculates and assigns bus fees to students based on their distance from home to the university.

## Fee Structure (Distance Tiers)

| Distance Range | Monthly Fee |
|---------------|-------------|
| 0-5 km        | ₹500        |
| 5-10 km       | ₹800        |
| 10-20 km      | ₹1,200      |
| 20-30 km      | ₹1,500      |
| 30+ km        | ₹2,000      |

## University Location
- **Coordinates**: 11.3833°N, 77.8833°E (KSR College, Tiruchengode)

## How It Works

### 1. Automatic Fee Creation
When a student is assigned to a bus seat (either manually or via auto-assignment), the system:
- Calculates the distance from their home location to the university
- Determines the appropriate fee tier based on distance
- Creates a monthly fee record with:
  - Amount based on distance tier
  - Current month and year
  - Due date (end of current month)
  - Status: PENDING
- Sends a notification to the student with fee details

### 2. Distance Calculation
The system uses the **Haversine formula** to calculate the great-circle distance between two points on Earth:
- Input: Home coordinates (latitude, longitude) and University coordinates
- Output: Distance in kilometers
- Formula accounts for Earth's curvature for accurate results

### 3. Current Implementation
**Default Distance**: Currently set to 15 km (₹1,200 fee tier) for all students
- This is a placeholder until student home location coordinates are added to the system

## Future Enhancements

### To Enable Full Distance-Based Calculation:
1. **Add Coordinates to Student Registration**
   - Capture home location coordinates (latitude, longitude) during signup
   - Or allow students to set their home location in their profile

2. **Update User Model** (if needed)
   - Add fields: `home_latitude` and `home_longitude`
   - Or parse coordinates from existing `home_location` field

3. **Modify Fee Creation Function**
   ```python
   # In views.py, update create_fee_for_student() to:
   if student.home_latitude and student.home_longitude:
       distance_km = calculate_distance(
           student.home_latitude, 
           student.home_longitude,
           UNIVERSITY_LATITUDE, 
           UNIVERSITY_LONGITUDE
       )
   else:
       distance_km = 15  # Default
   ```

## API Endpoints

### Get All Students (with Fee Info)
```
GET /admin/students/
```
Returns student list with:
- Basic info (name, college, year)
- Assigned bus and seat details
- Unpaid fees with amounts and due dates

### Send Fee Reminder
```
POST /admin/send-fee-reminder/<student_id>/
Body: { "fee_id": <fee_id> }  // Optional, sends reminder for specific fee
```

### Auto-Assign Students to Bus
```
POST /admin/auto-assign-bus/
Body: { "bus_id": <bus_id> }
```
- Assigns students to available seats
- Creates fees automatically for each assigned student
- Separates students by gender (girls in front, boys in back)

## Admin Dashboard Features

### Students Tab
- View all students in the system
- Click on a student to see:
  - Personal details (name, college, year)
  - Transport details (assigned bus, seat number)
  - Fee payment status
  - Unpaid fees with amounts and due dates
  - Contact information

### Fee Management
- View unpaid fees for each student
- Send payment reminders via notification
- See overdue fees highlighted in red
- Track payment status (PENDING/OVERDUE/PAID)

## Notifications
Students receive automatic notifications when:
- A new fee is created (with amount and due date)
- A payment reminder is sent by admin
- Their fee status changes

## Notes
- Fees are created monthly when students are assigned to buses
- The system prevents duplicate fees for the same month/year
- Distance calculation is accurate within ~0.5% for distances up to 1000 km
- Fee tiers can be adjusted in the `calculate_bus_fee_from_distance()` function
