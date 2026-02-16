from django.core.management.base import BaseCommand
from myapp.models import User

class Command(BaseCommand):
    help = 'Creates 10 sample student accounts'

    def handle(self, *args, **kwargs):
        students_data = [
            {'username': 'student1', 'email': 'student1@example.com', 'first_name': 'Arjun', 'last_name': 'Sharma', 'department': 'Computer Science', 'semester': 3},
            {'username': 'student2', 'email': 'student2@example.com', 'first_name': 'Priya', 'last_name': 'Patel', 'department': 'Computer Science', 'semester': 5},
            {'username': 'student3', 'email': 'student3@example.com', 'first_name': 'Rahul', 'last_name': 'Kumar', 'department': 'Mechanical', 'semester': 2},
            {'username': 'student4', 'email': 'student4@example.com', 'first_name': 'Sneha', 'last_name': 'Reddy', 'department': 'Electronics', 'semester': 4},
            {'username': 'student5', 'email': 'student5@example.com', 'first_name': 'Aditya', 'last_name': 'Singh', 'department': 'Civil', 'semester': 6},
            {'username': 'student6', 'email': 'student6@example.com', 'first_name': 'Anjali', 'last_name': 'Verma', 'department': 'Computer Science', 'semester': 1},
            {'username': 'student7', 'email': 'student7@example.com', 'first_name': 'Vikram', 'last_name': 'Nair', 'department': 'Mechanical', 'semester': 3},
            {'username': 'student8', 'email': 'student8@example.com', 'first_name': 'Kavya', 'last_name': 'Iyer', 'department': 'Electronics', 'semester': 5},
            {'username': 'student9', 'email': 'student9@example.com', 'first_name': 'Siddharth', 'last_name': 'Gupta', 'department': 'Civil', 'semester': 2},
            {'username': 'student10', 'email': 'student10@example.com', 'first_name': 'Divya', 'last_name': 'Menon', 'department': 'Computer Science', 'semester': 4},
        ]

        default_password = 'password@123'
        created_count = 0
        skipped_count = 0

        for student_data in students_data:
            if User.objects.filter(username=student_data['username']).exists():
                self.stdout.write(self.style.WARNING(f'User {student_data["username"]} already exists, skipping...'))
                skipped_count += 1
                continue

            user = User.objects.create_user(
                username=student_data['username'],
                email=student_data['email'],
                password=default_password,
                first_name=student_data['first_name'],
                last_name=student_data['last_name'],
                role='STUDENT',
                department=student_data['department'],
                semester=student_data['semester']
            )
            created_count += 1
            self.stdout.write(self.style.SUCCESS(f'Created student: {user.username} ({user.first_name} {user.last_name})'))

        self.stdout.write(self.style.SUCCESS(f'\n✓ Successfully created {created_count} students'))
        if skipped_count > 0:
            self.stdout.write(self.style.WARNING(f'⚠ Skipped {skipped_count} existing users'))
        self.stdout.write(self.style.NOTICE(f'\nDefault password for all students: {default_password}'))
