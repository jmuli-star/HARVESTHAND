from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, FarmHand, Farm, Batch, TreatmentLog, FarmCorrespondent

# SECTION 1: INLINES
class FarmCorrespondentInline(admin.StackedInline):
    model = FarmCorrespondent
    can_delete = False
    verbose_name_plural = 'Farm Correspondent Profile'
    fk_name = 'user'
    extra = 0

class FarmHandInline(admin.StackedInline):
    """Shows professional worker details inside the User page."""
    model = FarmHand
    can_delete = False
    verbose_name_plural = 'FarmHand Professional Profile'
    fk_name = 'user'
    extra = 0


# SECTION 2: USER ADMINISTRATION
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # Added 'associated_institution' to display who the staff reports to
    list_display = ('id', 'email', 'institution_name', 'associated_institution', 'role', 'is_staff', 'date_joined')
    list_filter = ('role', 'is_staff', 'is_superuser', 'associated_institution')
    search_fields = ('email', 'institution_name', 'associated_institution__email')
    ordering = ('-date_joined',)
    
    # --- UPDATED: Now handles both Hand and Correspondent profiles ---
    inlines = (FarmHandInline, FarmCorrespondentInline)

    # Fieldsets updated to include the linkage field
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Institutional Hierarchy', {
            'fields': ('role', 'associated_institution', 'institution_name'),
            'description': 'Link this user to a Parent Institution if they are a Correspondent or Farmhand.'
        }),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    
    # Required for custom User models using email as USERNAME_FIELD
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'role', 'associated_institution', 'institution_name', 'is_staff', 'is_superuser'),
        }),
    )

# SECTION 3: OPERATIONAL MODELS
@admin.register(Farm)
class FarmAdmin(admin.ModelAdmin):
    # Displays the full management chain: Institution -> Correspondent -> Farmhand
    list_display = ['name', 'institution', 'correspondent', 'farmhand', 'location', 'yield_display', 'created_at']
    list_filter = ['institution', 'correspondent', 'location']
    search_fields = ['name', 'institution__email', 'correspondent__email', 'farmhand__user__email']
    
    # --- NEW: Organized Management Chain Section ---
    fieldsets = (
        ('General Information', {
            'fields': ('name', 'location', 'gps_coordinates')
        }),
        ('Management Chain', {
            'fields': ('institution', 'correspondent', 'farmhand'),
            'description': 'Assign the governing institution, the lead correspondent, and the field worker.'
        }),
    )

    def yield_display(self, obj):
        # Original logic: pulls from @property in models.py
        return f"{obj.total_yield} kg"
    yield_display.short_description = 'Total Yield'

@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    """Tracks specific harvest batches linked to farms."""
    list_display = ['crop_name', 'farm', 'farmhand', 'quantity_kg', 'harvest_date', 'qr_generated']
    readonly_fields = ['id', 'created_at']
    list_filter = ['farm', 'crop_name', 'qr_generated', 'harvest_date']
    search_fields = ['crop_name', 'farm__name', 'farmhand__user__email']
    
    fieldsets = (
        ('Batch Ownership', {'fields': ('farm', 'farmhand')}),
        ('Crop Details', {'fields': ('crop_name', 'variety')}),
        ('Harvest & Logistics', {'fields': ('quantity_kg', 'planted_date', 'harvest_date')}),
        ('System Metadata', {'fields': ('id', 'qr_generated', 'created_at')}),
    )
    
    def qr_status(self, obj):
        return "✅ Generated" if obj.qr_generated else "❌ Pending"
    qr_status.short_description = 'QR Status'

@admin.register(TreatmentLog)
class TreatmentLogAdmin(admin.ModelAdmin):
    """Logs of activities like fertilizer use or pest control."""
    list_display = ['batch', 'action_type', 'date']
    list_filter = ['action_type', 'date']
    search_fields = ['batch__crop_name', 'notes']
    ordering = ('-date',)

    # Optimization: reduces SQL queries when viewing logs
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('batch__farm')

# --- NEW: Standalone Registration for Profiles ---
@admin.register(FarmHand)
class FarmHandProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'certification_number']

@admin.register(FarmCorrespondent)
class FarmCorrespondentProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'region_assigned']