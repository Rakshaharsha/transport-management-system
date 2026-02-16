import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'transport.settings')
django.setup()

from myapp.models import User

# Reset password for hema
user = User.objects.get(username='hema')
user.set_password('student123')
user.save()

print(f"✅ Password reset successfully!")
print(f"Name: {user.first_name} {user.last_name}")
print(f"Username: {user.username}")
print(f"Password: student123")
print(f"Role: {user.role}")
print(f"College: {user.college_name}")
print(f"Year: {user.year}")
