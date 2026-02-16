from django.core.management.base import BaseCommand
from myapp.models import User
import random


class Command(BaseCommand):
    help = 'Assign college names to students with Unknown or null college'

    def handle(self, *args, **kwargs):
        # Find students with no college or Unknown
        students_without_college = User.objects.filter(
            role='STUDENT'
        ).filter(
            college_name__isnull=True
        ) | User.objects.filter(
            role='STUDENT',
            college_name=''
        )
        
        colleges = ['KSRCT', 'KSRCE', 'KSRCAS', 'KSRCAS (Women)', 'KSRDS', 'KSRCN']
        years = ['I', 'II', 'III', 'IV']
        genders = ['MALE', 'FEMALE']
        
        updated_count = 0
        
        for student in students_without_college:
            college = random.choice(colleges)
            
            # Ensure KSRCAS (Women) only has female students
            if college == 'KSRCAS (Women)':
                if not student.gender:
                    student.gender = 'FEMALE'
                elif student.gender != 'FEMALE':
                    # Pick a different college for non-female students
                    college = random.choice(['KSRCT', 'KSRCE', 'KSRCAS', 'KSRDS', 'KSRCN'])
            
            student.college_name = college
            
            # Also assign year if missing
            if not student.year:
                student.year = random.choice(years)
            
            # Assign gender if missing
            if not student.gender:
                student.gender = random.choice(genders)
            
            student.save()
            updated_count += 1
            
            self.stdout.write(f'✅ Updated: {student.username} → {college} ({student.year} Year, {student.gender})')
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Successfully updated {updated_count} students'))
        
        # Show summary by college
        self.stdout.write(self.style.SUCCESS(f'\n📊 Students by College:'))
        for college in colleges:
            count = User.objects.filter(role='STUDENT', college_name=college).count()
            self.stdout.write(f'   {college}: {count} students')
