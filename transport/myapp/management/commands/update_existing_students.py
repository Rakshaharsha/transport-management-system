from django.core.management.base import BaseCommand
from myapp.models import User
import random


class Command(BaseCommand):
    help = 'Update existing students with missing details and remove extras'

    def handle(self, *args, **kwargs):
        # First, delete students beyond student30
        students_to_delete = User.objects.filter(
            role='STUDENT',
            username__startswith='student'
        ).exclude(
            username__in=[f'student{i}' for i in range(1, 31)]
        )
        
        deleted_count = students_to_delete.count()
        students_to_delete.delete()
        self.stdout.write(self.style.WARNING(f'🗑️  Deleted {deleted_count} extra students'))
        
        # Sample data for updating
        first_names = [
            'Arun', 'Priya', 'Karthik', 'Divya', 'Rajesh', 'Lakshmi', 'Vijay', 'Meena',
            'Suresh', 'Kavya', 'Ramesh', 'Deepa', 'Kumar', 'Sangeetha', 'Ganesh', 'Nithya',
            'Prakash', 'Revathi', 'Selvam', 'Janaki', 'Murugan', 'Saranya', 'Bala', 'Vani',
            'Senthil', 'Mythili', 'Ravi', 'Pooja', 'Anand', 'Sowmya'
        ]
        
        last_names = [
            'Kumar', 'Raj', 'Krishnan', 'Murugan', 'Selvam', 'Pandian', 'Rajan', 'Babu',
            'Moorthy', 'Samy', 'Kannan', 'Subramanian', 'Venkat', 'Prasad', 'Shankar'
        ]
        
        colleges = ['KSRCT', 'KSRCE', 'KSRCAS', 'KSRCAS (Women)', 'KSRDS', 'KSRCN']
        years = ['I', 'II', 'III', 'IV']
        genders = ['MALE', 'FEMALE']
        
        locations = [
            'Tiruchengode', 'Namakkal', 'Salem', 'Erode', 'Karur', 'Sankari',
            'Rasipuram', 'Attur', 'Komarapalayam', 'Bhavani', 'Perundurai',
            'Velur', 'Paramathi', 'Mohanur', 'Sendamangalam'
        ]
        
        updated_count = 0
        
        # Update only student1 to student30
        for i in range(1, 31):
            username = f'student{i}'
            
            try:
                student = User.objects.get(username=username, role='STUDENT')
                
                # Use index-based assignment for consistent names
                first_name = first_names[i-1] if i <= len(first_names) else random.choice(first_names)
                last_name = random.choice(last_names)
                college = random.choice(colleges)
                year = random.choice(years)
                gender = random.choice(genders)
                location = random.choice(locations)
                
                # For KSRCAS (Women), only female students
                if college == 'KSRCAS (Women)':
                    gender = 'FEMALE'
                
                # Update only if fields are blank/missing
                if not student.first_name:
                    student.first_name = first_name
                if not student.last_name:
                    student.last_name = last_name
                if not student.email or '@' not in student.email:
                    student.email = f'{username}@ksrct.ac.in'
                if not student.college_name:
                    student.college_name = college
                if not student.year:
                    student.year = year
                if not student.gender:
                    student.gender = gender
                if not student.home_location:
                    student.home_location = location
                if not student.phone:
                    student.phone = f'+91{random.randint(7000000000, 9999999999)}'
                if not student.semester:
                    student.semester = random.randint(1, 8)
                if not student.academic_year:
                    student.academic_year = '2025-2026'
                
                student.save()
                updated_count += 1
                self.stdout.write(f'✅ Updated: {username} - {student.first_name} {student.last_name} ({student.college_name}, {student.year} Year)')
                
            except User.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'⚠️  Student {username} does not exist, skipping...'))
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Successfully updated {updated_count} existing students'))
        self.stdout.write(self.style.SUCCESS(f'🗑️  Removed {deleted_count} extra students'))
        self.stdout.write(self.style.SUCCESS(f'📊 Total students in database: {User.objects.filter(role="STUDENT").count()}'))
