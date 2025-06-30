from django.db import models
from django.contrib.auth.models import User

class Client(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True)
    company = models.CharField(max_length=255, blank=True)
    address = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=[('active', 'Active'), ('inactive', 'Inactive')])
    created_at = models.DateTimeField(auto_now_add=True)

class Project(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    client = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True)
    color = models.CharField(max_length=20, default="#3b82f6")
    status = models.CharField(max_length=20, choices=[('active', 'Active'), ('completed', 'Completed'), ('on-hold', 'On Hold')])
    description = models.TextField(blank=True)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Tag(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=20, default="#3b82f6")
    description = models.TextField(blank=True)
    usage_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

class TimeEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True)
    client = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True)
    tags = models.ManyToManyField(Tag, blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    duration = models.IntegerField(default=0)  # in seconds
    created_at = models.DateTimeField(auto_now_add=True)

class Settings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    timezone = models.CharField(max_length=100, default="UTC")
    default_project = models.ForeignKey(Project, on_delete=models.SET_NULL, null=True, blank=True)
    auto_start = models.BooleanField(default=False)
    reminder_interval = models.IntegerField(default=30)
    weekly_goal = models.IntegerField(default=40)
    email_notifications = models.BooleanField(default=True)
    reminder_notifications = models.BooleanField(default=True)
    weekly_reports = models.BooleanField(default=True)
    time_format = models.CharField(max_length=10, default="24h")
    date_format = models.CharField(max_length=20, default="MM/DD/YYYY")
    theme = models.CharField(max_length=20, default="system")