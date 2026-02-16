from django.core.management.base import BaseCommand
from myapp.models import User

class Command(BaseCommand):
    help = 'Delete and recreate admin user'

    def handle(self, *args, **kwargs):
        # Delete existing admin if exists
        User.objects.filter(username='admin').delete()
        self.stdout.write(self.style.WARNING('Deleted existing admin user'))
        
        # Create new admin
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@transport.com',
            password='admin123',
            role='ADMIN'
        )
        admin.first_name = 'Admin'
        admin.last_name = 'User'
        admin.is_staff = True
        admin.is_superuser = True
        admin.save()
        
        self.stdout.write(self.style.SUCCESS('✓ Admin user created successfully!'))
        self.stdout.write(self.style.SUCCESS('  Username: admin'))
        self.stdout.write(self.style.SUCCESS('  Password: admin123'))
        self.stdout.write(self.style.SUCCESS(f'  is_staff: {admin.is_staff}'))
        self.stdout.write(self.style.SUCCESS(f'  is_superuser: {admin.is_superuser}'))
