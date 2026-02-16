import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'transport.settings')
django.setup()

from myapp.models import User, Bus, Seat

# Get Bus 101
bus = Bus.objects.get(bus_number=101)

print(f"{'='*60}")
print(f"BUS 101 DETAILS")
print(f"{'='*60}")
print(f"Bus Number: {bus.bus_number}")
print(f"Route: {bus.source} → {bus.destination}")
print(f"Capacity: {bus.capacity}")
print(f"Status: {bus.status}")

if bus.driver:
    driver = bus.driver
    print(f"\n🚗 DRIVER DETAILS:")
    print(f"Name: {driver.first_name} {driver.last_name}")
    print(f"Username: {driver.username}")
    print(f"Status: {driver.driver_status}")
    print(f"Salary: ₹{driver.salary}")
    
    print(f"\n🔑 DRIVER LOGIN:")
    print(f"Username: {driver.username}")
    print(f"Password: password@123 (default)")
    
    # Reset driver password
    driver.set_password('password@123')
    driver.save()
    print(f"✅ Driver password reset to: password@123")
else:
    print(f"\n❌ No driver assigned")

# Get all students in this bus
students = Seat.objects.filter(bus=bus, is_available=False).select_related('assigned_user')
print(f"\n👥 STUDENTS IN BUS 101 ({students.count()} students):")
for seat in students[:5]:  # Show first 5
    student = seat.assigned_user
    print(f"  - Seat {seat.seat_number}: {student.first_name} {student.last_name} (username: {student.username})")

if students.count() > 5:
    print(f"  ... and {students.count() - 5} more students")

print(f"\n{'='*60}")
print(f"TEST SCENARIO:")
print(f"{'='*60}")
print(f"1. Login as driver: {bus.driver.username} / password@123")
print(f"2. Mark bus as BREAKDOWN")
print(f"3. All {students.count()} students will be notified")
print(f"4. Login as student 'hema' to see notification")
print(f"{'='*60}")
