from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'buses', views.BusViewSet, basename='bus')
router.register(r'seats', views.SeatViewSet, basename='seat')
router.register(r'attendances', views.AttendanceViewSet, basename='attendance')
router.register(r'notifications', views.NotificationViewSet, basename='notification')
router.register(r'queries', views.QueryViewSet, basename='query')
router.register(r'fees', views.FeeViewSet, basename='fee')
router.register(r'emergency-alerts', views.EmergencyAlertViewSet, basename='emergency-alert')
router.register(r'driver-leaves', views.DriverLeaveViewSet, basename='driver-leave')

urlpatterns = [
    # Authentication
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login, name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', views.profile, name='profile'),
    path('auth/profile/update/', views.update_profile, name='update_profile'),
    
    # Dashboards
    path('dashboard/admin/', views.admin_dashboard, name='admin_dashboard'),
    path('dashboard/driver/', views.driver_dashboard, name='driver_dashboard'),
    path('dashboard/user/', views.user_dashboard, name='user_dashboard'),
    
    # Driver specific
    path('driver/update-status/', views.update_driver_status_endpoint, name='update_driver_status'),
    path('driver/mark-attendance/', views.mark_driver_attendance, name='mark_driver_attendance'),
    path('driver/dashboard-stats/', views.get_driver_stats, name='get_driver_stats'),
    path('driver/breakdown-alert/', views.send_breakdown_alert, name='send_breakdown_alert'),
    path('driver/my-bus-students/', views.get_my_bus_students, name='get_my_bus_students'),
    path('driver/my-bus-students-enhanced/', views.get_my_bus_students_enhanced, name='get_my_bus_students_enhanced'),
    path('driver/bulk-mark-attendance/', views.bulk_mark_attendance, name='bulk_mark_attendance'),
    
    # Admin specific
    path('test-db/', views.test_db, name='test_db'),
    path('admin/available-drivers/', views.get_available_drivers, name='get_available_drivers'),
    path('admin/all-users/', views.get_all_users, name='get_all_users'),
    path('admin/update-driver/<int:driver_id>/', views.update_driver_details, name='update_driver_details'),
    path('admin/delete-driver/<int:driver_id>/', views.delete_driver, name='delete_driver'),
    path('admin/drivers-with-location/', views.get_available_drivers_with_location, name='get_available_drivers_with_location'),
    path('admin/students/', views.get_all_students, name='get_all_students'),
    path('admin/send-fee-reminder/<int:student_id>/', views.send_fee_reminder, name='send_fee_reminder'),
    path('admin/send-bulk-fee-reminder/', views.send_bulk_fee_reminder, name='send_bulk_fee_reminder'),
    path('admin/record-partial-payment/', views.record_partial_payment, name='record_partial_payment'),
    path('admin/approve-leave/<int:leave_id>/', views.approve_driver_leave, name='approve_driver_leave'),
    path('admin/reject-leave/<int:leave_id>/', views.reject_driver_leave, name='reject_driver_leave'),
    path('admin/assign-student-to-seat/', views.assign_student_to_seat, name='assign_student_to_seat'),
    path('admin/auto-assign-bus/', views.auto_assign_students_to_bus, name='auto_assign_students_to_bus'),
    path('admin/auto-assign-student/', views.auto_assign_student_to_nearest_bus, name='auto_assign_student_to_nearest_bus'),
    path('admin/bulk-auto-assign/', views.bulk_auto_assign_students, name='bulk_auto_assign_students'),
    path('admin/unassign-seat/<int:seat_id>/', views.unassign_seat, name='unassign_seat'),
    
    # Student Query endpoints
    path('student-queries/submit/', views.submit_student_query, name='submit_student_query'),
    path('student-queries/', views.get_student_queries, name='get_student_queries'),
    path('student-queries/<int:query_id>/reply/', views.reply_to_query, name='reply_to_query'),
    path('student-queries/<int:query_id>/satisfaction/', views.submit_satisfaction_feedback, name='submit_satisfaction_feedback'),
    path('student-queries/<int:query_id>/close/', views.close_query, name='close_query'),
    
    # Router URLs
    path('', include(router.urls)),
]
