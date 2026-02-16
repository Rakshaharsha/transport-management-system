from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from datetime import date


class User(AbstractUser):
    ROLE_CHOICES = [
        ('ADMIN', 'Admin'),
        ('DRIVER', 'Driver'),
        ('TEACHER', 'Teacher'),
        ('STUDENT', 'Student'),
    ]
    
    COLLEGE_CHOICES = [
        ('KSRCT', 'KSRCT'),
        ('KSRCE', 'KSRCE'),
        ('KSRCAS', 'KSRCAS'),
        ('KSRCAS (Women)', 'KSRCAS (Women)'),
        ('KSRDS', 'KSRDS'),
        ('KSRCN', 'KSRCN'),
    ]
    
    YEAR_CHOICES = [
        ('I', 'I Year'),
        ('II', 'II Year'),
        ('III', 'III Year'),
        ('IV', 'IV Year'),
    ]
    
    DRIVER_STATUS_CHOICES = [
        ('AVAILABLE', 'Available'),
        ('UNAVAILABLE', 'Unavailable'),
        ('ON_LEAVE', 'On Leave'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    profile_photo = models.ImageField(upload_to='profiles/', null=True, blank=True)
    phone = models.CharField(max_length=15, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    
    # Driver specific fields
    driving_experience = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    hire_date = models.DateField(null=True, blank=True)  # Date when driver was hired
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    license_number = models.CharField(max_length=50, null=True, blank=True)
    driver_status = models.CharField(max_length=15, choices=DRIVER_STATUS_CHOICES, default='AVAILABLE', null=True, blank=True)
    home_location = models.CharField(max_length=200, null=True, blank=True)
    home_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    home_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    current_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    current_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    last_location_update = models.DateTimeField(null=True, blank=True)
    
    def get_driving_experience(self):
        """Calculate driving experience based on hire date"""
        if self.hire_date:
            from datetime import date
            today = date.today()
            years = today.year - self.hire_date.year
            # Adjust if birthday hasn't occurred this year
            if today.month < self.hire_date.month or (today.month == self.hire_date.month and today.day < self.hire_date.day):
                years -= 1
            return max(0, years)
        return self.driving_experience or 0
    
    def save(self, *args, **kwargs):
        # Auto-update driving_experience based on hire_date
        if self.role == 'DRIVER' and self.hire_date:
            self.driving_experience = self.get_driving_experience()
        super().save(*args, **kwargs)
    
    # Student/Teacher specific fields
    college_name = models.CharField(max_length=50, choices=COLLEGE_CHOICES, null=True, blank=True)
    year = models.CharField(max_length=5, choices=YEAR_CHOICES, null=True, blank=True)
    course = models.CharField(max_length=100, null=True, blank=True)
    semester = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(8)])
    academic_year = models.CharField(max_length=20, null=True, blank=True)  # e.g., "2025-2026"
    gender = models.CharField(max_length=10, choices=[('MALE', 'Male'), ('FEMALE', 'Female'), ('OTHER', 'Other')], null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.role})"

    class Meta:
        db_table = 'users'


class Bus(models.Model):
    STATUS_CHOICES = [
        ('WORKING', 'Working'),
        ('BREAKDOWN', 'Breakdown'),
        ('NOT_RUNNING', 'Not Running'),
    ]
    
    bus_number = models.IntegerField(unique=True)
    source = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    source_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    source_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    destination_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    destination_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    distance_km = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    capacity = models.IntegerField(validators=[MinValueValidator(1)])
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='WORKING')
    driver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_bus', limit_choices_to={'role': 'DRIVER'})
    current_location = models.CharField(max_length=200, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Bus {self.bus_number} ({self.source} - {self.destination})"

    class Meta:
        db_table = 'buses'
        verbose_name_plural = 'Buses'


class Seat(models.Model):
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='seats')
    seat_number = models.IntegerField(validators=[MinValueValidator(1)])
    assigned_user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_seat')
    is_available = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Seat {self.seat_number} - Bus {self.bus.bus_number}"

    class Meta:
        db_table = 'seats'
        unique_together = ['bus', 'seat_number']


class Attendance(models.Model):
    STATUS_CHOICES = [
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('LATE', 'Late'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    is_approved = models.BooleanField(default=False)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_attendances', limit_choices_to={'role': 'ADMIN'})
    remarks = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.date} - {self.status}"

    class Meta:
        db_table = 'attendances'
        unique_together = ['user', 'date']


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    is_seen = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sent_notifications')
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}"

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']


class Query(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('RESOLVED', 'Resolved'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='queries')
    driver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='driver_queries', limit_choices_to={'role': 'DRIVER'})
    subject = models.CharField(max_length=200)
    message = models.TextField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PENDING')
    response = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Query by {self.user.username} about {self.driver.username}"

    class Meta:
        db_table = 'queries'
        verbose_name_plural = 'Queries'
        ordering = ['-created_at']


class Fee(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('OVERDUE', 'Overdue'),
        ('PARTIAL', 'Partially Paid'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fees')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    pending_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    month = models.CharField(max_length=20)  # e.g., "January 2026"
    year = models.IntegerField()
    semester = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(8)])
    academic_year = models.CharField(max_length=20, null=True, blank=True)  # e.g., "2025-2026"
    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS_CHOICES, default='PENDING')
    paid_date = models.DateField(null=True, blank=True)
    due_date = models.DateField()
    payment_method = models.CharField(max_length=50, null=True, blank=True)  # ONLINE, CASH, CHEQUE
    transaction_id = models.CharField(max_length=100, null=True, blank=True)
    distance_km = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    reminder_sent_count = models.IntegerField(default=0)
    last_reminder_sent = models.DateTimeField(null=True, blank=True)
    reminder_sent_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_reminders')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Auto-calculate pending amount
        self.pending_amount = self.amount - self.paid_amount
        
        # Update payment status based on amounts
        if self.paid_amount >= self.amount:
            self.payment_status = 'PAID'
        elif self.paid_amount > 0:
            self.payment_status = 'PARTIAL'
        elif self.due_date < date.today():
            self.payment_status = 'OVERDUE'
        else:
            self.payment_status = 'PENDING'
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.month} {self.year} - {self.payment_status}"

    class Meta:
        db_table = 'fees'
        unique_together = ['user', 'month', 'year']
        ordering = ['-year', '-created_at']


class EmergencyAlert(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('RESOLVED', 'Resolved'),
    ]

    driver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='emergency_alerts', limit_choices_to={'role': 'DRIVER'})
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='emergency_alerts')
    message = models.TextField()
    location = models.CharField(max_length=200, null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ACTIVE')
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_alerts', limit_choices_to={'role': 'ADMIN'})
    resolved_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"🚨 Emergency Alert - Bus {self.bus.bus_number} by {self.driver.username}"

    class Meta:
        db_table = 'emergency_alerts'
        ordering = ['-created_at']


class DriverLeave(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]

    driver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leaves', limit_choices_to={'role': 'DRIVER'})
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_leaves', limit_choices_to={'role': 'ADMIN'})
    substitute_driver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='substitute_assignments', limit_choices_to={'role': 'DRIVER'})
    admin_remarks = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.driver.username} - {self.start_date} to {self.end_date} ({self.status})"

    class Meta:
        db_table = 'driver_leaves'
        ordering = ['-created_at']


class DriverAttendance(models.Model):
    STATUS_CHOICES = [
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('LEAVE', 'On Leave'),
        ('HALF_DAY', 'Half Day'),
    ]

    driver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='driver_attendances', limit_choices_to={'role': 'DRIVER'})
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PRESENT')
    km_driven = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    remarks = models.TextField(null=True, blank=True)
    marked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='marked_attendances')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.driver.username} - {self.date} - {self.status}"

    class Meta:
        db_table = 'driver_attendances'
        unique_together = ['driver', 'date']
        ordering = ['-date']


class StudentQuery(models.Model):
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('REPLIED', 'Replied'),
        ('CLOSED', 'Closed'),
        ('REOPENED', 'Reopened'),
    ]
    
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='student_queries', limit_choices_to={'role': 'STUDENT'})
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE, related_name='queries')
    seat_number = models.IntegerField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    anonymous = models.BooleanField(default=False)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='OPEN')
    admin_reply = models.TextField(null=True, blank=True)
    replied_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='replied_queries', limit_choices_to={'role': 'ADMIN'})
    is_satisfied = models.BooleanField(null=True, blank=True)
    satisfaction_feedback = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        student_name = "Anonymous" if self.anonymous else self.student.username
        return f"{student_name} - Bus {self.bus.bus_number} - {self.status}"

    class Meta:
        db_table = 'student_queries'
        ordering = ['-created_at']



