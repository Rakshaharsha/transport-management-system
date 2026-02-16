from django.core.management.base import BaseCommand
from myapp.models import User, Fee
from datetime import date
import random


class Command(BaseCommand):
    help = 'Update existing fees to have mixed paid/unpaid status'

    def handle(self, *args, **kwargs):
        fees = Fee.objects.all()
        
        if fees.count() == 0:
            self.stdout.write(self.style.ERROR('No fees found in database'))
            return
        
        paid_count = 0
        unpaid_count = 0
        
        for fee in fees:
            # 40% chance of being paid, 60% unpaid
            is_paid = random.random() < 0.4
            
            if is_paid:
                fee.payment_status = 'PAID'
                fee.paid_date = date.today()
                paid_count += 1
                self.stdout.write(f'✅ Set as PAID: {fee.user.username} - ₹{fee.amount}')
            else:
                fee.payment_status = 'PENDING'
                fee.paid_date = None
                unpaid_count += 1
                self.stdout.write(f'⚠️  Set as UNPAID: {fee.user.username} - ₹{fee.amount}')
            
            fee.save()
        
        self.stdout.write(self.style.SUCCESS(f'\n📊 Summary:'))
        self.stdout.write(self.style.SUCCESS(f'   Total fees updated: {fees.count()}'))
        self.stdout.write(self.style.SUCCESS(f'   ✅ Paid: {paid_count}'))
        self.stdout.write(self.style.WARNING(f'   ⚠️  Unpaid: {unpaid_count}'))
