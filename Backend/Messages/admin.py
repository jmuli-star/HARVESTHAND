from django.contrib import admin
from .models import *

# Register your models here.

@admin.register(Messages)
class MessageAdmin(admin.ModelAdmin):
    # Columns to display in the list view
    list_display = ('sender', 'receiver', 'content_preview', 'timestamp', 'is_read')
    
    # Filter sidebar options
    list_filter = ('is_read', 'timestamp', 'sender', 'receiver')
    
    # Search box functionality
    search_fields = ('content', 'sender__email', 'receiver__email')
    
    # Make some fields read-only to prevent accidental tampering
    readonly_fields = ('timestamp',)

    # Helper to show a short preview of the message in the list
    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Message Content'

    # Optimization: Pre-fetch related users to speed up the admin page
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('sender', 'receiver')