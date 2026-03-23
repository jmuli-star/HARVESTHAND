from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, FarmHand, Farm, Batch, TreatmentLog # Avoid using * for clarity

# 1. Define the Inline to show FarmHand details inside the User page
class FarmHandInline(admin.StackedInline):
    model = FarmHand
    can_delete = False
    verbose_name_plural = 'FarmHand Professional Profile'
    fk_name = 'user'

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # Fixed field names to match your model (lowercase institution_name)
    list_display = ('id', 'email', 'institution_name', 'role', 'is_staff', 'date_joined')
    list_filter = ('role', 'is_staff', 'is_superuser')
    search_fields = ('email', 'institution_name')
    ordering = ('-date_joined',)
 # Add the inline here
    inlines = (FarmHandInline,)

    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('institution_name', 'institution_correspondent', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    
    # Required for custom User models using email as USERNAME_FIELD
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email','password1','password2',  'role', 'institution_name','is_staff', 'is_superuser'),
        }),
    )

# 2. Register other models correctly
# Note: Use @admin.register OR admin.site.register(Model, AdminClass), not both.

@admin.register(Farm)
class FarmAdmin(admin.ModelAdmin):
    # Changed 'owner' to 'farmhand' to match your model
    list_display = ['name', 'farmhand', 'location', 'created_at']
    search_fields = ['name', 'farmhand__user__email']

@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ['crop_name', 'id', 'farm', 'harvest_date', 'qr_generated']
    readonly_fields = ['id']
    list_filter = ['farm', 'crop_name', 'qr_generated']

@admin.register(TreatmentLog)
class TreatmentLogAdmin(admin.ModelAdmin):
    list_display = ['batch', 'action_type', 'date', 'product_used']
    list_filter = ['action_type', 'date']

# Removed new_farmhand as it is now redundant with the FarmHand profile link