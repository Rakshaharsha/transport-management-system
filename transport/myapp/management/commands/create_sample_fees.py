from django.core.management.base import BaseCommand
from myapp.models import User, Fee
from datetime import date, timedelta
from decimal import Decimal
import random


class Command(BaseCommand):
    help = 'Create sample fees for students (some paid, some unpaid)'

    def handle(self, *args, **kwargs):
        students = User.objects.filter(role='STUDENT')
        
        if students.count() == 0:
            self.stdout.write(self.style.ERROR('No students found in database'))
            return
        
        # Get current month and year
        current_date = date.today()
        month_name = current_date.strftime('%B')
        year = current_date.year
        
        # Set due date to end of current month
        if current_date.month == 12:
            next_month = date(year + 1, 1, 1)
        else:
            next_month = date(year, current_date.month + 1, 1)
        due_date = next_month - timedelta(days=1)
        
        created_count = 0
        paid_count = 0
        unpaid_count = 0
        
        for student in students:
            # Random fee amount based on distance tiers
            fee_amounts = [500, 800, 1200, 1500, 2000]
            amount = Decimal(random.choice(fee_amounts))
            
            # 60% chance of having unpaid fees, 40% paid
            is_paid = random.random() < 0.4
            
            # Create or update fee
            fee, created = Fee.objects.get_or_create(
                user=student,
                month=month_name,
                year=year,
                defaults={
                    'amount': amount,
                    'due_date': due_date,
                    'payment_status': 'PAID' if is_paid else 'PENDING'
                }
            )
            
            if created:
                created_count += 1
                if is_paid:
                    fee.paid_date = date.today()
                    fee.save()
                    paid_count += 1
                    self.stdout.write(f'✅ Created PAID fee: {student.username} - ₹{amount}')
                else:
                    unpaid_count += 1
                    self.stdout.write(f'⚠️  Created UNPAID fee: {student.username} - ₹{amount}')
            else:
                self.stdout.write(f'ℹ️  Fee already exists for {student.username}')
        
        self.stdout.write(self.style.SUCCESS(f'\n📊 Summary:'))
        self.stdout.write(self.style.SUCCESS(f'   Total fees created: {created_count}'))
        self.stdout.write(self.style.SUCCESS(f'   ✅ Paid: {paid_count}'))
        self.stdout.write(self.style.WARNING(f'   ⚠️  Unpaid: {unpaid_count}'))
