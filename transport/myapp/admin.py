from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Bus, Seat, Attendance, Notification, Query, Fee, EmergencyAlert, DriverLeave


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'role', 'first_name', 'last_name', 'is_staff']
    list_filter = ['role', 'is_staff', 'is_active']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role', 'profile_photo', 'phone', 'address', 
                                        'driving_experience', 'salary', 'license_number')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('role', 'profile_photo', 'phone', 'address')}),
    )


@admin.register(Bus)
class BusAdmin(admin.ModelAdmin):
    list_display = ['bus_number', 'source', 'destination', 'capacity', 'status', 'driver', 'created_at']
    list_filter = ['status', 'source', 'destination']
    search_fields = ['bus_number', 'source', 'destination']
    raw_id_fields = ['driver']


@admin.register(Seat)
class SeatAdmin(admin.ModelAdmin):
    list_display = ['seat_number', 'bus', 'assigned_user', 'is_available']
    list_filter = ['is_available', 'bus']
    search_fields = ['bus__bus_number', 'assigned_user__username']
    raw_id_fields = ['bus', 'assigned_user']


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'status', 'is_approved', 'approved_by', 'created_at']
    list_filter = ['status', 'is_approved', 'date']
    search_fields = ['user__username']
    raw_id_fields = ['user', 'approved_by']
    date_hierarchy = 'date'


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'message', 'is_seen', 'created_by', 'created_at']
    list_filter = ['is_seen', 'created_at']
    search_fields = ['user__username', 'message']
    raw_id_fields = ['user', 'created_by']


@admin.register(Query)
class QueryAdmin(admin.ModelAdmin):
    list_display = ['user', 'driver', 'subject', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__username', 'driver__username', 'subject']
    raw_id_fields = ['user', 'driver']


@admin.register(Fee)
class FeeAdmin(admin.ModelAdmin):
    list_display = ['user', 'month', 'year', 'amount', 'payment_status', 'due_date', 'paid_date']
    list_filter = ['payment_status', 'year', 'month']
    search_fields = ['user__username']
    raw_id_fields = ['user']
    date_hierarchy = 'due_date'



@admin.register(EmergencyAlert)
class EmergencyAlertAdmin(admin.ModelAdmin):
    list_display = ['driver', 'bus', 'message', 'location', 'status', 'resolved_by', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['driver__username', 'bus__bus_number', 'message']
    raw_id_fields = ['driver', 'bus', 'resolved_by']
    date_hierarchy = 'created_at'


@admin.register(DriverLeave)
class DriverLeaveAdmin(admin.ModelAdmin):
    list_display = ['driver', 'start_date', 'end_date', 'status', 'substitute_driver', 'approved_by', 'created_at']
    list_filter = ['status', 'start_date', 'end_date']
    search_fields = ['driver__username', 'substitute_driver__username', 'reason']
    raw_id_fields = ['driver', 'approved_by', 'substitute_driver']
    date_hierarchy = 'start_date'
