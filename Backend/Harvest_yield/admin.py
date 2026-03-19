from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import *

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('id', 'email', 'Institution_name', 'Institution_correspondent', 'role', 'is_staff', 'is_superuser', 'date_joined')
    list_filter = ('role', 'is_staff', 'is_superuser')
    search_fields = ('email', 'Institution_name', 'Institution_correspondent')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('Institution_name', 'Institution_correspondent', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
    )
    add_fieldsets = (
        (None, {
            'fields': ('email', 'password1', 'password2', 'role', 'is_staff', 'is_superuser'),
        }),
    )

    
admin.site.register(FarmHand)

admin.site.register(Farm)
class FarmAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'location']

admin.site.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ['crop_name', 'id', 'farm', 'harvest_date', 'qr_generated']
    readonly_fields = ['id']

admin.site.register(TreatmentLog)
class TreatmentLogAdmin(admin.ModelAdmin):
    list_display = ['batch', 'action_type', 'date', 'product_used']
    
    
admin.site.register(new_farmhand)