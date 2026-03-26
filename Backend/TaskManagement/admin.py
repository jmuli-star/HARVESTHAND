from django.contrib import admin
from .models import Task, Report


# Register your models here.

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    # Logic: Show the most important columns at a glance
    list_display = ('title', 'creator_info', 'assigned_to_info', 'is_complete', 'created_at')
    
    # Logic: Allow filtering by status and roles
    list_filter = ('is_complete', 'creator__role', 'assigned_to__role')
    
    # Logic: Search by task name or user emails
    search_fields = ('title', 'description', 'creator__email', 'assigned_to__email')
    
    # Logic: Make the creation date read-only
    readonly_fields = ('created_at', 'updated_at')

    # Custom methods to show Role + Email in the list view
    def creator_info(self, obj):
        return f"{obj.creator.email} ({obj.creator.role})"
    creator_info.short_description = 'Sender'

    def assigned_to_info(self, obj):
        return f"{obj.assigned_to.email} ({obj.assigned_to.role})"
    assigned_to_info.short_description = 'Recipient'


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'sender', 'recipient', 'target_role', 'is_complete', 'created_at')
    list_filter = ('target_role', 'is_complete')
    search_fields = ('title', 'message', 'sender__email', 'recipient__email')
    
    # Logic: Organizing the detail view into sections
    fieldsets = (
        ('Participants', {
            'fields': ('sender', 'recipient', 'target_role')
        }),
        ('Content', {
            'fields': ('title', 'message')
        }),
        ('Status & Feedback', {
            'fields': ('is_complete', 'feedback')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
        }),
    )
    readonly_fields = ('created_at', 'updated_at')


