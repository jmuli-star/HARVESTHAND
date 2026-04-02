from django.contrib import admin
from django.utils.html import format_html
from .models import Category, MarketplaceItem, MpesaCalls, MpesaCallBacks, MpesaPayment, Order

# --- 1. MARKETPLACE ADMIN ---

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'icon_name', 'created_at')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)

@admin.register(MarketplaceItem)
class MarketplaceItemAdmin(admin.ModelAdmin):
    list_display = ('get_image', 'name', 'category', 'item_type', 'price', 'stock_quantity', 'is_active')
    list_filter = ('item_type', 'category', 'is_active')
    search_fields = ('name', 'description')
    list_editable = ('price', 'stock_quantity', 'is_active')
    readonly_fields = ('get_image_large',)

    def get_image(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 45px; height: 45px; border-radius: 8px;" />', obj.image.url)
        return "No Image"
    get_image.short_description = 'Thumbnail'

    def get_image_large(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-width: 300px; border-radius: 15px;" />', obj.image.url)
        return "No Image Uploaded"
    get_image_large.short_description = 'Current Image Preview'

# --- 2. MPESA LOGGING ADMIN ---

@admin.register(MpesaCalls)
class MpesaCallsAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'caller', 'conversation_id', 'ip_address')
    list_filter = ('created_at',)
    search_fields = ('caller', 'conversation_id', 'content')
    readonly_fields = ('created_at', 'updated_at', 'content')

@admin.register(MpesaCallBacks)
class MpesaCallBacksAdmin(admin.ModelAdmin):
    list_display = ('created_at', 'conversation_id', 'ip_address')
    list_filter = ('created_at',)
    search_fields = ('conversation_id', 'content')
    readonly_fields = ('created_at', 'updated_at', 'content')

@admin.register(MpesaPayment)
class MpesaPaymentAdmin(admin.ModelAdmin):
    list_display = ('reference', 'first_name', 'last_name', 'amount', 'phone_number', 'created_at')
    list_filter = ('created_at', 'type')
    search_fields = ('reference', 'phone_number', 'first_name', 'last_name')
    readonly_fields = ('created_at', 'amount', 'reference', 'organization_balance')

# --- 3. ORDER MANAGEMENT ADMIN ---

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'item', 'quantity', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    list_editable = ('status',)
    search_fields = ('item__name', 'payment__reference')
