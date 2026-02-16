from django.db import transaction
from .models import Bus, Seat, User, Notification


class BusService:
    @staticmethod
    @transaction.atomic
    def create_bus_with_seats(bus_data):
        """Create a bus and automatically generate seats based on capacity"""
        # Ensure capacity is an integer
        capacity = int(bus_data.get('capacity'))
        
        # Ensure bus_number is an integer
        if 'bus_number' in bus_data:
            bus_data['bus_number'] = int(bus_data['bus_number'])
        
        bus = Bus.objects.create(**bus_data)
        
        # Create seats
        seats = [Seat(bus=bus, seat_number=i, is_available=True) for i in range(1, capacity + 1)]
        Seat.objects.bulk_create(seats)
        
        return bus

    @staticmethod
    @transaction.atomic
    def assign_driver_to_bus(bus_id, driver_id):
        """Assign a driver to a bus"""
        bus = Bus.objects.get(id=bus_id)
        driver = User.objects.get(id=driver_id, role='DRIVER')
        
        # Remove driver from previous bus if any
        Bus.objects.filter(driver=driver).update(driver=None)
        
        bus.driver = driver
        bus.save()
        
        # Send notification to driver
        NotificationService.send_notification(
            user=driver,
            message=f"You have been assigned to Bus {bus.bus_number} ({bus.source} - {bus.destination})",
            created_by=None
        )
        
        return bus

    @staticmethod
    @transaction.atomic
    def assign_users_to_bus(bus_id, user_ids):
        """Assign students/teachers to bus seats automatically"""
        from .models import Fee
        from datetime import date
        
        bus = Bus.objects.get(id=bus_id)
        available_seats = Seat.objects.filter(bus=bus, is_available=True).order_by('seat_number')
        
        if len(user_ids) > available_seats.count():
            raise ValueError(f"Not enough seats available. Only {available_seats.count()} seats left.")
        
        users = User.objects.filter(id__in=user_ids, role__in=['TEACHER', 'STUDENT'])
        
        # Check for unpaid fees
        users_with_unpaid_fees = []
        for user in users:
            unpaid_fees = Fee.objects.filter(
                user=user, 
                payment_status__in=['PENDING', 'OVERDUE'],
                due_date__lt=date.today()
            ).exists()
            if unpaid_fees:
                users_with_unpaid_fees.append(user.username)
        
        if users_with_unpaid_fees:
            raise ValueError(f"Cannot assign seats. Users with unpaid fees: {', '.join(users_with_unpaid_fees)}")
        
        for user, seat in zip(users, available_seats):
            seat.assigned_user = user
            seat.is_available = False
            seat.save()
            
            # Send notification
            NotificationService.send_notification(
                user=user,
                message=f"You have been assigned Seat {seat.seat_number} in Bus {bus.bus_number} ({bus.source} - {bus.destination})",
                created_by=None
            )
        
        return bus

    @staticmethod
    @transaction.atomic
    def reassign_bus_on_breakdown(old_bus_id, new_bus_id):
        """Reassign all users from broken bus to new bus"""
        old_bus = Bus.objects.get(id=old_bus_id)
        new_bus = Bus.objects.get(id=new_bus_id)
        
        old_seats = Seat.objects.filter(bus=old_bus, is_available=False)
        available_new_seats = Seat.objects.filter(bus=new_bus, is_available=True).order_by('seat_number')
        
        if old_seats.count() > available_new_seats.count():
            raise ValueError("Not enough seats in the new bus")
        
        for old_seat, new_seat in zip(old_seats, available_new_seats):
            user = old_seat.assigned_user
            
            # Free old seat
            old_seat.assigned_user = None
            old_seat.is_available = True
            old_seat.save()
            
            # Assign new seat
            new_seat.assigned_user = user
            new_seat.is_available = False
            new_seat.save()
            
            # Notify user
            NotificationService.send_notification(
                user=user,
                message=f"Your bus has been changed. New Bus: {new_bus.bus_number}, Seat: {new_seat.seat_number}",
                created_by=None
            )
        
        return new_bus

    @staticmethod
    def notify_admins_of_breakdown(bus):
        """Notify all admins when a bus breaks down"""
        admins = User.objects.filter(role='ADMIN')
        for admin in admins:
            NotificationService.send_notification(
                user=admin,
                message=f"🚨 URGENT: Bus {bus.bus_number} ({bus.source} → {bus.destination}) has broken down! Please reassign passengers immediately.",
                created_by=None
            )


class NotificationService:
    @staticmethod
    def send_notification(user, message, created_by):
        """Send notification to a user"""
        return Notification.objects.create(
            user=user,
            message=message,
            created_by=created_by
        )

    @staticmethod
    def send_bulk_notifications(user_ids, message, created_by):
        """Send notification to multiple users"""
        users = User.objects.filter(id__in=user_ids)
        notifications = [
            Notification(user=user, message=message, created_by=created_by)
            for user in users
        ]
        return Notification.objects.bulk_create(notifications)

    @staticmethod
    def send_role_based_notifications(role, message, created_by):
        """Send notification to all users of a specific role"""
        users = User.objects.filter(role=role)
        notifications = [
            Notification(user=user, message=message, created_by=created_by)
            for user in users
        ]
        return Notification.objects.bulk_create(notifications)


class AttendanceService:
    @staticmethod
    def approve_attendance(attendance_id, admin_user, remarks=None):
        """Approve attendance by admin"""
        from .models import Attendance
        
        attendance = Attendance.objects.get(id=attendance_id)
        attendance.is_approved = True
        attendance.approved_by = admin_user
        if remarks:
            attendance.remarks = remarks
        attendance.save()
        
        # Notify user
        NotificationService.send_notification(
            user=attendance.user,
            message=f"Your attendance for {attendance.date} has been approved",
            created_by=admin_user
        )
        
        return attendance
