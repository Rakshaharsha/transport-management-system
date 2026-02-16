import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'transport.settings')
django.setup()

from myapp.models import User

# Reset password for student10 (Siva Raj)
user = User.objects.get(username='student10')
user.set_password('student123')
user.save()

print(f"✅ Password reset successfully!")
print(f"Name: {user.first_name} {user.last_name}")
print(f"Username: {user.username}")
print(f"Password: student123")
print(f"Role: {user.role}")
