from django.core.management.base import BaseCommand
from myapp.models import User

class Command(BaseCommand):
    help = 'Create a default admin user'

    def handle(self, *args, **kwargs):
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@transport.com',
                password='admin123',
                role='admin'
            )
            self.stdout.write(self.style.SUCCESS('Admin user created successfully!'))
            self.stdout.write(self.style.SUCCESS('Username: admin'))
            self.stdout.write(self.style.SUCCESS('Password: admin123'))
        else:
            self.stdout.write(self.style.WARNING('Admin user already exists'))
