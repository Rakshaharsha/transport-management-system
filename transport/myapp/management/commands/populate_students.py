from django.core.management.base import BaseCommand
from myapp.models import User
import random


class Command(BaseCommand):
    help = 'Populate database with sample students'

    def handle(self, *args, **kwargs):
        # Sample student names
        first_names = [
            'Arun', 'Priya', 'Karthik', 'Divya', 'Rajesh', 'Lakshmi', 'Vijay', 'Meena',
            'Suresh', 'Kavya', 'Ramesh', 'Deepa', 'Kumar', 'Sangeetha', 'Ganesh', 'Nithya',
            'Prakash', 'Revathi', 'Selvam', 'Janaki', 'Murugan', 'Saranya', 'Bala', 'Vani',
            'Senthil', 'Mythili', 'Ravi', 'Pooja', 'Anand', 'Sowmya', 'Dinesh', 'Keerthi',
            'Manoj', 'Archana', 'Naveen', 'Bhavani', 'Siva', 'Radhika', 'Arjun', 'Sneha',
            'Bharath', 'Pavithra', 'Chandru', 'Lavanya', 'Gopal', 'Swathi', 'Hari', 'Preethi',
            'Kiran', 'Yamuna', 'Mohan', 'Shruthi', 'Naresh', 'Varsha', 'Prabhu', 'Nisha',
            'Saravanan', 'Geetha', 'Thiru', 'Anusha'
        ]
        
        last_names = [
            'Kumar', 'Raj', 'Krishnan', 'Murugan', 'Selvam', 'Pandian', 'Rajan', 'Babu',
            'Moorthy', 'Samy', 'Kannan', 'Subramanian', 'Venkat', 'Prasad', 'Shankar'
        ]
        
        colleges = ['KSRCT', 'KSRCE', 'KSRCAS', 'KSRCAS (Women)', 'KSRDS', 'KSRCN']
        years = ['I', 'II', 'III', 'IV']
        genders = ['MALE', 'FEMALE']
        
        # Cities near Tiruchengode for home locations
        locations = [
            'Tiruchengode', 'Namakkal', 'Salem', 'Erode', 'Karur', 'Sankari',
            'Rasipuram', 'Attur', 'Komarapalayam', 'Bhavani', 'Perundurai',
            'Velur', 'Paramathi', 'Mohanur', 'Sendamangalam'
        ]
        
        created_count = 0
        updated_count = 0
        
        # Create 60 students
        for i in range(1, 61):
            username = f'student{i}'
            
            # Check if student already exists
            existing_student = User.objects.filter(username=username).first()
            
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)
            college = random.choice(colleges)
            year = random.choice(years)
            gender = random.choice(genders)
            location = random.choice(locations)
            
            # For KSRCAS (Women), only female students
            if college == 'KSRCAS (Women)':
                gender = 'FEMALE'
            
            student_data = {
                'first_name': first_name,
                'last_name': last_name,
                'email': f'{username}@ksrct.ac.in',
                'role': 'STUDENT',
                'college_name': college,
                'year': year,
                'gender': gender,
                'home_location': location,
                'phone': f'+91{random.randint(7000000000, 9999999999)}',
                'semester': random.randint(1, 8),
                'academic_year': '2025-2026'
            }
            
            if existing_student:
                # Update existing student
                for key, value in student_data.items():
                    setattr(existing_student, key, value)
                existing_student.save()
                updated_count += 1
                self.stdout.write(f'Updated: {username} - {first_name} {last_name} ({college}, {year} Year)')
            else:
                # Create new student
                student = User.objects.create_user(
                    username=username,
                    password='student123',  # Default password
                    **student_data
                )
                created_count += 1
                self.stdout.write(f'Created: {username} - {first_name} {last_name} ({college}, {year} Year)')
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Successfully created {created_count} students'))
        self.stdout.write(self.style.SUCCESS(f'✅ Successfully updated {updated_count} students'))
        self.stdout.write(self.style.WARNING(f'\n📝 Default password for all students: student123'))
