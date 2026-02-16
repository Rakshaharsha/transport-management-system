from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Q, Sum
from django.db import models
from django.utils import timezone
from datetime import date
from decimal import Decimal

from .models import User, Bus, Seat, Attendance, Notification, Query, Fee, EmergencyAlert, DriverLeave, StudentQuery, DriverAttendance
from .serializers import (
    UserSerializer, UserProfileSerializer, BusSerializer, SeatSerializer,
    AttendanceSerializer, NotificationSerializer, QuerySerializer, FeeSerializer,
    EmergencyAlertSerializer, DriverLeaveSerializer, DriverAttendanceSerializer
)
from .permissions import IsAdmin, IsDriver, IsTeacherOrStudent
from .services import BusService, NotificationService, AttendanceService


# Authentication Views
@api_view(['GET'])
@permission_classes([AllowAny])
def test_db(request):
    try:
        count = User.objects.count()
        return Response({'message': 'Database connection successful', 'user_count': count})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAdmin])
def get_all_users(request):
    """Debug endpoint to see all users and their roles"""
    users = User.objects.all()
    user_list = []
    for user in users:
        user_list.append({
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_superuser': user.is_superuser
        })
    return Response({
        'users': user_list,
        'total': len(user_list),
        'drivers': [u for u in user_list if u['role'] == 'DRIVER']
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    if user:
        # If superuser doesn't have a role, set it to ADMIN
        if user.is_superuser and not user.role:
            user.role = 'ADMIN'
            user.save()
        
        # Check if user has a role
        if not user.role:
            return Response({'error': 'User role not set. Please contact administrator.'}, status=status.HTTP_400_BAD_REQUEST)
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserProfileSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    from math import radians, sin, cos, sqrt, atan2
    
    serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        user = serializer.save()
        
        # If driver's location was updated, recalculate salary based on assigned bus route
        if user.role == 'DRIVER' and ('home_latitude' in request.data or 'home_longitude' in request.data):
            try:
                bus = Bus.objects.get(driver=user)
                if bus.distance_km:
                    # Calculate salary based on route distance
                    distance = float(bus.distance_km)
                    if distance <= 20:
                        user.salary = Decimal('15000')
                    elif distance <= 50:
                        user.salary = Decimal('30000')
                    else:
                        user.salary = Decimal('40000')
                    user.save()
            except Bus.DoesNotExist:
                pass
        
        return Response(UserProfileSerializer(user).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Bus ViewSet
class BusViewSet(viewsets.ModelViewSet):
    queryset = Bus.objects.all()
    serializer_class = BusSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        try:
            bus = BusService.create_bus_with_seats(request.data)
            serializer = self.get_serializer(bus)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def assign_driver(self, request, pk=None):
        try:
            driver_id = request.data.get('driver_id')
            bus = BusService.assign_driver_to_bus(pk, driver_id)
            return Response(BusSerializer(bus).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def assign_users(self, request, pk=None):
        try:
            user_ids = request.data.get('user_ids', [])
            bus = BusService.assign_users_to_bus(pk, user_ids)
            return Response(BusSerializer(bus).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'], permission_classes=[IsDriver])
    def update_status(self, request, pk=None):
        bus = self.get_object()
        if bus.driver != request.user:
            return Response({'error': 'You are not assigned to this bus'}, status=status.HTTP_403_FORBIDDEN)
        
        new_status = request.data.get('status')
        if new_status not in ['WORKING', 'BREAKDOWN', 'NOT_RUNNING']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        bus.status = new_status
        bus.save()
        
        # If breakdown, send urgent notification to admins
        if new_status == 'BREAKDOWN':
            BusService.notify_admins_of_breakdown(bus)
        else:
            # Regular status update notification
            admins = User.objects.filter(role='ADMIN')
            for admin in admins:
                NotificationService.send_notification(
                    user=admin,
                    message=f"Bus {bus.bus_number} status changed to {new_status} by driver {request.user.username}",
                    created_by=request.user
                )
        
        return Response(BusSerializer(bus).data)

    @action(detail=True, methods=['patch'], permission_classes=[IsDriver])
    def update_location(self, request, pk=None):
        bus = self.get_object()
        if bus.driver != request.user:
            return Response({'error': 'You are not assigned to this bus'}, status=status.HTTP_403_FORBIDDEN)
        
        bus.current_location = request.data.get('current_location')
        bus.save()
        return Response(BusSerializer(bus).data)

    @action(detail=False, methods=['get'], permission_classes=[IsDriver])
    def my_bus(self, request):
        try:
            bus = Bus.objects.get(driver=request.user)
            return Response(BusSerializer(bus).data)
        except Bus.DoesNotExist:
            return Response({'message': 'No bus assigned'}, status=status.HTTP_404_NOT_FOUND)


# Seat ViewSet
class SeatViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Seat.objects.all().order_by('bus', 'seat_number')
    serializer_class = SeatSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Seat.objects.all().order_by('bus', 'seat_number')
        bus_id = self.request.query_params.get('bus', None)
        if bus_id is not None:
            queryset = queryset.filter(bus_id=bus_id)
        return queryset

    @action(detail=False, methods=['get'])
    def my_seat(self, request):
        try:
            seat = Seat.objects.get(assigned_user=request.user)
            return Response(SeatSerializer(seat).data)
        except Seat.DoesNotExist:
            return Response({'message': 'No seat assigned'}, status=status.HTTP_404_NOT_FOUND)


# Attendance ViewSet
class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Attendance.objects.all()
        elif user.role == 'DRIVER':
            # Driver can see attendance of users in their bus
            try:
                bus = Bus.objects.get(driver=user)
                user_ids = Seat.objects.filter(bus=bus, is_available=False).values_list('assigned_user_id', flat=True)
                return Attendance.objects.filter(user_id__in=user_ids)
            except Bus.DoesNotExist:
                return Attendance.objects.none()
        else:
            return Attendance.objects.filter(user=user)

    def create(self, request, *args, **kwargs):
        # Driver marks attendance for users
        if request.user.role != 'DRIVER':
            return Response({'error': 'Only drivers can mark attendance'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAdmin])
    def approve(self, request, pk=None):
        try:
            remarks = request.data.get('remarks')
            attendance = AttendanceService.approve_attendance(pk, request.user, remarks)
            return Response(AttendanceSerializer(attendance).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def my_attendance(self, request):
        attendances = Attendance.objects.filter(user=request.user).order_by('-date')
        serializer = self.get_serializer(attendances, many=True)
        return Response(serializer.data)


# Notification ViewSet
class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        if request.user.role != 'ADMIN':
            return Response({'error': 'Only admins can send notifications'}, status=status.HTTP_403_FORBIDDEN)
        
        user_ids = request.data.get('user_ids', [])
        message = request.data.get('message')
        
        if not message:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        NotificationService.send_bulk_notifications(user_ids, message, request.user)
        return Response({'message': 'Notifications sent successfully'}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'])
    def mark_seen(self, request, pk=None):
        notification = self.get_object()
        notification.is_seen = True
        notification.save()
        return Response(NotificationSerializer(notification).data)

    @action(detail=False, methods=['post'])
    def mark_all_seen(self, request):
        Notification.objects.filter(user=request.user, is_seen=False).update(is_seen=True)
        return Response({'message': 'All notifications marked as seen'})


# Query ViewSet
class QueryViewSet(viewsets.ModelViewSet):
    queryset = Query.objects.all()
    serializer_class = QuerySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Query.objects.all()
        elif user.role == 'DRIVER':
            return Query.objects.filter(driver=user)
        else:
            return Query.objects.filter(user=user)

    def create(self, request, *args, **kwargs):
        if request.user.role not in ['TEACHER', 'STUDENT']:
            return Response({'error': 'Only teachers and students can submit queries'}, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data.copy()
        data['user'] = request.user.id
        
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            query = serializer.save()
            
            # Get user's bus information
            try:
                seat = Seat.objects.get(assigned_user=request.user)
                bus_info = f"Bus {seat.bus.bus_number}"
            except Seat.DoesNotExist:
                bus_info = "No bus assigned"
            
            # Notify admins with full details
            admins = User.objects.filter(role='ADMIN')
            for admin in admins:
                NotificationService.send_notification(
                    user=admin,
                    message=f"📝 New Query from {request.user.role}: {request.user.username} ({request.user.first_name} {request.user.last_name}) | {bus_info} | Subject: {query.subject}",
                    created_by=request.user
                )
            
            # Notify driver anonymously
            try:
                driver = User.objects.get(id=query.driver.id)
                NotificationService.send_notification(
                    user=driver,
                    message=f"📝 You have received a new query: {query.subject}",
                    created_by=None
                )
            except User.DoesNotExist:
                pass
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Fee ViewSet
class FeeViewSet(viewsets.ModelViewSet):
    queryset = Fee.objects.all()
    serializer_class = FeeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Fee.objects.all()
        else:
            return Fee.objects.filter(user=user)

    def create(self, request, *args, **kwargs):
        if request.user.role != 'ADMIN':
            return Response({'error': 'Only admins can create fees'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            fee = serializer.save()
            
            # Notify user about new fee
            NotificationService.send_notification(
                user=fee.user,
                message=f"💰 New fee added: {fee.month} {fee.year} - Amount: ${fee.amount}. Due date: {fee.due_date}",
                created_by=request.user
            )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'], permission_classes=[IsAdmin])
    def mark_paid(self, request, pk=None):
        from datetime import date
        fee = self.get_object()
        fee.payment_status = 'PAID'
        fee.paid_date = date.today()
        fee.save()
        
        # Notify user
        NotificationService.send_notification(
            user=fee.user,
            message=f"✅ Payment confirmed for {fee.month} {fee.year} - Amount: ${fee.amount}",
            created_by=request.user
        )
        
        return Response(FeeSerializer(fee).data)

    @action(detail=False, methods=['get'])
    def my_fees(self, request):
        fees = Fee.objects.filter(user=request.user).order_by('-year', '-created_at')
        serializer = self.get_serializer(fees, many=True)
        return Response(serializer.data)


# Dashboard Views
@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_dashboard(request):
    total_buses = Bus.objects.count()
    total_drivers = User.objects.filter(role='DRIVER').count()
    total_students = User.objects.filter(role='STUDENT').count()
    total_teachers = User.objects.filter(role='TEACHER').count()
    
    # Count drivers who haven't marked attendance today
    drivers_marked_today = DriverAttendance.objects.filter(
        date=date.today()
    ).values_list('driver_id', flat=True)
    
    pending_attendance = total_drivers - len(set(drivers_marked_today))
    
    breakdown_buses = Bus.objects.filter(status='BREAKDOWN').count()
    
    return Response({
        'total_buses': total_buses,
        'total_drivers': total_drivers,
        'total_students': total_students,
        'total_teachers': total_teachers,
        'pending_attendance': pending_attendance,
        'breakdown_buses': breakdown_buses,
    })


@api_view(['GET'])
@permission_classes([IsDriver])
def driver_dashboard(request):
    try:
        bus = Bus.objects.get(driver=request.user)
        bus_data = BusSerializer(bus).data
    except Bus.DoesNotExist:
        bus_data = None
    
    # Check if driver marked their own attendance today
    today_attendance_marked = DriverAttendance.objects.filter(
        driver=request.user,
        date=date.today()
    ).exists()
    
    return Response({
        'assigned_bus': bus_data,
        'salary': request.user.salary,
        'today_attendance_marked': today_attendance_marked,
    })


@api_view(['GET'])
@permission_classes([IsTeacherOrStudent])
def user_dashboard(request):
    try:
        seat = Seat.objects.get(assigned_user=request.user)
        seat_data = SeatSerializer(seat).data
    except Seat.DoesNotExist:
        seat_data = None
    
    unread_notifications = Notification.objects.filter(user=request.user, is_seen=False).count()
    my_queries = Query.objects.filter(user=request.user).count()
    
    return Response({
        'assigned_seat': seat_data,
        'unread_notifications': unread_notifications,
        'total_queries': my_queries,
    })



# Emergency Alert ViewSet
class EmergencyAlertViewSet(viewsets.ModelViewSet):
    queryset = EmergencyAlert.objects.all()
    serializer_class = EmergencyAlertSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return EmergencyAlert.objects.all()
        elif user.role == 'DRIVER':
            return EmergencyAlert.objects.filter(driver=user)
        return EmergencyAlert.objects.none()

    def create(self, request, *args, **kwargs):
        if request.user.role != 'DRIVER':
            return Response({'error': 'Only drivers can trigger emergency alerts'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            bus = Bus.objects.get(driver=request.user)
        except Bus.DoesNotExist:
            return Response({'error': 'No bus assigned to you'}, status=status.HTTP_400_BAD_REQUEST)
        
        data = request.data.copy()
        data['driver'] = request.user.id
        data['bus'] = bus.id
        
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            alert = serializer.save()
            
            # Send urgent notification to all admins
            admins = User.objects.filter(role='ADMIN')
            for admin in admins:
                NotificationService.send_notification(
                    user=admin,
                    message=f"🚨 EMERGENCY ALERT! Bus {bus.bus_number} - Driver: {request.user.username} - Location: {alert.location or 'Unknown'} - Message: {alert.message}",
                    created_by=request.user
                )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'], permission_classes=[IsAdmin])
    def resolve(self, request, pk=None):
        from datetime import datetime
        alert = self.get_object()
        alert.status = 'RESOLVED'
        alert.resolved_by = request.user
        alert.resolved_at = datetime.now()
        alert.save()
        
        # Notify driver
        NotificationService.send_notification(
            user=alert.driver,
            message=f"✅ Your emergency alert for Bus {alert.bus.bus_number} has been resolved by {request.user.username}",
            created_by=request.user
        )
        
        return Response(EmergencyAlertSerializer(alert).data)


# Driver Leave ViewSet
class DriverLeaveViewSet(viewsets.ModelViewSet):
    queryset = DriverLeave.objects.all()
    serializer_class = DriverLeaveSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return DriverLeave.objects.all()
        elif user.role == 'DRIVER':
            return DriverLeave.objects.filter(driver=user)
        return DriverLeave.objects.none()

    def create(self, request, *args, **kwargs):
        if request.user.role != 'DRIVER':
            return Response({'error': 'Only drivers can request leave'}, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data.copy()
        data['driver'] = request.user.id
        
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            leave = serializer.save()
            
            # Notify all admins
            admins = User.objects.filter(role='ADMIN')
            for admin in admins:
                NotificationService.send_notification(
                    user=admin,
                    message=f"📅 Leave Request: Driver {request.user.username} requested leave from {leave.start_date} to {leave.end_date}. Reason: {leave.reason}",
                    created_by=request.user
                )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'], permission_classes=[IsAdmin])
    def approve(self, request, pk=None):
        leave = self.get_object()
        substitute_driver_id = request.data.get('substitute_driver')
        admin_remarks = request.data.get('admin_remarks', '')
        
        if not substitute_driver_id:
            return Response({'error': 'Substitute driver is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            substitute_driver = User.objects.get(id=substitute_driver_id, role='DRIVER')
        except User.DoesNotExist:
            return Response({'error': 'Invalid substitute driver'}, status=status.HTTP_400_BAD_REQUEST)
        
        leave.status = 'APPROVED'
        leave.approved_by = request.user
        leave.substitute_driver = substitute_driver
        leave.admin_remarks = admin_remarks
        leave.save()
        
        # Get the bus assigned to the driver
        try:
            bus = Bus.objects.get(driver=leave.driver)
            
            # Notify original driver
            NotificationService.send_notification(
                user=leave.driver,
                message=f"✅ Your leave request from {leave.start_date} to {leave.end_date} has been approved. Substitute driver: {substitute_driver.username}",
                created_by=request.user
            )
            
            # Notify substitute driver
            NotificationService.send_notification(
                user=substitute_driver,
                message=f"📋 You have been assigned as substitute driver for Bus {bus.bus_number} from {leave.start_date} to {leave.end_date}",
                created_by=request.user
            )
            
            # Notify all students/teachers in that bus
            seats = Seat.objects.filter(bus=bus, is_available=False)
            for seat in seats:
                if seat.assigned_user:
                    NotificationService.send_notification(
                        user=seat.assigned_user,
                        message=f"🚌 Bus {bus.bus_number} will have a substitute driver ({substitute_driver.username}) from {leave.start_date} to {leave.end_date}",
                        created_by=request.user
                    )
        except Bus.DoesNotExist:
            pass
        
        return Response(DriverLeaveSerializer(leave).data)

    @action(detail=True, methods=['patch'], permission_classes=[IsAdmin])
    def reject(self, request, pk=None):
        leave = self.get_object()
        admin_remarks = request.data.get('admin_remarks', 'Leave request rejected')
        
        leave.status = 'REJECTED'
        leave.approved_by = request.user
        leave.admin_remarks = admin_remarks
        leave.save()
        
        # Notify driver
        NotificationService.send_notification(
            user=leave.driver,
            message=f"❌ Your leave request from {leave.start_date} to {leave.end_date} has been rejected. Remarks: {admin_remarks}",
            created_by=request.user
        )
        
        return Response(DriverLeaveSerializer(leave).data)



# Driver Status Update
@api_view(['POST'])
@permission_classes([IsDriver])
def mark_driver_attendance(request):
    """Driver marks their own attendance"""
    try:
        driver = request.user
        attendance_date = request.data.get('date', date.today())
        status = request.data.get('status', 'PRESENT')
        km_driven = request.data.get('km_driven', 0)
        remarks = request.data.get('remarks', '')
        
        # Validate status
        if status not in ['PRESENT', 'ABSENT', 'LEAVE', 'HALF_DAY']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create or update attendance
        attendance, created = DriverAttendance.objects.update_or_create(
            driver=driver,
            date=attendance_date,
            defaults={
                'status': status,
                'km_driven': Decimal(str(km_driven)),
                'remarks': remarks,
                'marked_by': driver
            }
        )
        
        action = 'marked' if created else 'updated'
        return Response({
            'message': f'Attendance {action} successfully',
            'attendance': DriverAttendanceSerializer(attendance).data
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsDriver])
def get_driver_stats(request):
    """Get driver dashboard statistics"""
    try:
        driver = request.user
        
        # Get assigned bus
        bus = Bus.objects.filter(driver=driver).first()
        
        # Calculate attendance percentage (last 30 days)
        from datetime import timedelta
        thirty_days_ago = date.today() - timedelta(days=30)
        
        total_days = 30
        present_days = DriverAttendance.objects.filter(
            driver=driver,
            date__gte=thirty_days_ago,
            status__in=['PRESENT', 'HALF_DAY']
        ).count()
        
        attendance_percentage = (present_days / total_days) * 100 if total_days > 0 else 0
        
        # Calculate total KM driven (last 30 days)
        total_km = DriverAttendance.objects.filter(
            driver=driver,
            date__gte=thirty_days_ago
        ).aggregate(total=models.Sum('km_driven'))['total'] or 0
        
        # Get pending leave requests
        pending_leaves = DriverLeave.objects.filter(
            driver=driver,
            status='PENDING'
        ).count()
        
        # Get today's attendance
        today_attendance = DriverAttendance.objects.filter(
            driver=driver,
            date=date.today()
        ).first()
        
        return Response({
            'driver': {
                'name': f"{driver.first_name} {driver.last_name}",
                'username': driver.username,
                'salary': str(driver.salary) if driver.salary else '0',
                'experience': driver.driving_experience or 0,
                'status': driver.driver_status
            },
            'assigned_bus': BusSerializer(bus).data if bus else None,
            'stats': {
                'attendance_percentage': round(attendance_percentage, 2),
                'total_km_driven': str(total_km),
                'present_days_last_30': present_days,
                'pending_leave_requests': pending_leaves,
                'today_marked': today_attendance is not None,
                'today_status': today_attendance.status if today_attendance else None
            }
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsDriver])
def send_breakdown_alert(request):
    """Driver sends breakdown alert to admin and students"""
    try:
        driver = request.user
        message = request.data.get('message', 'Bus breakdown reported')
        location = request.data.get('location', '')
        
        # Get driver's bus
        bus = Bus.objects.filter(driver=driver).first()
        
        if not bus:
            return Response({'error': 'No bus assigned to you'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update bus status
        bus.status = 'BREAKDOWN'
        bus.save()
        
        # Create emergency alert
        alert = EmergencyAlert.objects.create(
            driver=driver,
            bus=bus,
            message=message,
            location=location,
            status='ACTIVE'
        )
        
        # Notify all admins
        admins = User.objects.filter(role='ADMIN')
        for admin in admins:
            NotificationService.send_notification(
                user=admin,
                message=f"🚨 BREAKDOWN ALERT! Bus {bus.bus_number} ({bus.source} → {bus.destination})\nDriver: {driver.first_name} {driver.last_name}\nLocation: {location or 'Unknown'}\nMessage: {message}",
                created_by=driver
            )
        
        # Notify all students in the bus
        seats = Seat.objects.filter(bus=bus, is_available=False).select_related('assigned_user')
        student_count = 0
        
        for seat in seats:
            if seat.assigned_user and seat.assigned_user.role == 'STUDENT':
                NotificationService.send_notification(
                    user=seat.assigned_user,
                    message=f"⚠️ IMPORTANT: Bus {bus.bus_number} has broken down.\nLocation: {location or 'Unknown'}\nPlease make alternative arrangements. We apologize for the inconvenience.",
                    created_by=None  # System notification
                )
                student_count += 1
        
        return Response({
            'message': 'Breakdown alert sent successfully',
            'alert_id': alert.id,
            'admins_notified': admins.count(),
            'students_notified': student_count,
            'bus_status': 'BREAKDOWN'
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsDriver])
def update_driver_status_endpoint(request):
    """Driver updates their status (WORKING/ON_LEAVE)"""
    try:
        driver = request.user
        new_status = request.data.get('status')
        
        if new_status not in ['AVAILABLE', 'UNAVAILABLE', 'ON_LEAVE']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        old_status = driver.driver_status
        driver.driver_status = new_status
        driver.save()
        
        # Notify admins of status change
        admins = User.objects.filter(role='ADMIN')
        for admin in admins:
            NotificationService.send_notification(
                user=admin,
                message=f"Driver {driver.first_name} {driver.last_name} status changed from {old_status} to {new_status}",
                created_by=driver
            )
        
        return Response({
            'message': 'Status updated successfully',
            'old_status': old_status,
            'new_status': new_status
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsDriver])
def get_my_bus_students_enhanced(request):
    """Get students in driver's bus with enhanced details"""
    try:
        bus = Bus.objects.get(driver=request.user)
        seats = Seat.objects.filter(bus=bus, is_available=False).select_related('assigned_user').order_by('seat_number')
        
        students = []
        for seat in seats:
            if seat.assigned_user:
                # Get unpaid fees
                unpaid_fees = Fee.objects.filter(
                    user=seat.assigned_user,
                    payment_status__in=['PENDING', 'OVERDUE', 'PARTIAL']
                )
                
                total_pending = sum(fee.pending_amount for fee in unpaid_fees)
                
                students.append({
                    'id': seat.assigned_user.id,
                    'name': f"{seat.assigned_user.first_name} {seat.assigned_user.last_name}",
                    'username': seat.assigned_user.username,
                    'seat_number': seat.seat_number,
                    'college': seat.assigned_user.college_name,
                    'year': seat.assigned_user.year,
                    'phone': seat.assigned_user.phone,
                    'email': seat.assigned_user.email,
                    'home_location': seat.assigned_user.home_location,
                    'has_unpaid_fees': unpaid_fees.exists(),
                    'pending_amount': str(total_pending),
                    'gender': seat.assigned_user.gender
                })
        
        return Response({
            'bus': BusSerializer(bus).data,
            'students': students,
            'total_students': len(students),
            'unpaid_count': sum(1 for s in students if s['has_unpaid_fees'])
        })
        
    except Bus.DoesNotExist:
        return Response({'error': 'No bus assigned'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Get Students in Driver's Bus for Attendance
@api_view(['GET'])
@permission_classes([IsDriver])
def get_my_bus_students(request):
    try:
        bus = Bus.objects.get(driver=request.user)
        seats = Seat.objects.filter(bus=bus, is_available=False).select_related('assigned_user')
        
        students = []
        for seat in seats:
            if seat.assigned_user:
                # Get today's attendance if exists
                today_attendance = Attendance.objects.filter(
                    user=seat.assigned_user,
                    date=date.today()
                ).first()
                
                students.append({
                    'id': seat.assigned_user.id,
                    'username': seat.assigned_user.username,
                    'name': f"{seat.assigned_user.first_name} {seat.assigned_user.last_name}",
                    'seat_number': seat.seat_number,
                    'role': seat.assigned_user.role,
                    'department': seat.assigned_user.department,
                    'today_attendance': AttendanceSerializer(today_attendance).data if today_attendance else None
                })
        
        return Response({
            'bus': BusSerializer(bus).data,
            'students': students,
            'total_students': len(students)
        })
    except Bus.DoesNotExist:
        return Response({'error': 'No bus assigned'}, status=status.HTTP_404_NOT_FOUND)


# Bulk Mark Attendance
@api_view(['POST'])
@permission_classes([IsDriver])
def bulk_mark_attendance(request):
    attendance_data = request.data.get('attendances', [])
    attendance_date = request.data.get('date', date.today())
    
    if not attendance_data:
        return Response({'error': 'No attendance data provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    created_count = 0
    updated_count = 0
    errors = []
    
    for item in attendance_data:
        try:
            user_id = item.get('user_id')
            attendance_status = item.get('status')
            
            user = User.objects.get(id=user_id)
            
            # Update or create attendance
            attendance, created = Attendance.objects.update_or_create(
                user=user,
                date=attendance_date,
                defaults={'status': attendance_status}
            )
            
            if created:
                created_count += 1
            else:
                updated_count += 1
                
        except User.DoesNotExist:
            errors.append(f"User {user_id} not found")
        except Exception as e:
            errors.append(f"Error for user {user_id}: {str(e)}")
    
    return Response({
        'message': 'Attendance marked successfully',
        'created': created_count,
        'updated': updated_count,
        'errors': errors
    })


# Get Available Drivers (for location-based assignment)
@api_view(['GET'])
@permission_classes([IsAdmin])
def get_available_drivers(request):
    location = request.query_params.get('location', '')
    
    # Get all drivers, not just available ones
    drivers = User.objects.filter(role='DRIVER')
    
    driver_list = []
    for driver in drivers:
        # Check if driver is assigned to a bus
        assigned_bus = Bus.objects.filter(driver=driver).first()
        
        # Get pending leave requests
        pending_leaves = DriverLeave.objects.filter(driver=driver, status='PENDING')
        leave_requests = []
        for leave in pending_leaves:
            leave_requests.append({
                'id': leave.id,
                'start_date': leave.start_date.strftime('%Y-%m-%d'),
                'end_date': leave.end_date.strftime('%Y-%m-%d'),
                'reason': leave.reason,
                'status': leave.status
            })
        
        driver_list.append({
            'id': driver.id,
            'username': driver.username,
            'first_name': driver.first_name or '',
            'last_name': driver.last_name or '',
            'name': f"{driver.first_name or driver.username} {driver.last_name or ''}".strip(),
            'home_location': driver.home_location or 'Not specified',
            'driving_experience': driver.driving_experience or 0,
            'license_number': driver.license_number or 'N/A',
            'salary': str(driver.salary) if driver.salary else '0',
            'status': driver.driver_status or 'AVAILABLE',
            'assigned_bus': assigned_bus.bus_number if assigned_bus else None,
            'leave_requests': leave_requests
        })
    
    return Response({
        'available_drivers': driver_list,
        'total': len(driver_list)
    })

# Helper for Haversine distance
import math

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates in kilometers using Haversine formula"""
    if not all([lat1, lon1, lat2, lon2]):
        return None
    
    R = 6371  # Earth radius in km
    dlat = math.radians(float(lat2) - float(lat1))
    dlon = math.radians(float(lon2) - float(lon1))
    a = math.sin(dlat / 2) * math.sin(dlat / 2) + \
        math.cos(math.radians(float(lat1))) * math.cos(math.radians(float(lat2))) * \
        math.sin(dlon / 2) * math.sin(dlon / 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def calculate_bus_fee_from_distance(distance_km):
    """
    Calculate monthly bus fee based on distance from home to university
    Distance tiers:
    - 0-20 km: ₹15000
    - 21-50 km: ₹30000
    - 51-60 km: ₹40000
    - 60+ km: ₹40000 (max)
    """
    if distance_km <= 20:
        return 15000
    elif distance_km <= 50:
        return 30000
    else:
        return 40000

def calculate_driver_salary_from_distance(distance_km):
    """
    Calculate driver salary based on route distance
    - 0-20 km: ₹15000
    - 21-50 km: ₹30000
    - 51-60 km: ₹40000
    """
    if distance_km <= 20:
        return 15000
    elif distance_km <= 50:
        return 30000
    else:
        return 40000

# University location coordinates (KSR College, Tiruchengode)
UNIVERSITY_LATITUDE = 11.3833
UNIVERSITY_LONGITUDE = 77.8833


# Auto-Assignment Service
@api_view(['POST'])
@permission_classes([IsAdmin])
def auto_assign_student_to_nearest_bus(request):
    """
    Auto-assign a student to the nearest available bus based on their home location
    Also assigns nearest available driver to that bus if not assigned
    """
    try:
        student_id = request.data.get('student_id')
        
        if not student_id:
            return Response({'error': 'student_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        student = User.objects.get(id=student_id, role='STUDENT')
        
        # Check if student has coordinates
        if not student.home_latitude or not student.home_longitude:
            return Response({
                'error': 'Student home coordinates not set. Please update student location first.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if student already has a seat
        existing_seat = Seat.objects.filter(assigned_user=student).first()
        if existing_seat:
            return Response({
                'error': f'Student already assigned to Bus {existing_seat.bus.bus_number}, Seat {existing_seat.seat_number}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Find all buses with available seats
        buses_with_seats = Bus.objects.filter(
            seats__is_available=True,
            status='WORKING'
        ).distinct()
        
        if not buses_with_seats.exists():
            return Response({'error': 'No buses with available seats'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate distance to each bus source and find nearest
        nearest_bus = None
        min_distance = float('inf')
        
        for bus in buses_with_seats:
            if bus.source_latitude and bus.source_longitude:
                distance = calculate_distance(
                    student.home_latitude,
                    student.home_longitude,
                    bus.source_latitude,
                    bus.source_longitude
                )
                
                if distance and distance < min_distance:
                    min_distance = distance
                    nearest_bus = bus
        
        if not nearest_bus:
            return Response({
                'error': 'No buses with valid coordinates found'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get available seat in the nearest bus
        available_seat = Seat.objects.filter(
            bus=nearest_bus,
            is_available=True
        ).exclude(seat_number=1).order_by('seat_number').first()
        
        if not available_seat:
            return Response({
                'error': f'No available seats in nearest bus {nearest_bus.bus_number}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Assign student to seat
        available_seat.assigned_user = student
        available_seat.is_available = False
        available_seat.save()
        
        # Calculate fee based on distance
        distance_to_university = calculate_distance(
            student.home_latitude,
            student.home_longitude,
            UNIVERSITY_LATITUDE,
            UNIVERSITY_LONGITUDE
        )
        
        fee_amount = calculate_bus_fee_from_distance(distance_to_university)
        
        # Create fee
        create_fee_for_student(student, distance_km=distance_to_university)
        
        # Auto-assign driver if bus doesn't have one
        driver_assigned = False
        assigned_driver = None
        
        if not nearest_bus.driver:
            # Find nearest available driver
            available_drivers = User.objects.filter(
                role='DRIVER',
                driver_status='AVAILABLE'
            ).exclude(assigned_bus__isnull=False)
            
            nearest_driver = None
            min_driver_distance = float('inf')
            
            for driver in available_drivers:
                if driver.home_latitude and driver.home_longitude and nearest_bus.source_latitude:
                    distance = calculate_distance(
                        driver.home_latitude,
                        driver.home_longitude,
                        nearest_bus.source_latitude,
                        nearest_bus.source_longitude
                    )
                    
                    if distance and distance < min_driver_distance:
                        min_driver_distance = distance
                        nearest_driver = driver
            
            if nearest_driver:
                nearest_bus.driver = nearest_driver
                nearest_driver.driver_status = 'UNAVAILABLE'  # Mark as assigned
                
                # Calculate and set driver salary based on route distance
                if nearest_bus.distance_km:
                    nearest_driver.salary = calculate_driver_salary_from_distance(float(nearest_bus.distance_km))
                    nearest_driver.save()
                
                nearest_bus.save()
                driver_assigned = True
                assigned_driver = nearest_driver
                
                # Notify driver
                NotificationService.send_notification(
                    user=nearest_driver,
                    message=f"🚌 You have been assigned to Bus {nearest_bus.bus_number} ({nearest_bus.source} → {nearest_bus.destination})",
                    created_by=request.user
                )
        
        # Notify student
        NotificationService.send_notification(
            user=student,
            message=f"✅ You have been assigned to Bus {nearest_bus.bus_number}, Seat {available_seat.seat_number}. Route: {nearest_bus.source} → {nearest_bus.destination}. Fee: ₹{fee_amount}",
            created_by=request.user
        )
        
        return Response({
            'message': 'Student assigned successfully',
            'student': f"{student.first_name} {student.last_name}",
            'bus': {
                'bus_number': nearest_bus.bus_number,
                'route': f"{nearest_bus.source} → {nearest_bus.destination}",
                'distance_to_bus': round(min_distance, 2)
            },
            'seat': available_seat.seat_number,
            'distance_to_university': round(distance_to_university, 2),
            'fee_amount': fee_amount,
            'driver_assigned': driver_assigned,
            'assigned_driver': {
                'name': f"{assigned_driver.first_name} {assigned_driver.last_name}",
                'distance_to_bus': round(min_driver_distance, 2),
                'salary': str(assigned_driver.salary)
            } if assigned_driver else None
        })
        
    except User.DoesNotExist:
        return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Bulk Auto-Assignment
@api_view(['POST'])
@permission_classes([IsAdmin])
def bulk_auto_assign_students(request):
    """Auto-assign all unassigned students to nearest buses"""
    try:
        # Get all unassigned students with coordinates
        assigned_student_ids = Seat.objects.filter(assigned_user__isnull=False).values_list('assigned_user_id', flat=True)
        unassigned_students = User.objects.filter(
            role='STUDENT',
            home_latitude__isnull=False,
            home_longitude__isnull=False
        ).exclude(id__in=assigned_student_ids)
        
        if not unassigned_students.exists():
            return Response({'message': 'No unassigned students with coordinates found'})
        
        assigned_count = 0
        failed_count = 0
        assignments = []
        
        for student in unassigned_students:
            try:
                # Call the single assignment function
                result = auto_assign_student_to_nearest_bus(
                    type('Request', (), {'data': {'student_id': student.id}, 'user': request.user})()
                )
                
                if result.status_code == 200:
                    assigned_count += 1
                    assignments.append({
                        'student': f"{student.first_name} {student.last_name}",
                        'bus': result.data['bus']['bus_number'],
                        'seat': result.data['seat']
                    })
                else:
                    failed_count += 1
            except Exception as e:
                failed_count += 1
                continue
        
        return Response({
            'message': f'Bulk assignment completed',
            'assigned': assigned_count,
            'failed': failed_count,
            'assignments': assignments
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAdmin])
def get_available_drivers_with_location(request):
    try:
        source_lat = float(request.query_params.get('lat', 0))
        source_lng = float(request.query_params.get('lng', 0))
    except ValueError:
        return Response({'error': 'Invalid coordinates'}, status=status.HTTP_400_BAD_REQUEST)

    drivers = User.objects.filter(
        role='DRIVER',
        driver_status='AVAILABLE'
    ).exclude(assigned_bus__isnull=False)
    
    driver_list = []
    for driver in drivers:
        distance = 0
        if driver.current_latitude and driver.current_longitude and source_lat and source_lng:
            distance = calculate_distance(
                float(source_lat), float(source_lng),
                float(driver.current_latitude), float(driver.current_longitude)
            )
            
        driver_list.append({
            'id': driver.id,
            'username': driver.username,
            'name': f"{driver.first_name} {driver.last_name}",
            'current_latitude': driver.current_latitude,
            'current_longitude': driver.current_longitude,
            'distance_km': round(distance, 2),
            'status': driver.driver_status
        })
    
    # Sort by distance
    driver_list.sort(key=lambda x: x['distance_km'])
    
    return Response(driver_list)


# Get all students for assignment
@api_view(['GET'])
@permission_classes([IsAdmin])
def get_all_students(request):
    students = User.objects.filter(role='STUDENT')
    student_list = []
    for student in students:
        # Check if student already has a seat
        assigned_seat = Seat.objects.filter(assigned_user=student).first()
        
        # Get unpaid fees with detailed breakdown
        unpaid_fees = Fee.objects.filter(user=student, payment_status__in=['PENDING', 'OVERDUE', 'PARTIAL'])
        fee_list = []
        total_amount = 0
        total_paid = 0
        total_pending = 0
        
        for fee in unpaid_fees:
            fee_list.append({
                'id': fee.id,
                'amount': str(fee.amount),
                'paid_amount': str(fee.paid_amount),
                'pending_amount': str(fee.pending_amount),
                'description': f"{fee.month} {fee.year} - Bus Fee",
                'due_date': fee.due_date.strftime('%Y-%m-%d'),
                'payment_status': fee.payment_status
            })
            total_amount += fee.amount
            total_paid += fee.paid_amount
            total_pending += fee.pending_amount
        
        student_list.append({
            'id': student.id,
            'username': student.username,
            'first_name': student.first_name,
            'last_name': student.last_name,
            'name': f"{student.first_name} {student.last_name}",
            'email': student.email,
            'phone': student.phone,
            'college_name': student.college_name,
            'year': student.year,
            'semester': student.semester,
            'home_location': student.home_location,
            'gender': student.gender,
            'has_seat': assigned_seat is not None,
            'seat_details': {
                'bus_number': assigned_seat.bus.bus_number if assigned_seat else None,
                'seat_number': assigned_seat.seat_number if assigned_seat else None,
                'route': f"{assigned_seat.bus.source} → {assigned_seat.bus.destination}" if assigned_seat else None
            } if assigned_seat else None,
            'has_unpaid_fees': len(fee_list) > 0,
            'unpaid_fees': fee_list,
            'fee_summary': {
                'total_amount': str(total_amount),
                'paid_amount': str(total_paid),
                'pending_amount': str(total_pending)
            }
        })
    
    return Response({
        'students': student_list,
        'total': len(student_list)
    })


@api_view(['GET'])
@permission_classes([IsAdmin])
def get_all_staffs(request):
    staffs = User.objects.filter(role='TEACHER')
    staff_list = []
    for staff in staffs:
        # Check if staff already has a seat
        assigned_seat = Seat.objects.filter(assigned_user=staff).first()
        staff_list.append({
            'id': staff.id,
            'username': staff.username,
            'first_name': staff.first_name,
            'last_name': staff.last_name,
            'name': f"{staff.first_name} {staff.last_name}",
            'email': staff.email,
            'phone': staff.phone,
            'college_name': staff.college_name,
            'home_location': staff.home_location,
            'has_seat': assigned_seat is not None,
            'seat_details': {
                'bus_number': assigned_seat.bus.bus_number if assigned_seat else None,
                'seat_number': assigned_seat.seat_number if assigned_seat else None
            } if assigned_seat else None
        })
    
    return Response({
        'staffs': staff_list,
        'total': len(staff_list)
    })


@api_view(['POST'])
@permission_classes([IsAdmin])
def send_fee_reminder(request, student_id):
    try:
        student = User.objects.get(id=student_id, role='STUDENT')
        fee_id = request.data.get('fee_id')
        
        if fee_id:
            fee = Fee.objects.get(id=fee_id, user=student)
            message = f"⚠️ Fee Payment Reminder: You have an unpaid fee of ₹{fee.amount} for {fee.month} {fee.year}. Due date: {fee.due_date}. Please pay as soon as possible to avoid service interruption."
        else:
            # Send general reminder for all unpaid fees
            unpaid_fees = Fee.objects.filter(user=student, payment_status__in=['PENDING', 'OVERDUE'])
            total_amount = sum(fee.amount for fee in unpaid_fees)
            message = f"⚠️ Fee Payment Reminder: You have {unpaid_fees.count()} unpaid fee(s) totaling ₹{total_amount}. Please clear your dues to continue using transport services."
        
        NotificationService.send_notification(
            user=student,
            message=message,
            created_by=request.user
        )
        
        return Response({'message': 'Fee reminder sent successfully'})
    except User.DoesNotExist:
        return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
    except Fee.DoesNotExist:
        return Response({'error': 'Fee not found'}, status=status.HTTP_404_NOT_FOUND)


# Bulk Fee Reminder - Send to all unpaid students or specific bus
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_bulk_fee_reminder(request):
    """
    Send fee reminders to multiple students
    - If no student_ids provided: Send to ALL unpaid students
    - If bus_id provided: Send to all unpaid students in that bus
    - If student_ids provided: Send to specific students
    """
    try:
        student_ids = request.data.get('student_ids', [])
        bus_id = request.data.get('bus_id')
        sender_role = request.user.role  # ADMIN or DRIVER
        
        # Determine which students to send reminders to
        if bus_id:
            # Get all students in the bus with unpaid fees
            seats = Seat.objects.filter(bus_id=bus_id, is_available=False).select_related('assigned_user')
            student_ids = [seat.assigned_user.id for seat in seats if seat.assigned_user]
            unpaid_students = User.objects.filter(
                id__in=student_ids,
                role='STUDENT',
                fees__payment_status__in=['PENDING', 'OVERDUE', 'PARTIAL']
            ).distinct()
        elif student_ids:
            # Specific students
            unpaid_students = User.objects.filter(
                id__in=student_ids,
                role='STUDENT',
                fees__payment_status__in=['PENDING', 'OVERDUE', 'PARTIAL']
            ).distinct()
        else:
            # All unpaid students
            unpaid_students = User.objects.filter(
                role='STUDENT',
                fees__payment_status__in=['PENDING', 'OVERDUE', 'PARTIAL']
            ).distinct()
        
        sent_count = 0
        for student in unpaid_students:
            # Get student's seat and bus info
            seat = Seat.objects.filter(assigned_user=student).select_related('bus').first()
            
            if seat:
                bus_info = f"Bus {seat.bus.bus_number} (Seat {seat.seat_number})"
                route_info = f"{seat.bus.source} → {seat.bus.destination}"
            else:
                bus_info = "Not assigned to any bus"
                route_info = "N/A"
            
            # Get unpaid fees
            unpaid_fees = Fee.objects.filter(
                user=student,
                payment_status__in=['PENDING', 'OVERDUE', 'PARTIAL']
            )
            
            total_amount = sum(fee.amount for fee in unpaid_fees)
            paid_amount = sum(fee.paid_amount for fee in unpaid_fees)
            pending_amount = sum(fee.pending_amount for fee in unpaid_fees)
            
            # Create detailed reminder message
            sender_text = "Admin" if sender_role == 'ADMIN' else "Driver"
            message = f"""
🚨 FEE PAYMENT REMINDER (from {sender_text})

Student: {student.first_name} {student.last_name}
{bus_info}
Route: {route_info}

💰 Fee Details:
Total Amount: ₹{total_amount}
Paid Amount: ₹{paid_amount}
Pending Amount: ₹{pending_amount}

📅 Unpaid Fees: {unpaid_fees.count()}

Please clear your pending dues at the earliest to continue using transport services.
            """.strip()
            
            # Send notification
            NotificationService.send_notification(
                user=student,
                message=message,
                created_by=request.user
            )
            
            # Update reminder tracking
            for fee in unpaid_fees:
                fee.reminder_sent_count += 1
                fee.last_reminder_sent = timezone.now()
                fee.reminder_sent_by = request.user
                fee.save()
            
            sent_count += 1
        
        return Response({
            'message': f'Fee reminders sent successfully to {sent_count} students',
            'sent_count': sent_count
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Partial Payment
@api_view(['POST'])
@permission_classes([IsAdmin])
def record_partial_payment(request):
    """Record a partial payment for a fee"""
    try:
        fee_id = request.data.get('fee_id')
        payment_amount = request.data.get('payment_amount')
        payment_method = request.data.get('payment_method', 'CASH')
        transaction_id = request.data.get('transaction_id', '')
        
        if not fee_id or not payment_amount:
            return Response({'error': 'fee_id and payment_amount are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        fee = Fee.objects.get(id=fee_id)
        payment_amount = Decimal(payment_amount)
        
        # Validate payment amount
        if payment_amount <= 0:
            return Response({'error': 'Payment amount must be greater than 0'}, status=status.HTTP_400_BAD_REQUEST)
        
        if fee.paid_amount + payment_amount > fee.amount:
            return Response({'error': 'Payment amount exceeds pending amount'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update fee
        fee.paid_amount += payment_amount
        fee.payment_method = payment_method
        fee.transaction_id = transaction_id
        
        if fee.paid_amount >= fee.amount:
            fee.paid_date = date.today()
        
        fee.save()  # Auto-calculates pending_amount and updates status
        
        # Send confirmation notification
        NotificationService.send_notification(
            user=fee.user,
            message=f"✅ Payment Received: ₹{payment_amount} for {fee.month} {fee.year}. Remaining: ₹{fee.pending_amount}",
            created_by=request.user
        )
        
        return Response({
            'message': 'Payment recorded successfully',
            'fee': FeeSerializer(fee).data
        })
        
    except Fee.DoesNotExist:
        return Response({'error': 'Fee not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def create_fee_for_student(student, distance_km=None):
    """
    Create a monthly fee for a student based on their home location distance
    If distance is not provided, try to calculate from home_location coordinates
    """
    from datetime import date, timedelta
    from decimal import Decimal
    
    # Try to parse coordinates from home_location if distance not provided
    if distance_km is None:
        # Assume home_location format: "City Name (lat,lon)" or just use default
        # For now, use a default distance if not calculable
        distance_km = 15  # Default to mid-range
    
    # Calculate fee amount based on distance
    fee_amount = calculate_bus_fee_from_distance(distance_km)
    
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
    
    # Create or update fee
    fee, created = Fee.objects.get_or_create(
        user=student,
        month=month_name,
        year=year,
        defaults={
            'amount': Decimal(fee_amount),
            'due_date': due_date,
            'payment_status': 'PENDING'
        }
    )
    
    if created:
        # Send notification to student
        NotificationService.send_notification(
            user=student,
            message=f"💰 Bus fee assigned: ₹{fee_amount} for {month_name} {year}. Due date: {due_date}. Distance from university: {distance_km:.1f} km",
            created_by=None
        )
    
    return fee


@api_view(['POST'])
@permission_classes([IsAdmin])
def approve_driver_leave(request, leave_id):
    try:
        leave = DriverLeave.objects.get(id=leave_id)
        leave.status = 'APPROVED'
        leave.approved_by = request.user
        leave.admin_remarks = request.data.get('remarks', '')
        leave.save()
        
        # Send notification to driver
        NotificationService.send_notification(
            user=leave.driver,
            message=f"Your leave request from {leave.start_date} to {leave.end_date} has been APPROVED.",
            created_by=request.user
        )
        
        return Response({'message': 'Leave approved successfully'})
    except DriverLeave.DoesNotExist:
        return Response({'error': 'Leave request not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAdmin])
def reject_driver_leave(request, leave_id):
    try:
        leave = DriverLeave.objects.get(id=leave_id)
        leave.status = 'REJECTED'
        leave.approved_by = request.user
        leave.admin_remarks = request.data.get('remarks', '')
        leave.save()
        
        # Send notification to driver
        NotificationService.send_notification(
            user=leave.driver,
            message=f"Your leave request from {leave.start_date} to {leave.end_date} has been REJECTED. Reason: {leave.admin_remarks}",
            created_by=request.user
        )
        
        return Response({'message': 'Leave rejected successfully'})
    except DriverLeave.DoesNotExist:
        return Response({'error': 'Leave request not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PATCH'])
@permission_classes([IsAdmin])
def update_driver_details(request, driver_id):
    try:
        driver = User.objects.get(id=driver_id, role='DRIVER')
        
        # Update allowed fields
        if 'salary' in request.data:
            driver.salary = request.data['salary']
        
        if 'home_latitude' in request.data:
            driver.home_latitude = request.data['home_latitude']
        
        if 'home_longitude' in request.data:
            driver.home_longitude = request.data['home_longitude']
        
        if 'home_location' in request.data:
            driver.home_location = request.data['home_location']
        
        driver.save()
        
        # If location was updated, recalculate salary based on assigned bus route
        if 'home_latitude' in request.data or 'home_longitude' in request.data:
            try:
                bus = Bus.objects.get(driver=driver)
                if bus.distance_km:
                    # Calculate salary based on route distance
                    distance = float(bus.distance_km)
                    if distance <= 20:
                        driver.salary = Decimal('15000')
                    elif distance <= 50:
                        driver.salary = Decimal('30000')
                    else:
                        driver.salary = Decimal('40000')
                    driver.save()
            except Bus.DoesNotExist:
                pass
        
        return Response({
            'message': 'Driver details updated successfully',
            'driver': UserProfileSerializer(driver).data
        })
    except User.DoesNotExist:
        return Response({'error': 'Driver not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAdmin])
def delete_driver(request, driver_id):
    try:
        driver = User.objects.get(id=driver_id, role='DRIVER')
        
        # Check if driver is assigned to any bus
        assigned_bus = Bus.objects.filter(driver=driver).first()
        if assigned_bus:
            return Response({
                'error': f'Cannot delete driver. They are assigned to Bus {assigned_bus.bus_number}. Please unassign them first.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        driver.delete()
        return Response({'message': 'Driver deleted successfully'})
    except User.DoesNotExist:
        return Response({'error': 'Driver not found'}, status=status.HTTP_404_NOT_FOUND)


# Assign student to a seat
@api_view(['POST'])
@permission_classes([IsAdmin])
def assign_student_to_seat(request):
    student_id = request.data.get('student_id')
    seat_id = request.data.get('seat_id')
    
    if not student_id or not seat_id:
        return Response({'error': 'student_id and seat_id are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        student = User.objects.get(id=student_id, role='STUDENT')
        seat = Seat.objects.get(id=seat_id)
        
        # Check if seat is already occupied
        if not seat.is_available:
            return Response({'error': 'Seat is already occupied'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if student already has a seat
        existing_seat = Seat.objects.filter(assigned_user=student).first()
        if existing_seat:
            # Free up the old seat
            existing_seat.assigned_user = None
            existing_seat.is_available = True
            existing_seat.save()
        
        # Assign new seat
        seat.assigned_user = student
        seat.is_available = False
        seat.save()
        
        # Create fee for student (use default distance for now)
        create_fee_for_student(student, distance_km=15)
        
        return Response({
            'message': 'Student assigned to seat successfully and bus fee created',
            'student': f"{student.first_name} {student.last_name}",
            'seat': f"Bus {seat.bus.bus_number}, Seat {seat.seat_number}"
        })
        
    except User.DoesNotExist:
        return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
    except Seat.DoesNotExist:
        return Response({'error': 'Seat not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Smart Auto-Assignment API with Location Matching
@api_view(['POST'])
@permission_classes([IsAdmin])
def auto_assign_students_to_bus(request):
    bus_id = request.data.get('bus_id')
    
    if not bus_id:
        return Response({'error': 'bus_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        bus = Bus.objects.get(id=bus_id)
        
        # Get all seats for this bus, exclude driver seat (seat 1)
        all_seats = Seat.objects.filter(bus=bus).exclude(seat_number=1).order_by('seat_number')
        available_seats = all_seats.filter(is_available=True)
        
        if available_seats.count() == 0:
            return Response({'error': 'No available seats on this bus'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get unassigned students
        assigned_student_ids = Seat.objects.filter(assigned_user__isnull=False).values_list('assigned_user_id', flat=True)
        unassigned_students = User.objects.filter(role='STUDENT').exclude(id__in=assigned_student_ids)
        
        # Filter students whose home location matches bus source or is along the route
        # Match by checking if student's home_location contains bus source or nearby areas
        matching_students = []
        for student in unassigned_students:
            if student.home_location:
                # Case-insensitive matching
                home_loc = student.home_location.lower()
                bus_source = bus.source.lower()
                bus_dest = bus.destination.lower()
                
                # Check if home location matches source or destination
                if bus_source in home_loc or home_loc in bus_source:
                    matching_students.append(student)
        
        # If no matching students, use all unassigned students
        if not matching_students:
            matching_students = list(unassigned_students)
        
        # Separate by gender
        female_students = [s for s in matching_students if s.gender == 'FEMALE']
        male_students = [s for s in matching_students if s.gender == 'MALE']
        other_students = [s for s in matching_students if s.gender not in ['MALE', 'FEMALE']]
        
        # Split seats into front half (for girls) and back half (for boys)
        total_available = available_seats.count()
        half_point = total_available // 2
        
        front_seats = list(available_seats[:half_point])  # Girls
        back_seats = list(available_seats[half_point:])   # Boys
        
        assigned_count = 0
        assignments = []
        location_matched = 0
        
        # Assign females to front seats
        for i, student in enumerate(female_students):
            if i >= len(front_seats):
                break
            seat = front_seats[i]
            seat.assigned_user = student
            seat.is_available = False
            seat.save()
            
            # Create fee for student (use default distance for now)
            create_fee_for_student(student, distance_km=15)
            
            # Check if location matched
            is_matched = bus.source.lower() in student.home_location.lower() if student.home_location else False
            if is_matched:
                location_matched += 1
            
            assigned_count += 1
            assignments.append({
                'student': f"{student.first_name} {student.last_name}",
                'seat': seat.seat_number,
                'section': 'Front (Girls)',
                'home_location': student.home_location or 'N/A',
                'location_matched': is_matched
            })
        
        # Assign males to back seats
        for i, student in enumerate(male_students):
            if i >= len(back_seats):
                break
            seat = back_seats[i]
            seat.assigned_user = student
            seat.is_available = False
            seat.save()
            
            # Create fee for student (use default distance for now)
            create_fee_for_student(student, distance_km=15)
            
            # Check if location matched
            is_matched = bus.source.lower() in student.home_location.lower() if student.home_location else False
            if is_matched:
                location_matched += 1
            
            assigned_count += 1
            assignments.append({
                'student': f"{student.first_name} {student.last_name}",
                'seat': seat.seat_number,
                'section': 'Back (Boys)',
                'home_location': student.home_location or 'N/A',
                'location_matched': is_matched
            })
        
        # Assign others to remaining seats
        remaining_seats = [s for s in front_seats[len(female_students):]] + [s for s in back_seats[len(male_students):]]
        for i, student in enumerate(other_students):
            if i >= len(remaining_seats):
                break
            seat = remaining_seats[i]
            seat.assigned_user = student
            seat.is_available = False
            seat.save()
            
            # Create fee for student (use default distance for now)
            create_fee_for_student(student, distance_km=15)
            
            # Check if location matched
            is_matched = bus.source.lower() in student.home_location.lower() if student.home_location else False
            if is_matched:
                location_matched += 1
            
            assigned_count += 1
            assignments.append({
                'student': f"{student.first_name} {student.last_name}",
                'seat': seat.seat_number,
                'section': 'Mixed',
                'home_location': student.home_location or 'N/A',
                'location_matched': is_matched
            })
        
        return Response({
            'message': f'Successfully assigned {assigned_count} students and created their bus fees',
            'bus': f"Bus {bus.bus_number} ({bus.source} → {bus.destination})",
            'total_assigned': assigned_count,
            'location_matched': location_matched,
            'assignments': assignments
        })
        
    except Bus.DoesNotExist:
        return Response({'error': 'Bus not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Unassign/Remove student from seat
@api_view(['POST'])
@permission_classes([IsAdmin])
def unassign_seat(request, seat_id):
    try:
        seat = Seat.objects.get(id=seat_id)
        
        if seat.is_available:
            return Response({'error': 'Seat is already empty'}, status=status.HTTP_400_BAD_REQUEST)
        
        student_name = f"{seat.assigned_user.first_name} {seat.assigned_user.last_name}" if seat.assigned_user else "Unknown"
        
        # Clear the seat
        seat.assigned_user = None
        seat.is_available = True
        seat.save()
        
        return Response({
            'message': f'Successfully removed {student_name} from seat {seat.seat_number}',
            'seat_number': seat.seat_number,
            'bus_number': seat.bus.bus_number
        })
        
    except Seat.DoesNotExist:
        return Response({'error': 'Seat not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# Student Query Views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_student_query(request):
    """Student submits a query"""
    try:
        student = request.user
        
        if student.role != 'STUDENT':
            return Response({'error': 'Only students can submit queries'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get student's seat and bus
        try:
            seat = Seat.objects.get(assigned_user=student)
            bus = seat.bus
            seat_number = seat.seat_number
        except Seat.DoesNotExist:
            return Response({'error': 'You are not assigned to any bus'}, status=status.HTTP_400_BAD_REQUEST)
        
        subject = request.data.get('subject')
        message = request.data.get('message')
        anonymous = request.data.get('anonymous', False)
        
        if not subject or not message:
            return Response({'error': 'Subject and message are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create query
        query = StudentQuery.objects.create(
            student=student,
            bus=bus,
            seat_number=seat_number,
            subject=subject,
            message=message,
            anonymous=anonymous,
            status='OPEN'
        )
        
        # Notify all admins
        admins = User.objects.filter(role='ADMIN')
        student_name = "Anonymous Student" if anonymous else f"{student.first_name} {student.last_name}"
        
        for admin in admins:
            NotificationService.send_notification(
                user=admin,
                message=f"📝 New Query from {student_name} | Bus {bus.bus_number} | Seat {seat_number} | Subject: {subject}",
                created_by=None if anonymous else student
            )
        
        from .serializers import StudentQuerySerializer
        return Response({
            'message': 'Query submitted successfully',
            'query': StudentQuerySerializer(query).data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_student_queries(request):
    """Get queries - students see their own, admins see all"""
    try:
        user = request.user
        
        if user.role == 'ADMIN':
            queries = StudentQuery.objects.all().order_by('-created_at')
        elif user.role == 'STUDENT':
            queries = StudentQuery.objects.filter(student=user).order_by('-created_at')
        else:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        from .serializers import StudentQuerySerializer
        serializer = StudentQuerySerializer(queries, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAdmin])
def reply_to_query(request, query_id):
    """Admin replies to a student query"""
    try:
        query = StudentQuery.objects.get(id=query_id)
        admin_reply = request.data.get('admin_reply')
        
        if not admin_reply:
            return Response({'error': 'Reply message is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        query.admin_reply = admin_reply
        query.replied_by = request.user
        query.status = 'REPLIED'
        query.save()
        
        # Notify student
        NotificationService.send_notification(
            user=query.student,
            message=f"✅ Your query '{query.subject}' has been replied to by admin. Please check your queries section.",
            created_by=request.user
        )
        
        from .serializers import StudentQuerySerializer
        return Response({
            'message': 'Reply sent successfully',
            'query': StudentQuerySerializer(query).data
        })
        
    except StudentQuery.DoesNotExist:
        return Response({'error': 'Query not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_satisfaction_feedback(request, query_id):
    """Student submits satisfaction feedback for a replied query"""
    try:
        query = StudentQuery.objects.get(id=query_id, student=request.user)
        
        if query.status != 'REPLIED':
            return Response({'error': 'Query has not been replied to yet'}, status=status.HTTP_400_BAD_REQUEST)
        
        is_satisfied = request.data.get('is_satisfied')
        satisfaction_feedback = request.data.get('satisfaction_feedback', '')
        
        if is_satisfied is None:
            return Response({'error': 'is_satisfied field is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        query.is_satisfied = is_satisfied
        query.satisfaction_feedback = satisfaction_feedback
        
        if is_satisfied:
            query.status = 'CLOSED'
        else:
            query.status = 'REOPENED'
        
        query.save()
        
        # Notify admin
        if query.replied_by:
            NotificationService.send_notification(
                user=query.replied_by,
                message=f"{'✅ Student is satisfied' if is_satisfied else '⚠️ Student reopened query'}: '{query.subject}' | Bus {query.bus.bus_number}",
                created_by=request.user
            )
        
        from .serializers import StudentQuerySerializer
        return Response({
            'message': 'Feedback submitted successfully',
            'query': StudentQuerySerializer(query).data
        })
        
    except StudentQuery.DoesNotExist:
        return Response({'error': 'Query not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAdmin])
def close_query(request, query_id):
    """Admin closes a query"""
    try:
        query = StudentQuery.objects.get(id=query_id)
        query.status = 'CLOSED'
        query.save()
        
        from .serializers import StudentQuerySerializer
        return Response({
            'message': 'Query closed successfully',
            'query': StudentQuerySerializer(query).data
        })
        
    except StudentQuery.DoesNotExist:
        return Response({'error': 'Query not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
