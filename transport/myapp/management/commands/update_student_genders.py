from django.core.management.base import BaseCommand
from myapp.models import User

class Command(BaseCommand):
    help = 'Updates existing students with gender information'

    def handle(self, *args, **kwargs):
        # Assign alternating genders to existing students
        students = User.objects.filter(role='STUDENT')
        
        # Female students: odd numbers (student1, student3, student5...)
        # Male students: even numbers (student2, student4, student6...)
        
        updated_count = 0
        for student in students:
            if not student.gender:
                # Extract number from username (e.g., "student1" -> 1)
                try:
                    num = int(student.username.replace('student', ''))
                    student.gender = 'FEMALE' if num % 2 == 1 else 'MALE'
                    student.save()
                    updated_count += 1
                    self.stdout.write(self.style.SUCCESS(f'Updated {student.username} → {student.gender}'))
                except (ValueError, AttributeError):
                    # If username doesn't match pattern, skip
                    pass
        
        self.stdout.write(self.style.SUCCESS(f'\n✓ Updated {updated_count} students with gender information'))
