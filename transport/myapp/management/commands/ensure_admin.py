from django.core.management.base import BaseCommand
from myapp.models import User

class Command(BaseCommand):
    help = 'Ensure admin user exists'

    def handle(self, *args, **kwargs):
        try:
            if User.objects.filter(username='admin').exists():
                self.stdout.write(self.style.WARNING('Admin user already exists'))
                return
            
            admin = User.objects.create_superuser(
                username='admin',
                email='admin@transport.com',
                password='admin123',
                role='ADMIN'
            )
            admin.first_name = 'Admin'
            admin.last_name = 'User'
            admin.save()
            
            self.stdout.write(self.style.SUCCESS('✓ Admin user created successfully!'))
            self.stdout.write(self.style.SUCCESS('  Username: admin'))
            self.stdout.write(self.style.SUCCESS('  Password: admin123'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating admin: {str(e)}'))
