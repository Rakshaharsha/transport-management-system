from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates a default admin user if none exists'

    def handle(self, *args, **options):
        if not User.objects.filter(is_superuser=True).exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@transport.com',
                password='admin123',
                role='admin'
            )
            self.stdout.write(self.style.SUCCESS('Default admin user created: admin/admin123'))
        else:
            self.stdout.write(self.style.SUCCESS('Admin user already exists'))
