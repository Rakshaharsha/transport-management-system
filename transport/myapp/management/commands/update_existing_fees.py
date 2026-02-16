from django.core.management.base import BaseCommand
from myapp.models import Fee
from decimal import Decimal


class Command(BaseCommand):
    help = 'Update existing fees with paid_amount and pending_amount'

    def handle(self, *args, **kwargs):
        fees = Fee.objects.all()
        
        updated_count = 0
        for fee in fees:
            if fee.payment_status == 'PAID':
                fee.paid_amount = fee.amount
                fee.pending_amount = Decimal('0')
            else:
                fee.paid_amount = Decimal('0')
                fee.pending_amount = fee.amount
            
            fee.save()
            updated_count += 1
            
            status_icon = '✅' if fee.payment_status == 'PAID' else '⚠️'
            self.stdout.write(f'{status_icon} Updated: {fee.user.username} - ₹{fee.amount} ({fee.payment_status})')
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Updated {updated_count} fees'))
