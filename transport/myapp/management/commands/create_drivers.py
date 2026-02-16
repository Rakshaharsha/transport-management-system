from django.core.management.base import BaseCommand
from myapp.models import User

class Command(BaseCommand):
    help = 'Creates 10 sample driver accounts'

    def handle(self, *args, **kwargs):
        # Create admin user first
        if not User.objects.filter(username='admin').exists():
            admin = User.objects.create_superuser(
                username='admin',
                email='admin@transport.com',
                password='admin123',
                first_name='Admin',
                last_name='User',
                role='ADMIN'
            )
            self.stdout.write(self.style.SUCCESS('✓ Created admin user'))
            self.stdout.write(self.style.SUCCESS('  Username: admin'))
            self.stdout.write(self.style.SUCCESS('  Password: admin123\n'))
        
        drivers_data = [
            {'username': 'driver1', 'email': 'driver1@example.com', 'first_name': 'Ramesh', 'last_name': 'Kumar', 'home_location': 'Koramangala'},
            {'username': 'driver2', 'email': 'driver2@example.com', 'first_name': 'Suresh', 'last_name': 'Rao', 'home_location': 'Indiranagar'},
            {'username': 'driver3', 'email': 'driver3@example.com', 'first_name': 'Vijay', 'last_name': 'Sharma', 'home_location': 'Whitefield'},
            {'username': 'driver4', 'email': 'driver4@example.com', 'first_name': 'Prakash', 'last_name': 'Reddy', 'home_location': 'Jayanagar'},
            {'username': 'driver5', 'email': 'driver5@example.com', 'first_name': 'Mahesh', 'last_name': 'Patel', 'home_location': 'BTM Layout'},
            {'username': 'driver6', 'email': 'driver6@example.com', 'first_name': 'Rajesh', 'last_name': 'Singh', 'home_location': 'Electronic City'},
            {'username': 'driver7', 'email': 'driver7@example.com', 'first_name': 'Dinesh', 'last_name': 'Verma', 'home_location': 'HSR Layout'},
            {'username': 'driver8', 'email': 'driver8@example.com', 'first_name': 'Ganesh', 'last_name': 'Nair', 'home_location': 'Marathahalli'},
            {'username': 'driver9', 'email': 'driver9@example.com', 'first_name': 'Murali', 'last_name': 'Iyer', 'home_location': 'Bellandur'},
            {'username': 'driver10', 'email': 'driver10@example.com', 'first_name': 'Kiran', 'last_name': 'Menon', 'home_location': 'Sarjapur'},
        ]

        default_password = 'password@123'
        created_count = 0
        skipped_count = 0

        for driver_data in drivers_data:
            if User.objects.filter(username=driver_data['username']).exists():
                self.stdout.write(self.style.WARNING(f'User {driver_data["username"]} already exists, skipping...'))
                skipped_count += 1
                continue

            user = User.objects.create_user(
                username=driver_data['username'],
                email=driver_data['email'],
                password=default_password,
                first_name=driver_data['first_name'],
                last_name=driver_data['last_name'],
                role='DRIVER',
                driver_status='AVAILABLE',
                home_location=driver_data['home_location'],
                salary=25000  # Default salary
            )
            created_count += 1
            self.stdout.write(self.style.SUCCESS(f'Created driver: {user.username} ({user.first_name} {user.last_name})'))

        self.stdout.write(self.style.SUCCESS(f'\n✓ Successfully created {created_count} drivers'))
        if skipped_count > 0:
            self.stdout.write(self.style.WARNING(f'⚠ Skipped {skipped_count} existing users'))
        self.stdout.write(self.style.NOTICE(f'\nDefault password for all drivers: {default_password}'))
        self.stdout.write(self.style.NOTICE('Default salary: ₹25,000'))
