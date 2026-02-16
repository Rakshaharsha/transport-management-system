from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Bus, Seat, Attendance, Notification, Query, Fee, EmergencyAlert, DriverLeave, DriverAttendance, StudentQuery


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'password2', 'first_name', 'last_name', 
                  'role', 'profile_photo', 'phone', 'address', 'driving_experience', 'salary', 
                  'license_number', 'driver_status', 'home_location', 'college_name', 'year', 'course', 
                  'semester', 'academic_year', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('password2'):
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 
                  'profile_photo', 'phone', 'address', 'driving_experience', 'salary', 
                  'license_number', 'driver_status', 'home_location', 'college_name', 'year', 'course', 
                  'semester', 'academic_year']
        read_only_fields = ['id', 'username', 'role']


class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'driving_experience', 'salary', 'license_number']


class BusSerializer(serializers.ModelSerializer):
    driver_details = DriverSerializer(source='driver', read_only=True)
    assigned_seats_count = serializers.SerializerMethodField()

    class Meta:
        model = Bus
        fields = ['id', 'bus_number', 'source', 'destination', 'capacity', 'status', 
                  'driver', 'driver_details', 'current_location', 'assigned_seats_count', 
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_assigned_seats_count(self, obj):
        return obj.seats.filter(is_available=False).count()


class SeatSerializer(serializers.ModelSerializer):
    bus_details = serializers.SerializerMethodField()
    user_details = serializers.SerializerMethodField()

    class Meta:
        model = Seat
        fields = ['id', 'bus', 'bus_details', 'seat_number', 'assigned_user', 
                  'user_details', 'is_available', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_bus_details(self, obj):
        return {
            'bus_number': obj.bus.bus_number,
            'source': obj.bus.source,
            'destination': obj.bus.destination
        }

    def get_user_details(self, obj):
        if obj.assigned_user:
            # Check for unpaid fees
            from .models import Fee
            unpaid_fees = Fee.objects.filter(
                user=obj.assigned_user, 
                payment_status__in=['PENDING', 'OVERDUE']
            ).exists()
            
            return {
                'id': obj.assigned_user.id,
                'username': obj.assigned_user.username,
                'first_name': obj.assigned_user.first_name,
                'last_name': obj.assigned_user.last_name,
                'name': f"{obj.assigned_user.first_name} {obj.assigned_user.last_name}",
                'role': obj.assigned_user.role,
                'college_name': obj.assigned_user.college_name,
                'year': obj.assigned_user.year,
                'semester': obj.assigned_user.semester,
                'gender': obj.assigned_user.gender,
                'email': obj.assigned_user.email,
                'phone_number': obj.assigned_user.phone,
                'home_location': obj.assigned_user.home_location,
                'has_unpaid_fees': unpaid_fees,
                'fee_status': 'Unpaid' if unpaid_fees else 'Paid'
            }
        return None
        return None


class AttendanceSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()
    approved_by_details = serializers.SerializerMethodField()

    class Meta:
        model = Attendance
        fields = ['id', 'user', 'user_details', 'date', 'status', 'is_approved', 
                  'approved_by', 'approved_by_details', 'remarks', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_user_details(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'name': f"{obj.user.first_name} {obj.user.last_name}",
            'role': obj.user.role
        }

    def get_approved_by_details(self, obj):
        if obj.approved_by:
            return {
                'id': obj.approved_by.id,
                'username': obj.approved_by.username,
                'name': f"{obj.approved_by.first_name} {obj.approved_by.last_name}"
            }
        return None


class NotificationSerializer(serializers.ModelSerializer):
    created_by_details = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'user', 'message', 'is_seen', 'created_by', 
                  'created_by_details', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_created_by_details(self, obj):
        if obj.created_by:
            return {
                'id': obj.created_by.id,
                'username': obj.created_by.username,
                'name': f"{obj.created_by.first_name} {obj.created_by.last_name}"
            }
        return None


class QuerySerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()
    driver_details = serializers.SerializerMethodField()

    class Meta:
        model = Query
        fields = ['id', 'user', 'user_details', 'driver', 'driver_details', 
                  'subject', 'message', 'status', 'response', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_user_details(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'name': f"{obj.user.first_name} {obj.user.last_name}",
            'role': obj.user.role
        }

    def get_driver_details(self, obj):
        return {
            'id': obj.driver.id,
            'username': obj.driver.username,
            'name': f"{obj.driver.first_name} {obj.driver.last_name}"
        }


class FeeSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()

    class Meta:
        model = Fee
        fields = ['id', 'user', 'user_details', 'amount', 'paid_amount', 'pending_amount',
                  'month', 'year', 'semester', 'academic_year', 'payment_status', 'paid_date', 
                  'due_date', 'payment_method', 'transaction_id', 'distance_km',
                  'reminder_sent_count', 'last_reminder_sent', 'created_at']
        read_only_fields = ['id', 'created_at', 'pending_amount']

    def get_user_details(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'name': f"{obj.user.first_name} {obj.user.last_name}",
            'role': obj.user.role,
            'college_name': obj.user.college_name,
            'year': obj.user.year,
            'semester': obj.user.semester
        }



class EmergencyAlertSerializer(serializers.ModelSerializer):
    driver_details = UserProfileSerializer(source='driver', read_only=True)
    bus_details = BusSerializer(source='bus', read_only=True)
    resolved_by_details = UserProfileSerializer(source='resolved_by', read_only=True)

    class Meta:
        model = EmergencyAlert
        fields = ['id', 'driver', 'driver_details', 'bus', 'bus_details', 'message', 'location', 
                  'status', 'resolved_by', 'resolved_by_details', 'resolved_at', 'created_at']
        read_only_fields = ['id', 'created_at', 'resolved_by', 'resolved_at']


class DriverLeaveSerializer(serializers.ModelSerializer):
    driver_details = UserProfileSerializer(source='driver', read_only=True)
    substitute_driver_details = UserProfileSerializer(source='substitute_driver', read_only=True)
    approved_by_details = UserProfileSerializer(source='approved_by', read_only=True)

    class Meta:
        model = DriverLeave
        fields = ['id', 'driver', 'driver_details', 'start_date', 'end_date', 'reason', 'status', 
                  'approved_by', 'approved_by_details', 'substitute_driver', 'substitute_driver_details', 
                  'admin_remarks', 'created_at']
        read_only_fields = ['id', 'created_at', 'approved_by', 'status']


class DriverAttendanceSerializer(serializers.ModelSerializer):
    driver_name = serializers.CharField(source='driver.username', read_only=True)
    marked_by_name = serializers.CharField(source='marked_by.username', read_only=True)

    class Meta:
        model = DriverAttendance
        fields = ['id', 'driver', 'driver_name', 'date', 'status', 'km_driven', 
                  'remarks', 'marked_by', 'marked_by_name', 'created_at']
        read_only_fields = ['id', 'created_at', 'marked_by']


class StudentQuerySerializer(serializers.ModelSerializer):
    student_details = UserProfileSerializer(source='student', read_only=True)
    bus_details = BusSerializer(source='bus', read_only=True)
    replied_by_details = UserProfileSerializer(source='replied_by', read_only=True)
    
    class Meta:
        model = StudentQuery
        fields = ['id', 'student', 'student_details', 'bus', 'bus_details', 'seat_number', 
                  'subject', 'message', 'anonymous', 'status', 'admin_reply', 'replied_by', 
                  'replied_by_details', 'is_satisfied', 'satisfaction_feedback', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'student_details', 'bus_details', 'replied_by_details']
