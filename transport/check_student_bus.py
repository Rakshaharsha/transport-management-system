import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'transport.settings')
django.setup()

from myapp.models import User, Seat

# Check bus assignment for student10 (Siva Raj)
user = User.objects.get(username='student10')
seat = Seat.objects.filter(assigned_user=user).first()

print(f"Student: {user.first_name} {user.last_name}")
print(f"Username: {user.username}")
print(f"College: {user.college_name}")
print(f"Year: {user.year}")

if seat:
    print(f"\n✅ Bus Assignment:")
    print(f"Bus Number: {seat.bus.bus_number}")
    print(f"Seat Number: {seat.seat_number}")
    print(f"Route: {seat.bus.source} → {seat.bus.destination}")
    print(f"Bus Status: {seat.bus.status}")
else:
    print(f"\n❌ No bus assigned yet")
