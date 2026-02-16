import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'transport.settings')
django.setup()

from myapp.models import User, Seat, Bus

# Find Hema
users = User.objects.filter(first_name__icontains='Hema', role='STUDENT')

if users.exists():
    for user in users:
        print(f"\n{'='*60}")
        print(f"Student: {user.first_name} {user.last_name}")
        print(f"Username: {user.username}")
        print(f"College: {user.college_name}")
        print(f"Year: {user.year}")
        
        # Check seat assignment
        seat = Seat.objects.filter(assigned_user=user).first()
        if seat:
            bus = seat.bus
            print(f"\n✅ Bus Assignment:")
            print(f"Bus Number: {bus.bus_number}")
            print(f"Seat Number: {seat.seat_number}")
            print(f"Route: {bus.source} → {bus.destination}")
            
            # Check driver
            if bus.driver:
                print(f"\n🚗 Driver Details:")
                print(f"Driver Name: {bus.driver.first_name} {bus.driver.last_name}")
                print(f"Driver Username: {bus.driver.username}")
                print(f"Driver Status: {bus.driver.driver_status}")
            else:
                print(f"\n❌ No driver assigned to this bus")
            
            # Count students in same bus
            students_in_bus = Seat.objects.filter(bus=bus, is_available=False).count()
            print(f"\n👥 Total students in Bus {bus.bus_number}: {students_in_bus}")
        else:
            print(f"\n❌ No bus assigned yet")
        
        print(f"\n🔑 Login Credentials:")
        print(f"Username: {user.username}")
        print(f"Password: student123 (default)")
        print(f"{'='*60}")
else:
    print("No student named Hema found")
    print("\nSearching for all students with 'hem' in name...")
    users = User.objects.filter(first_name__icontains='hem', role='STUDENT')
    for user in users:
        print(f"- {user.first_name} {user.last_name} (username: {user.username})")
